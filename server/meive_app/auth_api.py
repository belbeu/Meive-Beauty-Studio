# Salvar como: meive_app/auth_api.py
#
# Cadastro de usuário e "quem sou eu" (dados do usuário logado).
# O login usa o simplejwt, com limite de tentativas (LoginView).

import os
import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.utils import timezone
from django.db import transaction

from django.contrib.auth import password_validation
from rest_framework import generics, permissions, serializers
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario, CodigoVerificacaoEmail
from .serializers import UsuarioSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

class RegistroSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ["id_usuario", "nome", "email", "password", "telefone"]
        read_only_fields = ["id_usuario"]

    def validate_email(self, value):
        email = value.strip().lower()
        if Usuario.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return email

    def validate_password(self, value):
        # aplica os validadores do settings (senha comum, só números, etc.)
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        senha = validated_data.pop("password")
        email = validated_data.pop("email")
        # O tipo NUNCA vem do front: todo cadastro pelo site é CLIENTE.
        # (ADMIN/FUNCIONARIA/ALUNA são definidos por um administrador.)
        return Usuario.objects.create_user(
            email=email, password=senha, tipo="CLIENTE", **validated_data
        )


def _enviar_codigo(email, finalidade, dados_pendentes=None):
    """Cria um código de uso único e envia pelo Gmail configurado no Django."""
    CodigoVerificacaoEmail.objects.filter(email__iexact=email, finalidade=finalidade).delete()
    codigo = f"{secrets.randbelow(1_000_000):06d}"
    desafio = CodigoVerificacaoEmail.objects.create(
        email=email,
        finalidade=finalidade,
        codigo_hash=make_password(codigo),
        dados_pendentes=dados_pendentes or {},
        expira_em=timezone.now() + timedelta(minutes=10),
    )
    try:
        send_mail(
            subject="Seu código de verificação | Mevie Beauty Studio",
            message=(
                f"Seu código de verificação é: {codigo}\n\n"
                "Ele é válido por 10 minutos e pode ser usado uma única vez. "
                "Se você não solicitou este código, ignore este e-mail."
            ),
            from_email=None,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception:
        desafio.delete()
        raise
    return desafio


def _validar_codigo(email, finalidade, codigo):
    desafio = CodigoVerificacaoEmail.objects.filter(
        email__iexact=email, finalidade=finalidade
    ).order_by("-criado_em").first()
    if not desafio:
        return None, "Solicite um novo código de verificação."
    if desafio.expira_em <= timezone.now():
        desafio.delete()
        return None, "O código expirou. Solicite um novo código."
    if desafio.tentativas >= 5:
        desafio.delete()
        return None, "Limite de tentativas atingido. Solicite um novo código."
    if not check_password(str(codigo), desafio.codigo_hash):
        desafio.tentativas += 1
        desafio.save(update_fields=["tentativas"])
        return None, "Código inválido."
    return desafio, None


class RegistroView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "registro"

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dados = serializer.validated_data
        senha_hash = make_password(dados.pop("password"))
        pendentes = {
            "nome": dados["nome"],
            "email": dados["email"],
            "telefone": dados.get("telefone"),
            "password_hash": senha_hash,
        }
        try:
            _enviar_codigo(dados["email"], "cadastro", pendentes)
        except Exception:
            return Response(
                {"detail": "Não foi possível enviar o e-mail de verificação. Confira a configuração do Gmail e tente novamente."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            {"detail": "Enviamos um código de verificação para seu e-mail.", "email": dados["email"]},
            status=status.HTTP_200_OK,
        )


class ValidarRegistroView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "registro"

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        codigo = str(request.data.get("codigo", "")).strip()
        if not email or not codigo:
            return Response({"detail": "Informe o e-mail e o código."}, status=400)
        desafio, erro = _validar_codigo(email, "cadastro", codigo)
        if erro:
            return Response({"detail": erro}, status=status.HTTP_400_BAD_REQUEST)
        dados = desafio.dados_pendentes
        try:
            with transaction.atomic():
                if Usuario.objects.filter(email__iexact=email).exists():
                    desafio.delete()
                    return Response({"detail": "Este e-mail já está cadastrado."}, status=400)
                usuario = Usuario(
                    nome=dados["nome"],
                    email=email,
                    telefone=dados.get("telefone"),
                    tipo="CLIENTE",
                    password=dados["password_hash"],
                )
                usuario.save()
                desafio.delete()
                refresh = RefreshToken.for_user(usuario)
        except Exception:
            return Response({"detail": "Não foi possível concluir o cadastro. Tente novamente."}, status=400)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class SolicitarCodigoAdminView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        password = request.data.get("password", "")
        usuario = Usuario.objects.filter(email__iexact=email).first()
        if not usuario or not usuario.check_password(password) or usuario.tipo != "ADMIN":
            return Response(
                {"detail": "Credenciais inválidas ou sem permissão de administrador."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            _enviar_codigo(email, "login_admin", {"id_usuario": usuario.id_usuario})
        except Exception:
            return Response(
                {"detail": "Não foi possível enviar o código. Verifique a configuração do Gmail."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"detail": "Código enviado para o e-mail da administradora."})


class ValidarCodigoAdminView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        codigo = str(request.data.get("codigo", "")).strip()
        if not email or not codigo:
            return Response({"detail": "Informe o e-mail e o código."}, status=400)
        desafio, erro = _validar_codigo(email, "login_admin", codigo)
        if erro:
            return Response({"detail": erro}, status=status.HTTP_400_BAD_REQUEST)
        usuario = Usuario.objects.filter(
            id_usuario=desafio.dados_pendentes.get("id_usuario"),
            email__iexact=email,
            tipo="ADMIN",
        ).first()
        desafio.delete()
        if not usuario:
            return Response({"detail": "Conta administrativa não encontrada."}, status=401)
        refresh = RefreshToken.for_user(usuario)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


class LoginView(TokenObtainPairView):
    """Login de clientes; contas ADMIN devem concluir a verificação por código."""
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.user.tipo == "ADMIN":
            return Response(
                {"detail": "A conta administrativa deve entrar pela verificação em duas etapas."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class EuView(generics.RetrieveAPIView):
    """Devolve os dados do usuário dono do token."""

    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class RecuperarSenhaDiretaView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        nova_senha = request.data.get("password", "")

        if not email or not nova_senha:
            return Response({"erro": "E-mail e nova senha são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        if len(nova_senha) < 8:
            return Response({"erro": "A senha deve ter pelo menos 8 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Usuario.objects.get(email=email)
            user.set_password(nova_senha)
            user.save()
            return Response({"mensagem": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            # Por segurança ou praticidade, avisamos que o e-mail não existe
            return Response({"erro": "E-mail não cadastrado."}, status=status.HTTP_404_NOT_FOUND)
        
class GoogleLoginView(APIView):
    permission_classes = []

    def post(self, request):
        token_google = request.data.get("credential")
        
        if not token_google:
            return Response({"erro": "Token do Google não fornecido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Puxa o ID do cliente diretamente do ficheiro .env
            CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
            
            idinfo = id_token.verify_oauth2_token(token_google, google_requests.Request(), CLIENT_ID)

            email = idinfo.get("email")
            nome = idinfo.get("name", "Meive Girl")

            if not email:
                return Response({"erro": "E-mail não retornado pelo Google."}, status=status.HTTP_400_BAD_REQUEST)

            usuario, criado = Usuario.objects.get_or_create(
                email=email,
                defaults={
                    "nome": nome,
                    "tipo": "CLIENTE",
                }
            )

            if usuario.tipo == "ADMIN":
                return Response(
                    {"erro": "Contas administrativas devem utilizar a verificação em duas etapas."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(usuario)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"erro": "Token do Google inválido."}, status=status.HTTP_400_BAD_REQUEST)
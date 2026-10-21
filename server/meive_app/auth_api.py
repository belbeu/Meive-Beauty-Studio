# Salvar como: meive_app/auth_api.py
#
# Cadastro de usuário e "quem sou eu" (dados do usuário logado).
# O login usa o simplejwt, com limite de tentativas (LoginView).

from django.contrib.auth import password_validation
from rest_framework import generics, permissions, serializers
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .serializers import UsuarioSerializer


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


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "registro"


class LoginView(TokenObtainPairView):
    """Login por e-mail e senha (JWT), com limite de tentativas."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class EuView(generics.RetrieveAPIView):
    """Devolve os dados do usuário dono do token."""

    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
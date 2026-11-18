# Salvar como: meive_app/api_views.py
#
# Regras de acesso:
#  - Catálogo (serviços, produtos, cursos): qualquer pessoa pode LER; ninguém altera pela API.
#  - Todas as outras tabelas: somente administrador (tipo ADMIN).
#

import re

from django.db import transaction
from django.http import Http404
from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import mixins, permissions, serializers, viewsets

from .notificacoes_agendamento import enviar_email_agendamento
from .produto_imagem import apagar_imagem_se_orfa

from .models import (
    Agendamento,
    Avaliacao,
    CestinhaInteresse,
    ConfiguracaoStudio,
    Curso,
    MaterialCurso,
    Matricula,
    Produto,
    Promocao,
    Servico,
    Turma,
    Usuario,
)
from .serializers.avaliacao import TIPO_ORIGEM_SITE
from .serializers import (
    AgendamentoSerializer,
    AvaliacaoClienteSerializer,
    AvaliacaoPublicaSerializer,
    AvaliacaoSerializer,
    CestinhaInteresseSerializer,
    ConfiguracaoStudioSerializer,
    CursoSerializer,
    MaterialCursoSerializer,
    MatriculaSerializer,
    ProdutoPublicoSerializer,
    ProdutoSerializer,
    PromocaoSerializer,
    ServicoSerializer,
    TurmaSerializer,
    UsuarioSerializer,
)


# ---------- Catálogo público (somente leitura) ----------

class ServicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Servico.objects.all().order_by("id_servico")
    serializer_class = ServicoSerializer
    permission_classes = [permissions.AllowAny]


class ProdutoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Produto.objects.filter(ativo=True).order_by("id_produto")
    serializer_class = ProdutoPublicoSerializer  # sem custo nem estoque exato
    permission_classes = [permissions.AllowAny]


class CursoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Curso.objects.filter(ativo=True).order_by("id_curso")
    serializer_class = CursoSerializer
    permission_classes = [permissions.AllowAny]


# ---------- Somente administrador ----------

class ProdutoAdminViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """Todos os produtos (inclusive inativos) para o painel admin: lista, cadastra e edita.

    A rota pública /produtos/ só devolve os ativos; o painel precisa ver
    também os inativos para contar e listar o estoque completo.
    """

    queryset = Produto.objects.all().order_by("id_produto")
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=["post"])
    def vender(self, request, pk=None):
        """Registra uma venda manual: só baixa o estoque (não guarda histórico).

        A conta é feita aqui, com o produto travado na transação, para que a lista
        desatualizada na tela ou dois cliques ao mesmo tempo nunca deixem o estoque negativo.
        """
        valor = str(request.data.get("quantidade", "")).strip()
        if not re.fullmatch(r"\d+", valor) or int(valor) < 1:
            return Response(
                {"quantidade": ["Informe uma quantidade inteira, de 1 em diante."]}, status=400
            )
        quantidade = int(valor)

        with transaction.atomic():
            produto = Produto.objects.select_for_update().filter(pk=pk).first()
            if produto is None:
                raise Http404
            if produto.ativo is False:
                return Response({"detail": "Este produto está inativo."}, status=400)
            if quantidade > produto.estoque_atual:
                return Response(
                    {"quantidade": [f"Estoque insuficiente: restam {produto.estoque_atual} un."]},
                    status=400,
                )
            produto.estoque_atual -= quantidade
            produto.save(update_fields=["estoque_atual"])

        return Response(self.get_serializer(produto).data)


class PromocaoPublicaViewSet(viewsets.ReadOnlyModelViewSet):
    """Lista somente promoções ativas para a página pública."""
    queryset = Promocao.objects.filter(ativo=True).order_by("-destaque", "-criado_em")
    serializer_class = PromocaoSerializer
    permission_classes = [permissions.AllowAny]


class PromocaoAdminViewSet(viewsets.ModelViewSet):
    """CRUD completo de promoções, restrito a administradores."""
    queryset = Promocao.objects.all().order_by("-destaque", "-criado_em")
    serializer_class = PromocaoSerializer
    permission_classes = [permissions.IsAdminUser]


class ConfiguracaoStudioView(APIView):
    """Dados do studio (nome, contato, endereço e horários).

    GET é público (o rodapé do site usa); alterar (PATCH) é só do administrador.
    """

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        return Response(ConfiguracaoStudioSerializer(ConfiguracaoStudio.obter()).data)

    def patch(self, request):
        serializer = ConfiguracaoStudioSerializer(
            ConfiguracaoStudio.obter(), data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(atualizado_em=timezone.now())
        return Response(serializer.data)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by("id_usuario")
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAdminUser]


# ---------- Por enquanto, somente administrador ----------
# Estas tabelas guardam dados de clientes (agendamentos, matrículas, avaliações...).
# Até existir a versão "cada cliente vê só os seus", o acesso é só do administrador (tipo ADMIN).

class AgendamentoViewSet(viewsets.ModelViewSet):
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Operações administrativas que alteram a agenda são restritas ao ADMIN.
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        usuario = self.request.user
        queryset = Agendamento.objects.select_related("id_usuario", "id_servico").order_by("data_agendamento")

        if getattr(usuario, "tipo", None) == "ADMIN":
            return queryset

        return queryset.filter(id_usuario=usuario)

    def perform_create(self, serializer):
        agendamento = serializer.save()
        enviar_email_agendamento(agendamento, "created")

    def perform_update(self, serializer):
        anterior = serializer.instance
        data_anterior = anterior.data_agendamento
        status_anterior = anterior.status
        campos_anteriores = {
            "id_usuario_id": anterior.id_usuario_id,
            "id_servico_id": anterior.id_servico_id,
            "valor": anterior.valor,
            "sinal_pago": anterior.sinal_pago,
        }

        agendamento = serializer.save()

        if agendamento.status != status_anterior and agendamento.status == "cancelled":
            evento = "cancelled"
        elif agendamento.status != status_anterior and status_anterior == "cancelled" and agendamento.status == "confirmed":
            evento = "reactivated"
        elif agendamento.status != status_anterior and agendamento.status == "ongoing":
            evento = "ongoing"
        elif agendamento.status != status_anterior and agendamento.status == "concluded":
            evento = "concluded"
        elif agendamento.data_agendamento != data_anterior:
            evento = "rescheduled"
        elif agendamento.status != status_anterior:
            evento = "updated"
        else:
            campos_novos = {
                "id_usuario_id": agendamento.id_usuario_id,
                "id_servico_id": agendamento.id_servico_id,
                "valor": agendamento.valor,
                "sinal_pago": agendamento.sinal_pago,
            }
            if campos_novos == campos_anteriores:
                return
            evento = "updated"

        enviar_email_agendamento(
            agendamento,
            evento,
            dados_anteriores={"data_agendamento": data_anterior},
        )

    def perform_destroy(self, instance):
        # A cliente é avisada antes de remover o registro definitivamente.
        enviar_email_agendamento(instance, "deleted")
        instance.delete()


class MaterialCursoViewSet(viewsets.ModelViewSet):
    queryset = MaterialCurso.objects.all().order_by("id_material")
    serializer_class = MaterialCursoSerializer
    permission_classes = [permissions.IsAdminUser]


class CestinhaInteresseViewSet(viewsets.ModelViewSet):
    serializer_class = CestinhaInteresseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user

        queryset = CestinhaInteresse.objects.filter(
            id_produto__isnull=False
        ).select_related(
            'id_produto',
            'id_usuario'
        )

        # Administrador mantém acesso geral.
        if getattr(usuario, 'tipo', None) == 'ADMIN':
            return queryset.order_by('-adicionado_em')

        # Cliente só visualiza seus próprios produtos.
        return queryset.filter(
            id_usuario=usuario
        ).order_by('-adicionado_em')

    def perform_create(self, serializer):
        usuario = self.request.user
        produto = serializer.validated_data['id_produto']
        quantidade = serializer.validated_data.get('quantidade', 1)

        # Não permite adicionar cursos ou produtos inativos.
        if not produto.ativo:
            raise serializers.ValidationError(
                {'id_produto': 'Produto indisponível.'}
            )

        item, criado = CestinhaInteresse.objects.get_or_create(
            id_usuario=usuario,
            id_produto=produto,
            defaults={
                'quantidade': quantidade,
                'id_curso': None,
            }
        )

        # Se o produto já estiver na cestinha, soma a quantidade.
        if not criado:
            item.quantidade += quantidade
            item.save(update_fields=['quantidade'])

        serializer.instance = item

    def perform_update(self, serializer):
        # Impede alterar o proprietário ou o produto do registro.
        serializer.save()

class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.all().order_by("id_turma")
    serializer_class = TurmaSerializer
    permission_classes = [permissions.IsAdminUser]


class MatriculaViewSet(viewsets.ModelViewSet):
    queryset = Matricula.objects.all().order_by("id_matricula")
    serializer_class = MatriculaSerializer
    permission_classes = [permissions.IsAdminUser]


class AvaliacoesPublicasViewSet(viewsets.ReadOnlyModelViewSet):
    """Lista pública e somente leitura das avaliações enviadas sobre o site."""

    serializer_class = AvaliacaoPublicaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Avaliacao.objects
            .filter(tipo_origem=TIPO_ORIGEM_SITE)
            .select_related("id_usuario", "id_servico")
            .order_by("-criado_em", "-id_avaliacao")
        )


class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all().order_by("id_avaliacao")
    serializer_class = AvaliacaoSerializer
    permission_classes = [permissions.IsAdminUser]


class AvaliacaoClienteViewSet(viewsets.ModelViewSet):
    """Avaliações do site feitas pela cliente logada: ela só enxerga e altera as próprias."""

    serializer_class = AvaliacaoClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    throttle_scope = "avaliacao"

    def get_throttles(self):
        # Limita só o que grava (e guarda fotos no banco); listar não conta.
        if self.action in ("create", "update", "partial_update"):
            return [ScopedRateThrottle()]
        return []

    def get_queryset(self):
        return Avaliacao.objects.filter(
            id_usuario=self.request.user, tipo_origem=TIPO_ORIGEM_SITE
        ).order_by("-criado_em", "-id_avaliacao")

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(id_usuario=self.request.user, tipo_origem=TIPO_ORIGEM_SITE)

    @transaction.atomic
    def perform_update(self, serializer):
        foto_antiga = serializer.instance.foto_url
        avaliacao = serializer.save(atualizado_em=timezone.now())
        if foto_antiga and foto_antiga != avaliacao.foto_url:
            apagar_imagem_se_orfa(foto_antiga)

    @transaction.atomic
    def perform_destroy(self, instance):
        foto_antiga = instance.foto_url
        instance.delete()
        apagar_imagem_se_orfa(foto_antiga)

# Salvar como: meive_app/api_views.py
#
# Regras de acesso:
#  - Catálogo (serviços, produtos, cursos): qualquer pessoa pode LER; ninguém altera pela API.
#  - Todas as outras tabelas: somente administrador (tipo ADMIN).
#

import re

from django.db import transaction
from django.http import Http404
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Agendamento,
    Avaliacao,
    CestinhaInteresse,
    Curso,
    MaterialCurso,
    Matricula,
    Produto,
    Servico,
    Turma,
    Usuario,
)
from .serializers import (
    AgendamentoSerializer,
    AvaliacaoSerializer,
    CestinhaInteresseSerializer,
    CursoSerializer,
    MaterialCursoSerializer,
    MatriculaSerializer,
    ProdutoPublicoSerializer,
    ProdutoSerializer,
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


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by("id_usuario")
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAdminUser]


# ---------- Por enquanto, somente administrador ----------
# Estas tabelas guardam dados de clientes (agendamentos, matrículas, avaliações...).
# Até existir a versão "cada cliente vê só os seus", o acesso é só do administrador (tipo ADMIN).

class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all().order_by("id_agendamento")
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAdminUser]


class MaterialCursoViewSet(viewsets.ModelViewSet):
    queryset = MaterialCurso.objects.all().order_by("id_material")
    serializer_class = MaterialCursoSerializer
    permission_classes = [permissions.IsAdminUser]


class CestinhaInteresseViewSet(viewsets.ModelViewSet):
    queryset = CestinhaInteresse.objects.all().order_by("id_cestinha")
    serializer_class = CestinhaInteresseSerializer
    permission_classes = [permissions.IsAdminUser]


class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.all().order_by("id_turma")
    serializer_class = TurmaSerializer
    permission_classes = [permissions.IsAdminUser]


class MatriculaViewSet(viewsets.ModelViewSet):
    queryset = Matricula.objects.all().order_by("id_matricula")
    serializer_class = MatriculaSerializer
    permission_classes = [permissions.IsAdminUser]


class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all().order_by("id_avaliacao")
    serializer_class = AvaliacaoSerializer
    permission_classes = [permissions.IsAdminUser]
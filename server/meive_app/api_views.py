# Salvar como: meive_app/api_views.py
#
# Regras de acesso:
#  - Catálogo (serviços, produtos, cursos): qualquer pessoa pode LER; ninguém altera pela API.
#  - Todas as outras tabelas: somente administrador (tipo ADMIN).
#

from rest_framework import mixins, permissions, viewsets

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
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.AllowAny]


class CursoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Curso.objects.filter(ativo=True).order_by("id_curso")
    serializer_class = CursoSerializer
    permission_classes = [permissions.AllowAny]


# ---------- Somente administrador ----------

class ProdutoAdminViewSet(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    """Todos os produtos (inclusive inativos) para o painel admin: lista e cadastra.

    A rota pública /produtos/ só devolve os ativos; o painel precisa ver
    também os inativos para contar e listar o estoque completo.
    """

    queryset = Produto.objects.all().order_by("id_produto")
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAdminUser]


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

#  - Catálogo (serviços, produtos, cursos): qualquer pessoa pode LER, ninguém altera pela API.
#  - Usuários: só administrador (tipo ADMIN).
#  - Demais tabelas: precisa estar logado.
#
# Obs.: "estar logado" ainda usa a sessão do Django (por exemplo, quem entrou no /admin).
# Quando o login do front estiver pronto (JWT), basta configurar a autenticação no settings.py.
 
from rest_framework import permissions, viewsets
 
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
 
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by("id_usuario")
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAdminUser]
 
 
# ---------- Precisa estar logado ----------
 
class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all().order_by("id_agendamento")
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]
 
 
class MaterialCursoViewSet(viewsets.ModelViewSet):
    queryset = MaterialCurso.objects.all().order_by("id_material")
    serializer_class = MaterialCursoSerializer
    permission_classes = [permissions.IsAuthenticated]
 
 
class CestinhaInteresseViewSet(viewsets.ModelViewSet):
    queryset = CestinhaInteresse.objects.all().order_by("id_cestinha")
    serializer_class = CestinhaInteresseSerializer
    permission_classes = [permissions.IsAuthenticated]
 
 
class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.all().order_by("id_turma")
    serializer_class = TurmaSerializer
    permission_classes = [permissions.IsAuthenticated]
 
 
class MatriculaViewSet(viewsets.ModelViewSet):
    queryset = Matricula.objects.all().order_by("id_matricula")
    serializer_class = MatriculaSerializer
    permission_classes = [permissions.IsAuthenticated]
 
 
class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all().order_by("id_avaliacao")
    serializer_class = AvaliacaoSerializer
    permission_classes = [permissions.IsAuthenticated]
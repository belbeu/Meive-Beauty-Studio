# Em meive_app/api_urls.py

from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import api_views as v
from .auth_api import EuView, LoginView, RegistroView, RecuperarSenhaDiretaView
from .produto_imagem import ProdutoImagemUploadView, ProdutoImagemView
from meive_app.views import ClienteViewSet

router = DefaultRouter()
router.register("servicos", v.ServicoViewSet, basename="servico")
router.register("produtos", v.ProdutoViewSet, basename="produto")
router.register("admin/produtos", v.ProdutoAdminViewSet, basename="produto-admin")
router.register("cursos", v.CursoViewSet, basename="curso")
router.register("usuarios", v.UsuarioViewSet, basename="usuario")
router.register("agendamentos", v.AgendamentoViewSet, basename="agendamento")
router.register("materiais", v.MaterialCursoViewSet, basename="material")
router.register("cestinha", v.CestinhaInteresseViewSet, basename="cestinha")
router.register("turmas", v.TurmaViewSet, basename="turma")
router.register("matriculas", v.MatriculaViewSet, basename="matricula")
router.register("avaliacoes", v.AvaliacaoViewSet, basename="avaliacao")
router.register("clientes", ClienteViewSet, basename="cliente")

urlpatterns = [
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("auth/registro/", RegistroView.as_view()),
    path("auth/eu/", EuView.as_view()),
    path("admin/upload/produto-imagem/", ProdutoImagemUploadView.as_view()),
    path("produtos/imagem/<int:pk>/", ProdutoImagemView.as_view(), name="produto-imagem"),
    # ADICIONE ESTA LINHA ABAIXO:
    path("auth/recuperar-senha/", RecuperarSenhaDiretaView.as_view()),
] + router.urls
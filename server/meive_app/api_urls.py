# Salvar como: meive_app/api_urls.py  (substitui o arquivo anterior)

from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import api_views as v
from .auth_api import EuView, LoginView, RegistroView

router = DefaultRouter()
router.register("servicos", v.ServicoViewSet, basename="servico")
router.register("produtos", v.ProdutoViewSet, basename="produto")
router.register("cursos", v.CursoViewSet, basename="curso")
router.register("usuarios", v.UsuarioViewSet, basename="usuario")
router.register("agendamentos", v.AgendamentoViewSet, basename="agendamento")
router.register("materiais", v.MaterialCursoViewSet, basename="material")
router.register("cestinha", v.CestinhaInteresseViewSet, basename="cestinha")
router.register("turmas", v.TurmaViewSet, basename="turma")
router.register("matriculas", v.MatriculaViewSet, basename="matricula")
router.register("avaliacoes", v.AvaliacaoViewSet, basename="avaliacao")

urlpatterns = [
    # Login: POST {"email": "...", "password": "..."} -> {"access": "...", "refresh": "..."}
    path("auth/login/", LoginView.as_view()),
    # Renovar o token de acesso: POST {"refresh": "..."} -> {"access": "..."}
    path("auth/refresh/", TokenRefreshView.as_view()),
    # Cadastro de cliente
    path("auth/registro/", RegistroView.as_view()),
    # Dados do usuário logado
    path("auth/eu/", EuView.as_view()),
] + router.urls
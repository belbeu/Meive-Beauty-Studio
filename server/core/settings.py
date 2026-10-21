"""
Configurações do Django (core).

Tudo que muda entre o seu computador e o servidor online vem de variáveis
de ambiente (arquivo .env no computador; painel do serviço de hospedagem online).
Veja o DEPLOY.md.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# .env na raiz do projeto (só existe no seu computador; online usa o painel da hospedagem)
ENV_PATH = BASE_DIR.parent / ".env"
load_dotenv(ENV_PATH)


def env_bool(nome, padrao=False):
    return os.getenv(nome, str(padrao)).strip().lower() in ("1", "true", "yes", "on", "sim")


def env_lista(nome):
    return [item.strip() for item in os.getenv(nome, "").split(",") if item.strip()]


# DEBUG só liga se for pedido (no .env local: DEBUG=True). Online fica desligado.
DEBUG = env_bool("DEBUG", False)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "chave-somente-para-desenvolvimento-local"
    else:
        raise ImproperlyConfigured(
            "Defina SECRET_KEY nas variáveis de ambiente "
            "(ou DEBUG=True no .env para desenvolvimento local)."
        )

# ---------- Hosts e origens permitidas ----------
ALLOWED_HOSTS = env_lista("ALLOWED_HOSTS")
if DEBUG:
    ALLOWED_HOSTS += ["localhost", "127.0.0.1"]

# O Render informa o endereço do serviço automaticamente
_render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME")
if _render_host:
    ALLOWED_HOSTS.append(_render_host)

CSRF_TRUSTED_ORIGINS = env_lista("CSRF_TRUSTED_ORIGINS")
_render_url = os.getenv("RENDER_EXTERNAL_URL")
if _render_url:
    CSRF_TRUSTED_ORIGINS.append(_render_url)

# Endereços do site (front) que podem chamar a API. Ex.: https://meive.netlify.app
CORS_ALLOWED_ORIGINS = env_lista("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = DEBUG  # liberado apenas no desenvolvimento local


# ---------- Aplicações ----------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "meive_app",
    "rest_framework",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # serve os arquivos estáticos (CSS do /admin)
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"


# ---------- Banco de dados ----------
# Online: DATABASE_URL (ex.: a connection string do Neon).
# Local: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT no .env.
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
            disable_server_side_cursors=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": os.getenv("DB_HOST", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }


# ---------- Senhas ----------
AUTH_USER_MODEL = "meive_app.Usuario"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------- Idioma e hora ----------
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ---------- Arquivos estáticos ----------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}


# ---------- Segurança em produção ----------
if not DEBUG:
    # O serviço de hospedagem recebe o HTTPS e repassa ao Django por HTTP
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True


# ---------- E-mail (formulário de contato/agendamento) ----------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_TIMEOUT = 10  # evita travar a requisição se o servidor de e-mail não responder

EMAIL_HOST_USER = "meivebeautystudio@gmail.com"
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


# ---------- API (DRF + JWT) ----------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    # Limites contra tentativas em massa (por endereço de origem)
    "DEFAULT_THROTTLE_RATES": {
        "login": "10/min",
        "registro": "10/hour",
        "agendar": "5/hour",
    },
}

SIMPLE_JWT = {
    "USER_ID_FIELD": "id_usuario",
    "USER_ID_CLAIM": "user_id",
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

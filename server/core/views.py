import logging

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

logger = logging.getLogger(__name__)


class AgendarThrottle(AnonRateThrottle):
    """Limita quantos e-mails um mesmo visitante consegue disparar (ver settings)."""

    scope = "agendar"


def _limpar(valor, limite):
    """Remove espaços e quebras de linha e corta no tamanho máximo."""
    return " ".join(str(valor or "").split())[:limite]


@api_view(["POST"])
@authentication_classes([])  # rota pública: não depende de login nem de token
@permission_classes([AllowAny])
@throttle_classes([AgendarThrottle])
def enviar_agendamento(request):
    nome = _limpar(request.data.get("nome"), 150)
    whatsapp = _limpar(request.data.get("whatsapp"), 30)
    servico = _limpar(request.data.get("servico"), 200)
    mensagem = str(request.data.get("mensagem") or "").strip()[:2000]

    if not nome or not whatsapp or not servico or not mensagem:
        return Response(
            {"status": "erro", "mensagem": "Preencha todos os campos."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    corpo = f"""
Novo contato recebido pelo site do Meive Beauty Studio.

Nome: {nome}
WhatsApp: {whatsapp}
Serviço desejado: {servico}

Mensagem:
{mensagem}
"""

    try:
        send_mail(
            subject=f"Novo Agendamento - {nome}",
            message=corpo,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
        )
    except Exception:
        # o detalhe do erro vai para o log do servidor, não para quem enviou o formulário
        logger.exception("Erro ao enviar e-mail do formulário de agendamento")
        return Response(
            {
                "status": "erro",
                "mensagem": "Não foi possível enviar sua mensagem agora. Tente pelo WhatsApp.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {"status": "sucesso", "mensagem": "E-mail enviado com sucesso!"},
        status=status.HTTP_200_OK,
    )

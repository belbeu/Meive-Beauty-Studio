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
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([AgendarThrottle])
def enviar_agendamento(request):
    nome = _limpar(request.data.get("nome"), 150)
    whatsapp = _limpar(request.data.get("whatsapp"), 30)
    mensagem = str(request.data.get("mensagem") or "").strip()[:2000]

    if not nome or not whatsapp or not mensagem:
        return Response(
            {"status": "erro", "mensagem": "Preencha todos os campos."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    corpo = f"""
Nova mensagem recebida pelo site do Mevie Beauty Studio.

Nome: {nome}
WhatsApp: {whatsapp}

Mensagem:
{mensagem}
"""

    try:
        send_mail(
            subject=f"Nova mensagem pelo site - {nome}",
            message=corpo,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
        )

    except Exception:
        logger.exception("Erro ao enviar e-mail do formulário de contato")

        return Response(
            {
                "status": "erro",
                "mensagem": "Não foi possível enviar sua mensagem agora. Tente pelo WhatsApp.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {"status": "sucesso", "mensagem": "Mensagem enviada com sucesso!"},
        status=status.HTTP_200_OK,
    )

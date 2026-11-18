"""
Tempo da agenda.

O projeto guarda o horário do atendimento "como foi digitado" (ex.: 14:00 digitado
vira 14:00 UTC no banco, sem converter fuso). Por isso, para saber quanto falta para
um atendimento, o "agora" também precisa ser a hora de parede de Brasília rotulada
como UTC. Todo código de lembrete/notificação usa estas funções para não divergir.
"""
from datetime import timezone as dt_timezone
from zoneinfo import ZoneInfo

from django.utils import timezone

FUSO_BRASIL = ZoneInfo("America/Sao_Paulo")

# Quantas horas antes do atendimento o admin é avisado.
HORAS_AVISO_ADMIN = 2


def agora_digitado():
    return timezone.now().astimezone(FUSO_BRASIL).replace(tzinfo=dt_timezone.utc)


def minutos_ate(data_agendamento, agora=None):
    """Minutos até o atendimento (negativo se já passou)."""
    agora = agora or agora_digitado()
    return int((data_agendamento - agora).total_seconds() // 60)

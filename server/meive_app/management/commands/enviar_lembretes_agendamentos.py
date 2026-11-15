from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand
from django.utils import timezone

from meive_app.models import Agendamento
from meive_app.notificacoes_agendamento import enviar_email_agendamento


FUSO_BRASIL = ZoneInfo("America/Sao_Paulo")


class Command(BaseCommand):
    help = "Envia lembretes por e-mail dos agendamentos confirmados para o dia seguinte."

    def handle(self, *args, **options):
        agora_local = timezone.now().astimezone(FUSO_BRASIL)
        amanha = agora_local.date() + timedelta(days=1)
        # O projeto atualmente interpreta os horários sem fuso enviados pelo
        # formulário como UTC. Mantemos a mesma convenção para não deslocar
        # os agendamentos já cadastrados.
        fuso_dados = ZoneInfo("UTC")
        inicio = datetime.combine(amanha, time.min, tzinfo=fuso_dados)
        fim = inicio + timedelta(days=1)

        agendamentos = (
            Agendamento.objects
            .select_related("id_usuario", "id_servico")
            .filter(
                status="confirmed",
                data_agendamento__gte=inicio,
                data_agendamento__lt=fim,
                lembrete_enviado_em__isnull=True,
            )
            .order_by("data_agendamento")
        )

        enviados = 0
        falhas = 0
        for agendamento in agendamentos.iterator():
            if enviar_email_agendamento(agendamento, "reminder"):
                agendamento.lembrete_enviado_em = timezone.now()
                agendamento.save(update_fields=["lembrete_enviado_em"])
                enviados += 1
            else:
                falhas += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Processamento concluído: {enviados} lembrete(s) enviado(s); "
                f"{falhas} falha(s). Data considerada: {amanha:%d/%m/%Y}."
            )
        )

from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand
from django.utils import timezone

from meive_app.agenda_tempo import FUSO_BRASIL, HORAS_AVISO_ADMIN, agora_digitado
from meive_app.models import Agendamento
from meive_app.notificacoes_agendamento import (
    enviar_email_admin_proximos,
    enviar_email_agendamento,
)


class Command(BaseCommand):
    help = (
        "Envia (1) o lembrete por e-mail às clientes com atendimento amanhã e "
        "(2) um aviso ao admin sobre atendimentos que começam nas próximas horas. "
        "Agende para rodar a cada 15 minutos."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--horas", type=int, default=HORAS_AVISO_ADMIN,
            help="Antecedência, em horas, do aviso ao admin (padrão: %(default)s).",
        )

    def handle(self, *args, **options):
        self._lembretes_clientes()
        self._aviso_admin(options["horas"])

    # ---- (1) clientes: atendimentos de amanhã ----
    def _lembretes_clientes(self):
        agora_local = timezone.now().astimezone(FUSO_BRASIL)
        amanha = agora_local.date() + timedelta(days=1)
        # Horários são guardados como digitados (rotulados UTC): mesma convenção aqui.
        inicio = datetime.combine(amanha, time.min, tzinfo=ZoneInfo("UTC"))
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

        enviados = falhas = 0
        for agendamento in agendamentos.iterator():
            if enviar_email_agendamento(agendamento, "reminder"):
                agendamento.lembrete_enviado_em = timezone.now()
                agendamento.save(update_fields=["lembrete_enviado_em"])
                enviados += 1
            else:
                falhas += 1

        self.stdout.write(self.style.SUCCESS(
            f"Clientes: {enviados} lembrete(s) enviado(s); {falhas} falha(s). "
            f"Data considerada: {amanha:%d/%m/%Y}."
        ))

    # ---- (2) admin: atendimentos nas próximas horas ----
    def _aviso_admin(self, horas):
        agora = agora_digitado()
        pendentes = list(
            Agendamento.objects
            .select_related("id_usuario", "id_servico")
            .filter(
                status="confirmed",
                data_agendamento__gte=agora,
                data_agendamento__lte=agora + timedelta(hours=horas),
                lembrete_admin_enviado_em__isnull=True,
            )
            .order_by("data_agendamento")
        )
        if not pendentes:
            self.stdout.write("Admin: nenhum atendimento próximo para avisar.")
            return

        if enviar_email_admin_proximos(pendentes, horas):
            Agendamento.objects.filter(
                pk__in=[a.pk for a in pendentes]
            ).update(lembrete_admin_enviado_em=timezone.now())
            self.stdout.write(self.style.SUCCESS(
                f"Admin: aviso enviado ({len(pendentes)} atendimento(s))."
            ))
        else:
            self.stdout.write(self.style.ERROR(
                "Admin: não foi possível enviar o aviso (veja o log)."
            ))

import logging
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.html import escape

logger = logging.getLogger(__name__)

STATUS_LABELS = {
    "confirmed": "Confirmado",
    "ongoing": "Em atendimento",
    "concluded": "Concluído",
    "cancelled": "Cancelado",
}


def _data_hora(agendamento):
    data_local = timezone.localtime(agendamento.data_agendamento)
    return data_local.strftime("%d/%m/%Y às %H:%M")


def _valor(valor):
    try:
        numero = Decimal(str(valor or "0"))
    except (InvalidOperation, TypeError, ValueError):
        numero = Decimal("0")
    return f"R$ {numero:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def enviar_email_agendamento(agendamento, evento, dados_anteriores=None):
    """
    Envia uma notificação transacional. Falhas de e-mail são registradas,
    mas nunca desfazem uma operação já realizada na agenda.
    """
    cliente = agendamento.id_usuario
    destinatario = (cliente.email or "").strip()
    if not destinatario:
        logger.warning(
            "Agendamento %s sem e-mail de cliente; notificação %s não enviada.",
            agendamento.pk, evento,
        )
        return False

    nome = cliente.nome or "cliente"
    servico = agendamento.id_servico.nome
    data_hora = _data_hora(agendamento)
    status = STATUS_LABELS.get(agendamento.status, agendamento.status)
    valor = _valor(agendamento.valor)

    assuntos = {
        "created": "Agendamento confirmado - Meive Studio",
        "rescheduled": "Seu agendamento foi reagendado - Meive Studio",
        "cancelled": "Agendamento cancelado - Meive Studio",
        "reactivated": "Agendamento reativado - Meive Studio",
        "ongoing": "Seu atendimento foi iniciado - Meive Studio",
        "concluded": "Atendimento concluído - Meive Studio",
        "updated": "Atualização no seu agendamento - Meive Studio",
        "deleted": "Agendamento removido - Meive Studio",
        "reminder": "Lembrete: seu atendimento é amanhã - Meive Studio",
    }
    assunto = assuntos.get(evento, "Atualização do agendamento - Meive Studio")

    linhas = [
        f"Olá, {nome}!",
        "",
    ]
    if evento == "created":
        linhas += ["Seu agendamento foi cadastrado com sucesso.", ""]
    elif evento == "rescheduled":
        linhas += ["Seu agendamento foi reagendado.", ""]
        if dados_anteriores and dados_anteriores.get("data_agendamento"):
            anterior = timezone.localtime(dados_anteriores["data_agendamento"]).strftime("%d/%m/%Y às %H:%M")
            linhas.append(f"Data e horário anteriores: {anterior}")
    elif evento == "cancelled":
        linhas += ["Informamos que seu agendamento foi cancelado.", ""]
    elif evento == "reactivated":
        linhas += ["Seu agendamento foi reativado.", ""]
    elif evento == "ongoing":
        linhas += ["Seu atendimento foi marcado como iniciado.", ""]
    elif evento == "concluded":
        linhas += ["Seu atendimento foi concluído. Obrigada por escolher o Studio Meive!", ""]
    elif evento == "updated":
        linhas += ["As informações do seu agendamento foram atualizadas.", ""]
    elif evento == "deleted":
        linhas += ["Informamos que seu agendamento foi removido da agenda.", ""]
    elif evento == "reminder":
        linhas += ["Passando para lembrar que seu atendimento está marcado para amanhã.", ""]

    if evento != "deleted":
        linhas += [
            "DETALHES DO AGENDAMENTO",
            f"Serviço: {servico}",
            f"Data e horário: {data_hora}",
            f"Status: {status}",
            f"Valor: {valor}",
        ]
    else:
        linhas += [f"Serviço: {servico}", f"Data anteriormente agendada: {data_hora}"]

    linhas += ["", "Se precisar de ajuda, entre em contato com a equipe Meive Studio.", "Email: meivebeautystudio@gmail.com", "WhatsApp: (11) 94487-4969", "", "Com carinho,",
               "Equipe Meive Studio"]
    mensagem = "\n".join(linhas)

    # Corpo HTML simples e responsivo; os dados variáveis são escapados.
    detalhes = ""
    if evento != "deleted":
        detalhes = (
            f"<p><b>Serviço:</b> {escape(servico)}<br>"
            f"<b>Data e horário:</b> {escape(data_hora)}<br>"
            f"<b>Status:</b> {escape(status)}<br>"
            f"<b>Valor:</b> {escape(valor)}</p>"
        )
    else:
        detalhes = (
            f"<p><b>Serviço:</b> {escape(servico)}<br>"
            f"<b>Data anteriormente agendada:</b> {escape(data_hora)}</p>"
        )
    html = (
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;'
        'padding:24px;color:#30252a;line-height:1.6">'
        '<h2 style="color:#762b43">Meive Studio</h2>'
        f"<p>Olá, {escape(nome)}!</p>"
        f"<p>{escape(linhas[2] if len(linhas) > 2 else '')}</p>"
        f"{detalhes}"
        '<p>Se precisar de ajuda, entre em contato com a equipe da Meive Studio.</p>'
        '<p>Com carinho,<br><b>Equipe Meive Studio</b></p></div>'
    )

    try:
        enviados = send_mail(
            subject=assunto,
            message=mensagem,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[destinatario],
            html_message=html,
            fail_silently=False,
        )
        return enviados == 1
    except Exception:
        logger.exception(
            "Falha ao enviar e-mail do agendamento %s para %s (evento %s).",
            agendamento.pk, destinatario, evento,
        )
        return False

def enviar_email_admin_proximos(agendamentos, horas):
    """
    Avisa o admin (um único e-mail) sobre atendimentos que começam em breve.
    Devolve True só se o e-mail foi aceito pelo servidor de envio.
    """
    destinatario = (getattr(settings, "ADMIN_NOTIFICATION_EMAIL", "") or "").strip()
    if not destinatario or not agendamentos:
        return False

    linhas = [f"Atendimentos nas próximas {horas} horas:", ""]
    itens_html = []
    for ag in agendamentos:
        hora = timezone.localtime(ag.data_agendamento).strftime("%H:%M")
        cliente = ag.id_usuario.nome or "Cliente"
        servico = ag.id_servico.nome
        linhas.append(f"{hora} - {cliente} - {servico}")
        itens_html.append(
            f"<li><b>{escape(hora)}</b> - {escape(cliente)} - {escape(servico)}</li>"
        )
    linhas += ["", "Veja a agenda completa no painel administrativo."]

    html = (
        '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;'
        'padding:24px;color:#30252a;line-height:1.6">'
        '<h2 style="color:#762b43">Atendimento próximo</h2>'
        f"<p>Atendimentos nas próximas {horas} horas:</p>"
        f"<ul>{''.join(itens_html)}</ul>"
        "<p>Veja a agenda completa no painel administrativo.</p></div>"
    )
    try:
        enviados = send_mail(
            subject=f"Atendimento próximo ({len(agendamentos)}) - Meive Studio",
            message="\n".join(linhas),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[destinatario],
            html_message=html,
            fail_silently=False,
        )
        return enviados == 1
    except Exception:
        logger.exception("Falha ao enviar o aviso de atendimento próximo ao admin.")
        return False

import json

from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def enviar_agendamento(request):

    if request.method != 'POST':
        return JsonResponse(
            {
                'status': 'metodo_invalido'
            },
            status=405
        )

    try:
        data = json.loads(request.body)

        nome = data.get('nome')
        whatsapp = data.get('whatsapp')
        servico = data.get('servico')
        mensagem = data.get('mensagem')

        if not nome or not whatsapp or not servico or not mensagem:
            return JsonResponse(
                {
                    'status': 'erro',
                    'mensagem': 'Preencha todos os campos.'
                },
                status=400
            )

        assunto = f'Novo Agendamento - {nome}'

        corpo = f"""
Novo contato recebido pelo site do Meive Beauty Studio.

Nome: {nome}
WhatsApp: {whatsapp}
Serviço desejado: {servico}

Mensagem:
{mensagem}
"""

        send_mail(
            subject=assunto,
            message=corpo,
            from_email='meivebeautystudio@gmail.com',
            recipient_list=['meivebeautystudio@gmail.com'],
        )

        return JsonResponse(
            {
                'status': 'sucesso',
                'mensagem': 'E-mail enviado com sucesso!'
            },
            status=200
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {
                'status': 'erro',
                'mensagem': 'Dados inválidos.'
            },
            status=400
        )

    except Exception as e:
        print('ERRO AO ENVIAR E-MAIL:', e)

        return JsonResponse(
            {
                'status': 'erro',
                'mensagem': str(e)
            },
            status=500
        )
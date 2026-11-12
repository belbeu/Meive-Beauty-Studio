from datetime import datetime, timedelta, timezone as dt_timezone

from rest_framework import serializers
from ..models import Agendamento

STATUS_VALIDOS = ('confirmed', 'ongoing', 'concluded', 'cancelled')
CAMPOS_DE_INFORMACAO = ('id_usuario', 'id_servico', 'data_agendamento', 'valor', 'sinal_pago')


def hoje_no_brasil():
    # Horário de Brasília (UTC-3, sem horário de verão), para não "virar o dia" cedo demais.
    return datetime.now(dt_timezone(timedelta(hours=-3))).date()


class AgendamentoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source='id_usuario.nome', read_only=True)
    servico_nome = serializers.CharField(source='id_servico.nome', read_only=True)

    class Meta:
        model = Agendamento
        fields = [
            'id_agendamento', 
            'id_usuario', 
            'cliente_nome', 
            'id_servico', 
            'servico_nome', 
            'status', 
            'data_agendamento', 
            'valor', 
            'sinal_pago',
            'criado_em',
            'historico',
        ]
        read_only_fields = ['criado_em', 'historico']

    def validate_status(self, value):
        if value not in STATUS_VALIDOS:
            raise serializers.ValidationError('Status inválido.')
        return value

    def validate(self, attrs):
        agendamento = self.instance
        if agendamento is None:  # criação
            return attrs

        hoje = hoje_no_brasil()

        def mudou(campo):
            return campo in attrs and attrs[campo] != getattr(agendamento, campo)

        # Cliente, serviço e valores (a data fica de fora: ela é tratada como reagendamento abaixo).
        alterou_informacao = any(mudou(c) for c in CAMPOS_DE_INFORMACAO if c != 'data_agendamento')

        # Agendamento de data anterior: informações não podem mais ser editadas
        # (cancelar, reativar, excluir e reagendar continuam permitidos).
        if alterou_informacao and agendamento.data_agendamento.date() < hoje:
            raise serializers.ValidationError(
                {'detail': 'Agendamentos de datas anteriores não podem ser editados.'}
            )

        # Reagendar: só enquanto o atendimento ainda está confirmado (antes de ser realizado),
        # mesmo que a data antiga já tenha passado (ex.: a cliente faltou). A nova data não pode ser passada.
        if mudou('data_agendamento'):
            if agendamento.status != 'confirmed':
                raise serializers.ValidationError(
                    {'detail': 'Só é possível reagendar um atendimento que ainda está confirmado.'}
                )
            if attrs['data_agendamento'].date() < hoje:
                raise serializers.ValidationError(
                    {'detail': 'A nova data não pode ser anterior a hoje.'}
                )

        return attrs

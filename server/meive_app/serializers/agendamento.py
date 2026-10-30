from rest_framework import serializers
from ..models import Agendamento

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
            'sinal_pago'
        ]
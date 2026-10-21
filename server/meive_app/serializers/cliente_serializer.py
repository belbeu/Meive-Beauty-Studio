from rest_framework import serializers
from meive_app.models import Usuario

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nome', 'email', 'telefone', 'tipo', 'criado_em']
        read_only_fields = ['id_usuario', 'criado_em', 'tipo']

    def create(self, validated_data):
        # Garante que o usuário criado seja do tipo CLIENTE
        validated_data['tipo'] = 'CLIENTE'
        password = validated_data.pop('password', '123456')
        user = Usuario.objects.create_user(password=password, **validated_data)
        return user
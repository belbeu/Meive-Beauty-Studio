from rest_framework import serializers
from meive_app.models import Usuario


class ClienteSerializer(serializers.ModelSerializer):
    # A senha só é aceita na criação e nunca é devolvida pela API.
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "nome",
            "email",
            "telefone",
            "tipo",
            "criado_em",
            "password",
        ]
        read_only_fields = ["id_usuario", "criado_em", "tipo"]

    def validate_email(self, value):
        email = value.strip().lower()
        queryset = Usuario.objects.filter(email__iexact=email)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return email

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Cadastro feito por esta rota sempre cria uma cliente.
        validated_data["tipo"] = "CLIENTE"
        return Usuario.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        # Não altera a senha quando a edição contém apenas nome, e-mail e telefone.
        validated_data.pop("password", None)
        return super().update(instance, validated_data)

import re

from rest_framework import serializers

from ..models import DIAS_SEMANA, ConfiguracaoStudio

HORA = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def formatar_telefone(digitos):
    if len(digitos) == 11:
        return f"({digitos[:2]}) {digitos[2:7]}-{digitos[7:]}"
    return f"({digitos[:2]}) {digitos[2:6]}-{digitos[6:]}"


class ConfiguracaoStudioSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=150)
    endereco = serializers.CharField(max_length=255)

    class Meta:
        model = ConfiguracaoStudio
        fields = ["nome", "telefone", "email", "endereco", "horarios", "atualizado_em"]
        read_only_fields = ["atualizado_em"]

    def validate_nome(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Informe o nome do negócio.")
        return value

    def validate_endereco(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Informe o endereço.")
        return value

    def validate_telefone(self, value):
        digitos = re.sub(r"\D", "", value or "")
        if len(digitos) not in (10, 11):
            raise serializers.ValidationError("Informe um telefone com DDD (10 ou 11 dígitos).")
        return formatar_telefone(digitos)

    def validate_horarios(self, value):
        if not isinstance(value, dict) or set(value.keys()) != set(DIAS_SEMANA):
            raise serializers.ValidationError("Informe os horários de todos os dias da semana.")

        limpo = {}
        for dia in DIAS_SEMANA:
            item = value[dia]
            if not isinstance(item, dict) or not isinstance(item.get("aberto"), bool):
                raise serializers.ValidationError("Horários em formato inválido.")

            abre = item.get("abre") or "09:00"
            fecha = item.get("fecha") or "18:00"
            if not (isinstance(abre, str) and HORA.match(abre) and isinstance(fecha, str) and HORA.match(fecha)):
                raise serializers.ValidationError("Use horas no formato HH:MM.")
            if item["aberto"] and fecha <= abre:
                raise serializers.ValidationError(
                    "O horário de fechamento deve ser depois do de abertura."
                )

            limpo[dia] = {"aberto": item["aberto"], "abre": abre, "fecha": fecha}
        return limpo

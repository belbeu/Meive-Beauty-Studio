from rest_framework import serializers
from ..models import Promocao


class PromocaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocao
        fields = "__all__"
        read_only_fields = ["id_promocao", "criado_em"]

    def validate(self, attrs):
        original = attrs.get("preco_original", getattr(self.instance, "preco_original", None))
        promocional = attrs.get("preco_promocional", getattr(self.instance, "preco_promocional", None))
        if original is not None and original <= 0:
            raise serializers.ValidationError({"preco_original": "Informe um preço maior que zero."})
        if promocional is not None and promocional <= 0:
            raise serializers.ValidationError({"preco_promocional": "Informe um preço maior que zero."})
        if original is not None and promocional is not None and promocional >= original:
            raise serializers.ValidationError({"preco_promocional": "O preço promocional deve ser menor que o preço original."})
        return attrs

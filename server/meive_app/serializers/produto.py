from rest_framework import serializers
from ..models import Produto


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = "__all__"

    # O banco tem CHECK (valor >= 0); validamos aqui para devolver erro 400 claro.
    def validate_preco(self, value):
        if value < 0:
            raise serializers.ValidationError("O preço não pode ser negativo.")
        return value

    def validate_custo(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("O custo não pode ser negativo.")
        return value

    def validate_estoque_atual(self, value):
        if value < 0:
            raise serializers.ValidationError("O estoque não pode ser negativo.")
        return value
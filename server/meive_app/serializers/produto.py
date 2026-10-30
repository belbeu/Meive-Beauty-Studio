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


# Até quantas unidades a loja mostra "últimas unidades" (mesmo limite usado no painel admin).
LIMITE_ESTOQUE_BAIXO = 5


class ProdutoPublicoSerializer(serializers.ModelSerializer):
    """O que a loja do site pode ver (rota pública /produtos/).

    Não expõe o custo nem a quantidade exata em estoque: o site só precisa saber
    se há estoque e se restam poucas unidades.
    """

    em_estoque = serializers.SerializerMethodField()
    ultimas_unidades = serializers.SerializerMethodField()

    class Meta:
        model = Produto
        fields = [
            "id_produto",
            "nome",
            "descricao",
            "categoria",
            "preco",
            "imagem_url",
            "em_estoque",
            "ultimas_unidades",
        ]
        read_only_fields = fields

    def get_em_estoque(self, obj):
        return obj.estoque_atual > 0

    def get_ultimas_unidades(self, obj):
        return 0 < obj.estoque_atual <= LIMITE_ESTOQUE_BAIXO
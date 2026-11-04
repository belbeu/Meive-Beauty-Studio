from rest_framework import serializers

from ..models import CestinhaInteresse, Produto


class CestinhaInteresseSerializer(serializers.ModelSerializer):
    produto = serializers.SerializerMethodField()

    class Meta:
        model = CestinhaInteresse
        fields = [
            'id_cestinha',
            'id_produto',
            'produto',
            'quantidade',
            'adicionado_em',
        ]
        read_only_fields = [
            'id_cestinha',
            'produto',
            'adicionado_em',
        ]

    def get_produto(self, obj):
        produto = obj.id_produto

        if not produto:
            return None

        return {
            'id_produto': produto.id_produto,
            'nome': produto.nome,
            'descricao': produto.descricao,
            'categoria': produto.categoria,
            'preco': str(produto.preco),
            'imagem_url': produto.imagem_url,
            'em_estoque': produto.estoque_atual > 0,
        }

    def validate_id_produto(self, value):
        if not value.ativo:
            raise serializers.ValidationError(
                "Este produto não está disponível."
            )

        if value.estoque_atual <= 0:
            raise serializers.ValidationError(
                "Este produto está sem estoque."
            )

        return value

    def validate_quantidade(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "A quantidade deve ser maior que zero."
            )

        return value

    def validate(self, attrs):
        produto = attrs.get('id_produto')

        if produto is None and self.instance is None:
            raise serializers.ValidationError({
                'id_produto': 'Selecione um produto para adicionar à cestinha.'
            })

        if (
            self.instance is not None
            and produto is not None
            and produto != self.instance.id_produto
        ):
            raise serializers.ValidationError({
                'id_produto': 'Não é permitido trocar o produto de um item existente.'
            })

        return attrs
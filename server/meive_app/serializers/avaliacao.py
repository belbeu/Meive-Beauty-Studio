from django.urls import reverse
from rest_framework import serializers

from ..models import Avaliacao, ProdutoImagem
from ..produto_imagem import TAMANHO_MAXIMO, detectar_tipo

TIPO_ORIGEM_SITE = "site"
COMENTARIO_MAXIMO = 1000


class AvaliacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avaliacao
        fields = "__all__"


class AvaliacaoClienteSerializer(serializers.ModelSerializer):
    """Avaliação do site feita pela própria cliente (nota, comentário, foto e anonimato).

    A foto chega como arquivo (campo "foto") na mesma requisição da avaliação e é guardada
    no banco (tabela produto_imagem). Para tirar a foto numa edição, envie remover_foto=true.
    """

    nota = serializers.IntegerField(
        min_value=1,
        max_value=5,
        error_messages={
            "required": "Escolha uma nota de 1 a 5 estrelas.",
            "null": "Escolha uma nota de 1 a 5 estrelas.",
            "invalid": "A nota deve ser um número inteiro de 1 a 5.",
            "min_value": "A nota deve ficar entre 1 e 5 estrelas.",
            "max_value": "A nota deve ficar entre 1 e 5 estrelas.",
        },
    )
    comentario = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=COMENTARIO_MAXIMO,
        error_messages={
            "max_length": f"O comentário pode ter no máximo {COMENTARIO_MAXIMO} caracteres.",
        },
    )
    anonima = serializers.BooleanField(required=False)
    foto = serializers.FileField(
        write_only=True,
        required=False,
        allow_null=True,
        error_messages={"invalid": "Envie um arquivo de imagem válido."},
    )
    remover_foto = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = Avaliacao
        fields = [
            "id_avaliacao",
            "nota",
            "comentario",
            "anonima",
            "foto",
            "remover_foto",
            "foto_url",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["id_avaliacao", "foto_url", "criado_em", "atualizado_em"]

    def validate_comentario(self, valor):
        valor = (valor or "").strip()
        return valor or None

    def validate_foto(self, arquivo):
        if arquivo is None:
            return None
        if arquivo.size > TAMANHO_MAXIMO:
            raise serializers.ValidationError("A foto é grande demais (máximo de 2 MB).")
        dados = arquivo.read()
        tipo = detectar_tipo(dados)
        if tipo is None:
            raise serializers.ValidationError("Formato não aceito. Use JPG, PNG, WEBP ou GIF.")
        # Guarda o conteúdo já lido e o tipo detectado pelo conteúdo (não pelo nome do arquivo).
        return dados, tipo

    def _salvar_foto(self, foto):
        dados, tipo = foto
        imagem = ProdutoImagem.objects.create(conteudo=dados, tipo_conteudo=tipo)
        url = reverse("produto-imagem", args=[imagem.pk])
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def create(self, validated_data):
        foto = validated_data.pop("foto", None)
        validated_data.pop("remover_foto", None)
        if foto:
            validated_data["foto_url"] = self._salvar_foto(foto)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        foto = validated_data.pop("foto", None)
        remover = validated_data.pop("remover_foto", False)
        if foto:
            validated_data["foto_url"] = self._salvar_foto(foto)
        elif remover:
            validated_data["foto_url"] = None
        return super().update(instance, validated_data)

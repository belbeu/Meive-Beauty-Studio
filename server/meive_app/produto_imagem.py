# Upload (somente admin) e entrega pública das fotos de produto.
#
# O arquivo é guardado no banco (tabela produto_imagem). O upload devolve o
# endereço completo da imagem, que o formulário grava em produto.imagem_url.

from django.http import Http404, HttpResponse
from django.urls import reverse
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProdutoImagem

TAMANHO_MAXIMO = 2 * 1024 * 1024  # 2 MB


def detectar_tipo(dados):
    """Descobre o formato pelo conteúdo do arquivo (não confia no nome nem no tipo enviado)."""
    if dados.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if dados.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if dados[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if dados[:4] == b"RIFF" and dados[8:12] == b"WEBP":
        return "image/webp"
    return None


class ProdutoImagemUploadView(APIView):
    """POST multipart com o campo "imagem". Devolve {"url": "..."}."""

    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        arquivo = request.FILES.get("imagem")
        if arquivo is None:
            return Response({"imagem": ["Envie um arquivo de imagem."]}, status=400)
        if arquivo.size > TAMANHO_MAXIMO:
            return Response({"imagem": ["A imagem é grande demais (máximo de 2 MB)."]}, status=400)

        dados = arquivo.read()
        tipo = detectar_tipo(dados)
        if tipo is None:
            return Response(
                {"imagem": ["Formato não aceito. Use JPG, PNG, WEBP ou GIF."]}, status=400
            )

        imagem = ProdutoImagem.objects.create(conteudo=dados, tipo_conteudo=tipo)
        url = request.build_absolute_uri(reverse("produto-imagem", args=[imagem.pk]))
        return Response({"url": url}, status=201)


class ProdutoImagemView(APIView):
    """Entrega a imagem. Pública, pois a loja do site também usa."""

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, pk):
        try:
            imagem = ProdutoImagem.objects.get(pk=pk)
        except ProdutoImagem.DoesNotExist:
            raise Http404

        resposta = HttpResponse(bytes(imagem.conteudo), content_type=imagem.tipo_conteudo)
        # Cada upload cria uma imagem nova (id novo), então o navegador pode guardar à vontade.
        resposta["Cache-Control"] = "public, max-age=31536000, immutable"
        resposta["X-Content-Type-Options"] = "nosniff"
        return resposta
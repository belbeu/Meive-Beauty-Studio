from rest_framework import filters, permissions, viewsets

from meive_app.models import Usuario
from meive_app.serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome", "email", "telefone"]

    def get_queryset(self):
        return Usuario.objects.filter(tipo="CLIENTE").order_by("-criado_em")

from django.shortcuts import render
from rest_framework import viewsets, filters
from meive_app.models import Usuario
from meive_app.serializers import ClienteSerializer

# Create your views here.
class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'email', 'telefone']

    def get_queryset(self):
        return Usuario.objects.filter(tipo='CLIENTE').order_by('-criado_em')
from rest_framework import serializers
from ..models import MaterialCurso


class MaterialCursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialCurso
        fields = "__all__"

from rest_framework import serializers
from ..models import CestinhaInteresse


class CestinhaInteresseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CestinhaInteresse
        fields = "__all__"

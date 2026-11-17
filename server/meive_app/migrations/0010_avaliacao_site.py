import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("meive_app", "0009_agendamento_lembrete_enviado_em"),
    ]

    operations = [
        migrations.AddField(
            model_name="avaliacao",
            name="foto_url",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="avaliacao",
            name="anonima",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="avaliacao",
            name="criado_em",
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name="avaliacao",
            name="atualizado_em",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

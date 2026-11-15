from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("meive_app", "0008_codigoverificacaoemail"),
    ]

    operations = [
        migrations.AddField(
            model_name="agendamento",
            name="lembrete_enviado_em",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

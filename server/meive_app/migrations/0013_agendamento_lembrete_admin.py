from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("meive_app", "0012_turma_ativo"),
    ]

    operations = [
        migrations.AddField(
            model_name="agendamento",
            name="lembrete_admin_enviado_em",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

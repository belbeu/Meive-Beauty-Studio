from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("meive_app", "0011_avaliacao_servico"),
    ]

    operations = [
        migrations.AddField(
            model_name="turma",
            name="ativo",
            field=models.BooleanField(default=True),
        ),
    ]

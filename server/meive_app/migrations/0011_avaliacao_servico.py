import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("meive_app", "0010_avaliacao_site"),
    ]

    operations = [
        migrations.AddField(
            model_name="avaliacao",
            name="id_servico",
            field=models.ForeignKey(
                blank=True,
                db_column="id_servico",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="avaliacoes",
                to="meive_app.servico",
            ),
        ),
    ]

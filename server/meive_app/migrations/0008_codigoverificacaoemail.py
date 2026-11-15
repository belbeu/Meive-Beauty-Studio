# Generated for email verification workflows.
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [("meive_app", "0007_configuracao_studio")]

    operations = [
        migrations.CreateModel(
            name="CodigoVerificacaoEmail",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(db_index=True, max_length=150)),
                ("finalidade", models.CharField(db_index=True, max_length=30)),
                ("codigo_hash", models.CharField(max_length=256)),
                ("dados_pendentes", models.JSONField(blank=True, default=dict)),
                ("expira_em", models.DateTimeField()),
                ("tentativas", models.PositiveSmallIntegerField(default=0)),
                ("criado_em", models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={"db_table": "codigo_verificacao_email"},
        ),
        migrations.AddIndex(
            model_name="codigoverificacaoemail",
            index=models.Index(fields=["email", "finalidade", "-criado_em"], name="cod_verif_email_final_idx"),
        ),
    ]

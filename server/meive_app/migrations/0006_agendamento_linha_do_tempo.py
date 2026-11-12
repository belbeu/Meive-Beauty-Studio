from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meive_app', '0005_alter_cestinhainteresse_options_and_more'),
    ]

    operations = [
        # A tabela agendamento já existe no banco (criada pelo setup.sql), então a coluna
        # é criada com IF NOT EXISTS: funciona tanto no banco atual quanto em um banco novo.
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE agendamento "
                        "ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NULL, "
                        "ADD COLUMN IF NOT EXISTS historico JSONB NOT NULL DEFAULT '[]'::jsonb;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE agendamento "
                        "DROP COLUMN IF EXISTS historico, "
                        "DROP COLUMN IF EXISTS criado_em;"
                    ),
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='agendamento',
                    name='criado_em',
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='agendamento',
                    name='historico',
                    field=models.JSONField(blank=True, default=list),
                ),
            ],
        ),
    ]

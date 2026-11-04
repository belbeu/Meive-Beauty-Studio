from django.db import migrations


def criar_promocoes_iniciais(apps, schema_editor):
    Promocao = apps.get_model("meive_app", "Promocao")
    if Promocao.objects.exists():
        return

    Promocao.objects.bulk_create([
        Promocao(
            titulo="Combo Olhar Perfeito",
            descricao="Extensão Volume Russo + Design de Sobrancelhas com Henna. O combo ideal para transformar o seu olhar.",
            preco_original="350.00",
            preco_promocional="290.00",
            validade="Válido até sexta-feira",
            destaque=True,
            ativo=True,
        ),
        Promocao(
            titulo="1ª Vez no Estúdio",
            descricao="Nunca fez os cílios conosco? Aproveite este desconto especial na sua primeira aplicação do modelo Fio a Fio.",
            preco_original="180.00",
            preco_promocional="150.00",
            validade="Apenas para novas clientes",
            destaque=False,
            ativo=True,
        ),
        Promocao(
            titulo="Pacote Manutenção Mensal",
            descricao="Feche 2 manutenções no mês e ganhe a higienização profunda dos fios grátis em ambas as sessões.",
            preco_original="250.00",
            preco_promocional="190.00",
            validade="Vagas limitadas",
            destaque=False,
            ativo=True,
        ),
    ])


def remover_promocoes_iniciais(apps, schema_editor):
    Promocao = apps.get_model("meive_app", "Promocao")
    Promocao.objects.filter(titulo__in=[
        "Combo Olhar Perfeito",
        "1ª Vez no Estúdio",
        "Pacote Manutenção Mensal",
    ]).delete()


class Migration(migrations.Migration):
    dependencies = [("meive_app", "0003_promocao")]
    operations = [migrations.RunPython(criar_promocoes_iniciais, remover_promocoes_iniciais)]

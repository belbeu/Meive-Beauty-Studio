from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone


class Agendamento(models.Model):
    id_agendamento = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE, db_column='id_usuario')
    id_servico = models.ForeignKey('Servico', on_delete=models.RESTRICT, db_column='id_servico')
    status = models.CharField(max_length=50, default='confirmed')
    data_agendamento = models.DateTimeField()
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sinal_pago = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)
    # Linha do tempo: quando foi criado e cada mudança de status ({status, em, de?}).
    criado_em = models.DateTimeField(null=True, blank=True)
    historico = models.JSONField(default=list, blank=True)
    lembrete_enviado_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'agendamento'

    def save(self, *args, **kwargs):
        agora = timezone.now()
        historico = list(self.historico or [])

        if self._state.adding:
            if not self.criado_em:
                self.criado_em = agora
            if not historico:
                historico.append({'status': 'created', 'em': self.criado_em.isoformat()})
                historico.append({'status': self.status, 'em': agora.isoformat()})
        else:
            antigo = (
                Agendamento.objects.filter(pk=self.pk)
                .values('status', 'data_agendamento')
                .first()
            )
            if antigo is not None:
                if antigo['status'] != self.status:
                    historico.append({'status': self.status, 'em': agora.isoformat(), 'de': antigo['status']})
                if antigo['data_agendamento'] != self.data_agendamento:
                    # Um novo horário exige um novo lembrete para a data atualizada.
                    self.lembrete_enviado_em = None
                if antigo['data_agendamento'] != self.data_agendamento and hasattr(self.data_agendamento, 'isoformat'):
                    historico.append({
                        'status': 'rescheduled',
                        'em': agora.isoformat(),
                        'de': antigo['data_agendamento'].isoformat(),
                        'para': self.data_agendamento.isoformat(),
                    })

        self.historico = historico

        # Se quem chamou limitou as colunas salvas, garante que o histórico entre também.
        if kwargs.get('update_fields') is not None:
            kwargs['update_fields'] = set(kwargs['update_fields']) | {'historico', 'criado_em'}
            if 'data_agendamento' in kwargs['update_fields']:
                kwargs['update_fields'].add('lembrete_enviado_em')

        super().save(*args, **kwargs)


class Avaliacao(models.Model):
    id_avaliacao = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')
    # Serviço é opcional: avaliações antigas e avaliações gerais continuam válidas.
    id_servico = models.ForeignKey(
        'Servico', models.SET_NULL, db_column='id_servico',
        blank=True, null=True, related_name='avaliacoes'
    )
    nota = models.IntegerField()
    comentario = models.TextField(blank=True, null=True)
    tipo_origem = models.CharField(max_length=50, blank=True, null=True)
    referencia_id = models.IntegerField(blank=True, null=True)
    # Avaliação do site feita pela cliente: foto opcional (endereço em produto_imagem),
    # opção de aparecer como anônima e datas de criação/edição.
    foto_url = models.CharField(max_length=255, blank=True, null=True)
    anonima = models.BooleanField(default=False)
    criado_em = models.DateTimeField(default=timezone.now, blank=True, null=True)
    atualizado_em = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'avaliacao'


class CestinhaInteresse(models.Model):
    id_cestinha = models.AutoField(primary_key=True)

    id_usuario = models.ForeignKey(
        'Usuario',
        models.DO_NOTHING,
        db_column='id_usuario'
    )

    id_produto = models.ForeignKey(
        'Produto',
        models.DO_NOTHING,
        db_column='id_produto',
        blank=True,
        null=True
    )

    # Mantido para compatibilidade com registros antigos.
    # A nova Cestinha aceitará somente produtos.
    id_curso = models.ForeignKey(
        'Curso',
        models.DO_NOTHING,
        db_column='id_curso',
        blank=True,
        null=True
    )

    quantidade = models.PositiveIntegerField(default=1)

    adicionado_em = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'cestinha_interesse'
        ordering = ['-adicionado_em']
        constraints = [
            models.UniqueConstraint(
                fields=['id_usuario', 'id_produto'],
                condition=models.Q(id_produto__isnull=False),
                name='unique_usuario_produto_cestinha'
            )
        ]

    def __str__(self):
        return f"{self.id_usuario} - {self.id_produto}"

class Curso(models.Model):
    id_curso = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    carga_horaria = models.IntegerField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    ativo = models.BooleanField(default=True, blank=True, null=True)

    class Meta:
        db_table = 'curso'


class MaterialCurso(models.Model):
    id_material = models.AutoField(primary_key=True)
    id_curso = models.ForeignKey(Curso, models.DO_NOTHING, db_column='id_curso')
    titulo = models.CharField(max_length=150)
    tipo_arquivo = models.CharField(max_length=50, blank=True, null=True)
    arquivo_url = models.CharField(max_length=255)

    class Meta:
        db_table = 'material_curso'


class Matricula(models.Model):
    id_matricula = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')
    id_turma = models.ForeignKey('Turma', models.DO_NOTHING, db_column='id_turma')
    data_matricula = models.DateTimeField()
    status = models.CharField(max_length=50)

    class Meta:
        db_table = 'matricula'
        unique_together = (('id_usuario', 'id_turma'),)


class Produto(models.Model):
    id_produto = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    custo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    estoque_atual = models.IntegerField(default=0)
    imagem_url = models.CharField(max_length=255, blank=True, null=True)
    ativo = models.BooleanField(default=True, blank=True, null=True)

    class Meta:
        db_table = 'produto'


class ProdutoImagem(models.Model):
    """Foto enviada pelo painel admin. Fica no banco (Neon) porque o disco do
    Render é apagado a cada deploy/reinício; o endereço dela vai em Produto.imagem_url."""

    id_imagem = models.AutoField(primary_key=True)
    tipo_conteudo = models.CharField(max_length=50)
    conteudo = models.BinaryField()
    criado_em = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'produto_imagem'


class Servico(models.Model):
    id_servico = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=150)
    tecnica = models.CharField(max_length=150, blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duracao_minutos = models.IntegerField(blank=True, null=True)
    descricao = models.TextField(blank=True, null=True)
    tag = models.CharField(max_length=50, blank=True, null=True)
    preco_manutencao = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'servico'


class Turma(models.Model):
    id_turma = models.AutoField(primary_key=True)
    id_curso = models.ForeignKey(Curso, models.DO_NOTHING, db_column='id_curso')
    id_funcionario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_funcionario')
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    capacidade_maxima = models.IntegerField()

    class Meta:
        db_table = 'turma'


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório.")
        email = self.normalize_email(email)
        extra_fields.setdefault("tipo", "CLIENTE")
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields["tipo"] = "ADMIN"
        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser):
    id_usuario = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=150)
    email = models.CharField(unique=True, max_length=150)
    password = models.CharField(max_length=255, db_column="senha_hash")
    tipo = models.CharField(max_length=30)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    criado_em = models.DateTimeField(default=timezone.now, blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nome"]

    @property
    def is_staff(self):
        return self.tipo == "ADMIN"

    @property
    def is_superuser(self):
        return self.tipo == "ADMIN"

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff

    class Meta:
        db_table = "usuario"

class Promocao(models.Model):
    id_promocao = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    preco_original = models.DecimalField(max_digits=10, decimal_places=2)
    preco_promocional = models.DecimalField(max_digits=10, decimal_places=2)
    validade = models.CharField(max_length=150, blank=True, null=True)
    destaque = models.BooleanField(default=False)
    ativo = models.BooleanField(default=True)
    criado_em = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'promocao'
        ordering = ['-destaque', '-criado_em']

    def __str__(self):
        return self.titulo


DIAS_SEMANA = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"]


def horarios_padrao():
    fechado = {"aberto": False, "abre": "09:00", "fecha": "18:00"}
    return {
        "seg": dict(fechado),
        "ter": {"aberto": True, "abre": "09:00", "fecha": "22:00"},
        "qua": {"aberto": True, "abre": "09:00", "fecha": "22:00"},
        "qui": {"aberto": True, "abre": "09:00", "fecha": "22:00"},
        "sex": {"aberto": True, "abre": "09:00", "fecha": "22:00"},
        "sab": {"aberto": True, "abre": "09:00", "fecha": "17:00"},
        "dom": dict(fechado),
    }


class ConfiguracaoStudio(models.Model):
    """Dados do studio mostrados no site (rodapé) e editados em Admin > Configurações.

    Existe uma única linha (id_config = 1); use ConfiguracaoStudio.obter().
    """

    id_config = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=150, default="Meive Beauty Studio")
    telefone = models.CharField(max_length=20, default="(11) 94487-4969")
    email = models.CharField(max_length=150, default="meivebeautystudio@gmail.com")
    endereco = models.CharField(max_length=255, default="R. Giancarlo Palanti, 22 A, 03661-050, Vila Ré")
    horarios = models.JSONField(default=horarios_padrao)
    atualizado_em = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'configuracao_studio'

    @classmethod
    def obter(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.nome


class CodigoVerificacaoEmail(models.Model):
    """Código temporário para confirmar e-mail no cadastro e no login administrativo."""

    email = models.EmailField(max_length=150, db_index=True)
    finalidade = models.CharField(max_length=30, db_index=True)
    codigo_hash = models.CharField(max_length=256)
    dados_pendentes = models.JSONField(default=dict, blank=True)
    expira_em = models.DateTimeField()
    tentativas = models.PositiveSmallIntegerField(default=0)
    criado_em = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "codigo_verificacao_email"
        indexes = [
            models.Index(fields=["email", "finalidade", "-criado_em"], name="cod_verif_email_final_idx"),
        ]

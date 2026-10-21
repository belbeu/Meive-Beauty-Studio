from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone


class Agendamento(models.Model):
    id_agendamento = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')
    id_servico = models.ForeignKey('Servico', models.DO_NOTHING, db_column='id_servico')
    status = models.CharField(max_length=50)
    data_agendamento = models.DateTimeField()

    class Meta:
        db_table = 'agendamento'


class Avaliacao(models.Model):
    id_avaliacao = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')
    nota = models.IntegerField()
    comentario = models.TextField(blank=True, null=True)
    tipo_origem = models.CharField(max_length=50, blank=True, null=True)
    referencia_id = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'avaliacao'


class CestinhaInteresse(models.Model):
    id_cestinha = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')
    id_produto = models.ForeignKey('Produto', models.DO_NOTHING, db_column='id_produto', blank=True, null=True)
    id_curso = models.ForeignKey('Curso', models.DO_NOTHING, db_column='id_curso', blank=True, null=True)
    adicionado_em = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'cestinha_interesse'


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
# Meive Beauty Studio

Site com **React** (front), **Django** (API) e **PostgreSQL** (banco).

```
Meive-Beauty-Studio/
├── .env.example        ← modelo das variáveis (copie para .env)
├── database/
│   └── setup.sql       ← cria tabelas, serviços e permissões do banco
├── client/             ← React (Vite)
└── server/             ← Django (manage.py fica aqui)
    └── requirements.txt
```

## O que instalar antes

| Programa | Versão | Observação |
|---|---|---|
| Git | qualquer | |
| Python | 3.12 ou superior | marque "Add Python to PATH" na instalação |
| Node.js | 20 ou superior (LTS) | já inclui o `npm` |
| PostgreSQL | 16 ou superior | guarde a senha do usuário `postgres` que você definir na instalação |

## 1. Baixar o projeto

```powershell
git clone <endereço-do-repositório>
cd Meive-Beauty-Studio
```

## 2. Banco de dados

Use o `psql` do PostgreSQL. No Windows ele fica em
`C:\Program Files\PostgreSQL\<versão>\bin\psql.exe` (troque `<versão>` pela sua, ex.: 18).
Nos comandos abaixo, `psql` significa esse caminho completo, por exemplo:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1
```

### 2A. Criar o banco e o usuário da aplicação

Entre como `postgres` (ele pede a senha que você definiu ao instalar):

```powershell
psql -U postgres -h 127.0.0.1
```

Dentro do `psql`, rode (troque a senha por uma sua, só letras e números é mais seguro de digitar):

```sql
CREATE DATABASE meive_beauty ENCODING 'UTF8' TEMPLATE template0;
CREATE USER app_meive WITH PASSWORD 'SUA_SENHA_AQUI';
GRANT CONNECT ON DATABASE meive_beauty TO app_meive;
\q
```

### 2B. Criar as tabelas e carregar os serviços

Na pasta do projeto (a que tem a pasta `database`):

```powershell
psql -U postgres -h 127.0.0.1 -d meive_beauty -f database/setup.sql
```

No final deve aparecer a contagem: `CÍLIOS 10`, `SOBRANCELHAS 7` e `UNHAS 9`.

Rode **uma vez só**, em banco vazio. Para recomeçar do zero, apague e recrie o banco:
`DROP DATABASE meive_beauty;` e repita os passos 2A e 2B.

> Se o `psql` mostrar um aviso sobre "página de código", pode ignorar (é só sobre acentos no terminal).

## 3. Arquivo `.env`

Copie o modelo e preencha com os seus dados:

```powershell
Copy-Item .env.example .env
```

Abra o `.env` e coloque a senha do `app_meive` que você criou no passo 2A em `DB_PASSWORD`.
O `DB_NAME` deve ser o nome do banco que você criou (`meive_beauty`).
Mantenha `DEBUG=True` (é o que liga o modo de desenvolvimento no seu computador; online ele fica desligado).

O `EMAIL_HOST_PASSWORD` só é necessário para o envio de e-mails (agendamento). Peça a senha de app do
Gmail para quem configurou o projeto, **por mensagem privada, nunca pelo Git**. Sem ela, o resto do site funciona.

**O `.env` nunca vai para o Git** (já está no `.gitignore`). Cada pessoa tem o seu.

## 4. Backend (Django)

```powershell
cd server
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- O `migrate` cria só as tabelas internas do Django (as tabelas do negócio já vieram do `setup.sql`).
- O `createsuperuser` pede e-mail, nome e senha e cria o seu administrador, que entra no painel
  `http://127.0.0.1:8000/admin/` com o **e-mail** e a senha.
- Deixe esse terminal aberto. O servidor roda em `http://127.0.0.1:8000`.

## 5. Frontend (React)

Em **outro terminal**:

```powershell
cd client
npm install
npm run dev
```

Abra o endereço que o terminal mostrar (normalmente `http://localhost:5173`).

Os dois terminais (Django e React) precisam ficar ligados ao mesmo tempo.

## 6. Conferindo se está tudo certo

- `http://127.0.0.1:8000/api/servicos/` mostra os serviços em JSON.
- `http://127.0.0.1:8000/admin/` abre o painel e aceita o seu login.
- No site, a seção de serviços carrega os cards e a tela de login entra com um usuário cadastrado.

## Colocar o site online

Veja o passo a passo no [`DEPLOY.md`](DEPLOY.md).

## Problemas comuns

| Mensagem ou sintoma | Causa e solução |
|---|---|
| `autenticação do tipo senha falhou para o usuário "app_meive"` | A senha do `.env` não é a que você criou no passo 2A. Para trocar: `ALTER USER app_meive WITH PASSWORD 'nova';` como `postgres`, e atualize o `.env` |
| `database "..." does not exist` | O `DB_NAME` do `.env` é diferente do banco criado |
| `permissão negada para tabela usuario` ou `permission denied for schema public` | O `setup.sql` não foi rodado até o fim. Rode de novo em banco vazio |
| `Defina SECRET_KEY nas variáveis de ambiente` | Falta a linha `DEBUG=True` no seu `.env` (veja o `.env.example`) |
| `No module named 'dotenv'` (ou outro módulo) | Falta `pip install -r requirements.txt`, dentro da pasta `server` |
| `manage.py` não encontrado | Você não está na pasta `server` |
| Site mostra "Não foi possível carregar os serviços" | O Django não está rodando, ou deu erro ao iniciar |
| Erro de conexão no `psql` | O serviço do PostgreSQL está parado. Abra `services.msc` e inicie `postgresql-x64-XX` |

## Regras do time

- **Nunca** commitar o `.env`, senhas ou a pasta `node_modules`.
- **Mudou alguma tabela?** As tabelas do negócio são criadas pelo `database/setup.sql` (o Django só lê e escreve nelas).
  Atualize o `setup.sql`, atualize o `models.py` e **avise o grupo** com o comando SQL da mudança,
  para todo mundo aplicar no banco local (ex.: `ALTER TABLE ...`).
- Os arquivos de `server/meive_app/migrations/` **precisam estar no Git**. Sem eles, o `migrate` falha na máquina de quem baixou o projeto.
- Cuidado com o `python manage.py inspectdb > ...`: ele sobrescreve o `models.py` e apaga o modelo customizado de `Usuario`.

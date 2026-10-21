# Colocar o Meive Beauty Studio online

O site tem três peças, e cada uma fica em um serviço diferente:

```
Visitante → Netlify (site React) → Render (API Django) → Neon (banco PostgreSQL)
```

> Os preços e limites abaixo foram conferidos em outubro de 2026 nas páginas dos próprios serviços e em
> comparativos recentes. Mudam com frequência: **confirme nas páginas de preços antes de contratar.**

## Custos e limites que importam para este projeto

| Peça | Serviço | Plano gratuito | Para uso real com clientes |
|---|---|---|---|
| Site (React) | Netlify | Uso comercial permitido, 100 GB de tráfego por mês | O gratuito costuma bastar |
| API (Django) | Render | Dorme após 15 min sem acesso e leva cerca de 1 min para acordar. **Bloqueia o envio de e-mail por SMTP**, então o formulário de contato não envia e-mail | Plano pago a partir de cerca de US$ 7/mês: fica sempre ligado e libera o e-mail |
| Banco | Neon | Sem prazo de validade, cerca de 1 GB, suspende após 5 min parado (o 1º acesso depois disso é mais lento) | Plano pago com backup (cobrança por uso) |

Não use o PostgreSQL gratuito do Render: ele **expira em 30 dias** e não tem backup.
Também evite o plano gratuito da Vercel para o site, porque ele é só para uso não comercial.
(O Cloudflare Pages é uma alternativa ao Netlify, também com uso comercial permitido.)

**Sugestão:** para a apresentação, tudo gratuito. Antes de atender clientes de verdade, suba a API para o plano
pago e o banco para um plano com backup.

---

## 0. Antes de começar (no seu computador)

1. Copie os arquivos novos por cima do projeto e faça o commit.
2. No `.env` local, acrescente a linha `DEBUG=True` (sem ela o Django local não liga).
3. Instale as dependências novas, na pasta `server`: `pip install -r requirements.txt`.
4. Teste local: `python manage.py check`, depois `python manage.py runserver` e `npm run dev` na pasta `client`.
5. Apague os restos de um projeto antigo, que só atrapalham a hospedagem:
   - `server/package.json`, `server/package-lock.json` e `server/index.js` (um servidor Node/Mongo que não é usado)
   - `client/src/components/ProtectedRoute.jsx` (duplicado e sem uso) e `client/App-antigo.jsx`

## 1. Banco no Neon

1. Crie uma conta em neon.com e um projeto (ex.: `meive-beauty`). Escolha uma região próxima da que vai usar no Render.
2. No painel do projeto, abra a janela de conexão (botão **Connect**) e copie a *connection string*, que começa com
   `postgresql://`. Ela contém a senha do banco: trate como segredo e prefira a versão sem "pooler" (conexão direta).
3. Crie as tabelas e carregue os serviços. No PowerShell, na raiz do projeto:

```powershell
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
& $psql "COLE_AQUI_A_STRING_DO_NEON" -f database/setup.sql
```

No final deve aparecer `CÍLIOS 10`, `SOBRANCELHAS 7` e `UNHAS 9`. (Se preferir, cole o conteúdo do
`database/setup.sql` no editor SQL do Neon.) Rode **uma vez só**.

## 2. API no Render

1. Crie uma conta no render.com, escolha **New > Web Service** e conecte o repositório do GitHub.
2. Configure:

| Campo | Valor |
|---|---|
| Language | Python 3 |
| Root Directory | `server` |
| Build Command | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate --noinput` |
| Start Command | `gunicorn core.wsgi:application` |
| Instance Type | Free (apresentação) ou o plano pago mais barato (uso real) |

3. Em **Environment**, crie as variáveis:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a string do Neon (passo 1) |
| `SECRET_KEY` | uma chave nova, gerada com `python -c "import secrets; print(secrets.token_urlsafe(50))"`. **Não reaproveite** a chave que estava no código |
| `DEBUG` | `False` |
| `PYTHON_VERSION` | a sua versão do Python, completa (rode `python --version`; ex.: `3.12.8`) |
| `CORS_ALLOWED_ORIGINS` | o endereço do site no Netlify (preencha no passo 3) |
| `EMAIL_HOST_PASSWORD` | senha de app do Gmail (só envia no plano pago do Render) |

O Render informa sozinho o endereço do serviço, então não precisa mexer em `ALLOWED_HOSTS`.
Se usar domínio próprio na API, acrescente `ALLOWED_HOSTS=api.seudominio.com.br`.

4. Faça o deploy e abra `https://SEU-SERVICO.onrender.com/api/servicos/`. Devem aparecer os 26 serviços em JSON.
   Na versão gratuita, o primeiro acesso pode demorar cerca de 1 minuto.

## 3. Site no Netlify

1. Crie uma conta no netlify.com, escolha **Add new site > Import an existing project** e conecte o repositório.
   As configurações de build já estão no arquivo `netlify.toml` da raiz.
2. Em **Site configuration > Environment variables**, crie:
   - `VITE_API_URL` = `https://SEU-SERVICO.onrender.com/api`

   Essa variável é lida na hora do build: se mudar depois, faça um novo deploy.
3. Faça o deploy e copie o endereço do site (algo como `https://nome.netlify.app`).
4. Volte ao Render e coloque esse endereço (sem barra no final) em `CORS_ALLOWED_ORIGINS`. O serviço reinicia sozinho.

## 4. Criar o administrador no banco online

O plano gratuito do Render não tem terminal, então crie o administrador no seu computador, apontando para o banco do Neon.
Na pasta `server`:

```powershell
$env:DATABASE_URL = "COLE_AQUI_A_STRING_DO_NEON"
python manage.py createsuperuser
Remove-Item Env:DATABASE_URL
```

Informe e-mail, nome e senha forte. Com ele você entra no painel do site em `/admin/login` (e em
`https://SEU-SERVICO.onrender.com/admin/`).

## 5. Checklist final

- [ ] A seção de serviços do site carrega os cards.
- [ ] Cadastro de uma conta de teste funciona e leva para `/minha-conta`.
- [ ] Login e logout funcionam. Uma senha errada mostra "E-mail ou senha incorretos."
- [ ] Abrir direto `/login` ou `/cadastro` no navegador (atualizar a página) não dá erro 404.
- [ ] `/admin/login` aceita o administrador e **recusa** uma conta de cliente.
- [ ] O formulário de contato avisa o resultado (o e-mail só chega no plano pago do Render).
- [ ] `https://SEU-SERVICO.onrender.com/api/agendamentos/` sem login responde 401 ou 403.
- [ ] Nenhuma senha, chave ou `.env` aparece no GitHub.

## Domínio próprio (opcional)

Compre o domínio em um registro de sua preferência e configure no Netlify (site) e, se quiser, no Render (API).
Depois atualize `CORS_ALLOWED_ORIGINS` (e `ALLOWED_HOSTS`, se mudar o endereço da API) e o `VITE_API_URL`.

## O que ainda não está pronto para clientes reais

- A área `/minha-conta` e as telas do painel de administração ainda mostram dados de exemplo. O **login** delas já é de verdade.
- Agendamentos, matrículas e avaliações só podem ser acessados por administrador pela API. A versão em que cada cliente vê só os seus vem
  junto com a tela de agendamento.
- Backup do banco: confirme que o plano escolhido faz backup e teste restaurar.
- O site coleta nome, e-mail e telefone: vale publicar uma política de privacidade (LGPD).

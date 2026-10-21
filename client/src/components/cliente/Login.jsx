import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import heroImg from "../../assets/Cilios1.jpeg";
import { login } from "../../auth";


function IconeOlho({ aberto }) {
  return aberto ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.77 19.77 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a19.86 19.86 0 0 1-3.17 4.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [modoEsqueci, setModoEsqueci] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setEnviando(true);
    try {
      await login(email, senha);
      navigate("/minha-conta");
    } catch (err) {
      if (err.status === 401) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Não foi possível entrar agora. Tente novamente em instantes.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function trocarSenha(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setEnviando(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/recuperar-senha/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: novaSenha }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.erro || "Erro ao alterar senha");

      setSucesso("Senha alterada com sucesso! Faça login com a nova senha.");
      setModoEsqueci(false); // Volta para a tela de login
      setSenha("");
      setNovaSenha("");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-container">
      <div
        className="login-banner-side"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="login-banner-overlay"></div>

        <Link to="/" className="login-brand" style={{ textDecoration: "none" }}>
          <span className="logo-main">MEIVE</span>
          <span className="logo-sub">BEAUTY STUDIO</span>
        </Link>

        <div className="login-quote-container">
          <h1 className="login-quote-title">
            "BEAUTY IS <br />
            <span className="quote-highlight">AN ATTITUDE.</span>"
          </h1>
          <p className="login-quote-footer">
            Transformando olhares através da Minha Arte.
          </p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrapper">
          <div className="login-header">
            <span className="login-tag">— ÁREA MEIVE GIRL</span>
            <h2>
              {modoEsqueci ? (
                <>
                  RECUPERAR
                  <br />
                  SENHA.
                </>
              ) : (
                <>
                  BEM-VINDA
                  <br />
                  DE VOLTA.
                </>
              )}
            </h2>
            <p>
              {modoEsqueci
                ? "Informe seu e-mail e defina uma nova senha."
                : "Entre para gerenciar seus horários, pedidos e favoritos."}
            </p>
          </div>

          {!modoEsqueci ? (
            /* --- FORMULÁRIO DE LOGIN --- */
            <form className="login-form" onSubmit={entrar}>
              <div className="login-field">
                <label>E-MAIL</label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-field">
                <div className="field-top-label">
                  <label>SENHA</label>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    onClick={() => {
                      setModoEsqueci(true);
                      setErro(null);
                      setSucesso(null);
                    }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setMostrarSenha((v) => !v)}
                    aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                  >
                    <IconeOlho aberto={mostrarSenha} />
                  </button>
                </div>
              </div>

              {erro && (
                <p className="login-error" role="alert" style={{ color: "#b3261e", fontSize: "0.85rem", margin: 0 }}>
                  {erro}
                </p>
              )}

              {sucesso && (
                <p className="login-success" role="alert" style={{ color: "#2e7d32", fontSize: "0.85rem", margin: 0 }}>
                  {sucesso}
                </p>
              )}

              <button type="submit" className="login-submit-btn" disabled={enviando}>
                {enviando ? "ENTRANDO..." : "ENTRAR"} <span>→</span>
              </button>
            </form>
          ) : (
            /* --- FORMULÁRIO DE RECUPERAÇÃO DE SENHA --- */
            <form className="login-form" onSubmit={trocarSenha}>
              <div className="login-field">
                <label>E-MAIL CADASTRADO</label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-field">
                <label>NOVA SENHA</label>
                <div className="login-input-wrapper">
                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setMostrarNovaSenha((v) => !v)}
                    aria-label={mostrarNovaSenha ? "Esconder senha" : "Mostrar senha"}
                  >
                    <IconeOlho aberto={mostrarNovaSenha} />
                  </button>
                </div>
              </div>

              {erro && (
                <p className="login-error" role="alert" style={{ color: "#b3261e", fontSize: "0.85rem", margin: 0 }}>
                  {erro}
                </p>
              )}

              <button type="submit" className="login-submit-btn" disabled={enviando}>
                {enviando ? "ALTERANDO..." : "ATUALIZAR SENHA"} <span>→</span>
              </button>

              <button
                type="button"
                className="forgot-link"
                style={{ background: "none", border: "none", cursor: "pointer", marginTop: "1rem", textAlign: "center", width: "100%" }}
                onClick={() => {
                  setModoEsqueci(false);
                  setErro(null);
                  setSucesso(null);
                }}
              >
                ← Voltar para o Login
              </button>
            </form>
          )}

          {!modoEsqueci && (
            <>
              <div className="login-divider">
                <span>OU</span>
              </div>

              <button type="button" className="google-login-btn">
                CONTINUAR COM GOOGLE
              </button>
            </>
          )}

          <div className="login-footer-links">
            <p>
              Ainda não é uma Meive Girl?{" "}
              <Link to="/cadastro">Criar conta</Link>
            </p>
            <Link
              to="/admin/login"
              className="admin-link"
              style={{ textDecoration: "none" }}
            >
              ACESSO ADMINISTRATIVO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import heroImg from "../../assets/Cilios1.jpeg";

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
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
              BEM-VINDA
              <br />
              DE VOLTA.
            </h2>
            <p>Entre para gerenciar seus horários, pedidos e favoritos.</p>
          </div>

          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/minha-conta");
            }}
          >
            <div className="login-field">
              <label>E-MAIL</label>
              <input type="email" placeholder="voce@email.com" required />
            </div>

            <div className="login-field">
              <div className="field-top-label">
                <label>SENHA</label>
                <a href="#esqueci" className="forgot-link">
                  Esqueci minha senha
                </a>
              </div>
              <div className="login-input-wrapper">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="current-password"
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

            <button type="submit" className="login-submit-btn">
              ENTRAR <span>→</span>
            </button>
          </form>

          <div className="login-divider">
            <span>OU</span>
          </div>

          <button type="button" className="google-login-btn">
            CONTINUAR COM GOOGLE
          </button>

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
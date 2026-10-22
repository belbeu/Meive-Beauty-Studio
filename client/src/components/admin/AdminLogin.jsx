import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./AdminLogin.css";
import heroImg from "../../assets/fotoAdm.jpeg"; 

// Componente do ícone do olhinho (mesmo padrão do login de usuário)
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

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false); // Estado para o olhinho

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked || enviando) return;

    setError("");
    setEnviando(true);

    try {
      const result = await loginAdmin(email, password);

      if (result.success) {
        navigate("/admin/dashboard");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsBlocked(true);
          setError("Muitas tentativas falhas. Acesso temporariamente bloqueado por segurança.");
        } else {
          setError(`${result.message} (Tentativa ${newAttempts} de 3)`);
        }
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-container">
      <div
        className="login-banner-side"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="login-banner-overlay"></div>

        <Link to="/" className="login-brand" style={{ textDecoration: "none" }}>
          <span className="logo-main">MEIVE</span>
          <span className="logo-sub" style={{ color: "#ad1838" }}>BEAUTY STUDIO</span>
        </Link>

        <div className="login-quote-container">
          <h1 className="login-quote-title">
            "RESTRICTED <br />
            <span className="quote-highlight">ACCESS.</span>"
          </h1>
          <p className="login-quote-footer">
            Painel de gestão exclusiva para administração de produtos, clientes e dados do Studio.
          </p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrapper">
          <div className="login-header">
            <span className="login-tag">— ACESSO RESTRITO</span>
            <h2>
              PAINEL
              <br />
              ADMINISTRATIVO.
            </h2>
            <p>Entre com suas credenciais de gestora autorizada.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label>E-MAIL INSTITUCIONAL</label>
              <input
                type="email"
                placeholder="admin@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isBlocked || enviando}
              />
            </div>

            <div className="login-field">
              <div className="field-top-label">
                <label>SENHA DE ACESSO</label>
                <a href="#esqueci" className="forgot-link">
                  Esqueci minha senha
                </a>
              </div>
              
              {/* Wrapper do input com o botão do olhinho integrado */}
              <div className="login-input-wrapper">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isBlocked || enviando}
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

            <button type="submit" className="login-submit-btn" disabled={isBlocked || enviando}>
              {isBlocked 
                ? "ACESSO BLOQUEADO" 
                : enviando 
                  ? "ACESSANDO..." 
                  : <>ACESSAR PAINEL <span>→</span></>}
            </button>
          </form>

          <div className="login-footer-links">
            <p>
              Não é administradora?{" "}
              <Link to="/login">Voltar para o site</Link>
            </p>
            <Link to="/" className="admin-link" style={{ textDecoration: "none" }}>
              ← VOLTAR PARA A PÁGINA INICIAL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
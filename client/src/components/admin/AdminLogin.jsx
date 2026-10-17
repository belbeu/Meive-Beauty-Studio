import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./AdminLogin.css";
import heroImg from "../../assets/fotoAdm.jpeg"; 

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

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
                disabled={isBlocked}
              />
            </div>

            <div className="login-field">
              <div className="field-top-label">
                <label>SENHA DE ACESSO</label>
                <a href="#esqueci" className="forgot-link">
                  Esqueci minha senha
                </a>
              </div>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isBlocked}
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={isBlocked}>
              {isBlocked ? "ACESSO BLOQUEADO" : <>ACESSAR PAINEL <span>→</span></>}
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
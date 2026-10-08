import { Link } from "react-router-dom";
import "./Login.css";
import heroImg from "../assets/Cilios1.jpeg";

export default function Login() {
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

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
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
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
              />
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
            <a href="#admin" className="admin-link">
              ACESSO ADMINISTRATIVO
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import "./Cadastro.css";
import heroImg from "../assets/Cilios1.jpeg";

export default function Cadastro() {
  const navigate = useNavigate();

  const handleCadastro = (e) => {
    e.preventDefault();
    // adicionar a lógica real do cadastro.
    navigate("/login");
  };

  return (
    <div className="cadastro-container">
      <div
        className="cadastro-banner-side"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="cadastro-banner-overlay"></div>

        <Link
          to="/"
          className="cadastro-brand"
          style={{ textDecoration: "none" }}
        >
          <span className="logo-main">MEIVE</span>
          <span className="logo-sub">BEAUTY STUDIO</span>
        </Link>

        <div className="cadastro-quote-container">
          <h1 className="cadastro-quote-title">
            "BEAUTY IS <br />
            <span className="quote-highlight">AN ATTITUDE.</span>"
          </h1>
          <p className="cadastro-quote-footer">
            Transformando olhares através da Minha Arte.
          </p>
        </div>
      </div>

      <div className="cadastro-form-side">
        <div className="cadastro-form-wrapper">
          <div className="cadastro-header">
            <span className="cadastro-tag">— ÁREA MEIVE GIRL</span>
            <h2>CRIE SUA CONTA.</h2>
            <p>Cadastre-se para agendar e acompanhar seus pedidos.</p>
          </div>

          <form className="cadastro-form" onSubmit={handleCadastro}>
            <div className="cadastro-field">
              <label>SEU NOME</label>
              <input
                type="text"
                placeholder="Como podemos te chamar?"
                required
              />
            </div>

            <div className="cadastro-field">
              <label>E-MAIL</label>
              <input type="email" placeholder="voce@email.com" required />
            </div>

            <div className="cadastro-field">
              <label>SENHA</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <button type="submit" className="cadastro-submit-btn">
              CRIAR MINHA CONTA <span>→</span>
            </button>
          </form>

          <div className="cadastro-divider">
            <span>ou</span>
          </div>

          <button type="button" className="google-cadastro-btn">
            CONTINUAR COM GOOGLE
          </button>

          <div className="cadastro-footer-links">
            <p>
              Já é uma Meive Girl? <Link to="/login">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

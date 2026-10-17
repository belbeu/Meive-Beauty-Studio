import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Cadastro.css";
import heroImg from "../../assets/Cilios1.jpeg";

const requisitos = [
  { id: "tamanho", texto: "Mínimo de 8 caracteres", teste: (s) => s.length >= 8 },
  { id: "numero", texto: "Pelo menos um número", teste: (s) => /\d/.test(s) },
  {
    id: "especial",
    texto: "Pelo menos um caractere especial (!@#$%&*...)",
    teste: (s) => /[^A-Za-z0-9\s]/.test(s),
  },
];

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

export default function Cadastro() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [senhaFocada, setSenhaFocada] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const senhaValida = requisitos.every((r) => r.teste(senha));
  const senhasIguais = senha === confirmarSenha;
  const mostrarRequisitos = senhaFocada || (tentouEnviar && !senhaValida);
  const mostrarErroConfirmacao =
    confirmarSenha.length > 0 && !senhasIguais;

  const handleCadastro = (e) => {
    e.preventDefault();
    setTentouEnviar(true);

    if (!senhaValida || !senhasIguais) return;

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

          <form className="cadastro-form" onSubmit={handleCadastro} noValidate>
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

            {/* SENHA */}
            <div className="cadastro-field">
              <label>SENHA</label>
              <div className="cadastro-input-wrapper">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onFocus={() => setSenhaFocada(true)}
                  onBlur={() => setSenhaFocada(false)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="cadastro-eye-btn"
                  onMouseDown={(e) => e.preventDefault()} /* não tira o foco do input */
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                >
                  <IconeOlho aberto={mostrarSenha} />
                </button>
              </div>

              <ul
                className={`senha-requisitos ${
                  mostrarRequisitos ? "aberto" : ""
                }`}
              >
                {requisitos.map((r) => {
                  const ok = r.teste(senha);
                  return (
                    <li key={r.id} className={ok ? "ok" : ""}>
                      <span className="req-icone">{ok ? "✓" : "○"}</span>
                      {r.texto}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* CONFIRMAR SENHA */}
            <div className="cadastro-field">
              <label>CONFIRMAR SENHA</label>
              <div className="cadastro-input-wrapper">
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                  className={mostrarErroConfirmacao ? "input-erro" : ""}
                  required
                />
                <button
                  type="button"
                  className="cadastro-eye-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setMostrarConfirmar((v) => !v)}
                  aria-label={
                    mostrarConfirmar ? "Esconder senha" : "Mostrar senha"
                  }
                >
                  <IconeOlho aberto={mostrarConfirmar} />
                </button>
              </div>

              {mostrarErroConfirmacao && (
                <span className="cadastro-msg-erro">
                  As senhas não coincidem.
                </span>
              )}
              {confirmarSenha.length > 0 && senhasIguais && senhaValida && (
                <span className="cadastro-msg-ok">✓ As senhas coincidem.</span>
              )}
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
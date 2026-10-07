import React, { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [nomeServicoLabel, setNomeServicoLabel] = useState("Selecione uma opção");

  const selecionarServico = (valor, label) => {
    setServicoSelecionado(valor);
    setNomeServicoLabel(label);
    setIsOpen(false);
  };

  return (
    <section id="contato" className="contact-section">
      <div className="contact-header">
        <span className="contact-subtitle">AGENDAMENTO</span>
        <h2 className="contact-title">
          <span>BORA</span> <span>AGENDAR?</span>
          <span style={{ fontFamily: '"DM Sans", sans-serif', color: "#ada9b1", fontSize: "15px" }}>
            Entre em contato e retornamos em até 1 hora.
          </span>
        </h2>
      </div>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">SEU NOME</label>
              <input type="text" id="nome" placeholder="Digite seu nome" required />
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">SEU WHATSAPP</label>
              <input type="text" id="whatsapp" placeholder="(11) 94487-4969" required />
            </div>
          </div>

          <div className="form-group">
            <div className="form-group custom-select-container">
              <label htmlFor="servico">QUAL SERVIÇO VOCÊ DESEJA?</label>
              <div
                className={`custom-select-trigger ${servicoSelecionado ? "selected" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span>{nomeServicoLabel}</span>
                <svg
                  className={`select-arrow ${isOpen ? "open" : ""}`}
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              <input type="hidden" name="servico" value={servicoSelecionado} required />

              {isOpen && (
                <div className="custom-options-list">
                  <div className="custom-option" onClick={() => selecionarServico("volume-russo", "Volume Russo (R$ 280)")}>
                    Volume Russo (R$ 280)
                  </div>
                  <div className="custom-option" onClick={() => selecionarServico("fio-a-fio", "Fio a Fio (R$ 180)")}>
                    Fio a Fio (R$ 180)
                  </div>
                  <div className="custom-option" onClick={() => selecionarServico("hibrido", "Híbrido (R$ 230)")}>
                    Híbrido (R$ 230)
                  </div>
                  <div className="custom-option" onClick={() => selecionarServico("manutencao", "Manutenção (A partir de R$ 100)")}>
                    Manutenção (A partir de R$ 100)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">MENSAGEM</label>
            <textarea id="mensagem" rows="4" placeholder="Como podemos te ajudar?" required></textarea>
          </div>

          <button type="submit" className="primary-button submit-btn">
            ENVIAR MENSAGEM
          </button>
        </form>
      </div>
    </section>
  );
}
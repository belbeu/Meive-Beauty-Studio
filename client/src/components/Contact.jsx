import React, { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [nomeServicoLabel, setNomeServicoLabel] =
    useState("Selecione uma opção");

  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  // Máscara do WhatsApp
  const formatarWhatsapp = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      return numeros.length ? `(${numeros}` : "";
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7
    )}-${numeros.slice(7)}`;
  };

  const selecionarServico = (valor, label) => {
    setServicoSelecionado(valor);
    setNomeServicoLabel(label);
    setIsOpen(false);
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");

    if (!servicoSelecionado) {
      setErro("Selecione um serviço antes de enviar.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/agendar/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            whatsapp,
            servico: nomeServicoLabel,
            mensagem,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensagem || "Não foi possível enviar a mensagem."
        );
      }

      // Mostra a tela de confirmação
      setEnviado(true);

      // Limpa o formulário
      setNome("");
      setWhatsapp("");
      setMensagem("");
      setServicoSelecionado("");
      setNomeServicoLabel("Selecione uma opção");
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);

      setErro(
        error.message ||
          "Ocorreu um erro ao enviar sua mensagem. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section id="contato" className="contact-section">
      <div className="contact-header">
        <span className="contact-subtitle">AGENDAMENTO</span>

        <h2 className="contact-title">
          <span>BORA</span> <span>AGENDAR?</span>

          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              color: "#ada9b1",
              fontSize: "15px",
            }}
          >
            Entre em contato e retornamos em até 1 hora.
          </span>
        </h2>
      </div>

      <div className="contact-grid">
        {!enviado ? (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">SEU NOME</label>

                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">SEU WHATSAPP</label>

                <input
                  type="tel"
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) =>
                    setWhatsapp(formatarWhatsapp(e.target.value))
                  }
                  placeholder="(11) 94487-4969"
                  maxLength="15"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-group custom-select-container">
                <label htmlFor="servico">
                  QUAL SERVIÇO VOCÊ DESEJA?
                </label>

                <div
                  className={`custom-select-trigger ${
                    servicoSelecionado ? "selected" : ""
                  }`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span>{nomeServicoLabel}</span>

                  <svg
                    className={`select-arrow ${
                      isOpen ? "open" : ""
                    }`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                <input
                  type="hidden"
                  name="servico"
                  value={servicoSelecionado}
                />

                {isOpen && (
                  <div className="custom-options-list">
                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico(
                          "volume-russo",
                          "Volume Russo (R$ 280)"
                        )
                      }
                    >
                      Volume Russo (R$ 280)
                    </div>

                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico(
                          "fio-a-fio",
                          "Fio a Fio (R$ 180)"
                        )
                      }
                    >
                      Fio a Fio (R$ 180)
                    </div>

                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico(
                          "hibrido",
                          "Híbrido (R$ 230)"
                        )
                      }
                    >
                      Híbrido (R$ 230)
                    </div>

                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico(
                          "manutencao",
                          "Manutenção (A partir de R$ 100)"
                        )
                      }
                    >
                      Manutenção (A partir de R$ 100)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">MENSAGEM</label>

              <textarea
                id="mensagem"
                rows="4"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Como podemos te ajudar?"
                required
              />
            </div>

            {erro && <p className="form-error">{erro}</p>}

            <button
              type="submit"
              className="primary-button submit-btn"
              disabled={carregando}
            >
              {carregando
                ? "ENVIANDO..."
                : "ENVIAR MENSAGEM"}
            </button>
          </form>
        ) : (
          <div className="confirmation-card">
            <div className="confirmation-icon">✓</div>

            <span className="confirmation-subtitle">
              MENSAGEM ENVIADA
            </span>

            <h3>Tudo certo!</h3>

            <p>
              Recebemos sua mensagem e entraremos em contato
              pelo WhatsApp em breve.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setEnviado(false)}
            >
              ENVIAR OUTRA MENSAGEM
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

import React, { useState } from "react";
import "./Contact.css";
import { BASE_URL } from "../api";

export default function Contact() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

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

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  };

  // Envio da mensagem
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch(`${BASE_URL}/agendar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          whatsapp,
          mensagem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensagem || "Não foi possível enviar sua mensagem."
        );
      }

      setEnviado(true);
      setNome("");
      setWhatsapp("");
      setMensagem("");

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

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
        <span className="contact-subtitle">
          FALE CONOSCO
        </span>

        <h2 className="contact-title">
          <span>VAMOS</span>
          <span>CONVERSAR?</span>

          <span className="contact-description">
            Tem alguma dúvida ou deseja saber mais sobre nossos serviços?
            Envie sua mensagem!
          </span>
        </h2>
      </div>

      <div className="contact-grid">

        {!enviado ? (

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            {/* NOME E WHATSAPP */}
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="nome">
                  SEU NOME
                </label>

                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  maxLength="150"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">
                  SEU WHATSAPP
                </label>

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

            {/* MENSAGEM */}
            <div className="form-group">

              <label htmlFor="mensagem">
                SUA MENSAGEM
              </label>

              <textarea
                id="mensagem"
                rows="5"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva sua mensagem aqui. Como podemos ajudar?"
                maxLength="2000"
                required
              />

            </div>

            {erro && (
              <p className="form-error">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="primary-button submit-btn"
              disabled={carregando}
            >
              {carregando ? "ENVIANDO..." : "ENVIAR MENSAGEM"}
            </button>

          </form>

        ) : (

          <div className="confirmation-card">

            <div className="confirmation-icon">
              ✓
            </div>

            <span className="confirmation-subtitle">
              MENSAGEM ENVIADA
            </span>

            <h3>Tudo certo!</h3>

            <p>
              Recebemos sua mensagem! Em breve,
              nossa equipe entrará em contato com você.
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

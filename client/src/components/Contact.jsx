import React, { useState } from "react";
import "./Contact.css";

// ==========================================================
// SERVIÇOS DO MEVIE
// ==========================================================

const categoriasServicos = {
  LASH: [
    {
      valor: "teste-alergico",
      nome: "Teste Alérgico — Extensão de Cílios",
    },
    {
      valor: "remocao-cilios",
      nome: "Remoção de Cílios",
      preco: "R$ 40,00",
    },
    {
      valor: "manutencao-lash",
      nome: "Manutenção Lash",
      preco: "R$ 65,00",
    },
    {
      valor: "lash-lifting",
      nome: "Lash Lifting",
      preco: "R$ 130,00",
    },
    {
      valor: "volume-brasileiro-primeira",
      nome: "Volume Brasileiro — Primeira Aplicação",
      preco: "R$ 150,00",
    },
    {
      valor: "volume-brasileiro-manutencao",
      nome: "Volume Brasileiro — Manutenção até 25 dias",
      preco: "R$ 110,00",
    },
    {
      valor: "volume-brasileiro-marrom-primeira",
      nome: "Volume Brasileiro Marrom — Primeira Aplicação",
      preco: "R$ 150,00",
    },
    {
      valor: "volume-brasileiro-marrom-manutencao",
      nome: "Volume Brasileiro Marrom — Manutenção até 25 dias",
      preco: "R$ 110,00",
    },
    {
      valor: "efeito-fox-primeira",
      nome: "Efeito Fox — Primeira Aplicação",
      preco: "R$ 170,00",
    },
    {
      valor: "efeito-fox-manutencao",
      nome: "Efeito Fox — Manutenção até 25 dias",
      preco: "R$ 130,00",
    },
    {
      valor: "efeito-wispy-primeira",
      nome: "Efeito Wispy — Primeira Aplicação",
      preco: "R$ 180,00",
    },
    {
      valor: "efeito-wispy-manutencao",
      nome: "Efeito Wispy — Manutenção até 25 dias",
      preco: "R$ 140,00",
    },
    {
      valor: "efeito-glamour-primeira",
      nome: "Efeito Glamour/Egípcio — Primeira Aplicação",
      preco: "R$ 160,00",
    },
    {
      valor: "efeito-glamour-manutencao",
      nome: "Efeito Glamour/Egípcio — Manutenção até 25 dias",
      preco: "R$ 120,00",
    },
    {
      valor: "efeito-rimel-primeira",
      nome: "Efeito Rímel — Primeira Aplicação",
      preco: "R$ 160,00",
    },
    {
      valor: "efeito-rimel-manutencao",
      nome: "Efeito Rímel — Manutenção até 25 dias",
      preco: "R$ 120,00",
    },
    {
      valor: "volume-5d-primeira",
      nome: "Volume 5D — Primeira Aplicação",
      preco: "R$ 160,00",
    },
    {
      valor: "volume-5d-manutencao",
      nome: "Volume 5D — Manutenção até 25 dias",
      preco: "R$ 120,00",
    },
  ],

  SOBRANCELHAS: [
    {
      valor: "manutencao-brow",
      nome: "Manutenção Brow",
      preco: "R$ 80,00",
    },
    {
      valor: "brow-lamination",
      nome: "Brow Lamination",
      preco: "R$ 130,00",
    },
    {
      valor: "design-sobrancelhas",
      nome: "Design de Sobrancelhas",
      preco: "R$ 40,00",
    },
    {
      valor: "design-buco",
      nome: "Design + Buço",
      preco: "R$ 55,00",
    },
    {
      valor: "design-coloracao",
      nome: "Design + Coloração",
      preco: "R$ 60,00",
    },
    {
      valor: "design-henna",
      nome: "Design + Henna",
      preco: "R$ 60,00",
    },
    {
      valor: "buco-linha",
      nome: "Buço na Linha",
      preco: "R$ 20,00",
    },
    {
      valor: "henna",
      nome: "Henna",
      preco: "R$ 35,00",
    },
  ],

  UNHAS: [
    {
      valor: "banho-gel-primeira",
      nome: "Banho de Gel — Primeira Aplicação",
      preco: "R$ 100,00",
    },
    {
      valor: "banho-gel-manutencao",
      nome: "Banho de Gel — Manutenção até 20 dias",
      preco: "R$ 80,00",
    },
    {
      valor: "reposicao-unha",
      nome: "Reposição de Unha (Manutenção)",
      preco: "R$ 10,00",
    },
    {
      valor: "f1-primeira",
      nome: "Alongamento no Molde F1 — Primeira Aplicação",
      preco: "R$ 120,00",
    },
    {
      valor: "f1-manutencao",
      nome: "Alongamento no Molde F1 — Manutenção até 20 dias",
      preco: "R$ 90,00",
    },
    {
      valor: "russo-primeira",
      nome: "Alongamento no Molde Russo — Primeira Aplicação",
      preco: "R$ 120,00",
    },
    {
      valor: "russo-manutencao",
      nome: "Alongamento no Molde Russo — Manutenção até 20 dias",
      preco: "R$ 90,00",
    },
    {
      valor: "mao-simples",
      nome: "Mão Simples",
      preco: "R$ 30,00",
    },
    {
      valor: "pe-simples",
      nome: "Pé Simples",
      preco: "R$ 35,00",
    },
    {
      valor: "pe-gel",
      nome: "Pé com Esmaltação em Gel",
      preco: "R$ 60,00",
    },
    {
      valor: "mao-pe-simples",
      nome: "Mão e Pé Simples",
      preco: "R$ 55,00",
    },
    {
      valor: "blindagem-primeira",
      nome: "Blindagem — Primeira Aplicação",
      preco: "R$ 70,00",
    },
    {
      valor: "blindagem-manutencao",
      nome: "Blindagem — Manutenção até 20 dias",
      preco: "R$ 50,00",
    },
  ],
};

export default function Contact() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Controle do seletor
  const [isOpen, setIsOpen] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  // ==========================================================
  // MÁSCARA DO WHATSAPP
  // ==========================================================

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

  // ==========================================================
  // SELEÇÃO DA CATEGORIA
  // ==========================================================

  const selecionarCategoria = (categoria) => {
    setCategoriaSelecionada(categoria);
    setServicoSelecionado(null);
  };

  // ==========================================================
  // SELEÇÃO DO SERVIÇO
  // ==========================================================

  const selecionarServico = (servico) => {
    setServicoSelecionado({
      ...servico,
      categoria: categoriaSelecionada,
    });

    setIsOpen(false);
  };

  // ==========================================================
  // ENVIO DO FORMULÁRIO
  // ==========================================================

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
            servico: `${servicoSelecionado.nome}${
              servicoSelecionado.preco
                ? ` (${servicoSelecionado.preco})`
                : ""
            }`,
            mensagem,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensagem ||
            "Não foi possível enviar a mensagem."
        );
      }

      setEnviado(true);

      // Limpa o formulário
      setNome("");
      setWhatsapp("");
      setMensagem("");
      setCategoriaSelecionada("");
      setServicoSelecionado(null);
      setIsOpen(false);
    } catch (error) {
      console.error(
        "Erro ao enviar formulário:",
        error
      );

      setErro(
        error.message ||
          "Ocorreu um erro ao enviar sua mensagem. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================================
  // TEXTO EXIBIDO NO SELECT
  // ==========================================================

  const textoSelect = servicoSelecionado
    ? servicoSelecionado.nome
    : categoriaSelecionada
      ? `Selecione um serviço de ${categoriaSelecionada}`
      : "Selecione uma categoria";

  return (
    <section id="contato" className="contact-section">
      <div className="contact-header">
        <span className="contact-subtitle">
          AGENDAMENTO
        </span>

        <h2 className="contact-title">
          <span>BORA</span>
          <span>AGENDAR?</span>

          <span className="contact-description">
            Entre em contato e retornamos em até 1 hora.
          </span>
        </h2>
      </div>

      <div className="contact-grid">
        {!enviado ? (
          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            {/* NOME + WHATSAPP */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">
                  SEU NOME
                </label>

                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) =>
                    setNome(e.target.value)
                  }
                  placeholder="Digite seu nome"
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
                    setWhatsapp(
                      formatarWhatsapp(
                        e.target.value
                      )
                    )
                  }
                  placeholder="(11) 94487-4969"
                  maxLength="15"
                  required
                />
              </div>
            </div>

            {/* SERVIÇO */}
            <div className="form-group">
              <label>
                QUAL SERVIÇO VOCÊ DESEJA?
              </label>

              <div className="custom-select-container">
                <div
                  className={`custom-select-trigger ${
                    servicoSelecionado
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setIsOpen(!isOpen)
                  }
                >
                  <span>{textoSelect}</span>

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

                {isOpen && (
                  <div className="custom-options-list">
                    {!categoriaSelecionada ? (
                      <>
                        <div className="select-list-title">
                          ESCOLHA UMA CATEGORIA
                        </div>

                        {Object.keys(
                          categoriasServicos
                        ).map((categoria) => (
                          <button
                            type="button"
                            className="custom-option category-option"
                            key={categoria}
                            onClick={() =>
                              selecionarCategoria(
                                categoria
                              )
                            }
                          >
                            <span>
                              {categoria}
                            </span>

                            <span className="option-arrow">
                              →
                            </span>
                          </button>
                        ))}
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="back-option"
                          onClick={() =>
                            setCategoriaSelecionada(
                              ""
                            )
                          }
                        >
                          ← VOLTAR PARA CATEGORIAS
                        </button>

                        <div className="select-list-title">
                          {categoriaSelecionada}
                        </div>

                        {categoriasServicos[
                          categoriaSelecionada
                        ].map((servico) => (
                          <button
                            type="button"
                            className="custom-option service-option"
                            key={servico.valor}
                            onClick={() =>
                              selecionarServico(
                                servico
                              )
                            }
                          >
                            <span className="service-name">
                              {servico.nome}
                            </span>

                            {servico.preco && (
                              <span className="service-price">
                                {servico.preco}
                              </span>
                            )}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <input
                type="hidden"
                name="servico"
                value={
                  servicoSelecionado?.valor || ""
                }
              />
            </div>

            {/* MENSAGEM */}
            <div className="form-group">
              <label htmlFor="mensagem">
                MENSAGEM
              </label>

              <textarea
                id="mensagem"
                rows="4"
                value={mensagem}
                onChange={(e) =>
                  setMensagem(e.target.value)
                }
                placeholder="Como podemos te ajudar?"
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
              {carregando
                ? "ENVIANDO..."
                : "ENVIAR MENSAGEM"}
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
              Recebemos sua mensagem e entraremos
              em contato pelo WhatsApp em breve.
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
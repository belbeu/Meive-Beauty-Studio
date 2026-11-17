// Salvar como: src/components/cliente/MinhasAvaliacoes.jsx
// Lista as avaliações da cliente (rota /minha-conta/avaliacoes) com editar e apagar.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClientNavbar from "./ClientNavbar";
import { EstrelasLeitura } from "./EstrelasNota";
import { estaLogado } from "../../auth";
import { avaliacaoService, traduzirErro } from "../../services/avaliacaoService";
import "./Avaliacao.css";

function formatarData(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR");
}

export default function MinhasAvaliacoes() {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState(null);
  const [sessaoExpirada, setSessaoExpirada] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro", texto }

  const [alvoExclusao, setAlvoExclusao] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!estaLogado()) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let ativo = true;
    avaliacaoService
      .listar()
      .then((lista) => {
        if (!ativo) return;
        setAvaliacoes(lista);
        setErroLista(null);
        setSessaoExpirada(false);
        setCarregando(false);
      })
      .catch((err) => {
        if (!ativo) return;
        const t = traduzirErro(err);
        setErroLista(t.geral);
        setSessaoExpirada(t.sessaoExpirada);
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativa, navigate]);

  function tentarNovamente() {
    setCarregando(true);
    setErroLista(null);
    setTentativa((n) => n + 1);
  }

  function fecharModal() {
    if (excluindo) return;
    setAlvoExclusao(null);
    setErroExclusao(null);
  }

  async function confirmarExclusao() {
    if (!alvoExclusao || excluindo) return;
    const idAlvo = alvoExclusao.id_avaliacao;

    setExcluindo(true);
    setErroExclusao(null);
    try {
      await avaliacaoService.excluir(idAlvo);
      setAvaliacoes((lista) => lista.filter((a) => a.id_avaliacao !== idAlvo));
      setAlvoExclusao(null);
      setAviso({ tipo: "ok", texto: "Avaliação apagada com sucesso." });
    } catch (err) {
      const t = traduzirErro(err);
      if (err?.status === 404) {
        // Já não existe mais: tira da lista e avisa.
        setAvaliacoes((lista) => lista.filter((a) => a.id_avaliacao !== idAlvo));
        setAlvoExclusao(null);
        setAviso({ tipo: "erro", texto: t.geral });
      } else {
        setErroExclusao(t.geral);
      }
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="client-page aval-page">
      <ClientNavbar />

      <main className="aval-container">
        <header className="aval-head aval-head--linha">
          <div>
            <span className="client-tag">
              <i className="client-tag-line" /> MINHAS AVALIAÇÕES
            </span>
            <h1 className="aval-title">
              SUAS <span>EXPERIÊNCIAS.</span>
            </h1>
            <p className="aval-sub">Veja, edite ou apague as avaliações que você enviou.</p>
          </div>
          <Link to="/minha-conta/avaliar" className="client-primary-btn aval-btn-link">
            + NOVA AVALIAÇÃO
          </Link>
        </header>

        {aviso && (
          <div
            className={`aval-banner aval-banner--${aviso.tipo === "ok" ? "ok" : "erro"}`}
            role={aviso.tipo === "ok" ? "status" : "alert"}
          >
            <span>{aviso.texto}</span>
            <button type="button" className="aval-banner-fechar" aria-label="Fechar aviso" onClick={() => setAviso(null)}>
              ×
            </button>
          </div>
        )}

        {carregando ? (
          <p className="aval-estado" role="status">
            Carregando suas avaliações...
          </p>
        ) : erroLista ? (
          <div className="aval-card aval-vazio">
            <div className="aval-banner aval-banner--erro" role="alert">
              <span>{erroLista}</span>
            </div>
            {sessaoExpirada ? (
              <Link to="/login" className="client-primary-btn aval-btn-link">
                ENTRAR
              </Link>
            ) : (
              <button type="button" className="client-primary-btn" onClick={tentarNovamente}>
                TENTAR NOVAMENTE
              </button>
            )}
          </div>
        ) : avaliacoes.length === 0 ? (
          <div className="aval-card aval-vazio">
            <strong>Você ainda não enviou nenhuma avaliação</strong>
            <span>Conte para a gente como foi a sua experiência.</span>
            <Link to="/minha-conta/avaliar" className="client-primary-btn aval-btn-link">
              AVALIAR AGORA
            </Link>
          </div>
        ) : (
          <ul className="aval-lista">
            {avaliacoes.map((a) => {
              const criada = formatarData(a.criado_em);
              const editada = formatarData(a.atualizado_em);
              return (
                <li key={a.id_avaliacao} className="aval-item">
                  <div className="aval-item-topo">
                    <EstrelasLeitura nota={a.nota} />
                    <span className="aval-item-data">
                      {criada && `Enviada em ${criada}`}
                      {editada && ` · editada em ${editada}`}
                    </span>
                    {a.anonima && <span className="aval-selo">ANÔNIMA</span>}
                  </div>

                  <p className={`aval-item-texto${a.comentario ? "" : " aval-item-texto--vazio"}`}>
                    {a.comentario || "Sem comentário."}
                  </p>

                  {a.foto_url && (
                    <a href={a.foto_url} target="_blank" rel="noopener noreferrer" className="aval-item-foto">
                      <img src={a.foto_url} alt="Foto anexada à avaliação" loading="lazy" />
                    </a>
                  )}

                  <div className="aval-item-acoes">
                    <Link to={`/minha-conta/avaliacoes/${a.id_avaliacao}/editar`} className="client-outline-btn aval-btn-link">
                      EDITAR
                    </Link>
                    <button
                      type="button"
                      className="client-outline-btn aval-btn-apagar"
                      onClick={() => {
                        setErroExclusao(null);
                        setAlvoExclusao(a);
                      }}
                    >
                      APAGAR
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {alvoExclusao && (
        <div className="client-modal-overlay">
          <div className="client-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="aval-excluir-titulo">
            <h3 id="aval-excluir-titulo">APAGAR AVALIAÇÃO?</h3>
            <p>Tem certeza de que deseja apagar esta avaliação? Essa ação não pode ser desfeita.</p>
            {erroExclusao && (
              <div className="aval-banner aval-banner--erro" role="alert">
                <span>{erroExclusao}</span>
              </div>
            )}
            <div className="client-modal-actions">
              <button type="button" className="client-outline-btn" disabled={excluindo} onClick={fecharModal}>
                CANCELAR
              </button>
              <button
                type="button"
                className="client-primary-btn"
                disabled={excluindo}
                onClick={confirmarExclusao}
              >
                {excluindo ? "APAGANDO..." : "SIM, APAGAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

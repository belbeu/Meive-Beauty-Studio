import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { avaliacaoService } from "../services/avaliacaoService";
import { estaLogado } from "../auth";
import { api } from "../api";
import { EstrelasLeitura } from "./cliente/EstrelasNota";
import "./Avaliacoes.css";

function formatarData(valor) {
  if (!valor) return "";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function iniciais(nome) {
  return (nome || "Cliente Meive")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

const ITENS_POR_PAGINA = 3;

export default function Testimonials() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    avaliacaoService.listarPublicas()
      .then((lista) => {
        if (!ativo) return;
        setAvaliacoes(lista);
        setErro(false);
      })
      .catch((error) => {
        console.error("Não foi possível carregar as avaliações públicas:", error);
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => { ativo = false; };
  }, [tentativa]);

  useEffect(() => {
    let ativo = true;
    api("/servicos/")
      .then((lista) => {
        if (ativo) setServicos(Array.isArray(lista) ? lista : lista?.results || []);
      })
      .catch((error) => {
        // A vitrine de avaliações continua funcionando mesmo se o catálogo falhar.
        console.error("Não foi possível carregar os serviços para o filtro:", error);
      });
    return () => { ativo = false; };
  }, []);

  const avaliacoesFiltradas = useMemo(() => {
    if (!servicoSelecionado) return avaliacoes;
    return avaliacoes.filter((item) => String(item.id_servico || "") === String(servicoSelecionado));
  }, [avaliacoes, servicoSelecionado]);

  useEffect(() => {
    setPaginaAtual(1);
    setFotoAtivaIndex(null);
  }, [servicoSelecionado]);

  const resumo = useMemo(() => {
    if (!avaliacoesFiltradas.length) return null;
    const media = avaliacoesFiltradas.reduce((total, item) => total + Number(item.nota || 0), 0) / avaliacoesFiltradas.length;
    return { media: media.toFixed(1).replace(".", ","), total: avaliacoesFiltradas.length };
  }, [avaliacoesFiltradas]);

  const fotosClientes = useMemo(() => {
    return avaliacoesFiltradas.filter((item) => Boolean(item.foto_url));
  }, [avaliacoesFiltradas]);

  const totalPaginas = Math.ceil(avaliacoesFiltradas.length / ITENS_POR_PAGINA);
  
  const avaliacoesPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return avaliacoesFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [avaliacoesFiltradas, paginaAtual]);

  const irParaProximaPagina = () => {
    setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas));
  };

  const irParaPaginaAnterior = () => {
    setPaginaAtual((prev) => Math.max(prev - 1, 1));
  };

  const abrirLightbox = (avaliacaoId) => {
    const index = fotosClientes.findIndex((item) => item.id_avaliacao === avaliacaoId);
    if (index !== -1) setFotoAtivaIndex(index);
  };

  const fecharLightbox = () => setFotoAtivaIndex(null);

  const proximaFoto = (e) => {
    e.stopPropagation();
    setFotoAtivaIndex((prev) => (prev + 1) % fotosClientes.length);
  };

  const fotoAnterior = (e) => {
    e.stopPropagation();
    setFotoAtivaIndex((prev) => (prev - 1 + fotosClientes.length) % fotosClientes.length);
  };

  const avaliacaoAtualLightbox = fotosClientes[fotoAtivaIndex];

  return (
    <section className="testimonials-section" id="avaliacoes">
      <div className="testimonials-heading">
        <span className="testimonials-eyebrow">A EXPERIÊNCIA DE QUEM JÁ CONHECE</span>
        <h2 className="testimonials-title">
          QUEM VIVE A MEIVE, <span>RECOMENDA.</span>
        </h2>
        <p className="testimonials-description">
          Opiniões reais compartilhadas por quem faz parte da nossa comunidade.
        </p>
      </div>

      {resumo && (
        <div className="testimonials-summary" aria-label={`Média ${resumo.media} de 5, baseada em ${resumo.total} avaliações`}>
          <strong>{resumo.media}</strong>
          <span className="testimonials-summary-stars" aria-hidden="true">★★★★★</span>
          <span>{resumo.total} {resumo.total === 1 ? "avaliação" : "avaliações"}</span>
        </div>
      )}

      {servicos.length > 0 && (
        <div className="testimonials-filter">
          <label htmlFor="testimonials-service-filter">ENCONTRE AVALIAÇÕES POR SERVIÇO</label>
          <select
            id="testimonials-service-filter"
            value={servicoSelecionado}
            onChange={(e) => setServicoSelecionado(e.target.value)}
          >
            <option value="">Todos os serviços</option>
            {servicos.map((servico) => (
              <option key={servico.id_servico} value={servico.id_servico}>
                {servico.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {carregando ? (
        <div className="testimonials-state" role="status">Carregando avaliações...</div>
      ) : erro ? (
        <div className="testimonials-state" role="alert">
          <p>Não foi possível carregar as avaliações agora.</p>
          <button type="button" onClick={() => setTentativa((n) => n + 1)}>
            TENTAR NOVAMENTE
          </button>
        </div>
      ) : avaliacoes.length === 0 ? (
        <div className="testimonials-state">
          <span className="testimonials-empty-icon" aria-hidden="true">☆</span>
          <strong>Seja a primeira a avaliar!</strong>
          <p>Quando nossas clientes compartilharem suas experiências, elas aparecerão aqui.</p>
        </div>
      ) : avaliacoesFiltradas.length === 0 ? (
        <div className="testimonials-state">
          <span className="testimonials-empty-icon" aria-hidden="true">☆</span>
          <strong>Ainda não há avaliações deste serviço.</strong>
          <p>Escolha outro serviço ou volte para visualizar todas as experiências.</p>
          <button type="button" onClick={() => setServicoSelecionado("")}>VER TODAS AS AVALIAÇÕES</button>
        </div>
      ) : (
        <>
          {fotosClientes.length > 0 && (
            <div className="client-photos-section">
              <h3 className="client-photos-title">Fotos de clientes</h3>
              <div className="client-photos-scroll">
                {fotosClientes.map((item) => (
                  <button
                    type="button"
                    key={`galeria-${item.id_avaliacao}`}
                    className="client-photo-thumb-btn"
                    onClick={() => abrirLightbox(item.id_avaliacao)}
                  >
                    <img
                      src={item.foto_url}
                      alt={`Foto enviada por ${item.nome_exibicao || "cliente"}`}
                      className="client-photo-thumb"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="testimonials-list">
            {avaliacoesPaginadas.map((avaliacao) => (
              <article className="testimonial-row" key={avaliacao.id_avaliacao}>
                <div className="testimonial-row-header">
                  <div className="testimonial-author-meta">
                    <span className="author-avatar">{iniciais(avaliacao.nome_exibicao)}</span>
                    <div className="testimonial-author-info">
                      <strong className="author-name">{avaliacao.nome_exibicao || "Cliente Meive"}</strong>
                      <span className="testimonial-verified">Cliente confirmado</span>
                    </div>
                  </div>
                  <span className="testimonial-date">{formatarData(avaliacao.criado_em)}</span>
                </div>

                <div className="testimonial-row-body">
                  <EstrelasLeitura nota={avaliacao.nota} />
                  
                  {(avaliacao.servico_nome || avaliacao.servico || avaliacao.funcionario) && (
                    <div className="testimonial-service-info">
                      {(avaliacao.servico_nome || avaliacao.servico) && <span><strong>Serviço:</strong> {avaliacao.servico_nome || avaliacao.servico}</span>}
                      {avaliacao.funcionario && <span><strong>Profissional:</strong> {avaliacao.funcionario}</span>}
                    </div>
                  )}

                  <p className={`testimonial-text${avaliacao.comentario ? "" : " testimonial-text--empty"}`}>
                    {avaliacao.comentario || "Cliente avaliou sua experiência com nota, sem deixar um comentário."}
                  </p>

                  {avaliacao.foto_url && (
                    <div className="testimonial-inline-photo-wrapper">
                      <button
                        type="button"
                        className="testimonial-inline-photo-btn"
                        onClick={() => abrirLightbox(avaliacao.id_avaliacao)}
                      >
                        <img
                          src={avaliacao.foto_url}
                          alt="Foto da avaliação"
                          className="testimonial-inline-photo"
                          loading="lazy"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="testimonials-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={irParaPaginaAnterior}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
              >
                ‹ Anterior
              </button>

              <span className="pagination-info">
                Página <strong>{paginaAtual}</strong> de {totalPaginas}
              </span>

              <button
                type="button"
                className="pagination-btn"
                onClick={irParaProximaPagina}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
              >
                Próxima ›
              </button>
            </div>
          )}
        </>
      )}

      {fotoAtivaIndex !== null && avaliacaoAtualLightbox && (
        <div className="lightbox-overlay" onClick={fecharLightbox}>
          <button className="lightbox-close" onClick={fecharLightbox} aria-label="Fechar">✕</button>
          
          {fotosClientes.length > 1 && (
            <>
              <button className="lightbox-prev" onClick={fotoAnterior} aria-label="Anterior">‹</button>
              <button className="lightbox-next" onClick={proximaFoto} aria-label="Próxima">›</button>
            </>
          )}

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-container">
              <span className="lightbox-counter">{fotoAtivaIndex + 1} / {fotosClientes.length}</span>
              <img
                src={avaliacaoAtualLightbox.foto_url}
                alt="Foto ampliada"
                className="lightbox-main-img"
              />
            </div>
            
            <div className="lightbox-sidebar">
              <div className="lightbox-author-header">
                <div className="lightbox-author-meta">
                  <span className="author-avatar">{iniciais(avaliacaoAtualLightbox.nome_exibicao)}</span>
                  <strong className="author-name">{avaliacaoAtualLightbox.nome_exibicao || "Cliente Meive"}</strong>
                </div>
                <span className="testimonial-date">{formatarData(avaliacaoAtualLightbox.criado_em)}</span>
              </div>
              <EstrelasLeitura nota={avaliacaoAtualLightbox.nota} />
              
              {(avaliacaoAtualLightbox.servico_nome || avaliacaoAtualLightbox.servico || avaliacaoAtualLightbox.funcionario) && (
                <div className="testimonial-service-info">
                  {(avaliacaoAtualLightbox.servico_nome || avaliacaoAtualLightbox.servico) && <span><strong>Serviço:</strong> {avaliacaoAtualLightbox.servico_nome || avaliacaoAtualLightbox.servico}</span>}
                  {avaliacaoAtualLightbox.funcionario && <span><strong>Profissional:</strong> {avaliacaoAtualLightbox.funcionario}</span>}
                </div>
              )}

              <p className="testimonial-text">
                {avaliacaoAtualLightbox.comentario || "Cliente avaliou sua experiência com nota, sem deixar um comentário."}
              </p>

              {avaliacaoAtualLightbox.funcionario && (
                <Link 
                  to={`/agendar?profissional=${encodeURIComponent(avaliacaoAtualLightbox.funcionario)}`} 
                  className="testimonials-review-btn lightbox-cta"
                >
                  Agendar com {avaliacaoAtualLightbox.funcionario}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="testimonials-cta">
        <span className="testimonials-cta-kicker">SUA EXPERIÊNCIA TAMBÉM IMPORTA</span>
        <h3>Já conhece o studio Meive?</h3>
        <p>Compartilhe sua opinião com outras clientes. Entre na sua conta para deixar uma avaliação.</p>
        <Link to={estaLogado() ? "/minha-conta/avaliar" : "/login?redirect=avaliacao"} className="testimonials-review-btn">
          <span aria-hidden="true">✦</span> AVALIAR O STUDIO
        </Link>
      </div>
    </section>
  );
}
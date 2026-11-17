// Salvar como: src/components/cliente/AvaliarSite.jsx
// Tela para avaliar o site (rota /minha-conta/avaliar) e para editar uma avaliação
// já enviada (rota /minha-conta/avaliacoes/:id/editar).
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClientNavbar from "./ClientNavbar";
import EstrelasNota from "./EstrelasNota";
import { estaLogado } from "../../auth";
import {
  COMENTARIO_MAX,
  FORMATOS_FOTO,
  avaliacaoService,
  montarFormData,
  traduzirErro,
  validarFoto,
} from "../../services/avaliacaoService";
import "./Avaliacao.css";

function semCampo(erros, campo) {
  const copia = { ...erros };
  delete copia[campo];
  return copia;
}

function focarPrimeiroErro(erros) {
  const alvo = erros.nota
    ? document.querySelector("#aval-nota [role='radio']")
    : erros.comentario
      ? document.getElementById("aval-comentario")
      : document.getElementById("aval-foto-area");
  alvo?.focus();
}

export default function AvaliarSite() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [anonima, setAnonima] = useState(false);
  const [foto, setFoto] = useState(null); // arquivo novo escolhido agora
  const [previa, setPrevia] = useState(null); // endereço temporário para mostrar o arquivo novo
  const [fotoAtual, setFotoAtual] = useState(null); // foto que já estava salva (edição)
  const [removerFoto, setRemoverFoto] = useState(false);

  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [sessaoExpirada, setSessaoExpirada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erroCarga, setErroCarga] = useState(null); // falha ao abrir a avaliação para editar

  const inputFoto = useRef(null);

  // Libera da memória a pré-visualização quando ela troca ou a tela fecha.
  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  // Exige login e, na edição, carrega a avaliação.
  useEffect(() => {
    if (!estaLogado()) {
      navigate("/login", { replace: true });
      return undefined;
    }
    if (!id) return undefined;

    let ativo = true;
    avaliacaoService
      .obter(id)
      .then((a) => {
        if (!ativo) return;
        setNota(a.nota);
        setComentario(a.comentario || "");
        setAnonima(Boolean(a.anonima));
        setFotoAtual(a.foto_url || null);
        setCarregando(false);
      })
      .catch((err) => {
        if (!ativo) return;
        const t = traduzirErro(err);
        if (err?.status === 404) {
          setNaoEncontrada(true);
        } else {
          setErroCarga(t.geral);
          setSessaoExpirada(t.sessaoExpirada);
        }
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id, navigate]);

  function aoEscolherFoto(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!arquivo) return;

    const mensagem = validarFoto(arquivo);
    if (mensagem) {
      setErros((atual) => ({ ...atual, foto: mensagem }));
      return;
    }
    setErros((atual) => semCampo(atual, "foto"));
    setFoto(arquivo);
    setPrevia(URL.createObjectURL(arquivo));
  }

  function aoRemoverFoto() {
    setFoto(null);
    setPrevia(null);
    setRemoverFoto(true);
    setErros((atual) => semCampo(atual, "foto"));
  }

  function validar() {
    const novos = {};
    if (!nota) novos.nota = "Escolha uma nota de 1 a 5 estrelas.";
    if (comentario.trim().length > COMENTARIO_MAX) {
      novos.comentario = `O comentário pode ter no máximo ${COMENTARIO_MAX} caracteres.`;
    }
    return novos;
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;

    setErroGeral(null);
    setSessaoExpirada(false);

    const problemas = { ...validar(), ...(erros.foto ? { foto: erros.foto } : {}) };
    if (Object.keys(problemas).length > 0) {
      setErros(problemas);
      setErroGeral("Revise os campos destacados para continuar.");
      focarPrimeiroErro(problemas);
      return;
    }

    setErros({});
    setEnviando(true);
    try {
      const corpo = montarFormData({ nota, comentario, anonima, foto, removerFoto });
      if (editando) {
        await avaliacaoService.atualizar(id, corpo);
      } else {
        await avaliacaoService.criar(corpo);
      }
      setSucesso(true);
    } catch (err) {
      const t = traduzirErro(err);
      setErros(t.campos);
      setSessaoExpirada(t.sessaoExpirada);
      setErroGeral(
        t.geral || (Object.keys(t.campos).length > 0 ? "Revise os campos destacados para continuar." : null)
      );
      if (err?.status === 404) setNaoEncontrada(true);
    } finally {
      setEnviando(false);
    }
  }

  const voltarPara = editando ? "/minha-conta/avaliacoes" : "/minha-conta";
  const mostrarFoto = Boolean(foto) || (Boolean(fotoAtual) && !removerFoto);
  const srcFoto = foto ? previa : fotoAtual;
  const excedeu = comentario.trim().length > COMENTARIO_MAX;

  return (
    <div className="client-page aval-page">
      <ClientNavbar />

      <main className="aval-container">
        <header className="aval-head">
          <span className="client-tag">
            <i className="client-tag-line" /> {editando ? "EDITAR AVALIAÇÃO" : "AVALIAÇÃO"}
          </span>
          <h1 className="aval-title">
            {editando ? (
              <>
                EDITE SUA <span>AVALIAÇÃO.</span>
              </>
            ) : (
              <>
                COMO FOI SUA <span>EXPERIÊNCIA?</span>
              </>
            )}
          </h1>
          <p className="aval-sub">
            {editando
              ? "Ajuste a nota, o comentário ou a foto e salve."
              : "Sua opinião ajuda o Meive Beauty Studio a melhorar. Leva menos de um minuto."}
          </p>
        </header>

        {carregando ? (
          <p className="aval-estado" role="status">
            Carregando sua avaliação...
          </p>
        ) : naoEncontrada ? (
          <div className="aval-card aval-vazio">
            <strong>Avaliação não encontrada</strong>
            <span>Ela pode já ter sido apagada.</span>
            <Link to="/minha-conta/avaliacoes" className="client-primary-btn aval-btn-link">
              VER MINHAS AVALIAÇÕES
            </Link>
          </div>
        ) : erroCarga ? (
          <div className="aval-card aval-vazio">
            <div className="aval-banner aval-banner--erro" role="alert">
              <span>{erroCarga}</span>
            </div>
            {sessaoExpirada ? (
              <Link to="/login" className="client-primary-btn aval-btn-link">
                ENTRAR
              </Link>
            ) : (
              <Link to="/minha-conta/avaliacoes" className="client-primary-btn aval-btn-link">
                VOLTAR PARA MINHAS AVALIAÇÕES
              </Link>
            )}
          </div>
        ) : (
          <form className="aval-card" onSubmit={enviar} noValidate>
            {erroGeral && (
              <div className="aval-banner aval-banner--erro" role="alert">
                <span>{erroGeral}</span>
                {sessaoExpirada && (
                  <Link to="/login" className="aval-banner-link">
                    ENTRAR
                  </Link>
                )}
              </div>
            )}

            {/* Nota */}
            <div className="aval-campo">
              <span className="aval-label" id="aval-nota-label">
                SUA NOTA *
              </span>
              <EstrelasNota
                valor={nota}
                onChange={(n) => {
                  setNota(n);
                  setErros((atual) => semCampo(atual, "nota"));
                }}
                desabilitado={enviando}
                invalido={Boolean(erros.nota)}
                descricaoId={erros.nota ? "aval-nota-erro" : undefined}
              />
              {erros.nota && (
                <p className="aval-erro-campo" id="aval-nota-erro">
                  {erros.nota}
                </p>
              )}
            </div>

            {/* Comentário */}
            <div className="aval-campo">
              <label className="aval-label" htmlFor="aval-comentario">
                COMENTÁRIO (OPCIONAL)
              </label>
              <textarea
                id="aval-comentario"
                className={`aval-textarea${erros.comentario || excedeu ? " aval-textarea--erro" : ""}`}
                rows={6}
                value={comentario}
                disabled={enviando}
                placeholder="Conte como foi sua experiência com o site e com o studio..."
                aria-invalid={Boolean(erros.comentario) || excedeu}
                aria-describedby={erros.comentario ? "aval-comentario-erro" : "aval-comentario-contador"}
                onChange={(e) => {
                  setComentario(e.target.value);
                  setErros((atual) => semCampo(atual, "comentario"));
                }}
              />
              <span
                id="aval-comentario-contador"
                className={`aval-contador${excedeu ? " aval-contador--erro" : ""}`}
              >
                {comentario.trim().length}/{COMENTARIO_MAX}
              </span>
              {erros.comentario && (
                <p className="aval-erro-campo" id="aval-comentario-erro">
                  {erros.comentario}
                </p>
              )}
            </div>

            {/* Foto */}
            <div className="aval-campo">
              <span className="aval-label" id="aval-foto-label">
                FOTO (OPCIONAL)
              </span>
              <input
                ref={inputFoto}
                type="file"
                hidden
                accept={FORMATOS_FOTO.join(",")}
                onChange={aoEscolherFoto}
              />
              {mostrarFoto ? (
                <div className="aval-foto-previa" id="aval-foto-area" tabIndex={-1}>
                  <img src={srcFoto} alt="Foto anexada à avaliação" />
                  <div className="aval-foto-acoes">
                    <button
                      type="button"
                      className="client-outline-btn"
                      disabled={enviando}
                      onClick={() => inputFoto.current?.click()}
                    >
                      TROCAR FOTO
                    </button>
                    <button
                      type="button"
                      className="client-outline-btn"
                      disabled={enviando}
                      onClick={aoRemoverFoto}
                    >
                      REMOVER FOTO
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="aval-foto-area"
                  className="aval-foto-btn"
                  disabled={enviando}
                  aria-labelledby="aval-foto-label"
                  aria-describedby="aval-foto-dica"
                  onClick={() => inputFoto.current?.click()}
                >
                  <strong>+ ANEXAR FOTO</strong>
                  <span id="aval-foto-dica">JPG, PNG, WEBP ou GIF · até 2 MB</span>
                </button>
              )}
              {erros.foto && (
                <p className="aval-erro-campo" role="alert">
                  {erros.foto}
                </p>
              )}
            </div>

            {/* Anonimato */}
            <label className="aval-check">
              <input
                type="checkbox"
                checked={anonima}
                disabled={enviando}
                onChange={(e) => setAnonima(e.target.checked)}
              />
              <span>
                <strong>Avaliar anonimamente</strong>
                <small>Seu nome não aparecerá junto com a sua avaliação.</small>
              </span>
            </label>

            <div className="aval-acoes">
              <Link
                to={voltarPara}
                className="client-outline-btn aval-btn-link"
                onClick={(e) => {
                  if (enviando) e.preventDefault();
                }}
              >
                CANCELAR
              </Link>
              <button type="submit" className="client-primary-btn" disabled={enviando}>
                {enviando ? "ENVIANDO..." : editando ? "SALVAR ALTERAÇÕES" : "ENVIAR AVALIAÇÃO"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* MODAL: SUCESSO */}
      {sucesso && (
        <div className="client-modal-overlay">
          <div className="client-modal-card" role="dialog" aria-modal="true" aria-labelledby="aval-sucesso-titulo">
            <h3 id="aval-sucesso-titulo">{editando ? "AVALIAÇÃO ATUALIZADA!" : "AVALIAÇÃO ENVIADA!"}</h3>
            <p>
              {editando
                ? "Suas alterações foram salvas com sucesso."
                : "Obrigada por compartilhar sua experiência! Você pode editar ou apagar sua avaliação quando quiser."}
            </p>
            <div className="client-modal-actions">
              <button type="button" className="client-outline-btn" onClick={() => navigate("/minha-conta")}>
                MINHA CONTA
              </button>
              <button
                type="button"
                className="client-primary-btn"
                autoFocus
                onClick={() => navigate("/minha-conta/avaliacoes")}
              >
                MINHAS AVALIAÇÕES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

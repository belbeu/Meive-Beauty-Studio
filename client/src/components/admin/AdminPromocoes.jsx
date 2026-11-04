import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./AdminDashboard.css";
import "./AdminPromocoes.css";

const VAZIO = {
  titulo: "",
  descricao: "",
  preco_original: "",
  preco_promocional: "",
  validade: "",
  destaque: false,
  ativo: true,
};

const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", {
  style: "currency", currency: "BRL",
});

function mensagemErro(error) {
  const dados = error?.dados;
  if (dados?.detail) return dados.detail;
  if (dados && typeof dados === "object") {
    return Object.entries(dados).map(([campo, mensagens]) =>
      `${campo.replaceAll("_", " ")}: ${[].concat(mensagens).join(" ")}`
    ).join("\n");
  }
  return error?.message || "Não foi possível concluir a operação.";
}

export default function AdminPromocoes() {
  const [promocoes, setPromocoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [busca, setBusca] = useState("");
  const [toastInfo, setToastInfo] = useState(null);
  const [confirmInfo, setConfirmInfo] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const dados = await api("/admin/promocoes/");
      setPromocoes(Array.isArray(dados) ? dados : dados.results || []);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return promocoes;
    return promocoes.filter((p) => `${p.titulo} ${p.descricao || ""}`.toLocaleLowerCase("pt-BR").includes(termo));
  }, [promocoes, busca]);

  const abrirNova = () => {
    setEditando(null);
    setForm(VAZIO);
    setErro("");
    setModalAberto(true);
  };

  const abrirEdicao = (promo) => {
    setEditando(promo.id_promocao);
    setForm({
      titulo: promo.titulo || "",
      descricao: promo.descricao || "",
      preco_original: String(promo.preco_original ?? ""),
      preco_promocional: String(promo.preco_promocional ?? ""),
      validade: promo.validade || "",
      destaque: Boolean(promo.destaque),
      ativo: promo.ativo !== false,
    });
    setErro("");
    setModalAberto(true);
  };

  const atualizarCampo = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value }));
  };

  const salvar = async (event) => {
  event.preventDefault();
  setErro("");

  const payload = {
    ...form,
    preco_original: String(form.preco_original).replace(",", "."),
    preco_promocional: String(form.preco_promocional).replace(",", "."),
  };

  setSalvando(true);

  try {
    if (editando) {
      await api(`/admin/promocoes/${editando}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      await api("/admin/promocoes/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setModalAberto(false);
    await carregar();

    setToastInfo({
      title: "SUCESSO",
      message: editando
        ? "Promoção atualizada com sucesso!"
        : "Promoção cadastrada com sucesso!",
    });

  } catch (error) {
    setErro(mensagemErro(error));
  } finally {
    setSalvando(false);
  }
};

  const excluir = (promo) => {
  setConfirmInfo({
    title: "EXCLUIR PROMOÇÃO",
    message: `Tem certeza de que deseja excluir a promoção "${promo.titulo}"? Essa ação não poderá ser desfeita.`,

    onConfirm: async () => {
      setConfirmInfo(null);
      setExcluindo(promo.id_promocao);
      setErro("");

      try {
        await api(`/admin/promocoes/${promo.id_promocao}/`, {
          method: "DELETE",
        });

        await carregar();

        setToastInfo({
          title: "SUCESSO",
          message: "A promoção foi excluída com sucesso!",
        });

      } catch (error) {
        setToastInfo({
          title: "ERRO AO EXCLUIR",
          message: mensagemErro(error),
        });
      } finally {
        setExcluindo(null);
      }
    },
  });
};

  return (
    <main className="dash-main admin-promos">
      <header className="dash-header">
        <div>
          <span className="dash-date">GESTÃO DO SITE</span>
          <h1 className="dash-title">PROMOÇÕES</h1>
        </div>
        <div className="dash-header-actions">
          <button type="button" className="dash-primary-btn" onClick={abrirNova}>+ NOVA PROMOÇÃO</button>
        </div>
      </header>

      <section className="promos-summary">
        <article><span>TOTAL CADASTRADAS</span><strong>{promocoes.length}</strong></article>
        <article><span>ATIVAS NO SITE</span><strong>{promocoes.filter((p) => p.ativo !== false).length}</strong></article>
        <article><span>EM DESTAQUE</span><strong>{promocoes.filter((p) => p.destaque && p.ativo !== false).length}</strong></article>
      </section>

      <section className="dash-panel promos-panel">
        <div className="dash-panel-head promos-panel-head">
          <div>
            <h2 className="dash-panel-title">OFERTAS CADASTRADAS</h2>
            <p className="dash-panel-sub">Gerencie as promoções exibidas na página inicial</p>
          </div>
          <input className="promos-search" type="search" placeholder="Buscar promoção..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        {erro && !modalAberto && <p className="promos-error" role="alert">{erro}</p>}
        {carregando ? <p className="promos-empty">Carregando promoções...</p> : (
          <div className="promos-list">
            {filtradas.map((promo) => (
              <article className={`admin-promo-card ${promo.ativo === false ? "is-inactive" : ""}`} key={promo.id_promocao}>
                <div className="admin-promo-main">
                  <div className="admin-promo-tags">
                    <span className={`admin-promo-status ${promo.ativo === false ? "off" : "on"}`}>{promo.ativo === false ? "INATIVA" : "ATIVA"}</span>
                    {promo.destaque && <span className="admin-promo-featured">DESTAQUE</span>}
                  </div>
                  <h3>{promo.titulo}</h3>
                  <p>{promo.descricao || "Sem descrição cadastrada."}</p>
                  <small>{promo.validade || "Sem validade informada"}</small>
                </div>
                <div className="admin-promo-prices">
                  <del>{moeda(promo.preco_original)}</del>
                  <strong>{moeda(promo.preco_promocional)}</strong>
                </div>
                <div className="admin-promo-actions">
                  <button type="button" onClick={() => abrirEdicao(promo)}>EDITAR</button>
                  <button type="button" className="delete" disabled={excluindo === promo.id_promocao} onClick={() => excluir(promo)}>{excluindo === promo.id_promocao ? "EXCLUINDO..." : "EXCLUIR"}</button>
                </div>
              </article>
            ))}
            {filtradas.length === 0 && <p className="promos-empty">{busca ? "Nenhuma promoção corresponde à busca." : "Nenhuma promoção cadastrada. Clique em “Nova promoção” para começar."}</p>}
          </div>
        )}
      </section>

      {modalAberto && (
        <div className="promos-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalAberto(false); }}>
          <section className="promos-modal" role="dialog" aria-modal="true" aria-labelledby="promos-modal-title">
            <header className="promos-modal-header">
              <div><span>PAINEL ADMINISTRATIVO</span><h2 id="promos-modal-title">{editando ? "EDITAR PROMOÇÃO" : "NOVA PROMOÇÃO"}</h2></div>
              <button type="button" aria-label="Fechar" onClick={() => setModalAberto(false)}>×</button>
            </header>
            <form className="promos-form" onSubmit={salvar}>
              <label>Título da promoção<input name="titulo" value={form.titulo} onChange={atualizarCampo} maxLength={150} required placeholder="Ex.: Combo Olhar Perfeito" /></label>
              <label>Descrição<textarea name="descricao" value={form.descricao} onChange={atualizarCampo} rows={3} placeholder="Descreva os serviços ou produtos incluídos..." /></label>
              <div className="promos-form-row">
                <label>Preço original (R$)<input name="preco_original" type="number" min="0.01" step="0.01" value={form.preco_original} onChange={atualizarCampo} required placeholder="350,00" /></label>
                <label>Preço promocional (R$)<input name="preco_promocional" type="number" min="0.01" step="0.01" value={form.preco_promocional} onChange={atualizarCampo} required placeholder="290,00" /></label>
              </div>
              <label>Validade / condição<input name="validade" value={form.validade} onChange={atualizarCampo} maxLength={150} placeholder="Ex.: Válido até 30/11 ou para novas clientes" /></label>
              <div className="promos-checks">
                <label><input type="checkbox" name="destaque" checked={form.destaque} onChange={atualizarCampo} /> Exibir como destaque</label>
                <label><input type="checkbox" name="ativo" checked={form.ativo} onChange={atualizarCampo} /> Exibir no site</label>
              </div>
              {erro && <p className="promos-error" role="alert">{erro}</p>}
              <footer className="promos-modal-actions">
                <button type="button" className="cancel" onClick={() => setModalAberto(false)}>CANCELAR</button>
                <button type="submit" className="save" disabled={salvando}>{salvando ? "SALVANDO..." : editando ? "SALVAR ALTERAÇÕES" : "CADASTRAR PROMOÇÃO"}</button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* MODAL DE AVISO / SUCESSO */}
{toastInfo && (
  <div
    className="clients-toast-overlay"
    onClick={() => setToastInfo(null)}
  >
    <div
      className="clients-toast-card"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="clients-toast-title">
        {toastInfo.title}
      </h3>

      <p className="clients-toast-message">
        {toastInfo.message}
      </p>

      <div className="clients-toast-actions">
        <button
          type="button"
          className="dash-primary-btn"
          onClick={() => setToastInfo(null)}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

{/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
{confirmInfo && (
  <div
    className="clients-toast-overlay"
    onClick={() => setConfirmInfo(null)}
  >
    <div
      className="clients-toast-card"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="clients-toast-title">
        {confirmInfo.title}
      </h3>

      <p className="clients-toast-message">
        {confirmInfo.message}
      </p>

      <div className="clients-toast-actions">
        <button
          type="button"
          className="clients-btn-cancel"
          onClick={() => setConfirmInfo(null)}
        >
          CANCELAR
        </button>

        <button
          type="button"
          className="clients-btn-delete"
          onClick={confirmInfo.onConfirm}
        >
          CONFIRMAR EXCLUSÃO
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import "./AdminDashboard.css";
import "./AdminCursos.css";

const CURSO_VAZIO = { nome: "", descricao: "", carga_horaria: "", preco: "", ativo: true };
const TURMA_VAZIA = { id_curso: "", id_funcionario: "", data_inicio: "", data_fim: "", capacidade_maxima: "10", ativo: true };

const normalizarBusca = (valor) => String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

const dinheiro = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dataHora = (valor) => {
  if (!valor) return "—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? valor
    : data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

const erroApi = (error) => {
  const dados = error?.dados;
  if (dados?.detail) return dados.detail;
  if (dados && typeof dados === "object") {
    return Object.entries(dados)
      .map(([campo, mensagens]) => `${campo}: ${[].concat(mensagens).join(" ")}`)
      .join("\n");
  }
  return error?.message || "Ocorreu um erro inesperado.";
};

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4m8-4v4" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.5 2.8-6 7-6s7 2.5 7 6m1-12a3 3 0 0 1 0 6m1 1c2.5.5 4 2.2 4 5" /></>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AdminCursos() {
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [buscaTurma, setBuscaTurma] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("todas");
  const [modalCurso, setModalCurso] = useState(false);
  const [modalTurma, setModalTurma] = useState(false);
  const [cursoEditando, setCursoEditando] = useState(null);
  const [formCurso, setFormCurso] = useState(CURSO_VAZIO);
  const [formTurma, setFormTurma] = useState(TURMA_VAZIA);
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [aviso, setAviso] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [listaCursos, listaTurmas, listaUsuarios] = await Promise.all([
        api("/admin/cursos/"),
        api("/turmas/"),
        api("/usuarios/"),
      ]);
      setCursos(Array.isArray(listaCursos) ? listaCursos : listaCursos.results || []);
      setTurmas(Array.isArray(listaTurmas) ? listaTurmas : listaTurmas.results || []);
      const usuarios = Array.isArray(listaUsuarios) ? listaUsuarios : listaUsuarios.results || [];
      setFuncionarios(usuarios.filter((usuario) => ["ADMIN", "FUNCIONARIO"].includes(String(usuario.tipo || "").toUpperCase())));
    } catch (error) {
      setAviso({ tipo: "erro", titulo: "ERRO AO CARREGAR", mensagem: erroApi(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(carregarDados); }, [carregarDados]);

  const turmasPorCurso = useMemo(() => {
    const contagem = {};
    turmas.forEach((turma) => {
      const id = turma.id_curso?.id_curso ?? turma.id_curso;
      contagem[id] = (contagem[id] || 0) + 1;
    });
    return contagem;
  }, [turmas]);

  const cursosFiltrados = useMemo(() => cursos.filter((curso) => {
    const correspondeBusca = normalizarBusca(`${curso.nome || ""} ${curso.descricao || ""}`).includes(normalizarBusca(busca));
    const correspondeFiltro = filtro === "todos" || (filtro === "ativos" ? curso.ativo !== false : curso.ativo === false);
    return correspondeBusca && correspondeFiltro;
  }), [cursos, busca, filtro]);

  const turmasFiltradas = useMemo(() => turmas.filter((turma) => {
    const cursoId = turma.id_curso?.id_curso ?? turma.id_curso;
    const funcionarioId = turma.id_funcionario?.id_usuario ?? turma.id_funcionario;
    const curso = cursos.find((item) => String(item.id_curso) === String(cursoId));
    const funcionario = funcionarios.find((item) => String(item.id_usuario) === String(funcionarioId));
    const texto = normalizarBusca([
      curso?.nome, turma.id_curso?.nome, funcionario?.nome, turma.id_funcionario?.nome,
      turma.id_turma, turma.data_inicio, turma.data_fim, turma.capacidade_maxima,
    ].join(" "));
    const correspondeBusca = !normalizarBusca(buscaTurma) || texto.includes(normalizarBusca(buscaTurma));
    const inativa = turma.ativo === false;
    const correspondeFiltro = filtroTurma === "todas" || (filtroTurma === "ativas" && !inativa) || (filtroTurma === "inativas" && inativa);
    return correspondeBusca && correspondeFiltro;
  }), [turmas, cursos, funcionarios, buscaTurma, filtroTurma]);

  const alterarStatusTurma = async (turma) => {
    try {
      await api(`/turmas/${turma.id_turma}/`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: turma.ativo === false }),
      });
      setAviso({ tipo: "sucesso", titulo: turma.ativo === false ? "TURMA REATIVADA" : "TURMA INATIVADA", mensagem: turma.ativo === false ? "A turma voltou a ficar ativa." : "A turma foi inativada e seu histórico foi preservado." });
      await carregarDados();
    } catch (error) {
      setAviso({ tipo: "erro", titulo: "NÃO FOI POSSÍVEL ALTERAR A TURMA", mensagem: erroApi(error) });
    }
  };

  const abrirNovoCurso = () => {
    setCursoEditando(null);
    setFormCurso(CURSO_VAZIO);
    setModalCurso(true);
  };

  const abrirEdicaoCurso = (curso) => {
    setCursoEditando(curso);
    setFormCurso({
      nome: curso.nome || "",
      descricao: curso.descricao || "",
      carga_horaria: String(curso.carga_horaria ?? ""),
      preco: String(curso.preco ?? ""),
      ativo: curso.ativo !== false,
    });
    setModalCurso(true);
  };

  const abrirNovaTurma = (cursoId = "") => {
    setFormTurma({ ...TURMA_VAZIA, id_curso: String(cursoId || "") });
    setModalTurma(true);
  };

  const salvarCurso = async (event) => {
    event.preventDefault();
    if (salvando) return;
    const carga = Number(formCurso.carga_horaria);
    const preco = Number(String(formCurso.preco).replace(",", "."));
    if (!formCurso.nome.trim() || !Number.isInteger(carga) || carga < 1 || !Number.isFinite(preco) || preco < 0) {
      setAviso({ tipo: "erro", titulo: "VERIFIQUE OS CAMPOS", mensagem: "Informe o nome, uma carga horária inteira maior que zero e um preço válido." });
      return;
    }
    const payload = {
      nome: formCurso.nome.trim(),
      descricao: formCurso.descricao.trim(),
      carga_horaria: carga,
      preco: preco.toFixed(2),
      ativo: formCurso.ativo,
    };
    try {
      setSalvando(true);
      if (cursoEditando) {
        await api(`/admin/cursos/${cursoEditando.id_curso}/`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/admin/cursos/", { method: "POST", body: JSON.stringify(payload) });
      }
      setModalCurso(false);
      setAviso({ tipo: "sucesso", titulo: "CURSO SALVO", mensagem: "As informações do curso foram salvas." });
      await carregarDados();
    } catch (error) {
      setAviso({ tipo: "erro", titulo: "NÃO FOI POSSÍVEL SALVAR", mensagem: erroApi(error) });
    } finally {
      setSalvando(false);
    }
  };

  const salvarTurma = async (event) => {
    event.preventDefault();
    if (salvando) return;
    const inicio = new Date(formTurma.data_inicio);
    const fim = new Date(formTurma.data_fim);
    const capacidade = Number(formTurma.capacidade_maxima);
    if (!formTurma.id_curso || !formTurma.id_funcionario || !formTurma.data_inicio || !formTurma.data_fim ||
        Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio ||
        !Number.isInteger(capacidade) || capacidade < 1) {
      setAviso({ tipo: "erro", titulo: "VERIFIQUE OS CAMPOS", mensagem: "Selecione o curso e responsável, informe início e término válidos e uma capacidade maior que zero. O término deve ser posterior ao início." });
      return;
    }
    const payload = {
      id_curso: Number(formTurma.id_curso),
      id_funcionario: Number(formTurma.id_funcionario),
      data_inicio: inicio.toISOString(),
      data_fim: fim.toISOString(),
      capacidade_maxima: capacidade,
    };
    try {
      setSalvando(true);
      await api("/turmas/", { method: "POST", body: JSON.stringify(payload) });
      setModalTurma(false);
      setAviso({ tipo: "sucesso", titulo: "TURMA CRIADA", mensagem: "A turma foi vinculada ao curso e cadastrada com sucesso." });
      await carregarDados();
    } catch (error) {
      setAviso({ tipo: "erro", titulo: "NÃO FOI POSSÍVEL CRIAR A TURMA", mensagem: erroApi(error) });
    } finally {
      setSalvando(false);
    }
  };

  const excluirCurso = async () => {
    if (!confirmarExclusao) return;
    try {
      const resposta = await api(`/admin/cursos/${confirmarExclusao.id_curso}/`, { method: "DELETE" });
      setConfirmarExclusao(null);
      setAviso({
        tipo: "sucesso",
        titulo: resposta?.inativado ? "CURSO INATIVADO" : "CURSO EXCLUÍDO",
        mensagem: resposta?.detail || (resposta?.inativado ? "O curso foi inativado para preservar o histórico." : "O curso foi removido."),
      });
      await carregarDados();
    } catch (error) {
      setConfirmarExclusao(null);
      if (error?.status === 404) {
        setAviso({ tipo: "sucesso", titulo: "LISTA ATUALIZADA", mensagem: "Este curso já não está disponível. A lista será atualizada." });
        await carregarDados();
        return;
      }
      setAviso({ tipo: "erro", titulo: "NÃO FOI POSSÍVEL EXCLUIR", mensagem: erroApi(error) });
    }
  };

  const totalTurmasAtivas = turmas.filter((turma) => turma.ativo !== false).length;
  const cursosAtivos = cursos.filter((curso) => curso.ativo !== false).length;

  return (
    <main className="dash-main admin-courses">
      <header className="dash-header">
        <div>
          <span className="dash-date">GESTÃO DE ENSINO</span>
          <h1 className="dash-title">CURSOS</h1>
          <p className="courses-subtitle">Organize os cursos oferecidos e acompanhe suas turmas e horários.</p>
        </div>
        <div className="dash-header-actions">
          <button type="button" className="dash-primary-btn" onClick={abrirNovoCurso}><Icon name="plus" /> NOVO CURSO</button>
        </div>
      </header>

      <section className="courses-summary">
        <article className="courses-summary-card"><span>CURSOS CADASTRADOS</span><strong>{cursos.length}</strong><small>{cursosAtivos} ativos</small></article>
        <article className="courses-summary-card"><span>TURMAS ORGANIZADAS</span><strong>{totalTurmasAtivas}</strong><small>Turmas cadastradas</small></article>
        <article className="courses-summary-card"><span>RESPONSÁVEIS</span><strong>{funcionarios.length}</strong><small>Administradores e funcionários</small></article>
      </section>

      <section className="courses-toolbar">
        <div className="courses-search"><Icon name="search" /><input aria-label="Buscar curso" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar curso pelo nome..." /></div>
        <div className="courses-filters" role="group" aria-label="Filtrar cursos">
          {[["todos", "TODOS"], ["ativos", "ATIVOS"], ["inativos", "INATIVOS"]].map(([valor, texto]) => (
            <button key={valor} type="button" className={filtro === valor ? "is-selected" : ""} onClick={() => setFiltro(valor)}>{texto}</button>
          ))}
        </div>
      </section>

      {loading ? <div className="courses-empty">Carregando cursos e turmas...</div> : cursosFiltrados.length === 0 ? (
        <div className="courses-empty"><strong>NENHUM CURSO ENCONTRADO</strong><span>Cadastre um curso ou ajuste sua busca.</span></div>
      ) : (
        <section className="courses-grid">
          {cursosFiltrados.map((curso) => {
            const quantidadeTurmas = turmasPorCurso[curso.id_curso] || 0;
            return (
              <article className="course-admin-card" key={curso.id_curso}>
                <div className="course-admin-card-top">
                  <span className={`course-status ${curso.ativo === false ? "is-inactive" : ""}`}>{curso.ativo === false ? "INATIVO" : "ATIVO"}</span>
                  <span className="course-class-count"><Icon name="users" /> {quantidadeTurmas} {quantidadeTurmas === 1 ? "turma" : "turmas"}</span>
                </div>
                <h2>{curso.nome}</h2>
                <p className="course-admin-description">{curso.descricao || "Este curso ainda não possui uma descrição cadastrada."}</p>
                <div className="course-admin-details">
                  <span><Icon name="clock" /> {curso.carga_horaria}h de duração</span>
                  <strong>{dinheiro(curso.preco)}</strong>
                </div>
                <div className="course-admin-actions">
                  <button type="button" className="course-action-secondary" onClick={() => abrirEdicaoCurso(curso)}><Icon name="edit" /> EDITAR</button>
                  <button type="button" className="course-action-primary" onClick={() => abrirNovaTurma(curso.id_curso)} disabled={curso.ativo === false}><Icon name="plus" /> NOVA TURMA</button>
                  <button type="button" className="course-action-icon" aria-label={`Excluir ${curso.nome}`} onClick={() => setConfirmarExclusao(curso)}><Icon name="trash" /></button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="courses-classes-section">
        <div className="courses-section-heading"><div><span className="dash-date">ACOMPANHAMENTO</span><h2>TURMAS E HORÁRIOS</h2></div><button type="button" className="course-action-secondary" onClick={() => abrirNovaTurma()}><Icon name="plus" /> CADASTRAR TURMA</button></div>
        <div className="courses-toolbar courses-classes-toolbar">
          <div className="courses-search"><Icon name="search" /><input aria-label="Buscar turma" value={buscaTurma} onChange={(e) => setBuscaTurma(e.target.value)} placeholder="Buscar por curso, responsável, data ou código da turma..." /></div>
          <div className="courses-filters" role="group" aria-label="Filtrar turmas">
            {[['todas', 'TODAS'], ['ativas', 'ATIVAS'], ['inativas', 'INATIVAS']].map(([valor, texto]) => <button key={valor} type="button" className={filtroTurma === valor ? "is-selected" : ""} onClick={() => setFiltroTurma(valor)}>{texto}</button>)}
          </div>
        </div>
        {turmas.length === 0 ? <div className="courses-empty compact">Nenhuma turma cadastrada até o momento.</div> : turmasFiltradas.length === 0 ? <div className="courses-empty compact">Nenhuma turma corresponde à busca ou ao filtro selecionado.</div> : (
          <div className="courses-table-wrap">
            <table className="courses-table">
              <thead><tr><th>CURSO</th><th>RESPONSÁVEL</th><th>INÍCIO</th><th>TÉRMINO</th><th>VAGAS</th><th>STATUS</th><th>AÇÃO</th></tr></thead>
              <tbody>{turmasFiltradas.slice().sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)).map((turma) => {
                const curso = cursos.find((item) => item.id_curso === (turma.id_curso?.id_curso ?? turma.id_curso));
                const funcionarioId = turma.id_funcionario?.id_usuario ?? turma.id_funcionario;
                const funcionario = funcionarios.find((item) => item.id_usuario === funcionarioId);
                return <tr key={turma.id_turma}><td><strong>{curso?.nome || turma.id_curso?.nome || "Curso não identificado"}</strong></td><td>{funcionario?.nome || turma.id_funcionario?.nome || "—"}</td><td>{dataHora(turma.data_inicio)}</td><td>{dataHora(turma.data_fim)}</td><td>{turma.capacidade_maxima}</td><td><span className={`course-status ${turma.ativo === false ? "is-inactive" : ""}`}>{turma.ativo === false ? "INATIVA" : "ATIVA"}</span></td><td><button type="button" className="course-action-secondary" onClick={() => alterarStatusTurma(turma)}>{turma.ativo === false ? "REATIVAR" : "INATIVAR"}</button></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>

      {modalCurso && <div className="courses-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalCurso(false); }}>
        <form className="courses-modal" onSubmit={salvarCurso}>
          <div className="courses-modal-heading"><div><span>CADASTRO E INFORMAÇÕES</span><h2>{cursoEditando ? "EDITAR CURSO" : "NOVO CURSO"}</h2></div><button type="button" aria-label="Fechar" onClick={() => setModalCurso(false)}><Icon name="close" /></button></div>
          <label>Nome do curso<input required maxLength="150" value={formCurso.nome} onChange={(e) => setFormCurso({ ...formCurso, nome: e.target.value })} placeholder="Ex.: Design de sobrancelhas" /></label>
          <label>Descrição<textarea rows="4" value={formCurso.descricao} onChange={(e) => setFormCurso({ ...formCurso, descricao: e.target.value })} placeholder="Apresente o conteúdo e os diferenciais do curso..." /></label>
          <div className="courses-form-row"><label>Carga horária (horas)<input required type="number" min="1" step="1" value={formCurso.carga_horaria} onChange={(e) => setFormCurso({ ...formCurso, carga_horaria: e.target.value })} placeholder="Ex.: 16" /></label><label>Preço (R$)<input required type="number" min="0" step="0.01" value={formCurso.preco} onChange={(e) => setFormCurso({ ...formCurso, preco: e.target.value })} placeholder="0,00" /></label></div>
          <label className="courses-check"><input type="checkbox" checked={formCurso.ativo} onChange={(e) => setFormCurso({ ...formCurso, ativo: e.target.checked })} /> Curso disponível para novas turmas</label>
          <div className="courses-modal-actions"><button type="button" className="course-action-secondary" onClick={() => setModalCurso(false)}>CANCELAR</button><button type="submit" className="dash-primary-btn" disabled={salvando}>{salvando ? "SALVANDO..." : "SALVAR CURSO"}</button></div>
        </form>
      </div>}

      {modalTurma && <div className="courses-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalTurma(false); }}>
        <form className="courses-modal" onSubmit={salvarTurma}>
          <div className="courses-modal-heading"><div><span>ORGANIZAÇÃO DE AULAS</span><h2>NOVA TURMA</h2></div><button type="button" aria-label="Fechar" onClick={() => setModalTurma(false)}><Icon name="close" /></button></div>
          <label>Curso<select required value={formTurma.id_curso} onChange={(e) => setFormTurma({ ...formTurma, id_curso: e.target.value })}><option value="">Selecione um curso</option>{cursos.filter((curso) => curso.ativo !== false).map((curso) => <option key={curso.id_curso} value={curso.id_curso}>{curso.nome}</option>)}</select></label>
          <label>Responsável pela turma<select required value={formTurma.id_funcionario} onChange={(e) => setFormTurma({ ...formTurma, id_funcionario: e.target.value })}><option value="">Selecione um responsável</option>{funcionarios.map((pessoa) => <option key={pessoa.id_usuario} value={pessoa.id_usuario}>{pessoa.nome} ({pessoa.tipo})</option>)}</select>{funcionarios.length === 0 && <small>Não há administradores ou funcionários disponíveis para selecionar.</small>}</label>
          <div className="courses-form-row"><label>Data e horário de início<input required type="datetime-local" value={formTurma.data_inicio} onChange={(e) => setFormTurma({ ...formTurma, data_inicio: e.target.value })} /></label><label>Data e horário de término<input required type="datetime-local" value={formTurma.data_fim} onChange={(e) => setFormTurma({ ...formTurma, data_fim: e.target.value })} /></label></div>
          <label>Quantidade máxima de alunas<input required type="number" min="1" step="1" value={formTurma.capacidade_maxima} onChange={(e) => setFormTurma({ ...formTurma, capacidade_maxima: e.target.value })} /></label>
          <p className="courses-form-hint">O período cadastrado registra a data e o horário de início e término desta turma.</p>
          <div className="courses-modal-actions"><button type="button" className="course-action-secondary" onClick={() => setModalTurma(false)}>CANCELAR</button><button type="submit" className="dash-primary-btn" disabled={salvando || funcionarios.length === 0}>{salvando ? "SALVANDO..." : "CRIAR TURMA"}</button></div>
        </form>
      </div>}

      {confirmarExclusao && <div className="courses-modal-overlay"><div className="courses-confirm-modal"><div className="courses-modal-heading"><div><span>ATENÇÃO</span><h2>EXCLUIR CURSO?</h2></div><button type="button" aria-label="Fechar" onClick={() => setConfirmarExclusao(null)}><Icon name="close" /></button></div><p>Deseja realmente excluir <strong>{confirmarExclusao.nome}</strong>? Cursos que já possuem turmas vinculadas não podem ser removidos para preservar o histórico. Nesse caso, edite o curso e desative-o.</p><div className="courses-modal-actions"><button type="button" className="course-action-secondary" onClick={() => setConfirmarExclusao(null)}>CANCELAR</button><button type="button" className="course-action-danger" onClick={excluirCurso}>EXCLUIR CURSO</button></div></div></div>}

      {aviso && <div className="courses-toast-overlay" role="presentation"><div className={`courses-toast ${aviso.tipo}`} role="alert"><button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)}><Icon name="close" /></button><strong>{aviso.titulo}</strong><p>{aviso.mensagem}</p><button type="button" className="course-action-secondary" onClick={() => setAviso(null)}>FECHAR</button></div></div>}
    </main>
  );
}

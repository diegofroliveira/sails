"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Band = "parada" | "esfriando" | "alta" | "insuficiente";
type RiskState = "open" | "monitoring" | "none";
type View = "cockpit" | "students" | "detail";

type Student = {
  id: string;
  name: string;
  initials: string;
  track: string;
  progress: number;
  score: number | null;
  band: Band;
  riskState: RiskState;
  lastActivity: string;
  signals: string[];
  signalDetails: { title: string; detail: string; date: string }[];
  suggestion: string;
  message: string;
  timeline: { date: string; title: string; detail: string; tone?: "warm" }[];
};

const seedStudents: Student[] = [
  {
    id: "rafael",
    name: "Rafael Costa",
    initials: "RC",
    track: "Formação em Dados & IA",
    progress: 31,
    score: 18,
    band: "parada",
    riskState: "open",
    lastActivity: "há 14 dias",
    signals: ["14 dias sem atividade", "Projeto do módulo 2 pendente", "Ritmo 34% abaixo do planejado"],
    signalDetails: [
      { title: "Última atividade há 14 dias", detail: "Nenhum avanço ou entrega desde 6 de julho.", date: "6 jul" },
      { title: "Projeto do módulo 2 pendente", detail: "A entrega venceu e ainda não foi iniciada.", date: "12 jul" },
      { title: "Ritmo abaixo do planejado", detail: "Concluiu 2 de 6 unidades previstas na janela.", date: "20 jul" },
    ],
    suggestion: "Faça um check-in pessoal e ofereça uma conversa curta para remover o bloqueio do projeto.",
    message: "Oi, Rafael! Vi que você parou no projeto do módulo 2. Quer me contar onde travou? Posso te ajudar a definir o próximo passo e, se preferir, marcamos 15 minutos.",
    timeline: [
      { date: "20 jul", title: "Sinal de atenção criado", detail: "Três sinais objetivos pedem uma ação do mentor.", tone: "warm" },
      { date: "12 jul", title: "Entrega venceu", detail: "Projeto prático do módulo 2." },
      { date: "6 jul", title: "Última atividade", detail: "Aula “Preparando os dados” iniciada." },
    ],
  },
  {
    id: "marina",
    name: "Marina Lopes",
    initials: "ML",
    track: "Formação em Dados & IA",
    progress: 48,
    score: 42,
    band: "esfriando",
    riskState: "open",
    lastActivity: "há 8 dias",
    signals: ["8 dias sem atividade", "1 entrega pendente", "Ritmo 22% abaixo do planejado"],
    signalDetails: [
      { title: "Última atividade há 8 dias", detail: "A frequência caiu em relação às duas semanas anteriores.", date: "12 jul" },
      { title: "Uma entrega pendente", detail: "O exercício de modelagem venceu há 3 dias.", date: "17 jul" },
      { title: "Ritmo em queda", detail: "Avanço recente abaixo do plano da trilha.", date: "20 jul" },
    ],
    suggestion: "Pergunte onde o projeto travou e combine um próximo passo pequeno e concreto.",
    message: "Oi, Marina! Notei que o exercício de modelagem ficou pendente. Tem algum bloqueio específico em que eu possa ajudar? Podemos combinar um próximo passo simples.",
    timeline: [
      { date: "20 jul", title: "Sinal de esfriamento", detail: "Inatividade e entrega pendente se combinaram.", tone: "warm" },
      { date: "17 jul", title: "Entrega venceu", detail: "Exercício de modelagem dimensional." },
      { date: "12 jul", title: "Última atividade", detail: "Concluiu a aula sobre fatos e dimensões." },
    ],
  },
  {
    id: "joao",
    name: "João Mendes",
    initials: "JM",
    track: "Formação em Dados & IA",
    progress: 63,
    score: 55,
    band: "esfriando",
    riskState: "open",
    lastActivity: "há 5 dias",
    signals: ["2 aulas não concluídas", "5 dias sem avanço", "Próximo passo indefinido"],
    signalDetails: [
      { title: "Duas aulas ficaram pela metade", detail: "As sessões foram iniciadas, mas sem conclusão.", date: "15 jul" },
      { title: "Cinco dias sem avanço", detail: "Houve acesso, mas nenhum evento significativo.", date: "15 jul" },
      { title: "Próximo passo indefinido", detail: "Nenhuma atividade foi retomada após o último acesso.", date: "20 jul" },
    ],
    suggestion: "Recomende uma única aula para retomar o ritmo, sem adicionar novas tarefas.",
    message: "Oi, João! Vi que duas aulas ficaram pela metade. Que tal retomar apenas a aula de pipelines esta semana? Se algo travou, me conta que eu ajudo.",
    timeline: [
      { date: "20 jul", title: "Sinal de esfriamento", detail: "Aulas iniciadas sem avanço posterior.", tone: "warm" },
      { date: "15 jul", title: "Última atividade", detail: "Aula de pipelines iniciada." },
    ],
  },
  {
    id: "elisa",
    name: "Elisa Moura",
    initials: "EM",
    track: "Formação em Dados & IA",
    progress: 57,
    score: 69,
    band: "esfriando",
    riskState: "monitoring",
    lastActivity: "ontem",
    signals: ["Check-in em 12 jul", "Nova entrega em 18 jul", "Sinais de retomada"],
    signalDetails: [
      { title: "Check-in registrado", detail: "O mentor ofereceu ajuda para remover o bloqueio.", date: "12 jul" },
      { title: "Nova entrega observada", detail: "A atividade ocorreu depois do check-in, sem atribuição causal.", date: "18 jul" },
      { title: "Ainda em monitoramento", detail: "A chama só muda após uma janela estável de atividade.", date: "20 jul" },
    ],
    suggestion: "Acompanhe por mais sete dias antes de encerrar o caso.",
    message: "Oi, Elisa! Que bom ver seu avanço de volta. Como está o ritmo agora? Posso ajudar com o próximo módulo.",
    timeline: [
      { date: "20 jul", title: "Sinais de retomada", detail: "Nova atividade em dois dias distintos; caso segue em monitoramento.", tone: "warm" },
      { date: "18 jul", title: "Entrega concluída", detail: "Exercício de transformação de dados." },
      { date: "12 jul", title: "Check-in registrado", detail: "Contato manual do mentor; mensagem não enviada pela Vela." },
    ],
  },
  { id: "ana", name: "Ana Beatriz", initials: "AB", track: "Formação em Dados & IA", progress: 82, score: 88, band: "alta", riskState: "none", lastActivity: "ontem", signals: ["Entregas em dia", "Ritmo consistente"], signalDetails: [{ title: "No ritmo esperado", detail: "Atividade e entregas seguem o plano da trilha.", date: "20 jul" }], suggestion: "Nenhuma ação necessária agora.", message: "", timeline: [{ date: "19 jul", title: "Entrega concluída", detail: "Projeto do módulo 5." }] },
  { id: "bruno", name: "Bruno Vieira", initials: "BV", track: "SQL para Analytics", progress: 76, score: 78, band: "alta", riskState: "none", lastActivity: "hoje", signals: ["Ativo hoje", "Ritmo consistente"], signalDetails: [{ title: "No ritmo esperado", detail: "Três avanços significativos nesta semana.", date: "20 jul" }], suggestion: "Nenhuma ação necessária agora.", message: "", timeline: [{ date: "20 jul", title: "Aula concluída", detail: "Window functions." }] },
  { id: "carla", name: "Carla Nunes", initials: "CN", track: "SQL para Analytics", progress: 69, score: 73, band: "alta", riskState: "none", lastActivity: "há 2 dias", signals: ["Entregas em dia", "Ritmo estável"], signalDetails: [{ title: "No ritmo esperado", detail: "Sem sinais que peçam ação.", date: "20 jul" }], suggestion: "Nenhuma ação necessária agora.", message: "", timeline: [{ date: "18 jul", title: "Entrega concluída", detail: "Desafio de consultas." }] },
  { id: "davi", name: "Davi Freitas", initials: "DF", track: "Formação em Dados & IA", progress: 8, score: null, band: "insuficiente", riskState: "none", lastActivity: "há 2 dias", signals: ["4 dias de histórico", "Coletando dados"], signalDetails: [{ title: "Histórico insuficiente", detail: "A matrícula começou há 4 dias; ainda não há base para classificar.", date: "20 jul" }], suggestion: "Aguarde mais sinais antes de intervir.", message: "", timeline: [{ date: "16 jul", title: "Matrícula iniciada", detail: "Primeiro módulo liberado." }] },
];

const bandInfo: Record<Band, { label: string; icon: string }> = {
  parada: { label: "Pede atenção", icon: "!" },
  esfriando: { label: "Esfriando", icon: "↘" },
  alta: { label: "No ritmo", icon: "✓" },
  insuficiente: { label: "Coletando dados", icon: "·" },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width={compact ? 20 : 24} height={compact ? 25 : 30} viewBox="0 0 100 125" fill="none">
        <path d="M50 6 C 28 24, 16 46, 20 66 C 23 84, 36 100, 50 100 C 62 100, 72 90, 71 76 C 70.5 68, 65 63, 59 65 C 65 50, 58 24, 50 6 Z" fill="currentColor" />
        {!compact && <line x1="50" y1="100" x2="50" y2="118" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
      </svg>
    </span>
  );
}

function StatusBadge({ student }: { student: Student }) {
  const status = student.riskState === "monitoring" ? { label: "Em acompanhamento", icon: "◌" } : bandInfo[student.band];
  return <span className={`status status-${student.riskState === "monitoring" ? "monitoring" : student.band}`}><span aria-hidden="true">{status.icon}</span>{status.label}</span>;
}

export default function Home() {
  const [students, setStudents] = useState(seedStudents);
  const [view, setView] = useState<View>("cockpit");
  const [selectedId, setSelectedId] = useState("rafael");
  const [filter, setFilter] = useState<"all" | Band | "attention">("all");
  const [query, setQuery] = useState("");
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const selected = students.find((student) => student.id === selectedId) ?? students[0];
  const openCases = students.filter((student) => student.riskState === "open");
  const monitoring = students.filter((student) => student.riskState === "monitoring");
  const urgent = students.filter((student) => student.riskState === "open" || student.riskState === "monitoring");

  const filtered = useMemo(() => students.filter((student) => {
    const matchesQuery = `${student.name} ${student.track}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"));
    const matchesFilter = filter === "all" || (filter === "attention" ? student.riskState === "open" : student.band === filter);
    return matchesQuery && matchesFilter;
  }).sort((a, b) => {
    const rank = (s: Student) => s.riskState === "open" ? (s.band === "parada" ? 0 : 1) : s.riskState === "monitoring" ? 2 : s.band === "alta" ? 3 : 4;
    return rank(a) - rank(b);
  }), [students, query, filter]);

  useEffect(() => {
    if (!dialogId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDialogId(null); setMessage(""); }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, textarea"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [dialogId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(next: View, id?: string) {
    if (id) setSelectedId(id);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openCheckIn(student: Student) {
    if (student.riskState === "monitoring") {
      setToast("Este aluno já está em acompanhamento.");
      return;
    }
    setSelectedId(student.id);
    setMessage(student.message);
    setDialogId(student.id);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setToast("Mensagem copiada. O check-in ainda não foi registrado.");
    } catch {
      setToast("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  function registerCheckIn() {
    if (!dialogId) return;
    setStudents((current) => current.map((student) => student.id === dialogId ? {
      ...student,
      riskState: "monitoring",
      timeline: [{ date: "20 jul", title: "Check-in registrado", detail: "Ação manual do mentor; nenhuma mensagem foi enviada pela Vela.", tone: "warm" }, ...student.timeline],
    } : student));
    setDialogId(null);
    setMessage("");
    setToast("Check-in registrado. Agora vamos acompanhar os próximos sinais.");
  }

  function resetDemo() {
    setStudents(seedStudents);
    setView("cockpit");
    setSelectedId("rafael");
    setFilter("all");
    setQuery("");
    setMessage("");
    setToast("Demonstração reiniciada.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("cockpit")} aria-label="Vela — ir ao cockpit">
          <BrandMark />
          <span>Vela</span>
        </button>
        <nav aria-label="Navegação principal">
          <button className={view === "cockpit" ? "nav-active" : ""} onClick={() => navigate("cockpit")}><span aria-hidden="true">⌂</span> Cockpit</button>
          <button className={view === "students" || view === "detail" ? "nav-active" : ""} onClick={() => navigate("students")}><span aria-hidden="true">◎</span> Alunos <em>{openCases.length}</em></button>
        </nav>
        <div className="sidebar-foot">
          <div className="tenant"><span className="avatar small">D</span><span><strong>Mentoria Dados & IA</strong><small>Diego · mentor</small></span></div>
          <button className="reset-link" onClick={resetDemo}>Reiniciar demonstração</button>
        </div>
      </aside>

      <div className="workspace">
        <div className="demo-banner" role="note">
          <span><strong>Demonstração</strong> · Dados fictícios. Não insira dados pessoais ou confidenciais. Nenhuma IA analisa alunos em tempo real.</span>
          <span className="demo-date">20 jul 2026</span>
        </div>
        <header className="mobile-header">
          <button className="brand" onClick={() => navigate("cockpit")} aria-label="Vela — ir ao cockpit"><BrandMark compact /><span>Vela</span></button>
          <span className="mobile-count">{openCases.length} pedem atenção</span>
        </header>

        <main>
          {view === "cockpit" && (
            <section className="page" aria-labelledby="cockpit-title">
              <div className="page-heading cockpit-heading">
                <div>
                  <p className="eyebrow">Segunda-feira · visão de retenção</p>
                  <h1 id="cockpit-title">{openCases.length} alunos precisam de você hoje</h1>
                  <p>Comece por quem acumula mais sinais de perda de ritmo.</p>
                </div>
                <span className="updated"><i /> Cenário-base · 20 jul 2026</span>
              </div>

              <div className="cockpit-grid">
                <div className="attention-panel">
                  <div className="section-title"><div><span className="section-kicker">Sua fila de cuidado</span><h2>Quem precisa de atenção</h2></div><span>{openCases.length} aguardando ação</span></div>
                  {urgent.length ? urgent.map((student, index) => (
                    <article className={`attention-card ${student.riskState === "monitoring" ? "is-monitoring" : ""}`} key={student.id}>
                      <span className="priority">{String(index + 1).padStart(2, "0")}</span>
                      <div className="student-main">
                        <div className="student-line"><span className="avatar">{student.initials}</span><div><h3>{student.name}</h3><p>{student.track}</p></div></div>
                        <StatusBadge student={student} />
                      </div>
                      <ul className="signal-list">
                        {student.signals.slice(0, 3).map((signal) => <li key={signal}><span aria-hidden="true">—</span>{signal}</li>)}
                      </ul>
                      <div className="card-actions">
                        {student.riskState === "open" ? <button className="button primary" onClick={() => openCheckIn(student)}>Fazer check-in</button> : <span className="monitor-note">Aguardando novos sinais</span>}
                        <button className="button ghost" onClick={() => navigate("detail", student.id)}>Ver detalhes <span aria-hidden="true">→</span></button>
                      </div>
                    </article>
                  )) : <div className="empty"><span>✓</span><h3>Nenhuma chama pede atenção agora.</h3><p>A turma está no ritmo. Continue acompanhando os sinais.</p></div>}
                </div>

                <aside className="pulse-panel">
                  <span className="section-kicker">Visão geral</span>
                  <h2>Pulso da turma</h2>
                  <p className="pulse-copy">8 alunos neste cenário demonstrativo</p>
                  <div className="pulse-list">
                    <div><span className="pulse-icon on">✓</span><span><strong>3</strong><small>no ritmo</small></span></div>
                    <div><span className="pulse-icon cooling">↘</span><span><strong>2</strong><small>esfriando</small></span></div>
                    <div><span className="pulse-icon attention">!</span><span><strong>1</strong><small>parado</small></span></div>
                    <div><span className="pulse-icon monitoring">◌</span><span><strong>{monitoring.length}</strong><small>em acompanhamento</small></span></div>
                    <div><span className="pulse-icon data">·</span><span><strong>1</strong><small>coletando dados</small></span></div>
                  </div>
                  <div className="principle"><BrandMark compact /><p><strong>Indicador, não previsão.</strong> A situação resume atividade, entregas e ritmo. Cada alerta mostra os fatos usados.</p></div>
                  <button className="button wide" onClick={() => navigate("students")}>Ver todos os alunos <span aria-hidden="true">→</span></button>
                </aside>
              </div>
            </section>
          )}

          {view === "students" && (
            <section className="page" aria-labelledby="students-title">
              <div className="page-heading">
                <div><p className="eyebrow">Sua turma</p><h1 id="students-title">Alunos</h1><p>Encontre sinais antes que virem desistência.</p></div>
                <span className="student-total">8 alunos na demonstração</span>
              </div>
              <div className="student-tools">
                <label className="search"><span className="sr-only">Buscar alunos</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou trilha" /></label>
                <div className="filters" aria-label="Filtrar por situação">
                  {([['all','Todos'],['attention','Pedem atenção'],['esfriando','Esfriando'],['alta','No ritmo']] as const).map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
                </div>
              </div>
              <div className="result-meta"><span>{filtered.length} exibidos · {openCases.length} precisam de atenção</span><span>Ordenado por urgência</span></div>
              {filtered.length ? (
                <div className="student-table-wrap">
                  <table className="student-table">
                    <thead><tr><th>Aluno</th><th>Trilha</th><th>Última atividade</th><th>Progresso</th><th>Situação</th><th><span className="sr-only">Ação</span></th></tr></thead>
                    <tbody>{filtered.map((student) => <tr key={student.id}>
                      <td><button className="student-cell" onClick={() => navigate("detail", student.id)}><span className="avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.signals[0]}</small></span></button></td>
                      <td>{student.track}</td><td>{student.lastActivity}</td>
                      <td><div className="progress-cell"><span>{student.progress}%</span><i><b style={{ width: `${student.progress}%` }} /></i></div></td>
                      <td><StatusBadge student={student} /></td><td><button className="row-action" onClick={() => navigate("detail", student.id)} aria-label={`Ver ${student.name}`}>→</button></td>
                    </tr>)}</tbody>
                  </table>
                  <div className="student-cards">{filtered.map((student) => <article key={student.id}><div className="student-main"><div className="student-line"><span className="avatar">{student.initials}</span><div><h3>{student.name}</h3><p>{student.track}</p></div></div><StatusBadge student={student} /></div><p className="mobile-signal">{student.signals[0]}</p><div className="mobile-card-foot"><span>{student.progress}% concluído · {student.lastActivity}</span><button onClick={() => navigate("detail", student.id)}>Ver aluno →</button></div></article>)}</div>
                </div>
              ) : <div className="empty search-empty"><span>⌕</span><h3>Nenhum aluno corresponde a esses filtros.</h3><button className="button ghost" onClick={() => { setQuery(""); setFilter("all"); }}>Limpar filtros</button></div>}
            </section>
          )}

          {view === "detail" && selected && (
            <section className="page" aria-labelledby="student-title">
              <button className="back-link" onClick={() => navigate("students")}><span aria-hidden="true">←</span> Voltar para alunos</button>
              <div className="detail-head">
                <div className="student-line large"><span className="avatar large">{selected.initials}</span><div><p className="eyebrow">{selected.track}</p><h1 id="student-title">{selected.name}</h1><StatusBadge student={selected} /></div></div>
                {selected.riskState === "open" && <button className="button primary" onClick={() => openCheckIn(selected)}>Fazer check-in</button>}
              </div>
              <p className="detail-note">A situação é calculada com atividade, entregas e ritmo. Um check-in não altera a chama imediatamente.</p>
              <div className="detail-grid">
                <div>
                  <section className="detail-card evidence-card">
                    <div className="section-title"><div><span className="section-kicker">Evidências</span><h2>O que mudou</h2></div>{selected.score !== null && <span className="score"><strong>{selected.score}</strong>/100 <small>indicador demo</small></span>}</div>
                    <div className="evidence-list">{selected.signalDetails.map((signal, index) => <article key={signal.title}><span className="evidence-number">0{index + 1}</span><div><h3>{signal.title}</h3><p>{signal.detail}</p></div><time>{signal.date}</time></article>)}</div>
                  </section>
                  <section className="detail-card timeline-card"><span className="section-kicker">Atividade recente</span><h2>Histórico</h2><div className="timeline">{selected.timeline.map((event, index) => <article key={`${event.date}-${event.title}-${index}`} className={event.tone === "warm" ? "warm" : ""}><time>{event.date}</time><span className="timeline-dot" /><div><h3>{event.title}</h3><p>{event.detail}</p></div></article>)}</div></section>
                </div>
                <aside>
                  <section className="detail-card next-step"><span className="section-kicker">Ação recomendada</span><h2>Próximo passo</h2><p>{selected.suggestion}</p>{selected.riskState === "open" && <button className="button primary wide" onClick={() => openCheckIn(selected)}>Preparar check-in</button>}{selected.riskState === "monitoring" && <div className="monitor-box"><span>◌</span><p><strong>Em acompanhamento</strong>O indicador só muda após nova atividade do aluno.</p></div>}</section>
                  <section className="detail-card track-progress"><span className="section-kicker">Trilha</span><h2>{selected.track}</h2><div className="progress-value"><strong>{selected.progress}%</strong><span>concluído</span></div><div className="track-bar"><span style={{ width: `${selected.progress}%` }} /></div><p>Progresso registrado até 20 de julho.</p></section>
                </aside>
              </div>
            </section>
          )}
        </main>

        <nav className="mobile-nav" aria-label="Navegação principal móvel">
          <button className={view === "cockpit" ? "nav-active" : ""} onClick={() => navigate("cockpit")}><span>⌂</span>Cockpit</button>
          <button className={view === "students" || view === "detail" ? "nav-active" : ""} onClick={() => navigate("students")}><span>◎</span>Alunos</button>
        </nav>
      </div>

      {dialogId && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setDialogId(null); setMessage(""); } }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="checkin-title" ref={dialogRef}>
            <div className="modal-top"><div><p className="eyebrow">Ação do mentor</p><h2 id="checkin-title">Check-in com {selected.name.split(" ")[0]}</h2></div><button ref={closeRef} className="close-button" onClick={() => { setDialogId(null); setMessage(""); }} aria-label="Fechar">×</button></div>
            <p className="modal-context">{selected.signals.slice(0, 2).join(" · ")}</p>
            <label className="message-label"><span>Mensagem sugerida</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} aria-describedby="message-safety" /><small id="message-safety">Use apenas conteúdo fictício. Não insira dados pessoais ou confidenciais; copiar transfere o texto ao clipboard deste dispositivo.</small></label>
            <div className="modal-disclosure"><span aria-hidden="true">i</span><p>A Vela não enviará esta mensagem. Você pode copiá-la e registrar que fez o contato manualmente.</p></div>
            <div className="modal-actions"><button className="button ghost" onClick={() => { setDialogId(null); setMessage(""); }}>Cancelar</button><button className="button copy" onClick={copyMessage}>Copiar mensagem</button><button className="button primary" onClick={registerCheckIn}>Registrar check-in na demo</button></div>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

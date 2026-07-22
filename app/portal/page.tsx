"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Band = "parada" | "esfriando" | "alta" | "insuficiente";
type RiskState = "open" | "monitoring" | "none";
type View = "cockpit" | "students" | "detail" | "courses" | "course-builder" | "marketing";
type Theme = "light" | "dark";

type LeadStage = "Novos" | "Conversa" | "Proposta" | "Fechado";
type Lead = {
  id: string;
  name: string;
  initials: string;
  source: string;
  interest: string;
  value: string;
  temperature: "Quente" | "Morno" | "Novo";
  stage: LeadStage;
  nextAction: string;
  age: string;
};

const seedLeads: Lead[] = [
  { id: "lucas", name: "Lucas Almeida", initials: "LA", source: "Webinar", interest: "Formação em Dados & IA", value: "R$ 2.490", temperature: "Quente", stage: "Novos", nextAction: "Responder interesse", age: "há 18 min" },
  { id: "beatriz", name: "Beatriz Ramos", initials: "BR", source: "Instagram", interest: "SQL para Analytics", value: "R$ 997", temperature: "Novo", stage: "Novos", nextAction: "Qualificar perfil", age: "há 2h" },
  { id: "felipe", name: "Felipe Santos", initials: "FS", source: "Indicação", interest: "Formação em Dados & IA", value: "R$ 2.490", temperature: "Quente", stage: "Conversa", nextAction: "Call hoje · 16h", age: "há 1 dia" },
  { id: "natalia", name: "Natália Cruz", initials: "NC", source: "Landing page", interest: "Formação em Dados & IA", value: "R$ 2.490", temperature: "Morno", stage: "Conversa", nextAction: "Enviar diagnóstico", age: "há 2 dias" },
  { id: "camila", name: "Camila Rocha", initials: "CR", source: "YouTube", interest: "SQL para Analytics", value: "R$ 997", temperature: "Morno", stage: "Conversa", nextAction: "Follow-up amanhã", age: "há 3 dias" },
  { id: "andre", name: "André Lima", initials: "AL", source: "Webinar", interest: "Formação em Dados & IA", value: "R$ 2.490", temperature: "Quente", stage: "Proposta", nextAction: "Proposta vence hoje", age: "há 4 dias" },
  { id: "juliana", name: "Juliana Pires", initials: "JP", source: "Indicação", interest: "SQL para Analytics", value: "R$ 997", temperature: "Morno", stage: "Proposta", nextAction: "Tirar dúvida de pagamento", age: "há 5 dias" },
  { id: "marcos", name: "Marcos Reis", initials: "MR", source: "Instagram", interest: "Formação em Dados & IA", value: "R$ 2.490", temperature: "Quente", stage: "Fechado", nextAction: "Enviar boas-vindas", age: "hoje" },
];

type CourseLesson = {
  id: string;
  title: string;
  type: "video" | "text" | "quiz" | "live";
  duration?: string;
  published: boolean;
};

type CourseModule = {
  title: string;
  lessons: CourseLesson[];
};

const courseModules: CourseModule[] = [
  {
    title: "01 · Fundamentos",
    lessons: [
      { id: "boas-vindas", title: "Boas-vindas e como usar a trilha", type: "video", duration: "08:42", published: true },
      { id: "mapa", title: "O mapa da formação", type: "text", duration: "6 min", published: true },
      { id: "diagnostico", title: "Diagnóstico inicial", type: "quiz", duration: "10 perguntas", published: true },
    ],
  },
  {
    title: "02 · Dados na prática",
    lessons: [
      { id: "preparando", title: "Preparando os dados", type: "video", duration: "24:10", published: true },
      { id: "modelagem", title: "Modelagem dimensional", type: "video", duration: "31:05", published: true },
      { id: "projeto-2", title: "Projeto do módulo", type: "quiz", duration: "Entrega", published: true },
    ],
  },
  {
    title: "03 · IA aplicada",
    lessons: [
      { id: "llm", title: "LLMs no fluxo de dados", type: "video", duration: "27:30", published: false },
      { id: "lab", title: "Laboratório ao vivo", type: "live", duration: "23 jul · 19h", published: false },
    ],
  },
];

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
      { date: "12 jul", title: "Check-in registrado", detail: "Contato manual do mentor; mensagem não enviada pela Sails." },
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
  const [leads, setLeads] = useState(seedLeads);
  const [view, setView] = useState<View>("cockpit");
  const [selectedId, setSelectedId] = useState("rafael");
  const [filter, setFilter] = useState<"all" | Band | "attention">("all");
  const [query, setQuery] = useState("");
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [activeLessonId, setActiveLessonId] = useState("boas-vindas");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [studentPreview, setStudentPreview] = useState(false);
  const [marketingMode, setMarketingMode] = useState<"pipeline" | "leads">("pipeline");
  const [leadQuery, setLeadQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const selected = students.find((student) => student.id === selectedId) ?? students[0];
  const openCases = students.filter((student) => student.riskState === "open");
  const monitoring = students.filter((student) => student.riskState === "monitoring");
  const urgent = students.filter((student) => student.riskState === "open" || student.riskState === "monitoring");
  const allLessons = courseModules.flatMap((module) => module.lessons);
  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) ?? allLessons[0];
  const visibleLeads = leads.filter((lead) => `${lead.name} ${lead.source} ${lead.interest}`.toLocaleLowerCase("pt-BR").includes(leadQuery.toLocaleLowerCase("pt-BR")));

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

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

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
      timeline: [{ date: "20 jul", title: "Check-in registrado", detail: "Ação manual do mentor; nenhuma mensagem foi enviada pela Sails.", tone: "warm" }, ...student.timeline],
    } : student));
    setDialogId(null);
    setMessage("");
    setToast("Check-in registrado. Agora vamos acompanhar os próximos sinais.");
  }

  function resetDemo() {
    setStudents(seedStudents);
    setLeads(seedLeads);
    setView("cockpit");
    setSelectedId("rafael");
    setFilter("all");
    setQuery("");
    setMessage("");
    setTheme("light");
    setVideoUrl(null);
    setVideoName("");
    setStudentPreview(false);
    setMarketingMode("pipeline");
    setLeadQuery("");
    setToast("Demonstração reiniciada.");
  }

  function chooseVideo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setToast("Escolha um arquivo de vídeo compatível.");
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
    setToast("Vídeo carregado para prévia local.");
  }

  function advanceLead(lead: Lead) {
    const stages: LeadStage[] = ["Novos", "Conversa", "Proposta", "Fechado"];
    const next = stages[Math.min(stages.indexOf(lead.stage) + 1, stages.length - 1)];
    if (next === lead.stage) {
      setToast(`${lead.name} já está em Fechado.`);
      return;
    }
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, stage: next, nextAction: next === "Conversa" ? "Agendar conversa" : next === "Proposta" ? "Preparar proposta" : "Enviar boas-vindas" } : item));
    setToast(`${lead.name} avançou para ${next}.`);
  }

  function addDemoLead() {
    if (leads.some((lead) => lead.id === "gabriela")) {
      setToast("O lead demonstrativo já foi adicionado.");
      return;
    }
    setLeads((current) => [{ id: "gabriela", name: "Gabriela Matos", initials: "GM", source: "Landing page", interest: "Formação em Dados & IA", value: "R$ 2.490", temperature: "Novo", stage: "Novos", nextAction: "Qualificar perfil", age: "agora" }, ...current]);
    setToast("Lead fictício adicionado ao funil.");
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("cockpit")} aria-label="Sails — ir ao cockpit">
          <BrandMark />
          <span>Sails</span>
        </button>
        <nav aria-label="Navegação principal">
          <button className={view === "cockpit" ? "nav-active" : ""} onClick={() => navigate("cockpit")}><span aria-hidden="true">⌂</span> Cockpit</button>
          <button className={view === "students" || view === "detail" ? "nav-active" : ""} onClick={() => navigate("students")}><span aria-hidden="true">◎</span> Alunos <em>{openCases.length}</em></button>
          <button className={view === "courses" || view === "course-builder" ? "nav-active" : ""} onClick={() => navigate("courses")}><span aria-hidden="true">▷</span> Cursos</button>
          <button className={view === "marketing" ? "nav-active" : ""} onClick={() => navigate("marketing")}><span aria-hidden="true">◇</span> Marketing <em>{leads.filter((lead) => lead.stage === "Novos").length}</em></button>
        </nav>
        <div className="sidebar-foot">
          <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={theme === "light" ? "Ativar modo noturno" : "Ativar modo claro"}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span><span>{theme === "light" ? "Modo noturno" : "Modo claro"}</span></button>
          <Link className="site-link" href="/">↗ <span>Ver landing page</span></Link>
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
          <button className="brand" onClick={() => navigate("cockpit")} aria-label="Sails — ir ao cockpit"><BrandMark compact /><span>Sails</span></button>
          <button className="mobile-theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={theme === "light" ? "Ativar modo noturno" : "Ativar modo claro"}>{theme === "light" ? "☾" : "☀"}</button>
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

          {view === "courses" && (
            <section className="page courses-page" aria-labelledby="courses-title">
              <div className="page-heading">
                <div><p className="eyebrow">Conteúdo e experiência</p><h1 id="courses-title">Cursos</h1><p>Construa a trilha, publique aulas e acompanhe onde os alunos travam.</p></div>
                <button className="button primary" onClick={() => setToast("Novo curso será criado na próxima etapa da demonstração.")}>+ Novo curso</button>
              </div>

              <div className="course-summary">
                <div><strong>2</strong><span>cursos ativos</span></div>
                <div><strong>14</strong><span>módulos</span></div>
                <div><strong>42</strong><span>aulas publicadas</span></div>
                <div><strong>68%</strong><span>conclusão média</span></div>
              </div>

              <div className="course-grid">
                <article className="course-card featured-course">
                  <div className="course-cover"><BrandMark /><span>Dados & IA</span><small>Formação completa</small></div>
                  <div className="course-card-body">
                    <div className="course-card-top"><span className="published-pill">Publicado</span><button aria-label="Mais opções">•••</button></div>
                    <h2>Formação em Dados & IA</h2>
                    <p>Da fundação ao primeiro projeto aplicado, com encontros ao vivo e acompanhamento.</p>
                    <div className="course-progress"><span><strong>32</strong> alunos</span><span><strong>6</strong> módulos</span><span><strong>24</strong> aulas</span></div>
                    <div className="course-health"><span>Conclusão média</span><strong>64%</strong><i><b style={{ width: "64%" }} /></i></div>
                    <button className="button course-edit" onClick={() => navigate("course-builder")}>Editar conteúdo <span aria-hidden="true">→</span></button>
                  </div>
                </article>

                <article className="course-card">
                  <div className="course-cover sql"><span>SQL</span><small>Analytics na prática</small></div>
                  <div className="course-card-body">
                    <div className="course-card-top"><span className="published-pill">Publicado</span><button aria-label="Mais opções">•••</button></div>
                    <h2>SQL para Analytics</h2>
                    <p>Consultas, modelagem e desafios para quem quer trabalhar com dados.</p>
                    <div className="course-progress"><span><strong>18</strong> alunos</span><span><strong>4</strong> módulos</span><span><strong>18</strong> aulas</span></div>
                    <div className="course-health"><span>Conclusão média</span><strong>76%</strong><i><b style={{ width: "76%" }} /></i></div>
                    <button className="button course-edit" onClick={() => { setActiveLessonId("preparando"); navigate("course-builder"); }}>Editar conteúdo <span aria-hidden="true">→</span></button>
                  </div>
                </article>

                <button className="new-course-card" onClick={() => setToast("Novo curso será criado na próxima etapa da demonstração.")}><span>+</span><strong>Criar novo curso</strong><small>Comece do zero ou use uma estrutura sugerida.</small></button>
              </div>

              <section className="foundation-card">
                <div><span className="section-kicker">Fundação de produto</span><h2>O básico que uma plataforma de cursos precisa ter</h2><p>A Sails mantém retenção como diferencial, mas agora organiza a base que sustenta a experiência.</p></div>
                <ul>
                  <li className="done">Vídeos, textos e materiais</li><li className="done">Módulos e aulas ordenáveis</li><li className="done">Quiz e entregas</li><li className="done">Liberação programada</li><li>Certificados</li><li>Comunidade e agenda</li><li>Checkout e assinaturas</li><li>Cupons e afiliados</li>
                </ul>
              </section>
            </section>
          )}

          {view === "course-builder" && (
            <section className={`page builder-page ${studentPreview ? "student-preview" : ""}`} aria-labelledby="builder-title">
              <button className="back-link" onClick={() => { setStudentPreview(false); navigate("courses"); }}><span aria-hidden="true">←</span> Voltar para cursos</button>
              <div className="builder-head">
                <div><p className="eyebrow">{studentPreview ? "Visão do aluno" : "Editor do curso"}</p><h1 id="builder-title">Formação em Dados & IA</h1><p>{studentPreview ? "Veja exatamente como a aula será entregue." : "6 módulos · 24 aulas · última edição hoje"}</p></div>
                <div className="builder-actions">
                  <button className="button" onClick={() => setStudentPreview(!studentPreview)}>{studentPreview ? "Sair da prévia" : "Visualizar como aluno"}</button>
                  {!studentPreview && <button className="button primary" onClick={() => setToast("Alterações salvas apenas nesta demonstração.")}>Salvar alterações</button>}
                </div>
              </div>

              <div className="builder-shell">
                <aside className="curriculum-panel">
                  <div className="curriculum-title"><div><span className="section-kicker">Currículo</span><h2>Conteúdo do curso</h2></div>{!studentPreview && <button onClick={() => setToast("Novo módulo adicionado à demonstração.")} aria-label="Adicionar módulo">+</button>}</div>
                  <div className="module-list">
                    {courseModules.map((module) => <section key={module.title} className="course-module"><h3>{module.title}<span>{module.lessons.length} aulas</span></h3>{module.lessons.map((lesson) => <button key={lesson.id} className={activeLessonId === lesson.id ? "lesson-active" : ""} onClick={() => setActiveLessonId(lesson.id)}><span className={`lesson-type type-${lesson.type}`} aria-hidden="true">{lesson.type === "video" ? "▶" : lesson.type === "quiz" ? "?" : lesson.type === "live" ? "●" : "≡"}</span><span><strong>{lesson.title}</strong><small>{lesson.duration} · {lesson.published ? "Publicado" : "Rascunho"}</small></span>{!studentPreview && <i aria-hidden="true">⋮⋮</i>}</button>)}</section>)}
                  </div>
                  {!studentPreview && <button className="add-lesson" onClick={() => setToast("Nova aula adicionada à demonstração.")}>+ Adicionar aula</button>}
                </aside>

                <div className="lesson-editor">
                  <div className="lesson-editor-head"><div><span className="section-kicker">{activeLesson.type === "video" ? "Videoaula" : activeLesson.type === "quiz" ? "Avaliação" : activeLesson.type === "live" ? "Encontro ao vivo" : "Conteúdo"}</span><h2>{activeLesson.title}</h2></div><span className={activeLesson.published ? "published-pill" : "draft-pill"}>{activeLesson.published ? "Publicado" : "Rascunho"}</span></div>

                  {activeLesson.type === "video" ? (
                    <div className="video-block">
                      {videoUrl ? <video src={videoUrl} controls playsInline aria-label={`Prévia de ${videoName}`} /> : <div className="video-placeholder"><span className="video-play">▶</span><strong>Adicione o vídeo desta aula</strong><p>Envie um arquivo para testar o player agora. Nada sai deste dispositivo.</p><label className="button primary upload-button">Escolher vídeo<input type="file" accept="video/mp4,video/quicktime,video/x-m4v,video/webm" onChange={(event) => chooseVideo(event.target.files?.[0])} /></label><small>MP4, MOV, M4V ou WebM · prévia local</small></div>}
                      {videoUrl && <div className="video-loaded"><span><strong>{videoName}</strong><small>Prévia local · não enviado</small></span><label className="button">Trocar vídeo<input type="file" accept="video/*" onChange={(event) => chooseVideo(event.target.files?.[0])} /></label></div>}
                    </div>
                  ) : activeLesson.type === "quiz" ? (
                    <div className="quiz-preview"><span>?</span><h3>Diagnóstico inicial</h3><p>10 perguntas · nota mínima 70% · 2 tentativas</p><button className="button" onClick={() => setToast("Editor de quiz aberto na demonstração.")}>Editar perguntas</button></div>
                  ) : activeLesson.type === "live" ? (
                    <div className="live-preview"><span>● Ao vivo</span><h3>23 de julho · 19h</h3><p>Adicione o link da sala e os materiais antes do encontro.</p><button className="button" onClick={() => setToast("Configuração do encontro aberta na demonstração.")}>Configurar encontro</button></div>
                  ) : <div className="text-preview"><h3>O que você vai aprender</h3><p>Use este espaço para texto, imagens, links e materiais complementares da aula.</p></div>}

                  {!studentPreview && <>
                    <div className="content-toolbar" aria-label="Adicionar conteúdo"><span>Adicionar à aula</span><button onClick={() => setToast("Bloco de vídeo selecionado.")}>▶ Vídeo</button><button onClick={() => setToast("Bloco de texto adicionado à demonstração.")}>≡ Texto</button><button onClick={() => setToast("Material PDF adicionado à demonstração.")}>▤ PDF</button><button onClick={() => setToast("Quiz adicionado à demonstração.")}>? Quiz</button></div>
                    <div className="lesson-settings">
                      <label><span>Título da aula</span><input defaultValue={activeLesson.title} /></label>
                      <div><label><span>Liberação</span><select defaultValue="immediate"><option value="immediate">Imediatamente</option><option value="days">Dias após matrícula</option><option value="date">Em uma data</option></select></label><label><span>Conclusão</span><select defaultValue="video"><option value="video">Assistir ao vídeo</option><option value="manual">Marcação manual</option><option value="quiz">Aprovar no quiz</option></select></label></div>
                      <label className="lesson-description"><span>Descrição</span><textarea rows={3} defaultValue="Nesta aula, você vai entender o objetivo do módulo e preparar o ambiente para avançar sem bloqueios." /></label>
                    </div>
                  </>}
                </div>

                {!studentPreview && <aside className="lesson-side">
                  <section><span className="section-kicker">Retenção na aula</span><h2>Saúde do conteúdo</h2><div className="lesson-metric"><strong>81%</strong><span>concluem esta aula</span></div><div className="lesson-metric"><strong>14:32</strong><span>tempo médio assistido</span></div><div className="lesson-metric warning"><strong>5</strong><span>alunos pararam aqui</span></div><button className="button wide" onClick={() => { setFilter("attention"); navigate("students"); }}>Ver alunos em risco</button></section>
                  <section><span className="section-kicker">Checklist</span><h2>Antes de publicar</h2><ul className="publish-check"><li className="done">Título e descrição</li><li className={videoUrl ? "done" : ""}>Vídeo da aula</li><li>Legenda do vídeo</li><li className="done">Critério de conclusão</li><li>Material complementar</li></ul></section>
                </aside>}
              </div>
            </section>
          )}

          {view === "marketing" && (
            <section className="page marketing-page" aria-labelledby="marketing-title">
              <div className="page-heading marketing-heading">
                <div><p className="eyebrow">Sails · vendas em movimento</p><h1 id="marketing-title">Marketing</h1><p>Acompanhe cada lead da descoberta até a matrícula.</p></div>
                <button className="button primary" onClick={addDemoLead}>+ Novo lead</button>
              </div>

              <div className="marketing-summary">
                <article><span>Pipeline estimado</span><strong>R$ 15.451</strong><small><b>↑ 12%</b> vs. semana anterior</small></article>
                <article><span>Leads ativos</span><strong>{leads.filter((lead) => lead.stage !== "Fechado").length}</strong><small>3 pedem próxima ação</small></article>
                <article><span>Conversão</span><strong>18,4%</strong><small>Lead → matrícula</small></article>
                <article><span>Tempo de fechamento</span><strong>8 dias</strong><small>média dos últimos 30 dias</small></article>
              </div>

              <div className="marketing-toolbar">
                <div className="marketing-tabs" role="tablist" aria-label="Visualização de marketing"><button role="tab" aria-selected={marketingMode === "pipeline"} onClick={() => setMarketingMode("pipeline")}>Pipeline</button><button role="tab" aria-selected={marketingMode === "leads"} onClick={() => setMarketingMode("leads")}>Todos os leads</button></div>
                <label className="search lead-search"><span className="sr-only">Buscar leads</span><span aria-hidden="true">⌕</span><input value={leadQuery} onChange={(event) => setLeadQuery(event.target.value)} placeholder="Buscar lead, origem ou interesse" /></label>
                <button className="button filter-button" onClick={() => setToast("Filtros de origem e temperatura aplicados à demonstração.")}>☷ Filtros</button>
              </div>

              {marketingMode === "pipeline" ? (
                <div className="funnel-board">
                  {(["Novos", "Conversa", "Proposta", "Fechado"] as LeadStage[]).map((stage) => {
                    const stageLeads = visibleLeads.filter((lead) => lead.stage === stage);
                    const total = stageLeads.reduce((sum, lead) => sum + Number(lead.value.replace(/\D/g, "")), 0);
                    return <section className={`funnel-column stage-${stage.toLocaleLowerCase("pt-BR")}`} key={stage}>
                      <header><div><i /><strong>{stage}</strong><span>{stageLeads.length}</span></div><small>{total ? `R$ ${total.toLocaleString("pt-BR")}` : "R$ 0"}</small></header>
                      <div className="lead-stack">{stageLeads.map((lead) => <article className="lead-card" key={lead.id}>
                        <div className="lead-card-head"><span className="avatar">{lead.initials}</span><div><h3>{lead.name}</h3><p>{lead.source} · {lead.age}</p></div><button aria-label={`Mais ações para ${lead.name}`}>•••</button></div>
                        <span className={`lead-temp temp-${lead.temperature.toLocaleLowerCase("pt-BR")}`}>{lead.temperature}</span>
                        <div className="lead-interest"><small>Interesse</small><strong>{lead.interest}</strong></div>
                        <div className="lead-next"><span>Próxima ação</span><strong>{lead.nextAction}</strong></div>
                        <footer><strong>{lead.value}</strong>{stage !== "Fechado" ? <button onClick={() => advanceLead(lead)} aria-label={`Avançar ${lead.name} no funil`}>Avançar →</button> : <span>✓ Matrícula</span>}</footer>
                      </article>)}</div>
                      <button className="add-stage-lead" onClick={addDemoLead}>+ Adicionar lead</button>
                    </section>;
                  })}
                </div>
              ) : (
                <div className="leads-table-wrap">
                  <div className="result-meta"><span>{visibleLeads.length} leads exibidos</span><span>Atualizado agora</span></div>
                  <table className="leads-table"><thead><tr><th>Lead</th><th>Origem</th><th>Interesse</th><th>Etapa</th><th>Próxima ação</th><th>Valor</th><th /></tr></thead><tbody>{visibleLeads.map((lead) => <tr key={lead.id}><td><span className="avatar">{lead.initials}</span><strong>{lead.name}</strong></td><td>{lead.source}</td><td>{lead.interest}</td><td><span className={`stage-pill stage-${lead.stage.toLocaleLowerCase("pt-BR")}`}>{lead.stage}</span></td><td>{lead.nextAction}</td><td><strong>{lead.value}</strong></td><td><button className="row-action" onClick={() => advanceLead(lead)}>→</button></td></tr>)}</tbody></table>
                  <div className="lead-mobile-list">{visibleLeads.map((lead) => <article key={lead.id}><div><span className="avatar">{lead.initials}</span><span><strong>{lead.name}</strong><small>{lead.source} · {lead.interest}</small></span></div><span className={`stage-pill stage-${lead.stage.toLocaleLowerCase("pt-BR")}`}>{lead.stage}</span><p>{lead.nextAction}</p><footer><strong>{lead.value}</strong><button onClick={() => advanceLead(lead)}>Avançar →</button></footer></article>)}</div>
                </div>
              )}

              <section className="marketing-insights"><article><span className="section-kicker">Origem que mais converte</span><h2>Indicação</h2><strong>31%</strong><p>Leads indicados fecham 1,7× mais rápido.</p></article><article><span className="section-kicker">Ação recomendada</span><h2>3 conversas paradas</h2><p>Retome primeiro quem já demonstrou interesse na Formação em Dados & IA.</p><button className="button" onClick={() => setToast("Follow-ups priorizados na demonstração.")}>Priorizar follow-ups →</button></article><article><span className="section-kicker">Matching de trilha</span><h2>6 de 8 com alta aderência</h2><p>Critérios visíveis: objetivo, experiência e disponibilidade semanal.</p><button className="button" onClick={() => setToast("Critérios de matching exibidos na demonstração.")}>Ver critérios →</button></article></section>
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
          <button className={view === "courses" || view === "course-builder" ? "nav-active" : ""} onClick={() => navigate("courses")}><span>▷</span>Cursos</button>
          <button className={view === "marketing" ? "nav-active" : ""} onClick={() => navigate("marketing")}><span>◇</span>Marketing</button>
        </nav>
      </div>

      {dialogId && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setDialogId(null); setMessage(""); } }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="checkin-title" ref={dialogRef}>
            <div className="modal-top"><div><p className="eyebrow">Ação do mentor</p><h2 id="checkin-title">Check-in com {selected.name.split(" ")[0]}</h2></div><button ref={closeRef} className="close-button" onClick={() => { setDialogId(null); setMessage(""); }} aria-label="Fechar">×</button></div>
            <p className="modal-context">{selected.signals.slice(0, 2).join(" · ")}</p>
            <label className="message-label"><span>Mensagem sugerida</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} aria-describedby="message-safety" /><small id="message-safety">Use apenas conteúdo fictício. Não insira dados pessoais ou confidenciais; copiar transfere o texto ao clipboard deste dispositivo.</small></label>
            <div className="modal-disclosure"><span aria-hidden="true">i</span><p>A Sails não enviará esta mensagem. Você pode copiá-la e registrar que fez o contato manualmente.</p></div>
            <div className="modal-actions"><button className="button ghost" onClick={() => { setDialogId(null); setMessage(""); }}>Cancelar</button><button className="button copy" onClick={copyMessage}>Copiar mensagem</button><button className="button primary" onClick={registerCheckIn}>Registrar check-in na demo</button></div>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

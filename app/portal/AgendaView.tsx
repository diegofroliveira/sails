"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ORGANIZATION_ID = "df67d7ba-c5e5-4d51-b76f-40bf4052eee3";

type MeetingKind = "brief_call" | "mentoring" | "live";
type ActionPlan = {
  objective: string;
  diagnosisSummary: string;
  milestones: Array<{ title: string; deadline: string }>;
  nextActions: Array<{ action: string; owner: string; timeframe: string }>;
  successMetrics: string[];
  risks: string[];
  provider: "gemini" | "template";
  model: string;
};

const meetingDetails: Record<MeetingKind, { label: string; duration: number; description: string }> = {
  brief_call: { label: "Brief call", duration: 30, description: "Diagnóstico inicial + plano de ação" },
  mentoring: { label: "Mentoria individual", duration: 60, description: "Acompanhamento individual" },
  live: { label: "Live FROM DATA", duration: 90, description: "Encontro coletivo da comunidade" },
};

const initialUpcoming = [
  { date: "23 JUL", time: "19:00", title: "Live · Clínica de projetos", meta: "48 convidados · Google Meet", tone: "cyan" },
  { date: "25 JUL", time: "18:30", title: "Brief call · Marina Lopes", meta: "Briefing aguardando resposta", tone: "purple" },
  { date: "29 JUL", time: "19:00", title: "Mentoria · Rafael Costa", meta: "Plano de ação em revisão", tone: "blue" },
];

export default function AgendaView({ onToast }: { onToast: (message: string) => void }) {
  const [kind, setKind] = useState<MeetingKind>("brief_call");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [date, setDate] = useState("2026-07-28");
  const [time, setTime] = useState("18:30");
  const [careerGoal, setCareerGoal] = useState("Conquistar uma posição em Dados com um portfólio forte");
  const [currentChallenge, setCurrentChallenge] = useState("Organizar a experiência e transformar conhecimento em projetos demonstráveis");
  const [currentRole, setCurrentRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Iniciante");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [consent, setConsent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [upcoming, setUpcoming] = useState(initialUpcoming);

  const selected = meetingDetails[kind];
  const formattedDate = useMemo(() => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }, [date]);

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setPlan(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.assign("/login");
        return;
      }

      const { data: meetingType, error: meetingTypeError } = await supabase
        .from("meeting_types")
        .select("id,duration_minutes")
        .eq("organization_id", ORGANIZATION_ID)
        .eq("kind", kind)
        .single();
      if (meetingTypeError || !meetingType) throw new Error("Tipo de encontro não encontrado");

      const startsAt = new Date(`${date}T${time}:00-03:00`);
      const endsAt = new Date(startsAt.getTime() + meetingType.duration_minutes * 60_000);
      const displayName = kind === "live" ? "Turma FROM DATA" : attendeeName;
      const displayEmail = kind === "live" ? "diego.fjddf@gmail.com" : attendeeEmail;

      const { data: appointment, error: appointmentError } = await supabase.from("appointments").insert({
        organization_id: ORGANIZATION_ID,
        meeting_type_id: meetingType.id,
        mentor_user_id: session.user.id,
        attendee_name: displayName,
        attendee_email: displayEmail,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        timezone: "America/Sao_Paulo",
        status: "scheduled",
      }).select("id").single();
      if (appointmentError || !appointment) throw new Error("Não foi possível criar o encontro");

      if (kind === "brief_call") {
        const { error: briefingError } = await supabase.from("intake_briefings").insert({
          organization_id: ORGANIZATION_ID,
          appointment_id: appointment.id,
          career_role: currentRole || null,
          experience_level: experienceLevel,
          career_goal: careerGoal,
          current_challenge: currentChallenge,
          weekly_availability_hours: weeklyHours,
          ai_processing_consent: consent,
          privacy_consent_at: consent ? new Date().toISOString() : null,
        });
        if (briefingError) throw new Error("Encontro criado, mas o briefing não foi salvo");

        if (consent) {
          const response = await fetch("/api/action-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ currentRole, experienceLevel, careerGoal, currentChallenge, weeklyAvailabilityHours: weeklyHours }),
          });
          if (response.ok) {
            const generated = await response.json() as ActionPlan;
            setPlan(generated);
            await supabase.from("mentoring_action_plans").insert({
              organization_id: ORGANIZATION_ID,
              appointment_id: appointment.id,
              status: "draft",
              objective: generated.objective,
              diagnosis_summary: generated.diagnosisSummary,
              milestones: generated.milestones,
              next_actions: generated.nextActions,
              success_metrics: generated.successMetrics,
              risks: generated.risks,
              model_provider: generated.provider,
              model_name: generated.model,
              generated_at: new Date().toISOString(),
            });
          }
        }
      }

      const calendarResponse = await fetch("/api/google-calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ appointmentId: appointment.id }),
      });
      const calendarSynced = calendarResponse.ok;

      setUpcoming((current) => [{
        date: `${date.slice(8, 10)} ${new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(startsAt).replace(".", "").toUpperCase()}`,
        time,
        title: `${selected.label} · ${displayName}`,
        meta: calendarSynced ? "Google Agenda + Meet sincronizados" : "Salvo na Sails · conecte o Google Agenda",
        tone: kind === "brief_call" ? "purple" : kind === "live" ? "cyan" : "blue",
      }, ...current]);
      onToast(calendarSynced ? "Encontro salvo e sincronizado com o Google Agenda." : "Encontro salvo. Conecte o Google Agenda para ativar a sincronização automática.");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Não foi possível agendar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page fd-agenda-page" aria-labelledby="agenda-title">
      <div className="page-heading fd-agenda-heading">
        <div><p className="eyebrow">FROM DATA · agenda conectada</p><h1 id="agenda-title">Calls, mentorias e lives.</h1><p>Um calendário para a jornada inteira — do primeiro diagnóstico ao próximo salto.</p></div>
        <div className="calendar-connection"><span className="google-g">G</span><div><strong>Google Agenda</strong><small>OAuth seguro</small></div><button onClick={() => window.location.assign("/api/google-calendar/connect")}>Conectar</button></div>
      </div>

      <div className="fd-agenda-summary">
        <article><span>HOJE</span><strong>2</strong><small>encontros</small></article>
        <article><span>ESTA SEMANA</span><strong>6h30</strong><small>com mentorados</small></article>
        <article><span>BRIEFS RECEBIDOS</span><strong>4/5</strong><small>um pendente</small></article>
        <article><span>PLANOS EM REVISÃO</span><strong>3</strong><small>aprovação humana</small></article>
      </div>

      <div className="fd-agenda-layout">
        <div className="fd-agenda-main">
          <section className="operations-card upcoming-card">
            <div className="operations-card-head"><div><span className="section-kicker">Próximos encontros</span><h2>Sua agenda FROM DATA</h2></div><button className="button" onClick={() => onToast("Visão semanal selecionada.")}>Semana⌄</button></div>
            <div className="upcoming-list">{upcoming.map((item, index) => <article key={`${item.title}-${index}`}><time><strong>{item.date}</strong><span>{item.time}</span></time><i className={item.tone} /><div><strong>{item.title}</strong><small>{item.meta}</small></div><button onClick={() => onToast(`${item.title} aberto para edição.`)}>Abrir →</button></article>)}</div>
          </section>

          {plan && <section className="operations-card generated-plan">
            <div className="operations-card-head"><div><span className="section-kicker">Plano sugerido · revisão obrigatória</span><h2>{plan.objective}</h2></div><span className="ai-provider">{plan.provider === "gemini" ? "Gemini" : "Modelo local"}</span></div>
            <div className="plan-diagnosis"><strong>Leitura do momento</strong><p>{plan.diagnosisSummary}</p></div>
            <div className="plan-columns"><div><strong>Marcos</strong>{plan.milestones.map((milestone) => <article key={milestone.title}><span>◇</span><p>{milestone.title}<small>{milestone.deadline}</small></p></article>)}</div><div><strong>Próximas ações</strong>{plan.nextActions.map((action) => <article key={action.action}><span>→</span><p>{action.action}<small>{action.owner} · {action.timeframe}</small></p></article>)}</div></div>
            <footer><span>IA sugere. Diego revisa e aprova antes do mentorado receber.</span><button className="button primary" onClick={() => onToast("Plano marcado para revisão do mentor.")}>Revisar plano →</button></footer>
          </section>}
        </div>

        <aside className="operations-card schedule-card">
          <span className="section-kicker">Novo encontro</span><h2>Agendar na jornada</h2>
          <div className="meeting-kind-tabs">{(Object.keys(meetingDetails) as MeetingKind[]).map((meetingKind) => <button key={meetingKind} aria-pressed={kind === meetingKind} onClick={() => setKind(meetingKind)}><strong>{meetingDetails[meetingKind].label}</strong><small>{meetingDetails[meetingKind].duration} min</small></button>)}</div>
          <p className="meeting-description">{selected.description}</p>
          <form onSubmit={schedule}>
            {kind !== "live" && <><label><span>Nome</span><input value={attendeeName} onChange={(event) => setAttendeeName(event.target.value)} required /></label><label><span>E-mail</span><input type="email" value={attendeeEmail} onChange={(event) => setAttendeeEmail(event.target.value)} required /></label></>}
            <div className="date-time-fields"><label><span>Data</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label><span>Horário</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label></div>
            {kind === "brief_call" && <div className="brief-fields"><div><span className="brief-step">BRIEF PRÉ-CALL</span><small>Os dados abaixo alimentam o plano inicial.</small></div><label><span>Cargo ou momento atual</span><input value={currentRole} onChange={(event) => setCurrentRole(event.target.value)} placeholder="Ex.: Analista de BI em transição" /></label><label><span>Nível de experiência</span><select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)}><option>Iniciante</option><option>Júnior</option><option>Pleno</option><option>Transição de carreira</option></select></label><label><span>Objetivo de carreira</span><textarea value={careerGoal} onChange={(event) => setCareerGoal(event.target.value)} required /></label><label><span>Principal desafio agora</span><textarea value={currentChallenge} onChange={(event) => setCurrentChallenge(event.target.value)} required /></label><label><span>Horas por semana</span><input type="number" min="1" max="40" value={weeklyHours} onChange={(event) => setWeeklyHours(Number(event.target.value))} /></label><label className="ai-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Autorizo o uso destes dados para gerar uma sugestão de plano, sujeita à revisão do mentor.</span></label></div>}
            <button type="submit" className="button primary wide" disabled={saving}>{saving ? "Salvando..." : `Agendar ${selected.label} · ${formattedDate}`}</button>
            <small className="sync-note">O encontro é salvo agora. A sincronização e o Google Meet serão ativados após o OAuth.</small>
          </form>
        </aside>
      </div>

      <section className="fd-integration-flow">
        <article><span>01</span><div><strong>Mentorado agenda</strong><small>Escolhe horário e responde ao brief.</small></div></article><i>→</i><article><span>02</span><div><strong>Google Calendar</strong><small>Cria evento, convite e Meet.</small></div></article><i>→</i><article><span>03</span><div><strong>Read.ai</strong><small>Devolve resumo e próximos passos.</small></div></article><i>→</i><article><span>04</span><div><strong>Plano de ação</strong><small>IA sugere; mentor aprova.</small></div></article>
      </section>
    </section>
  );
}

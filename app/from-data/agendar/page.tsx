"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Slot = { starts_at: string; ends_at: string };

function upcomingDates() {
  const brazilNow = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const start = new Date(Date.UTC(brazilNow.getUTCFullYear(), brazilNow.getUTCMonth(), brazilNow.getUTCDate()));
  return Array.from({ length: 21 }, (_, index) => {
    const value = new Date(start);
    value.setUTCDate(value.getUTCDate() + index + 1);
    return value.toISOString().slice(0, 10);
  });
}

function labelForDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })
    .format(new Date(`${date}T12:00:00Z`))
    .replace(".", "");
}

function timeForSlot(slot: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date(slot));
}

export default function FromDataBookingPage() {
  const [dates] = useState(() => upcomingDates());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(dates[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [checkingSlots, setCheckingSlots] = useState(true);
  const [checkedCalendars, setCheckedCalendars] = useState(0);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Transição de carreira");
  const [goal, setGoal] = useState("");
  const [challenge, setChallenge] = useState("");
  const [hours, setHours] = useState(5);
  const [aiConsent, setAiConsent] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/availability/from-data?date=${date}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("availability");
        return response.json() as Promise<{ slots: Slot[]; checkedCalendars: number }>;
      })
      .then((payload) => {
        setSlots(payload.slots);
        setCheckedCalendars(payload.checkedCalendars);
        setSelectedSlot(payload.slots[0]?.starts_at || "");
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setSlots([]);
        setError("Não foi possível consultar a agenda agora. Tente novamente em instantes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCheckingSlots(false);
      });
    return () => controller.abort();
  }, [date]);

  function chooseDate(nextDate: string) {
    setDate(nextDate);
    setCheckingSlots(true);
    setSelectedSlot("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) {
      setError("Escolha um horário disponível.");
      return;
    }
    if (!privacyConsent) {
      setError("Confirme o consentimento de privacidade para continuar.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: bookingError } = await supabase.rpc("request_from_data_brief_call", {
      p_name: name,
      p_email: email,
      p_starts_at: selectedSlot,
      p_career_role: role,
      p_experience_level: level,
      p_career_goal: goal,
      p_current_challenge: challenge,
      p_weekly_hours: hours,
      p_ai_consent: aiConsent,
    });
    if (bookingError) {
      setError(bookingError.message.includes("disponível") || bookingError.message.includes("possui") ? "Esse horário acabou de ser reservado. Escolha outro slot." : "Não foi possível solicitar a call. Revise os dados e tente novamente.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  return <main className="fd-booking-page">
    <section className="fd-booking-context">
      <Link href="/from-data"><Image src="/from-data-wordmark.png" alt="FROM DATA" width={811} height={281} priority unoptimized /></Link>
      <div><span>BRIEF CALL · 30 MINUTOS</span><h1>Antes da call,<br />começamos pelo seu <em>FROM.</em></h1><p>Estas respostas ajudam Diego a chegar à conversa entendendo seu momento e a preparar uma primeira hipótese de plano.</p></div>
      <ol><li><span>01</span>Você escolhe um horário realmente livre</li><li><span>02</span>A call aprofunda o diagnóstico</li><li><span>03</span>Diego revisa o plano sugerido</li></ol>
      <small>Seus dados não são vendidos. A IA só processa o briefing com consentimento explícito.</small>
    </section>
    <section className="fd-booking-form-wrap">
      {success ? <div className="fd-booking-success"><span>QUERY EXECUTED</span><h2>Brief call solicitada.</h2><p>Seu contexto já está na FROM DATA. Diego confirmará o horário e você receberá o convite com Google Meet.</p><div><strong>{labelForDate(date)} · {timeForSlot(selectedSlot)}</strong><small>Horário de Brasília</small></div><Link href="/from-data">Voltar para FROM DATA</Link></div> :
      <form onSubmit={submit}>
        <span className="fd-kicker">SEU PONTO DE PARTIDA</span><h2>Conte sobre o seu momento.</h2>
        <div className="fd-slot-picker">
          <div className="fd-slot-title"><div><strong>1. Escolha o dia</strong><small>Próximos 21 dias</small></div><span>{checkedCalendars > 0 ? `${checkedCalendars} agendas cruzadas` : "Disponibilidade FROM DATA"}</span></div>
          <div className="fd-date-strip">{dates.map((item) => <button type="button" key={item} aria-pressed={date === item} onClick={() => chooseDate(item)}><span>{labelForDate(item).split(" ")[0]}</span><strong>{labelForDate(item).split(" ").slice(1).join(" ")}</strong></button>)}</div>
          <div className="fd-slot-title"><div><strong>2. Escolha um horário</strong><small>Horário de Brasília</small></div></div>
          <div className="fd-time-slots" aria-live="polite">{checkingSlots ? <p>Consultando agendas...</p> : slots.length ? slots.map((slot) => <button type="button" key={slot.starts_at} aria-pressed={selectedSlot === slot.starts_at} onClick={() => setSelectedSlot(slot.starts_at)}>{timeForSlot(slot.starts_at)}</button>) : <p>Nenhum horário livre neste dia. Escolha outra data.</p>}</div>
          <small className="fd-conflict-note"><span>✓</span> Só mostramos slots livres na janela de atendimento e nas agendas conectadas.</small>
        </div>
        <div className="fd-booking-grid">
          <label><span>Nome completo</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <label><span>E-mail</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label><span>Cargo ou momento atual</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex.: Analista de BI" /></label>
          <label><span>Experiência</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Transição de carreira</option><option>Iniciante</option><option>Júnior</option><option>Pleno</option></select></label>
          <label className="full"><span>Qual é o seu objetivo de carreira?</span><textarea value={goal} onChange={(event) => setGoal(event.target.value)} minLength={10} required /></label>
          <label className="full"><span>O que mais está travando você agora?</span><textarea value={challenge} onChange={(event) => setChallenge(event.target.value)} minLength={10} required /></label>
          <label><span>Horas disponíveis por semana</span><input type="number" min="1" max="80" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label>
        </div>
        <label className="fd-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>Autorizo o uso do briefing para gerar uma sugestão de plano com IA. O conteúdo só será compartilhado após revisão humana.</span></label>
        <label className="fd-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /><span>Li e concordo com o tratamento dos dados para organização da brief call e acompanhamento da mentoria.</span></label>
        {error && <div className="fd-booking-error" role="alert">{error}</div>}
        <button type="submit" disabled={loading || !selectedSlot}>{loading ? "Enviando briefing..." : "Solicitar brief call →"}</button>
        <small>Nenhuma cobrança é feita nesta etapa.</small>
      </form>}
    </section>
  </main>;
}

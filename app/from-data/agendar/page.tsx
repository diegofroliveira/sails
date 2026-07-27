"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AvailableSlot = { starts_at: string; ends_at: string };

function nextBookableDate() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  for (let offset = 1; offset <= 14; offset += 1) {
    const candidate = new Date(date);
    candidate.setDate(date.getDate() + offset);
    if ([2, 4].includes(candidate.getDay())) return candidate.toISOString().slice(0, 10);
  }
  return "";
}

function slotLabel(startsAt: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(startsAt));
}

export default function FromDataBookingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(nextBookableDate);
  const [selectedStart, setSelectedStart] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
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
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let active = true;
    async function loadSlots() {
      setSlotsLoading(true);
      setError("");
      const supabase = createSupabaseBrowserClient();
      const { data, error: slotsError } = await supabase.rpc("get_from_data_available_slots", { p_date: date });
      if (!active) return;
      if (slotsError) {
        setSlots([]);
        setSelectedStart("");
        setError("Não foi possível consultar a agenda. Tente novamente.");
      } else {
        const available = data ?? [];
        setSlots(available);
        setSelectedStart(available[0]?.starts_at ?? "");
      }
      setSlotsLoading(false);
    }
    if (date) void loadSlots();
    return () => { active = false; };
  }, [date]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!privacyConsent) {
      setError("Confirme o consentimento de privacidade para continuar.");
      return;
    }
    if (!selectedStart) {
      setError("Escolha uma data com horário disponível.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: bookingError } = await supabase.rpc("request_from_data_brief_call", {
      p_name: name,
      p_email: email,
      p_starts_at: selectedStart,
      p_career_role: role,
      p_experience_level: level,
      p_career_goal: goal,
      p_current_challenge: challenge,
      p_weekly_hours: hours,
      p_ai_consent: aiConsent,
    });

    if (bookingError) {
      setError(
        bookingError.message.includes("disponível") || bookingError.message.includes("agendamento")
          ? "Este horário não está mais disponível. Escolha outro horário."
          : "Não foi possível solicitar a call. Revise os dados e tente novamente.",
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return <main className="fd-booking-page">
    <section className="fd-booking-context">
      <Link href="/from-data"><Image src="/from-data-logo.png" alt="FROM DATA" width={180} height={180} priority /></Link>
      <div>
        <span>BRIEF CALL · 30 MINUTOS</span>
        <h1>Antes da call,<br />começamos pelo seu <em>FROM.</em></h1>
        <p>Estas respostas ajudam Diego a chegar à conversa entendendo seu momento e a preparar uma primeira hipótese de plano.</p>
      </div>
      <ol>
        <li><span>01</span>Você compartilha o contexto</li>
        <li><span>02</span>A call aprofunda o diagnóstico</li>
        <li><span>03</span>Diego revisa o plano sugerido</li>
      </ol>
      <small>Seus dados não são vendidos. A IA só processa o briefing com consentimento explícito.</small>
    </section>

    <section className="fd-booking-form-wrap">
      {success ? <div className="fd-booking-success">
        <span>QUERY EXECUTED</span>
        <h2>Brief call solicitada.</h2>
        <p>Seu contexto já está na FROM DATA. Diego confirmará o horário e, após a conexão do Google Agenda, você receberá o convite com Google Meet.</p>
        <div>
          <strong>{date.split("-").reverse().join("/")} · {slotLabel(selectedStart)}</strong>
          <small>Horário de Brasília</small>
        </div>
        <Link href="/from-data">Voltar para FROM DATA</Link>
      </div> : <form onSubmit={submit}>
        <span className="fd-kicker">SEU PONTO DE PARTIDA</span>
        <h2>Conte sobre o seu momento.</h2>
        <div className="fd-booking-grid">
          <label><span>Nome completo</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <label><span>E-mail</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label><span>Data</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} min={today} required /></label>
          <label>
            <span>Horário disponível</span>
            <select value={selectedStart} onChange={(event) => setSelectedStart(event.target.value)} disabled={slotsLoading || slots.length === 0} required>
              {slotsLoading
                ? <option>Consultando agenda...</option>
                : slots.length === 0
                  ? <option>Nenhum horário nesta data</option>
                  : slots.map((slot) => <option key={slot.starts_at} value={slot.starts_at}>{slotLabel(slot.starts_at)}</option>)}
            </select>
          </label>
          <label><span>Cargo ou momento atual</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex.: Analista de BI" /></label>
          <label><span>Experiência</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Transição de carreira</option><option>Iniciante</option><option>Júnior</option><option>Pleno</option></select></label>
          <label className="full"><span>Qual é o seu objetivo de carreira?</span><textarea value={goal} onChange={(event) => setGoal(event.target.value)} minLength={10} required /></label>
          <label className="full"><span>O que mais está travando você agora?</span><textarea value={challenge} onChange={(event) => setChallenge(event.target.value)} minLength={10} required /></label>
          <label><span>Horas disponíveis por semana</span><input type="number" min="1" max="80" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label>
        </div>
        <label className="fd-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>Autorizo o uso do briefing para gerar uma sugestão de plano com IA. O conteúdo só será compartilhado após revisão humana.</span></label>
        <label className="fd-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /><span>Li e concordo com o tratamento dos dados para organização da brief call e acompanhamento da mentoria.</span></label>
        {error && <div className="fd-booking-error" role="alert">{error}</div>}
        <button type="submit" disabled={loading || slotsLoading || !selectedStart}>{loading ? "Enviando briefing..." : "Solicitar brief call →"}</button>
        <small>O horário será confirmado por Diego. Nenhuma cobrança é feita nesta etapa.</small>
      </form>}
    </section>
  </main>;
}

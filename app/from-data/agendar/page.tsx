"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function FromDataBookingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("2026-07-28");
  const [time, setTime] = useState("18:30");
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!privacyConsent) {
      setError("Confirme o consentimento de privacidade para continuar.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const startsAt = new Date(`${date}T${time}:00-03:00`).toISOString();
    const { error: bookingError } = await supabase.rpc("request_from_data_brief_call", {
      p_name: name,
      p_email: email,
      p_starts_at: startsAt,
      p_career_role: role,
      p_experience_level: level,
      p_career_goal: goal,
      p_current_challenge: challenge,
      p_weekly_hours: hours,
      p_ai_consent: aiConsent,
    });
    if (bookingError) {
      setError(bookingError.message.includes("já possui") ? "Este horário já foi solicitado. Escolha outro horário." : "Não foi possível solicitar a call. Revise os dados e tente novamente.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  return <main className="fd-booking-page">
    <section className="fd-booking-context"><Link href="/from-data"><Image src="/from-data-logo.png" alt="FROM DATA" width={180} height={180} priority /></Link><div><span>BRIEF CALL · 30 MINUTOS</span><h1>Antes da call,<br />começamos pelo seu <em>FROM.</em></h1><p>Estas respostas ajudam Diego a chegar à conversa entendendo seu momento e a preparar uma primeira hipótese de plano.</p></div><ol><li><span>01</span>Você compartilha o contexto</li><li><span>02</span>A call aprofunda o diagnóstico</li><li><span>03</span>Diego revisa o plano sugerido</li></ol><small>Seus dados não são vendidos. A IA só processa o briefing com consentimento explícito.</small></section>
    <section className="fd-booking-form-wrap">{success ? <div className="fd-booking-success"><span>QUERY EXECUTED</span><h2>Brief call solicitada.</h2><p>Seu contexto já está na FROM DATA. Diego confirmará o horário e, após a conexão do Google Agenda, você receberá o convite com Google Meet.</p><div><strong>{date.split("-").reverse().join("/")} · {time}</strong><small>Horário de Brasília</small></div><Link href="/from-data">Voltar para FROM DATA</Link></div> : <form onSubmit={submit}><span className="fd-kicker">SEU PONTO DE PARTIDA</span><h2>Conte sobre o seu momento.</h2><div className="fd-booking-grid"><label><span>Nome completo</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label><label><span>E-mail</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label><span>Data</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} min="2026-07-23" required /></label><label><span>Horário</span><select value={time} onChange={(event) => setTime(event.target.value)}><option>18:00</option><option>18:30</option><option>19:00</option><option>19:30</option><option>20:00</option></select></label><label><span>Cargo ou momento atual</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex.: Analista de BI" /></label><label><span>Experiência</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Transição de carreira</option><option>Iniciante</option><option>Júnior</option><option>Pleno</option></select></label><label className="full"><span>Qual é o seu objetivo de carreira?</span><textarea value={goal} onChange={(event) => setGoal(event.target.value)} minLength={10} required /></label><label className="full"><span>O que mais está travando você agora?</span><textarea value={challenge} onChange={(event) => setChallenge(event.target.value)} minLength={10} required /></label><label><span>Horas disponíveis por semana</span><input type="number" min="1" max="80" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label></div><label className="fd-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>Autorizo o uso do briefing para gerar uma sugestão de plano com IA. O conteúdo só será compartilhado após revisão humana.</span></label><label className="fd-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /><span>Li e concordo com o tratamento dos dados para organização da brief call e acompanhamento da mentoria.</span></label>{error && <div className="fd-booking-error" role="alert">{error}</div>}<button type="submit" disabled={loading}>{loading ? "Enviando briefing..." : "Solicitar brief call →"}</button><small>O horário será confirmado por Diego. Nenhuma cobrança é feita nesta etapa.</small></form>}</section>
  </main>;
}

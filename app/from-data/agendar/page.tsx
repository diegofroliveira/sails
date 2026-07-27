"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Slot = { starts_at: string; ends_at: string };
type StartMode = "schedule" | "whatsapp" | null;

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
  const [mode, setMode] = useState<StartMode>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(dates[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [checkedCalendars, setCheckedCalendars] = useState(0);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [showBrief, setShowBrief] = useState(false);
  const [briefSaved, setBriefSaved] = useState(false);
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Transição de carreira");
  const [goal, setGoal] = useState("");
  const [challenge, setChallenge] = useState("");
  const [hours, setHours] = useState(5);
  const [aiConsent, setAiConsent] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "schedule") return;
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
  }, [date, mode]);

  function chooseMode(nextMode: Exclude<StartMode, null>) {
    setMode(nextMode);
    if (nextMode === "schedule") setCheckingSlots(true);
    setError("");
  }

  function chooseDate(nextDate: string) {
    setDate(nextDate);
    setCheckingSlots(true);
    setSelectedSlot("");
    setError("");
  }

  function validContact(requireEmail: boolean) {
    if (name.trim().length < 2 || phone.replace(/\D/g, "").length < 10) {
      setError("Preencha seu nome e WhatsApp com DDD.");
      return false;
    }
    if (requireEmail && !email.includes("@")) {
      setError("Informe um e-mail válido para receber o convite.");
      return false;
    }
    if (!privacyConsent) {
      setError("Confirme o consentimento para salvar seu contato.");
      return false;
    }
    return true;
  }

  async function continueOnWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validContact(false)) return;
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: leadError } = await supabase.rpc("capture_from_data_lead", {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_source: "from-data-whatsapp",
    });
    if (leadError) {
      setError("Não foi possível salvar seu contato agora. Tente novamente em instantes.");
      setLoading(false);
      return;
    }
    const destination = (process.env.NEXT_PUBLIC_FROM_DATA_WHATSAPP_NUMBER || "").replace(/\D/g, "");
    const message = encodeURIComponent(`Olá, Diego! Sou ${name.trim()} e conheci a FROM DATA. Quero entender qual é o meu próximo passo em Dados.`);
    if (destination) {
      window.location.href = `https://wa.me/${destination}?text=${message}`;
      return;
    }
    setMode(null);
    setAppointmentId("whatsapp");
    setLoading(false);
  }

  async function scheduleCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validContact(true)) return;
    if (!selectedSlot) {
      setError("Escolha um horário disponível.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { data, error: bookingError } = await supabase.rpc("request_from_data_quick_call", {
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_starts_at: selectedSlot,
    });
    if (bookingError) {
      setError(bookingError.message.includes("disponível") || bookingError.message.includes("possui") ? "Esse horário acabou de ser reservado. Escolha outro slot." : "Não foi possível confirmar a conversa. Revise os dados e tente novamente.");
      setLoading(false);
      return;
    }
    setAppointmentId(data);
    setLoading(false);
  }

  async function saveOptionalBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: briefError } = await supabase.rpc("save_from_data_optional_briefing", {
      p_ai_consent: aiConsent,
      p_appointment_id: appointmentId,
      p_career_goal: goal,
      p_career_role: role,
      p_current_challenge: challenge,
      p_email: email,
      p_experience_level: level,
      p_weekly_hours: hours,
    });
    if (briefError) {
      setError("Não foi possível salvar o contexto agora. Seu horário continua confirmado.");
      setLoading(false);
      return;
    }
    setBriefSaved(true);
    setLoading(false);
  }

  const whatsappCaptured = appointmentId === "whatsapp";
  const scheduled = appointmentId && !whatsappCaptured;

  return <main className="fd-booking-page fd-progressive-booking">
    <section className="fd-booking-context">
      <div className="fd-booking-navigation">
        <Link href="/from-data" aria-label="Voltar para a página FROM DATA"><Image src="/from-data-wordmark.png" alt="FROM DATA" width={811} height={281} priority unoptimized /></Link>
        <Link className="fd-booking-back" href="/from-data">← Voltar para a página</Link>
      </div>
      <div>
        <span>BRIEF CALL · 30 MINUTOS</span>
        <h1>Vamos descobrir<br />seu próximo passo<br />em <em>Dados.</em></h1>
        <p>Escolha como prefere começar. Leva menos de um minuto.</p>
      </div>
      <ol><li><span>01</span>Você escolhe o canal</li><li><span>02</span>Seu contato já fica salvo</li><li><span>03</span>O contexto vem depois, se quiser</li></ol>
      <small>Menos formulário. Mais conversa. Seus dados não são vendidos.</small>
    </section>

    <section className="fd-booking-form-wrap">
      {whatsappCaptured ? <div className="fd-booking-success"><span>LEAD CAPTURED</span><h2>Conversa iniciada.</h2><p>Seu contato já está na FROM DATA. Diego continuará pelo WhatsApp informado — sem você precisar preencher um questionário.</p><Link href="/from-data">Voltar para FROM DATA</Link></div> :
      scheduled ? <div className="fd-post-booking">
        <div className="fd-booking-success">
          <span>HORÁRIO RESERVADO</span><h2>Sua conversa está encaminhada.</h2>
          <p>Você receberá o convite com Google Meet no e-mail informado.</p>
          <div><strong>{labelForDate(date)} · {timeForSlot(selectedSlot)}</strong><small>Horário de Brasília</small></div>
        </div>
        {!showBrief && !briefSaved && <div className="fd-optional-brief"><span>OPCIONAL · 2 MINUTOS</span><h3>Quer ajudar Diego a preparar melhor a conversa?</h3><p>Conte um pouco do seu momento. Você também pode deixar isso para a call.</p><button type="button" onClick={() => setShowBrief(true)}>Preparar melhor a conversa →</button><Link href="/from-data">Prefiro fazer isso na call</Link></div>}
        {showBrief && !briefSaved && <form className="fd-brief-after-booking" onSubmit={saveOptionalBrief}>
          <div><span className="fd-kicker">CONTEXTO OPCIONAL</span><h3>Agora sim: conte sobre o seu momento.</h3></div>
          <div className="fd-booking-grid">
            <label><span>Cargo ou momento atual</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Ex.: Analista de BI" /></label>
            <label><span>Experiência</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Transição de carreira</option><option>Iniciante</option><option>Júnior</option><option>Pleno</option></select></label>
            <label className="full"><span>Qual é o seu objetivo de carreira?</span><textarea value={goal} onChange={(event) => setGoal(event.target.value)} /></label>
            <label className="full"><span>O que mais está travando você agora?</span><textarea value={challenge} onChange={(event) => setChallenge(event.target.value)} /></label>
            <label><span>Horas disponíveis por semana</span><input type="number" min="1" max="80" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label>
          </div>
          <label className="fd-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><span>Autorizo o uso deste contexto para gerar uma sugestão de plano com IA, sempre revisada pelo mentor.</span></label>
          {error && <div className="fd-booking-error" role="alert">{error}</div>}
          <button className="fd-booking-submit" type="submit" disabled={loading}>{loading ? "Salvando contexto..." : "Enviar contexto →"}</button>
        </form>}
        {briefSaved && <div className="fd-booking-success"><span>CONTEXTO SALVO</span><h2>Agora Diego já chega preparado.</h2><p>Seu briefing será usado para criar uma primeira hipótese de plano, sempre revisada antes de ser compartilhada.</p><Link href="/from-data">Voltar para FROM DATA</Link></div>}
      </div> :
      <div className="fd-start-flow">
        <span className="fd-kicker">SEU PONTO DE PARTIDA</span>
        <h2>Como você prefere começar?</h2>
        <p className="fd-start-intro">Escolha um caminho. Você pode mudar de ideia quando quiser.</p>
        <div className="fd-start-options">
          <button type="button" aria-pressed={mode === "schedule"} onClick={() => chooseMode("schedule")}><span>01</span><strong>Agendar uma conversa</strong><small>Escolha um horário livre na agenda.</small><em>→</em></button>
          <button type="button" aria-pressed={mode === "whatsapp"} onClick={() => chooseMode("whatsapp")}><span>02</span><strong>Falar pelo WhatsApp</strong><small>Comece agora, sem questionário.</small><em>→</em></button>
        </div>

        {mode === "whatsapp" && <form className="fd-quick-contact" onSubmit={continueOnWhatsApp}>
          <div><span className="fd-step-label">WHATSAPP · CONTATO RÁPIDO</span><h3>Só precisamos saber como chamar você.</h3></div>
          <div className="fd-booking-grid">
            <label><span>Nome completo</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
            <label><span>WhatsApp com DDD</span><input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(11) 99999-9999" required /></label>
          </div>
          <label className="fd-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /><span>Concordo com o uso destes dados para contato sobre a FROM DATA.</span></label>
          {error && <div className="fd-booking-error" role="alert">{error}</div>}
          <button className="fd-whatsapp-cta" type="submit" disabled={loading}>{loading ? "Salvando seu contato..." : "Continuar no WhatsApp →"}</button>
          <small>Seu contato entra no funil antes da conversa ser aberta.</small>
        </form>}

        {mode === "schedule" && <form className="fd-quick-schedule" onSubmit={scheduleCall}>
          <div><span className="fd-step-label">AGENDA · MENOS DE 1 MINUTO</span><h3>Escolha o melhor momento.</h3></div>
          <div className="fd-booking-grid fd-contact-first">
            <label><span>Nome completo</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
            <label><span>WhatsApp com DDD</span><input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(11) 99999-9999" required /></label>
            <label className="full"><span>E-mail para receber o convite</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          </div>
          <div className="fd-slot-picker">
            <div className="fd-slot-title"><div><strong>Escolha o dia</strong><small>Próximos 21 dias</small></div><span>{checkedCalendars > 0 ? `${checkedCalendars} agendas cruzadas` : "Disponibilidade FROM DATA"}</span></div>
            <div className="fd-date-strip">{dates.map((item) => <button type="button" key={item} aria-pressed={date === item} onClick={() => chooseDate(item)}><span>{labelForDate(item).split(" ")[0]}</span><strong>{labelForDate(item).split(" ").slice(1).join(" ")}</strong></button>)}</div>
            <div className="fd-slot-title"><div><strong>Escolha um horário</strong><small>Horário de Brasília</small></div></div>
            <div className="fd-time-slots" aria-live="polite">{checkingSlots ? <p>Consultando agendas...</p> : slots.length ? slots.map((slot) => <button type="button" key={slot.starts_at} aria-pressed={selectedSlot === slot.starts_at} onClick={() => setSelectedSlot(slot.starts_at)}>{timeForSlot(slot.starts_at)}</button>) : <p>Nenhum horário livre neste dia. Escolha outra data.</p>}</div>
            <small className="fd-conflict-note"><span>✓</span> Só mostramos horários realmente livres.</small>
          </div>
          <label className="fd-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /><span>Concordo com o uso destes dados para organizar a conversa e enviar o convite.</span></label>
          {error && <div className="fd-booking-error" role="alert">{error}</div>}
          <button className="fd-booking-submit" type="submit" disabled={loading || !selectedSlot}>{loading ? "Confirmando horário..." : "Confirmar conversa →"}</button>
          <small>Sem cobrança e sem compromisso.</small>
        </form>}
      </div>}
    </section>
  </main>;
}

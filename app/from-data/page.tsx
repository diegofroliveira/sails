import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FROM DATA — Mentoria para acelerar sua carreira em Dados",
  description: "Projetos reais, direção individual e uma jornada clara para transformar conhecimento em carreira em Dados.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "FROM DATA — Every career starts with a FROM",
    description: "Mentoria premium para profissionais de Dados e pessoas em transição de carreira.",
    images: [{ url: "/from-data-og.png", alt: "FROM DATA — Every career starts with a FROM" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FROM DATA — Every career starts with a FROM",
    description: "Mentoria para acelerar sua carreira em Dados.",
    images: ["/from-data-og.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "FROM DATA",
  description: "Mentoria para acelerar carreiras em Dados.",
  founder: { "@type": "Person", name: "Diego Oliveira" },
};

const careerCompanies = [
  { name: "MTE", detail: "Ministério do Trabalho e Emprego" },
  { name: "LTM", detail: "LTM Fidelidade" },
  { name: "Postal Saúde", image: "/brands/postal-saude.png" },
  { name: "Correios", image: "/brands/correios.svg" },
  { name: "Livelo", image: "/brands/livelo.svg" },
  { name: "Norte Energia", detail: "Norte Energia" },
  { name: "Vivo Fintech", image: "/brands/vivo.svg" },
  { name: "Mondelēz", image: "/brands/mondelez.jpg" },
  { name: "Vivo Telefônica", image: "/brands/telefonica.svg" },
];

const projectCompanies = [
  { name: "Banco do Brasil", image: "/brands/banco-do-brasil.svg" },
  { name: "Stanley", image: "/brands/stanley.png" },
  { name: "Pague Menos", image: "/brands/pague-menos.svg" },
];

export default function FromDataPage() {
  return (
    <div className="from-data-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="fd-site-header">
        <Link href="/from-data" aria-label="FROM DATA — início"><Image src="/from-data-logo.png" alt="FROM DATA" width={150} height={150} priority /></Link>
        <nav><a href="#experiencia">Experiência</a><a href="#metodo">Método</a><a href="#jornada">Jornada</a><a href="#para-quem">Para quem</a></nav>
        <Link className="fd-outline-cta" href="/from-data/agendar">Agendar brief call</Link>
      </header>

      <main>
        <section className="fd-hero">
          <div className="fd-grid-glow" />
          <div className="fd-query-window"><div><i /><i /><i /><span>career.sql</span></div><pre><code><b>SELECT</b> potential{`\n`}<strong>FROM</strong> data{`\n`}<em>WHERE</em> career = <q>&apos;next_level&apos;</q>;</code></pre><small>Query ready · 1 transformation found</small></div>
          <div className="fd-hero-copy"><span className="fd-kicker">MENTORIA PREMIUM EM DADOS</span><h1>Every career<br />starts with a <em>FROM.</em></h1><p>Transforme conhecimento em projetos, posicionamento e oportunidades com direção individual e execução prática.</p><div><Link className="fd-primary-cta" href="/from-data/agendar">Quero evoluir →</Link><a href="#metodo">Conhecer o método</a></div><small>Brief call de 30 minutos · sem compromisso</small></div>
        </section>

        <section className="fd-proof"><div><strong>01</strong><span>Diagnóstico individual</span></div><div><strong>02</strong><span>Projetos com contexto real</span></div><div><strong>03</strong><span>Feedback direto</span></div><div><strong>04</strong><span>Plano de carreira acionável</span></div></section>

        <section className="fd-authority" id="experiencia">
          <div className="fd-authority-intro">
            <span className="fd-kicker">EXPERIÊNCIA QUE NÃO CABE EM SLIDES</span>
            <h2>A IA melhora<br />a cada erro.<br /><em>Você também.</em></h2>
            <div className="fd-process-count"><strong>+100</strong><span>processos vividos<br />na prática</span></div>
          </div>
          <div className="fd-authority-copy">
            <p>Você não precisa cometer todos os erros para aprender com eles. Na FROM DATA, cada orientação parte de decisões, entregas, contextos e desafios que já aconteceram no mundo real.</p>
            <blockquote>Aprenda com quem já atravessou mais de 100 processos — e transformou cada acerto e cada erro em repertório para encurtar o seu caminho.</blockquote>
          </div>
        </section>

        <section className="fd-company-proof" aria-labelledby="company-proof-title">
          <div className="fd-company-head"><span className="fd-kicker">REPERTÓRIO DE MERCADO</span><h2 id="company-proof-title">Experiência construída<br />em diferentes contextos.</h2><p>Organizações onde atuei profissionalmente e marcas atendidas em projetos. Cada contexto trouxe problemas, escalas e aprendizados diferentes.</p></div>
          <div className="fd-company-group">
            <div className="fd-company-label"><span>01</span><div><strong>Experiência profissional</strong><small>Empresas e organizações onde atuei</small></div></div>
            <div className="fd-logo-wall">{careerCompanies.map((company) => <article key={company.name}>{company.image ? <Image src={company.image} alt={`Logo ${company.name}`} width={180} height={70} /> : <div className="fd-text-mark"><strong>{company.name}</strong><small>{company.detail}</small></div>}</article>)}</div>
          </div>
          <div className="fd-company-group projects">
            <div className="fd-company-label"><span>02</span><div><strong>Projetos e atuações pontuais</strong><small>Marcas atendidas em trabalhos específicos</small></div></div>
            <div className="fd-logo-wall project-logos">{projectCompanies.map((company) => <article key={company.name}><Image src={company.image} alt={`Logo ${company.name}`} width={180} height={70} /></article>)}</div>
          </div>
          <small className="fd-trademark-note">As marcas e logotipos pertencem aos seus respectivos titulares. A menção indica contexto de experiência profissional ou atuação em projetos, não vínculo comercial atual com a FROM DATA.</small>
        </section>

        <section className="fd-method" id="metodo">
          <div className="fd-section-copy"><span className="fd-kicker">THE FROM FRAMEWORK</span><h2>Sua carreira também<br />pode ser consultada.</h2><p>Um método que parte da sua realidade, conecta prática e posicionamento e mede evolução com evidências — não com promessas.</p></div>
          <div className="fd-sql-method"><article><code>SELECT</code><div><strong>Seu objetivo</strong><span>Definimos a transformação que realmente importa.</span></div></article><article><code>FROM</code><div><strong>Sua realidade atual</strong><span>Mapeamos experiência, lacunas e contexto.</span></div></article><article><code>JOIN</code><div><strong>Conhecimento + prática</strong><span>Construímos projetos que mostram capacidade.</span></div></article><article><code>WHERE</code><div><strong>Consistência</strong><span>Criamos uma rotina possível e sustentável.</span></div></article><article><code>GROUP BY</code><div><strong>Resultados</strong><span>Reunimos evidências para posicionamento e carreira.</span></div></article></div>
        </section>

        <section className="fd-journey" id="jornada">
          <div className="fd-section-head"><span className="fd-kicker">UMA JORNADA, NÃO UM CURSO</span><h2>Direção para sair do ponto atual<br />e chegar ao próximo nível.</h2></div>
          <div className="fd-journey-grid"><article><span>01 / DISCOVER</span><h3>Brief e diagnóstico</h3><p>Entendemos seu momento, objetivo, experiência e restrições antes de recomendar qualquer caminho.</p></article><article><span>02 / BUILD</span><h3>Plano e projetos</h3><p>Um plano revisado pelo mentor, com marcos claros e projetos conectados ao mercado.</p></article><article><span>03 / REVIEW</span><h3>Feedback individual</h3><p>Calls, revisões e check-ins para remover bloqueios e elevar a qualidade da execução.</p></article><article><span>04 / POSITION</span><h3>Carreira e oportunidades</h3><p>Portfólio, narrativa e preparação para mostrar o valor que você já construiu.</p></article></div>
        </section>

        <section className="fd-audience" id="para-quem"><div><span className="fd-kicker">PARA QUEM É</span><h2>Para quem quer construir<br />uma carreira que faz sentido.</h2></div><ul><li>Analistas de Dados</li><li>BI Developers</li><li>Analytics Engineers</li><li>Cientistas de Dados iniciantes</li><li>Profissionais em transição</li><li>Pessoas com conhecimento, mas sem direção</li></ul></section>

        <section className="fd-final-cta"><code>WHERE future = &apos;better&apos;;</code><h2>Query your future.</h2><p>Comece com uma conversa sobre o seu momento. A partir daí, construímos a jornada.</p><Link className="fd-primary-cta" href="/from-data/agendar">Agendar minha brief call →</Link><small>FROM DATA · Powered by Sails</small></section>
      </main>
    </div>
  );
}

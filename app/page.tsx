function SailsMark({ size = 30 }: { size?: number }) {
  return (
    <span className="lp-mark" aria-hidden="true">
      <svg width={size} height={size * 1.25} viewBox="0 0 100 125" fill="none">
        <path d="M50 6 C 28 24, 16 46, 20 66 C 23 84, 36 100, 50 100 C 62 100, 72 90, 71 76 C 70.5 68, 65 63, 59 65 C 65 50, 58 24, 50 6 Z" fill="currentColor" />
        <line x1="50" y1="100" x2="50" y2="118" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="lp-header">
        <a className="lp-brand" href="#inicio" aria-label="Sails — início"><SailsMark /><span>Sails</span></a>
        <nav aria-label="Navegação da landing page"><a href="#plataforma">Plataforma</a><a href="#diferencial">Por que Sails</a><a href="#recursos">Recursos</a></nav>
        <div className="lp-header-actions"><a className="lp-login" href="/portal">Entrar</a><a className="lp-cta small" href="/portal">Conhecer o portal <span>→</span></a></div>
      </header>

      <main>
        <section className="lp-hero" id="inicio">
          <div className="lp-hero-copy">
            <span className="lp-pill"><i /> Conteúdo · aquisição · retenção</span>
            <h1>Você guia a jornada.<br /><em>A Sails cuida do resto.</em></h1>
            <p>Da primeira venda à última aula, organize sua escola, acompanhe cada aluno e mantenha o negócio em movimento.</p>
            <div className="lp-hero-actions"><a className="lp-cta" href="/portal">Explorar a Sails <span>→</span></a><a className="lp-text-link" href="#plataforma">Ver como funciona <span>↓</span></a></div>
            <div className="lp-trust"><span><b>✓</b> Conteúdo e vídeo</span><span><b>✓</b> Funil e leads</span><span><b>✓</b> Retenção explicável</span></div>
          </div>

          <div className="lp-product-visual" aria-label="Prévia do portal Sails">
            <div className="lp-window">
              <div className="lp-window-bar"><div><span /><span /><span /></div><small>portal.sails.app</small><i /></div>
              <div className="lp-window-body">
                <aside><div className="mini-brand"><SailsMark size={14} /><strong>Sails</strong></div><span className="mini-nav active">⌂ <b>Cockpit</b></span><span className="mini-nav">◎ <b>Alunos</b></span><span className="mini-nav">▷ <b>Cursos</b></span><span className="mini-nav">◇ <b>Marketing</b></span></aside>
                <div className="mini-content"><small>VISÃO DE RETENÇÃO</small><h2>3 alunos precisam<br />de você hoje</h2><p>Comece por quem acumula mais sinais.</p><div className="mini-alert"><span className="mini-avatar">RC</span><div><strong>Rafael Costa</strong><small>14 dias sem atividade</small></div><em>Pede atenção</em></div><div className="mini-alert"><span className="mini-avatar">ML</span><div><strong>Marina Lopes</strong><small>1 entrega pendente</small></div><em className="warm">Esfriando</em></div><div className="mini-pulse"><span><b>17</b> no ritmo</span><span><b>3</b> atenção</span><span><b>1</b> acompanhando</span></div></div>
              </div>
            </div>
            <div className="lp-floating-card lead"><span>+12%</span><strong>Conversão do funil</strong><small>esta semana</small></div>
            <div className="lp-floating-card flame"><span>↗</span><strong>Chama retomada</strong><small>após check-in</small></div>
          </div>
        </section>

        <section className="lp-proof"><p>Uma única fonte de verdade para quem ensina, vende e acompanha.</p><div><span>Conteúdo</span><i>·</i><span>Aquisição</span><i>·</i><span>Retenção</span><i>·</i><span>Comunidade</span><i>·</i><span>Receita</span></div></section>

        <section className="lp-platform" id="plataforma">
          <div className="lp-section-head"><span className="lp-overline">Da primeira venda à última aula</span><h2>O ciclo inteiro da mentoria,<br /><em>sem perder o aluno de vista.</em></h2><p>Outras plataformas avisam quando o pagamento falhou. A Sails avisa quando o vínculo está falhando — e mostra o que fazer.</p></div>
          <div className="lp-feature-grid">
            <article className="lp-feature course"><div className="lp-feature-icon">▷</div><span>01 · ENSINAR</span><h3>Conteúdo que dá vontade de continuar</h3><p>Organize módulos, vídeos, materiais, quizzes e encontros. Veja onde a turma avança — e onde trava.</p><div className="feature-ui"><div className="feature-video"><i>▶</i><span /></div><div className="feature-lessons"><b /><b /><b /></div></div></article>
            <article className="lp-feature marketing"><div className="lp-feature-icon">◇</div><span>02 · CRESCER</span><h3>Seu funil pegando vento</h3><p>Capture leads, acompanhe cada conversa e saiba qual próxima ação aproxima a pessoa certa da trilha certa.</p><div className="feature-kanban"><div><small>NOVOS</small><b>4</b><span /><span /></div><div><small>CONVERSA</small><b>3</b><span /><span /></div><div><small>PROPOSTA</small><b>2</b><span /></div></div></article>
            <article className="lp-feature retention"><div className="lp-feature-icon">◉</div><span>03 · PERMANECER</span><h3>Aja antes da desistência</h3><p>Sinais concretos de atividade, entrega e ritmo mostram quem precisa de atenção e por quê.</p><div className="feature-signal"><div><span>!</span><p><strong>Rafael está parando</strong><small>14 dias sem atividade · entrega pendente</small></p></div><button>Preparar check-in →</button></div></article>
          </div>
        </section>

        <section className="lp-difference" id="diferencial">
          <div className="lp-symbol-stage"><div className="lp-glow" /><SailsMark size={150} /><span className="symbol-note flame-note">Chama<small>o engajamento que não apaga</small></span><span className="symbol-note sail-note">Sail / Sales<small>o negócio que ganha vento</small></span></div>
          <div className="lp-difference-copy"><span className="lp-overline">Uma marca, duas forças</span><h2>Para o aluno seguir.<br />Para o mentor crescer.</h2><p>Sails carrega no nome o movimento da vela ao vento e a energia de sales. O produto une as duas coisas: permanência e crescimento.</p><ul><li><span>01</span><div><strong>Visão acionável</strong><small>Não apenas gráficos: uma fila clara de quem precisa de você.</small></div></li><li><span>02</span><div><strong>Explicabilidade desde o início</strong><small>Cada sinal vem acompanhado dos fatos que o produziram.</small></div></li><li><span>03</span><div><strong>Mentoria em um só lugar</strong><small>Curso, relacionamento e negócio falando a mesma língua.</small></div></li></ul></div>
        </section>

        <section className="lp-resources" id="recursos">
          <div className="lp-section-head compact"><span className="lp-overline">Tudo que sustenta a operação</span><h2>Menos ferramentas.<br /><em>Mais continuidade.</em></h2></div>
          <div className="resource-grid"><article><span>▷</span><h3>Cursos & trilhas</h3><p>Vídeos, módulos, quizzes, materiais e liberação programada.</p></article><article><span>◎</span><h3>Alunos & progresso</h3><p>Perfis, histórico, entregas, ritmo e contexto completo.</p></article><article><span>◇</span><h3>Funil & leads</h3><p>Pipeline, origens, propostas e próxima melhor ação.</p></article><article><span>◉</span><h3>Retenção</h3><p>Alertas explicáveis, check-ins e acompanhamento da retomada.</p></article><article><span>◌</span><h3>Comunidade</h3><p>Discussões, agenda e encontros próximos do conteúdo.</p></article><article><span>↗</span><h3>Vendas & automações</h3><p>Checkout, assinaturas, cupons, afiliados e jornadas de e-mail.</p></article></div>
        </section>

        <section className="lp-final"><SailsMark size={46} /><span className="lp-overline">A mentoria nunca apaga</span><h2>Você guia a jornada.<br />A Sails cuida do resto.</h2><p>Conteúdo, vendas, comunidade e retenção navegando juntos.</p><a className="lp-cta light" href="/portal">Entrar no portal Sails <span>→</span></a></section>
      </main>

      <footer className="lp-footer"><a className="lp-brand" href="#inicio"><SailsMark size={22} /><span>Sails</span></a><p>Você guia a jornada. A Sails cuida do resto.</p><a href="/portal">Acessar portal →</a></footer>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ORGANIZATION_ID = "df67d7ba-c5e5-4d51-b76f-40bf4052eee3";

type BusinessTab = "overview" | "clients" | "contracts" | "catalog" | "receivables" | "expenses";
type Client = { id: string; full_name: string; email: string | null; phone: string | null; status: string; health_score: number | null; acquisition_source: string | null };
type Service = { id: string; name: string; category: string; description: string | null; deliverables: unknown; price_minor: number; billing_type: string; visibility: string; status: string };
type Contract = { id: string; client_account_id: string; service_id: string; contract_number: string; status: string; starts_on: string; ends_on: string | null; amount_minor: number; payment_terms: string | null; signed_at: string | null };
type Receivable = { id: string; client_account_id: string; contract_id: string | null; description: string; due_on: string; amount_minor: number; paid_amount_minor: number; status: string; payment_method: string | null };
type Expense = { id: string; description: string; vendor: string | null; category: string; occurred_on: string; amount_minor: number; status: string; recurring: boolean };

const tabs: Array<[BusinessTab, string]> = [
  ["overview", "Visão geral"],
  ["clients", "Clientes"],
  ["contracts", "Contratos"],
  ["catalog", "Catálogo"],
  ["receivables", "Recebíveis"],
  ["expenses", "Despesas"],
];

const money = (minor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minor / 100);
const shortDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00-03:00`));
const statusLabel: Record<string, string> = {
  active: "Ativo", paused: "Pausado", lead: "Lead", alumni: "Alumni", cancelled: "Cancelado",
  draft: "Rascunho", sent: "Enviado", completed: "Concluído", expired: "Expirado",
  pending: "A receber", overdue: "Em atraso", partial: "Pago parcial", paid: "Pago", archived: "Arquivado",
};

export default function BusinessView({ onToast }: { onToast: (message: string) => void }) {
  const [tab, setTab] = useState<BusinessTab>("overview");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [query, setQuery] = useState("");
  const [receivableFilter, setReceivableFilter] = useState("all");

  useEffect(() => {
    let active = true;
    async function loadBusiness() {
      const supabase = createSupabaseBrowserClient();
      const [clientsResult, servicesResult, contractsResult, receivablesResult, expensesResult] = await Promise.all([
        supabase.from("client_accounts").select("*").eq("organization_id", ORGANIZATION_ID).order("full_name"),
        supabase.from("service_catalog").select("*").eq("organization_id", ORGANIZATION_ID).order("created_at"),
        supabase.from("client_contracts").select("*").eq("organization_id", ORGANIZATION_ID).order("created_at", { ascending: false }),
        supabase.from("receivables").select("*").eq("organization_id", ORGANIZATION_ID).order("due_on"),
        supabase.from("business_expenses").select("*").eq("organization_id", ORGANIZATION_ID).order("occurred_on", { ascending: false }),
      ]);
      if (!active) return;
      const firstError = clientsResult.error || servicesResult.error || contractsResult.error || receivablesResult.error || expensesResult.error;
      if (firstError) onToast("Não foi possível carregar toda a operação. Atualize a página.");
      setClients(clientsResult.data ?? []);
      setServices(servicesResult.data ?? []);
      setContracts(contractsResult.data ?? []);
      setReceivables(receivablesResult.data ?? []);
      setExpenses(expensesResult.data ?? []);
      setLoading(false);
    }
    void loadBusiness();
    return () => { active = false; };
  }, [onToast]);

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const serviceById = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const expected = receivables.reduce((total, item) => total + item.amount_minor, 0);
  const received = receivables.reduce((total, item) => total + item.paid_amount_minor, 0);
  const pending = receivables.filter((item) => ["pending", "partial", "overdue"].includes(item.status)).reduce((total, item) => total + item.amount_minor - item.paid_amount_minor, 0);
  const expenseTotal = expenses.filter((item) => item.status !== "cancelled").reduce((total, item) => total + item.amount_minor, 0);
  const margin = received - expenseTotal;
  const activeClients = clients.filter((client) => client.status === "active").length;
  const activeContracts = contracts.filter((contract) => contract.status === "active").length;
  const attentionClients = clients.filter((client) => (client.health_score ?? 100) < 60);

  const filteredClients = clients.filter((client) => `${client.full_name} ${client.email ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const filteredReceivables = receivables.filter((item) => receivableFilter === "all" || item.status === receivableFilter);
  const expenseCategories = Array.from(expenses.reduce((map, item) => map.set(item.category, (map.get(item.category) ?? 0) + item.amount_minor), new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]);
  const maxExpense = Math.max(...expenseCategories.map((item) => item[1]), 1);

  function openTab(next: BusinessTab) {
    setTab(next);
    setQuery("");
  }

  return <section className="page business-page" aria-labelledby="business-title">
    <div className="page-heading business-heading">
      <div><p className="eyebrow">Sails · Business OS</p><h1 id="business-title">Negócio conectado à jornada.</h1><p>Cliente, contrato, entrega e caixa no mesmo contexto.</p></div>
      <button className="button primary" onClick={() => onToast("A criação guiada entra na próxima etapa do piloto.")}>+ Novo registro</button>
    </div>

    <nav className="business-tabs" aria-label="Áreas do negócio">
      {tabs.map(([value, label]) => <button key={value} aria-current={tab === value ? "page" : undefined} onClick={() => openTab(value)}>{label}{value === "receivables" && pending > 0 && <span>{receivables.filter((item) => item.status !== "paid").length}</span>}</button>)}
    </nav>

    {loading ? <div className="business-loading"><i /><span>Consultando sua operação...</span></div> : <>
      {tab === "overview" && <div className="business-overview">
        <div className="business-kpis">
          <article><span>RECEBIDO</span><strong>{money(received)}</strong><small>de {money(expected)} contratado</small></article>
          <article><span>A RECEBER</span><strong>{money(pending)}</strong><small>{receivables.filter((item) => item.status !== "paid").length} lançamentos</small></article>
          <article><span>MARGEM OPERACIONAL</span><strong className={margin >= 0 ? "positive" : "negative"}>{money(margin)}</strong><small>recebido menos despesas</small></article>
          <article><span>CARTEIRA ATIVA</span><strong>{activeClients}</strong><small>{activeContracts} contratos ativos</small></article>
        </div>

        <div className="business-overview-grid">
          <section className="operations-card business-cash-card">
            <div className="operations-card-head"><div><span className="section-kicker">Financeiro + entrega</span><h2>Pulso do negócio</h2></div><button className="text-button" onClick={() => openTab("receivables")}>Abrir financeiro →</button></div>
            <div className="business-cash-bars">
              <article><span><strong>Receita recebida</strong><em>{money(received)}</em></span><i><b style={{ width: `${Math.min(100, expected ? received / expected * 100 : 0)}%` }} /></i></article>
              <article><span><strong>Despesas</strong><em>{money(expenseTotal)}</em></span><i><b className="expense" style={{ width: `${Math.min(100, received ? expenseTotal / received * 100 : 0)}%` }} /></i></article>
              <article><span><strong>Carteira saudável</strong><em>{clients.filter((client) => (client.health_score ?? 0) >= 70).length} de {clients.length}</em></span><i><b className="health" style={{ width: `${clients.length ? clients.filter((client) => (client.health_score ?? 0) >= 70).length / clients.length * 100 : 0}%` }} /></i></article>
            </div>
            <div className="business-insight"><span>SAILS INSIGHT</span><p><strong>Caixa e retenção contam a mesma história.</strong> Priorize clientes com saúde baixa antes do próximo vencimento para reduzir risco de cancelamento.</p></div>
          </section>

          <section className="operations-card business-attention">
            <div className="operations-card-head"><div><span className="section-kicker">Ação recomendada</span><h2>Quem pede atenção</h2></div><span className="business-count">{attentionClients.length}</span></div>
            {attentionClients.map((client) => <button key={client.id} onClick={() => { openTab("clients"); setQuery(client.full_name); }}><span className="avatar">{client.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><p><strong>{client.full_name}</strong><small>Saúde {client.health_score}% · {client.acquisition_source}</small></p><em>→</em></button>)}
            {attentionClients.length === 0 && <p className="business-empty">Nenhum cliente em atenção.</p>}
          </section>
        </div>

        <section className="operations-card business-next">
          <div className="operations-card-head"><div><span className="section-kicker">Próximos movimentos</span><h2>Agenda de caixa</h2></div><button className="text-button" onClick={() => openTab("receivables")}>Ver todos</button></div>
          <div>{receivables.filter((item) => item.status !== "paid").slice(0, 4).map((item) => <article key={item.id}><time>{shortDate(item.due_on)}</time><span><strong>{clientById.get(item.client_account_id)?.full_name}</strong><small>{item.description}</small></span><b>{money(item.amount_minor - item.paid_amount_minor)}</b><em className={`business-status ${item.status}`}>{statusLabel[item.status]}</em></article>)}</div>
        </section>
      </div>}

      {tab === "clients" && <>
        <div className="business-toolbar"><div><span className="section-kicker">Carteira 360º</span><strong>{clients.length} clientes e oportunidades</strong></div><label className="business-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente..." /></label></div>
        <div className="client-account-grid">{filteredClients.map((client) => {
          const contract = contracts.find((item) => item.client_account_id === client.id);
          const next = receivables.find((item) => item.client_account_id === client.id && item.status !== "paid");
          return <article key={client.id} className="client-account-card">
            <header><span className="avatar">{client.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{client.full_name}</strong><small>{client.email}</small></div><em className={`business-status ${client.status}`}>{statusLabel[client.status]}</em></header>
            <div className="client-health"><span><small>SAÚDE DA JORNADA</small><strong>{client.health_score ?? "—"}%</strong></span><i><b style={{ width: `${client.health_score ?? 0}%` }} /></i></div>
            <dl><div><dt>Contrato</dt><dd>{contract?.contract_number ?? "Sem contrato"}</dd></div><div><dt>Oferta</dt><dd>{contract ? serviceById.get(contract.service_id)?.name : "Em qualificação"}</dd></div><div><dt>Próximo financeiro</dt><dd>{next ? `${shortDate(next.due_on)} · ${money(next.amount_minor - next.paid_amount_minor)}` : "Em dia"}</dd></div></dl>
            <footer><span>{client.phone ?? "Telefone não informado"}</span><button onClick={() => onToast(`Visão 360º de ${client.full_name} preparada.`)}>Abrir jornada →</button></footer>
          </article>;
        })}</div>
      </>}

      {tab === "contracts" && <section className="operations-card business-table-card">
        <div className="operations-card-head"><div><span className="section-kicker">Acordos comerciais</span><h2>Contratos</h2></div><button className="button" onClick={() => onToast("O editor de contratos será liberado no piloto financeiro.")}>+ Novo contrato</button></div>
        <div className="business-table-wrap"><table className="business-table"><thead><tr><th>Contrato</th><th>Cliente</th><th>Oferta</th><th>Vigência</th><th>Valor</th><th>Status</th><th /></tr></thead><tbody>{contracts.map((contract) => <tr key={contract.id}><td><strong>{contract.contract_number}</strong><small>{contract.signed_at ? "Assinado digitalmente" : "Aguardando assinatura"}</small></td><td>{clientById.get(contract.client_account_id)?.full_name}</td><td>{serviceById.get(contract.service_id)?.name}</td><td>{shortDate(contract.starts_on)}{contract.ends_on ? ` → ${shortDate(contract.ends_on)}` : " → contínuo"}</td><td><strong>{money(contract.amount_minor)}</strong><small>{contract.payment_terms}</small></td><td><em className={`business-status ${contract.status}`}>{statusLabel[contract.status]}</em></td><td><button onClick={() => onToast(`${contract.contract_number} aberto para revisão.`)}>→</button></td></tr>)}</tbody></table></div>
      </section>}

      {tab === "catalog" && <>
        <div className="business-toolbar"><div><span className="section-kicker">Produtos, serviços e pacotes</span><strong>{services.filter((service) => service.status === "active").length} ofertas ativas</strong></div><button className="button primary" onClick={() => onToast("Nova oferta poderá reutilizar cursos, encontros e materiais já criados.")}>+ Nova oferta</button></div>
        <div className="service-catalog-grid">{services.map((service) => {
          const deliverables = Array.isArray(service.deliverables) ? service.deliverables as string[] : [];
          return <article key={service.id} className="service-catalog-card"><header><span>{service.category.toUpperCase()}</span><em className={`business-status ${service.status}`}>{statusLabel[service.status]}</em></header><h2>{service.name}</h2><p>{service.description}</p><ul>{deliverables.slice(0, 4).map((item) => <li key={item}>✓ {item}</li>)}</ul><footer><div><strong>{money(service.price_minor)}</strong><small>{service.billing_type === "monthly" ? "/mês" : service.billing_type === "installments" ? "· parcelável" : "· único"}</small></div><span>{service.visibility === "public" ? "Pública" : "Privada"}</span><button onClick={() => onToast(`${service.name} aberto para edição.`)}>Editar →</button></footer></article>;
        })}</div>
      </>}

      {tab === "receivables" && <section className="operations-card business-table-card">
        <div className="operations-card-head"><div><span className="section-kicker">Agenda financeira</span><h2>Recebíveis</h2></div><button className="button" onClick={() => onToast("Novo recebível será vinculado a cliente e contrato.")}>+ Novo recebível</button></div>
        <div className="receivable-summary"><article><span>ESPERADO</span><strong>{money(expected)}</strong></article><article><span>RECEBIDO</span><strong className="positive">{money(received)}</strong></article><article><span>EM ABERTO</span><strong>{money(pending)}</strong></article></div>
        <div className="business-filter-row">{[["all","Todos"],["overdue","Em atraso"],["pending","A receber"],["partial","Pago parcial"],["paid","Pago"]].map(([value, label]) => <button key={value} aria-pressed={receivableFilter === value} onClick={() => setReceivableFilter(value)}>{label}</button>)}</div>
        <div className="business-table-wrap"><table className="business-table"><thead><tr><th>Vencimento</th><th>Cliente</th><th>Descrição</th><th>Forma</th><th>Valor</th><th>Status</th></tr></thead><tbody>{filteredReceivables.map((item) => <tr key={item.id}><td>{shortDate(item.due_on)}</td><td><strong>{clientById.get(item.client_account_id)?.full_name}</strong></td><td>{item.description}</td><td>{item.payment_method ?? "A definir"}</td><td><strong>{money(item.amount_minor)}</strong>{item.paid_amount_minor > 0 && item.paid_amount_minor < item.amount_minor && <small>{money(item.paid_amount_minor)} pago</small>}</td><td><em className={`business-status ${item.status}`}>{statusLabel[item.status]}</em></td></tr>)}</tbody></table></div>
      </section>}

      {tab === "expenses" && <div className="expense-layout">
        <section className="operations-card expense-breakdown"><div className="operations-card-head"><div><span className="section-kicker">Custos por categoria</span><h2>{money(expenseTotal)} no período</h2></div><button className="button" onClick={() => onToast("Nova despesa poderá ser recorrente ou pontual.")}>+ Nova despesa</button></div><div>{expenseCategories.map(([category, amount]) => <article key={category}><span><strong>{category}</strong><em>{money(amount)}</em></span><i><b style={{ width: `${amount / maxExpense * 100}%` }} /></i></article>)}</div></section>
        <section className="operations-card expense-list"><div className="operations-card-head"><div><span className="section-kicker">Lançamentos</span><h2>Despesas recentes</h2></div></div>{expenses.map((expense) => <article key={expense.id}><span className="expense-icon">−</span><p><strong>{expense.description}</strong><small>{expense.vendor} · {shortDate(expense.occurred_on)}{expense.recurring ? " · recorrente" : ""}</small></p><b>{money(expense.amount_minor)}</b><em className={`business-status ${expense.status}`}>{statusLabel[expense.status] ?? expense.status}</em></article>)}</section>
      </div>}
    </>}
  </section>;
}

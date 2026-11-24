import { and, asc, count, eq, gte, isNotNull, sql } from "drizzle-orm";
import Link from "next/link";
import { requireDb } from "@/db";
import { eventInterests, events, leads, participatingCompanies, whatsappClicks } from "@/db/schema";
import { CATEGORY_LABELS, fmtDateTime, LEAD_CATEGORIES } from "@/lib/admin/labels";
import { can, requireUser } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

const PERIODS = { "30": "Últimos 30 dias", "90": "Últimos 90 dias", "365": "Últimos 12 meses" } as const;
type Period = keyof typeof PERIODS;

function Stat({ label, value, href, linkable }: { label: string; value: number; href?: string; linkable: boolean }) {
  return href && linkable
    ? <Link className="adm-stat" href={href}><span>{label}</span><strong>{value}</strong></Link>
    : <div className="adm-stat"><span>{label}</span><strong>{value}</strong></div>;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser("dashboard");
  const sp = await searchParams;
  const period: Period = sp.periodo && sp.periodo in PERIODS ? (sp.periodo as Period) : "30";
  const now = new Date();
  const since = new Date(now.getTime() - Number(period) * 86400_000);
  const monthStart = new Date(`${new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).format(now)}-01T00:00:00-03:00`);
  const db = requireDb();

  const [[totals], byCategory, [clicks], [interests], [companies], upcoming, monthly] = await Promise.all([
    db.select({
      total: count(),
      month: sql<number>`count(*) filter (where ${leads.createdAt} >= ${monthStart})`.mapWith(Number),
      pending: sql<number>`count(*) filter (where ${leads.status} = 'novo')`.mapWith(Number),
      inPeriod: sql<number>`count(*) filter (where ${leads.createdAt} >= ${since})`.mapWith(Number),
    }).from(leads),
    db.select({ category: leads.category, n: count() }).from(leads).where(gte(leads.createdAt, since)).groupBy(leads.category),
    db.select({ n: count() }).from(whatsappClicks).where(gte(whatsappClicks.createdAt, since)),
    db.select({ n: count() }).from(eventInterests).where(gte(eventInterests.createdAt, since)),
    db.select({ n: count() }).from(participatingCompanies).where(eq(participatingCompanies.active, true)),
    db.select({ id: events.id, name: events.name, startsAt: events.startsAt, published: isNotNull(events.publishedAt) })
      .from(events).where(and(gte(events.startsAt, now), sql`${events.status} <> 'cancelado'`)).orderBy(asc(events.startsAt)).limit(4),
    db.select({ month: sql<string>`to_char(date_trunc('month', ${leads.createdAt} at time zone 'America/Sao_Paulo'), 'YYYY-MM')`, n: count() })
      .from(leads).where(gte(leads.createdAt, new Date(now.getTime() - 183 * 86400_000))).groupBy(sql`1`).orderBy(sql`1`),
  ]);

  const catCount = (c: string) => byCategory.find((r) => r.category === c)?.n ?? 0;
  const maxCat = Math.max(1, ...byCategory.map((r) => r.n));
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d).replace(".", ""), n: monthly.find((m) => m.month === key)?.n ?? 0 };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.n));
  const leadsLink = can(user, "leads");

  return (
    <>
      {sp["sem-permissao"] && <p className="adm-alert" style={{ marginBottom: 16 }}>Seu perfil não tem acesso a essa área.</p>}
      <div className="adm-head">
        <div><h1>Olá, {user.name.split(" ")[0]}</h1><p>Visão geral da Avança Negócios.</p></div>
        <nav className="adm-seg" aria-label="Período">
          {(Object.keys(PERIODS) as Period[]).map((p) => <Link key={p} href={`/admin?periodo=${p}`} aria-current={p === period ? "page" : undefined}>{p === "365" ? "12 meses" : `${p} dias`}</Link>)}
        </nav>
      </div>

      <div className="adm-grid adm-grid--4">
        <Stat linkable={leadsLink} label="Leads recebidos (total)" value={totals.total} href="/admin/leads" />
        <Stat linkable={leadsLink} label="Leads neste mês" value={totals.month} href="/admin/leads" />
        <Stat linkable={leadsLink} label="Pendentes de atendimento" value={totals.pending} href="/admin/leads?status=novo" />
        <Stat linkable={leadsLink} label="Empresas participantes" value={companies.n} />
      </div>

      <div className="adm-grid adm-grid--4" style={{ marginTop: 16 }}>
        <Stat linkable={leadsLink} label="Interessados em eventos" value={catCount("eventos") + catCount("networking")} href="/admin/leads?categoria=eventos" />
        <Stat linkable={leadsLink} label="Interessados em comprar empresas" value={catCount("compra_empresa")} href="/admin/leads?categoria=compra_empresa" />
        <Stat linkable={leadsLink} label="Interessados em vender empresas" value={catCount("venda_empresa")} href="/admin/leads?categoria=venda_empresa" />
        <Stat linkable={leadsLink} label="Cliques no WhatsApp" value={clicks.n} />
      </div>
      <p className="adm-muted" style={{ fontSize: 13, margin: "8px 0 0" }}>A segunda linha considera o período selecionado: {PERIODS[period].toLowerCase()}. Cliques em “Tenho interesse” nos encontros: {interests.n}.</p>

      <div className="adm-grid adm-grid--2" style={{ marginTop: 24 }}>
        <section className="adm-card">
          <h2>Leads por categoria · {PERIODS[period].toLowerCase()}</h2>
          {totals.inPeriod === 0 ? <p className="adm-muted">Nenhum lead no período.</p> : (
            <div className="adm-bars">
              {LEAD_CATEGORIES.map((c) => (
                <div key={c} className="adm-bar"><span>{CATEGORY_LABELS[c]}</span><span className="adm-bar__track"><span className="adm-bar__fill" style={{ display: "block", width: `${(catCount(c) / maxCat) * 100}%` }} /></span><b>{catCount(c)}</b></div>
              ))}
            </div>
          )}
        </section>
        <section className="adm-card">
          <h2>Leads nos últimos 6 meses</h2>
          {months.every((m) => m.n === 0) ? <p className="adm-muted">O gráfico aparece quando houver leads registrados.</p> : (
            <div className="adm-cols" role="img" aria-label={months.map((m) => `${m.label}: ${m.n}`).join(", ")}>
              {months.map((m) => <div key={m.key}><b>{m.n}</b><i style={{ height: `${(m.n / maxMonth) * 100}%` }} />{m.label}</div>)}
            </div>
          )}
        </section>
      </div>

      <section className="adm-card" style={{ marginTop: 16 }}>
        <h2>Próximos eventos</h2>
        {upcoming.length === 0 ? <p className="adm-muted">Nenhum evento futuro cadastrado. {can(user, "eventos") && <Link href="/admin/eventos/novo">Cadastrar evento</Link>}</p> : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {upcoming.map((e) => <li key={e.id}>{can(user, "eventos") ? <Link href={`/admin/eventos/${e.id}`}>{e.name}</Link> : e.name} — {fmtDateTime(e.startsAt)}{!e.published && " (não publicado)"}</li>)}
          </ul>
        )}
      </section>
    </>
  );
}

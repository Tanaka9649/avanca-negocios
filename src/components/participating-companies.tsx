import type { PublicCompany } from "@/lib/public-data";

function href(c: PublicCompany) {
  if (c.website) return c.website.startsWith("http") ? c.website : `https://${c.website}`;
  if (c.instagram) return `https://instagram.com/${c.instagram.replace(/^@/, "")}`;
  return null;
}

/** Empresas que já passaram pelo Avança, cadastradas no painel. Sem empresas, a seção não aparece. Grade fixa só com as logos, todas visíveis, sem rolagem. */
export function ParticipatingCompanies({ companies }: { companies: PublicCompany[] }) {
  if (companies.length === 0) return null;
  return (
    <section className="co" aria-labelledby="empresas-title">
      <div className="wrap co__head">
        <h2 id="empresas-title" className="h2">Empresas que já passaram pelo Avança.</h2>
        <p className="body">Empresários de diferentes segmentos que já fizeram parte das conexões da Avança.</p>
      </div>
      <ul className="wrap co__grid">
        {companies.map((c) => {
          const link = href(c);
          const logo = c.logoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={c.logoUrl} alt={c.name} loading="lazy" decoding="async" />
            : <span className="co__initial" aria-label={c.name}>{c.name.slice(0, 1)}</span>;
          return (
            <li key={c.id} className="co__cell">
              {link ? <a className="co__card" href={link} target="_blank" rel="noopener noreferrer" aria-label={c.name}>{logo}</a> : <div className="co__card">{logo}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

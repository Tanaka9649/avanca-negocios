import type { PublicCompany } from "@/lib/public-data";

function href(c: PublicCompany) {
  if (c.website) return c.website.startsWith("http") ? c.website : `https://${c.website}`;
  if (c.instagram) return `https://instagram.com/${c.instagram.replace(/^@/, "")}`;
  return null;
}

export function ParticipatingCompanies({ companies }: { companies: PublicCompany[] }) {
  if (companies.length === 0) return null;
  return (
    <section className="section white" aria-labelledby="empresas-title">
      <div className="wrap">
        <h2 id="empresas-title" className="h2" style={{ maxWidth: "18ch" }}>Empresas que acreditam no poder das conexões.</h2>
        <ul className="companies" style={{ listStyle: "none", padding: 0 }}>
          {companies.map((c) => {
            const link = href(c);
            const inner = (
              <>
                {c.logoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={c.logoUrl} alt={c.name} loading="lazy" />
                  : <span className="company__name">{c.name}</span>}
                {c.segment && <span className="company__seg">{c.segment}</span>}
              </>
            );
            return (
              <li key={c.id} style={{ display: "contents" }}>
                {link
                  ? <a className="company" href={link} target="_blank" rel="noopener noreferrer">{inner}</a>
                  : <div className="company">{inner}</div>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import type { PublicCompany } from "@/lib/public-data";

function href(c: PublicCompany) {
  if (c.website) return c.website.startsWith("http") ? c.website : `https://${c.website}`;
  if (c.instagram) return `https://instagram.com/${c.instagram.replace(/^@/, "")}`;
  return null;
}

/** Empresas que já passaram pelo Avança, cadastradas no painel. Sem empresas, a seção não aparece. Com 5 ou mais, vira um trilho horizontal guiado pela rolagem. */
export function ParticipatingCompanies({ companies }: { companies: PublicCompany[] }) {
  if (companies.length === 0) return null;
  const mode = companies.length >= 5 ? "rail" : "grid";
  return (
    <section className={`co co--${mode}`} aria-labelledby="empresas-title" data-rail data-mode={mode}>
      <div className="wrap co__head">
        <h2 id="empresas-title" className="h2">Empresas que já passaram pelo Avança.</h2>
        <p className="body">Empresários de diferentes segmentos que já fizeram parte das conexões da Avança.</p>
      </div>
      <div className="co__viewport" data-rail-viewport>
        <ul className="co__track" data-rail-track>
          {companies.map((c) => {
            const link = href(c);
            const inner = (
              <>
                <span className="co__logo">
                  {c.logoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={c.logoUrl} alt={c.name} loading="lazy" decoding="async" />
                    : <span className="co__initial" aria-hidden="true">{c.name.slice(0, 1)}</span>}
                </span>
                <span className="co__name">{c.name}</span>
                {c.segment && <span className="co__seg">{c.segment}</span>}
              </>
            );
            return (
              <li key={c.id} className="co__item" data-company>
                {link ? <a className="co__card" href={link} target="_blank" rel="noopener noreferrer">{inner}</a> : <div className="co__card">{inner}</div>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import Image from "next/image";

export const FERNANDA_ROLES = [
  { title: "CEO", org: "Avança Imóveis" },
  { title: "CEO", org: "Avança Negócios" },
  { title: "Empreendedora", org: "" },
  { title: "Mentora de grandes negócios", org: "" },
];

export function FernandaSection({ headline, paragraphs, id }: { headline: string; paragraphs: string[]; id?: string }) {
  return (
    <section className="section light fernanda" id={id} aria-labelledby="fernanda-title">
      <div className="wrap fernanda__grid">
        <div className="fernanda__photo">
          <Image src="/pessoas/fernanda.webp" alt="Fernanda, CEO da Avança Imóveis e da Avança Negócios" fill sizes="(min-width: 980px) 440px, 90vw" />
        </div>
        <div className="fernanda__text">
          <p className="fernanda__name" aria-hidden="true">Fernanda</p>
          <h2 id="fernanda-title" className="h2" style={{ maxWidth: "16ch" }}>{headline}</h2>
          <div style={{ marginTop: 28 }}>
            {paragraphs.map((p) => <p key={p} className="body">{p}</p>)}
          </div>
          <ul className="roles" aria-label="Atuação">
            {FERNANDA_ROLES.map((r) => (
              <li key={r.title + r.org}>{r.title}{r.org && <small>{r.org}</small>}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

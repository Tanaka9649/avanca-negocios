import Image from "next/image";
import type { FernandaContent } from "@/lib/site-content";

export function FernandaSection({ content, variant, id }: { content: FernandaContent; variant: "eventos" | "empresas"; id?: string }) {
  const headline = variant === "eventos" ? content.eventosHeadline : content.empresasHeadline;
  const paragraphs = (variant === "eventos" ? content.eventosParagraphs : content.empresasParagraphs).filter(Boolean);
  return (
    <section className="section light fernanda" id={id} aria-labelledby="fernanda-title">
      <div className="wrap fernanda__grid">
        <div className="fernanda__photo">
          <Image src={content.photoUrl} alt={content.photoAlt} fill sizes="(min-width: 980px) 440px, 90vw" unoptimized={content.photoUrl.startsWith("/midia/")} />
        </div>
        <div className="fernanda__text">
          <p className="fernanda__name" aria-hidden="true">Fernanda</p>
          <h2 id="fernanda-title" className="h2" style={{ maxWidth: "16ch" }}>{headline}</h2>
          <div style={{ marginTop: 28 }}>
            {paragraphs.map((p) => <p key={p} className="body">{p}</p>)}
          </div>
          <ul className="roles" aria-label="Atuação">
            {content.roles.filter((r) => r.title).map((r) => (
              <li key={r.title + r.org}>{r.title}{r.org && <small>{r.org}</small>}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

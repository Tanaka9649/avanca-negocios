import Image from "next/image";
import type { FernandaContent } from "@/lib/site-content";

function Photo({ content, sizes }: { content: FernandaContent; sizes: string }) {
  return <Image src={content.photoUrl} alt={content.photoAlt} fill sizes={sizes} unoptimized={content.photoUrl.startsWith("/midia/")} />;
}

const roles = (c: FernandaContent) => c.roles.filter((r) => r.title);

/** Eventos: retrato em destaque, nome tipográfico e atuações em sequência. */
export function FernandaEventos({ content }: { content: FernandaContent }) {
  const paragraphs = content.eventosParagraphs.filter(Boolean);
  return (
    <section className="fe" aria-labelledby="fernanda-title" data-fe>
      <div className="wrap fe__grid">
        <div className="fe__photo" data-fe-photo>
          <div className="fe__photo-inner" data-fe-photo-inner><Photo content={content} sizes="(min-width: 980px) 520px, 92vw" /></div>
        </div>
        <div className="fe__text">
          <p className="fe__name" aria-hidden="true" data-fe-name>
            {"Fernanda".split("").map((ch, i) => <span key={i}>{ch}</span>)}
          </p>
          <h2 id="fernanda-title" className="h2 fe__headline">{content.eventosHeadline}</h2>
          {paragraphs.map((p) => <p key={p} className="body fe__p">{p}</p>)}
          <ul className="fe__roles" aria-label="Atuação">
            {roles(content).map((r) => (
              <li key={r.title + r.org} data-fe-role><span>{r.title}</span>{r.org && <small>{r.org}</small>}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Compra e venda: composição editorial sóbria, foco em visão de negócio e confiança. */
export function FernandaEmpresas({ content }: { content: FernandaContent }) {
  const paragraphs = content.empresasParagraphs.filter(Boolean);
  return (
    <section className="mf" aria-labelledby="fernanda-title" data-mf>
      <div className="wrap mf__grid">
        <div className="mf__text">
          <p className="mf__kicker" data-mf-reveal>Quem conduz</p>
          <h2 id="fernanda-title" className="mf__headline" data-mf-reveal>{content.empresasHeadline}</h2>
          {paragraphs.map((p) => <p key={p} className="mf__p" data-mf-reveal>{p}</p>)}
          <dl className="mf__roles">
            <dt className="sr-only">Fernanda</dt>
            {roles(content).map((r) => (
              <dd key={r.title + r.org} data-mf-role><span>{r.title}</span>{r.org && <span className="mf__org">{r.org}</span>}</dd>
            ))}
          </dl>
        </div>
        <figure className="mf__photo" data-mf-photo>
          <div className="mf__photo-inner" data-mf-photo-inner><Photo content={content} sizes="(min-width: 980px) 460px, 92vw" /></div>
          <figcaption>Fernanda</figcaption>
        </figure>
      </div>
    </section>
  );
}

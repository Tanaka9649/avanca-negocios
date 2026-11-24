/**
 * Assinatura Avança Negócios. tone="light" para fundos claros, "dark" para fundos escuros.
 * Arquivos já no tamanho de exibição (2x): leves e sem passar pelo otimizador de imagem.
 */
export function BrandLockup({ priority = false, tone = "light" }: { priority?: boolean; tone?: "light" | "dark" }) {
  const name = tone === "dark" ? "/brand/avanca-negocios-nome-236.webp" : "/brand/avanca-negocios-nome-escuro-236.webp";
  const load = priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const };
  return (
    <span className="brand" aria-label="Avança Negócios">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brand__symbol" src="/brand/avanca-negocios-simbolo-76.webp" alt="" width={38} height={34} decoding="async" {...load} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brand__name" src={name} alt="" width={118} height={22} decoding="async" {...load} />
    </span>
  );
}

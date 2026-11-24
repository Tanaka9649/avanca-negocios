import Image from "next/image";

export function BrandLockup({ priority = false }: { priority?: boolean }) {
  return (
    <span className="brand" aria-label="Avança Negócios">
      <Image className="brand__symbol" src="/brand/avanca-negocios-simbolo.png" alt="" width={800} height={710} priority={priority} />
      <Image className="brand__name" src="/brand/avanca-negocios-nome.png" alt="" width={1400} height={261} priority={priority} style={{ height: 22, width: "auto" }} />
    </span>
  );
}

"use client";
import { useEffect, useRef } from "react";

/** Logo da empresa. Se for bem mais larga que alta (marca horizontal), marca a célula da grade para ocupar duas colunas e ficar legível. */
export function CompanyLogo({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const mark = () => {
      if (img.naturalWidth && img.naturalWidth / img.naturalHeight > 3.8) img.closest("li")?.setAttribute("data-wide", "");
    };
    if (img.complete) mark();
    else img.addEventListener("load", mark, { once: true });
  }, []);
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} loading="lazy" decoding="async" />;
}

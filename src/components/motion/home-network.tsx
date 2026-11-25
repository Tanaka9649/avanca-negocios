"use client";

import { useEffect, useRef } from "react";
import { startHomeNetwork } from "./home-network-core";

/**
 * Fundo vivo da página inicial: uma rede de pontos que se move devagar, reage ao cursor
 * e assume o tom da área em foco. Desenho em canvas, sem estado React por quadro;
 * pausa com a aba oculta e fica estática com movimento reduzido.
 */
export function HomeNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => (ref.current ? startHomeNetwork(ref.current) : undefined), []);
  return <canvas ref={ref} className="av__bg" aria-hidden="true" />;
}

"use client";

import { useRef } from "react";
import { empresasScenes } from "./empresas-scenes";
import { eventosScenes } from "./eventos-scenes";
import { useScrollScene } from "./use-scroll-scene";

const SCENES = { eventos: eventosScenes, empresas: empresasScenes };

/**
 * Envolve o conteúdo (renderizado no servidor) e liga as cenas de rolagem da página.
 * Sem JavaScript ou com movimento reduzido, o conteúdo aparece completo e estático.
 */
export function SceneRoot({ scenes, children, className }: { scenes: keyof typeof SCENES; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useScrollScene(ref, (ctx) => SCENES[scenes](ctx));
  return <main ref={ref} className={className}>{children}</main>;
}

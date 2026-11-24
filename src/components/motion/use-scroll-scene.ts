"use client";

import { useEffect, type RefObject } from "react";

type Gsap = typeof import("gsap").gsap;
type ST = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type SceneContext = { gsap: Gsap; ScrollTrigger: ST; root: HTMLElement; isDesktop: boolean };

/**
 * Carrega GSAP + ScrollTrigger sob demanda (fora do bundle inicial) e monta uma cena presa ao elemento.
 * Com prefers-reduced-motion, a cena não é criada e o conteúdo fica no estado final pelo CSS.
 * Tudo é revertido ao sair da página (timelines, triggers e estilos inline).
 */
export function useScrollScene(ref: RefObject<HTMLElement | null>, setup: (ctx: SceneContext) => void | (() => void)) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    // As cenas começam abaixo da dobra: o GSAP é carregado quando o navegador fica ocioso, sem disputar a primeira pintura.
    const idle = (cb: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 300));
    new Promise<void>((resolve) => idle(resolve)).then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")])).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      root.classList.add("is-animated");
      const mm = gsap.matchMedia();
      mm.add({ isDesktop: "(min-width: 980px)", isMobile: "(max-width: 979px)" }, (c) => {
        const isDesktop = Boolean(c.conditions?.isDesktop);
        return setup({ gsap, ScrollTrigger, root, isDesktop }) ?? undefined;
      }, root);
      // Fontes e imagens mudam alturas depois do primeiro cálculo; recalcula uma vez quando a página termina de carregar.
      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
      document.fonts?.ready.then(refresh);
      revert = () => { window.removeEventListener("load", refresh); mm.revert(); root.classList.remove("is-animated"); };
    });
    return () => { cancelled = true; revert?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

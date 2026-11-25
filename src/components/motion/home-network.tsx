"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

/** Cor das ligações conforme a área em foco: neutro em repouso, tom da operação ao passar o mouse. */
const TONES: Record<string, [number, number, number]> = {
  none: [17, 17, 17],
  imoveis: [17, 17, 17],
  eventos: [134, 44, 212],
  empresas: [2, 27, 141],
};

/**
 * Fundo vivo da página inicial: uma rede de pontos que se move devagar, reage ao cursor
 * e assume o tom da área em foco. Desenho em canvas, sem estado React por quadro;
 * pausa com a aba oculta e fica estática com movimento reduzido.
 */
export function HomeNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const root = canvas?.closest<HTMLElement>(".av");
    if (!canvas || !ctx || !root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true;
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let tone = "none";
    const color = [...TONES.none] as [number, number, number];

    const seed = () => {
      const count = Math.min(90, Math.max(32, Math.round((w * h) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.8,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) draw();
    };

    const draw = () => {
      const target = TONES[tone] ?? TONES.none;
      for (let i = 0; i < 3; i++) color[i] += (target[i] - color[i]) * 0.06;
      const [r, g, b] = color.map(Math.round);
      const strength = tone === "none" ? 1 : 1.9;
      const maxD = w > 700 ? 150 : 115;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        if (!reduced) {
          if (mouse.active) {
            const dx = n.x - mouse.x, dy = n.y - mouse.y, d2 = dx * dx + dy * dy;
            if (d2 < 22000 && d2 > 1) { const f = 0.35 / Math.sqrt(d2); n.vx += dx * f * 0.02; n.vy += dy * f * 0.02; }
          }
          n.vx *= 0.985; n.vy *= 0.985;
          const sp = Math.hypot(n.vx, n.vy);
          if (sp < 0.12) { n.vx += (Math.random() - 0.5) * 0.04; n.vy += (Math.random() - 0.5) * 0.04; }
          n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const c = nodes[j];
          const dx = a.x - c.x, dy = a.y - c.y, d = Math.hypot(dx, dy);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / maxD) * 0.24 * strength})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
          }
        }
        if (mouse.active) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < 180) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 180) * 0.35})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${r},${g},${b},${0.5 * Math.min(strength, 1.4)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = () => { if (running) { draw(); raf = requestAnimationFrame(loop); } };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.active = e.pointerType === "mouse";
    };
    const onLeave = () => { mouse.active = false; };
    const routes = [...root.querySelectorAll<HTMLElement>("[data-route]")];
    const enter = (e: Event) => { tone = (e.currentTarget as HTMLElement).dataset.route ?? "none"; };
    const exit = () => { tone = "none"; };
    const onVisibility = () => {
      running = document.visibilityState === "visible" && !reduced;
      cancelAnimationFrame(raf); if (running) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    routes.forEach((el) => { el.addEventListener("pointerenter", enter); el.addEventListener("focus", enter); el.addEventListener("pointerleave", exit); el.addEventListener("blur", exit); });
    document.addEventListener("visibilitychange", onVisibility);
    if (reduced) draw(); else raf = requestAnimationFrame(loop);

    return () => {
      running = false; cancelAnimationFrame(raf); ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      routes.forEach((el) => { el.removeEventListener("pointerenter", enter); el.removeEventListener("focus", enter); el.removeEventListener("pointerleave", exit); el.removeEventListener("blur", exit); });
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="av__bg" aria-hidden="true" />;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Universo visual de destino: neutro (AVANÇA), Avança Negócios ou Avança Imóveis. */
export type Variant = "avanca" | "negocios" | "imoveis";
type Phase = "idle" | "cover" | "reveal";
type Go = (href: string, variant?: Variant) => void;

const TransitionContext = createContext<{ go: Go; warm: (href: string) => void } | null>(null);

// Tempo mínimo de cobertura visual. A navegação já começou no clique; isto só evita que o painel
// "pisque" quando a página seguinte chega antes da cobertura terminar.
const COVER_MS = 260;
const REVEAL_MS = 420;

const isExternal = (href: string) => /^https?:\/\//.test(href) && !href.startsWith(window.location.origin);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [variant, setVariant] = useState<Variant>("negocios");
  const startedAt = useRef(0);
  const pending = useRef(false);
  const warmed = useRef(new Set<string>());

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const wait = Math.max(0, COVER_MS - (performance.now() - startedAt.current));
    const t1 = window.setTimeout(() => setPhase("reveal"), wait);
    const t2 = window.setTimeout(() => setPhase("idle"), wait + REVEAL_MS);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [pathname]);

  // Ao voltar pelo histórico com a página em cache (ex.: retorno do site de imóveis), remove a cobertura.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) setPhase("idle"); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  /** Antecipa a navegação: prefetch da rota interna ou do documento externo, uma vez por endereço. */
  const warm = useCallback((href: string) => {
    if (warmed.current.has(href) || href.startsWith("#")) return;
    warmed.current.add(href);
    if (isExternal(href)) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    } else {
      router.prefetch(href);
    }
  }, [router]);

  const go = useCallback<Go>((href, nextVariant = "negocios") => {
    const external = isExternal(href);
    if (reducedMotion()) {
      if (external) window.location.assign(href); else router.push(href);
      return;
    }
    setVariant(nextVariant);
    setPhase("cover");
    startedAt.current = performance.now();
    if (external) {
      // Navega imediatamente; a cobertura anima enquanto o navegador carrega o outro site.
      window.location.assign(href);
      return;
    }
    const target = new URL(href, window.location.href);
    if (target.pathname === window.location.pathname) {
      window.setTimeout(() => setPhase("reveal"), COVER_MS);
      window.setTimeout(() => setPhase("idle"), COVER_MS + REVEAL_MS);
      return;
    }
    pending.current = true;
    router.push(href);
  }, [router]);

  return (
    <TransitionContext.Provider value={{ go, warm }}>
      {children}
      <div className="pt" data-phase={phase} data-variant={variant} aria-hidden="true">
        <div className="pt__layer pt__layer--neutral" />
        <div className="pt__layer pt__layer--brand" />
        <div className="pt__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pt__mark pt__mark--mono" src="/brand/avanca-simbolo-preto.png" alt="" width={436} height={388} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pt__mark pt__mark--brand" src={variant === "imoveis" ? "/brand/avanca-imoveis-simbolo-branco.png" : variant === "negocios" ? "/brand/avanca-negocios-simbolo.png" : "/brand/avanca-simbolo-preto.png"} alt="" width={436} height={388} />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransitionNavigate() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransitionNavigate precisa do PageTransitionProvider");
  return ctx.go;
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant };

export function TransitionLink({ href, variant, onClick, onMouseEnter, onFocus, onTouchStart, children, ...rest }: LinkProps) {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("TransitionLink precisa do PageTransitionProvider");
  const { go, warm } = ctx;
  return (
    <a
      href={href}
      onMouseEnter={(e) => { onMouseEnter?.(e); warm(href); }}
      onFocus={(e) => { onFocus?.(e); warm(href); }}
      onTouchStart={(e) => { onTouchStart?.(e); warm(href); }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (href.startsWith("#")) return;
        e.preventDefault();
        go(href, variant);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

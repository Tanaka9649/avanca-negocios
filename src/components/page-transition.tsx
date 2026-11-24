"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Variant = "negocios" | "imoveis";
type Phase = "idle" | "cover" | "reveal";
type Go = (href: string, variant?: Variant) => void;

const TransitionContext = createContext<Go | null>(null);

const COVER_MS = 520;
const REVEAL_MS = 520;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [variant, setVariant] = useState<Variant>("negocios");
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = null;
    setPhase("reveal");
    const t = window.setTimeout(() => setPhase("idle"), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Volta do histórico com a página em cache (ex.: retorno do site de imóveis).
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) setPhase("idle"); };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const go = useCallback<Go>((href, nextVariant = "negocios") => {
    const external = /^https?:\/\//.test(href) && !href.startsWith(window.location.origin);
    if (prefersReducedMotion()) {
      if (external) window.location.assign(href); else router.push(href);
      return;
    }
    setVariant(nextVariant);
    setPhase("cover");
    if (!external) router.prefetch(href);
    window.setTimeout(() => {
      if (external) { window.location.assign(href); return; }
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname) { setPhase("reveal"); window.setTimeout(() => setPhase("idle"), REVEAL_MS); return; }
      pending.current = href;
      router.push(href);
    }, COVER_MS);
  }, [router]);

  return (
    <TransitionContext.Provider value={go}>
      {children}
      <div className="pt" data-phase={phase} data-variant={variant} aria-hidden="true">
        <div className="pt__panel" />
        <div className="pt__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={variant === "imoveis" ? "/brand/avanca-imoveis-simbolo-branco.png" : "/brand/avanca-negocios-simbolo.png"}
            alt=""
            width={variant === "imoveis" ? 436 : 416}
            height={385}
          />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransitionNavigate() {
  const go = useContext(TransitionContext);
  if (!go) throw new Error("useTransitionNavigate precisa do PageTransitionProvider");
  return go;
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant };

export function TransitionLink({ href, variant, onClick, children, ...rest }: LinkProps) {
  const go = useTransitionNavigate();
  return (
    <a
      href={href}
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

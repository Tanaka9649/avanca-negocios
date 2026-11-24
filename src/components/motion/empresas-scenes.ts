import type { SceneContext } from "./use-scroll-scene";

/** Cenas de rolagem da página de Compra e Venda de Empresas: mais sóbrias, deslocamentos horizontais e linhas retas. */
export function empresasScenes({ gsap, ScrollTrigger, root, isDesktop }: SceneContext) {
  const q = gsap.utils.selector(root);
  const one = <T extends Element = HTMLElement>(s: string) => (q(s)[0] as unknown as T | undefined);
  // O que já está na tela quando as cenas carregam fica como está: nunca esconder conteúdo que o visitante já vê.
  const fresh = (el?: Element | null) => !!el && el.getBoundingClientRect().top > window.innerHeight * 0.92;

  /* 1. Hero → próxima seção: o horizonte se abre e o painel seguinte sobe por cima */
  const hero = one("[data-mna-hero]");
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4 } });
    tl.to(q("[data-mna-copy]"), { y: isDesktop ? -90 : -40, opacity: 0.2 }, 0);
    tl.to(q("[data-horizon-top]"), { yPercent: -260 }, 0);
    tl.to(q("[data-horizon-bottom]"), { yPercent: 260 }, 0);
  }
  const mf = one("[data-mf]");
  if (mf && fresh(mf)) {
    gsap.fromTo(mf, { clipPath: isDesktop ? "inset(7% 5% 0% 5% round 14px)" : "inset(4% 3% 0% 3% round 10px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
      scrollTrigger: { trigger: mf, start: "top bottom", end: "top 15%", scrub: 0.4 },
    });
    /* Fernanda: retrato revelado da esquerda para a direita, texto em camadas */
    gsap.fromTo(q("[data-mf-photo]"), { clipPath: "inset(0% 100% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out",
      scrollTrigger: { trigger: mf, start: "top 55%", end: "top 5%", scrub: 0.5 },
    });
    gsap.fromTo(q("[data-mf-photo-inner]"), { xPercent: -6 }, {
      xPercent: 4, ease: "none",
      scrollTrigger: { trigger: mf, start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.from(q("[data-mf-reveal]"), {
      opacity: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: mf, start: "top 40%", toggleActions: "play none none reverse" },
    });
    gsap.from(q("[data-mf-role]"), {
      clipPath: "inset(0% 100% 0% 0%)", duration: 0.7, ease: "power3.inOut", stagger: 0.1,
      scrollTrigger: { trigger: one(".mf__roles"), start: "top 85%", toggleActions: "play none none reverse" },
    });
  }

  /* 2. Dois caminhos que convergem em um mesmo ponto de encontro */
  const paths = one("[data-paths]");
  if (paths && fresh(paths)) {
    gsap.from(q("[data-path-col='sell']"), { x: isDesktop ? -40 : 0, y: isDesktop ? 0 : 24, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: paths, start: "top 70%", toggleActions: "play none none reverse" } });
    gsap.from(q("[data-path-col='buy']"), { x: isDesktop ? 40 : 0, y: isDesktop ? 0 : 24, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.08, scrollTrigger: { trigger: paths, start: "top 70%", toggleActions: "play none none reverse" } });
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: one("[data-converge]"), start: "top 85%", end: "bottom 55%", scrub: 0.4 } });
    tl.fromTo(q("[data-converge-line]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0 }, 0);
    tl.fromTo(q("[data-converge-dot]"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, ease: "back.out(2)" }, 0.75);
    tl.fromTo(q("[data-converge-label]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.8);
  }

  /* 3. Como funciona: linha do tempo fixa com progresso e etapa ativa */
  const steps = one("[data-steps]");
  if (steps) {
    gsap.fromTo(q("[data-steps-progress]"), { scaleY: 0 }, {
      scaleY: 1, ease: "none", transformOrigin: "top center",
      scrollTrigger: { trigger: one("[data-steps-list]"), start: "top 60%", end: "bottom 60%", scrub: 0.3 },
    });
    q("[data-step]").forEach((item, i, all) => {
      ScrollTrigger.create({
        trigger: item, start: "top 60%", end: "bottom 60%",
        toggleClass: { targets: item, className: "is-active" },
        onToggle: (self) => { if (self.isActive) root.style.setProperty("--step", String(i + 1)); },
      });
      if (i === all.length - 1) ScrollTrigger.create({ trigger: item, start: "bottom 60%", onEnter: () => item.classList.add("is-done"), onLeaveBack: () => item.classList.remove("is-done") });
    });
  }

  /* 4. Confidencialidade: mudança de contraste sóbria, sem efeitos decorativos */
  const conf = one("[data-confid]");
  if (conf && fresh(conf)) {
    // Fundo e texto mudam juntos: o texto nunca fica sem contraste no meio da transição.
    const st = { trigger: conf, start: "top 85%", end: "top 35%", scrub: 0.3 };
    gsap.fromTo(q("[data-confid-bg]"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: st });
    gsap.fromTo(q(".confid__grid"), { color: "#0e1233" }, { color: "#ffffff", ease: "steps(1)", scrollTrigger: { ...st, start: "top 62%", end: "top 60%" } });
    gsap.fromTo(q("[data-confid-lock]"), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: conf, start: "top 70%", end: "top 35%", scrub: 0.3 } });
  }

  /* 5. Chamada final: as duas opções se separam a partir do centro */
  const fin = one("[data-mna-final]");
  if (fin && fresh(fin)) {
    gsap.from(q("[data-final-word]"), {
      yPercent: 115, duration: 0.8, ease: "expo.out", stagger: 0.04,
      scrollTrigger: { trigger: fin, start: "top 70%", toggleActions: "play none none reverse" },
    });
    gsap.from(q("[data-final-after]"), {
      opacity: 0, y: 16, duration: 0.6, ease: "power2.out", delay: 0.3,
      scrollTrigger: { trigger: fin, start: "top 70%", toggleActions: "play none none reverse" },
    });
  }
}

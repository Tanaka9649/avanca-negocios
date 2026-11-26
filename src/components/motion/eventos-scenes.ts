import type { SceneContext } from "./use-scroll-scene";

/** Cenas de rolagem da página de Eventos. Somente transform, opacity e clip-path; nada de estado React por quadro. */
export function eventosScenes({ gsap, ScrollTrigger, root, isDesktop }: SceneContext) {
  const q = gsap.utils.selector(root);
  const one = <T extends Element = HTMLElement>(s: string) => (q(s)[0] as unknown as T | undefined);
  // O que já está na tela quando as cenas carregam fica como está: nunca esconder conteúdo que o visitante já vê.
  const fresh = (el?: Element | null) => !!el && el.getBoundingClientRect().top > window.innerHeight * 0.92;

  /* 1. Hero: a rede se reorganiza e converge na geometria do A ao sair da tela */
  const hero = one("[data-hero]");
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
    tl.to(q("[data-hero-copy]"), { yPercent: isDesktop ? -18 : -10, opacity: 0.15 }, 0);
    tl.to(q("[data-net-edge]"), { opacity: 0, stagger: 0.01 }, 0);
    q("[data-net-node]").forEach((node) => {
      const el = node as unknown as SVGElement;
      tl.to(el, { x: Number(el.dataset.dx), y: Number(el.dataset.dy), ease: "power2.inOut", duration: 0.6 }, 0);
    });
    tl.fromTo(q("[data-net-a]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power1.inOut", stagger: 0.1, duration: 0.5 }, 0.15);
    // A arte desce mais devagar que a página (parallax moderado) para a convergência acontecer dentro da tela.
    tl.fromTo(q("[data-net-art]"), { scale: 1, y: 0 }, { scale: isDesktop ? 0.86 : 0.92, y: () => hero.offsetHeight * (isDesktop ? 0.5 : 0.3), transformOrigin: "50% 60%", duration: 0.83 }, 0);
  }

  /* 2. Fernanda: retrato revelado por máscara, nome tipográfico, atuações em sequência */
  const fe = one("[data-fe]");
  if (fe && fresh(fe)) {
    gsap.fromTo(q("[data-fe-photo]"), { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "none",
      scrollTrigger: { trigger: fe, start: "top 85%", end: isDesktop ? "top 25%" : "top 40%", scrub: 0.4 },
    });
    gsap.fromTo(q("[data-fe-photo-inner]"), { yPercent: 5, scale: 1.06, transformOrigin: "50% 100%" }, {
      yPercent: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: fe, start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.from(q("[data-fe-name] span"), {
      yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.035,
      scrollTrigger: { trigger: one("[data-fe-name]"), start: "top 85%", toggleActions: "play none none reverse" },
    });
    gsap.from(q("[data-fe-role]"), {
      opacity: 0, x: -18, duration: 0.6, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: one(".fe__roles"), start: "top 85%", toggleActions: "play none none reverse" },
    });
  }

  /* 3. Benefícios: título fixo, a linha de rede cresce e cada conceito acende ao passar */
  const ben = one("[data-benefits]");
  if (ben) {
    gsap.fromTo(q("[data-ben-line]"), { scaleY: 0 }, {
      scaleY: 1, ease: "none", transformOrigin: "top center",
      scrollTrigger: { trigger: one("[data-ben-list]"), start: "top 65%", end: "bottom 65%", scrub: 0.3 },
    });
    q("[data-benefit]").forEach((item) => {
      ScrollTrigger.create({ trigger: item, start: "top 65%", end: "bottom 65%", toggleClass: { targets: item, className: "is-active" } });
      gsap.from(item.querySelector("[data-ben-link]"), {
        scaleX: 0, transformOrigin: "left center", ease: "none",
        scrollTrigger: { trigger: item, start: "top 80%", end: "top 55%", scrub: 0.3 },
      });
    });
  }

  /* 5. Chamada final: o fundo muda progressivamente e a frase se revela palavra a palavra */
  const fin = one("[data-final]");
  if (fin && fresh(fin)) {
    gsap.fromTo(q("[data-final-bg]"), { clipPath: isDesktop ? "inset(0% 50% 0% 50% round 0px)" : "inset(0% 20% 0% 20%)" }, {
      clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
      scrollTrigger: { trigger: fin, start: "top 95%", end: "top 25%", scrub: 0.4 },
    });
    gsap.from(q("[data-final-word]"), {
      yPercent: 115, duration: 0.8, ease: "expo.out", stagger: 0.04,
      scrollTrigger: { trigger: fin, start: "top 45%", toggleActions: "play none none reverse" },
    });
    gsap.from(q("[data-final-after]"), {
      opacity: 0, y: 16, duration: 0.6, ease: "power2.out", delay: 0.35,
      scrollTrigger: { trigger: fin, start: "top 45%", toggleActions: "play none none reverse" },
    });
  }
}

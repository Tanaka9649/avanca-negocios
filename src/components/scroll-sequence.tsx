"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";

type Item = { title: string; text: string };

/** Lista ligada por um trilho que se preenche conforme a rolagem; cada item acende quando o trilho chega nele. */
export function ScrollSequence({ items, variant }: { items: Item[]; variant: "chain" | "steps" }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const [active, setActive] = useState(reduce ? items.length : 0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    setActive(Math.min(items.length, Math.floor(v * items.length + 0.35)));
  });

  const isChain = variant === "chain";
  return (
    <ol ref={ref} className={isChain ? "chain" : "steps"} style={{ listStyle: "none", padding: 0 }}>
      <span className={isChain ? "chain__rail" : "steps__rail"} aria-hidden="true">
        <motion.span style={{ scaleY: reduce ? 1 : scaleY }} />
      </span>
      {items.map((item, i) => (
        <li key={item.title} className={isChain ? "chain__item" : "step"} data-on={i < active || reduce ? "true" : "false"}>
          {isChain ? <span className="chain__dot" aria-hidden="true" /> : <span className="step__n" aria-hidden="true">{i + 1}</span>}
          <div>
            {isChain ? <h3 className="chain__title">{item.title}</h3> : <h3 className="h3 step__title">{item.title}</h3>}
            <p className={isChain ? "chain__text" : "body"}>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

"use client";

import { useEffect, useRef } from "react";
import AsciiCore from "../AsciiCore";
import { goTo, termPrint } from "@/lib/term";

const WORD = ["NERVE", "JACK"];

/** Titular inestable: cada letra salta entre forma humana (cursiva, proporcional) y de máquina (mono). */
function UnstableTitle() {
  const root = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(root.current!.querySelectorAll<HTMLSpanElement>("[data-l]"));
    const id = window.setInterval(() => {
      const n = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) {
        const el = letters[Math.floor(Math.random() * letters.length)];
        el.classList.add("human");
        el.style.color = Math.random() > 0.5 ? "var(--acid)" : "var(--ice)";
        window.setTimeout(() => {
          el.classList.remove("human");
          el.style.color = "";
        }, 350 + Math.random() * 500);
      }
    }, 420);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 ref={root} aria-label="Nervejack" className="select-none text-[clamp(64px,13vw,200px)] font-black leading-[0.82] tracking-[-0.04em]">
      {WORD.map((w, wi) => (
        <span key={w} aria-hidden className={`block ${wi === 1 ? "pl-[0.6em]" : ""}`}>
          {w.split("").map((ch, i) => (
            <span key={i} data-l className="morph machine inline-block">
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

export default function Hero() {
  const cmd = (c: string, target: string) => {
    termPrint(`› ${c}`);
    goTo(target);
  };
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <AsciiCore className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-end gap-10 px-5 pb-48 pt-28 md:px-10 lg:justify-center lg:pb-40">
        <p className="text-xs text-[var(--dim)]">
          <span className="text-[var(--acid)]">[!]</span> Clínica clandestina · Sector 13 · Sin preguntas, sin registros
        </p>
        <UnstableTitle />
        <div className="max-w-md space-y-6">
          <p className="morph human text-[clamp(18px,1.7vw,24px)] leading-snug">
            Tu cuerpo es hardware heredado. <span className="text-[var(--ice)]">Nosotros lo actualizamos.</span>
          </p>
          <p className="text-sm leading-relaxed text-[var(--dim)]">
            Implantes certificados por nadie, instalados por los mejores. Navega escribiendo en la terminal de abajo
            — o haz scroll, como un humano.
          </p>
          <div className="pointer-events-auto flex flex-wrap gap-3">
            <button
              onClick={() => cmd("escaner", "escaner")}
              className="group border border-[var(--ice)] px-5 py-3 text-sm text-[var(--ice)] transition-colors hover:bg-[var(--ice)] hover:text-black"
            >
              › escaner <span className="opacity-50 group-hover:opacity-100">↵</span>
            </button>
            <button
              onClick={() => cmd("cita", "quirofano")}
              className="bg-[var(--acid)] px-5 py-3 text-sm font-bold text-black transition-[filter] hover:brightness-125"
            >
              › reservar quirófano
            </button>
          </div>
        </div>
        <p className="hidden text-[11px] text-[var(--dim)] lg:block">
          <span className="text-[var(--uv)]">tip:</span> arrastra el núcleo para rotarlo · pulsa <kbd className="border border-[var(--faint)] px-1">/</kbd> para escribir
        </p>
      </div>
    </section>
  );
}

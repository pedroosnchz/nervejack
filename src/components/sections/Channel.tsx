"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/hooks";

const MSGS: { who: "mira" | "tu"; text: string }[] = [
  { who: "mira", text: "¿Quién te ha dado esta frecuencia?" },
  { who: "tu", text: "Un amigo. Dice que le pusiste un ojo nuevo." },
  { who: "mira", text: "Le puse dos. El primero no le gustaba de color." },
  { who: "tu", text: "¿Es seguro?" },
  { who: "mira", text: "Nada que merezca la pena es seguro. Mi tasa de rechazo es del 4%. La de los hospitales, del 100%: directamente no te atienden." },
  { who: "mira", text: "Reserva quirófano. Ven sin metal y sin miedo. La anestesia es lo único que no cobro." },
  { who: "tu", text: "Vale. Voy." },
];

/** Texto cifrado con la misma longitud que el original. */
function cipher(s: string) {
  let h = 0;
  return s
    .split("")
    .map((c, i) => {
      if (c === " ") return " ";
      h = (h * 31 + c.charCodeAt(0) + i) % 256;
      return h.toString(16).padStart(2, "0")[i % 2].toUpperCase();
    })
    .join("");
}

export default function Channel() {
  const [ref, inView] = useInView<HTMLElement>(0.35);
  const [shown, setShown] = useState(0); // mensajes visibles
  const [plain, setPlain] = useState(0); // mensajes ya descifrados
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!inView || shown >= MSGS.length) return;
    const t1 = window.setTimeout(() => setTyping(true), 250);
    const t2 = window.setTimeout(() => {
      setTyping(false);
      setShown((s) => s + 1);
    }, 1000 + MSGS[shown].text.length * 8);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView, shown]);

  useEffect(() => {
    if (plain >= shown) return;
    const t = window.setTimeout(() => setPlain((p) => p + 1), 650);
    return () => clearTimeout(t);
  }, [plain, shown]);

  const next = MSGS[shown];

  return (
    <section ref={ref} id="canal" className="relative px-5 py-32 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs text-[var(--acid)]">03 // canal_cifrado · AES-1024 (no existe, ya)</p>
          <h2 className="glitch text-[clamp(40px,6vw,96px)] font-black leading-[0.85] tracking-[-0.04em]" data-text="LA CIRUJANA">
            LA CIRUJANA
          </h2>
          <p className="morph human mt-6 max-w-sm text-lg leading-snug">
            MIRA-7 opera en un sótano del Sector 13 desde hace once años. Nunca ha perdido a un paciente. A dos clientes, sí.
          </p>
          <dl className="mt-8 grid max-w-sm grid-cols-3 gap-px bg-[var(--faint)] text-xs">
            {[
              ["operaciones", "4 812"],
              ["rechazo", "4%"],
              ["licencias", "0"],
            ].map(([k, v]) => (
              <div key={k} className="bg-[var(--void)] p-3">
                <dt className="text-[var(--dim)]">{k}</dt>
                <dd className="text-xl font-black text-[var(--ice)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border border-[var(--faint)] bg-[#0a0614]/80">
          <div className="flex items-center justify-between border-b border-[var(--faint)] px-4 py-2 text-[11px] text-[var(--dim)]">
            <span>
              <span className="text-[var(--acid)]">●</span> MIRA-7 ⇄ invitado
            </span>
            <span>p2p · sin registros</span>
          </div>
          <div className="flex min-h-[520px] flex-col gap-3 p-4 md:p-6">
            {MSGS.slice(0, shown).map((m, i) => {
              const dec = i < plain;
              return (
                <div key={i} className={`flex ${m.who === "tu" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] border px-4 py-3 ${
                      m.who === "tu" ? "border-[var(--ice)]/40 bg-[var(--ice)]/5" : "border-[var(--uv)]/50 bg-[var(--uv)]/10"
                    }`}
                  >
                    <p className="mb-1 text-[10px] text-[var(--dim)]">
                      {m.who === "tu" ? "tú" : "MIRA-7"} · {dec ? "descifrado" : "descifrando…"}
                    </p>
                    <p className={`morph text-[15px] leading-snug ${dec ? "human text-[var(--fg)]" : "machine text-[var(--acid)]"}`}>
                      {dec ? m.text : cipher(m.text)}
                    </p>
                  </div>
                </div>
              );
            })}
            {typing && next && (
              <p className={`text-xs text-[var(--dim)] ${next.who === "tu" ? "text-right" : ""}`}>
                <span className="caret">{next.who === "tu" ? "tú escribes" : "MIRA-7 escribe"}</span>
              </p>
            )}
            {shown >= MSGS.length && plain >= MSGS.length && (
              <p className="mt-auto pt-6 text-center text-[11px] text-[var(--dim)]">— canal cerrado · clave destruida —</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { termRun } from "@/lib/term";

export default function Outro() {
  return (
    <section className="relative px-5 pb-48 pt-10 md:px-10">
      <div className="mx-auto max-w-6xl border-t border-[var(--faint)] pt-16 text-center">
        <p className="text-xs text-[var(--dim)]">fin de la transmisión</p>
        <button
          onClick={() => termRun("desconectar")}
          className="glitch mt-4 text-[clamp(44px,11vw,180px)] font-black leading-none tracking-[-0.05em] transition-colors hover:text-[var(--acid)]"
          data-text="DESCONECTAR"
        >
          DESCONECTAR
        </button>
        <p className="morph human mx-auto mt-6 max-w-md text-sm text-[var(--dim)]">
          NERVEJACK es ficción. Ningún órgano fue vendido para hacer esta página. Que sepamos.
        </p>
      </div>
    </section>
  );
}

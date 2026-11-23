"use client";

import { useEffect, useState } from "react";
import { termRun } from "@/lib/term";

export default function Header() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const f = () => setTime(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false }));
    f();
    const id = window.setInterval(f, 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="chrome fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 text-xs md:px-10">
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-logo text-base tracking-wide text-[var(--fg)]">
        nervejack<span className="text-[var(--acid)]">_</span>
      </button>
      <nav className="hidden items-center gap-5 text-[var(--dim)] md:flex">
        {[
          ["escaner", "01 catálogo"],
          ["mercado", "02 mercado"],
          ["canal", "03 canal"],
          ["cita", "04 quirófano"],
        ].map(([c, l]) => (
          <button key={c} onClick={() => termRun(c)} className="transition-colors hover:text-[var(--ice)]">
            {l}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-[var(--dim)]">
        <span className="hidden sm:inline">SECTOR 13</span>
        <span className="tabular-nums text-[var(--fg)]">{time}</span>
        <span aria-label="señal" className="flex items-end gap-[2px]">
          {[4, 7, 10, 13].map((h, i) => (
            <span key={h} className={`w-[3px] ${i < 3 ? "bg-[var(--ice)]" : "bg-[var(--faint)]"}`} style={{ height: h }} />
          ))}
        </span>
      </div>
    </header>
  );
}

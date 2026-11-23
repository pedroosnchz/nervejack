"use client";

import { useEffect, useRef, useState } from "react";
import { IMPLANTS, credits } from "@/lib/implants";
import { useInView } from "@/lib/hooks";

const POINTS = 48;

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

type Row = { id: string; hist: number[]; vol: number; dir: 0 | 1 | -1 };

function initial(): { rows: Row[]; index: number[] } {
  const r = seeded(1313);
  const rows = IMPLANTS.map((im) => {
    let p = im.price;
    const hist = Array.from({ length: POINTS }, () => (p = Math.max(1000, p * (1 + (r() - 0.48) * 0.04))));
    return { id: im.id, hist, vol: Math.round(40 + r() * 400), dir: 0 as const };
  });
  return { rows, index: Array.from({ length: 120 }, (_, i) => 1000 + Math.sin(i / 9) * 40 + i * 1.6 + (r() - 0.5) * 30) };
}

function Spark({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 120},${30 - ((v - min) / (max - min || 1)) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 120 32" className="h-8 w-28" aria-hidden>
      <polyline points={pts} fill="none" stroke={up ? "#4df3ff" : "#ff2e88"} strokeWidth="1.5" />
    </svg>
  );
}

const ORDERS = ["compra", "venta"];
const HANDLES = ["v0id", "m4ra", "kilo.z", "nyx", "deadpix", "r0nin", "sable", "glass", "ozu", "teknik"];

export default function Market() {
  const [state, setState] = useState(initial);
  const [tape, setTape] = useState<string[]>([]);
  const [ref, inView] = useInView<HTMLElement>();
  const tick = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      tick.current++;
      setState((s) => {
        const rows = s.rows.map((row) => {
          if (Math.random() > 0.55) return { ...row, dir: 0 as const };
          const last = row.hist[row.hist.length - 1];
          const next = Math.max(1000, last * (1 + (Math.random() - 0.48) * 0.05));
          return { ...row, hist: [...row.hist.slice(1), next], vol: row.vol + Math.round(Math.random() * 6), dir: (next >= last ? 1 : -1) as 1 | -1 };
        });
        const li = s.index[s.index.length - 1];
        return { rows, index: [...s.index.slice(1), li + (Math.random() - 0.46) * 22] };
      });
      const im = IMPLANTS[Math.floor(Math.random() * IMPLANTS.length)];
      const side = ORDERS[Math.floor(Math.random() * 2)];
      const who = HANDLES[Math.floor(Math.random() * HANDLES.length)];
      const ts = new Date().toLocaleTimeString("es-ES", { hour12: false });
      setTape((t) => [`${ts}  ${side.padEnd(6)} ${im.code.padEnd(8)} @${who}`, ...t].slice(0, 7));
    }, 900);
    return () => clearInterval(id);
  }, [inView]);

  const idx = state.index;
  const imin = Math.min(...idx), imax = Math.max(...idx);
  const ipts = idx.map((v, i) => `${(i / (idx.length - 1)) * 600},${180 - ((v - imin) / (imax - imin || 1)) * 160}`);
  const ichg = ((idx[idx.length - 1] - idx[0]) / idx[0]) * 100;

  return (
    <section ref={ref} id="mercado" className="relative px-5 py-32 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs text-[var(--acid)]">02 // libro_de_ordenes</p>
            <h2 className="glitch text-[clamp(40px,6vw,96px)] font-black leading-[0.85] tracking-[-0.04em]" data-text="MERCADO NEGRO">
              MERCADO NEGRO
            </h2>
          </div>
          <p className="morph human max-w-sm text-[var(--dim)]">
            Los precios cambian cada segundo. Los cuerpos, un poco más despacio.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* índice */}
          <div className="border border-[var(--faint)] bg-[#0a0614]/70 p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm">
                Índice <b className="text-[var(--ice)]">NJX</b>
              </p>
              <p className={`text-sm tabular-nums ${ichg >= 0 ? "text-[var(--ice)]" : "text-[var(--acid)]"}`}>
                {ichg >= 0 ? "▲" : "▼"} {Math.abs(ichg).toFixed(2)}%
              </p>
            </div>
            <p className="mt-1 text-5xl font-black tabular-nums tracking-tight">{idx[idx.length - 1].toFixed(2)}</p>
            <svg viewBox="0 0 600 190" preserveAspectRatio="none" className="mt-4 h-48 w-full" aria-label="Evolución del índice NJX">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#7b2cff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#7b2cff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(232,230,255,.07)" />
              ))}
              <polygon points={`0,190 ${ipts.join(" ")} 600,190`} fill="url(#area)" />
              <polyline points={ipts.join(" ")} fill="none" stroke="#4df3ff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <pre className="mt-4 h-36 overflow-hidden text-[11px] leading-5 text-[var(--dim)]">
              {tape.map((l, i) => (
                <span key={l + i} className={`block ${i === 0 ? "text-[var(--fg)]" : ""} ${l.includes("compra") ? "" : "text-[var(--acid)]/70"}`}>
                  {l}
                </span>
              ))}
            </pre>
          </div>

          {/* tabla */}
          <div className="overflow-x-auto border border-[var(--faint)] bg-[#0a0614]/70">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase text-[var(--dim)]">
                <tr className="border-b border-[var(--faint)]">
                  <th className="px-4 py-3 font-normal">Activo</th>
                  <th className="px-4 py-3 text-right font-normal">Precio</th>
                  <th className="px-4 py-3 text-right font-normal">Δ</th>
                  <th className="hidden px-4 py-3 font-normal sm:table-cell">48 ticks</th>
                </tr>
              </thead>
              <tbody>
                {state.rows.map((row) => {
                  const im = IMPLANTS.find((i) => i.id === row.id)!;
                  const last = row.hist[row.hist.length - 1];
                  const chg = ((last - row.hist[0]) / row.hist[0]) * 100;
                  return (
                    <tr key={row.id} className="border-b border-[var(--faint)] last:border-0">
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-[var(--acid)]">{im.code}</p>
                        <p className="font-bold">{im.name}</p>
                      </td>
                      <td
                        key={row.dir === 0 ? "s" : `${row.hist.length}-${last}`}
                        className={`px-4 py-3 text-right tabular-nums ${row.dir === 1 ? "flash-up" : row.dir === -1 ? "flash-down" : ""}`}
                      >
                        {credits(Math.round(last))}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums ${chg >= 0 ? "text-[var(--ice)]" : "text-[var(--acid)]"}`}>
                        {chg >= 0 ? "+" : ""}
                        {chg.toFixed(1)}%
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Spark data={row.hist} up={chg >= 0} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

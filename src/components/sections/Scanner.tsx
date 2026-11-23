"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";
import { IMPLANTS, credits } from "@/lib/implants";

const VB_W = 300, VB_H = 720;

/** Silueta original: cabeza, torso, brazos y piernas. */
function BodyShapes() {
  return (
    <>
      <ellipse cx="150" cy="60" rx="38" ry="48" />
      <rect x="135" y="102" width="30" height="32" rx="8" />
      <path d="M88 138 Q150 120 212 138 L224 262 Q216 330 198 362 L102 362 Q84 330 76 262 Z" />
      <path d="M88 142 Q60 150 55 205 L44 330 Q42 352 48 384 L66 384 Q70 352 70 330 L82 220 Z" />
      <path d="M212 142 Q240 150 245 205 L256 330 Q258 352 252 384 L234 384 Q230 352 230 330 L218 220 Z" />
      <path d="M102 360 L148 360 L140 520 L136 690 L110 690 L106 520 Z" />
      <path d="M152 360 L198 360 L194 520 L190 690 L164 690 L160 520 Z" />
    </>
  );
}

function XRay() {
  const vertebrae = Array.from({ length: 16 }, (_, i) => 136 + i * 14);
  const ribs = Array.from({ length: 6 }, (_, i) => 160 + i * 17);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* cráneo y mandíbula */}
      <path d="M118 70 Q112 22 150 18 Q188 22 182 70 Q180 92 164 100 L136 100 Q120 92 118 70 Z" stroke="#e8e6ff" strokeWidth="2" />
      <ellipse cx="136" cy="62" rx="9" ry="7" stroke="#e8e6ff" strokeWidth="1.5" />
      <ellipse cx="164" cy="62" rx="9" ry="7" stroke="#4df3ff" strokeWidth="2" />
      {/* columna */}
      {vertebrae.map((y) => (
        <rect key={y} x="143" y={y} width="14" height="9" rx="2" stroke="#e8e6ff" strokeWidth="1.4" />
      ))}
      <line x1="150" y1="104" x2="150" y2="360" stroke="#4df3ff" strokeWidth="1" strokeDasharray="2 3" />
      {/* costillas */}
      {ribs.map((y, i) => (
        <g key={y} stroke="#e8e6ff" strokeWidth="1.4" opacity={1 - i * 0.08}>
          <path d={`M143 ${y} Q110 ${y - 4} 100 ${y + 22}`} />
          <path d={`M157 ${y} Q190 ${y - 4} 200 ${y + 22}`} />
        </g>
      ))}
      {/* clavículas, pelvis, huesos largos */}
      <path d="M150 140 L96 146 M150 140 L204 146" stroke="#e8e6ff" strokeWidth="1.6" />
      <path d="M108 350 Q150 392 192 350 Q182 378 150 384 Q118 378 108 350 Z" stroke="#e8e6ff" strokeWidth="1.6" />
      <path d="M78 160 L62 330 L56 380 M222 160 L238 330 L244 380" stroke="#e8e6ff" strokeWidth="1.6" />
      <path d="M126 380 L122 520 L122 680 M174 380 L178 520 L178 680" stroke="#e8e6ff" strokeWidth="1.8" />
      <circle cx="122" cy="522" r="5" stroke="#e8e6ff" strokeWidth="1.4" />
      <circle cx="178" cy="522" r="5" stroke="#e8e6ff" strokeWidth="1.4" />
      {/* trazas de circuito */}
      <path d="M150 30 L150 10 M162 62 L190 62 L190 120 L172 150 L172 200 M150 340 L170 340 L170 420 M60 290 L84 290 L84 240 L130 240" stroke="#ff2e88" strokeWidth="1.2" />
      <path d="M165 205 L190 205 L190 250 L210 270 M150 120 L120 140 L120 190" stroke="#7b2cff" strokeWidth="1.2" />
      {/* corazón */}
      <path d="M165 196 q-8 -10 -14 0 q-6 12 14 22 q20 -10 14 -22 q-6 -10 -14 0" stroke="#ff2e88" strokeWidth="1.6" />
    </g>
  );
}

export default function Scanner() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const lastActive = useRef(0);

  // progreso del escaneo
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = section.current, st = stage.current;
      if (!el || !st) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      const scan = Math.min(1, Math.max(0, (p - 0.05) / 0.85));
      st.style.setProperty("--sy", `${scan * 100}%`);
      const n = IMPLANTS.filter((im) => im.y / VB_H <= scan + 0.005).length;
      if (n !== lastActive.current) {
        lastActive.current = n;
        setActive(n);
      }
      setPct((old) => (Math.round(scan * 100) !== old ? Math.round(scan * 100) : old));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const moveLens = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--lx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };

  const ordered = [...IMPLANTS].sort((a, b) => a.y - b.y);
  const detected = ordered.slice(0, active);
  const humanity = 100 - detected.reduce((s, im) => s + Math.round(im.reject * 1.2 + 6), 0);
  const latest = detected[detected.length - 1];

  return (
    <section ref={section} id="escaner" className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-5 pb-36 pt-20 md:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--acid)]">01 // escaneo_corporal.exe</p>
            <h2 className="glitch text-[clamp(40px,6vw,96px)] font-black leading-[0.85] tracking-[-0.04em]" data-text="CATÁLOGO">
              CATÁLOGO
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 text-right text-xs">
            <div>
              <p className="text-[var(--dim)]">escaneo</p>
              <p className="text-3xl font-black tabular-nums text-[var(--ice)]">{String(pct).padStart(3, "0")}%</p>
            </div>
            <div>
              <p className="text-[var(--dim)]">humanidad</p>
              <p className={`text-3xl font-black tabular-nums ${humanity < 70 ? "text-[var(--acid)]" : ""}`}>{humanity}%</p>
            </div>
          </div>
        </header>

        <div ref={stage} className="relative mx-auto mt-4 h-full w-full max-w-6xl flex-1" style={{ "--sy": "0%" } as CSSProperties}>
          {/* cuerpo */}
          <div
            onPointerMove={moveLens}
            onPointerLeave={(e) => e.currentTarget.style.setProperty("--lx", "-999px")}
            className="lens absolute inset-y-0 left-1/2 aspect-[300/720] -translate-x-1/2 cursor-crosshair"
            style={{ "--lx": "-999px", "--ly": "-999px" } as CSSProperties}
          >
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" aria-label="Silueta escaneada">
              <defs>
                <pattern id="skinlines" width="6" height="5" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0.5" x2="6" y2="0.5" stroke="#7b2cff" strokeWidth="0.8" />
                </pattern>
              </defs>
              <g fill="url(#skinlines)" stroke="#7b2cff" strokeWidth="1.2" opacity="0.8">
                <BodyShapes />
              </g>
            </svg>
            {/* capa de rayos X, visible bajo la lente y en la banda de escaneo */}
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="xray absolute inset-0 h-full w-full" aria-hidden>
              <g fill="#05030a">
                <BodyShapes />
              </g>
              <XRay />
            </svg>
            {/* línea de escaneo */}
            <div className="pointer-events-none absolute inset-x-[-30%] h-px bg-[var(--ice)] shadow-[0_0_18px_4px_rgba(77,243,255,.55)]" style={{ top: "var(--sy)" }} />
            {/* puntos calientes */}
            {IMPLANTS.map((im) => {
              const on = detected.includes(im);
              return (
                <span
                  key={im.id}
                  className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-all duration-500 ${
                    on ? "scale-100 border-[var(--acid)] bg-[var(--acid)] shadow-[0_0_14px_var(--acid)]" : "scale-50 border-[var(--faint)]"
                  }`}
                  style={{ left: `${(im.x / VB_W) * 100}%`, top: `${(im.y / VB_H) * 100}%` }}
                />
              );
            })}
          </div>

          {/* fichas laterales (escritorio) */}
          {ordered.map((im, i) => {
            const on = i < active;
            // reparto uniforme por columna para que las fichas no se pisen
            const column = ordered.filter((o) => o.side === im.side);
            const slot = column.indexOf(im);
            return (
              <article
                key={im.id}
                className={`absolute hidden w-[min(290px,26vw)] md:block ${im.side === "left" ? "left-0" : "right-0"}`}
                style={{ top: `${(slot / column.length) * 100}%` }}
              >
                <div
                  className={`scan-card border bg-[#0a0614]/85 p-4 backdrop-blur-sm ${on ? "on border-[var(--uv)]" : "border-[var(--faint)]"} ${
                    im.side === "left" ? "" : "text-right"
                  }`}
                >
                  <p className="text-[10px] text-[var(--acid)]">
                    {im.code} · {im.zone}
                  </p>
                  <h3 className="morph human text-2xl font-black leading-tight">{im.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--dim)]">{im.blurb}</p>
                  <div className="mt-3 flex items-end justify-between gap-4 text-xs">
                    <span className="text-lg font-black text-[var(--ice)]">{credits(im.price)}</span>
                    <span className="text-[var(--dim)]">
                      compat <b className="text-[var(--fg)]">{im.compat}%</b> · rechazo <b className="text-[var(--acid)]">{im.reject}%</b>
                    </span>
                  </div>
                  <div className="mt-2 h-1 bg-[var(--faint)]">
                    <div className="h-full bg-[var(--ice)] transition-[width] duration-1000" style={{ width: on ? `${im.compat}%` : 0 }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* último detectado (móvil) */}
        <div className="absolute inset-x-5 bottom-36 border border-[var(--faint)] bg-[#0a0614]/90 p-3 text-xs md:hidden">
          {latest ? (
            <p>
              <span className="text-[var(--acid)]">{latest.code}</span> {latest.name} ·{" "}
              <span className="text-[var(--ice)]">{credits(latest.price)}</span>
              <br />
              <span className="text-[var(--dim)]">{latest.blurb}</span>
            </p>
          ) : (
            <p className="text-[var(--dim)]">Haz scroll para escanear…</p>
          )}
        </div>
      </div>
    </section>
  );
}

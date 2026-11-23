"use client";

import { useActionState, useEffect, useState } from "react";
import { bookSlot, type BookingState } from "@/app/actions";
import { IMPLANTS, credits } from "@/lib/implants";
import { glitchBurst, termPrint } from "@/lib/term";

const initial: BookingState = { status: "idle" };

/** Matriz de datos determinista (decorativa) a partir del slot y el handle. */
function matrix(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const cells: boolean[] = [];
  for (let i = 0; i < 14 * 14; i++) {
    const x = i % 14, y = Math.floor(i / 14);
    if (x === 0 || y === 13) cells.push(true); // patrón guía en L
    else if (y === 0 || x === 13) cells.push((x + y) % 2 === 0); // reloj
    else {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      cells.push(((h >>> 0) & 3) === 0 || ((h >>> 3) & 1) === 1);
    }
  }
  return cells;
}

function DataMatrix({ seed }: { seed: string }) {
  const cells = matrix(seed);
  return (
    <div className="grid h-32 w-32 shrink-0 grid-cols-[repeat(14,1fr)] bg-[var(--fg)] p-1.5">
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-[var(--void)]" : ""} />
      ))}
    </div>
  );
}

function Countdown() {
  const [left, setLeft] = useState(72 * 3600);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="tabular-nums">
      T-{p(Math.floor(left / 3600))}:{p(Math.floor((left % 3600) / 60))}:{p(left % 60)}
    </span>
  );
}

export default function BookingForm() {
  const [state, action, pending] = useActionState(bookSlot, initial);
  const [implant, setImplant] = useState<string>(IMPLANTS[0].id);

  useEffect(() => {
    if (state.status === "booked") {
      glitchBurst(500);
      termPrint(`quirófano asignado: Q-${String(state.slot).padStart(4, "0")} → @${state.handle}`);
    }
  }, [state]);

  if (state.status === "booked") {
    const im = IMPLANTS.find((i) => i.id === state.implant) ?? IMPLANTS[0];
    return (
      <div className="is-in border border-[var(--acid)] bg-[#0a0614] p-6 shadow-[0_0_60px_-20px_var(--acid)]">
        <div className="boot flex flex-col gap-6 sm:flex-row sm:items-center">
          <DataMatrix seed={`${state.slot}:${state.handle}`} />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="text-[11px] text-[var(--acid)]">{state.again ? "reserva existente recuperada" : "reserva confirmada"}</p>
            <p className="text-4xl font-black tracking-tight">Q-{String(state.slot).padStart(4, "0")}</p>
            <p>
              <span className="text-[var(--dim)]">paciente</span> @{state.handle}
            </p>
            <p>
              <span className="text-[var(--dim)]">implante</span> {im.name} <span className="text-[var(--ice)]">{credits(im.price)}</span>
            </p>
            <p className="text-[var(--ice)]">
              <Countdown /> <span className="text-[var(--dim)]">para la operación</span>
            </p>
          </div>
        </div>
        <p className="morph human mt-6 text-sm text-[var(--dim)]">
          Te enviaremos las coordenadas 30 minutos antes. Ven sin metal. No traigas a nadie.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-[11px] text-[var(--dim)]">--implante</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {IMPLANTS.map((im) => (
            <label
              key={im.id}
              className={`cursor-pointer border px-3 py-2 text-xs transition-colors ${
                implant === im.id ? "border-[var(--acid)] bg-[var(--acid)] text-black" : "border-[var(--faint)] hover:border-[var(--fg)]"
              }`}
            >
              <input type="radio" name="implant" value={im.id} checked={implant === im.id} onChange={() => setImplant(im.id)} className="sr-only" />
              <span className="block text-[10px] opacity-70">{im.code}</span>
              <span className="font-bold">{im.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-[11px] text-[var(--dim)]">--handle</span>
        <div className="mt-1 flex items-center border-b border-[var(--faint)] focus-within:border-[var(--ice)]">
          <span className="text-2xl text-[var(--acid)]">@</span>
          <input
            name="handle"
            required
            minLength={3}
            maxLength={16}
            pattern="[a-zA-Z0-9_.\-]+"
            placeholder="v0id"
            autoComplete="off"
            className="w-full bg-transparent py-2 text-2xl font-bold outline-none placeholder:text-[var(--faint)]"
          />
        </div>
      </label>
      <label className="block">
        <span className="text-[11px] text-[var(--dim)]">--canal (email)</span>
        <input
          name="email"
          type="email"
          required
          placeholder="tu@red.oscura"
          className="mt-1 w-full border-b border-[var(--faint)] bg-transparent py-2 text-lg outline-none placeholder:text-[var(--faint)] focus:border-[var(--ice)]"
        />
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--acid)]" />
        <span className="morph human text-[var(--dim)]">Acepto que mi cuerpo es software y que las actualizaciones no tienen vuelta atrás.</span>
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--acid)] px-6 py-4 text-sm font-black text-black transition-[filter] hover:brightness-125 disabled:opacity-60"
        >
          {pending ? "› negociando…" : "› ejecutar reserva"}
        </button>
        <p aria-live="polite" className="text-xs text-[var(--acid)]">
          {state.status === "error" ? `error: ${state.message}` : ""}
        </p>
      </div>
    </form>
  );
}

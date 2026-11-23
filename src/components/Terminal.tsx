"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { glitchBurst, goTo, onTermPrint, onTermRun } from "@/lib/term";

type Line = { id: number; text: string; kind: "in" | "out" | "sys" };

const COMMANDS: Record<string, { help: string; run: (args: string[]) => string | void }> = {
  help: { help: "lista de comandos", run: () => Object.entries(COMMANDS).map(([k, v]) => `${k.padEnd(12)}${v.help}`).join("\n") },
  escaner: { help: "escáner corporal e implantes", run: () => (goTo("escaner"), "→ iniciando escáner…") },
  mercado: { help: "cotizaciones del mercado negro", run: () => (goTo("mercado"), "→ abriendo libro de órdenes…") },
  canal: { help: "canal cifrado con la cirujana", run: () => (goTo("canal"), "→ negociando claves…") },
  cita: {
    help: "reservar quirófano",
    run: () => {
      goTo("quirofano");
      setTimeout(() => document.querySelector<HTMLInputElement>('input[name="handle"]')?.focus({ preventScroll: true }), 900);
      return "→ quirófano Q abierto. Escribe tu handle.";
    },
  },
  whoami: { help: "identidad actual", run: () => "invitado@10.13.0.77 · implantes: 0 · humanidad: 100%" },
  glitch: { help: "provoca una interferencia", run: () => (glitchBurst(), "!! interferencia inducida") },
  clear: { help: "limpia la terminal", run: () => "__clear" },
  desconectar: { help: "corta la señal", run: () => "__off" },
  sudo: { help: "privilegios de root", run: () => "Buen intento. Este incidente será reportado a nadie." },
};

let uid = 0;

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { id: uid++, kind: "sys", text: "NERVEJACK OS 4.13 · enlace seguro · escribe `help` o pulsa /" },
  ]);
  const [value, setValue] = useState("");
  const [off, setOff] = useState(false);
  const history = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const input = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, [lines]);

  const push = (text: string, kind: Line["kind"]) =>
    setLines((ls) => [...ls, { id: uid++, text, kind }].slice(-5));

  useEffect(() => onTermPrint((t) => push(t, "sys")), []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // reconexión tras el apagado
  useEffect(() => {
    if (!off) return;
    const root = document.documentElement;
    let armed = false;
    const arm = window.setTimeout(() => (armed = true), 1200);
    const reboot = () => {
      if (!armed) return;
      root.classList.remove("is-off");
      root.classList.add("is-booting");
      window.scrollTo({ top: 0 });
      setOff(false);
      push("señal restablecida. bienvenido de vuelta.", "sys");
      window.setTimeout(() => root.classList.remove("is-booting"), 800);
    };
    window.addEventListener("keydown", reboot);
    window.addEventListener("pointerdown", reboot);
    return () => {
      clearTimeout(arm);
      window.removeEventListener("keydown", reboot);
      window.removeEventListener("pointerdown", reboot);
    };
  }, [off]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    history.current.unshift(cmd);
    hIdx.current = -1;
    push(cmd, "in");
    const [name, ...args] = cmd.toLowerCase().split(/\s+/);
    const c = COMMANDS[name];
    const out = c ? c.run(args) : `comando no encontrado: ${name}. prueba \`help\``;
    if (out === "__clear") setLines([]);
    else if (out === "__off") {
      input.current?.blur();
      document.documentElement.classList.add("is-off");
      setOff(true);
    } else if (out) push(out, "out");
  };

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(() => onTermRun((c) => runRef.current(c)), []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(value);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      hIdx.current = Math.min(history.current.length - 1, hIdx.current + 1);
      setValue(history.current[hIdx.current] ?? value);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIdx.current = Math.max(-1, hIdx.current - 1);
      setValue(hIdx.current < 0 ? "" : history.current[hIdx.current]);
    } else if (e.key === "Tab") {
      const match = Object.keys(COMMANDS).find((k) => value && k.startsWith(value.toLowerCase()));
      if (match) {
        e.preventDefault();
        setValue(match);
      }
    } else if (e.key === "Escape") input.current?.blur();
  };

  return (
    <>
      <div className="chrome fixed inset-x-0 bottom-0 z-50 border-t border-[var(--faint)] bg-[#07040d]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-2 text-[12px] leading-relaxed md:px-8">
          <div ref={outRef} aria-live="polite" className="max-h-24 overflow-y-auto [scrollbar-width:none]">
            {lines.map((l) => (
              <pre
                key={l.id}
                className={`whitespace-pre-wrap font-[inherit] ${
                  l.kind === "in" ? "text-[var(--fg)]" : l.kind === "sys" ? "text-[var(--uv)]" : "text-[var(--ice)]"
                }`}
              >
                {l.kind === "in" ? "› " : ""}
                {l.text}
              </pre>
            ))}
          </div>
          <form onSubmit={submit} className="flex items-center gap-2">
            <label htmlFor="term" className="shrink-0 text-[var(--acid)]">
              invitado@nervejack<span className="text-[var(--dim)]">:~$</span>
            </label>
            <input
              id="term"
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck={false}
              placeholder="help"
              className="min-w-0 flex-1 bg-transparent text-[var(--fg)] caret-[var(--acid)] outline-none placeholder:text-[var(--faint)]"
            />
            <div className="hidden gap-1 sm:flex">
              {["escaner", "mercado", "cita"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => run(c)}
                  className="border border-[var(--faint)] px-2 py-0.5 text-[11px] text-[var(--dim)] transition-colors hover:border-[var(--ice)] hover:text-[var(--ice)]"
                >
                  {c}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {off && (
        <div className="fixed inset-0 z-[90] flex animate-[fadein_.4s_.85s_both] items-center justify-center bg-black">
          <p className="animate-pulse text-center text-sm text-[var(--dim)]">
            SEÑAL PERDIDA
            <br />
            <span className="text-[var(--acid)]">pulsa cualquier tecla para reconectar</span>
          </p>
        </div>
      )}
    </>
  );
}

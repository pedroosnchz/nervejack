/** Bus mínimo para que cualquier componente escriba en la terminal o lance efectos globales. */
type Listener = (line: string) => void;
const listeners = new Set<Listener>();

export function termPrint(line: string) {
  listeners.forEach((l) => l(line));
}
export function onTermPrint(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Ráfaga de glitch en toda la pantalla. */
export function glitchBurst(ms = 650) {
  const el = document.documentElement;
  el.classList.remove("is-glitching");
  void el.offsetWidth;
  el.classList.add("is-glitching");
  window.setTimeout(() => el.classList.remove("is-glitching"), ms);
}

export function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Ejecutar un comando de la terminal desde cualquier parte. */
type RunListener = (cmd: string) => void;
const runners = new Set<RunListener>();
export function termRun(cmd: string) {
  runners.forEach((r) => r(cmd));
}
export function onTermRun(r: RunListener) {
  runners.add(r);
  return () => {
    runners.delete(r);
  };
}

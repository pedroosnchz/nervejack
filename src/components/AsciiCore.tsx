"use client";

import { useEffect, useRef } from "react";

const RAMP = " .,:;-=+*oa#%@";
// paleta por nivel de luz: ultravioleta → cian hielo
const COLORS = [
  "#1a0f33", "#26124d", "#351866", "#4a1f8a", "#5f27b0", "#7b2cff",
  "#7f55ff", "#7a80ff", "#6ea8ff", "#5fcfff", "#4df3ff", "#b8fbff", "#ffffff", "#ffffff",
];

/**
 * Núcleo neural renderizado en ASCII: raymarching en CPU de una esfera tallada con un giroide.
 * - La luz sigue al ratón; arrastrar rota el núcleo con inercia.
 * - Alrededor del cursor los caracteres se vuelven binario (lente).
 * - Cortes de señal: franjas que se desplazan al azar.
 */
export default function AsciiCore({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = 0, H = 0, cols = 0, rows = 0, cw = 0, chh = 0, fs = 12;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = W < 640 ? 9 : 12;
      ctx.font = `${fs}px ui-monospace, Menlo, Consolas, monospace`;
      cw = ctx.measureText("M").width;
      chh = fs * 1.15;
      cols = Math.floor(W / cw);
      rows = Math.floor(H / chh);
    };
    resize();
    window.addEventListener("resize", resize);

    // interacción
    let yaw = 0.4, pitch = 0.3, vy = 0.25, vp = 0;
    let dragging = false, lx = 0, ly = 0;
    let mx = -9999, my = -9999;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (dragging) {
        vy = (e.clientX - lx) * 0.6;
        vp = (e.clientY - ly) * 0.6;
        lx = e.clientX;
        ly = e.clientY;
      }
    };
    const onUp = () => (dragging = false);
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // SDF del núcleo
    let ca = 1, sa = 0, cb = 1, sb = 0, pulse = 0;
    const K = 3.4;
    const sdf = (x: number, y: number, z: number) => {
      const x1 = x * ca - z * sa;
      const z1 = x * sa + z * ca;
      const y1 = y * cb - z1 * sb;
      const z2 = y * sb + z1 * cb;
      const len = Math.sqrt(x1 * x1 + y1 * y1 + z2 * z2);
      const core = len - (0.3 + pulse);
      if (len > 1.08) return Math.min(len - 1.0, core);
      const g =
        (Math.sin(K * x1) * Math.cos(K * y1) + Math.sin(K * y1) * Math.cos(K * z2) + Math.sin(K * z2) * Math.cos(K * x1)) / K;
      const shell = Math.max(len - 1.0, Math.abs(g) - 0.05);
      return Math.min(shell * 0.7, core);
    };

    let raf = 0, last = 0;
    const t0 = performance.now();
    const buckets: string[][] = [];

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || now - last < 1000 / 30) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      if (!dragging) {
        vy += (0.25 - vy) * Math.min(1, dt * 1.5);
        vp += (0 - vp) * Math.min(1, dt * 2);
      }
      if (!reduced) {
        yaw += vy * dt;
        pitch = Math.max(-1.2, Math.min(1.2, pitch + vp * dt));
      }
      ca = Math.cos(yaw); sa = Math.sin(yaw); cb = Math.cos(pitch); sb = Math.sin(pitch);
      pulse = Math.sin(t * 2.2) * 0.03;

      const cx = W >= 1024 ? W * 0.68 : W * 0.5;
      const cy = W >= 1024 ? H * 0.5 : H * 0.42;
      const S = Math.min(W, H) * (W >= 1024 ? 0.4 : 0.36);

      // luz hacia el ratón
      let Lx = 0.5, Ly = 0.6, Lz = -0.6;
      if (mx > -9000) {
        Lx = (mx - cx) / S;
        Ly = -(my - cy) / S;
        Lz = -1.2;
      }
      const ll = Math.hypot(Lx, Ly, Lz);
      Lx /= ll; Ly /= ll; Lz /= ll;

      for (let b = 0; b < COLORS.length + 1; b++) buckets[b] = Array.from({ length: rows }, () => "");
      const LENS = 110;

      for (let r = 0; r < rows; r++) {
        const py = r * chh + chh / 2;
        const Y = -(py - cy) / S;
        const lines = buckets.map((bk) => bk[r]);
        for (let c = 0; c < cols; c++) {
          const px = c * cw + cw / 2;
          const X = (px - cx) / S;
          let ch = " ", bucket = -1;
          if (X * X + Y * Y < 1.35) {
            // rayo
            let dx = X * 0.533, dy = Y * 0.533, dz = 1;
            const dl = Math.hypot(dx, dy, dz);
            dx /= dl; dy /= dl; dz /= dl;
            const ox = 0, oy = 0, oz = -3;
            let tt = 1.7, steps = 0, hit = false;
            for (; steps < 44; steps++) {
              const d = sdf(ox + dx * tt, oy + dy * tt, oz + dz * tt);
              if (d < 0.004) { hit = true; break; }
              tt += d;
              if (tt > 4.4) break;
            }
            if (hit) {
              const hx = ox + dx * tt, hy = oy + dy * tt, hz = oz + dz * tt;
              const e = 0.01;
              // normal tetraédrica
              const a = sdf(hx + e, hy - e, hz - e);
              const b2 = sdf(hx - e, hy - e, hz + e);
              const c2 = sdf(hx - e, hy + e, hz - e);
              const d2 = sdf(hx + e, hy + e, hz + e);
              let nx = a - b2 - c2 + d2, ny = -a - b2 + c2 + d2, nz = -a + b2 - c2 + d2;
              const nl = Math.hypot(nx, ny, nz) || 1;
              nx /= nl; ny /= nl; nz /= nl;
              const diff = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
              const ao = 1 - steps / 44;
              const lum = Math.min(1, 0.08 + diff * 0.95 * ao + Math.pow(Math.max(0, 1 + nz), 3) * 0.08);
              const isCore = Math.hypot(hx, hy, hz) < 0.38;
              const idx = Math.max(1, Math.min(RAMP.length - 1, Math.floor(lum * (RAMP.length - 1))));
              ch = RAMP[idx];
              bucket = isCore ? COLORS.length : Math.min(COLORS.length - 1, idx);
            }
          }
          // lente: binario alrededor del cursor
          if (mx > -9000 && bucket >= 0) {
            const dd = (px - mx) ** 2 + (py - my) ** 2;
            if (dd < LENS * LENS) {
              ch = Math.random() > 0.5 ? "1" : "0";
              bucket = COLORS.length;
            }
          }
          for (let b = 0; b < lines.length; b++) lines[b] += b === bucket ? ch : " ";
        }
        buckets.forEach((bk, b) => (bk[r] = lines[b]));
      }

      ctx.clearRect(0, 0, W, H);
      ctx.textBaseline = "middle";
      // franja de corte de señal
      const glitchRow = !reduced && Math.random() < 0.12 ? Math.floor(Math.random() * rows) : -1;
      const glitchH = 2 + Math.floor(Math.random() * 6);
      const glitchOff = (Math.random() - 0.5) * 60;
      for (let b = 0; b < buckets.length; b++) {
        ctx.fillStyle = b === COLORS.length ? "#ff2e88" : COLORS[b];
        const bk = buckets[b];
        for (let r = 0; r < rows; r++) {
          const line = bk[r];
          if (!line.trim()) continue;
          const off = r >= glitchRow && r < glitchRow + glitchH ? glitchOff : 0;
          ctx.fillText(line, off, r * chh + chh / 2);
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`cursor-grab touch-pan-y active:cursor-grabbing ${className}`} />;
}

"use client";

import { useEffect } from "react";

/** Marca secciones visibles (is-in) y lanza alguna interferencia aleatoria sobre un titular. */
export default function Ambient() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
      { threshold: 0.1 },
    );
    document.querySelectorAll("main section").forEach((s) => io.observe(s));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => io.disconnect();
    const id = window.setInterval(() => {
      const hs = Array.from(document.querySelectorAll<HTMLElement>(".glitch")).filter((h) => {
        const r = h.getBoundingClientRect();
        return r.top < innerHeight && r.bottom > 0;
      });
      const h = hs[Math.floor(Math.random() * hs.length)];
      if (!h) return;
      h.classList.remove("glitch-now");
      void h.offsetWidth;
      h.classList.add("glitch-now");
    }, 5200);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, []);
  return null;
}

import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { IMPLANTS } from "@/lib/implants";
import BookingForm from "./BookingForm";

function ago(d: Date) {
  const s = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `hace ${s}s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)}h`;
  return `hace ${Math.floor(s / 86400)}d`;
}

async function Log() {
  await connection();
  const [rows, total] = await Promise.all([
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 9, select: { handle: true, implant: true, slot: true, createdAt: true } }),
    prisma.booking.count(),
  ]);
  return (
    <pre className="whitespace-pre-wrap text-[12px] leading-6">
      <span className="text-[var(--uv)]">$ tail -f /var/log/quirofano.log</span>
      {"\n"}
      {rows.length === 0 && <span className="text-[var(--dim)]">[--:--:--] cola vacía. el primer bisturí es tuyo.{"\n"}</span>}
      {rows.map((r) => {
        const im = IMPLANTS.find((i) => i.id === r.implant);
        const ts = ago(r.createdAt);
        return (
          <span key={r.slot} className="block">
            <span className="text-[var(--dim)]">[{ts}]</span> <span className="text-[var(--ice)]">Q-{String(r.slot).padStart(4, "0")}</span>{" "}
            @{r.handle} <span className="text-[var(--dim)]">→</span> <span className="text-[var(--acid)]">{im?.code ?? r.implant}</span>
          </span>
        );
      })}
      <span className="text-[var(--dim)]">
        {"\n"}
        {total} pacientes en cola
      </span>
      <span className="caret" />
    </pre>
  );
}

export default function Booking() {
  return (
    <section id="quirofano" className="relative px-5 pb-48 pt-32 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs text-[var(--acid)]">04 // reservar_quirofano --sin-anestesia-de-pago</p>
          <h2 className="glitch mb-10 text-[clamp(40px,6vw,96px)] font-black leading-[0.85] tracking-[-0.04em]" data-text="QUIRÓFANO">
            QUIRÓFANO
          </h2>
          <BookingForm />
        </div>
        <div className="self-start border border-[var(--faint)] bg-[#07040d] p-5">
          <Suspense fallback={<p className="text-xs text-[var(--dim)]">montando /var/log…</p>}>
            <Log />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

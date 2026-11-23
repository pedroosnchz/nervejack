"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { IMPLANTS } from "@/lib/implants";

export type BookingState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "booked"; handle: string; slot: number; implant: string; again: boolean };

const schema = z.object({
  handle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_.-]+$/, "Handle inválido: solo letras, números, _ . -")
    .min(3, "Handle demasiado corto. Mínimo 3.")
    .max(16, "Handle demasiado largo. Máximo 16."),
  email: z.email("Ese canal no responde. Revisa el email."),
  implant: z.enum(IMPLANTS.map((i) => i.id) as [string, ...string[]], { error: "Selecciona un implante." }),
  consent: z.literal("on", { error: "Necesitamos tu consentimiento. Es tu cuerpo (de momento)." }),
});

export async function bookSlot(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const parsed = schema.safeParse({
    handle: formData.get("handle"),
    email: formData.get("email"),
    implant: formData.get("implant"),
    consent: formData.get("consent"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const { handle, email, implant } = parsed.data;

  const existing = await prisma.booking.findUnique({ where: { email } });
  if (existing) {
    return { status: "booked", handle: existing.handle, slot: existing.slot, implant: existing.implant, again: true };
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const b = await prisma.$transaction(async (tx) => {
        const last = await tx.booking.findFirst({ orderBy: { slot: "desc" } });
        return tx.booking.create({ data: { handle, email, implant, slot: (last?.slot ?? 0) + 1 } });
      });
      revalidatePath("/");
      return { status: "booked", handle: b.handle, slot: b.slot, implant: b.implant, again: false };
    } catch (err) {
      if ((err as { code?: string }).code !== "P2002") throw err;
    }
  }
  return { status: "error", message: "Colisión de paquetes. Reintenta." };
}

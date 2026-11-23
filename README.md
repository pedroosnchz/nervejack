# NERVEJACK — Tu cuerpo es hardware heredado

Landing experimental cyberpunk: la web de una clínica clandestina de implantes neuronales, planteada como si fuera un sistema operativo de cyberdeck. Puedes navegar haciendo scroll o escribiendo comandos.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4 · Prisma 7 + SQLite · Canvas 2D · scroll nativo

## Arrancar

```bash
npm install          # ejecuta también prisma generate
npx prisma migrate dev
npm run dev
```

## Piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| Núcleo ASCII | `src/components/AsciiCore.tsx` | Raymarching en CPU de una esfera tallada con un giroide, pintada con caracteres. La luz sigue al ratón y se puede arrastrar para rotarla; alrededor del cursor los caracteres pasan a binario y a veces hay cortes de señal |
| Terminal | `src/components/Terminal.tsx`, `src/lib/term.ts` | Barra fija de comandos (`help`, `escaner`, `mercado`, `canal`, `cita`, `whoami`, `glitch`, `clear`, `desconectar`, `sudo`) con historial, autocompletado con Tab y atajo `/` |
| Humano ↔ máquina | `.morph` / `.human` / `.machine` en `globals.css` | Usa los ejes MONO, CASL y slnt de Recursive: el texto pasa de monoespaciado a cursiva humana |
| 01 Escáner | `sections/Scanner.tsx` | Una línea de escaneo recorre el cuerpo con el scroll y activa los implantes. La capa de rayos X se ve en la banda de escaneo y bajo la lente del cursor. Indicador de humanidad |
| 02 Mercado | `sections/Market.tsx` | Cotizaciones en vivo (paseo aleatorio), sparklines, índice NJX y cinta de órdenes |
| 03 Canal | `sections/Channel.tsx` | Chat interceptado: cada mensaje llega cifrado en hex y se transforma en texto humano |
| 04 Quirófano | `sections/Booking.tsx`, `BookingForm.tsx`, `src/app/actions.ts` | Reserva (server action + zod + Prisma) con matriz de datos y cuenta atrás de 72 h; log de terminal con las reservas recientes |
| Desconectar | `Outro.tsx` + comando `desconectar` | Apagado CRT de toda la página y reconexión |

Respeta `prefers-reduced-motion`.

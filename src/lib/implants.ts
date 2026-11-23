export type Implant = {
  id: "kestrel" | "cortex" | "hilo" | "tensor" | "ion";
  code: string;
  name: string;
  zone: string;
  /** posición del punto caliente sobre el cuerpo (viewBox 300x720) */
  x: number;
  y: number;
  price: number;
  compat: number;
  reject: number;
  blurb: string;
  side: "left" | "right";
};

export const IMPLANTS: Implant[] = [
  {
    id: "kestrel", code: "OPT-K7", name: "Ojo Kestrel", zone: "Óptica", x: 162, y: 62,
    price: 14800, compat: 94, reject: 3, side: "right",
    blurb: "Zoom ×40, visión térmica y un modo que hace que los anuncios desaparezcan.",
  },
  {
    id: "cortex", code: "NRL-Δ", name: "Córtex Delta", zone: "Neural", x: 150, y: 30,
    price: 39900, compat: 71, reject: 12, side: "left",
    blurb: "Memoria externa de 2 PB. Recuerda todo. Sí, también eso.",
  },
  {
    id: "ion", code: "CRD-ION", name: "Corazón Ion", zone: "Cardio", x: 165, y: 205,
    price: 52000, compat: 88, reject: 6, side: "right",
    blurb: "Bomba de doble cámara con batería de 40 años. Late a tu ritmo o al de la música.",
  },
  {
    id: "tensor", code: "MSC-T9", name: "Brazo Tensor", zone: "Muscular", x: 60, y: 290,
    price: 27500, compat: 82, reject: 9, side: "left",
    blurb: "Fibras de carbono trenzado. Agarre de 900 kg con tacto de pianista.",
  },
  {
    id: "hilo", code: "SPN-H", name: "Columna Hilo", zone: "Reflejos", x: 150, y: 340,
    price: 33300, compat: 77, reject: 10, side: "right",
    blurb: "Fibra óptica en la médula. Tus reflejos llegan antes que tus pensamientos.",
  },
];

export const credits = (n: number) => `¢${n.toLocaleString("es-ES")}`;

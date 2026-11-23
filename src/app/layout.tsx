import type { Metadata, Viewport } from "next";
import { Major_Mono_Display, Recursive } from "next/font/google";
import Terminal from "@/components/Terminal";
import Header from "@/components/Header";
import Ambient from "@/components/Ambient";
import "./globals.css";

const rec = Recursive({ variable: "--font-rec", subsets: ["latin"], axes: ["MONO", "CASL", "slnt"] });
const major = Major_Mono_Display({ variable: "--font-major", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "NERVEJACK — Tu cuerpo es hardware heredado",
  description: "Clínica clandestina de implantes neuronales en el Sector 13. Catálogo, mercado negro y reserva de quirófano.",
};

export const viewport: Viewport = { themeColor: "#05030a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${rec.variable} ${major.variable} crt antialiased`}>
      <body>
        <Ambient />
        <Header />
        {children}
        <Terminal />
      </body>
    </html>
  );
}

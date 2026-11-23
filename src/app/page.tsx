import Hero from "@/components/sections/Hero";
import Scanner from "@/components/sections/Scanner";
import Market from "@/components/sections/Market";
import Channel from "@/components/sections/Channel";
import Booking from "@/components/sections/Booking";
import Outro from "@/components/sections/Outro";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Scanner />
      <Market />
      <Channel />
      <Booking />
      <Outro />
    </main>
  );
}

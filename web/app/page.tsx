"use client";

import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/countdown";
import { Confetti } from "@/components/confetti";
import Link from "next/link";
import { Ticket, Music, MapPin, Beer } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      const { configService } = await import('@/lib/services/config-service');
      const data = await configService.getConfig();
      if (data) {
        setConfig(data);
      }
    }
    loadConfig();
  }, []);

  const defaultWhatsapp = "https://wa.me/558681263022";
  const whatsappLink = config?.whatsapp_link || defaultWhatsapp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-700 to-orange-500 text-white relative overflow-x-hidden">
      <Confetti />

      <header className="relative z-10 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tighter uppercase drop-shadow-md">
          Bloquinho <span className="text-yellow-300">ebabado</span>
        </h1>
        <Link href="/login">
          <Button variant="ghost" className="text-white hover:bg-white/20">Login</Button>
        </Link>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-10 pb-20 space-y-12">

        {/* Hero */}
        <div className="space-y-6 animate-in fade-in zoom-in duration-1000">
          <div className="inline-block px-4 py-1 bg-yellow-400 text-purple-900 font-bold rounded-full text-sm mb-4 shadow-lg animate-bounce">
            🎉 O CARNAVAL MAIS ESPERADO DE 2026!
          </div>
          <h2 className="text-5xl md:text-8xl font-black uppercase leading-none tracking-tight drop-shadow-xl">
            {config?.hero_title ? (
              <span dangerouslySetInnerHTML={{ __html: config.hero_title.replace(/\n/g, "<br/>") }} />
            ) : (
              <>
                Vem pro <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                  Bloquinho
                </span>
              </>
            )}
          </h2>
          <p className="text-xl md:text-2xl font-medium text-white/90 max-w-2xl mx-auto">
            {config?.hero_description || "Prepare sua fantasia e vem curtir a melhor vibe do ano! Música boa, gente bonita e open de alegria."}
          </p>
        </div>

        {/* Countdown */}
        <div className="w-full max-w-3xl">
          <Countdown targetDate={config?.event_date || "2026-02-28T14:00:00"} />
          <p className="mt-4 text-sm font-semibold opacity-75 uppercase tracking-widest">
            {config?.event_date ? new Date(config.event_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "28 de Fevereiro de 2026 • 14:00H"}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md justify-center">
          <Link href={whatsappLink} target="_blank" className="w-full">
            <Button size="lg" className="w-full bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold text-lg h-14 rounded-full shadow-xl hover:scale-105 transition-transform">
              <Ticket className="mr-2 w-5 h-5" /> GARANTIR INGRESSO
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl w-full">
          <FeatureCard
            icon={<Music className="w-8 h-8 text-pink-500" />}
            title="Atrações"
            description={config?.attractions || "Os melhores DJs e bandas de carnaval para não deixar ninguém parado."}
          />
          <FeatureCard
            icon={<Beer className="w-8 h-8 text-yellow-500" />} // Mantendo Beer por enquanto, ou poderia mudar para Info se fosse só regras
            title="Regras e Informações"
            description={config?.rules || "Confira as regras do evento para curtir com segurança e alegria."}
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8 text-purple-500" />}
            title="Local"
            description={config?.location || "Local a ser definido. Fique ligado!"}
          />
        </div>

      </main>

      <footer className="relative z-10 py-8 text-center text-white/40 text-sm">
        <p>© 2026 Bloquinho ebabado. Todos os direitos reservados.</p>
        <p className="mt-2">Developed with 💜 by Antigravity</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-3xl text-left hover:bg-white/15 transition-colors">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/70 leading-relaxed">{description}</p>
    </div>
  )
}

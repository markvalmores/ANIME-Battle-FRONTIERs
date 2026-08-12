import React from 'react';
import { ChevronLeft, MousePointer2, Coins, Sword, Shield } from 'lucide-react';

export default function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full h-full bg-zinc-950 p-12 flex flex-col">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="text-4xl font-bold italic">HOW TO <span className="text-emerald-400">PLAY</span></h2>
      </div>

      <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
        <GuideCard 
          icon={<MousePointer2 className="text-emerald-400" />}
          title="SUMMON UNITS"
          desc="Click on character cards at the bottom to summon them. Each unit costs money and has a cooldown."
        />
        <GuideCard 
          icon={<Coins className="text-yellow-400" />}
          title="MANAGE ECONOMY"
          desc="Money generates automatically over time. Defeating enemies also grants rewards. Use it wisely!"
        />
        <GuideCard 
          icon={<Sword className="text-red-400" />}
          title="BATTLE MECHANICS"
          desc="Units move automatically towards the enemy base. They will attack any enemy in their range."
        />
        <GuideCard 
          icon={<Shield className="text-blue-400" />}
          title="DEFEND YOUR BASE"
          desc="If your base health reaches zero, you lose. Protect it at all costs while trying to destroy the enemy base."
        />
      </div>
    </div>
  );
}

function GuideCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col gap-4">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold italic tracking-tight">{title}</h3>
      <p className="text-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}

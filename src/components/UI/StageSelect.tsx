import React from 'react';
import { motion } from 'motion/react';
import { playSound } from '../../services/audio';
import { ChevronLeft, Lock, Play } from 'lucide-react';

export default function StageSelect({ 
  unlocked, 
  onSelect, 
  onBack 
}: { 
  unlocked: number; 
  onSelect: (lvl: number) => void; 
  onBack: () => void;
}) {
  const stages = Array.from({ length: unlocked + 5 }, (_, i) => i + 1);

  return (
    <div className="w-full h-full bg-zinc-950 p-4 sm:p-12 flex flex-col">
      <div className="flex items-center gap-4 mb-6 sm:mb-12">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="text-2xl sm:text-4xl font-bold italic">STAGE <span className="text-emerald-400">SELECT</span></h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 overflow-y-auto pr-2 scrollbar-none">
        {stages.map((lvl) => {
          const isLocked = lvl > unlocked;
          return (
            <motion.div
              key={lvl}
              whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              onClick={() => {
                if (!isLocked) {
                  playSound('click');
                  onSelect(lvl);
                }
              }}
              className={`aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden ${
                isLocked 
                  ? 'bg-black/40 border-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/5 border-emerald-500/30 text-white cursor-pointer hover:border-emerald-500'
              }`}
            >
              {isLocked ? (
                <Lock size={40} />
              ) : (
                <>
                  <div className="text-6xl font-black italic">{lvl}</div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Play size={16} fill="currentColor" />
                    START
                  </div>
                </>
              )}
              
              {/* Background Decoration */}
              <div className="absolute -bottom-4 -right-4 opacity-5">
                <div className="text-9xl font-black italic">{lvl}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

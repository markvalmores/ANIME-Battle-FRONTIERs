import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SaveData, Character } from '../../types';
import { AnimeCharacter } from '../Anime';
import { playSound } from '../../services/audio';
import { generateNewCharacter, getAnimeGif } from '../../services/api';
import { ChevronLeft, Coins, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GachaScreen({ 
  saveData, 
  onUpdateSave, 
  onBack 
}: { 
  saveData: SaveData; 
  onUpdateSave: (d: Partial<SaveData>) => void;
  onBack: () => void;
}) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const COST = 150;

  const roll = async () => {
    if (saveData.currency < COST || isRolling) return;
    
    setIsRolling(true);
    playSound('click');
    
    try {
      const rarities = ['Common', 'Rare', 'Super Rare', 'Legendary'];
      const weights = [70, 20, 8, 2];
      const rollValue = Math.random() * 100;
      let cumulative = 0;
      let rarity = 'Common';
      
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rollValue <= cumulative) {
          rarity = rarities[i];
          break;
        }
      }

      const charData = await generateNewCharacter(rarity);
      const gifUrl = await getAnimeGif();
      
      const newChar = {
        ...charData,
        id: `char_${Date.now()}`,
        gifUrl,
        rarity
      };

      setResult(newChar);
      onUpdateSave({
        currency: saveData.currency - COST,
        ownedCharacters: [...saveData.ownedCharacters, newChar.id as string],
        ownedCharacterDetails: {
          ...saveData.ownedCharacterDetails,
          [newChar.id as string]: newChar as Character
        }
      });
      
      if (rarity === 'Legendary' || rarity === 'Super Rare') {
        confetti();
      }
    } catch (err) {
      alert("Failed to summon character. Please check your connection.");
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 p-12 flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full" />

      <div className="flex justify-between items-center mb-12 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft />
          </button>
          <h2 className="text-4xl font-bold italic">SUMMON <span className="text-emerald-400">HEROES</span></h2>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <Coins className="text-yellow-400" />
          <span className="text-2xl font-mono font-bold">{saveData.currency}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="relative">
                <div className={`absolute inset-0 blur-3xl opacity-50 ${
                  result.rarity === 'Legendary' ? 'bg-yellow-400' : 
                  result.rarity === 'Super Rare' ? 'bg-purple-500' : 
                  'bg-emerald-500'
                }`} />
                <AnimeCharacter 
                  url={result.gifUrl} 
                  className="w-64 h-64 object-contain relative z-10" 
                />
              </div>
              
              <div className="text-center">
                <div className={`text-sm font-bold uppercase tracking-[0.3em] mb-2 ${
                  result.rarity === 'Legendary' ? 'text-yellow-400' : 
                  result.rarity === 'Super Rare' ? 'text-purple-400' : 
                  'text-emerald-400'
                }`}>
                  {result.rarity}
                </div>
                <h3 className="text-5xl font-black italic mb-4">{result.name}</h3>
                <div className="flex gap-4 text-white/50 font-mono text-sm">
                  <span>HP: {result.hp}</span>
                  <span>ATK: {result.attack}</span>
                  <span>SPD: {result.speed}</span>
                </div>
              </div>

              <button 
                onClick={() => setResult(null)}
                className="px-12 py-4 bg-white text-black font-bold rounded-full hover:bg-emerald-400 transition-colors"
              >
                CONTINUE
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="w-64 h-64 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                <Sparkles className="text-white/20" size={80} />
              </div>
              
              <div className="text-center">
                <p className="text-white/50 mb-8 max-w-md">Summon powerful anime warriors to join your frontier. Each summon costs 150 coins.</p>
                <button 
                  onClick={roll}
                  disabled={isRolling || saveData.currency < COST}
                  className={`px-16 py-6 rounded-3xl font-black text-2xl tracking-tighter transition-all flex items-center gap-4 ${
                    isRolling || saveData.currency < COST
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-emerald-500 text-black hover:scale-110 hover:shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                  }`}
                >
                  {isRolling ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {isRolling ? 'SUMMONING...' : 'SUMMON HERO'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

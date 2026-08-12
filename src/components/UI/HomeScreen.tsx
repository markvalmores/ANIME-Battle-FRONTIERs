import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Screen, SaveData } from '../../types';
import { playSound } from '../../services/audio';
import { getWallpaperUrl } from '../../services/api';
import { Coins, Play, Settings, HelpCircle, ShoppingBag, LogOut, Users, Loader2 } from 'lucide-react';

export default function HomeScreen({ 
  saveData, 
  onNavigate,
  onNewGame 
}: { 
  saveData: SaveData;
  onNavigate: (s: Screen) => void;
  onNewGame: () => void;
}) {
  const [wallpaper, setWallpaper] = useState('');
  const [isLoadingWallpaper, setIsLoadingWallpaper] = useState(true);

  useEffect(() => {
    setIsLoadingWallpaper(true);
    getWallpaperUrl().then(url => {
      setWallpaper(url);
      setIsLoadingWallpaper(false);
    }).catch(() => setIsLoadingWallpaper(false));
  }, []);

  return (
    <div 
      className="w-full h-full bg-zinc-950 flex bg-cover bg-center transition-all duration-1000 relative"
      style={{ backgroundImage: wallpaper ? `linear-gradient(to right, rgba(9, 9, 11, 1) 20%, rgba(9, 9, 11, 0.4)), url(${wallpaper})` : 'none' }}
    >
      {isLoadingWallpaper && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
            <span className="text-white/50 font-bold tracking-widest animate-pulse">LOADING FRONTIER...</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-8 flex flex-col gap-4 z-10 bg-zinc-950/80 backdrop-blur-md">
        <div className="text-2xl font-bold mb-8 italic">ABF<span className="text-emerald-400">.</span></div>
        
        <MenuButton icon={<Play size={20}/>} label="BATTLE" onClick={() => onNavigate('STAGE_SELECT')} active />
        <MenuButton icon={<Users size={20}/>} label="TEAM" onClick={() => onNavigate('TEAM_MANAGEMENT')} />
        <MenuButton icon={<ShoppingBag size={20}/>} label="GACHA" onClick={() => onNavigate('GACHA')} />
        <MenuButton icon={<Settings size={20}/>} label="SETTINGS" onClick={() => onNavigate('SETTINGS')} />
        <MenuButton icon={<HelpCircle size={20}/>} label="HOW TO PLAY" onClick={() => onNavigate('HOW_TO_PLAY')} />
        
        <div className="mt-auto">
          <MenuButton icon={<LogOut size={20}/>} label="NEW GAME" onClick={() => {
            if(confirm("Start a new game? This will reset your progress.")) onNewGame();
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold">WELCOME BACK, COMMANDER</h2>
            <p className="text-white/50">Level {saveData.unlockedStages} reached</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
            <Coins className="text-yellow-400" />
            <span className="text-2xl font-mono font-bold">{saveData.currency}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 flex-1">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer"
            onClick={() => onNavigate('STAGE_SELECT')}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Play size={200} />
            </div>
            <h3 className="text-3xl font-bold">CONTINUE JOURNEY</h3>
            <p className="text-emerald-400">Stage {saveData.unlockedStages}</p>
          </motion.div>

          <div className="grid grid-rows-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h4 className="text-white/50 uppercase text-xs font-bold tracking-widest mb-4">COLLECTION</h4>
              <div className="text-4xl font-bold">{saveData.ownedCharacters.length} <span className="text-lg text-white/30">/ 100</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h4 className="text-white/50 uppercase text-xs font-bold tracking-widest mb-4">CURRENT TEAM</h4>
              <div className="flex gap-2">
                {saveData.team.map((t, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                    {t ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, active = false }: { icon: any, label: string, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={() => { playSound('click'); onClick(); }}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-emerald-500 text-black font-bold' : 'hover:bg-white/5 text-white/70 hover:text-white'}`}
    >
      {icon}
      <span className="text-sm tracking-wider">{label}</span>
    </button>
  );
}

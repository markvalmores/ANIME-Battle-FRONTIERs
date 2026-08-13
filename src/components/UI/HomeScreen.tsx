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
      className="w-full h-full bg-zinc-950 flex flex-col lg:flex-row bg-cover bg-center transition-all duration-1000 relative overflow-y-auto lg:overflow-hidden"
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

      {/* Sidebar / Topbar */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4 z-10 bg-zinc-950/90 backdrop-blur-md shrink-0 justify-between items-stretch">
        <div className="flex items-center justify-between sm:justify-start lg:flex-col lg:items-start gap-4">
          <div className="text-2xl font-bold italic">ABF<span className="text-emerald-400">.</span></div>
          <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold lg:hidden">
            STAGE {saveData.unlockedStages} REACHED
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-row lg:flex-col gap-2 sm:gap-3 flex-1 justify-center sm:justify-end lg:justify-start">
          <MenuButton icon={<Play size={16}/>} label="BATTLE" onClick={() => onNavigate('STAGE_SELECT')} active />
          <MenuButton icon={<Users size={16}/>} label="TEAM" onClick={() => onNavigate('TEAM_MANAGEMENT')} />
          <MenuButton icon={<ShoppingBag size={16}/>} label="GACHA" onClick={() => onNavigate('GACHA')} />
          <MenuButton icon={<Settings size={16}/>} label="SETTINGS" onClick={() => onNavigate('SETTINGS')} />
        </div>
        
        <div className="flex justify-between sm:justify-end lg:justify-start pt-2 border-t border-white/5 sm:border-0">
          <MenuButton icon={<LogOut size={16}/>} label="NEW GAME" onClick={() => {
            if(confirm("Start a new game? This will reset your progress.")) onNewGame();
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 lg:p-12 flex flex-col justify-start overflow-y-auto lg:overflow-y-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">WELCOME BACK, COMMANDER</h2>
            <p className="text-white/50 text-sm">Level {saveData.unlockedStages} reached</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-white/10 shrink-0">
            <Coins className="text-yellow-400" size={20} />
            <span className="text-lg sm:text-2xl font-mono font-bold">{saveData.currency}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 flex-1">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer min-h-[160px]"
            onClick={() => onNavigate('STAGE_SELECT')}
          >
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Play size={120} className="sm:size-[180px]" />
            </div>
            <h3 className="text-xl sm:text-3xl font-bold">CONTINUE JOURNEY</h3>
            <p className="text-emerald-400 text-sm sm:text-base">Stage {saveData.unlockedStages}</p>
          </motion.div>

          <div className="grid grid-rows-2 gap-4 sm:gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-center">
              <h4 className="text-white/50 uppercase text-[10px] font-bold tracking-widest mb-2 sm:mb-4">COLLECTION</h4>
              <div className="text-2xl sm:text-4xl font-bold">{saveData.ownedCharacters.length} <span className="text-sm sm:text-lg text-white/30">/ 100</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-center">
              <h4 className="text-white/50 uppercase text-[10px] font-bold tracking-widest mb-2 sm:mb-4">CURRENT TEAM</h4>
              <div className="flex gap-2 overflow-x-auto py-1">
                {saveData.team.map((t, i) => (
                  <div key={i} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 border ${t ? 'border-emerald-500/40 text-emerald-400' : 'border-white/10 text-white/25'} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {t ? '✓' : '-'}
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

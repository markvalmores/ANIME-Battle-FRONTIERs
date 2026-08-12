import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { playSound } from '../../services/audio';
import { getWallpaperUrl } from '../../services/api';

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  const [wallpaper, setWallpaper] = useState('https://nekos.best/api/v2/waifu/0001.png');

  useEffect(() => {
    getWallpaperUrl().then(setWallpaper);
  }, []);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-cover bg-center relative transition-all duration-1000"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <motion.h1 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-8xl font-black text-white italic tracking-tighter z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
      >
        ANIME BATTLE <span className="text-emerald-400">FRONTIER</span>
      </motion.h1>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          playSound('click');
          onStart();
        }}
        className="mt-12 px-12 py-4 bg-white text-black font-bold text-2xl rounded-full z-10 hover:bg-emerald-400 transition-colors"
      >
        PRESS START
      </motion.button>

      <div className="absolute bottom-8 text-white/50 text-sm z-10">
        © 2026 FRONTIER STUDIOS. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}

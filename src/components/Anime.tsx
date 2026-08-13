import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getWallpaperUrl, fetchAnimeImage } from '../services/api';

export const SafeAnimeImage = ({ 
  src, 
  category = 'character', 
  className, 
  alt = 'Anime Asset',
  style,
  ...props 
}: { 
  src: string; 
  category?: 'character' | 'background' | 'enemy' | 'castle'; 
  className?: string; 
  alt?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setLoading(true);
  }, [src]);

  const handleError = async () => {
    if (retryCount >= 5) {
      const fallbacks = [
        'https://nekos.best/api/v2/waifu/0001.png',
        'https://nekos.best/api/v2/neko/0001.png',
        'https://nekos.best/api/v2/kitsune/0001.png',
        'https://nekos.best/api/v2/husbando/0001.png'
      ];
      setCurrentSrc(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
      return;
    }

    try {
      const newUrl = await fetchAnimeImage(category);
      setRetryCount(prev => prev + 1);
      setCurrentSrc(newUrl);
    } catch (err) {
      console.error('Failed to fetch fallback anime image:', err);
    }
  };

  return (
    <img 
      src={currentSrc} 
      className={`${className} ${loading ? 'opacity-80 animate-pulse' : 'opacity-100'}`}
      onError={handleError}
      onLoad={() => setLoading(false)}
      referrerPolicy="no-referrer"
      alt={alt}
      style={style}
      {...props}
    />
  );
};

export const AnimeGif = ({ url, className }: { url: string, className?: string }) => (
  <SafeAnimeImage src={url} category="character" className={className} alt="Anime GIF" />
);

export const AnimeBackground = ({ level, className }: { level: number, className?: string }) => {
  const [bg, setBg] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    getWallpaperUrl().then(setBg);
  }, [level]);

  const handleBgError = async () => {
    if (retryCount >= 5) return;
    try {
      const newUrl = await getWallpaperUrl();
      setRetryCount(prev => prev + 1);
      setBg(newUrl);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${className}`}
      style={{ backgroundImage: bg ? `url(${bg})` : 'none' }}
    >
      {bg && <img src={bg} className="hidden" onError={handleBgError} referrerPolicy="no-referrer" alt="" />}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export const AnimeCharacter = ({ url, className, isEnemy = false }: { url: string, className?: string, isEnemy?: boolean }) => {
  return (
    <SafeAnimeImage 
      src={url} 
      category={isEnemy ? 'enemy' : 'character'}
      className={`${className} ${isEnemy ? 'scale-x-[-1]' : ''}`} 
      alt="Anime Character" 
    />
  );
};

export const AnimeCastle = ({ isPlayer, level, className, customUrl }: { isPlayer: boolean, level: number, className?: string, customUrl?: string }) => {
  // Using 2D stylized icons with variety based on level
  const playerCastles = [
    'https://cdn-icons-png.flaticon.com/512/619/619043.png', // Classic Blue
    'https://cdn-icons-png.flaticon.com/512/1018/1018260.png', // Modern White
    'https://cdn-icons-png.flaticon.com/512/2829/2829804.png', // Emerald Fortress
    'https://cdn-icons-png.flaticon.com/512/1018/1018251.png', // Sky Tower
    'https://cdn-icons-png.flaticon.com/512/3241/3241477.png'  // Golden Citadel
  ];
  const enemyCastles = [
    'https://cdn-icons-png.flaticon.com/512/619/619032.png', // Dark Keep
    'https://cdn-icons-png.flaticon.com/512/1018/1018245.png', // Crimson Fortress
    'https://cdn-icons-png.flaticon.com/512/2829/2829775.png', // Obsidian Spire
    'https://cdn-icons-png.flaticon.com/512/1018/1018236.png', // Void Citadel
    'https://cdn-icons-png.flaticon.com/512/3241/3241459.png'  // Shadow Palace
  ];

  const castleUrl = customUrl || (isPlayer 
    ? playerCastles[level % playerCastles.length] 
    : enemyCastles[level % enemyCastles.length]);
    
  return (
    <div className={`relative ${className} flex flex-col items-center justify-end group`}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full flex justify-center"
      >
        <SafeAnimeImage 
          src={castleUrl} 
          category="castle"
          className={`w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 ${isPlayer ? '' : 'scale-x-[-1]'}`}
          alt="Castle"
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-t ${isPlayer ? 'from-emerald-500/10' : 'from-red-500/10'} to-transparent rounded-b-xl pointer-events-none`} />
    </div>
  );
};

export const AnimeGround = ({ level }: { level: number }) => {
  // Different ground themes based on level
  const themes = [
    { bg: '#2d2d2d', accent: '#3d3d3d', pattern: 'dots' }, // Industrial
    { bg: '#1a2e1a', accent: '#2a3e2a', pattern: 'grass' }, // Forest
    { bg: '#2e1a1a', accent: '#3e2a2a', pattern: 'lava' }, // Volcanic
    { bg: '#1a1a2e', accent: '#2a2a3e', pattern: 'space' }, // Cosmic
    { bg: '#2e2e1a', accent: '#3e3e2a', pattern: 'desert' }, // Sandy
    { bg: '#1a2e2e', accent: '#2a3e3e', pattern: 'ice' }, // Frozen
    { bg: '#2e1a2e', accent: '#3e2a3e', pattern: 'magic' } // Mystical
  ];
  
  const theme = themes[level % themes.length];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none">
      {/* 2D Stylized Ground */}
      <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: theme.bg }}>
        {/* Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-4 shadow-inner" style={{ backgroundColor: theme.accent }} />
        
        {/* Pattern Overlays */}
        {theme.pattern === 'dots' && (
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        )}
        {theme.pattern === 'grass' && (
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }} />
        )}
        {theme.pattern === 'lava' && (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ff4400 0%, transparent 70%)', backgroundSize: '60px 60px' }} />
        )}
        {theme.pattern === 'space' && (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
        )}
        {theme.pattern === 'desert' && (
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #ffffff 20px, #ffffff 21px)' }} />
        )}
        {theme.pattern === 'ice' && (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, #ffffff 25%, transparent 25%)', backgroundSize: '30px 30px' }} />
        )}
        {theme.pattern === 'magic' && (
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 10%, transparent 10%)', backgroundSize: '15px 15px' }} />
        )}

        {/* Bottom Shine */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5" />
      </div>
    </div>
  );
};

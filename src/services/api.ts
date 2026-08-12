import { Character } from "../types";

// Japanese Romaji Name Generator
const generateJapaneseName = (): string => {
  const prefixes = [
    'Kuro', 'Shiro', 'Aka', 'Ao', 'Midori', 'Yami', 'Hikari', 'Kaze', 'Mizu', 'Hi', 
    'Tsuchi', 'Ryuu', 'Tora', 'Ookami', 'Kitsune', 'Kuma', 'Taka', 'Sora', 'Umi', 'Yama',
    'Shin', 'Zen', 'Aku', 'Rei', 'Kyo', 'Jin', 'Gi', 'Chu', 'Ko', 'Tei'
  ];
  const suffixes = [
    'maru', 'suke', 'taro', 'ko', 'mi', 'na', 'ne', 'ki', 'shi', 'ya',
    'hime', 'ou', 'kami', 'sama', 'dono', 'kun', 'chan', 'san', 'zaki', 'mura',
    'hara', 'gawa', 'da', 'ta', 'no', 'moto', 'uchi', 'saka', 'oka', 'jima'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return prefix + suffix;
};

// Mock character generation for offline play
export const generateNewCharacter = async (rarity: string): Promise<Partial<Character>> => {
  const name = generateJapaneseName();
  
  const multiplier = rarity === 'Legendary' ? 3 : rarity === 'Super Rare' ? 2 : rarity === 'Rare' ? 1.5 : 1;

  return {
    name: name,
    hp: Math.floor(100 * multiplier),
    attack: Math.floor(20 * multiplier),
    range: Math.floor(50 + Math.random() * 100),
    speed: 1 + Math.random() * 2,
    cost: Math.floor(50 * multiplier),
    cooldown: 2 + Math.random() * 5,
    attackRate: 1 + Math.random() * 2,
  };
};

export const fetchAnimeImage = async (category: 'character' | 'background' | 'enemy' | 'castle'): Promise<string> => {
  const fetchers = [
    // waifu.pics
    async () => {
      const endpoints = category === 'background' 
        ? ['megumin', 'shinobu'] // sometimes good for landscape or wider shots
        : ['waifu', 'neko', 'shinobu'];
      const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = await fetch(`https://api.waifu.pics/sfw/${ep}`);
      if (!res.ok) throw new Error('waifu.pics failed');
      const data = await res.json();
      if (!data.url) throw new Error('No URL in waifu.pics');
      return data.url;
    },
    // nekos.best
    async () => {
      const endpoints = ['waifu', 'neko', 'husbando', 'kitsune'];
      const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = await fetch(`https://nekos.best/api/v2/${ep}`);
      if (!res.ok) throw new Error('nekos.best failed');
      const data = await res.json();
      if (!data.results?.[0]?.url) throw new Error('No URL in nekos.best');
      return data.results[0].url;
    },
    // waifu.im
    async () => {
      const res = await fetch('https://api.waifu.im/search?is_nsfw=false');
      if (!res.ok) throw new Error('waifu.im failed');
      const data = await res.json();
      if (!data.images?.[0]?.url) throw new Error('No URL in waifu.im');
      return data.images[0].url;
    }
  ];

  // Shuffle fetchers so we don't always hit the same API first
  fetchers.sort(() => Math.random() - 0.5);

  let lastError;
  for (const fetcher of fetchers) {
    try {
      const url = await fetcher();
      return url;
    } catch (err) {
      lastError = err;
      console.warn('Anime API fallback triggered:', err);
    }
  }

  // Absolute last resort hardcoded known-working anime images
  const fallbacks = [
    'https://nekos.best/api/v2/waifu/0001.png',
    'https://nekos.best/api/v2/neko/0001.png',
    'https://nekos.best/api/v2/kitsune/0001.png',
    'https://nekos.best/api/v2/husbando/0001.png'
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getAnimeGif = async (category: string = 'dance'): Promise<string> => {
  return fetchAnimeImage('character');
};

export const getWallpaperUrl = async (): Promise<string> => {
  return fetchAnimeImage('background');
};

export const getBackgroundUrl = async (level: number): Promise<string> => {
  return getWallpaperUrl();
};

export const generateImage = async (prompt: string): Promise<string> => {
  const isCastle = prompt.toLowerCase().includes('castle');
  return fetchAnimeImage(isCastle ? 'castle' : 'enemy');
};

export const generateStageAssets = async (level: number) => {
  const [playerCastle, enemyCastle, slime, knight, dragon, ghost, golem] = await Promise.all([
    fetchAnimeImage('castle'),
    fetchAnimeImage('castle'),
    fetchAnimeImage('enemy'),
    fetchAnimeImage('enemy'),
    fetchAnimeImage('enemy'),
    fetchAnimeImage('enemy'),
    fetchAnimeImage('enemy'),
  ]);

  return {
    playerCastle,
    enemyCastle,
    enemies: [slime, knight, dragon, ghost, golem]
  };
};

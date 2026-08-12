import { Howl } from 'howler';

const soundUrls = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  summon: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  lose: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3',
  bgm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
};

export const sounds = {
  click: new Howl({ src: [soundUrls.click] }),
  summon: new Howl({ src: [soundUrls.summon] }),
  hit: new Howl({ src: [soundUrls.hit], pool: 10 }), // Increase pool for frequent sounds
  win: new Howl({ src: [soundUrls.win] }),
  lose: new Howl({ src: [soundUrls.lose] }),
  bgm: new Howl({ 
    src: [soundUrls.bgm],
    loop: true,
    volume: 0.3,
    html5: true // BGM is long, HTML5 is better for streaming
  })
};

const lastPlayTime: Record<string, number> = {};
const MIN_INTERVAL = 50; // ms between same sound

export const playSound = (name: keyof typeof sounds) => {
  const now = Date.now();
  if (name === 'hit') {
    // Stricter rate limit for hit sounds to prevent pool exhaustion
    if (lastPlayTime[name] && now - lastPlayTime[name] < 100) return;
  } else if (lastPlayTime[name] && now - lastPlayTime[name] < MIN_INTERVAL) {
    return;
  }
  
  lastPlayTime[name] = now;
  sounds[name].play();
};

export const setGlobalVolume = (vol: number) => {
  Object.keys(sounds).forEach(key => {
    const sound = sounds[key as keyof typeof sounds];
    if (key === 'bgm') {
      sound.volume(vol * 0.3);
    } else {
      sound.volume(vol);
    }
  });
};

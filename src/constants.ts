import { Character, Enemy } from './types';

export const INITIAL_SAVE: any = {
  unlockedStages: 1,
  ownedCharacters: ['char_1'], 
  ownedCharacterDetails: {
    'char_1': {
      id: 'char_1',
      name: 'Kurohime',
      rarity: 'Common',
      gifUrl: 'https://nekos.best/api/v2/waifu/0001.png',
      hp: 150,
      attack: 20,
      range: 40,
      speed: 2,
      cost: 50,
      cooldown: 2,
      attackRate: 1.5,
    }
  },
  team: ['char_1', null, null, null, null],
  currency: 500,
  settings: {
    volume: 0.5,
    musicVolume: 0.3,
  },
};

export const BASE_HP = 1000;
export const MONEY_GROWTH_RATE = 2; // per second
export const BATTLEFIELD_WIDTH = 1000;
export const SPAWN_X_PLAYER = 100;
export const SPAWN_X_ENEMY = 900;

export const STARTER_CHARACTERS: Character[] = [
  {
    id: 'char_1',
    name: 'Kurohime',
    rarity: 'Common',
    gifUrl: 'https://nekos.best/api/v2/waifu/0001.png',
    hp: 150,
    attack: 20,
    range: 40,
    speed: 2,
    cost: 50,
    cooldown: 2,
    attackRate: 1.5,
  },
  {
    id: 'char_2',
    name: 'Akamaru',
    rarity: 'Rare',
    gifUrl: 'https://nekos.best/api/v2/husbando/0001.png',
    hp: 100,
    attack: 45,
    range: 150,
    speed: 1.5,
    cost: 150,
    cooldown: 5,
    attackRate: 2.5,
  }
];

export const ENEMIES: Enemy[] = [
  {
    id: 'enemy_1',
    name: 'Shadow Slime',
    gifUrl: 'https://nekos.best/api/v2/kitsune/0001.png',
    hp: 100,
    attack: 10,
    range: 30,
    speed: 1.5,
    reward: 20,
    attackRate: 2,
  },
  {
    id: 'enemy_2',
    name: 'Dark Knight',
    gifUrl: 'https://nekos.best/api/v2/neko/0001.png',
    hp: 300,
    attack: 30,
    range: 50,
    speed: 1,
    reward: 50,
    attackRate: 2.5,
  },
  {
    id: 'enemy_3',
    name: 'Dragon Emperor',
    gifUrl: 'https://nekos.best/api/v2/kitsune/0002.png',
    hp: 1000,
    attack: 80,
    range: 200,
    speed: 0.5,
    reward: 200,
    attackRate: 4,
  },
  {
    id: 'enemy_4',
    name: 'Ghost Assassin',
    gifUrl: 'https://nekos.best/api/v2/husbando/0002.png',
    hp: 80,
    attack: 40,
    range: 40,
    speed: 2.5,
    reward: 40,
    attackRate: 1.2,
  },
  {
    id: 'enemy_5',
    name: 'Ice Golem',
    gifUrl: 'https://nekos.best/api/v2/waifu/0002.png',
    hp: 600,
    attack: 20,
    range: 60,
    speed: 0.8,
    reward: 80,
    attackRate: 3,
  }
];

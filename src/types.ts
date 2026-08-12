/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Screen = 'TITLE' | 'HOME' | 'STAGE_SELECT' | 'GACHA' | 'GAME' | 'SETTINGS' | 'HOW_TO_PLAY' | 'TEAM_MANAGEMENT';

export interface Character {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Super Rare' | 'Legendary';
  gifUrl: string;
  hp: number;
  attack: number;
  range: number;
  speed: number;
  cost: number;
  cooldown: number; // in seconds
  attackRate: number; // in seconds
}

export interface Enemy {
  id: string;
  name: string;
  gifUrl: string;
  hp: number;
  attack: number;
  range: number;
  speed: number;
  reward: number;
  attackRate: number;
}

export interface GameState {
  money: number;
  maxMoney: number;
  baseHp: number;
  enemyBaseHp: number;
  units: ActiveUnit[];
  enemies: ActiveEnemy[];
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  world: number;
  timeLeft: number;
  maxTime: number;
  cooldowns: Record<string, number>;
}

export interface ActiveUnit {
  instanceId: string;
  charId: string;
  x: number;
  hp: number;
  lastAttackTime: number;
  state: 'WALKING' | 'ATTACKING' | 'IDLE';
}

export interface ActiveEnemy {
  instanceId: string;
  enemyId: string;
  x: number;
  hp: number;
  lastAttackTime: number;
  state: 'WALKING' | 'ATTACKING' | 'IDLE';
  gifUrl?: string;
}

export interface SaveData {
  unlockedStages: number;
  ownedCharacters: string[];
  ownedCharacterDetails: Record<string, Character>;
  team: (string | null)[];
  currency: number;
  settings: {
    volume: number;
    musicVolume: number;
  };
}

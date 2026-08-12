import { SaveData } from '../types';
import { INITIAL_SAVE } from '../constants';

const SAVE_KEY = 'anime_battle_frontier_save';

export const saveGame = (data: SaveData) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
};

export const loadGame = (): SaveData => {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return INITIAL_SAVE;
  try {
    const data = JSON.parse(saved);
    return {
      ...INITIAL_SAVE,
      ...data,
      ownedCharacterDetails: data.ownedCharacterDetails || INITIAL_SAVE.ownedCharacterDetails
    };
  } catch {
    return INITIAL_SAVE;
  }
};

export const exportSave = (data: SaveData) => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'save.sav';
  a.click();
  URL.revokeObjectURL(url);
};

export const importSave = (file: File): Promise<SaveData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

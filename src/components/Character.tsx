import { Character } from '../types';

export const CharacterStats = ({ char }: { char: Character }) => (
  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
    <h4 className="font-bold text-emerald-400">{char.name}</h4>
    <div className="grid grid-cols-2 gap-2 text-xs opacity-50">
      <span>HP: {char.hp}</span>
      <span>ATK: {char.attack}</span>
      <span>SPD: {char.speed}</span>
      <span>COST: {char.cost}</span>
    </div>
  </div>
);

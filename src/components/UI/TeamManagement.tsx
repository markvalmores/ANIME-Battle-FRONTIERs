import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SaveData, Character } from '../../types';
import { AnimeCharacter } from '../Anime';
import { playSound } from '../../services/audio';
import { STARTER_CHARACTERS } from '../../constants';
import { ChevronLeft, Trash2, Plus, Minus, Coins, Search } from 'lucide-react';

export default function TeamManagement({ 
  saveData, 
  onUpdateSave, 
  onBack 
}: { 
  saveData: SaveData; 
  onUpdateSave: (d: Partial<SaveData>) => void;
  onBack: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const rarityWeight: Record<string, number> = {
    'Legendary': 4,
    'Super Rare': 3,
    'Rare': 2,
    'Common': 1
  };

  const allCharacters = [
    ...STARTER_CHARACTERS,
    ...Object.values(saveData.ownedCharacterDetails).filter(c => !STARTER_CHARACTERS.find(sc => sc.id === c.id))
  ].sort((a, b) => {
    const weightA = rarityWeight[a.rarity] || 0;
    const weightB = rarityWeight[b.rarity] || 0;
    if (weightB !== weightA) return weightB - weightA;
    return a.name.localeCompare(b.name);
  }).filter(char => char.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleTeamMember = (charId: string) => {
    playSound('click');
    const currentTeam = [...saveData.team];
    const index = currentTeam.indexOf(charId);

    if (index !== -1) {
      // Remove from team
      currentTeam[index] = null;
    } else {
      // Add to team if there's an empty slot
      const emptySlot = currentTeam.indexOf(null);
      if (emptySlot !== -1) {
        currentTeam[emptySlot] = charId;
      } else {
        alert("Team is full! Remove someone first.");
        return;
      }
    }
    onUpdateSave({ team: currentTeam });
  };

  const raritySellPrices: Record<string, number> = {
    'Legendary': 2000,
    'Super Rare': 500,
    'Rare': 150,
    'Common': 50
  };

  const sellCharacter = (charId: string) => {
    const char = saveData.ownedCharacterDetails[charId];
    if (!char || STARTER_CHARACTERS.find(c => c.id === charId)) {
      alert("Cannot sell starter characters!");
      return;
    }

    const price = raritySellPrices[char.rarity] || 50;

    if (confirm(`Are you sure you want to sell ${char.name} (${char.rarity}) for ${price} coins?`)) {
      playSound('click');
      const newOwnedIds = saveData.ownedCharacters.filter(id => id !== charId);
      const newDetails = { ...saveData.ownedCharacterDetails };
      delete newDetails[charId];
      
      const newTeam = saveData.team.map(id => id === charId ? null : id);

      onUpdateSave({
        ownedCharacters: newOwnedIds,
        ownedCharacterDetails: newDetails,
        team: newTeam,
        currency: saveData.currency + price
      });
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 p-12 flex flex-col">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft />
          </button>
          <h2 className="text-4xl font-bold italic">TEAM <span className="text-emerald-400">MANAGEMENT</span></h2>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <Coins className="text-yellow-400" />
          <span className="text-2xl font-mono font-bold">{saveData.currency}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 flex-1 overflow-hidden">
        {/* Current Team */}
        <div className="flex flex-col gap-6">
          <h3 className="text-white/30 uppercase text-xs font-bold tracking-widest">ACTIVE TEAM</h3>
          <div className="grid grid-cols-1 gap-4">
            {saveData.team.map((charId, i) => {
              const char = charId ? (saveData.ownedCharacterDetails[charId] || STARTER_CHARACTERS.find(c => c.id === charId)) : null;
              return (
                <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
                  {char ? (
                    <>
                      <AnimeCharacter url={char.gifUrl} className="w-16 h-16 object-contain" />
                      <div className="flex-1">
                        <div className="font-bold">{char.name}</div>
                        <div className="text-xs text-white/50 uppercase">{char.rarity}</div>
                      </div>
                      <button 
                        onClick={() => toggleTeamMember(char.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Minus size={20} />
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-xl h-full">
                      EMPTY SLOT
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Collection */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-white/30 uppercase text-xs font-bold tracking-widest">COLLECTION ({allCharacters.length})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                type="text"
                placeholder="Search heroes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors w-64"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-4 pb-12">
            {allCharacters.map((char) => {
              const isInTeam = saveData.team.includes(char.id);
              return (
                <motion.div 
                  key={char.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white/5 border rounded-2xl p-4 flex flex-col gap-4 relative transition-all ${isInTeam ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`}
                >
                  <div className="flex justify-between items-start">
                    <AnimeCharacter url={char.gifUrl} className="w-16 h-16 object-contain" />
                    <div className={`text-[10px] font-bold px-2 py-1 rounded bg-white/10 ${
                      char.rarity === 'Legendary' ? 'text-yellow-400' : 
                      char.rarity === 'Super Rare' ? 'text-purple-400' : 
                      'text-emerald-400'
                    }`}>
                      {char.rarity}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold truncate">{char.name}</div>
                    <div className="text-[10px] text-white/30 font-mono">HP: {char.hp} | ATK: {char.attack}</div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => toggleTeamMember(char.id)}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                        isInTeam ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                      }`}
                    >
                      {isInTeam ? 'REMOVE' : 'ADD TO TEAM'}
                    </button>
                    {!STARTER_CHARACTERS.find(sc => sc.id === char.id) && (
                      <button 
                        onClick={() => sellCharacter(char.id)}
                        title={`Sell for ${raritySellPrices[char.rarity] || 50} coins`}
                        className="p-2 bg-white/5 text-white/50 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors group relative"
                      >
                        <Trash2 size={16} />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10">
                          SELL: {raritySellPrices[char.rarity] || 50}
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

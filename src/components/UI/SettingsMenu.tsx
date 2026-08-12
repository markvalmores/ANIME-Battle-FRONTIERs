import React from 'react';
import { SaveData } from '../../types';
import { playSound } from '../../services/audio';
import { exportSave, importSave } from '../../services/saveSystem';
import { ChevronLeft, Volume2, Download, Upload, Trash2 } from 'lucide-react';

export default function SettingsMenu({ 
  saveData, 
  onUpdateSave, 
  onBack 
}: { 
  saveData: SaveData; 
  onUpdateSave: (d: Partial<SaveData>) => void;
  onBack: () => void;
}) {
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await importSave(file);
        onUpdateSave(data);
        alert("Save data imported successfully!");
      } catch {
        alert("Failed to import save data.");
      }
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 p-12 flex flex-col">
      <div className="flex items-center gap-4 mb-12">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="text-4xl font-bold italic">SYSTEM <span className="text-emerald-400">SETTINGS</span></h2>
      </div>

      <div className="max-w-2xl w-full mx-auto flex flex-col gap-12">
        {/* Audio */}
        <section>
          <h3 className="text-white/30 uppercase text-xs font-bold tracking-widest mb-6 flex items-center gap-2">
            <Volume2 size={14} /> AUDIO CONTROL
          </h3>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-sm font-bold">
                <span>MASTER VOLUME</span>
                <span>{Math.round(saveData.settings.volume * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={saveData.settings.volume}
                onChange={(e) => onUpdateSave({ settings: { ...saveData.settings, volume: parseFloat(e.target.value) } })}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-white/30 uppercase text-xs font-bold tracking-widest mb-6 flex items-center gap-2">
            DATA MANAGEMENT
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => exportSave(saveData)}
              className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all font-bold"
            >
              <Download size={20} /> EXPORT SAVE (.SAV)
            </button>
            <label className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all font-bold cursor-pointer">
              <Upload size={20} /> IMPORT SAVE
              <input type="file" accept=".sav,.json" onChange={handleImport} className="hidden" />
            </label>
            <button 
              onClick={() => {
                if(confirm("Are you sure? This will permanently delete your progress.")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="col-span-2 flex items-center justify-center gap-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl hover:bg-red-500/20 transition-all font-bold"
            >
              <Trash2 size={20} /> WIPE ALL DATA
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

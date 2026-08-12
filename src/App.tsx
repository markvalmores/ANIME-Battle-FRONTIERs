import React, { useState, useEffect, useCallback } from 'react';
import { Screen, SaveData } from './types';
import { loadGame, saveGame } from './services/saveSystem';
import TitleScreen from './components/UI/TitleScreen';
import HomeScreen from './components/UI/HomeScreen';
import StageSelect from './components/UI/StageSelect';
import GachaScreen from './components/UI/GachaScreen';
import Game from './components/Game/Game';
import SettingsMenu from './components/UI/SettingsMenu';
import HowToPlay from './components/UI/HowToPlay';
import TeamManagement from './components/UI/TeamManagement';
import { sounds, setGlobalVolume } from './services/audio';

export default function App() {
  const [screen, setScreen] = useState<Screen>('TITLE');
  const [saveData, setSaveData] = useState<SaveData>(loadGame());
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    setGlobalVolume(saveData.settings.volume);
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      saveGame(saveData);
    }, 30000);
    return () => clearInterval(interval);
  }, [saveData]);

  const updateSave = useCallback((newData: Partial<SaveData>) => {
    setSaveData(prev => {
      const updated = { ...prev, ...newData };
      saveGame(updated);
      return updated;
    });
  }, []);

  const handleLevelComplete = () => {
    const nextLevel = currentLevel + 1;
    const newUnlocked = Math.max(saveData.unlockedStages, nextLevel);
    updateSave({ 
      unlockedStages: newUnlocked,
      currency: saveData.currency + 100 // Reward
    });
    setScreen('STAGE_SELECT');
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden font-sans select-none">
      {screen === 'TITLE' && <TitleScreen onStart={() => setScreen('HOME')} />}
      {screen === 'HOME' && (
        <HomeScreen 
          saveData={saveData}
          onNavigate={setScreen} 
          onNewGame={() => {
            const fresh = { ...saveData, unlockedStages: 1, currency: 500 };
            setSaveData(fresh);
            saveGame(fresh);
            setScreen('STAGE_SELECT');
          }}
        />
      )}
      {screen === 'STAGE_SELECT' && (
        <StageSelect 
          unlocked={saveData.unlockedStages} 
          onSelect={(lvl) => {
            setCurrentLevel(lvl);
            setScreen('GAME');
          }}
          onBack={() => setScreen('HOME')}
        />
      )}
      {screen === 'GACHA' && (
        <GachaScreen 
          saveData={saveData} 
          onUpdateSave={updateSave}
          onBack={() => setScreen('HOME')} 
        />
      )}
      {screen === 'TEAM_MANAGEMENT' && (
        <TeamManagement 
          saveData={saveData} 
          onUpdateSave={updateSave}
          onBack={() => setScreen('HOME')} 
        />
      )}
      {screen === 'GAME' && (
        <Game 
          level={currentLevel} 
          saveData={saveData}
          onUpdateSave={updateSave}
          onComplete={handleLevelComplete}
          onExit={() => setScreen('STAGE_SELECT')}
        />
      )}
      {screen === 'SETTINGS' && (
        <SettingsMenu 
          saveData={saveData} 
          onUpdateSave={updateSave}
          onBack={() => setScreen('HOME')} 
        />
      )}
      {screen === 'HOW_TO_PLAY' && <HowToPlay onBack={() => setScreen('HOME')} />}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, SaveData, ActiveUnit, ActiveEnemy, Character, Enemy } from '../../types';
import { playSound, sounds } from '../../services/audio';
import { BATTLEFIELD_WIDTH, SPAWN_X_PLAYER, SPAWN_X_ENEMY, BASE_HP, STARTER_CHARACTERS, ENEMIES } from '../../constants';
import { getBackgroundUrl, generateStageAssets } from '../../services/api';
import { AnimeBackground, AnimeCharacter, AnimeCastle, AnimeGround, SafeAnimeImage } from '../Anime';
import { Coins, Heart, Pause, Play, Home, RefreshCcw, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Game({ 
  level, 
  saveData, 
  onUpdateSave,
  onComplete, 
  onExit 
}: { 
  level: number; 
  saveData: SaveData; 
  onUpdateSave: (d: Partial<SaveData>) => void;
  onComplete: () => void; 
  onExit: () => void;
}) {
  const [state, setState] = useState<GameState>({
    money: 100,
    maxMoney: 1000,
    baseHp: BASE_HP,
    enemyBaseHp: BASE_HP + (level * 200),
    units: [],
    enemies: [],
    isGameOver: false,
    isPaused: false,
    level,
    world: Math.floor(level / 10) + 1,
    timeLeft: 180, // 3 minutes
    maxTime: 180,
    cooldowns: {}
  });

  const gameLoopRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());
  const gameOverTriggered = useRef<boolean>(false);
  const [bgUrl, setBgUrl] = useState<string>('');
  const [stageAssets, setStageAssets] = useState<{ playerCastle: string, enemyCastle: string, enemies: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0, distance: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panX, y: panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(panStartRef.current.x + dx);
    setPanY(panStartRef.current.y + dy);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      panStartRef.current = { x: panX, y: panY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchStartRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance
      };
      panStartRef.current = { x: panX, y: panY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      setPanX(panStartRef.current.x + dx);
      setPanY(panStartRef.current.y + dy);
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      
      const factor = distance / touchStartRef.current.distance;
      const newZoom = Math.min(2.5, Math.max(0.3, zoom * factor));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = 1.1;
    let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    newZoom = Math.min(2.5, Math.max(0.3, newZoom));
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - panX;
    const dy = mouseY - panY;
    const ratio = newZoom / zoom;

    setPanX(mouseX - dx * ratio);
    setPanY(mouseY - dy * ratio);
    setZoom(newZoom);
  };

  const handleZoomIn = () => {
    setZoom(z => Math.min(2.5, z * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(0.3, z / 1.2));
  };

  const handleResetView = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fitZoom = Math.min(rect.width / BATTLEFIELD_WIDTH, rect.height / 420);
    setZoom(fitZoom);
    setPanX((rect.width - BATTLEFIELD_WIDTH * fitZoom) / 2);
    setPanY((rect.height - 420 * fitZoom) / 2);
  };

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const fitZoom = Math.min(rect.width / BATTLEFIELD_WIDTH, rect.height / 420);
      setZoom(fitZoom);
      setPanX((rect.width - BATTLEFIELD_WIDTH * fitZoom) / 2);
      setPanY((rect.height - 420 * fitZoom) / 2);
    };

    window.addEventListener('resize', handleResize);
    if (!isGenerating) {
      setTimeout(handleResize, 150);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [isGenerating]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const [bg, assets] = await Promise.all([
          getBackgroundUrl(level),
          generateStageAssets(level)
        ]);
        setBgUrl(bg);
        setStageAssets(assets);
      } catch (error) {
        console.error("Failed to load stage assets:", error);
      } finally {
        setIsGenerating(false);
      }
    };
    loadAssets();
    gameOverTriggered.current = false;
  }, [level]);

  // Handle Game Over Side Effects
  useEffect(() => {
    if (state.isGameOver && !gameOverTriggered.current) {
      gameOverTriggered.current = true;
      if (state.enemyBaseHp <= 0) {
        playSound('win');
        confetti();
        onUpdateSave({
          unlockedStages: Math.max(saveData.unlockedStages, level + 1),
          currency: saveData.currency + 100 + (level * 20)
        });
      } else {
        playSound('lose');
      }
    }
  }, [state.isGameOver, state.enemyBaseHp, level, onUpdateSave, saveData.unlockedStages, saveData.currency]);

  // Game Loop
  useEffect(() => {
    const loop = () => {
      if (state.isPaused || state.isGameOver) return;

      const now = Date.now();
      const dt = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      updateGame(dt);
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [state.isPaused, state.isGameOver]);

  // Enemy Spawning Logic (Improved AI)
  useEffect(() => {
    if (state.isPaused || state.isGameOver) return;
    
    const aiBrain = setInterval(() => {
      // AI Logic: Spawn based on player presence or budget
      const playerUnitCount = state.units.length;
      const enemyUnitCount = state.enemies.length;
      
      // If player has more units, spawn more aggressively
      const shouldSpawn = enemyUnitCount < playerUnitCount + 1 || Math.random() > 0.7;
      
      if (shouldSpawn) {
        // Budget increases with level
        const possibleEnemies = ENEMIES.filter(e => {
          if (level < 3) return e.id === 'enemy_1';
          if (level < 6) return ['enemy_1', 'enemy_4'].includes(e.id);
          if (level < 10) return e.id !== 'enemy_3';
          return true;
        });
        const enemyType = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
        spawnEnemy(enemyType);
      }
    }, Math.max(1500, 4000 - level * 100));

    return () => clearInterval(aiBrain);
  }, [state.isPaused, state.isGameOver, level, state.units.length, state.enemies.length]);

  const spawnUnit = (charId: string) => {
    const char = saveData.ownedCharacterDetails[charId] || STARTER_CHARACTERS.find(c => c.id === charId);
    if (!char || state.money < char.cost || state.cooldowns[charId] > 0) return;

    playSound('summon');
    setState(prev => ({
      ...prev,
      money: prev.money - char.cost,
      cooldowns: { ...prev.cooldowns, [charId]: char.cooldown },
      units: [...prev.units, {
        instanceId: Math.random().toString(36),
        charId,
        x: SPAWN_X_PLAYER,
        hp: char.hp,
        lastAttackTime: 0,
        state: 'WALKING'
      }]
    }));
  };

  const spawnEnemy = (enemy: Enemy) => {
    // Use generated asset if available
    let gifUrl = enemy.gifUrl;
    if (stageAssets) {
      const index = ENEMIES.findIndex(e => e.id === enemy.id);
      if (index !== -1 && stageAssets.enemies[index]) {
        gifUrl = stageAssets.enemies[index];
      }
    }

    setState(prev => ({
      ...prev,
      enemies: [...prev.enemies, {
        instanceId: Math.random().toString(36),
        enemyId: enemy.id,
        x: SPAWN_X_ENEMY,
        hp: enemy.hp,
        lastAttackTime: 0,
        state: 'WALKING',
        gifUrl // Pass the custom gifUrl
      }]
    }));
  };

  const updateGame = (dt: number) => {
    const now = Date.now();
    setState(prev => {
      if (prev.isGameOver || prev.isPaused) return prev;

      let nextMoney = Math.min(prev.maxMoney, prev.money + dt * 10);
      let nextUnits = [...prev.units];
      let nextEnemies = [...prev.enemies];
      let nextBaseHp = prev.baseHp;
      let nextEnemyBaseHp = prev.enemyBaseHp;
      let nextTimeLeft = Math.max(0, prev.timeLeft - dt);
      let nextCooldowns = { ...prev.cooldowns };

      // Update Cooldowns
      Object.keys(nextCooldowns).forEach(k => {
        nextCooldowns[k] = Math.max(0, nextCooldowns[k] - dt);
      });

      // Combat Phase: Units attack Enemies and Base
      nextUnits = nextUnits.map(unit => {
        const char = saveData.ownedCharacterDetails[unit.charId] || STARTER_CHARACTERS.find(c => c.id === unit.charId)!;
        const newUnit = { ...unit };
        if (now - newUnit.lastAttackTime > char.attackRate * 1000) {
          // Check for Enemy first
          const targetIndex = nextEnemies.findIndex(e => e.x > newUnit.x && e.x < newUnit.x + char.range + 35);
          if (targetIndex !== -1) {
            const target = { ...nextEnemies[targetIndex] };
            target.hp -= char.attack * 2;
            nextEnemies[targetIndex] = target;
            newUnit.lastAttackTime = now;
            playSound('hit');
          } else if (newUnit.x + char.range >= SPAWN_X_ENEMY - 25) {
            // Attack Base only if no enemies are in range
            nextEnemyBaseHp = Math.max(0, nextEnemyBaseHp - char.attack * 2);
            newUnit.lastAttackTime = now;
            playSound('hit');
          }
        }
        return newUnit;
      });

      // Combat Phase: Enemies attack Units and Base
      nextEnemies = nextEnemies.map(enemy => {
        const enemyType = ENEMIES.find(e => e.id === enemy.enemyId)!;
        const newEnemy = { ...enemy };
        if (now - newEnemy.lastAttackTime > enemyType.attackRate * 1000) {
          // Attack Base (Generous range)
          if (newEnemy.x - enemyType.range <= SPAWN_X_PLAYER + 25) {
            nextBaseHp = Math.max(0, nextBaseHp - enemyType.attack * 0.5); // Half enemy damage for "easy"
            newEnemy.lastAttackTime = now;
            playSound('hit');
          } else {
            // Attack Unit
            const targetIndex = nextUnits.findIndex(u => u.x < newEnemy.x && u.x > newEnemy.x - enemyType.range - 35);
            if (targetIndex !== -1) {
              const target = { ...nextUnits[targetIndex] };
              target.hp -= enemyType.attack * 0.5;
              nextUnits[targetIndex] = target;
              newEnemy.lastAttackTime = now;
              playSound('hit');
            }
          }
        }
        return newEnemy;
      });

      // Movement Phase
      nextUnits = nextUnits.map(unit => {
        const char = saveData.ownedCharacterDetails[unit.charId] || STARTER_CHARACTERS.find(c => c.id === unit.charId)!;
        const isBlocked = nextEnemies.some(e => e.x > unit.x && e.x < unit.x + char.range + 5) || (unit.x + char.range >= SPAWN_X_ENEMY);
        
        if (isBlocked) {
          return { ...unit, state: 'ATTACKING' };
        }
        const moveSpeed = char.speed * 35; 
        return { ...unit, x: Math.min(SPAWN_X_ENEMY - char.range, unit.x + moveSpeed * dt), state: 'WALKING' };
      }).filter(u => u.hp > 0);

      nextEnemies = nextEnemies.map(enemy => {
        const enemyType = ENEMIES.find(e => e.id === enemy.enemyId)!;
        const isBlocked = nextUnits.some(u => u.x < enemy.x && u.x > enemy.x - enemyType.range - 5) || (enemy.x - enemyType.range <= SPAWN_X_PLAYER);

        if (isBlocked) {
          return { ...enemy, state: 'ATTACKING' };
        }
        const moveSpeed = enemyType.speed * 35;
        return { ...enemy, x: Math.max(SPAWN_X_PLAYER + enemyType.range, enemy.x - moveSpeed * dt), state: 'WALKING' };
      }).filter(e => e.hp > 0);

      // Check Game Over
      let isGameOver = prev.isGameOver;
      if (nextBaseHp <= 0 || nextTimeLeft <= 0) {
        isGameOver = true;
      }
      if (nextEnemyBaseHp <= 0) {
        isGameOver = true;
      }

      return {
        ...prev,
        money: nextMoney,
        units: nextUnits,
        enemies: nextEnemies,
        baseHp: nextBaseHp,
        enemyBaseHp: nextEnemyBaseHp,
        timeLeft: nextTimeLeft,
        isGameOver,
        cooldowns: nextCooldowns
      };
    });
  };

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Battlefield Viewport Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Dynamic self-healing Wallpaper Background (Static layer, does not transform) */}
        <AnimeBackground level={level} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        
        {/* Zoom/Pan Interactive Indicators */}
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-[11px]">
          <button 
            onClick={handleZoomOut}
            className="px-2 py-1 bg-white/5 hover:bg-white/15 rounded text-white font-bold transition-colors"
          >
            ZOOM -
          </button>
          <span className="font-mono px-1 font-bold text-emerald-400">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={handleZoomIn}
            className="px-2 py-1 bg-white/5 hover:bg-white/15 rounded text-white font-bold transition-colors"
          >
            ZOOM +
          </button>
          <button 
            onClick={handleResetView}
            className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded font-bold transition-colors"
          >
            RESET
          </button>
        </div>

        {/* View Instructions for Users */}
        <div className="absolute bottom-4 left-4 z-30 text-[10px] text-white/40 pointer-events-none hidden sm:block">
          Drag/Swipe to Pan ↔ ↕ | Scroll / Pinch to Zoom
        </div>

        {/* Interactive Game World Stage (Pans & Zooms dynamically) */}
        <div 
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${BATTLEFIELD_WIDTH}px`,
            height: '420px',
            position: 'absolute',
            top: '0',
            left: '0',
          }}
          className="transition-transform duration-75 ease-out"
        >
          {/* Ground layer inside the scaling world */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <AnimeGround level={level} />
          </div>
          
          {/* Bases */}
          <Base x={SPAWN_X_PLAYER} hp={state.baseHp} maxHp={BASE_HP} level={level} isPlayer customUrl={stageAssets?.playerCastle} />
          <Base x={SPAWN_X_ENEMY} hp={state.enemyBaseHp} maxHp={BASE_HP + (level * 200)} level={level} customUrl={stageAssets?.enemyCastle} />

          {/* Units */}
          {state.units.map(u => (
            <UnitView key={u.instanceId} unit={u} char={saveData.ownedCharacterDetails[u.charId] || STARTER_CHARACTERS.find(c => c.id === u.charId)!} />
          ))}
          {state.enemies.map(e => (
            <EnemyView key={e.instanceId} enemy={e} enemyType={ENEMIES.find(et => et.id === e.enemyId)!} />
          ))}
        </div>

        {/* HUD Overlay (Static layer, does not transform) */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="text-2xl font-black italic">STAGE {level}</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Coins className="text-yellow-400" size={20} />
                <span className="text-xl font-mono font-bold">{Math.floor(state.money)}</span>
              </div>
              <div className={`flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 ${state.timeLeft < 30 ? 'text-red-500 animate-pulse' : ''}`}>
                <Clock size={20} />
                <span className="text-xl font-mono font-bold">{Math.floor(state.timeLeft / 60)}:{(Math.floor(state.timeLeft % 60)).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setState(s => ({ ...s, isPaused: !s.isPaused }))}
            className="p-4 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
          >
            {state.isPaused ? <Play /> : <Pause />}
          </button>
        </div>
      </div>

      {/* Controls: Responsive flex-wrap and horizontal scrolling for narrow or portrait screens */}
      <div className="h-32 sm:h-40 bg-zinc-900 border-t border-white/10 p-2 sm:p-4 flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none items-center justify-start md:justify-center">
        {saveData.team.map((charId, i) => {
          const char = charId ? (saveData.ownedCharacterDetails[charId] || STARTER_CHARACTERS.find(c => c.id === charId)) : null;
          if (!char) return <div key={i} className="w-20 h-24 sm:w-28 sm:h-32 shrink-0 bg-white/5 rounded-xl sm:rounded-2xl border border-dashed border-white/10" />;
          
          const cd = state.cooldowns[char.id] || 0;
          const canAfford = state.money >= char.cost;
          const isReady = cd === 0 && canAfford;
 
          return (
            <motion.button
              key={i}
              whileTap={isReady ? { scale: 0.95 } : {}}
              onClick={() => spawnUnit(char.id)}
              disabled={!isReady}
              className={`w-20 h-24 sm:w-28 sm:h-32 shrink-0 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-between p-1.5 sm:p-2.5 relative overflow-hidden transition-all ${
                isReady ? 'bg-white/10 border-emerald-500/50 cursor-pointer' : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Cooldown Overlay */}
              {cd > 0 && (
                <div 
                  className="absolute bottom-0 left-0 w-full bg-emerald-500/20 transition-all"
                  style={{ height: `${(cd / char.cooldown) * 100}%` }}
                />
              )}
              
              <SafeAnimeImage src={char.gifUrl} category="character" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
              <div className="text-center w-full">
                <div className="text-[8px] sm:text-[9px] font-bold uppercase opacity-50 truncate">{char.name}</div>
                <div className="text-[10px] sm:text-xs font-bold text-emerald-400">${char.cost}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {state.isPaused && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-8"
          >
            <h2 className="text-6xl font-black italic">PAUSED</h2>
            <div className="flex gap-4">
              <GameButton icon={<Play />} label="RESUME" onClick={() => setState(s => ({ ...s, isPaused: false }))} />
              <GameButton icon={<Home />} label="MENU" onClick={onExit} />
            </div>
          </motion.div>
        )}

        {state.isGameOver && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center gap-8"
          >
            <h2 className={`text-8xl font-black italic ${state.enemyBaseHp <= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
              {state.enemyBaseHp <= 0 ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <div className="flex gap-4">
              {state.enemyBaseHp <= 0 ? (
                <GameButton icon={<Play />} label="NEXT STAGE" onClick={onComplete} primary />
              ) : (
                <GameButton icon={<RefreshCcw />} label="RETRY" onClick={() => window.location.reload()} />
              )}
              <GameButton icon={<Home />} label="MENU" onClick={onExit} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Base({ x, hp, maxHp, level, isPlayer = false, customUrl }: { x: number, hp: number, maxHp: number, level: number, isPlayer?: boolean, customUrl?: string }) {
  const percent = Math.max(0, (hp / maxHp) * 100);
  return (
    <div 
      className="absolute bottom-24 flex flex-col items-center gap-4 transition-all z-10"
      style={{ left: `${(x / BATTLEFIELD_WIDTH) * 100}%`, transform: 'translateX(-50%)' }}
    >
      <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
        <div 
          className={`h-full transition-all duration-300 ${isPlayer ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <AnimeCastle isPlayer={isPlayer} level={level} customUrl={customUrl} className="w-32 h-64" />
    </div>
  );
}

function UnitView({ unit, char }: { unit: ActiveUnit, char: Character, key?: string }) {
  if (!char) return null;
  const isAttacking = unit.state === 'ATTACKING';
  
  return (
    <div 
      className="absolute bottom-24 z-20"
      style={{ 
        left: `${(unit.x / BATTLEFIELD_WIDTH) * 100}%`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="relative">
        {/* Health Bar */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={false}
            animate={{ width: `${(unit.hp / char.hp) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <motion.div
          animate={isAttacking ? {
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          } : {}}
          transition={isAttacking ? {
            duration: 0.3,
            repeat: Infinity,
            repeatType: "mirror"
          } : {}}
        >
          <AnimeCharacter 
            url={char.gifUrl} 
            className="w-24 h-24 object-contain" 
          />
        </motion.div>
        {/* Attack Flash */}
        {isAttacking && (
          <motion.div 
            className="absolute inset-0 bg-white rounded-full mix-blend-overlay"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}

function EnemyView({ enemy, enemyType }: { enemy: ActiveEnemy, enemyType: Enemy, key?: string }) {
  if (!enemyType) return null;
  const isAttacking = enemy.state === 'ATTACKING';

  return (
    <div 
      className="absolute bottom-24 z-20"
      style={{ 
        left: `${(enemy.x / BATTLEFIELD_WIDTH) * 100}%`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="relative">
        {/* Health Bar */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-red-500"
            initial={false}
            animate={{ width: `${(enemy.hp / enemyType.hp) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <motion.div
          animate={isAttacking ? {
            x: [0, -20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, -5, 0]
          } : {}}
          transition={isAttacking ? {
            duration: 0.3,
            repeat: Infinity,
            repeatType: "mirror"
          } : {}}
        >
          <AnimeCharacter 
            url={enemy.gifUrl || enemyType.gifUrl} 
            className="w-24 h-24 object-contain" 
            isEnemy
          />
        </motion.div>
        {/* Attack Flash */}
        {isAttacking && (
          <motion.div 
            className="absolute inset-0 bg-red-500 rounded-full mix-blend-overlay"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}

function GameButton({ icon, label, onClick, primary = false }: { icon: any, label: string, onClick: () => void, primary?: boolean }) {
  return (
    <button 
      onClick={() => { playSound('click'); onClick(); }}
      className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${
        primary ? 'bg-emerald-500 text-black hover:scale-105' : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

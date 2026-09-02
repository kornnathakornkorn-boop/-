/**
 * Neon Space Shooter - Arcade HTML5 Canvas 2D Game
 * Zero external libraries, Web Audio API procedural sound synthesizer, client-side only.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { ArcadeHUD } from './components/ArcadeHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { TopQuickGuide } from './components/TopQuickGuide';
import { 
  Achievement, GameSettings, GameState, HighScoreEntry, ShipType, WeaponType, Language 
} from './types';
import { DEFAULT_HIGH_SCORES, INITIAL_ACHIEVEMENTS, INITIAL_SETTINGS, SHIPS } from './game/constants';
import { sound } from './audio/soundEngine';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Language mode: default TH (Thai)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('neon_game_lang');
      return (saved === 'EN' || saved === 'TH') ? saved : 'TH';
    } catch {
      return 'TH';
    }
  });

  // App Game States
  const [gameState, setGameState] = useState<GameState>('START');
  const [pilotName, setPilotName] = useState<string>(() => {
    try {
      return localStorage.getItem('neon_pilot_name') || 'ACE';
    } catch {
      return 'ACE';
    }
  });
  const [selectedSector, setSelectedSector] = useState<number>(1);
  const [selectedShip, setSelectedShip] = useState<ShipType>('VIPER');

  // Unlocked Ships (5 Free + 1 Unlockable)
  const [unlockedShips, setUnlockedShips] = useState<ShipType[]>(() => {
    try {
      const saved = localStorage.getItem('neon_unlocked_ships');
      return saved ? JSON.parse(saved) : ['VIPER', 'PHANTOM', 'TITAN', 'AURORA', 'VALKYRIE'];
    } catch {
      return ['VIPER', 'PHANTOM', 'TITAN', 'AURORA', 'VALKYRIE'];
    }
  });

  // Total Lifetime Coins for Unlocks
  const [totalCoins, setTotalCoins] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('neon_total_coins') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Player & Session HUD stats
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [coins, setCoins] = useState(0);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [weaponType, setWeaponType] = useState<WeaponType>('BLASTER');
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [shield, setShield] = useState(100);
  const [maxShield, setMaxShield] = useState(100);
  const [lives, setLives] = useState(3);
  const [bombs, setBombs] = useState(3);
  const [overdrive, setOverdrive] = useState(0);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [wave, setWave] = useState(1);

  // Boss HUD stats
  const [bossActive, setBossActive] = useState(false);
  const [bossName, setBossName] = useState<string | undefined>(undefined);
  const [bossHealth, setBossHealth] = useState<number | undefined>(undefined);
  const [bossMaxHealth, setBossMaxHealth] = useState<number | undefined>(undefined);
  const [bossPhase, setBossPhase] = useState<number | undefined>(undefined);

  // Local storage persistence for high scores and achievements
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(() => {
    try {
      const saved = localStorage.getItem('neon_high_scores_list');
      return saved ? JSON.parse(saved) : DEFAULT_HIGH_SCORES;
    } catch {
      return DEFAULT_HIGH_SCORES;
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('neon_achievements_list');
      return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('neon_game_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Language toggle handler
  const handleToggleLanguage = useCallback(() => {
    sound.playUIClick();
    setLanguage((prev) => {
      const next = prev === 'TH' ? 'EN' : 'TH';
      localStorage.setItem('neon_game_lang', next);
      return next;
    });
  }, []);

  const handlePilotNameChange = (name: string) => {
    setPilotName(name);
    localStorage.setItem('neon_pilot_name', name);
  };

  // Achievement unlock trigger handler
  const handleUnlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const updated = prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          sound.playPowerup();
          return { ...ach, unlocked: true };
        }
        return ach;
      });
      localStorage.setItem('neon_achievements_list', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Initialize Canvas Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const initialConfig = SHIPS[selectedShip];
    setHealth(initialConfig.maxHealth);
    setMaxHealth(initialConfig.maxHealth);
    setShield(initialConfig.maxShield);
    setMaxShield(initialConfig.maxShield);

    const engine = new GameEngine(
      canvasRef.current,
      {
        onScoreUpdate: (newScore, newCombo, newMultiplier, newCoins) => {
          setScore(newScore);
          setCombo(newCombo);
          setMultiplier(newMultiplier);
          if (newCoins !== undefined) setCoins(newCoins);
        },
        onPlayerStatsUpdate: (curHp, maxHp, curShd, maxShd, curLives, curBombs, curOvd, isOvd, curCoins, curWpnLv, curWpnType) => {
          setHealth(curHp);
          setMaxHealth(maxHp);
          setShield(curShd);
          setMaxShield(maxShd);
          setLives(curLives);
          setBombs(curBombs);
          setOverdrive(curOvd);
          setIsOverdrive(isOvd);
          if (curCoins !== undefined) setCoins(curCoins);
          if (curWpnLv !== undefined) setWeaponLevel(curWpnLv);
          if (curWpnType !== undefined) setWeaponType(curWpnType);
        },
        onWaveUpdate: (curWave) => {
          setWave(curWave);
        },
        onBossStatus: (active, name, hp, maxHp, phase) => {
          setBossActive(active);
          setBossName(name);
          setBossHealth(hp);
          setBossMaxHealth(maxHp);
          setBossPhase(phase);
        },
        onGameOver: (finalScore, finalWave, finalCoins) => {
          if (finalCoins !== undefined) setCoins(finalCoins);
          setGameState('GAMEOVER');
        },
        onAchievementUnlock: handleUnlockAchievement
      },
      selectedShip
    );

    engine.applySettings(settings);
    engineRef.current = engine;

    // Load initial high score
    const currentHigh = highScores.length > 0 ? highScores[0].score : 0;
    setHighScore(currentHigh);

    // Responsive Canvas Resize Observer
    const handleResize = () => {
      engine.handleResize();
    };

    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      engine.cleanup();
    };
  }, [handleUnlockAchievement]);

  // Sync settings with engine & sound system
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.soundVolume, settings.musicVolume);
    if (engineRef.current) {
      engineRef.current.applySettings(settings);
    }
    localStorage.setItem('neon_game_settings', JSON.stringify(settings));
  }, [settings]);

  // Global Keyboard shortcut for Pause (P or Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'KeyP' || e.code === 'Escape') && gameState === 'PLAYING') {
        engineRef.current?.pause();
        setGameState('PAUSED');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState]);

  // Handlers for game flow
  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.restart(selectedShip, selectedSector);
    setGameState('PLAYING');
  };

  const handleResumeGame = () => {
    if (!engineRef.current) return;
    engineRef.current.resume();
    setGameState('PLAYING');
  };

  const handleRestartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.restart(selectedShip, selectedSector);
    setGameState('PLAYING');
  };

  const handleGoHome = () => {
    if (!engineRef.current) return;
    engineRef.current.cleanup();
    setGameState('START');
  };

  const handleSaveScore = (name: string, finalScore: number, finalWave: number, ship: ShipType, finalCoins?: number) => {
    const sessionCoins = finalCoins !== undefined ? finalCoins : coins;
    const nextTotalCoins = totalCoins + sessionCoins;
    setTotalCoins(nextTotalCoins);
    localStorage.setItem('neon_total_coins', nextTotalCoins.toString());

    const newEntry: HighScoreEntry = {
      name,
      score: finalScore,
      wave: finalWave,
      coins: sessionCoins,
      ship,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setHighScores(updated);
    localStorage.setItem('neon_high_scores_list', JSON.stringify(updated));
    if (updated.length > 0) {
      setHighScore(updated[0].score);
    }
  };

  const handleUnlockShip = (ship: ShipType, cost: number): boolean => {
    if (totalCoins >= cost) {
      const nextCoins = totalCoins - cost;
      const nextUnlocked = Array.from(new Set([...unlockedShips, ship]));
      setTotalCoins(nextCoins);
      setUnlockedShips(nextUnlocked);
      localStorage.setItem('neon_total_coins', nextCoins.toString());
      localStorage.setItem('neon_unlocked_ships', JSON.stringify(nextUnlocked));
      return true;
    }
    return false;
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleCycleGraphicsQuality = () => {
    sound.playUIClick();
    setSettings((prev) => {
      const current = prev.graphicsQuality || 'low';
      if (current === 'low') {
        return {
          ...prev,
          graphicsQuality: 'medium',
          performanceMode: false,
          bloomGlow: false,
          particlesDensity: 'medium'
        };
      } else if (current === 'medium') {
        return {
          ...prev,
          graphicsQuality: 'high',
          performanceMode: false,
          bloomGlow: true,
          particlesDensity: 'high'
        };
      } else {
        return {
          ...prev,
          graphicsQuality: 'low',
          performanceMode: true,
          bloomGlow: false,
          particlesDensity: 'low'
        };
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      id="game-viewport" 
      className="relative w-screen h-screen bg-[#05050c] overflow-hidden select-none font-['Orbitron',monospace] flex flex-col"
    >
      {/* Top Quick Guide & Item Bar (แสดงคู่มือวิธีควบคุมยานและไอคอนไอเทมสั้น ๆ ด้านบนของหน้าเว็บ) */}
      <TopQuickGuide 
        language={language} 
        onToggleLanguage={handleToggleLanguage} 
      />

      {/* Main Canvas Container (Responsive Auto-Scaling) */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* HTML5 Canvas 2D Surface */}
        <canvas
          id="game-canvas"
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full cursor-crosshair z-0"
        />

        {/* Optional Retro CRT Scanlines & Screen Vignette Overlay */}
        {settings.crtScanlines && (
          <div 
            id="crt-scanline-overlay"
            className="pointer-events-none absolute inset-0 z-20 opacity-35 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.8)_100%)]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 3px)`
            }}
          />
        )}

        {/* In-Game Active HUD Overlay */}
        {gameState === 'PLAYING' && (
          <ArcadeHUD
            score={score}
            highScore={highScore}
            combo={combo}
            multiplier={multiplier}
            coins={coins}
            weaponLevel={weaponLevel}
            weaponType={weaponType}
            health={health}
            maxHealth={maxHealth}
            shield={shield}
            maxShield={maxShield}
            lives={lives}
            bombs={bombs}
            overdrive={overdrive}
            isOverdrive={isOverdrive}
            wave={wave}
            bossActive={bossActive}
            bossName={bossName}
            bossHealth={bossHealth}
            bossMaxHealth={bossMaxHealth}
            bossPhase={bossPhase}
            shipType={selectedShip}
            settings={settings}
            language={language}
            onPause={() => {
              engineRef.current?.pause();
              setGameState('PAUSED');
            }}
            onRestart={handleRestartGame}
            onToggleWeapon={() => engineRef.current?.toggleWeaponType()}
            onTriggerBomb={() => engineRef.current?.triggerBomb()}
            onTriggerOverdrive={() => engineRef.current?.triggerOverdrive()}
            onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            onToggleCRT={() => handleUpdateSettings({ crtScanlines: !settings.crtScanlines })}
            onToggleGraphics={handleCycleGraphicsQuality}
            onJoystickMove={(dx, dy, active) => {
              if (engineRef.current) {
                engineRef.current.virtualJoystick = { active, dx, dy };
              }
            }}
          />
        )}

        {/* Start Screen Menu (3-Step Flow: Pilot Name -> 5 Sectors -> Ship Select with 5 Free + 1 Unlockable) */}
        {gameState === 'START' && (
          <StartScreen
            pilotName={pilotName}
            onChangePilotName={handlePilotNameChange}
            selectedSector={selectedSector}
            onSelectSector={(sec) => setSelectedSector(sec)}
            selectedShip={selectedShip}
            onSelectShip={(st) => {
              setSelectedShip(st);
              if (engineRef.current) engineRef.current.setShip(st);
            }}
            unlockedShips={unlockedShips}
            totalCoins={totalCoins}
            onUnlockShip={handleUnlockShip}
            highScores={highScores}
            achievements={achievements}
            settings={settings}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            onStartGame={handleStartGame}
          />
        )}

        {/* Pause Menu Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            settings={settings}
            language={language}
            onResume={handleResumeGame}
            onRestart={handleRestartGame}
            onHome={handleGoHome}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAMEOVER' && (
          <GameOverModal
            score={score}
            wave={wave}
            coins={coins}
            shipType={selectedShip}
            pilotName={pilotName}
            language={language}
            onRestart={handleRestartGame}
            onHome={handleGoHome}
            onSaveScore={handleSaveScore}
          />
        )}
      </div>
    </div>
  );
}

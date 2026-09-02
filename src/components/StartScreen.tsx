import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Trophy, Crosshair, Zap, Shield, Flame, 
  Award, Sparkles, HelpCircle, User, ArrowRight, ArrowLeft, Radio, Check, Lock, ChevronUp, ChevronDown, Coins
} from 'lucide-react';
import { HighScoreEntry, ShipType, GameSettings, Achievement, Language } from '../types';
import { SHIPS } from '../game/constants';
import { sound } from '../audio/soundEngine';
import { SECTORS, TRANSLATIONS } from '../i18n/translations';

interface StartScreenProps {
  pilotName: string;
  onChangePilotName: (name: string) => void;
  selectedSector: number;
  onSelectSector: (sector: number) => void;
  selectedShip: ShipType;
  onSelectShip: (ship: ShipType) => void;
  unlockedShips: ShipType[];
  totalCoins: number;
  onUnlockShip: (ship: ShipType, cost: number) => boolean;
  highScores: HighScoreEntry[];
  achievements: Achievement[];
  settings: GameSettings;
  language: Language;
  onToggleLanguage: () => void;
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  pilotName,
  onChangePilotName,
  selectedSector,
  onSelectSector,
  selectedShip,
  onSelectShip,
  unlockedShips,
  totalCoins,
  onUnlockShip,
  highScores,
  achievements,
  settings,
  language,
  onToggleLanguage,
  onStartGame
}) => {
  const [activeTab, setActiveTab] = useState<'PLAY' | 'LEADERBOARD' | 'ACHIEVEMENTS' | 'CONTROLS'>('PLAY');
  // Wizard steps: 1 = Name Input, 2 = Level Selection, 3 = Ship Selection (5 free + 1 unlockable)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  const shipScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const t = TRANSLATIONS[language];
  const allShipsList: ShipType[] = [
    'VIPER', 'PHANTOM', 'TITAN', 'AURORA', 'VALKYRIE',
    'CHRONOS', 'NEBULA', 'DREADNOUGHT', 'SOLARIS', 'VOID_RAIDER', 'APEX'
  ];

  // Handle keyboard Up/Down navigation for ship selection when in Step 3
  useEffect(() => {
    if (activeTab !== 'PLAY' || step !== 3) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        const currentIndex = allShipsList.indexOf(selectedShip);
        const prevIndex = (currentIndex - 1 + allShipsList.length) % allShipsList.length;
        const targetShip = allShipsList[prevIndex];
        sound.playUIClick();
        onSelectShip(targetShip);
        scrollSelectedIntoView(targetShip);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const currentIndex = allShipsList.indexOf(selectedShip);
        const nextIndex = (currentIndex + 1) % allShipsList.length;
        const targetShip = allShipsList[nextIndex];
        sound.playUIClick();
        onSelectShip(targetShip);
        scrollSelectedIntoView(targetShip);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const isUnlocked = unlockedShips.includes(selectedShip);
        if (isUnlocked) {
          handleStart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, step, selectedShip, unlockedShips]);

  const scrollSelectedIntoView = (shipId: ShipType) => {
    const el = document.getElementById(`ship-card-${shipId.toLowerCase()}`);
    if (el && shipScrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleNextToSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotName.trim()) {
      onChangePilotName('ACE');
    }
    sound.unlockAudio();
    sound.playUIClick();
    setStep(2);
  };

  const handleNextToShip = () => {
    sound.unlockAudio();
    sound.playUIClick();
    setStep(3);
  };

  const handleStart = () => {
    sound.unlockAudio();
    sound.playUIClick();
    onStartGame();
  };

  const handleTryUnlock = (shipId: ShipType) => {
    const ship = SHIPS[shipId];
    const cost = ship.unlockCostCoins || 80;
    const success = onUnlockShip(shipId, cost);
    if (success) {
      sound.playPowerup();
      onSelectShip(shipId);
      setUnlockMessage(t.unlockSuccess);
      setTimeout(() => setUnlockMessage(null), 3500);
    } else {
      sound.playWarningSiren();
      setUnlockMessage(
        language === 'TH' 
          ? `🪙 เหรียญไม่พอ (ต้องการ ${cost} เหรียญ, คุณมี ${totalCoins} เหรียญ)` 
          : `Not enough coins! (Need ${cost} 🪙, you have ${totalCoins} 🪙)`
      );
      setTimeout(() => setUnlockMessage(null), 3500);
    }
  };

  // Render Vector SVG Preview of each ship
  const renderShipSVG = (shipId: ShipType, color: string, accent: string) => {
    switch (shipId) {
      case 'CHRONOS':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_14px_currentColor]" style={{ color }} viewBox="0 0 46 48">
            <polygon 
              points="23,4 28,14 44,24 36,44 28,34 23,40 18,34 10,44 2,24 18,14" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.2" 
            />
            <circle cx="23" cy="24" r="6" fill="none" stroke={accent} strokeWidth="2" />
            <line x1="23" y1="18" x2="23" y2="24" stroke={accent} strokeWidth="1.8" />
            <line x1="23" y1="24" x2="27" y2="24" stroke={accent} strokeWidth="1.8" />
          </svg>
        );
      case 'NEBULA':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_14px_currentColor]" style={{ color }} viewBox="0 0 46 48">
            <polygon 
              points="23,2 30,12 46,28 34,44 28,34 23,38 18,34 12,44 0,28 16,12" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.2" 
            />
            <polygon 
              points="23,14 29,26 23,32 17,26" 
              fill="none" 
              stroke={accent} 
              strokeWidth="1.8" 
            />
            <circle cx="23" cy="24" r="2.5" fill="#a855f7" />
          </svg>
        );
      case 'DREADNOUGHT':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_14px_currentColor]" style={{ color }} viewBox="0 0 48 48">
            <polygon 
              points="14,4 34,4 46,14 44,44 34,38 24,44 14,38 4,44 2,14" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.4" 
            />
            <rect x="14" y="14" width="20" height="12" rx="2" fill="none" stroke={accent} strokeWidth="1.8" />
            <line x1="10" y1="24" x2="38" y2="24" stroke={accent} strokeWidth="1.5" />
          </svg>
        );
      case 'SOLARIS':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_14px_currentColor]" style={{ color }} viewBox="0 0 46 48">
            <path 
              d="M 23,2 L 34,14 C 46,22 46,38 40,44 L 29,36 L 23,42 L 17,36 L 6,44 C 0,38 0,22 12,14 Z" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.2" 
            />
            <circle cx="23" cy="22" r="7" fill="none" stroke={accent} strokeWidth="2" />
            <circle cx="23" cy="22" r="3" fill="#f59e0b" />
          </svg>
        );
      case 'VOID_RAIDER':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_16px_currentColor]" style={{ color }} viewBox="0 0 48 48">
            <polygon 
              points="24,2 32,10 46,16 44,44 32,34 24,42 16,34 4,44 2,16 16,10" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.4" 
            />
            <polygon points="24,12 31,24 24,32 17,24" fill="none" stroke={accent} strokeWidth="1.8" />
            <circle cx="24" cy="22" r="3" fill="#00f3ff" />
          </svg>
        );
      case 'PHANTOM':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_12px_currentColor]" style={{ color }} viewBox="0 0 44 48">
            <polygon 
              points="22,4 42,40 32,30 28,42 22,34 16,42 12,30 2,40" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.2" 
            />
            <polygon 
              points="22,12 25,24 22,28 19,24" 
              fill="none" 
              stroke={accent} 
              strokeWidth="1.5" 
            />
          </svg>
        );
      case 'TITAN':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_12px_currentColor]" style={{ color }} viewBox="0 0 48 48">
            <polygon 
              points="18,6 30,6 44,14 44,42 34,36 24,42 14,36 4,42 4,14" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.4" 
            />
            <rect 
              x="16" y="16" width="16" height="14" rx="2"
              fill="none" 
              stroke={accent} 
              strokeWidth="1.6" 
            />
          </svg>
        );
      case 'AURORA':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_12px_currentColor]" style={{ color }} viewBox="0 0 44 48">
            <path 
              d="M 22,4 C 42,12 42,34 38,42 L 30,34 L 22,38 L 14,34 L 6,42 C 2,34 2,12 22,4 Z" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.2" 
            />
            <circle 
              cx="22" cy="22" r="6" 
              fill="none" 
              stroke={accent} 
              strokeWidth="1.8" 
            />
          </svg>
        );
      case 'VALKYRIE':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_12px_currentColor]" style={{ color }} viewBox="0 0 44 48">
            <polygon 
              points="22,4 27,14 42,26 34,42 27,34 22,40 17,34 10,42 2,26 17,14" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.2" 
            />
            <polyline 
              points="14,24 22,14 30,24" 
              fill="none" 
              stroke={accent} 
              strokeWidth="1.8" 
            />
          </svg>
        );
      case 'APEX':
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_16px_#ec4899]" style={{ color }} viewBox="0 0 48 48">
            <polygon 
              points="24,2 30,12 46,20 44,44 32,36 24,42 16,36 4,44 2,20 18,12" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.5" 
            />
            <polygon 
              points="24,10 30,22 24,32 18,22" 
              fill="none" 
              stroke={accent} 
              strokeWidth="2" 
            />
            <circle cx="24" cy="22" r="3" fill="#00f3ff" />
          </svg>
        );
      case 'VIPER':
      default:
        return (
          <svg className="w-14 h-14 drop-shadow-[0_0_12px_currentColor]" style={{ color }} viewBox="0 0 44 48">
            <polygon 
              points="22,4 40,40 30,34 22,38 14,34 4,40" 
              fill="#080a14" 
              stroke="currentColor" 
              strokeWidth="2.4" 
            />
            <polygon 
              points="22,14 26,26 22,30 18,26" 
              fill="none" 
              stroke={accent} 
              strokeWidth="1.6" 
            />
          </svg>
        );
    }
  };

  return (
    <div 
      id="start-screen-overlay" 
      className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 font-['Orbitron',monospace] z-30 overflow-y-auto"
    >
      {/* Top Header & Logo */}
      <div className="text-center pt-1 w-full max-w-4xl flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/50 text-cyan-400 text-[10px] sm:text-xs mb-1.5 tracking-widest animate-pulse shadow-[0_0_15px_rgba(0,243,255,0.3)]">
          <Sparkles className="w-3.5 h-3.5" /> {t.retroBadge}
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-400 drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]">
          {t.gameTitle}
        </h1>
        
        <p className="text-gray-300 text-xs sm:text-sm mt-0.5 tracking-wider text-center max-w-xl">
          {t.subtitle}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-4xl my-2.5 bg-black/80 border border-cyan-500/40 rounded-2xl p-3.5 sm:p-5 shadow-[0_0_40px_rgba(0,243,255,0.2)] flex flex-col items-center relative overflow-hidden">
        {/* Neon Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 border-b border-gray-800 pb-2.5 w-full relative z-10">
          <button
            id="tab-play-btn"
            onClick={() => { sound.playUIClick(); setActiveTab('PLAY'); }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'PLAY'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00f3ff]'
                : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-800'
            }`}
          >
            <Crosshair className="w-4 h-4" /> {t.tabPlay}
          </button>
          
          <button
            id="tab-leaderboard-btn"
            onClick={() => { sound.playUIClick(); setActiveTab('LEADERBOARD'); }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'LEADERBOARD'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00f3ff]'
                : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-800'
            }`}
          >
            <Trophy className="w-4 h-4" /> {t.tabLeaderboard}
          </button>

          <button
            id="tab-achievements-btn"
            onClick={() => { sound.playUIClick(); setActiveTab('ACHIEVEMENTS'); }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00f3ff]'
                : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-800'
            }`}
          >
            <Award className="w-4 h-4" /> {t.tabAchievements}
          </button>

          <button
            id="tab-controls-btn"
            onClick={() => { sound.playUIClick(); setActiveTab('CONTROLS'); }}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'CONTROLS'
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00f3ff]'
                : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> {t.tabHowToPlay}
          </button>
        </div>

        {/* TAB 1: 3-STEP FLOW */}
        {activeTab === 'PLAY' && (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* STEP 1: PILOT CALLSIGN INPUT */}
            {step === 1 && (
              <form onSubmit={handleNextToSector} className="w-full max-w-md flex flex-col items-center text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.4)] animate-bounce">
                  <User className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                    STEP 1 / 3: CALLSIGN
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-wider">
                    {t.pilotStepTitle}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {t.pilotInputHint}
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <input
                    id="pilot-name-input"
                    type="text"
                    maxLength={12}
                    value={pilotName}
                    onChange={(e) => onChangePilotName(e.target.value.toUpperCase())}
                    placeholder={t.pilotInputPlaceholder}
                    className="w-full text-center uppercase tracking-widest font-black text-xl sm:text-2xl bg-black/90 border-2 border-cyan-400 rounded-xl px-4 py-3 text-cyan-200 placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-[0_0_25px_rgba(0,243,255,0.3)] transition-all"
                    autoFocus
                  />

                  {/* Preset Buttons */}
                  <div className="flex justify-center gap-2 pt-1 text-xs">
                    <span className="text-gray-500 text-[10px] self-center">Presets:</span>
                    {['ACE', 'NOVA', 'VIPER', 'PHOENIX'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => { sound.playUIClick(); onChangePilotName(preset); }}
                        className="px-2 py-0.5 rounded bg-gray-900 hover:bg-cyan-950 border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-300 text-[10px] transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="next-to-sector-btn"
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,243,255,0.5)] active:scale-98 transition-all cursor-pointer mt-2"
                >
                  <span>{t.btnNextToSector}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* STEP 2: 5 LEVELS / SECTORS SELECTION */}
            {step === 2 && (
              <div className="w-full flex flex-col items-center space-y-4">
                {/* Header & Step Status */}
                <div className="w-full flex items-center justify-between border-b border-gray-800 pb-2">
                  <button
                    id="back-to-name-btn"
                    type="button"
                    onClick={() => { sound.playUIClick(); setStep(1); }}
                    className="px-3 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.btnBack} ({pilotName})</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[10px] text-cyan-400 font-bold tracking-widest block">
                      COMMANDER: <strong className="text-white">{pilotName}</strong>
                    </span>
                    <span className="text-xs text-gray-400">
                      STEP 2 / 3: {t.selectSectorTitle}
                    </span>
                  </div>
                </div>

                {/* 5 Levels Grid */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs sm:text-sm font-bold text-cyan-300 tracking-wider flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      {t.selectSectorTitle}
                    </h3>
                    <span className="text-[11px] text-gray-400">
                      {language === 'TH' ? 'คลิกเลือกด่านที่ต้องการเริ่ม' : 'Click to select starting level'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 w-full">
                    {SECTORS.map((sec) => {
                      const isSelected = selectedSector === sec.level;
                      return (
                        <div
                          key={sec.level}
                          id={`sector-card-${sec.level}`}
                          onClick={() => {
                            sound.playUIClick();
                            onSelectSector(sec.level);
                          }}
                          className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_25px_rgba(0,243,255,0.4)] scale-[1.02]'
                              : 'bg-black/60 border-gray-800 hover:border-gray-600 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-white">
                                {t.levelLabel} {sec.level}
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>

                            <h4 
                              className="font-bold text-xs leading-tight mb-1" 
                              style={{ color: sec.color }}
                            >
                              {language === 'TH' ? sec.sectorNameTh : sec.sectorName}
                            </h4>

                            <p className="text-[10px] text-gray-300 leading-snug line-clamp-2 mb-2">
                              {language === 'TH' ? sec.descTh : sec.desc}
                            </p>
                          </div>

                          <div className="pt-1.5 border-t border-gray-800/80">
                            <span className="text-[9px] text-amber-400 font-semibold block leading-tight">
                              ⚠️ {language === 'TH' ? sec.hazardTh : sec.hazard}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Step Button (Go to Step 3: Choose Ship) */}
                <button
                  id="next-to-ship-btn"
                  onClick={handleNextToShip}
                  className="w-full max-w-md py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,243,255,0.5)] active:scale-98 transition-all cursor-pointer mt-1"
                >
                  <span>{t.btnNextToShip}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 3: SHIP SELECTION (5 FREE + 1 UNLOCKABLE WITH SCROLLING UP/DOWN) */}
            {step === 3 && (
              <div className="w-full flex flex-col items-center space-y-3">
                {/* Header & Step Status */}
                <div className="w-full flex items-center justify-between border-b border-gray-800 pb-2">
                  <button
                    id="back-to-sector-btn"
                    type="button"
                    onClick={() => { sound.playUIClick(); setStep(2); }}
                    className="px-3 py-1 rounded bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.btnBackToSector} (SECTOR {selectedSector})</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.coinsBalance}: <strong className="text-white">{totalCoins}</strong></span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-cyan-400 font-bold tracking-widest block">
                        STEP 3 / 3
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtitle & Scroll Hint */}
                <div className="w-full flex items-center justify-between text-xs">
                  <h3 className="font-bold text-cyan-300 tracking-wider flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    {t.selectShipTitle}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
                    <ChevronUp className="w-3 h-3 text-cyan-400 animate-bounce" />
                    <span>{t.scrollShipHint} (↑/↓)</span>
                    <ChevronDown className="w-3 h-3 text-cyan-400 animate-bounce" />
                  </div>
                </div>

                {/* Unlock Feedback Notification */}
                {unlockMessage && (
                  <div className="w-full p-2 rounded-lg bg-cyan-950/80 border border-cyan-400 text-cyan-200 text-xs font-bold text-center animate-pulse shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                    {unlockMessage}
                  </div>
                )}

                {/* Scrollable Ships Container (เลื่อนขึ้นลงได้เพื่อเลือกยานรบ) */}
                <div 
                  ref={shipScrollContainerRef}
                  id="ships-scroll-container"
                  className="w-full max-h-[300px] sm:max-h-[330px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-black/40 rounded-xl"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#00f3ff rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                    {allShipsList.map((st, idx) => {
                      const s = SHIPS[st];
                      const isSelected = selectedShip === st;
                      const isUnlocked = unlockedShips.includes(st);
                      const isLegendary = st === 'APEX';

                      return (
                        <div
                          key={st}
                          id={`ship-card-${st.toLowerCase()}`}
                          onClick={() => {
                            sound.playUIClick();
                            onSelectShip(st);
                          }}
                          className={`cursor-pointer border-2 rounded-xl p-3 transition-all flex flex-col justify-between relative overflow-hidden ${
                            isSelected
                              ? isLegendary
                                ? 'bg-pink-950/60 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)] scale-[1.02]'
                                : 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_25px_rgba(0,243,255,0.4)] scale-[1.02]'
                              : isLegendary
                              ? 'bg-gradient-to-b from-purple-950/30 to-black/80 border-purple-800/80 hover:border-pink-500 opacity-85 hover:opacity-100'
                              : 'bg-black/60 border-gray-800 hover:border-gray-600 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div>
                            {/* Card Header: Name & Badge */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`font-black text-xs sm:text-sm tracking-wider ${isLegendary ? 'text-pink-300' : 'text-white'}`}>
                                {s.name}
                              </span>

                              {isUnlocked ? (
                                <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/80 flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  {s.isUnlockable ? t.unlockedBadge : t.freeShipBadge}
                                </span>
                              ) : (
                                <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-600/80 flex items-center gap-1 animate-pulse">
                                  <Lock className="w-2.5 h-2.5" />
                                  {t.unlockableShipBadge}
                                </span>
                              )}
                            </div>

                            {/* Subtitle */}
                            <div className="text-[10px] text-gray-400 font-semibold mb-1">
                              {language === 'TH' ? s.subtitleTh : s.subtitle}
                            </div>

                            {/* SVG Silhouette Visual */}
                            <div className="h-16 flex items-center justify-center my-1 relative">
                              {renderShipSVG(st, isLegendary ? '#ec4899' : s.color, s.accentColor)}
                              
                              {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                                  <div className="p-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                                    <Lock className="w-5 h-5" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Special Ability & Description */}
                            <div className="bg-gray-950/80 rounded-lg p-2 mb-2 border border-gray-800/80 text-[10px]">
                              <span className="text-cyan-300 font-bold block leading-tight mb-0.5">
                                ⚡ {language === 'TH' ? s.specialAbilityTh : s.specialAbility}
                              </span>
                              <p className="text-gray-400 text-[9px] leading-snug line-clamp-2">
                                {language === 'TH' ? s.descTh : s.desc}
                              </p>
                            </div>
                          </div>

                          {/* Stats Bars or Unlock Action */}
                          <div className="space-y-1.5 text-[10px] pt-1 border-t border-gray-800/80">
                            <div className="flex justify-between text-gray-400 text-[9px]">
                              <span>{t.statSpeed}</span>
                              <span className="text-cyan-400 font-bold">{s.speed}</span>
                            </div>
                            <div className="w-full bg-gray-950 h-1.5 rounded overflow-hidden">
                              <div className="bg-cyan-400 h-full transition-all" style={{ width: `${(s.speed / 9) * 100}%` }} />
                            </div>

                            <div className="flex justify-between text-gray-400 text-[9px]">
                              <span>{t.statHullShield}</span>
                              <span className="text-purple-400 font-bold">{s.maxHealth} HP / {s.maxShield} SHD</span>
                            </div>
                            <div className="w-full bg-gray-950 h-1.5 rounded overflow-hidden">
                              <div className="bg-purple-400 h-full transition-all" style={{ width: `${(s.maxHealth / 150) * 100}%` }} />
                            </div>

                            {/* Unlock Button for locked ship */}
                            {!isUnlocked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTryUnlock(st);
                                }}
                                className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-[11px] tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 transition-all"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>{t.unlockShipBtn} ({s.unlockCostCoins || 80} 🪙)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Big Launch Button */}
                <button
                  id="start-battle-btn"
                  onClick={() => {
                    if (!unlockedShips.includes(selectedShip)) {
                      handleTryUnlock(selectedShip);
                      return;
                    }
                    handleStart();
                  }}
                  className={`w-full max-w-md py-3.5 sm:py-4 rounded-xl text-white font-black text-base sm:text-xl tracking-widest flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    unlockedShips.includes(selectedShip)
                      ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 animate-pulse'
                      : 'bg-gradient-to-r from-amber-600 to-yellow-600'
                  }`}
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>{t.btnLaunch}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HIGH SCORES LEADERBOARD */}
        {activeTab === 'LEADERBOARD' && (
          <div className="w-full max-w-lg relative z-10">
            <h2 className="text-sm text-cyan-400 font-bold tracking-widest text-center mb-4">
              {t.tabLeaderboard}
            </h2>
            <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/60 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/90 text-cyan-400 border-b border-gray-800">
                  <tr>
                    <th className="p-2.5">RANK</th>
                    <th className="p-2.5">PILOT</th>
                    <th className="p-2.5">SCORE</th>
                    <th className="p-2.5">SECTOR</th>
                    <th className="p-2.5">COINS</th>
                    <th className="p-2.5">SHIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className={idx === 0 ? 'bg-amber-950/30 text-amber-300 font-bold' : 'text-gray-300'}>
                      <td className="p-2.5 font-bold">#{idx + 1}</td>
                      <td className="p-2.5 text-cyan-300 font-bold tracking-wider">{entry.name}</td>
                      <td className="p-2.5 font-black text-white">{entry.score.toLocaleString()}</td>
                      <td className="p-2.5">LV.{entry.wave}</td>
                      <td className="p-2.5 text-amber-300 font-semibold">{entry.coins || 0}</td>
                      <td className="p-2.5 text-gray-400">{entry.ship}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACHIEVEMENTS */}
        {activeTab === 'ACHIEVEMENTS' && (
          <div className="w-full max-w-xl relative z-10">
            <h2 className="text-sm text-cyan-400 font-bold tracking-widest text-center mb-4">
              {t.tabAchievements}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    ach.unlocked
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                      : 'bg-black/40 border-gray-800 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${ach.unlocked ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${ach.unlocked ? 'text-cyan-300' : 'text-gray-400'}`}>{ach.title}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{ach.desc}</p>
                    {ach.unlocked && (
                      <span className="text-[9px] text-cyan-400 font-bold mt-1 block">✓ UNLOCKED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTROLS & HOW TO PLAY */}
        {activeTab === 'CONTROLS' && (
          <div className="w-full max-w-xl text-xs space-y-4 text-gray-300 font-sans relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-900/80 border border-cyan-500/30 p-3.5 rounded-xl space-y-2">
                <h3 className="font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-1.5 text-xs">
                  🎮 {language === 'TH' ? 'การควบคุม (KEYBOARD / TOUCH)' : 'CONTROLS GUIDE'}
                </h3>
                <ul className="space-y-1.5 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-cyan-300">A / D หรือ Arrow Left / Right</strong>: {language === 'TH' ? 'บังคับยานหลบซ้าย-ขวา' : 'Move vessel horizontally'}
                  </li>
                  <li>
                    <strong className="text-cyan-300">Spacebar / คลิกเมาส์</strong>: {language === 'TH' ? 'ยิงปืนใหญ่ทำลายล้าง' : 'Fire primary cannon'}
                  </li>
                  <li>
                    <strong className="text-cyan-300">Touch & Drag บนมือถือ</strong>: {language === 'TH' ? 'ใช้นิ้วลากยานไปมาบน Canvas ได้โดยตรง 60 FPS' : 'Drag vessel smoothly on touch canvas'}
                  </li>
                  <li>
                    <strong className="text-cyan-300">Q / E หรือปุ่มบนหน้าจอ</strong>: {language === 'TH' ? 'สลับประเภทปืน (Single / Spread Shot)' : 'Toggle weapon types'}
                  </li>
                  <li>
                    <strong className="text-cyan-300">X / B / Shift</strong>: {language === 'TH' ? 'ยิงระเบิด EMP Shockwave ล้างจอ' : 'Trigger EMP Bomb shockwave'}
                  </li>
                  <li>
                    <strong className="text-cyan-300">C / F</strong>: {language === 'TH' ? 'เปิดโหมดคลั่ง Hyper Overdrive' : 'Activate Hyper Overdrive'}
                  </li>
                  <li>
                    <strong className="text-cyan-300">ลูกศรขึ้น/ลง (↑ / ↓)</strong>: {language === 'TH' ? 'เลื่อนเลือกยานรบในหน้าเมนู' : 'Navigate ship selection list'}
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/80 border border-purple-500/30 p-3.5 rounded-xl space-y-2">
                <h3 className="font-bold text-pink-400 font-mono tracking-wider flex items-center gap-1.5 text-xs">
                  ⚡ {language === 'TH' ? 'อัปเกรด & ไอเทมพิเศษ' : 'POWER-UPS & ITEMS'}
                </h3>
                <ul className="space-y-1.5 text-[11px] leading-relaxed">
                  <li><strong className="text-amber-300">🪙 Gold Coins</strong>: {language === 'TH' ? 'สุ่มดรอปจากศัตรู เก็บสะสมแต้มปลดล็อคยาน' : 'Bonus score & ship unlock points'}</li>
                  <li><strong className="text-cyan-400">⚡ Single / Plasma Blaster</strong>: {language === 'TH' ? 'ลำแสงตรงแรงสูง ทะลวงเป้าหมาย' : 'Piercing high-energy beam'}</li>
                  <li><strong className="text-green-400">🔥 3-Way Spread Shot</strong>: {language === 'TH' ? 'ปืนกระจาย 3 ทิศทาง กวาดฝูงเอเลี่ยน' : 'Triple bullet spread'}</li>
                  <li><strong className="text-purple-400">🛡️ Plasma Shield</strong>: {language === 'TH' ? 'ฟื้นฟูเกราะป้องกันการชน' : 'Restores invulnerability shield'}</li>
                  <li><strong className="text-rose-400">❤️ Repair Nanites</strong>: {language === 'TH' ? 'ซ่อมแซมพลังชีวิตยาน (Hull HP)' : 'Restores ship hull integrity'}</li>
                  <li><strong className="text-blue-400">💣 EMP Bombs</strong>: {language === 'TH' ? 'ล้างกระสุนศัตรูทั้งหมดในพริบตา' : 'Destroys all enemy ordnance'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer info & Language quick toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] text-gray-500 pt-1.5 border-t border-gray-900">
        <span>© 2026 NEON SPACE SHOOTER • HTML5 CANVAS 2D</span>
        <button
          onClick={onToggleLanguage}
          className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
        >
          {t.langSwitch}
        </button>
      </div>
    </div>
  );
};

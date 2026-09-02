import React from 'react';
import { 
  Heart, Shield, Zap, Flame, Radio, Pause, Volume2, 
  VolumeX, Crosshair, Sparkles, Monitor, Coins, Swords, RotateCcw, Repeat
} from 'lucide-react';
import { GameSettings, ShipType, WeaponType, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface ArcadeHUDProps {
  score: number;
  highScore: number;
  combo: number;
  multiplier: number;
  coins: number;
  weaponLevel: number;
  weaponType: WeaponType;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lives: number;
  bombs: number;
  overdrive: number;
  isOverdrive: boolean;
  wave: number;
  bossActive: boolean;
  bossName?: string;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossPhase?: number;
  shipType: ShipType;
  settings: GameSettings;
  language?: Language;
  onPause: () => void;
  onRestart?: () => void;
  onToggleWeapon?: () => void;
  onTriggerBomb: () => void;
  onTriggerOverdrive: () => void;
  onToggleSound: () => void;
  onToggleCRT: () => void;
  onToggleGraphics?: () => void;
  onJoystickMove?: (dx: number, dy: number, active: boolean) => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  score,
  highScore,
  combo,
  multiplier,
  coins,
  weaponLevel,
  weaponType,
  health,
  maxHealth,
  shield,
  maxShield,
  lives,
  bombs,
  overdrive,
  isOverdrive,
  wave,
  bossActive,
  bossName,
  bossHealth,
  bossMaxHealth,
  bossPhase,
  settings,
  language = 'TH',
  onPause,
  onRestart,
  onToggleWeapon,
  onTriggerBomb,
  onTriggerOverdrive,
  onToggleSound,
  onToggleCRT,
  onToggleGraphics,
  onJoystickMove
}) => {
  const t = TRANSLATIONS[language];
  const [touchActive, setTouchActive] = React.useState(false);
  const [touchPos, setTouchPos] = React.useState({ x: 0, y: 0 });
  const [touchOrigin, setTouchOrigin] = React.useState({ x: 0, y: 0 });

  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (shield / maxShield) * 100));
  const bossHealthPercent = bossActive && bossMaxHealth && bossHealth !== undefined
    ? Math.max(0, Math.min(100, (bossHealth / bossMaxHealth) * 100))
    : 0;

  const weaponNameDisplay = 
    weaponType === 'SPREAD' ? (language === 'TH' ? '🔥 ปืนกระจาย 3 ทิศ' : '3-WAY SPREAD') :
    weaponType === 'LASER' ? (language === 'TH' ? '⚡ พัลส์เลเซอร์' : 'PULSE LASER') :
    weaponType === 'MISSILE' ? (language === 'TH' ? '🚀 มิสไซล์ติดตาม' : 'SEEKER MISSILES') : 
    (language === 'TH' ? '⚡ พลาสมาบลาสเตอร์' : 'PLASMA BLASTER');

  // Touch Virtual Joystick Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setTouchOrigin({ x: touch.clientX, y: touch.clientY });
    setTouchPos({ x: 0, y: 0 });
    setTouchActive(true);
    if (onJoystickMove) onJoystickMove(0, 0, true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchOrigin.x;
    const dy = touch.clientY - touchOrigin.y;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setTouchPos({ x: Math.cos(angle) * clampedDist, y: Math.sin(angle) * clampedDist });
    if (onJoystickMove) onJoystickMove(nx, ny, true);
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    setTouchPos({ x: 0, y: 0 });
    if (onJoystickMove) onJoystickMove(0, 0, false);
  };

  return (
    <div id="arcade-hud" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-['Orbitron',monospace]">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Score & Coins & Combo */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Score */}
            <div className="bg-black/70 backdrop-blur-md border border-cyan-500/50 rounded px-3 py-1.5 shadow-[0_0_15px_rgba(0,243,255,0.25)]">
              <span className="text-[9px] sm:text-[10px] text-cyan-400 font-semibold tracking-wider block">{t.hudScore}</span>
              <span className="text-lg sm:text-2xl font-bold tracking-widest text-white text-shadow-neon">
                {score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* Coins Counter (เหรียญสุ่มเก็บสะสม) */}
            <div className="bg-black/70 backdrop-blur-md border border-amber-500/50 rounded px-3 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center gap-2">
              <span className="text-base sm:text-lg">🪙</span>
              <div>
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold tracking-wider block">{t.hudCoins}</span>
                <span className="text-sm sm:text-lg font-black tracking-wider text-amber-300">
                  {coins}
                </span>
              </div>
            </div>
            
            {/* High Score */}
            <div className="bg-black/40 border border-purple-500/30 rounded px-2.5 py-1 hidden md:block">
              <span className="text-[9px] text-purple-300 font-semibold tracking-wider block">{t.hudHighScore}</span>
              <span className="text-sm font-semibold tracking-wider text-purple-200">
                {highScore.toString().padStart(6, '0')}
              </span>
            </div>
          </div>

          {/* Combo Multiplier Pill */}
          {combo > 0 && (
            <div className="inline-flex items-center gap-1.5 self-start bg-pink-950/70 border border-pink-500/60 rounded px-2 py-0.5 animate-pulse shadow-[0_0_12px_rgba(255,0,85,0.4)]">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs font-bold text-pink-300">COMBO x{multiplier}</span>
              <span className="text-[10px] text-pink-400/80">({combo})</span>
            </div>
          )}
        </div>

        {/* Center: Sector / Wave Indicator (10 Stages per Level) */}
        {(() => {
          const currentSector = Math.min(5, Math.floor((wave - 1) / 10) + 1);
          const currentStage = ((wave - 1) % 10) + 1;
          const isMiniBoss = currentStage === 5;
          const isGiantBoss = currentStage === 10;

          return (
            <div className={`backdrop-blur-md rounded px-3.5 py-1.5 text-center transition-all ${
              isGiantBoss 
                ? 'bg-red-950/80 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' 
                : isMiniBoss 
                ? 'bg-purple-950/80 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-black/70 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
            }`}>
              <div className="flex items-center justify-center gap-1">
                <span className="text-[9px] sm:text-[10px] text-cyan-400 font-bold tracking-widest block">
                  {language === 'TH' ? `เลเวล ${currentSector}` : `SECTOR ${currentSector}`}
                </span>
                {isGiantBoss && <span className="text-[9px] font-black text-red-400 bg-red-900/60 px-1 rounded">GIANT BOSS</span>}
                {isMiniBoss && <span className="text-[9px] font-black text-amber-300 bg-amber-900/60 px-1 rounded">SUB-BOSS</span>}
              </div>
              <span className={`text-base sm:text-lg font-black tracking-wider ${
                isGiantBoss ? 'text-red-300' : isMiniBoss ? 'text-amber-300' : 'text-white'
              }`}>
                {language === 'TH' ? `ด่าน ${currentStage}/10` : `STAGE ${currentStage}/10`}
              </span>
            </div>
          );
        })()}

        {/* Top Right: Settings & Pause Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Quick Graphics / Performance Quality Mode Button */}
          {onToggleGraphics && (
            <button
              id="toggle-gfx-btn"
              onClick={onToggleGraphics}
              title={language === 'TH' ? 'สลับระดับกราฟฟิก (ต่ำ/ลื่นไหล, ปานกลาง, สูง)' : 'Toggle Graphics Quality (Low/Smooth, Med, High)'}
              className={`px-2 py-1.5 rounded border text-[10px] font-black tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                settings.graphicsQuality === 'low'
                  ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : settings.graphicsQuality === 'medium'
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300'
                  : 'bg-pink-950/80 border-pink-500/70 text-pink-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {settings.graphicsQuality === 'low' ? (language === 'TH' ? '⚡ ลื่นไหล' : '⚡ LOW FX') : 
                 settings.graphicsQuality === 'medium' ? (language === 'TH' ? '⚖️ กลาง' : '⚖️ MED FX') : 
                 (language === 'TH' ? '✨ สูง' : '✨ HIGH FX')}
              </span>
            </button>
          )}

          {/* Restart Button (เริ่มเกมใหม่) */}
          <button
            id="restart-game-hud-btn"
            onClick={onRestart}
            title={t.hudRestart}
            className="px-2 py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/70 text-amber-300 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.hudRestart}</span>
          </button>

          <button
            id="toggle-crt-btn"
            onClick={onToggleCRT}
            title="Toggle CRT Scanline Effect"
            className={`p-2 rounded border transition-colors ${
              settings.crtScanlines 
                ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
                : 'bg-black/60 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            title="Toggle Audio"
            className="p-2 rounded bg-black/60 border border-gray-700 text-gray-300 hover:text-cyan-400 hover:border-cyan-500 transition-colors"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            id="pause-game-btn"
            onClick={onPause}
            title="Pause Game (P / Esc)"
            className="p-2 rounded bg-cyan-950/70 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/80 transition-colors shadow-[0_0_12px_rgba(0,243,255,0.3)] cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Boss Health Bar (When Boss is Active) */}
      {bossActive && (
        <div className="w-full max-w-xl mx-auto my-2 pointer-events-none transition-all duration-300">
          <div className="bg-black/80 backdrop-blur-md border-2 border-red-600/80 rounded-lg p-2 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-black tracking-wider text-red-400 flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4 text-red-500" />
                {bossName || 'BOSS BEHEMOTH'}
              </span>
              <span className="text-[10px] font-bold text-amber-300">PHASE {bossPhase || 1}/3</span>
            </div>
            <div className="w-full h-3.5 bg-gray-950 rounded overflow-hidden border border-red-900/60 relative">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 transition-all duration-150 shadow-[0_0_15px_#ef4444]"
                style={{ width: `${bossHealthPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Vitals & Weapon Gauges */}
        <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-md border border-cyan-500/40 rounded-lg p-2.5 sm:p-3.5 shadow-[0_0_20px_rgba(0,243,255,0.15)] max-w-xs sm:max-w-sm">
          {/* Health & Shield Bars */}
          <div className="space-y-1.5">
            {/* Hull Integrity */}
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div className="flex-1 h-2.5 bg-gray-950 rounded overflow-hidden border border-rose-950">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-150 shadow-[0_0_8px_#f43f5e]"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-rose-300 w-8 text-right">{Math.round(health)}</span>
            </div>

            {/* Plasma Shield */}
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex-1 h-2.5 bg-gray-950 rounded overflow-hidden border border-cyan-950">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-150 shadow-[0_0_8px_#06b6d4]"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-cyan-300 w-8 text-right">{Math.round(shield)}</span>
            </div>
          </div>

          {/* Weapon Power Level (ระดับพลังปืน) & Switch Button (สลับประเภทปืน) */}
          <div className="pt-1.5 border-t border-gray-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[10px] text-cyan-300 font-bold tracking-wide">{weaponNameDisplay}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-gray-400 mr-1">LV.{weaponLevel}</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2.5 rounded-xs transition-all ${
                      i < weaponLevel 
                        ? 'bg-cyan-400 shadow-[0_0_6px_#00f3ff]' 
                        : 'bg-gray-800 border border-gray-700'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Click Button: สลับประเภทปืน (Single / Spread Shot) */}
            <button
              id="toggle-weapon-btn"
              onClick={onToggleWeapon}
              title={t.hudSwitchWeapon}
              className="pointer-events-auto w-full py-1.5 px-2 rounded border border-cyan-500/60 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 text-[10px] font-black flex items-center justify-between shadow-[0_0_10px_rgba(0,243,255,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Repeat className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{t.hudSwitchWeapon}: {weaponType === 'SPREAD' ? '3-WAY SPREAD' : 'BLASTER'}</span>
              </span>
              <span className="text-[9px] text-cyan-300 bg-cyan-900/90 px-1.5 py-0.5 rounded border border-cyan-500/40 shrink-0 ml-1">
                [Q]
              </span>
            </button>
          </div>

          {/* Lives (3 ชีวิต) & Bombs Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-xs">
            {/* Lives */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 mr-1">{language === 'TH' ? 'ชีวิต' : 'LIVES'}</span>
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <Crosshair key={i} className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_4px_#00f3ff]" />
              ))}
              {lives <= 0 && <span className="text-[10px] text-red-500 font-black">CRITICAL</span>}
            </div>

            {/* Bombs Button */}
            <button
              id="trigger-bomb-btn"
              onClick={onTriggerBomb}
              disabled={bombs <= 0}
              className={`pointer-events-auto flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-bold transition-all ${
                bombs > 0
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 hover:bg-cyan-900 active:scale-95 shadow-[0_0_10px_rgba(0,243,255,0.4)] cursor-pointer'
                  : 'bg-black/40 border-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>{t.hudEmp} [{bombs}]</span>
            </button>
          </div>

          {/* Overdrive Meter */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
            <Zap className={`w-3.5 h-3.5 ${isOverdrive ? 'text-pink-400 animate-spin' : 'text-amber-400'}`} />
            <div className="flex-1 h-2 bg-gray-950 rounded overflow-hidden border border-gray-800">
              <div
                className={`h-full transition-all duration-150 ${
                  isOverdrive 
                    ? 'bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 animate-pulse shadow-[0_0_12px_#ff0055]'
                    : overdrive >= 100 
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
                      : 'bg-amber-600/70'
                }`}
                style={{ width: `${isOverdrive ? 100 : overdrive}%` }}
              />
            </div>
            
            {/* Overdrive Trigger Button */}
            <button
              id="trigger-overdrive-btn"
              onClick={onTriggerOverdrive}
              disabled={overdrive < 100 && !isOverdrive}
              className={`pointer-events-auto text-[10px] font-black px-2 py-0.5 rounded transition-all ${
                isOverdrive
                  ? 'bg-pink-600 text-white animate-pulse cursor-pointer'
                  : overdrive >= 100
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_10px_#f59e0b] cursor-pointer animate-bounce'
                    : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              {isOverdrive ? t.hudActive : overdrive >= 100 ? t.hudReady : `${Math.round(overdrive)}%`}
            </button>
          </div>
        </div>

        {/* Mobile On-Screen Virtual Controls */}
        <div className="sm:hidden flex items-end justify-between w-full pointer-events-none mt-2">
          {/* Left Virtual Joystick Touch Area */}
          <div
            id="virtual-joystick-pad"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="pointer-events-auto w-24 h-24 rounded-full border-2 border-cyan-500/40 bg-black/40 backdrop-blur-sm relative flex items-center justify-center touch-none"
          >
            <div 
              className="w-8 h-8 rounded-full bg-cyan-400/80 border border-white shadow-[0_0_10px_#00f3ff] transition-transform duration-75"
              style={{
                transform: `translate(${touchPos.x}px, ${touchPos.y}px)`
              }}
            />
          </div>

          {/* Right Mobile Action Buttons */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Mobile Weapon Switch */}
            <button
              id="mobile-weapon-btn"
              onClick={onToggleWeapon}
              title="สลับประเภทปืน"
              className="w-12 h-12 rounded-full bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 flex flex-col items-center justify-center font-black text-[9px] shadow-[0_0_15px_rgba(52,211,153,0.4)] active:scale-95 leading-tight"
            >
              <span>สลับ</span>
              <span>ปืน</span>
            </button>

            <button
              id="mobile-bomb-btn"
              onClick={onTriggerBomb}
              disabled={bombs <= 0}
              className="w-12 h-12 rounded-full bg-cyan-950/90 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(0,243,255,0.4)] active:scale-95"
            >
              BOMB
            </button>
            <button
              id="mobile-overdrive-btn"
              onClick={onTriggerOverdrive}
              disabled={overdrive < 100}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[10px] active:scale-95 border-2 ${
                overdrive >= 100 
                  ? 'bg-amber-500 text-black border-white shadow-[0_0_15px_#f59e0b] animate-pulse'
                  : 'bg-black/60 border-gray-700 text-gray-500'
              }`}
            >
              HYPER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

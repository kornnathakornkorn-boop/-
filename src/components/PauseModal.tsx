import React from 'react';
import { Play, RotateCcw, Home, Volume2, Monitor, Sparkles, Zap, ShieldAlert } from 'lucide-react';
import { GameSettings, Language } from '../types';
import { sound } from '../audio/soundEngine';
import { TRANSLATIONS } from '../i18n/translations';

interface PauseModalProps {
  settings: GameSettings;
  language?: Language;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  settings,
  language = 'TH',
  onResume,
  onRestart,
  onHome,
  onUpdateSettings
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div id="pause-modal" className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-40 font-['Orbitron',monospace]">
      <div className="w-full max-w-md bg-black/95 border border-cyan-500/50 rounded-xl p-6 shadow-[0_0_35px_rgba(0,243,255,0.25)] text-center">
        <h2 className="text-2xl font-black text-white tracking-widest mb-1">
          {t.pauseTitle}
        </h2>
        <p className="text-xs text-cyan-400 mb-4">
          {language === 'TH' ? 'หยุดพักการรบชั่วคราว • ปรับแต่งระบบเกม' : 'COMBAT SIMULATION SUSPENDED'}
        </p>

        {/* Graphics & Anti-Lag Performance Section */}
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3.5 mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              {t.gfxQuality}
            </span>
            <span className="text-[10px] text-gray-400 uppercase">
              {settings.graphicsQuality || 'low'}
            </span>
          </div>

          {/* 3-Level Quality Segmented Control */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <button
              onClick={() => {
                sound.playUIClick();
                onUpdateSettings({ 
                  graphicsQuality: 'low', 
                  performanceMode: true,
                  bloomGlow: false,
                  particlesDensity: 'low'
                });
              }}
              className={`py-1.5 px-2 rounded text-[10px] font-black tracking-wider border cursor-pointer transition-all ${
                settings.graphicsQuality === 'low'
                  ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚡ {language === 'TH' ? 'ต่ำ (ลื่นไหล)' : 'LOW (Smooth)'}
            </button>

            <button
              onClick={() => {
                sound.playUIClick();
                onUpdateSettings({ 
                  graphicsQuality: 'medium', 
                  performanceMode: false,
                  bloomGlow: false,
                  particlesDensity: 'medium'
                });
              }}
              className={`py-1.5 px-2 rounded text-[10px] font-black tracking-wider border cursor-pointer transition-all ${
                settings.graphicsQuality === 'medium'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              ⚖️ {language === 'TH' ? 'ปานกลาง' : 'MEDIUM'}
            </button>

            <button
              onClick={() => {
                sound.playUIClick();
                onUpdateSettings({ 
                  graphicsQuality: 'high', 
                  performanceMode: false,
                  bloomGlow: true,
                  particlesDensity: 'high'
                });
              }}
              className={`py-1.5 px-2 rounded text-[10px] font-black tracking-wider border cursor-pointer transition-all ${
                settings.graphicsQuality === 'high'
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                  : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              ✨ {language === 'TH' ? 'สูง' : 'HIGH'}
            </button>
          </div>

          <p className="text-[10px] text-gray-400 leading-tight">
            {settings.graphicsQuality === 'low' 
              ? (language === 'TH' ? '✓ ปิดเงาเบลอหนัก ลดสะเก็ดระเบิดและดวงดาว เพื่อให้เล่นได้ลื่นไหล ไม่กระตุก 60 FPS' : '✓ Heavy shadow blurs disabled, reduced debris and stars for smooth 60 FPS.')
              : (language === 'TH' ? 'ℹ️ หากเครื่องเริ่มกระตุก แนะนำให้เลือกโหมด "ต่ำ (ลื่นไหล)"' : 'ℹ️ If you experience stuttering, switch to "LOW (Smooth)".')}
          </p>
        </div>

        {/* Quick Additional Toggles */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-lg p-3 mb-4 space-y-2.5 text-xs text-left">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" /> {t.gfxSound}
            </span>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                sound.setMuted(!next);
                onUpdateSettings({ soundEnabled: next });
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500'
              }`}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* CRT Scanline Toggle */}
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" /> {t.gfxCrtLines}
            </span>
            <button
              onClick={() => onUpdateSettings({ crtScanlines: !settings.crtScanlines })}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                settings.crtScanlines
                  ? 'bg-purple-950 border-purple-500 text-purple-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500'
              }`}
            >
              {settings.crtScanlines ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Bloom FX Toggle */}
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" /> {t.gfxBloomGlow}
            </span>
            <button
              onClick={() => onUpdateSettings({ bloomGlow: !settings.bloomGlow })}
              className={`px-2.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                settings.bloomGlow
                  ? 'bg-pink-950 border-pink-500 text-pink-300'
                  : 'bg-gray-900 border-gray-700 text-gray-500'
              }`}
            >
              {settings.bloomGlow ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            id="resume-game-btn"
            onClick={() => { sound.playUIClick(); onResume(); }}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_#00f3ff] transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" /> {t.pauseResume}
          </button>

          <button
            id="restart-mission-btn"
            onClick={() => { sound.playUIClick(); onRestart(); }}
            className="w-full py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> {t.pauseRestart}
          </button>

          <button
            id="quit-to-menu-btn"
            onClick={() => { sound.playUIClick(); onHome(); }}
            className="w-full py-1.5 rounded text-gray-400 hover:text-white text-[11px] font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> {t.pauseHome}
          </button>
        </div>
      </div>
    </div>
  );
};

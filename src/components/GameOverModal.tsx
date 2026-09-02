import React, { useState } from 'react';
import { RotateCcw, Trophy, Home, Award } from 'lucide-react';
import { ShipType, Language } from '../types';
import { sound } from '../audio/soundEngine';
import { TRANSLATIONS } from '../i18n/translations';

interface GameOverModalProps {
  score: number;
  wave: number;
  coins: number;
  shipType: ShipType;
  pilotName?: string;
  language?: Language;
  onRestart: () => void;
  onHome: () => void;
  onSaveScore: (name: string, score: number, wave: number, ship: ShipType, coins: number) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  wave,
  coins,
  shipType,
  pilotName = 'ACE',
  language = 'TH',
  onRestart,
  onHome,
  onSaveScore
}) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState(pilotName);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (saved || !name.trim()) return;
    sound.playUIClick();
    onSaveScore(name.trim().toUpperCase().slice(0, 10), score, wave, shipType, coins);
    setSaved(true);
  };

  return (
    <div id="game-over-modal" className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-40 font-['Orbitron',monospace]">
      <div className="w-full max-w-md bg-black/85 border-2 border-red-500/60 rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.4)] text-center">
        {/* Banner */}
        <div className="inline-block px-4 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 animate-pulse">
          {language === 'TH' ? 'ยานรบถูกทำลาย • ภารกิจสิ้นสุด' : 'MISSION TERMINATED'}
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-rose-400 drop-shadow-[0_0_15px_#ef4444] mb-4">
          {t.gameOverTitle}
        </h2>

        {/* Score, Sector & Coins summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-gray-950/80 border border-gray-800 rounded-xl p-3 sm:p-3.5 mb-5 text-left">
          <div>
            <span className="text-[10px] text-gray-400 block">{t.finalScore}</span>
            <span className="text-lg sm:text-xl font-black text-cyan-400 tracking-wider">
              {score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">{t.finalSector}</span>
            <span className="text-lg sm:text-xl font-black text-purple-400 tracking-wider">
              LV.{wave}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-amber-400/80 block">{t.finalCoins}</span>
            <span className="text-lg sm:text-xl font-black text-amber-300 tracking-wider flex items-center gap-1">
              🪙 {coins}
            </span>
          </div>
        </div>

        {/* High Score Submission */}
        {!saved ? (
          <form onSubmit={handleSave} className="mb-5 bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-3.5 space-y-2">
            <label className="text-xs text-cyan-300 font-bold block">
              {language === 'TH' ? `บันทึกสถิตินักบิน [${name}]:` : 'RECORD SCORE FOR LEADERBOARD:'}
            </label>
            <div className="flex gap-2 justify-center">
              <input
                type="text"
                maxLength={10}
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="w-36 text-center uppercase tracking-widest font-black text-base sm:text-lg bg-black border-2 border-cyan-400 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="PILOT"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs tracking-wider transition-all shadow-[0_0_12px_#00f3ff] cursor-pointer active:scale-95"
              >
                {t.saveScoreBtn}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-5 p-2.5 rounded-xl bg-green-950/40 border border-green-500/40 text-green-400 text-xs font-bold flex items-center justify-center gap-2">
            <Award className="w-4 h-4" /> {t.savedSuccess}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            id="game-over-restart-btn"
            onClick={() => { sound.playUIClick(); onRestart(); }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> {t.btnPlayAgain}
          </button>

          <button
            id="game-over-home-btn"
            onClick={() => { sound.playUIClick(); onHome(); }}
            className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" /> {t.pauseHome}
          </button>
        </div>
      </div>
    </div>
  );
};

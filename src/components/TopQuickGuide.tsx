import React from 'react';
import { Sparkles, Gamepad2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface TopQuickGuideProps {
  language: Language;
  onToggleLanguage: () => void;
}

export const TopQuickGuide: React.FC<TopQuickGuideProps> = ({
  language,
  onToggleLanguage
}) => {
  const t = TRANSLATIONS[language];
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <header 
      id="top-quick-guide-bar"
      className="w-full bg-black/90 backdrop-blur-md border-b border-cyan-500/30 text-white font-['Orbitron',monospace] text-xs z-30 transition-all duration-300 select-none shadow-[0_4px_20px_rgba(0,243,255,0.15)]"
    >
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex flex-col gap-1">
        {/* Top Mini Bar: Game Banner & Lang Switch & Collapse Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-black text-cyan-400 tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              NEON SPACE SHOOTER
            </span>
            <span className="hidden md:inline text-[10px] text-gray-400 border-l border-gray-700 pl-2">
              {t.retroBadge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch Button */}
            <button
              id="language-toggle-btn"
              onClick={onToggleLanguage}
              title="สลับโหมดภาษา (Toggle Thai / English)"
              className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-[10px] sm:text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,243,255,0.25)] flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{language === 'TH' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English'}</span>
            </button>

            {/* Toggle Expand/Collapse */}
            <button
              id="guide-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'ขยายคู่มือ' : 'ย่อคู่มือ'}
              className="p-1 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Quick Controls & Item Cheat-Sheet Bar */}
        {!collapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-gray-800/80 text-[10px] sm:text-[11px]">
            {/* Left Column: Quick Controls */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-gray-950/60 border border-cyan-500/20 px-2.5 py-1 rounded">
              <span className="font-black text-cyan-300 flex items-center gap-1 shrink-0">
                <Gamepad2 className="w-3.5 h-3.5" />
                {t.quickGuideTitle}
              </span>
              <span className="text-gray-300">
                <strong className="text-cyan-400">A/D / Drag</strong> {language === 'TH' ? 'หลบ' : 'Move'}
              </span>
              <span className="text-gray-300">
                <strong className="text-cyan-400">Space</strong> {language === 'TH' ? 'ยิง' : 'Fire'}
              </span>
              <span className="text-gray-300">
                <strong className="text-cyan-400">Q / E</strong> {language === 'TH' ? 'สลับปืน' : 'Switch Gun'}
              </span>
              <span className="text-gray-300">
                <strong className="text-cyan-400">X</strong> EMP
              </span>
              <span className="text-gray-300">
                <strong className="text-cyan-400">C</strong> {language === 'TH' ? 'โหมดคลั่ง' : 'Hyper'}
              </span>
            </div>

            {/* Right Column: Quick Items & Power-ups */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-gray-950/60 border border-purple-500/20 px-2.5 py-1 rounded">
              <span className="font-black text-purple-300 flex items-center gap-1 shrink-0">
                <Info className="w-3.5 h-3.5" />
                {t.quickItemsTitle}
              </span>
              <span className="text-amber-300 font-semibold" title={t.quickCoin}>
                🪙 {language === 'TH' ? 'เหรียญ' : 'Coin'}
              </span>
              <span className="text-cyan-300 font-semibold" title={t.quickBlaster}>
                ⚡ {language === 'TH' ? 'ปืนตรง' : 'Blaster'}
              </span>
              <span className="text-emerald-300 font-semibold" title={t.quickSpread}>
                🔥 {language === 'TH' ? 'ปืน 3 ทิศ' : '3-Way'}
              </span>
              <span className="text-purple-300 font-semibold" title={t.quickShield}>
                🛡️ {language === 'TH' ? 'เกราะ' : 'Shield'}
              </span>
              <span className="text-rose-300 font-semibold" title={t.quickRepair}>
                ❤️ {language === 'TH' ? 'ซ่อมยาน' : 'Repair'}
              </span>
              <span className="text-blue-300 font-semibold" title={t.quickBomb}>
                💣 EMP
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Globe, Plus, Trash2, Check, AlertTriangle, Languages } from 'lucide-react';

interface TranslationManagerProps {
  supportedLocales: string[];
  defaultLocale: string;
  onAddLocale: (locale: string) => void;
  onRemoveLocale: (locale: string) => void;
  onChangeLocale: (locale: string) => void;
  currentLocale: string;
}

const AVAILABLE_LOCALES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽', dir: 'ltr' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar-SA', name: 'Arabic (Saudi)', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', dir: 'ltr' },
];

const TranslationManager: React.FC<TranslationManagerProps> = ({
  supportedLocales,
  defaultLocale,
  onAddLocale,
  onRemoveLocale,
  onChangeLocale,
  currentLocale
}) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="bg-bg-primary border-b border-hama-gold/10 px-4 md:px-8 py-4 md:py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-20 sticky top-0 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
        <div className="flex items-center gap-2 text-text-muted font-black text-[10px] uppercase tracking-[0.2em]">
          <Languages size={14} className="text-hama-gold" />
          <span className="font-sans">Translation Center</span>
        </div>

        <div className="hidden md:block h-4 w-px bg-white/5"></div>

        <div className="flex flex-wrap gap-2 md:gap-3">
          {supportedLocales.map(code => {
            const localeInfo = AVAILABLE_LOCALES.find(l => l.code === code) || { code, name: code, flag: '🌐' };
            const isActive = currentLocale === code;

            return (
              <button
                key={code}
                onClick={() => onChangeLocale(code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 font-sans ${isActive
                  ? 'bg-hama-gold text-black border-hama-gold shadow-[0_0_15px_rgba(242,201,76,0.2)]'
                  : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary'
                  }`}
              >
                <span className="text-sm grayscale-[0.5] group-hover:grayscale-0 transition-all">{localeInfo.flag}</span>
                <span>{localeInfo.name}</span>
                {code === defaultLocale && (
                  <span className={`px-1.5 rounded-md text-[8px] ml-1 font-black ${isActive ? 'bg-black/20 text-black' : 'bg-white/5 text-text-muted/40'}`}>DEFAULT</span>
                )}
              </button>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/10 text-text-muted text-[10px] font-bold uppercase tracking-wider hover:border-hama-gold/30 hover:text-hama-gold transition-all font-sans"
            >
              <Plus size={14} /> Add Language
            </button>

            {isAdding && (
              <div className="absolute top-full left-0 mt-3 w-64 glass border-hama-gold/20 bg-bg-secondary py-2 z-50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="noise opacity-10" />
                <div className="px-4 py-2 text-[9px] font-black text-text-muted bg-white/5 border-b border-white/5 uppercase tracking-[0.2em] font-sans relative z-10">
                  Select Language
                </div>
                <div className="max-h-64 overflow-y-auto relative z-10">
                  {AVAILABLE_LOCALES.filter(l => !supportedLocales.includes(l.code)).map(locale => (
                    <button
                      key={locale.code}
                      onClick={() => {
                        onAddLocale(locale.code);
                        setIsAdding(false);
                      }}
                      className="w-full text-left px-5 py-3 text-[11px] font-bold text-text-secondary hover:bg-hama-gold hover:text-black hover:font-black transition-all flex items-center gap-3 group font-sans"
                    >
                      <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{locale.flag}</span>
                      <span className="uppercase tracking-widest">{locale.name}</span>
                    </button>
                  ))}
                </div>
                {AVAILABLE_LOCALES.filter(l => !supportedLocales.includes(l.code)).length === 0 && (
                  <div className="px-5 py-4 text-[10px] text-white/20 text-center uppercase font-black italic font-sans">
                    All languages added
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentLocale !== defaultLocale && (
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-hama-gold bg-hama-gold/5 px-4 py-1.5 rounded-full border border-hama-gold/10 font-sans">
            <AlertTriangle size={12} />
            <span>Editing Translation Mode</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationManager;
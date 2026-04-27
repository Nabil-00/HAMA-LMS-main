import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({ className = '', size = 'md' }) => {
  const { language, setLanguage, t } = useLanguage();
  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border border-[#D4AF37]/40 bg-black/45 backdrop-blur-sm shadow-[0_0_0_1px_rgba(212,175,55,0.08)] transition-colors ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLanguage('ha')}
        className={`${isSmall ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} min-w-[48px] rounded-lg uppercase tracking-[0.2em] font-black transition-all ${
          language === 'ha' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#A0A0A0] hover:text-[#F5F5DC]'
        }`}
      >
        {t('language.ha')}
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`${isSmall ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} min-w-[48px] rounded-lg uppercase tracking-[0.2em] font-black transition-all ${
          language === 'en' ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#A0A0A0] hover:text-[#F5F5DC]'
        }`}
      >
        {t('language.en')}
      </button>
    </div>
  );
};

export default LanguageToggle;

import React, { useState, useEffect } from 'react';
import { RotateCcw, Smartphone, X } from './icons/HamaUIIcons';

const OrientationPrompt: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Show prompt if:
            // 1. Screen is narrow (mobile)
            // 2. Orientation is portrait (height > width)
            // 3. User hasn't dismissed it in this session
            const isPortrait = window.innerHeight > window.innerWidth;
            const isMobile = window.innerWidth < 768;

            setIsVisible(isPortrait && isMobile && !isDismissed);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, [isDismissed]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:hidden animate-in fade-in duration-500">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsDismissed(true)} />

            {/* Prompt Card */}
            <div className="relative w-full max-w-xs glass-elevated rounded-[2rem] p-8 text-center flex flex-col items-center gap-6 studio-glow border border-hama-gold/30">
                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors bg-white/5 rounded-full"
                >
                    <X size={18} />
                </button>

                <div className="relative">
                    <div className="absolute -inset-4 bg-hama-gold/10 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 bg-hama-gold/10 rounded-2xl flex items-center justify-center text-hama-gold animate-bounce">
                        <Smartphone size={40} className="rotate-0 group-hover:rotate-90 transition-transform duration-700" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RotateCcw size={24} className="opacity-40 animate-spin-slow" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-hama-gold via-white to-hama-gold bg-clip-text text-transparent serif italic tracking-wide">
                        Landscape View Ready
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-sans">
                        Rotate your device for a more immersive HAMA Academy learning experience.
                    </p>
                </div>

                <button
                    onClick={() => setIsDismissed(true)}
                    className="w-full py-4 bg-hama-gold text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-hama-gold/10 active:scale-95 transition-all"
                >
                    Got it
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
        </div>
    );
};

export default OrientationPrompt;

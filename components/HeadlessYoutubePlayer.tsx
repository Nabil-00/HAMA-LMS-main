import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, Activity } from './icons/HamaUIIcons';
import BrandLogo from './ui/BrandLogo';

interface HeadlessYoutubePlayerProps {
    youtubeId: string;
    title?: string;
}

const HeadlessYoutubePlayer: React.FC<HeadlessYoutubePlayerProps> = ({ youtubeId, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [playerReady, setPlayerReady] = useState(false); // API ready
    const [isPlayerReady, setIsPlayerReady] = useState(false); // Instance ready

    // Load YouTube API
    useEffect(() => {
        if ((window as any).YT) {
            setPlayerReady(true);
            return;
        }
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            setPlayerReady(true);
        };
    }, []);

    const [player, setPlayer] = useState<any>(null);

    useEffect(() => {
        if (playerReady && iframeRef.current && !player) {
            const newPlayer = new (window as any).YT.Player(iframeRef.current, {
                events: {
                    onReady: () => {
                        setIsPlayerReady(true);
                        setDuration(newPlayer.getDuration());
                    },
                    onStateChange: (event: any) => {
                        if (event.data === (window as any).YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                            setDuration(event.target.getDuration());
                        } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        } else if (event.data === (window as any).YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                            setProgress(0);
                            setCurrentTime(0);
                        }
                    },
                },
            });
            setPlayer(newPlayer);
        }
    }, [playerReady, player]);

    // Update progress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && player && isPlayerReady && typeof player.getCurrentTime === 'function') {
            interval = setInterval(() => {
                const ct = player.getCurrentTime();
                const dur = player.getDuration();
                setCurrentTime(ct);
                setProgress((ct / dur) * 100);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player]);

    const togglePlay = () => {
        if (!player || !isPlayerReady) return;
        if (isPlaying) {
            if (typeof player.pauseVideo === 'function') player.pauseVideo();
        } else {
            if (typeof player.playVideo === 'function') player.playVideo();
        }
    };

    const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!player || !isPlayerReady || typeof player.seekTo !== 'function') return;
        const newProgress = parseInt(e.target.value);
        const time = (newProgress / 100) * duration;
        player.seekTo(time, true);
        setProgress(newProgress);
        setCurrentTime(time);
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto group">
            {/* Headless Iframe */}
            <div className="hidden">
                <iframe
                    ref={iframeRef}
                    id="headless-yt-player"
                    src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0`}
                    allow="autoplay; encrypted-media"
                />
            </div>

            {/* Premium UI Wrapper */}
            <div className="glass rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-hama-gold/20 shadow-2xl relative">
                {/* Background Visual Artifacts */}
                <div className="absolute inset-0 bg-gradient-to-br from-hama-gold/5 via-transparent to-black/40 pointer-events-none" />
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="w-32 h-32 text-hama-gold" />
                </div>

                {/* Brand Watermark - visible when controls are shown (paused/idle) */}
                {!isPlaying && (
                    <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-[0.05]">
                        <BrandLogo variant="watermark" size="sm" />
                    </div>
                )}

                <div className="relative z-10 p-6 md:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10 lg:gap-12 min-w-0">
                    {/* Thumbnail / Visualizer Circle */}
                    <div className="relative group/thumb">
                        <div className={`w-32 h-32 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-hama-gold/30 shadow-[0_0_50px_rgba(242,201,76,0.2)] transition-all duration-1000 ${isPlaying ? 'rotate-animation' : ''}`}>
                            <img
                                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                                alt="Audio Thumbnail"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                                }}
                            />
                        </div>
                        {/* Play/Pause Overlay */}
                        <button
                            onClick={togglePlay}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-full"
                        >
                            {isPlaying ? <Pause size={32} className="text-hama-gold md:hidden" /> : <Play size={32} className="text-hama-gold ml-1 md:hidden" />}
                            {isPlaying ? <Pause size={48} className="text-hama-gold hidden md:block" /> : <Play size={48} className="text-hama-gold ml-2 hidden md:block" />}
                        </button>
                    </div>

                    {/* Controls Area */}
                    <div className="flex-1 min-w-0 w-full space-y-4 md:space-y-8">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hama-gold/10 border border-hama-gold/20 text-hama-gold text-[10px] font-black uppercase tracking-widest mb-4">
                                Audiosonic Masterclass
                            </div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-text-primary serif leading-tight break-words [overflow-wrap:anywhere]">
                                {title || 'YouTube Audio Stream'}
                            </h2>
                            <p className="text-hama-gold/60 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] md:tracking-[0.35em] mt-2 break-words">
                                Professional Grade DSP • Headless Engine
                            </p>
                        </div>

                        {/* Scrubber */}
                        <div className="space-y-3">
                            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden group/scrub">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={seek}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div
                                    className="h-full bg-hama-gold shadow-[0_0_20px_rgba(242,201,76,0.8)] transition-all duration-300 relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-hama-gold shadow-lg scale-0 group-hover/scrub:scale-100 transition-transform" />
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-black font-mono text-text-muted uppercase tracking-widest">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                            <button
                                onClick={() => {
                                    if (isPlayerReady && typeof player?.seekTo === 'function') {
                                        player.seekTo(Math.max(0, currentTime - 10), true);
                                    }
                                }}
                                className="text-text-muted hover:text-hama-gold transition-colors"
                            >
                                <RotateCcw size={18} className="md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={togglePlay}
                                className="w-14 h-14 md:w-20 md:h-20 bg-hama-gold text-black rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-hama-gold/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying ? <Pause size={24} className="md:w-8 md:h-8" /> : <Play size={24} className="ml-1 md:w-8 md:h-8" />}
                            </button>
                            <div className="flex items-center gap-3 text-text-muted min-w-0">
                                <Volume2 size={18} className="md:w-5 md:h-5" />
                                <div className="w-16 sm:w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-hama-gold/40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .rotate-animation {
          animation: slow-rotate 20s linear infinite;
        }
        @keyframes slow-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default HeadlessYoutubePlayer;

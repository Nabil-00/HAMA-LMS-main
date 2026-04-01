import React, { useState } from 'react';
import { Maximize2, Play, Volume2, Shield } from 'lucide-react';

interface VideoPlayerProps {
    youtubeId: string;
    title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId, title }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative w-full aspect-video group rounded-[2rem] overflow-hidden border border-hama-gold/20 shadow-2xl bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-hama-gold/5 via-transparent to-black/40 pointer-events-none z-10" />

            {/* Iframe Container */}
            <div className="absolute inset-0 w-full h-full">
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&showinfo=0`}
                    title={title || "HAMA Video Player"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Overlays / Premium UI Elements */}
            {!isHovered && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-20 transition-opacity duration-500">
                    <div className="flex justify-between items-start">
                        <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-hama-gold/20 text-hama-gold text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Shield size={10} /> HAMA PRO PLAYER
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white serif truncate drop-shadow-lg">
                            {title || 'Masterclass Session'}
                        </h2>
                        <div className="flex items-center gap-4 text-hama-gold/60 text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Volume2 size={12} /> High Fidelity Audio</span>
                            <span className="w-1 h-1 bg-hama-gold/30 rounded-full" />
                            <span>1080p Stream</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hover State: Gradient Overlay to help contrast native controls if needed, or just for aesthetic */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(242, 201, 76, 0.1);
                }
            `}</style>
        </div>
    );
};

export default VideoPlayer;

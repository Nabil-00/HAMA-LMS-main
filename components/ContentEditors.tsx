import React, { useState } from 'react';
import { ContentMetadata } from '../types';
import {
   Mic,
   Box,
   Globe,
   UploadCloud,
   Lock,
   WifiOff,
   Smartphone,
   Settings,
   MonitorPlay,
   Code,
   Youtube,
   PlayCircle,
   ShieldAlert,
   Maximize,
   RefreshCw,
   Trash2
} from 'lucide-react';

interface EditorProps {
   metadata: ContentMetadata;
   onChange: (metadata: ContentMetadata) => void;
   onContentChange?: (content: string) => void;
   onUpload?: (file: File) => void;
   isUploading?: boolean;
   content?: string;
}

// STRICT THEME CLASS DEFINITIONS
const inputBaseClass = "bg-white/5 text-text-primary border-white/10 placeholder-text-muted focus:border-hama-gold/30 outline-none transition-all font-sans";
const bentoCardClass = "glass border-hama-gold/10";
const goldBadgeClass = "px-3 py-1 rounded-full bg-hama-gold/5 border border-hama-gold/10 text-hama-gold text-[9px] font-black uppercase tracking-widest font-sans";

// --- VIDEO EDITOR (VOD & LIVE) ---
export const VideoEditor: React.FC<EditorProps & { isLive?: boolean }> = ({ metadata, onChange, onUpload, isUploading, isLive }) => {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className={`${bentoCardClass} p-12 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[300px] group relative overflow-hidden`}>
            <div className="w-20 h-20 bg-hama-gold/10 rounded-3xl flex items-center justify-center mb-6 border border-hama-gold/20 group-hover:scale-110 transition-transform relative z-10">
               <MonitorPlay size={32} className="text-hama-gold" />
            </div>
            <h3 className="text-text-primary font-bold text-xl serif relative z-10">
               {isLive ? 'Live Stream Configuration' : 'Video Content Source'}
            </h3>
            <p className="text-text-secondary text-sm mt-3 max-w-md font-light font-sans relative z-10">
               {isLive
                  ? 'Connect via professional RTMP or high-fidelity HLS. Stream keys are generated upon publishing.'
                  : 'Supports MP4, MOV, WebM. Professional HLS/DASH transcoding will be applied.'}
            </p>
            <button
               onClick={() => !isLive && document.getElementById('lesson-media-upload')?.click()}
               disabled={isUploading}
               className={`mt-8 px-8 py-3 bg-hama-gold text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-hama-gold/10 hover:bg-text-primary hover:shadow-hama-gold/30 transition-all flex items-center gap-3 active:scale-95 font-sans relative z-10 disabled:opacity-50`}
            >
               {isUploading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
               ) : (
                  <UploadCloud size={18} />
               )}
               {isLive ? 'Initialize Stream' : 'Select Video Asset'}
               <input
                  id="lesson-media-upload"
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && onUpload?.(e.target.files[0])}
               />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1 font-sans">Technical Routes</h4>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-hama-gold uppercase tracking-widest ml-1 font-sans">Source URL (HLS/DASH)</label>
                     <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-2xl text-xs font-mono ${inputBaseClass}`}
                        placeholder="https://cdn.hama.academy/streams/..."
                        value={metadata.streamUrl || ''}
                        onChange={(e) => onChange({ ...metadata, streamUrl: e.target.value })}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-hama-gold uppercase tracking-widest ml-1 font-sans">Subtitles / Captions (VTT)</label>
                     <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-2xl text-xs font-mono ${inputBaseClass}`}
                        placeholder="https://..."
                        value={metadata.captionsUrl || ''}
                        onChange={(e) => onChange({ ...metadata, captionsUrl: e.target.value })}
                     />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1 font-sans">Content Security</h4>
               <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-5 ${bentoCardClass} rounded-2xl cursor-pointer hover:border-hama-gold/30 transition-colors group relative overflow-hidden`}>
                     <input
                        type="checkbox"
                        checked={metadata.drmEnabled}
                        onChange={(e) => onChange({ ...metadata, drmEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-hama-gold focus:ring-hama-gold relative z-10"
                     />
                     <div className="flex-1 font-sans relative z-10">
                        <div className="flex items-center gap-2 font-bold text-sm text-text-primary group-hover:text-hama-gold transition-colors">
                           <Lock size={14} className="text-hama-gold" /> DRM Protection
                        </div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mt-1">Widevine & FairPlay Integration</p>
                     </div>
                  </label>

                  <label className={`flex items-center gap-4 p-5 ${bentoCardClass} rounded-2xl cursor-pointer hover:border-hama-gold/30 transition-colors group relative overflow-hidden`}>
                     <input
                        type="checkbox"
                        checked={metadata.lowBandwidthMode}
                        onChange={(e) => onChange({ ...metadata, lowBandwidthMode: e.target.checked })}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-hama-gold focus:ring-hama-gold relative z-10"
                     />
                     <div className="flex-1 font-sans relative z-10">
                        <div className="flex items-center gap-2 font-bold text-sm text-text-primary group-hover:text-hama-gold transition-colors">
                           <WifiOff size={14} className="text-hama-gold" /> Adaptive Bitrate
                        </div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mt-1">Low-bandwidth optimization</p>
                     </div>
                  </label>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- AUDIO / PODCAST EDITOR ---
export const AudioEditor: React.FC<EditorProps> = ({ metadata, onChange, onUpload, isUploading }) => {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className={`${bentoCardClass} p-8 flex items-center gap-8 relative overflow-hidden`}>
            <div className="w-24 h-24 bg-hama-gold/10 rounded-3xl flex items-center justify-center flex-shrink-0 border border-hama-gold/20 relative z-10">
               <Mic size={40} className="text-hama-gold" />
            </div>
            <div className="font-sans relative z-10">
               <h3 className="text-text-primary font-bold text-xl serif">Audio Content / Podcast</h3>
               <p className="text-text-secondary text-sm mt-2 font-light">Upload audio recordings (MP3/WAV) or provide an external RSS feed.</p>
               <div className="flex gap-4 mt-6">
                  <button
                     disabled={isUploading}
                     onClick={() => document.getElementById('audio-upload')?.click()}
                     className="px-6 py-2.5 bg-hama-gold text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-text-primary transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                     {isUploading ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={14} />}
                     Upload Asset
                     <input
                        id="audio-upload"
                        type="file"
                        hidden
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && onUpload?.(e.target.files[0])}
                     />
                  </button>
                  <button className="px-6 py-2.5 bg-white/5 border border-white/10 text-text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-hama-gold hover:text-hama-gold transition-all">Direct Record</button>
               </div>
            </div>
         </div>

         <div className={`${bentoCardClass} p-6 relative overflow-hidden`}>
            <h4 className="text-[10px] font-black text-hama-gold uppercase tracking-[0.3em] mb-4 ml-1 font-sans relative z-10">Transcript & Accessibility</h4>
            <textarea
               className={`w-full h-48 p-4 rounded-2xl text-sm leading-relaxed ${inputBaseClass}`}
               placeholder="Enter the audio transcript here..."
               value={metadata.transcript || ''}
               onChange={(e) => onChange({ ...metadata, transcript: e.target.value })}
            ></textarea>
         </div>
      </div>
   );
};

// --- VR / AR EDITOR ---
export const ImmersiveEditor: React.FC<EditorProps> = ({ metadata, onChange }) => {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className={`${bentoCardClass} rounded-3xl overflow-hidden relative min-h-[300px] flex items-center justify-center group`}>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622979135228-5b44351c72a0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent"></div>
            <div className="relative z-10 text-center font-sans">
               <div className="w-20 h-20 bg-hama-gold rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-3 shadow-2xl shadow-hama-gold/20">
                  <Box size={40} className="text-black" />
               </div>
               <h3 className="text-text-primary font-bold text-3xl serif font-sans">Immersive Content</h3>
               <p className="text-hama-gold text-[10px] font-black uppercase tracking-[0.4em] mt-3">WebXR • Unity • Professional XR</p>
               <button className="mt-8 px-8 py-3 bg-white/5 hover:bg-hama-gold hover:text-black backdrop-blur border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                  Assemble 3D Projects
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <div className={`${bentoCardClass} p-8 rounded-2xl relative overflow-hidden`}>
               <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-3 relative z-10">
                  <Settings size={16} className="text-hama-gold" /> System Configuration
               </h4>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-hama-gold uppercase tracking-widest ml-1">Platform Target</label>
                     <select
                        className={`w-full p-4 rounded-2xl text-xs ${inputBaseClass}`}
                        value={metadata.platform || 'WebXR'}
                        onChange={(e) => onChange({ ...metadata, platform: e.target.value as any })}
                     >
                        <option value="WebXR" className="bg-[#111]">WebXR (Mobile/Desktop)</option>
                        <option value="Unity" className="bg-[#111]">Unity Content Engine</option>
                        <option value="Unreal" className="bg-[#111]">Unreal Engine Content</option>
                     </select>
                  </div>

                  <label className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer group hover:border-hama-gold/30 relative z-10">
                     <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-hama-gold focus:ring-hama-gold" />
                     <div>
                        <p className="text-xs font-bold text-text-primary group-hover:text-hama-gold transition-colors">Require XR Hardware</p>
                        <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-1">Block access on standard devices</p>
                     </div>
                  </label>
               </div>
            </div>

            <div className={`${bentoCardClass} p-8 rounded-2xl relative overflow-hidden`}>
               <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-3 relative z-10">
                  <Smartphone size={16} className="text-hama-gold" /> Hardware Compatibility
               </h4>
               <div className="flex flex-wrap gap-2 relative z-10">
                  {['Meta Quest 3', 'Apple Vision Pro', 'Mobile AR Support'].map(device => (
                     <span key={device} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-hama-gold/60">
                        {device}
                     </span>
                  ))}
                  <button className="px-4 py-2 border border-dashed border-white/20 rounded-xl text-[9px] font-black text-text-muted/40 hover:border-hama-gold hover:text-hama-gold transition-all uppercase tracking-widest">+ Add</button>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- SCORM / HTML5 EDITOR ---
export const ScormEditor: React.FC<EditorProps> = ({ metadata, onChange }) => {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className={`${bentoCardClass} border-dashed border-2 p-16 flex flex-col items-center justify-center text-center hover:border-hama-gold/30 transition-all cursor-pointer group font-sans relative overflow-hidden`}>
            <div className="w-20 h-20 bg-hama-gold/10 rounded-3xl flex items-center justify-center mb-6 border border-hama-gold/20 group-hover:scale-110 transition-transform relative z-10">
               <Globe size={40} className="text-hama-gold" />
            </div>
            <h3 className="text-text-primary font-bold text-xl serif relative z-10">Upload Interactive Package</h3>
            <p className="text-text-secondary text-sm mt-3 max-w-sm font-light relative z-10">Drag and drop SCORM/xAPI packages here (.zip)</p>
            <div className="flex gap-3 mt-8 relative z-10">
               {['SCORM 1.2', 'SCORM 2004', 'CMI5', 'HTML5'].map(std => (
                  <span key={std} className={goldBadgeClass}>{std}</span>
               ))}
            </div>
         </div>

         <div className="glass border-hama-gold/30 rounded-2xl p-6 flex gap-4 font-sans relative overflow-hidden bg-hama-gold/5">
            <div className="mt-1 relative z-10"><WifiOff size={20} className="text-hama-gold" /></div>
            <div className="relative z-10">
               <h4 className="text-sm font-bold text-text-primary uppercase tracking-widest serif">Offline Compatibility</h4>
               <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  Interactive content supports offline access. Ensure the package manifest is correctly configured for local caching.
               </p>
               <label className="flex items-center gap-3 mt-6 cursor-pointer group">
                  <input
                     type="checkbox"
                     checked={metadata.offlineAvailable || false}
                     onChange={(e) => onChange({ ...metadata, offlineAvailable: e.target.checked })}
                     className="w-5 h-5 rounded border-white/10 bg-white/5 text-hama-gold focus:ring-hama-gold"
                  />
                  <span className="text-xs font-black text-text-muted uppercase tracking-widest group-hover:text-hama-gold transition-colors">Enable Local Support Caching</span>
               </label>
            </div>
         </div>
      </div>
   );
};

// --- EXTERNAL EMBED EDITOR ---
export const EmbedEditor: React.FC<EditorProps> = ({ metadata, onChange }) => {
   const [urlInput, setUrlInput] = useState('');

   const generateEmbedCode = () => {
      if (!urlInput) return;

      // Smart Detection Logic
      let embedCode = '';

      // YouTube
      const ytMatch = urlInput.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
         embedCode = `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${ytMatch[1]}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      }

      // Vimeo
      else if (urlInput.match(/vimeo\.com/)) {
         const vimeoMatch = urlInput.match(/vimeo\.com\/(\d+)/);
         if (vimeoMatch) {
            embedCode = `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" width="100%" height="450" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
         }
      }

      // Fallback if no specific provider matched but it looks like a URL
      else if (urlInput.startsWith('http')) {
         embedCode = `<iframe src="${urlInput}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
      }

      if (embedCode) {
         onChange({ ...metadata, embedCode });
         setUrlInput(''); // Clear input after generation
      }
   };

   const clearEmbed = () => {
      onChange({ ...metadata, embedCode: '' });
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
            <div className="space-y-8">
               {/* URL Converter */}
               <div className="glass border-hama-gold/30 rounded-2xl p-6 bg-hama-gold/5 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 text-hama-gold font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                     <RefreshCw size={14} /> Intelligence Generator
                  </div>
                  <div className="flex gap-3">
                     <input
                        type="text"
                        className={`flex-1 px-4 py-3 rounded-xl border ${inputBaseClass}`}
                        placeholder="Paste YouTube, Vimeo, or external URL..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                     />
                     <button
                        onClick={generateEmbedCode}
                        disabled={!urlInput}
                        className="px-6 py-3 bg-hama-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-text-primary active:scale-95 relative z-10"
                     >
                        Generate
                     </button>
                  </div>
                  <div className="flex gap-6 mt-4 relative z-10">
                     <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-widest">
                        <Youtube size={12} className="text-hama-gold" /> YouTube
                     </div>
                     <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-widest">
                        <PlayCircle size={12} className="text-hama-gold" /> Vimeo
                     </div>
                  </div>
               </div>

               <div className={`${bentoCardClass} p-8 rounded-2xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                     <div className="flex items-center gap-4">
                        <Code size={20} className="text-hama-gold" />
                        <h3 className="font-bold text-sm text-text-primary uppercase tracking-widest serif">Content Integration</h3>
                     </div>
                     {metadata.embedCode && (
                        <button onClick={clearEmbed} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                           <Trash2 size={12} /> Remove
                        </button>
                     )}
                  </div>

                  <div className="space-y-6 relative z-10">
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Embed Code (iFrame / HTML)</label>
                        <textarea
                           className={`w-full h-48 px-4 py-3 rounded-2xl text-xs font-mono leading-relaxed ${inputBaseClass}`}
                           placeholder="<iframe src='https://...' width='100%' height='400'></iframe>"
                           value={metadata.embedCode || ''}
                           onChange={(e) => onChange({ ...metadata, embedCode: e.target.value })}
                        ></textarea>
                     </div>

                     <div className="flex items-start gap-4 p-5 bg-amber-500/5 text-amber-500 rounded-2xl border border-amber-500/10">
                        <ShieldAlert size={18} className="shrink-0" />
                        <div className="text-[10px] uppercase font-black tracking-widest">
                           <p className="mb-1">Security Perimeter</p>
                           <p className="opacity-60 leading-relaxed font-light font-sans">
                              Embedded content runs in a restricted context. Ensure the source supports high-fidelity HTTPS.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className={`${bentoCardClass} p-8 rounded-2xl h-full flex flex-col relative overflow-hidden`}>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                     <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1 font-sans">Active Preview</h4>
                     {metadata.embedCode && (
                        <span className="text-[9px] bg-hama-gold/10 text-hama-gold px-3 py-1 rounded-full border border-hama-gold/20 font-black uppercase tracking-widest flex items-center gap-2 animate-pulse font-sans">
                           <Maximize size={10} /> Live
                        </span>
                     )}
                  </div>
                  <div className="bg-black border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center flex-1 min-h-[400px] relative shadow-2xl z-10">
                     {metadata.embedCode ? (
                        <div
                           className="w-full h-full absolute inset-0"
                           dangerouslySetInnerHTML={{ __html: metadata.embedCode }}
                        />
                     ) : (
                        <div className="text-text-muted/10 flex flex-col items-center font-sans">
                           <Globe size={48} className="mb-6 opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Content Signal</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
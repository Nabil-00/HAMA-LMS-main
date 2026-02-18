import React from 'react';
import { Award, Download, Share2, ShieldCheck, Calendar, User } from 'lucide-react';

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
    onClose?: () => void;
}

const CertificatePreview: React.FC<CertificateProps> = ({
    studentName = "Nabeel Ismail",
    courseTitle = "Advanced Hausa Lyricism & Poetry",
    completionDate = "February 15, 2026",
    certificateId = "HAMA-2026-X892",
    onClose
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-10 animate-in fade-in duration-500 overflow-y-auto">
            <div className="w-full max-w-5xl flex flex-col items-center py-10">

                {/* Actions Header */}
                <div className="w-full flex justify-between items-center mb-10 font-sans">
                    <div className="flex items-center gap-4">
                        <img src="/hama_logo.png" alt="H" className="w-12 h-12 object-contain" />
                        <div>
                            <h2 className="text-xl font-bold text-text-primary serif">Certification Earned</h2>
                            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">Issued by Hausa Music Academy</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-hama-gold hover:bg-white/10 transition-all">
                            <Share2 size={16} /> Share Achievement
                        </button>
                        <button className="flex items-center gap-3 px-8 py-3 bg-hama-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-hama-gold/20 hover:bg-text-primary transition-all">
                            <Download size={16} /> Save Document
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-text-muted hover:text-text-primary transition-colors ml-4 text-[10px] font-black uppercase tracking-widest">
                                Close View
                            </button>
                        )}
                    </div>
                </div>

                {/* The Certificate Paper */}
                <div className="w-full aspect-[1.414/1] bg-white text-[#1a1a1a] shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm p-12 md:p-24 relative overflow-hidden flex flex-col items-center justify-between border-[16px] border-double border-hama-gold/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-hama-gold/5 rounded-bl-[200px] z-0" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-hama-gold/5 rounded-tr-[200px] z-0" />

                    <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <Award size={64} className="text-hama-gold mb-8" />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-hama-gold/60 mb-12">Certificate of Completion</h3>

                        <p className="text-[14px] font-medium serif italic text-gray-500 mb-4">This is to certify that</p>
                        <h4 className="text-5xl md:text-6xl font-black serif mb-10 tracking-tight text-black">{studentName}</h4>

                        <p className="text-[14px] font-medium serif italic text-gray-500 mb-4">Has successfully completed the professional curriculum of</p>
                        <h5 className="text-3xl md:text-4xl font-bold serif text-hama-gold mb-16">{courseTitle}</h5>
                    </div>

                    <div className="relative z-10 w-full grid grid-cols-3 gap-12 items-end">
                        <div className="text-left">
                            <div className="flex items-center gap-3 text-gray-400 mb-2">
                                <Calendar size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Date of Issue</span>
                            </div>
                            <div className="text-[13px] font-bold serif">{completionDate}</div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 border border-hama-gold/30 rounded-full flex items-center justify-center mb-4 relative">
                                <img src="/hama_logo.png" alt="Seal" className="w-20 h-20 object-contain brightness-0 contrast-200 opacity-80" />
                                <div className="absolute inset-0 bg-hama-gold/10 rounded-full mix-blend-overlay" />
                            </div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{certificateId}</div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center justify-end gap-3 text-gray-400 mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Authorized Signatory</span>
                            </div>
                            <div className="h-[2px] w-48 bg-gray-200 ml-auto mb-4" />
                            <div className="text-[13px] font-bold serif">HAMA Academy Management</div>
                        </div>
                    </div>

                    {/* Subtle Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-25deg]">
                        <img src="/hama_logo.png" alt="HAMA" className="w-[800px] grayscale brightness-0" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificatePreview;

import React from 'react';
import { Award, Download, Share2, ShieldCheck, Calendar, User, X } from 'lucide-react';

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
    onClose?: () => void;
}

const CertificatePreview: React.FC<CertificateProps> = ({
    studentName,
    courseTitle,
    completionDate,
    certificateId,
    onClose
}) => {
    const handleDownload = () => {
        // Basic print-to-PDF approach for now
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'HAMA Academy Certification',
                text: `I just earned a certification in ${courseTitle} from HAMA Academy!`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert('Sharing is not supported on this browser. Copy the URL to share your achievement!');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10 animate-in fade-in duration-700 overflow-y-auto print:p-0 print:bg-white">
            <div className="w-full max-w-5xl flex flex-col items-center py-10 print:py-0">

                {/* Actions Header - Hidden in Print */}
                <div className="w-full flex justify-between items-center mb-10 font-sans print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hama-gold/10 border border-hama-gold/20 rounded-xl flex items-center justify-center">
                            <img src="/hama_logo.png" alt="H" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary serif">Certification Earned</h2>
                            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">Issued by Hausa Music Academy</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-hama-gold hover:bg-white/10 transition-all"
                        >
                            <Share2 size={16} /> Share Achievement
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-3 px-8 py-3 bg-hama-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-hama-gold/20 hover:bg-text-primary transition-all"
                        >
                            <Download size={16} /> Save Document
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 rounded-2xl text-text-muted hover:text-text-primary transition-colors ml-4 text-[10px] font-black uppercase tracking-widest border border-white/5"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* The Certificate Paper */}
                <div id="certificate-content" className="w-full aspect-[1.414/1] bg-white text-[#1a1a1a] shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm p-12 md:p-24 relative overflow-hidden flex flex-col items-center justify-between border-[20px] border-double border-hama-gold/20 print:shadow-none print:border-black print:m-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-hama-gold/5 rounded-bl-[200px] z-0 print:hidden" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-hama-gold/5 rounded-tr-[200px] z-0 print:hidden" />

                    <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <div className="mb-8 p-4 bg-hama-gold/10 rounded-full">
                            <Award size={64} className="text-hama-gold" />
                        </div>
                        <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-hama-gold mb-12">Certificate of Completion</h3>

                        <p className="text-[16px] font-medium serif italic text-gray-500 mb-6">This is to certify that</p>
                        <h4 className="text-5xl md:text-7xl font-black serif mb-12 tracking-tight text-black border-b-2 border-hama-gold/30 pb-4 inline-block">{studentName}</h4>

                        <p className="text-[16px] font-medium serif italic text-gray-500 mb-6">Has successfully completed the professional curriculum of</p>
                        <h5 className="text-3xl md:text-5xl font-bold serif text-hama-gold mb-16">{courseTitle}</h5>
                    </div>

                    <div className="relative z-10 w-full grid grid-cols-3 gap-12 items-end">
                        <div className="text-left border-l-2 border-hama-gold/20 pl-6">
                            <div className="flex items-center gap-3 text-gray-400 mb-2">
                                <Calendar size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Date of Issue</span>
                            </div>
                            <div className="text-[15px] font-bold serif">{completionDate}</div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-28 h-28 border-4 border-double border-hama-gold/30 rounded-full flex items-center justify-center mb-4 relative">
                                <img src="/hama_logo.png" alt="Seal" className="w-20 h-20 object-contain brightness-0 contrast-200 opacity-90" />
                                <div className="absolute inset-0 bg-hama-gold/5 rounded-full" />
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-sans">{certificateId}</div>
                        </div>

                        <div className="text-right border-r-2 border-hama-gold/20 pr-6">
                            <div className="flex items-center justify-end gap-3 text-gray-400 mb-4">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Authorized Signatory</span>
                            </div>
                            <div className="h-[2px] w-full bg-gradient-to-l from-hama-gold/40 to-transparent mb-4" />
                            <div className="text-[15px] font-bold serif">HAMA Academy Management</div>
                        </div>
                    </div>

                    {/* Subtle Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] rotate-[-25deg] z-0">
                        <img src="/hama_logo.png" alt="HAMA" className="w-[900px] grayscale brightness-0" />
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    #certificate-content, #certificate-content * { visibility: visible; }
                    #certificate-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                    }
                }
            `}} />
        </div>
    );
};

export default CertificatePreview;

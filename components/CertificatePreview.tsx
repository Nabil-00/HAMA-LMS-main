import React, { useState, useRef } from 'react';
import { Award, Download, Share2, Calendar, X } from './icons/HamaUIIcons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import BrandLogo from './ui/BrandLogo';

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
    /** URL of the server-generated PDF stored in Supabase storage.
     *  When provided the download button links directly to this URL.
     *  When null/undefined (legacy records) the client-side html2canvas fallback is used. */
    certificateUrl?: string | null;
    onClose?: () => void;
}

const CertificatePreview: React.FC<CertificateProps> = ({
    studentName,
    courseTitle,
    completionDate,
    certificateId,
    certificateUrl,
    onClose
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        // If a server-generated PDF URL exists, download it directly.
        // This avoids html2canvas entirely and produces a higher-quality PDF.
        if (certificateUrl) {
            const link = document.createElement('a');
            link.href = certificateUrl;
            link.download = `${studentName.replace(/\s+/g, '_')}_Certificate.pdf`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Legacy fallback: generate PDF client-side using html2canvas + jsPDF.
        // This path is used for old certificate records that pre-date the server-side pipeline.
        console.warn(
            '[CertificatePreview] No server-generated PDF URL available — using client-side fallback. ' +
            'Configure BROWSER_WS_ENDPOINT in Supabase secrets to enable server-side PDF generation.'
        );

        if (!certificateRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // A4 size: 297mm x 210mm (Landscape)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
            pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
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
                    <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-10 font-sans print:hidden gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-hama-gold/10 border border-hama-gold/20 rounded-xl flex items-center justify-center">
                                <BrandLogo variant="icon" size="xs" />
                            </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-text-primary serif">Certification Earned</h2>
                            <p className="text-xs md:text-[10px] text-text-muted uppercase tracking-[0.2em] font-black">Issued by HAMA Academy</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-hama-gold hover:bg-white/10 transition-all"
                        >
                            <Share2 size={14} /> <span className="hidden sm:inline">Share Link</span><span className="sm:hidden text-xs">Share</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2.5 md:py-3 bg-hama-gold text-black rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-hama-gold/20 hover:bg-black hover:text-hama-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={14} className={isGenerating ? 'animate-bounce' : ''} />
                            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                            <span className="sm:hidden text-xs">{isGenerating ? 'Wait...' : 'Download'}</span>
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2.5 md:p-3 bg-white/5 rounded-2xl text-text-muted hover:text-text-primary transition-colors text-[10px] font-black uppercase tracking-widest border border-white/5"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* The Certificate Paper */}
                <div ref={certificateRef} id="certificate-content" className="w-full aspect-[1/1.414] md:aspect-[1.414/1] bg-white text-[#1a1a1a] shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm p-8 md:p-16 lg:p-24 relative overflow-hidden flex flex-col items-center justify-between border-[10px] md:border-[20px] border-double border-hama-gold/20 print:shadow-none print:border-black print:m-0 print:w-[297mm] print:h-[210mm]">
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-hama-gold/5 rounded-bl-[200px] z-0 print:hidden" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-hama-gold/5 rounded-tr-[200px] z-0 print:hidden" />

                    <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <div className="mb-4 md:mb-8 p-3 md:p-4 bg-hama-gold/10 rounded-full">
                            <Award className="text-hama-gold w-10 h-10 md:w-16 md:h-16" />
                        </div>
                        <h3 className="text-xs md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.6em] text-hama-gold mb-6 md:mb-10">Certificate of Completion</h3>

                        <p className="text-[12px] md:text-[16px] font-medium serif italic text-gray-500 mb-2 md:mb-4">This is to certify that</p>
                        <h4 className="text-2xl md:text-5xl lg:text-6xl font-black serif mb-4 md:mb-8 tracking-tight text-black border-b-2 border-hama-gold/30 pb-2 md:pb-4 inline-block">{studentName}</h4>

                        <p className="text-[12px] md:text-[16px] font-medium serif italic text-gray-500 mb-2 md:mb-4">Has successfully completed the professional curriculum of</p>
                        <h5 className="text-xl md:text-3xl lg:text-4xl font-bold serif text-hama-gold mb-6 md:mb-12">{courseTitle}</h5>
                    </div>

                    <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-end">
                        <div className="text-center md:text-left border-l-0 md:border-l-2 border-hama-gold/20 pl-0 md:pl-6">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-1 md:mb-2">
                                <Calendar className="w-[12px] h-[12px] md:w-[14px] md:h-[14px]" />
                                <span className="text-xs md:text-[9px] font-black uppercase tracking-[0.2em] leading-none">Date of Issue</span>
                            </div>
                            <div className="text-[12px] md:text-[15px] font-bold serif">{completionDate}</div>
                        </div>

                        <div className="flex flex-col items-center order-first md:order-none">
                            <div className="w-20 h-20 md:w-28 md:h-28 border-4 border-double border-hama-gold/30 rounded-full flex items-center justify-center mb-2 md:mb-4 relative">
                                <BrandLogo variant="mono-dark" size="lg" className="h-14 md:h-20" />
                                <div className="absolute inset-0 bg-hama-gold/5 rounded-full" />
                            </div>
                            <div className="text-[10px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-sans">{certificateId}</div>
                        </div>

                        <div className="text-center md:text-right border-r-0 md:border-r-2 border-hama-gold/20 pr-0 md:pr-6">
                            <div className="flex items-center justify-center md:justify-end gap-2 text-gray-400 mb-2 md:mb-4">
                                <span className="text-xs md:text-[9px] font-black uppercase tracking-[0.2em] leading-none">Authorized Signatory</span>
                            </div>
                            <div className="h-[1px] md:h-[2px] w-full bg-gradient-to-l from-hama-gold/40 to-transparent mb-2 md:mb-4 hidden md:block" />
                            <div className="text-[12px] md:text-[15px] font-bold serif">HAMA Academy Management</div>
                        </div>
                    </div>

                    {/* Subtle Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] rotate-[-25deg] z-0" aria-hidden="true">
                        <BrandLogo variant="watermark" size="lg" className="h-auto w-[900px]" />
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        size: landscape;
                        margin: 0;
                    }
                    body * { visibility: hidden; }
                    #certificate-content, #certificate-content * { visibility: visible; }
                    #certificate-content {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                        margin: 0;
                        padding: 2cm;
                    }
                }
            `}} />
        </div>
    );
};

export default CertificatePreview;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Copy, CheckCircle, ExternalLink } from './icons/HamaUIIcons';
import { Certificate } from '../types';

interface CertificateDisplayProps {
  certificate: Certificate;
  userName: string;
  courseTitle: string;
  // htmlContent is no longer used — kept for backward compatibility but ignored.
  // The React template below is the canonical rendering, matching the PDF output.
  htmlContent?: string;
}

const CertificateDisplay: React.FC<CertificateDisplayProps> = ({
  certificate,
  userName,
  courseTitle,
}) => {
  const [copied, setCopied] = useState(false);

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificate.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Download handler:
   * - If a server-generated PDF URL exists, download it directly (no client-side rendering needed).
   * - If not (legacy record), fall back to opening the raw HTML in a print dialog.
   */
  const handleDownload = () => {
    if (certificate.certificateUrl) {
      // Trigger a native browser download of the stored PDF
      const link = document.createElement('a');
      link.href = certificate.certificateUrl;
      link.download = `${userName.replace(/\s+/g, '_')}_Certificate.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Legacy fallback: open a new tab so the user can use their browser's print-to-PDF
      console.warn(
        '[CertificateDisplay] No stored PDF URL available for this certificate (legacy record). ' +
        'Opening a print-friendly view instead. Configure BROWSER_WS_ENDPOINT in Supabase secrets to enable server-side PDF generation.'
      );
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] mb-4">
          <Award className="w-10 h-10 text-[#1A1A1A]" />
        </div>
        <h1 className="text-3xl font-bold text-[#F5F5DC] mb-2">Certificate of Completion</h1>
        <p className="text-[#A0A0A0]">You've successfully completed {courseTitle}</p>
      </motion.div>

      {/* Certificate Preview — React version of the canonical PDF template */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 mb-6 relative overflow-hidden"
      >
        {/* Outer gold border */}
        <div className="absolute inset-4 border-4 border-[#D4AF37] rounded-lg pointer-events-none" />
        {/* Inner gold border */}
        <div className="absolute inset-6 border border-[#D4AF37]/50 rounded pointer-events-none" />

        {/* Corner accents */}
        <div className="absolute top-[42px] left-[42px] w-5 h-5 border-2 border-[#D4AF37] border-r-0 border-b-0 pointer-events-none" />
        <div className="absolute top-[42px] right-[42px] w-5 h-5 border-2 border-[#D4AF37] border-l-0 border-b-0 pointer-events-none" />
        <div className="absolute bottom-[42px] left-[42px] w-5 h-5 border-2 border-[#D4AF37] border-r-0 border-t-0 pointer-events-none" />
        <div className="absolute bottom-[42px] right-[42px] w-5 h-5 border-2 border-[#D4AF37] border-l-0 border-t-0 pointer-events-none" />

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
          <span className="text-[120px] text-[#D4AF37]">♫</span>
        </div>

        <div className="relative z-10 text-center py-8">
          {/* Logo */}
          <div className="text-5xl mb-3">🎵</div>
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-1 tracking-widest">HAMA LMS</h2>
          <p className="text-xs text-[#A0A0A0] tracking-[5px] uppercase mb-5">Learning Management System</p>

          {/* Divider */}
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-5" />

          <h3 className="text-2xl font-serif text-[#F5F5DC] mb-5 tracking-wide">Certificate of Completion</h3>

          <p className="text-[#A0A0A0] text-sm mb-1">This is to certify that</p>
          <h4 className="text-3xl font-serif text-[#F5F5DC] mb-5">{userName}</h4>

          <p className="text-[#A0A0A0] text-sm mb-2">has successfully completed the course</p>
          <h5 className="text-xl text-[#D4AF37] font-semibold mb-6 max-w-lg mx-auto leading-relaxed">{courseTitle}</h5>

          {/* Small divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#555] to-transparent mx-auto mb-6" />

          {/* Footer row */}
          <div className="flex justify-center gap-16 mt-2">
            <div className="text-center">
              <p className="text-xs text-[#A0A0A0] mb-1 tracking-wider uppercase">Date Issued</p>
              <p className="text-[#F5F5DC] text-sm">{issuedDate}</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-px bg-[#333] mx-auto mb-2" />
              <p className="text-xs text-[#A0A0A0] mb-1 tracking-wider uppercase">Authorized Signature</p>
              <p className="text-lg font-serif text-[#D4AF37]">HAMA LMS</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#A0A0A0] mb-1 tracking-wider uppercase">Certificate ID</p>
              <p className="text-[#D4AF37] font-mono text-sm">{certificate.uniqueCode}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2"
        >
          {certificate.certificateUrl ? (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Print / Save as PDF
            </>
          )}
        </button>

        <button
          onClick={handleCopyCode}
          className="btn-secondary flex items-center gap-2"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Certificate ID
            </>
          )}
        </button>
      </div>

      {/* Verification info */}
      <div className="mt-8 glass-card p-4 text-center">
        <p className="text-sm text-[#A0A0A0]">
          Verify this certificate at: <br />
          <span className="text-[#D4AF37] font-mono">
            yourdomain.com/verify/{certificate.uniqueCode}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CertificateDisplay;

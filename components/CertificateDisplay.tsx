import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle, Copy } from 'lucide-react';
import { Certificate } from '../types';

interface CertificateDisplayProps {
  certificate: Certificate;
  userName: string;
  courseTitle: string;
  htmlContent?: string;
}

const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ 
  certificate, 
  userName, 
  courseTitle,
  htmlContent 
}) => {
  const [showHtml, setShowHtml] = useState(false);
  const [copied, setCopied] = useState(false);

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificate.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (htmlContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
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

      {/* Certificate Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 mb-6 relative overflow-hidden"
      >
        {/* Gold Border */}
        <div className="absolute inset-4 border-4 border-[#D4AF37] rounded-lg pointer-events-none" />
        <div className="absolute inset-6 border border-[#D4AF37]/50 rounded pointer-events-none" />
        
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <span className="text-[120px] text-[#D4AF37]">♫</span>
        </div>

        <div className="relative z-10 text-center py-8">
          {/* Logo */}
          <div className="text-5xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-1">HAMA LMS</h2>
          <p className="text-sm text-[#A0A0A0] tracking-[3px] uppercase mb-6">Learning Management System</p>

          <h3 className="text-3xl font-serif text-[#F5F5DC] mb-4">Certificate of Completion</h3>

          <p className="text-[#A0A0A0] mb-2">This is to certify that</p>
          <h4 className="text-3xl font-serif text-[#F5F5DC] mb-6">{userName}</h4>

          <p className="text-[#A0A0A0] mb-2">has successfully completed the course</p>
          <h5 className="text-xl text-[#D4AF37] font-semibold mb-6">{courseTitle}</h5>

          <div className="flex justify-center gap-12 mt-6">
            <div>
              <p className="text-xs text-[#A0A0A0] mb-1">Date Issued</p>
              <p className="text-[#F5F5DC]">{issuedDate}</p>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0] mb-1">Certificate ID</p>
              <p className="text-[#D4AF37] font-mono">{certificate.uniqueCode}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#333] max-w-xs mx-auto">
            <p className="text-xs text-[#A0A0A0] mb-2">Authorized Signature</p>
            <p className="text-2xl font-serif text-[#D4AF37]">HAMA LMS</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handlePrint}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download / Print
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

      {/* Verification Info */}
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

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { CertificateVerification } from '../types';

const CertificateVerificationPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState(code || '');

  const verifyCertificate = async (certCode: string) => {
    if (!certCode) return;
    
    setLoading(true);
    setError(null);
    setVerification(null);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/verify-certificate?code=${certCode}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      
      if (data.valid) {
        setVerification({
          valid: true,
          certificate: {
            id: data.certificate.id,
            uniqueCode: data.certificate.uniqueCode,
            issuedAt: data.certificate.issuedAt,
            userId: '',
            courseId: ''
          },
          userName: data.certificate.userName,
          courseTitle: data.certificate.courseTitle
        });
      } else {
        setVerification({
          valid: false,
          message: data.message || 'Certificate not found'
        });
      }
    } catch (err) {
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      verifyCertificate(code);
    } else {
      setLoading(false);
    }
  }, [code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(searchCode);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] mb-4">
            <Award className="w-8 h-8 text-[#1A1A1A]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F5F5DC] mb-2">Certificate Verification</h1>
          <p className="text-[#A0A0A0]">Verify the authenticity of HAMA LMS certificates</p>
        </motion.div>

        {/* Search Form (if no code provided) */}
        {!code && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="glass-card p-6 mb-6"
          >
            <label className="block text-[#A0A0A0] mb-2">Enter Certificate ID</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="e.g., HAMA-ABC123-XYZ"
                className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-[#F5F5DC] placeholder-[#666] focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                disabled={loading || !searchCode}
                className="btn-primary px-6 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Verify
              </button>
            </div>
          </motion.form>
        )}

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
            <p className="text-[#A0A0A0]">Verifying certificate...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Invalid Certificate */}
        {verification && !verification.valid && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Invalid Certificate</h2>
            <p className="text-[#A0A0A0]">{verification.message}</p>
          </motion.div>
        )}

        {/* Valid Certificate */}
        {verification && verification.valid && verification.certificate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-[#1A1A1A]" />
              </div>
              <h2 className="text-2xl font-bold text-[#F5F5DC] mb-2">Valid Certificate</h2>
              <p className="text-[#A0A0A0]">This certificate is authentic and verified</p>
            </div>

            <div className="space-y-4">
              <div className="glass-dark p-4 rounded-lg">
                <p className="text-sm text-[#A0A0A0] mb-1">Student Name</p>
                <p className="text-lg text-[#F5F5DC] font-semibold">{verification.userName}</p>
              </div>
              
              <div className="glass-dark p-4 rounded-lg">
                <p className="text-sm text-[#A0A0A0] mb-1">Course</p>
                <p className="text-lg text-[#F5F5DC] font-semibold">{verification.courseTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-dark p-4 rounded-lg">
                  <p className="text-sm text-[#A0A0A0] mb-1">Date Issued</p>
                  <p className="text-[#F5F5DC]">{verification.certificate.issuedAt}</p>
                </div>
                <div className="glass-dark p-4 rounded-lg">
                  <p className="text-sm text-[#A0A0A0] mb-1">Certificate ID</p>
                  <p className="text-[#D4AF37] font-mono">{verification.certificate.uniqueCode}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerificationPage;

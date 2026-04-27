import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, ArrowRight, RotateCcw } from './icons/HamaUIIcons';
import { useQuiz } from '../hooks/useQuiz';
import { useAuth } from '../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuizPlayerProps {
  quizId: string;
  courseId: string;
  courseName?: string;
  onComplete?: (passed: boolean, score: number) => void;
  onCertificateGenerated?: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizId,
  courseId,
  courseName,
  onComplete,
  onCertificateGenerated
}) => {
  const { user } = useAuth();
  const {
    quiz,
    loading,
    error,
    currentQuestionIndex,
    selectedAnswers,
    submitted,
    result,
    certificate,
    loadQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    loadAttempts,
    loadCertificate,
    generateCertificate,
    reset
  } = useQuiz();

  const [showResult, setShowResult] = useState(false);
  const [certificateNameInput, setCertificateNameInput] = useState('');
  const [isCertificateNameConfirmed, setIsCertificateNameConfirmed] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQuiz(quizId);
    loadAttempts(quizId);
    loadCertificate(courseId);
  }, [quizId, courseId]);

  useEffect(() => {
    if (submitted && result) {
      setShowResult(true);
      if (result.passed) {
        setCertificateNameInput(user?.name?.trim() || '');
        setIsCertificateNameConfirmed(false);
      }
      onComplete?.(result.passed, result.score);
    }
  }, [submitted, result, user?.name]);

  const handleGenerateCertificate = async () => {
    await generateCertificate(courseId);
    onCertificateGenerated?.();
  };

  const handleDownloadCertificate = async () => {
    const el = certificateRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0f0f0f',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`HAMA-Certificate-${certificate?.uniqueCode ?? 'download'}.pdf`);
    } catch (err) {
      console.error('Certificate download failed:', err);
    }
  };

  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#F5F5DC] mb-2">Error</h3>
        <p className="text-[#A0A0A0]">{error}</p>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const learnerName = certificateNameInput.trim();
  const certificateCourseName = (courseName || quiz.title || 'Course').trim();
  const certificateDate = new Date(certificate?.issuedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Result Screen
  if (showResult && result) {
    if (!result.passed) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-2xl mx-auto text-center border-t-4 border-red-500/50"
        >
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-500/20">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-[#F5F5DC] mb-2 serif">Try Again</h2>
          <p className="text-[#A0A0A0] mb-8 font-sans">
            You have not met the required mark yet. Review the lesson and retake the quiz.
          </p>
          <button
            onClick={() => {
              reset();
              loadQuiz(quizId);
              setShowResult(false);
              setCertificateNameInput('');
              setIsCertificateNameConfirmed(false);
            }}
            className="text-[#A0A0A0] hover:text-[#D4AF37] flex items-center justify-center gap-2 mx-auto text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Take Quiz Again
          </button>
        </motion.div>
      );
    }

    if (!isCertificateNameConfirmed) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-card border border-[#D4AF37]/30 bg-gradient-to-b from-[#171717] to-[#101010] px-8 py-10 md:px-12 md:py-12 text-center">
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-[#D4AF37] uppercase font-black">HAMA ACADEMY</p>
            <h2 className="mt-4 text-2xl md:text-3xl font-black text-[#F5F5DC] uppercase tracking-[0.12em]">Certificate Name</h2>
            <p className="mt-4 text-sm text-[#A0A0A0] max-w-xl mx-auto">
              Enter your name exactly as you want it to appear on your certificate.
            </p>

            <form
              className="mt-8 max-w-xl mx-auto"
              onSubmit={(event) => {
                event.preventDefault();
                if (!certificateNameInput.trim()) return;
                setIsCertificateNameConfirmed(true);
              }}
            >
              <label htmlFor="certificate-name" className="sr-only">Certificate name</label>
              <input
                id="certificate-name"
                type="text"
                value={certificateNameInput}
                onChange={(event) => setCertificateNameInput(event.target.value)}
                placeholder="Enter your full name"
                maxLength={60}
                className="w-full rounded-xl border border-[#D4AF37]/30 bg-black/30 px-4 py-3 text-center text-lg text-[#F5F5DC] placeholder:text-[#6f6f6f] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              />
              <p className="mt-2 text-xs text-[#A0A0A0]">{certificateNameInput.length}/60 characters</p>

              <button
                type="submit"
                disabled={!certificateNameInput.trim()}
                className="mt-6 px-8 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.01] transition-transform disabled:opacity-50"
              >
                Continue to Certificate
              </button>
            </form>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div
          ref={certificateRef}
          className="relative border border-[#D4AF37]/30 rounded-xl px-8 py-12 md:px-16 md:py-16 text-center overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #1a1600 0%, #0f0f0f 40%, #1a1400 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 50%, transparent 100%)',
              borderRadius: 'inherit',
              zIndex: 0,
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(212,175,55,0.7) 70%, transparent 100%)',
              zIndex: 1,
            }}
          />

          <div className="relative z-10">
            <section>
              <p className="text-[10px] md:text-xs tracking-[0.45em] text-[#D4AF37] uppercase font-black">HAMA ACADEMY</p>
              <h2 className="mt-3 text-2xl md:text-4xl font-black text-[#F5F5DC] tracking-[0.18em] uppercase">Certificate of Completion</h2>
            </section>

            <section className="mt-14 md:mt-16 space-y-6 md:space-y-8">
              <p className="text-[10px] md:text-xs tracking-[0.35em] text-[#A0A0A0] uppercase font-bold">This is to certify that</p>
              <p className="text-3xl md:text-5xl text-[#F5F5DC] font-black serif break-words">{learnerName}</p>
              <p className="text-sm md:text-base text-[#A0A0A0]">successfully completed the course</p>
              <p className="text-xl md:text-3xl text-[#D4AF37] font-bold serif break-words">{certificateCourseName}</p>
            </section>

            {!certificate && (
              <div className="mt-10">
                <button
                  onClick={handleGenerateCertificate}
                  disabled={loading}
                  className="px-8 py-3 bg-[#D4AF37] text-[#1A1A1A] rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.01] transition-transform disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Certificate'}
                </button>
              </div>
            )}

            <section className="mt-12 pt-8 border-t border-[#D4AF37]/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 text-center md:text-left items-end">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">Authorized By</p>
                  <p className="mt-2 text-sm text-[#F5F5DC]">HAMA Academy Instructor</p>
                </div>

                <div className="md:text-center">
                  <p className="text-lg font-black text-[#D4AF37] tracking-[0.25em]">HAMA</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#A0A0A0]">Academy</p>
                </div>

                <div className="md:text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">Date of Print</p>
                  <p className="mt-2 text-sm text-[#F5F5DC]">{certificateDate}</p>
                </div>
              </div>

              <p className="mt-6 text-[11px] text-[#A0A0A0] uppercase tracking-[0.16em]">
                {certificate
                  ? `Verification Code: ${certificate.uniqueCode}`
                  : 'Verification code will appear once generated'}
              </p>
            </section>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)',
              color: '#0f0f0f',
              boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Certificate
          </button>
        </div>

        <button
          onClick={() => {
            reset();
            loadQuiz(quizId);
            setShowResult(false);
            setCertificateNameInput('');
            setIsCertificateNameConfirmed(false);
          }}
          className="text-[#A0A0A0] hover:text-[#D4AF37] flex items-center justify-center gap-2 mx-auto mt-6 text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Take Quiz Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#F5F5DC]">{quiz.title}</h2>
          <div className="flex items-center gap-2 text-[#A0A0A0]">
            <Clock className="w-4 h-4" />
            <span>{answeredCount}/{quiz.questions.length} answered</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass-card p-8 mb-8 border-l-4 border-[#D4AF37] overflow-hidden relative shadow-2xl"
        >
          <div className="noise opacity-5 absolute inset-0 pointer-events-none" />
          <div className="flex items-start gap-6 mb-8 relative z-10">
            <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-[#1A1A1A] font-black text-xl shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
              {currentQuestionIndex + 1}
            </span>
            <p className="text-2xl font-bold text-[#F5F5DC] leading-snug serif">
              {currentQuestion.questionText}
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {['a', 'b', 'c', 'd'].map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              const optionText = currentQuestion[`option${option.toUpperCase() as 'A' | 'B' | 'C' | 'D'}` as keyof typeof currentQuestion];

              return (
                <button
                  key={option}
                  onClick={() => selectAnswer(currentQuestion.id, option)}
                  className={`w-full p-5 rounded-xl text-left transition-all duration-300 flex items-center gap-5 group border-2 ${isSelected
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                      : 'glass-dark border-white/5 hover:border-[#D4AF37]/30 hover:bg-white/5 shadow-lg'
                    }`}
                >
                  <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${isSelected ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'bg-[#1A1A1A] text-[#A0A0A0] group-hover:text-[#D4AF37]'
                    }`}>
                    {option.toUpperCase()}
                  </span>
                  <span className={`text-lg transition-colors font-medium ${isSelected ? 'text-[#F5F5DC]' : 'text-[#A0A0A0] group-hover:text-[#F5F5DC]'}`}>
                    {optionText as string}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question Dots */}
        <div className="hidden md:flex items-center gap-1">
          {quiz.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentQuestionIndex
                  ? 'bg-[#D4AF37] scale-125'
                  : selectedAnswers[q.id]
                    ? 'bg-[#046307]'
                    : 'bg-[#333] hover:bg-[#444]'
                }`}
            />
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={submitQuiz}
            disabled={answeredCount < quiz.questions.length || loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="btn-primary flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;

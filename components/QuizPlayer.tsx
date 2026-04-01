import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Award, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { useQuiz } from '../hooks/useQuiz';

interface QuizPlayerProps {
  quizId: string;
  courseId: string;
  onComplete?: (passed: boolean, score: number) => void;
  onCertificateGenerated?: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quizId,
  courseId,
  onComplete,
  onCertificateGenerated
}) => {
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

  useEffect(() => {
    loadQuiz(quizId);
    loadAttempts(quizId);
    loadCertificate(courseId);
  }, [quizId, courseId]);

  useEffect(() => {
    if (submitted && result) {
      setShowResult(true);
      onComplete?.(result.passed, result.score);
    }
  }, [submitted, result]);

  const handleGenerateCertificate = async () => {
    await generateCertificate(courseId);
    onCertificateGenerated?.();
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
  const hasAnsweredCurrent = !!selectedAnswers[currentQuestion?.id];

  // Result Screen
  if (showResult && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-2xl mx-auto text-center border-t-4 border-[#D4AF37]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${result.passed
              ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-[0_0_30px_rgba(212,175,55,0.4)]'
              : 'bg-red-500/20'
            }`}
        >
          {result.passed ? (
            <Award className="w-12 h-12 text-[#1A1A1A]" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </motion.div>

        <h2 className="text-3xl font-bold text-[#F5F5DC] mb-2 serif italic">
          {result.passed ? 'Abun Alfahari!' : 'Kada Ka Karaya!'}
        </h2>

        <p className="text-[#A0A0A0] mb-8 font-sans">
          {result.passed
            ? 'Kun yi nasara a wannan gwajin cikin nasara'
            : 'Ba ku samu nasara ba a wannan karon. Kada ku karaya!'
          }
        </p>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Your Score', value: `${result.score}%`, color: '#D4AF37' },
            { label: 'Correct', value: `${result.correctCount}/${result.totalQuestions}`, color: '#F5F5DC' },
            { label: 'Required', value: `${quiz.passPercentage}%`, color: '#F5F5DC' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="glass-dark p-4 rounded-xl border border-white/5"
            >
              <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#A0A0A0] mt-1">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {result.passed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            {certificate ? (
              <div className="glass-dark p-6 rounded-xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
                <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0] mb-2">Verification Code</p>
                <p className="text-[#D4AF37] font-mono text-xl tracking-wider">{certificate.uniqueCode}</p>
                <div className="h-px bg-[#D4AF37]/20 my-4" />
                <p className="text-xs text-[#A0A0A0]">Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateCertificate}
                disabled={loading}
                className="w-full py-4 bg-[#D4AF37] text-[#1A1A1A] rounded-xl font-bold flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                <Award className="w-5 h-5" />
                {loading ? 'Generating...' : 'Download Certificate'}
              </button>
            )}
          </motion.div>
        )}

        <button
          onClick={() => {
            reset();
            loadQuiz(quizId);
            setShowResult(false);
          }}
          className="text-[#A0A0A0] hover:text-[#D4AF37] flex items-center justify-center gap-2 mx-auto mt-4 text-sm font-medium transition-colors"
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

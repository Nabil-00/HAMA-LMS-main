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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-2xl mx-auto text-center"
      >
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
          result.passed 
            ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B]' 
            : 'bg-red-500/20'
        }`}>
          {result.passed ? (
            <Award className="w-12 h-12 text-[#D4AF37]" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </div>

        <h2 className="text-3xl font-bold text-[#F5F5DC] mb-2">
          {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
        </h2>
        
        <p className="text-[#A0A0A0] mb-6">
          {result.passed 
            ? 'You have successfully passed the quiz' 
            : 'You did not pass this time. Don\'t give up!'
          }
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-dark p-4 rounded-lg">
            <div className="text-3xl font-bold text-[#D4AF37]">{result.score}%</div>
            <div className="text-sm text-[#A0A0A0]">Your Score</div>
          </div>
          <div className="glass-dark p-4 rounded-lg">
            <div className="text-3xl font-bold text-[#F5F5DC]">{result.correctCount}/{result.totalQuestions}</div>
            <div className="text-sm text-[#A0A0A0]">Correct</div>
          </div>
          <div className="glass-dark p-4 rounded-lg">
            <div className="text-3xl font-bold text-[#F5F5DC]">{quiz.passPercentage}%</div>
            <div className="text-sm text-[#A0A0A0]">Required</div>
          </div>
        </div>

        {result.passed && (
          <div className="mb-6">
            {certificate ? (
              <div className="glass-dark p-4 rounded-lg">
                <p className="text-[#A0A0A0] mb-2">Your Certificate</p>
                <p className="text-[#D4AF37] font-mono text-lg">{certificate.uniqueCode}</p>
                <p className="text-sm text-[#A0A0A0] mt-2">Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateCertificate}
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <Award className="w-5 h-5" />
                {loading ? 'Generating...' : 'Download Certificate'}
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => {
            reset();
            loadQuiz(quizId);
            setShowResult(false);
          }}
          className="btn-secondary flex items-center justify-center gap-2 mx-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
              {currentQuestionIndex + 1}
            </span>
            <p className="text-lg text-[#F5F5DC] leading-relaxed">
              {currentQuestion.questionText}
            </p>
          </div>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd'].map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              const optionText = currentQuestion[`option${option.toUpperCase() as 'A' | 'B' | 'C' | 'D'}` as keyof typeof currentQuestion];
              
              return (
                <button
                  key={option}
                  onClick={() => selectAnswer(currentQuestion.id, option)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-[#D4AF37]/20 border-2 border-[#D4AF37]' 
                      : 'glass-dark border-2 border-transparent hover:border-[#D4AF37]/50'
                  }`}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    isSelected ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'bg-[#333] text-[#A0A0A0]'
                  }`}>
                    {option.toUpperCase()}
                  </span>
                  <span className={isSelected ? 'text-[#F5F5DC]' : 'text-[#A0A0A0]'}>
                    {optionText as string}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] ml-auto" />
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
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentQuestionIndex 
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

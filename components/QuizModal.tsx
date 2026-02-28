import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, XCircle } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
}

interface QuizModalProps {
    title?: string;
    questions?: Question[];
    onComplete?: (score: number) => void;
    onClose?: () => void;
}

const defaultQuestions: Question[] = [
    {
        id: '1',
        text: "Which of these is a core traditional Hausa percussion instrument used in modern music production?",
        options: ["Kalangu (Talking Drum)", "Bata Drum", "Congo", "Steel Pan"],
        correctIndex: 0
    },
    {
        id: '2',
        text: "In music production, what does 'Binaural Audio' primarily enhance for the listener?",
        options: ["Volume", "Spatial positioning", "Pitch", "Bass levels"],
        correctIndex: 1
    }
];

const QuizModal: React.FC<QuizModalProps> = ({
    title = "Module Assessment: Audio Foundations",
    questions = defaultQuestions,
    onComplete,
    onClose
}) => {
    const [currentStep, setCurrentStep] = useState(0); // 0: start, 1: questions, 2: results
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [score, setScore] = useState(0);

    const handleStart = () => {
        setCurrentStep(1);
        setSelectedAnswers(new Array(questions.length).fill(-1));
    };

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Calculate score
            let correctCount = 0;
            selectedAnswers.forEach((answer, index) => {
                if (answer === questions[index].correctIndex) correctCount++;
            });
            const finalScore = Math.round((correctCount / questions.length) * 100);
            setScore(finalScore);
            setCurrentStep(2);
            onComplete?.(finalScore);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(questions.length).fill(-1));
        setCurrentStep(1);
        setScore(0);
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl glass border-hama-gold/10 overflow-hidden flex flex-col bg-bg-secondary animate-in zoom-in-95 duration-300 relative">
                <div className="noise opacity-10" />
                <div className="relative z-10 flex flex-col h-full">

                    {/* Header */}
                    <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-bg-primary/40 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-hama-gold/10 border border-hama-gold/20 rounded-xl flex items-center justify-center text-hama-gold">
                                <HelpCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary serif tracking-tight">{title}</h3>
                                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black mt-1 font-sans">Module Assessment</p>
                            </div>
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary transition-colors">
                                <XCircle size={24} />
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-10 min-h-[400px] flex flex-col justify-center">
                        {currentStep === 0 && (
                            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="w-20 h-20 bg-hama-gold/5 border border-hama-gold/10 rounded-full flex items-center justify-center mx-auto">
                                    <ArrowRight size={32} className="text-hama-gold" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-hama-gold uppercase tracking-[0.4em]">Ready for Assessment?</p>
                                    <p className="text-text-muted font-light leading-relaxed max-w-sm mx-auto font-sans">
                                        This assessment contains {questions.length} questions regarding the recent course module.
                                    </p>
                                </div>
                                <button
                                    onClick={handleStart}
                                    className="px-12 py-4 bg-hama-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-hama-gold/10 hover:bg-text-primary transition-all font-sans"
                                >
                                    Start Assessment
                                </button>
                            </div>
                        )}

                        {currentStep === 1 && currentQuestion && (
                            <div className="space-y-10 animate-in fade-in">
                                <div className="flex justify-between items-end mb-4 font-sans">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                    <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-hama-gold transition-all duration-500"
                                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <h4 className="text-2xl font-bold text-text-primary serif leading-tight">
                                    {currentQuestion.text}
                                </h4>

                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className={`w-full p-6 text-left rounded-2xl border transition-all duration-300 font-sans text-sm ${selectedAnswers[currentQuestionIndex] === idx
                                                ? 'bg-hama-gold/10 border-hama-gold text-text-primary'
                                                : 'bg-white/2 border-white/5 text-text-muted hover:border-hama-gold/30 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-bold ${selectedAnswers[currentQuestionIndex] === idx ? 'bg-hama-gold border-hama-gold text-black' : 'border-white/10'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                {option}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button
                                        disabled={selectedAnswers[currentQuestionIndex] === -1}
                                        onClick={handleNext}
                                        className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary hover:border-hama-gold/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed group font-sans"
                                    >
                                        {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                                        <ArrowRight size={14} className="inline ml-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="text-center space-y-10 animate-in fade-in zoom-in-95">
                                <div className="relative inline-block">
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle
                                            cx="96" cy="96" r="88"
                                            stroke="currentColor" strokeWidth="8"
                                            fill="transparent" className="text-white/5"
                                        />
                                        <circle
                                            cx="96" cy="96" r="88"
                                            stroke="currentColor" strokeWidth="8"
                                            fill="transparent" className="text-hama-gold"
                                            strokeDasharray={552}
                                            strokeDashoffset={552 - (552 * score) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                                        <span className="text-5xl font-black text-text-primary">{score}%</span>
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Final Score</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-3xl font-bold text-text-primary serif italic">
                                        {score >= 80 ? 'Exceptional Mastery' : score >= 50 ? 'Passed' : 'Review Required'}
                                    </h4>
                                    <p className="text-text-secondary text-sm font-light leading-relaxed max-w-sm mx-auto font-sans">
                                        {score >= 80
                                            ? "You did a great job. You can start the next lesson."
                                            : "You passed the assessment. Keep going!"}
                                    </p>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-all font-sans"
                                    >
                                        <RotateCcw size={16} /> Retake Assessment
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex items-center gap-3 px-10 py-4 bg-hama-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-hama-gold/20 hover:bg-text-primary transition-all font-sans"
                                    >
                                        <CheckCircle2 size={16} /> Finish Assessment
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizModal;

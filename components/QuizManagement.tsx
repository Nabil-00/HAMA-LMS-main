import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Check, X, Upload,
  ChevronDown, ChevronUp, AlertCircle, Loader2, Eye, EyeOff,
  FileText, Download
} from 'lucide-react';
import { adminQuizService } from '../services/quizService';
import { Quiz, Question, QuestionStatus } from '../types';

interface QuizManagementProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
}

type View = 'list' | 'edit' | 'import';

const QuizManagement: React.FC<QuizManagementProps> = ({
  courseId,
  courseTitle,
  courseDescription
}) => {
  const [view, setView] = useState<View>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId && courseId !== 'new') {
      loadQuizzes();
    }
  }, [courseId]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await adminQuizService.getCourseQuizzes(courseId);
      setQuizzes(data);
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (quizId: string) => {
    setLoading(true);
    try {
      const data = await adminQuizService.getQuizQuestions(quizId);
      setQuestions(data);
    } catch (err) {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (courseId === 'new') {
      alert('Please save the course first before creating a quiz.');
      return;
    }

    const title = prompt('Enter quiz title:');
    if (!title) return;

    setLoading(true);
    try {
      const quiz = await adminQuizService.createQuiz(courseId, title);
      if (quiz) {
        setQuizzes(prev => [quiz, ...prev]);
        setSelectedQuiz(quiz);
        setQuestions([]);
        setView('edit');
      } else {
        setError('Failed to create quiz. Ensure the course is saved and you have the correct permissions.');
      }
    } catch (err) {
      setError('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await loadQuestions(quiz.id);
    setView('edit');
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? All questions will be lost.')) return;

    setLoading(true);
    try {
      await adminQuizService.deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
        setView('list');
      }
    } catch (err) {
      setError('Failed to delete quiz');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!selectedQuiz) return;

    setLoading(true);
    try {
      const result = await adminQuizService.publishQuiz(selectedQuiz.id);
      if (result.success) {
        await loadQuizzes();
        await loadQuestions(selectedQuiz.id);
        setSelectedQuiz(prev => prev ? { ...prev, status: 'published' } : null);
      } else {
        setError(result.error || 'Failed to publish quiz');
      }
    } catch (err) {
      setError('Failed to publish quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestionStatus = async (questionId: string, status: QuestionStatus) => {
    try {
      await adminQuizService.updateQuestionStatus(questionId, status);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, status } : q
      ));
    } catch (err) {
      setError('Failed to update question');
    }
  };

  const handleSaveQuestion = async (question: Partial<Question>) => {
    try {
      const saved = await adminQuizService.saveQuestion(question);
      if (saved) {
        await loadQuestions(selectedQuiz!.id);
      }
    } catch (err) {
      setError('Failed to save question');
    }
  };

  const handleBulkImport = async (importedQuestions: Partial<Question>[]) => {
    if (!selectedQuiz) return;

    setLoading(true);
    setImportProgress({ current: 0, total: importedQuestions.length });
    try {
      let current = 0;
      for (const q of importedQuestions) {
        await adminQuizService.saveQuestion({
          ...q,
          quizId: selectedQuiz.id,
          status: 'approved' // Auto-approve imported questions for convenience
        });
        current++;
        setImportProgress({ current, total: importedQuestions.length });
      }
      await loadQuestions(selectedQuiz.id);
      setView('edit');
    } catch (err) {
      setError('Failed to import questions');
    } finally {
      setLoading(false);
      setImportProgress(null);
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const approvedCount = questions.filter(q => q.status === 'approved').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F5DC]">Quiz Management</h2>
          <p className="text-[#A0A0A0]">{courseTitle}</p>
        </div>
        <div className="flex gap-3">
          {view !== 'list' && (
            <button
              onClick={() => { setView('list'); setSelectedQuiz(null); }}
              className="btn-secondary"
            >
              Back to List
            </button>
          )}
          {view === 'list' && (
            <button
              onClick={handleCreateQuiz}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quiz List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="glass-card p-8 text-center">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-[#A0A0A0] mb-4">No quizzes yet. Create your first quiz!</p>
              <button onClick={handleCreateQuiz} className="btn-primary">
                Create Quiz
              </button>
            </div>
          ) : (
            quizzes.map(quiz => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#F5F5DC]">{quiz.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${quiz.status === 'published'
                      ? 'bg-green-500/20 text-green-400'
                      : quiz.status === 'draft'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }`}>
                      {quiz.status}
                    </span>
                    <span className="text-sm text-[#A0A0A0]">
                      {quiz.totalQuestions || 0} questions
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectQuiz(quiz)}
                    className="btn-secondary px-4 py-2"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Quiz Edit View */}
      {view === 'edit' && selectedQuiz && (
        <div>
          {/* Quiz Header */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#F5F5DC]">{selectedQuiz.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${selectedQuiz.status === 'published'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {selectedQuiz.status}
                  </span>
                  <span className="text-[#A0A0A0]">
                    {approvedCount}/5 approved questions
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setView('import')}
                  disabled={selectedQuiz.status === 'published'}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Import
                </button>
                <button
                  onClick={handlePublishQuiz}
                  disabled={loading || approvedCount < 5 || selectedQuiz.status === 'published'}
                  className="btn-primary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Publish Quiz
                </button>
              </div>
            </div>
            {approvedCount < 5 && selectedQuiz.status !== 'published' && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Need 5 approved questions to publish (currently {approvedCount})</span>
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[#F5F5DC] mb-4">Questions</h4>
            {questions.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-[#A0A0A0] mb-4">No questions yet. Use bulk import to add questions!</p>
                <button
                  onClick={() => setView('import')}
                  className="btn-primary"
                >
                  Bulk Import
                </button>
              </div>
            ) : (
              questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  isExpanded={expandedQuestions.has(question.id)}
                  onToggle={() => toggleQuestionExpanded(question.id)}
                  onStatusChange={(status) => handleUpdateQuestionStatus(question.id, status)}
                  onSave={(q) => handleSaveQuestion({ ...q, id: question.id })}
                  readOnly={selectedQuiz.status === 'published'}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Bulk Import View */}
      {view === 'import' && selectedQuiz && (
        <BulkImportView
          onImport={handleBulkImport}
          onCancel={() => setView('edit')}
          loading={loading}
          importProgress={importProgress}
        />
      )}
    </div>
  );
};

interface BulkImportViewProps {
  onImport: (questions: Partial<Question>[]) => void;
  onCancel: () => void;
  loading?: boolean;
  importProgress?: { current: number; total: number } | null;
}

const BulkImportView: React.FC<BulkImportViewProps> = ({ onImport, onCancel, loading, importProgress }) => {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<Partial<Question>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    try {
      // Split by numbers followed by dot/parenthesis at start of line or string
      const questionBlocks = text.split(/(?:^|\n)\s*\d+[.\)]\s*/).filter(block => block.trim());

      const parsedQuestions: Partial<Question>[] = questionBlocks.map((block, index) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);

        if (lines.length === 0) throw new Error(`Empty question block at position ${index + 1}`);

        const questionText = lines[0];
        const options: Record<string, string> = {};
        let correctOption: 'a' | 'b' | 'c' | 'd' | null = null;

        lines.slice(1).forEach(line => {
          // Match a) option, A. option, [a] option etc.
          const optMatch = line.match(/^([a-dA-D])[\)|\]|\.|\s]\s*(.*)/i);
          if (optMatch && !correctOption) {
            options[optMatch[1].toLowerCase()] = optMatch[2];
          }

          // Match Answer: A or Correct: A or just a line that is "Answer: A"
          const ansMatch = line.match(/(?:Answer|Correct|Key):\s*([a-dA-D])/i);
          if (ansMatch) {
            correctOption = ansMatch[1].toLowerCase() as any;
          }
        });

        if (!questionText || Object.keys(options).length < 2 || !correctOption) {
          throw new Error(`Failed to parse question starting with "${questionText.substring(0, 30)}...". Ensure it has options and an answer.`);
        }

        return {
          questionText,
          optionA: options['a'] || '',
          optionB: options['b'] || '',
          optionC: options['c'] || '',
          optionD: options['d'] || '',
          correctOption: correctOption as any,
          orderIndex: index
        };
      });

      if (parsedQuestions.length === 0) throw new Error('No questions found. Check your format.');
      setParsed(parsedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid format');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-[#F5F5DC] mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D4AF37]" />
          Bulk Import Questions
        </h3>
        <p className="text-[#A0A0A0] text-sm mb-6">
          Paste your questions in the format below. Each question should start with a number.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#333]">
              <p className="text-xs text-[#666] mb-2 uppercase font-bold tracking-wider text-center">Format Example</p>
              <pre className="text-xs text-[#D4AF37] leading-relaxed">
                {`1. What is the capital of Nigeria?
a) Lagos
b) Abuja
c) Kano
d) Kaduna
Answer: B

2. Next question here...
...`}
              </pre>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your questions here..."
              className="w-full h-[400px] bg-[#0A0A0A] border border-[#333] rounded-lg p-4 text-[#F5F5DC] font-mono text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-[#F5F5DC]">Preview ({parsed.length})</h4>
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className="btn-secondary px-4 py-1.5 text-sm"
              >
                Parse Questions
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="h-[432px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#333]">
              {parsed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#444] border-2 border-dashed border-[#222] rounded-xl">
                  <Download className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Questions will appear here after parsing</p>
                </div>
              ) : (
                parsed.map((q, idx) => (
                  <div key={idx} className="bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-sm">
                    <p className="text-[#F5F5DC] font-medium mb-2">{idx + 1}. {q.questionText}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#A0A0A0] text-xs">
                      <p className={q.correctOption === 'a' ? 'text-green-400 font-bold' : ''}>A: {q.optionA}</p>
                      <p className={q.correctOption === 'b' ? 'text-green-400 font-bold' : ''}>B: {q.optionB}</p>
                      <p className={q.correctOption === 'c' ? 'text-green-400 font-bold' : ''}>C: {q.optionC}</p>
                      <p className={q.correctOption === 'd' ? 'text-green-400 font-bold' : ''}>D: {q.optionD}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-[#333]">
          {loading && importProgress && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-[#A0A0A0] font-bold tracking-wider">
                <span>IMPORTING...</span>
                <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
              </div>
              <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#333]">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F2C94C] transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onCancel} disabled={loading} className="btn-secondary disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={() => onImport(parsed)}
              disabled={parsed.length === 0 || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? 'Processing...' : `Import ${parsed.length} Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuestionCardProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: QuestionStatus) => void;
  onSave: (question: Partial<Question>) => void;
  readOnly: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isExpanded,
  onToggle,
  onStatusChange,
  onSave,
  readOnly
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(question);

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      {/* Question Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#D4AF37]/5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <span className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
            {index + 1}
          </span>
          <div>
            <p className="text-[#F5F5DC] line-clamp-1">{question.questionText}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs ${question.status === 'approved'
                ? 'bg-green-500/20 text-green-400'
                : question.status === 'rejected'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                {question.status}
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#A0A0A0]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#A0A0A0]" />
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-[#333]"
          >
            <div className="p-4 space-y-4">
              {isEditing && !readOnly ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#A0A0A0] mb-1">Question</label>
                    <textarea
                      value={editData.questionText}
                      onChange={(e) => setEditData({ ...editData, questionText: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-[#F5F5DC] resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[#A0A0A0] font-bold">
                          {opt.toUpperCase()}
                        </span>
                        <input
                          type="text"
                          value={editData[`option${opt.toUpperCase() as 'A' | 'B' | 'C' | 'D'}` as keyof typeof editData] as string}
                          onChange={(e) => setEditData({ ...editData, [`option${opt.toUpperCase()}`]: e.target.value })}
                          className="flex-1 bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-[#F5F5DC]"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-[#A0A0A0]">Correct Answer:</label>
                    <select
                      value={editData.correctOption}
                      onChange={(e) => setEditData({ ...editData, correctOption: e.target.value as any })}
                      className="bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-[#F5F5DC]"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#A0A0A0] mb-1">Explanation</label>
                    <textarea
                      value={editData.explanation || ''}
                      onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-[#F5F5DC] resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[#F5F5DC]">{question.questionText}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['a', 'b', 'c', 'd'].map(opt => {
                      const isCorrect = question.correctOption === opt;
                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-2 p-2 rounded ${isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-[#1A1A1A]'
                            }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-[#333] text-[#A0A0A0]'
                            }`}>
                            {opt.toUpperCase()}
                          </span>
                          <span className={isCorrect ? 'text-green-400' : 'text-[#A0A0A0]'}>
                            {question[`option${opt.toUpperCase() as 'A' | 'B' | 'C' | 'D'}` as keyof typeof question] as string}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {question.explanation && (
                    <div className="p-3 bg-[#1A1A1A] rounded-lg">
                      <p className="text-sm text-[#A0A0A0] mb-1">Explanation:</p>
                      <p className="text-[#F5F5DC]">{question.explanation}</p>
                    </div>
                  )}
                  {!readOnly && (
                    <div className="flex gap-2">
                      {question.status !== 'approved' && (
                        <button
                          onClick={() => onStatusChange('approved')}
                          className="btn-primary flex items-center gap-2 text-sm"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      )}
                      {question.status !== 'rejected' && (
                        <button
                          onClick={() => onStatusChange('rejected')}
                          className="btn-secondary text-red-400 border-red-400/50 hover:bg-red-400/20 text-sm"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizManagement;


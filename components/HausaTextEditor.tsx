import React, { useState } from 'react';
import { simplifyHausa, breakLongSentences, getReadabilityScore, validateContent } from '../services/hausaSimplifier';

const HausaTextEditor: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [readability, setReadability] = useState<{ level: string; score: number } | null>(null);
  const [validation, setValidation] = useState<{ valid: boolean; issues: string[] } | null>(null);

  const handleSimplify = () => {
    const simplified = simplifyHausa(originalText);
    const broken = breakLongSentences(simplified);
    setSimplifiedText(broken);
    setReadability(getReadabilityScore(broken));
    setValidation(validateContent(broken));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(simplifiedText);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5DC] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">
          Edita Rubutu
        </h1>
        <p className="text-[#A0A0A0] mb-8">
          Simple Hausa text for digital reading
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Original Text */}
          <div>
            <label className="block text-sm font-bold text-[#D4AF37] mb-2">
              Rubutu Na Asali
            </label>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste original Hausa text here..."
              className="w-full h-96 bg-[#0D0D0D] border border-[#D4AF37]/20 rounded-xl p-4 text-[#F5F5DC] resize-none focus:border-[#D4AF37] outline-none"
            />
          </div>

          {/* Simplified Text */}
          <div>
            <label className="block text-sm font-bold text-[#D4AF37] mb-2">
              Rubutu Mai sauƙi
            </label>
            <textarea
              value={simplifiedText}
              onChange={(e) => setSimplifiedText(e.target.value)}
              placeholder="Simplified text will appear here..."
              className="w-full h-96 bg-[#0D0D0D] border border-[#D4AF37]/20 rounded-xl p-4 text-[#F5F5DC] resize-none focus:border-[#D4AF37] outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSimplify}
            className="px-6 py-3 bg-[#D4AF37] text-[#1A1A1A] font-bold rounded-xl hover:bg-[#E5C76B] transition-colors"
          >
            Simple
          </button>
          <button
            onClick={handleCopy}
            disabled={!simplifiedText}
            className="px-6 py-3 border border-[#D4AF37]/30 text-[#D4AF37] font-bold rounded-xl hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50"
          >
            Copy
          </button>
        </div>

        {/* Analysis Results */}
        {readability && (
          <div className="mt-8 p-6 bg-[#0D0D0D] rounded-xl border border-[#D4AF37]/20">
            <h3 className="text-sm font-bold text-[#D4AF37] mb-4">Analysis</h3>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-[#A0A0A0]">Reading Level</p>
                <p className="text-lg font-bold text-[#F5F5DC]">{readability.level}</p>
              </div>
              <div>
                <p className="text-xs text-[#A0A0A0]">Score</p>
                <p className="text-lg font-bold text-[#F5F5DC]">{readability.score}/100</p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Issues */}
        {validation && !validation.valid && (
          <div className="mt-6 p-6 bg-[#0D0D0D] rounded-xl border border-red-500/30">
            <h3 className="text-sm font-bold text-red-400 mb-4">Issues Found</h3>
            <ul className="space-y-2">
              {validation.issues.map((issue, i) => (
                <li key={i} className="text-sm text-[#A0A0A0]">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HausaTextEditor;

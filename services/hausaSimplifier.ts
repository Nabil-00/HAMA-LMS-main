/**
 * HAMA LMS - Hausa Text Simplifier
 * 
 * A utility to help editors simplify Hausa lesson content
 * for better digital readability.
 * 
 * Usage:
 * import { simplifyHausa } from './services/hausaSimplifier';
 * const simplified = simplifyHausa(originalText);
 */

// Common phrase replacements
const replacements: Record<string, string> = {
  // Academic connectors to simple alternatives
  'Dangane da haka': 'Don haka',
  'Saboda haka': 'Don haka',
  'A bisa la\'akari da': 'A bisa',
  'Dangane da': 'Saboda',
  'A wasu lokuta': 'Wasu lokuta',
  
  // Long phrases to shorten
  'Tsarin Gudanar da Darussa': 'Darussa',
  'Yayin da ake': 'A lokacin',
  'Wannan ya kunna': 'Wannan tana nuna',
  'Za a iya fahimtar cewa': 'Ana ganin',
  'A wasu yanayi': 'Wasu yanayi',
  'Duk da haka': 'Kodayake',
  'Kamar yadda': 'Kamar',
  'Duk mai': 'Kowane',
  'Wani lokaci': 'Wasu lokatai',
  'Kuma': 'Haka kuma',
  'Haka nan': 'Haka',
  
  // Formal to casual
  'Don haka': 'Don',
  'Saboda': 'Saboda',
};

// Connectors to simplify
const connectorPatterns = [
  { pattern: /,\s*kuma\s*/g, replacement: ', ' },
  { pattern: /\s+saboda\s+/g, replacement: ' saboda ' },
  { pattern: /\s+don\s+haka\s+/g, replacement: ' don ' },
];

/**
 * Simplify Hausa text for digital reading
 */
export const simplifyHausa = (text: string): string => {
  let simplified = text;
  
  // Apply phrase replacements
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(key, 'gi');
    simplified = simplified.replace(regex, value);
  });
  
  // Apply pattern replacements
  connectorPatterns.forEach(({ pattern, replacement }) => {
    simplified = simplified.replace(pattern, replacement);
  });
  
  return simplified;
};

/**
 * Break long sentences into shorter ones
 * This is a simple heuristic - actual sentence splitting 
 * would require proper Hausa NLP
 */
export const breakLongSentences = (text: string, maxLength: number = 50): string => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  return sentences.map(sentence => {
    const words = sentence.split(/\s+/).length;
    
    // If sentence is very long, suggest a break point
    if (words > maxLength) {
      // Find middle connective to split on
      const connectors = [' da ', ' kuma ', ' saboda ', ' don ', ' amma '];
      for (const conn of connectors) {
        const connIndex = sentence.toLowerCase().indexOf(conn);
        if (connIndex > 0 && connIndex < sentence.length / 2) {
          return sentence.slice(0, connIndex) + '.\n' + sentence.slice(connIndex);
        }
      }
    }
    return sentence;
  }).join(' ');
};

/**
 * Format text for digital reading
 */
export const formatForDigital = (text: string): string => {
  let formatted = simplifyHausa(text);
  formatted = breakLongSentences(formatted);
  return formatted;
};

/**
 * Convert text to bullet points if appropriate
 * Detects lists in text and formats them
 */
export const toBulletPoints = (text: string): string => {
  // Common Hausa list indicators
  const listPatterns = [
    /(\d+)\.\s*([^\n]+)/g,           // 1. item
    /-\s+([^\n]+)/g,                  // - item
    /•\s+([^\n]+)/g,                  // • item
  ];
  
  // For now, return as-is
  // A full implementation would detect and convert lists
  return text;
};

/**
 * Check readability score (simple word count based)
 */
export const getReadabilityScore = (text: string): { level: string; score: number } => {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  
  let level: string;
  let score: number;
  
  if (avgWordsPerSentence < 15) {
    level = 'Simple - Easy to read';
    score = 90;
  } else if (avgWordsPerSentence < 25) {
    level = 'Moderate - Standard reading';
    score = 70;
  } else {
    level = 'Complex - Consider simplifying';
    score = 50;
  }
  
  return { level, score };
};

/**
 * Validate text meets HAMA content guidelines
 */
export const validateContent = (text: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for very long sentences
  const sentences = text.split(/[.!?]+/);
  sentences.forEach((sentence, i) => {
    const words = sentence.split(/\s+/).length;
    if (words > 40) {
      issues.push(`Sentence ${i + 1} is very long (${words} words). Consider breaking it.`);
    }
  });
  
  // Check for very long paragraphs
  const paragraphs = text.split(/\n\n+/);
  paragraphs.forEach((para, i) => {
    const lines = para.split('\n').length;
    if (lines > 6) {
      issues.push(`Paragraph ${i + 1} is very long. Consider breaking into smaller paragraphs.`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
};

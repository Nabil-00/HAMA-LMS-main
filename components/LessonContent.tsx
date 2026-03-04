import React from 'react';

interface LessonContentProps {
  htmlContent: string;
  title?: string;
  readingTime?: number;
}

const LessonContent: React.FC<LessonContentProps> = ({ htmlContent, title, readingTime }) => {
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Optional: Reading Time & Progress */}
      {readingTime && (
        <div className="fixed top-16 left-0 right-0 h-0.5 bg-[#1A1A1A] z-40">
          <div 
            className="h-full bg-gradient-to-r from-[#046307] to-[#D4AF37] transition-all duration-300"
            style={{ width: '30%' }} 
          />
        </div>
      )}

      <article className="max-w-[720px] mx-auto px-6 md:px-0 py-10 md:py-16">
        {/* Title Section */}
        {title && (
          <header className="mb-10 pb-6 border-b border-[#D4AF37]/20">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5F5DC] mb-4">
              {title}
            </h1>
            {readingTime && (
              <p className="text-sm text-[#A0A0A0]">
                {readingTime} min read
              </p>
            )}
          </header>
        )}

        {/* Main Content */}
        <div 
          className="lesson-content"
          style={{ lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Optional: Section Divider */}
        <hr className="border-t border-white/10 my-10" />

        {/* Navigation could go here */}
        <div className="flex justify-between items-center text-sm text-[#A0A0A0]">
          <button className="hover:text-[#D4AF37] transition-colors">
            ← Previous Lesson
          </button>
          <button className="hover:text-[#D4AF37] transition-colors">
            Next Lesson →
          </button>
        </div>
      </article>

      {/* Embedded Styles for Rich Text */}
      <style>{`
        .lesson-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #F5F5DC;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
          .lesson-content h1 {
            font-size: 2.25rem;
          }
        }

        .lesson-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #F5F5DC;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .lesson-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #F5F5DC;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        .lesson-content p {
          font-size: 1rem;
          color: rgba(245, 245, 220, 0.9);
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .lesson-content small {
          font-size: 0.875rem;
          color: #A0A0A0;
        }

        .lesson-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lesson-content ul li {
          margin-bottom: 0.5rem;
          color: rgba(245, 245, 220, 0.9);
        }

        .lesson-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lesson-content ol li {
          margin-bottom: 0.5rem;
          color: rgba(245, 245, 220, 0.9);
        }

        .lesson-content blockquote {
          border-left: 4px solid #046307;
          padding-left: 1rem;
          font-style: italic;
          color: rgba(245, 245, 220, 0.8);
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lesson-content a {
          color: #D4AF37;
          text-decoration: underline;
        }

        .lesson-content a:hover {
          color: #F5F5DC;
        }

        .lesson-content img {
          border-radius: 0.75rem;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          max-width: 100%;
          height: auto;
        }

        .lesson-content pre {
          background-color: rgba(0, 0, 0, 0.4);
          font-size: 0.875rem;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          color: #F5F5DC;
        }

        .lesson-content code {
          font-family: monospace;
          background-color: rgba(212, 175, 55, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          color: #D4AF37;
        }

        .lesson-content pre code {
          background: none;
          padding: 0;
          color: #F5F5DC;
        }

        .lesson-content hr {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 2rem 0;
        }

        .lesson-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }

        .lesson-content th,
        .lesson-content td {
          padding: 0.75rem;
          border: 1px solid rgba(212, 175, 55, 0.2);
          text-align: left;
        }

        .lesson-content th {
          background-color: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          font-weight: 600;
        }

        .lesson-content td {
          color: rgba(245, 245, 220, 0.9);
        }

        .lesson-content strong {
          color: #F5F5DC;
          font-weight: 600;
        }

        .lesson-content em {
          font-style: italic;
          color: rgba(245, 245, 220, 0.8);
        }
      `}</style>
    </div>
  );
};

export default LessonContent;


import React from 'react';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AISummaryProps {
  summary: string;
  model: string;
}

const AISummary: React.FC<AISummaryProps> = ({ summary, model }) => {
  return (
    <div className="bg-white border border-primary-100 rounded-2xl p-8 shadow-sm animate-in slide-in-from-top duration-700">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary-500 p-2 rounded-xl shadow-lg shadow-primary-200">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg tracking-tight">AI 智能总结</h3>
            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mt-0.5">Insight Analysis</p>
          </div>
        </div>
        <div className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-md font-bold uppercase">
          {model}
        </div>
      </div>
      
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            hr: ({}) => <hr className="my-4 border-t border-primary-200" />,
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-primary-50">{children}</thead>,
            tbody: ({ children }) => <tbody className="bg-white">{children}</tbody>,
            tr: ({ children }) => <tr className="border-b last:border-b-0 border-gray-200">{children}</tr>,
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r last:border-r-0 border-gray-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-gray-700 align-top border-r last:border-r-0 border-gray-100">
                {children}
              </td>
            ),
            code: ({ children }) => (
              <code className="bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded text-xs font-mono mx-0.5">
                {children}
              </code>
            ),
            ul: ({ children }) => <ul className="list-disc ml-5 marker:text-primary-400 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-5 space-y-1">{children}</ol>,
            p: ({ children }) => <p className="mt-2">{children}</p>,
            h3: ({ children }) => (
              <h3 className="text-gray-900 font-bold text-base mt-6 mb-3 flex items-center gap-2 border-l-4 border-primary-400 pl-3">
                {children}
              </h3>
            ),
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AISummary;

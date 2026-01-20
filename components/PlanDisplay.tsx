
import React from 'react';

interface Props {
  plan: string;
}

const PlanDisplay: React.FC<Props> = ({ plan }) => {
  const sections = plan.split(/(?=📅|⏳|🗓️|🔁|🌱|⚠️|🎯)/g);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {sections.map((section, idx) => {
        if (!section.trim()) return null;
        
        const lines = section.trim().split('\n');
        const title = lines[0];
        const content = lines.slice(1);

        return (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                {title}
              </h3>
            </div>
            <div className="p-6">
              <div className="prose prose-slate max-w-none font-bangla">
                {content.map((line, lIdx) => {
                  const isItem = line.startsWith('-') || line.startsWith('Day');
                  return (
                    <p 
                      key={lIdx} 
                      className={`mb-2 leading-relaxed transition-colors ${
                        isItem ? 'font-semibold text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md active:scale-95"
        >
          <i className="fas fa-print"></i>
          Print Schedule
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .bg-white { box-shadow: none; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
          .bg-indigo-50 { background: #f8fafc !important; }
          .max-w-4xl { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default PlanDisplay;

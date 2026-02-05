import React, { useRef, useState } from 'react';

interface Props {
  plan: string;
}

const PlanDisplay: React.FC<Props> = ({ plan }) => {
  const planRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Split content by emoji icons
  const sections = plan.split(/(?=📅|⏳|🗓️|🔁|🔥|🧘|⚠️|🎯)/g);

  /**
   * Complex Parser for Beautiful Colors & Bold Styles
   * - Makes **Day X** bold and black
   * - Makes Bengali Chapter Numbers/Names colorful (Indigo/Rose)
   */
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // 1. Split by Bold Markers first
    const boldParts = text.split(/(\*\*.*?\*\*)/g);

    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        const isDay = content.toLowerCase().includes('day ');
        
        // Day X is Bold and Black
        if (isDay) {
          return <strong key={i} className="font-black text-slate-900 mr-1">{content}</strong>;
        }
        // Other bolds are standard bold
        return <strong key={i} className="font-bold text-slate-800">{content}</strong>;
      }

      // 2. Identify Bengali Chapter keywords for coloring
      // This regex looks for "অধ্যায়" (Chapter) followed by numbers or common chapter naming patterns
      const chapterRegex = /(অধ্যায়\s+[০-৯\d]+|অধ্যায়:?\s+)/g;
      const subParts = part.split(chapterRegex);

      return subParts.map((subPart, j) => {
        if (subPart.match(chapterRegex)) {
          return (
            <span key={`${i}-${j}`} className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md mx-0.5">
              {subPart}
            </span>
          );
        }
        return subPart;
      });
    });
  };

  const handleDownloadPDF = async () => {
    const element = planRef.current;
    if (!element || isDownloading) return;

    setIsDownloading(true);
    
    // Tiny delay to ensure styles are fully computed
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `CarePlanner_Routine_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 3, // High resolution for text clarity
          useCORS: true, 
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF generation failed. Use the Print button or a Screenshot.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1 font-bangla">
      {/* PDF Capture Root */}
      <div 
        ref={planRef} 
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4 backdrop-blur-md">
            <i className="fas fa-graduation-cap text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Personal Success Plan</h1>
          <p className="text-indigo-100 text-sm font-medium">Strategically Created by CarePlanner</p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
              <i className="far fa-calendar-alt mr-2"></i> {new Date().toLocaleDateString()}
            </div>
            <div className="px-4 py-2 bg-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-emerald-400/30">
              <i className="fas fa-check-circle mr-2"></i> Targeted Accuracy
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-12 space-y-12 bg-white">
          {sections.map((section, idx) => {
            const trimmed = section.trim();
            if (!trimmed) return null;
            
            const lines = trimmed.split('\n');
            const titleLine = lines[0];
            const contentLines = lines.slice(1).filter(l => l.trim().length > 0);
            const isRoutine = titleLine.includes('🗓️');
            const isEstimation = titleLine.includes('⏳');

            return (
              <section key={idx} className="break-inside-avoid">
                <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-3 border-l-4 border-indigo-500 pl-4 py-1">
                  {titleLine}
                </h3>
                
                <div className={isRoutine ? "grid grid-cols-1 md:grid-cols-2 gap-3" : isEstimation ? "space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner" : "space-y-4"}>
                  {contentLines.map((line, lIdx) => {
                    const isDayLine = line.toLowerCase().includes('day ');

                    // Specific Card Layout for Routine days (Mobile Optimized)
                    if (isRoutine && isDayLine) {
                      return (
                        <div key={lIdx} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
                          <p className="text-slate-700 text-[15px] leading-relaxed">
                            {renderFormattedText(line.trim())}
                          </p>
                        </div>
                      );
                    }

                    // Estimations Section - Matching your image request
                    if (isEstimation) {
                      return (
                        <div key={lIdx} className="flex items-center justify-between py-2 border-b border-slate-200/60 last:border-0">
                          <span className="text-slate-800 font-medium text-[15px]">
                            {renderFormattedText(line.trim())}
                          </span>
                        </div>
                      );
                    }

                    // Standard rich text layout
                    return (
                      <div key={lIdx} className="text-slate-600 text-[15px] leading-relaxed flex items-start gap-3 pl-2">
                        <span className="text-indigo-500 mt-2 flex-shrink-0">
                          <i className="fas fa-chevron-right text-[10px]"></i>
                        </span>
                        <span>{renderFormattedText(line.trim())}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Brand Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span>© {new Date().getFullYear()} CarePlanner Assistant</span>
          <span className="text-indigo-400">Education is Empowerment</span>
        </div>
      </div>

      {/* Action Area - Hidden in Print */}
      <div className="flex flex-col gap-4 no-print pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all font-black shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
          >
            {isDownloading ? (
              <><i className="fas fa-spinner animate-spin"></i> GENERATING PDF...</>
            ) : (
              <><i className="fas fa-file-pdf text-xl"></i> DOWNLOAD PDF ROUTINE</>
            )}
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black transition-all font-black shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            <i className="fas fa-print text-xl"></i>
            PRINT ROUTINE
          </button>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-3 py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all font-bold text-sm"
        >
          <i className="fas fa-plus-circle"></i>
          CREATE DIFFERENT PLAN
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; }
          .rounded-[2.5rem], .rounded-[2rem], .rounded-2xl { border-radius: 0 !important; }
          .border { border: none !important; }
          section { page-break-inside: avoid; margin-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
};

export default PlanDisplay;
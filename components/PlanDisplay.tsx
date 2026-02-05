import React, { useRef, useState } from 'react';

interface Props {
  plan: string;
}

const PlanDisplay: React.FC<Props> = ({ plan }) => {
  const planRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Split content by emoji icons
  const sections = plan.split(/(?=📅|⏳|🗓️|🔁|🔥|🧘|⚠️|🎯)/g).filter(s => s.trim().length > 0);

  /**
   * Complex Parser for Beautiful Colors & Bold Styles
   * - Makes **Day X** bold and black
   * - Makes Bengali Chapter Numbers/Names colorful (Indigo)
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
      const chapterRegex = /(অধ্যায়\s+[০-৯\d\-\:]+|অধ্যায়:?|১ম অধ্যায়|২য় অধ্যায়|৩য় অধ্যায়|৪র্থ অধ্যায়|৫ম অধ্যায়|৬ষ্ঠ অধ্যায়|৭ম অধ্যায়|৮ম অধ্যায়|৯ম অধ্যায়|১০ম অধ্যায়|১১শ অধ্যায়|১২শ অধ্যায়)/g;
      const subParts = part.split(chapterRegex);

      return subParts.map((subPart, j) => {
        if (subPart.match(chapterRegex)) {
          return (
            <span key={`${i}-${j}`} className="font-extrabold text-indigo-700 bg-indigo-50 px-1 rounded-sm mx-0.5">
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
    
    // Preparation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `CarePlanner_Study_Plan_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2.5, // High resolution but balanced for file size
          useCORS: true, 
          letterRendering: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 800, // Fixed width for consistent layout calculation
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById('study-plan-container');
            if (el) {
              // PDF specific style fixes
              el.style.boxShadow = 'none';
              el.style.border = '1px solid #e2e8f0';
              el.style.width = '800px';
              el.style.borderRadius = '0'; // Sharp corners look better in PDF
              
              // Ensure all cards are visible and well-aligned
              const sections = el.querySelectorAll('section');
              sections.forEach(s => {
                (s as HTMLElement).style.pageBreakInside = 'avoid';
                (s as HTMLElement).style.marginBottom = '30px';
              });
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDF download failed. Please try using the "Print" button instead, then select "Save as PDF".');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1 font-bangla">
      {/* PDF Capture Root */}
      <div 
        id="study-plan-container"
        ref={planRef} 
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        style={{ minWidth: '320px', background: '#ffffff' }}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-5 backdrop-blur-md">
            <i className="fas fa-calendar-check text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Your Success Roadmap</h1>
          <p className="text-indigo-100 text-sm font-medium">Precision Strategy by CarePlanner</p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="px-5 py-2.5 bg-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/20">
              <i className="far fa-clock mr-2"></i> {new Date().toLocaleDateString('en-GB')}
            </div>
            <div className="px-5 py-2.5 bg-emerald-500/20 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm border border-emerald-400/40">
              <i className="fas fa-check-circle mr-2"></i> OPTIMIZED
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-14 space-y-14 bg-white">
          {sections.map((section, idx) => {
            const trimmed = section.trim();
            if (!trimmed) return null;
            
            const lines = trimmed.split('\n');
            const titleLine = lines[0];
            const contentLines = lines.slice(1).filter(l => l.trim().length > 0);
            
            const isRoutine = titleLine.includes('🗓️');
            const isEstimation = titleLine.includes('⏳');

            return (
              <section key={idx} className="break-inside-avoid section-block">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 border-l-4 border-indigo-500 pl-5 py-1">
                  {titleLine}
                </h3>
                
                <div className={
                  isRoutine 
                  ? "grid grid-cols-1 md:grid-cols-2 gap-5" 
                  : "space-y-5"
                }>
                  {contentLines.map((line, lIdx) => {
                    const cleanLine = line.replace(/^\-\s*/, '').trim();
                    const isDayLine = line.toLowerCase().includes('day ');

                    // Special Card Layout for Routine
                    if (isRoutine && isDayLine) {
                      return (
                        <div key={lIdx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm border-l-4 border-l-indigo-400 transition-all">
                          <p className="text-slate-700 text-[15px] leading-relaxed">
                            {renderFormattedText(line.trim())}
                          </p>
                        </div>
                      );
                    }

                    // Organized Bullet Layout for all other sections
                    return (
                      <div key={lIdx} className="flex items-start gap-4 px-2 group">
                        <span className="text-indigo-400 mt-2 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <i className="fas fa-chevron-right text-[10px]"></i>
                        </span>
                        <p className="text-slate-700 font-medium text-[16px] leading-relaxed w-full">
                          {renderFormattedText(cleanLine)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* PDF Footer / Branding */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-5 text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">
          <div className="flex items-center gap-3">
            <i className="fas fa-brain text-indigo-300"></i>
            <span>CAREPLANNER ASSISTANT</span>
          </div>
          <span className="text-indigo-300">CURATED BY ADNAN KHAN</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col gap-4 no-print pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="group flex items-center justify-center gap-4 py-5 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all font-black shadow-2xl shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
          >
            {isDownloading ? (
              <><i className="fas fa-spinner animate-spin"></i> GENERATING PDF...</>
            ) : (
              <><i className="fas fa-download text-xl group-hover:-translate-y-1 transition-transform"></i> SAVE AS PDF</>
            )}
          </button>
          
          <button
            onClick={() => window.print()}
            className="group flex items-center justify-center gap-4 py-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black transition-all font-black shadow-2xl shadow-slate-200 active:scale-[0.98]"
          >
            <i className="fas fa-print text-xl group-hover:scale-110 transition-transform"></i>
            PRINT SCHEDULE
          </button>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-3 py-4 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm"
        >
          <i className="fas fa-redo-alt"></i>
          START OVER
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          #study-plan-container { 
            width: 100% !important; 
            box-shadow: none !important; 
            border: none !important; 
            border-radius: 0 !important;
          }
          section { page-break-inside: avoid; margin-bottom: 3rem !important; }
          .section-block { break-inside: avoid; display: block; }
          .grid { display: block !important; }
          .grid > div { margin-bottom: 1rem; width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default PlanDisplay;
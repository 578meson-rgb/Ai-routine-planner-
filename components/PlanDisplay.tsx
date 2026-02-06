import React, { useRef, useState } from 'react';

interface Props {
  plan: string;
}

const PlanDisplay: React.FC<Props> = ({ plan }) => {
  const planRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Split content by emoji icons
  const sections = plan.split(/(?=📅|⏳|🗓️|🔁|🔥|🧘|⚠️|🎯)/g).filter(s => s.trim().length > 0);

  const renderFormattedText = (text: string, forceChapterStyle: boolean = false) => {
    if (!text) return null;

    const isChapterLine = text.trim().startsWith('--') || forceChapterStyle;
    const contentToParse = text.trim().startsWith('--') ? text.trim().substring(2).trim() : text.trim();

    // Split by Bold Markers
    const boldParts = contentToParse.split(/(\*\*.*?\*\*)/g);

    const parsedContent = boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        const isDay = content.toLowerCase().includes('day ');
        if (isDay) {
          return <strong key={i} className="font-black text-slate-900 mr-1">{content}</strong>;
        }
        return <strong key={i} className="font-bold text-slate-800">{content}</strong>;
      }

      // Bengali Chapter Highlighting
      const chapterRegex = /(অধ্যায়\s+[০-৯\d\-\:]+|অধ্যায়:?|১ম অধ্যায়|২য় অধ্যায়|৩য় অধ্যায়|৪র্থ অধ্যায়|৫ম অধ্যায়|৬ষ্ঠ অধ্যায়|৭ম অধ্যায়|৮ম অধ্যায়|৯ম অধ্যায়|১০ম অধ্যায়|১১শ অধ্যায়|১২শ অধ্যায়)/g;
      const subParts = part.split(chapterRegex);

      return subParts.map((subPart, j) => {
        if (subPart.match(chapterRegex)) {
          return (
            <span key={`${i}-${j}`} className="font-extrabold text-indigo-700 bg-indigo-50 px-1 rounded-sm">
              {subPart}
            </span>
          );
        }
        return subPart;
      });
    });

    if (isChapterLine) {
      return (
        <div className="flex items-center gap-2 my-1.5 group">
          <span className="text-indigo-500 font-black">--</span>
          <span className="text-indigo-900 font-bold bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-100 transition-all group-hover:bg-indigo-100">
            {parsedContent}
          </span>
        </div>
      );
    }

    return parsedContent;
  };

  /**
   * Helper to group routine lines by Day
   */
  const groupRoutineByDay = (lines: string[]) => {
    const groups: { dayTitle: string; content: string[] }[] = [];
    let currentGroup: { dayTitle: string; content: string[] } | null = null;

    lines.forEach(line => {
      if (line.toLowerCase().includes('day ')) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { dayTitle: line, content: [] };
      } else if (currentGroup) {
        currentGroup.content.push(line);
      } else {
        // Handle lines before the first "Day X" line if any
        groups.push({ dayTitle: '', content: [line] });
      }
    });
    if (currentGroup) groups.push(currentGroup);
    return groups;
  };

  const handleDownloadPDF = async () => {
    const element = planRef.current;
    if (!element || isDownloading) return;

    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `CarePlanner_Routine_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true, 
          letterRendering: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 800, // Reduced to standard A4 ratio for better centering
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            const container = clonedDoc.getElementById('pdf-capture-root');
            if (container) {
              container.style.width = '780px'; // Fit within standard A4 bounds
              container.style.margin = '0 auto';
              container.style.boxShadow = 'none';
              container.style.border = '1px solid #e2e8f0';
              container.style.borderRadius = '0';
              
              // Prevent cutting off titles or images
              const sections = container.querySelectorAll('section');
              sections.forEach(s => {
                (s as HTMLElement).style.pageBreakInside = 'avoid';
                (s as HTMLElement).style.marginBottom = '20px';
              });

              // Ensure routine cards don't break mid-box
              const cards = container.querySelectorAll('.routine-card');
              cards.forEach(c => {
                (c as HTMLElement).style.pageBreakInside = 'avoid';
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
      console.error('PDF Error:', error);
      alert('PDF failed. Try "Print" -> "Save as PDF".');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1 font-bangla">
      <div 
        id="pdf-capture-root"
        ref={planRef} 
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mx-auto"
        style={{ minWidth: '320px', maxWidth: '850px', background: '#ffffff' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-5 backdrop-blur-md">
            <i className="fas fa-calendar-check text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Personal Success Routine</h1>
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest">Powered by CarePlanner</p>
          <div className="mt-6">
            <span className="px-5 py-2 bg-white/10 rounded-full text-[11px] font-bold border border-white/20">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 md:p-12 space-y-12 bg-white">
          {sections.map((section, idx) => {
            const trimmed = section.trim();
            if (!trimmed) return null;
            
            const lines = trimmed.split('\n');
            const titleLine = lines[0];
            const contentLines = lines.slice(1).filter(l => l.trim().length > 0);
            const isRoutine = titleLine.includes('🗓️');

            return (
              <section key={idx} className="break-inside-avoid">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 border-l-4 border-indigo-500 pl-5 py-1">
                  {titleLine}
                </h3>
                
                {isRoutine ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groupRoutineByDay(contentLines).map((group, gIdx) => (
                      <div key={gIdx} className="routine-card p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm border-l-4 border-l-indigo-500 flex flex-col gap-3 h-full">
                        {group.dayTitle && (
                          <div className="text-lg pb-2 border-b border-slate-200/60 mb-1">
                            {renderFormattedText(group.dayTitle)}
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          {group.content.map((line, clIdx) => (
                            <div key={clIdx}>
                              {renderFormattedText(line)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contentLines.map((line, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-4 px-2 group">
                        {!line.trim().startsWith('--') && (
                          <span className="text-indigo-400 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform">
                            <i className="fas fa-chevron-right text-[10px]"></i>
                          </span>
                        )}
                        <div className="text-slate-700 font-medium text-[16px] leading-relaxed w-full">
                          {renderFormattedText(line.trim())}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-5 text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em]">
          <span>CAREPLANNER ASSISTANT</span>
          <span className="text-indigo-300">CREATED BY ADNAN KHAN</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 no-print pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center justify-center gap-4 py-5 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all font-black shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-download text-xl"></i>}
            {isDownloading ? "SAVING..." : "DOWNLOAD PDF ROUTINE"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-4 py-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black transition-all font-black shadow-xl active:scale-95"
          >
            <i className="fas fa-print text-xl"></i> PRINT SCHEDULE
          </button>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="py-4 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm"
        >
          <i className="fas fa-sync-alt mr-2"></i> CREATE NEW SCHEDULE
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          #pdf-capture-root { border: none !important; box-shadow: none !important; width: 100% !important; border-radius: 0 !important; max-width: none !important; }
          section { page-break-inside: avoid; margin-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
};

export default PlanDisplay;
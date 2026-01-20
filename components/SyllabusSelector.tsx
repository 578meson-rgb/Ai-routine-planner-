
import React, { useState } from 'react';
import { SYLLABUS } from '../syllabus';
import { SelectedChapter } from '../types';

interface Props {
  selected: SelectedChapter[];
  onChange: (selected: SelectedChapter[]) => void;
}

const SyllabusSelector: React.FC<Props> = ({ selected, onChange }) => {
  const [activeSubject, setActiveSubject] = useState(SYLLABUS[0].name);
  const [activePaper, setActivePaper] = useState('1st Paper');

  const toggleChapter = (subject: string, paper: string, chapterName: string) => {
    const exists = selected.find(
      (s) => s.subject === subject && s.paper === paper && s.chapterName === chapterName
    );

    if (exists) {
      onChange(selected.filter((s) => s !== exists));
    } else {
      onChange([...selected, { subject, paper, chapterName }]);
    }
  };

  const currentSubject = SYLLABUS.find((s) => s.name === activeSubject)!;
  const currentChapters = currentSubject.papers[activePaper];

  const getSubjectCount = (subjectName: string) => {
    return selected.filter((s) => s.subject === subjectName).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SYLLABUS.map((subj) => {
          const count = getSubjectCount(subj.name);
          return (
            <button
              key={subj.name}
              type="button"
              onClick={() => {
                setActiveSubject(subj.name);
                setActivePaper('1st Paper');
              }}
              className={`p-4 rounded-xl border-2 transition-all text-center relative ${
                activeSubject === subj.name
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 shadow-sm'
              }`}
            >
              <i className={`fas ${subj.icon} mb-2 text-xl`}></i>
              <div className="text-sm font-bold block">{subj.name}</div>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
        {['1st Paper', '2nd Paper'].map((paper) => (
          <button
            key={paper}
            type="button"
            onClick={() => setActivePaper(paper)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activePaper === paper ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {paper}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {currentChapters.map((chapter) => {
          const isSelected = selected.some(
            (s) => s.subject === activeSubject && s.paper === activePaper && s.chapterName === chapter
          );
          return (
            <button
              key={chapter}
              type="button"
              onClick={() => toggleChapter(activeSubject, activePaper, chapter)}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 font-bangla ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
              }`}>
                {isSelected && <i className="fas fa-check text-white text-[10px]"></i>}
              </div>
              <span className="text-[15px] leading-tight flex-1">{chapter}</span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="p-3 bg-indigo-50 rounded-lg flex items-center justify-between text-indigo-800 text-sm">
          <span><strong className="font-bold">{selected.length}</strong> chapters selected</span>
          <button 
            type="button"
            onClick={() => onChange([])}
            className="text-indigo-600 hover:text-indigo-800 font-bold"
          >
            Clear All
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SyllabusSelector;

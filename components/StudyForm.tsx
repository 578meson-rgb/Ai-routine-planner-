
import React, { useState } from 'react';
import { StudyRequest, ConfidenceLevel, SelectedChapter } from '../types';
import SyllabusSelector from './SyllabusSelector';

interface Props {
  onSubmit: (data: StudyRequest) => void;
  isLoading: boolean;
}

const StudyForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [selectedChapters, setSelectedChapters] = useState<SelectedChapter[]>([]);
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [confidence, setConfidence] = useState<ConfidenceLevel>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChapters.length === 0 || !examDate) return;
    onSubmit({ selectedChapters, examDate, dailyHours, confidence });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-8">
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fas fa-list-check text-indigo-600"></i>
          Select Your Syllabus
        </label>
        <SyllabusSelector selected={selectedChapters} onChange={setSelectedChapters} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Exam Date
          </label>
          <input
            type="date"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Daily Study Hours
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="16"
              className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
            />
            <span className="text-indigo-700 font-bold w-12 text-center bg-indigo-50 py-1 rounded-md">{dailyHours}h</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Confidence Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setConfidence(level)}
              className={`py-3 rounded-xl border-2 transition-all capitalize font-bold text-sm ${
                confidence === level
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || selectedChapters.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
      >
        {isLoading ? (
          <><i className="fas fa-circle-notch animate-spin"></i> Planning...</>
        ) : (
          <><i className="fas fa-magic"></i> Create My Schedule</>
        )}
      </button>
    </form>
  );
};

export default StudyForm;

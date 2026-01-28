
import React, { useState } from 'react';
import { StudyRequest } from './types';
import { generateStudyPlan } from './services/geminiService';
import StudyForm from './components/StudyForm';
import PlanDisplay from './components/PlanDisplay';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async (data: StudyRequest) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateStudyPlan(data);
      setPlan(result);
    } catch (err) {
      setError('Something went wrong. Please check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 mb-6">
          <i className="fas fa-book-open text-2xl"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          CarePlan
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          The realistic, stress-free study planner. We help you stay focused, avoid burnout, and crush your exams.
        </p>
      </header>

      <main>
        {!plan && (
          <div className="max-w-2xl mx-auto">
            <StudyForm onSubmit={handleGeneratePlan} isLoading={loading} />
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4 no-print">
              <button
                onClick={() => setPlan(null)}
                className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2 transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
                Start Over
              </button>
            </div>
            <PlanDisplay plan={plan} />
          </div>
        )}
      </main>

      <footer className="mt-20 text-center text-slate-400 text-sm no-print pb-10">
        <p className="mb-2">Stay focused, you've got this! ✨</p>
        <p className="font-semibold text-indigo-600/60 tracking-wider uppercase text-[10px]">
          Made By Adnan Khan
        </p>
      </footer>
    </div>
  );
};

export default App;

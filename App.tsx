
import React, { useState, useEffect } from 'react';
import { StudyRequest } from './types';
import { generateStudyPlan } from './services/geminiService';
import StudyForm from './components/StudyForm';
import PlanDisplay from './components/PlanDisplay';

const LOADING_MESSAGES = [
  "Analyzing your selected chapters...",
  "Calculating days remaining until your exam...",
  "Designing rest periods to prevent burnout...",
  "Adjusting difficulty based on your confidence...",
  "Optimizing your study blocks for focus...",
  "Formatting your personalized routine...",
  "Almost ready! Stay focused... ✨"
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGeneratePlan = async (data: StudyRequest) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateStudyPlan(data);
      setPlan(result);
    } catch (err: any) {
      console.error("Plan Generation Error:", err);
      const errorMessage = err.message || String(err);
      
      if (errorMessage === "API_KEY_MISSING") {
        setError(
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <i className="fas fa-key"></i>
              <span>Vercel Configuration Required</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              The API Key is missing. Follow these steps exactly:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] space-y-2 text-left font-mono">
              <p>1. Vercel Dashboard > Settings > Environment Variables</p>
              <p>2. Add <b>API_KEY</b> as Key</p>
              <p>3. Paste your Gemini Key as Value</p>
              <p>4. Push this new code to GitHub to trigger a build.</p>
            </div>
          </div>
        );
      } else {
        setError(
          <div className="space-y-3">
            <p className="font-bold text-red-600">Connection Failed</p>
            <p className="text-sm text-slate-600">Google Gemini returned an error:</p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-[10px] font-mono text-red-800 break-words">
              {errorMessage}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Check if your API key has enough credits or if your region is supported.
            </p>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-500">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <i className="fas fa-brain text-xl animate-pulse"></i>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Creating Your Plan</h2>
          <p className="text-slate-500 font-medium animate-pulse text-center px-6 max-w-sm">
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
          <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            Please wait, this takes about 10-15 seconds
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 mb-6">
            <i className="fas fa-book-open text-2xl"></i>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            CarePlan
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Your personal AI study companion. Smart scheduling, zero stress.
          </p>
        </header>

        <main>
          {!plan && !loading && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
              <StudyForm onSubmit={handleGeneratePlan} isLoading={loading} />
            </div>
          )}

          {error && !loading && (
            <div className="mt-8 p-8 bg-white border border-red-100 rounded-3xl shadow-xl shadow-red-50/50 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto text-center">
              {error}
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-sync-alt"></i>
                Retry Setup
              </button>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4 no-print">
                <button
                  onClick={() => setPlan(null)}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
                >
                  <i className="fas fa-arrow-left"></i>
                  Change Parameters
                </button>
              </div>
              <PlanDisplay plan={plan} />
            </div>
          )}
        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm no-print pb-10">
          <p className="mb-2 italic">Consistency is key to success! ✨</p>
          <div className="h-px w-8 bg-slate-200 mx-auto mb-4"></div>
          <p className="font-bold text-indigo-600/60 tracking-widest uppercase text-[10px]">
            Designed By Adnan Khan
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;

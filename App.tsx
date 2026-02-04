import React, { useState, useEffect } from 'react';
import { StudyRequest } from './types';
import { generateStudyPlan } from './services/geminiService';
import StudyForm from './components/StudyForm';
import PlanDisplay from './components/PlanDisplay';

// Build Fix: v1.0.7 - Removed conflicting importmap from index.html

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
    return () => {
      if (interval) clearInterval(interval);
    };
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
              <span>API Key Required</span>
            </div>
            <p className="text-sm text-slate-600">
              Please add <b>API_KEY</b> to your Vercel Environment Variables.
            </p>
          </div>
        );
      } else {
        setError(
          <div className="space-y-3">
            <p className="font-bold text-red-600">Request Error</p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-[10px] font-mono text-red-800 break-words">
              {errorMessage}
            </div>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Loading Overlay with specific "Waiting" text as requested */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500">
          <div className="relative mb-10 text-center">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Building Your Future</h2>
            <div className="h-8">
              <p className="text-indigo-600 font-semibold animate-pulse">
                {LOADING_MESSAGES[loadingMsgIdx]}
              </p>
            </div>
            <p className="mt-8 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Please wait... this takes about 10 seconds
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 mb-6">
            <i className="fas fa-book-open text-2xl"></i>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">CarePlan</h1>
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
            <div className="mt-8 p-8 bg-white border border-red-100 rounded-3xl shadow-xl max-w-2xl mx-auto text-center">
              {error}
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase rounded-full"
              >
                Retry
              </button>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-6">
              <button
                onClick={() => setPlan(null)}
                className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2 no-print"
              >
                <i className="fas fa-arrow-left"></i> Edit Details
              </button>
              <PlanDisplay plan={plan} />
            </div>
          )}
        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm no-print pb-10">
          <p className="font-bold text-indigo-600/60 tracking-widest uppercase text-[10px]">
            Designed By Adnan Khan
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
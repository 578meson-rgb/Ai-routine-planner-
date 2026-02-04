import React, { useState, useEffect } from 'react';
import { StudyRequest } from './types';
import { generateStudyPlan } from './services/geminiService';
import StudyForm from './components/StudyForm';
import PlanDisplay from './components/PlanDisplay';

// Build Version: 1.0.9 (Importmap conflict resolved)

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
            <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-lg">
              <i className="fas fa-key"></i>
              <span>API Key Required</span>
            </div>
            <p className="text-sm text-slate-600">
              Your <b>API_KEY</b> environment variable is missing in Vercel. 
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-left font-mono space-y-2">
              <p>1. Open Vercel Dashboard</p>
              <p>2. Settings > Environment Variables</p>
              <p>3. Add Key: <span className="text-red-600">API_KEY</span></p>
              <p>4. <b>IMPORTANT:</b> Go to Deployments and click <b>Redeploy</b>.</p>
            </div>
          </div>
        );
      } else {
        setError(
          <div className="space-y-3">
            <p className="font-bold text-red-600">Something went wrong</p>
            <p className="text-xs text-slate-500">Error Details:</p>
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
      {/* Enhanced Loading Overlay - Specifically for user waiting */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500 text-center px-6">
          <div className="relative mb-10">
            <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Creating Your Plan</h2>
            <div className="h-10">
              <p className="text-indigo-600 font-bold text-lg animate-pulse">
                {LOADING_MESSAGES[loadingMsgIdx]}
              </p>
            </div>
            <p className="mt-8 text-sm font-medium text-slate-500">
              Please wait while we calculate the best routine for you...
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
            <div className="mt-8 p-10 bg-white border border-red-100 rounded-[2rem] shadow-2xl max-w-2xl mx-auto text-center">
              {error}
              <button 
                onClick={() => window.location.reload()}
                className="mt-8 px-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-6">
              <button
                onClick={() => setPlan(null)}
                className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-2 no-print px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all"
              >
                <i className="fas fa-arrow-left"></i> Edit My Chapters
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
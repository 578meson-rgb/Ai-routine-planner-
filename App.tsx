import React, { useState, useEffect } from 'react';
import { StudyRequest } from './types';
import { generateStudyPlan } from './services/geminiService';
import StudyForm from './components/StudyForm';
import PlanDisplay from './components/PlanDisplay';

// Build Version: 1.0.6 (Fixing deployment conflict)

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
      
      if (errorMessage === "API_KEY_MISSING" || errorMessage.includes("apiKey")) {
        setError(
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <i className="fas fa-key"></i>
              <span>Vercel Configuration Required</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              The API Key is missing or invalid. Please ensure it's set in your Vercel Project Settings.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] space-y-2 text-left font-mono">
              <p>1. Vercel Dashboard > Settings > Environment Variables</p>
              <p>2. Key: <span className="text-red-600">API_KEY</span></p>
              <p>3. Value: Your Gemini API Key</p>
              <p>4. Redeploy the project to apply changes.</p>
            </div>
          </div>
        );
      } else {
        setError(
          <div className="space-y-3">
            <p className="font-bold text-red-600">Request Failed</p>
            <p className="text-sm text-slate-600">The build or API request failed with:</p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-[10px] font-mono text-red-800 break-words">
              {errorMessage}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Make sure you have a valid API key and your project is deployed successfully on Vercel.
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
      {/* Enhanced Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500">
          <div className="relative mb-10">
            <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <i className="fas fa-brain text-2xl animate-pulse"></i>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Creating Your Plan</h2>
          <div className="h-12 flex items-center justify-center">
            <p className="text-slate-600 font-medium animate-in fade-in slide-in-from-bottom-2 duration-1000 text-center px-6 max-w-sm">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
          </div>
          <p className="mt-12 text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
            Processing... Please do not refresh
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
                className="mt-6 px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-sync-alt"></i>
                Restart Application
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
                  Edit Details
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
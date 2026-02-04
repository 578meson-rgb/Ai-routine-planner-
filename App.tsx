
import React, { useState } from 'react';
import { StudyRequest } from './types';
import { generateStudyPlan } from './services/geminiService';
import StudyForm from './components/StudyForm';
import PlanDisplay from './components/PlanDisplay';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);

  const handleGeneratePlan = async (data: StudyRequest) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateStudyPlan(data);
      setPlan(result);
    } catch (err: any) {
      console.error("Plan Generation Error:", err);
      
      // If API key is missing, show a detailed setup guide instead of a simple error
      if (err.message === "API_KEY_MISSING") {
        setError(
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <i className="fas fa-key"></i>
              <span>API Key Required</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              It looks like your app is running on Vercel but doesn't have your <strong>Gemini API Key</strong> yet. Follow these steps:
            </p>
            <div className="bg-white/50 p-4 rounded-xl border border-red-100 text-xs space-y-2 text-left">
              <p><strong>1.</strong> Go to your <strong>Vercel Dashboard</strong>.</p>
              <p><strong>2.</strong> Open <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</p>
              <p><strong>3.</strong> Add Key: <code className="bg-slate-200 px-1 rounded text-red-700">API_KEY</code></p>
              <p><strong>4.</strong> Add Value: <code className="bg-slate-200 px-1 rounded text-red-700">(Your Gemini Key from Google AI Studio)</code></p>
              <p><strong>5.</strong> <strong>Crucial:</strong> Push a small change to GitHub (like this update) to trigger a new build.</p>
            </div>
            <p className="text-[10px] text-slate-400">
              Note: Vercel needs a fresh build to "bake" the key into your website.
            </p>
          </div>
        );
      } else if (err.message?.includes('403') || err.message?.includes('401')) {
        setError(
          <div className="space-y-2">
            <p className="font-bold">Invalid API Key</p>
            <p className="text-sm text-slate-600">The key you provided to Vercel is incorrect or restricted. Please check Google AI Studio.</p>
          </div>
        );
      } else {
        setError(
          <div className="space-y-2">
            <p className="font-bold">Connection Failed</p>
            <p className="text-sm text-slate-600">The AI assistant is temporarily unavailable. This usually means a network issue or an invalid API key.</p>
          </div>
        );
      }
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
          <div className="mt-8 p-8 bg-white border border-red-100 rounded-3xl shadow-xl shadow-red-50/50 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto text-center">
            {error}
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh App
            </button>
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4 no-print">
              <button
                onClick={() => setPlan(null)}
                className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
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
        <p className="mb-2 italic">Stay focused, you've got this! ✨</p>
        <div className="h-px w-8 bg-slate-200 mx-auto mb-4"></div>
        <p className="font-bold text-indigo-600/60 tracking-widest uppercase text-[10px]">
          Made By Adnan Khan
        </p>
      </footer>
    </div>
  );
};

export default App;

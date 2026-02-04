import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { InputSection } from './components/InputSection';
import { LoadingState } from './components/LoadingState';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AboutSection } from './components/AboutSection';
import { AppState, PolicyAnalysis, InputEvidence } from './types';
import { analyzePolicy, generateImpactImage } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisData, setAnalysisData] = useState<PolicyAnalysis | null>(null);
  const [history, setHistory] = useState<PolicyAnalysis[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When we go to About, we preserve the analysisData but change the view state
  // We need to know where to go 'back' to if we leave About.
  // For simplicity, 'About' is just another view state.

  const handleAnalysis = async (policyText: string, geography: string, evidence?: InputEvidence) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    setGeneratedImage(null);

    try {
      // Step 1: Analyze Policy
      const result = await analyzePolicy(policyText, geography, evidence);
      
      // Step 2: Save to History & State
      setAnalysisData(result);
      setHistory(prev => [result, ...prev]);
      
      // Step 3: Transition to Results immediately
      setAppState(AppState.RESULTS);

      // Step 4: Trigger Image Generation in background
      if (result.visualizationPrompt) {
          generateImpactImage(result.visualizationPrompt).then(img => {
              if (img) setGeneratedImage(img);
          });
      }

    } catch (error: any) {
      console.error("App Error:", error);
      setAppState(AppState.ERROR);
      setErrorMsg(error.message || "An unexpected error occurred during simulation.");
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setGeneratedImage(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
  };

  const handleSelectHistory = (item: PolicyAnalysis) => {
      setAnalysisData(item);
      setGeneratedImage(null); // Images aren't persisted in this simple history state for now
      setAppState(AppState.RESULTS);
  };

  const handleShowAbout = () => {
      setAppState(AppState.ABOUT);
  };

  return (
    <Layout
        history={history}
        currentId={analysisData?.id}
        onSelectHistory={handleSelectHistory}
        onNewSimulation={handleReset}
        onShowAbout={handleShowAbout}
        isAboutActive={appState === AppState.ABOUT}
    >
      {appState === AppState.IDLE && (
        <InputSection onAnalyze={handleAnalysis} isAnalyzing={false} />
      )}

      {appState === AppState.ANALYZING && (
        <LoadingState />
      )}

      {appState === AppState.RESULTS && analysisData && (
        <AnalysisDashboard 
            data={analysisData} 
            onReset={handleReset} 
            generatedImage={generatedImage}
        />
      )}

      {appState === AppState.ABOUT && (
        <AboutSection />
      )}

      {appState === AppState.ERROR && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Simulation Failed</h2>
            <p className="text-slate-600 max-w-md mb-8">
                {errorMsg || "We encountered an issue while running the civic reasoning model. Please try again with a different policy input."}
            </p>
            <button 
                onClick={handleReset}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
                Return to Architect
            </button>
        </div>
      )}
    </Layout>
  );
};

export default App;
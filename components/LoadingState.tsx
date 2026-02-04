import React, { useEffect, useState } from 'react';
import { Loader2, BrainCircuit, Search, FileText, CheckCircle2, Server, Scale, Share2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const intervals = [
        1500, // Initializing
        3000, // Search/Grounding
        4000, // Deep Reasoning
        2500, // Synthesis
    ];
    
    let current = 0;
    const nextStep = () => {
        if (current < intervals.length) {
            setTimeout(() => {
                setStep(s => s + 1);
                current++;
                nextStep();
            }, intervals[current]);
        }
    }
    nextStep();
  }, []);

  const steps = [
    { icon: Server, label: "Initializing Stochastic Model..." },
    { icon: Search, label: "Grounding in Legal Precedents (Google Search)..." },
    { icon: BrainCircuit, label: "Simulating 2nd Order Economic Effects..." },
    { icon: Scale, label: "Balancing Stakeholder Equity..." },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md w-full bg-slate-900/80 p-8 rounded-2xl border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <div className="relative mb-8 flex justify-center">
             <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
             <div className="bg-slate-950 p-4 rounded-full ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Loader2 size={48} className="text-indigo-500 animate-spin relative z-10" />
             </div>
        </div>

        <h3 className="text-center text-lg font-bold text-white mb-8 animate-pulse">
            Architecting Future State...
        </h3>

        <div className="space-y-5 relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            const isPending = i > step;

            return (
              <div 
                key={i} 
                className={`flex items-center transition-all duration-500 ${isPending ? 'opacity-30 blur-[0.5px]' : 'opacity-100'} ${isActive ? 'translate-x-1' : ''}`}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 mr-4 transition-all duration-500 z-10
                  ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white scale-90 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : ''}
                  ${isActive ? 'border-indigo-500 text-indigo-400 bg-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-110' : ''}
                  ${isPending ? 'bg-slate-900 border-slate-700 text-slate-600' : ''}
                `}>
                  {isCompleted ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </div>
                <div>
                     <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                        {s.label}
                    </span>
                    {isActive && (
                        <div className="h-1 w-12 bg-indigo-900/50 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-indigo-500 w-1/2 animate-loading-bar shadow-[0_0_5px_rgba(99,102,241,0.8)]"></div>
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            <span>Gemini 3 Pro</span>
            <span className="flex items-center text-indigo-400">
                <BrainCircuit size={12} className="mr-1" />
                // Thinking Budget: 8k
                Thinking...
            </span>
        </div>
      </div>
    </div>
  );
};
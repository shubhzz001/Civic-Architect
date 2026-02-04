import React from 'react';
import { Building2, ShieldCheck, BrainCircuit, Globe } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-900/30 border border-indigo-500/20 rounded-xl mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Building2 className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-50 mb-4">About Civic Architect</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
          A reasoning-first civic intelligence platform designed to help policy makers, NGOs, and citizens simulate complex societal scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <FeatureCard 
          icon={<BrainCircuit className="w-6 h-6 text-indigo-400" />}
          title="Deep Reasoning"
          description="Powered by Gemini 3 Pro to simulate second-order effects and economic downstream consequences."
        />
        <FeatureCard 
          icon={<Globe className="w-6 h-6 text-blue-400" />}
          title="Grounded in Reality"
          description="Uses Google Search grounding to cite real-world laws, precedents, and similar case studies."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
          title="Trust & Transparency"
          description="Every metric comes with a confidence score and a reasoning chain explaining the AI's logic."
        />
      </div>

      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 shadow-xl shadow-black/20">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Our Philosophy</h2>
        <div className="space-y-4 text-slate-400 leading-relaxed">
          <p>
            Civic Architect is not a chatbot. It is a strategic dashboard designed for high-stakes decision making. 
            We believe that effective policy requires holistic simulation—understanding not just the intent of a law, 
            but its operational feasibility, social equity impact, and economic viability.
          </p>
          <p>
            By combining multimodal input (site plans, policy docs) with generative visualization and rigorous 
            chain-of-thought reasoning, we aim to bridge the gap between urban planning and artificial intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-lg shadow-black/10 hover:border-slate-700 transition-all hover:-translate-y-1">
    <div className="mb-4">{icon}</div>
    <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);
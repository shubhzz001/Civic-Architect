import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, Paperclip, X, FileText, Image as ImageIcon, ScanEye, Video, MapPin } from 'lucide-react';
import { InputEvidence } from '../types';

interface InputSectionProps {
  onAnalyze: (text: string, geography: string, evidence?: InputEvidence) => void;
  isAnalyzing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [input, setInput] = useState('');
  const [geography, setGeography] = useState('');
  const [evidence, setEvidence] = useState<InputEvidence | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAnalyzing) {
      onAnalyze(input, geography, evidence);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // extract base64 data
        const base64Data = result.split(',')[1];
        setEvidence({
            filename: file.name,
            mimeType: file.type,
            data: base64Data,
            caption: ''
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (evidence) {
          setEvidence({ ...evidence, caption: e.target.value });
      }
  };

  const removeEvidence = () => {
      setEvidence(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const suggestions = [
    "Implement congestion pricing in downtown Seattle ($15 peak)",
    "Convert 20% of public parking into protected bike lanes",
    "Mandate solar panels on all new commercial buildings > 5000sqft"
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 font-sans">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-500 tracking-tight mb-4 leading-tight">
          Architect the Future
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
          Simulate complex policy outcomes with reasoning-first AI. <br className="hidden md:block"/>
          Input your initiative to generate a comprehensive impact analysis.
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md rounded-xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden transition-all hover:border-slate-700 hover:shadow-black/60">
        <form onSubmit={handleSubmit} className="relative group">
          
          {/* Geography Input */}
          <div className="flex items-center space-x-3 px-8 pt-6 pb-2 border-b border-slate-800/30">
            <MapPin size={16} className="text-indigo-500/70" />
            <input 
                type="text" 
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                placeholder="Optional: Target Geography (e.g. 'New York City', 'Rural Japan')"
                className="w-full bg-transparent text-sm text-indigo-100 placeholder-slate-600 focus:outline-none font-medium tracking-wide"
            />
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your policy initiative here..."
            className="w-full h-32 md:h-40 px-8 py-6 text-xl text-slate-100 placeholder-slate-600 bg-transparent border-none focus:ring-0 resize-none outline-none font-light leading-relaxed"
            disabled={isAnalyzing}
          />
          
          {/* Evidence Card */}
          {evidence && (
              <div className="mx-8 mb-6 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex items-start bg-slate-800/80 border border-slate-700 rounded-lg p-3 relative overflow-hidden group/card">
                       {/* Preview Thumbnail */}
                       <div className="w-16 h-16 rounded bg-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-700 overflow-hidden">
                           {evidence.mimeType.startsWith('image/') ? (
                               <img src={`data:${evidence.mimeType};base64,${evidence.data}`} alt="preview" className="w-full h-full object-cover" />
                           ) : evidence.mimeType.startsWith('video/') ? (
                               <Video className="text-indigo-500" size={24} />
                           ) : (
                               <FileText className="text-slate-500" size={24} />
                           )}
                       </div>
                       
                       {/* Metadata & Caption */}
                       <div className="ml-4 flex-1">
                           <div className="flex justify-between items-start">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 flex items-center">
                                   <Paperclip size={10} className="mr-1" />
                                   {evidence.filename}
                               </span>
                               <button type="button" onClick={removeEvidence} className="text-slate-500 hover:text-red-400 transition-colors">
                                   <X size={14} />
                               </button>
                           </div>
                           <input 
                                type="text"
                                placeholder="Add context (e.g., 'Site photo facing North')"
                                value={evidence.caption}
                                onChange={handleCaptionChange}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                           />
                       </div>
                       
                       <div className="absolute top-0 right-0 p-1">
                           <div className="bg-emerald-950/30 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-900/50 uppercase tracking-wider">
                               Ready to Analyze
                           </div>
                       </div>
                   </div>
              </div>
          )}

          <div className="flex justify-between items-center px-6 py-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-sm">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/30 px-2 py-1 rounded border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                    <Sparkles size={14} />
                    <span className="hidden sm:inline">Gemini 3 Pro Active</span>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,application/pdf,video/*"
                />
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors group/btn"
                    disabled={isAnalyzing}
                >
                    <div className="bg-slate-800 border border-slate-700 p-1.5 rounded-md shadow-sm group-hover/btn:border-indigo-500/50 transition-colors">
                        <ScanEye size={16} className="text-slate-500 group-hover/btn:text-indigo-400" />
                    </div>
                    <span className="hidden sm:inline">Attach Evidence</span>
                </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isAnalyzing}
              className={`flex items-center px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                input.trim() && !isAnalyzing
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
              }`}
            >
              {isAnalyzing ? 'Simulating...' : 'Run Simulation'}
              {!isAnalyzing && <ArrowRight size={16} className="ml-2" />}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-10">
        <p className="text-xs font-bold text-slate-600 mb-4 uppercase tracking-widest text-center">Or load a blueprint</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="text-left p-4 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 text-sm text-slate-400 hover:text-slate-200 font-medium leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
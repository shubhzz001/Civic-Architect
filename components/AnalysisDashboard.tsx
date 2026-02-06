import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PolicyAnalysis, Stakeholder, TimelineEvent, BlueprintStrategy, Diagnosis, ResearchPaper, NewsArticle } from '../types';
import { 
  ShieldAlert, TrendingUp, Users, BookOpen, Eye, Loader2, Info, Download, 
  ShieldCheck, Globe, ExternalLink, LayoutTemplate, FileText, Search, 
  ChevronDown, AlertTriangle, ScanEye, CheckCircle2, Wand2, Volume2, 
  StopCircle, Play, Stethoscope, Clock, GitMerge, Coins, ThumbsUp,
  FileJson, Printer, Copy, X, Check, FileDown, Building2,
  Camera, GraduationCap, Library, Newspaper, MessageSquareWarning
} from 'lucide-react';
import { generateStakeholderSpeech, generateSpeech } from '../services/geminiService';

interface AnalysisDashboardProps {
  data: PolicyAnalysis;
  generatedImage: string | null;
  onReset: () => void;
}

type TabView = 'diagnosis' | 'blueprint' | 'timeline' | 'stakeholders' | 'research' | 'news';

// @google/genai audio helper: manual base64 decoding for raw PCM data
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// @google/genai audio helper: decode raw PCM data for AudioContext playback
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper to format text with bolding
const FormattedText = ({ text, className = "", isPrint = false }: { text: string, className?: string, isPrint?: boolean }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <p className={className}>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const boldText = part.slice(2, -2);
                    return (
                        <strong 
                            key={i} 
                            className={`font-bold ${isPrint ? 'text-black underline decoration-indigo-200' : 'text-white'}`}
                        >
                            {boldText}
                        </strong>
                    );
                }
                return part;
            })}
        </p>
    );
};

// --- Sub-components for AnalysisDashboard ---

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active 
        ? 'bg-slate-800 text-white shadow-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ViabilityBar = ({ data }: { data: PolicyAnalysis }) => {
    const { viability } = data;
    const colorClass = viability.successProbability > 70 
        ? 'bg-emerald-500' 
        : viability.successProbability > 40 
            ? 'bg-green-500' 
            : 'bg-red-500';
    
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-2 w-full">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Viability Score</span>
                    <span className={`text-2xl font-black ${colorClass.replace('bg-', 'text-')}`}>{viability.successProbability}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${viability.successProbability}%` }}></div>
                </div>
            </div>
            
            <div className="flex items-center space-x-8 px-8 border-l border-slate-800">
                <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cost Band</span>
                    <span className="text-lg font-bold text-indigo-400">{viability.costBand}</span>
                </div>
                <div className="max-w-xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Budget Reasoning</span>
                    <p className="text-xs text-slate-400 leading-tight">{viability.costReasoning}</p>
                </div>
            </div>
        </div>
    );
};

const DiagnosisView = ({ data, generatedImage, onExport }: { data: PolicyAnalysis, generatedImage: string | null, onExport: () => void }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      <section className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs flex items-center">
            <BookOpen size={14} className="mr-2" /> Executive Summary
          </h3>
          <button 
            onClick={onExport}
            className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all"
          >
            <Printer size={10} />
            <span>Generate PDF Report</span>
          </button>
        </div>
        <FormattedText 
            text={data.executiveSummary} 
            className="text-slate-300 leading-relaxed text-lg font-light italic" 
        />
      </section>

      <section className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
        <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
          <Stethoscope size={14} className="mr-2" /> Forensic Diagnosis
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-100 font-bold mb-2">Systemic Root Cause</h4>
            <div className="bg-slate-950/50 p-4 rounded-lg border-l-4 border-indigo-600">
              <p className="text-slate-300">{data.diagnosis.rootCause}</p>
            </div>
          </div>
          <div>
            <h4 className="text-slate-100 font-bold mb-2">Identified Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {data.diagnosis.symptoms.map((s, i) => (
                <span key={i} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm border border-slate-700">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {data.evidenceAnalysis && data.evidenceAnalysis.mediaType !== 'none' && (
        <section className="bg-slate-900/40 p-6 rounded-xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
           <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center">
            <ScanEye size={14} className="mr-2" /> Evidence Analysis
          </h3>
          <div className="space-y-4">
             <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-slate-300 text-sm leading-relaxed">{data.evidenceAnalysis.visualContext}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Detected Risks</h4>
                  <ul className="space-y-1">
                    {data.evidenceAnalysis.detectedRisks.map((r, i) => (
                      <li key={i} className="text-xs text-red-400 flex items-center"><AlertTriangle size={10} className="mr-2" /> {r}</li>
                    ))}
                  </ul>
                </div>
                {data.evidenceAnalysis.behavioralPatterns && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Behavioral Insights</h4>
                    <ul className="space-y-1">
                      {data.evidenceAnalysis.behavioralPatterns.map((p, i) => (
                        <li key={i} className="text-xs text-indigo-300 flex items-center"><TrendingUp size={10} className="mr-2" /> {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
             </div>
          </div>
        </section>
      )}
    </div>

    <div className="space-y-8">
      <section className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 overflow-hidden">
        <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center">
          <Camera size={14} className="mr-2" /> Vision Casting
        </h3>
        <div className="aspect-video rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 relative group">
          {generatedImage ? (
            <img src={generatedImage} alt="Future State" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex flex-col items-center text-slate-600">
              <Loader2 className="animate-spin mb-2" />
              <span className="text-xs uppercase tracking-widest font-bold">Generating Vision...</span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
             <p className="text-[10px] text-slate-300 italic line-clamp-2">{data.visualizationPrompt}</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
        <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center">
          <Globe size={14} className="mr-2" /> Case Precedents
        </h3>
        <div className="space-y-4">
          {data.diagnosis.historicalPrecedents.map((p, i) => (
            <div key={i} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-slate-200">{p.caseName}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  p.outcome === 'Success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 
                  p.outcome === 'Failure' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 
                  'bg-amber-900/30 text-amber-400 border border-amber-900/50'
                }`}>{p.outcome}</span>
              </div>
              <p className="text-xs text-slate-400 italic mb-2">"{p.relevance}"</p>
            </div>
          ))}
        </div>
        
        {data.sources && data.sources.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Intelligence Sources</h4>
             <div className="space-y-2">
                {data.sources.map((s, i) => (
                  <a 
                    key={i} 
                    href={s.uri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 hover:scale-[1.03] hover:translate-x-1 transition-all duration-200 ease-out origin-left group/source"
                  >
                    <ExternalLink size={10} className="mr-2 flex-shrink-0 group-hover/source:text-indigo-200" />
                    <span className="truncate group-hover/source:underline group-hover/source:underline-offset-2">{s.title}</span>
                  </a>
                ))}
             </div>
          </div>
        )}
      </section>
    </div>
  </div>
);

const BlueprintView = ({ data }: { data: PolicyAnalysis }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <BlueprintCard 
      icon={<Building2 className="text-indigo-400" />} 
      title="Government" 
      subtitle="Strategic & Structural"
      items={data.blueprint.government.policyChanges.concat(data.blueprint.government.infrastructure)}
      footer={`Enforcement: ${data.blueprint.government.enforcement}`}
    />
    <BlueprintCard 
      icon={<Users className="text-emerald-400" />} 
      title="Society" 
      subtitle="Institutional & Collective"
      items={data.blueprint.society.mobilizationEvents}
      footer={`NGO Role: ${data.blueprint.society.ngoRole}`}
    />
    <BlueprintCard 
      icon={<ThumbsUp className="text-amber-400" />} 
      title="Individual" 
      subtitle="Behavioral & Local"
      items={data.blueprint.individual.dailyActions}
      footer={`Incentives: ${data.blueprint.individual.incentives}`}
    />
  </div>
);

const BlueprintCard = ({ icon, title, subtitle, items, footer }: { icon: React.ReactNode, title: string, subtitle: string, items: string[], footer: string }) => (
  <div className="bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col">
    <div className="p-6 border-b border-slate-800">
      <div className="flex items-center space-x-3 mb-1">
        {icon}
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</p>
    </div>
    <div className="p-6 flex-1">
       <ul className="space-y-4">
         {items.map((item, i) => (
           <li key={i} className="flex items-start space-x-3 text-sm text-slate-300 leading-relaxed">
             <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500/50 flex-shrink-0" />
             <span>{item}</span>
           </li>
         ))}
       </ul>
    </div>
    <div className="p-6 bg-slate-950/50 border-t border-slate-800 rounded-b-xl">
       <p className="text-xs text-slate-400 italic">"{footer}"</p>
    </div>
  </div>
);

const TimelineView = ({ data }: { data: PolicyAnalysis }) => (
  <div className="relative py-12">
    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-slate-800 hidden md:block"></div>
    <div className="space-y-12">
      {data.shadowTimeline.map((event, i) => (
        <div key={i} className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
           <div className="flex-1 w-full md:w-1/2 px-4 md:px-12 mb-4 md:mb-0">
              <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all shadow-xl shadow-black/40">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    event.riskLevel === 'Critical' ? 'bg-red-900/30 text-red-400 border-red-900/50' : 
                    event.riskLevel === 'High' ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' : 
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>Risk: {event.riskLevel}</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{event.impactType} Impact</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{event.scenarioDescription}</p>
              </div>
           </div>
           
           <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-slate-950 border-4 border-slate-900 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <span className="text-indigo-400 font-black text-sm">+{event.yearOffset}y</span>
           </div>
           
           <div className="flex-1 w-full md:w-1/2 hidden md:block"></div>
        </div>
      ))}
    </div>
  </div>
);

const StakeholderView = ({ data }: { data: PolicyAnalysis }) => {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const playSpeech = async (stakeholder: Stakeholder, id: string) => {
        if (playingId === id) {
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch(e) {}
                sourceRef.current = null;
            }
            setPlayingId(null);
            return;
        }

        try {
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch(e) {}
                sourceRef.current = null;
            }

            setPlayingId(id);
            const base64Audio = await generateStakeholderSpeech(stakeholder);
            if (base64Audio) {
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                }
                const ctx = audioCtxRef.current;
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => {
                   setPlayingId(prev => prev === id ? null : prev);
                };
                source.start();
                sourceRef.current = source;
            }
        } catch (e) {
            console.error("Speech play failed", e);
            setPlayingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.stakeholders.map((s, i) => (
                <div key={i} className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 group hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">{s.group}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    s.sentiment === 'Positive' ? 'text-emerald-400 bg-emerald-900/20' : 
                                    s.sentiment === 'Negative' ? 'text-red-400 bg-red-900/20' : 
                                    'text-amber-400 bg-amber-900/20'
                                }`}>{s.sentiment} Sentiment</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Power: {s.influence}/100</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => playSpeech(s, `${i}`)}
                            className={`p-2 rounded-full border transition-all ${
                                playingId === `${i}` 
                                ? 'bg-indigo-600 border-indigo-500 text-white animate-pulse' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                        >
                            {playingId === `${i}` ? <StopCircle size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Core Motivation</h4>
                        <p className="text-slate-300 italic font-serif leading-relaxed">"{s.concern}"</p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Required Engagement</h4>
                        <div className="space-y-2">
                            {s.requiredActions.map((action, j) => (
                                <div key={j} className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                    <CheckCircle2 size={12} className="text-indigo-500 flex-shrink-0" />
                                    <span>{action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ResearchView = ({ data }: { data: PolicyAnalysis }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.researchPapers && data.researchPapers.length > 0 ? (
                data.researchPapers.map((paper, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex flex-col hover:border-indigo-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-950/30 rounded border border-indigo-500/30 text-indigo-400">
                                <GraduationCap size={18} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Academic Evidence</span>
                        </div>
                        <h3 className="text-md font-bold text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors">{paper.title}</h3>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xs font-bold text-indigo-400">{paper.institution}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                            <span className="text-xs font-medium text-slate-500">{paper.year}</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 flex-1 italic">"{paper.relevance}"</p>
                        <a 
                            href={paper.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-2 w-full py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-700 hover:border-indigo-500"
                        >
                            <Library size={12} />
                            <span>Access Research</span>
                            <ExternalLink size={10} />
                        </a>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-20 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={32} />
                    <p className="text-slate-500">Retrieving scholarly precedents...</p>
                </div>
            )}
        </div>
    );
};

const NewsView = ({ articles }: { articles: NewsArticle[] }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {articles.map((article, i) => (
                <div key={i} className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex flex-col hover:border-red-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{article.source}</h4>
                            <p className="text-[10px] text-slate-600 font-medium">{article.date}</p>
                        </div>
                        <a href={article.uri} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors">
                            <ExternalLink size={14} />
                        </a>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-red-300 transition-colors">
                        {article.title}
                    </h3>
                    
                    <div className="bg-slate-950/50 p-4 rounded-lg border-l-2 border-red-500/40 flex-1">
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            {article.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const JsonViewerModal = ({ data, onClose }: { data: PolicyAnalysis, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center"><FileJson size={18} className="mr-2 text-indigo-400" /> Raw Intelligence Data</h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto p-6 font-mono text-xs text-indigo-300 bg-slate-950">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900 rounded-b-2xl">
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all"
                >
                    <Copy size={14} /> <span>Copy to Clipboard</span>
                </button>
            </div>
        </div>
    </div>
);

// --- Main AnalysisDashboard Component ---

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, generatedImage, onReset }) => {
  const [activeTab, setActiveTab] = useState<TabView>('diagnosis');
  const [showJson, setShowJson] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [printContainer, setPrintContainer] = useState<HTMLElement | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrintContainer(document.getElementById('print-mount'));
  }, []);
  
  // Standard PDF generation using html2pdf.js
  const handleGeneratePDF = () => {
    if (!printableRef.current) return;
    setIsExporting(true);
    const element = printableRef.current;
    const opt = {
      margin: 1,
      filename: `Civic_Architect_Report_${data.title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.display = 'block';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.width = '800px'; 
    document.body.appendChild(clone);
    // @ts-ignore
    window.html2pdf().from(clone).set(opt).save().then(() => {
      document.body.removeChild(clone);
      setIsExporting(false);
    }).catch((err: any) => {
      console.error("PDF Generation failed", err);
      setIsExporting(false);
    });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      
      {/* Sticky Header */}
      <div className="sticky-header bg-slate-950/80 border-b border-slate-800 sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="mb-4 md:mb-0">
             <div className="flex items-center space-x-3 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-indigo-950/30 text-indigo-400 border border-indigo-900/50 text-[10px] font-bold uppercase tracking-wider">
                  Gemini 3 Pro Analysis
                </span>
                <span className="text-slate-500 text-xs font-medium">{new Date(data.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 title={data.rawInput} className="text-xl md:text-2xl font-bold text-slate-50 leading-tight tracking-tight truncate max-w-2xl cursor-help">{data.title}</h1>
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto overflow-x-auto">
            <nav className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <TabButton active={activeTab === 'diagnosis'} onClick={() => setActiveTab('diagnosis')} label="Diagnosis" icon={<Stethoscope size={14} />} />
                <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} label="News" icon={<Newspaper size={14} />} />
                <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')} label="Research" icon={<GraduationCap size={14} />} />
                <TabButton active={activeTab === 'blueprint'} onClick={() => setActiveTab('blueprint')} label="Blueprint" icon={<GitMerge size={14} />} />
                <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Timeline" icon={<Clock size={14} />} />
                <TabButton active={activeTab === 'stakeholders'} onClick={() => setActiveTab('stakeholders')} label="Stakeholders" icon={<Users size={14} />} />
            </nav>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <button onClick={() => setShowJson(true)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700" title="View JSON Source"><FileJson size={18} /></button>
                <button onClick={handleGeneratePDF} disabled={isExporting} className={`p-2 rounded-md transition-colors border border-transparent hover:border-slate-700 flex items-center ${isExporting ? 'text-indigo-500 cursor-wait' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`} title="Download PDF Report">
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-8">
            <ViabilityBar data={data} />
            {activeTab === 'diagnosis' && <DiagnosisView data={data} generatedImage={generatedImage} onExport={handleGeneratePDF} />}
            {activeTab === 'news' && <NewsView articles={data.newsArticles} />}
            {activeTab === 'research' && <ResearchView data={data} />}
            {activeTab === 'blueprint' && <BlueprintView data={data} />}
            {activeTab === 'timeline' && <TimelineView data={data} />}
            {activeTab === 'stakeholders' && <StakeholderView data={data} />}
        </div>
      </div>

      {showJson && <JsonViewerModal data={data} onClose={() => setShowJson(false)} />}
      {printContainer && createPortal(<div ref={printableRef} className="hidden" aria-hidden="true"><PrintableReport data={data} generatedImage={generatedImage} /></div>, printContainer)}
    </div>
  );
};

// --- Printable Report Component ---
const PrintableReport = ({ data, generatedImage }: { data: PolicyAnalysis, generatedImage: string | null }) => {
    return (
        <div className="font-serif text-black leading-relaxed bg-white p-10">
            <div className="border-b-4 border-black pb-8 mb-10">
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">{data.title}</h1>
                </div>
                <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400 border-t pt-4">
                    <span className="text-indigo-900">CIVIC ARCHITECT INTELLIGENCE REPORT // CONFIDENTIAL</span>
                    <span>GENERATED: {new Date(data.createdAt).toLocaleString()}</span>
                </div>
            </div>

            <section className="mb-12 no-break">
                <h2 className="text-xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Executive Synthesis</h2>
                <FormattedText text={data.executiveSummary} className="text-justify mb-8 text-md leading-relaxed text-gray-900 font-serif" isPrint />
            </section>

            <section className="mb-12 no-break">
                <h2 className="text-xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Reported Citizen Challenges (News)</h2>
                <div className="space-y-4">
                    {data.newsArticles.map((article, i) => (
                        <div key={i} className="border-b border-gray-100 pb-4">
                            <h3 className="text-sm font-bold text-gray-900">{article.title}</h3>
                            <p className="text-[10px] text-red-800 font-sans uppercase font-black tracking-widest">{article.source} // {article.date}</p>
                            <p className="text-xs text-gray-600 italic mt-1 leading-relaxed">"{article.description}"</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-12 no-break">
                <h2 className="text-xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Scholarly Evidence & Studies</h2>
                <div className="space-y-4">
                    {data.researchPapers.map((paper, i) => (
                        <div key={i} className="border-b border-gray-100 pb-4">
                            <h3 className="text-sm font-bold text-gray-900">{paper.title}</h3>
                            <p className="text-[10px] text-indigo-800 font-sans uppercase font-black tracking-widest">{paper.institution} // {paper.year}</p>
                            <p className="text-xs text-gray-600 italic mt-1 leading-relaxed">"{paper.relevance}"</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="page-break"></div>

            <section className="mb-12 no-break">
                <h2 className="text-xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Technical Audit & Vision</h2>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 font-sans">Risk Factors & Context</h3>
                       <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
                           {data.diagnosis.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                       </ul>
                   </div>
                   {generatedImage && (
                       <div>
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 font-sans">AI Architectural Projection</h3>
                           <img src={generatedImage} alt="Future Vision" className="shadow-md border border-gray-100 w-full rounded" />
                       </div>
                   )}
                </div>
            </section>
        </div>
    );
};
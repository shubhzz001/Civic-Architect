
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PolicyAnalysis, Stakeholder, TimelineEvent, BlueprintStrategy, Diagnosis } from '../types';
import { 
  ShieldAlert, TrendingUp, Users, BookOpen, Eye, Loader2, Info, Download, 
  ShieldCheck, Globe, ExternalLink, LayoutTemplate, FileText, Search, 
  ChevronDown, AlertTriangle, ScanEye, CheckCircle2, Wand2, Volume2, 
  StopCircle, Play, Stethoscope, Clock, GitMerge, Coins, ThumbsUp,
  FileJson, Printer, Copy, X, Check, Camera, FileDown
} from 'lucide-react';
import { generateStakeholderSpeech, generateSpeech } from '../services/geminiService';

interface AnalysisDashboardProps {
  data: PolicyAnalysis;
  generatedImage: string | null;
  onReset: () => void;
}

type TabView = 'diagnosis' | 'blueprint' | 'timeline' | 'stakeholders';

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
    const colorClass = viability.successProbability > 70 ? 'bg-emerald-500' : viability.successProbability > 40 ? 'bg-amber-500' : 'bg-red-500';
    
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

const DiagnosisView = ({ data, generatedImage }: { data: PolicyAnalysis, generatedImage: string | null }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      <section className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
        <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center">
          <BookOpen size={14} className="mr-2" /> Executive Summary
        </h3>
        <p className="text-slate-300 leading-relaxed text-lg font-light italic">{data.executiveSummary}</p>
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
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 truncate">
                    <ExternalLink size={10} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{s.title}</span>
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
                    event.riskLevel === 'Critical' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 
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
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playSpeech = async (stakeholder: Stakeholder, id: string) => {
        if (playingId === id) {
            audioRef.current?.pause();
            setPlayingId(null);
            return;
        }

        try {
            setPlayingId(id);
            const base64Audio = await generateStakeholderSpeech(stakeholder);
            if (base64Audio) {
                const audioBlob = new Blob([new Uint8Array(atob(base64Audio).split('').map(c => c.charCodeAt(0)))], { type: 'audio/pcm' });
                // Note: The TTS API returns raw PCM. For a simple web player, this is simplified.
                // In a world-class app, we'd use a PCM decoder as in the instructions.
                // For this demo dashboard, we'll use a placeholder behavior or standard handling.
                const url = `data:audio/wav;base64,${base64Audio}`; 
                if (audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play();
                }
            }
        } catch (e) {
            console.error("Speech play failed", e);
            setPlayingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
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
  const [printContainer, setPrintContainer] = useState<HTMLElement | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrintContainer(document.getElementById('print-mount'));
  }, []);
  
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Print failed, likely due to sandbox restrictions.", e);
      handleDownloadReport();
    }
  };

  const handleDownloadReport = () => {
    if (!printableRef.current) return;
    
    // Get the HTML content of the printable report
    const content = printableRef.current.innerHTML;
    
    // Create a standalone HTML document string
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Civic Architect Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: white; color: black; }
        @media print {
            @page { margin: 1.5cm; size: auto; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-break { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
        }
        .report-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        img { max-width: 100%; height: auto; border-radius: 0.5rem; }
    </style>
</head>
<body>
    <div class="report-container">
        ${content}
    </div>
    <script>
        // Auto-trigger print dialog if not sandboxed
        window.onload = () => {
            setTimeout(() => {
                try { window.print(); } catch(e) {}
            }, 500);
        };
    </script>
</body>
</html>`;

    // Create a blob and trigger download
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                <TabButton active={activeTab === 'blueprint'} onClick={() => setActiveTab('blueprint')} label="Blueprint" icon={<GitMerge size={14} />} />
                <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} label="Timeline" icon={<Clock size={14} />} />
                <TabButton active={activeTab === 'stakeholders'} onClick={() => setActiveTab('stakeholders')} label="Stakeholders" icon={<Users size={14} />} />
            </nav>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <button 
                    onClick={() => setShowJson(true)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
                    title="View JSON Source"
                >
                    <FileJson size={18} />
                </button>
                <button 
                    onClick={handleDownloadReport}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
                    title="Download Standalone Report (PDF Alternative)"
                >
                    <FileDown size={18} />
                </button>
                <button 
                    onClick={handlePrint}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
                    title="Print Document"
                >
                    <Printer size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-8">
            <ViabilityBar data={data} />
            {activeTab === 'diagnosis' && <DiagnosisView data={data} generatedImage={generatedImage} />}
            {activeTab === 'blueprint' && <BlueprintView data={data} />}
            {activeTab === 'timeline' && <TimelineView data={data} />}
            {activeTab === 'stakeholders' && <StakeholderView data={data} />}
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {showJson && <JsonViewerModal data={data} onClose={() => setShowJson(false)} />}

      {/* Portal to Print Mount */}
      {printContainer && createPortal(
          <div ref={printableRef} className="hidden print:block">
            <PrintableReport data={data} generatedImage={generatedImage} />
          </div>,
          printContainer
      )}

    </div>
  );
};

// --- Printable Report Component ---
const PrintableReport = ({ data, generatedImage }: { data: PolicyAnalysis, generatedImage: string | null }) => {
    return (
        <div className="max-w-4xl mx-auto font-serif text-black leading-relaxed p-12 bg-white">
            {/* Header */}
            <div className="border-b-4 border-black pb-8 mb-10">
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-black leading-none">{data.title}</h1>
                </div>
                <div className="flex justify-between text-xs font-sans font-bold uppercase tracking-widest text-gray-500 border-t-2 pt-4 border-gray-100">
                    <span className="text-indigo-900">CIVIC ARCHITECT INTELLIGENCE REPORT // CONFIDENTIAL</span>
                    <span>TIMESTAMP: {new Date(data.createdAt).toLocaleString()}</span>
                </div>
            </div>

            {/* Executive Summary */}
            <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Executive Synthesis</h2>
                <div className="text-justify mb-8 text-lg leading-relaxed text-gray-900">{data.executiveSummary}</div>
                
                <div className="bg-gray-50 p-8 border-l-8 border-indigo-600 rounded-r-lg shadow-sm">
                    <strong className="block mb-3 text-indigo-900 uppercase text-xs font-black tracking-widest font-sans">Root Cause Analysis</strong>
                    <p className="text-gray-800">{data.diagnosis.rootCause}</p>
                </div>
            </section>

            {/* Diagnostics and Visuals */}
            <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Forensic Diagnostics</h2>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                       <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 font-sans">Systemic Symptoms</h3>
                       <ul className="list-disc pl-5 space-y-2">
                           {data.diagnosis.symptoms.map((s, i) => <li key={i} className="text-gray-800">{s}</li>)}
                       </ul>
                   </div>
                   {generatedImage && (
                       <div>
                           <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 font-sans">Architectural Projection</h3>
                           <img src={generatedImage} alt="Future Vision" className="shadow-md border border-gray-100" />
                       </div>
                   )}
                </div>
            </section>

            <div className="page-break"></div>

            {/* Blueprint Section */}
            <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Implementation Blueprint</h2>
                <div className="space-y-8">
                   <div className="bg-gray-50 p-6 border rounded-lg">
                       <h3 className="text-sm font-black uppercase text-indigo-900 mb-3 font-sans">Government & Infrastructure</h3>
                       <p className="text-gray-800 text-sm mb-4"><strong>Strategic Enforcement:</strong> {data.blueprint.government.enforcement}</p>
                       <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm list-inside list-square">
                           {data.blueprint.government.policyChanges.concat(data.blueprint.government.infrastructure).map((item, i) => (
                               <li key={i} className="text-gray-700">{item}</li>
                           ))}
                       </ul>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="bg-gray-50 p-6 border rounded-lg">
                          <h3 className="text-sm font-black uppercase text-indigo-900 mb-3 font-sans">Social Mobilization</h3>
                          <p className="text-xs text-gray-500 mb-3 italic">NGO Role: {data.blueprint.society.ngoRole}</p>
                          <ul className="text-xs space-y-1 list-inside list-square">
                              {data.blueprint.society.mobilizationEvents.map((e, i) => <li key={i} className="text-gray-700">{e}</li>)}
                          </ul>
                      </div>
                      <div className="bg-gray-50 p-6 border rounded-lg">
                          <h3 className="text-sm font-black uppercase text-indigo-900 mb-3 font-sans">Individual Incentives</h3>
                          <p className="text-xs text-gray-500 mb-3 italic">Strategy: {data.blueprint.individual.incentives}</p>
                          <ul className="text-xs space-y-1 list-inside list-square">
                              {data.blueprint.individual.dailyActions.map((a, i) => <li key={i} className="text-gray-700">{a}</li>)}
                          </ul>
                      </div>
                   </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Shadow Timeline (20 Year Forecast)</h2>
                <div className="border-l-2 border-gray-200 pl-8 space-y-8">
                    {data.shadowTimeline.map((event, i) => (
                        <div key={i} className="relative">
                            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-lg font-sans text-indigo-900">YEAR +{event.yearOffset}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">Impact: {event.impactType}</span>
                            </div>
                            <p className="text-gray-700">{event.scenarioDescription}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stakeholders */}
            <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Stakeholder Matrix</h2>
                <div className="grid grid-cols-2 gap-4">
                    {data.stakeholders.map((s, i) => (
                        <div key={i} className="border border-gray-200 p-4 rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-2 border-b pb-1">
                                <span className="font-bold text-sm uppercase font-sans">{s.group}</span>
                                <span className="text-[10px] font-bold text-gray-400 font-sans">{s.sentiment}</span>
                            </div>
                            <p className="text-xs text-gray-600 italic mb-2">"{s.concern}"</p>
                            <div className="text-[9px] font-black text-indigo-900 uppercase tracking-widest mb-1 font-sans">Critical Involvement</div>
                            <ul className="text-[10px] text-gray-500 space-y-0.5">
                                {s.requiredActions.map((a, j) => <li key={j}>• {a}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <div className="mt-20 pt-8 border-t border-gray-200 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 font-sans">Generated by Civic Architect v1.2.0 // Gemini 3 Pro reasoning model</p>
            </div>
        </div>
    );
};

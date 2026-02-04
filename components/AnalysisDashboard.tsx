import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PolicyAnalysis, Stakeholder, TimelineEvent, BlueprintStrategy, Diagnosis } from '../types';
import { 
  ShieldAlert, TrendingUp, Users, BookOpen, Eye, Loader2, Info, Download, 
  ShieldCheck, Globe, ExternalLink, LayoutTemplate, FileText, Search, 
  ChevronDown, AlertTriangle, ScanEye, CheckCircle2, Wand2, Volume2, 
  StopCircle, Play, Stethoscope, Clock, GitMerge, Coins, ThumbsUp,
  FileJson, Printer, Copy, X, Check, Camera
} from 'lucide-react';
import { generateStakeholderSpeech, generateSpeech } from '../services/geminiService';

interface AnalysisDashboardProps {
  data: PolicyAnalysis;
  generatedImage: string | null;
  onReset: () => void;
}

type TabView = 'diagnosis' | 'blueprint' | 'timeline' | 'stakeholders';

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, generatedImage, onReset }) => {
  const [activeTab, setActiveTab] = useState<TabView>('diagnosis');
  const [showJson, setShowJson] = useState(false);
  const [printContainer, setPrintContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPrintContainer(document.getElementById('print-mount'));
  }, []);
  
  const handlePrint = () => {
    window.print();
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
                    onClick={handlePrint}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
                    title="Download PDF / Print Report"
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
          <PrintableReport data={data} generatedImage={generatedImage} />,
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
            <section className="mb-12">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Executive Synthesis</h2>
                <div className="text-justify mb-8 text-lg leading-relaxed text-gray-900">{data.executiveSummary}</div>
                
                <div className="bg-gray-50 p-8 border-l-8 border-indigo-600 rounded-r-lg shadow-sm">
                    <strong className="block mb-3 text-indigo-900 uppercase text-xs font-black tracking-widest font-sans">Root Cause Analysis</strong>
                    <p className="text-lg italic font-medium text-gray-800 leading-snug">{data.diagnosis.rootCause}</p>
                </div>
            </section>

            {/* Viability Stats */}
            <section className="mb-12 grid grid-cols-3 gap-8 font-sans">
                <div className="border-2 border-gray-200 p-6 rounded-xl bg-gray-50 text-center">
                    <span className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Budget Band</span>
                    <strong className="text-2xl text-black block leading-none">{data.viability.costBand}</strong>
                </div>
                <div className="border-2 border-gray-200 p-6 rounded-xl bg-gray-50 text-center">
                    <span className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Success Prob.</span>
                    <strong className="text-2xl text-black block leading-none">{data.viability.successProbability}%</strong>
                </div>
                <div className="border-2 border-gray-200 p-6 rounded-xl bg-gray-50 text-center">
                    <span className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Critical Driver</span>
                    <strong className="text-sm text-black block leading-tight font-bold">{data.viability.successFactors[0]}</strong>
                </div>
            </section>

            {/* Visual Insights & Future Projection */}
            {(generatedImage || data.inputEvidence) && (
                <section className="mb-12 no-break">
                    <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-6 text-indigo-900 font-sans tracking-tight">Visual Reasoning & Evidence</h2>
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {generatedImage && (
                            <div className="space-y-4">
                                <div className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-md">
                                    <img src={generatedImage} alt="Future Simulation" className="w-full aspect-video object-cover" />
                                </div>
                                <p className="text-xs text-gray-500 font-sans font-bold italic text-center">AI Simulation: {data.visualizationPrompt.slice(0, 100)}...</p>
                            </div>
                        )}
                        {data.inputEvidence && data.inputEvidence.mimeType.startsWith('image') && (
                            <div className="space-y-4">
                                <div className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-md">
                                    <img src={`data:${data.inputEvidence.mimeType};base64,${data.inputEvidence.data}`} alt="Evidence Audit" className="w-full aspect-video object-cover" />
                                </div>
                                <p className="text-xs text-gray-500 font-sans font-bold italic text-center">Input Evidence: {data.inputEvidence.filename}</p>
                            </div>
                        )}
                    </div>
                    {data.evidenceAnalysis && (
                         <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                            <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-3 font-sans">Forensic Audit Findings</h3>
                            <p className="text-sm text-emerald-800 leading-relaxed mb-4">{data.evidenceAnalysis.visualContext}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] font-black text-emerald-700 uppercase mb-1">Detected Risks</span>
                                    <ul className="list-disc pl-4 text-xs text-emerald-900">
                                        {data.evidenceAnalysis.detectedRisks.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                                {data.evidenceAnalysis.behavioralPatterns && (
                                    <div>
                                        <span className="block text-[10px] font-black text-emerald-700 uppercase mb-1">Operational Dynamics</span>
                                        <ul className="list-disc pl-4 text-xs text-emerald-900">
                                            {data.evidenceAnalysis.behavioralPatterns.map((p, i) => <li key={i}>{p}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Blueprint */}
            <section className="mb-12 page-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-8 text-indigo-900 font-sans tracking-tight">Strategic Implementation Blueprint</h2>
                <div className="space-y-10">
                    <div className="no-break">
                        <h3 className="font-black font-sans text-xl mb-4 flex items-center"><span className="bg-blue-900 text-white px-3 py-1 rounded-md text-xs mr-3 uppercase tracking-widest font-sans">Phase 01</span> Institutional Alignment</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Policy Changes</h4>
                                <ul className="list-disc pl-5 space-y-2 text-gray-800 text-sm">
                                    {data.blueprint.government.policyChanges.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Infrastructure Mandates</h4>
                                <ul className="list-disc pl-5 space-y-2 text-gray-800 text-sm">
                                    {data.blueprint.government.infrastructure.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="no-break border-t pt-8 border-gray-100">
                        <h3 className="font-black font-sans text-xl mb-4 flex items-center"><span className="bg-emerald-900 text-white px-3 py-1 rounded-md text-xs mr-3 uppercase tracking-widest font-sans">Phase 02</span> Societal Mobilization</h3>
                        <div className="bg-gray-50 p-6 rounded-lg mb-4">
                            <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">Governance & NGO Role</span>
                            <p className="text-sm text-gray-800">{data.blueprint.society.ngoRole}</p>
                        </div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Planned Community Events</h4>
                        <ul className="list-disc pl-5 grid grid-cols-2 gap-2 text-gray-800 text-sm">
                            {data.blueprint.society.mobilizationEvents.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-8 text-indigo-900 font-sans tracking-tight">Shadow Timeline Projections</h2>
                <div className="space-y-4">
                    {data.shadowTimeline.map((ev, i) => (
                        <div key={i} className="flex border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                            <div className={`w-24 flex items-center justify-center font-black text-xl font-sans ${
                                ev.riskLevel === 'Critical' ? 'bg-red-600 text-white' : 
                                ev.riskLevel === 'High' ? 'bg-amber-600 text-white' : 
                                'bg-indigo-600 text-white'
                            }`}>
                                +{ev.yearOffset}y
                            </div>
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{ev.impactType} Analysis</span>
                                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-white border border-gray-200">{ev.riskLevel} Risk</span>
                                </div>
                                <p className="text-md font-bold text-black leading-tight">{ev.scenarioDescription}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/* Stakeholders */}
             <section className="mb-12 no-break">
                <h2 className="text-2xl font-black uppercase border-b-2 border-indigo-900 pb-2 mb-8 text-indigo-900 font-sans tracking-tight">Stakeholder Power & Action Matrix</h2>
                <div className="grid grid-cols-1 gap-6">
                    {data.stakeholders.map((s, i) => (
                        <div key={i} className="border-2 border-gray-100 rounded-xl p-6 break-inside-avoid shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-black leading-none mb-1 uppercase tracking-tight">{s.group}</h3>
                                    <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Sentiment: <span className={`ml-2 ${s.sentiment === 'Negative' ? 'text-red-600' : s.sentiment === 'Positive' ? 'text-emerald-600' : 'text-amber-600'}`}>{s.sentiment}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Influence</span>
                                    <span className="text-2xl font-black text-indigo-900">{s.influence}%</span>
                                </div>
                            </div>
                            <div className="mb-6 bg-gray-50 p-4 rounded italic text-sm text-gray-700 leading-snug border-l-4 border-gray-300">
                                "{s.concern}"
                            </div>
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-indigo-900 block tracking-widest">Mandatory Contributions</span>
                                <ul className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs text-gray-900 font-medium">
                                    {s.requiredActions?.map((action, j) => (
                                        <li key={j} className="flex items-start">
                                            <span className="mr-2 text-indigo-600">■</span>
                                            {action}
                                        </li>
                                    )) || <li>Engagement in general advocacy</li>}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <div className="mt-20 pt-10 border-t-2 border-gray-100 text-center text-gray-300 font-sans no-print-item">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Generated by Civic Architect Intelligence Engine // Powered by Google Gemini 3 Pro</p>
                <p className="text-[10px] mt-1 italic">Simulation based on stochastic reasoning models and historical grounding.</p>
            </div>
        </div>
    );
};

// --- Modals ---

const JsonViewerModal = ({ data, onClose }: { data: PolicyAnalysis, onClose: () => void }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        element.href = URL.createObjectURL(file);
        element.download = `civic-architect-${data.id}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 rounded-t-xl">
                    <div className="flex items-center space-x-2">
                        <FileJson className="text-emerald-400" size={20} />
                        <h3 className="font-bold text-slate-100">Analysis Data Source</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleCopy} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border transition-all text-xs font-bold ${copied ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>{copied ? <Check size={14} /> : <Copy size={14} />}<span>{copied ? 'Copied' : 'Copy'}</span></button>
                        <button onClick={handleDownload} className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-xs font-bold"><Download size={14} /><span>Download .json</span></button>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-950/30 hover:text-rose-400 rounded transition-colors ml-2"><X size={20} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-0 bg-slate-950/50 relative">
                    <pre className="p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto tab-4">{JSON.stringify(data, null, 2)}</pre>
                </div>
                <div className="p-3 border-t border-slate-800 bg-slate-900 rounded-b-xl text-xs text-slate-500 flex justify-between">
                    <span>{new TextEncoder().encode(JSON.stringify(data)).length} bytes</span>
                    <span>JSON Schema v1.2</span>
                </div>
            </div>
        </div>
    );
};

// --- Views ---

const DiagnosisView = ({ data, generatedImage }: { data: PolicyAnalysis, generatedImage: string | null }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card 
                    title="Executive Synthesis" 
                    icon={<BookOpen size={18} className="text-indigo-400"/>}
                    readContent={data.executiveSummary}
                >
                    <p className="text-slate-300 leading-relaxed text-sm mb-4">{data.executiveSummary}</p>
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Problem Diagnosis</h4>
                        <div className="space-y-4">
                            <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-lg">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Root Cause</span>
                                <p className="text-sm text-rose-100">{data.diagnosis.rootCause}</p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Observed Symptoms</span>
                                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                                    {data.diagnosis.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    {data.evidenceAnalysis && (
                        <Card 
                            title="Visual Forensic Audit" 
                            icon={<ScanEye size={18} className="text-emerald-400"/>}
                            readContent={data.evidenceAnalysis.visualContext}
                        >
                            {data.inputEvidence && (
                                <div className="mb-4 rounded-lg overflow-hidden border border-slate-800 bg-black relative group no-print">
                                    {data.inputEvidence.mimeType.startsWith('video') ? (
                                        <div className="aspect-video flex items-center justify-center bg-slate-900">
                                            <VideoPlayer base64={data.inputEvidence.data} type={data.inputEvidence.mimeType} />
                                        </div>
                                    ) : (
                                        <img src={`data:${data.inputEvidence.mimeType};base64,${data.inputEvidence.data}`} className="w-full h-48 object-cover" alt="evidence"/>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-white">
                                        {data.inputEvidence.filename}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-sm text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">{data.evidenceAnalysis.visualContext}</p>
                                {data.evidenceAnalysis.mediaType === 'video' && (
                                    <div className="bg-indigo-950/20 p-3 rounded border border-indigo-900/30">
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block mb-1">Behavioral Patterns</span>
                                        <ul className="text-xs text-indigo-200 space-y-1">
                                            {data.evidenceAnalysis.behavioralPatterns?.map((p,i) => <li key={i}>• {p}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <div className="bg-rose-950/20 p-3 rounded border border-rose-900/30">
                                     <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block mb-1">Detected Physical Risks</span>
                                      <ul className="text-xs text-rose-200 space-y-1">
                                            {data.evidenceAnalysis.detectedRisks?.map((r,i) => <li key={i}>• {r}</li>)}
                                        </ul>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card title="Future State Projection" icon={<Wand2 size={18} className="text-indigo-400"/>}>
                        <div className="relative aspect-video bg-slate-950 rounded border border-slate-800 overflow-hidden mb-3">
                            {generatedImage ? (
                                <img src={generatedImage} alt="Future State" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"/>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <Loader2 className="animate-spin mb-2" />
                                    <span className="text-xs">Rendering visualization...</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 italic">"{data.visualizationPrompt}"</p>
                    </Card>
                </div>
            </div>

            <Card title="Historical Grounding & Precedents" icon={<Globe size={18} className="text-blue-400"/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.diagnosis.historicalPrecedents.map((h, i) => (
                        <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-200 text-sm">{h.caseName}</span>
                                <Badge label={h.outcome} color={h.outcome === 'Success' ? 'emerald' : h.outcome === 'Failure' ? 'rose' : 'amber'} />
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{h.relevance}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const BlueprintView = ({ data }: { data: PolicyAnalysis }) => {
    return (
        <div className="animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BlueprintColumn title="Government Strategy" icon={<LayoutTemplate size={16}/>} color="blue">
                    <Section title="Policy Changes" items={data.blueprint.government.policyChanges} />
                    <Section title="Infrastructure" items={data.blueprint.government.infrastructure} />
                    <div className="mt-4 bg-slate-900 p-3 rounded border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Enforcement</span>
                        <p className="text-sm text-slate-300">{data.blueprint.government.enforcement}</p>
                    </div>
                </BlueprintColumn>
                <BlueprintColumn title="Society & NGO" icon={<Users size={16}/>} color="emerald">
                    <Section title="Mobilization Events" items={data.blueprint.society.mobilizationEvents} />
                    <div className="mt-4 bg-emerald-950/20 p-3 rounded border border-emerald-900/30">
                         <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">NGO Role</span>
                         <p className="text-sm text-emerald-100">{data.blueprint.society.ngoRole}</p>
                    </div>
                </BlueprintColumn>
                <BlueprintColumn title="Individual Action" icon={<CheckCircle2 size={16}/>} color="amber">
                    <Section title="Daily Actions" items={data.blueprint.individual.dailyActions} />
                    <div className="mt-4 bg-amber-950/20 p-3 rounded border border-amber-900/30">
                         <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Incentives</span>
                         <p className="text-sm text-amber-100">{data.blueprint.individual.incentives}</p>
                    </div>
                </BlueprintColumn>
             </div>
        </div>
    );
}

const TimelineView = ({ data }: { data: PolicyAnalysis }) => {
    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-center">
                 <h2 className="text-xl font-bold text-white mb-2">Shadow Timeline Simulation</h2>
                 <p className="text-slate-400 text-sm">Probabilistic forecasting of 2nd and 3rd order effects over 20 years.</p>
            </div>

            <div className="relative pl-8 border-l-2 border-slate-800 space-y-12">
                {data.shadowTimeline.map((event, i) => (
                    <div key={i} className="relative">
                        <div className={`absolute -left-[41px] flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 font-bold text-xs ${
                            event.riskLevel === 'Critical' ? 'bg-rose-600 text-white' : 
                            event.riskLevel === 'High' ? 'bg-orange-500 text-white' : 
                            'bg-indigo-600 text-white'
                        }`}>
                            +{event.yearOffset}y
                        </div>

                        <div className={`p-6 rounded-xl border ${
                            event.riskLevel === 'Critical' ? 'bg-rose-950/10 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 
                            event.riskLevel === 'High' ? 'bg-orange-950/10 border-orange-500/50' : 
                            'bg-slate-900 border-slate-800'
                        }`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    event.impactType === 'Economic' ? 'bg-blue-950/30 text-blue-400' :
                                    event.impactType === 'Social' ? 'bg-emerald-950/30 text-emerald-400' :
                                    event.impactType === 'Trust' ? 'bg-purple-950/30 text-purple-400' :
                                    'bg-slate-800 text-slate-400'
                                }`}>{event.impactType} Impact</span>
                                <div className="flex items-center space-x-2">
                                    <SpeechButton textToRead={event.scenarioDescription} />
                                    <RiskBadge level={event.riskLevel} />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-slate-200 mb-2">{event.scenarioDescription}</h3>
                            {event.riskLevel === 'Critical' && (
                                <div className="flex items-center text-rose-400 text-xs font-bold mt-3 animate-pulse">
                                    <AlertTriangle size={12} className="mr-1.5"/> Critical System Failure Warning
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const StakeholderView = ({ data }: { data: PolicyAnalysis }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.stakeholders.map((s, i) => (
                 <StakeholderCard key={i} stakeholder={s} />
            ))}
        </div>
    );
}

// --- Components ---

const ViabilityBar = ({ data }: { data: PolicyAnalysis }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
             <div className="p-2 bg-indigo-950/30 rounded-lg text-indigo-400"><Coins size={20} /></div>
             <div>
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Budget</span>
                 <div className="text-lg font-bold text-white">{data.viability.costBand}</div>
             </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
             <div className="p-2 bg-emerald-950/30 rounded-lg text-emerald-400"><ThumbsUp size={20} /></div>
             <div>
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Success Probability</span>
                 <div className="text-lg font-bold text-white">{data.viability.successProbability}%</div>
             </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Key Success Factors</span>
             <div className="flex flex-wrap gap-1">
                 {data.viability.successFactors.slice(0, 2).map((f, i) => (
                     <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded truncate max-w-full">{f}</span>
                 ))}
             </div>
        </div>
    </div>
);

const BlueprintColumn = ({ title, icon, color, children }: any) => {
    const borderColor = color === 'blue' ? 'border-blue-500/30' : color === 'emerald' ? 'border-emerald-500/30' : 'border-amber-500/30';
    const bgHeader = color === 'blue' ? 'bg-blue-950/30 text-blue-400' : color === 'emerald' ? 'bg-emerald-950/30 text-emerald-400' : 'bg-amber-950/30 text-amber-400';

    return (
        <div className={`bg-slate-900/50 rounded-xl border ${borderColor} h-full`}>
            <div className={`p-4 border-b border-slate-800 flex items-center space-x-2 rounded-t-xl ${bgHeader}`}>
                {icon}
                <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
            </div>
            <div className="p-4 space-y-6">
                {children}
            </div>
        </div>
    );
};

const Section = ({ title, items }: { title: string, items: string[] }) => (
    <div>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start">
                    <span className="w-1 h-1 bg-slate-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const Card = ({ title, icon, readContent, children }: any) => (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
                {icon}
                <h2 className="text-lg font-bold text-slate-50 tracking-tight">{title}</h2>
            </div>
            {readContent && <SpeechButton textToRead={readContent} />}
        </div>
        {children}
    </div>
);

// --- New Speech Component ---

interface SpeechButtonProps {
    textToRead?: string;
    customGenerator?: () => Promise<string | null>;
    label?: string;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({ textToRead, customGenerator, label }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
    const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);

    const stop = () => {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
        }
        if (audioCtx) {
            audioCtx.close();
        }
        setSourceNode(null);
        setAudioCtx(null);
        setIsPlaying(false);
    };

    const play = async () => {
        if (isPlaying) {
            stop();
            return;
        }

        setIsLoading(true);
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            setAudioCtx(ctx);

            let pcmBase64: string | null = null;
            
            if (customGenerator) {
                pcmBase64 = await customGenerator();
            } else if (textToRead) {
                pcmBase64 = await generateSpeech(textToRead);
            }

            if (!pcmBase64) {
                throw new Error("No audio data");
            }

            const audioBuffer = await decodeAudioData(decode(pcmBase64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                setIsPlaying(false);
                setSourceNode(null);
            };
            
            source.start(0);
            setSourceNode(source);
            setIsPlaying(true);
        } catch (e) {
            console.error(e);
            stop();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close();
            }
        };
    }, [audioCtx]);

    if (label) {
        return (
            <button 
                onClick={play} 
                disabled={isLoading} 
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    isLoading || isPlaying 
                    ? 'bg-indigo-900/20 text-indigo-300 border border-indigo-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
            >
                {isLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : isPlaying ? (
                    <StopCircle size={12} className="text-rose-400" />
                ) : (
                    <Volume2 size={12} />
                )}
                <span>{isPlaying ? "Stop Audio" : label}</span>
            </button>
        );
    }

    return (
        <button 
            onClick={play}
            disabled={isLoading}
            className={`p-1.5 rounded-md transition-all ${
                isPlaying 
                ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' 
                : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800'
            }`}
            title={isPlaying ? "Stop Reading" : "Read Aloud"}
        >
             {isLoading ? <Loader2 size={16} className="animate-spin" /> : isPlaying ? <StopCircle size={16} /> : <Volume2 size={16} />}
        </button>
    );
};

const StakeholderCard = ({ stakeholder }: { stakeholder: Stakeholder }) => {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl hover:border-indigo-500/30 transition-colors flex flex-col h-full no-print">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-100 text-lg leading-tight mr-2">{stakeholder.group}</h4>
                <div className="flex-shrink-0">
                    <Badge label={stakeholder.sentiment} color={stakeholder.sentiment === 'Positive' ? 'emerald' : stakeholder.sentiment === 'Negative' ? 'rose' : 'amber'} />
                </div>
            </div>
            
            {/* Perspective Quote */}
            <div className="mb-5 bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-inner">
                <p className="text-xs text-slate-400 italic leading-relaxed">"{stakeholder.concern}"</p>
            </div>

            {/* Required Actions Checklist */}
            <div className="flex-1 mb-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3 pb-1 border-b border-slate-800/50">Required Involvement</span>
                <ul className="space-y-2.5">
                    {stakeholder.requiredActions?.length > 0 ? (
                        stakeholder.requiredActions.map((action, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-300">
                                <CheckCircle2 size={14} className="mt-0.5 mr-2 text-indigo-500 flex-shrink-0" />
                                <span className="leading-snug text-slate-200">{action}</span>
                            </li>
                        ))
                    ) : (
                        <li className="text-xs text-slate-600 italic">No specific actions assigned.</li>
                    )}
                </ul>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Influence</span>
                     <span className="text-sm font-bold text-slate-300">{stakeholder.influence}%</span>
                </div>
                
                <SpeechButton 
                    label="Hear Stance" 
                    customGenerator={() => generateStakeholderSpeech(stakeholder)} 
                />
            </div>
        </div>
    );
};

const Badge = ({ label, color }: { label: string, color: string }) => {
    const styleMap: Record<string, string> = {
        emerald: "bg-emerald-950/30 text-emerald-400 border-emerald-900/50",
        rose: "bg-rose-950/30 text-rose-400 border-rose-900/50",
        amber: "bg-amber-950/30 text-amber-400 border-amber-900/50",
        slate: "bg-slate-800 text-slate-400 border-slate-700"
    };
    const style = styleMap[color] || styleMap.slate;
    return <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${style}`}>{label}</span>;
};

const RiskBadge = ({ level }: { level: string }) => {
    const color = level === 'Critical' ? 'rose' : level === 'High' ? 'amber' : level === 'Moderate' ? 'slate' : 'emerald';
    return <Badge label={level} color={color} />;
}

const TabButton = ({ active, onClick, label, icon }: any) => (
    <button onClick={onClick} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-md m-0.5 ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>{icon}<span className="hidden sm:inline">{label}</span></button>
);

const VideoPlayer = ({ base64, type }: { base64: string, type: string }) => {
    return (
        <video controls className="w-full h-full">
            <source src={`data:${type};base64,${base64}`} type={type} />
            Your browser does not support the video tag.
        </video>
    );
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}
  
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
}
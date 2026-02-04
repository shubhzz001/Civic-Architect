import React from 'react';
import { Building2, Activity, Layers, Settings, FileText, ChevronRight, Info } from 'lucide-react';
import { PolicyAnalysis } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  history: PolicyAnalysis[];
  currentId: string | undefined;
  onSelectHistory: (analysis: PolicyAnalysis) => void;
  onNewSimulation: () => void;
  onShowAbout: () => void;
  isAboutActive: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
    children, 
    history, 
    currentId, 
    onSelectHistory, 
    onNewSimulation,
    onShowAbout,
    isAboutActive
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-20 lg:w-64 bg-slate-900/50 backdrop-blur-xl text-slate-300 flex-shrink-0 flex flex-col items-center md:items-stretch py-6 border-r border-slate-800">
        <div className="flex items-center justify-center md:justify-start px-4 mb-8 cursor-pointer group" onClick={onNewSimulation}>
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300">
            <Building2 className="text-white h-6 w-6" />
          </div>
          <span className="ml-3 text-lg font-bold hidden lg:block tracking-tight text-white group-hover:text-indigo-400 transition-colors">Civic Architect</span>
        </div>

        <nav className="flex-1 w-full px-2 space-y-6 overflow-y-auto">
          <div>
            <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:block">
                Menu
            </div>
            <NavItem 
                icon={<Activity size={20} />} 
                label="New Simulation" 
                active={!isAboutActive && !currentId} 
                onClick={onNewSimulation}
            />
             <NavItem 
                icon={<Info size={20} />} 
                label="About Platform" 
                active={isAboutActive} 
                onClick={onShowAbout}
            />
          </div>

          {history.length > 0 && (
              <div className="hidden lg:block">
                 <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Recent Models
                </div>
                <div className="space-y-1">
                    {history.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => onSelectHistory(item)}
                            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 group text-left ${
                                !isAboutActive && currentId === item.id 
                                ? 'bg-slate-800 text-white shadow-sm shadow-black/40' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                        >
                            <FileText size={14} className="mr-2 flex-shrink-0 opacity-70" />
                            <span className="truncate flex-1">{item.title}</span>
                            {currentId === item.id && !isAboutActive && <ChevronRight size={12} className="text-indigo-400" />}
                        </button>
                    ))}
                </div>
              </div>
          )}
        </nav>

        <div className="px-6 py-4 hidden lg:block text-xs text-slate-600 border-t border-slate-800/50 mt-auto">
          <p>Powered by Gemini 3 Pro</p>
          <p className="mt-1">v1.2.0 Enterprise</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ 
    icon, 
    label, 
    active = false, 
    onClick 
}: { 
    icon: React.ReactNode, 
    label: string, 
    active?: boolean,
    onClick?: () => void
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="ml-3 font-medium hidden lg:block">{label}</span>
  </button>
);
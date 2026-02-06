export interface Stakeholder {
  group: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  concern: string;
  influence: number; // 1-100
  requiredActions: string[]; // Specific actions they need to take
}

export interface Metric {
  label: string;
  value: number; // 0-100 score
  trend: 'up' | 'down' | 'stable';
  description: string;
  confidenceScore: number; // 0-100 AI confidence
  reasoningChain: string; // Explanation of why this score was given
}

export interface Source {
  title: string;
  uri: string;
}

export interface ResearchPaper {
  title: string;
  institution: string; // The university, research center, or place of study
  year: number;
  relevance: string; // Why this research matters to the simulation
  uri: string;
}

export interface NewsArticle {
  title: string;
  source: string; // The news organization (e.g., NYT, BBC)
  date: string; // Date/Time string (e.g., "2024-10-12 14:30")
  description: string; // Short summary of the reported problem/user pain point
  uri: string;
}

export interface EvidenceAnalysis {
  mediaType: 'image' | 'video' | 'pdf' | 'none';
  visualContext: string; // Description of what the AI sees
  detectedRisks: string[]; // Specific visual risks (e.g. "Crumbling concrete")
  behavioralPatterns?: string[]; // Only for video
}

export interface InputEvidence {
  data: string; // Base64
  mimeType: string;
  filename: string;
  caption?: string;
}

// --- NEW REASONING TYPES ---

export interface Diagnosis {
  rootCause: string;
  symptoms: string[];
  historicalPrecedents: {
    caseName: string;
    outcome: string; // "Success" | "Failure" | "Mixed"
    relevance: string; // Why it applies here
  }[];
}

export interface BlueprintStrategy {
  government: {
    policyChanges: string[];
    infrastructure: string[];
    enforcement: string;
  };
  society: {
    ngoRole: string;
    mobilizationEvents: string[];
  };
  individual: {
    dailyActions: string[];
    incentives: string;
  };
}

export interface TimelineEvent {
  yearOffset: number; // e.g., 2, 5, 10, 20
  scenarioDescription: string;
  impactType: 'Economic' | 'Social' | 'Environmental' | 'Trust';
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
}

export interface Viability {
  costBand: 'Low' | 'Medium' | 'High' | 'Mega-Project';
  costReasoning: string;
  successProbability: number; // 0-100
  successFactors: string[];
}

export interface PolicyAnalysis {
  id: string; // Unique ID for history
  createdAt: string; // ISO Date
  title: string;
  executiveSummary: string;
  
  // Core Modules
  diagnosis: Diagnosis;
  blueprint: BlueprintStrategy;
  shadowTimeline: TimelineEvent[];
  viability: Viability;
  researchPapers: ResearchPaper[]; // Academic module
  newsArticles: NewsArticle[]; // Public pain point module
  
  // Legacy/Visuals
  stakeholders: Stakeholder[];
  visualizationPrompt: string;
  sources: Source[]; // Grounding sources
  evidenceAnalysis?: EvidenceAnalysis; // New field for visual insights
  inputEvidence?: InputEvidence; // Persist the user's input file
  rawInput?: string; // The original problem statement from the user
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  ABOUT = 'ABOUT'
}
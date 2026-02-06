import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { PolicyAnalysis, Source, InputEvidence, Stakeholder, ResearchPaper, NewsArticle } from "../types";

// Define the expected output schema for the analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, professional title for the analysis report." },
    executiveSummary: { type: Type.STRING, description: "A high-level synthesis of the policy impact. Use Markdown bolding (**keyword**) to highlight critical insights, risks, or primary objectives." },
    
    diagnosis: {
      type: Type.OBJECT,
      properties: {
        rootCause: { type: Type.STRING, description: "The underlying systemic issue, distinguishing from symptoms." },
        symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
        historicalPrecedents: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              caseName: { type: Type.STRING, description: "City/Country and Year" },
              outcome: { type: Type.STRING, enum: ["Success", "Failure", "Mixed"] },
              relevance: { type: Type.STRING, description: "Why this precedent applies to the current simulation." }
            }
          }
        }
      }
    },

    researchPapers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the research paper or study." },
          institution: { type: Type.STRING, description: "The university, research center, or organization that conducted the study (e.g., 'MIT', 'Stanford', 'World Bank')." },
          year: { type: Type.INTEGER, description: "The year of publication or study completion." },
          relevance: { type: Type.STRING, description: "How this specific research supports or warns about the current policy proposal." },
          uri: { type: Type.STRING, description: "Direct link to the research paper, PDF, or scholarly portal (e.g., Google Scholar, JSTOR)." }
        },
        required: ["title", "institution", "year", "relevance", "uri"]
      },
      description: "A collection of academic and scholarly research papers related to the policy topic."
    },

    newsArticles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Headline of the news report." },
          source: { type: Type.STRING, description: "News outlet (e.g., BBC News, CNN, Local Times)." },
          date: { type: Type.STRING, description: "Month, Year and optionally the time if available." },
          description: { type: Type.STRING, description: "Short description of the specific problem or pain point reported by users/citizens in this news." },
          uri: { type: Type.STRING, description: "Direct link to the article." }
        },
        required: ["title", "source", "date", "description", "uri"]
      },
      description: "Recent news reports highlighting challenges and problems faced by citizens related to this policy area."
    },

    blueprint: {
      type: Type.OBJECT,
      properties: {
        government: {
          type: Type.OBJECT,
          properties: {
            policyChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
            infrastructure: { type: Type.ARRAY, items: { type: Type.STRING } },
            enforcement: { type: Type.STRING }
          }
        },
        society: {
          type: Type.OBJECT,
          properties: {
            ngoRole: { type: Type.STRING },
            mobilizationEvents: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        individual: {
          type: Type.OBJECT,
          properties: {
            dailyActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            incentives: { type: Type.STRING }
          }
        }
      }
    },

    shadowTimeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          yearOffset: { type: Type.INTEGER, description: "Years into the future (e.g., 2, 5, 10, 20)" },
          scenarioDescription: { type: Type.STRING, description: "Probabilistic future state." },
          impactType: { type: Type.STRING, enum: ['Economic', 'Social', 'Environmental', 'Trust'] },
          riskLevel: { type: Type.STRING, enum: ['Critical', 'High', 'Moderate', 'Low'] }
        }
      }
    },

    viability: {
      type: Type.OBJECT,
      properties: {
        costBand: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Mega-Project'] },
        costReasoning: { type: Type.STRING },
        successProbability: { type: Type.INTEGER, description: "0-100" },
        successFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },

    stakeholders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          group: { type: Type.STRING, description: "Name of the group, institution, or specific political leader (e.g. 'Mayor', 'Governor', 'Local Unions')." },
          sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative", "Mixed"] },
          concern: { type: Type.STRING, description: "The primary motivation or fear of this group (first person perspective)." },
          requiredActions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "Specific actionable steps or responsibilities this stakeholder must fulfill for the solution to work." 
          },
          influence: { type: Type.INTEGER, description: "Power level 0-100" }
        }
      }
    },

    visualizationPrompt: {
      type: Type.STRING,
      description: "A highly descriptive, photorealistic prompt for an image generation model to visualize the positive future state of this policy."
    },

    evidenceAnalysis: {
        type: Type.OBJECT,
        properties: {
            mediaType: { type: Type.STRING, enum: ['image', 'video', 'pdf', 'none'] },
            visualContext: { type: Type.STRING, description: "Visual forensic audit of the scene." },
            detectedRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Visible hazards or neglect signals." },
            behavioralPatterns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "If video: movement patterns, traffic flow, etc." }
        },
        description: "Analysis of the attached evidence. If no attachment, leave fields empty/default."
    }
  },
  required: ["title", "executiveSummary", "diagnosis", "blueprint", "shadowTimeline", "viability", "stakeholders", "visualizationPrompt", "researchPapers", "newsArticles"]
};

export const analyzePolicy = async (policyText: string, geography: string, attachment?: InputEvidence): Promise<PolicyAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const promptText = `You are Civic Architect, a stochastic policy simulation engine powered by Gemini 3 Pro.

Input Policy:
"${policyText}"

${geography ? `Target Geography / Context: "${geography}"` : ""}

${attachment ? `[EVIDENCE ATTACHED]
Filename: ${attachment.filename}
MimeType: ${attachment.mimeType}
Context: ${attachment.caption || "No caption"}
INSTRUCTION: Perform a forensic audit on this file.` : ""}

Mission:
Conduct a deep-chain reasoning simulation to architect the future state of this policy.

Reasoning Framework:
1. DIAGNOSIS: Separate symptoms from root causes. Use Google Search to find real-world precedents.
2. RESEARCH: Identify 3 academic research papers or university studies relevant to the topic. Extract Title, Institution, Year, and Relevance.
3. NEWS: Find 3-5 recent news articles that highlight problems, public complaints, or challenges faced by citizens/users related to this policy area. Extract Headline, Source, Date (including time if available), and a short description of the problem reported.
4. BLUEPRINT: Create a coordinated strategy across Government, Society, and Individuals.
5. SHADOW TIMELINE: Simulate 2nd and 3rd order effects up to 20 years out.
6. VIABILITY: Estimate budget bands and success probability.

Output:
- Strictly formatted JSON matching the schema.
- Tonality: Clinical, visionary, data-driven.`;

  const parts: any[] = [
    { text: promptText }
  ];

  if (attachment) {
    parts.unshift({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        tools: [{ googleSearch: {} }], 
        thinkingConfig: {
            thinkingBudget: 16000 
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text);

    // Extract Grounding Metadata
    const sources: Source[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }
    
    return {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        sources: sources,
        inputEvidence: attachment,
        rawInput: policyText
    } as PolicyAnalysis;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateImpactImage = async (prompt: string): Promise<string | null> => {
    if (!process.env.API_KEY) throw new Error("API Key not found");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image generation failed", e);
        return null;
    }
}

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const voiceName = 'Aoede'; 
  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: { parts: [{ text: text }] },
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
          }
      });
      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData) {
          return part.inlineData.data; 
      }
      return null;
  } catch (e) {
      console.error("Speech generation failed", e);
      return null;
  }
}

export const generateStakeholderSpeech = async (stakeholder: Stakeholder): Promise<string | null> => {
  if (!process.env.API_KEY) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const voices = ['Puck', 'Kore', 'Fenrir', 'Aoede', 'Charon'];
  const voiceIndex = stakeholder.group.length % voices.length;
  const selectedVoice = voices[voiceIndex];
  const prompt = `Act as a representative of the "${stakeholder.group}".sentiment: ${stakeholder.sentiment}. Concern: "${stakeholder.concern}"`;
  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: { parts: [{ text: prompt }] },
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } }
          }
      });
      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData) {
          return part.inlineData.data; 
      }
      return null;
  } catch (e) {
      console.error("Speech generation failed", e);
      return null;
  }
}
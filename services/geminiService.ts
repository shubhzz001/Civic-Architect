import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PolicyAnalysis, Source, InputEvidence, Stakeholder } from "../types";

// Define the expected output schema for the analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, professional title for the analysis report." },
    executiveSummary: { type: Type.STRING, description: "A high-level synthesis of the policy impact." },
    
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
  required: ["title", "executiveSummary", "diagnosis", "blueprint", "shadowTimeline", "viability", "stakeholders", "visualizationPrompt"]
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
INSTRUCTION: Perform a forensic audit on this file. 
- If VIDEO: Analyze behavioral patterns, traffic flow, and environmental cues over time.
- If IMAGE: Analyze infrastructure condition, neglect signals, and spatial constraints.
- Integrate these findings into the 'evidenceAnalysis' and the 'diagnosis'.` : ""}

Mission:
Conduct a deep-chain reasoning simulation to architect the future state of this policy.

Reasoning Framework:
1. DIAGNOSIS: Separate symptoms from root causes. Use Google Search to find real-world precedents (successes and failures).
2. BLUEPRINT: Create a coordinated strategy across Government (policy/infra), Society (NGOs), and Individuals (behavior).
3. SHADOW TIMELINE: Simulate 2nd and 3rd order effects up to 20 years out. Highlight compounding failures.
4. VIABILITY: Estimate budget bands and success probability based on complexity.
5. STAKEHOLDERS: Identify key players, including specific political leaders or institutions if relevant to the geography. Define their 'Required Involvement' (actions they must take), not just their sentiment.

Output:
- Strictly formatted JSON matching the schema.
- Tone: Clinical, visionary, data-driven.`;

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
            thinkingBudget: 16000 // Increased for deep diagnostic reasoning
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
  
  // Use a neutral, authoritative voice for general reading
  const voiceName = 'Aoede'; 

  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: { parts: [{ text: text }] },
          config: {
              responseModalities: ["AUDIO"],
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

  const prompt = `Act as a representative of the "${stakeholder.group}". 
  Your sentiment towards the policy is ${stakeholder.sentiment}.
  Read the following concern naturally: "${stakeholder.concern}"`;

  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: { parts: [{ text: prompt }] },
          config: {
              responseModalities: ["AUDIO"],
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
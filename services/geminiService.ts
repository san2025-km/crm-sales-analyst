
import { GoogleGenAI, Type } from "@google/genai";
import type { Account, SentimentResult } from '../types';

// =================================================================================
// API KEY CONFIGURATION
// =================================================================================
// The API key is automatically sourced from the environment's secrets.
// There is no need to manually insert the key here.
// =================================================================================
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("API key not found. Please ensure it is configured in the environment settings.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatAggregatedDataForPrompt(accounts: Account[]): string {
    if (accounts.length === 0) {
        return "No CRM data found matching the specified filters.";
    }

    let context = "--- AGGREGATED CRM DATA START ---\n\n";

    accounts.forEach(account => {
        context += `== Account: ${account.name} | AE: ${account.ae} ==\n\n`;
        account.activities.forEach(activity => {
            context += `Date: ${activity.date}\n`;
            context += `Type: ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}\n`;
            context += `Summary: ${activity.summary}\n`;
            context += `Details/Transcript:\n${activity.content}\n\n`;
            context += "---\n\n";
        });
    });

    context += "--- AGGREGATED CRM DATA END ---";
    return context;
}

export async function* generateSalesInsightsStream(accounts: Account[], question: string): AsyncGenerator<string> {
    if (!API_KEY) {
        yield "Error: API key not configured for this environment. The application cannot connect to the AI service.";
        return;
    }
    const crmContext = formatAggregatedDataForPrompt(accounts);
    if (crmContext.startsWith("No CRM data")) {
        yield "No data was found for the selected filters. Please expand your search criteria and try again.";
        return;
    }

    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are a world-class sales analyst and strategist. You will be given a collection of sales meeting transcripts, emails, and notes from a CRM for a specific sales team or representative over a period of time. 
Your task is to analyze this data in aggregate to answer a specific strategic question. 
Look for patterns, recurring themes, customer pain points, competitive mentions, and reasons for wins or losses. 
Synthesize your findings into a concise, actionable report. Use markdown for formatting (e.g., headings, lists, bold text).
Base your answer ONLY on the provided data. Do not invent information. For every key finding, provide citations of at least 2 - 4 customer records with a snippet of the verbatim.

Here is the aggregated CRM data:
${crmContext}`;

    try {
        const response = await ai.models.generateContentStream({
            model,
            contents: question,
            config: {
                systemInstruction,
            },
        });
        
        for await (const chunk of response) {
            yield chunk.text ?? "";
        }

    } catch (error) {
        console.error(`Error calling Gemini API for model ${model}:`, error);
        throw new Error("Failed to get a response from the AI model. Check if the environment's API key is valid and has permissions.");
    }
}

function formatMeetingTranscriptsForSentiment(accounts: Account[]): string {
    let context = "";
    accounts.forEach(account => {
        account.activities.forEach(activity => {
            if (activity.type === 'meeting') {
                context += `Account: ${account.name}\n`;
                context += `Transcript:\n${activity.content}\n\n---\n\n`;
            }
        });
    });
    return context || "No meeting transcripts found in the provided data.";
}

export async function performSentimentAnalysis(accounts: Account[]): Promise<SentimentResult | null> {
    if (!API_KEY) {
        // Fail gracefully for this optional component if the key is missing.
        return null;
    }
    const transcripts = formatMeetingTranscriptsForSentiment(accounts);
    
    if (transcripts.includes("No meeting transcripts found")) {
        return null;
    }

    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are a sentiment analysis expert. Analyze the provided meeting transcripts. Determine the overall sentiment and identify key moments. Your response must be in JSON format.`;
    
    const sentimentSchema = {
        type: Type.OBJECT,
        properties: {
            overallScore: {
                type: Type.NUMBER,
                description: 'A score from -1.0 (very negative) to 1.0 (very positive), representing the overall sentiment.'
            },
            summary: {
                type: Type.STRING,
                description: 'A brief, one-sentence summary of the overall customer sentiment (e.g., "Generally positive", "Mixed with concerns about pricing").'
            },
            keyMoments: {
                type: Type.ARRAY,
                description: 'A list of 3-5 specific quotes from the transcripts that are strong indicators of sentiment.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        quote: { type: Type.STRING, description: 'The verbatim quote from the transcript.' },
                        sentiment: { type: Type.STRING, description: 'The sentiment of this specific quote: "Positive", "Negative", or "Neutral".' },
                        accountName: { type: Type.STRING, description: 'The name of the account from which the quote was taken.' }
                    },
                    required: ['quote', 'sentiment', 'accountName']
                }
            }
        },
        required: ['overallScore', 'summary', 'keyMoments']
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `Analyze these transcripts:\n${transcripts}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: sentimentSchema,
            },
        });

        if (response.text) {
            try {
                return JSON.parse(response.text) as SentimentResult;
            } catch (e) {
                console.error("Failed to parse JSON from sentiment analysis:", e);
                return null;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error calling Gemini API for sentiment analysis:`, error);
        return null;
    }
}
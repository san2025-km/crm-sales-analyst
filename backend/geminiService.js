// Use CommonJS syntax for Node.js
const { GoogleGenAI, Type } = require("@google/genai");

// Get API key from environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set for Gemini");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatAggregatedDataForPrompt(accounts) {
    if (!accounts || accounts.length === 0) {
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

async function generateSalesInsights(accounts, question) {
    const model = 'gemini-3-flash-preview';
    const crmContext = formatAggregatedDataForPrompt(accounts);

    if (crmContext.startsWith("No CRM data")) {
        return "No data was found for the selected filters. Please expand your search criteria and try again."
    }

    const systemInstruction = `You are a world-class sales analyst and strategist. You will be given a collection of sales meeting transcripts, emails, and notes from a CRM for a specific sales team or representative over a period of time. 
Your task is to analyze this data in aggregate to answer a specific strategic question. 
Look for patterns, recurring themes, customer pain points, competitive mentions, and reasons for wins or losses. 
Synthesize your findings into a concise, actionable report. Use markdown for formatting (e.g., headings, lists, bold text).
Base your answer ONLY on the provided data. Do not invent information.

Here is the aggregated CRM data:
${crmContext}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: question,
            config: {
                systemInstruction,
            },
        });
        
        return response.text ?? "I was unable to derive an insight from the provided data. The dataset might be too small or lack relevant information to answer your question.";

    } catch (error) {
        console.error(`Error calling Gemini API for model ${model}:`, error);
        throw new Error("Failed to get a response from the AI model for insights.");
    }
}

function formatMeetingTranscriptsForSentiment(accounts) {
    let context = "";
    if (!accounts) return "No meeting transcripts found in the provided data.";

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

async function performSentimentAnalysis(accounts) {
    const model = 'gemini-3-flash-preview';
    const transcripts = formatMeetingTranscriptsForSentiment(accounts);
    
    if (transcripts.includes("No meeting transcripts found")) {
        return null;
    }

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
                return JSON.parse(response.text);
            } catch (e) {
                console.error("Failed to parse JSON from sentiment analysis:", e);
                return null;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error calling Gemini API for sentiment analysis:`, error);
        throw new Error("Failed to get a response from the AI model for sentiment analysis.");
    }
}

// Export the functions to be used in server.js
module.exports = {
    generateSalesInsights,
    performSentimentAnalysis,
};
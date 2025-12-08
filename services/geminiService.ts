import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { SearchResult } from '../types';

// NOTE: Key selection logic is handled in the UI via window.aistudio.openSelectKey()
// We assume process.env.API_KEY is populated if running in a standard env, 
// OR we will instantiate the client dynamically when needed if the key is stored elsewhere/injected.
// For this environment, we rely on process.env.API_KEY being available after selection.

const getAIClient = () => {
    // In a real scenario with the key picker, we might need to re-instantiate or check global state.
    // Assuming process.env.API_KEY is updated or we use a custom method to retrieve it.
    // For this specific requirement "injected automatically", we use process.env.API_KEY.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generatePlanetNarrative = async (planetName: string, properties: string, refInfo?: { title: string, url: string }): Promise<string> => {
    const ai = getAIClient();
    
    let prompt = `Write a short, engaging, and scientific narrative about the exoplanet ${planetName}. 
    Here are its properties from the NASA archive: ${properties}.
    Focus on what makes it unique compared to Earth or other planets.`;

    if (refInfo && refInfo.url) {
        prompt += `\n\nIMPORTANT: The planet is discussed in the scientific reference titled "${refInfo.title}". 
        Please use Google Search to find information about this specific paper or discovery (URL: ${refInfo.url}) and incorporate key findings from it into the narrative.
        Verify the details from the search results to ensure accuracy.`;
    }

    prompt += `\n\nKeep the narrative under 200 words.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // Enable search to look up the reference
            },
        });
        return response.text || "No narrative generated.";
    } catch (error) {
        console.error("Narrative generation failed:", error);
        throw error;
    }
};

export const searchPlanetInfo = async (planetName: string): Promise<SearchResult> => {
    const ai = getAIClient();
    const prompt = `What are the latest scientific discoveries or interesting facts about the exoplanet ${planetName}?`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text || "No search results found.";
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const urls = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web)
            .map((web: any) => ({ title: web.title, url: web.uri }));

        return { content: text, urls };
    } catch (error) {
        console.error("Search failed:", error);
        throw error;
    }
};

export const generateImageDescription = async (planetName: string, properties: string, refInfo?: { title: string, url: string }): Promise<string> => {
    // Uses the flash model to create a prompt for the image model
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = `Create a highly detailed, vivid, and scientifically grounded visual description for the exoplanet ${planetName} based on these properties: ${properties}.`;

    if (refInfo && refInfo.url) {
        prompt += `\n\nIMPORTANT: The planet is discussed in the scientific reference titled "${refInfo.title}". 
        Please use Google Search to find specific visual details mentioned in this paper or discovery (URL: ${refInfo.url}) such as color, atmosphere composition, cloud presence, surface texture, or potential artistic interpretations discussed in the findings. 
        Incorporate these specific visual findings into the description.`;
    }

    prompt += `\n\nDescribe the appearance of the planet, its surface (if applicable) or atmosphere, cloud layers, lighting from its host star, and any unique features. 
    The description should be optimized for an AI image generator. Keep it under 100 words.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }], // Enable search to look up visual details in the reference
            },
        });
        return response.text || `A realistic planet in space named ${planetName}`;
    } catch (error) {
        console.error("Image description generation failed:", error);
        return `A realistic planet in space named ${planetName}`;
    }
};

export const generatePlanetImage = async (description: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string | null> => {
    // Note: The caller must ensure API Key is selected before calling this.
    // Using a new client instance to ensure latest key is used if changed.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
    
    const prompt = `A realistic and scientifically grounded artistic rendering of the exoplanet. Description: ${description}. 
    Cinematic lighting, high resolution, photorealistic, 8k, space background.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: size
                }
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        throw error;
    }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
        console.error("TTS failed:", error);
        throw error;
    }
};
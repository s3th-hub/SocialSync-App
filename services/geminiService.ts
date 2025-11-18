import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Tone, SocialContentResponse, Platform } from "../types";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    linkedin: {
      type: Type.OBJECT,
      properties: {
        post: { type: Type.STRING, description: "The main post content for LinkedIn." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate a professional, high-quality image suitable for LinkedIn." },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 relevant hashtags." }
      },
      required: ["post", "imagePrompt"]
    },
    twitter: {
      type: Type.OBJECT,
      properties: {
        post: { type: Type.STRING, description: "The tweet content, keeping character limits in mind." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an engaging, viral-worthy image for Twitter." },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 relevant hashtags." }
      },
      required: ["post", "imagePrompt"]
    },
    instagram: {
      type: Type.OBJECT,
      properties: {
        post: { type: Type.STRING, description: "The caption for Instagram." },
        imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate a highly aesthetic, visually striking image for Instagram." },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "10-15 relevant hashtags." }
      },
      required: ["post", "imagePrompt"]
    }
  },
  required: ["linkedin", "twitter", "instagram"]
};

export const generateSocialContent = async (idea: string, tone: Tone): Promise<SocialContentResponse> => {
  const prompt = `
    You are an expert social media manager. 
    Create content for LinkedIn, Twitter (X), and Instagram based on the following idea: "${idea}".
    
    Tone: ${tone}.
    
    For each platform:
    1. Write the post text/caption optimized for that platform's best practices (length, style, formatting).
    2. Create a specific, descriptive image generation prompt that I can feed into an image generator to create a perfect visual for this post.
    3. Include relevant hashtags.
  `;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Slightly creative
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No content generated");
    
    return JSON.parse(jsonText) as SocialContentResponse;
  } catch (error) {
    console.error("Error generating text content:", error);
    throw error;
  }
};

export const generateImageForPlatform = async (prompt: string, platform: Platform): Promise<string> => {
  // Map platform to aspect ratio
  let aspectRatio = '1:1';
  switch (platform) {
    case 'linkedin':
      aspectRatio = '16:9';
      break;
    case 'twitter':
      aspectRatio = '16:9';
      break;
    case 'instagram':
      aspectRatio = '1:1'; // Square is classic and safe for Insta
      break;
  }

  try {
    const response = await ai.models.generateImages({
      model: imageModel,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image bytes returned");
    }

    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error(`Error generating image for ${platform}:`, error);
    throw error;
  }
};
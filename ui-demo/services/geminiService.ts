
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCampaignStory = async (topic: string, goal: number) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a compelling, high-converting fundraiser story for a campaign about: "${topic}". The goal is $${goal}. Make it emotional but professional. Include a hook, the problem, and why the donor's contribution matters. Return ONLY the story text.`,
  });
  return response.text || "Failed to generate story.";
};

export const generateEventContent = async (campaignTitle: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a catchy fundraiser event for the campaign "${campaignTitle}". Return a JSON object with: { "title": "...", "description": "...", "venue": "..." }. Keep it exciting.`,
    config: { responseMimeType: "application/json" }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { title: "Community Meetup", description: "Join us for an update!", venue: "City Hall" };
  }
};

export const generateBlogPost = async (campaignTitle: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a professional blog post update for the campaign "${campaignTitle}". Return a JSON object with: { "title": "...", "excerpt": "...", "content": "..." }. Use an authoritative yet hopeful tone.`,
    config: { responseMimeType: "application/json" }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch {
    return { title: "Progress Update", excerpt: "We are moving fast!", content: "Detailed progress report..." };
  }
};

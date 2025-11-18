export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
  CASUAL = 'Casual',
  INSPIRATIONAL = 'Inspirational'
}

export type Platform = 'linkedin' | 'twitter' | 'instagram';

export interface GeneratedPostContent {
  post: string;
  imagePrompt: string;
  hashtags?: string[];
}

export interface SocialContentResponse {
  linkedin: GeneratedPostContent;
  twitter: GeneratedPostContent;
  instagram: GeneratedPostContent;
}

export interface PlatformResult {
  platform: Platform;
  content: string | null;
  imageUrl: string | null;
  isLoadingText: boolean;
  isLoadingImage: boolean;
  error?: string;
  imagePrompt?: string;
}

export interface GenerateRequest {
  idea: string;
  tone: Tone;
}
// src/types/ai.ts

export type AIVersion = 'professional' | 'luxury' | 'elegant' | 'concise' | 'funny' | 'simple' | 'call to action' | 'modern design' | 'outdoor space' | 'architectural' | 'views' | 'seo-optimized';

export interface AIResponse {
  version: AIVersion;
  image_title: string;
  image_description: string;
}

export interface AIMetadata {
  last_generated: string;
  responses: AIResponse[];
}

export interface AIAnalysisRequest {
  property_id: string;
  image_id: string;
  versions: AIVersion[];
}

export interface AIAnalysisResponse {
  status: 'success' | 'error';
  data?: {
    versions: AIResponse[];
  };
  message?: string;
}


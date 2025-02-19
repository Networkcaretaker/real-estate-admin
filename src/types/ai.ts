// src/types/ai.ts

export type AIVersion = 'professional' | 'luxury' | 'elegant' | 'concise' | 'funny' | 'simple' | 'call to action' | 'modern design' | 'outdoor space' | 'architectural' | 'views' | 'seo-optimized' | 'modern' | 'investment' | 'lifestyle';

export interface AIResponse {
  version: string;
  title: string;
  description: string;
  excerpt?: string;
  // These are optional since they're only used for image analysis
  image_title?: string;
  image_description?: string;
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

// Property AI Assistant
export interface PropertyAIRequest {
  property_id: string;
  image_id: string;
  versions: AIVersion[];  // Reusing existing AIVersion type
}

export interface PropertyAIResponse {
  version: AIVersion;
  title: string;
  description: string;
  excerpt: string;
}

export interface PropertyAIMetadata {
  last_generated: string;
  image_id: string;  // Track which image was used
  responses: PropertyAIResponse[];
}

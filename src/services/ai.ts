// src/services/ai.ts

import { AIAnalysisRequest, AIAnalysisResponse } from '../types/ai';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const aiService = {
  async analyzeImage(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // We'll need to add authentication headers here
          'Authorization': `Basic ${btoa(`${process.env.REACT_APP_API_USERNAME}:${process.env.REACT_APP_API_PASSWORD}`)}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to analyze image'
      };
    }
  }
};
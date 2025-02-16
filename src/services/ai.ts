// src/services/ai.ts

import { AIAnalysisRequest, AIAnalysisResponse } from '../types/ai';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//const API_USERNAME = import.meta.env.VITE_API_USERNAME;
//const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;
// import { auth } from './firebase/config'; // Your Firebase auth config

export const aiService = {
  async analyzeImage(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to analyze image');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Detailed error analyzing image:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to analyze image'
      };
    }
  }
};
// src/components/AIPropertyAssistant.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { AIVersion, AIResponse } from '../types/ai';
import { aiService } from '../services/ai';
import { PropertyImage } from '../types/property';

interface AIPropertyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  selectedImage: PropertyImage;
  onUpdateProperty: (updates: { 
    title?: string; 
    description?: string;
    excerpt?: string;
  }) => Promise<void>;
  propertyAIMetadata?: {
    last_generated?: string;
    image_id?: string;
    responses?: AIResponse[];
  };
  onLoadAIMetadata?: () => void;
}

// Similar versions to AIImageAssistant but more property-focused
const AVAILABLE_VERSIONS: { value: AIVersion; label: string }[] = [
  { value: 'professional', label: 'Professional Real Estate' },
  { value: 'luxury', label: 'Luxury Market' },
  { value: 'modern', label: 'Modern & Contemporary' },
  { value: 'investment', label: 'Investment Focus' },
  { value: 'lifestyle', label: 'Lifestyle & Community' },
  { value: 'architectural', label: 'Architectural Detail' },
  { value: 'seo-optimized', label: 'SEO Optimized' }
];

export const AIPropertyAssistant: React.FC<AIPropertyAssistantProps> = ({
  isOpen,
  onClose,
  propertyId,
  selectedImage,
  onUpdateProperty,
  onLoadAIMetadata,
  propertyAIMetadata
}) => {
  const [selectedVersions, setSelectedVersions] = useState<AIVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<AIResponse | null>(null);
  const [showSavedResponses, setShowSavedResponses] = useState(false);
  const [savedResponses, setSavedResponses] = useState<AIResponse[]>([]);

  // Use useCallback to memoize the metadata loading
  const memoizedLoadAIMetadata = useCallback(() => {
    onLoadAIMetadata?.();
  }, [onLoadAIMetadata]);

  // Only load metadata when the component mounts or image changes
  useEffect(() => {
    memoizedLoadAIMetadata();
  }, [memoizedLoadAIMetadata]);

  useEffect(() => {
    if (propertyAIMetadata?.responses) {
      setSavedResponses(propertyAIMetadata.responses);
    }
  }, [propertyAIMetadata]);

  const handleVersionToggle = (version: AIVersion) => {
    setSelectedVersions(prev => {
      if (prev.includes(version)) {
        return prev.filter(v => v !== version);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, version];
    });
  };

  const handleAnalyze = async () => {
    if (selectedVersions.length === 0) {
      setError('Please select at least one version');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeProperty({
        property_id: propertyId,
        image_id: selectedImage.id,
        versions: selectedVersions
      });

      console.log('AI Response:', result);

      if (result.status === 'error' || !result.data) {
        throw new Error(result.message || 'Failed to analyze property');
      }

      setResponses(result.data.versions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResponse = async () => {
    if (!selectedResponse) return;
    try {
      await onUpdateProperty({
        title: selectedResponse.title,
        description: selectedResponse.description,
        excerpt: selectedResponse.excerpt
      });
      onClose();
    } catch (err) {
      setError('Failed to update property details');
    }
  };

  const renderSavedResponsesSection = () => {
    console.log("savedResponses", savedResponses);
    if (!savedResponses.length) return null;
  
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700 py-4">
            Previous Versions ({savedResponses.length})
          </h4>
          <button
            onClick={() => setShowSavedResponses(!showSavedResponses)}
            className="text-blue-500 hover:text-blue-600 text-sm py-4"
          >
            {showSavedResponses ? 'Hide' : 'View'} Previous Versions
          </button>
        </div>
        {showSavedResponses && (
          <div className="space-y-4">
            {savedResponses.map((response, index) => (
              <div
                key={index}
                className={`p-4 rounded border ${
                  selectedResponse === response
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{response.version}</span>
                  <button
                    onClick={() => setSelectedResponse(response)}
                    className={`px-3 py-1 rounded ${
                      selectedResponse === response
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    Select
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <strong className="text-sm">Title:</strong>
                    <p className="text-sm">{response.title}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Excerpt:</strong>
                    <p className="text-sm">{response.excerpt}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Description:</strong>
                    <p className="text-sm">{response.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">AI Property Assistant</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Preview */}
            <div className="mb-4">
              <img
                src={selectedImage.urls.medium}
                alt="Selected property"
                className="w-full h-64 object-cover rounded"
              />
            </div>

            {/* Version Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Content Styles (max 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VERSIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleVersionToggle(value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedVersions.includes(value)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    disabled={selectedVersions.length >= 3 && !selectedVersions.includes(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || selectedVersions.length === 0}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isLoading || selectedVersions.length === 0
                  ? 'bg-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Property Content'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Generated Content */}
            {responses.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Versions</h4>
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded border ${
                        selectedResponse === response
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{response.version}</span>
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className={`px-3 py-1 rounded ${
                            selectedResponse === response
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Select
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <strong className="text-sm">Title:</strong>
                          <p className="text-sm">{response.title}</p>
                        </div>
                        <div>
                          <strong className="text-sm">Excerpt:</strong>
                          <p className="text-sm">{response.excerpt}</p>
                        </div>
                        <div>
                          <strong className="text-sm">Description:</strong>
                          <p className="text-sm">{response.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Saved Responses */}
            {renderSavedResponsesSection()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleApplyResponse}
              disabled={!selectedResponse}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium sm:ml-3 ${
                selectedResponse
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400'
              }`}
            >
              Apply Selected Version
            </button>
            <button
              onClick={onClose}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 rounded-md text-gray-700 bg-white border hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPropertyAssistant;
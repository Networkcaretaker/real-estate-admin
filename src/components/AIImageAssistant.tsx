// src/components/AIImageAssistant.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { AIVersion, AIResponse, AIMetadata } from '../types/ai';
import { aiService } from '../services/ai';
import { PropertyImage } from '../types/property';

interface AIImageAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  image: PropertyImage;
  onUpdateImage: (imageId: string, updates: { title?: string; description?: string }) => Promise<void>;
  aiMetadata?: AIMetadata;
  onLoadAIMetadata?: () => void;
}

const AVAILABLE_VERSIONS: { value: AIVersion; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'concise', label: 'Concise' },
  { value: 'simple', label: 'Simple' },
  { value: 'funny', label: 'Fun & Engaging' },
  { value: 'call to action', label: 'Call to Action' },
  { value: 'modern design', label: 'Modern Design' },
  { value: 'outdoor space', label: 'Outdoor Space' },
  { value: 'architectural', label: 'Architectural' },
  { value: 'views', label: 'Views' },
  { value: 'seo-optimized', label: 'SEO Optimized' },
];

export const AIImageAssistant: React.FC<AIImageAssistantProps> = ({
  isOpen,
  onClose,
  propertyId,
  image,
  onUpdateImage,
  onLoadAIMetadata,
  aiMetadata
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

  // Memoize the responses processing
  useEffect(() => {
    const processResponses = () => {
      console.log('AIImageAssistant - aiMetadata received:', aiMetadata);
      
      if (aiMetadata?.responses?.length) {
        console.log('Responses found:', aiMetadata.responses);
        setSavedResponses(prevResponses => {
          // Only update if the responses are different
          const newResponses = aiMetadata.responses;
          if (JSON.stringify(prevResponses) !== JSON.stringify(newResponses)) {
            return newResponses;
          }
          return prevResponses;
        });
      } else {
        console.log('No responses found in aiMetadata');
        setSavedResponses([]);
      }
    };

    processResponses();
  }, [aiMetadata]);

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
      const result = await aiService.analyzeImage({
        property_id: propertyId,
        image_id: image.id,
        versions: selectedVersions
      });
  
      if (result.status === 'error' || !result.data) {
        throw new Error(result.message || 'Failed to analyze image');
      }
  
      // Simply update the local state with the returned responses
      setResponses(result.data.versions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResponse = async () => {
    if (!selectedResponse) return;
    try {
      onUpdateImage(image.id, {
        title: selectedResponse.image_title,
        description: selectedResponse.image_description
      });
      onClose();
    } catch (err) {
      setError('Failed to update image details');
    } 
  };

  const renderSavedResponsesSection = () => {
    console.log("savedResponses", savedResponses);
    if (!savedResponses.length) return null;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">Saved Responses: {savedResponses.length}</h4>
          <button
            onClick={() => setShowSavedResponses(!showSavedResponses)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {showSavedResponses ? 'Hide' : 'View'} Saved Responses
          </button>
        </div>
        {showSavedResponses && (
          <div className="space-y-4">
            {savedResponses.map((response, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${
                  selectedResponse === response
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{response.version}</span>
                  <button
                    onClick={() => setSelectedResponse(response)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedResponse === response
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Select
                  </button>
                </div>
                <div className="text-sm mb-1">
                  <strong>Title:</strong> {response.image_title}
                </div>
                <div className="text-sm">
                  <strong>Description:</strong> {response.image_description}
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
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">AI Image Assistant</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Preview */}
            <div className="mb-4">
              <img
                src={image.urls.medium}
                alt={image.title || 'Property image'}
                className="w-full h-64 object-cover rounded"
              />
            </div>

            {/* Version Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Versions (max 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VERSIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleVersionToggle(value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedVersions.includes(value)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    } ${selectedVersions.length >= 3 && !selectedVersions.includes(value)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-200'
                    }`}
                    disabled={selectedVersions.length >= 3 && !selectedVersions.includes(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="mb-4">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || selectedVersions.length === 0}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || selectedVersions.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Generating...' : 'Generate Descriptions'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Responses */}
            {responses.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Versions</h4>
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        selectedResponse === response
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{response.version}</span>
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedResponse === response
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          Select
                        </button>
                      </div>
                      <div className="text-sm mb-1">
                        <strong>Title:</strong> {response.image_title}
                      </div>
                      <div className="text-sm">
                        <strong>Description:</strong> {response.image_description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* New Saved Responses Section */}
            {renderSavedResponsesSection()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleApplyResponse}
              disabled={!selectedResponse}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                selectedResponse
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Apply Selected Version
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageAssistant;
// src/components/ImageGallery.tsx
import { useState } from 'react';
import type { PropertyImage } from '../types/property';

interface ImageGalleryProps {
    propertyId: string;
    images: PropertyImage[];
    onFeatureImageSelect?: (imageId: string) => void;
    onImageDelete?: (imageId: string) => Promise<void>;
    featureImageId?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
    images, 
    onFeatureImageSelect, 
    onImageDelete,
    featureImageId 
  }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
        {images.map((image) => (
          <div 
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 group"
          >
            <img
              src={image.urls.medium}
              alt={image.title || 'Property image'}
              className="h-full w-full object-cover"
            />
            
            {/* Delete button */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this image?')) {
                  await onImageDelete?.(image.id);
                }
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
  
            {/* Feature image button */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
              <button
                onClick={() => onFeatureImageSelect?.(image.id)}
                className="w-full text-white text-sm px-2 py-1 bg-black/50 rounded hover:bg-blue-500"
              >
                {featureImageId === image.id ? 'Featured Image' : 'Set as Featured'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

export default ImageGallery;
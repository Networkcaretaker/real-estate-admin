// src/components/ImageGallery.tsx
import { useState } from 'react';
import type { PropertyImage } from '../types/property';

interface ImageSimpleGalleryProps {
  propertyId: string;
  images: PropertyImage[];
  featureImageId?: string;
}

const ImageGallery: React.FC<ImageSimpleGalleryProps> = ({ 
  images
}) => {
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  console.log('Rendering gallery with images:', images); // Debug log

  return (
    <>
    <div className='flex flex-wrap gap-4 relative overflow-auto group'>
        {images.map((image, index) => {
              console.log('Rendering image item:', { id: image.id, index }); // Debug log
              return (
                <img
                    id={image.id}
                    src={image.urls.medium}
                    alt={image.title || 'Property image'}
                    className="w-[calc(20%-1rem)] relative"
                    onClick={() => setSelectedImage(image)}
                />
            );
        })}
    </div>
    {/* Custom Lightbox */}
    {selectedImage && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={() => setSelectedImage(null)}
        >
            <div 
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking the image
            >
            <img
                src={selectedImage.urls.large}
                alt={selectedImage.title || 'Property image'}
                className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            <div className="w-full absolute -top-0 bg-opacity-70 bg-black p-2 text-white items-center justify-center">
              <p className="text-center font-bold">{selectedImage.title}</p>
            </div>
            <div className="w-full absolute -bottom-0 bg-opacity-70 bg-black p-2 text-white items-center justify-center">
              <p className="text-center px-2 text-sm">{selectedImage.description}</p>
            </div>

            <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 rounded-full bg-white p-2 text-black hover:bg-gray-100"
            >
                ✕
            </button>
            </div>
            
        </div>
        )}
    </>
  );
};

export default ImageGallery;
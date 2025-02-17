// src/components/ImageEditGallery.tsx
import { useState } from 'react';
import type { PropertyImage } from '../types/property';
import { AIMetadata } from '../types/ai';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AIImageAssistant from './AIImageAssistant'; 
import { propertyService } from '../services/firebase/properties';

import { 
  StarFilledIcon, 
  StarOutlineIcon, 
  AIAnalysisIcon,
  EditIcon,
  TrashIcon,
  CancelIcon,
  ConfirmIcon,
  IconButton 
} from '../components/common/icons';

interface ImageEditGalleryProps {
  propertyId: string;
  images: PropertyImage[];
  onFeatureImageSelect?: (imageId: string) => void;
  onImageDelete?: (imageId: string) => Promise<void>;
  onReorder?: (imageId: string, newOrder: number) => Promise<void>;
  onUpdateImage?: (imageId: string, updates: { title?: string; description?: string }) => Promise<void>;
  featureImageId?: string;
}
interface EditState {
  title: string;
  description: string;
}
const ImageEditGallery: React.FC<ImageEditGalleryProps> = ({
  propertyId,
  images,
  onFeatureImageSelect,
  onImageDelete,
  onReorder,
  onUpdateImage,
  featureImageId
}) => {
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [aiModalImage, setAiModalImage] = useState<PropertyImage | null>(null); 
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<string, EditState>>({});
  const [aiMetadata, setAiMetadata] = useState<AIMetadata | undefined>(undefined);

  // Function to enter edit mode
  const handleStartEditing = (image: PropertyImage) => {
    setEditingImageId(image.id);
    setPendingEdits(prev => ({
      ...prev,
      [image.id]: {
        title: image.title || '',
        description: image.description || ''
      }
    }));
  };

  // Function to handle field changes
  const handleFieldChange = (imageId: string, field: keyof EditState, value: string) => {
    setPendingEdits(prev => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [field]: value
      }
    }));
  };

  // Function to save changes
  const handleSaveChanges = async (imageId: string) => {
    const edits = pendingEdits[imageId];
    if (!edits) return;

    try {
      await onUpdateImage?.(imageId, {
        title: edits.title,
        description: edits.description
      });
      
      // Clear edit state after successful save
      setEditingImageId(null);
      setPendingEdits(prev => {
        const newState = { ...prev };
        delete newState[imageId];
        return newState;
      });
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Handle error (could add error state if needed)
    }
  };

  // Function to cancel changes
  const handleCancelEdits = (imageId: string) => {
    setEditingImageId(null);
    setPendingEdits(prev => {
      const newState = { ...prev };
      delete newState[imageId];
      return newState;
    });
  };

  // Function to load AI metadata
  const loadAIMetadata = async (propertyId: string, imageId: string) => {
    try {
      // Use the existing service method
      console.log('Attempting to load AI Metadata:', { propertyId, imageId });
      const metadata = await propertyService.getImageAIMetadata(propertyId, imageId);
      
      // Only update if metadata exists and is different
      if (metadata) {
        setAiMetadata(prevMetadata => 
          JSON.stringify(prevMetadata) !== JSON.stringify(metadata) ? metadata : prevMetadata
        );
      } else {
        setAiMetadata(undefined);
      }
    } catch (error) {
      console.error('Failed to load AI metadata:', error);
      setAiMetadata(undefined);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !onReorder) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const imageId = result.draggableId;
    await onReorder(imageId, destinationIndex);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="property-images">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-4"
            >
              {images.map((image, index) => (
                <Draggable
                  key={image.id}
                  draggableId={image.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white rounded-lg border ${
                        snapshot.isDragging ? 'shadow-lg border-blue-500' : ''
                      }`}
                    >
                      <div className="p-4 flex gap-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center cursor-move"
                        >
                          <svg 
                            className="w-6 h-6 text-gray-400 hover:text-gray-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </div>

                        {/* Image Preview */}
                        <div className="w-80 h-5/2 relative flex-shrink-0">
                          <img
                            src={image.urls.medium}
                            alt={image.title || 'Property image'}
                            className="w-full h-full object-cover rounded cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                          />
                          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                            {index + 1}
                          </div>
                        </div>

                        {/* Image Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Filename
                            </label>
                            <p className="text-sm text-gray-500">{image.filename}</p>
                          </div>
                          {editingImageId === image.id ? (
                            // Edit Mode
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={pendingEdits[image.id]?.title || ''}
                                  onChange={(e) => handleFieldChange(image.id, 'title', e.target.value)}
                                  placeholder="Add a title for this image"
                                  className="w-full p-2 border rounded-md text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={pendingEdits[image.id]?.description || ''}
                                  onChange={(e) => handleFieldChange(image.id, 'description', e.target.value)}
                                  placeholder="Add a description for this image"
                                  className="w-full h-24 p-2 border rounded-md text-sm resize-none"
                                  rows={4}
                                />
                              </div>
                            </>
                          ) : (
                            // View Mode
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Title
                                </label>
                                <p className="text-sm">{image.title || 'No title'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Description
                                </label>
                                <p className="text-sm">{image.description || 'No description'}</p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 justify-start items-end">
                          {/* Feature Image Star - Always visible */}
                          <IconButton
                            onClick={() => onFeatureImageSelect?.(image.id)}
                            icon={featureImageId === image.id ? <StarFilledIcon /> : <StarOutlineIcon />}
                            title={featureImageId === image.id ? 'Featured Image' : 'Set as Featured'}
                            className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                              featureImageId === image.id ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-600'
                            }`}
                          />

                          {/* AI Analysis Button - Always visible */}
                          <IconButton
                            onClick={() => setAiModalImage(image)}
                            icon={<AIAnalysisIcon />}
                            title="AI Image Assistant"
                          />
                          
                          {/* Edit button - Always visible */}
                          <IconButton
                            onClick={() => handleStartEditing(image)}
                            icon={<EditIcon />}
                            title="Edit info"
                          />

                          {/* Delete button - Always visible */}
                          <IconButton
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this image?')) {
                                onImageDelete?.(image.id);
                              }
                            }}
                            icon={<TrashIcon />}
                            title="Delete image"
                          />
                          
                          {/* Edit mode buttons - Only visible when editing */}
                          {editingImageId === image.id && (
                            <div className="flex flex-col gap-2 mt-1">
                              
                              {/* Cancel button */}
                              <IconButton
                                onClick={() => handleCancelEdits(image.id)}
                                icon={<CancelIcon />}
                                className="p-1 rounded-full text-red-500 hover:bg-gray-100 hover:text-red-700 transition-colors"
                                title="Cancel"
                              />
                              {/* Confirm button */}
                              <IconButton
                                onClick={() => handleSaveChanges(image.id)}
                                icon={<ConfirmIcon />}
                                className="p-1 rounded-full text-green-500 hover:bg-gray-100 hover:text-green-700 transition-colors"
                                title="Save Changes"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 rounded-full bg-white p-2 text-black hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* AI Image Assistant Modal */}
      {aiModalImage && onUpdateImage && (
        <AIImageAssistant
          isOpen={!!aiModalImage}
          onClose={() => {
            setAiModalImage(null);
            setAiMetadata(undefined);  // Reset to undefined, not null
          }}
          propertyId={propertyId}
          image={aiModalImage}
          onUpdateImage={onUpdateImage}
          aiMetadata={aiMetadata}
          onLoadAIMetadata={() => loadAIMetadata(propertyId, aiModalImage.id)}
        />
      )}  
    </>
  );
};

export default ImageEditGallery;
// src/components/ImageEditGallery.tsx
import { useState } from 'react';
import type { PropertyImage } from '../types/property';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  images,
  onFeatureImageSelect,
  onImageDelete,
  onReorder,
  onUpdateImage,
  featureImageId
}) => {
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<string, EditState>>({});

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
                                  className="w-full p-2 border rounded-md text-sm resize-none"
                                  rows={2}
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
                          <button
                            onClick={() => onFeatureImageSelect?.(image.id)}
                            className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                              featureImageId === image.id ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={featureImageId === image.id ? 'Featured Image' : 'Set as Featured'}
                          >
                            {featureImageId === image.id ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            )}
                          </button>

                          {/* Edit button - Always visible */}
                          <button
                            onClick={() => handleStartEditing(image)}
                            className="p-1 rounded-full text-blue-500 hover:bg-gray-100 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                              />
                            </svg>
                          </button>

                          {/* Delete button - Always visible */}
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this image?')) {
                                onImageDelete?.(image.id);
                              }
                            }}
                            className="p-1 rounded-full text-red-500 hover:bg-gray-100 hover:text-red-700 transition-colors"
                            title="Delete image"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                          {/* Edit mode buttons - Only visible when editing */}
                          {editingImageId === image.id && (
                            <div className="flex flex-col gap-2 mt-1">

                              {/* AI Analysis Button - Always visible */}
                              <button
                                onClick={() => {}} // placeholder for future functionality
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                title="AI Image Analysis"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                  />
                                </svg>
                              </button>

                              {/* Cancel button */}
                              <button
                                onClick={() => handleCancelEdits(image.id)}
                                className="p-1 rounded-full text-red-500 hover:bg-gray-100 hover:text-red-700 transition-colors"
                                title="Cancel"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>

                              {/* Confirm button */}
                              <button
                                onClick={() => handleSaveChanges(image.id)}
                                className="p-1 rounded-full text-green-500 hover:bg-gray-100 hover:text-green-700 transition-colors"
                                title="Save Changes"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
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
    </>
  );
};

export default ImageEditGallery;
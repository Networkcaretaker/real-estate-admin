// src/components/ImageGallery.tsx
import { useState } from 'react';
import type { PropertyImage } from '../types/property';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface ImageGalleryProps {
  propertyId: string;
  images: PropertyImage[];
  onFeatureImageSelect?: (imageId: string) => void;
  onImageDelete?: (imageId: string) => Promise<void>;
  onReorder?: (imageId: string, newOrder: number) => Promise<void>;
  featureImageId?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onFeatureImageSelect, 
  onImageDelete,
  onReorder,
  featureImageId 
}) => {
  console.log('Rendering gallery with images:', images); // Debug log

  const handleDragEnd = async (result: DropResult) => {
    console.log('Drag ended:', result); // Debug log
    if (!result.destination || !onReorder) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const imageId = result.draggableId;
    await onReorder(imageId, destinationIndex);

    //const movedImage = images[sourceIndex];
    //console.log('Moving image:', { id: movedImage.id, from: sourceIndex, to: destinationIndex });

    //await onReorder(movedImage.id, destinationIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="property-images" direction="horizontal">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-wrap gap-4" // Changed from grid to flex
          >
            {images.map((image, index) => {
              console.log('Rendering image item:', { id: image.id, index }); // Debug log

              return (
                <Draggable 
                  key={image.id} 
                  draggableId={image.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative w-[calc(15%-1rem)] aspect-square overflow-hidden rounded-lg border border-gray-200 group cursor-move ${
                        snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg z-50' : ''
                      }`}
                    >
                    <div
                      {...provided.dragHandleProps}
                      className={`relative h-full w-full overflow-hidden rounded-lg border border-gray-200 group cursor-move ${
                        snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                    >
                      <img
                        id={image.id}
                        src={image.urls.medium}
                        alt={image.title || 'Property image'}
                        className="h-full w-full object-cover"
                      />
                      
                      {/* Order indicator */}
                      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {index + 1}
                      </div>

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
                  </div>
                )}
              </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ImageGallery;
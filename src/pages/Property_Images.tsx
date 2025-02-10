import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { propertyService } from '../services/firebase/properties';
import type { Property, PropertyImage } from '../types/property';
import ImageEditGallery from '../components/ImageEditGallery';

const Property = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Define loadProperty function
  const loadProperty = async () => {
    if (!id) return;
    try {
      const propertyData = await propertyService.getProperty(id);
      setProperty(propertyData);
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property');
      throw err; // Re-throw to be caught by the outer try-catch
    }
  };

  const loadPropertyImages = async () => {
    if (!id) return;
    try {
      const propertyImages = await propertyService.getPropertyImages(id);
      setImages(propertyImages);
    } catch (err) {
      console.error('Error loading property images:', err);
      setError('Failed to load property images');
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        console.log('Starting to load property data for ID:', id);
        
        try {
          const propertyData = await loadProperty();
          console.log('Property data loaded:', propertyData);
        } catch (err) {
          console.error('Failed in loadProperty:', err);
        }
  
        try {
          const imageData = await loadPropertyImages();
          console.log('Image data loaded:', imageData);
        } catch (err) {
          console.error('Failed in loadPropertyImages:', err);
        }
  
      } catch (err) {
        console.error('Error in loadData:', err);
        setError('Failed to load property data');
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [id]);

  const handleUploadComplete = async (imageIds: string[]) => {
    console.log('Uploaded images:', imageIds);
    // Refresh the images
    await loadPropertyImages();
  };

  const handleReorder = async (imageId: string, newOrder: number) => {
    try {
      if (!id) return;
      setLoading(true);
      
      // Update the order of all images
      const updates = images.map((image, index) => {
        if (image.id === imageId) {
          return propertyService.updateImageOrder(id, image.id, newOrder);
        }
        // Adjust other images' order based on the new position
        if (newOrder <= index) {
          return propertyService.updateImageOrder(id, image.id, index + 1);
        }
        return Promise.resolve();
      });
  
      await Promise.all(updates);
      await loadPropertyImages(); // Refresh images
    } catch (error) {
      console.error('Error reordering images:', error);
      setError('Failed to reorder images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      if (!id) return;
      await propertyService.deletePropertyImage(id, imageId);
      await loadPropertyImages(); // Refresh images after delete
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image');
    }
  };

  const handleFeatureImageSelect = async (imageId: string) => {
    if (!id) return;
    try {
      await propertyService.setFeatureImage(id, imageId);
      setProperty(prev => prev ? {
        ...prev,
        media: {
          ...prev.media,
          feature_image_id: imageId
        }
      } : null);
    } catch (err) {
      console.error('Error setting feature image:', err);
      setError('Failed to set feature image');
    }
  };

  const handleUpdateImage = async (imageId: string, updates: { title?: string; description?: string }) => {
    if (!id) return;
    try {
      await propertyService.updateImageDetails(id, imageId, updates);
      
      // Update local state
      setImages(prevImages => 
        prevImages.map(image => 
          image.id === imageId 
            ? { ...image, ...updates }
            : image
        )
      );
    } catch (err) {
      console.error('Error updating image details:', err);
      setError('Failed to update image details');
    }
  };
  
  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!property || !id) return;
    
    try {
      setSaving(true);
      await propertyService.updatePropertyStatus(id, newStatus);
      setProperty({ ...property, website_status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update property status');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading property...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {property?.title ? `Manage Images: ${property.id} | ${property.title}` : 'Manage Property Images'}
          </h1>
          <div className="flex gap-4">
            <select
              value={property?.website_status || 'Disabled'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={saving}
              className="rounded border p-2"
            >
              <option value="Disabled">Disabled</option>
              <option value="Active">Active</option>
            </select>
            <button
              onClick={() => navigate(`/properties/${id}/details`)}
              className="rounded bg-blue-100 px-4 py-2 hover:bg-blue-200"
            >
              View Property
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="rounded bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              Back to Properties
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Upload */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Upload Images</h2>
            <ImageUploader
              propertyId={id || ''}
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          </section>

          {/* Image Gallery */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Property Images</h2>
            {images.length > 0 ? (
              <ImageEditGallery
                propertyId={id || ''}
                images={images}
                featureImageId={property?.media?.feature_image_id}
                onFeatureImageSelect={handleFeatureImageSelect}
                onImageDelete={handleImageDelete}
                onReorder={handleReorder}
                onUpdateImage={handleUpdateImage}
              />
            ) : (
              <p className="text-gray-500">No images uploaded yet.</p>
            )}
          </section>

        </div>
      </div>
    </>
  );
};

export default Property;
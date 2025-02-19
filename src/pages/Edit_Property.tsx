import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/firebase/properties';
import type { Property, PropertyImage } from '../types/property';
import AIPropertyAssistant from '../components/AIPropertyAssistant';
import Parser from 'html-react-parser';
import ImageGallery from '../components/ImageGallery';

import { 
  AIAnalysisIcon,
  EditIcon,
  CancelIcon,
  ConfirmIcon,
  IconButton,
  ViewProperty,
  EditImage
} from '../components/common/icons';

interface EditState {
  title: string;
  excerpt: string;
  description: string;
  features: {
    interior: string[];
    exterior: string[];
  };
}

const Property = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<EditState | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const INTERIOR_FEATURES = [
    'Air Conditioning',
    'Central Heating',
    'Fitted Kitchen',
    'Built-in Wardrobes',
    'Marble Floors',
    'Security System',
    'Home Automation',
    'Fireplace',
    'Walk-in Closet',
    'En-suite Bathroom'
  ];
  
  const EXTERIOR_FEATURES = [
    'Swimming Pool',
    'Garden',
    'Terrace',
    'Garage',
    'Sea View',
    'Mountain View',
    'Balcony',
    'Private Parking',
    'Tennis Court',
    'BBQ Area'
  ];
  
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

  const handleStartEditing = () => {
    if (!property) return;
    
    setIsEditing(true);
    setPendingEdits({
      title: property.title || '',
      excerpt: property.excerpt || '',
      description: property.description || '',
      features: {
        interior: property.features.interior || [],
        exterior: property.features.exterior || []
      }
    });
  };

  const handleFieldChange = (field: keyof EditState, value: string) => {
    if (!pendingEdits) return;
    
    setPendingEdits({
      ...pendingEdits,
      [field]: value
    });
  };

  const handleFeatureToggle = (featureType: 'interior' | 'exterior', feature: string) => {
    if (!pendingEdits) return;
    
    setPendingEdits(prev => {
      if (!prev) return prev;
      
      const currentFeatures = prev.features[featureType];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature];
      
      return {
        ...prev,
        features: {
          ...prev.features,
          [featureType]: newFeatures
        }
      };
    });
  };

  const handleSaveChanges = async () => {
    if (!property || !pendingEdits || !id) return;
    
    try {
      setSaving(true);
      await propertyService.updatePropertyDetails(id, pendingEdits);
      
      // Update local state
      setProperty({
        ...property,
        ...pendingEdits
      });
      
      // Clear edit state
      setIsEditing(false);
      setPendingEdits(null);
    } catch (err) {
      console.error('Error saving property details:', err);
      setError('Failed to save property details');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdits = () => {
    setIsEditing(false);
    setPendingEdits(null);
  };

  const getSelectedImage = () => {
    if (property?.media?.feature_image_id) {
      return images.find(img => img.id === property.media.feature_image_id) || images[0];
    }
    return images[0];
  };

  const handleReorder = async (imageId: string, newOrder: number) => {
    try {
      if (!id) return;
      setLoading(false);
      
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

  const handleUpdatePropertyContent = async (updates: { 
    title?: string; 
    description?: string;
    excerpt?: string;
  }) => {
    if (!property || !id) return;
    
    try {
      setSaving(true);
      await propertyService.updatePropertyDetails(id, updates);
      
      // Update local state
      setProperty({
        ...property,
        ...updates
      });
    } catch (err) {
      console.error('Error updating property content:', err);
      setError('Failed to update property content');
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
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {property?.title ? `${property.id} ${property.details.property_type} in ${property.location.town}` : 'Edit Property'}
            <br />
            <span className="text-gray-500 text-xl font-thin">{property?.title ? `${property.title}` : 'Property'}</span>
          </h1>

          <div className="flex gap-4">
            {isEditing ? (
              <>
                <IconButton
                  onClick={handleSaveChanges}
                  icon={<ConfirmIcon />}
                  className="p-1 rounded-full text-green-500 hover:bg-gray-100 hover:text-green-700 transition-colors"
                  title="Save Changes"
                  disabled={saving}
                />
                <IconButton
                  onClick={handleCancelEdits}
                  icon={<CancelIcon />}
                  className="p-1 rounded-full text-red-500 hover:bg-gray-100 hover:text-red-700 transition-colors"
                  title="Cancel"
                  disabled={saving}
                />
              </>
            ) : null}
            <IconButton
              onClick={handleStartEditing}
              icon={<EditIcon />}
              title="Edit Property"
              disabled={saving}
            />
            <IconButton
              onClick={() => navigate(`/properties/${id}/images`)}
              icon={<EditImage />}
              title="Manage Images"
              disabled={saving}
            />
            <IconButton
              onClick={() => {
                const selectedImage = getSelectedImage();
                if (!selectedImage) {
                  setError('Please add at least one image before using the AI assistant');
                  return;
                }
                setShowAIAssistant(true);
              }}
              icon={<AIAnalysisIcon />}
              title="AI Property Assistant"
              disabled={saving || isEditing || images.length === 0}
            />
            <IconButton
              onClick={() => navigate(`/properties/${id}/details`)}
              icon={<ViewProperty />}
              title="View Property"
              disabled={saving}
            />
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
              onClick={() => navigate('/properties')}
              className="rounded bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              Back to Properties
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-lg border bg-white p-6">
            {/* Basic Details */}
            <div className="grid grid-cols-3 gap-4">
              <div  className="">
                <div className="flex gap-2 items-center justify-center">
                  
                  <div className="relative">
                    {loading ? (
                      <div className="w-full bg-gray-100 animate-pulse rounded-lg" />
                    ) : property?.media?.feature_image_id ? (
                      <div className="relative w-full">
                        {images.map((image) => {
                          if (image.id === property.media.feature_image_id) {
                            return (
                              <img
                                key={image.id}
                                src={image.urls.large}
                                alt={property.title || 'Property feature image'}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <svg 
                            className="mx-auto h-12 w-12 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">No feature image set</p>
                          <button
                            onClick={() => navigate(`/properties/${id}/images`)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Manage Images
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Reference</label>
                  <p className="col-span-2">{property?.id}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Location</label>
                  <p className="col-span-2">{property?.location.town}, {property?.location.municipality}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Property Type</label>
                  <p className="col-span-2">{property?.details.property_type}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Price</label>
                  <p className="col-span-2">{property?.price?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  })}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Direction</label>
                  <p className="col-span-2">{property?.details.direction ? property?.details.direction : '-'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Property Area</label>
                  <p className="col-span-2">{property?.details.area_property ? property?.details.area_property + ' m²': '-'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Plot Area</label>
                  <p className="col-span-2">{property?.details.area_plot ? property?.details.area_plot + ' m²': '-'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Bedrooms</label>
                  <p className="col-span-2">{property?.rooms.bedrooms ? property?.rooms.bedrooms : '-'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4">
                  <label className="font-medium col-span-1">Bathrooms</label>
                  <p className="col-span-2">{property?.rooms.bathrooms ? property?.rooms.bathrooms : '-'}</p>
                </div>
              </div>
              {/* Editable Fields */}
              <div className="col-span-2">
                <div className="grid gap-2 my-4">
                  <label className="block font-medium mb-1">Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={pendingEdits?.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      disabled={saving}
                    />
                  ) : (
                    <p>{property?.title}</p>
                  )}
                </div>
                <div className="grid gap-2 my-4">
                  <label className="block font-medium mb-1">Excerpt</label>
                  {isEditing ? (
                    <textarea
                      value={pendingEdits?.excerpt || ''}
                      onChange={(e) => handleFieldChange('excerpt', e.target.value)}
                      className="w-full p-2 border rounded-md h-24 resize-none"
                      disabled={saving}
                    />
                  ) : (
                    <p>{property?.excerpt}</p>
                  )}
                </div>
                <div className="grid gap-2 my-4">
                  <label className="block font-medium mb-1">Description</label>
                  {isEditing ? (
                    <textarea
                      value={pendingEdits?.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className="w-full p-2 border rounded-md h-48 resize-none"
                      disabled={saving}
                    />
                  ) : (
                    
                    <div>{property?.description 
                      ? Parser(`${property.description}`)
                      : 'Property Description'}</div>
                  )} 
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Interior Features */}
                  <div> 
                    <h3 className="mb-2 font-medium py-4">Interior Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        INTERIOR_FEATURES.map((feature) => (
                          <button
                            key={feature}
                            onClick={() => handleFeatureToggle('interior', feature)}
                            className={`rounded-full px-3 py-1 transition-colors ${
                              pendingEdits?.features.interior.includes(feature)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            disabled={saving}
                          >
                            {feature}
                          </button>
                        ))
                      ) : (
                        property?.features.interior.map((feature, index) => (
                          <span key={index} className="rounded-full bg-gray-100 px-3 py-1">
                            {feature}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Exterior Features */}
                  <div>
                    <h3 className="mb-2 font-medium py-4">Exterior Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        EXTERIOR_FEATURES.map((feature) => (
                          <button
                            key={feature}
                            onClick={() => handleFeatureToggle('exterior', feature)}
                            className={`rounded-full px-3 py-1 transition-colors ${
                              pendingEdits?.features.exterior.includes(feature)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            disabled={saving}
                          >
                            {feature}
                          </button>
                        ))
                      ) : (
                        property?.features.exterior.map((feature, index) => (
                          <span key={index} className="rounded-full bg-gray-100 px-3 py-1">
                            {feature}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Image Gallery */}
          <section className="rounded-lg border bg-white p-6">
            <div className="flex mb-2">
            
            {images.length > 0 ? (
              <ImageGallery
                propertyId={id || ''}
                images={images}
                featureImageId={property?.media?.feature_image_id}
                onFeatureImageSelect={async (imageId) => {
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
                    setError('Failed to set feature image');
                  }
                }}
                onImageDelete={handleImageDelete}
                onReorder={handleReorder}
              />
            ) : (
              <p className="text-gray-500">No images uploaded yet.</p>
            )}
            </div>
          </section>
        </div>
        {/* AI Property Assistant Modal */}
        {showAIAssistant && (
          <AIPropertyAssistant
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            propertyId={id!}
            selectedImage={getSelectedImage()!}
            onUpdateProperty={handleUpdatePropertyContent}
            propertyAIMetadata={property?.ai_meta}
          />
        )}
      </div>
  );
};

export default Property;
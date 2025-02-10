import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import { propertyService } from '../services/firebase/properties';
import type { Property, PropertyImage } from '../types/property'; // Add this import

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {property?.title ? `${property.id} | ${property.title}` : 'Property Details'}
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
              onClick={() => navigate(`/properties/${id}/images`)}
              className="rounded bg-blue-100 px-4 py-2 hover:bg-blue-200"
            >
              Edit Images
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
          {/* Feature Image Section */}
          <section className="rounded-lg border bg-white p-6 mb-6">
            <h2 className="mb-4 text-xl font-semibold">Feature Image</h2>
            <div className="relative">
              {loading ? (
                <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-lg" />
              ) : property?.media?.feature_image_id ? (
                <div className="relative w-full h-[500px]">
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
                <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center rounded-lg">
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
          </section>  
          {/* Basic Details */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Basic Details</h2>
            <div className="grid gap-4">
              <div>
                <label className="font-medium">Title</label>
                <p>{property?.title}</p>
              </div>
              <div>
                <label className="font-medium">Price</label>
                <p>{property?.price?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</p>
              </div>
              <div>
                <label className="font-medium">Description</label>
                <p>{property?.description}</p>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Location</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Town</label>
                  <p>{property?.location.town}</p>
                </div>
                <div>
                  <label className="font-medium">Region</label>
                  <p>{property?.location.region}</p>
                </div>
                <div>
                  <label className="font-medium">Municipality</label>
                  <p>{property?.location.municipality}</p>
                </div>
                <div>
                  <label className="font-medium">Postcode</label>
                  <p>{property?.location.postcode}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Property Details */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Property Type</label>
                <p>{property?.details.property_type}</p>
              </div>
              <div>
                <label className="font-medium">Direction</label>
                <p>{property?.details.direction}</p>
              </div>
              <div>
                <label className="font-medium">Plot Area</label>
                <p>{property?.details.area_plot} m²</p>
              </div>
              <div>
                <label className="font-medium">Property Area</label>
                <p>{property?.details.area_property} m²</p>
              </div>
            </div>
          </section>

          {/* Rooms */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Rooms</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-medium">Bedrooms</label>
                <p>{property?.rooms.bedrooms}</p>
              </div>
              <div>
                <label className="font-medium">Bathrooms</label>
                <p>{property?.rooms.bathrooms}</p>
              </div>
              <div>
                <label className="font-medium">Total Rooms</label>
                <p>{property?.rooms.total_rooms}</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Features</h2>
            <div className="grid gap-6">
              {property?.features.interior.length ? (
                <div>
                  <h3 className="mb-2 font-medium">Interior Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.interior.map((feature, index) => (
                      <span key={index} className="rounded-full bg-gray-100 px-3 py-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {property?.features.exterior.length ? (
                <div>
                  <h3 className="mb-2 font-medium">Exterior Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.exterior.map((feature, index) => (
                      <span key={index} className="rounded-full bg-gray-100 px-3 py-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Image Gallery */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Property Images</h2>
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
          </section>

        </div>
      </div>
  );
};

export default Property;
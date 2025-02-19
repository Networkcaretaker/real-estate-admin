import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGallery from '../../components/ImageSimpleGallery';
import { propertyService } from '../../services/firebase/properties';
import type { Property, PropertyImage } from '../../types/property'; 
import Parser from 'html-react-parser';

import { 
  EditIcon,
  IconButton,
  EditImage,
  PrintIcon
} from '../../components/common/icons';

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
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {property?.title ? `${property.id} ${property.details.property_type} in ${property.location.town}` : 'Edit Property'}
            <br />
            <span className="text-gray-500 text-2xl font-thin">{property?.title ? `${property.title}` : 'Property'}</span>
          </h1>
          <div className="flex gap-4">
          <IconButton
              onClick={() => navigate(`/properties/${id}/edit`)}
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
              onClick={() => {}}
              icon={<PrintIcon />}
              title="Print"
              disabled={saving}
            />
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
            <div className="grid grid-cols-3 gap-6">
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
                <div className="flex gap-2 items-center justify-center py-2">
                  <h2 className="text-5xl">{property?.price?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  })}</h2>
                </div>
                <div className="flex gap-2 items-center justify-center py-2">
                  <p className="text-center text-base">{property?.excerpt}</p>
                </div>
                
                <div className="flex gap-4 items-center justify-center py-2">
                  <div className="grid gap-2 my-4 w-16">
                    <div className="flex justify-center items-center gap-2">
                      <img src='/property_area.svg' className="w-8" ></img>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <p className="col-span-2">{property?.details.area_property ? property?.details.area_property + ' m²': '-'}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 my-4 w-16">
                    <div className="flex justify-center items-center gap-2">
                      <img src='/plot_area.svg' className="w-8" ></img>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <p className="col-span-2">{property?.details.area_plot ? property?.details.area_plot + ' m²': '-'}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 my-4 w-16">
                    <div className="flex justify-center items-center gap-2">
                      <img src='/bedrooms.svg' className="w-8" ></img>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <p className="col-span-2">{property?.rooms.bedrooms ? property?.rooms.bedrooms: '-'}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 my-4 w-16">
                    <div className="flex justify-center items-center gap-2">
                      <img src='/bathrooms.svg' className="w-8" ></img>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <p className="col-span-2">{property?.rooms.bathrooms ? property?.rooms.bathrooms: '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 text-xs my-2">
                  {property?.features.interior.map((feature, index) => (
                    <span key={index} className="rounded-full bg-gray-100 px-3 py-1">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2 text-xs my-2">
                  {property?.features.exterior.map((feature, index) => (
                    <span key={index} className="rounded-full bg-gray-100 px-3 py-1">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <div className="grid gap-2">                  
                  <div>{property?.description 
                    ? Parser(`${property.description}`)
                    : 'Property Description'}</div>
                </div>

                <div className="grid gap-2 py-8">
                {images.length > 0 ? (
                  <ImageGallery
                    propertyId={id || ''}
                    images={images}
                    featureImageId={property?.media?.feature_image_id}
                  />
                ) : (
                  <p className="text-gray-500">No images uploaded yet.</p>
                )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
  );
};

export default Property;
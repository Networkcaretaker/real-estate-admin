import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/firebase/properties';
import type { Property } from '../types/property';

import { 
  AIAnalysisIcon,
  EditIcon,
  CancelIcon,
  ConfirmIcon,
  IconButton 
} from '../components/common/icons';

interface EditState {
  title: string;
  excerpt: string;
  description: string;
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
      description: property.description || ''
    });
  };

  const handleFieldChange = (field: keyof EditState, value: string) => {
    if (!pendingEdits) return;
    
    setPendingEdits({
      ...pendingEdits,
      [field]: value
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
            {property?.title ? `${property.id} | ${property.title}` : 'Manage Property Images'}
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
          <section className="rounded-lg border bg-white p-6">

            {/* Basic Details */}
            <div className="flex mb-2">
              <div className="w-1/2 flex items-start justify-between">
                <h2 className="mb-2 text-xl font-semibold">Edit Property</h2>
              </div>
              <div className="w-1/2 flex items-baseline justify-end gap-2">
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
                onClick={() => {}}
                icon={<AIAnalysisIcon />}
                title="AI Property Assistant"
                disabled={saving || isEditing}
              />
              <IconButton
                onClick={handleStartEditing}
                icon={<EditIcon />}
                title="Edit info"
                disabled={saving}
              />
            </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-medium">Reference</label>
                <p>{property?.id} | {property?.details.property_type} in {property?.location.town}</p>
              </div>
              <div>
                <label className="font-medium">Location</label>
                <p>{property?.location.town}, {property?.location.municipality}, {property?.location.postcode}, {property?.location.region}</p>
              </div>
              <div>
                <label className="font-medium">Price</label>
                <p>{property?.price?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}</p>
              </div>
            </div>
            <div className="h-4"></div>

            {/* Editable Fields */}
            <div className="grid gap-4">
              <div>
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
              <div>
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
              <div>
                <label className="block font-medium mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={pendingEdits?.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full p-2 border rounded-md h-48 resize-none"
                    disabled={saving}
                  />
                ) : (
                  <p>{property?.description}</p>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="h-4"></div>
            <div className="grid grid-cols-6 gap-4">
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
              <div>
                <label className="font-medium">Bedrooms</label>
                <p>{property?.rooms.bedrooms}</p>
              </div>
              <div>
                <label className="font-medium">Bathrooms</label>
                <p>{property?.rooms.bathrooms}</p>
              </div>
            </div>

            {/* Features */}
            <div className="h-4"></div>
            <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
  );
};

export default Property;
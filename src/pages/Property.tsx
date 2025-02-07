import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import type { Property } from '../types/property';
import { propertyService } from '../services/firebase/properties';

const Property = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const propertyData = await propertyService.getProperty(id);
        setProperty(propertyData);
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!property || !id) return;
    
    try {
      setSaving(true);
      // TODO: Add updatePropertyStatus method to propertyService
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
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading property...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {property?.title || 'View Property'}
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
              onClick={() => navigate('/properties')}
              className="rounded bg-gray-100 px-4 py-2 hover:bg-gray-200"
            >
              Back to Properties
            </button>
          </div>
        </div>

        <div className="grid gap-6">
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
        </div>
      </div>
    </>
  );
};

export default Property;
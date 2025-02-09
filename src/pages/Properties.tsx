import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/firebase/properties';
import type { Property } from '../types/property';
import { QueryDocumentSnapshot, DocumentData } from '@firebase/firestore';
import Header from '../components/layout/Header';

interface PropertyWithFeatureImage extends Property {
  featureImageUrl?: string | null;
}

const Properties = () => {
  const [properties, setProperties] = useState<PropertyWithFeatureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  
  const navigate = useNavigate();

  const loadFeatureImages = async (properties: Property[]) => {
    const propertiesWithImages = await Promise.all(
      properties.map(async (property) => {
        if (!property.media?.feature_image_id) {
          return property;
        }

        try {
          setLoadingImages(prev => ({ ...prev, [property.id]: true }));
          const images = await propertyService.getPropertyImages(property.id);
          const featureImage = images.find(img => img.id === property.media.feature_image_id);
          
          return {
            ...property,
            featureImageUrl: featureImage?.urls.thumbnail
          };
        } catch (err) {
          console.error(`Error loading feature image for property ${property.id}:`, err);
          return property;
        } finally {
          setLoadingImages(prev => ({ ...prev, [property.id]: false }));
        }
      })
    );

    return propertiesWithImages;
  };

  const loadProperties = async (isFirstLoad = false) => {
    try {
      setLoading(true);
      const lastDoc = isFirstLoad ? null : lastVisible;
      const { properties: newProperties, lastVisible: newLastVisible } = 
        await propertyService.getProperties(lastDoc);
      
      const propertiesWithImages = await loadFeatureImages(newProperties);
      
      if (isFirstLoad) {
        setProperties(propertiesWithImages);
      } else {
        setProperties(prev => [...prev, ...propertiesWithImages]);
      }
      
      setLastVisible(newLastVisible);
      setHasMore(newProperties.length > 0);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties(true);
  }, []);

  const handleLoadMore = () => {
    loadProperties();
  };

  if (error) {
    return (
      <>
        <Header />
        <div className="error-message">{error}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="properties-container">
        <h1>Properties</h1>
        {loading && <div className="loading">Loading properties...</div>}
        
        <div className="table-container">
          <table className="properties-table">
            <thead>
              <tr>
                <th className="w-24">Image</th>
                <th>ID</th>
                <th>Title</th>
                <th>Price</th>
                <th>Location</th>
                <th>Status</th>
                <th>Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id}>
                  <td className="p-2">
                    {loadingImages[property.id] ? (
                      <div className="w-16 h-16 bg-gray-100 animate-pulse rounded-lg" />
                    ) : property.featureImageUrl ? (
                      <img
                        src={property.featureImageUrl}
                        alt={property.title || 'Property'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg">
                        <svg 
                          className="w-6 h-6 text-gray-400" 
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
                      </div>
                    )}
                  </td>
                  <td>{property.id}</td>  
                  <td>{property.title || 'Untitled'}</td>
                  <td>${property.price?.toLocaleString() || 'N/A'}</td>
                  <td>
                    {property.location ? (
                      `${property.location.town}, ${property.location.region}`
                    ) : 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${property.website_status?.toLowerCase()}`}>
                      {property.website_status || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {property.features?.interior?.length ? (
                      <span className="feature-count">
                        {property.features.interior.length} features
                      </span>
                    ) : 'No features'}
                  </td>
                  <td>
                    <button 
                      onClick={() => navigate(`/properties/${property.id}/images`)} 
                      className="action-button edit"
                    >
                      Manage Images
                    </button>
                    <button 
                      onClick={() => navigate(`/properties/${property.id}/details`)} 
                      className="action-button view"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {hasMore && !loading && (
          <button onClick={handleLoadMore} className="load-more-button">
            Load More
          </button>
        )}
      </div>
    </>
  );
};

export default Properties;
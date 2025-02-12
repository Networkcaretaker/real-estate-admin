import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/firebase/properties';
import type { Property, PropertyImage, SortConfig, SortDirection } from '../types/property';
import { QueryDocumentSnapshot, DocumentData } from '@firebase/firestore';

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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'updated_at', direction: 'desc' });
  
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
      
      // Pass sort configuration to getProperties
      const { properties: newProperties, lastVisible: newLastVisible } = 
        await propertyService.getProperties(lastDoc, sortConfig);
      
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

  const handleSort = async (field: string, direction: SortDirection) => {
    const newSortConfig: SortConfig = { 
      field, 
      direction 
    };
    
    setSortConfig(newSortConfig);
    setProperties([]); // Clear existing properties
    setLastVisible(null); // Reset pagination
    
    try {
      setLoading(true);
      const { properties: newProperties, lastVisible: newLastVisible } = 
        await propertyService.getProperties(null, newSortConfig);
      
      const propertiesWithImages = await loadFeatureImages(newProperties);
      setProperties(propertiesWithImages);
      setLastVisible(newLastVisible);
      setHasMore(newProperties.length > 0);
    } catch (err) {
      console.error('Error sorting properties:', err);
      setError('Failed to sort properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        const { properties: newProperties, lastVisible: newLastVisible } = 
          await propertyService.getProperties(null, sortConfig);
        
        const propertiesWithImages = await loadFeatureImages(newProperties);
        setProperties(propertiesWithImages);
        setLastVisible(newLastVisible);
        setHasMore(newProperties.length > 0);
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
  
    initialLoad();
  }, []); // Only run on mount

  const handleLoadMore = () => {
    loadProperties();
  };

  if (error) {
    return (
      <>
        <div className="error-message">{error}</div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-2 py-2">
      {/* Sort Controls */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortConfig.field}
              onChange={(e) => handleSort(e.target.value, sortConfig.direction)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              disabled={loading}
            >
              <option value="updated_at">Last Updated</option>
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="website_status">Status</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Order:</label>
            <select
              value={sortConfig.direction}
              onChange={(e) => handleSort(sortConfig.field, e.target.value as SortDirection)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              disabled={loading}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {loading && (
            <div className="text-sm text-gray-500">
              Updating...
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  {loadingImages[property.id] ? (
                    <div className="w-32 h-32 bg-gray-100 animate-pulse rounded-lg" />
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
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">{property.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">{property.title || 'Untitled'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">${property.price?.toLocaleString() || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">
                    {property.location ? (
                      `${property.location.town}, ${property.location.region}`
                    ) : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-4 py-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${property.website_status?.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'}`}
                  >
                    {property.website_status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/properties/${property.id}/images`)} 
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
                  >
                    Manage Images
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="text-gray-500">Loading properties...</div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={handleLoadMore} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Properties;
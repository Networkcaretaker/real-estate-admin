import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/firebase/properties';
import type { Property, SortConfig, SortDirection } from '../types/property';
import { QueryDocumentSnapshot, DocumentData } from '@firebase/firestore';
// import Header from '../components/layout/Header';

import { 
  TableListIcon, 
  TableCardIcon,
  TableDetailedIcon, 
  IconButton 
} from '../components/common/icons';

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
    <div className="mx-auto">
      {/* Sort Controls */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4 justify-center">

          <div className="flex w-3/4">
            {/* Search input */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Ref:</label>
              <input
                type="text"
                placeholder="Search properties..."
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
              >
                <option value="">All</option>
              </select>
            </div>
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
              >
                <option value="">All</option>
                <option value="">Active</option>
                <option value="">Disabled</option>
                </select>
            </div>
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Municipality:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
              >
                <option value="">All</option>
              </select>
            </div>
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Town:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24" 
                disabled={loading}
              >
                <option value="">All</option>
              </select>
            </div>

            {/* Filter Price min/max */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Price:</label>
              <input
                type="number"
                placeholder="Min"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
              />
              <input
                type="number"
                placeholder="Max"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex w-1/4 items-center">
          <div className="flex w-1/4 justify-end">
            <div className="flex gap-2">
              <IconButton
                icon={<TableListIcon />}
                onClick={() => {}}
                title="List View"
              />
              <IconButton
                icon={<TableDetailedIcon />}
                onClick={() => {}}
                title="Action View"
              />
              <IconButton
                icon={<TableCardIcon />}
                onClick={() => {}}
                title="Card View"
              />
            </div>
          </div>
          <div className="flex w-3/4 justify-end items-end">
            {/* Sort by dropdown */}
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortConfig.field}
                onChange={(e) => handleSort(e.target.value, sortConfig.direction)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                disabled={loading}
              >
                <option value="updated_at">Updated</option>
                <option value="property_id">Reference</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="website_status">Status</option>
              </select>
            </div>

            {/* Order dropdown */}
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <select
                value={sortConfig.direction}
                onChange={(e) => handleSort(sortConfig.field, e.target.value as SortDirection)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                disabled={loading}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50 items-center">
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
                  <div className="text-sm text-gray-900">{property.property_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">{property.title || 'Untitled'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">
                    {property.location ? (
                      `${property.location.town}, ${property.location.municipality}`
                    ) : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/properties/${property.id}/details`)}>
                  <div className="text-sm text-gray-900">${property.price?.toLocaleString() || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap justify-center">

                  <button
                    onClick={() => {}}
                    className={`p-1 rounded-full transition-colors
                      ${property.website_status?.toLowerCase() === 'active' 
                        ? 'bg-green-400 hover:bg-green-600' 
                        : 'bg-red-400  hover:bg-red-600'}`}
                    title={property.website_status === 'Active' ? 'Deactivate Property' : 'Activate Property'}
                  >
                    <svg 
                      className="w-6 h-6 text-white cursor-pointer" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2}
                        d={property.website_status === 'Active' 
                          ? 'M5 13l4 4L19 7' 
                          : 'M6 18L18 6M6 6l12 12'}
                      />
                    </svg>                            
                  </button>

                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Edit Property"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>                            
                  </button>
                  <button
                    onClick={() => navigate(`/properties/${property.id}/images`)}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Manage Images"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                         d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z M15 8l1.5 1.5M16.5 9.5L19 12"
                      />
                    </svg>                            
                  </button>
                  <button
                    onClick={() => {}}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Delete Property"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>                            
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
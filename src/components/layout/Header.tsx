import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/firebase/properties';
import type { Property, SortConfig, SortDirection } from '../../types/property';
import { QueryDocumentSnapshot, DocumentData } from '@firebase/firestore';

import { 
  TableListIcon, 
  TableCardIcon,
  TableDetailedIcon, 
  IconButton 
} from '../../components/common/icons';

interface PropertyWithFeatureImage extends Property {
  featureImageUrl?: string | null;
}

const Header = () => {
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
    <header className="header">
      <div className="header-content">
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
        </div>
    </header>
  );
};

export default Header;
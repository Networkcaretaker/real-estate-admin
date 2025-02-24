import { useState, useEffect, useMemo } from 'react';
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

interface FilterConfig {
  propertyType: string;
  municipality: string;
  town: string;
  priceMin: string;
  priceMax: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<PropertyWithFeatureImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'updated_at', direction: 'desc' });
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filters, setFilters] = useState<FilterConfig>({
    propertyType: '',
    municipality: '',
    town: '',
    priceMin: '',
    priceMax: ''
  });
  const [municipalityOptions, setMunicipalityOptions] = useState<string[]>([]);
  const [townOptions, setTownOptions] = useState<string[]>([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<string[]>([]);
  
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

  const handleSearch = async () => {
    if (!searchId.trim()) {
      // If search is cleared, reload original paginated data
      loadProperties(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch all properties
      const allProperties = await propertyService.getAllProperties();
      
      // Filter properties
      const searchTerm = searchId.trim().toLowerCase();
      const filteredProperties = allProperties.filter(property => 
        property.property_id?.toLowerCase().includes(searchTerm)
      );
      
      // Load images for filtered properties
      const propertiesWithImages = await loadFeatureImages(filteredProperties);
      
      setProperties(propertiesWithImages);
      setHasMore(false); // Disable load more during search
      
    } catch (err) {
      console.error('Error searching properties:', err);
      setError('Failed to search properties');
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

  const handleStatusFilter = async (status: string) => {
    try {
      setLoading(true);
      
      // If no status selected, reload original data
      if (!status) {
        loadProperties(true);
        return;
      }
      
      // Get all properties and filter by status
      const allProperties = await propertyService.getAllProperties();
      const filteredProperties = allProperties.filter(property => 
        property.website_status === status
      );
      
      // Load images for filtered properties
      const propertiesWithImages = await loadFeatureImages(filteredProperties);
      
      setProperties(propertiesWithImages);
      setHasMore(false); // Disable pagination for filtered results
      
    } catch (err) {
      console.error('Error filtering properties:', err);
      setError('Failed to filter properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      
      // Get all properties - we'll filter them in memory for now
      const allProperties = await propertyService.getAllProperties();
      
      // Apply filters
      let filteredProperties = allProperties;
      
      // Property Type filter
      if (filters.propertyType) {
        filteredProperties = filteredProperties.filter(property => 
          property.details?.property_type === filters.propertyType
        );
      }
      
      // Municipality filter
      if (filters.municipality) {
        filteredProperties = filteredProperties.filter(property => 
          property.location?.municipality === filters.municipality
        );
      }
      
      // Town filter
      if (filters.town) {
        filteredProperties = filteredProperties.filter(property => 
          property.location?.town === filters.town
        );
      }
      
      // Price range filter
      if (filters.priceMin) {
        filteredProperties = filteredProperties.filter(property => 
          property.price && property.price >= Number(filters.priceMin)
        );
      }
      if (filters.priceMax) {
        filteredProperties = filteredProperties.filter(property => 
          property.price && property.price <= Number(filters.priceMax)
        );
      }
      
      // Load images for filtered properties
      const propertiesWithImages = await loadFeatureImages(filteredProperties);
      
      setProperties(propertiesWithImages);
      setHasMore(false); // Disable pagination for filtered results
      
    } catch (err) {
      console.error('Error filtering properties:', err);
      setError('Failed to filter properties');
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyTypeOptions = async () => {
    try {
      const allProperties = await propertyService.getAllProperties();
      
      // Extract unique property types
      const types = new Set<string>();
      
      allProperties.forEach(property => {
        if (property.details?.property_type) {
          types.add(property.details.property_type);
        }
      });
      
      // Convert Set to sorted array
      setPropertyTypeOptions(Array.from(types).sort());
      
    } catch (err) {
      console.error('Error loading property type options:', err);
    }
  };

  const loadLocationOptions = async () => {
    try {
      const allProperties = await propertyService.getAllProperties();
      
      // Extract unique municipalities
      const municipalities = new Set<string>();
      // Extract unique towns
      const towns = new Set<string>();
      
      allProperties.forEach(property => {
        if (property.location?.municipality) {
          municipalities.add(property.location.municipality);
        }
        if (property.location?.town) {
          towns.add(property.location.town);
        }
      });
      
      // Convert Sets to sorted arrays
      setMunicipalityOptions(Array.from(municipalities).sort());
      setTownOptions(Array.from(towns).sort());
      
    } catch (err) {
      console.error('Error loading location options:', err);
      // Optionally set an error state here
    }
  };

  const handleResetFilters = async () => {
    try {
      setLoading(true);
      
      // Reset all filters to initial state
      setFilters({
        propertyType: '',
        municipality: '',
        town: '',
        priceMin: '',
        priceMax: ''
      });
      
      // Reset status filter if it exists
      setStatusFilter('');
      
      // Reset search if it exists
      setSearchId('');
      
      // Reset the properties list to initial state
      const { properties: newProperties, lastVisible: newLastVisible } = 
        await propertyService.getProperties(null, sortConfig);
      
      const propertiesWithImages = await loadFeatureImages(newProperties);
      setProperties(propertiesWithImages);
      setLastVisible(newLastVisible);
      setHasMore(true);
      
    } catch (err) {
      console.error('Error resetting filters:', err);
      setError('Failed to reset filters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadLocationOptions(),
          loadPropertyTypeOptions()
        ]);

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

  const filteredTownOptions = useMemo(() => {
    if (!filters.municipality) return townOptions;
    
    return townOptions.filter(town => {
      // Find if this town exists in any property with the selected municipality
      return properties.some(property => 
        property.location?.municipality === filters.municipality &&
        property.location?.town === town
      );
    });
  }, [filters.municipality, properties, townOptions]);

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
      <div className="mb-4 flex items-center">
        <div className="w-3/4">
          <div className="flex gap-4 py-2">
            {/* Search input */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Reference:</label>
              <input
                type="text"
                placeholder=" Search properties..."
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-44"
                disabled={loading}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button  
                onClick={handleSearch}
                disabled={loading}
                className="rounded-md shadow-sm bg-blue-500 text-stone-50 text-xs py-1 px-4"
                >
                  Search
              </button>
            </div>
            {/* Status Filter */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleStatusFilter(e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 py-2">
            {/* Type Filter */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-28"
                disabled={loading}
                value={filters.propertyType}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  propertyType: e.target.value
                }))}
              >
                <option value="">All</option>
                {propertyTypeOptions.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipality Filter */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Municipality:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-28"
                disabled={loading}
                value={filters.municipality}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  municipality: e.target.value
                }))}
              >
                <option value="">All</option>
                {municipalityOptions.map(municipality => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </div>

            {/* Town Filter */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Town:</label>
              <select
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-28"
                disabled={loading}
                value={filters.town}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  town: e.target.value
                }))}
              >
                <option value="">All</option>
                {filteredTownOptions.map(town => (
                  <option key={town} value={town}>
                    {town}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filters */}
            <div className="flex gap-2 px-2">
              <label className="text-sm font-medium text-gray-700">Price:</label>
              <input
                type="number"
                placeholder=" Min"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
                value={filters.priceMin}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceMin: e.target.value
                }))}
              />
              <input
                type="number"
                placeholder=" Max"
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs w-24"
                disabled={loading}
                value={filters.priceMax}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceMax: e.target.value
                }))}
              />
            </div>
            <button 
              onClick={handleFilter}
              disabled={loading}
              className="rounded-md shadow-sm bg-blue-500 text-stone-50 text-xs py-1 px-4 disabled:bg-gray-300"
            >
              Filter
            </button>
            <button 
              onClick={handleResetFilters}
              disabled={loading}
              className="rounded-md shadow-sm bg-gray-500 text-stone-50 text-xs py-1 px-4 disabled:bg-gray-300 hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="w-1/4 ">
          
          <div className="flex gap-4 py-2 justify-end">
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
          <div className="flex gap-4 py-2 justify-end">
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
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Price</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {properties.length > 0 ? (
            properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50 items-center">
                <td className="px-6 py-4 w-1/12" onClick={() => navigate(`/properties/${property.id}/view`)}>
                  {loadingImages[property.id] ? (
                    <div className="w-8 h-8 bg-gray-100 animate-pulse rounded-lg" />
                  ) : property.featureImageUrl ? (
                    <img
                      src={property.featureImageUrl}
                      alt={property.title || 'Property'}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
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
                <td className="px-6 py-4 cursor-pointer w-1/12" onClick={() => navigate(`/properties/${property.id}/view`)}>
                  <div className="text-sm text-gray-900">{property.property_id}</div>
                </td>
                <td className="px-6 py-4 w-2/12 cursor-pointer" onClick={() => navigate(`/properties/${property.id}/view`)}>
                  <div className="text-sm text-gray-900">{property.title || 'Untitled'}</div>
                </td>
                <td className="px-6 py-4 w-2/12 cursor-pointer" onClick={() => navigate(`/properties/${property.id}/view`)}>
                  <div className="text-sm text-gray-900">
                    {property.location ? (
                      `${property.location.town}, ${property.location.municipality}`
                    ) : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 w-1/12 cursor-pointer" onClick={() => navigate(`/properties/${property.id}/view`)}>
                  <div className="text-sm text-gray-900">${property.price?.toLocaleString() || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 w-1/12 justify-center text-center">

                  <button
                    onClick={() => {}}
                    className={`p-1 rounded-full transition-colors
                      ${property.website_status?.toLowerCase() === 'active' 
                        ? 'bg-green-400 hover:bg-green-600' 
                        : 'bg-red-400  hover:bg-red-600'}`}
                    title={property.website_status === 'Active' ? 'Deactivate Property' : 'Activate Property'}
                  >
                    <svg 
                      className="w-4 h-4 text-white cursor-pointer" 
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
                <td className="px-6 py-4 w-1/12 text-sm font-medium text-center">
                <button
                    onClick={() => navigate(`/properties/${property.id}/edit`)}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Edit Property"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" 
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
                      className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" 
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
                      className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" 
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
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                {loading ? (
                  'Loading properties...'
                ) : searchId.trim() ? (
                  'No properties found matching your search'
                ) : (
                  'No properties available'
                )}
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
      
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
import { useState, useEffect } from 'react';
import { propertyService } from '../services/firebase/properties';
import type { Property } from '../types/property';
import { QueryDocumentSnapshot, DocumentData } from '@firebase/firestore';
import Header from '../components/layout/Header';

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadProperties = async (isFirstLoad = false) => {
    try {
      setLoading(true);
      const lastDoc = isFirstLoad ? null : lastVisible;
      const { properties: newProperties, lastVisible: newLastVisible } = 
        await propertyService.getProperties(lastDoc);
      
      if (isFirstLoad) {
        setProperties(newProperties);
      } else {
        setProperties(prev => [...prev, ...newProperties]);
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
                    <button className="action-button edit">Edit</button>
                    <button className="action-button view">View</button>
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc,
  writeBatch,
  getDoc
} from '@firebase/firestore';
import { db } from '../services/firebase/config';

interface PropertyLocation {
  town: string;
  municipality: string;
}

interface PropertyRooms {
  bedrooms: number;
  bathrooms: number;
}

interface WebsiteProperty {
  id: string;
  feature_image_url: string;
  property_id: string;
  title: string;
  excerpt: string;
  property_type: string;
  price: number;
  location: PropertyLocation;
  rooms: PropertyRooms;
  updated_on: string;
}

const WebsiteProperties: React.FC = () => {
  const { websiteId } = useParams<{ websiteId: string }>();
  const [properties, setProperties] = useState<WebsiteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [websiteExists, setWebsiteExists] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    checkWebsiteExists();
    loadWebsiteProperties();
  }, [websiteId]);

  const checkWebsiteExists = async () => {
    try {
      const websiteRef = doc(db, 'websites', websiteId!);
      const websiteDoc = await getDoc(websiteRef);
      setWebsiteExists(websiteDoc.exists());
      if (!websiteDoc.exists()) {
        setError('Website not found');
      }
    } catch (err) {
      console.error('Error checking website:', err);
      setError('Error checking website');
    }
  };

  const loadWebsiteProperties = async () => {
    try {
      setLoading(true);
      const propertiesRef = collection(db, `websites/${websiteId}/properties`);
      const snapshot = await getDocs(propertiesRef);
      const propertiesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WebsiteProperty[];
      
      setProperties(propertiesList);
      setError(null);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const updateProperties = async () => {
    if (!websiteExists) {
      console.log('Website does not exist, stopping update');
      return;
    }
    
    try {
      setUpdating(true);
      console.log('Starting property update process...');
      
      // Get all current website properties
      const websitePropertiesRef = collection(db, 'websites', websiteId!, 'properties');
      const currentWebsiteProperties = await getDocs(websitePropertiesRef);
      
      // Get all active properties from main collection
      const mainPropertiesRef = collection(db, 'properties');
      const activePropertiesQuery = query(
        mainPropertiesRef, 
        where('website_status', '==', "Active")
      );
      
      const activePropertiesSnapshot = await getDocs(activePropertiesQuery);
      console.log(`Found ${activePropertiesSnapshot.docs.length} active properties`);
      
      // Create a Set of active property IDs for easy lookup
      const activePropertyIds = new Set(
        activePropertiesSnapshot.docs.map(doc => doc.id)
      );
      
      // Start a batch write
      const batch = writeBatch(db);
      
      // Remove properties that are no longer active
      currentWebsiteProperties.docs.forEach(doc => {
        if (!activePropertyIds.has(doc.id)) {
          console.log(`Removing inactive property: ${doc.id}`);
          const websitePropertyRef = doc.ref;
          batch.delete(websitePropertyRef);
        }
      });
      
      // Add or update active properties
      activePropertiesSnapshot.docs.forEach(propertyDoc => {
        console.log(`Processing active property: ${propertyDoc.id}`);
        const propertyData = propertyDoc.data();
        
        const websitePropertyRef = doc(
          db, 
          'websites', 
          websiteId!, 
          'properties', 
          propertyDoc.id
        );
        
        const websitePropertyData = {
          feature_image_url: propertyData.media?.feature_image_url || propertyData.feature_image_url || '',
          property_id: propertyData.property_id || '',
          title: propertyData.title || '',
          excerpt: propertyData.excerpt || '',
          property_type: propertyData.details?.property_type || propertyData.property_type || '',
          price: propertyData.price || 0,
          location: {
            town: propertyData.location?.town || '',
            municipality: propertyData.location?.municipality || ''
          },
          rooms: {
            bedrooms: Number(propertyData.rooms?.bedrooms || 0),
            bathrooms: Number(propertyData.rooms?.bathrooms || 0)
          },
          updated_on: new Date().toISOString()
        };
        
        batch.set(websitePropertyRef, websitePropertyData);
      });
      
      console.log('Committing batch update...');
      await batch.commit();
      console.log('Batch committed successfully');
      
      await loadWebsiteProperties(); // Reload the properties
      setError(null);
    } catch (err) {
      console.error('Error updating properties:', err);
      setError('Failed to update properties');
    } finally {
      setUpdating(false);
    }
  };

  if (!websiteExists && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Website not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Website Properties</h1>
        <button
          onClick={updateProperties}
          disabled={updating}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
            updating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {updating ? 'Updating Properties...' : 'Update Properties'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rooms
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No properties found
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="cursor-pointer" onClick={() => navigate(`/properties/${property.id}/view`)}>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{property.property_id}</span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      {property.feature_image_url && (
                        <img
                          src={property.feature_image_url}
                          alt={property.title}
                          className="h-10 w-10 rounded-md object-cover mr-3"
                        />
                      )}
                      <span className="text-sm text-gray-900">{property.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{property.property_type}</span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {property.location.town}, {property.location.municipality}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {property.rooms.bedrooms} bed, {property.rooms.bathrooms} bath
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      €{property.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(property.updated_on).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebsiteProperties;
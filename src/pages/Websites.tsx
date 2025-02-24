// src/pages/Websites.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from '@firebase/firestore';
import { db } from '../services/firebase/config';
import { 
  WebsiteIcon, 
  PropertiesIcon,
  EditIcon,
  IconButton
} from '../components/common/icons';

interface WebsiteSettings {
  theme: string;
  title: string;
  description: string;
  logo: string;
  favicon: string;
  status: 'active' | 'inactive';
}

interface Website {
  id: string;
  website_url: string;
  settings: WebsiteSettings;
  updated_on: string;
}

interface AddWebsiteFormData {
  website_url: string;
  settings: WebsiteSettings;
}

const initialFormData: AddWebsiteFormData = {
  website_url: '',
  settings: {
    theme: 'default',
    title: '',
    description: '',
    logo: '',
    favicon: '',
    status: 'inactive'
  }
};

const Websites: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddWebsiteFormData>(initialFormData);

  const navigate = useNavigate();

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const websitesRef = collection(db, 'websites');
      const snapshot = await getDocs(websitesRef);
      const websitesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Website[];
      
      setWebsites(websitesList);
      setError(null);
    } catch (err) {
      console.error('Error loading websites:', err);
      setError('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const websitesRef = collection(db, 'websites');
      await addDoc(websitesRef, {
        ...formData,
        updated_on: new Date().toISOString()
      });
      
      setFormData(initialFormData);
      setIsModalOpen(false);
      loadWebsites();
    } catch (err) {
      console.error('Error adding website:', err);
      setError('Failed to add website');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'website_url') {
      setFormData(prev => ({
        ...prev,
        website_url: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [name]: value
        }
      }));
    }
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Websites</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Website
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
                Website URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Theme
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : websites.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No websites found
                </td>
              </tr>
            ) : (
              websites.map((website) => (
                <tr key={website.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{website.website_url}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{website.settings.title}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{website.settings.theme}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      website.settings.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {website.settings.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(website.updated_on).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => navigate(`/websites/${website.id}/edit`)}
                      title="Edit Website"
                    />
                    <IconButton
                      icon={<PropertiesIcon />}
                      onClick={() => navigate(`/websites/${website.id}/properties`)}
                      title="View Properties"
                    />
                    <IconButton
                      icon={<WebsiteIcon />}
                      onClick={()=> window.open(`${website.website_url}`, "_blank")}
                      title="Go To Website"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Website Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Website</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="text"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.settings.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.settings.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Theme
                  </label>
                  <select
                    name="theme"
                    value={formData.settings.theme}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.settings.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Logo and Favicon fields can be added later with proper file upload handling */}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Websites;
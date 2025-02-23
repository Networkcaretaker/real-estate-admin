import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc 
} from '@firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from '@firebase/storage';
import { db, storage } from '../services/firebase/config';

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

const Edit_Website: React.FC = () => {
  const { websiteId } = useParams<{ websiteId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  
  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');

  useEffect(() => {
    loadWebsite();
  }, [websiteId]);

  const loadWebsite = async () => {
    try {
      if (!websiteId) return;
      
      const websiteRef = doc(db, 'websites', websiteId);
      const websiteDoc = await getDoc(websiteRef);
      
      if (!websiteDoc.exists()) {
        setError('Website not found');
        return;
      }

      const websiteData = {
        id: websiteDoc.id,
        ...websiteDoc.data()
      } as Website;

      setWebsite(websiteData);
      setLogoPreview(websiteData.settings.logo || '');
      setFaviconPreview(websiteData.settings.favicon || '');
      setError(null);
    } catch (err) {
      console.error('Error loading website:', err);
      setError('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!website) return;

    if (name === 'website_url') {
      setWebsite({ ...website, website_url: value });
    } else {
      setWebsite({
        ...website,
        settings: {
          ...website.settings,
          [name]: value
        }
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(`Invalid ${type} file type. Please upload an image.`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result as string);
        setLogoFile(file);
      } else {
        setFaviconPreview(reader.result as string);
        setFaviconFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, type: 'logo' | 'favicon'): Promise<string> => {
    const fileRef = ref(storage, `websites/${websiteId}/${type}/${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const deleteOldFile = async (url: string) => {
    if (!url) return;
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (err) {
      console.error('Error deleting old file:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website || !websiteId) return;

    try {
      setSaving(true);
      const websiteRef = doc(db, 'websites', websiteId);
      let updatedSettings = { ...website.settings };

      // Handle logo upload
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile, 'logo');
        await deleteOldFile(website.settings.logo);
        updatedSettings.logo = logoUrl;
      }

      // Handle favicon upload
      if (faviconFile) {
        const faviconUrl = await uploadFile(faviconFile, 'favicon');
        await deleteOldFile(website.settings.favicon);
        updatedSettings.favicon = faviconUrl;
      }

      // Update website document
      await updateDoc(websiteRef, {
        website_url: website.website_url,
        settings: updatedSettings,
        updated_on: new Date().toISOString()
      });

      navigate('/websites');
    } catch (err) {
      console.error('Error updating website:', err);
      setError('Failed to update website');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!website) {
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
        <h1 className="text-2xl font-semibold text-gray-900">Edit Website</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="text"
              name="website_url"
              value={website.website_url}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              value={website.settings.title}
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
              value={website.settings.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              name="theme"
              value={website.settings.theme}
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
              value={website.settings.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="h-20 w-20 object-contain border rounded"
                />
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'logo')}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <div className="flex items-center space-x-4">
              {faviconPreview && (
                <img 
                  src={faviconPreview} 
                  alt="Favicon preview" 
                  className="h-10 w-10 object-contain border rounded"
                />
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'favicon')}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/websites')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Edit_Website;
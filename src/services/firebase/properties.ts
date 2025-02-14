import { db } from './config';
import { 
  collection, 
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query, 
  limit, 
  orderBy, 
  startAfter, 
  DocumentData, 
  QueryDocumentSnapshot 
} from '@firebase/firestore';

import type { Property, PropertyImage, SortConfig, SortDirection } from '../../types/property';
import { getStorage, ref, getDownloadURL, deleteObject } from '@firebase/storage';
import type { AIMetadata, AIResponseSet } from '../../types/ai';

const storage = getStorage();
const PROPERTIES_PER_PAGE = 10;

export const propertyService = {
  async getProperties(
      lastVisible?: QueryDocumentSnapshot<DocumentData> | null,
      sortConfig: SortConfig = { field: 'updated_at', direction: 'desc' }
    ) {
      try {
        console.log('Starting property fetch...', { sortConfig });

        // Create base query
        let q = query(
          collection(db, 'properties'),
          orderBy(sortConfig.field, sortConfig.direction),
          limit(PROPERTIES_PER_PAGE)
        );

        // Add pagination if lastVisible exists
        if (lastVisible) {
          q = query(
            collection(db, 'properties'),
            orderBy(sortConfig.field, sortConfig.direction),
            startAfter(lastVisible),
            limit(PROPERTIES_PER_PAGE)
          );
        }

        const snapshot = await getDocs(q);
        console.log('Firestore snapshot:', {
          empty: snapshot.empty,
          size: snapshot.size,
          docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });

        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1] || null;
        
        const properties = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];

        console.log('Processed properties:', properties);

        return { 
          properties, 
          lastVisible: lastVisibleDoc 
        };
      } catch (error: any) {
        console.error('Firebase error:', error);
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }
    },
    async getProperty(id: string): Promise<Property> {
      try {
        console.log('Fetching property:', id);
  
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          console.error('No property found with ID:', id);
          throw new Error('Property not found');
        }
  
        console.log('Property data:', docSnap.data());
  
        const property = {
          id: docSnap.id,
          ...docSnap.data()
        } as Property;
  
        return property;
        
      } catch (error: any) {
        console.error('Firebase error fetching property:', error);
        throw new Error(`Failed to fetch property: ${error.message}`);
      }
    },
    async updatePropertyStatus(id: string, status: string): Promise<void> {
      try {
        console.log('Updating property status:', { id, status });
    
        const docRef = doc(db, 'properties', id);
        await updateDoc(docRef, {
          website_status: status,
          updated_at: new Date().toISOString()
        });
    
        console.log('Property status updated successfully');
      } catch (error: any) {
        console.error('Firebase error updating property status:', error);
        throw new Error(`Failed to update property status: ${error.message}`);
      }
    },
    async getImageDownloadURL(path: string): Promise<string> {
      try {
        const imageRef = ref(storage, path);
        return await getDownloadURL(imageRef);
      } catch (error) {
        console.error('Error getting download URL:', error, 'for path:', path);
        throw error;
      }
    },
    async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        const imagesCollectionRef = collection(propertyRef, 'images');
        const imagesSnapshot = await getDocs(imagesCollectionRef);
        
        const images = await Promise.all(imagesSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const imageId = doc.id; // This is the Firestore document ID
          console.log('Processing image:', { imageId, data }); // Debug log
    
          try {
            const [thumbnail, medium, large] = await Promise.all([
              this.getImageDownloadURL(data.urls.thumbnail),
              this.getImageDownloadURL(data.urls.medium),
              this.getImageDownloadURL(data.urls.large),
            ]);
    
            return {
              id: imageId, // Use the Firestore document ID
              filename: data.filename,
              urls: {
                thumbnail,
                medium,
                large
              },
              order: data.order || 0,
              title: data.title || '',
              description: data.description || ''
            } as PropertyImage;
          } catch (error) {
            console.error('Error processing image:', imageId, error);
            return null;
          }
        }));
    
        return images
          .filter((image): image is PropertyImage => image !== null)
          .sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 0;
            const orderB = typeof b.order === 'number' ? b.order : 0;
            return orderA - orderB;
          });
      } catch (error) {
        console.error('Error in getPropertyImages:', error);
        throw error;
      }
    },
    async setFeatureImage(propertyId: string, imageId: string): Promise<void> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        await updateDoc(propertyRef, {
          'media.feature_image_id': imageId
        });
      } catch (error) {
        console.error('Error setting feature image:', error);
        throw error;
      }
    },
    async deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        const imageRef = doc(collection(propertyRef, 'images'), imageId);
        
        // Get the image data first to get the URLs
        const imageDoc = await getDoc(imageRef);
        const imageData = imageDoc.data();
        
        // Delete the files from storage
        if (imageData?.urls) {
          const storage = getStorage();
          await Promise.all([
            deleteObject(ref(storage, imageData.urls.thumbnail)),
            deleteObject(ref(storage, imageData.urls.medium)),
            deleteObject(ref(storage, imageData.urls.large))
          ]);
        }
        
        // Delete the document from Firestore
        await deleteDoc(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    },
    async updateImageOrder(propertyId: string, imageId: string, newOrder: number): Promise<void> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        const imageRef = doc(collection(propertyRef, 'images'), imageId);
        await updateDoc(imageRef, { order: newOrder });
      } catch (error) {
        console.error('Error updating image order:', error);
        throw error;
      }
    },
    async updateImageDetails(
      propertyId: string, 
      imageId: string, 
      updates: { title?: string; description?: string }
    ): Promise<void> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        const imageRef = doc(collection(propertyRef, 'images'), imageId);
        await updateDoc(imageRef, updates);
      } catch (error) {
        console.error('Error updating image details:', error);
        throw error;
      }
    },
    // Fetch AI metadata for a specific image
    async getImageAIMetadata(propertyId: string, imageId: string): Promise<AIMetadata | null> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        const imageRef = doc(collection(propertyRef, 'images'), imageId);
        const imageDoc = await getDoc(imageRef);

        if (!imageDoc.exists()) {
          throw new Error('Image not found');
        }

        const data = imageDoc.data();
        return data.ai_meta || null;
      } catch (error) {
        console.error('Error fetching AI metadata:', error);
        throw error;
      }
    },

    // Update AI metadata with new response while maintaining history
    async updateImageAIMetadata(
      propertyId: string, 
      imageId: string, 
      newResponse: AIResponseSet
    ): Promise<void> {
      try {
        const propertyRef = doc(db, 'properties', propertyId);
        const imageRef = doc(collection(propertyRef, 'images'), imageId);
        const imageDoc = await getDoc(imageRef);

        if (!imageDoc.exists()) {
          throw new Error('Image not found');
        }

        // Get current metadata and create new metadata object
        const currentData = imageDoc.data();
        const currentMeta = currentData.ai_meta as AIMetadata | undefined;
        
        const newMeta: AIMetadata = {
          last_generated: new Date().toISOString(),
          responses: [
            newResponse,
            ...(currentMeta?.responses || []).slice(0, 2) // Keep only last 2 old responses
          ]
        };

        // Update the document with new metadata
        await updateDoc(imageRef, {
          ai_meta: newMeta
        });
      } catch (error) {
        console.error('Error updating AI metadata:', error);
        throw error;
      }
    }
  };
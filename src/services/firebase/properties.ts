import { db } from './config';
import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query, 
  limit, 
  orderBy, 
  startAfter, 
  DocumentData, 
  QueryDocumentSnapshot 
} from '@firebase/firestore';
import type { Property } from '../../types/property';

const PROPERTIES_PER_PAGE = 10;

export const propertyService = {
    async getProperties(lastVisible?: QueryDocumentSnapshot<DocumentData> | null) {
      try {
        console.log('Starting property fetch...');
  
        let q = query(
          collection(db, 'properties'),
          orderBy('updated_at', 'desc'),
          limit(PROPERTIES_PER_PAGE)
        );
  
        if (lastVisible) {
          q = query(
            collection(db, 'properties'),
            orderBy('updated_at', 'desc'),
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
    }
  };
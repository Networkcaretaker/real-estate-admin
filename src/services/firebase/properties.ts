// src/services/firebase/properties.ts
import { db } from './config';
import { 
  collection, 
  getDocs, 
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
          orderBy('updated_at', 'desc'), // Changed from modifiedtime to updated_at
          limit(PROPERTIES_PER_PAGE)
        );
  
        if (lastVisible) {
          q = query(
            collection(db, 'properties'),
            orderBy('updated_at', 'desc'), // Changed here too
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
    }
  };
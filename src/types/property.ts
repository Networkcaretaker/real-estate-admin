export interface PropertyLocation {
    country: string;
    region: string;
    municipality: string;
    town: string;
    postcode: string;
  }
  
  export interface PropertyDetails {
    property_type: string;
    area_plot: number;
    area_property: number;
    direction: string;
  }
  
  export interface PropertyRooms {
    bedrooms: number;
    bathrooms: number;
    total_rooms: number;
  }
  
  export interface PropertyFeatures {
    interior: string[];
    exterior: string[];
    luxury: string[];
    amenities: string[];
    utilities: string[];
  }
  
  export interface PropertyFlags {
    sold: boolean;
    reduced: boolean;
  }
  
  export interface PropertyMedia {
    feature_image_id: string;
    interior_image_ids: string[];
    exterior_image_ids: string[];
  }
  
  export interface PropertyImage {
    storage_url: string;
    title: string;
    description: string;
  }
  
  export interface Property {
    id: string;
    title: string;
    description: string;
    details: PropertyDetails;
    excerpt: string;
    price: number;
    website_status: string;
    location: PropertyLocation;
    rooms: PropertyRooms;
    features: PropertyFeatures;
    flags: PropertyFlags;
    media: PropertyMedia;
    images: Record<string, PropertyImage>;
  }
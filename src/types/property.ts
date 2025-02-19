import { AIResponse } from './ai';

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

import { AIMetadata } from './ai'; 

export interface PropertyImage {
  id: string;
  urls: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  filename: string;
  title: string;
  description: string;
  order: number;
  ai_meta: AIMetadata;
  created_at: string;
  updated_at: string;
}

export interface PropertyMedia {
  feature_image_id?: string;
  interior_image_ids?: string[];
  exterior_image_ids?: string[];
}

export interface Property {
  id: string;
  property_id: string;
  title: string;
  price?: number;
  description?: string;
  excerpt?: string;
  location: {
    town: string;
    region: string;
    municipality: string;
    postcode: string;
  };
  details: {
    property_type: string;
    direction: string;
    area_plot: number;
    area_property: number;
  };
  rooms: {
    bedrooms: number;
    bathrooms: number;
    total_rooms: number;
  };
  features: {
    interior: string[];
    exterior: string[];
  };
  website_status?: string;
  media: PropertyMedia;
  images?: Record<string, PropertyImage>;
  // Add AI metadata fields
  ai_meta?: {
    last_generated?: string;
    image_id?: string;
    responses?: AIResponse[];
  };
}

export interface EditState {
  title: string;
  description: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}
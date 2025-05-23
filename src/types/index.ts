import type { ContentType } from '../lib/oorlogsbronnen-api.js';

export interface SearchParams {
  query: string;
  type?: ContentType;
  offset?: number;
  count?: number;
  config?: 'production' | 'test';
}

export interface PersonAttributes {
  'http://schema.org/name': string | string[];
  'https://data.niod.nl/preferredName'?: string;
  'http://schema.org/birthPlace'?: string | string[];
  'http://schema.org/deathPlace'?: string | string[];
  'http://purl.org/dc/elements/1.1/description'?: string;
  'http://schema.org/jobTitle'?: string | string[];
  [key: string]: any; // Allow for additional attributes
}

export interface MediaAttributes {
  'http://schema.org/name': string | string[];
  'http://schema.org/contentUrl'?: string;
  'http://schema.org/thumbnailUrl'?: string;
  'http://schema.org/encodingFormat'?: string;
  'http://schema.org/width'?: number;
  'http://schema.org/height'?: number;
  'http://schema.org/duration'?: string;
  'http://schema.org/creator'?: string | string[];
  'http://schema.org/dateCreated'?: string;
  'http://schema.org/license'?: string;
  'http://purl.org/dc/elements/1.1/description'?: string;
  'http://schema.org/keywords'?: string[];
  'http://schema.org/copyrightHolder'?: string;
  [key: string]: any;
}

export interface SearchResultItem {
  rank: number;
  probability: number;
  tuple: Array<{
    id: string;
    class: string[];
    attributes: PersonAttributes | MediaAttributes;
  }>;
}

export interface SearchResponseData {
  offset: number;
  count: number;
  type: string[];
  items: SearchResultItem[];
}

export interface SearchStats {
  total: number;
  stats: Array<{
    cutoff: string;
    numResults: number;
  }>;
}

export type SearchResponse = [SearchResponseData, SearchStats];

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: string;
  description?: string;
  url: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: string;
  creator?: string | string[];
  dateCreated?: string;
  license?: string;
  keywords?: string[];
  copyrightHolder?: string;
  source?: {
    name: string;
    url: string;
  };
} 
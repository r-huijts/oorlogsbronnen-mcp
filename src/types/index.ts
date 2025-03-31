export interface SearchParams {
  query: string;
  type?: string;
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

export interface SearchResultItem {
  rank: number;
  probability: number;
  tuple: Array<{
    id: string;
    class: string[];
    attributes: PersonAttributes;
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
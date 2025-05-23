import { SearchParams, SearchResponse } from '../types/index.js';
import { processUrl } from './utils.js';

// Define allowed content types for filtering
export const CONTENT_TYPES = [
  'Person',
  'Photograph',
  'Article',
  'VideoObject', 
  'Thing',
  'Place',
  'CreativeWork',
  'Book'
] as const;

// Also export enum-style object for backward compatibility
export const CONTENT_TYPES_ENUM = {
  PERSON: 'Person',
  PHOTO: 'Photograph',
  ARTICLE: 'Article',
  VIDEO: 'VideoObject',
  THING: 'Thing',
  PLACE: 'Place',
  OBJECT: 'CreativeWork',
  BOOK: 'Book'
} as const;

// Type alias for all valid content type values
export type ContentType = typeof CONTENT_TYPES[number];

export class OorlogsbronnenClient {
  private baseUrl = 'https://rest.spinque.com/4/oorlogsbronnen/api/in10';

  async search({ query, type, count = 10, offset = 0, config = 'production' }: SearchParams): Promise<SearchResponse> {
    // Construct base URL with query
    let url = `${this.baseUrl}/e/integrated_search/p/topic/${encodeURIComponent(query)}`;
    
    // Add type filter only if type is specified
    if (type) {
      url += `/q/class:FILTER/p/value/1.0(${encodeURIComponent(`http://schema.org/${type}`)})`;
    }
    
    // Add results and parameters
    url += `/results,count?count=${count}&offset=${offset}&config=${config}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as SearchResponse;
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch search results: ${error.message}`);
      }
      throw new Error('Failed to fetch search results');
    }
  }
}

// Separate API class for simpler interface
export class OorlogsbronnenAPI {
  private client: OorlogsbronnenClient;

  constructor() {
    this.client = new OorlogsbronnenClient();
  }

  async search(query: string, type?: ContentType, count: number = 10): Promise<any[]> {
    const [data] = await this.client.search({ query, type, count });
    return data.items.map(item => {
      const attributes = item.tuple[0].attributes;
      return {
        id: item.tuple[0].id,
        title: Array.isArray(attributes['http://schema.org/name']) 
          ? attributes['http://schema.org/name'][0] 
          : attributes['http://schema.org/name'] || 'Untitled',
        type: item.tuple[0].class[0].split('/').pop() || 'unknown',
        description: attributes['http://purl.org/dc/elements/1.1/description'],
        url: processUrl(item.tuple[0].id)
      };
    });
  }
}

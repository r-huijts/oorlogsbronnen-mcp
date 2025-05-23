import { SearchParams, SearchResponse } from '../types/index.js';

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

  async search(query: string, type?: string, count: number = 10): Promise<any[]> {
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

// Helper function to properly format URLs
function processUrl(id: string): string {
  const prefix = 'https://www.oorlogsbronnen.nl/record/';
  
  // If the ID already starts with the prefix and contains another URL
  if (id.startsWith(prefix) && id.substring(prefix.length).startsWith('http')) {
    return id.substring(prefix.length);
  }
  
  // If the ID is already a full URL
  if (id.startsWith('http')) {
    return id;
  }
  
  // Otherwise, add the prefix to create a valid URL
  return `${prefix}${id}`;
} 
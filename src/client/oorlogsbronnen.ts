import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_VERSION, DEFAULT_CONFIG, DEFAULT_COUNT, ENDPOINTS, CONTENT_TYPES } from './constants';
import { SearchParams, SearchResponse, ApiError } from '../types';

export class OorlogsbronnenClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/${API_VERSION}`,
    });
  }

  private buildSearchUrl(params: SearchParams): string {
    const {
      query,
      type = CONTENT_TYPES.PERSON,
      count = DEFAULT_COUNT,
      offset = 0,
      config = DEFAULT_CONFIG,
    } = params;

    // Encode the query but not the type (as it's a URL)
    const encodedQuery = encodeURIComponent(query);
    
    // Build the search path
    const searchPath = ENDPOINTS.search
      .replace(':query', encodedQuery)
      .replace(':type', encodeURIComponent(type));

    const finalUrl = `/${searchPath}?count=${count}&offset=${offset}&config=${config}`;
    console.log('Built URL:', finalUrl);
    return finalUrl;
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      const apiError: ApiError = {
        message: error.message,
        status: error.response?.status,
        code: error.code,
      };
      throw apiError;
    }
    throw new Error('An unexpected error occurred');
  }

  /**
   * Search for items in the Oorlogsbronnen database
   * @param params Search parameters
   * @returns Search results
   */
  public async search(params: SearchParams): Promise<SearchResponse> {
    try {
      const url = this.buildSearchUrl(params);
      const fullUrl = `${this.client.defaults.baseURL}${url}`;
      console.log('Making request to:', fullUrl);
      
      const response = await this.client.get<SearchResponse>(url);
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data || !response.data.items) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
} 
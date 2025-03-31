export const API_BASE_URL = 'https://rest.spinque.com/4/netwerkoorlogsbronnen/api';
export const API_VERSION = 'in10';
export const DEFAULT_CONFIG = 'production';
export const DEFAULT_COUNT = 10;

// The working URL format:
// https://rest.spinque.com/4/netwerkoorlogsbronnen/api/in10/e/integrated_search/p/topic/roermond/q/class:FILTER/p/value/1.0(http%3A%2F%2Fschema.org%2FPerson)/results,count?count=5&offset=0&config=production
export const ENDPOINTS = {
  search: 'e/integrated_search/p/topic/:query/q/class:FILTER/p/value/1.0(:type)/results,count',
} as const;

export const CONTENT_TYPES = {
  PERSON: 'http://schema.org/Person',
  PHOTO: 'http://schema.org/Photograph',
  VIDEO: 'http://schema.org/VideoObject',
  ARTICLE: 'http://schema.org/Article',
} as const; 
import { OorlogsbronnenClient, OorlogsbronnenAPI, CONTENT_TYPES } from '../src/lib/oorlogsbronnen-api.js';

describe('Image URL Extraction Tests', () => {
  const client = new OorlogsbronnenClient();

  // Helper function to validate image URL structure
  const validateImageUrl = (url: string | null) => {
    if (url) {
      expect(url).toMatch(/^https?:\/\//); // Should start with http:// or https://
      expect(url.length).toBeGreaterThan(10); // Basic length check
    }
  };

  // Helper function to validate webpage URL structure
  const validateWebpageUrl = (url: string) => {
    if (url) {
      // Check for HTTPS/HTTP
      expect(url).toMatch(/^https?:\/\//);
      // Check for known image hosting domains
      expect(url).toMatch(/(beeldbankwo2\.nl|beeldbank\.cultureelerfgoed\.nl|historischcentrumleeuwarden\.nl|beeldbank\.historischcentrumlimburg\.nl|collectiegelderland\.nl)/);
    }
  };

  test('should extract image URLs from photo search results', async () => {
    const [results, stats] = await client.search({
      query: 'rotterdam bombardement 1940',
      type: CONTENT_TYPES.PHOTO,
      count: 5
    });

    expect(results.items.length).toBeGreaterThan(0);
    
    // Check each result for image attributes
    results.items.forEach(item => {
      const attributes = item.tuple[0].attributes;
      
      // At least one of these image-related attributes should exist
      const hasImageUrl = !!(
        attributes['http://schema.org/image'] ||
        attributes['http://schema.org/thumbnail'] ||
        attributes['http://schema.org/contentUrl']
      );
      
      expect(hasImageUrl).toBeTruthy();
      
      // Validate each possible image URL
      validateImageUrl(attributes['http://schema.org/image']);
      validateImageUrl(attributes['http://schema.org/thumbnail']);
      validateImageUrl(attributes['http://schema.org/contentUrl']);
    });
  });

  test('should handle missing image URLs gracefully', async () => {
    const [results, stats] = await client.search({
      query: 'amsterdam',
      type: CONTENT_TYPES.PERSON, // Person type typically doesn't have images
      count: 5
    });

    results.items.forEach(item => {
      const attributes = item.tuple[0].attributes;
      
      // If any image URL exists, it should be a valid URL
      if (attributes['http://schema.org/image']) {
        validateImageUrl(attributes['http://schema.org/image']);
      }
      if (attributes['http://schema.org/thumbnail']) {
        validateImageUrl(attributes['http://schema.org/thumbnail']);
      }
      if (attributes['http://schema.org/contentUrl']) {
        validateImageUrl(attributes['http://schema.org/contentUrl']);
      }
    });
  });

  test('should extract image URLs using OorlogsbronnenAPI wrapper', async () => {
    const api = new OorlogsbronnenAPI();
    const results = await api.search('rotterdam bombardement 1940', CONTENT_TYPES.PHOTO, 5);

    expect(results.length).toBeGreaterThan(0);
    
    results.forEach(item => {
      // Check if imageUrl is present and valid
      if (item.imageUrl) {
        validateImageUrl(item.imageUrl);
      }
    });
  });

  test('should prioritize image URLs correctly', async () => {
    const [results, stats] = await client.search({
      query: 'rotterdam bombardement 1940',
      type: CONTENT_TYPES.PHOTO,
      count: 5
    });

    results.items.forEach(item => {
      const attributes = item.tuple[0].attributes;
      
      // If multiple image URLs exist, verify we're using the preferred one
      if (attributes['http://schema.org/image']) {
        expect(attributes['http://schema.org/image']).toMatch(/^https?:\/\//);
      } else if (attributes['http://schema.org/thumbnail']) {
        expect(attributes['http://schema.org/thumbnail']).toMatch(/^https?:\/\//);
      } else if (attributes['http://schema.org/contentUrl']) {
        expect(attributes['http://schema.org/contentUrl']).toMatch(/^https?:\/\//);
      }
      
      // At least one of these should exist for photos
      expect(
        attributes['http://schema.org/image'] ||
        attributes['http://schema.org/thumbnail'] ||
        attributes['http://schema.org/contentUrl']
      ).toBeTruthy();
    });
  });

  test('should handle webpage URLs containing images', async () => {
    const [results, stats] = await client.search({
      query: 'roermond synagogue',
      type: CONTENT_TYPES.PHOTO,
      count: 5
    });

    results.items.forEach(item => {
      const attributes = item.tuple[0].attributes;
      const sourceUrl = attributes['http://purl.org/dc/elements/1.1/source'];
      
      if (sourceUrl) {
        validateWebpageUrl(sourceUrl);
      }

      // If we have a direct image URL, it should be valid
      if (attributes['http://schema.org/image']) {
        validateImageUrl(attributes['http://schema.org/image']);
      }
      if (attributes['http://schema.org/thumbnail']) {
        validateImageUrl(attributes['http://schema.org/thumbnail']);
      }
      if (attributes['http://schema.org/contentUrl']) {
        validateImageUrl(attributes['http://schema.org/contentUrl']);
      }

      // For photos, we should have either a direct image URL or a webpage URL
      expect(
        sourceUrl ||
        attributes['http://schema.org/image'] ||
        attributes['http://schema.org/thumbnail'] ||
        attributes['http://schema.org/contentUrl']
      ).toBeTruthy();
    });
  });

  test('should extract image information from known webpage patterns', async () => {
    // Test with known webpage URLs
    const testUrls = [
      'http://beeldbank.cultureelerfgoed.nl/alle-afbeeldingen/detail/df211d4f-613d-e009-8407-db42b8ff884e/media/1f94eeb8-dade-2602-f50c-bd0da096485c',
      'https://historischcentrumleeuwarden.nl/beeldbank/dc252d97-44e3-ff4f-8f5e-710267f6723b',
      'https://beeldbankwo2.nl/nl/beelden/detail/ae5a3c34-025a-11e7-904b-d89d6717b464/media/b1b25634-7cfd-f192-8505-47d37382f6bd',
      'https://beeldbank.historischcentrumlimburg.nl/detail.php?id=213908',
      'https://beeldbankwo2.nl/nl/beelden/detail/da4933f0-0259-11e7-904b-d89d6717b464/media/a9645442-7d62-6759-7872-78906e83aab9'
    ];

    testUrls.forEach(url => {
      validateWebpageUrl(url);
      
      // Extract potential image ID patterns
      const hasImageIdentifier = !!(
        url.match(/\/media\/[a-f0-9-]+/) ||                    // Match media ID pattern (beeldbankwo2, cultureelerfgoed)
        url.match(/\/beeldbank\/[a-f0-9-]+/) ||               // Match beeldbank ID pattern (historischcentrumleeuwarden)
        url.match(/\/detail\/[a-f0-9-]+/) ||                  // Match detail ID pattern (beeldbankwo2)
        url.match(/detail\.php\?id=\d+/) ||                   // Match numeric ID pattern (historischcentrumlimburg)
        url.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)  // Match UUID pattern
      );
      
      expect(hasImageIdentifier).toBeTruthy();

      // Verify URL structure based on source
      if (url.includes('beeldbankwo2.nl')) {
        expect(url).toMatch(/\/nl\/beelden\/detail\//);
      } else if (url.includes('cultureelerfgoed.nl')) {
        expect(url).toMatch(/\/alle-afbeeldingen\/detail\//);
      } else if (url.includes('historischcentrumleeuwarden.nl')) {
        expect(url).toMatch(/\/beeldbank\//);
      } else if (url.includes('historischcentrumlimburg.nl')) {
        expect(url).toMatch(/\/detail\.php/);
      }
    });
  });

  test('should include both webpage and direct image URLs in results', async () => {
    const api = new OorlogsbronnenAPI();
    const results = await api.search('rotterdam bombardement 1940', CONTENT_TYPES.PHOTO, 5);

    expect(results.length).toBeGreaterThan(0);
    
    results.forEach(item => {
      // Every item should have a webpage URL
      expect(item.webpageUrl).toBeDefined();
      validateWebpageUrl(item.webpageUrl);

      // If we have a direct image URL, it should be valid
      if (item.imageUrl) {
        validateImageUrl(item.imageUrl);
      }

      // For items from known image banks, try to extract direct image URL
      if (item.webpageUrl?.includes('beeldbankwo2.nl')) {
        // beeldbankwo2.nl uses a consistent pattern for image URLs
        const mediaId = item.webpageUrl.match(/\/media\/([a-f0-9-]+)/)?.[1];
        if (mediaId) {
          expect(item.imageUrl).toBeDefined();
          expect(item.imageUrl).toMatch(new RegExp(`${mediaId}`));
        }
      } else if (item.webpageUrl?.includes('cultureelerfgoed.nl')) {
        // cultureelerfgoed.nl follows a similar pattern
        const mediaId = item.webpageUrl.match(/\/media\/([a-f0-9-]+)/)?.[1];
        if (mediaId) {
          expect(item.imageUrl).toBeDefined();
          expect(item.imageUrl).toMatch(new RegExp(`${mediaId}`));
        }
      }
      
      // If we have a thumbnail URL from the API, it should be included
      const thumbnailUrl = item.thumbnailUrl;
      if (thumbnailUrl) {
        validateImageUrl(thumbnailUrl);
        // Thumbnails often come from memorix.nl
        expect(thumbnailUrl).toMatch(/images\.memorix\.nl/);
      }
    });
  });
}); 
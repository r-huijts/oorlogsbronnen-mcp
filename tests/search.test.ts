import { OorlogsbronnenClient, CONTENT_TYPES } from '../src';

describe('OorlogsbronnenClient Search Tests', () => {
  const client = new OorlogsbronnenClient();

  // Helper function to validate response structure
  const validateResponseStructure = (results: any, stats: any) => {
    expect(results).toBeDefined();
    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(results.items)).toBeTruthy();
  };

  // Test searching for people
  test('should search for people by location', async () => {
    const [results, stats] = await client.search({
      query: 'amsterdam',
      type: CONTENT_TYPES.PERSON,
      count: 5
    });

    validateResponseStructure(results, stats);
    expect(stats.total).toBeGreaterThan(0);
    
    // Validate person attributes
    const firstPerson = results.items[0]?.tuple[0]?.attributes;
    expect(firstPerson).toBeDefined();
    expect(firstPerson['http://schema.org/name']).toBeDefined();
  });

  // Test searching for photos
  test('should search for photos', async () => {
    const [results, stats] = await client.search({
      query: 'rotterdam bombardement',
      type: CONTENT_TYPES.PHOTO,
      count: 5
    });

    validateResponseStructure(results, stats);
    const firstPhoto = results.items[0]?.tuple[0]?.attributes;
    expect(firstPhoto).toBeDefined();
  });

  // Test pagination
  test('should handle pagination correctly', async () => {
    const count = 5;
    const [firstPage, firstStats] = await client.search({
      query: 'den haag',
      type: CONTENT_TYPES.PERSON,
      count,
      offset: 0
    });

    const [secondPage, secondStats] = await client.search({
      query: 'den haag',
      type: CONTENT_TYPES.PERSON,
      count,
      offset: count
    });

    expect(firstPage.items).toHaveLength(count);
    expect(secondPage.items).toHaveLength(count);
    expect(firstStats.total).toBe(secondStats.total);
    
    // Ensure different results
    const firstIds = firstPage.items.map(item => item.tuple[0].id);
    const secondIds = secondPage.items.map(item => item.tuple[0].id);
    expect(firstIds).not.toEqual(secondIds);
  });

  // Test empty results
  test('should handle queries with no results', async () => {
    const [results, stats] = await client.search({
      query: 'xyznonexistentquery123',
      type: CONTENT_TYPES.PERSON,
      count: 5
    });

    validateResponseStructure(results, stats);
    expect(stats.total).toBe(0);
    expect(results.items).toHaveLength(0);
  });

  // Test article search
  test('should search for articles', async () => {
    const [results, stats] = await client.search({
      query: 'verzet',
      type: CONTENT_TYPES.ARTICLE,
      count: 5
    });

    validateResponseStructure(results, stats);
    const firstArticle = results.items[0]?.tuple[0]?.attributes;
    expect(firstArticle).toBeDefined();
  });

  // Test video search
  test('should search for videos', async () => {
    const [results, stats] = await client.search({
      query: 'bevrijding',
      type: CONTENT_TYPES.VIDEO,
      count: 5
    });

    validateResponseStructure(results, stats);
    const firstVideo = results.items[0]?.tuple[0]?.attributes;
    expect(firstVideo).toBeDefined();
  });

  // Test error handling
  test('should handle empty queries gracefully', async () => {
    const [results, stats] = await client.search({
      query: '',
      type: CONTENT_TYPES.PERSON
    });

    validateResponseStructure(results, stats);
    expect(stats.total).toBe(0);
    expect(results.items).toHaveLength(0);
  });

  // Test type filtering
  test('should filter results by type correctly', async () => {
    const query = 'amsterdam';
    
    // Get all results
    const [allResults, allStats] = await client.search({
      query,
      count: 5
    });

    // Get only person results
    const [personResults, personStats] = await client.search({
      query,
      type: CONTENT_TYPES.PERSON,
      count: 5
    });

    // Get only photo results
    const [photoResults, photoStats] = await client.search({
      query,
      type: CONTENT_TYPES.PHOTO,
      count: 5
    });

    // Validate response structures
    validateResponseStructure(allResults, allStats);
    validateResponseStructure(personResults, personStats);
    validateResponseStructure(photoResults, photoStats);

    // Log results for analysis
    console.log('All results classes:', allResults.items.map(item => item.tuple[0].class));
    console.log('Person results classes:', personResults.items.map(item => item.tuple[0].class));
    console.log('Photo results classes:', photoResults.items.map(item => item.tuple[0].class));

    // Verify different total counts
    console.log('Total counts:', {
      all: allStats.total,
      person: personStats.total,
      photo: photoStats.total
    });

    // Verify person results contain Person class
    if (personResults.items.length > 0) {
      expect(personResults.items[0].tuple[0].class).toContain('http://schema.org/Person');
    }

    // Verify photo results contain Image class
    if (photoResults.items.length > 0) {
      expect(photoResults.items[0].tuple[0].class).toContain('http://schema.org/Photograph');
    }
  });

  // Test result count limits
  test('should respect requested result count', async () => {
    const testCounts = [1, 5, 10, 20];
    
    for (const count of testCounts) {
      const [results, stats] = await client.search({
        query: 'amsterdam',
        type: CONTENT_TYPES.PERSON,
        count
      });

      validateResponseStructure(results, stats);
      expect(results.items).toHaveLength(count);
      console.log(`Requested ${count} results, received ${results.items.length} results`);
    }
  });
}); 
const { OorlogsbronnenClient, CONTENT_TYPES } = require('./dist/lib/oorlogsbronnen-api');

async function main() {
  const client = new OorlogsbronnenClient();
  
  console.error('Searching for "101st Airborne Division" with type filter for "Book"');
  console.error('This should use class:FILTER in the URL');
  
  const results = await client.search({
    query: '101st Airborne Division',
    type: CONTENT_TYPES.BOOK,
    count: 20 // Request more results to ensure we find books
  });
  
  console.error(`Found ${results[1].total} total results`);
  
  // Get all Book results
  const bookItems = results[0].items.filter(item => 
    item.tuple[0].class[0].includes('Book')
  );
  
  console.error(`Found ${bookItems.length} books about 101st Airborne Division`);
  
  // Display all book results
  bookItems.forEach((item, index) => {
    const attributes = item.tuple[0].attributes;
    const title = attributes['http://purl.org/dc/elements/1.1/title'] || 'Untitled';
    const author = attributes['http://purl.org/dc/elements/1.1/creator'] || 'Unknown author';
    const publisher = attributes['http://purl.org/dc/elements/1.1/publisher'] || 'Unknown publisher';
    const id = item.tuple[0].id;
    
    console.error(`\nBook ${index + 1}:`);
    console.error(`Title: ${title}`);
    console.error(`Author: ${author}`);
    console.error(`Publisher: ${publisher}`);
    console.error(`ID: ${id}`);
    console.error(`Rank: ${item.rank}, Probability: ${item.probability}`);
  });
}

main().catch(err => {
  console.error('Error occurred:', err);
  process.exit(1);
}); 
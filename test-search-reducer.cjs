const { OorlogsbronnenClient, CONTENT_TYPES } = require('./dist/lib/oorlogsbronnen-api');

async function main() {
  const client = new OorlogsbronnenClient();
  
  // Test 1: Without type (should use search_reducer)
  console.log('Test 1: Searching for "101st Airborne Division" without type filter');
  console.log('This should use search_reducer in the URL');
  const resultsWithoutType = await client.search({ 
    query: '101st Airborne Division'
  });
  
  console.log(`Found ${resultsWithoutType[1].total} total results`);
  console.log(`First 3 results:`);
  
  const itemsWithoutType = resultsWithoutType[0].items.slice(0, 3);
  itemsWithoutType.forEach((item, index) => {
    const attributes = item.tuple[0].attributes;
    const title = attributes['http://purl.org/dc/elements/1.1/title'] || 'Untitled';
    const type = item.tuple[0].class[0].split('/').pop();
    
    console.log(`${index + 1}. [${type}] ${title}`);
  });
  
  console.log('\n--------------------------------------\n');
  
  // Test 2: With type (should use class:FILTER)
  console.log('Test 2: Searching for "101st Airborne Division" with type filter for "Photograph"');
  console.log('This should use class:FILTER in the URL');
  
  const resultsWithType = await client.search({
    query: '101st Airborne Division',
    type: CONTENT_TYPES.PHOTO
  });
  
  console.log(`Found ${resultsWithType[1].total} total results`);
  console.log(`First 3 results:`);
  
  const itemsWithType = resultsWithType[0].items.slice(0, 3);
  itemsWithType.forEach((item, index) => {
    const attributes = item.tuple[0].attributes;
    const title = attributes['http://purl.org/dc/elements/1.1/title'] || 'Untitled';
    const type = item.tuple[0].class[0].split('/').pop();
    
    console.log(`${index + 1}. [${type}] ${title}`);
  });
}

main().catch(err => {
  console.error('Error occurred:', err);
  process.exit(1);
}); 
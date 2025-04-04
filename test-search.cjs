const { OorlogsbronnenClient } = require('./dist/lib/oorlogsbronnen-api');

async function main() {
  const client = new OorlogsbronnenClient();
  
  console.log('Searching for "101st Airborne Division"...');
  const results = await client.search({ 
    query: '101st Airborne Division'
  });
  
  console.log(`Found ${results[1].total} total results`);
  console.log(`First 10 results:`);
  
  const items = results[0].items;
  items.forEach((item, index) => {
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
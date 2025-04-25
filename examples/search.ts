import { OorlogsbronnenClient, CONTENT_TYPES } from '../src';

async function main() {
  const client = new OorlogsbronnenClient();

  try {
    // Search for people from Roermond
    const [results, stats] = await client.search({
      query: 'roermond',
      type: CONTENT_TYPES.PERSON,
      count: 5,
      offset: 0
    });

    console.error(`Found ${stats.total} results`);
    
    // Print the first 5 results
    if (results.items && Array.isArray(results.items)) {
      results.items.forEach(item => {
        if (item.tuple && item.tuple[0] && item.tuple[0].attributes) {
          const person = item.tuple[0].attributes;
          const name = Array.isArray(person['http://schema.org/name']) 
            ? person['http://schema.org/name'][0] 
            : person['http://schema.org/name'];
          
          console.error('\n-------------------');
          console.error(`Name: ${name}`);
          
          if (person['http://purl.org/dc/elements/1.1/description']) {
            console.error(`Description: ${person['http://purl.org/dc/elements/1.1/description']}`);
          }
          
          if (person['http://schema.org/birthPlace']) {
            const birthPlace = Array.isArray(person['http://schema.org/birthPlace'])
              ? person['http://schema.org/birthPlace'][0]
              : person['http://schema.org/birthPlace'];
            console.error(`Birth Place: ${birthPlace}`);
          }

          if (person['http://schema.org/jobTitle']) {
            const jobTitle = Array.isArray(person['http://schema.org/jobTitle'])
              ? person['http://schema.org/jobTitle'].join(', ')
              : person['http://schema.org/jobTitle'];
            console.error(`Job Title: ${jobTitle}`);
          }
        }
      });
    } else {
      console.error('No items found in the results');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  }
}

main(); 
# Oorlogsbronnen API Client

A TypeScript client for the Oorlogsbronnen (War Sources) API, providing easy access to Dutch WWII historical records.

## Installation

```bash
npm install oorlogsbronnen
```

## Usage

### Basic Example

```typescript
import { OorlogsbronnenClient, CONTENT_TYPES } from 'oorlogsbronnen';

const client = new OorlogsbronnenClient();

// Search for people
const [results, stats] = await client.search({
  query: 'amsterdam',
  type: CONTENT_TYPES.PERSON,
  count: 5
});

console.log(`Found ${stats.total} total results`);
console.log('First 5 results:', results.items);
```

### Content Types

The API supports different types of content:

```typescript
// Available content types
CONTENT_TYPES.PERSON    // Search for people
CONTENT_TYPES.PHOTO     // Search for photographs
CONTENT_TYPES.VIDEO     // Search for videos
CONTENT_TYPES.ARTICLE   // Search for articles
```

### Pagination

You can paginate through results using `count` and `offset`:

```typescript
// Get first page (5 results)
const [page1, stats1] = await client.search({
  query: 'rotterdam',
  count: 5,
  offset: 0
});

// Get second page (next 5 results)
const [page2, stats2] = await client.search({
  query: 'rotterdam',
  count: 5,
  offset: 5
});
```

### Response Structure

The search method returns a tuple with two elements:

1. Results object:
   ```typescript
   {
     items: Array<{
       tuple: [{
         id: string;
         class: string[];
         attributes: {
           'http://schema.org/name': string;
           'http://schema.org/birthPlace'?: string;
           'http://schema.org/deathPlace'?: string;
           // ... other attributes depending on content type
         }
       }]
     }>;
     count: number;
     offset: number;
     type: string[];
   }
   ```

2. Stats object:
   ```typescript
   {
     total: number;
     stats: any[];
   }
   ```

### Configuration

You can customize the client configuration:

```typescript
const client = new OorlogsbronnenClient({
  config: 'production' // or other environment
});
```

## Development

### Setup

```bash
git clone <repository-url>
cd oorlogsbronnen
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
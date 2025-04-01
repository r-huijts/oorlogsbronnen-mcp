import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OorlogsbronnenClient, CONTENT_TYPES } from "./lib/oorlogsbronnen-api.js";

// Create an MCP server with enhanced metadata for better detection
const server = new McpServer({
  name: "oorlogsbronnen-server",
  version: "1.0.0",
  description: "Access and search Dutch World War II archives (1940-1945). This server provides information about historical events, people, places, and artifacts from the Netherlands during WWII, including the German occupation, resistance movements, liberation, and Holocaust. Use for researching Dutch WWII history, including topics like Anne Frank, Operation Market Garden, the February Strike, the Hunger Winter, Dutch resistance, concentration camps, and the Nazi occupation of the Netherlands.",
  metadata: {
    topics: [
      "World War II", "WWII", "WW2", "Second World War", 
      "Netherlands during World War II", "Dutch history 1940-1945",
      "German occupation of the Netherlands", "Nazi occupation",
      "Dutch resistance", "Dutch underground", "verzet",
      "Holocaust in the Netherlands", "Dutch Jews", "Anne Frank",
      "Operation Market Garden", "Battle of Arnhem", "A Bridge Too Far",
      "Dutch famine", "Hunger Winter", "hongerwinter",
      "February Strike", "Februaristaking",
      "Liberation of the Netherlands", "Canadian liberation of Netherlands",
      "Concentration camps in Netherlands", "Westerbork", "Vught"
    ],
    timeperiod: "1940-1945",
    locations: [
      "Netherlands", "Holland", "Dutch",
      "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven",
      "Arnhem", "Nijmegen", "Vught", "Westerbork", "Amersfoort"
    ],
    people: [
      "Anne Frank", "Queen Wilhelmina", "Prince Bernhard",
      "Anton Mussert", "Arthur Seyss-Inquart", "Hannie Schaft",
      "Erik Hazelhoff Roelfzema", "Soldier of Orange"
    ]
  }
});

// Initialize the API client
const client = new OorlogsbronnenClient();

// Register resource handler
server.resource(
  "oorlogsbronnen",
  "oorlogsbronnen://{query}",
  async (uri) => {
    try {
      // Extract query from URI
      const urlString = uri.toString();
      const match = urlString.match(/^oorlogsbronnen:\/\/(.+)$/);
      if (!match) {
        return {
          contents: [{
            uri: "data:text/plain;charset=utf-8,Error",
            text: "Invalid Oorlogsbronnen resource URI. Format should be: oorlogsbronnen://your-search-query"
          }]
        };
      }
      
      const query = decodeURIComponent(match[1]);
      
      // Perform search with default settings
      const [data, stats] = await client.search({ query, count: 5 });
      
      if (!data.items || data.items.length === 0) {
        return {
          contents: [{
            uri: "data:text/plain;charset=utf-8,NoResults",
            text: `No results found for query: ${query}`
          }]
        };
      }
      
      // Format results
      let resultText = `# Dutch WWII Archive Results for "${query}"\n\n`;
      resultText += `Found ${stats.total} total results. Showing top 5:\n\n`;
      
      data.items.forEach((item, index) => {
        const attributes = item.tuple[0].attributes;
        const title = Array.isArray(attributes['http://schema.org/name']) 
          ? attributes['http://schema.org/name'][0] 
          : (attributes['http://schema.org/name'] || 'Untitled');
          
        const type = item.tuple[0].class[0].split('/').pop() || 'unknown';
        const description = attributes['http://purl.org/dc/elements/1.1/description'] || 'No description available';
        const url = processUrl(item.tuple[0].id);
        
        resultText += `## ${index + 1}. ${title} (${type})\n`;
        resultText += `${description}\n`;
        resultText += `[View Source](${url})\n\n`;
      });
      
      return {
        contents: [{
          uri: "data:text/markdown;charset=utf-8,Results",
          text: resultText
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        contents: [{
          uri: "data:text/plain;charset=utf-8,Error",
          text: `Error retrieving Oorlogsbronnen resource: ${errorMessage}`
        }]
      };
    }
  }
);

// Register prompt handler
server.prompt(
  "search_help",
  "A comprehensive guide for effectively searching Dutch WW2 archives and understanding historical context",
  async () => {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: "# Searching Dutch WWII Archives\n\n" +
                  "## About Oorlogsbronnen\n" +
                  "The Oorlogsbronnen (War Sources) network provides access to over 250 collections from Dutch museums, archives, and memorial centers related to World War II in the Netherlands (1940-1945).\n\n" +
                  "## Using the search_ww2_nl_archives Tool\n\n" +
                  "### Basic Parameters\n" +
                  "- **query**: Your main search term (required)\n" +
                  "  - Example: `Anne Frank`, `Rotterdam bombing`, `Arnhem bridge`\n" +
                  "- **type**: Filter by content type (optional)\n" +
                  "  - Options: `Person`, `Photograph`, `Article`, `VideoObject`, `Thing`, `Place`\n" +
                  "- **count**: Number of results (1-100, default: 10)\n\n" +
                  
                  "### Search Tips\n" +
                  "1. **Try Dutch Terms**: Include Dutch words when possible (e.g., `verzet` for resistance)\n" +
                  "2. **Be Specific**: Narrow searches with locations and dates (e.g., `Rotterdam mei 1940`)\n" +
                  "3. **Vary Content Types**: Different types provide unique perspectives\n" +
                  "4. **Historical Names**: Use period-accurate place and street names\n\n" +
                  
                  "### Major Events in Dutch WWII History\n" +
                  "- **May 1940**: German invasion and bombing of Rotterdam\n" +
                  "- **February 1941**: February Strike (Februaristaking) against persecution of Jews\n" +
                  "- **1942-1944**: Height of deportations from Westerbork transit camp\n" +
                  "- **September 1944**: Operation Market Garden and liberation of southern Netherlands\n" +
                  "- **Winter 1944-1945**: Hongerwinter (Hunger Winter) in occupied territories\n" +
                  "- **May 1945**: Complete liberation of the Netherlands\n\n" +
                  
                  "### Sample Queries\n" +
                  "- `Anne Frank onderduiken` (Anne Frank in hiding)\n" +
                  "- `Verzetsgroep Eindhoven` (Resistance group Eindhoven)\n" +
                  "- `Hongerwinter Amsterdam` (Hunger Winter Amsterdam)\n" +
                  "- `Bevrijding Nijmegen 1944` (Liberation of Nijmegen 1944)\n" +
                  "- `NSB collaboratie` (NSB collaboration)\n\n" +
                  
                  "Use this tool for primary historical research on the Netherlands during WWII."
          }
        }
      ]
    };
  }
);

// Register search tool
server.tool(
  "search_ww2_nl_archives",
  "A specialized search tool for discovering Dutch World War II historical records, photographs, and documents (1940-1945). This tool accesses the comprehensive Oorlogsbronnen (War Sources) archive network containing millions of items related to the Netherlands during WWII.\n\n" +
  "USE THIS TOOL WHEN:\n" +
  "- Responding to questions about Dutch history during WWII (1940-1945)\n" +
  "- Researching people, events, or locations in the Netherlands during the German occupation\n" +
  "- Seeking information about Dutch resistance movements, Holocaust victims, or liberation\n" +
  "- Looking for authentic photographs, documents, or artifacts from WWII Netherlands\n" +
  "- Exploring specific events like Operation Market Garden, the February Strike, or Hunger Winter\n\n" +
  "The tool provides primary source material including personal accounts, official records, newspaper articles, and photographs from Dutch museums and archives.",
  {
    query: z.string().describe(
      "The main search term or phrase to look for in the archives. Can include names (e.g., 'Anne Frank'), " +
      "places (e.g., 'Rotterdam'), dates (e.g., '1940-1945'), events (e.g., 'February Strike 1941'), " +
      "or any combination of these. For better results, consider translating key terms to Dutch."
    ),
    type: z.enum(['Person', 'Photograph', 'Article', 'VideoObject', 'Thing', 'Place']).optional().describe(
      "Filter results by content type. Available types:\n" +
      "- 'Person': Individual biographical records\n" +
      "- 'Photograph': Historical photographs\n" +
      "- 'Article': News articles and written documents\n" +
      "- 'VideoObject': Video footage\n" +
      "- 'Thing': Physical artifacts\n" +
      "- 'Place': Places and geographical records"
    ),
    count: z.number().min(1).max(100).optional().describe(
      "Number of results to return (1-100, default: 10). Larger numbers provide more comprehensive results " +
      "but may take longer to process."
    )
  },
  async ({ query, type, count = 10 }) => {
    try {
      const startTime = Date.now();
      
      // Initialize categories
      const categories: Record<string, { count: number; items: any[] }> = {
        Person: { count: 0, items: [] },
        Photograph: { count: 0, items: [] },
        Article: { count: 0, items: [] },
        VideoObject: { count: 0, items: [] },
        Thing: { count: 0, items: [] },
        Place: { count: 0, items: [] }
      };

      // If type is specified, we only need to search that category
      if (type) {
        const [data, stats] = await client.search({ query, type, count });
        if (data.items) {
          categories[type] = {
            count: stats.total,
            items: processSearchResults(data.items)
          };
        }
      } else {
        // Search all categories
        const searchPromises = Object.keys(categories).map(async (categoryType) => {
          try {
            const [data, stats] = await client.search({ 
              query, 
              type: categoryType as any, 
              count: Math.ceil(count / Object.keys(categories).length) 
            });
            
            if (data.items) {
              categories[categoryType] = {
                count: stats.total,
                items: processSearchResults(data.items)
              };
            }
          } catch (error) {
            console.error(`Error searching ${categoryType}:`, error);
            // Continue with other categories if one fails
          }
        });

        // Wait for all searches to complete
        await Promise.all(searchPromises);
      }

      // Calculate total results across all categories
      const totalResults = Object.values(categories).reduce(
        (sum, category) => sum + category.count, 
        0
      );

      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(
            formatSearchResponse(query, categories, startTime),
            null, 
            2
          )
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        isError: true,
        content: [{ 
          type: "text", 
          text: `Error performing search: ${errorMessage}`
        }]
      };
    }
  }
);

// Helper function to process search results
function processSearchResults(items: any[]) {
  return items.map(item => {
    const attributes = item.tuple[0].attributes;
    const type = item.tuple[0].class[0].split('/').pop() || 'unknown';
    
    // Base result object
    const result = {
      id: item.tuple[0].id,
      title: Array.isArray(attributes['http://schema.org/name']) 
        ? attributes['http://schema.org/name'][0] 
        : (attributes['http://schema.org/name'] || 'Untitled'),
      type,
      description: attributes['http://purl.org/dc/elements/1.1/description'] || null,
      url: processUrl(item.tuple[0].id),
      date: attributes['http://schema.org/dateCreated'] || null,
      creator: attributes['http://schema.org/creator'] || null,
      language: attributes['http://schema.org/inLanguage'] || null
    };

    // Add media-specific attributes for photos and videos
    if (type === 'Photograph' || type === 'VideoObject') {
      return {
        ...result,
        contentUrl: attributes['http://schema.org/contentUrl'] || null,
        thumbnailUrl: attributes['http://schema.org/thumbnailUrl'] || null,
        mimeType: attributes['http://schema.org/encodingFormat'] || null,
        width: attributes['http://schema.org/width'] || null,
        height: attributes['http://schema.org/height'] || null,
        duration: type === 'VideoObject' ? attributes['http://schema.org/duration'] || null : undefined,
        license: attributes['http://schema.org/license'] || null,
        keywords: attributes['http://schema.org/keywords'] || [],
        copyrightHolder: attributes['http://schema.org/copyrightHolder'] || null,
        source: {
          name: attributes['http://schema.org/provider']?.[0] || 'Oorlogsbronnen',
          url: result.url
        }
      };
    }

    // Add person-specific attributes
    if (type === 'Person') {
      return {
        ...result,
        birthPlace: attributes['http://schema.org/birthPlace'] || null,
        deathPlace: attributes['http://schema.org/deathPlace'] || null,
        jobTitle: attributes['http://schema.org/jobTitle'] || null,
        preferredName: attributes['https://data.niod.nl/preferredName'] || null
      };
    }

    return result;
  });
}

// Helper function to format the response for better presentation
function formatSearchResponse(query: string, categories: any, startTime: number) {
  // Group media items with their related content
  const mediaGroups = new Map();

  // Process each category
  Object.entries(categories).forEach(([categoryType, categoryData]: [string, any]) => {
    categoryData.items.forEach((item: any) => {
      // Skip if no media content
      if (!item.contentUrl && !item.thumbnailUrl) return;

      const groupKey = item.creator || item.source?.name || 'Unknown';
      if (!mediaGroups.has(groupKey)) {
        mediaGroups.set(groupKey, {
          groupName: groupKey,
          items: [],
          relatedContent: []
        });
      }

      const group = mediaGroups.get(groupKey);
      if (item.type === 'Photograph' || item.type === 'VideoObject') {
        group.items.push(item);
      } else {
        group.relatedContent.push(item);
      }
    });
  });

  return {
    query,
    total_results: Object.values(categories).reduce(
      (sum: number, category: any) => sum + category.count, 
      0
    ),
    categories,
    mediaGroups: Array.from(mediaGroups.values()),
    metadata: {
      timestamp: new Date().toISOString(),
      processing_time: Date.now() - startTime
    }
  };
}

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

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
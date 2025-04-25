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
        resultText += `[View Source](${url})\n`;
        
        // Add image URL if available
        const imageUrl = attributes['http://schema.org/image'] || 
                        attributes['http://schema.org/thumbnail'] ||
                        attributes['http://schema.org/contentUrl'];
        if (imageUrl) {
            resultText += `\n![Image](${imageUrl})\n`;
        }
        
        resultText += '\n';
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
  "The tool provides primary source material including personal accounts, official records, newspaper articles, and photographs from Dutch museums and archives.\n\n" +
  "SEARCH BEHAVIOR:\n" +
  "- When no type is specified, the search uses a comprehensive approach (search_reducer) that returns results across all content types for maximum coverage\n" +
  "- For more targeted searches, you can filter by content type using the type parameter\n\n" +
  "RESULT LINKS:\n" +
  "- Every result includes at least one working link to access the full content\n" +
  "- 'View Original Source' links to the original archive or museum page\n" +
  "- 'View on Oorlogsbronnen' links to the standardized entry in the central database\n" +
  "- Links should always be included when referencing content in responses\n\n" +
  "For photographs and video content, the tool returns:\n" +
  "- Original webpage URL where the image is displayed\n" +
  "- Direct image URL when available (automatically extracted from known image banks)\n" +
  "- Thumbnail URL for preview purposes\n" +
  "- Additional metadata like creator, date, and copyright information",
  {
    query: z.string().describe(
      "The main search term or phrase to look for in the archives. Can include names (e.g., 'Anne Frank'), " +
      "places (e.g., 'Rotterdam'), dates (e.g., '1940-1945'), events (e.g., 'February Strike 1941'), " +
      "or any combination of these. For better results, consider translating key terms to Dutch."
    ),
    type: z.enum(['Person', 'Photograph', 'Article', 'VideoObject', 'Thing', 'Place', 'CreativeWork']).optional().describe(
      "Filter results by content type. Leave empty for more comprehensive results across all content types. Available types:\n" +
      "- 'Person': Individual biographical records\n" +
      "- 'Photograph': Historical photographs\n" +
      "- 'Article': News articles and written documents\n" +
      "- 'VideoObject': Video footage\n" +
      "- 'Thing': Physical artifacts\n" +
      "- 'Place': Places and geographical records\n" +
      "- 'CreativeWork': Miscellaneous objects, manuscripts, and documents (shows as 'Object' in Dutch interface)"
    ),
    count: z.number().min(1).max(100).optional().describe(
      "Number of results to return (1-100, default: 50). Larger numbers provide more comprehensive results " +
      "but may take longer to process."
    )
  },
  async ({ query, type, count = 50 }) => {
    try {
      const startTime = Date.now();
      
      // Initialize categories
      const categories: Record<string, { count: number; items: any[] }> = {
        Person: { count: 0, items: [] },
        Photograph: { count: 0, items: [] },
        Article: { count: 0, items: [] },
        VideoObject: { count: 0, items: [] },
        Thing: { count: 0, items: [] },
        Place: { count: 0, items: [] },
        CreativeWork: { count: 0, items: [] }
      };

      // If type is specified, we only need to search that category
      if (type) {
        const [data, stats] = await client.search({ query, type, count });
        if (data?.items) {
          categories[type] = {
            count: stats.total,
            items: processSearchResults(data.items)
          };
        }
      } else {
        // For general searches, use the search_reducer approach
        try {
          // First, do a small preliminary search to determine category distribution
          const [previewData, previewStats] = await client.search({ query, count: 20 });
          
          if (previewData?.items && previewData.items.length > 0) {
            // Calculate content type distribution from the sample
            const typeDistribution: Record<string, number> = {};
            let totalSampled = 0;
            
            previewData.items.forEach((item: any) => {
              const itemType = item.tuple[0].class[0].split('/').pop();
              if (itemType) {
                typeDistribution[itemType] = (typeDistribution[itemType] || 0) + 1;
                totalSampled++;
              }
            });
            
            // Now distribute the count proportionally, with a minimum of 3 per type
            const searchPromises = Object.keys(categories).map(async (categoryType) => {
              try {
                // Calculate proportional count
                let typeCount = Math.ceil(count * (typeDistribution[categoryType] || 0) / totalSampled);
                
                // Ensure a minimum of 3 items per category, if available
                typeCount = Math.max(typeCount, 3);
                
                const [typeData, typeStats] = await client.search({ 
                  query, 
                  type: categoryType as any, 
                  count: typeCount
                });
                
                if (typeData?.items) {
                  categories[categoryType] = {
                    count: typeStats.total,
                    items: processSearchResults(typeData.items)
                  };
                }
              } catch (error) {
                console.error(`Error searching ${categoryType}:`, error);
              }
            });

            // Wait for all searches to complete
            await Promise.all(searchPromises);
            
            // Set approximate total counts
            if (previewStats.total) {
              const categoriesWithItems = Object.keys(categories).filter(
                cat => categories[cat].items.length > 0
              );
              
              if (categoriesWithItems.length > 0) {
                // Distribute total count proportionally
                const itemCounts = categoriesWithItems.reduce((sum, cat) => 
                  sum + categories[cat].items.length, 0
                );
                
                categoriesWithItems.forEach(cat => {
                  const proportion = categories[cat].items.length / itemCounts;
                  categories[cat].count = Math.ceil(previewStats.total * proportion);
                });
              }
            }
          } else {
            console.error("No items returned from search query");
            // Fallback to individual category searches
            const searchPromises = Object.keys(categories).map(async (categoryType) => {
              try {
                // Distribute count evenly across categories
                const typeCount = Math.ceil(count / Object.keys(categories).length);
                
                const [typeData, typeStats] = await client.search({ 
                  query, 
                  type: categoryType as any, 
                  count: typeCount
                });
                
                if (typeData?.items) {
                  categories[categoryType] = {
                    count: typeStats.total,
                    items: processSearchResults(typeData.items)
                  };
                }
              } catch (error) {
                console.error(`Error searching ${categoryType}:`, error);
              }
            });

            // Wait for all searches to complete
            await Promise.all(searchPromises);
          }
        } catch (error) {
          console.error(`Error in unfiltered search:`, error);
          
          // Fallback to the old approach - search each category individually
          const searchPromises = Object.keys(categories).map(async (categoryType) => {
            try {
              const [data, stats] = await client.search({ 
                query, 
                type: categoryType as any, 
                count: Math.ceil(count / Object.keys(categories).length) 
              });
              
              if (data?.items) {
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
      }

      // Calculate total items and processing time
      const totalItems = Object.values(categories as Record<string, { count: number }>)
          .reduce((sum: number, cat: { count: number }) => sum + cat.count, 0);
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

      return {
        content: [{ 
          type: "text", 
          text: formatSearchResponse(query, categories, startTime)
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
        : (attributes['http://schema.org/name'] || attributes['http://purl.org/dc/elements/1.1/title'] || 'Untitled'),
      type,
      description: attributes['http://purl.org/dc/elements/1.1/description'] || null,
      url: processUrl(item.tuple[0].id),
      date: attributes['http://schema.org/dateCreated'] || attributes['http://purl.org/dc/elements/1.1/date'] || null,
      creator: attributes['http://schema.org/creator'] || attributes['http://purl.org/dc/elements/1.1/creator'] || null,
      language: attributes['http://schema.org/inLanguage'] || attributes['http://purl.org/dc/elements/1.1/language'] || null,
      webpageUrl: attributes['http://purl.org/dc/elements/1.1/source'] || null
    };

    // Add media-specific attributes for photos and videos
    if (type === 'Photograph' || type === 'VideoObject' || type === 'CreativeWork') {
      // Extract the best available image URL
      const imageUrl = extractImageUrl(attributes);
      const thumbnailUrl = attributes['http://schema.org/thumbnail'];

      return {
        ...result,
        imageUrl: imageUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        mimeType: attributes['http://schema.org/encodingFormat'] || null,
        width: attributes['http://schema.org/width'] || null,
        height: attributes['http://schema.org/height'] || null,
        duration: type === 'VideoObject' ? attributes['http://schema.org/duration'] || null : undefined,
        license: attributes['http://schema.org/license'] || null,
        keywords: attributes['http://schema.org/keywords'] || [],
        copyrightHolder: attributes['http://schema.org/copyrightHolder'] || null,
        source: {
          name: attributes['http://schema.org/provider']?.[0] || attributes['http://purl.org/dc/elements/1.1/publisher'] || 'Oorlogsbronnen',
          url: result.webpageUrl || result.url
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
    
    // Add book-specific attributes
    if (type === 'Book') {
      return {
        ...result,
        author: attributes['http://purl.org/dc/elements/1.1/creator'] || null,
        publisher: attributes['http://purl.org/dc/elements/1.1/publisher'] || null,
        subject: attributes['http://purl.org/dc/elements/1.1/subject'] || [],
        language: attributes['http://purl.org/dc/elements/1.1/language'] || null
      };
    }

    return result;
  });
}

// Helper function to extract the best available image URL
function extractImageUrl(attributes: any) {
  // First try schema.org image attributes
  const directImageUrl = attributes['http://schema.org/image'] || 
                       attributes['http://schema.org/contentUrl'];
  if (directImageUrl) {
    return directImageUrl;
  }
  
  // Try thumbnail as a fallback
  const thumbnailUrl = attributes['http://schema.org/thumbnail'];
  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  // Try to extract from source URL if it's from a known image bank
  const sourceUrl = attributes['http://purl.org/dc/elements/1.1/source'];
  if (sourceUrl) {
    // Extract media ID from beeldbankwo2.nl URLs
    if (sourceUrl.includes('beeldbankwo2.nl')) {
      const mediaId = sourceUrl.match(/\/media\/([a-f0-9-]+)/)?.[1];
      if (mediaId) {
        return `https://images.memorix.nl/niod/thumb/1000x1000/${mediaId}.jpg`;
      }
    }
    // Extract media ID from cultureelerfgoed.nl URLs
    else if (sourceUrl.includes('cultureelerfgoed.nl')) {
      const mediaId = sourceUrl.match(/\/media\/([a-f0-9-]+)/)?.[1];
      if (mediaId) {
        return `https://images.memorix.nl/rce/thumb/1000x1000/${mediaId}.jpg`;
      }
    }
    // Extract from collectiegelderland.nl URLs
    else if (sourceUrl.includes('collectiegelderland.nl')) {
      // Try to use thumbnail directly from the attributes if available
      return attributes['http://schema.org/thumbnail'];
    }
  }

  return null;
}

// Helper function to format the response for better presentation
function formatSearchResponse(query: string, categories: any, startTime: number) {
  let response = `# Search Results for "${query}"\n\n`;
  
  // Calculate total items and processing time
  const totalItems = Object.values(categories as Record<string, { count: number }>)
      .reduce((sum: number, cat: { count: number }) => sum + cat.count, 0);
  const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  response += `Found ${totalItems} items in ${processingTime} seconds.\n\n`;
  
  // Add tip about content type filtering when many results are returned
  if (totalItems > 10) {
    const categoriesWithResults = Object.entries(categories)
      .filter(([_, data]) => (data as { count: number }).count > 0)
      .map(([category, data]) => `${category} (${(data as { count: number }).count})`)
      .join(', ');
    
    response += `**Tip:** You can filter these results by adding a content type parameter:\n`;
    response += `Available types: ${categoriesWithResults}\n\n`;
    response += `Example: \`{ "query": "${query}", "type": "Photograph" }\`\n\n`;
  }
  
  // Add results by category
  for (const [category, data] of Object.entries(categories)) {
    if ((data as { count: number }).count > 0) {
      response += `## ${category} (${(data as { count: number }).count} items)\n\n`;
      (data as { items: any[] }).items.forEach((item: any, index: number) => {
        response += `### ${index + 1}. ${item.title}\n`;
        if (item.description) {
          response += `${item.description}\n\n`;
        }
        
        // Add source links
        if (item.webpageUrl) {
          response += `[View Original Source](${item.webpageUrl})\n`;
        }
        response += `[View on Oorlogsbronnen](${item.url})\n`;
        
        // Add image if available
        if (item.imageUrl) {
          response += `\n![Image](${item.imageUrl})\n`;
        } else if (item.thumbnailUrl) {
          response += `\n![Thumbnail](${item.thumbnailUrl})\n`;
        }
        
        // Add additional metadata
        if (item.creator) {
          response += `\nCreator: ${item.creator}\n`;
        }
        if (item.date) {
          response += `Date: ${item.date}\n`;
        }
        if (item.copyrightHolder) {
          response += `Copyright: ${item.copyrightHolder}\n`;
        }
        
        response += '\n';
      });
    }
  }
  
  return response;
}

// Start the server with proper error handling
try {
    const transport = new StdioServerTransport();
    
    // Log startup for debugging
    process.stderr.write('Starting server...\n');
    
    await server.connect(transport);
    
    // Log successful connection
    process.stderr.write('Server initialized and connected\n');
    
    // Handle process termination
    const cleanup = () => {
        process.stderr.write('Server shutting down...\n');
        try {
            transport.close();
        } catch (error) {
            process.stderr.write(`Error during shutdown: ${error}\n`);
        }
        process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Prevent unhandled promise rejections from crashing the server
    process.on('unhandledRejection', (error: Error) => {
        process.stderr.write(`Unhandled promise rejection: ${error}\n`);
    });

} catch (error) {
    process.stderr.write(`Failed to start server: ${error}\n`);
    process.exit(1);
}

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
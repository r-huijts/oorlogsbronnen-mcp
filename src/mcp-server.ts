import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OorlogsbronnenClient, CONTENT_TYPES } from "./lib/oorlogsbronnen-api.js";

// Create an MCP server
const server = new McpServer({
  name: "oorlogsbronnen-server",
  version: "1.0.0",
  description: "An MCP server for accessing Dutch WW2 archives"
});

// Initialize the API client
const client = new OorlogsbronnenClient();

// Register resource handler
server.resource(
  "oorlogsbronnen",
  "oorlogsbronnen://{query}",
  async (uri) => {
    return {
      contents: []
    };
  }
);

// Register prompt handler
server.prompt(
  "search_help",
  "A guide for searching Dutch WW2 archives",
  async () => {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: "To search the Dutch WW2 archives, you can use the search_ww2_nl_archives tool with various parameters:\n" +
                  "- query: Your search term (e.g., 'Anne Frank', 'Rotterdam bombing')\n" +
                  "- type: Filter by content type (person, photo, article, etc.)\n" +
                  "- count: Number of results to return (1-100)"
          }
        }
      ]
    };
  }
);

// Register search tool
server.tool(
  "search_ww2_nl_archives",
  "A powerful search tool for querying World War II archives in the Netherlands. Use this tool to find historical documents, photographs, personal accounts, and other materials from 1940-1945. Ideal for researching specific events, people, places, or organizations during the war period.",
  {
    query: z.string().describe(
      "The main search term or phrase to look for in the archives. Can include names (e.g., 'Anne Frank'), " +
      "places (e.g., 'Rotterdam'), dates (e.g., '1940-1945'), events (e.g., 'February Strike 1941'), " +
      "or any combination of these."
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
  async ({ query, type, count }) => {
    try {
      const [data, stats] = await client.search({ query, type, count });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            total: stats.total,
            results: data.items.map(item => {
              const attributes = item.tuple[0].attributes;
              return {
                id: item.tuple[0].id,
                title: Array.isArray(attributes['http://schema.org/name']) 
                  ? attributes['http://schema.org/name'][0] 
                  : attributes['http://schema.org/name'] || 'Untitled',
                type: item.tuple[0].class[0].split('/').pop() || 'unknown',
                description: attributes['http://purl.org/dc/elements/1.1/description'],
                url: `https://www.oorlogsbronnen.nl/record/${item.tuple[0].id}`
              };
            })
          }, null, 2)
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [{ 
          type: "text", 
          text: `Error performing search: ${errorMessage}`
        }]
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport); 
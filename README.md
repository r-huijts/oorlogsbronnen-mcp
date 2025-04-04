# Oorlogsbronnen MCP Server

A Model Context Protocol (MCP) server that provides AI-powered access to the Oorlogsbronnen (War Sources) database. This server enables natural language interactions with historical World War II archives from the Netherlands.

## Natural Language Interaction Examples

Ask your AI assistant questions like these to explore Dutch WWII history:

- **"What happened during the bombing of Rotterdam in May 1940?"**
- **"Tell me about Anne Frank's life in hiding based on historical records."**
- **"Show me photographs of the Dutch Hunger Winter of 1944-1945."**
- **"Were any of my ancestors imprisoned in Camp Vught during the war?"**
- **"I'm visiting Arnhem next week. What historical sites related to Operation Market Garden should I see?"**
- **"Find information about resistance activities in Utrecht during the Nazi occupation."**
- **"What was daily life like for Jewish families in Amsterdam before deportations began?"**
- **"Show me firsthand accounts from people who witnessed the liberation of the Netherlands in 1945."**
- **"What records exist about children who were hidden by Dutch families during the war?"**
- **"I'm researching the impact of WWII on Dutch infrastructure. Can you find documents about the reconstruction of bridges and railways?"**

## Features

- 🔍 Natural language search across the Oorlogsbronnen database
- 🏷️ Filter results by content type (person, photo, article, etc.)
- 📊 Control the number of results returned
- 🤖 AI-friendly JSON responses for further processing

## Installation

You can install this server in two ways:

### 1. Using Claude Desktop with NPX Package

Update your Claude configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "oorlogsbronnen-server": {
      "command": "npx",
      "args": [
        "-y",
        "oorlogsbronnen-mcp"
      ]
    }
  }
}
```

After updating the configuration, restart Claude Desktop for the changes to take effect.

### 2. From Source

1. Clone this repository:
```bash
git clone https://github.com/r-huijts/oorlogsbronnen-mcp.git
cd oorlogsbronnen-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure Claude Desktop by updating your configuration file (located at `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "oorlogsbronnen-server": {
      "command": "node",
      "args": [
        "/absolute/path/to/oorlogsbronnen-mcp/dist/mcp-server.js"
      ]
    }
  }
}
```

Replace `/absolute/path/to/oorlogsbronnen-mcp` with the actual path to your installation.

## Usage Examples

The MCP server understands natural language queries and can help you explore World War II archives. Here are some example queries you can use with Claude:

### Basic Searches

- "Use search_ww2_nl_archives to find documents about the resistance movement in Amsterdam"
- "Search the Dutch WW2 archives for information about Jewish refugees in 1942"
- "Look through the Netherlands war archives for records of Allied bombing raids"

### Filtering by Type

- "Use search_ww2_nl_archives to show me photographs of the liberation of Rotterdam"
- "Find personal accounts in the Dutch WW2 archives about life in concentration camps"
- "Search the Netherlands war archives for newspaper articles about food shortages"

### Specific Queries

- "Search the Dutch WW2 archives for documents about Anne Frank's time in Amsterdam"
- "Use search_ww2_nl_archives to find records of the February Strike of 1941"
- "Look through the Netherlands war archives for information about Operation Market Garden"

### Research Examples

1. **Personal History Research**:
   ```
   Use search_ww2_nl_archives to find any records or documents about the Rosenberg family in Amsterdam between 1940-1945
   ```

2. **Local History**:
   ```
   Search the Dutch WW2 archives for photographs and documents about daily life in Utrecht during the occupation
   ```

3. **Military Operations**:
   ```
   Use search_ww2_nl_archives to find firsthand accounts and official reports about the Battle of the Scheldt
   ```

### Advanced Usage

You can combine different search criteria:
```
Search the Netherlands WW2 archives for photographs and personal accounts of the Dutch famine in 1944-1945, limit to 20 results
```

## API Reference

The server exposes the following MCP tool:

### search_ww2_nl_archives

A powerful search tool designed to query the Oorlogsbronnen (War Sources) database for World War II related content in the Netherlands. This tool can be used to find historical documents, photographs, personal accounts, and other archival materials from 1940-1945.

**When to use this tool:**
- Searching for specific historical events during WWII in the Netherlands
- Finding information about people, places, or organizations during the war
- Locating photographs or documents from specific time periods or locations
- Researching personal or family history related to WWII
- Finding primary sources about the Dutch resistance, occupation, or liberation
- Discovering materials about Jewish life and persecution during the war
- Researching military operations that took place in the Netherlands

Parameters:
- `query` (required): 
  - Type: string
  - Description: The main search term or phrase to look for in the archives
  - Can include: names, places, dates, events, or descriptive terms
  - Examples:
    - "Anne Frank"
    - "Rotterdam bombing 1940"
    - "Dutch resistance Amsterdam"
    - "Jewish deportation Westerbork"
    - "Operation Market Garden"

- `type` (optional):
  - Type: string
  - Description: Filter results by specific content type
  - Available types:
    - "person": Individual biographical records
    - "photo": Historical photographs
    - "article": News articles and written documents
    - "video": Video footage
    - "object": Physical artifacts and objects
    - "location": Places and geographical records
  - Use when: You need to focus on specific types of historical materials
  - Default: All types included

- `count` (optional):
  - Type: number
  - Description: Number of results to return in the response
  - Minimum: 1
  - Maximum: 100
  - Default: 10
  - Use when: You need to control the volume of returned results
  - Note: Larger numbers will provide more comprehensive results but may take longer to process

**Response Format:**
```json
{
  "results": [
    {
      "id": string,          // Unique identifier for the record
      "title": string,       // Title or name of the item
      "type": string,        // Content type (person, photo, article, etc.)
      "description": string, // Detailed description (if available)
      "url": string         // Direct link to view the item on Oorlogsbronnen
    }
  ]
}
```

**Example Queries and Their Tool Calls:**

1. Basic Historical Search:
```typescript
{
  query: "February Strike 1941",
  type: "article",
  count: 5
}
```

2. Person Research:
```typescript
{
  query: "Rosenberg family Amsterdam Jewish",
  type: "person",
  count: 20
}
```

3. Photo Collection Search:
```typescript
{
  query: "liberation celebrations Amsterdam Dam Square 1945",
  type: "photo",
  count: 15
}
```

**Error Handling:**
- The tool will return an error message if:
  - The query is empty or contains invalid characters
  - The specified type is not supported
  - The count is outside the valid range (1-100)
  - The API is temporarily unavailable
  - Rate limits are exceeded

**Best Practices:**
1. Start with broader searches and narrow down with specific terms
2. Use location names to focus on specific areas
3. Include dates when searching for specific events
4. Combine person names with locations for family research
5. Use type filtering to focus on specific kinds of historical materials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Oorlogsbronnen for providing access to their valuable historical archives
- The Model Context Protocol (MCP) community for enabling AI-powered interactions 
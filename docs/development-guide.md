# MCP Server Development Guide

This guide will help you create custom MCP servers for CORTEX.

## Overview

MCP (Model Context Protocol) servers enable Claude and other AI assistants to interact with external systems through a standardized protocol. Each server exposes:
- **Resources**: Read-only data sources
- **Tools**: Executable functions
- **Prompts**: Reusable prompt templates

## Basic Structure

### TypeScript MCP Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "cortex-example",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {}
  }
});

// Define tools
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "example_tool",
        description: "An example tool",
        inputSchema: {
          type: "object",
          properties: {
            input: { type: "string" }
          },
          required: ["input"]
        }
      }
    ]
  };
});

// Handle tool execution
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "example_tool") {
    return {
      content: [{
        type: "text",
        text: `Processed: ${args.input}`
      }]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Python MCP Server

```python
from mcp.server import Server, Request
from mcp.server.models import InitializationOptions
import mcp.types as types

app = Server("cortex-example")

@app.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="example_tool",
            description="An example tool",
            inputSchema={
                "type": "object",
                "properties": {
                    "input": {"type": "string"}
                },
                "required": ["input"]
            }
        )
    ]

@app.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "example_tool":
        return [types.TextContent(
            type="text",
            text=f"Processed: {arguments['input']}"
        )]

if __name__ == "__main__":
    import mcp.server.stdio
    mcp.server.stdio.run(app)
```

## CORTEX-Specific Patterns

### 1. Service Authentication

```typescript
interface CortexConfig {
  serviceUrl: string;
  apiKey?: string;
  authToken?: string;
}

class CortexMCPServer {
  private config: CortexConfig;
  
  constructor() {
    this.config = {
      serviceUrl: process.env.SERVICE_URL || 'http://localhost:8080',
      apiKey: process.env.API_KEY,
      authToken: process.env.AUTH_TOKEN
    };
  }
  
  async authenticate(): Promise<void> {
    // Implement service-specific auth
  }
}
```

### 2. Error Handling

```typescript
class CortexError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CortexError';
  }
}

// In tool handler
try {
  const result = await performOperation();
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
} catch (error) {
  if (error instanceof CortexError) {
    return {
      content: [{
        type: "text",
        text: `Error ${error.code}: ${error.message}`
      }],
      isError: true
    };
  }
  throw error;
}
```

### 3. Resource Streaming

For large datasets or real-time data:

```typescript
server.setRequestHandler("resources/read", async (request) => {
  const { uri } = request.params;
  
  if (uri.startsWith("cortex://logs/")) {
    // Stream logs
    const stream = await getLogStream();
    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: await streamToString(stream)
      }]
    };
  }
});
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from '@jest/globals';
import { CortexOrchestrator } from '../src/index';

describe('CortexOrchestrator', () => {
  it('should list workflows', async () => {
    const orchestrator = new CortexOrchestrator();
    const workflows = await orchestrator.listWorkflows();
    expect(workflows).toBeInstanceOf(Array);
  });
});
```

### Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down
```

## Deployment

### Docker Packaging

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "dist/index.js"]
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "cortex-orchestrator": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--network", "cortex_network",
        "cortex-mcp/orchestrator:latest"
      ],
      "env": {
        "N8N_HOST": "http://n8n:5678"
      }
    }
  }
}
```

## Best Practices

1. **Keep It Focused**: Each MCP server should have a single responsibility
2. **Document Tools**: Provide clear descriptions and examples
3. **Handle Errors Gracefully**: Return helpful error messages
4. **Use Environment Variables**: For configuration and secrets
5. **Version Your API**: Include version in server name
6. **Test Thoroughly**: Unit and integration tests are essential
7. **Monitor Performance**: Log execution times and errors

## Resources

- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [CORTEX Integration Examples](../examples/)
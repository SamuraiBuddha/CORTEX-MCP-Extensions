# Flowise MCP Server

MCP server for Flowise - Visual AI flow builder integration.

## Overview

This MCP server enables Claude and other AI assistants to interact with Flowise, providing capabilities to:
- List and manage AI flows
- Execute flows with input data
- Monitor flow execution status
- Retrieve flow results and logs

## Features

### Tools
- `list_flows` - List all available Flowise flows
- `get_flow` - Get details of a specific flow
- `execute_flow` - Run a flow with input data
- `get_execution_status` - Check flow execution status
- `create_flow` - Create a new flow from template
- `update_flow` - Update flow configuration

### Resources
- `flowise://flows` - List of all flows
- `flowise://flow/{id}` - Specific flow details
- `flowise://executions` - Recent executions
- `flowise://templates` - Available flow templates

## Installation

```bash
cd servers/flowise-mcp
npm install
npm run build
```

## Configuration

Set the following environment variables:

```bash
FLOWISE_HOST=http://localhost:3000
FLOWISE_API_KEY=your-api-key
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "flowise": {
      "command": "node",
      "args": ["path/to/flowise-mcp/dist/index.js"],
      "env": {
        "FLOWISE_HOST": "http://localhost:3000",
        "FLOWISE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Docker

```bash
docker build -t cortex-mcp/flowise .
docker run -e FLOWISE_HOST=http://flowise:3000 cortex-mcp/flowise
```

## Development

```bash
npm run dev  # Run with hot reload
npm test     # Run tests
npm run lint # Lint code
```

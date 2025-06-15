# cortex-orchestrator

MCP server for managing n8n workflows in the CORTEX system.

## Features

- List and search n8n workflows
- Execute workflows with parameters
- Monitor workflow execution status
- Manage workflow configurations
- Cross-machine task distribution

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables:

- `N8N_HOST`: n8n instance URL (default: http://localhost:5678)
- `N8N_API_KEY`: n8n API key for authentication
- `MACHINE_ID`: Identifier for multi-machine setup (optional)

## Usage

### Standalone
```bash
npm start
```

### With Claude Desktop
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "cortex-orchestrator": {
      "command": "node",
      "args": ["path/to/cortex-orchestrator/dist/index.js"],
      "env": {
        "N8N_HOST": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

### list_workflows
List all available n8n workflows.

```json
{
  "name": "list_workflows",
  "arguments": {
    "filter": "optional-search-term"
  }
}
```

### execute_workflow
Execute a specific workflow with parameters.

```json
{
  "name": "execute_workflow",
  "arguments": {
    "workflow_id": "workflow-id",
    "parameters": {
      "key": "value"
    }
  }
}
```

### get_workflow_status
Get the execution status of a workflow.

```json
{
  "name": "get_workflow_status",
  "arguments": {
    "execution_id": "execution-id"
  }
}
```

### dispatch_to_pipeline
Dispatch a task to a specific CORTEX pipeline.

```json
{
  "name": "dispatch_to_pipeline",
  "arguments": {
    "pipeline": "cad|code|research|data",
    "task": {
      "type": "task-type",
      "data": {}
    }
  }
}
```

## Development

```bash
# Run tests
npm test

# Run in development mode
npm run dev

# Build for production
npm run build
```
# 🔌 CORTEX MCP Extensions

Custom MCP (Model Context Protocol) servers tailored for CORTEX AI Orchestrator workflows. These extensions provide seamless integration between Claude and the CORTEX stack components.

## 🎯 Purpose

This repository contains MCP servers specifically designed to enhance CORTEX functionality:
- Direct integration with n8n workflows
- Unified monitoring across all services
- AI model routing and load balancing
- Missing service integrations (Flowise, Loki, etc.)
- Multi-machine orchestration

## 📦 Available MCP Servers

### 🚧 In Development

#### **cortex-orchestrator**
- Direct n8n workflow management
- Pipeline execution (CAD, Code, Research, Data)
- Cross-machine task distribution
- Workflow status monitoring

#### **cortex-monitoring**
- Unified metrics from Prometheus, InfluxDB, Grafana
- Custom alert aggregation
- Service health monitoring
- Performance analytics

#### **flowise-mcp**
- Flowise flow management
- AI chain execution
- Model configuration
- Flow monitoring

#### **cortex-ai-router**
- Intelligent model selection
- Load balancing across GPUs
- Performance tracking
- Cost optimization

#### **cortex-stack-manager**
- Docker stack management
- Service deployment
- Health checks
- Resource monitoring

## 🚀 Quick Start

### Installation

1. Clone this repository:
```bash
git clone https://github.com/SamuraiBuddha/CORTEX-MCP-Extensions.git
cd CORTEX-MCP-Extensions
```

2. Install dependencies:
```bash
# For TypeScript servers
cd servers/cortex-orchestrator
npm install

# For Python servers
cd servers/flowise-mcp
pip install -r requirements.txt
```

### Usage with Claude Desktop

Add to your Claude Desktop configuration (`config.json`):

```json
{
  "mcpServers": {
    "cortex-orchestrator": {
      "command": "node",
      "args": ["./servers/cortex-orchestrator/dist/index.js"],
      "env": {
        "N8N_HOST": "http://localhost:5678",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    },
    "flowise-mcp": {
      "command": "python",
      "args": ["-m", "flowise_mcp_server"],
      "env": {
        "FLOWISE_HOST": "http://localhost:3001",
        "FLOWISE_API_KEY": "${FLOWISE_API_KEY}"
      }
    }
  }
}
```

## 🏗️ Architecture

```
CORTEX-MCP-Extensions/
├── servers/                      # MCP server implementations
│   ├── cortex-orchestrator/      # n8n workflow management
│   ├── cortex-monitoring/        # Unified monitoring
│   ├── cortex-ai-router/         # AI model routing
│   ├── flowise-mcp/              # Flowise integration
│   └── cortex-stack-manager/     # Docker stack management
├── shared/                       # Shared utilities
│   ├── cortex-utils/             # Common functions
│   └── types/                    # TypeScript types
├── examples/                     # Usage examples
├── docs/                         # Documentation
└── tests/                        # Test suites
```

## 🔧 Development

### Creating a New MCP Server

1. Use the template:
```bash
./scripts/create-server.sh my-server-name
```

2. Implement your server following MCP protocol
3. Add tests
4. Update documentation

### Testing

```bash
# Run all tests
npm test

# Test specific server
npm test servers/cortex-orchestrator
```

### Building

```bash
# Build all TypeScript servers
npm run build

# Build specific server
cd servers/cortex-orchestrator && npm run build
```

## 📚 Documentation

- [MCP Server Development Guide](docs/development-guide.md)
- [CORTEX Integration Guide](docs/cortex-integration.md)
- [API Reference](docs/api-reference.md)
- [Examples](examples/README.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Priority Areas
1. Completing cortex-orchestrator for n8n integration
2. Building flowise-mcp server
3. Creating monitoring aggregation tools
4. Improving multi-machine coordination

## 🔗 Related Projects

- [CORTEX-AI-Orchestrator-v2](https://github.com/SamuraiBuddha/CORTEX-AI-Orchestrator-v2) - Main CORTEX project
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP documentation
- [Docker MCP Servers](https://github.com/docker/mcp-servers) - Official MCP servers

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

**Created by**: Jordan Paul Ehrig (SamuraiBuddha)  
**Company**: Ehrig BIM & IT Consultation, Inc.
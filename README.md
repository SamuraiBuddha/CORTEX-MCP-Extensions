# 🔌 CORTEX MCP Extensions

Custom MCP (Model Context Protocol) servers that provide Claude with direct access to CORTEX infrastructure. These extensions enable Claude to interact with services, trigger workflows, and monitor the CORTEX ecosystem.

## 🎯 Purpose & Clarification

**What this repository IS:**
- MCP servers that give Claude direct access to CORTEX services
- Tools deployed to Terramaster NAS for centralized Claude memory
- Single-point integration for all Claude instances across Magi machines
- Complementary to (not replacement for) n8n orchestration

**What this repository is NOT:**
- Not the main orchestration system (that's CORTEX-AI-Orchestrator-v2)
- Not limited to single-machine use (deployed centrally on NAS)
- Not a replacement for n8n workflows

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Terramaster NAS                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           CORTEX MCP Extensions (This Repo)         │  │
│  │                                                     │  │
│  │  • cortex-orchestrator-mcp (trigger n8n workflows) │  │
│  │  • cortex-monitoring-mcp (unified metrics)         │  │
│  │  • flowise-mcp (AI flow management)                │  │
│  │  • cortex-ai-router (model selection)              │  │
│  │  • cortex-stack-manager (Docker management)        │  │
│  └──────────────────┬──────────────────────────────────┘  │
│                     │ MCP Protocol                          │
└─────────────────────┼───────────────────────────────────────┘
                      │
     ┌────────────────┴────────────────┬─────────────────────┐
     │                                 │                     │
┌────┴─────┐                    ┌─────┴────┐         ┌──────┴───┐
│ Claude   │                    │ Claude   │         │ Claude   │
│Desktop   │                    │Desktop   │         │Desktop   │
│Melchior  │                    │Balthasar │         │ Caspar   │
└──────────┘                    └──────────┘         └──────────┘
```

## 📦 Available MCP Servers

### 🚧 In Development

#### **cortex-orchestrator**
- **Purpose**: Allow Claude to trigger n8n workflows
- **NOT**: An n8n replacement or workflow engine
- **Features**:
  - List available n8n workflows
  - Trigger workflow execution
  - Monitor workflow status
  - Pass parameters to workflows
- **Use Case**: "Claude, run the CAD processing pipeline for this file"

#### **cortex-monitoring**
- **Purpose**: Unified view of all CORTEX services
- **Features**:
  - Aggregate metrics from Prometheus, InfluxDB, Grafana
  - Service health checks across all Magi machines
  - Alert summaries and performance analytics
  - Resource usage tracking

#### **flowise-mcp**
- **Purpose**: Fill the gap (no official Flowise MCP exists)
- **Features**:
  - Manage Flowise AI flows
  - Execute chains with parameters
  - Monitor flow execution
  - Update model configurations

#### **cortex-ai-router**
- **Purpose**: Intelligent model selection and routing
- **Features**:
  - Route requests to appropriate AI models
  - Load balance across Magi GPUs
  - Track model performance and costs
  - Optimize for latency vs quality

#### **cortex-stack-manager**
- **Purpose**: Docker stack administration
- **Features**:
  - Start/stop services across machines
  - Deploy stack updates
  - Monitor resource usage
  - Health check automation

## 🚀 Deployment Strategy

### Production Deployment (Terramaster NAS)

1. **Clone to NAS**:
```bash
ssh admin@terramaster.local
cd /volume1/docker
git clone https://github.com/SamuraiBuddha/CORTEX-MCP-Extensions.git
cd CORTEX-MCP-Extensions
```

2. **Build and Deploy**:
```bash
# Build all servers
docker-compose build

# Deploy as services
docker-compose up -d
```

3. **Configure Claude Desktop on Each Magi**:
```json
{
  "mcpServers": {
    "cortex-orchestrator": {
      "command": "ssh",
      "args": ["admin@terramaster.local", 
               "docker", "exec", "-i", "cortex-mcp-orchestrator", 
               "node", "/app/dist/index.js"],
      "env": {
        "N8N_HOST": "http://terramaster.local:5678",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    },
    "cortex-monitoring": {
      "command": "ssh",
      "args": ["admin@terramaster.local", 
               "docker", "exec", "-i", "cortex-mcp-monitoring", 
               "python", "-m", "cortex_monitoring"],
      "env": {
        "PROMETHEUS_HOST": "http://terramaster.local:9090",
        "INFLUX_HOST": "http://melchior.local:8086",
        "GRAFANA_HOST": "http://terramaster.local:3000"
      }
    }
  }
}
```

### Development Setup (Local)

Follow the original Quick Start instructions for local development.

## 🔗 Relationship to CORTEX Ecosystem

1. **CORTEX-AI-Orchestrator-v2**: The main project using n8n for multi-machine orchestration
2. **CORTEX-MCP-Extensions** (This repo): MCP servers giving Claude access to trigger and monitor orchestration
3. **Magi-Windows-Deployments**: Configures the Windows machines where Claude Desktop runs
4. **homelab-infrastructure**: Defines the hardware where everything runs

### How They Work Together

```
User → Claude Desktop → MCP Extensions (on NAS) → n8n Workflows → Magi Machines
                           ↓
                   Unified Memory/State
                      (on NAS)
```

## 📋 Key Differences from Standard MCPs

1. **Centralized Deployment**: All MCP servers run on NAS, not locally
2. **Unified State**: Single knowledge graph shared across all Claude instances
3. **Multi-Machine Aware**: Can trigger workflows on any Magi machine
4. **Persistent Memory**: Survives Claude Desktop restarts

## 🔧 Development

### Creating a New MCP Server

1. Use the template:
```bash
./scripts/create-server.sh my-server-name
```

2. Consider NAS deployment from the start
3. Use shared state from Neo4j/Redis on NAS
4. Test multi-machine scenarios

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

# Build for Docker deployment
docker-compose build
```

## 📚 Documentation

- [MCP Server Development Guide](docs/development-guide.md)
- [CORTEX Integration Guide](docs/cortex-integration.md)
- [NAS Deployment Guide](docs/nas-deployment.md)
- [API Reference](docs/api-reference.md)
- [Examples](examples/README.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Priority Areas
1. Completing cortex-orchestrator for n8n workflow triggering
2. Building flowise-mcp server  
3. Creating monitoring aggregation tools
4. Implementing NAS deployment scripts

## 🔗 Related Projects

- [CORTEX-AI-Orchestrator-v2](https://github.com/SamuraiBuddha/CORTEX-AI-Orchestrator-v2) - Main CORTEX orchestration project
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP documentation
- [Docker MCP Servers](https://github.com/docker/mcp-servers) - Official MCP servers
- [Docker MCP Toolkit](https://docs.docker.com/desktop/extensions/marketplace/docker-mcp-toolkit/) - Easy MCP deployment

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

**Created by**: Jordan Paul Ehrig (SamuraiBuddha)  
**Company**: Ehrig BIM & IT Consultation, Inc.

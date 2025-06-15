import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';

interface N8nConfig {
  host: string;
  apiKey?: string;
}

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
}

interface ExecutionResult {
  executionId: string;
  status: 'success' | 'error' | 'running';
  data?: any;
}

class CortexOrchestratorServer {
  private server: Server;
  private n8nConfig: N8nConfig;
  private axiosInstance: any;

  constructor() {
    this.n8nConfig = {
      host: process.env.N8N_HOST || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY
    };

    // Configure axios instance
    this.axiosInstance = axios.create({
      baseURL: `${this.n8nConfig.host}/api/v1`,
      headers: this.n8nConfig.apiKey ? {
        'X-N8N-API-KEY': this.n8nConfig.apiKey
      } : {}
    });

    this.server = new Server(
      {
        name: "cortex-orchestrator",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_workflows",
            description: "List all available n8n workflows",
            inputSchema: {
              type: "object",
              properties: {
                filter: {
                  type: "string",
                  description: "Optional filter to search workflows"
                }
              }
            }
          },
          {
            name: "execute_workflow",
            description: "Execute a specific n8n workflow",
            inputSchema: {
              type: "object",
              properties: {
                workflow_id: {
                  type: "string",
                  description: "ID of the workflow to execute"
                },
                parameters: {
                  type: "object",
                  description: "Parameters to pass to the workflow"
                }
              },
              required: ["workflow_id"]
            }
          },
          {
            name: "get_workflow_status",
            description: "Get the execution status of a workflow",
            inputSchema: {
              type: "object",
              properties: {
                execution_id: {
                  type: "string",
                  description: "ID of the execution to check"
                }
              },
              required: ["execution_id"]
            }
          },
          {
            name: "dispatch_to_pipeline",
            description: "Dispatch a task to a specific CORTEX pipeline",
            inputSchema: {
              type: "object",
              properties: {
                pipeline: {
                  type: "string",
                  enum: ["cad", "code", "research", "data"],
                  description: "Target pipeline"
                },
                task: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    data: { type: "object" }
                  },
                  required: ["type", "data"]
                }
              },
              required: ["pipeline", "task"]
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_workflows":
            return await this.listWorkflows(args.filter);
          
          case "execute_workflow":
            return await this.executeWorkflow(args.workflow_id, args.parameters);
          
          case "get_workflow_status":
            return await this.getWorkflowStatus(args.execution_id);
          
          case "dispatch_to_pipeline":
            return await this.dispatchToPipeline(args.pipeline, args.task);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error.message}`
          }],
          isError: true
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "cortex://workflows",
            name: "CORTEX Workflows",
            description: "List of all available workflows",
            mimeType: "application/json"
          },
          {
            uri: "cortex://pipelines",
            name: "CORTEX Pipelines",
            description: "Available processing pipelines",
            mimeType: "application/json"
          }
        ]
      };
    });

    // Read resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "cortex://workflows") {
        const workflows = await this.fetchWorkflows();
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(workflows, null, 2)
          }]
        };
      }

      if (uri === "cortex://pipelines") {
        const pipelines = {
          cad: { 
            name: "CAD Pipeline", 
            status: "active",
            workflows: ["cad-import", "cad-process", "cad-export"]
          },
          code: { 
            name: "Code Pipeline", 
            status: "active",
            workflows: ["code-analyze", "code-generate", "code-deploy"]
          },
          research: { 
            name: "Research Pipeline", 
            status: "active",
            workflows: ["research-gather", "research-analyze", "research-report"]
          },
          data: { 
            name: "Data Pipeline", 
            status: "active",
            workflows: ["data-ingest", "data-transform", "data-store"]
          }
        };
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify(pipelines, null, 2)
          }]
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private async fetchWorkflows(): Promise<Workflow[]> {
    const response = await this.axiosInstance.get('/workflows');
    return response.data.data;
  }

  private async listWorkflows(filter?: string) {
    const workflows = await this.fetchWorkflows();
    
    const filtered = filter 
      ? workflows.filter(w => 
          w.name.toLowerCase().includes(filter.toLowerCase()) ||
          w.tags?.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        )
      : workflows;

    return {
      content: [{
        type: "text",
        text: JSON.stringify(filtered, null, 2)
      }]
    };
  }

  private async executeWorkflow(workflowId: string, parameters?: any) {
    const response = await this.axiosInstance.post(
      `/workflows/${workflowId}/execute`,
      parameters || {}
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          executionId: response.data.data.executionId,
          status: 'started',
          message: `Workflow ${workflowId} execution started`
        }, null, 2)
      }]
    };
  }

  private async getWorkflowStatus(executionId: string) {
    const response = await this.axiosInstance.get(`/executions/${executionId}`);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          executionId,
          status: response.data.data.finished ? 'completed' : 'running',
          startedAt: response.data.data.startedAt,
          stoppedAt: response.data.data.stoppedAt,
          data: response.data.data.data
        }, null, 2)
      }]
    };
  }

  private async dispatchToPipeline(pipeline: string, task: any) {
    // Map pipeline to specific workflow ID
    const pipelineWorkflows: Record<string, string> = {
      cad: process.env.CAD_PIPELINE_ID || 'cad-master-workflow',
      code: process.env.CODE_PIPELINE_ID || 'code-master-workflow',
      research: process.env.RESEARCH_PIPELINE_ID || 'research-master-workflow',
      data: process.env.DATA_PIPELINE_ID || 'data-master-workflow'
    };

    const workflowId = pipelineWorkflows[pipeline];
    if (!workflowId) {
      throw new Error(`Unknown pipeline: ${pipeline}`);
    }

    // Add machine ID if configured for multi-machine routing
    const machineId = process.env.MACHINE_ID;
    const taskWithMachine = machineId ? { ...task, machineId } : task;

    return await this.executeWorkflow(workflowId, {
      task: taskWithMachine,
      pipeline,
      timestamp: new Date().toISOString()
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("CORTEX Orchestrator MCP server started");
  }
}

// Start the server
const server = new CortexOrchestratorServer();
server.start().catch(console.error);
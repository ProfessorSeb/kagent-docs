# Enterprise UI

Solo Enterprise for kagent includes an interactive management UI for managing agents, tools, models, and clusters across your federated environment. The UI provides dashboards, agent chat, distributed tracing visualization, inventory management, and user profile controls.

## Accessing the UI

Three methods to access the UI:

### Custom Domain (Production)

Expose the UI on a custom domain with HTTPS (e.g., `https://kagent.myapp.com`). See the HTTPS guide for TLS setup.

### Cloud Provider LoadBalancer

```bash
export UI_ADDRESS=$(kubectl get svc -n kagent solo-enterprise-ui \
  --context $MGMT_CONTEXT \
  -o jsonpath="{.status.loadBalancer.ingress[0]['hostname','ip']}")
open ${UI_ADDRESS}
```

### Port Forwarding (Development)

```bash
kubectl port-forward service/solo-enterprise-ui -n kagent \
  --context $MGMT_CONTEXT 4000:80 &
# Open http://localhost:4000
```

## Authentication

The UI requires OIDC authentication:

- If using the **default auth IdP**, you are automatically logged in as the Admin user
- For production, configure an external IdP (Keycloak, Okta, Entra ID, or Generic OIDC)
- Users must belong to a group mapped to at least a **Reader** role

## Setup Wizard

On first login, the UI presents a setup wizard:

1. **Connected Clusters** — Review and register new workload clusters
2. **Models** — Review configured LLM models (default: `gpt-4.1-mini` from OpenAI); add new models with provider, cluster, namespace, and API key
3. **MCP Tools** — Review discovered MCP tools from tool servers (e.g., `kagent/kagent-tool-server`); add new tool servers
4. **OIDC Configuration** — Review IdP details for UI authentication
5. Click **Finish Enterprise Setup** to complete

## Dashboard

The Dashboard provides an overview of:

- Total cluster count
- Total agent count
- Total model count
- Total tool count
- **Deployed Agent tiles** — Click any tile to start chatting with that agent

## Agents Page

The Agents page lists all agents deployed across all clusters:

- View agent details (name, description, cluster, namespace)
- Click an agent tile to open the chat interface
- Chat with agents directly from the UI
- View Human-in-the-Loop approval requests during agent execution

## Tracing Page

The Tracing interface provides end-to-end trace visualization:

- **Time Range filter** — Filter spans by time window
- **Sortable trace list** — Sort by execution start time and other attributes
- **Trace detail view** with three sub-views:
  - **Execution Flow** — Interactive graph of the agent execution flow with play/stop replay
  - **Trace Tree** — Timeline of individual agents, tools, and decision points
  - **Agent Trace Details** — User input, agent output, metadata (roles, tools, token usage)

## Inventory

### Models

- View LLM models available in each cluster
- Add new models: choose cluster, namespace, provider, model, and API key
- Supported providers: OpenAI, Anthropic, Azure OpenAI, Google Gemini, Google Vertex AI, Amazon Bedrock, Ollama, BYO OpenAI-compatible

### Tools

- View all MCP tools available to agents with descriptions
- Discover tools from configured tool servers

### Tool Servers

- View tool servers providing MCP tools
- Add new tool servers with connection parameters

### Clusters

- View connected clusters with region and status filters
- Register new clusters:
  1. Click **+ Register New Cluster**
  2. Get tunnel server endpoint: `kubectl get svc -n kagent solo-enterprise-ui --context ${MGMT_CONTEXT} -o jsonpath="{.status.loadBalancer.ingress[0]['hostname','ip']}"`
  3. Paste endpoint and run generated CLI commands

## User Management

From the sidebar menu:

- View user profile (role, account, contact, activity)
- Change user role (Admin, Writer, Reader)
- Log out

### Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access to all features and user management |
| **Writer** | Create, modify, and delete agents, tools, models |
| **Reader** | View-only access to agents, tools, traces, dashboards |

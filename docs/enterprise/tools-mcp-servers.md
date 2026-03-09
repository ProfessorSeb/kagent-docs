# Tools & MCP Servers

Solo Enterprise for kagent provides multiple ways to integrate MCP (Model Context Protocol) tools with your agents: built-in tools, Kubernetes services as MCP servers, remote MCP servers, and custom-built tool servers.

## Tool Types

| Type | Description |
|------|-------------|
| **Built-in tools** | Pre-packaged tools for Kubernetes, Helm, Istio, Prometheus, Grafana, Cilium, Argo Rollouts |
| **Kubernetes Services as MCP servers** | Discover HTTP tools from OpenAPI-compliant services running in your cluster |
| **Remote MCP servers** | Connect to external MCP-compatible tool servers |
| **Custom MCP servers** | Build your own MCP tool server from scratch |
| **Agents as tools** | Reference other agents as tools for collaborative workflows |

## Built-in Tools

Solo Enterprise for kagent comes with comprehensive built-in tools:

- **Pod management and monitoring** — List, describe, get logs, exec into pods
- **Service discovery and configuration** — Query services, endpoints, configs
- **Resource listing and description** — Get/describe any Kubernetes resource
- **Log retrieval and analysis** — Retrieve and analyze pod logs
- **Helm operations** — Install, upgrade, uninstall releases; manage repositories
- **Istio operations** — Proxy status, config, analyze, install, waypoint management
- **Prometheus queries** — Instant and range PromQL queries, label discovery, target listing
- **Grafana management** — Organizations, dashboards, alerts, data sources
- **Cilium operations** — Status, install, upgrade, cluster mesh, BGP
- **Argo Rollouts** — Verify, promote, pause, set image

## Managing Tools via the UI

1. Navigate to **Inventory > Tools** to view all discovered MCP tools
2. Navigate to **Inventory > Tool Servers** to view tool server configurations
3. Click **+ Add New Tool Server** to register a new server

## Kubernetes Services as MCP Servers

Solo Enterprise for kagent can discover HTTP tools from OpenAPI-compliant services in your cluster, automatically making them available to agents. This enables agents to interact with any service that exposes an OpenAPI spec.

## Remote MCP Servers

Connect to external MCP tool servers by creating a `RemoteMCPServer` resource:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: RemoteMCPServer
metadata:
  name: my-remote-server
  namespace: kagent
spec:
  protocol: SSE  # or STREAMABLE_HTTP
  url: http://my-mcp-server:8080/sse
  headersFrom:
    - secretRef:
        name: server-auth-token
      key: Authorization
```

## Building Custom MCP Servers

You can build MCP tool servers from scratch and deploy them in your cluster. The MCP servers repository provides reference implementations.

**Important:** Verify any community servers before running them in production. Ensure user, group, and root permissions are correctly configured. Note any required commands and arguments for your `MCPServer` configuration.

## Agents as Tools

Any agent you create can be referenced and used by other agents, enabling complex workflows and agent collaboration via the A2A protocol:

```yaml
tools:
  - type: Agent
    agent:
      name: specialist-agent
      namespace: default
```

## Agentgateway Integration

In Solo Enterprise for kagent, agentgateway is built into the MCP tool servers that are created for your `MCPServer` resources. Agentgateway acts as a proxy for traffic between tool servers and agents, providing:

- Secure communication
- AccessPolicy enforcement
- Timeout and retry policies
- Network-level observability

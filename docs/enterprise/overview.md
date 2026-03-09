# Solo Enterprise for kagent — Overview

Solo Enterprise for kagent is a hardened, production-ready distribution of the open-source [kagent](https://github.com/kagent-dev/kagent) project, offered by Solo.io. It adds an enterprise management plane, advanced security, multicluster federation, and built-in observability on top of the open-source kagent control and data plane.

## Enterprise vs Open Source

| Feature | Enterprise | Open Source |
|---------|-----------|-------------|
| Built-in agents and tools | Yes | Yes |
| Agent lifecycle management | Yes | Yes |
| BYO agent support (ADK, CrewAI, LangGraph) | Yes | Yes |
| BYO MCP tool servers | Yes | Yes |
| Multicluster and federated agent support | Yes | No |
| Built-in OTel pipeline for advanced observability and distributed tracing | Yes | No |
| Interactive UI with service graph and end-to-end trace visualization | Yes | No |
| Security and access control, including OIDC and RBAC | Yes | No |
| Authorization policies for agents (AccessPolicy) | Yes | No |
| On-behalf-of (OBO) token identity propagation | Yes | No |
| Agentgateway integration for network policy enforcement | Yes | No |
| Istio ambient mesh integration for multicluster security | Yes | No |
| Specialty builds for security patches, FIPS, and compliance requirements | Yes | No |
| 24x7 production support and one-hour Sev 1 response time availability | Yes | No |

## Architecture

Solo Enterprise for kagent consists of several components that work together across a management-agent cluster topology:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Management Cluster                          │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ solo-enterprise-  │  │  OTel Gateway │  │   ClickHouse     │  │
│  │ ui (mgmt plane)  │  │  (telemetry)  │  │   (storage)      │  │
│  └──────────────────┘  └───────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌───────────────┐                        │
│  │ kagent controller │  │  Tunnel Server│                        │
│  └──────────────────┘  └───────────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│                      Tunnel (relay)                              │
├─────────────────────────────────────────────────────────────────┤
│                     Workload Cluster(s)                          │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ kagent-enterprise │  │ OTel Collector│  │  agentgateway    │  │
│  │ -agent (relay)   │  │  (telemetry)  │  │  (waypoint proxy)│  │
│  └──────────────────┘  └───────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌───────────────┐                        │
│  │   Agents (pods)  │  │ MCP Tool      │                        │
│  │                  │  │ Servers       │                        │
│  └──────────────────┘  └───────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| `solo-enterprise-ui` | Management cluster | Enterprise UI, OTel gateway, ClickHouse telemetry storage |
| `kagent controller` | Management cluster | Agent lifecycle management, OBO token generation, JWKS endpoint |
| Tunnel Server | Management cluster | Receives relay connections from workload clusters |
| `kagent-enterprise-agent` | Workload cluster(s) | Relay client, OTel collector, agent runtime |
| `agentgateway` | Workload cluster(s) | Waypoint proxy in ambient mesh, AccessPolicy enforcement |
| Istio ambient mesh | Both | mTLS, policy enforcement, multicluster connectivity |

## Helm Charts

Solo Enterprise for kagent is distributed as OCI Helm charts:

| Chart | Purpose |
|-------|---------|
| `kagent-enterprise` | Core kagent enterprise installation (agents, tools, controller) |
| `management` | Management plane components (UI, OTel gateway, ClickHouse, tunnel server) |
| `relay` | Workload cluster relay agent (tunnel client, OTel collector) |
| Gloo Operator | Lifecycle operator for Solo Enterprise components |

```bash
# Example: Install kagent-enterprise in a workload cluster
helm upgrade -i kagent \
  oci://us-docker.pkg.dev/solo-public/kagent-enterprise-helm/charts/kagent-enterprise \
  -n kagent --version 0.3.4 \
  -f values.yaml
```

## Pre-Built Agents

Solo Enterprise for kagent ships with 10 production-ready agents:

| Agent | Description |
|-------|-------------|
| `k8s-agent` | Kubernetes expert for cluster operations, troubleshooting, and maintenance |
| `helm-agent` | Helm expert for chart management and release troubleshooting |
| `istio-agent` | Istio expert for service mesh operations and troubleshooting |
| `observability-agent` | Prometheus, Grafana, and Kubernetes monitoring specialist |
| `promql-agent` | PromQL query generation from natural language |
| `argo-rollouts-conversion-agent` | Converts Kubernetes Deployments to Argo Rollouts |
| `kgateway-agent` | kgateway expert for Envoy proxy and Gateway API management |
| `cilium-debug-agent` | Cilium debugging, troubleshooting, and advanced diagnostics |
| `cilium-manager-agent` | Cilium installation, configuration, and management |
| `cilium-policy-agent` | Creates CiliumNetworkPolicy and CiliumClusterwideNetworkPolicy from natural language |

## Licensing

Solo Enterprise for kagent requires a commercial license from Solo.io. Contact your Solo account representative to obtain a license key.

## Related Solo Projects

| Project | Integration |
|---------|-------------|
| **Agentgateway** | Built into MCP tool servers; proxies traffic between tool servers and agents |
| **Solo Enterprise for agentgateway** | Installed as a waypoint proxy in ambient mesh for policy enforcement, ingress/egress, and service mesh gateway |
| **Istio ambient mesh (Solo distribution)** | Provides policy enforcement with agentgateway; enables secure multicluster agent communication |

## Documentation Index

| Document | Description |
|----------|-------------|
| [Security & Access Control](security.md) | OIDC, OBO tokens, AccessPolicy, RBAC |
| [Multicluster Federation](multicluster.md) | Management-agent relay architecture |
| [Observability](observability.md) | OTel pipeline, distributed tracing, metrics, ClickHouse |
| [Enterprise UI](enterprise-ui.md) | Dashboard, agent management, tracing visualization |
| [Agent Frameworks](agent-frameworks.md) | BYO agents with ADK, CrewAI, LangGraph |
| [Model Providers](model-providers.md) | LLM provider configuration |
| [Tools & MCP Servers](tools-mcp-servers.md) | MCP tools, K8s services as MCP servers, remote servers |
| [Installation & Operations](installation.md) | Install, upgrade, debug, uninstall |

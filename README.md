# kagent Feature Documentation

Comprehensive documentation for [kagent](https://github.com/kagent-dev/kagent) — a Kubernetes-native framework for building, deploying, and managing AI agents.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Overview](docs/overview.md) | Architecture overview and core concepts |
| [Human-in-the-Loop](docs/human-in-the-loop.md) | Tool approval workflows and the Ask User tool |
| [Git-Based Skills](docs/git-based-skills.md) | Fetching agent skills from Git repositories |
| [Agent Memory](docs/agent-memory.md) | Long-term vector-backed memory for agents |
| [Prompt Templates](docs/prompt-templates.md) | Reusable prompt fragments with Go templates |
| [Multi-Runtime Support](docs/multi-runtime.md) | Go and Python ADK runtime selection |
| [Context Management](docs/context-management.md) | Event compaction for long conversations |
| [Tools Ecosystem](docs/tools-ecosystem.md) | Built-in tools: Kubernetes, Helm, Istio, and more |
| [Agent CRD Reference](docs/agent-crd-reference.md) | Full Custom Resource Definition reference |

## Solo Enterprise for kagent (Enterprise Features)

| Document | Description |
|----------|-------------|
| [Enterprise Overview](docs/enterprise/overview.md) | Enterprise vs open source, architecture, Helm charts, pre-built agents |
| [Security & Access Control](docs/enterprise/security.md) | OIDC authentication, OBO tokens, AccessPolicy, RBAC, agentgateway |
| [Multicluster Federation](docs/enterprise/multicluster.md) | Management-agent relay architecture, tunnel, cluster registration |
| [Observability](docs/enterprise/observability.md) | Built-in OTel pipeline, distributed tracing, metrics, ClickHouse |
| [Enterprise UI](docs/enterprise/enterprise-ui.md) | Dashboard, agent chat, tracing visualization, inventory, user management |
| [Agent Frameworks (BYO)](docs/enterprise/agent-frameworks.md) | BYO agents with ADK, CrewAI, LangGraph |
| [Model Providers](docs/enterprise/model-providers.md) | OpenAI, Anthropic, Azure, Gemini, Vertex AI, Bedrock, Ollama |
| [Tools & MCP Servers](docs/enterprise/tools-mcp-servers.md) | Built-in tools, K8s services as MCP, remote MCP, custom servers |
| [Installation & Operations](docs/enterprise/installation.md) | Install, upgrade, debug, uninstall, licensing |

## About kagent

kagent is a CNCF project that enables development, deployment, and management of AI agents within Kubernetes environments. It provides:

- **Kubernetes-native agent management** via Custom Resource Definitions
- **Multi-LLM support** — OpenAI, Anthropic, Google Vertex AI, Azure OpenAI, AWS Bedrock, Ollama
- **MCP tool integration** — extensible tooling through the Model Context Protocol
- **Human-in-the-loop** — tool approval workflows and interactive user input
- **Agent-to-Agent (A2A) protocol** — multi-agent communication and coordination
- **Long-term memory** — vector-backed persistent memory with embedding search
- **Declarative configuration** — define agents, tools, and skills as YAML
- **Observability** — OpenTelemetry tracing and Prometheus metrics

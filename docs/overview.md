# kagent Architecture Overview

kagent is a Kubernetes-native framework for building AI agents. It manages the full lifecycle of agents — from definition to deployment to runtime — using Kubernetes Custom Resource Definitions (CRDs).

## Core Components

### 1. Kubernetes Controller (`go/core`)

The controller watches Agent CRDs and reconciles them into running deployments. It handles:

- Translating Agent specs into ADK configurations
- Managing init containers for skill fetching (OCI images and Git repos)
- Serving the HTTP API for the UI and CLI
- Database operations (PostgreSQL with GORM)
- Prompt template resolution from ConfigMaps

### 2. Agent Development Kit (ADK)

kagent supports two ADK runtimes:

- **Python ADK** (`python/packages/`) — Built on Google's ADK, with packages for core functionality, skills, and framework integrations (CrewAI, LangGraph, OpenAI)
- **Go ADK** (`go/adk/`) — Native Go implementation providing agent runtime, MCP support, sessions, and skill management

### 3. Web UI

A React-based frontend for:

- Creating and managing agents
- Interactive chat with agents
- Tool approval (Human-in-the-Loop)
- Memory management
- Agent configuration

### 4. CLI (`kagent`)

Command-line tool for agent management outside the UI.

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                    Web UI / CLI                  │
├─────────────────────────────────────────────────┤
│                 HTTP API (Go Core)               │
├─────────────────────────────────────────────────┤
│            Kubernetes Controller                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │  Agent    │  │  Model   │  │  Tool    │     │
│   │  CRDs    │  │  Config  │  │  Servers │     │
│   └──────────┘  └──────────┘  └──────────┘     │
├─────────────────────────────────────────────────┤
│              Agent Runtime (ADK)                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │  Python  │  │    Go    │  │   MCP    │     │
│   │  ADK     │  │   ADK    │  │  Servers │     │
│   └──────────┘  └──────────┘  └──────────┘     │
├─────────────────────────────────────────────────┤
│           Infrastructure Services                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │PostgreSQL│  │  LLM     │  │  Vector  │     │
│   │          │  │Providers │  │  Store   │     │
│   └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

## Resource Model

### Agent

The top-level resource defining an AI agent. Two types:

- **Declarative** — Fully managed by kagent. You specify the system message, model, tools, and skills. kagent handles deployment.
- **BYO (Bring Your Own)** — You provide your own agent container image. kagent manages the Kubernetes deployment.

### ModelConfig

Configures LLM provider connections:

- Provider type (OpenAI, Anthropic, Google, Azure, Bedrock, Ollama)
- API credentials (via Kubernetes Secrets)
- Model name and parameters

### Tools (MCP Servers)

Agents connect to tools through MCP (Model Context Protocol) servers. Tool servers can be:

- Built-in kagent-tools (Kubernetes, Helm, Istio, etc.)
- Custom MCP servers you deploy
- Other agents (Agent-as-tool via A2A protocol)

### Skills

Markdown-based knowledge documents loaded into agents at startup. Sourced from:

- OCI container images (`refs`)
- Git repositories (`gitRefs`)

## Communication Protocols

### A2A (Agent-to-Agent)

Agents communicate using Google's A2A protocol over HTTP/SSE. This enables:

- Multi-agent workflows where one agent delegates to another
- Streaming responses
- Task state management (`working`, `input-required`, `completed`)
- Human-in-the-loop interrupts

### MCP (Model Context Protocol)

Standard protocol for tool integration. MCP servers expose tools that agents can call. Supports:

- HTTP and SSE transports
- Tool discovery
- Structured input/output

## Supported LLM Providers

| Provider | Configuration |
|----------|--------------|
| OpenAI | API key via Secret |
| Anthropic | API key via Secret |
| Google Vertex AI | Service account credentials |
| Azure OpenAI | Endpoint + API key |
| AWS Bedrock | AWS credentials |
| Ollama | Base URL (local/remote) |

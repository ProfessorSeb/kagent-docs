# Multi-Runtime Support (Go / Python ADK)

kagent supports two Agent Development Kit (ADK) runtimes for declarative agents. You can choose between Go and Python based on your requirements.

## Overview

| Feature | Python ADK | Go ADK |
|---------|-----------|--------|
| Startup time | ~15 seconds | ~2 seconds |
| Ecosystem | Google ADK, LangGraph, CrewAI integrations | Native Go implementation |
| Resource usage | Higher (Python runtime) | Lower (compiled binary) |
| Default | Yes | No |
| Memory support | Yes | Yes |
| MCP support | Yes | Yes |
| HITL support | Yes | Yes |

## Configuration

### Python Runtime (Default)

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: python-agent
spec:
  type: Declarative
  declarative:
    runtime: python  # Default, can be omitted
    modelConfig: my-model
    systemMessage: "You are a helpful agent."
```

### Go Runtime

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: go-agent
spec:
  type: Declarative
  declarative:
    runtime: go
    modelConfig: my-model
    systemMessage: "You are a fast-starting agent."
```

## Differences

### Startup and Probing

The controller adjusts Kubernetes readiness probe timing based on runtime:

- **Go**: 2-second initial delay — the compiled binary starts almost instantly
- **Python**: 15-second initial delay — accounts for Python interpreter startup and dependency loading

### Container Image

Each runtime maps to a different container image repository. The controller automatically selects the correct image based on the `runtime` field.

### Backward Compatibility

Existing agents without a `runtime` field default to Python. No configuration changes are needed for existing deployments.

## When to Use Which

**Choose Go when:**
- Fast startup matters (autoscaling, cold starts)
- Lower resource consumption is important
- You don't need Python-specific framework integrations

**Choose Python when:**
- You need Google ADK-native features
- You want to use CrewAI, LangGraph, or OpenAI framework integrations
- You need Python-based custom tools or skills

## Go ADK Architecture

The Go ADK (`go/adk/`) provides:

- **Agent runtime** — Core agent execution loop
- **MCP client** — Model Context Protocol integration
- **Session management** — Conversation state tracking
- **Skill discovery** — Loading skills from filesystem
- **Built-in tools** — SkillsTool, BashTool, FileTools (read/write/edit)

### Go ADK Built-in Tools

| Tool | Description |
|------|-------------|
| `SkillsTool` | Discover and load skills from the skills directory |
| `BashTool` | Execute shell commands with timeout handling |
| `ReadFile` | Read file contents with line numbers and pagination |
| `WriteFile` | Write content to files (creates directories as needed) |
| `EditFile` | String replacement with ambiguity detection |

## BYO (Bring Your Own) Agents

For maximum flexibility, you can bring your own agent container:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: custom-agent
spec:
  type: BYO
  byo:
    image: myregistry/my-custom-agent:v1.0
    deployment:
      replicas: 1
      resources:
        requests:
          memory: "512Mi"
          cpu: "500m"
```

BYO agents must implement the A2A protocol endpoint for communication with the kagent platform.

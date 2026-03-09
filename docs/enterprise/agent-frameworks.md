# Agent Frameworks (BYO Agents)

Solo Enterprise for kagent supports multiple agent frameworks for bringing your own (BYO) agents. Unlike declarative agents defined entirely through kagent CRDs, BYO agents give you full control over agent logic. kagent invokes BYO agents through the A2A protocol.

## Supported Frameworks

| Framework | Description |
|-----------|-------------|
| **Google ADK** (Agent Development Kit) | Full control over agent behavior; well-suited for complex workflows and external system integration |
| **CrewAI** | Multi-agent orchestration framework for collaborative AI agents |
| **LangGraph** | Graph-based agent framework from LangChain for stateful, multi-step workflows |

## BYO Agent with ADK

### Agent Resource

Create a BYO Agent resource with your custom container image:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: basic-agent
  namespace: kagent
spec:
  description: This agent can roll a die and determine if a number is prime.
  type: BYO
  byo:
    deployment:
      image: gcr.io/solo-public/docs/test-byo-agent:latest
      cmd: "kagent-adk"
      args: ["run", "basic", "--host", "0.0.0.0", "--port", "8080"]
      env:
        - name: GOOGLE_API_KEY
          valueFrom:
            secretKeyRef:
              name: kagent-google
              key: GOOGLE_API_KEY
        - name: ADK_ALLOW_WIP_FEATURES
          value: "true"
```

### A2A Protocol Endpoint

BYO agents are exposed via the A2A protocol on port 8083 of the kagent controller:

```bash
# Port-forward the A2A endpoint
kubectl port-forward svc/kagent-controller 8083:8083 -n kagent --context $MGMT_CONTEXT

# Query the agent card
curl localhost:8083/api/a2a/kagent/basic-agent/.well-known/agent.json
```

Example agent card response:

```json
{
  "name": "basic_agent",
  "description": "This agent can roll a die and determine if a number is prime.",
  "url": "http://127.0.0.1:8083/api/a2a/kagent/basic-agent/",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text"],
  "skills": []
}
```

### Invoking BYO Agents

Three methods:

**1. Enterprise UI:**

Navigate to Agents, find your agent tile, and start chatting.

**2. kagent CLI:**

```bash
kagent invoke --agent basic-agent --task "Roll a die with 6 sides"
```

**3. A2A Host CLI:**

```bash
git clone https://github.com/a2aproject/a2a-samples.git
cd a2a-samples/samples/python/hosts/cli
uv run . --agent http://127.0.0.1:8083/api/a2a/kagent/basic-agent
```

## BYO Agent with CrewAI

CrewAI agents use the multi-agent orchestration framework. Define your CrewAI agent with a custom container image and the appropriate entry point for CrewAI's runtime.

## BYO Agent with LangGraph

LangGraph agents use LangChain's graph-based framework. Define your LangGraph agent with a custom container image and the appropriate entry point for LangGraph's runtime.

## Declarative vs BYO Agents

| Aspect | Declarative | BYO |
|--------|------------|-----|
| Definition | kagent CRDs (system message, model, tools) | Custom container image |
| Control | kagent manages behavior | You manage agent logic |
| Framework | kagent ADK | ADK, CrewAI, LangGraph, or custom |
| Protocol | Internal | A2A protocol |
| Use case | Standard agents with tools | Complex workflows, custom integrations |

## Community Agents

Solo Enterprise for kagent also references community agent examples:

- **Documentation agent** — Assists with documentation tasks
- **Slack Agent** — Integrates with Slack for messaging workflows
- **Discord Agent** — Integrates with Discord for messaging workflows

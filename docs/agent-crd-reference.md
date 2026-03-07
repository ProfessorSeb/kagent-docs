# Agent CRD Reference

Complete reference for the kagent Agent Custom Resource Definition (v1alpha2).

## Agent Resource

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: <agent-name>
  namespace: <namespace>
spec:
  type: Declarative | BYO
  declarative: <DeclarativeAgentSpec>   # Required when type=Declarative
  byo: <BYOAgentSpec>                   # Required when type=BYO
  skills: <SkillForAgent>               # Optional
  allowedNamespaces: [<string>]         # Optional, cross-namespace permissions
```

## DeclarativeAgentSpec

```yaml
declarative:
  # Runtime selection: "python" (default) or "go"
  runtime: python | go

  # LLM model configuration reference
  modelConfig: <ModelConfig-name>       # Required

  # Agent system prompt (supports Go template syntax)
  systemMessage: <string>              # Required

  # Prompt template data sources
  promptTemplate:
    dataSources:
      - configMapRef:
          name: <ConfigMap-name>

  # Tools configuration
  tools:
    - type: McpServer | Agent
      mcpServer: <McpServerTool>       # When type=McpServer
      agent: <AgentTool>               # When type=Agent

  # A2A server configuration
  a2aServer:
    enabled: <bool>
    port: <int>

  # Long-term memory
  memory:
    enabled: <bool>
    embeddingProvider:
      type: <string>                   # e.g., "OpenAI"
      model: <string>                  # e.g., "text-embedding-3-small"
      secretRef:
        name: <Secret-name>

  # Context management
  context:
    eventsCompaction:
      enabled: <bool>

  # Deployment configuration
  deployment: <SharedDeploymentSpec>
```

## McpServerTool

```yaml
mcpServer:
  name: <string>                       # MCP server name (required)
  toolNames:                           # List of tools to enable
    - <tool-name>
  requireApproval:                     # Tools requiring user approval
    - <tool-name>                      # Must be subset of toolNames
  propagateHeaders:                    # Forward HTTP headers to MCP server
    enabled: <bool>
```

## AgentTool

```yaml
agent:
  name: <string>                       # Agent resource name (required)
  namespace: <string>                  # Namespace (defaults to same)
```

## SkillForAgent

```yaml
skills:
  # OCI image references (max 20)
  refs:
    - image: <registry/repo:tag>

  # Git repository references
  gitRefs:
    - url: <git-url>                   # Required
      ref: <branch/tag/commit>         # Required
      path: <subdirectory>             # Optional
      name: <custom-name>             # Optional

  # Shared Git authentication
  gitAuthSecretRef:
    name: <Secret-name>

  # Skip TLS verification (development only)
  insecureSkipVerify: <bool>
```

## SharedDeploymentSpec

```yaml
deployment:
  replicas: <int>
  imageRegistry: <string>
  resources:
    requests:
      cpu: <string>
      memory: <string>
    limits:
      cpu: <string>
      memory: <string>
  tolerations: [<Toleration>]
  affinity: <Affinity>
  nodeSelector: <map[string]string>
  securityContext: <PodSecurityContext>
  serviceAccountName: <string>
  volumes: [<Volume>]
  volumeMounts: [<VolumeMount>]
  imagePullPolicy: <string>
  imagePullSecrets: [<LocalObjectReference>]
```

## BYOAgentSpec

```yaml
byo:
  image: <string>                      # Container image (required)
  deployment: <SharedDeploymentSpec>
```

## ModelConfig Resource

```yaml
apiVersion: kagent.dev/v1alpha2
kind: ModelConfig
metadata:
  name: <name>
spec:
  provider: OpenAI | Anthropic | Gemini | GeminiVertexAI | AnthropicVertexAI | AzureOpenAI | Bedrock | Ollama
  model: <model-name>
  apiKeySecretRef:
    name: <Secret-name>
    key: <key>                         # Key within the Secret
  # Provider-specific fields
  baseURL: <string>                    # For Ollama, custom endpoints
  azureEndpoint: <string>             # For Azure OpenAI
  region: <string>                     # For AWS Bedrock
```

## Full Example

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: openai-key
type: Opaque
stringData:
  api-key: sk-xxxxxxxxxxxx
---
apiVersion: v1
kind: Secret
metadata:
  name: git-token
type: Opaque
stringData:
  token: ghp_xxxxxxxxxxxx
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-prompts
data:
  safety: |
    Always confirm before destructive operations.
    Never expose secrets or credentials.
---
apiVersion: kagent.dev/v1alpha2
kind: ModelConfig
metadata:
  name: gpt4
spec:
  provider: OpenAI
  model: gpt-4o
  apiKeySecretRef:
    name: openai-key
    key: api-key
---
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: k8s-ops-agent
spec:
  type: Declarative
  declarative:
    runtime: python
    modelConfig: gpt4
    promptTemplate:
      dataSources:
        - configMapRef:
            name: kagent-builtin-prompts
        - configMapRef:
            name: my-prompts
    systemMessage: |
      You are {{.AgentName}}, a Kubernetes operations agent.

      {{include "kagent-builtin-prompts/safety-guardrails"}}
      {{include "my-prompts/safety"}}
      {{include "kagent-builtin-prompts/tool-usage-best-practices"}}

      Available tools: {{.ToolNames}}
      Available skills: {{.SkillNames}}
    tools:
      - type: McpServer
        mcpServer:
          name: kagent-tools
          toolNames:
            - kubectl_get
            - kubectl_describe
            - kubectl_logs
            - kubectl_delete
            - helm_list
            - helm_upgrade
          requireApproval:
            - kubectl_delete
            - helm_upgrade
      - type: Agent
        agent:
          name: monitoring-agent
    memory:
      enabled: true
      embeddingProvider:
        type: OpenAI
        model: text-embedding-3-small
    context:
      eventsCompaction:
        enabled: true
    deployment:
      replicas: 1
      resources:
        requests:
          memory: "1Gi"
          cpu: "500m"
  skills:
    refs:
      - image: ghcr.io/kagent-dev/k8s-skills:latest
    gitRefs:
      - url: https://github.com/myorg/runbooks.git
        ref: main
        path: k8s-ops
    gitAuthSecretRef:
      name: git-token
```

## RemoteMCPServer Resource

```yaml
apiVersion: kagent.dev/v1alpha2
kind: RemoteMCPServer
metadata:
  name: <name>
spec:
  protocol: SSE | STREAMABLE_HTTP
  url: <string>                        # MCP server endpoint URL
  headersFrom:                         # Auth headers from Secrets
    - secretRef:
        name: <Secret-name>
      key: <header-name>              # e.g., "Authorization"
status:
  discoveredTools: [<string>]          # Auto-populated by controller
```

## ModelProviderConfig Resource

```yaml
apiVersion: kagent.dev/v1alpha2
kind: ModelProviderConfig
metadata:
  name: <name>
spec:
  provider: OpenAI | Anthropic | Gemini | GeminiVertexAI | AnthropicVertexAI | AzureOpenAI | Bedrock | Ollama
  apiKeySecretRef:
    name: <Secret-name>
    key: <key>
  # TLS configuration (optional)
  tls:
    caCert: <string>                   # Custom CA certificate
status:
  discoveredModels: [<string>]         # Auto-populated by querying provider
  ready: <bool>
```

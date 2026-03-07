# Prompt Templates

kagent supports Go `text/template` syntax in Agent system messages, enabling composition from reusable fragments stored in ConfigMaps. This eliminates duplication across agents and provides a centralized way to manage shared prompt sections.

## Overview

Instead of duplicating safety guidelines, tool usage instructions, and operational rules in every agent, you can:
1. Store common prompt fragments in ConfigMaps
2. Reference them in Agent specs using `{{include "source/key"}}` syntax
3. Use agent context variables for dynamic interpolation

Template resolution happens during controller reconciliation — the final system message is fully expanded before reaching the agent runtime.

## Built-in Prompt Templates

kagent ships a `kagent-builtin-prompts` ConfigMap with five reusable templates:

| Template Key | Description |
|-------------|-------------|
| `skills-usage` | Instructions for discovering and using skills |
| `tool-usage-best-practices` | Best practices for tool invocation |
| `safety-guardrails` | Safety and operational guardrails |
| `kubernetes-context` | Kubernetes-specific operational context |
| `a2a-communication` | Agent-to-agent communication guidelines |

## Usage

### Basic Template Include

Reference a ConfigMap key using the `include` function:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: k8s-agent
spec:
  type: Declarative
  declarative:
    modelConfig: my-model
    promptTemplate:
      dataSources:
        - configMapRef:
            name: kagent-builtin-prompts
        - configMapRef:
            name: my-custom-prompts
    systemMessage: |
      You are a Kubernetes management agent named {{.AgentName}}.

      {{include "kagent-builtin-prompts/safety-guardrails"}}

      {{include "kagent-builtin-prompts/tool-usage-best-practices"}}

      {{include "kagent-builtin-prompts/kubernetes-context"}}

      {{include "my-custom-prompts/k8s-specific-rules"}}

      Your tools: {{.ToolNames}}
      Your skills: {{.SkillNames}}
```

### Available Template Variables

These variables are populated automatically from the Agent resource:

| Variable | Description |
|----------|-------------|
| `{{.AgentName}}` | Name of the Agent resource |
| `{{.AgentNamespace}}` | Namespace of the Agent resource |
| `{{.Description}}` | Agent description |
| `{{.ToolNames}}` | Comma-separated list of tool names |
| `{{.SkillNames}}` | Comma-separated list of skill names |

### Creating Custom Prompt Templates

Create a ConfigMap with your prompt fragments:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-custom-prompts
data:
  incident-response: |
    ## Incident Response Guidelines

    When responding to incidents:
    1. Assess the severity (P1-P4)
    2. Check affected services and dependencies
    3. Review recent deployments and changes
    4. Collect relevant logs and metrics
    5. Propose remediation steps

  code-review-rules: |
    ## Code Review Standards

    When reviewing code:
    - Check for security vulnerabilities
    - Verify error handling
    - Ensure tests are present
    - Look for performance issues
```

Reference them in your Agent:

```yaml
systemMessage: |
  You are an SRE agent for the {{.AgentNamespace}} namespace.

  {{include "my-custom-prompts/incident-response"}}

  {{include "kagent-builtin-prompts/safety-guardrails"}}
```

## How It Works

1. The controller watches ConfigMaps referenced in `promptTemplate.dataSources`
2. During reconciliation, `{{include "configmap-name/key"}}` directives are resolved
3. Template variables (`{{.AgentName}}`, etc.) are interpolated
4. The fully expanded system message is written to the ADK config
5. ConfigMap changes trigger automatic re-reconciliation

## Security Note

Only ConfigMaps are supported as data sources — Secret references were intentionally excluded to avoid the risk of leaking sensitive data into prompts that are sent to LLM providers.

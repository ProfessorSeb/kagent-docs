# Context Management

Long conversations can exceed LLM context windows. kagent provides **event compaction** to automatically summarize older messages, preserving key information while reducing token count.

## Overview

Event compaction (also called context compression) works by:
1. Monitoring the conversation event history length
2. When a threshold is reached, summarizing older events into a condensed form
3. Replacing the original events with the summary
4. Continuing the conversation with reduced context size

## Configuration

### Enable Event Compaction

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: long-conversation-agent
spec:
  type: Declarative
  declarative:
    modelConfig: my-model
    systemMessage: "You are a helpful agent for extended sessions."
    context:
      eventsCompaction:
        enabled: true
```

### Compaction Options

The `eventsCompaction` configuration supports these options:

```yaml
context:
  eventsCompaction:
    enabled: true
```

When enabled, the ADK runtime automatically handles compaction when the conversation history grows too large for the model's context window.

## How It Works

1. As the conversation progresses, events accumulate in the session history
2. When the history approaches the model's context limit, compaction triggers
3. Older events are summarized while preserving:
   - Key decisions and outcomes
   - Important tool results
   - Critical context from earlier in the conversation
4. The agent continues with the compacted history seamlessly

## Context Caching Note

Prompt caching (a separate optimization that caches the prompt prefix for faster responses) is **not** configured at the agent level. Most LLM providers enable prompt caching by default. For providers that don't (like Anthropic), this is handled at the model configuration level.

## When to Use

Enable event compaction when:
- Agents handle long-running conversations (debugging sessions, investigations)
- Agents call many tools that generate large outputs
- You want to support extended interactions without hitting context limits

You may not need it for:
- Short, single-turn interactions
- Agents with small tool sets that generate compact outputs

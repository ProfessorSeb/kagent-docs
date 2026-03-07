# Agent Memory

kagent provides long-term memory for agents using vector similarity search. Agents can automatically save and retrieve relevant context across conversations, enabling them to learn from past interactions.

## Overview

Memory in kagent is:
- **Vector-backed** — Uses embedding models to encode memories as 768-dimensional vectors
- **Searchable** — Retrieves relevant memories via cosine similarity
- **Automatic** — Extracts and saves memories periodically without explicit user action
- **Time-bounded** — Memories expire after a configurable TTL (default 15 days)

## Supported Storage Backends

| Backend | Description |
|---------|-------------|
| **pgvector** (PostgreSQL) | Full-featured vector search using the pgvector extension |
| **Turso/libSQL** (SQLite) | Lightweight alternative using SQLite-compatible storage |

## Configuration

### Enable Memory on an Agent

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: memory-agent
spec:
  type: Declarative
  declarative:
    modelConfig: my-model
    systemMessage: "You are a helpful assistant with long-term memory."
    memory:
      enabled: true
      embeddingProvider:
        type: OpenAI
        model: text-embedding-3-small
```

### Memory with Separate Embedding Provider

Use a different model for embeddings than for generation:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: memory-agent
spec:
  type: Declarative
  declarative:
    modelConfig: my-llm-model  # For generation
    systemMessage: "You are an agent that remembers."
    memory:
      enabled: true
      embeddingProvider:
        type: OpenAI
        model: text-embedding-3-small
        secretRef:
          name: openai-embedding-key
```

## How Memory Works

### Automatic Save Cycle

1. The agent processes user messages normally
2. Every 5th user message, the agent automatically extracts key information
3. Extracted memories are summarized and encoded as embedding vectors
4. Vectors are stored in the database with metadata and timestamps

### Memory Retrieval (Prefetch)

Before generating a response, the agent:
1. Encodes the current user message as an embedding vector
2. Searches stored memories by cosine similarity
3. Injects the most relevant memories into the agent's context
4. The agent uses this context to generate more informed responses

### Memory Tools

When memory is enabled, three tools are injected into the agent:

| Tool | Description |
|------|-------------|
| `save_memory` | Explicitly save a piece of information |
| `load_memory` | Search for relevant memories by query |
| `prefetch_memory` | Automatically run before response generation |

## Memory Management via UI

The web UI provides memory management through:
- **View memories** — See all stored memories for an agent
- **Clear memories** — Delete all stored memories
- **Memory indicator** — Agent cards show when memory is enabled

## Memory Management via API

The Go controller exposes REST endpoints:

```
GET    /api/memories/{agentId}         # List memories
DELETE /api/memories/{agentId}         # Clear all memories
DELETE /api/memories/{agentId}/{id}    # Delete specific memory
```

## Technical Details

- Embedding vectors are normalized to 768 dimensions
- Background TTL pruning runs periodically (default retention: 15 days)
- Memory is per-agent — each agent has its own isolated memory store
- Memories include timestamps and source session references

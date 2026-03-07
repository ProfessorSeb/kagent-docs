# Human-in-the-Loop (HITL)

kagent implements Human-in-the-Loop functionality through two mechanisms:

1. **Tool Approval** — Require user confirmation before executing sensitive tools
2. **Ask User** — Allow agents to interactively ask users questions during execution

Both features pause agent execution and wait for user input before continuing.

## Tool Approval

### Overview

Tool approval lets you mark specific tools as requiring user confirmation before execution. When an agent attempts to call an approval-required tool, execution pauses and the UI presents Approve/Reject buttons. The agent only proceeds after the user makes a decision.

This is useful for destructive or sensitive operations like:
- Deleting Kubernetes resources
- Writing files
- Executing shell commands
- Modifying infrastructure

### Configuration

Add `requireApproval` to your Agent's tool specification. The values must be a subset of `toolNames`:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: k8s-agent
spec:
  type: Declarative
  declarative:
    modelConfig: my-model
    systemMessage: "You are a Kubernetes management agent."
    tools:
      - type: McpServer
        mcpServer:
          name: filesystem-server
          toolNames:
            - read_file
            - write_file
            - delete_file
          requireApproval:
            - delete_file
            - write_file
```

In this example, `read_file` executes immediately, but `write_file` and `delete_file` will pause for user approval.

### How It Works

**Interrupt Phase:**
1. The agent calls a tool marked for approval
2. The `before_tool_callback` calls `tool_context.request_confirmation()` and blocks execution
3. The ADK generates an `adk_request_confirmation` event
4. The UI receives the event and displays approval controls

**Decision Phase:**
5. The user clicks **Approve** or **Reject** in the UI
6. Optionally, the user provides a rejection reason (free-text explanation)

**Resume Phase:**
7. The decision is sent back as an A2A message
8. **Approved** tools execute normally and return results
9. **Rejected** tools return a rejection message — the LLM sees this and responds accordingly

### Parallel Tool Approval

When an agent generates multiple tool calls simultaneously (common in kagent), all pending approvals are presented together. Users can:

- **Approve/reject individually** — Make per-tool decisions, then submit all at once
- **Batch decisions** — The UI automatically submits once all tools have a decision

The wire format supports three modes:

```json
// Uniform approval
{"decision_type": "approve"}

// Uniform rejection
{"decision_type": "deny"}

// Mixed per-tool decisions
{
  "decision_type": "batch",
  "decisions": {
    "tool_call_id_1": "approve",
    "tool_call_id_2": "deny"
  }
}
```

### Rejection Reasons

When rejecting a tool call, users can provide a free-text explanation. This reason is passed back to the LLM as context, helping it understand why the tool was blocked and adjust its approach.

The UI presents a two-step flow:
1. Click **Reject**
2. Enter a reason in the text area
3. Confirm the rejection

### Page Reload Recovery

The UI reconstructs approval states after page refreshes by scanning task history for unresolved `adk_request_confirmation` events:
- Tasks in `input-required` state show pending approval cards
- Tasks with decisions show resolved approval/rejection badges

---

## Ask User Tool

### Overview

The `ask_user` tool is a built-in tool automatically added to every agent. It allows agents to pose questions to users with optional predefined choices during execution. This is different from tool approval — here the *agent* initiates the interaction to gather information it needs.

Use cases:
- Clarifying ambiguous user requests
- Offering choices between implementation approaches
- Collecting configuration preferences
- Getting confirmation on proposed plans

### How Agents Use It

Agents call `ask_user` as a regular tool. The schema supports multiple questions, each with optional choices:

```python
ask_user(questions=[
    {
        "question": "Which database should I use?",
        "choices": ["PostgreSQL", "MySQL", "SQLite"],
        "multiple": False
    },
    {
        "question": "Which features do you want enabled?",
        "choices": ["Authentication", "Logging", "Caching"],
        "multiple": True
    },
    {
        "question": "What should the service name be?",
        "choices": [],
        "multiple": False
    }
])
```

### Question Types

| Type | Configuration | UI Rendering |
|------|--------------|--------------|
| Single-select | `choices: [...]`, `multiple: false` | Choice chips (select one) |
| Multi-select | `choices: [...]`, `multiple: true` | Choice chips (select many) |
| Free-text | `choices: []` | Text input field |

### Response Format

The user's answers are returned to the agent as structured data:

```json
[
    {"question": "Which database should I use?", "answer": ["PostgreSQL"]},
    {"question": "Which features do you want enabled?", "answer": ["Authentication", "Caching"]},
    {"question": "What should the service name be?", "answer": ["my-service"]}
]
```

### Technical Details

The ask_user tool reuses the existing HITL confirmation infrastructure:

1. The tool calls `request_confirmation()` internally, pausing execution
2. The ADK generates an `adk_request_confirmation` event with `long_running_tool_ids`
3. The UI detects `originalFunctionCall.name === "ask_user"` and renders the interactive question UI instead of standard approval cards
4. User answers are sent back as a confirmation payload
5. On re-invocation, the tool reads the payload and returns the formatted answers

No custom executor logic or protocol changes are needed — it piggybacks entirely on the approval mechanism.

### No Configuration Required

The `ask_user` tool is added unconditionally to every agent as a built-in tool. You don't need to add it to your Agent spec — it's always available.

---

## Architecture Summary

```
User ──► UI ──► A2A Message ──► Executor ──► ADK ──► Tool
                                                       │
                                              request_confirmation()
                                                       │
                                              ◄── input_required ──►
                                                       │
User ◄── UI ◄── A2A Event ◄── Executor ◄──── ADK ◄────┘
  │
  ▼ (Approve/Reject/Answer)
  │
User ──► UI ──► A2A Message ──► Executor ──► ADK ──► Tool (resumes)
```

Key design principles:
- **Deterministic replay** — Approved calls re-invoke via ADK preprocessor without additional LLM calls
- **Minimal custom logic** — The executor only handles the resume path; interrupt handling stays within ADK
- **Unified mechanism** — Both tool approval and ask_user share the same `request_confirmation` infrastructure

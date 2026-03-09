# Observability

Solo Enterprise for kagent provides a built-in OpenTelemetry (OTel) pipeline with distributed tracing, metrics, and an interactive UI for visualizing agent execution flows across federated clusters.

## Architecture

The observability stack is deployed automatically during installation:

```
┌─────────────────────────────────────────────┐
│             Management Cluster              │
│  ┌──────────────────────────────────────┐   │
│  │ solo-enterprise-ui pod               │   │
│  │  ├─ UI container                     │   │
│  │  ├─ opentelemetry-gateway container  │   │
│  │  └─ ClickHouse (telemetry storage)   │   │
│  └──────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ receives telemetry
┌──────────────────▼──────────────────────────┐
│             Workload Cluster                │
│  ┌──────────────────────────────────────┐   │
│  │ kagent-enterprise-agent pod          │   │
│  │  └─ opentelemetry-collector container│   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

| Component | Location | Role |
|-----------|----------|------|
| OTel Gateway | Management cluster (`solo-enterprise-ui` pod) | Receives telemetry from all workload cluster collectors |
| OTel Collector | Each workload cluster (`kagent-enterprise-agent` pod) | Scrapes and forwards telemetry data to the gateway |
| ClickHouse | Management cluster | Stores all telemetry data (traces, metrics) |

## Distributed Tracing

### What Traces Capture

Traces provide complete execution paths for all agent interactions, including:

- All LLM interactions (prompts sent and responses received)
- Tool invocations and their results
- Decision points the agent makes
- Cross-agent calls (A2A protocol flows)
- Cross-cluster execution paths

### Enabling Tracing

If you followed the getting started or Helm installation guides, tracing is already enabled. To enable it manually:

**Management cluster:**

```yaml
# Add to kagent Helm values
otel:
  tracing:
    enabled: true
    exporter:
      otlp:
        endpoint: solo-enterprise-ui.kagent.svc.cluster.local:4317
        insecure: true
```

```bash
helm upgrade -i kagent \
  oci://us-docker.pkg.dev/solo-public/kagent-enterprise-helm/charts/kagent-enterprise \
  --kube-context ${MGMT_CONTEXT} \
  -n kagent --version 0.3.4 \
  -f mgmt-kagent.yaml
```

**Workload cluster:**

```yaml
# Add to kagent Helm values
otel:
  tracing:
    enabled: true
    exporter:
      otlp:
        endpoint: kagent-enterprise-relay.kagent.svc.cluster.local:4317
        insecure: true
```

```bash
helm upgrade -i kagent \
  oci://us-docker.pkg.dev/solo-public/kagent-enterprise-helm/charts/kagent-enterprise \
  --kube-context ${REMOTE_CONTEXT} \
  -n kagent --version 0.3.4 \
  -f workload-kagent.yaml
```

### Reviewing Traces in the UI

1. Navigate to **Tracing** in the sidebar menu
2. Adjust the **Time Range** to filter spans
3. Sort execution traces by attributes (e.g., start time)
4. Click a trace ID to view the complete execution path

Each trace provides three views:

| View | Description |
|------|-------------|
| **Execution Flow** | Interactive graph visualization of the agent's execution flow with play/stop replay controls |
| **Trace Tree** | Detailed timeline of individual agents, tools, and decision points in the flow chain |
| **Agent Trace Details** | User input and agent output, with a Metadata toggle for roles, tools used, and token usage counts |

### Trace Pipeline

| Pipeline | Component | Description |
|----------|-----------|-------------|
| `traces/kagent` | Collector (workload) | Collects end-to-end traces for AI execution flows |
| `traces/kagent` | Gateway (management) | Receives traces and stores in ClickHouse |

## Metrics

### Control Plane Metrics

The management plane exposes metrics on port 8080:

```bash
# Port-forward to view metrics
kubectl -n kagent port-forward deployment/solo-enterprise-ui 8080 \
  --context kind-mgmt-cluster

# Open http://localhost:8080/metrics
```

| Metric | Type | Description |
|--------|------|-------------|
| `kagent_tunnel_server_tunnel_up` | Gauge | Whether the tunnel server is running in the management cluster |

### Data Plane Metrics

Each workload cluster agent exposes metrics on port 8080:

```bash
# Port-forward to view metrics
kubectl -n kagent port-forward deployment/kagent-enterprise-agent 8080 \
  --context kind-cluster-1

# Open http://localhost:8080/metrics
```

| Metric | Type | Description |
|--------|------|-------------|
| `kagent_tunnel_client_tunnel_up` | Gauge | Whether the tunnel client is running, with tunnel server IP |

## Telemetry Data Types

| Type | Collection | Storage | Description |
|------|-----------|---------|-------------|
| **Traces** | `traces/kagent` pipelines in collector and gateway | ClickHouse | Complete execution paths of all agents |
| **Metrics** | Control plane and data plane endpoints | Prometheus-compatible | Health and performance of the installation |

## OTel Configuration

View the default OTel configuration (receivers, processors, exporters):

```bash
# Management cluster
kubectl get cm kagent-enterprise-otel-config -n kagent -o yaml --context kind-mgmt-cluster

# Workload cluster
kubectl get cm kagent-enterprise-otel-config -n kagent -o yaml --context kind-cluster-1
```

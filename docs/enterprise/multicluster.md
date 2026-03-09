# Multicluster Federation

Solo Enterprise for kagent supports federated agent management across multiple Kubernetes clusters through a management-agent relay architecture. This allows you to manage agents, tools, connectivity, and observability across clusters from a single management plane.

## Architecture

The multicluster setup uses a hub-and-spoke model:

```
┌────────────────────────────────────────────┐
│            Management Cluster              │
│                                            │
│  ┌─────────────────┐  ┌────────────────┐   │
│  │ solo-enterprise- │  │ Tunnel Server  │   │
│  │ ui + OTel GW    │  │ (receives      │   │
│  │ + ClickHouse    │  │  connections)  │   │
│  └─────────────────┘  └────────────────┘   │
│  ┌─────────────────┐                       │
│  │ kagent controller│                       │
│  └─────────────────┘                       │
└──────────────┬─────────────────────────────┘
               │ Tunnel (relay)
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ Workload    │  │ Workload    │
│ Cluster 1   │  │ Cluster 2   │
│             │  │             │
│ ┌─────────┐ │  │ ┌─────────┐ │
│ │ kagent-  │ │  │ │ kagent-  │ │
│ │enterprise│ │  │ │enterprise│ │
│ │ -agent   │ │  │ │ -agent   │ │
│ │ (relay)  │ │  │ │ (relay)  │ │
│ └─────────┘ │  │ └─────────┘ │
│ ┌─────────┐ │  │ ┌─────────┐ │
│ │ OTel    │ │  │ │ OTel    │ │
│ │Collector│ │  │ │Collector│ │
│ └─────────┘ │  │ └─────────┘ │
│ ┌─────────┐ │  │ ┌─────────┐ │
│ │ Agents  │ │  │ │ Agents  │ │
│ └─────────┘ │  │ └─────────┘ │
└─────────────┘  └─────────────┘
```

## Components

### Management Cluster

| Component | Description |
|-----------|-------------|
| `solo-enterprise-ui` | Enterprise management UI, OTel gateway container, and ClickHouse telemetry storage |
| Tunnel Server | Accepts relay connections from workload clusters |
| kagent controller | Manages agent lifecycle, generates OBO tokens, serves JWKS endpoint |

### Workload Clusters

| Component | Description |
|-----------|-------------|
| `kagent-enterprise-agent` | Relay client that connects back to the management cluster tunnel server |
| OTel Collector | Collects telemetry data (traces, metrics) and sends to OTel gateway in management cluster |
| Agents | Agent pods running in the workload cluster |
| Agentgateway | Waypoint proxy for policy enforcement |

## Tunnel Architecture

The management-agent tunnel provides:

- **Secure connectivity** between management and workload clusters
- **Telemetry relay** for forwarding OTel data to the management cluster
- **Agent federation** for managing agents across clusters from a single UI

### Metrics

| Metric | Description |
|--------|-------------|
| `kagent_tunnel_server_tunnel_up` | Whether the tunnel server is running in the management cluster (gauge) |
| `kagent_tunnel_client_tunnel_up` | Whether the tunnel client is running in a workload cluster, with the tunnel server IP (gauge) |

## Registering Clusters

You can register new workload clusters through the Enterprise UI:

1. Navigate to **Inventory > Clusters** in the UI
2. Click **+ Register New Cluster**
3. Get the tunnel server endpoint from the management cluster:
   ```bash
   kubectl get svc -n kagent solo-enterprise-ui \
     --context ${MGMT_CONTEXT} \
     -o jsonpath="{.status.loadBalancer.ingress[0]['hostname','ip']}"
   ```
4. Paste the endpoint in the UI
5. Copy and run the generated commands in the CLI to connect the cluster

## OTel Telemetry Pipeline

The multicluster OTel pipeline works as follows:

1. **Workload clusters**: OTel collectors (deployed as containers in `kagent-enterprise-agent` pods) scrape telemetry data locally
2. **Relay**: Collectors send data to the OTel gateway in the management cluster via the tunnel
3. **Management cluster**: The OTel gateway (deployed as a container in the `solo-enterprise-ui` pod) receives and stores data in ClickHouse

### Default Pipelines

| Pipeline | Collector | Gateway | Description |
|----------|-----------|---------|-------------|
| `traces/kagent` | Yes | Yes | End-to-end traces for AI execution flows, visualized in the Tracing UI |

### Configuration

View the OTel configuration for each component:

```bash
# Management cluster OTel config
kubectl get cm kagent-enterprise-otel-config -n kagent -o yaml --context kind-mgmt-cluster

# Workload cluster OTel config
kubectl get cm kagent-enterprise-otel-config -n kagent -o yaml --context kind-cluster-1
```

## Multicluster Agent Communication

With Istio ambient mesh deployed across clusters, agents can communicate with each other across connected clusters securely:

- **mTLS** — Automatic mutual TLS between agents across clusters
- **Policy enforcement** — AccessPolicies apply across cluster boundaries
- **Traceable** — Cross-cluster agent interactions are captured in distributed traces

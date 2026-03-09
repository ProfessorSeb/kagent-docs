# Installation & Operations

Solo Enterprise for kagent provides a comprehensive installation process covering the management plane, workload clusters, Istio ambient mesh, and agentgateway.

## Prerequisites

Before installing, ensure you have:

- A Solo Enterprise for kagent license key (contact your Solo account representative)
- Kubernetes clusters for management and workload roles
- `helm` CLI installed
- `kubectl` CLI installed
- `kagent` CLI installed (optional, for agent invocation)

## Installation Components

The full installation includes these components in order:

| Step | Component | Description |
|------|-----------|-------------|
| 1 | **Istio ambient mesh** | Service mesh for mTLS, policy enforcement, and multicluster connectivity |
| 2 | **Solo Enterprise for agentgateway** | Waypoint proxy for agent traffic policy enforcement |
| 3 | **Solo Enterprise for kagent** | Management plane (UI, OTel, ClickHouse) and workload plane (controller, agents, tools) |

### Helm Charts

| Chart | Registry | Purpose |
|-------|----------|---------|
| `kagent-enterprise` | `oci://us-docker.pkg.dev/solo-public/kagent-enterprise-helm/charts/kagent-enterprise` | Core kagent enterprise |
| `management` | Solo Enterprise Helm registry | Management plane components |
| `relay` | Solo Enterprise Helm registry | Workload cluster relay |
| Gloo Operator | Solo Enterprise Helm registry | Lifecycle operator |

## Quick Start

The getting started guide provides a streamlined installation. For production, use the advanced install guide.

### Environment Setup

```bash
# Set kubecontexts
export MGMT_CONTEXT=<mgmt-cluster-context>
export REMOTE_CONTEXT=<workload-cluster-context>
```

### Install kagent-enterprise in a Workload Cluster

```bash
helm upgrade -i kagent \
  oci://us-docker.pkg.dev/solo-public/kagent-enterprise-helm/charts/kagent-enterprise \
  --kube-context ${REMOTE_CONTEXT} \
  -n kagent --version 0.3.4 \
  -f workload-values.yaml
```

## System Requirements

Review the system requirements page in the official docs for:

- Supported Kubernetes versions
- Minimum cluster resources (CPU, memory)
- Network requirements for multicluster connectivity
- Supported cloud providers

## Upgrade

To upgrade Solo Enterprise for kagent:

1. Review the changelog for the target version
2. Update Helm chart versions in your values files
3. Upgrade each component in order:
   - Istio ambient mesh
   - Solo Enterprise for agentgateway
   - Solo Enterprise for kagent (management cluster first, then workload clusters)

## Debugging

For troubleshooting:

1. Check pod status:
   ```bash
   kubectl get pods -n kagent --context $MGMT_CONTEXT
   kubectl get pods -n kagent --context $REMOTE_CONTEXT
   ```

2. Check tunnel connectivity:
   ```bash
   # Management cluster - tunnel server
   kubectl -n kagent port-forward deployment/solo-enterprise-ui 8080 --context $MGMT_CONTEXT
   # Check http://localhost:8080/metrics for kagent_tunnel_server_tunnel_up

   # Workload cluster - tunnel client
   kubectl -n kagent port-forward deployment/kagent-enterprise-agent 8080 --context $REMOTE_CONTEXT
   # Check http://localhost:8080/metrics for kagent_tunnel_client_tunnel_up
   ```

3. Check OTel pipeline:
   ```bash
   kubectl get cm kagent-enterprise-otel-config -n kagent -o yaml --context $MGMT_CONTEXT
   ```

4. Check agent logs:
   ```bash
   kubectl logs -n kagent deployment/kagent-controller --context $MGMT_CONTEXT
   ```

## Uninstall

To remove Solo Enterprise for kagent, uninstall components in reverse order:

1. Solo Enterprise for kagent (workload clusters, then management cluster)
2. Solo Enterprise for agentgateway
3. Istio ambient mesh

## Licensing

Solo Enterprise for kagent requires valid license keys, configured during installation:

- **Solo distribution of Istio license key** — for the ambient mesh
- **Solo Enterprise for agentgateway license key** — for the waypoint proxy

License keys are provided via Helm values or Kubernetes Secrets (`license-secret`, `agentgateway-license-keys`).

### Namespaces

| Namespace | Purpose |
|-----------|---------|
| `kagent` | Main namespace for kagent controller, agents, tools, OTel config |
| `agentgateway-system` | Agentgateway components |

## Reference

### Changelogs

- Gloo Operator changelog
- Solo Enterprise for kagent changelog

### API Reference

| API | Description |
|-----|-------------|
| kagent API | Core kagent API resources (`Agent`, `MCPServer`, `RemoteMCPServer`, `ModelConfig`) |
| Solo Enterprise for kagent CRDs | Enterprise-specific CRDs (`AccessPolicy`, and others) |
| Gloo Operator CRDs | Lifecycle operator CRDs for declarative installation management |

### Key Kubernetes Resources

| Resource | Type | Description |
|----------|------|-------------|
| `rbac-config` | ConfigMap | RBAC role-to-group mappings (CEL expressions) |
| `jwt` | Secret | RSA private key for OBO token signing |
| `license-secret` | Secret | Solo Enterprise license key |
| `agentgateway-license-keys` | Secret | Agentgateway license key |
| `kagent-enterprise-otel-config` | ConfigMap | OTel pipeline configuration (receivers, processors, exporters) |

### Helm Reference

| Chart | Sub-charts |
|-------|-----------|
| Solo Enterprise for kagent | `management`, `relay`, `kagent-enterprise` |
| Gloo Operator | Operator chart |

# Model Providers

Solo Enterprise for kagent supports a wide range of LLM providers. Models are configured per-cluster and per-namespace, and can be managed through the Enterprise UI or via Kubernetes resources.

## Supported Providers

| Provider | Auth Method | Description |
|----------|-------------|-------------|
| **OpenAI** | API key via Secret | GPT-4, GPT-4.1, GPT-4.1-mini, and other OpenAI models |
| **Anthropic (Claude)** | API key via Secret | Claude 3.5, Claude 4 family models |
| **Azure OpenAI** | Endpoint + API key | Azure-hosted OpenAI models |
| **Google Gemini** | API key via Secret | Gemini models via Google AI API |
| **Google Vertex AI** | Service account credentials | Gemini and other models via Vertex AI |
| **Amazon Bedrock** | AWS credentials | Claude, Titan, and other Bedrock models |
| **Ollama** | Base URL (local/remote) | Self-hosted open-source models |
| **BYO OpenAI-compatible** | Custom configuration | Any model with an OpenAI-compatible API |

## Managing Models

### Via Enterprise UI

1. Navigate to **Inventory > Models**
2. Click **+ Add New Model**
3. Select the cluster and namespace for deployment
4. Choose the provider and model
5. Enter your API key or authentication parameters
6. Click **Create Model**

### Via Kubernetes Resources

Create a `ModelConfig` resource:

```yaml
apiVersion: kagent.dev/v1alpha2
kind: ModelConfig
metadata:
  name: my-openai-model
  namespace: kagent
spec:
  provider: OpenAI
  model: gpt-4.1-mini
  apiKeySecretRef:
    name: openai-key
    key: api-key
```

Create the API key secret:

```bash
kubectl create secret generic openai-key -n kagent \
  --from-literal=api-key=$OPENAI_API_KEY
```

## Default Model

The getting started installation configures `kagent/default-model-config` using the `gpt-4.1-mini` model from OpenAI as the default.

## Provider-Specific Configuration

### Google Gemini (for BYO ADK agents)

```bash
# Save API key
export GOOGLE_API_KEY=your-api-key-here

# Create secret
kubectl create secret generic kagent-google -n kagent \
  --from-literal=GOOGLE_API_KEY=$GOOGLE_API_KEY \
  --dry-run=client -o yaml | kubectl apply -f -
```

Reference in BYO agent spec:

```yaml
env:
  - name: GOOGLE_API_KEY
    valueFrom:
      secretKeyRef:
        name: kagent-google
        key: GOOGLE_API_KEY
```

### Google Vertex AI

Requires a service account with appropriate IAM permissions. Configure via service account credentials rather than API keys.

### AWS Bedrock

Requires AWS credentials (access key, secret key, and region). Configure via Kubernetes secrets.

## Multicluster Model Management

Models are configured per-cluster. The Enterprise UI displays all models across all connected clusters, allowing you to:

- View which models are available in which clusters
- Add new models to specific clusters
- Manage API keys and authentication centrally

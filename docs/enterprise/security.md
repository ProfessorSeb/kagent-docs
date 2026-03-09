# Security & Access Control

Solo Enterprise for kagent provides a complete security stack: OIDC-based authentication, on-behalf-of (OBO) token identity propagation, fine-grained authorization via AccessPolicies, and network-level enforcement through agentgateway and Istio ambient mesh.

## Security Architecture

The security flow consists of three phases:

```
User ──► IdP (OIDC) ──► kagent controller ──► agentgateway ──► Agent/MCP Tool
         │                    │                    │
    1. Authenticate     2. Generate OBO       3. Enforce
       with IdP            token                AccessPolicy
```

### Phase 1: User Authentication (OIDC)

Users authenticate through an OpenID Connect (OIDC) identity provider. The kagent controller validates the user's token using the IdP's public key.

```
User ──► IdP ──► Login with credentials
IdP ──► User ──► Return signed OIDC token
User ──► kagent controller ──► API request with OIDC token
kagent controller ──► Validate token using IdP's public key
```

### Phase 2: Identity Propagation (OBO Tokens)

After validating the user's OIDC token, the kagent controller generates an on-behalf-of (OBO) token. This token represents the agent's identity acting on behalf of the user, and is used for all downstream requests that agentgateway handles.

```
kagent controller ──► Generate OBO token (signed with private RSA key)
kagent controller ──► agentgateway ──► Forward request with OBO token
agentgateway ──► kagent controller ──► Fetch JWKS from /jwks.json
agentgateway ──► Verify JWT signature & validate claims (iss, aud, exp, nbf)
```

Key details:
- The OBO token is signed by a private RSA signing key (2048-bit) you provide to kagent via a `jwt` Kubernetes Secret
- Agentgateway validates via the JWKS endpoint (`/jwks.json`) on the kagent controller
- Standard JWT claims are validated: issuer, audience, expiration, not-before
- OBO token contents include: issuer, audience (target agent), user identity (`sub`), actor identity (service account), and expiration (24 hours)
- The `X-User-ID` header is set automatically on forwarded requests

### Phase 3: Authorization (AccessPolicy)

After OBO token validation, agentgateway evaluates `AccessPolicy` resources to determine whether the request should be allowed.

AccessPolicies enforce authorization based on:
- **Subjects** — users and agents making requests
- **Targets** — agents and MCP servers being accessed

```
agentgateway ──► Check AccessPolicy
agentgateway ──► Forward request (if authorized) ──► Agent or MCP Tool
Agent/MCP Tool ──► Response ──► agentgateway ──► User
```

## Supported Identity Providers

Solo Enterprise for kagent supports the following OIDC identity providers:

| Provider | Description |
|----------|-------------|
| **Auto** | Default sample IdP for getting started; auto-configured during installation |
| **Generic OIDC** | Any OpenID Connect-compliant provider |
| **Keycloak** | Open-source identity and access management |
| **Microsoft Entra ID** | Azure Active Directory / Microsoft identity platform |
| **Okta** | Enterprise identity management |

### Default Auth IdP (Auto)

When using the default auth IdP during installation, a sample IdP is configured automatically. You can log in as the `admin` user without additional setup. This is suitable for development and getting started.

## RBAC Roles

Solo Enterprise for kagent supports role-based access control with the following roles:

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features, user management, and configuration |
| **Writer** | Create, modify, and delete agents, tools, and models |
| **Reader** | View-only access to agents, tools, traces, and dashboards |

Roles are mapped from IdP groups via the `rbac-config` ConfigMap using CEL expressions. Group claim matching is case-insensitive (supports both `Groups` and `groups` claims).

### AccessPolicy Resource

`AccessPolicy` is an enterprise-specific CRD that defines authorization rules:

- **Subjects** — Can specify users, groups, service accounts, or agents
- **Targets** — Can specify agents and MCP servers/tools
- **Action** — Allow or deny

### EnterpriseAgentgatewayPolicies

Network-level traffic policies using CEL expressions to match JWT claims, providing an additional layer of enforcement beyond AccessPolicy.

## Network Enforcement with Agentgateway

Because Solo Enterprise for agentgateway proxies traffic to agentic resources, you can set up network policies for additional security:

- **Timeouts** — Set request timeouts for agent and tool calls
- **Retries** — Configure retry policies for resilience
- **mTLS** — Automatic mutual TLS via Istio ambient mesh
- **Policy enforcement** — Agentgateway acts as a waypoint proxy in the ambient mesh

## HTTPS for the UI

Solo Enterprise for kagent supports exposing the UI with HTTPS on a custom domain (e.g., `https://kagent.myapp.com`). This involves:

- Configuring TLS certificates
- Setting up an ingress or gateway for the `solo-enterprise-ui` service
- Optionally integrating with cloud provider load balancers

## Complete Security Flow

```
1.  User ──► IdP ──► Login with credentials
2.  IdP ──► User ──► Return user's OIDC token (signed by IdP key)
3.  User ──► kagent controller ──► API request with OIDC token
4.  kagent controller ──► Validate OIDC token (using IdP public key)
5.  kagent controller ──► Generate OBO token (signed by kagent RSA key)
6.  kagent controller ──► agentgateway ──► Forward request with OBO token
7.  agentgateway ──► kagent controller ──► Fetch JWKS from /jwks.json
8.  kagent controller ──► agentgateway ──► Return kagent's public key
9.  agentgateway ──► Verify JWT signature & validate claims
10. agentgateway ──► Check AccessPolicy
11. agentgateway ──► Agent/MCP Tool ──► Forward request (if authorized)
12. Agent/MCP Tool ──► agentgateway ──► Response
13. agentgateway ──► User ──► Return response
```

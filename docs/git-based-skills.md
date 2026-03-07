# Git-Based Skills

Skills are markdown-based knowledge documents that agents load at startup. They provide domain-specific instructions, best practices, and procedures that guide agent behavior.

kagent supports two sources for skills:
- **OCI images** — Container images containing skill files (original approach)
- **Git repositories** — Clone skills directly from Git repos (new)

## Skill File Format

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: kubernetes-troubleshooting
description: Guide for diagnosing and fixing common Kubernetes issues
---

# Kubernetes Troubleshooting

## Pod Crash Loops

When a pod is in CrashLoopBackOff:

1. Check logs: `kubectl logs <pod> --previous`
2. Check events: `kubectl describe pod <pod>`
3. Verify resource limits...

## Common Patterns

...
```

The agent discovers skills automatically and can load them by name during execution.

## Git Repository Configuration

### Basic Example

```yaml
apiVersion: kagent.dev/v1alpha2
kind: Agent
metadata:
  name: my-agent
spec:
  type: Declarative
  declarative:
    modelConfig: my-model
    systemMessage: "You are a helpful agent."
    skills:
      gitRefs:
        - url: https://github.com/myorg/agent-skills.git
          ref: main
```

### With Subdirectory

If your skills are in a subdirectory of the repo:

```yaml
skills:
  gitRefs:
    - url: https://github.com/myorg/monorepo.git
      ref: main
      path: skills/kubernetes
```

### With Custom Name

Override the auto-generated skill name:

```yaml
skills:
  gitRefs:
    - url: https://github.com/myorg/agent-skills.git
      ref: v1.2.0
      name: my-custom-skills
```

### With Specific Tag or Commit

```yaml
skills:
  gitRefs:
    - url: https://github.com/myorg/agent-skills.git
      ref: v2.0.0  # Tag
    - url: https://github.com/myorg/agent-skills.git
      ref: abc1234  # Commit SHA
```

### Multiple Sources

Combine Git and OCI skills:

```yaml
skills:
  refs:
    - image: ghcr.io/myorg/k8s-skills:latest  # OCI image
  gitRefs:
    - url: https://github.com/myorg/skills-repo.git
      ref: main
    - url: https://github.com/myorg/another-repo.git
      ref: develop
      path: agent-skills
```

## Authentication

### HTTPS Token Auth

Create a Kubernetes Secret with a `token` field:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: git-credentials
type: Opaque
stringData:
  token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Reference it in your Agent:

```yaml
skills:
  gitAuthSecretRef:
    name: git-credentials
  gitRefs:
    - url: https://github.com/myorg/private-skills.git
      ref: main
```

The token is used as an HTTPS credential helper with `x-access-token` as the username. This works with GitHub Personal Access Tokens, GitLab tokens, and similar.

### SSH Key Auth

Create a Secret with an SSH private key:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: git-ssh-key
type: Opaque
stringData:
  ssh-privatekey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    ...
    -----END OPENSSH PRIVATE KEY-----
```

Reference it and use SSH URLs:

```yaml
skills:
  gitAuthSecretRef:
    name: git-ssh-key
  gitRefs:
    - url: git@github.com:myorg/private-skills.git
      ref: main
```

**Note:** A single `gitAuthSecretRef` applies to all Git repositories in the agent. All repos must use the same authentication method.

## How It Works

Under the hood, kagent uses a lightweight init container (~30MB) containing Git and krane tools:

1. Before the agent pod starts, the `skills-init` container runs
2. It clones each Git repository to the skills volume
3. It also pulls any OCI skill images
4. The agent runtime discovers skills from the mounted volume at startup

This unified init container replaces what was previously two separate containers, reducing image size from ~1GB to ~30MB.

## Security

- Subdirectory paths are validated to reject absolute paths and `..` traversal
- Shell injection is prevented through heredoc variable assignments
- Duplicate skill names across Git and OCI sources are detected and rejected

## Validation

The CRD enforces:
- At least one of `refs` or `gitRefs` must be specified (skills cannot be empty)
- Maximum 20 skill references
- `insecureSkipVerify` is available for development/testing with self-signed certs

## Skill Discovery at Runtime

Once loaded, skills are available through the built-in `SkillsTool`:

- **List skills:** The agent calls the tool with no arguments to see available skills
- **Load skill:** The agent calls the tool with a skill name to get the full content

The skill content is injected into the agent's context, guiding its behavior for specific tasks.

import { getAllDocs } from "@/lib/docs";
import Link from "next/link";

function ArchitectureDiagram() {
  return (
    <div className="relative rounded-2xl border border-border-dim bg-surface-raised p-8 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="relative">
        <h3 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-8">Architecture</h3>
        <div className="flex flex-col gap-4">
          {/* User / UI Layer */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3 rounded-xl border border-border-dim bg-surface-overlay px-6 py-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Users</div>
                <div className="text-xs text-text-muted">UI / CLI / A2A Clients</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-kagent-500/50" />
              <svg className="h-3 w-3 text-kagent-500/50" fill="currentColor" viewBox="0 0 12 12"><path d="M6 9L1 4h10z" /></svg>
            </div>
          </div>

          {/* Controller */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-kagent-500/30 bg-kagent-500/5 px-6 py-4 min-w-80">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-kagent-500/20 flex items-center justify-center">
                  <svg className="h-4 w-4 text-kagent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Kubernetes Controller</div>
                  <div className="text-xs text-text-muted">Reconciles CRDs into deployments</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Agent", "ModelConfig", "MCPServer", "RemoteMCP"].map((crd) => (
                  <span key={crd} className="text-xs px-2 py-0.5 rounded-full bg-kagent-500/10 text-kagent-300 border border-kagent-500/20">{crd}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-kagent-500/50" />
              <svg className="h-3 w-3 text-kagent-500/50" fill="currentColor" viewBox="0 0 12 12"><path d="M6 9L1 4h10z" /></svg>
            </div>
          </div>

          {/* Agent Runtimes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="text-sm font-semibold text-amber-300 mb-1">Python ADK</div>
              <div className="text-xs text-text-muted">Google ADK + FastAPI</div>
              <div className="text-xs text-text-muted">Full features, HITL</div>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="text-sm font-semibold text-cyan-300 mb-1">Go ADK</div>
              <div className="text-xs text-text-muted">2s cold start</div>
              <div className="text-xs text-text-muted">Lightweight runtime</div>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
              <div className="text-sm font-semibold text-purple-300 mb-1">BYO Agent</div>
              <div className="text-xs text-text-muted">Custom container</div>
              <div className="text-xs text-text-muted">Any framework</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-kagent-500/50" />
              <svg className="h-3 w-3 text-kagent-500/50" fill="currentColor" viewBox="0 0 12 12"><path d="M6 9L1 4h10z" /></svg>
            </div>
          </div>

          {/* Tools & Integrations */}
          <div className="rounded-xl border border-border-dim bg-surface-overlay p-4">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tools & Integrations</div>
            <div className="flex gap-2 flex-wrap">
              {["MCP Servers", "A2A Agents", "Skills (OCI)", "Skills (Git)", "Memory (pgvector)", "GitHub", "Grafana", "k8sgpt"].map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-surface text-text-secondary border border-border-dim">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ doc }: { doc: { slug: string; title: string; description: string; icon: string } }) {
  return (
    <Link
      href={`/docs/${doc.slug}`}
      className="group relative rounded-xl border border-border-dim bg-surface-raised p-6 transition-all hover:border-kagent-500/40 hover:bg-surface-overlay"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-kagent-500/10 group-hover:bg-kagent-500/20 transition-colors">
        <svg className="h-5 w-5 text-kagent-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={doc.icon} />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{doc.title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{doc.description}</p>
      <div className="mt-4 text-xs font-medium text-kagent-400 group-hover:text-kagent-300 transition-colors flex items-center gap-1">
        Read more
        <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

function ProviderGrid() {
  const providers = [
    { name: "OpenAI", color: "text-emerald-400" },
    { name: "Anthropic", color: "text-amber-400" },
    { name: "Gemini", color: "text-blue-400" },
    { name: "Azure OpenAI", color: "text-cyan-400" },
    { name: "AWS Bedrock", color: "text-orange-400" },
    { name: "Ollama", color: "text-purple-400" },
    { name: "Vertex AI", color: "text-red-400" },
    { name: "Anthropic Vertex", color: "text-yellow-400" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {providers.map((p) => (
        <div key={p.name} className="rounded-lg border border-border-dim bg-surface-raised p-3 text-center">
          <div className={`text-sm font-medium ${p.color}`}>{p.name}</div>
        </div>
      ))}
    </div>
  );
}

function PreBuiltAgents() {
  const agents = [
    { name: "k8s", desc: "Kubernetes ops" },
    { name: "helm", desc: "Chart management" },
    { name: "istio", desc: "Service mesh" },
    { name: "promql", desc: "PromQL queries" },
    { name: "observability", desc: "Monitoring" },
    { name: "argo-rollouts", desc: "Progressive delivery" },
    { name: "kgateway", desc: "Gateway API" },
    { name: "cilium-policy", desc: "Network policy" },
    { name: "cilium-manager", desc: "CNI management" },
    { name: "cilium-debug", desc: "CNI debugging" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {agents.map((a) => (
        <div key={a.name} className="rounded-lg border border-border-dim bg-surface-raised p-3">
          <div className="text-sm font-mono font-semibold text-kagent-300">{a.name}</div>
          <div className="text-xs text-text-muted mt-0.5">{a.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const docs = getAllDocs();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-kagent-600/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-kagent-600/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-kagent-500/30 bg-kagent-500/10 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-kagent-400 animate-pulse" />
              <span className="text-xs font-medium text-kagent-300">Kubernetes-Native AI Agent Framework</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6">
              Build AI agents<br />
              <span className="bg-gradient-to-r from-kagent-400 to-cyan-400 bg-clip-text text-transparent">on Kubernetes</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
              kagent manages the full lifecycle of AI agents — from CRD definition to deployment to runtime.
              Multi-runtime, multi-provider, with built-in human-in-the-loop safety.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/docs/overview" className="inline-flex items-center gap-2 rounded-lg bg-kagent-600 px-6 py-3 text-sm font-semibold text-white hover:bg-kagent-500 transition-colors">
                Read the Docs
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="/examples" className="inline-flex items-center gap-2 rounded-lg border border-border-dim bg-surface-raised px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-overlay transition-colors">
                View Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <ArchitectureDiagram />
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Features</h2>
          <p className="text-text-secondary">Everything you need to build production AI agents on Kubernetes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <FeatureCard key={doc.slug} doc={doc} />
          ))}
        </div>
      </section>

      {/* LLM Providers */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">8 LLM Providers</h2>
          <p className="text-sm text-text-secondary">Switch providers with a single CRD change</p>
        </div>
        <ProviderGrid />
      </section>

      {/* Pre-built agents */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">10 Pre-Built Agents</h2>
          <p className="text-sm text-text-secondary">Deploy specialized agents with one Helm command</p>
        </div>
        <PreBuiltAgents />
      </section>

      {/* Quick Start */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-2xl border border-border-dim bg-surface-raised p-8">
          <h2 className="text-xl font-bold text-white mb-6">Quick Start</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Install kagent", code: "helm install kagent kagent/kagent --namespace kagent-system --create-namespace" },
              { step: "2", title: "Configure a model", code: "kubectl apply -f modelconfig.yaml" },
              { step: "3", title: "Deploy an agent", code: "kubectl apply -f agent.yaml" },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-kagent-500/20 flex items-center justify-center text-xs font-bold text-kagent-400">{s.step}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white mb-1">{s.title}</div>
                  <pre className="text-xs bg-surface rounded-lg border border-border-dim p-3 overflow-x-auto"><code className="text-text-secondary">{s.code}</code></pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-dim py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-text-muted">
          kagent — Kubernetes-Native AI Agent Framework
        </div>
      </footer>
    </div>
  );
}

# Security — BostonAI.io Agent

## Threat model (v0.1)

This is a **browser-only BYOK agent**. The model runs tools against a **browser-local virtual filesystem** and a **sandboxed HTML preview**. There is no BostonAI backend that stores your API key.

### What we protect

| Control | How |
|---------|-----|
| API key hygiene | Keys live in `sessionStorage` only (tab lifetime). Never written to the VFS, never appended to chat logs, never sent except as `Authorization` to the provider you chose. |
| Workspace persistence | Generated files persist in **IndexedDB on your device only** so a refresh cannot destroy a build. Keys are never stored there, and “Reset deck” wipes it. |
| Secret redaction | Tool results and errors pass through a redactor that strips `sk-…`, Bearer tokens, and common key shapes before UI display. |
| Decision validation | Model output must be one Zod-validated JSON object: `{type:"tool"}` or `{type:"message"}`. Invalid JSON cannot invoke tools. |
| Path traversal | VFS paths are normalized; `..`, absolute drives, and null bytes are rejected. |
| Code preview isolation | Preview uses `<iframe sandbox="allow-scripts">` **without** `allow-same-origin`, so preview JS cannot read the parent page or your key. |
| No shell | There is no `execute_command` / Node spawn in the web agent. Scripts are “verified” by syntax checks and sandbox preview only. |
| Network fetches | Optional `fetch_url` is off unless the operator enables it. Private/link-local IPs and non-HTTPS are blocked (SSRF basics). |
| Completion honesty | Dino-style gates refuse `type=message` “done” claims when this run wrote no files / never previewed — stops false “already built” completions. |
| CSP | Strict Content-Security-Policy meta + Vite headers in preview/prod where possible. |

### What we do **not** claim

- The LLM can still be prompt-injected; treat model output as untrusted.
- A malicious or compromised **provider** endpoint can see your prompts and key — pick providers you trust.
- Sandboxed preview is not a perfect jail; do not paste secrets into generated HTML.
- GitHub Pages is static hosting — do not put secrets in the repo.

### Reporting

Email `hello@bostonai.io` for security issues. Do not open public issues with exploit PoCs that target users’ keys.

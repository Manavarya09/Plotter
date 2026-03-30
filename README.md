# README

## About

Wails template for Nextjs v15 with tailwindcss v4.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## New Project

You can create a new wails project using:

```
wails init -n "Your Project Name" -t https://github.com/kairo913/wails-nextjs-tailwind-template
```

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

## Installer Bootstrap Flow

On app startup, Plotter now runs a bootstrap installer flow to prepare local AI execution.

What it does:
- Checks whether Ollama is installed.
- Installs Ollama automatically when missing.
- Starts Ollama if it is not already running.
- Detects hardware (OS, CPU arch, RAM, GPU/VRAM when available).
- Selects a default model based on capability.
- Pulls the selected model if needed.
- Runs a short health-check inference.

### Model Selection Rules

- Preferred high-capability model: `llama4:latest`
- Fallback / lower-capability model: `qwen3.5:latest`

Current thresholds for choosing `llama4:latest`:
- RAM >= 16 GB, and
- GPU VRAM >= 8 GB when GPU VRAM is detectable

If `llama4:latest` pull or run fails, Plotter automatically retries with `qwen3.5:latest`.

### Idempotency

The bootstrap is safe to run repeatedly:
- Existing Ollama install is reused.
- Existing pulled models are reused.
- Existing user-selected active model is preserved.

### Troubleshooting

- Ensure outbound internet is available for first-time model pulls.
- If auto-install fails on macOS or Windows, install Ollama manually from https://ollama.com/download and restart Plotter.
- Verify Ollama is reachable at `http://localhost:11434`.
- If a model pull fails, remove partial models in Plotter model settings and relaunch.

# MCPs for agents

This folder contains Model Context Protocol (MCP) templates used to drive step-by-step (sequential) reasoning workflows for assistants used in this repo.

Files

- `sequential-thinking-copilot.mcp.json`: template tailored for Copilot-style assistants.
- `sequential-thinking-codex.mcp.json`: template tailored for OpenAI Codex-style assistants.

Usage

- Use these templates as a guideline for orchestrating multi-step edits. Typical flow:
  1. Agent runs the `understand` step to summarize context.
  2. Agent uses `decompose`/`plan` to list atomic steps.
  3. Agent executes a single `implement`/`execute-step` producing a patch.
  4. Agent runs `verify`/`test-and-check` to propose validation steps.

Notes

- Settings like `model`, `temperature` and `max_tokens` are examples — adapt to the provider you connect to.
- Persist inputs/outputs for audit and debugging when using agents in production.

<a name="readme-top"></a>

<div align="center">

# 🤖 AgentFlow

### Multi-Agent AI Orchestration Platform

*Build, run, and collaborate with autonomous AI agents — no boilerplate required.*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE-CODE)

</div>

---

## 🚀 What is AgentFlow?

**AgentFlow** is a modular, multi-agent AI orchestration platform that lets you spin up intelligent agents, connect them into collaborative workflows, and interact with them in real time — all through a clean, intuitive interface.

Whether you're building autonomous research pipelines, intelligent chat systems, or multi-step task automation, AgentFlow gives you the building blocks to get there fast.

---

## ✨ Key Features

- 🧠 **Multi-Agent Orchestration** — Compose multiple specialized agents that communicate, delegate tasks, and collaborate autonomously
- 💬 **Real-Time Chat Interface** — Interact with your agents via a responsive, streaming chat UI
- 🔧 **Agent Builder** — Design and configure agents visually without writing boilerplate
- 🌐 **MCP Tool Integration** — Equip agents with real-world tools (web browsing, code execution, file handling)
- 📡 **Telegram Bot Deployment** — Deploy agents as live Telegram bots directly from the dashboard
- 📊 **Workflow Visualizer** — See your multi-agent pipelines as interactive visual graphs
- ⚡ **Streaming Responses** — Real-time token streaming for a fluid user experience
- 🔌 **Extensible Architecture** — Plug in any LLM provider (OpenAI, Gemini, Ollama, etc.)

---

## 🏗️ Architecture

```
agentflow/
├── agentflow-app/         # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # UI components (AgentBuilder, Chat, Visualizer)
│   │   └── App.tsx
├── python/                # Core backend
│   ├── agents/            # Agent definitions and orchestration logic
│   ├── tools/             # Tool integrations (MCP, web, code exec)
│   └── api/               # FastAPI route handlers
├── multi-agent-research-system-2/  # Research pipeline module
└── run_autogen.py         # Entry point for agent execution
```

The platform follows a **layered architecture**:

| Layer | Responsibility |
|-------|---------------|
| **Agent Core** | Message passing, event-driven execution, runtime management |
| **Orchestration** | Multi-agent coordination, task routing, group workflows |
| **Tool Layer** | External integrations, MCP servers, code execution sandboxes |
| **API Layer** | FastAPI backend exposing streaming endpoints |
| **Frontend** | React SPA with real-time WebSocket/SSE communication |

---

## 📦 Installation

**Requirements:** Python 3.10+, Node.js 18+

### Backend

```bash
# Clone the repo
git clone <your-repo-url>
cd agentflow

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r python/requirements.txt
```

### Frontend

```bash
cd agentflow-app
npm install
```

---

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# LLM Provider
OPENAI_API_KEY=sk-...

# Optional: Other providers
GEMINI_API_KEY=...

# Backend
API_HOST=0.0.0.0
API_PORT=8000

# Optional: Telegram Bot
TELEGRAM_BOT_TOKEN=...
```

---

## 🏃 Running the App

### Start the Backend

```bash
# From the project root (with .venv active)
uvicorn python.api.main:app --reload --port 8000
```

### Start the Frontend

```bash
cd agentflow-app
npm run dev
# App available at http://localhost:5173
```

---

## 🧪 Quickstart: Your First Agent

```python
import asyncio
from agents import AssistantAgent, ModelClient

async def main():
    client = ModelClient(model="gpt-4o")
    agent = AssistantAgent("assistant", model_client=client)
    result = await agent.run(task="Summarize the top AI research papers from 2024.")
    print(result)
    await client.close()

asyncio.run(main())
```

### Multi-Agent Example

```python
import asyncio
from agents import AssistantAgent, AgentTool, ModelClient
from agents.ui import Console

async def main():
    client = ModelClient(model="gpt-4o")

    researcher = AssistantAgent(
        "researcher",
        model_client=client,
        system_message="You specialize in gathering and summarizing information.",
    )

    writer = AssistantAgent(
        "writer",
        model_client=client,
        system_message="You are a skilled content writer. Use the researcher's findings to produce polished output.",
        tools=[AgentTool(researcher, return_value_as_last_message=True)],
    )

    await Console(writer.run_stream(task="Write a blog post about quantum computing breakthroughs in 2024."))

asyncio.run(main())
```

### Web Browsing Agent (via MCP)

```bash
# Install Playwright MCP server first
npm install -g @playwright/mcp@latest
```

```python
import asyncio
from agents import AssistantAgent, ModelClient
from agents.tools.mcp import McpWorkbench, StdioServerParams
from agents.ui import Console

async def main():
    client = ModelClient(model="gpt-4o")
    server = StdioServerParams(command="npx", args=["@playwright/mcp@latest", "--headless"])

    async with McpWorkbench(server) as mcp:
        agent = AssistantAgent(
            "web_agent",
            model_client=client,
            workbench=mcp,
            max_tool_iterations=10,
        )
        await Console(agent.run_stream(task="Find the latest news about AI regulation in the EU."))

asyncio.run(main())
```

> ⚠️ **Security Note:** Only connect to MCP servers you trust. Malicious servers may execute arbitrary commands in your environment.

---

## 🖥️ AgentFlow Studio

The no-code visual interface lets you:
- Drag-and-drop agent creation
- Configure system prompts and tool bindings
- Run and observe multi-agent sessions live
- Export agent configs as JSON

```bash
# Run Studio (frontend dev server)
cd agentflow-app && npm run dev
```

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and write tests
4. Submit a pull request with a clear description

Please follow the existing code style and keep PRs focused on a single concern.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE-CODE](./LICENSE-CODE) for details.

---

<p align="right" style="font-size: 14px; color: #555; margin-top: 20px;">
  <a href="#readme-top" style="text-decoration: none; color: blue; font-weight: bold;">
    ↑ Back to Top ↑
  </a>
</p>

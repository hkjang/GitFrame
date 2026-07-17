# GitFrame × AI Agent Guide 🤖

> **This document** explains how to use GitFrame CLI together with AI coding agents to fully automate demo video generation from local web projects — **using nothing but natural language**.

---

## 🧭 Core Concept: AI Agents Run GitFrame For You

Because every GitFrame step is command-line driven, any AI agent equipped with shell execution + file read/write tools can perform the entire process on your behalf.

```
User (natural language request)
    ↓
AI Agent (analyze project → write gitframe.yaml → write demo.yaml → run render)
    ↓
GitFrame (build → Playwright recording → FFmpeg rendering)
    ↓
Final artifacts (MP4 video + subtitles + HTML report)
```

**All you need to do:**
> *"Generate a demo video for this project."*

---

## 🛠️ Supported AI Agents

The following agents can automate the GitFrame workflow:

| Agent | Developer | Type | Shell Exec | File I/O | Recommended |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **agy (Antigravity)** | Google DeepMind | CLI + IDE | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Claude Code** | Anthropic | CLI | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Codex CLI** | OpenAI | CLI | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Qwen Code** | Alibaba | CLI | ✅ | ✅ | ⭐⭐⭐⭐ |
| **OpenCode** | Community OSS | CLI (TUI) | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Cursor Agent** | Anysphere | IDE | ✅ | ✅ | ⭐⭐⭐ |
| **Windsurf Cascade** | Codeium | IDE | ✅ | ✅ | ⭐⭐⭐ |

---

## 🔧 Prerequisites (One-Time Setup)

Before delegating GitFrame tasks to an AI agent, ensure the following are installed locally:

```bash
# 1. Clone the GitFrame repository
git clone https://github.com/hkjang/GitFrame.git /path/to/GitFrame
cd /path/to/GitFrame

# 2. Install dependencies and compile TypeScript
npm install && npm run build

# 3. Install Playwright browser binaries
npm run install-browsers

# 4. Install system libraries (Linux/WSL required)
npx playwright install-deps
sudo apt-get install -y fonts-nanum fonts-noto-color-emoji
```

---

## 💬 Getting Started & Prompt Examples by Agent

---

### 1. 🔵 agy (Google Antigravity CLI)

**Installation**
```bash
# Antigravity CLI is distributed through Google's internal channels.
# Once installed, launch with:
agy
```

**Highlights**
- Developed by Google DeepMind; handles shell execution, file editing, web search, and image generation in a single context
- Supports a Skills system for defining custom task workflows
- Automatically handles WSL library path setup and Korean font troubleshooting

**Prompt Examples**
```
# Basic request
Generate a demo video for the project at /path/to/my-webapp.
GitFrame is located at /path/to/GitFrame.

# Specify screens and subtitle detail
Create a demo video for /path/to/admin-panel.
Focus on the dashboard, user list, and statistics pages.
Add detailed English captions for each screen.

# After video: commit and push to GitHub
After creating the video, commit it to examples/demo-videos/ in
https://github.com/myname/GitFrame.git and push.
```

---

### 2. 🟠 Claude Code (Anthropic)

**Installation**
```bash
npm install -g @anthropic-ai/claude-code
claude
```

**Highlights**
- Terminal-native agent with free-form file read/write and shell command execution
- Excellent codebase analysis for accurate route detection
- Supports `--dangerously-skip-permissions` for fully unattended automation

**Prompt Examples**
```
# After launching Claude Code
Generate a GitFrame demo video for /path/to/my-webapp.
GitFrame path: /path/to/GitFrame
Pause 10 seconds on each page and save output to the output/ folder.

# On error: request automatic retry
An error occurred during render. Check the logs, identify the cause, and retry.
```

**Non-interactive (headless) automation**
```bash
claude -p "
Generate a GitFrame demo video for /path/to/my-webapp.
GitFrame: /path/to/GitFrame, output: /path/to/my-webapp/output
" --dangerously-skip-permissions
```

---

### 3. 🟢 Codex CLI (OpenAI)

**Installation**
```bash
npm install -g @openai/codex
codex
```

**Highlights**
- Powered by OpenAI o3/o4; excels at complex multi-step tasks
- `--approval-mode full-auto` automatically approves all file/shell operations
- Supports a sandboxed mode that blocks network requests for security

**Prompt Examples**
```
# After launching Codex
Generate a GitFrame demo video for the following project:
- Project path: /path/to/my-webapp
- GitFrame path: /path/to/GitFrame
- Resolution: 1440x900
- Pause 10 seconds per page, structure 18 steps around key screens

# Fully automated mode
codex --approval-mode full-auto "
Generate a GitFrame demo video for /path/to/my-webapp.
"
```

---

### 4. 🔴 Qwen Code (Alibaba)

**Installation**
```bash
# Linux/macOS
curl -fsSL https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.sh | bash

# Or via npm
npm install -g qwen-code
qwen
```

**Highlights**
- Strong multilingual codebase analysis (CJK, Korean, Chinese, etc.)
- Supports 75+ LLM providers (OpenAI, Anthropic, Gemini, Qwen-compatible APIs)
- `@filename` syntax lets you reference local files directly as context
- Headless mode (`-p` flag) supports unattended CI/CD pipeline execution

**Prompt Examples**
```
# After launching Qwen
Generate a GitFrame demo video for /path/to/my-webapp.
Reference @/path/to/GitFrame/docs/gitframe_guide.en.md for instructions.

# Headless unattended execution
qwen -p "Generate a demo video for /path/to/my-webapp using GitFrame at /path/to/GitFrame"
```

---

### 5. ⚫ OpenCode (Open-Source Community)

**Installation**
```bash
# Official install script
curl -fsSL https://opencode.ai/install | bash

# Or via npm
npm install -g opencode-ai
opencode
```

**Highlights**
- Fully open-source terminal TUI agent (no vendor lock-in)
- Supports 75+ LLM providers — Gemini, Claude, GPT, and local Ollama models
- Agent Skills system allows custom slash commands: `/review`, `/bugfix`, `/batch`, etc.
- Official integrations for VS Code, Zed, and Neovim

**Prompt Examples**
```
# In the TUI chat window
Generate a demo video for /path/to/my-webapp using GitFrame.
GitFrame path: /path/to/GitFrame
Include subtitles and save output to the output/ folder.

# Single-shot command
opencode run "Generate a GitFrame demo video for /path/to/my-webapp"
```

---

## 📋 Universal Prompt Patterns (Works with Any Agent)

Regardless of which agent you use, these patterns get you started immediately.

### Basic
```
Generate a GitFrame demo video for [project path].
GitFrame is at [GitFrame path].
```

### Specify screens and captions
```
Create a demo video for [project path].
Key screens: dashboard, user management, settings, analytics
Pause 10–15 seconds per screen. Exclude the login page.
Write detailed English captions for each step.
```

### Control video style
```
Create a demo video for [project path].
- Intro title: "My App Platform"
- Subtitle: "Powered by GitFrame"
- Resolution: 1440x900
- Total video length: at least 3 minutes
```

### Batch process multiple projects
```
Generate demo videos for all three of these projects:
1. /path/to/project-a
2. /path/to/project-b
3. /path/to/project-c
Save each to its own output/ folder.
```

### Generate and upload to GitHub
```
Create a demo video for [project path], then add it to
examples/demo-videos/ in the GitFrame repo as [name]-demo.mp4
and push to https://github.com/[username]/GitFrame.
```

### Retry after error
```
A libnspr4.so error occurred during render.
Set LD_LIBRARY_PATH=./lib/usr/lib/x86_64-linux-gnu and retry.
```

```
Korean characters are garbled in the video.
Verify fonts-nanum is installed, hardcode NanumGothic in the FFmpeg drawtext filter, and re-render.
```

---

## 🔄 What the AI Agent Does Internally

```
1. Analyze the project structure
   ├── Detect language/framework (Go, Node.js, Python, Java, Docker Compose)
   ├── Identify routes/pages (by reading source code or README)
   └── Determine port number and run command

2. Generate .gitframe/ config files
   ├── gitframe.yaml (language, build/run commands, resolution, intro/outro)
   └── demo.yaml (18-step scenario with goto → pause → caption per screen)

3. Execute the GitFrame render pipeline
   ├── Copy project to isolated /tmp/gitframe-* workspace
   ├── Install dependencies (go mod download / npm install / pip install)
   ├── Build the project and start the server
   ├── Health check — poll until the port is open
   ├── Playwright headless browser scenario playback + WebM recording
   └── FFmpeg: generate intro → transcode WebM → compile subtitles → merge outro

4. Deliver results
   ├── Provide output/demo.mp4 link
   ├── On error: analyze logs → auto-fix → retry
   └── On success: print summary report with file size and duration
```

---

## 💡 Tips for Better Videos

### ⏱ Allow sufficient pause time
SPAs (React/Vue, etc.) need time to load data after navigation.
```
Pause 10–15 seconds after each page transition.
The recording should capture the fully loaded state.
```

### 📏 Target at least 3 minutes
```
Aim for 3+ minutes by pausing 10 seconds per page.
If there aren't enough screens, revisit key pages a second time.
```

### 🗣 Write descriptive captions
```
For each step, write a detailed English caption describing
what the current screen does and why it matters.
```

### 🔒 Bypass authentication for demo
```
Start the server with AUTH_ENABLED=false so the scenario
can access internal pages without a login screen blocking it.
```

---

## 📎 Related Links

- 🏠 **GitFrame GitHub**: https://github.com/hkjang/GitFrame
- 📖 **Detailed CLI Guide**: [gitframe_guide.en.md](gitframe_guide.en.md)
- 🎬 **Sample Video Collection**: [../examples/demo-videos/](../examples/demo-videos/README.md)
- 📄 **Scenario Example**: [../examples/demo-scenario.yaml](../examples/demo-scenario.yaml)

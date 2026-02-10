# BicepCurls IDE: The Agentic Web Interface

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://bicepcurls-v1.netlify.app/)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black)](https://nextjs.org/)
[![Monaco Editor](https://img.shields.io/badge/Editor-Monaco-blue)](https://microsoft.github.io/monaco-editor/)


<p align="center">
  <a href="https://oasis-parzival.github.io/BicepCurls-IDE/">
    <img src="https://github.com/user-attachments/assets/6a9a0f2d-8616-43d8-a08a-e8a98589f4dc" width="100%" alt="BicepCurls IDE Preview">
  </a>
</p>

<p align="center">
  <a href="https://bicepcurls-v1.netlify.app/">
    <img src="https://github.com/user-attachments/assets/0e1cb535-26fa-4d3c-94ef-84e6776f0d3f" width="100%" alt="BicepCurls IDE Preview">
  </a>
</p>




BicepCurls is a state-of-the-art, browser-based integrated development environment (IDE) designed for rapid web prototyping. It integrates an autonomous development agent, **Freeweight AI**, directly into the core workflow, enabling seamless neural-assisted coding.

## Technical Architecture

The application is built on a modern **Next.js 15** stack, leveraging a decoupled architecture for performance and extensibility.

### 1. Virtual File System (VFS)
The IDE operates on a sophisticated `FileSystemManager` class that abstracts file operations within the browser's memory.
- **In-Memory Tree**: Uses a recursive `FileNode` structure for folder and file management.
- **Reactivity**: Implements deep cloning patterns (`JSON.parse(JSON.stringify())`) to ensure React's reconciliation engine accurately detects state mutations.
- **Static Mode**: Configured for session-based coding where the environment resets to a "Golden Master" state upon refresh, perfect for sandboxing.

### 2. Editor Core
Powered by the **Monaco Editor** (the engine behind VS Code), providing:
- Full syntax highlighting for JS, HTML, CSS, and TS.
- Intelligent code completion and IntelliSense.
- Integrated diff viewing and high-fidelity text manipulation.

### 3. Rendering Engine
- **Live Preview Path**: Dynamically injects source code into managed `iframe` environments via Blob URLs or data-injection techniques.
- **Neural Terminal**: A simulated terminal environment that supports command interpretation and provides a feedback loop for terminal-driven development.

### 4. Cyber-Aesthetic Design System
The UI implements a "Vanguard-Cyber" design language:
- **Neon-Green HSL Palettes**: High-contrast, accessibility-aware color tokens.
- **Canvas Particle Network**: High-performance background animations using the HTML5 Canvas API.
- **3D Tilt Geometry**: Perspective-based UI interactions driven by real-time mouse coordinate normalization.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS (for complex animations)
- **Editor**: @monaco-editor/react
- **Icons**: Lucide React + Emoji integration
- **CI/CD**: GitHub Actions / gh-pages automation

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/oasis-parzival/bicepcurls-IDE.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```

## Deployment Logic

The project is configured for **Static Site Generation (SSG)**.

- **Next.js Config**: Utilizes `output: 'export'` with `basePath` mapping for GitHub Pages sub-directory compatibility.
- **Bypass Jekyll**: The deployment pipeline automatically injects a `.nojekyll` file to ensure the `_next` directory is correctly served by GitHub's static servers.
- **Pipeline**:
  ```bash
  npm run deploy
  ```
  *(Triggers: `next build` -> `.nojekyll` generation -> `gh-pages` branch push)*

## 🦾 About Freeweight AI
Freeweight is the resident agentic coding partner. It is designed to interpret project structures, write boilerplate, and debug complex layouts in real-time, effectively serving as a "muscle" for your digital brain.

---
*Built with intensity by [Oasis Parzival](https://github.com/oasis-parzival)*

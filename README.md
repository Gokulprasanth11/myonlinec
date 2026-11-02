# MyOnlineC - Modern Online C Compiler

A modern, fast, and responsive web-based C online compiler powered by the [OnlineCompiler.io](https://onlinecompiler.io/c-online-compiler) Code Execution API.

---

## Features

- **High-Performance C Execution**: Compiles and runs C programs via OnlineCompiler.io sandbox (`GCC 15` / `Clang 21`).
- **Modern IDE Experience**: 
  - Monaco Editor (VS Code core) with C syntax highlighting, line numbers, and dark theme.
  - Smooth fallback to a clean native code editor if offline or CDN blocked.
- **Interactive I/O**:
  - Full Standard Input (`stdin`) support for interactive C programs using `scanf()`, `getchar()`, etc.
  - Real-time Output Terminal with distinct `stdout` and `stderr` syntax formatting.
- **Execution Telemetry**:
  - Live execution status (Success / Error / Compile Error).
  - Exit code detection.
  - Execution runtime (in milliseconds).
  - Memory consumption metrics.
- **Convenience Tools**:
  - Quick-start C templates (Hello World, Two Number Sum with stdin, Fibonacci, Dynamic Memory / Pointers, Bubble Sort).
  - Code formatting and clipboard export.
  - Direct `.c` file download.
  - Global `Ctrl + Enter` shortcut to compile and run.
- **Zero External Dependencies**: Built with native Node.js (`node:http`, `node:fs`), requiring no heavy `node_modules` installation.
- **Secure API Key Handling**: The OnlineCompiler.io API key is kept safely on the backend in `.env` and never exposed to the client browser.

---

## Quick Start

### 1. Verify Configuration
Ensure `.env` contains your OnlineCompiler.io credentials:
```env
ONLINECOMPILER_API_KEY=31f4de3b8255d41916bf6532b8123c17
PORT=3000
```

### 2. Start the Server
Run with Node.js:
```bash
npm start
```
or directly:
```bash
node --env-file=.env server.js
```

### 3. Open in Browser
Visit:
```
http://localhost:3000
```

---

## Project Structure

```
c:\myonlinec\
├── .env                # API key and server environment configuration
├── .gitignore          # Git exclusion rules
├── package.json        # Project metadata and run scripts
├── README.md           # Documentation
├── server.js           # Lightweight Node.js HTTP server & API proxy
└── public/             # Frontend assets
    ├── index.html      # Main application markup
    ├── style.css       # IDE dark styling
    └── app.js          # Editor setup, templates, and execution handler
```


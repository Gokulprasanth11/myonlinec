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
Create `.env` (it is not committed) with your OnlineCompiler.io key and the sign-in account:
```env
ONLINECOMPILER_API_KEY=your_api_key_here
APP_USERNAME=gokul
APP_PASSWORD=choose-a-password
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
Visit `http://localhost:3000` and sign in. After that you can keep several projects, and inside a project several folders.

- **New project** (sidebar **+**) is a separate application workspace.
- **New folder**, or `mkdir apps/demo` in the terminal, groups files. A folder with its own `main.c` is its own application.
- **Run** compiles the open `.c` file. The play icon on a file or folder runs that application. In the terminal: `run apps/greet/main.c`.
- Sources that have no `main` are compiled together with the application you run. Other files that have their own `main` stay out of that build.

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
    ├── login.html      # Sign-in page
    ├── login.css       # Sign-in styling
    ├── style.css       # IDE dark styling
    └── app.js          # Editor setup, templates, and execution handler
```


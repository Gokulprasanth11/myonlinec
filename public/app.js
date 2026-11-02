// MyOnlineC - VS Code Web IDE with Terminal CLI & GitHub Sync
(function () {
  'use strict';

  // Sample templates with folder support
  const SAMPLES = {
    folders_project: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>
#include "math_utils.h"

int main() {
    printf("================================================\\n");
    printf("   VS Code IDE: Folder & Multi-File C Project   \\n");
    printf("================================================\\n\\n");

    int a = 24, b = 6;
    printf("Add:      %d + %d = %d\\n", a, b, add(a, b));
    printf("Multiply: %d * %d = %d\\n", a, b, multiply(a, b));
    printf("Power:    %d ^ 3  = %d\\n", a, power(a, 3));
    printf("Cube:     cube(%d) = %d\\n", b, cube(b));

    printf("\\nOrganized inside:\\n");
    printf("  - include/math_utils.h\\n");
    printf("  - main.c\\n");
    return 0;
}
`
        },
        'include': {
          type: 'folder',
          parent: ''
        },
        'include/math_utils.h': {
          type: 'file',
          parent: 'include',
          content: `#ifndef MATH_UTILS_H
#define MATH_UTILS_H

static inline int add(int a, int b) {
    return a + b;
}

static inline int multiply(int a, int b) {
    return a * b;
}

static inline int power(int base, int exp) {
    int res = 1;
    for (int i = 0; i < exp; i++) res *= base;
    return res;
}

static inline int cube(int x) {
    return x * x * x;
}

#endif // MATH_UTILS_H
`
        },
        'src': {
          type: 'folder',
          parent: ''
        },
        'src/notes.txt': {
          type: 'file',
          parent: 'src',
          content: `Project Notes:
- Header files are in include/
- Application entry is main.c
- Run with Ctrl + Enter
`
        }
      },
      stdin: ''
    },
    hello: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to MyOnlineC!\\n");
    return 0;
}
`
        }
      },
      stdin: ''
    },
    multi_file: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>
#include "math_utils.h"

int main() {
    int x = 20, y = 8;
    printf("======================================\\n");
    printf("   Multi-File C Project in MyOnlineC  \\n");
    printf("======================================\\n\\n");

    printf("Sum:      %d + %d = %d\\n", x, y, add(x, y));
    printf("Multiply: %d * %d = %d\\n", x, y, multiply(x, y));
    return 0;
}
`
        },
        'math_utils.h': {
          type: 'file',
          parent: '',
          content: `#ifndef MATH_UTILS_H
#define MATH_UTILS_H

static inline int add(int a, int b) { return a + b; }
static inline int multiply(int a, int b) { return a * b; }

#endif
`
        }
      },
      stdin: ''
    },
    ldd_inspect: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main() {
    printf("===================================================\\n");
    printf(" Dynamic Shared Library Inspection (ldd)           \\n");
    printf("===================================================\\n\\n");

    double val = sqrt(256.0);
    printf("Computed sqrt(256.0) = %.2f\\n\\n", val);

    printf("Executing 'ldd /proc/self/exe' inside Debian container:\\n");
    printf("---------------------------------------------------\\n");
    fflush(stdout);

    system("ldd /proc/self/exe");
    return 0;
}
`
        }
      },
      stdin: ''
    },
    sum: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two integers: ");
    if (scanf("%d %d", &a, &b) == 2) {
        printf("\\nSuccess! %d + %d = %d\\n", a, b, a + b);
    } else {
        printf("\\nFailed to read numbers from standard input.\\n");
    }
    return 0;
}
`
        }
      },
      stdin: '25 75'
    },
    fibonacci: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>

void printFibonacci(int n) {
    long long t1 = 0, t2 = 1, next;
    printf("First %d Fibonacci numbers:\\n", n);
    for (int i = 1; i <= n; ++i) {
        printf("%lld ", t1);
        next = t1 + t2;
        t1 = t2;
        t2 = next;
    }
    printf("\\n");
}

int main() {
    printFibonacci(12);
    return 0;
}
`
        }
      },
      stdin: ''
    },
    pointers: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));
    if (!arr) return 1;

    for (int i = 0; i < n; i++) *(arr + i) = (i + 1) * 10;

    printf("Dynamic Allocation & Pointer Traversal:\\n");
    for (int i = 0; i < n; i++) {
        printf("arr[%d] at %p = %d\\n", i, (void *)(arr + i), *(arr + i));
    }

    free(arr);
    return 0;
}
`
        }
      },
      stdin: ''
    },
    bubble_sort: {
      compiler: 'gcc-15',
      vfs: {
        'main.c': {
          type: 'file',
          parent: '',
          content: `#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int t = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = t;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);

    printf("Original: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    bubbleSort(arr, n);

    printf("Sorted:   ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}
`
        }
      },
      stdin: ''
    }
  };

  // State Management with LocalStorage persistence
  const savedVfs = localStorage.getItem('myonlinec_vfs');
  let vfs = savedVfs ? JSON.parse(savedVfs) : JSON.parse(JSON.stringify(SAMPLES.folders_project.vfs));
  let expandedFolders = new Set(['include', 'src']);
  let openTabs = ['main.c'];
  if (vfs['include/math_utils.h']) openTabs.push('include/math_utils.h');
  let activeFilePath = 'main.c';
  let monacoEditor = null;
  let cliHistory = [];
  let cliHistoryIdx = -1;

  // DOM Elements
  const sampleSelect = document.getElementById('sample-select');
  const compilerSelect = document.getElementById('compiler-select');
  const runBtn = document.getElementById('run-btn');
  const downloadBtn = document.getElementById('download-btn');
  const formatBtn = document.getElementById('format-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const fileTree = document.getElementById('file-tree');
  const editorTabs = document.getElementById('editor-tabs');
  const activeCrumb = document.getElementById('active-crumb');
  const monacoContainer = document.getElementById('monaco-container');
  const fallbackEditor = document.getElementById('fallback-editor');
  const outputTerminal = document.getElementById('output-terminal');
  const terminalScrollArea = document.getElementById('terminal-scroll-area');
  const terminalCliInput = document.getElementById('terminal-cli-input');
  const stdinInput = document.getElementById('stdin-input');
  const statusCursor = document.getElementById('status-cursor');
  const statusLangText = document.getElementById('status-lang-text');
  const statusCompilerText = document.getElementById('status-compiler-text');
  const statusStatusText = document.getElementById('status-status-text');
  const clearTerminalBtn = document.getElementById('clear-terminal-btn');
  const btnNewFile = document.getElementById('btn-new-file');
  const btnNewFolder = document.getElementById('btn-new-folder');
  const metricStatus = document.getElementById('metric-status');
  const metricTime = document.getElementById('metric-time');
  const metricMemory = document.getElementById('metric-memory');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const togglePanelBtn = document.getElementById('toggle-panel-btn');
  const hidePanelBtn = document.getElementById('hide-panel-btn');
  const sidebar = document.getElementById('sidebar');
  const bottomPanel = document.getElementById('bottom-panel');

  // GitHub Modal Elements
  const githubModalBtn = document.getElementById('github-modal-btn');
  const githubModal = document.getElementById('github-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelGhBtn = document.getElementById('cancel-gh-btn');
  const submitGhBtn = document.getElementById('submit-gh-btn');
  const ghToken = document.getElementById('gh-token');
  const ghOwner = document.getElementById('gh-owner');
  const ghRepo = document.getElementById('gh-repo');
  const ghBranch = document.getElementById('gh-branch');
  const ghMessage = document.getElementById('gh-message');
  const ghStatus = document.getElementById('gh-status');

  // Load saved GitHub credentials from localStorage
  if (localStorage.getItem('myonlinec_gh_token')) {
    ghToken.value = localStorage.getItem('myonlinec_gh_token');
  }
  if (localStorage.getItem('myonlinec_gh_owner')) {
    ghOwner.value = localStorage.getItem('myonlinec_gh_owner');
  }
  if (localStorage.getItem('myonlinec_gh_repo')) {
    ghRepo.value = localStorage.getItem('myonlinec_gh_repo');
  }

  function saveVfs() {
    try {
      localStorage.setItem('myonlinec_vfs', JSON.stringify(vfs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Helpers
  function getBasename(path) {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  function getLanguage(path) {
    const lower = path.toLowerCase();
    if (lower.endsWith('.c') || lower.endsWith('.h')) return 'c';
    if (lower === 'makefile' || lower.endsWith('.mk')) return 'makefile';
    if (lower.endsWith('.sh')) return 'shell';
    if (lower.endsWith('.json')) return 'json';
    return 'plaintext';
  }

  function getFileIcon(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.c')) return '<i class="codicon codicon-symbol-class tree-icon icon-c"></i>';
    if (lower.endsWith('.h')) return '<i class="codicon codicon-symbol-interface tree-icon icon-h"></i>';
    if (lower === 'makefile' || lower.endsWith('.mk')) return '<i class="codicon codicon-gear tree-icon icon-make"></i>';
    return '<i class="codicon codicon-file tree-icon"></i>';
  }

  // File Tree Rendering
  function renderFileTree() {
    fileTree.innerHTML = '';

    const tree = {};
    for (const [path, item] of Object.entries(vfs)) {
      const parent = item.parent || '';
      if (!tree[parent]) tree[parent] = [];
      tree[parent].push({ path, ...item });
    }

    for (const parent in tree) {
      tree[parent].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.path.localeCompare(b.path);
      });
    }

    function renderBranch(parentPath, depth) {
      const items = tree[parentPath] || [];
      items.forEach(item => {
        const node = document.createElement('div');
        node.className = `tree-node ${item.path === activeFilePath ? 'selected' : ''}`;
        node.style.paddingLeft = `${depth * 14 + 10}px`;

        if (item.type === 'folder') {
          const isExpanded = expandedFolders.has(item.path);
          const arrowIcon = isExpanded ? 'chevron-down' : 'chevron-right';
          const folderIcon = isExpanded ? 'folder-opened' : 'folder';

          node.innerHTML = `
            <span class="tree-arrow"><i class="codicon codicon-${arrowIcon}"></i></span>
            <span class="tree-icon icon-folder"><i class="codicon codicon-${folderIcon}"></i></span>
            <span class="tree-label">${getBasename(item.path)}</span>
            <div class="tree-node-actions">
              <button class="node-action-btn btn-add-in-folder" title="New file in folder"><i class="codicon codicon-new-file"></i></button>
              <button class="node-action-btn btn-delete-node" title="Delete folder"><i class="codicon codicon-trash"></i></button>
            </div>
          `;

          node.addEventListener('click', (e) => {
            if (e.target.closest('.node-action-btn')) return;
            if (expandedFolders.has(item.path)) {
              expandedFolders.delete(item.path);
            } else {
              expandedFolders.add(item.path);
            }
            renderFileTree();
          });

          const addBtn = node.querySelector('.btn-add-in-folder');
          addBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            promptNewFile(item.path);
          });

          const delBtn = node.querySelector('.btn-delete-node');
          delBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNode(item.path, 'folder');
          });

          fileTree.appendChild(node);

          if (isExpanded) {
            renderBranch(item.path, depth + 1);
          }
        } else {
          node.innerHTML = `
            <span class="tree-arrow"></span>
            ${getFileIcon(item.path)}
            <span class="tree-label">${getBasename(item.path)}</span>
            <div class="tree-node-actions">
              <button class="node-action-btn btn-delete-node" title="Delete file"><i class="codicon codicon-trash"></i></button>
            </div>
          `;

          node.addEventListener('click', (e) => {
            if (e.target.closest('.node-action-btn')) return;
            openFile(item.path);
          });

          const delBtn = node.querySelector('.btn-delete-node');
          delBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNode(item.path, 'file');
          });

          fileTree.appendChild(node);
        }
      });
    }

    renderBranch('', 0);
  }

  // Open / Switch File
  function openFile(path) {
    if (!vfs[path] || vfs[path].type !== 'file') return;

    if (vfs[activeFilePath] && vfs[activeFilePath].type === 'file') {
      vfs[activeFilePath].content = getEditorValue();
      saveVfs();
    }

    if (!openTabs.includes(path)) {
      openTabs.push(path);
    }

    activeFilePath = path;
    setEditorValue(vfs[path].content || '', path);

    activeCrumb.textContent = path.replace(/\//g, ' › ');
    statusLangText.textContent = getLanguage(path).toUpperCase();

    renderTabs();
    renderFileTree();
  }

  // Render Tabs Bar
  function renderTabs() {
    editorTabs.innerHTML = '';
    openTabs.forEach(path => {
      const tab = document.createElement('div');
      tab.className = `editor-tab ${path === activeFilePath ? 'active' : ''}`;
      tab.title = path;

      tab.innerHTML = `
        ${getFileIcon(path)}
        <span class="tab-label">${getBasename(path)}</span>
        <span class="tab-close"><i class="codicon codicon-close"></i></span>
      `;

      tab.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) return;
        openFile(path);
      });

      const closeBtn = tab.querySelector('.tab-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(path);
      });

      editorTabs.appendChild(tab);
    });
  }

  // Close Tab
  function closeTab(path) {
    const idx = openTabs.indexOf(path);
    if (idx === -1) return;

    openTabs.splice(idx, 1);

    if (activeFilePath === path) {
      if (openTabs.length > 0) {
        const nextPath = openTabs[Math.max(0, idx - 1)];
        openFile(nextPath);
      } else {
        activeFilePath = '';
        setEditorValue('', '');
        activeCrumb.textContent = '';
        renderTabs();
      }
    } else {
      renderTabs();
    }
  }

  // New File Creator
  function promptNewFile(parentFolder = '', initialContent = '') {
    const defaultName = parentFolder ? `${parentFolder}/utils.h` : 'helper.h';
    const filePath = prompt('Enter new file name (or path with folder):', defaultName);
    if (!filePath) return;

    const trimmed = filePath.trim().replace(/^[\/\\]+|[\/\\]+$/g, '');
    if (!trimmed) return;

    if (vfs[trimmed]) {
      alert(`Item "${trimmed}" already exists.`);
      openFile(trimmed);
      return;
    }

    const parts = trimmed.split('/');
    if (parts.length > 1) {
      let currentPath = '';
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        if (!vfs[currentPath]) {
          const parentOfFolder = i > 0 ? parts.slice(0, i).join('/') : '';
          vfs[currentPath] = { type: 'folder', parent: parentOfFolder };
          expandedFolders.add(currentPath);
        }
      }
    }

    const parentOfNewFile = parts.length > 1 ? parts.slice(0, parts.length - 1).join('/') : '';
    vfs[trimmed] = {
      type: 'file',
      parent: parentOfNewFile,
      content: initialContent || (trimmed.endsWith('.h') ? `#ifndef ${getBasename(trimmed).toUpperCase().replace(/[^A-Z0-9]/g, '_')}\n#define ${getBasename(trimmed).toUpperCase().replace(/[^A-Z0-9]/g, '_')}\n\n// Header declarations\n\n#endif\n` : '')
    };

    saveVfs();
    openFile(trimmed);
  }

  // New Folder Creator
  function promptNewFolder(folderNameArg) {
    const folderName = folderNameArg || prompt('Enter new folder name (e.g. include, src, tests):');
    if (!folderName) return;

    const trimmed = folderName.trim().replace(/^[\/\\]+|[\/\\]+$/g, '');
    if (!trimmed) return;

    if (vfs[trimmed]) {
      if (!folderNameArg) alert(`Folder "${trimmed}" already exists.`);
      return;
    }

    vfs[trimmed] = { type: 'folder', parent: '' };
    expandedFolders.add(trimmed);
    saveVfs();
    renderFileTree();
  }

  // Delete Node
  function deleteNode(path, type) {
    if (path === 'main.c') {
      alert('main.c is the primary entry point and cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${type} "${path}"?`)) return;

    if (type === 'folder') {
      for (const key of Object.keys(vfs)) {
        if (key === path || key.startsWith(`${path}/`)) {
          delete vfs[key];
          closeTab(key);
        }
      }
      expandedFolders.delete(path);
    } else {
      delete vfs[path];
      closeTab(path);
    }

    saveVfs();
    renderFileTree();
  }

  // Editor Value Setters/Getters
  function getEditorValue() {
    if (monacoEditor) return monacoEditor.getValue();
    return fallbackEditor.value;
  }

  function setEditorValue(val, path) {
    if (monacoEditor) {
      monacoEditor.setValue(val);
      if (path) {
        const lang = getLanguage(path);
        const model = monacoEditor.getModel();
        if (model) monaco.editor.setModelLanguage(model, lang);
      }
    } else {
      fallbackEditor.value = val;
    }
  }

  // Initialize Monaco Editor
  function initMonaco() {
    const initialCode = vfs[activeFilePath]?.content || '';
    fallbackEditor.value = initialCode;

    if (window.require && typeof window.require.config === 'function') {
      window.require.config({
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
      });

      window.require(['vs/editor/editor.main'], function () {
        fallbackEditor.style.display = 'none';

        monacoEditor = monaco.editor.create(monacoContainer, {
          value: initialCode,
          language: getLanguage(activeFilePath),
          theme: 'vs-dark',
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontSize: 13.5,
          lineHeight: 21,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          minimap: { enabled: true, maxColumn: 80 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true }
        });

        monacoEditor.onDidChangeCursorPosition(function (e) {
          statusCursor.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        monacoEditor.onDidChangeModelContent(() => {
          if (vfs[activeFilePath]) {
            vfs[activeFilePath].content = monacoEditor.getValue();
            saveVfs();
          }
        });

        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
          runCode();
        });
      }, function (err) {
        console.warn('Monaco failed to load, keeping native editor.', err);
      });
    }

    renderFileTree();
    renderTabs();
  }

  // Bottom Panel Tab Switching (Terminal / Input)
  const panelTabs = document.querySelectorAll('.panel-tab');
  panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      panelTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `pane-${tab.dataset.tab}`;
      document.getElementById(targetId)?.classList.add('active');
      if (tab.dataset.tab === 'terminal') {
        terminalCliInput?.focus();
      }
    });
  });

  function switchPanelTab(tabName) {
    panelTabs.forEach(t => {
      if (t.dataset.tab === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(p => {
      if (p.id === `pane-${tabName}`) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  function appendTerminal(html) {
    outputTerminal.innerHTML += html;
    terminalScrollArea.scrollTop = terminalScrollArea.scrollHeight;
  }

  // Code Execution Engine
  async function runCode(customFile) {
    if (vfs[activeFilePath]) {
      vfs[activeFilePath].content = getEditorValue();
      saveVfs();
    }

    const targetPath = customFile || activeFilePath || 'main.c';
    const mainFile = vfs[targetPath] || vfs['main.c'];
    const mainCode = mainFile?.content || '';
    const compiler = compilerSelect.value || 'gcc-15';
    const input = stdinInput.value;

    if (!mainCode.trim()) {
      alert(`No C code found to compile in "${targetPath}".`);
      return;
    }

    // Collect all secondary files
    const secondaryFiles = [];
    for (const [path, item] of Object.entries(vfs)) {
      if (item.type === 'file' && path !== targetPath) {
        secondaryFiles.push({
          name: getBasename(path),
          content: item.content
        });
      }
    }

    runBtn.disabled = true;
    bottomPanel?.classList.remove('collapsed');
    switchPanelTab('terminal');

    appendTerminal(`\n<span class="stdout-line">[Compiling ${getBasename(targetPath)} with ${compiler}...]</span>\n`);
    statusStatusText.innerHTML = '<i class="codicon codicon-sync"></i><span>Compiling...</span>';

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: compiler,
          code: mainCode,
          files: secondaryFiles,
          input: input,
          time_limit: 15
        })
      });

      const result = await response.json();
      const data = result.data || {};
      const stdout = data.output || '';
      const stderr = data.error || result.error || '';
      const exitCode = data.exit_code !== undefined ? data.exit_code : (result.success ? 0 : 1);
      const isSuccess = exitCode === 0 && (!data.status || data.status === 'success');

      let outputHtml = '';
      if (stdout) outputHtml += `<span class="stdout-line">${escapeHtml(stdout)}</span>`;
      if (stderr) {
        if (outputHtml) outputHtml += '\n';
        outputHtml += `<span class="stderr-line">${escapeHtml(stderr)}</span>`;
      }
      if (!stdout && !stderr) {
        outputHtml = '<span class="terminal-placeholder">[Program terminated with no output]</span>\n';
      }

      appendTerminal(outputHtml);

      // Update Metrics
      metricStatus.textContent = isSuccess ? 'Success' : `Exit ${exitCode}`;
      metricStatus.className = `meta-badge ${isSuccess ? 'success' : 'error'}`;

      if (data.time || data.total) {
        const sec = parseFloat(data.time || data.total);
        metricTime.textContent = `${(sec * 1000).toFixed(0)} ms`;
      } else {
        metricTime.textContent = '';
      }

      if (data.memory) {
        metricMemory.textContent = `${parseInt(data.memory, 10)} KB`;
      } else {
        metricMemory.textContent = '';
      }

      statusStatusText.innerHTML = isSuccess
        ? '<i class="codicon codicon-check"></i><span>Success</span>'
        : '<i class="codicon codicon-error"></i><span>Build Failed</span>';

    } catch (err) {
      appendTerminal(`<span class="stderr-line">Network error: ${escapeHtml(err.message)}</span>\n`);
      metricStatus.textContent = 'Error';
      metricStatus.className = 'meta-badge error';
      statusStatusText.innerHTML = '<i class="codicon codicon-error"></i><span>Error</span>';
    } finally {
      runBtn.disabled = false;
      terminalCliInput?.focus();
    }
  }

  // Interactive Terminal Command Line Handler
  terminalCliInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmdRaw = terminalCliInput.value.trim();
      terminalCliInput.value = '';
      if (!cmdRaw) return;

      cliHistory.push(cmdRaw);
      cliHistoryIdx = cliHistory.length;

      appendTerminal(`<div class="terminal-prompt-line"><span class="prompt-user">gokul@myonlinec</span>:<span class="prompt-path">~/project</span>$&nbsp;<span>${escapeHtml(cmdRaw)}</span></div>`);

      executeCliCommand(cmdRaw);
    } else if (e.key === 'ArrowUp') {
      if (cliHistory.length > 0 && cliHistoryIdx > 0) {
        cliHistoryIdx--;
        terminalCliInput.value = cliHistory[cliHistoryIdx];
      }
    } else if (e.key === 'ArrowDown') {
      if (cliHistory.length > 0 && cliHistoryIdx < cliHistory.length - 1) {
        cliHistoryIdx++;
        terminalCliInput.value = cliHistory[cliHistoryIdx];
      } else {
        cliHistoryIdx = cliHistory.length;
        terminalCliInput.value = '';
      }
    }
  });

  function executeCliCommand(cmdLine) {
    const parts = cmdLine.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (cmd) {
      case 'help':
        appendTerminal(`
<span class="stdout-line">Available Terminal Commands:</span>
  <span class="prompt-user">run [file]</span>       - Compile & run main.c or specific application
  <span class="prompt-user">git push</span>         - Push all project files & folders to GitHub
  <span class="prompt-user">git status</span>       - View files in virtual project tree
  <span class="prompt-user">ls / dir</span>         - List files and folders
  <span class="prompt-user">mkdir &lt;folder&gt;</span>    - Create new folder in project
  <span class="prompt-user">touch &lt;file&gt;</span>      - Create new file in project
  <span class="prompt-user">cat &lt;file&gt;</span>        - Display contents of a file
  <span class="prompt-user">clear</span>            - Clear terminal output
\n`);
        break;

      case 'run':
        runCode(arg1);
        break;

      case 'clear':
        outputTerminal.innerHTML = '';
        break;

      case 'ls':
      case 'dir':
        const fileNames = Object.keys(vfs).sort();
        let listOut = '<div style="margin: 4px 0;">';
        fileNames.forEach(name => {
          const isDir = vfs[name].type === 'folder';
          listOut += `<span style="display:inline-block; margin-right: 18px; color: ${isDir ? '#e8a838' : '#519aba'};">${escapeHtml(name)}${isDir ? '/' : ''}</span>`;
        });
        listOut += '</div>\n';
        appendTerminal(listOut);
        break;

      case 'git':
        if (arg1 === 'status') {
          appendTerminal(`
<span class="stdout-line">On branch main</span>
<span class="stdout-line">Project files tracked (${Object.keys(vfs).length}):</span>
${Object.keys(vfs).map(p => `  <span style="color: #89d185;">${escapeHtml(p)}</span>`).join('\n')}
\n`);
        } else if (arg1 === 'push') {
          openGitHubModal();
        } else if (arg1 === 'commit') {
          appendTerminal('<span class="stdout-line">[main (root-commit)] Changes staged in browser VFS. Type "git push" to sync with GitHub.</span>\n');
        } else {
          appendTerminal(`<span class="stderr-line">git: '${escapeHtml(arg1 || '')}' is not a supported git command. Try "git push" or "git status".</span>\n`);
        }
        break;

      case 'mkdir':
        if (!arg1) {
          appendTerminal('<span class="stderr-line">mkdir: missing operand</span>\n');
        } else {
          promptNewFolder(arg1);
          appendTerminal(`<span class="stdout-line">Created directory: ${escapeHtml(arg1)}</span>\n`);
        }
        break;

      case 'touch':
        if (!arg1) {
          appendTerminal('<span class="stderr-line">touch: missing file operand</span>\n');
        } else {
          vfs[arg1] = { type: 'file', parent: arg1.includes('/') ? arg1.split('/')[0] : '', content: '' };
          saveVfs();
          renderFileTree();
          openFile(arg1);
          appendTerminal(`<span class="stdout-line">Created file: ${escapeHtml(arg1)}</span>\n`);
        }
        break;

      case 'cat':
        if (!arg1 || !vfs[arg1]) {
          appendTerminal(`<span class="stderr-line">cat: ${escapeHtml(arg1 || '')}: No such file</span>\n`);
        } else if (vfs[arg1].type === 'folder') {
          appendTerminal(`<span class="stderr-line">cat: ${escapeHtml(arg1)}: Is a directory</span>\n`);
        } else {
          appendTerminal(`<pre class="stdout-line">${escapeHtml(vfs[arg1].content || '(empty)')}</pre>\n`);
        }
        break;

      default:
        appendTerminal(`<span class="stderr-line">command not found: ${escapeHtml(cmd)}. Type "help" for list of commands.</span>\n`);
        break;
    }
  }

  // GitHub Modal & Push Handler
  function openGitHubModal() {
    githubModal.classList.remove('hidden');
    ghStatus.className = 'gh-status hidden';
    ghStatus.innerHTML = '';
    ghRepo.focus();
  }

  function closeGitHubModal() {
    githubModal.classList.add('hidden');
  }

  githubModalBtn?.addEventListener('click', openGitHubModal);
  closeModalBtn?.addEventListener('click', closeGitHubModal);
  cancelGhBtn?.addEventListener('click', closeGitHubModal);

  submitGhBtn?.addEventListener('click', async () => {
    const token = ghToken.value.trim();
    const owner = ghOwner.value.trim();
    const repo = ghRepo.value.trim();
    const branch = ghBranch.value.trim() || 'main';
    const message = ghMessage.value.trim() || 'Commit from MyOnlineC IDE';

    if (!token) {
      alert('Please enter your GitHub Personal Access Token (PAT).');
      ghToken.focus();
      return;
    }
    if (!owner) {
      alert('Please enter your GitHub Username.');
      ghOwner.focus();
      return;
    }
    if (!repo) {
      alert('Please enter a Repository Name.');
      ghRepo.focus();
      return;
    }

    // Save in localStorage for future convenience
    localStorage.setItem('myonlinec_gh_token', token);
    localStorage.setItem('myonlinec_gh_owner', owner);
    localStorage.setItem('myonlinec_gh_repo', repo);

    // Save active editor value
    if (vfs[activeFilePath]) {
      vfs[activeFilePath].content = getEditorValue();
      saveVfs();
    }

    // Gather all files from VFS
    const filesToPush = [];
    for (const [path, item] of Object.entries(vfs)) {
      if (item.type === 'file') {
        filesToPush.push({
          path: path,
          content: item.content || ''
        });
      }
    }

    submitGhBtn.disabled = true;
    ghStatus.className = 'gh-status info';
    ghStatus.innerHTML = '<i class="codicon codicon-sync"></i> Pushing all files and folders to GitHub...';

    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          owner,
          repo,
          branch,
          message,
          files: filesToPush
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        ghStatus.className = 'gh-status error';
        ghStatus.innerHTML = `<strong>Error:</strong> ${escapeHtml(result.error || 'Failed to push to GitHub')}`;
        submitGhBtn.disabled = false;
        return;
      }

      ghStatus.className = 'gh-status success';
      ghStatus.innerHTML = `🎉 <strong>Successfully pushed!</strong><br>
        View on GitHub: <a href="${escapeHtml(result.repoUrl)}" target="_blank">${escapeHtml(result.repoUrl)}</a><br>
        Commit: <a href="${escapeHtml(result.commitUrl)}" target="_blank">${result.commitSha.substring(0, 7)}</a>`;

      appendTerminal(`\n<span class="stdout-line">🎉 Successfully pushed ${filesToPush.length} files to <a href="${result.repoUrl}" target="_blank" style="color:#569cd6;">${result.repoUrl}</a></span>\n`);

    } catch (err) {
      ghStatus.className = 'gh-status error';
      ghStatus.innerHTML = `<strong>Network Error:</strong> ${escapeHtml(err.message)}`;
    } finally {
      submitGhBtn.disabled = false;
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Template Loader
  sampleSelect.addEventListener('change', () => {
    const sample = SAMPLES[sampleSelect.value];
    if (sample) {
      vfs = JSON.parse(JSON.stringify(sample.vfs));
      openTabs = ['main.c'];
      if (vfs['include/math_utils.h']) openTabs.push('include/math_utils.h');
      expandedFolders = new Set(['include', 'src']);
      activeFilePath = 'main.c';
      if (sample.compiler) compilerSelect.value = sample.compiler;
      setEditorValue(vfs['main.c']?.content || '', 'main.c');
      stdinInput.value = sample.stdin || '';
      saveVfs();
      renderFileTree();
      renderTabs();
    }
  });

  // Compiler Selector
  compilerSelect.addEventListener('change', () => {
    statusCompilerText.textContent = compilerSelect.value === 'gcc-15' ? 'GCC 15' : 'Clang 21';
  });

  // Toolbar Actions
  btnNewFile.addEventListener('click', () => promptNewFile(''));
  btnNewFolder.addEventListener('click', () => promptNewFolder(''));

  runBtn.addEventListener('click', () => runCode());

  downloadBtn.addEventListener('click', () => {
    if (vfs[activeFilePath]) {
      vfs[activeFilePath].content = getEditorValue();
      const blob = new Blob([vfs[activeFilePath].content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = getBasename(activeFilePath);
      a.click();
    }
  });

  formatBtn.addEventListener('click', () => {
    if (monacoEditor) monacoEditor.getAction('editor.action.formatDocument')?.run();
  });

  copyCodeBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getEditorValue());
      alert('File contents copied to clipboard!');
    } catch (e) {
      console.error(e);
    }
  });

  clearTerminalBtn.addEventListener('click', () => {
    outputTerminal.innerHTML = '<span class="terminal-placeholder">Terminal cleared.</span>';
  });

  // Toggles for Sidebar and Terminal
  toggleSidebarBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  togglePanelBtn?.addEventListener('click', () => {
    bottomPanel.classList.toggle('collapsed');
  });

  hidePanelBtn?.addEventListener('click', () => {
    bottomPanel.classList.add('collapsed');
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      sidebar.classList.toggle('collapsed');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      bottomPanel.classList.toggle('collapsed');
    }
  });

  // Start IDE
  initMonaco();
})();

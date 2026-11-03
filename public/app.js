// MyOnlineC - VS Code Web IDE with Terminal CLI & GitHub Sync
(function () {
  'use strict';

  // ── Auth Guard ───────────────────────────────────────────────────────────
  const SESSION_TOKEN = localStorage.getItem('myonlinec_token');
  if (!SESSION_TOKEN) {
    window.location.replace('/login.html');
    return;
  }
  function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SESSION_TOKEN}` };
  }
  function handleUnauthorized() {
    localStorage.removeItem('myonlinec_token');
    localStorage.removeItem('myonlinec_user');
    window.location.replace('/login.html');
  }

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

    project_banner();
    printf("\\nOrganized inside:\\n");
    printf("  - include/math_utils.h\\n");
    printf("  - src/banner.c\\n");
    printf("  - apps/greet/main.c (separate application)\\n");
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

void project_banner(void);

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
- Shared sources without main() are linked into whichever application you run
- main.c and apps/greet/main.c are separate applications
- Run a file with the play icon, or: run apps/greet/main.c
`
        },
        'src/banner.c': {
          type: 'file',
          parent: 'src',
          content: `#include <stdio.h>

void project_banner(void) {
    printf("Linked from src/banner.c\\n");
}
`
        },
        'apps': {
          type: 'folder',
          parent: ''
        },
        'apps/greet': {
          type: 'folder',
          parent: 'apps'
        },
        'apps/greet/main.c': {
          type: 'file',
          parent: 'apps/greet',
          content: `#include <stdio.h>
#include "math_utils.h"

int main() {
    printf("Greet application\\n");
    printf("add(2, 3) = %d\\n", add(2, 3));
    return 0;
}
`
        }
      },
      stdin: ''
    },
    hello: {
      compiler: 'gcc-15',
      vfs: {
        'src': {
          type: 'folder',
          parent: ''
        },
        'src/main.c': {
          type: 'file',
          parent: 'src',
          content: `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
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

  // ── Project Management ────────────────────────────────────────────────────
  const PROJECTS_KEY     = 'myonlinec_projects';      // array of project names
  const ACTIVE_PROJ_KEY  = 'myonlinec_active_project';

  function getProjectList() {
    try { return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || ['Default Project']; }
    catch { return ['Default Project']; }
  }

  function saveProjectList(list) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
  }

  function getVfsKey(name) { return `myonlinec_vfs_${name}`; }

  function loadProjectVfs(name) {
    try {
      const raw = localStorage.getItem(getVfsKey(name));
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SAMPLES.hello.vfs));
    } catch { return JSON.parse(JSON.stringify(SAMPLES.hello.vfs)); }
  }

  function saveProjectVfs(name, data) {
    try { localStorage.setItem(getVfsKey(name), JSON.stringify(data)); } catch (e) { console.warn(e); }
  }

  function firstOpenPath(tree) {
    if (tree['src/main.c']?.type === 'file') return 'src/main.c';
    if (tree['main.c']?.type === 'file') return 'main.c';
    const cFile = Object.keys(tree).find((k) => tree[k].type === 'file' && k.toLowerCase().endsWith('.c'));
    if (cFile) return cFile;
    const anyFile = Object.keys(tree).find((k) => tree[k].type === 'file');
    return anyFile || 'src/main.c';
  }

  function folderSet(tree) {
    const names = new Set();
    Object.keys(tree).forEach((p) => {
      if (tree[p].type === 'folder') names.add(p);
    });
    if (!names.size) names.add('src');
    return names;
  }

  let projectList    = getProjectList();
  let currentProject = localStorage.getItem(ACTIVE_PROJ_KEY) || projectList[0];
  if (!projectList.includes(currentProject)) { currentProject = projectList[0]; }

  // First visit of this layout opens Hello World in src/main.c.
  const STARTER_VERSION = 'src-hello-1';
  if (localStorage.getItem('myonlinec_starter') !== STARTER_VERSION) {
    if (!projectList.includes('Default Project')) {
      projectList.unshift('Default Project');
      saveProjectList(projectList);
    }
    saveProjectVfs('Default Project', JSON.parse(JSON.stringify(SAMPLES.hello.vfs)));
    currentProject = 'Default Project';
    localStorage.setItem(ACTIVE_PROJ_KEY, currentProject);
    localStorage.setItem('myonlinec_starter', STARTER_VERSION);
  }

  // State Management with LocalStorage persistence
  const savedVfs = localStorage.getItem(getVfsKey(currentProject));
  let vfs = savedVfs ? JSON.parse(savedVfs) : JSON.parse(JSON.stringify(SAMPLES.hello.vfs));
  let activeFilePath = firstOpenPath(vfs);
  let openTabs = [activeFilePath];
  let expandedFolders = folderSet(vfs);
  let termCwd = activeFilePath.includes('/') ? activeFilePath.slice(0, activeFilePath.lastIndexOf('/')) : '';
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
  if (activeCrumb) activeCrumb.textContent = activeFilePath.replace(/\//g, ' › ');
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
      saveProjectVfs(currentProject, vfs);
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

          const canRunFolder = Boolean(folderAppPath(item.path));
          node.innerHTML = `
            <span class="tree-arrow"><i class="codicon codicon-${arrowIcon}"></i></span>
            <span class="tree-icon icon-folder"><i class="codicon codicon-${folderIcon}"></i></span>
            <span class="tree-label">${getBasename(item.path)}</span>
            <div class="tree-node-actions">
              ${canRunFolder ? '<button class="node-action-btn run-node-btn" title="Run the application in this folder"><i class="codicon codicon-play"></i></button>' : ''}
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

          const runFolderBtn = node.querySelector('.run-node-btn');
          runFolderBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            runCode(item.path);
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
          const isCFile = item.path.toLowerCase().endsWith('.c');
          node.innerHTML = `
            <span class="tree-arrow"></span>
            ${getFileIcon(item.path)}
            <span class="tree-label">${getBasename(item.path)}</span>
            <div class="tree-node-actions">
              ${isCFile ? '<button class="node-action-btn run-node-btn" title="Compile and run this file"><i class="codicon codicon-play"></i></button>' : ''}
              <button class="node-action-btn btn-delete-node" title="Delete file"><i class="codicon codicon-trash"></i></button>
            </div>
          `;

          node.addEventListener('click', (e) => {
            if (e.target.closest('.node-action-btn')) return;
            openFile(item.path);
          });

          const runFileBtn = node.querySelector('.run-node-btn');
          runFileBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            openFile(item.path);
            runCode(item.path);
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
    termCwd = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
    setEditorValue(vfs[path].content || '', path);

    activeCrumb.textContent = path.replace(/\//g, ' › ');
    updateTerminalPrompt();
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
    const defaultName = parentFolder ? `${parentFolder}/program.c` : 'src/program.c';
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
    const folderName = folderNameArg || prompt('Enter new folder name (e.g. include, src, apps/demo):');
    if (!folderName) return false;

    const trimmed = folderName.trim().replace(/^[\/\\]+|[\/\\]+$/g, '').replace(/\\/g, '/');
    if (!trimmed) return false;

    if (vfs[trimmed]) {
      if (!folderNameArg) alert(`Folder "${trimmed}" already exists.`);
      return false;
    }

    const parts = trimmed.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      if (!vfs[currentPath]) {
        const parentOfFolder = i > 0 ? parts.slice(0, i).join('/') : '';
        vfs[currentPath] = { type: 'folder', parent: parentOfFolder };
      }
      expandedFolders.add(currentPath);
    }

    saveVfs();
    renderFileTree();
    return true;
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

  function fileHasMain(content) {
    return /^\s*(?:int|void)\s+main\s*\(/m.test(String(content || ''));
  }

  function folderAppPath(folderPath) {
    const prefix = `${folderPath}/`;
    const cFiles = Object.keys(vfs).filter((p) => (
      vfs[p].type === 'file' && p.startsWith(prefix) && p.toLowerCase().endsWith('.c')
    ));
    return cFiles.find((p) => p === `${prefix}main.c`)
      || cFiles.find((p) => fileHasMain(vfs[p].content))
      || null;
  }

  function resolveRunTarget(customFile) {
    if (!customFile) return activeFilePath || 'main.c';
    const cleaned = String(customFile).trim().replace(/^[\/\\]+|[\/\\]+$/g, '').replace(/\\/g, '/');
    if (vfs[cleaned]?.type === 'file') return cleaned;
    if (vfs[cleaned]?.type === 'folder') return folderAppPath(cleaned);
    const matches = Object.keys(vfs).filter((p) => (
      vfs[p].type === 'file' && (p === cleaned || p.endsWith(`/${cleaned}`))
    ));
    return matches.length === 1 ? matches[0] : cleaned;
  }

  const SANDBOX_RESERVED = new Set(['input', 'run.sh', 'build', 'build.tar', 'go-trim.txt']);

  function sandboxNameFor(filePath, used) {
    let base = filePath.split('/').pop().replace(/[^A-Za-z0-9._-]/g, '_');
    if (!/^[A-Za-z0-9]/.test(base)) base = `f_${base || 'file.txt'}`;
    if (base.split('.')[0] === 'code') base = `src_${base}`;
    let candidate = base.slice(0, 100);
    let i = 2;
    while (used.has(candidate) || SANDBOX_RESERVED.has(candidate) || candidate.split('.')[0] === 'code') {
      const dot = base.lastIndexOf('.');
      const stem = (dot === -1 ? base : base.slice(0, dot)).slice(0, 80);
      const ext = dot === -1 ? '' : base.slice(dot);
      candidate = `${stem}_${i}${ext}`.slice(0, 100);
      i += 1;
    }
    used.add(candidate);
    return candidate;
  }

  function rewriteLocalIncludes(content, alias) {
    return String(content || '').replace(/#\s*include\s*"([^"]+)"/g, (full, incPath) => {
      const norm = incPath.replace(/\\/g, '/').replace(/^\.\//, '');
      const key = alias.has(norm) ? norm : (alias.has(norm.split('/').pop()) ? norm.split('/').pop() : null);
      if (!key) return full;
      const target = alias.get(key);
      if (!target) return `/* inlined ${norm} */`;
      return `#include "${target}"`;
    });
  }

  function prepareCompilation(entryPath) {
    const headers = [];
    const libraries = [];
    const otherApps = [];

    for (const [path, item] of Object.entries(vfs)) {
      if (item.type !== 'file' || path === entryPath) continue;
      const ext = path.includes('.') ? path.split('.').pop().toLowerCase() : '';
      if (ext === 'h') headers.push(path);
      else if (ext === 'c') {
        if (fileHasMain(item.content)) otherApps.push(path);
        else libraries.push(path);
      }
    }

    headers.sort();
    libraries.sort();
    otherApps.sort();

    const used = new Set();
    const alias = new Map();
    const headerFiles = [];
    const inlined = [];

    headers.forEach((path) => {
      const name = sandboxNameFor(path, used);
      if (headerFiles.length < 8) {
        alias.set(path, name);
        const base = path.split('/').pop();
        if (!alias.has(base)) alias.set(base, name);
        headerFiles.push({ name, content: vfs[path].content || '' });
      } else {
        alias.set(path, '');
        const base = path.split('/').pop();
        if (!alias.has(base)) alias.set(base, '');
        inlined.push(path);
      }
    });

    const parts = [];
    inlined.forEach((path) => {
      parts.push(`/* inlined ${path} */\n${vfs[path].content || ''}`);
    });
    libraries.forEach((path) => {
      parts.push(`/* ${path} */\n${rewriteLocalIncludes(vfs[path].content, alias)}`);
    });
    parts.push(`/* ${entryPath} */\n${rewriteLocalIncludes(vfs[entryPath].content, alias)}`);

    return {
      code: parts.join('\n\n'),
      files: headerFiles,
      libraries,
      otherApps,
    };
  }

  // Code Execution Engine
  async function runCode(customFile) {
    if (vfs[activeFilePath] && vfs[activeFilePath].type === 'file') {
      vfs[activeFilePath].content = getEditorValue();
      saveVfs();
    }

    const targetPath = resolveRunTarget(customFile);
    const mainFile = targetPath ? vfs[targetPath] : null;
    const compiler = compilerSelect.value || 'gcc-15';
    const input = stdinInput.value;

    bottomPanel?.classList.remove('collapsed');
    switchPanelTab('terminal');

    if (!mainFile || mainFile.type !== 'file') {
      appendTerminal(`<span class="stderr-line">No application found${customFile ? ` for "${escapeHtml(String(customFile))}"` : ''}. Open a .c file, or run a folder that contains main.</span>\n`);
      return;
    }
    if (!targetPath.toLowerCase().endsWith('.c')) {
      appendTerminal(`<span class="stderr-line">"${escapeHtml(targetPath)}" is not a C source file.</span>\n`);
      return;
    }

    const built = prepareCompilation(targetPath);
    if (!built.code.trim()) {
      appendTerminal(`<span class="stderr-line">No C code found to compile in "${escapeHtml(targetPath)}".</span>\n`);
      return;
    }
    if (built.code.length > 100000) {
      appendTerminal(`<span class="stderr-line">This application is too large to compile (${built.code.length} characters; limit is 100000).</span>\n`);
      return;
    }

    runBtn.disabled = true;

    let note = `\n<span class="stdout-line">[Application ${escapeHtml(targetPath)} · ${escapeHtml(compiler)}]</span>\n`;
    if (built.libraries.length) {
      note += `<span class="stdout-line">[Also compiling ${escapeHtml(built.libraries.join(', '))}]</span>\n`;
    }
    if (built.otherApps.length) {
      note += `<span class="stdout-line">[Other applications left out: ${escapeHtml(built.otherApps.join(', '))}. Run one with the play button or: run &lt;path&gt;]</span>\n`;
    }
    appendTerminal(note);
    statusStatusText.innerHTML = '<i class="codicon codicon-sync"></i><span>Compiling...</span>';

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          compiler: compiler,
          code: built.code,
          files: built.files,
          input: input,
          time_limit: 15
        })
      });

      if (response.status === 401) { handleUnauthorized(); return; }
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

  function directoryOf(path) {
    const slash = String(path || '').lastIndexOf('/');
    return slash === -1 ? '' : path.slice(0, slash);
  }

  function terminalPathLabel() {
    if (activeFilePath && vfs[activeFilePath]?.type === 'file' && directoryOf(activeFilePath) === termCwd) {
      return `~/project/${activeFilePath}`;
    }
    return termCwd ? `~/project/${termCwd}` : '~/project';
  }

  function updateTerminalPrompt() {
    const el = document.getElementById('terminal-prompt-path');
    if (el) el.textContent = terminalPathLabel();
  }

  function resolveTermPath(input) {
    const raw = String(input || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    const stack = termCwd ? termCwd.split('/') : [];
    if (!raw || raw === '.') return stack.join('/');
    raw.split('/').forEach((part) => {
      if (!part || part === '.') return;
      if (part === '..') stack.pop();
      else stack.push(part);
    });
    return stack.join('/');
  }

  function findTermFolder(input) {
    const raw = String(input || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    if (!raw || raw === '.' || raw === '..' || raw.includes('..')) return resolveTermPath(raw);
    const relative = resolveTermPath(raw);
    if (vfs[relative]?.type === 'folder') return relative;
    if (vfs[raw]?.type === 'folder') return raw;
    const matches = Object.keys(vfs).filter((p) => vfs[p].type === 'folder' && (p === raw || p.endsWith(`/${raw}`)));
    return matches.length === 1 ? matches[0] : relative;
  }

  function listTermDir(dir) {
    const prefix = dir ? `${dir}/` : '';
    const kids = [];
    Object.entries(vfs).forEach(([path, item]) => {
      if (!path.startsWith(prefix)) return;
      const rest = path.slice(prefix.length);
      if (!rest || rest.includes('/')) return;
      kids.push({ name: rest, type: item.type });
    });
    kids.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return kids;
  }

  // Interactive Terminal Command Line Handler
  terminalCliInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmdRaw = terminalCliInput.value.trim();
      terminalCliInput.value = '';
      if (!cmdRaw) return;

      cliHistory.push(cmdRaw);
      cliHistoryIdx = cliHistory.length;

      appendTerminal(`<div class="terminal-prompt-line"><span class="prompt-user">gokul@myonlinec</span>:<span class="prompt-path">${escapeHtml(terminalPathLabel())}</span>$&nbsp;<span>${escapeHtml(cmdRaw)}</span></div>`);

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
  <span class="prompt-user">run [file|folder]</span> - Compile one application. Shared .c files are included; other mains are not
  <span class="prompt-user">git push</span>         - Push all project files & folders to GitHub
  <span class="prompt-user">git status</span>       - View files in virtual project tree
  <span class="prompt-user">cd &lt;folder&gt;</span>     - Enter a folder. The prompt shows that path
  <span class="prompt-user">cd ..</span>            - Go up one folder
  <span class="prompt-user">ls / dir</span>         - List the current folder
  <span class="prompt-user">pwd</span>             - Show the current file or folder path
  <span class="prompt-user">mkdir &lt;folder&gt;</span>    - Create new folder in project
  <span class="prompt-user">touch &lt;file&gt;</span>      - Create new file in project
  <span class="prompt-user">cat &lt;file&gt;</span>        - Display contents of a file
  <span class="prompt-user">clear</span>            - Clear terminal output
\n`);
        break;

      case 'run':
        runCode(arg1 ? resolveTermPath(arg1) : undefined);
        break;

      case 'pwd':
        appendTerminal(`<span class="stdout-line">${escapeHtml(terminalPathLabel())}</span>\n`);
        break;

      case 'cd': {
        if (!arg1 || arg1 === '~' || arg1 === '/') {
          termCwd = '';
          updateTerminalPrompt();
          break;
        }
        const dest = findTermFolder(arg1);
        if (!dest) {
          termCwd = '';
          updateTerminalPrompt();
          break;
        }
        if (vfs[dest]?.type !== 'folder') {
          appendTerminal(`<span class="stderr-line">cd: ${escapeHtml(arg1)}: No such folder. Type ls to see this folder.</span>\n`);
          break;
        }
        termCwd = dest;
        const entry = vfs[`${dest}/main.c`]?.type === 'file' ? `${dest}/main.c` : '';
        if (entry) openFile(entry);
        else updateTerminalPrompt();
        break;
      }

      case 'clear':
        outputTerminal.innerHTML = '';
        break;

      case 'ls':
      case 'dir': {
        const kids = listTermDir(termCwd);
        if (!kids.length) {
          appendTerminal('<span class="stdout-line">(empty)</span>\n');
          break;
        }
        let listOut = '<div style="margin: 4px 0;">';
        kids.forEach((kid) => {
          const isDir = kid.type === 'folder';
          listOut += `<span style="display:inline-block; margin-right: 18px; color: ${isDir ? '#e8a838' : '#519aba'};">${escapeHtml(kid.name)}${isDir ? '/' : ''}</span>`;
        });
        listOut += '</div>\n';
        appendTerminal(listOut);
        break;
      }

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

      case 'mkdir': {
        if (!arg1) {
          appendTerminal('<span class="stderr-line">mkdir: missing operand</span>\n');
          break;
        }
        const folderPath = resolveTermPath(arg1);
        if (promptNewFolder(folderPath)) {
          appendTerminal(`<span class="stdout-line">Created directory: ${escapeHtml(folderPath)}</span>\n`);
        } else if (vfs[folderPath]) {
          appendTerminal(`<span class="stderr-line">mkdir: cannot create '${escapeHtml(folderPath)}': File exists</span>\n`);
        }
        break;
      }

      case 'touch': {
        if (!arg1) {
          appendTerminal('<span class="stderr-line">touch: missing file operand</span>\n');
          break;
        }
        const filePath = resolveTermPath(arg1);
        if (vfs[filePath]?.type === 'folder') {
          appendTerminal(`<span class="stderr-line">touch: ${escapeHtml(filePath)}: Is a directory</span>\n`);
          break;
        }
        if (!vfs[filePath]) {
          const parts = filePath.split('/');
          let currentPath = '';
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
            if (!vfs[currentPath]) {
              vfs[currentPath] = { type: 'folder', parent: i > 0 ? parts.slice(0, i).join('/') : '' };
            }
            expandedFolders.add(currentPath);
          }
          vfs[filePath] = {
            type: 'file',
            parent: parts.length > 1 ? parts.slice(0, -1).join('/') : '',
            content: ''
          };
          saveVfs();
        }
        renderFileTree();
        openFile(filePath);
        appendTerminal(`<span class="stdout-line">Created file: ${escapeHtml(filePath)}</span>\n`);
        break;
      }

      case 'cat': {
        if (!arg1) {
          appendTerminal('<span class="stderr-line">cat: missing file operand</span>\n');
          break;
        }
        const filePath = resolveTermPath(arg1);
        if (!vfs[filePath]) {
          appendTerminal(`<span class="stderr-line">cat: ${escapeHtml(arg1)}: No such file</span>\n`);
        } else if (vfs[filePath].type === 'folder') {
          appendTerminal(`<span class="stderr-line">cat: ${escapeHtml(arg1)}: Is a directory</span>\n`);
        } else {
          appendTerminal(`<pre class="stdout-line">${escapeHtml(vfs[filePath].content || '(empty)')}</pre>\n`);
        }
        break;
      }

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
        headers: authHeaders(),
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
      if (response.status === 401) { handleUnauthorized(); return; }

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
      activeFilePath = firstOpenPath(vfs);
      openTabs = [activeFilePath];
      expandedFolders = folderSet(vfs);
      if (sample.compiler) compilerSelect.value = sample.compiler;
      setEditorValue(vfs[activeFilePath]?.content || '', activeFilePath);
      termCwd = activeFilePath.includes('/') ? activeFilePath.slice(0, activeFilePath.lastIndexOf('/')) : '';
      if (activeCrumb) activeCrumb.textContent = activeFilePath.replace(/\//g, ' › ');
      updateTerminalPrompt();
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

  // ── Project Switcher Logic ────────────────────────────────────────────────
  function renderProjectSelector() {
    const sel = document.getElementById('project-select');
    const nameEl = document.getElementById('project-name-display');
    if (!sel) return;
    sel.innerHTML = '';
    projectList.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === currentProject) opt.selected = true;
      sel.appendChild(opt);
    });
    if (nameEl) nameEl.textContent = currentProject;
  }

  function switchProject(name) {
    if (name === currentProject) return;
    // Save current state
    if (vfs[activeFilePath]) {
      vfs[activeFilePath].content = getEditorValue();
    }
    saveProjectVfs(currentProject, vfs);

    // Load new project
    currentProject = name;
    localStorage.setItem(ACTIVE_PROJ_KEY, name);
    vfs = loadProjectVfs(name);
    activeFilePath = firstOpenPath(vfs);
    openTabs = [activeFilePath];
    expandedFolders = folderSet(vfs);
    setEditorValue(vfs[activeFilePath]?.content || '', activeFilePath);
    termCwd = activeFilePath.includes('/') ? activeFilePath.slice(0, activeFilePath.lastIndexOf('/')) : '';
    if (activeCrumb) activeCrumb.textContent = activeFilePath.replace(/\//g, ' › ');
    updateTerminalPrompt();
    renderFileTree();
    renderTabs();
    renderProjectSelector();
    appendTerminal(`<span class="stdout-line">Switched to project: <strong>${escapeHtml(name)}</strong></span>\n`);
  }

  function createProject(name) {
    const trimmed = name?.trim();
    if (!trimmed) return;
    if (projectList.includes(trimmed)) {
      switchProject(trimmed);
      return;
    }
    projectList.push(trimmed);
    saveProjectList(projectList);
    // Initialize with default template
    saveProjectVfs(trimmed, JSON.parse(JSON.stringify(SAMPLES.hello.vfs)));
    switchProject(trimmed);
  }

  function deleteProject(name) {
    if (projectList.length <= 1) {
      alert('Cannot delete the last project.');
      return;
    }
    if (!confirm(`Delete project "${name}" and all its files? This cannot be undone.`)) return;
    const idx = projectList.indexOf(name);
    projectList.splice(idx, 1);
    saveProjectList(projectList);
    localStorage.removeItem(getVfsKey(name));
    switchProject(projectList[Math.max(0, idx - 1)]);
  }

  // Project UI listeners (elements added to sidebar in index.html)
  document.getElementById('btn-new-project')?.addEventListener('click', () => {
    const name = prompt('Enter new project name:');
    if (name) createProject(name);
  });

  document.getElementById('btn-delete-project')?.addEventListener('click', () => {
    deleteProject(currentProject);
  });

  document.getElementById('project-select')?.addEventListener('change', (e) => {
    switchProject(e.target.value);
  });

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() });
    } catch { /* ignore */ }
    handleUnauthorized();
  });

  // Show current logged-in user
  const loggedInUser = localStorage.getItem('myonlinec_user') || 'gokul';
  const userDisplayEl = document.getElementById('user-display');
  if (userDisplayEl) userDisplayEl.textContent = loggedInUser;

  renderProjectSelector();
  updateTerminalPrompt();

  // Start IDE
  initMonaco();
})();

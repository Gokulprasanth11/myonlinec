// MyOnlineC Frontend Script
(function () {
  'use strict';

  // Sample templates supporting single & multi-file projects
  const SAMPLES = {
    hello: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to MyOnlineC Compiler!\\n");
    return 0;
}
`
      },
      stdin: ''
    },
    multi_file: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>
#include "math_utils.h"

int main() {
    int x = 20, y = 8;
    printf("======================================\\n");
    printf("   Multi-File C Project in MyOnlineC  \\n");
    printf("======================================\\n\\n");

    printf("Sum:      %d + %d = %d\\n", x, y, add(x, y));
    printf("Multiply: %d * %d = %d\\n", x, y, multiply(x, y));
    printf("Power:    %d ^ 3 = %d\\n", x, power(x, 3));
    printf("Max:      max(%d, %d) = %d\\n", x, y, max(x, y));

    return 0;
}
`,
        'math_utils.h': `#ifndef MATH_UTILS_H
#define MATH_UTILS_H

static inline int add(int a, int b) {
    return a + b;
}

static inline int multiply(int a, int b) {
    return a * b;
}

static inline int power(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

static inline int max(int a, int b) {
    return (a > b) ? a : b;
}

#endif // MATH_UTILS_H
`
      },
      stdin: ''
    },
    ldd_inspect: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>
#include <stdlib.h>
#include <math.h>

int main() {
    printf("===================================================\\n");
    printf(" Dynamic Shared Library Inspection (ldd)           \\n");
    printf("===================================================\\n\\n");

    // Math operation to pull in libm
    double val = sqrt(256.0);
    printf("Computed sqrt(256.0) = %.2f\\n\\n", val);

    printf("Executing 'ldd /proc/self/exe' inside Debian container:\\n");
    printf("---------------------------------------------------\\n");
    fflush(stdout);

    // /proc/self/exe refers directly to the currently running process binary
    int ret = system("ldd /proc/self/exe");
    if (ret != 0) {
        // Fallback: direct dynamic linker inspection
        printf("\\nFallback to direct dynamic linker /lib64/ld-linux-x86-64.so.2:\\n");
        system("/lib64/ld-linux-x86-64.so.2 --list /proc/self/exe");
    }

    return 0;
}
`
      },
      stdin: ''
    },
    makefile_project: {
      compiler: 'bash-5.2',
      files: {
        'main.c': `# Execute Makefile and run compiled application
echo "=========================================="
echo " Building Project with Makefile via Make  "
echo "=========================================="
make clean
make

echo -e "\\n=========================================="
echo " Checking Dynamic Dependencies (ldd)     "
echo "=========================================="
ldd ./app

echo -e "\\n=========================================="
echo " Executing Compiled Application (./app)  "
echo "=========================================="
./app
`,
        'Makefile': `CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = app

all: $(TARGET)

$(TARGET): main.o utils.o
	$(CC) $(CFLAGS) -o $(TARGET) main.o utils.o -lm

main.o: app_main.c utils.h
	$(CC) $(CFLAGS) -c app_main.c -o main.o

utils.o: utils.c utils.h
	$(CC) $(CFLAGS) -c utils.c -o utils.o

clean:
	rm -f *.o $(TARGET)
`,
        'app_main.c': `#include <stdio.h>
#include "utils.h"

int main() {
    printf("Hello from C app compiled via Makefile!\\n");
    greet("Gokul");
    printf("Square of 12 is: %d\\n", square(12));
    return 0;
}
`,
        'utils.h': `#ifndef UTILS_H
#define UTILS_H

void greet(const char *name);
int square(int x);

#endif
`,
        'utils.c': `#include <stdio.h>
#include "utils.h"

void greet(const char *name) {
    printf("Hello %s! This function was compiled from utils.c.\\n", name);
}

int square(int x) {
    return x * x;
}
`
      },
      stdin: ''
    },
    sum: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>

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
      },
      stdin: '25 75'
    },
    fibonacci: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>

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
    int terms = 12;
    printFibonacci(terms);
    return 0;
}
`
      },
      stdin: ''
    },
    pointers: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        *(arr + i) = (i + 1) * 10;
    }

    printf("Dynamic Allocation & Pointer Traversal:\\n");
    for (int i = 0; i < n; i++) {
        printf("arr[%d] at address %p = %d\\n", i, (void *)(arr + i), *(arr + i));
    }

    free(arr);
    return 0;
}
`
      },
      stdin: ''
    },
    bubble_sort: {
      compiler: 'gcc-15',
      files: {
        'main.c': `#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);

    printf("Original array: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    bubbleSort(arr, n);

    printf("Sorted array:   ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}
`
      },
      stdin: ''
    }
  };

  // State Management
  let projectFiles = { ...SAMPLES.hello.files };
  let activeFileName = 'main.c';
  let monacoEditor = null;

  // DOM Elements
  const sampleSelect = document.getElementById('sample-select');
  const compilerSelect = document.getElementById('compiler-select');
  const runBtn = document.getElementById('run-btn');
  const resetBtn = document.getElementById('reset-btn');
  const downloadBtn = document.getElementById('download-btn');
  const formatBtn = document.getElementById('format-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const clearStdinBtn = document.getElementById('clear-stdin-btn');
  const copyOutputBtn = document.getElementById('copy-output-btn');
  const clearOutputBtn = document.getElementById('clear-output-btn');
  const stdinInput = document.getElementById('stdin-input');
  const outputConsole = document.getElementById('output-console');
  const metricsBar = document.getElementById('metrics-bar');
  const metricStatus = document.getElementById('metric-status');
  const metricExitCode = document.getElementById('metric-exit-code');
  const metricTime = document.getElementById('metric-time');
  const metricMemory = document.getElementById('metric-memory');
  const loadingOverlay = document.getElementById('loading-overlay');
  const cursorPosElem = document.getElementById('editor-cursor-pos');
  const fallbackEditor = document.getElementById('fallback-editor');
  const editorContainer = document.getElementById('editor-container');
  const fileTabsBar = document.getElementById('file-tabs-bar');
  const addFileBtn = document.getElementById('add-file-btn');

  // Detect file language for Monaco
  function getLanguageForFile(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.c') || lower.endsWith('.h')) return 'c';
    if (lower === 'makefile' || lower.endsWith('.mk')) return 'makefile';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
    return 'plaintext';
  }

  // Get icon class for file
  function getFileIconClass(filename) {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.h')) return 'header-file';
    if (lower === 'makefile' || lower.endsWith('.mk')) return 'make-file';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'sh-file';
    return '';
  }

  // Render Tabs
  function renderTabs() {
    fileTabsBar.innerHTML = '';
    const filenames = Object.keys(projectFiles);

    filenames.forEach(filename => {
      const tab = document.createElement('div');
      tab.className = `file-tab ${filename === activeFileName ? 'active' : ''}`;
      tab.title = filename;

      const icon = document.createElement('span');
      const iconType = getFileIconClass(filename);
      icon.className = `file-icon ${iconType}`;

      if (filename.toLowerCase().endsWith('.h')) {
        icon.textContent = 'h';
      } else if (filename.toLowerCase() === 'makefile' || filename.toLowerCase().endsWith('.mk')) {
        icon.textContent = 'mk';
      } else if (filename.toLowerCase().endsWith('.sh')) {
        icon.textContent = 'sh';
      } else {
        icon.textContent = 'c';
      }

      const name = document.createElement('span');
      name.className = 'file-name';
      name.textContent = filename;

      tab.appendChild(icon);
      tab.appendChild(name);

      // Only allow closing non-main files
      if (filename !== 'main.c') {
        const closeBtn = document.createElement('span');
        closeBtn.className = 'file-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = `Remove ${filename}`;
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFile(filename);
        });
        tab.appendChild(closeBtn);
      }

      tab.addEventListener('click', () => {
        switchFile(filename);
      });

      fileTabsBar.appendChild(tab);
    });
  }

  // Switch Active File
  function switchFile(newFileName) {
    if (newFileName === activeFileName) return;

    // Save current editor content
    projectFiles[activeFileName] = getEditorValue();

    // Switch active
    activeFileName = newFileName;
    setEditorValue(projectFiles[activeFileName] || '', newFileName);
    renderTabs();
  }

  // Delete a file
  function deleteFile(filename) {
    if (filename === 'main.c') return;
    if (confirm(`Remove file "${filename}"?`)) {
      delete projectFiles[filename];
      if (activeFileName === filename) {
        activeFileName = 'main.c';
        setEditorValue(projectFiles['main.c'] || '', 'main.c');
      }
      renderTabs();
    }
  }

  // Add a new file
  addFileBtn.addEventListener('click', function () {
    const fileCount = Object.keys(projectFiles).length;
    if (fileCount >= 8) {
      alert('Maximum 8 files allowed per project by the compiler sandbox.');
      return;
    }

    const filename = prompt('Enter new file name (e.g., utils.h, helper.c, Makefile):');
    if (!filename) return;

    const trimmed = filename.trim();
    if (!trimmed) return;

    if (projectFiles[trimmed] !== undefined) {
      alert(`File "${trimmed}" already exists.`);
      switchFile(trimmed);
      return;
    }

    // Default template based on extension
    let initialContent = '';
    if (trimmed.endsWith('.h')) {
      const guard = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      initialContent = `#ifndef ${guard}\n#define ${guard}\n\n// Add header declarations here\n\n#endif // ${guard}\n`;
    } else if (trimmed === 'Makefile') {
      initialContent = `CC = gcc\nCFLAGS = -Wall -O2\n\nall:\n\t$(CC) $(CFLAGS) -o app main.c\n`;
    } else if (trimmed.endsWith('.c')) {
      initialContent = `#include <stdio.h>\n\n// Helper functions\n`;
    }

    // Save current active content
    projectFiles[activeFileName] = getEditorValue();

    // Insert new file
    projectFiles[trimmed] = initialContent;
    activeFileName = trimmed;
    setEditorValue(initialContent, trimmed);
    renderTabs();
  });

  function getEditorValue() {
    if (monacoEditor) {
      return monacoEditor.getValue();
    }
    return fallbackEditor.value;
  }

  function setEditorValue(val, filename) {
    if (monacoEditor) {
      monacoEditor.setValue(val);
      if (filename) {
        const lang = getLanguageForFile(filename);
        const model = monacoEditor.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, lang);
        }
      }
    } else {
      fallbackEditor.value = val;
    }
  }

  // Initialize Monaco Editor
  function initEditor() {
    const initialCode = projectFiles[activeFileName] || '';
    fallbackEditor.value = initialCode;

    if (window.require && typeof window.require.config === 'function') {
      window.require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
        }
      });

      window.require(['vs/editor/editor.main'], function () {
        fallbackEditor.style.display = 'none';

        monacoEditor = monaco.editor.create(editorContainer, {
          value: initialCode,
          language: getLanguageForFile(activeFileName),
          theme: 'vs-dark',
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontSize: 14,
          lineHeight: 22,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderWhitespace: 'selection'
        });

        monacoEditor.onDidChangeCursorPosition(function (e) {
          cursorPosElem.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
          runCode();
        });
      }, function (err) {
        console.warn('Monaco CDN failed to load, keeping fallback editor.', err);
      });
    }

    fallbackEditor.addEventListener('keyup', updateFallbackCursor);
    fallbackEditor.addEventListener('click', updateFallbackCursor);
    renderTabs();
  }

  function updateFallbackCursor() {
    const text = fallbackEditor.value.substring(0, fallbackEditor.selectionStart);
    const lines = text.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;
    cursorPosElem.textContent = `Ln ${lineNum}, Col ${colNum}`;
  }

  // Load sample code
  sampleSelect.addEventListener('change', function () {
    const key = sampleSelect.value;
    const sample = SAMPLES[key];
    if (sample) {
      projectFiles = { ...sample.files };
      activeFileName = 'main.c';
      if (sample.compiler) {
        compilerSelect.value = sample.compiler;
      }
      setEditorValue(projectFiles['main.c'], 'main.c');
      if (sample.stdin !== undefined) {
        stdinInput.value = sample.stdin;
      }
      renderTabs();
    }
  });

  // Reset to current sample
  resetBtn.addEventListener('click', function () {
    const key = sampleSelect.value;
    const sample = SAMPLES[key] || SAMPLES.hello;
    projectFiles = { ...sample.files };
    activeFileName = 'main.c';
    if (sample.compiler) {
      compilerSelect.value = sample.compiler;
    }
    setEditorValue(projectFiles['main.c'], 'main.c');
    stdinInput.value = sample.stdin || '';
    renderTabs();
  });

  // Download active file
  downloadBtn.addEventListener('click', function () {
    projectFiles[activeFileName] = getEditorValue();
    const code = projectFiles[activeFileName];
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Format code
  formatBtn.addEventListener('click', function () {
    if (monacoEditor) {
      monacoEditor.getAction('editor.action.formatDocument')?.run();
    }
  });

  // Copy code
  copyCodeBtn.addEventListener('click', async function () {
    try {
      projectFiles[activeFileName] = getEditorValue();
      await navigator.clipboard.writeText(projectFiles[activeFileName]);
      const prev = copyCodeBtn.textContent;
      copyCodeBtn.textContent = 'Copied!';
      setTimeout(() => { copyCodeBtn.textContent = prev; }, 1500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  });

  // Clear Stdin
  clearStdinBtn.addEventListener('click', function () {
    stdinInput.value = '';
    stdinInput.focus();
  });

  // Copy Output
  copyOutputBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(outputConsole.innerText);
      const prev = copyOutputBtn.textContent;
      copyOutputBtn.textContent = 'Copied!';
      setTimeout(() => { copyOutputBtn.textContent = prev; }, 1500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  });

  // Clear Output
  clearOutputBtn.addEventListener('click', function () {
    outputConsole.innerHTML = '<code class="console-placeholder">Terminal cleared. Click "Run" to compile again.</code>';
    metricsBar.classList.add('hidden');
  });

  // Execute Code via /api/run
  async function runCode() {
    projectFiles[activeFileName] = getEditorValue();

    const mainCode = projectFiles['main.c'] || projectFiles[activeFileName];
    const input = stdinInput.value;
    const compiler = compilerSelect.value || 'gcc-15';

    if (!mainCode || !mainCode.trim()) {
      alert('Please enter code to compile.');
      return;
    }

    // Build secondary files array
    const secondaryFiles = [];
    for (const [name, content] of Object.entries(projectFiles)) {
      if (name !== 'main.c') {
        secondaryFiles.push({
          name: name,
          content: content
        });
      }
    }

    // Set UI to loading state
    runBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');
    outputConsole.innerHTML = '<span class="stdout-text">Compiling and executing in sandbox...</span>';

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          compiler: compiler,
          code: mainCode,
          files: secondaryFiles,
          input: input,
          time_limit: 15
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Compilation or execution failed.';
        outputConsole.innerHTML = `<span class="stderr-text">Error:\n${escapeHtml(errorMsg)}</span>`;
        if (result.details && result.details.output) {
          outputConsole.innerHTML += `\n<span class="stdout-text">${escapeHtml(result.details.output)}</span>`;
        }
        showMetrics({
          status: 'Failed',
          exitCode: result.details?.exit_code ?? -1,
          time: result.details?.time ? `${result.details.time}s` : '-',
          memory: '-'
        }, false);
        return;
      }

      const data = result.data || {};
      const stdout = data.output || '';
      const stderr = data.error || '';
      const exitCode = data.exit_code !== undefined ? data.exit_code : 0;
      const isSuccess = exitCode === 0 && (!data.status || data.status === 'success');

      let renderedHtml = '';
      if (stdout) {
        renderedHtml += `<span class="stdout-text">${escapeHtml(stdout)}</span>`;
      }
      if (stderr) {
        if (renderedHtml) renderedHtml += '\n';
        renderedHtml += `<span class="stderr-text">${escapeHtml(stderr)}</span>`;
      }
      if (!stdout && !stderr) {
        renderedHtml = `<span class="console-placeholder">[Program finished with no output (Exit Code: ${exitCode})]</span>`;
      }

      outputConsole.innerHTML = renderedHtml;

      // Format memory
      let memDisplay = '-';
      if (data.memory) {
        const kb = parseInt(data.memory, 10);
        if (!isNaN(kb)) {
          memDisplay = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;
        }
      }

      // Format time
      let timeDisplay = '-';
      if (data.time) {
        timeDisplay = `${(parseFloat(data.time) * 1000).toFixed(0)} ms`;
      } else if (data.total) {
        timeDisplay = `${(parseFloat(data.total) * 1000).toFixed(0)} ms`;
      }

      showMetrics({
        status: isSuccess ? 'Success' : 'Error',
        exitCode: exitCode,
        time: timeDisplay,
        memory: memDisplay
      }, isSuccess);

    } catch (err) {
      console.error('Run failed:', err);
      outputConsole.innerHTML = `<span class="stderr-text">Network or Server Error: ${escapeHtml(err.message)}</span>`;
      showMetrics({
        status: 'Error',
        exitCode: -1,
        time: '-',
        memory: '-'
      }, false);
    } finally {
      runBtn.disabled = false;
      loadingOverlay.classList.add('hidden');
    }
  }

  function showMetrics(metrics, isSuccess) {
    metricsBar.classList.remove('hidden');
    metricStatus.textContent = metrics.status;
    metricStatus.className = `metric-value status-badge ${isSuccess ? 'success' : 'error'}`;
    metricExitCode.textContent = metrics.exitCode;
    metricTime.textContent = metrics.time;
    metricMemory.textContent = metrics.memory;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  });

  runBtn.addEventListener('click', runCode);

  // Initialize
  initEditor();
})();

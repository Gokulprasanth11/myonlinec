// MyOnlineC Frontend Script
(function () {
  'use strict';

  // Sample templates
  const SAMPLES = {
    hello: {
      code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to MyOnlineC Compiler!\\n");
    return 0;
}
`,
      stdin: ''
    },
    sum: {
      code: `#include <stdio.h>

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
`,
      stdin: '25 75'
    },
    fibonacci: {
      code: `#include <stdio.h>

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
`,
      stdin: ''
    },
    pointers: {
      code: `#include <stdio.h>
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
`,
      stdin: ''
    },
    bubble_sort: {
      code: `#include <stdio.h>

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
`,
      stdin: ''
    }
  };

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

  let monacoEditor = null;

  // Initialize Monaco Editor or fallback
  function initEditor() {
    fallbackEditor.value = SAMPLES.hello.code;

    if (window.require && typeof window.require.config === 'function') {
      window.require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
        }
      });

      window.require(['vs/editor/editor.main'], function () {
        // Hide fallback textarea
        fallbackEditor.style.display = 'none';

        monacoEditor = monaco.editor.create(editorContainer, {
          value: SAMPLES.hello.code,
          language: 'c',
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

        // Update cursor position
        monacoEditor.onDidChangeCursorPosition(function (e) {
          cursorPosElem.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        // Add keyboard shortcut for Run inside Monaco
        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
          runCode();
        });
      }, function (err) {
        console.warn('Monaco CDN failed to load, keeping fallback editor.', err);
      });
    }

    // Fallback cursor position tracker
    fallbackEditor.addEventListener('keyup', updateFallbackCursor);
    fallbackEditor.addEventListener('click', updateFallbackCursor);
  }

  function updateFallbackCursor() {
    const text = fallbackEditor.value.substring(0, fallbackEditor.selectionStart);
    const lines = text.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;
    cursorPosElem.textContent = `Ln ${lineNum}, Col ${colNum}`;
  }

  function getCode() {
    if (monacoEditor) {
      return monacoEditor.getValue();
    }
    return fallbackEditor.value;
  }

  function setCode(code) {
    if (monacoEditor) {
      monacoEditor.setValue(code);
    } else {
      fallbackEditor.value = code;
    }
  }

  // Load sample code
  sampleSelect.addEventListener('change', function () {
    const key = sampleSelect.value;
    const sample = SAMPLES[key];
    if (sample) {
      setCode(sample.code);
      if (sample.stdin) {
        stdinInput.value = sample.stdin;
      }
    }
  });

  // Reset to current sample
  resetBtn.addEventListener('click', function () {
    const key = sampleSelect.value;
    const sample = SAMPLES[key] || SAMPLES.hello;
    setCode(sample.code);
    stdinInput.value = sample.stdin || '';
  });

  // Download .c file
  downloadBtn.addEventListener('click', function () {
    const code = getCode();
    const blob = new Blob([code], { type: 'text/x-c;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.c';
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
      await navigator.clipboard.writeText(getCode());
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
    const code = getCode();
    const input = stdinInput.value;
    const compiler = compilerSelect.value || 'gcc-15';

    if (!code.trim()) {
      alert('Please enter some C code to compile.');
      return;
    }

    // Set UI to loading state
    runBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');
    outputConsole.innerHTML = '<span class="stdout-text">Compiling and running...</span>';

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          compiler: compiler,
          code: code,
          input: input,
          time_limit: 10
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

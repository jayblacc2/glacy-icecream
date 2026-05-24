import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEBOUNCE_MS = 10 * 60 * 1000;
const WATCH_DIRS = [
  path.join(__dirname, 'frontend'),
  path.join(__dirname, 'backend'),
  path.join(__dirname, 'tests'),
];
const WATCHED_EXTENSIONS = new Set([
  '.js', '.mjs', '.json', '.html', '.css',
]);

let timer = null;
let pendingChanges = new Map();
let isRunning = false;

function shouldWatchFile(filePath) {
  const ext = path.extname(filePath);
  return WATCHED_EXTENSIONS.has(ext);
}

function collectChanges() {
  try {
    const status = execSync('git status --porcelain', {
      cwd: __dirname,
      encoding: 'utf-8',
    });
    const lines = status.trim().split('\n').filter(Boolean);
    return lines.map(line => {
      const status = line.substring(0, 2).trim();
      const file = line.substring(3).trim();
      return { status, file };
    });
  } catch {
    return [];
  }
}

function getCommitSummary(changes) {
  const added = changes.filter(c => c.status === '??' || c.status.startsWith('A'));
  const modified = changes.filter(c => c.status.startsWith('M') || c.status.startsWith(' '));
  const deleted = changes.filter(c => c.status.startsWith('D'));

  const parts = [];
  if (added.length > 0) parts.push(`${added.length} added`);
  if (modified.length > 0) parts.push(`${modified.length} modified`);
  if (deleted.length > 0) parts.push(`${deleted.length} deleted`);

  return parts.length > 0 ? parts.join(', ') : 'changes';
}

function runTests() {
  return new Promise((resolve) => {
    try {
      const output = execSync('npm test 2>&1', {
        cwd: __dirname,
        encoding: 'utf-8',
        timeout: 120000,
      });
      console.log('[Watcher] Tests passed');
      resolve({ passed: true, output });
    } catch (error) {
      console.log('[Watcher] Tests failed');
      resolve({ passed: false, output: error.stdout || error.message });
    }
  });
}

function autoCommit() {
  if (isRunning) return;
  isRunning = true;

  const changes = collectChanges();
  if (changes.length === 0) {
    console.log('[Watcher] No changes to commit');
    isRunning = false;
    return;
  }

  const summary = getCommitSummary(changes);
  console.log(`[Watcher] Detected changes: ${summary}`);
  console.log('[Watcher] Running tests before auto-commit...');

  runTests().then((result) => {
    if (!result.passed) {
      console.log('[Watcher] Tests failed — commit blocked');
      console.log(result.output);
      isRunning = false;
      return;
    }

    try {
      execSync('git add -A', { cwd: __dirname, encoding: 'utf-8' });
      const commitMsg = `auto: tests passed (${summary})`;
      execSync(`git commit -m "${commitMsg}"`, {
        cwd: __dirname,
        encoding: 'utf-8',
      });
      console.log(`[Watcher] Auto-committed: ${commitMsg}`);
    } catch (error) {
      console.error('[Watcher] Commit failed:', error.message);
    }

    isRunning = false;
  });
}

function debounceAutoCommit() {
  if (timer) clearTimeout(timer);
  console.log('[Watcher] Change detected, waiting 10min debounce...');
  timer = setTimeout(autoCommit, DEBOUNCE_MS);
}

const watchedFiles = new Set();

function watchDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const fullPath = path.join(dir, filename);

    if (watchedFiles.has(fullPath)) return;
    watchedFiles.add(fullPath);
    setTimeout(() => watchedFiles.delete(fullPath), 1000);

    if (shouldWatchFile(fullPath)) {
      pendingChanges.set(fullPath, Date.now());
      debounceAutoCommit();
    }
  });
}

console.log('[Watcher] Starting auto-commit watcher...');
console.log(`[Watcher] Watching directories: ${WATCH_DIRS.join(', ')}`);
console.log(`[Watcher] Debounce: ${DEBOUNCE_MS / 1000}s`);
console.log('[Watcher] Press Ctrl+C to stop');

WATCH_DIRS.forEach(watchDirectory);

process.on('SIGINT', () => {
  console.log('\n[Watcher] Stopping...');
  if (timer) clearTimeout(timer);
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (timer) clearTimeout(timer);
  process.exit(0);
});

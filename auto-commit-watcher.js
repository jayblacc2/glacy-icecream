import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEBOUNCE_MS = 60 * 60 * 1000;
const WATCH_DIRS = [
  path.join(__dirname, 'frontend'),
  path.join(__dirname, 'backend'),
  path.join(__dirname, 'tests'),
];
const WATCHED_EXTENSIONS = new Set([
  '.js', '.mjs', '.json', '.html', '.css',
]);
const AUTO_PUSH_ENABLED = true;

let timer = null;
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
      const s = line.substring(0, 2).trim();
      const file = line.substring(3).trim();
      return { status: s, file };
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
        timeout: 300000,
      });
      console.log('\n[Watcher] All tests passed');
      resolve({ passed: true, output });
    } catch (error) {
      console.log('\n[Watcher] Tests failed');
      resolve({ passed: false, output: error.stdout || error.message });
    }
  });
}

function askToCommit(changes) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`\n[Watcher] Changes detected: ${getCommitSummary(changes)}`);
    rl.question('[Watcher] Commit and push? (y/N) ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes');
    });
  });
}

async function run() {
  if (isRunning) return;
  isRunning = true;

  const changes = collectChanges();
  if (changes.length === 0) {
    console.log(`[Watcher] ${new Date().toLocaleTimeString()} — No changes to commit`);
    isRunning = false;
    return;
  }

  const fileList = changes.map(c => `  ${c.status}  ${c.file}`).join('\n');
  console.log(`\n[Watcher] Pending changes:\n${fileList}`);

  const result = await runTests();

  if (!result.passed) {
    console.log('[Watcher] Commit blocked — tests must pass first');
    console.log(result.output);
    isRunning = false;
    return;
  }

  const shouldCommit = await askToCommit(changes);

  if (!shouldCommit) {
    console.log('[Watcher] Commit skipped by user');
    isRunning = false;
    return;
  }

  try {
    execSync('git add -A', { cwd: __dirname, encoding: 'utf-8' });
    const commitMsg = `auto: tests passed (${getCommitSummary(changes)})`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: __dirname, encoding: 'utf-8' });
    console.log(`[Watcher] Committed: ${commitMsg}`);

    if (AUTO_PUSH_ENABLED) {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: __dirname, encoding: 'utf-8',
      }).trim();
      execSync(`git push origin ${branch}`, { cwd: __dirname, encoding: 'utf-8' });
      console.log(`[Watcher] Pushed to origin/${branch} — GitHub Actions triggered`);
    }
  } catch (error) {
    console.error('[Watcher] Commit or push failed:', error.message);
  }

  isRunning = false;
}

function debouncedRun() {
  if (timer) clearTimeout(timer);
  console.log(`\n[Watcher] ${new Date().toLocaleTimeString()} — Change detected, waiting 1h debounce...`);
  timer = setTimeout(run, DEBOUNCE_MS);
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
      debouncedRun();
    }
  });
}

console.log('[Watcher] Auto-commit watcher started');
console.log(`[Watcher] Watching: ${WATCH_DIRS.join(', ')}`);
console.log(`[Watcher] Debounce: ${DEBOUNCE_MS / 1000 / 60} minutes`);
console.log('[Watcher] Ctrl+C to stop');

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

#!/usr/bin/env node
/**
 * Step 7 Pre-Publish Placeholder Guard
 *
 * Scans source, public, HTML, and documentation files for unresolved
 * owner/counsel placeholder markers and exits with code 1 if any remain.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Build marker patterns dynamically so this script does not match itself.
const MARKERS = [
  ['[TO BE', 'CONFIRMED'].join(' '),
  ['[I WILL', 'PASTE'].join(' '),
];

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.next',
  '.vercel',
  '.firebase',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.html',
  '.htm',
  '.txt',
  '.xml',
  '.json',
  '.md',
  '.css',
  '.rules',
]);

const SELF_RELATIVE_PATH = path.normalize('scripts/check-placeholders.mjs');

function walk(dir, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      walk(fullPath, collected);
    } else if (entry.isFile()) {
      if (path.normalize(relPath) === SELF_RELATIVE_PATH) continue;
      if (entry.name === 'package-lock.json') continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.has(ext)) {
        collected.push({ fullPath, relPath });
      }
    }
  }
  return collected;
}

const files = walk(ROOT_DIR);
const findings = [];

for (const { fullPath, relPath } of files) {
  let content;
  try {
    content = fs.readFileSync(fullPath, 'utf8');
  } catch {
    continue;
  }

  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const marker of MARKERS) {
      if (line.includes(marker)) {
        findings.push({
          file: relPath,
          line: index + 1,
          marker,
          text: line.trim(),
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error(
    `FAIL: Found ${findings.length} unresolved placeholder${findings.length === 1 ? '' : 's'}:\n`
  );
  for (const finding of findings) {
    console.error(`  ${finding.file}:${finding.line}  ->  ${finding.text}`);
  }
  console.error('\nResolve all placeholders above before publishing.');
  process.exit(1);
}

console.log('PASS: No unresolved placeholders found.');

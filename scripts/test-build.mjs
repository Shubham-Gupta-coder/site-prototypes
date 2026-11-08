import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'v9.6/shutter');
const output = path.join(root, 'dist');
async function walk(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await walk(name)); else files.push(name);
  }
  return files;
}
const files = await walk(output);
for (const file of files) {
  const relative = path.relative(output, file);
  assert.deepEqual(await readFile(file), await readFile(path.join(source, relative)), relative);
  assert(relative === 'vendor/NOTICE.md' || !/\.(md|py|mp4|json|mjs)$/.test(relative), `Non-runtime file: ${relative}`);
}
const html = await readFile(path.join(output, 'index.html'), 'utf8');
assert(html.includes('noindex, nofollow'));
assert(html.includes('Shubham Gupta'));
for (const text of [html, ...(await Promise.all(files.filter(f => f.endsWith('.css')).map(f => readFile(f, 'utf8'))))]) {
  for (const match of text.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^\s)"']+)/g)) {
    const value = match[1] ?? match[2];
    if (/^(?:https?:|data:|#|mailto:|tel:)/.test(value)) continue;
    const pathname = decodeURIComponent(value.split(/[?#]/)[0]);
    assert(!pathname.startsWith('/'), `Unexpected root-absolute resource: ${value}`);
    assert((await stat(path.join(output, pathname))).isFile(), `Missing resource: ${value}`);
  }
}
for (const resource of ['worker.js', 'lib.js', 'shapes.js', 'copy.js', 'film.js', 'site.js', 'studio.js', 'vector-world.js', 'vendor/three.module.js', 'vendor/lenis.min.js']) {
  assert((await stat(path.join(output, resource))).isFile(), resource);
}
assert.equal(JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8')).outputDirectory, 'dist');
console.log(`PASS: ${files.length} runtime files byte-identical; local HTML/CSS resources resolve; no archives/docs; noindex retained.`);

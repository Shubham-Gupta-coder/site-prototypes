// Dependency-free production packaging. The source site is copied byte-for-byte.
import { cp, lstat, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'v9.6/shutter');
const output = path.join(root, 'dist');
const directories = new Set(['assets', 'fonts', 'vendor', 'stills']);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of await readdir(source, { withFileTypes: true })) {
  const runtimeFile = entry.isFile() &&
    (entry.name === 'index.html' || /\.(js|css)$/.test(entry.name));
  if (runtimeFile || (entry.isDirectory() && directories.has(entry.name))) {
    await cp(path.join(source, entry.name), path.join(output, entry.name), {
      recursive: true, dereference: false,
      filter: async (name) => !(await lstat(name)).isSymbolicLink(),
    });
  }
}
console.log('Built final v9.6 website at dist/ (archives, docs and video excluded).');

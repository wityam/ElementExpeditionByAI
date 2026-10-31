'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const registration = fs.readFileSync(path.join(root, 'pwa.js'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

assert.equal(manifest.display, 'standalone');
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose.includes('maskable')));
for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, icon.src.replace(/^\.\//, ''))), `${icon.src} exists`);
for (const [file, signature] of [['icons/icon-192.png', '89504e470d0a1a0a'], ['icons/icon-512.png', '89504e470d0a1a0a']]) {
  assert.equal(fs.readFileSync(path.join(root, file)).subarray(0, 8).toString('hex'), signature, `${file} is a PNG`);
}
assert.match(html, /<link\s+rel="manifest"\s+href="manifest\.webmanifest"/);
assert.match(html, /rel="apple-touch-icon"\s+href="icons\/icon-192\.png"/);
assert.match(html, /src="pwa\.js"/);
assert.match(registration, /location\.protocol === 'https:'/);
assert.match(registration, /location\.hostname === 'localhost'/);
assert.match(workerSource, /request\.mode === 'navigate'/);
assert.match(workerSource, /caches\.match\('\.\/index\.html'\)/);

class MockCache {
  constructor() { this.records = new Map(); }
  async addAll(items) {
    for (const item of items) this.records.set(new URL(item, baseUrl).href, new ResponseMock(`cached:${item}`));
  }
  async match(request) { return this.records.get(typeof request === 'string' ? new URL(request, baseUrl).href : request.url); }
  async put(request, response) { this.records.set(typeof request === 'string' ? new URL(request, baseUrl).href : request.url, response); }
}
class ResponseMock {
  constructor(body) { this.body = body; this.ok = true; this.type = 'basic'; }
  clone() { return new ResponseMock(this.body); }
  async text() { return this.body; }
}
const baseUrl = 'https://example.test/chemistry/';
const cacheMap = new Map();
const caches = {
  async open(name) { if (!cacheMap.has(name)) cacheMap.set(name, new MockCache()); return cacheMap.get(name); },
  async keys() { return [...cacheMap.keys()]; },
  async delete(name) { return cacheMap.delete(name); },
  async match(request) { for (const cache of cacheMap.values()) { const result = await cache.match(request); if (result) return result; } return undefined; }
};
const handlers = {};
const self = {
  location: new URL(baseUrl),
  clients: { claim: async () => {} },
  skipWaiting: async () => {},
  addEventListener(type, handler) { handlers[type] = handler; }
};
const context = vm.createContext({ self, caches, URL, Response: ResponseMock, console, fetch: async () => { throw new Error('offline'); } });
vm.runInContext(workerSource, context, { filename: 'service-worker.js' });

(async () => {
  let installTask;
  handlers.install({ waitUntil(promise) { installTask = promise; } });
  await installTask;
  assert.equal(cacheMap.size, 1);
  const cache = [...cacheMap.values()][0];
  for (const asset of ['./index.html', './styles.css', './game.js', './pwa.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png']) {
    assert.ok(await cache.match(asset), `offline app shell includes ${asset}`);
  }
  let navigationResponse;
  handlers.fetch({ request: { method: 'GET', mode: 'navigate', url: `${baseUrl}quiz` }, respondWith(promise) { navigationResponse = promise; } });
  const offline = await navigationResponse;
  assert.equal(await offline.text(), 'cached:./index.html', 'offline navigation returns cached app shell');
  console.log('PASS: PWA manifest, PNG/SVG icons, secure registration, app-shell coverage, and offline navigation fallback.');
})().catch((error) => { console.error(error); process.exitCode = 1; });

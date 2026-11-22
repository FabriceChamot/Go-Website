const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const { createApp } = require('../src/server');

const servers = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      server => new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      }),
    ),
  );
});

async function startServer() {
  const server = createApp().listen(0, '127.0.0.1');
  servers.push(server);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('health endpoint returns an OK status', async () => {
  const baseUrl = await startServer();
  const response = await fetch(`${baseUrl}/healthz`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('serves the Go homepage and its assets', async () => {
  const baseUrl = await startServer();
  const [home, stylesheet, illustration] = await Promise.all([
    fetch(baseUrl),
    fetch(`${baseUrl}/gosite_basic.css`),
    fetch(`${baseUrl}/illustrations/tutorial.png`),
  ]);

  assert.equal(home.status, 200);
  assert.match(await home.text(), /Think beyond/);
  assert.equal(stylesheet.status, 200);
  assert.equal(illustration.status, 200);
});

test('serves the Go demo page and generated browser bundle', async () => {
  const baseUrl = await startServer();
  const [demo, bundle] = await Promise.all([
    fetch(`${baseUrl}/demo/`),
    fetch(`${baseUrl}/demo/demo.bundle.js`),
  ]);

  assert.equal(demo.status, 200);
  assert.match(await demo.text(), /Demo Board/);
  assert.equal(bundle.status, 200);
});

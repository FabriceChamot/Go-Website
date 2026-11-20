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

test('serves the Baduk homepage', async () => {
  const baseUrl = await startServer();
  const response = await fetch(baseUrl);

  assert.equal(response.status, 200);
  assert.match(await response.text(), /<h1>Baduk<\/h1>/);
});

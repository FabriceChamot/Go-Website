const path = require('node:path');
const express = require('express');

function createApp() {
  const app = express();
  const publicDirectory = path.join(__dirname, '..', 'public');

  app.get('/healthz', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  app.use(express.static(publicDirectory));

  return app;
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  const app = createApp();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Baduk web server listening on port ${port}`);
  });
}

module.exports = { createApp };

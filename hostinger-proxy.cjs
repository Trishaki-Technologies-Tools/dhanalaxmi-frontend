const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');

const port = process.env.PORT || 3000;
const nitroPort = 3001;

// 1. Create proxy to internal Nitro server
const proxy = createProxyMiddleware({
  target: `http://localhost:${nitroPort}`,
  changeOrigin: true,
  ws: true,
});

// 2. Create the main server SYNCHRONOUSLY so Passenger can intercept `listen`
const server = http.createServer((req, res) => {
  proxy(req, res, () => {});
});

// 3. Listen on the port Passenger provides
server.listen(port, () => {
  fs.writeFileSync('boot.log', `Passenger server successfully started on port ${port}!\n`);
  
  // 4. Start the async Nitro server on a background port
  process.env.PORT = nitroPort;
  import('./.output/server/index.mjs').then(() => {
    fs.appendFileSync('boot.log', `Nitro SSR successfully started on background port ${nitroPort}!\n`);
  }).catch(err => {
    fs.appendFileSync('boot.log', `CRASH: ${err.stack || err}\n`);
    console.error(err);
  });
});

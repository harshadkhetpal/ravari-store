#!/usr/bin/env node
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ok: true, time: new Date().toISOString()}));
});
const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

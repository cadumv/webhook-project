const http = require('http');
const port = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Cloudflare Tunnel Keep-Alive\n');
}).listen(port, '0.0.0.0', () => {
  console.log(`Keep-alive server running on port ${port}`);
});
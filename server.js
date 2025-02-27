const http = require('http');
const port = process.env.PORT || 8080;
const host = '0.0.0.0';

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Keep-alive OK\n');
}).listen(port, host, () => {
  console.log(`Servidor keep-alive rodando em http://${host}:${port}`);
});

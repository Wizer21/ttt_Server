const http = require('http');
const url = require('url')

const hostname = '51.75.20.93';
const port = 3000;

const server = http.createServer((req, res) => {
  const url_parts = url.parse(request.url, true).pathname
  if(request.method === 'GET'){
    
    answer.end("done" + req)
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
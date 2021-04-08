const http = require('http');
const url = require('url')

// const hostname = '51.75.20.93';
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  // Allow Cross origin requests
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');

  const url_parts = url.parse(req.url, true).pathname
  if(req.method === 'GET'){
    res.end("done" + req)
  }
  else{    
    res.statusCode = 200;
    res.end('End');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;

const MIMETypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.tsx': 'text/plain',
  '.ts': 'text/plain'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  if (!path.extname(filePath) && filePath !== './') {
      if (fs.existsSync(filePath + '.tsx')) filePath += '.tsx';
      else if (fs.existsSync(filePath + '.ts')) filePath += '.ts';
      else if (fs.existsSync(filePath + '.js')) filePath += '.js';
  }

  const extname = path.extname(filePath);
  const contentType = MIMETypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
         res.writeHead(404);
         res.end(`File not found: ${filePath}`);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      if (extname === '.html') {
          let html = content.toString();
          const apiKey = process.env.API_KEY || '';
          const envScript = '<script>window.process = { env: { API_KEY: "' + apiKey + '" } };</script>';
          html = html.replace('</head>', envScript + '</head>');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
      } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

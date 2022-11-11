/* eslint-env node */

const fs = require('fs');
const http = require('http');
const path = require('path');
const util = require('util');
const { once } = require('events');

const port = 3005;
const address = `http://localhost:${port}/`;

let server = http.createServer((req, res) => {
  try {
    let data;
    if (req.url === '/') {
      const layoutDirectory = './test/layouts';
      const layouts = fs.readdirSync(path.join(__dirname, '..', layoutDirectory));
      data = `<ul>${layouts.filter(l => l.endsWith('.html')).map(l => `<li><a href="${layoutDirectory}/${l}">${l}</a></li>`).join('')}</ul>`;
    } else {
      data = fs.readFileSync(path.join(__dirname, '..', req.url));
    }

    if (req.url.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');

    if (req.url.endsWith('.html') || req.url === '/') {
      const template = fs.readFileSync(path.join(__dirname, './template.html'), 'utf-8');
      data = template.replace('%%body-content%%', data);
    }

    res.writeHead(200);
    res.end(data);
  } catch (error) {
    res.writeHead(404);
    res.end(JSON.stringify(error));
  }
  res.end();
});

server.listen(port, () => process.env.NODE_ENV !== 'test' && console.log(`Server listening on ${address}`));

module.exports = {
  address,
  listen: () => {
    server.unref();
    return once(server, 'listening');
  },
  close: util.promisify(server.close.bind(server))
};

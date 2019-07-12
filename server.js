const http = require('http');
const httpProxy = require('http-proxy');
const {port, config} = require('./config-server');

config
    .then(config => {
        const proxy = httpProxy.createServer();

        proxy.on('proxyRes', (proxyRes, req, res) => {
            if (res.shouldKeepAlive) {
                proxyRes.headers.connection = 'keep-alive';
            }
        });

        const server = http.createServer(((req, res) => {
            console.log(req);
            proxy.web(req, res, config, err => {
                console.error(err);

                if (!res.headersSent) {
                    res.statusCode = 502;
                    res.end('bad gateway');
                }
            });
        }));

        server.listen(port, () => {
            console.log(`proxy server is listening on port ${port}`);
        });
    })
    .catch(console.error);
const http = require('http');
const port = process.env.AUTH_PROXY_PORT || 8080;
const configKeys = [
    'proxyTargetHost',
    'proxyTargetPort',
    'proxyTargetProtocol',
    'proxyTargetKey',
    'proxyTargetCert',
    'proxyTargetPassphrase',
    'proxyTargetAuth',
];

function mapProperties(body) {
    return {
        target: {
            host: body.proxyTargetHost,
            port: body.proxyTargetPort,
            protocol: body.proxyTargetProtocol,
            key: body.proxyTargetKey,
            cert: body.proxyTargetCert,
            passphrase: body.proxyTargetPassphrase
        },
        auth: body.proxyTargetAuth,
        changeOrigin: true
    };
}

function ok(res, server) {
    res.statusCode = 200;
    res.write('OK');
    res.end(() => server.close());
}

function fail(e, res) {
    console.error(e);
    res.statusCode = 400;
    res.write(e.toString());
    res.end();
}

function parseBody({bodyStr, res, server, resolve}) {
    try {
        const body = JSON.parse(bodyStr.trim());
        const keys = Object.keys(body);
        const diff = configKeys.filter(x => !keys.includes(x));
        if (diff.length) {
            throw new Error(`Missing config keys: ${diff}`)
        }
        resolve(mapProperties(body));
        ok(res, server);
    } catch (e) {
        fail(e, res);
    }
}

function onRequest({req, res, server, resolve}) {
    let bodyStr = '';
    req.on('data', function(chunk) {
        bodyStr += chunk;
    });
    req.on('end', function() {
        parseBody({bodyStr, res, server, resolve});
    });
}

module.exports = {
    port,
    config: new Promise(resolve => {
        let server;
        server = http.createServer(((req, res) => onRequest({req, res, server, resolve})));
        server.listen(port, () => console.log(`config server is listening on port ${port}`));
    })
};
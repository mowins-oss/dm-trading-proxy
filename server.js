const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const KEY    = 'PKAL6V3BYVDTMT2JALXUMHIFT4';
const SECRET = 'GwvVoFMQEqzcgeyDJznpDAeVHCTCtmDUwAV9XAq8hpob';

app.get('/alpaca/*', async (req, res) => {
  const path = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://data.alpaca.markets/${path}${query ? '?' + query : ''}`;
  console.log('Proxying:', url);
  try {
    const r = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': KEY,
        'APCA-API-SECRET-KEY': SECRET,
        'Accept': 'application/json'
      }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'DM Trading Proxy running' }));

app.listen(process.env.PORT || 3000, () => console.log('Proxy running on port', process.env.PORT || 3000));

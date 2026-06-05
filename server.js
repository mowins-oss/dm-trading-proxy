const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());

const KEY = 'PKAL6V3BYVDTMT2JALXUMHIFT4';
const SECRET = 'GwvVoFMQEqzcgeyDJznpDAeVHCTCtmDUwAV9XAq8hpob';

app.get('/alpaca/*', async (req, res) => {
  const url = 'https://data.alpaca.markets/' + req.params[0] + '?' + new URLSearchParams(req.query);
  try {
    const r = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': KEY,
        'APCA-API-SECRET-KEY': SECRET
      }
    });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running'));

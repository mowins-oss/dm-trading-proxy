const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const ALPACA_KEY    = 'PKAL6V3BYVDTMT2JALXUMHIFT4';
const ALPACA_SECRET = 'GwvVoFMQEqzcgeyDJznpDAeVHCTCtmDUwAV9XAq8hpob';
const GROQ_KEY      = process.env.GROQ_KEY;
const TWELVE_KEY    = process.env.TWELVE_KEY;

app.get('/alpaca/*', async (req, res) => {
  const path = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://data.alpaca.markets/${path}${query ? '?' + query : ''}`;
  try {
    const r = await fetch(url, { headers: { 'APCA-API-KEY-ID': ALPACA_KEY, 'APCA-API-SECRET-KEY': ALPACA_SECRET }});
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/groq', async (req, res) => {
  try {
    const { system, messages, max_tokens } = req.body;
    const groqMessages = system ? [{ role: 'system', content: system }, ...messages] : messages;
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: groqMessages, max_tokens: max_tokens || 1500, temperature: 0.7 })
    });
    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.choices?.[0]?.message?.content || 'No response received.';
    res.json({ content: [{ type: 'text', text }] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Twelve Data proxy — intraday bars (1min, 5min, 15min, 30min, 1h, 4h).
// Key is read from the Render environment variable TWELVE_KEY (never hardcoded).
app.get('/twelve/*', async (req, res) => {
  const path = req.params[0];
  const qs = new URLSearchParams(req.query);
  qs.set('apikey', TWELVE_KEY);
  const url = `https://api.twelvedata.com/${path}?${qs.toString()}`;
  try {
    const r = await fetch(url);
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => res.json({ status: 'DM Trading Proxy running' }));
app.listen(process.env.PORT || 3000, () => console.log('Proxy running'));

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const ALPACA_KEY    = 'PKAL6V3BYVDTMT2JALXUMHIFT4';
const ALPACA_SECRET = 'GwvVoFMQEqzcgeyDJznpDAeVHCTCtmDUwAV9XAq8hpob';
const GROQ_KEY      = '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';

// ── Alpaca proxy
app.get('/alpaca/*', async (req, res) => {
  const path = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://data.alpaca.markets/${path}${query ? '?' + query : ''}`;
  console.log('Alpaca:', url);
  try {
    const r = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET,
        'Accept': 'application/json'
      }
    });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Groq proxy (free AI chat)
app.post('/groq', async (req, res) => {
  console.log('Groq request received');
  try {
    const { system, messages, max_tokens } = req.body;

    // Build Groq messages array with system message
    const groqMessages = [
      { role: 'system', content: system },
      ...messages
    ];

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: groqMessages,
        max_tokens: max_tokens || 1000,
        temperature: 0.7
      })
    });

    const data = await r.json();
    console.log('Groq response status:', r.status);

    // Reformat to match Anthropic response shape the app expects
    const text = data.choices?.[0]?.message?.content || 'Sorry, no response received.';
    res.json({ content: [{ type: 'text', text }] });

  } catch (e) {
    console.error('Groq error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'DM Trading Proxy running ✅' }));
app.listen(process.env.PORT || 3000, () => console.log('Proxy running on port', process.env.PORT || 3000));


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

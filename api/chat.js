export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json({
      content: [{ type: 'text', text: '⚠️ کلید ANTHROPIC_API_KEY در Vercel تنظیم نشده.' }]
    });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: max_tokens || 1200,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        content: [{ type: 'text', text: '⚠️ خطای Claude: ' + (data.error.message || JSON.stringify(data.error)) }]
      });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(200).json({
      content: [{ type: 'text', text: '⚠️ خطا: ' + error.message }]
    });
  }
}

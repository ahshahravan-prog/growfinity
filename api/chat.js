export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(200).json({
      content: [{ type: 'text', text: 'کلید GROQ_API_KEY تنظیم نشده' }]
    });
  }

  try {
    const { messages, system } = req.body;
    const groqMessages = [];
    if (system) groqMessages.push({ role: 'system', content: system });
    groqMessages.push(...messages);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1200,
        messages: groqMessages
      })
    });

    const data = await response.json();
    if (data.error) {
      return res.status(200).json({
        content: [{ type: 'text', text: 'خطای Groq: ' + (data.error.message || '') }]
      });
    }

    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (error) {
    res.status(200).json({ content: [{ type: 'text', text: 'خطا: ' + error.message }] });
  }
}

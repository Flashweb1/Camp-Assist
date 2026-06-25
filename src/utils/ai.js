const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const MODEL = 'openrouter/free';

export async function askAI(prompt, context = '', retries = 2) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are CampBot, a helpful assistant for CampAssist — a marketplace inside NYSC camp for corps members and vendors. You help users find vendors, place orders, understand camp life, and navigate the app. Be concise and friendly. Keep answers under 3 sentences when possible. Current camp context: ${context}`
        },
        { role: 'user', content: prompt }
      ]
    })
  });
  if (res.status === 429) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 2000));
      return askAI(prompt, context, retries - 1);
    }
    throw new Error('Too many requests. Please wait a moment then try again.');
  }
  if (!res.ok) throw new Error('AI service temporarily unavailable.');
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that.';
}

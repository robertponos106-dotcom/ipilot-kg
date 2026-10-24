// IPilot KG: Vercel serverless function. Proxies AI requests to OpenRouter.
// The key lives only in the OPENROUTER_API_KEY environment variable (Vercel -> Settings -> Environment Variables).
const MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const BASE = (process.env.OPENROUTER_BASE || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const GUARD = 'You are IPilot KG, a tax assistant for individual entrepreneurs in Kyrgyzstan. Answer only about taxes, reporting and IPilot. Never invent tax rates, deadlines or form cell numbers: use only the data in the user message. If unsure, say so and suggest calling the Tax Service at 116. Answer in the language requested in the user message.';
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now); hits.set(ip, list);
  return list.length > 20;
}
function clean(raw) {
  if (!Array.isArray(raw)) throw new Error('messages required');
  const out = []; let total = 0;
  for (const m of raw.slice(-20)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
    const c = String(m.content || '').slice(0, 20000);
    if (!c.trim()) continue;
    total += c.length; out.push({ role: m.role, content: c });
  }
  if (!out.length || out[out.length - 1].role !== 'user') throw new Error('last message must be from user');
  if (total > 60000) throw new Error('request too long');
  return out;
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(503).json({ error: 'OPENROUTER_API_KEY is not set' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'Too many requests' });
  let body = req.body, messages;
  try { if (typeof body === 'string') body = JSON.parse(body || '{}'); messages = clean(body && body.messages); }
  catch (e) { return res.status(400).json({ error: e.message }); }
  const system = GUARD + (body.json ? ' Reply with JSON only, no explanations, no markdown.' : '');
  try {
    const r = await fetch(BASE + '/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://ipilot.kg', 'X-Title': 'IPilot KG' },
      body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: system }].concat(messages), max_tokens: 900, temperature: 0.2 })
    });
    if (!r.ok) { console.error('OpenRouter', r.status, (await r.text()).slice(0, 300)); return res.status(r.status === 429 ? 429 : 502).json({ error: 'AI service error ' + r.status }); }
    const data = await r.json();
    let text = (((data.choices || [])[0] || {}).message || {}).content || '';
    if (Array.isArray(text)) text = text.map((p) => (p && p.text) || '').join('');
    return res.status(200).json({ text: String(text).trim() });
  } catch (e) { console.error(e); return res.status(502).json({ error: 'AI service unavailable' }); }
};

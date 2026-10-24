// IPilot KG: is the AI key configured?
module.exports = function handler(req, res) {
  res.status(200).json({ ok: Boolean(process.env.OPENROUTER_API_KEY), model: process.env.OPENROUTER_MODEL || 'openrouter/auto' });
};

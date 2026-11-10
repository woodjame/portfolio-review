/**
 * BIOBUZZ Portfolio Review — review server (Cloudflare Worker)
 *
 * The web page sends each review step here. This worker:
 *   1. only answers requests from your own sites (ALLOWED_ORIGINS),
 *   2. checks the team access code (ACCESS_CODES),
 *   3. enforces a daily limit per access code (optional, needs a KV namespace bound as USAGE),
 *   4. forwards the request to the Claude API with your secret API key and returns Claude's answer.
 * Nothing is stored except the optional daily counters.
 *
 * Settings (Cloudflare dashboard → your worker → Settings → Variables and Secrets):
 *   ANTHROPIC_API_KEY   (Secret, required)  your Claude API key from the Claude Console
 *   ACCESS_CODES        (Secret, optional)  comma-separated codes, e.g. "LARGO-16447,TEAM-12345". Empty = no code needed.
 *   ALLOWED_ORIGINS     (Text, recommended) comma-separated sites allowed to call this worker,
 *                                           e.g. "https://woodjame.github.io,https://enbytenprodigeez.org"
 *   MODEL_DEFAULT       (Text, optional)    model for page reviews, default "claude-sonnet-5-5"
 *   MODEL_COMPLEX       (Text, optional)    model for the award + section scoring, default "claude-sonnet-5-5"
 *   MAX_TOKENS          (Text, optional)    longest answer per step, default 16000
 *   DAILY_CALL_LIMIT    (Text, optional)    review steps allowed per access code per day, default 80 (one review ≈ 8 steps)
 * KV binding (optional): USAGE — turns on the daily limit.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MAX_BODY_BYTES = 20 * 1024 * 1024;
const MAX_IMAGES = 4;
const MAX_PROMPT_CHARS = 200000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = list(env.ALLOWED_ORIGINS);
    const originOk = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": originOk && origin ? origin : (allowed[0] || "*"),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-access-code",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    if (url.pathname === "/" && request.method === "GET") return json({ ok: true, service: "BIOBUZZ Portfolio Review" }, 200, cors);
    if (url.pathname !== "/review" || request.method !== "POST") return json({ error: "Not found" }, 404, cors);
    if (!originOk) return json({ error: "This website isn't allowed to use the review server." }, 403, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "The review server has no API key set up yet." }, 500, cors);

    // Team access code
    const codes = list(env.ACCESS_CODES);
    const code = (request.headers.get("x-access-code") || "").trim();
    if (codes.length && !codes.includes(code)) return json({ error: "That access code wasn't accepted." }, 401, cors);

    // Size and shape checks
    const len = Number(request.headers.get("content-length") || 0);
    if (len > MAX_BODY_BYTES) return json({ error: "That request is too large. Try a smaller PDF." }, 413, cors);
    let body;
    try { body = await request.json(); } catch { return json({ error: "The request wasn't valid JSON." }, 400, cors); }
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!prompt || prompt.length > MAX_PROMPT_CHARS) return json({ error: "The request text is missing or too long." }, 400, cors);
    const images = (Array.isArray(body.images) ? body.images : []).slice(0, MAX_IMAGES).filter(d => typeof d === "string" && d.length > 100);

    // Daily limit per access code (only if a KV namespace is bound as USAGE)
    if (env.USAGE) {
      const key = `${code || "open"}:${new Date().toISOString().slice(0, 10)}`;
      const used = Number(await env.USAGE.get(key)) || 0;
      const limit = Number(env.DAILY_CALL_LIMIT) || 80;
      if (used >= limit) return json({ error: "Your team has used today's review limit. Try again tomorrow." }, 429, cors);
      await env.USAGE.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
    }

    const model = body.tier === "complex" ? (env.MODEL_COMPLEX || "claude-sonnet-5-5") : (env.MODEL_DEFAULT || "claude-sonnet-5-5");
    const content = [
      ...images.map(data => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } })),
      { type: "text", text: prompt }
    ];

    let r;
    try {
      r = await fetch(API_URL, {
        method: "POST",
        headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: Number(env.MAX_TOKENS) || 16000, messages: [{ role: "user", content }] })
      });
    } catch {
      return json({ error: "Couldn't reach the Claude API. Try again in a minute." }, 502, cors);
    }
    let data = {};
    try { data = await r.json(); } catch {}
    if (r.status === 429 || r.status === 529) return json({ error: "Claude is busy right now. Wait a minute and try again." }, 429, cors);
    if (!r.ok) return json({ error: (data.error && data.error.message) || `Claude API error (${r.status}).` }, 502, cors);

    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return json({ text, truncated: data.stop_reason === "max_tokens", usage: data.usage || null }, 200, cors);
  }
};

function list(v) { return String(v || "").split(",").map(s => s.trim()).filter(Boolean); }
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "content-type": "application/json" } });
}

/**
 * 云端唱歌插件（可选）
 *
 * 云端没有统一的“唱歌 API”，所以这里做通用 HTTP 适配：
 *
 *   POST {endpoint}
 *   Authorization: Bearer <apiKey>   （有 Key 时）
 *   {
 *     "audio": "<base64 干声，可为空>",
 *     "lyrics": "歌词",
 *     "voice": "音色",
 *     "model": "模型"
 *   }
 *
 * 返回：
 *   - 直接音频字节；或
 *   - {"audio":"<base64>","format":"wav"}；或
 *   - {"url":"https://.../song.mp3"}（会再下载）
 *
 * 不同厂商（Suno / Udio / ACE / 自建）协议不同，按厂商文档改字段即可。
 */
function secret(ctx, cfg) {
  const env = String(cfg.apiKeyEnv || '').trim();
  if (env && ctx.env && ctx.env[env]) return String(ctx.env[env]);
  return String(cfg.apiKey || '');
}

export const singing = {
  id: 'cloud-sing',

  async sing({ audio, lyrics, voice, config }, ctx) {
    const cfg = ctx.config || {};
    const endpoint = String(cfg.endpoint || '').trim();
    if (!endpoint) throw new Error('云端唱歌未配置 endpoint（config.plugins.items["tts-sing-cloud"].endpoint）');
    const key = secret(ctx, cfg);
    const body = {
      audio: audio && audio.length ? Buffer.from(audio).toString('base64') : '',
      lyrics: String(lyrics || ''),
      voice: String(voice || ''),
      model: String(cfg.model || ''),
    };
    const headers = { 'content-type': 'application/json' };
    if (key) {
      headers.authorization = 'Bearer ' + key;
      if (cfg.header === 'x-api-key') {
        delete headers.authorization;
        headers['x-api-key'] = key;
      }
    }
    const r = await ctx.fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Number(cfg.timeoutMs) || 180000),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      throw new Error(`云端唱歌 HTTP ${r.status}: ${detail.slice(0, 300)}`);
    }
    const ct = String(r.headers?.get?.('content-type') || '');
    if (ct.includes('application/json')) {
      const j = await r.json();
      if (j.audio) return { buf: Buffer.from(String(j.audio), 'base64'), format: j.format || 'wav' };
      if (j.url) {
        const ar = await ctx.fetch(j.url, { signal: AbortSignal.timeout(120000) });
        if (!ar.ok) throw new Error('云端返回音频 URL，下载失败 HTTP ' + ar.status);
        return { buf: Buffer.from(await ar.arrayBuffer()), format: j.format || 'mp3' };
      }
      if (j.data?.[0]?.url) {
        const ar = await ctx.fetch(j.data[0].url, { signal: AbortSignal.timeout(120000) });
        if (!ar.ok) throw new Error('云端返回音频 URL，下载失败 HTTP ' + ar.status);
        return { buf: Buffer.from(await ar.arrayBuffer()), format: j.format || 'mp3' };
      }
      throw new Error('云端唱歌返回 JSON，但没有 audio/url');
    }
    return { buf: Buffer.from(await r.arrayBuffer()), format: 'wav' };
  },
};

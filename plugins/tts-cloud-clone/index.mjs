/**
 * 云端音色克隆插件（通用适配）
 *
 * 不同厂商的“创建音色”接口不同，这里用通用契约：
 *
 *   POST {endpoint}
 *   Authorization: Bearer <apiKey>
 *   {
 *     "name": "音色名",
 *     "audio": "<base64 参考音频>",
 *     "model": "可选的克隆模型"
 *   }
 *
 * 返回：
 *   { "voice_id": "..." } 或 { "voiceId": "..." } 或 { "id": "..." }
 *   可附带 tts：
 *   { "tts": { "baseUrl":"https://.../v1", "model":"tts-1", "voiceId":"..." } }
 *
 * 创建成功后，ENbot 会把音色写进「云端克隆」语音包；
 * 合成时由核心的 OpenAI 兼容 TTS 调用 tts.baseUrl + /audio/speech。
 */
function keyOf(ctx, cfg) {
  if (cfg.apiKeyEnv && ctx.env && ctx.env[cfg.apiKeyEnv]) return String(ctx.env[cfg.apiKeyEnv]);
  return String(cfg.apiKey || '');
}

export const voiceClone = {
  id: 'cloud-clone',

  async create({ audio, name, config }, ctx) {
    const cfg = ctx.config || {};
    const endpoint = String(cfg.endpoint || '').trim();
    if (!endpoint) throw new Error('云端克隆未配置 endpoint');
    const key = keyOf(ctx, cfg);
    const body = {
      name: String(name || '').trim(),
      audio: audio && audio.length ? Buffer.from(audio).toString('base64') : '',
      model: String(cfg.cloneModel || cfg.model || ''),
    };
    const headers = { 'content-type': 'application/json' };
    if (key) headers.authorization = 'Bearer ' + key;
    const r = await ctx.fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Number(cfg.timeoutMs) || 120000),
    });
    const ct = String(r.headers?.get?.('content-type') || '');
    const j = ct.includes('application/json') ? await r.json() : {};
    if (!r.ok) throw new Error(`云端克隆 HTTP ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
    const voiceId = String(j.voice_id || j.voiceId || j.id || '').trim();
    if (!voiceId) throw new Error('云端克隆返回里没有 voice_id');
    const tts = j.tts || {
      baseUrl: cfg.ttsBaseUrl || '',
      model: cfg.ttsModel || '',
      voiceId,
    };
    return { voiceId, tts, raw: j };
  },
};

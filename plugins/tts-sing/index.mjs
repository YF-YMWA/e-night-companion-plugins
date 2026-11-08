/**
 * 本地唱歌插件。
 *
 * 唱歌和 TTS 不同：这里输入通常是「干声 + 歌词/音色」，由 RVC / So-VITS-SVC /
 * DiffSinger 服务完成转换或合成。插件只负责 HTTP 适配，不内置模型。
 *
 * 安装：把 extras/tts-sing 复制到 plugins/tts-sing
 * 配置（config.plugins.items["tts-sing"]）：
 *   {
 *     "endpoint": "http://127.0.0.1:7890/sing",
 *     "model": "rvc",
 *     "mode": "conversion"
 *   }
 *
 * 约定本机服务：
 *   POST {endpoint}
 *   { "audio": "<base64 wav>", "lyrics": "...", "voice": "...", "model": "..." }
 *   返回音频字节，或 { "audio": "<base64>", "format": "wav" }。
 *
 * 没有统一的 RVC/So-VITS API，所以实际项目可以改这个插件里的字段映射。
 */
export const singing = {
  id: 'local-sing',
  model: 'rvc',

  async sing({ audio, lyrics, voice, config }, ctx) {
    const cfg = ctx.config || {};
    const endpoint = String(cfg.endpoint || 'http://127.0.0.1:7890/sing');
    const body = {
      audio: Buffer.from(audio || []).toString('base64'),
      lyrics: String(lyrics || ''),
      voice: String(voice || ''),
      model: String(cfg.model || 'rvc'),
    };
    const r = await ctx.fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Number(cfg.timeoutMs) || 180000),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      throw new Error(`本地唱歌 HTTP ${r.status}: ${detail.slice(0, 300)}`);
    }
    const ct = String(r.headers?.get?.('content-type') || '');
    if (ct.includes('application/json')) {
      const j = await r.json();
      if (j.audio) return { buf: Buffer.from(String(j.audio), 'base64'), format: j.format || 'wav' };
      throw new Error('本地唱歌返回 JSON，但没有 audio');
    }
    return { buf: Buffer.from(await r.arrayBuffer()), format: 'wav' };
  },
};

/**
 * 本地 TTS 插件。
 *
 * 不随主框架打包；安装：
 *   把 extras/tts-local 整个目录复制到 plugins/tts-local
 *
 * config.json（plugins.items 或 voice 覆盖）：
 *   "plugins": {
 *     "items": {
 *       "tts-local": {
 *         "mode": "gpt-sovits",
 *         "endpoint": "http://127.0.0.1:9880/tts",
 *         "referWav": "C:\\voice\\ref.wav",
 *         "promptText": "参考录音对应的文字",
 *         "promptLanguage": "zh"
 *       }
 *     }
 *   }
 *
 * 然后：
 *   "voice": {
 *     "provider": "plugin",
 *     "plugin": "tts-local",
 *     "localEndpoint": "http://127.0.0.1:9880/tts"
 *   }
 *
 * 不需要 apiKey。
 */

function pickAudioType(r) {
  const ct = String(r.headers?.get?.('content-type') || '');
  if (ct.includes('mpeg') || ct.includes('mp3')) return 'mp3';
  if (ct.includes('ogg')) return 'ogg';
  return 'wav';
}

export const tts = {
  id: 'local',
  model: 'local-tts',

  async synthesize({ text, voice, config }, ctx) {
    const cfg = ctx.config || {};
    const voiceCfg = config?.voice || {};
    const mode = String(cfg.mode || 'generic');
    const endpoint = String(
      voiceCfg.localEndpoint || cfg.endpoint || 'http://127.0.0.1:9880/tts',
    );

    if (mode === 'gpt-sovits') {
      const u = new URL(endpoint);
      u.searchParams.set('text', String(text));
      u.searchParams.set('text_language', String(cfg.textLanguage || 'zh'));
      if (cfg.referWav) u.searchParams.set('refer_wav_path', String(cfg.referWav));
      if (cfg.promptText) u.searchParams.set('prompt_text', String(cfg.promptText));
      u.searchParams.set('prompt_language', String(cfg.promptLanguage || 'zh'));
      const r = await ctx.fetch(u.toString(), {
        method: 'GET',
        signal: AbortSignal.timeout(Number(cfg.timeoutMs) || 60000),
      });
      if (!r.ok) throw new Error(`GPT-SoVITS HTTP ${r.status}`);
      return { buf: Buffer.from(await r.arrayBuffer()), format: pickAudioType(r) };
    }

    // 通用协议：POST JSON，返回音频字节，或 {audio: base64} / {url}
    const r = await ctx.fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: String(text),
        voice: String(voice || ''),
        model: String(cfg.model || voiceCfg.ttsModel || ''),
      }),
      signal: AbortSignal.timeout(Number(cfg.timeoutMs) || 60000),
    });
    if (!r.ok) throw new Error(`本地 TTS HTTP ${r.status}`);
    const ct = String(r.headers?.get?.('content-type') || '');
    if (ct.includes('application/json')) {
      const j = await r.json();
      if (j.audio) {
        return { buf: Buffer.from(String(j.audio), 'base64'), format: j.format || 'wav' };
      }
      if (j.url) {
        const a = await ctx.fetch(j.url, { signal: AbortSignal.timeout(60000) });
        if (!a.ok) throw new Error(`下载本地音频失败 HTTP ${a.status}`);
        return { buf: Buffer.from(await a.arrayBuffer()), format: pickAudioType(a) };
      }
      throw new Error('本地 TTS 返回 JSON，但没有 audio/url');
    }
    return { buf: Buffer.from(await r.arrayBuffer()), format: pickAudioType(r) };
  },
};

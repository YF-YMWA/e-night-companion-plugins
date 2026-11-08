/**
 * Ollama embedding 适配插件。
 *
 * 不随主框架打包；安装：
 *   把 extras/embedding-ollama 整个目录复制到 plugins/embedding-ollama
 *
 * 配置（config.json，plugins.items 里）：
 *   "plugins": {
 *     "items": {
 *       "embedding-ollama": {
 *         "baseUrl": "http://127.0.0.1:11434",
 *         "model": "bge-m3",
 *         "timeoutMs": 10000
 *       }
 *     }
 *   }
 *
 * 然后在 config.memory.embedding 里：
 *   "enabled": true,
 *   "plugin": "embedding-ollama"
 */
export const embedding = {
  id: 'ollama',
  model: 'bge-m3',
  dim: 0,

  async embed(texts, ctx) {
    const cfg = ctx.config || {};
    const base = String(cfg.baseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    const model = String(cfg.model || 'bge-m3');
    const timeoutMs = Number(cfg.timeoutMs) || 10000;
    const input = Array.isArray(texts) ? texts.map(String) : [String(texts)];

    const r = await ctx.fetch(base + '/api/embed', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, input }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      throw new Error(`Ollama ${r.status}: ${detail.slice(0, 200)}`);
    }
    const j = await r.json();
    if (!Array.isArray(j.embeddings)) {
      throw new Error('Ollama 返回里没有 embeddings[]');
    }
    return j.embeddings;
  },
};

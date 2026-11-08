# E Night Companion 插件市场

ENbot / E Night Companion 的可选插件仓库。

**插件不随主程序打包。** 主程序只保留 `plugins/demo-dice-notes` 作为示例；其余插件需要从这里按需安装。

## 当前插件

| 插件 | 能力 | 说明 |
|---|---|---|
| [demo-dice-notes](plugins/demo-dice-notes/) | tools / hooks | 示例：掷骰子、便签 |
| [embedding-ollama](plugins/embedding-ollama/) | embedding | 本地 Ollama 向量，推荐 `bge-m3` |
| [tts-local](plugins/tts-local/) | tts | 本地 TTS，不需要云端 Key；支持 GPT-SoVITS |
| [tts-sing](plugins/tts-sing/) | singing | 本地 RVC / So-VITS-SVC / DiffSinger 唱歌适配 |
| [tts-sing-cloud](plugins/tts-sing-cloud/) | singing | 云端唱歌，支持同步/异步/Replicate/fal |
| [tts-cloud-clone](plugins/tts-cloud-clone/) | voice-clone | 云端音色克隆，写入语音包 |

机器可读清单：[`marketplace.json`](marketplace.json)。  
字段格式：[`MARKETPLACE-FORMAT.md`](MARKETPLACE-FORMAT.md) · JSON Schema：[`marketplace.schema.json`](marketplace.schema.json) · 贡献说明：[`CONTRIBUTING.md`](CONTRIBUTING.md) · PR 模板：[`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)。

## 安装方式

1. 下载或复制插件目录。
2. 放到主程序的：

```text
plugins/<插件目录>/
```

3. 重启 ENbot。
4. 启动日志出现：

```text
[plugin] <插件> 已加载
```

Ollama embedding 还需要：

```bash
ollama pull bge-m3
```

并在 `config.json` 开启：

```json
"memory": {
  "embedding": {
    "enabled": true,
    "plugin": "embedding-ollama",
    "baseUrl": "http://127.0.0.1:11434",
    "model": "bge-m3"
  }
}
```

## 目录结构

```text
.
├── marketplace.json
├── README.md
├── LICENSE
└── plugins/
    ├── demo-dice-notes/
    │   ├── plugin.json
    │   └── index.mjs
    └── embedding-ollama/
        ├── plugin.json
        ├── index.mjs
        └── README.md
    └── tts-local/
        ├── plugin.json
        ├── index.mjs
        └── README.md
```

## 插件兼容性

- 主程序版本要求写在 `marketplace.json` 的 `requires.core`
- 插件清单格式见主程序 `docs/plugin-api.md`
- embedding 插件遵循主程序 `getEmbeddingProvider()` 扩展点

## 安全提醒

插件与主程序**同进程**，能读写文件、发网络请求、跑命令。

- 只安装自己写过或完整看过源码的插件
- 不建议直接运行来源不明的插件
- embedding 插件只访问本机 Ollama，不向外部发数据

## 版本

- 市场清单版本：1
- 更新日期：2026-11-08
- 主程序插件接口：见主程序 `docs/plugin-api.md`

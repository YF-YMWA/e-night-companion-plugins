# 插件市场格式（marketplace.json）

这是 `e-night-companion-plugins` 的唯一机器可读清单。主程序、启动器、后续脚本都只读这个文件。

## 顶层

```json
{
  "version": 1,
  "name": "E Night Companion Plugins",
  "description": "市场说明",
  "updatedAt": "2026-11-08",
  "plugins": []
}
```

## 单个插件

```json
{
  "id": "my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "path": "plugins/my-plugin",
  "download": "bundles/my-plugin.zip",
  "description": "一句话说明插件做什么",
  "author": "作者",
  "license": "MIT",
  "homepage": "https://github.com/...",
  "guideUrl": "https://github.com/YF-YMWA/e-night-companion-plugins/blob/main/plugins/my-plugin/GUIDE.md",
  "guide": "plugins/my-plugin/GUIDE.md",
  "capabilities": ["tools"],
  "permissions": ["none"],
  "requires": {
    "core": "0.9.0",
    "runtime": [],
    "model": ""
  },
  "setup": "安装后重启服务；需要额外运行时的在这里写清楚",
  "notes": "可选提醒"
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 目录名，只允许字母数字 `._-` |
| `name` | 是 | 显示名 |
| `version` | 是 | 语义化版本 |
| `path` | 是 | 仓库内插件目录 |
| `download` | 是 | 安装包 zip 路径 |
| `description` | 是 | 一句话说明 |
| `author` | 是 | 作者 |
| `guideUrl` | 是 | 直接可点的说明/引导链接 |
| `guide` | 是 | 仓库内说明文件相对路径 |
| `capabilities` | 是 | `tools` / `hooks` / `embedding` / `tts` / `singing` / `voice-clone` |
| `permissions` | 建议 | `none` / `local-network` / `files` / `network` / `process` |
| `requires.core` | 是 | 最低主程序版本 |
| `requires.runtime` | 建议 | 如 `Ollama`、`GPT-SoVITS` |
| `requires.model` | 建议 | 如 `bge-m3` |
| `setup` | 是 | 安装后要做什么 |
| `notes` | 否 | 风险/限制 |

## 能力约定

- `tools`：导出 `tools` 或同名函数
- `hooks`：导出 `onMessage` / `afterReply`
- `embedding`：导出 `embedding.embed(texts, ctx)`
- `tts`：导出 `tts.synthesize({ text, voice, config }, ctx)`
- `singing`：导出 `singing.sing({ audio, lyrics, voice, config }, ctx)`

## PR 必须包含

1. `plugins/<id>/plugin.json`
2. `plugins/<id>/index.mjs`
3. `plugins/<id>/GUIDE.md`（说明、安装、配置、卸载）
4. `bundles/<id>.zip`（根目录为 `<id>/`）
5. 本文件 `marketplace.json` 的条目

运行校验：

```bash
node tools/validate-market.mjs
```

## 安全

插件和主程序同进程，能读写文件、联网、跑命令。市场只收录源码可审查、说明完整的插件。

## 作者署名

`author` 是必填字段，必须写真实作者：

```json
{
  "author": "GitHub 用户名或昵称",
  "authorUrl": "https://github.com/<username>",
  "contributors": ["另一位贡献者"]
}
```

规则：

- 其他人 PR：`author` 用 PR 作者名，不能默认写 `ENbot`
- 多人：主作者 `author`，其他人 `contributors`
- 插件目录里的 `plugin.json`、`GUIDE.md` 同步作者名
- 不想公开真名可用 GitHub 用户名/昵称

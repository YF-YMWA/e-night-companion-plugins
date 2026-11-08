# 云端唱歌插件（可选，不随主包）

作者：ENbot

调用云端歌声合成/歌曲生成 API。**不内置任何 Key**，需要自己配置服务。

## 支持的返回形式

```text
1. 直接音频字节（audio/wav / audio/mpeg）
2. {"audio":"<base64>","format":"wav"}
3. {"url":"https://.../song.mp3"}
4. {"data":[{"url":"..."}]}
```

## 配置

```json
"plugins": {
  "items": {
    "tts-sing-cloud": {
      "endpoint": "https://你的服务/sing",
      "apiKey": "sk-...",
      "apiKeyEnv": "MY_SING_KEY",
      "model": "your-model",
      "timeoutMs": 180000
    }
  }
}
```

- `endpoint` 必填
- `apiKey` 可直接写，或写 `apiKeyEnv` 指到环境变量（推荐）
- 需要 `x-api-key` 头时设 `"header":"x-api-key"`
- Key 只存在本机 config，不进插件包/主包

## 请求

```json
{
  "audio": "<base64 干声，可为空>",
  "lyrics": "歌词",
  "voice": "音色",
  "model": "模型"
}
```

## 不同厂商

云端唱歌没有统一协议：

- Suno / Udio：多数是“生成任务”异步接口，需要轮询；这个插件是同步适配，需按实际 API 改
- ACE Studio：授权/API 不同
- 自建服务：按上面的契约最方便

如果厂商是异步任务，改 `index.mjs`：提交 → 轮询 → 下载音频。

## 安装

```text
extras/tts-sing-cloud/ → plugins/tts-sing-cloud/
```

然后在 `/voice-sing` 检查状态：

```text
GET /api/admin/voice/sing/status
```

配置 endpoint 并重启后，`usable` 才会是 true。

## 注意

- 云端按次/按量计费
- 歌词/人声版权自行确认
- 云端返回 mp3 时，ENbot 会按 `format` 标记，播放器可播
- 不进入 `ENbot-v*.zip`

# 云端音色克隆插件（可选，不随主包）

作者：ENbot

通用“创建音色”适配器。它只负责调用你的云端克隆接口，不内置 Key、不内置模型。

## 安装

```text
extras/tts-cloud-clone/ → plugins/tts-cloud-clone/
```

## 配置

```json
"plugins": {
  "items": {
    "tts-cloud-clone": {
      "endpoint": "https://你的服务/voices",
      "apiKey": "sk-...",
      "cloneModel": "可选",
      "ttsBaseUrl": "https://你的服务/v1",
      "ttsModel": "tts-1",
      "timeoutMs": 120000
    }
  }
}
```

- `endpoint`：创建音色接口
- `apiKey`：可用 `apiKeyEnv` 指向环境变量
- `ttsBaseUrl` / `ttsModel`：克隆成功后合成语音用的 OpenAI 兼容 TTS
- Key 只存本机 config 和 data/voice-packs.json，不进包

## 通用契约

```text
POST {endpoint}
Authorization: Bearer <apiKey>
{
  "name": "音色名",
  "audio": "<base64 参考音频>",
  "model": "可选克隆模型"
}
```

返回：

```json
{
  "voice_id": "xxx",
  "tts": {
    "baseUrl": "https://.../v1",
    "model": "tts-1",
    "voiceId": "xxx"
  }
}
```

也接受 `voiceId` / `id` 作为音色 ID。

## 使用

调音台 →「云端音色克隆」：

1. 填音色名称
2. 上传参考音频
3. 填克隆接口、Key、TTS 接口、TTS 模型
4. 开始云端克隆

成功后写入「云端克隆」语音包，可在当前音色里直接选。

接口：

```text
GET  /api/admin/voice/clone/status
POST /api/admin/voice/clone/create
```

## 注意

- 不同厂商创建音色的请求/返回不同，按厂商文档改 `index.mjs` 字段
- 克隆需要厂商授权；不要上传未经授权的声音
- 云端克隆通常按次/按量收费
- 不进入 `ENbot-v*.zip`

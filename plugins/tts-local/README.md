# 本地 TTS 插件（可选，不随框架打包）

不需要云端 API Key。需要本机跑一个 TTS 服务，插件只负责转 HTTP。

## 安装

把整个目录复制到：

```text
plugins/tts-local/
```

## 支持的接口

### 通用模式

本机服务：

```text
POST http://127.0.0.1:9880/tts
Content-Type: application/json

{"text":"你好","voice":"my-voice","model":"gpt-sovits"}
```

返回：

- 直接音频字节（wav/mp3/ogg），或
- `{"audio":"<base64>"}`，或
- `{"url":"http://.../x.wav"}`

配置：

```json
"plugins": {
  "items": {
    "tts-local": {
      "mode": "generic",
      "endpoint": "http://127.0.0.1:9880/tts",
      "timeoutMs": 60000
    }
  }
}
```

### GPT-SoVITS 模式

插件会请求：

```text
GET /tts?text=...&text_language=zh&refer_wav_path=...&prompt_text=...&prompt_language=zh
```

配置：

```json
"plugins": {
  "items": {
    "tts-local": {
      "mode": "gpt-sovits",
      "endpoint": "http://127.0.0.1:9880/tts",
      "referWav": "C:\\voice\\ref.wav",
      "promptText": "参考录音对应的文字",
      "promptLanguage": "zh"
    }
  }
}
```

## 启用

控制台：

```text
模型与功能 → 语音合成 → TTS 来源
```

选：

```text
本地插件（不需要 Key）
```

地址填本机服务地址，重启服务。

或用 `config.json`：

```json
"voice": {
  "provider": "plugin",
  "plugin": "tts-local",
  "localEndpoint": "http://127.0.0.1:9880/tts"
}
```

启动日志出现：

```text
[voice] 本地 TTS 插件已接入：tts-local
```

## 说明

- 本地 TTS 只负责“说话”，不会自动唱歌。
- 唱歌需要单独的 RVC / DiffSinger / So-VITS-SVC 流程。
- 插件和核心同进程，只装自己信任的插件。
- 插件失败会自动尝试云端 TTS（如果云端 Key 还在）；没有云端 Key 就返回错误。

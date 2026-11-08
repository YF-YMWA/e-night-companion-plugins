# 本地唱歌插件（可选，不随主包）

作者：ENbot

唱歌不是 TTS。没有安装唱歌模型时，主程序仍可正常聊天和说话。

## 适用模型

- RVC / So-VITS-SVC：干声 → 目标音色歌声
- DiffSinger / OpenUtau：歌词 + 曲谱 → 歌声
- 其他自建 HTTP 歌声服务

插件不内置任何模型，只调用本机服务。

## 安装

复制目录：

```text
extras/tts-sing/ → plugins/tts-sing/
```

## 本机服务契约

插件向：

```text
POST http://127.0.0.1:7890/sing
```

发送：

```json
{
  "audio": "<base64 wav 干声>",
  "lyrics": "歌词",
  "voice": "音色名",
  "model": "rvc"
}
```

返回：

- 直接音频字节（wav），或
- `{"audio":"<base64>","format":"wav"}`

## 配置

```json
"plugins": {
  "items": {
    "tts-sing": {
      "endpoint": "http://127.0.0.1:7890/sing",
      "model": "rvc",
      "timeoutMs": 180000
    }
  }
}
```

## 验证

控制台/接口：

```text
GET /api/admin/voice/sing/status
POST /api/admin/voice/sing
```

状态返回 `available: false` 说明没装/没加载唱歌插件。

## 注意

- RVC/So-VITS 的 API 各家不同，插件里的字段可能需要按你的服务改。
- 没有曲谱/干声时无法凭空唱歌；DiffSinger 需要 MIDI/曲谱。
- 只使用自己或已获授权的声音。
- 唱歌插件不进入 `ENbot-v*.zip`。

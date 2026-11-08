# 本地唱歌插件（可选，不随主包）

作者：ENbot

唱歌不是 TTS。没有安装唱歌模型时，主程序仍可正常聊天和说话。

## 适用模型

- RVC / So-VITS-SVC：干声 → 目标音色歌声
- DiffSinger / OpenUtau：歌词 + 曲谱 → 歌声
- 其他自建 HTTP 歌声服务

插件不内置任何模型，只调用本机服务。

## 安装插件

复制目录：

```text
extras/tts-sing/ → plugins/tts-sing/
```

或从插件市场安装 `tts-sing`。

## 选择模型

### RVC（推荐先做）

适合：用一段干声转成目标音色，保留原唱旋律。

需要：

```text
RVC WebUI / RVC 整合包
目标音色 .pth
可选 .index
```

模型放到 RVC 的：

```text
assets/weights/<name>.pth
logs/<name>/added_*.index
```

RVC WebUI 本身是 Gradio 界面，不直接提供统一的 `/sing` API；需要一层 HTTP 包装（见下面的服务契约），或使用你已有的 RVC API。

### So-VITS-SVC

适合：更接近歌声转换/音色克隆，配置比 RVC 复杂。

需要：

```text
So-VITS-SVC 推理环境
config.json
G_*.pth
```

按 So-VITS 的 `inference_main.py` / API 启动；同样包装成 `/sing`。

### DiffSinger / OpenUtau

适合：从歌词 + 曲谱/MIDI 合成歌声。

需要：

```text
DiffSinger 模型
MIDI / 曲谱
```

和 RVC 不同，它需要音高/时值信息；没有曲谱不能凭空唱。

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

## 启动服务

示例流程：

1. 启动 RVC / So-VITS-SVC 的推理环境
2. 用你的 HTTP 包装服务监听 `127.0.0.1:7890`
3. 确认：

```text
GET http://127.0.0.1:7890/sing  → 能返回响应（404/405 也算服务活着）
```

4. ENbot 里：

```text
/voice-sing → 重新检测
```

状态显示：

```text
✓ 插件已加载，后端可达
```

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

```text
GET  /api/admin/voice/sing/status
POST /api/admin/voice/sing
```

没有后端时：

```json
{
  "available": true,
  "usable": false,
  "note": "唱歌插件已加载，但本地 RVC / So-VITS-SVC 服务没有启动"
}
```

## 注意

- 唱歌需要干声/曲谱，不能只输入文字就生成歌曲
- 不同 RVC/So-VITS 版本的 API 不同，插件字段按实际服务改
- 显存：RVC 推理通常 2–6GB，训练更高
- 只使用自己或已获授权的声音
- 唱歌插件不进入 `ENbot-v*.zip`

# Ollama Embedding 插件（可选，不随框架打包）

作者：ENbot

这个目录**不会**进入 `ENbot-v*.zip` 主包。需要自己安装。

## 1. 安装 Ollama 和模型

```bash
ollama pull bge-m3
ollama list
```

模型占用大约 1.5–2GB 显存/内存。

## 2. 安装插件

把整个目录复制到：

```text
plugins/embedding-ollama/
```

最终结构：

```text
plugins/embedding-ollama/plugin.json
plugins/embedding-ollama/index.mjs
```

## 3. 配置插件连接

`config.json`：

```json
"plugins": {
  "items": {
    "embedding-ollama": {
      "baseUrl": "http://127.0.0.1:11434",
      "model": "bge-m3",
      "timeoutMs": 10000
    }
  }
}
```

## 4. 启用 embedding

`config.json`：

```json
"memory": {
  "embedding": {
    "enabled": true,
    "plugin": "embedding-ollama",
    "model": "bge-m3"
  }
}
```

重启服务。

## 5. 验证

启动日志出现：

```text
[memory] embedding 插件已接入：embedding-ollama / bge-m3
```

如果出现：

```text
[memory] 配置启用了 embedding，但没找到导出 embedding 的插件
```

说明插件目录或导出名不对，会自动退回本地哈希向量，聊天不会中断。

## 注意

- 这是可选能力，不装也能用本地哈希向量。
- embedding 失败会自动退回本地向量。
- 插件和核心同进程，只安装自己信任的插件。
- 首次检索会把记忆文本批量向量化，可能多几十到几百毫秒；之后走缓存。

## Windows 一键准备（推荐）

便携 Ollama 放在：

```text
default-workspace\Ollama\
```

首次安装/修复：

```powershell
powershell -ExecutionPolicy Bypass -File Ollama\install-ollama.ps1
```

加开机自启：

```powershell
powershell -ExecutionPolicy Bypass -File Ollama\install-ollama.ps1 -AutoStart
```

脚本会下载 Ollama、从 ModelScope/HF 镜像下载 `bge-m3`、创建模型并启动 `11434`。

当前机器已加入启动目录：

```text
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ENbot Ollama.lnk
```

手动启动：

```text
Ollama\start-ollama.bat
```

安装市场插件时，ENbot 会自动写入：

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

Ollama 没启动时会自动退回本地哈希向量，不会阻塞聊天。

## 和 embedding-ollama 插件一起安装

插件包内自带：

```text
setup-ollama.ps1
```

在插件目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File setup-ollama.ps1 -AutoStart
```

脚本会把 Ollama + bge-m3 装到：

```text
%LOCALAPPDATA%\ENbot\Ollama
```

不会把 2GB 运行时塞进插件包；更新插件也不会覆盖模型。

执行完回 ENbot：

1. 确认 `memory.embedding.enabled=true`
2. 重启服务
3. 日志应出现 `embedding-ollama / bge-m3`

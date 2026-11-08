# Ollama Embedding 插件（可选，不随框架打包）

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

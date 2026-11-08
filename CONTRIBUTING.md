# 贡献插件

## 目录

```text
plugins/<id>/
  plugin.json
  index.mjs
  GUIDE.md
bundles/<id>.zip
marketplace.json
```

## 格式

完整字段见 [`MARKETPLACE-FORMAT.md`](MARKETPLACE-FORMAT.md) 和 [`marketplace.schema.json`](marketplace.schema.json)。

至少要有：

- `id` / `name` / `version`
- `description`：一句话说明
- `guideUrl`：可点击的说明链接
- `setup`：安装后操作
- `capabilities`：插件能力
- `requires.core`：最低主程序版本
- `download`：对应 zip

## 打包

zip 根目录必须是：

```text
<id>/
  plugin.json
  index.mjs
  GUIDE.md
```

## 校验

```bash
node tools/validate-market.mjs
```

## PR

使用 `.github/PULL_REQUEST_TEMPLATE.md`，写清楚说明、引导、权限和测试。

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
- `author`：作者名（必须和 PR 作者一致，不能默认写 `ENbot`）
- `contributors`：可选，额外贡献者
- `description`：一句话说明
- `guideUrl`：可点击的说明链接
- `setup`：安装后操作
- `capabilities`：插件能力
- `requires.core`：最低主程序版本
- `download`：对应 zip

## 作者署名

- 其他人提 PR：`marketplace.json` 的 `author` 写 PR 作者名
- `plugin.json` 的 `author` 同步
- `GUIDE.md` 开头写作者名
- 多人合作：主作者写 `author`，其他人写 `contributors`
- 维护者合并前检查，发现默认写成 `ENbot` 要改回真实作者
- 作者不想公开真名时，可以写 GitHub 用户名或昵称

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

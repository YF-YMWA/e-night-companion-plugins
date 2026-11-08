## 插件信息

- 插件 ID：
- 名称：
- 版本：
- 作者名（会写进 marketplace.json / plugin.json / GUIDE.md）：
- GitHub 用户名：
- 是否允许在市场中显示作者名：是 / 否
- 能力（tools/hooks/embedding/tts/singing）：
- 最低主程序版本：

> 如果 PR 不是 ENbot 官方提交，维护者合并前必须把 `author` 改成 PR 作者名，
> 不能默认写成 `ENbot`；额外贡献者写进 `contributors`。

## 说明与引导

- [ ] `plugins/<id>/GUIDE.md` 已写清楚安装、配置、使用、卸载
- [ ] `plugins/<id>/GUIDE.md` 已写作者名
- [ ] `marketplace.json` 已包含 `author`（和 PR 作者一致）
- [ ] `marketplace.json` 已包含 `description` / `guideUrl` / `setup`
- [ ] 依赖运行时/模型已写进 `requires`

## 安全检查

- [ ] 我审查了源码
- [ ] 说明了网络/文件/命令权限
- [ ] 不包含密钥、Cookie、聊天记录
- [ ] 不包含与功能无关的大文件

## 验证

- [ ] `node tools/validate-market.mjs` 通过
- [ ] 解压 `bundles/<id>.zip` 后根目录为 `<id>/`
- [ ] 安装到 plugins/ 后主程序能加载
- [ ] 说明中的示例配置可用

## 备注

<!-- 安装、限制、已知问题 -->

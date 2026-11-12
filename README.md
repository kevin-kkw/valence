# Valence

跨 session 接手仓库。先读 [HANDOFF.md](HANDOFF.md)，了解已完成工作、验证范围与尚缺的上下文。

当前保存了一个完整可运行的网页版生存游戏 Demo《土豆突围》。用户提到的**化学游戏**来自另一个 ChatGPT 对话，其具体设计尚未带入本仓库；不要把这里的土豆游戏当成已经确认的化学游戏方案。

## 已有 Demo

[打开《土豆突围》](https://potato-survivors-ember.goodcamel13.chatgpt.site)（Sites 当前为原账号私有访问）。

源码位于 [demos/potato-survivors](demos/potato-survivors)。无运行时 JS 依赖，无需安装包或构建。

```bash
cd demos/potato-survivors
npm run dev
```

浏览器打开 `http://localhost:3000`。需要 Node.js 20+（测试）与 Python 3（本地静态服务器）。也可以用任意静态服务器提供 `dist/`。

```bash
npm test
npm run check
```

玩法：WASD／方向键移动，自动攻击，拾取经验后升级三选一；坚持 180 秒获胜。ESC 暂停，手机有触屏摇杆。

## 接手入口

- [交接说明与当前状态](HANDOFF.md)
- [协作约定](AGENTS.md)
- [Demo 文件说明](demos/potato-survivors/README.md)
- [原设计记录](demos/potato-survivors/docs/superpowers/specs/2026-11-12-potato-design.md)
- [原实现记录](demos/potato-survivors/docs/superpowers/plans/2026-11-12-potato.md)

本 GitHub 仓库是保存和继续开发的来源，目前未配置自动部署；推送这里不会自动更新现有 Sites 网页。

# Valence

跨 session 接手仓库。先读 [HANDOFF.md](HANDOFF.md)，了解已完成工作、验证范围与尚缺的上下文。

当前包含两份**不同成熟度**的内容：① 已完成的网页版生存游戏 Demo《土豆突围》；② **化学 Roguelite 游戏 VALENCE 的设计文档**（尚未开发/验证）。不要把前者当成后者已经实现。详情见 [VALENCE GDD v0.1](docs/VALENCE_GDD_v0.1_Codex.md)。

## VALENCE 化学游戏设计

- [游戏设计与 Codex MVP 开发规格（GDD v0.1）](docs/VALENCE_GDD_v0.1_Codex.md)
- 玩法：收集原子 → 合成分子装备 → 在战斗中触发化学反应；首次原型只支持 H/O/C 和六种分子。
- 当前状态：**设计已保存，化学原型尚未实现**。新 session 先阅读 [HANDOFF.md](HANDOFF.md)，不要把 GDD 中的建议引擎当作既定决策。

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

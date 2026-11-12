# 土豆突围 · Potato Survivors

完整可玩的原创 Canvas 生存游戏原型，玩法受 arena survivors 类型启发。核心范围由用户确认，用户已试玩并认可 Demo。

在本目录运行：

```bash
npm run dev
npm test
npm run check
```

本地地址 `http://localhost:3000`。无需安装 JS 依赖或构建；`dist/` 直接包含源码。Node.js 20+ 用于测试，Python 3 用于开发静态服务器。

WASD／方向键移动，自动攻击，拾取绿色结晶升级，按 1/2/3 或点击选择强化，ESC 暂停。手机有触屏摇杆。存活 180 秒获胜，死亡可立即重开。

现有网页： https://potato-survivors-ember.goodcamel13.chatgpt.site （原账号私有）。`.openai/hosting.json` 属于此 Demo；发布时以此目录作为项目根目录，并复用已有 Site identity。

验证局限、源文件说明和跨 session 上下文见仓库根目录 [HANDOFF.md](../../HANDOFF.md)。

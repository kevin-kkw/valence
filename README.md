# Valence · 链式反应

化学题材生存游戏：战斗收集物质，波间查看配方、拖拽投料，改装枪械后进入下一波。

## 当前可玩原型

[打开 VALENCE 两波试玩](https://valence-chain-lab.goodcamel13.chatgpt.site)（当前为原账号私有访问）。

源码：[prototypes/valence-chain-lab](prototypes/valence-chain-lab)。普通枪开局，两波各60秒，中间一次不限时实验室；可制作水枪或氢燃烧枪，同系增强、异系替换并清零，枪型原型最高Lv.5。第二波出现失控反应釜Boss，需要击败后完成实验。

```bash
cd prototypes/valence-chain-lab
npm run dev
# http://localhost:3000
npm test
npm run check
```

无 JS 依赖、无需构建。测试用 Node.js 20+，本地静态服务器用 Python 3。WASD/方向键移动，自动射击，ESC暂停；波间可拖拽或点击物质投料。

模型、镜头、DOM/canvas流程检查与语法检查已通过；真实浏览器布局、原生拖拽和实体触屏尚未验证。详见 [验证记录](prototypes/valence-chain-lab/docs/verification.md)。

## 角色成长与怪物

- 钻石按怪物类型必掉，拾取升级后暂停三选一角色能力；换枪不清除角色能力。
- 物质卡低概率掉落用于改枪，标准18%，主菜单可切换75%测试加量。
- 五种怪物：酸雾团、晶体甲壳兽、胶体集群、活泼金属小怪、失控反应釜。各有不同外观、行为和钻石奖励。
- 能力包含血量、攻速、攻击力、防御、移速、拾取范围、回血和暴击。详细数值在catalog.mjs。

## 当前难度与Boss

- 每关敌人生命×1.35、伤害×1.20，包括分裂子体；界面显示倍率。
- Boss专属招式：有绿色安全缺口的扩散冲击环、预警后地面爆发；低血过载加快出招。
- Boss主要考验走位，所有枪型均可击败。属性相克/减弱是下一步待讨论方向，尚未实现。

## 枪型与射程

- 普通枪：短曳光，射程600。
- 水枪：水柱与水花，射程260起，每级+55。
- 氢燃烧枪：淡蓝白色火舌，近距宽扇形多目标命中，射程160起、每级+15。
- 装备面板显示实际射程；特效几何与命中范围一致，详细数值见原型README。

## 最新规则与设计

- [当前短闭环规格](prototypes/valence-chain-lab/docs/superpowers/specs/2026-11-12-valence-short-loop.md)：本轮用户确认的范围。
- [HANDOFF.md](HANDOFF.md)：接手先读，含版本、限制和下一步。
- [AGENTS.md](AGENTS.md)：协作约定。
- [早期 GDD v0.1](docs/VALENCE_GDD_v0.1_Codex.md)：保留为历史设计；其中原子资源、六分子、多槽、电弧开局和十分钟/Boss不属于当前两波原型。

当前材料为水、氢气、氧气“物质卡”。水枪装填属于改装，不称为化学反应；氢燃烧试验显示配平的 `2H₂ + O₂ → 2H₂O`，需要炉内点火。氧气是氧化剂，环境空气也含氧。枪械升级、份数、持续灼烧和不限弹药均为游戏抽象。

## 独立保留的土豆 Demo

[试玩《土豆突围》](https://potato-survivors-ember.goodcamel13.chatgpt.site) · [源码](demos/potato-survivors)

原 Demo 保持不变，本轮也重跑了其测试与语法检查。

## 部署

GitHub用于保存和继续开发，尚未配置自动部署。两个原型各自保留独立的 `.openai/hosting.json`；后续发布以对应子目录为项目根目录，复用各自Site，不混用ID。推送GitHub不会自动更新线上网站。

# 新 session 接手说明

记录日期：2026-11-12。用户要求把当前应保留的内容保存到 `https://github.com/kevin-kkw/valence`，以便换 session 继续。

## 一分钟了解状态

1. 已完成、已发布《土豆突围》网页版 Demo，用户反馈“demo 不错”。
2. 用户随后想找**另一个 ChatGPT 对话里的化学游戏**。本 session 没有该对话原文，也没有确认过它的规则、教学目标、界面或技术方案。
3. `Valence` 是用户创建的接手仓库名；不能仅凭名称推断化学游戏已确定设计。
4. 这次是资料与代码交接，不是开始开发化学游戏，也不是重新发布土豆 Demo。

## 用户明确同意的土豆 Demo 范围

- 打开网页即可玩的轻量原型。
- WASD／方向键移动，自动瞄准并攻击近处敌人。
- 击杀掉经验，拾取后升级三选一。
- 三分钟一局，怪物随时间增强，存活到最后获胜。
- 死亡后能立即重开；卡通土豆、竞技场、命中特效和伤害数字。
- 手机触屏摇杆；不做商店、账号和联机。

已实现以上范围，以及暂停、失焦自动暂停、可开关合成音效。美术由 Canvas 绘制，不依赖外部图片；字体可从 Google Fonts 加载，失败时使用系统回退字体。

## 保存的文件与运行

`demos/potato-survivors/` 包含可部署静态网站、引擎/镜头测试、DOM/canvas 冒烟检查、原设计与计划、现有 Sites identity。

```bash
cd demos/potato-survivors
npm run dev
# 浏览器访问 http://localhost:3000
npm test
npm run check
```

`dist/` 是直接维护的源码与静态发布目录，不是可以随便删除再构建的生成物。没有 bundler，也没有 `npm install` 的必要。

| 路径 | 职责 |
| --- | --- |
| `dist/engine.mjs` | 游戏状态、移动、刷怪、射击、碰撞、经验、升级、胜负 |
| `dist/view.mjs` | 横竖屏镜头缩放与边界 |
| `dist/game.mjs` | Canvas 美术、渲染、HUD、菜单、键盘/触屏、声音、暂停 |
| `dist/style.css` | 响应式主页、HUD、弹窗与摇杆样式 |
| `dist/index.html` | 中文页面与游戏界面结构 |
| `tests/engine.test.mjs` | 6 项引擎行为测试 |
| `tests/view.test.mjs` | 镜头填充与四角可见性测试 |
| `tests/ui-smoke.mjs` | 无浏览器环境的 DOM/canvas 生命周期检查 |

## 验证证据与局限

交接前重新运行 `npm test` 和 `npm run check`，结果见 `docs/verification.md`。

此前通过：6 项引擎测试（初始状态、移动归一/边界、自动击杀/经验、升级暂停/恢复、胜负/重开、暂停冻结），1 项镜头测试，以及启动/绘制/HUD/暂停恢复/失焦/回首页冒烟检查。

一次独立代码审查指出竖屏镜头露出场外、短横屏菜单裁切；已修正。也改进了多指摇杆所有权。

**没有做真实浏览器画面或实体触屏 QA。** 原环境缺少 Sites 要求的 `cua_repl.js` 入口，遵循当时工作流未绕过该限制。DOM mock 不能证明布局、画面或手感正确。新 session 若有合适浏览器工具，可优先试 390×600 竖屏和 667×375 横屏，检查四边镜头、升级/结算弹窗、重开按钮和触屏松手。

## 已发布版本与后续部署

- 网址： https://potato-survivors-ember.goodcamel13.chatgpt.site
- Site project ID：`appgprj_6af5c0ca320881918eb19cd790ac9da6`
- 原 Sites 源码提交：`ec14dbbca80d6cfd8e0e734b1ecd6fe179465399`
- 版本：1
- deployment ID：`appgdep_6af5c3236ee08191b7d6a85a7fb7d269`
- 当时原生发布工具返回 `succeeded`。
- 访问范围：原账号 owner-private；GitHub 仓库为 public，这不会自动改变 Sites 访问范围。

现有 `.openai/hosting.json` 已保留，static.directory 为 `dist`。此文件相对 **Demo 子目录** 生效。不要从仓库根目录误把其他路径打包，也不要为修改此 Demo 新建重复 Site。

Sites 原来的源码托管是服务管理的独立 Git 仓库，与 `kevin-kkw/valence` 没有自动部署关联。后续若要更新线上 Demo，重新读取 Sites 技能并用该 Site 的新短期凭据同步、打包、发布。旧令牌未保存，不能复用。原环境缺少 Sites 源码 helper，曾用普通 Git（凭据只经 stdin 与进程内存）和 `git archive` 完成发布；新环境优先用正式 helper。

## 协作上下文

用户重视先讨论关键玩法。曾问“你怎么没用 grill-me 技能和我讨论”，原因是虽然做了两轮范围确认，但没有充分了解其想保留的乐趣。随后用户明确指示“你先继续做吧，出个 demo”，据此完成了当前原型。

后续新需求先尊重一次一个问题的讨论方式；用户明确授权直接做时继续执行，不重新设置繁琐审批。

## 下一步

先向用户确认希望继续土豆 Demo，还是转入化学游戏。若是化学游戏，获取另一个 ChatGPT 对话中相关原文、需求摘要或已有设计文件；目前没有足够事实替用户还原该方案。不要声称能检索其他 ChatGPT 聊天：本 session 已查过可用 Pages/Sites，没有找到相关记录，且没有跨聊天全文检索能力。

## 可复制给新 session 的开场提示

> 请接手 kevin-kkw/valence。先读 AGENTS.md 和 HANDOFF.md，检查现有代码与测试，简要复述当前状态。已有土豆突围 Demo 在 demos/potato-survivors，可运行且已单独发布；化学游戏的旧讨论尚未导入。请沿用一次问一个关键问题的讨论方式，先根据我接下来提供的材料确认目标，不要自行假设已经有完整设计。

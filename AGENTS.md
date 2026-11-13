# 接手协作约定

- 开始工作先读 `HANDOFF.md`；用中文简洁沟通。
- 用户重视 grill-me 式讨论：新需求有实质不确定性时，一次问一个最关键的问题，等答复后再推进，不要用自己提出的一长串默认功能代替讨论。
- 用户明确说“继续做”“先出 demo”“直接做”时，按已授权范围执行，不反复索要确认。
- 化学游戏当前已实现短闭环，先读 `prototypes/valence-chain-lab/docs/superpowers/specs/2026-11-12-valence-short-loop.md` 与 `HANDOFF.md` 最新更新。GDD v0.1保留为历史，不覆盖后续会话决定。
- 当前土豆 Demo 位于 `demos/potato-survivors/`；**它与 `prototypes/valence-chain-lab/` 的化学原型是两项不同工作**。保持 Demo 可运行，除非用户要求修改。
- 在 Demo 目录执行 `npm test` 和 `npm run check`。DOM/canvas mock 不是浏览器像素验证，不要把它称为真实浏览器或触屏测试。
- GitHub 与现有 Sites 的源码仓库尚未建立自动部署关系。不要把 GitHub 推送报告成上线。
- 修改现有 Sites 时复用 Demo 的 `.openai/hosting.json` 中 project_id，保持既有访问范围。仅保存或交接文件不需要重新发布。
- 不提交令牌、凭据、环境秘密、带访问签名的资源链接、执行日志或完整聊天转储。

- 当前VALENCE原型在 `prototypes/valence-chain-lab/`，开局免费选择六种化学枪、七种物资、单枪、同系增强/异系清零、两波60秒加走位Boss。修改前读其README，修改后执行其 `npm test` 和 `npm run check`。两个Site的manifest不能混用。

- 当前扩展仅实现新枪射击/特效/配方，属性相克与减弱尚未实现；不要把酸液统一腐蚀状态当作已存在的材质克制表。新增装填/溶解/装配要与真实化学反应分开标注。


- 最新目标覆盖旧两关描述：原界面本地十关30至120秒、精英3/5/7配件奖励、Boss9枪口奖励、最终Boss10；两配件槽+一枪口槽，六枪各两配件，四种通用枪口含分叉。详见 `prototypes/valence-chain-lab/docs/ten-wave-design.md`。用户明确暂不依赖Sites，不再尝试在线发布。旧两关只在显式legacy测试中保留。


- V3最新规则：枪最高10级；每关按encounters.mjs解锁一种新怪并增加密度；精英继承当关新怪；余热火环固定地面持续5秒；最终Boss为独立三形态熵灭实验体，击败立即通关（覆盖旧计时+击杀规则，仅最终关）。出实验室回装备，配件卡与能力卡视觉区分，玩家扣血/实际回血有小飘字。保持本地开发，详情读 ten-wave-design.md 最新追加。

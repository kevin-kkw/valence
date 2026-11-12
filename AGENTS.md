# 接手协作约定

- 开始工作先读 `HANDOFF.md`；用中文简洁沟通。
- 用户重视 grill-me 式讨论：新需求有实质不确定性时，一次问一个最关键的问题，等答复后再推进，不要用自己提出的一长串默认功能代替讨论。
- 用户明确说“继续做”“先出 demo”“直接做”时，按已授权范围执行，不反复索要确认。
- 化学游戏讨论的设计结论已整理在 `docs/VALENCE_GDD_v0.1_Codex.md`；以该文件及 `HANDOFF.md` 最新更新为准，不编造未记录的用户决策。
- 当前土豆 Demo 位于 `demos/potato-survivors/`；**它与尚未开发的 VALENCE 化学游戏是两项不同工作**。保持 Demo 可运行，除非用户要求修改。
- 在 Demo 目录执行 `npm test` 和 `npm run check`。DOM/canvas mock 不是浏览器像素验证，不要把它称为真实浏览器或触屏测试。
- GitHub 与现有 Sites 的源码仓库尚未建立自动部署关系。不要把 GitHub 推送报告成上线。
- 修改现有 Sites 时复用 Demo 的 `.openai/hosting.json` 中 project_id，保持既有访问范围。仅保存或交接文件不需要重新发布。
- 不提交令牌、凭据、环境秘密、带访问签名的资源链接、执行日志或完整聊天转储。

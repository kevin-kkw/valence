# Verification — 2026-11-12

- `node tests/model.test.mjs`: 13 behavior tests, including recipe transactions, replacement/confirmation, products, ignition, balanced hydrogen reaction, wave guarantee, restart, burn, max-level no-cost regression.
- `node tests/view.test.mjs`: portrait camera/corners (1 test).
- `npm test`: model and view modules plus DOM/canvas lifecycle smoke pass.
- `npm run check`: browser module syntax checks pass.
- UI mock exercises start, drawing calls, pause/resume/log, wave-end lab, click and data-transfer drop, leftovers, repeat water upgrade, replacement cancel/confirm, next wave, blur, win and restart. It is not a browser renderer.
- Independent static code review found capped water fire-rate upgrades still spending materials: reproduced failing boundary test, fixed by explicit Lv.5 cap and blocked transaction/UI. Also fixed misleading repeated wave-start toast on log close.
- Real browser/pixel/native drag/touch QA unavailable: required Sites cua_repl.js and source helper absent. No alternative browser path or preview server started. Existing fallback publishes via ordinary Git with short-lived credential only over stdin/in-memory environment, then git archive; never store token.

Playtest remaining: keyboard/native drag in browser, both gun routes and visual rate/burn distinction, short landscape menu reachability, mobile touch as secondary support, performance and balance. This is the agreed two-wave prototype, not the old six-molecule/full-10-minute GDD MVP.

## 自动扣料交互回归
先重现：背包有料、炉内为空时按钮禁用，直接制作失败。新增背包直制/分散库存/缺料/替换无预扣回归与UI按钮检查，观察到失败后修正；新版模型共17项测试，镜头1项，UI冒烟与语法检查通过。拖拽、满级、点火、异系取消不扣料继续覆盖。真实浏览器视觉/原生拖拽仍未实测。

## 战场上下边界回归
用户报告看不到的上下场外敌人仍能被打到。重现并新增3项失败后通过的模型回归：上下场外不锁定、场外更近目标不抢锁、裁切视口外不受子弹伤害；新增可见边界与镜头交集测试。目标选择/子弹命中/接触与渲染统一使用场地和镜头范围，越界子弹移除，实体裁剪到场地，场地边线增强。战斗容器按视窗高度布局；波间实验室保持内容自适应。模型20项、镜头2项、UI冒烟与语法检查通过。真实窗口布局仍需浏览器实测，本环境所需入口仍不可用。

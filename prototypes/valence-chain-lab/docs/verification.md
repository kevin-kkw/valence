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

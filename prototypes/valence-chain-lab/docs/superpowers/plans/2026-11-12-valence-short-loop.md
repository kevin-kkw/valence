> 历史计划/规格：保留当时决策与实现过程，后续可能已替代。现行规则见[当前规格](../../current-rules.md)。

# VALENCE Short Loop Implementation Plan
> Execute inline; user explicitly authorized this prototype.
**Goal:** Collect substances, craft a chemical gun, survive wave two, restart.
**Architecture:** catalog.mjs definitions, model.mjs pure simulation, render.mjs Canvas, app.mjs DOM laboratory.
**Tech Stack:** HTML/CSS/ES modules, Node built-in tests; no JS dependencies.
**Spec:** ../specs/2026-11-12-valence-short-loop.md
## Global constraints
Two 60s waves; ordinary start; water/H₂/O₂; public draggable recipes; same family upgrades, replacement resets; preserve potato.
## Review focus
Drag duplication/cancel, atomic replacement confirmation, lab/pause freeze, science vs abstraction, two-wave lifecycle.
## Tasks
- [x] 1. Test model resource transfers, craft leftovers/costs, invalid operations, ignition, upgrades/reset, isolated products, balancing, wave guarantee, burn and restart; implement catalog.mjs and model.mjs; run node tests/model.test.mjs.
- [x] 2. Implement index.html/style.css/render.mjs/app.mjs; test UI lifecycle, keyboard, laboratory clicks/drop; syntax-check modules.
- [ ] 3. Independent code review; fix important issues; run suites including preserved potato; publish new private Site; save source and updated handoff to GitHub with lease.

## Implementation ledger
Model and camera checks passed; DOM smoke passed. Ruling: levels capped at5, explicit before consumption, to avoid ineffective paid upgrades; cost is limited upgrade range in this prototype. Actual visual/touch QA remains unverified because required Sites entrypoint is absent. Independent review finding fixed with failing-to-passing max-level regression. No unrelated potato changes.

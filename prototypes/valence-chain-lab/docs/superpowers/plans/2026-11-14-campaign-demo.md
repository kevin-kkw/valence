# Campaign Demo V5 Implementation Plan

> Agentic workers: use subagent-driven-development or executing-plans. User approved autonomous completion, including reasonable missing details; no additional confirmation checkpoints. Local demo only, no deployment.

Goal: playable equipment test → three freely chosen ten-wave field missions → permanent extracted relics/key → locked fourth micro-world → infected AI boss and rescue-dependent true ending.
Architecture: preserve DualRun and all weapon/loot/ability behavior, add MissionRun adapter, isolated durable profile and mission metadata, world environment/boss module, integrate base/archive/result UI into existing app. New modules remain acyclic and bundle to one HTML.
Spec: docs/future/campaign-progression.md and docs/current-rules.md.

Global constraints: pure movement/auto-fire survival; no repair minigames. Guns/equipment recovered at wave end; diamonds/materials/health manual only, no free supplies. Two guns and existing accessory/upgrade/level/rank mechanics retained. Failed field missions never bank relics. Three first successful distinct field clears bank relics and unlock core. Early missions have full success results; only core without rescue is failed finale. Prior clues inform hidden core sample; no explicit rescue route in mission selection. AI normal→delayed→fragmented→error by banked relic count. Persistent clues/knowledge and relics; core retry preserves permanent progress. Four distinctive worlds, departure-board-only gated access (no physical doors), readable telegraphed environmental hazards and distinct field bosses. Default normal schedule retained; optional clearly labeled accelerated demo makes full campaign review practical. No external assets, no network dependency, no deploy.

Rulings: clues persist even on failed mission, physical relic/sample requires success. Keys and fourth-map unlock persist after finale failure, retries allowed. Quick mode timings 8/9/10/11/12/12/12/12/12/16s; weaker enemies in this mode only; normal mode retains current600s schedule. Environment can hurt ordinary enemies at reduced boss effectiveness. Long-term storage via versioned localStorage with validation, export/import and safe reset; unavailable storage shows temporary mode. Archive text provides inference, no direct sample marker. Prototype focuses complete campaign; high-tier formula/ultimate build research remains separate future work, not falsely claimed implemented.

Tasks:
- [x] Profile + MissionRun + tests. Interface agreed with implementer brief.
- [x] World environment, geometry, visuals, boss variants + tests. Parent implementation.
- [x] Base/mission board, persistent archive, AI progression, result/ending/restore UX; integrate without regressing existing flows.
- [x] Real browser all paths, save/reload, multiple viewport visuals, bundle, docs/artifact and final independent review.

Review focus: corrupt/missing browser storage; duplicate results/relic banking; death/abandon never completes field mission; core gating not bypassed via UI/test entry; hidden sample/retry reachable; world hazards obey bounds and pause; environmental kills still award correct drops; legacy standalone engine and existing combat behavior remain compatible.

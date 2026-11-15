# Independent World Bestiaries Implementation Plan
Goal: Three fully separate eight-species field rosters with unique behavior and silhouettes, leaving training/core and existing arena/progression rules intact.
Architecture: Annotate compatible internal roles with mission species; separate simulation module and renderer module; reuse damage/drop plumbing while bypassing legacy movement for species. No dependencies.
Spec: docs/superpowers/specs/2026-11-15-world-bestiaries.md

- [x] Backend task: behavioral tests first for disjoint spawn pools, waves1-8, local elites/children/Boss summons, special attacks/telegraphs/caps, burn/slow/corrosion, no cross-map leakage. Implement owned module and hooks, test and commit only owned files.
- [x] Visual task: distinct24 silhouettes, action prewarnings/elite labels/projectiles; render fallback tests, mock canvas smoke, commit only owned files.
- [x] Parent integration: briefing/bestiary log and map cues, version5.6, existing full regression, real Chromium battle specimens/all3fields/geometry/campaign; docs and local HTML/demo archives.
- [x] Task review for each deliverable and broad final review, fix any reproduced concerns; finish only local candidate, no deployment/main push.

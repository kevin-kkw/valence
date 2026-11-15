# Final Boss Duel Implementation Plan

Goal: final act is an immediate untimed hard three-phase Boss fight. Kill -> visible AI core -> physical collection -> repaired AI victory. Player death loses. User has authorized autonomous implementation; old hidden sample failure rule is superseded.
Architecture: retain internal wave10 enemy scaling only, expose final battle UI with no wave count/timer. MissionRun orchestrates final setup, prevents wave transitions, intercepts Boss victory until core pickup. Retain existing equipment/checkpoint formats; no new dependencies or deployment.

- [x] Add behavioral failing tests: immediate exactly one Boss; endless duration; no ordinary spawn or intermission; quick debugging reductions retained; three phases; death precedence; core-only pickup grants ending, no preplaced sample.
- [x] Implement MissionRun core setup/drop/collect/settlement and stop threats after kill. World no longer preplaces hidden sample.
- [x] Update briefing/HUD/final reward rendering/outcome route and story documents to match final duel, keep other maps ten waves and existing dimensions.
- [x] Update superseded tests and full browser campaign route; verify core spawn, long fight, phases, pickup, death, full suite and syntax.
- [x] Build V5.5 HTML and optional core checkpoint, local source commit/mirror; no deploy.

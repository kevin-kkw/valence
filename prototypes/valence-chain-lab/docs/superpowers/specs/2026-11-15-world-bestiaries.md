# Independent field bestiaries V5.6

User chose fully independent monster rosters for industrial/mine/ecology. Earlier user authorizes autonomous local demo completion. No deployment authorized for this change. Training stays original teaching roster, core stays untimed AI final duel. Preserve V4.11 geometry, all build carry, new-act full HP, all current weapons/loot rules.

Each field has eight exclusive species introduced waves1-8. Internal type roles remain [0,5,1,3,2,7,8,9] for engine compatibility, but every ordinary/elite/summoned child must be annotated with its mission's own species, stats, behaviors and visual. No cross-map appearances, no purely cosmetic recolors. Stage3/5/7 elite is local new species with existing6xHP/1.6damage/1.45speed/1.65frequency strength, contact rush hit recovers2sec. Recurring elites remain maximum one per wave. Wave9/10 no new ordinary species. Keep existing special world Boss designs.

Industrial species indices:
0 leak-barrel / 泄漏桶怪 — slow pursuit, periodically telegraphed leak patch.
1 rivet-drone / 铆钉巡检机 — lateral movement, telegraphed short aimed rivet burst.
2 piston-runner / 活塞冲压机 — locks direction then rushes, clear warning and recovery.
3 scrap-baler / 废料压团 — heavy pressure pursuit, telegraphed death shrapnel/rupture, no children.
4 pressure-tank / 高压储罐 — periodic nearby pressure discharge with warning.
5 exhaust-stack / 排放烟囱 — slow mover, narrow long directional vent burst.
6 arc-welder / 电弧焊机 — stops and locks narrow beam, limited overlapping sources.
7 crawler-furnace / 履带熔炉 — moving bulky furnace, short ranged fan sparks.

Mine:
0 shard-crawler / 碎晶爬虫 — alternating zigzag advances.
1 crystal-lancer / 晶针投手 — deliberately aimed long thin crystal dart, slow recovery.
2 burrow-spike / 潜地晶刺 — telegraphed relocation/eruption, no untelegraphed player snap.
3 geode-cluster / 晶簇团 — death shards with bounded slow projectiles, no children.
4 crystal-sentinel / 晶壳守卫 — cycles hard shell with modest30% damage reduction and exposed pursuit.
5 resonance-prism / 共振晶柱 — slow/anchored periodic radial resonance shots, wide dodge gaps.
6 prism-refractor / 折射棱镜 — alternating crossing narrow rays, readable1.2s warning.
7 lodestone / 磁辉矿核 — marks delayed falling crystal zones at distinct nearby positions.

Ecology:
0 gel-droplet / 胶滴爬行体 — springy advances, distinctive puddle body.
1 seed-spitter / 喷籽植株 — backs off, slow seed projectiles from telegraphed aim.
2 thorn-leaper / 棘刺跃兽 — short sidesteps then marked pounce, recovery after contact.
3 budding-slime / 出芽胶团 — death creates two small local droplets, child cannot split again.
4 root-carrier / 根甲行者 — slow pursuit, plants telegraphed nearby root zone.
5 spore-sac / 膨胀孢囊 — proximity warning, self-burst, can be killed before burst.
6 vine-weaver / 织蔓花 — makes a line of delayed local growth patches and retreats.
7 brood-mother / 育群母体 — capped local offspring, child cannot reproduce, enforce global population caps.

Fictional chemistry-inspired creatures, avoid asserting real chemical reactions. Keep all chemical guns viable; no weapon-type immunities/hard counters. Attack warnings >=0.8s, reasonable ranged/ground-attack concurrency limits, no permanent terrain blocking and no changes to actual arena bounds.

## Module contract / ownership
Backend owns dist/map-monsters.mjs + mission-run.mjs + model.mjs + campaign.mjs + tests/map-monsters.test.mjs.
Exports: MAP_SPECIES = {industrial:[8 defs],mine:[8],ecology:[8]}; def has id full `${map}-${slug}`, name, description, color, icon (simple symbol), hp,speed,r,damage,diamonds. mapSpeciesFor(map,type) resolves by role mapping; mapSpawnExtras(map,type,extra,wave) annotates/overrides stats preserving elite/child ratios; updateMapMonster(run,e,dt,bounds) handles movement/status/burn/contact/attacks and returns boolean; onMapMonsterDeath(run,e) handles exclusive deaths; mapMonsterDamage(run,e,damage,burn) shell optional.
Enemy e.speciesId, e.speciesMap, e.speciesIndex0..7, e.displayName, e.diamonds. Runtime visual fields: mapAction ('idle','warning','dash','recover','armored','exposed'), mapWarning(seconds), mapWarningTotal, mapAim(angle), mapTarget({x,y}), mapRecovery(seconds), mapDashTime. New hostile bullets should carry speciesMap/speciesIndex/color to render them.
Backend hooks: model loop calls this.updateMapEnemy(e,dt,bounds) and skips legacy motion for handled species, generic burn/slow/corrosion ticks must be retained within own update. model legacy child split excludes speciesId. campaign.updateRanged skips speciesId enemies but still advances all enemyBullets. model diamond value uses e.diamonds fallback. MissionRun applies metadata/stats before super.spawnEnemy, existing quick scaling applies once. Existing core/training untouched.
Visual task owns dist/map-monster-visuals.mjs + render.mjs + tests/map-monster-visuals.test.mjs. exports drawMapMonster(c,e,time), called with canvas already translated to enemy center; handles speciesId using local speciesIndex/map. drawMapBullet(c,b,time) handles world positions and returns bool. Rendering must use distinctly different silhouettes for all8 within eachmap, not palette-only. Include action warning, elite name via e.displayName, and avoid legacy type1/acid visuals on species. Fall back for all existing training/core cases. Parent owns app/campaign-shell/style/docs and integration checks.

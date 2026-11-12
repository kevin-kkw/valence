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

## 角色成长、双掉落与五种怪物

新增先失败再通过的progression与monsters测试：钻石按怪物类型、低/高物质掉率、资源分流、经验暂停/冻结/三选一、连续升级返回实验室、8属性实际作用、换枪保留/重开重置、酸雾/防御、胶体一代分裂、Boss阶段召唤与胜利条件。UI冒烟新增菜单掉率切换与升级选择。模型20+成长8+怪物4+镜头2，共34项行为测试；UI冒烟、语法检查通过。独立代码审查未发现重要问题。真实浏览器布局、原生拖拽/触屏和玩法平衡仍待实测。

## 逐关强化与Boss独有躲招
新增先失败后通过的7项difficulty回归：每类敌人及子体逐关HP/伤害增长、实际扣血使用强化伤害、Boss高生命/两种技能、预警无伤/移动避开/单技能不重复扣血、安全缺口、暂停冻结与死亡清场、过载双环且所有枪仍正常伤害。UI冒烟实际触发技能与绘制调用。全部41项行为检查及UI/语法检查通过，独立审查未发现重要问题。真实浏览器视觉可读性、窗口布局和Boss难度手感尚未实测。

## 枪型特效与射程

新增先失败后通过的4项射程测试（水枪升级实际延长、越界不射击、到射程消失、火焰多目标扇形及排除身后/远处）与5项特效几何测试（水柱连贯、火舌动态、普通曳光、无副作用/有限几何、火焰视觉不越过真实伤害扇形/射程）。独立审查发现初版火焰中段画面过宽，已用失败后通过的可见轮廓回归修复，并裁剪内部火舌。全部50项行为测试、UI含火焰绘制调用与射程显示检查、语法检查通过。真实浏览器画面、流体观感与操作手感仍未实测。

## 火焰增强与灼烧可读性

验证用户疑问：新集成回归证明Lv.1灼烧仍为12DPS、2.5秒，目标离开喷射范围后仍扣约30点，随后停止。发现旧版每帧伤害浮字取整为0影响感知；新增失败后通过的非零灼烧合并浮字测试。喷焰替换为32个向外流动的多层焰团、亮芯和发光，仍裁剪在真实伤害扇形内；怪物增加火苗/灼烧标记/剩余时长条。新增焰团几何动态回归。模型真实DPS/范围/时长未改，烧伤只调整文字累计与受击闪白频率。全53项行为检查、UI/语法检查通过。浏览器画面仍未实测，不能据此保证视觉满意度。
独立审查确认DPS/时长、Canvas混合与裁剪状态正确；轻微未处理项：若直接命中击杀时尚有不足一次浮字阈值的灼烧余数，该余数不单独跳字，真实伤害统计不受影响。

## 测试开局选枪
新增先失败后通过的3项starting-gun回归：默认免费化学枪且零材料成本、氢燃烧枪选择/重开还原Lv.1、无效/战斗中切换拒绝。UI冒烟验证水枪开局、波间同系继续增强、重开保留选择、回菜单选氢燃烧枪直接开局。原普通枪基础逻辑测试显式指定normal，避免把兼容测试当默认玩家流程。全部56项行为检查、UI及语法检查通过；真实浏览器布局仍未实测。

## 水枪移动流带回归
新增失败后通过的4项water-flow测试：移动后旧水保持独立运动、新水从新位置发出、按当前采样构建曲线、急转向不跨stream硬连、暂停冻结/停火消散/重开清空。旧“固定起点到弹头长线”特效测试改为兼容水包仅保留局部短尾。全60项行为测试及UI/语法检查通过。真实浏览器视觉流畅度仍未实测，需用户试玩确认。
独立代码审查未发现重要问题：水样世界位置/速度、内存上限、无额外游戏随机数消耗、波间/重开清理与Canvas状态恢复均保持一致。

## 四枪扩展验证

新增12项expanded-guns模型测试，先观察新枪未注册/无行为失败后实现：六枪选择、全部配方精确扣料/无虚构产物、新元素计数、腐蚀叠加/失效、气压多目标及场地/Boss击退限制、电弧不同目标/衰减/距离/镜头限制、铁弹贯穿次数/顺序/不重复、等级特性增长、七种掉落可达。3项new-effects几何回归检查电弧真实命中端点、气云范围、酸液/铁弹局部尾迹。旧库存用动态emptyStock期望匹配扩展物资。全部75项行为检查、六枪UI启动/攻击绘制/六配方扣料冒烟及语法检查通过。独立审查无重要问题；修正能力描述为“基础伤害+3（枪型系数另计）”。浏览器真实画面、布局与六枪平衡仍未实测。

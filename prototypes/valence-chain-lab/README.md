# 最新本地Demo：V5.0 多地图主线

测试新型装备 → 三项外勤自由选择 → 成功带回三件遗物 → 钥匙解锁微观核心 → 面对被侵染的AI → 寻找恢复联系的可能。

已加入永久档案、遗物入库、AI逐步失联、四图环境与首领、隐藏核心样本、失败/真结局、存档导入导出。纯移动与自动射击，保留现有双枪、配件、物质改装和关间成长。新档从装备测试开始。

入口dist/index.html。首次体验可选择“快速装备测试”，加速模式约2分钟/图（首领战、整备和HUNT加时另计），标准每场基础10分钟。详见[Demo指南](docs/campaign-demo-v5.md)。

当前制作工作区/workspace/valence-campaign-demo，分支demo/campaign-v5；本版仅本地demo，未部署，线上仍V4.11。高级隐藏配方与核爆等终极构筑为后续方向。

---

# VALENCE · 链式反应

当前线上版本 **V4.11**：[开始游戏](https://kevin-wang.com/games/valence/)。静态网页游戏，普通枪开局、双枪并行、十关生存，化学物质用于改装武器。

## 当前规则

- 关末自动收取枪、配件、枪口；钻石、物质和血瓶必须亲自拾取，未捡清除。没有免费物质补给。
- 钻石提供角色经验，能力选择集中在关间；物质用于枪械Lv升级及医疗。
- 两把枪各自最多两配件和一枪口；同名枪进阶，+3/+6改变形态，上限+10，独立于物质Lv1至Lv10。
- 血瓶独立1%掉落，每瓶最多恢复10HP；关间不自动回血。
- 十关基础时长合计10分钟，最终Boss击败即通关。
- 右侧装备／属性／背包／配方四页签；已加入街机音效，♫可静音。

完整规格以[现行规则](docs/current-rules.md)为准，其他入口见[文档索引](docs/README.md)。历史迭代记录放在docs/history及标明历史的文档中，不作为当前规格。

## 本地开发

```sh
npm run dev
npm test
npm run check
python3 scripts/build-local-demo.py /tmp/VALENCE-local.html
```

开发地址http://localhost:3000。Node20+、Python3，无JS依赖。`dist/`是直接维护的源码，不是可删除的构建目录。主入口为dist/index.html，使用DualRun；旧配方/配件演示及单枪Run仅为历史原型和兼容测试保留。

发布到Hugo网站的流程见[发布说明](docs/hugo-deployment.md)。每次新版本均须用户明确授权部署；源码同步不等于网站部署。

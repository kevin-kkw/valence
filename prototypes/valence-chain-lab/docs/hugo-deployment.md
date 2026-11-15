# Hugo 网站发布

游戏独立托管在 `kevin-kkw/kevin-wang.com` 的 `mainsite/static/games/valence/`，公开入口：

https://kevin-wang.com/games/valence/

源码仍在本仓库 `prototypes/valence-chain-lab/`。网站仓库只保存独立静态发布快照与校验测试，不把 Hugo 主题/文章和游戏源码混在一起。V3.16加入配件成长；每次发布的源码提交以网站快照release.json为准。

## 更新快照

在游戏源码目录中导出到一个新的空目录：

```sh
python scripts/export-hugo.py /tmp/valence-next --source-commit <游戏源码GitHub提交SHA>
```

用完整导出替换网站仓库 `mainsite/static/games/valence/` 的旧快照，然后在网站仓库运行：

```sh
python3 -m unittest discover -s tests -v
```

导出包含入口HTML、18个JS模块、CSS与release.json，不含Sites身份配置、旧配方/配件独立试验页、凭据或聊天记录。依赖模块按内容指纹重写引用为`.js`，CSS同样加指纹。release.json保存源码仓库/提交、版本与文件SHA-256。新增资源或模块后导出会自动跟随主入口依赖；若引入循环模块依赖需升级打包方式。

网站的main推送触发既有Actions：部署工具测试、同步主题、Hugo生产构建、上传VM、激活发布与HTTPS标记检查；游戏无需后端，不依赖Sites。网站导航/文章与服务器配置保持现有设置，用户直接访问游戏路径。

测试分层：游戏原有模型/UI mock检查；导出后用实际指纹模块运行游戏UI mock；网站Python测试校验全部文件hash、版本及HTML/模块本地引用；Actions负责实际Hugo构建和VM发布。DOM/canvas mock不是浏览器视觉验收。指纹资源可安全长期缓存，入口HTML的实际缓存策略由网站服务器管理。


## V4.11 发布记录

用户明确授权部署V4.11，取消免费材料补给并采用当前关末收取规则。源码提交fa84b4c60563e1b1771f06b2388b8c05a1a61872，网站提交cedb0e4222a4b4eeee97988b81cf81ee1f1d96d1，Actions43568158498成功。公开release.json与20个HTML/JS/CSS文件哈希逐一匹配。当前版本和后续部署状态以release.json为准，旧授权不延续至后续版本。


## V5.5 已部署成功

用户明确授权“可以部署”。https://kevin-wang.com/games/valence/ 已为V5.5。发布源码af39da17264dbad33000f3c18b06c5d24127ac47，网站8513f8bcd164dd9c6173a7460d8a9a92dc7083e7，Actions43685210238 completed/success。46模型文件及UI/语法、指纹模块UI、网站静态hash/引用、指纹版与公开站点完整Chromium主线流程通过。公开release.json与24 JS+CSS+HTML共26文件核验一致；HTML由Cloudflare注入统计beacon，移除这一个已识别注入片段后原文hash一致，其余25资源原始hash直接一致。

本次包含主线多幕、整局装备资源能力继承、新幕满血、原4.11场地、基地进阶显示/水枪分叉修复、标准主入口与折叠debug、无时限最终三形态Boss/掉AI核心修复结算，快速模式继续削弱。此授权仅本版，后续改动不得自动部署。

# 验证状态 · V4.11

- `npm test`：40个模型测试文件，以及UI smoke、配方/配件历史演示、关间流程UI测试通过。
- `npm run check`：浏览器模块语法检查通过。
- 网站静态测试：版本、全部文件SHA-256、本地HTML/JS/CSS引用通过。
- 正式V4.11指纹发布快照真实Chromium：关末自动收枪/配件/枪口，未捡钻石/物质/血瓶不获收益，无免费材料；能力→换枪→配件(含取消)→枪口→实验室→下一关，血量保持，无异常。
- 属性页真实浏览器：1365/1024/390/320宽度，实时数值、四页签与键盘循环通过。
- 配件选择页：九种桌面/手机/横屏尺寸，卡片无内部溢出，并用elementFromPoint验证实际无遮挡可点击。
- 音效：真实浏览器点击解锁AudioContext、静音、全部音效离线渲染非静音/有限值/未削波。

DOM/canvas mock不代表像素验收；真实浏览器检查为上列具体流程，不能扩展为所有设备、所有原生拖拽/触屏或完整一局平衡已验收。音效主观听感、整体难度仍需试玩反馈。

## 浏览器复测

先启动独立本地Chromium调试端口与HTTP服务器，再按场景执行：

```sh
node tests/browser-wave-collection.mjs <CDP地址> <游戏URL>
node tests/browser-character.mjs <CDP地址> <游戏URL> [截图目录]
node tests/browser-loot-layout.mjs <CDP地址> <游戏URL> [截图目录]
node tests/browser-audio.mjs <CDP地址> <游戏URL> [试听WAV路径]
```

旧Run与独立演示保留历史机制用于兼容测试；当前主游戏入口使用DualRun，规则见[现行规则](current-rules.md)。历史验证记录见history/verification-through-v4.11.md。

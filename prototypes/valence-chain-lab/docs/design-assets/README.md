# 设计图片与来源

- characters-youth-original.png：本项目生成的三人原创青年实验员立绘，左大奇（男）、中强尼（男）、右朵朵（女）。原图1536×1024保留不改。均为青少年形象；设定17岁，虚构人物。人物文案以dist/characters.mjs为准。
- ../../dist/assets/characters.webp：同一立绘的游戏用WebP版本，保留构图，用于三张人物卡的分区裁切；约280KB。单文件构建会嵌入，Hugo静态导出会复制并带内容指纹。
- monster-bestiary-v56.png：由实际Canvas渲染器绘制的24种专属怪物对比图；对应代码dist/map-monster-visuals.mjs、行为dist/map-monsters.mjs及文档docs/world-bestiaries-v56.md。

立绘生成方向：三名高中年龄的青年科学项目成员，统一轻科幻插画风。大奇短黑发、琥珀工具外套与工具箱；强尼深棕乱发、额头护目镜、橙色外套与便携实验背包；朵朵马尾、薄荷白实验服、密封水样与采样包。三等分竖向画面，不带文字，背景为深青色实验室。原图保留作为设计源文件，压缩版仅用于加载性能。

战斗小人使用与立绘相符的独立矢量造型，代码dist/player-character-visuals.mjs；不以换色替代轮廓差异。原有枪型、进阶和双枪绘制保留。

- [战斗形象对比](battle-characters-v57.png)：实际矢量人物绘制模块与普通枪示意。
- [选人页实机截图](character-selection-v57.png)：嵌入本地试玩文件的真实界面，姓名/职位/专长/简介与图片均已接入。

# Subway Runner AI Art Pack

把 AI 生成的图片放进这个目录，游戏会自动尝试加载这些文件：

- `background-night.png`
- `player-runner.png`
- `coin-glow.png`
- `power-shield.png`
- `power-magnet.png`
- `obstacle-barrier.png`
- `obstacle-gate.png`
- `obstacle-cone.png`
- `train-front.png`

如果某张图不存在，游戏会继续使用内置的 Canvas 绘制版本，不会报错。

## 推荐生成顺序

1. `background-night.png`
2. `player-runner.png`
3. `coin-glow.png`
4. `train-front.png`
5. 其余障碍和道具

## 尺寸建议

- 背景：`1536x1024` 或 `1792x1024`
- 角色：`1024x1024`
- 金币/道具：`1024x1024`
- 障碍/列车：`1024x1024`

## 风格方向

- 都市夜景地铁跑酷
- 偏写实 + 轻度风格化
- 高对比霓虹灯、金色拾取物、青绿色主角色
- 适合移动端游戏 UI，一眼能看清轮廓

## 提示词建议

### 1. 背景 `background-night.png`

```text
用途：横版跑酷游戏远景背景
主体：夜晚的城市地铁通道，远处有高楼、灯带、站台灯光、轻微雾气
风格：stylized concept art，cinematic，clean silhouette，high contrast
构图：中央透视，轨道向远方延伸，画面中间预留主跑道，不要出现大块遮挡
色彩：深蓝黑底色，青绿色补光，金色暖灯
要求：不要人物，不要文字，不要 UI，不要水印
```

### 2. 主角 `player-runner.png`

```text
用途：跑酷游戏主角立绘精灵
主体：年轻跑者，青绿色外套，金色细节，正面略带冲刺姿态
风格：mobile game character art，stylized semi-realistic，clean edges
构图：单人全身，居中，四周留白
要求：透明背景感的纯色底，轮廓清晰，不要文字，不要复杂阴影，不要场景
```

### 3. 金币 `coin-glow.png`

```text
用途：跑酷游戏金币图标
主体：发光金币，带轻微能量边缘
风格：arcade mobile game pickup icon，bright, polished, readable
构图：单个金币居中
色彩：金黄、暖白高光
要求：纯色背景，边缘干净，不要文字
```

### 4. 列车 `train-front.png`

```text
用途：迎面驶来的障碍列车
主体：未来感地铁列车车头，正面视角
风格：stylized semi-realistic game prop，dramatic lighting
构图：主体居中，正对镜头，轮廓厚重清晰
色彩：银灰车身，青蓝玻璃，少量红色警示灯
要求：不要背景故事元素，不要文字，不要乘客
```

### 5. 路障 `obstacle-barrier.png`

```text
用途：跑酷游戏障碍物
主体：橙色施工路障，结实厚重，带斜向警示纹
风格：mobile game prop art，readable silhouette
构图：单体居中
要求：纯色背景，不要文字
```

### 6. 低门 `obstacle-gate.png`

```text
用途：需要下滑躲避的低位横杆障碍
主体：红色低门、横杆与两侧支柱
风格：clean game prop, readable, front-facing
构图：正视图，整体居中
要求：纯色背景，不要文字
```

### 7. 路锥 `obstacle-cone.png`

```text
用途：基础小型障碍
主体：橙白相间交通锥
风格：mobile game prop icon, clean, bright
构图：单体居中
要求：纯色背景，不要文字
```

### 8. 护盾 `power-shield.png`

```text
用途：跑酷游戏护盾道具
主体：蓝色能量护盾徽记
风格：mobile pickup icon, glowing, premium
构图：单个图标居中
要求：纯色背景，不要文字
```

### 9. 磁铁 `power-magnet.png`

```text
用途：跑酷游戏吸金币道具
主体：科幻感 U 型磁铁图标，带绿色能量边缘
风格：mobile pickup icon, readable, glossy
构图：单个图标居中
要求：纯色背景，不要文字
```

## 接入说明

- 文件名尽量保持和上面一致。
- 如果你生成的是不透明底图，建议后续再做一次抠图。
- 更稳妥的做法是先生成纯色背景版本，再去背景。
- 角色和道具优先保证轮廓清晰，其次才是细节。

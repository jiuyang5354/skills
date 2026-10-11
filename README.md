# 🌊 Liquid Design Agent Skills

> **面向 AI 智能体（Antigravity / Claude Code / Cursor / Codex）的工业级前端视觉与物理交互 Skill 库**。包含 **Outpace 物理折射流体玻璃** 与 **DesignCode WebGL 2 液态金属** 两套完整生产级技能定义、着色器管线与材质配方。

---

## 📖 简介 (Introduction)

传统的 AI 辅助前端开发在处理高级动效和材质时，往往只能生成扁平的 CSS `backdrop-filter: blur()` 或简陋的渐变，无法呈现具有物理真实感的高级光影。

本项目包含两个专门为 AI 编码智能体打造的**领域专家技能（Agent Skills）**：

1. **`liquid-glass` (物理流体玻璃透镜)**：
   * 基于斯涅尔折射定律（Snell's Law）与无旋度梯度位移算法（$\nabla \times \vec{D} = 0$）。
   * 模拟真实物理折射、RGB 色散（Chromatic Aberration）与高光边缘反光。
   * 彻底解决 Safari 与移动端 SVG 位移黑屏和断崖式模糊兼容性问题。
2. **`liquid-metal` (WebGL 2 溶融液态金属)**：
   * 纯原生 WebGL 2 实现（0 外部框架依赖，无需引入 Three.js）。
   * 完整 5-Pass 渲染管线：谷地层流场扰动、21点柯西高阶色散、粘度模拟、高斯辉光与硬件级色彩分级。
   * 支持多形态（胶囊药丸、圆形播放器、全屏卡片）及交互式动态冲击波（Shockwave）。

---

## 📁 技能目录结构

```text
skills/
├── README.md                         # 本文件：总览、安装、材质速查
├── LICENSE                           # MIT
├── .gitignore
├── liquid-glass/                     # 真实折射流体玻璃 Skill
│   ├── SKILL.md                      # 智能体执行准则与 Safari 避坑规约
│   ├── REFERENCE.md                  # 物理公式、推导证明、React/Vanilla 源码与 5 套调色配方
│   └── scripts/
│       └── generate_glass_map.js     # 无旋度位移贴图生成脚本
│
└── liquid-metal/                     # WebGL 2 高阶液态金属 Skill
    ├── SKILL.md                      # 5-Pass 管线规约、事件机制与 5 套材质配方
    ├── REFERENCE.md                  # 柯西色散证明、着色器架构与调参字典
    └── resources/
        ├── LiquidMetalButton.tsx     # React / Next.js 即插即用按钮组件（TypeScript）
        └── liquid-metal-button.html  # 纯 HTML / WebGL 2 零依赖单文件组件
```

---

## ⚡ 安装与配置 (Installation)

### 1. 在 Antigravity / Claude Code / Codex 中使用
将本仓库克隆或复制到目标工程的智能体技能目录：

```bash
# 方式 A：作为 Git Submodule 引入
git submodule add https://github.com/jiuyang5354/skills.git .agents/skills/liquid-design

# 方式 B：直接克隆到技能目录
git clone https://github.com/jiuyang5354/skills.git .agents/skills/liquid-design
```

> **提示**：若使用 Claude Code，放置在 `.claude/skills/` 目录下即可生效。

---

## 💬 智能体调用指南 (Agent Prompting)

智能体安装 Skill 后，无需告知底层复杂的物理公式或 Shader 代码，直接在自然语言对话中触发即可：

### 1. 流体玻璃（Liquid Glass）调用示例
* **基础透镜**：
  > *"用 `liquid-glass` 为我的主页 Hero 区制作一个具有真实物理折射与色散的磨砂玻璃透镜卡片。"*
* **指定材质魔改**：
  > *"参考 `liquid-glass` 中的深蓝宝石（Sapphire）配方，为暗黑风格仪表盘生成一个聚焦放大镜。"*
* **导航栏折射**：
  > *"用 `liquid-glass` 实现苹果风格的顶部吸顶导航栏，要求背景文字穿过时产生物理扭曲与边缘高光。"*

### 2. 液态金属（Liquid Metal）调用示例
* **基础 CTA 按钮**：
  > *"用 `liquid-metal` 在我的定价页面实现一个流体金属微光质感的购买按钮。"*
* **指定材质调色**：
  > *"使用 `liquid-metal` 生成一个 24K 纯金质感的圆形播放按钮，悬停时金属流速加快，点击时触发冲击波。"*
* **React 组件集成**：
  > *"用 `liquid-metal` 的 React 封装方式，为我的 Next.js 项目接入一个赛博酸性绿质感的登录按钮。"*

---

## 🛠️ 代码级直接使用 (Direct Code Usage)

### React / Next.js 集成

直接从 `liquid-metal/resources/LiquidMetalButton.tsx` 复制组件至项目中：

```tsx
import { LiquidMetalButton } from "@/components/LiquidMetalButton";

export default function App() {
  return (
    <div style={{ display: "flex", gap: 32, padding: 32, background: "#09090b" }}>
      {/* 胶囊 CTA：悬停点亮，点击泛涟漪 */}
      <LiquidMetalButton
        variant="pill"
        rendering="colored"
        text="解锁 VIP 特权"
        onClick={() => console.log("clicked")}
      />

      {/* 圆形播放按钮：直径 / 描边可调 */}
      <LiquidMetalButton
        variant="play"
        rendering="colored"
        diameter={88}
        strokeWidth={3.0}
        text="Play"
      />
    </div>
  );
}
``````

---

## 🎨 预置材质魔改速查表 (Material Recipes)

### 流体玻璃（Liquid Glass）核心参数
| 预设风格 | 折射强度 (`scale`) | 色散偏移 (`aberration`) | 模糊度 (`blur`) | 浅色反光 (`rimLight`) | 适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **纯净水滴** | `64` | `4px` | `0px` | `rgba(255,255,255,0.7)` | 极简、现代、苹果风卡片 |
| **深蓝宝石** | `80` | `8px` | `2px` | `rgba(180,220,255,0.9)` | 科技、Web3、沉浸暗黑背景 |
| **酸性毛玻璃** | `48` | `12px` | `16px` | `rgba(217,255,0,0.8)` | 潮流、先锋展会、艺术网站 |
| **琥珀烟熏** | `56` | `5px` | `4px` | `rgba(255,210,140,0.6)` | 奢侈品、威士忌、高端质感 |
| **赛博青光** | `96` | `10px` | `1px` | `rgba(0,255,200,0.9)` | 游戏、HUD 界面、电子仪器 |

### 液态金属（Liquid Metal）核心参数
| 预设风格 | 核心底色 (`uTintCore`) | 边缘流光 (`uTintGlow`) | 谷地粘度 (`valley`) | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **24K 纯金** | `[1.0, 0.78, 0.18]` | `[1.0, 0.92, 0.55]` | `1.4` | 奢华 VIP、支付、高客单商品 |
| **赛博酸性** | `[0.65, 1.0, 0.05]` | `[0.85, 1.0, 0.40]` | `1.1` | 潮流、黑客风、潮流先锋 |
| **低温冷钛** | `[0.70, 0.82, 0.95]` | `[0.90, 0.95, 1.00]` | `1.6` | 极简工业、Apple 极客风 |
| **虚空紫水晶** | `[0.68, 0.22, 0.95]` | `[0.92, 0.55, 1.00]` | `1.3` | AI 魔法、Web3 节点、神秘学 |
| **等离子祖母绿** | `[0.10, 0.88, 0.55]` | `[0.45, 1.00, 0.80]` | `1.2` | 绿色能源、健康、金融增长 |

---

---

## 🙏 来源与署名 (Attribution)

- **`liquid-metal`**：`resources/` 下的代码衍生自 **ThreeUI Community** 开源版本（MIT License，Copyright (c) 2026 Meng To / DesignCode），上游地址 https://github.com/MengTo/threeui 。ThreeUI 另有付费 Pro 版本，本仓库未收录任何 Pro 代码。本地改动（play 变体、材质染色、离屏暂停）同样以 MIT 发布，详见 `liquid-metal/NOTICE.md`。
- **`liquid-glass`**：根据 glass.outpacestudios.com 的公开演示观察总结的原创 skill 定义、公式推导与示例脚本，灵感来源已注明；`SKILL.md` / `REFERENCE.md` / `scripts/` 为本仓库原创内容，以 MIT 发布。

---
## 📄 License
[MIT License](LICENSE)

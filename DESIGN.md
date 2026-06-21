# 设计系统

## 视觉风格

简洁、克制、工具型。单层工具栏置顶，属性面板固定左侧。以灰度层次传达结构，紫色作为唯一强调色，仅在选中态和 active 按钮上出现。

## 色彩

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#f0f0f0` | 画布底色 |
| `--surface` | `#ffffff` | 面板、工具栏、卡片 |
| `--text` | `#1e1e1e` | 正文、图标 |
| `--text-secondary` | `#5e5e5e` | 标签、辅助文字 |
| `--border` | `#e0e0e0` | 边框、分隔线 |
| `--accent` | `#5b5ea6` | 选中态、active 按钮 |
| `--accent-light` | `#eeeef6` | active 按钮背景 |

```css
:root {
  --bg: #f0f0f0;
  --surface: #ffffff;
  --text: #1e1e1e;
  --text-secondary: #5e5e5e;
  --border: #e0e0e0;
  --shadow-lg: 0 2px 12px rgba(0,0,0,0.1);
  --accent: #5b5ea6;
  --accent-light: #eeeef6;
  --radius: 10px;
  --radius-sm: 6px;
}
```

## 字体

- 正文 / UI：`-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- 面板标签：11px / weight 500 / `var(--text-secondary)`
- 无衬线为主，整体偏工具型单字族

## 间距 & 圆角

- 工具栏按钮：34×34px，圆角 6px
- 工具栏内边距：6px 10px，元素间距 4px
- 分组分隔线：1px × 24px
- 面板圆角：12px
- 属性面板内边距：4px 0（竖向排列）

## 组件

| 组件 | 关键规则 |
|---|---|
| 工具栏 (`.tb-btn`) | 34px 方形按钮，hover 变灰，active 紫色背景 + 紫色文字 |
| 属性面板 (`#ctx-panel`) | fixed left:16px，垂直居中，双层阴影（1px 描边 + 8px 32px 投影），opacity 过渡 180ms |
| 颜色圆点 (`.ctx-color-dot`) | 20×20px 圆形，内阴影立体感，选中态 2px 白间隙 + 3.5px 紫环 |
| 滑块 | accent-color 紫色，高度 4px |

## 阴影

- 工具栏：`0 2px 12px rgba(0,0,0,0.1)`
- 面板：`0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.14)`

## 动效

- 面板入场：opacity 0→1，180ms，`cubic-bezier(0.2, 0, 0, 1)`
- 颜色圆点 hover：scale 1.18，120ms
- 按钮状态切换：120ms

## 交互行为

- 属性面板仅在选中图形时出现，取消选中时消失
- 颜色 / 描边宽度 / 背景色 / 背景透明度的变更实时应用到被选图形，同时更新默认值供后续绘制使用
- 属性面板固定在左侧，不跟随画布平移/缩放

## 反模式

- 不在工具栏中放置颜色/宽度选择器（应出现在选中后的属性面板中）
- 不将属性面板放在顶部
- 不加多余的装饰效果、渐变背景、emoji 图标

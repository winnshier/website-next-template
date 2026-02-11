# 响应式设计指南

## 设计基准

### PC端
- **设计稿尺寸**：1920px × 1080px
- **根字体大小**：16px（动态计算）
- **最大宽度**：1920px（超过此宽度不再放大）

### 移动端
- **设计稿尺寸**：375px（一倍图）
- **根字体大小**：14px（动态计算）
- **断点**：768px（行业标准）

## 动态单位原理

### PostCSS 自动转换

项目已配置 `postcss-pxtorem` 插件，**所有 CSS 文件中的 `px` 会自动转换为 `rem`**。

**转换规则**：
```css
/* 你写的代码 */
.my-class {
  font-size: 20px;
  padding: 16px;
  margin: 24px 32px;
}

/* 编译后的代码 */
.my-class {
  font-size: 1.25rem;    /* 20 / 16 */
  padding: 1rem;         /* 16 / 16 */
  margin: 1.5rem 2rem;   /* 24 / 16, 32 / 16 */
}
```

**不转换的情况**：
- Tailwind 的预设类（已经是 rem）
- `node_modules` 中的文件
- 匹配 `selectorBlackList` 的选择器

### 根字体大小计算

```css
/* 移动端 (<768px) */
html {
  font-size: calc(14 * (100vw / 375));
  /* 在 375px 屏幕上 = 14px */
  /* 在 320px 屏幕上 ≈ 11.9px */
  /* 在 414px 屏幕上 ≈ 15.4px */
}

/* PC端 (≥768px) */
html {
  font-size: calc(16 * (100vw / 1920));
  /* 在 1920px 屏幕上 = 16px */
  /* 在 1440px 屏幕上 = 12px */
  /* 在 1280px 屏幕上 ≈ 10.7px */
}

/* 超大屏 (≥1920px) */
html {
  font-size: 16px; /* 锁定，不再放大 */
}
```

### rem 单位换算

所有使用 `rem` 的尺寸都会根据根字体大小自动缩放：

```tsx
// 1rem 的实际大小
移动端(375px): 1rem = 14px
PC端(1920px): 1rem = 16px

// text-xl 的实际大小
移动端: 1.25rem = 17.5px
PC端: 1.25rem = 20px
```

## 断点使用

### 标准断点

| 断点 | 尺寸 | 说明 | 使用场景 |
|------|------|------|----------|
| `mobile` | `max: 767px` | 移动端 | 仅移动端样式 |
| `sm` | `640px` | 小屏手机横屏 | 手机横屏优化 |
| `md` | `768px` | 平板竖屏 | **主要断点** |
| `lg` | `1024px` | 平板横屏 | 桌面布局 |
| `xl` | `1280px` | 桌面显示器 | 宽屏优化 |
| `2xl` | `1536px` | 大屏显示器 | 超宽屏 |

### 语义化断点

| 断点 | 尺寸 | 说明 |
|------|------|------|
| `tablet` | `768px` | 平板及以上 |
| `desktop` | `1024px` | 桌面及以上 |
| `wide` | `1920px` | 宽屏（锁定） |

## 使用示例

### 0. CSS 文件中使用 px（自动转换）

```css
/* 直接写 px，会自动转换为 rem */
.custom-component {
  font-size: 18px;      /* 转换为 1.125rem */
  padding: 20px 30px;   /* 转换为 1.25rem 1.875rem */
  margin-bottom: 40px;  /* 转换为 2.5rem */
  border-radius: 8px;   /* 转换为 0.5rem */
}

/* 内联样式也可以用 px */
.inline-style {
  width: 320px;   /* 转换为 20rem */
  height: 200px;  /* 转换为 12.5rem */
}
```

**注意**：
- ✅ 所有 CSS 文件中的 `px` 都会自动转换
- ✅ 转换后的 `rem` 会根据屏幕尺寸动态缩放
- ⚠️ 如果不想转换某个类，可以在 `postcss.config.js` 的 `selectorBlackList` 中添加

### 1. 响应式字体

```tsx
<h1 className="
  text-2xl md:text-4xl lg:text-5xl
  font-bold
">
  标题文字
</h1>

// 实际效果：
// 移动端(<768px): 21px (1.5rem × 14px)
// 平板(768px-1023px): 36px (2.25rem × 16px)
// 桌面(≥1024px): 48px (3rem × 16px)
```

### 2. 响应式间距

```tsx
<div className="
  px-4 md:px-8 lg:px-16
  py-8 md:py-12 lg:py-16
">
  内容区域
</div>

// 实际效果：
// 移动端: padding 16px 32px
// 平板: padding 32px 48px
// 桌面: padding 64px 64px
```

### 3. 响应式布局

```tsx
<div className="
  grid
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 md:gap-6 lg:gap-8
">
  {items.map(item => (
    <div key={item.id}>卡片</div>
  ))}
</div>

// 实际效果：
// 移动端: 1列，间距 16px
// 平板: 2列，间距 24px
// 桌面: 3列，间距 32px
```

### 4. 移动端专属样式

```tsx
<div className="
  mobile:hidden
  md:block
">
  仅在平板及以上显示
</div>

<div className="
  mobile:block
  md:hidden
">
  仅在移动端显示
</div>
```

### 5. 容器最大宽度

```tsx
<div className="
  w-full
  max-w-[90vw] md:max-w-[1200px] lg:max-w-[1400px]
  mx-auto
">
  居中容器
</div>
```

## 字体大小对照表

| Class | 移动端(375px) | PC端(1920px) | 用途 |
|-------|--------------|-------------|------|
| `text-xs` | 10.5px | 12px | 辅助文字 |
| `text-sm` | 12.25px | 14px | 小号文字 |
| `text-base` | 14px | 16px | 正文 |
| `text-lg` | 15.75px | 18px | 大号正文 |
| `text-xl` | 17.5px | 20px | 小标题 |
| `text-2xl` | 21px | 24px | 中标题 |
| `text-3xl` | 26.25px | 30px | 大标题 |
| `text-4xl` | 31.5px | 36px | 特大标题 |
| `text-5xl` | 42px | 48px | 超大标题 |

## 最佳实践

### 1. 移动端优先

```tsx
// ✅ 推荐：从小屏开始，逐步增强
<div className="text-base md:text-lg lg:text-xl">

// ❌ 不推荐：从大屏开始
<div className="text-xl lg:text-base">
```

### 2. 使用语义化断点

```tsx
// ✅ 推荐：语义清晰
<div className="hidden tablet:block">

// ✅ 也可以：标准断点
<div className="hidden md:block">
```

### 3. 合理使用 rem

```tsx
// ✅ 推荐：字体、间距使用 rem（会自动缩放）
<div className="text-lg p-4 mb-6">

// ✅ 可以：固定尺寸使用 px
<div className="w-[375px] h-[200px]">

// ❌ 避免：混用导致比例失调
<div className="text-[20px] p-4">
```

### 4. 容器宽度控制

```tsx
// ✅ 推荐：使用 max-w 限制最大宽度
<div className="w-full max-w-7xl mx-auto">

// ✅ 推荐：响应式最大宽度
<div className="max-w-[90vw] md:max-w-[1200px]">
```

### 5. 图片响应式

```tsx
// ✅ 推荐：使用 Next.js Image
<Image
  src="/image.jpg"
  alt="描述"
  width={800}
  height={600}
  className="w-full h-auto"
/>

// ✅ 推荐：响应式尺寸
<img
  src="/image.jpg"
  className="
    w-full md:w-1/2 lg:w-1/3
    h-auto
  "
/>
```

## 调试技巧

### 1. 查看当前根字体大小

```javascript
// 在浏览器控制台执行
console.log(getComputedStyle(document.documentElement).fontSize);
```

### 2. 查看当前断点

```tsx
// 添加调试组件
<div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs">
  <span className="mobile:inline hidden">Mobile</span>
  <span className="hidden md:inline lg:hidden">Tablet</span>
  <span className="hidden lg:inline xl:hidden">Desktop</span>
  <span className="hidden xl:inline">Wide</span>
</div>
```

### 3. 测试不同屏幕尺寸

- **移动端**：320px, 375px, 414px
- **平板**：768px, 1024px
- **桌面**：1280px, 1440px, 1920px
- **超宽屏**：2560px

## 注意事项

1. **PostCSS 配置**
   - 已安装 `postcss-pxtorem` 插件
   - 配置文件：`postcss.config.js`
   - 基准值：`rootValue: 16`（与 PC 端根字体一致）

2. **不要混用固定和动态单位**
   - 字体、间距使用 `rem`（会缩放）
   - 固定尺寸使用 `px`（不缩放）
   - CSS 中的 `px` 会自动转换为 `rem`

3. **注意最小字体限制**
   - 移动端最小字体建议 12px
   - PC端最小字体建议 14px

4. **测试极端尺寸**
   - 小屏：320px（iPhone SE）
   - 大屏：2560px（4K显示器）

5. **性能优化**
   - 使用 CSS 变量，避免 JS 计算
   - 减少媒体查询嵌套层级

6. **排除不需要转换的选择器**
   - 在 `postcss.config.js` 的 `selectorBlackList` 中添加
   - 例如：`/^\.no-convert/` 会排除所有 `.no-convert-*` 类

## PostCSS 配置详解

### 配置文件位置
`postcss.config.js`

### 主要配置项

```javascript
'postcss-pxtorem': {
  // 根字体大小基准值（与 PC 端根字体一致）
  rootValue: 16,

  // 需要转换的 CSS 属性
  propList: ['*'],  // '*' 表示所有属性

  // 不需要转换的选择器（正则表达式）
  selectorBlackList: [
    /^\.text-/,      // 排除 .text-* 类
    /^\.leading-/,   // 排除 .leading-* 类
    /^\.tracking-/,  // 排除 .tracking-* 类
  ],

  // 是否替换原来的 px 值
  replace: true,

  // 是否在媒体查询中转换 px
  mediaQuery: false,

  // 最小转换的 px 值
  minPixelValue: 1,

  // 排除的文件或文件夹
  exclude: /node_modules/i,
}
```

### 如何排除特定类不转换

在 `selectorBlackList` 中添加正则表达式：

```javascript
selectorBlackList: [
  /^\.text-/,           // 排除 .text-* 类
  /^\.no-convert/,      // 排除 .no-convert-* 类
  /^\.fixed-size/,      // 排除 .fixed-size-* 类
]
```

### 验证转换是否生效

1. 启动开发服务器：
```bash
npm run dev
```

2. 在浏览器开发者工具中查看编译后的 CSS
3. 检查 `px` 是否已转换为 `rem`

---

**最后更新**: 2026-02-09
**版本**: 1.1.0

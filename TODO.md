# 技术债务与改进计划

**最后更新**: 2026-02-06  
**状态**: 项目可用，但存在架构偏差

---

## 📊 概述

本项目已完成基本功能开发并可以正常运行，但经过代码审查（由Codex AI进行），发现实现与 `PROJECT_PLAN.md` 存在一些偏差。这些偏差不影响基本使用，但会影响可维护性、扩展性和某些高级功能。

**当前代码质量评分**: 5/10（Codex评估）

---

## 🔴 已修复的严重问题

### ✅ 1. LazyImage组件的React反模式
- **问题**: 在render中直接调用setState，违反React规则
- **影响**: React警告，Strict Mode下可能无限循环
- **状态**: ✅ 已修复（2026-02-06）
- **修复**: 将setState逻辑移到useEffect中

### ✅ 2. useIntersectionObserver性能问题
- **问题**: 每次render都重新创建observer
- **影响**: 不必要的重连，可能错过intersection事件
- **状态**: ✅ 已修复（2026-02-06）
- **修复**: 使用useMemo缓存observerOptions

---

## 🟡 待修复的架构偏差

### 1. 国际化系统未正确实现 (高优先级)

**当前状态**:
- 使用简单的 `locale === 'zh'` 判断
- 没有使用 `NextIntlClientProvider`
- 翻译文件 `public/locales/*` 未被使用
- 缺少 `next-intl` 的完整集成

**影响**:
- ❌ 无法复用翻译
- ❌ 缺少服务端消息加载
- ❌ 缺少hreflang元数据
- ❌ 难以扩展到更多语言

**改进计划**:
1. 创建 `lib/i18n/request.ts` 配置
2. 在 `app/[locale]/layout.tsx` 中添加 `NextIntlClientProvider`
3. 加载 `public/locales/*` 中的消息
4. 替换所有 `locale === 'zh'` 为 `t('key')` 调用
5. 更新 `middleware.ts` 使用 `next-intl/middleware`

**参考**:
- PROJECT_PLAN.md: 21-39行
- next-intl文档: https://next-intl-docs.vercel.app/

---

### 2. 数据获取层未被使用 (高优先级)

**当前状态**:
- `app/[locale]/page.tsx` 直接硬编码内容
- `lib/api/fetchers/home.ts` 中的 `getHomeData` 未被调用
- API降级逻辑未生效

**影响**:
- ❌ 缓存/ISR功能未生效
- ❌ 静态JSON降级未测试
- ❌ 无法连接CMS或外部API
- ❌ 不符合规划的数据流架构

**改进计划**:
1. 更新 `app/[locale]/page.tsx` 调用 `getHomeData(locale)`
2. 测试API失败时的降级逻辑
3. 确保静态JSON与API响应格式一致
4. 添加错误边界处理

**参考**:
- PROJECT_PLAN.md: 474-505行

---

### 3. ProductSlider未使用keen-slider (中优先级)

**当前状态**:
- 使用自定义实现（useState + AnimatePresence）
- `keen-slider` 依赖已安装但未使用

**影响**:
- ❌ 缺少触摸手势支持
- ❌ 缺少循环播放
- ❌ 缺少虚拟化（大量slides时性能差）
- ❌ 不符合规划的PPT式滑块设计

**改进计划**:
1. 重写 `components/products/ProductSlider.tsx` 使用 `keen-slider`
2. 导入 `{ useKeenSlider }` hook
3. 配置 `keen-slider__slide` 元素
4. 添加触摸手势和循环支持
5. 或者：移除 `keen-slider` 依赖并更新规划文档

**参考**:
- PROJECT_PLAN.md: 82-87行, 1165-1183行
- keen-slider文档: https://keen-slider.io/

---

### 4. API客户端缺少弹性机制 (中优先级)

**当前状态**:
- `lib/api/client.ts` 缺少retry逻辑
- timeout的setTimeout未在finally中清理
- 可能导致内存泄漏

**影响**:
- ❌ 瞬时网络故障不会重试
- ❌ 请求超时后可能仍抛出错误
- ❌ 潜在的内存泄漏

**改进计划**:
1. 实现 `fetchWithRetry` 辅助函数
2. 在finally块中清理timeout
3. 添加指数退避重试策略
4. 统一错误对象格式

**参考**:
- PROJECT_PLAN.md: 639-650行

---

### 5. LazyVideo加载状态不准确 (中优先级)

**当前状态**:
- 在observer触发时就设置 `isLoaded=true`
- 未等待 `onLoadedData` 或 `onCanPlay` 事件

**影响**:
- ❌ 骨架屏过早消失
- ❌ 视频仍在缓冲时显示空白
- ❌ 错误处理不完善

**改进计划**:
1. 监听 `onLoadedData` 或 `onCanPlay` 事件
2. 只在视频真正可播放时设置 `isLoaded=true`
3. 改进错误状态处理

---

### 6. 缺少路由级错误处理 (低优先级)

**当前状态**:
- 缺少 `app/[locale]/not-found.tsx`
- 缺少 `app/[locale]/products/error.tsx`
- 404和错误都回退到全局错误边界

**影响**:
- ❌ 用户体验不够友好
- ❌ 无法针对不同路由定制错误页面

**改进计划**:
1. 创建 `app/[locale]/not-found.tsx`
2. 创建 `app/[locale]/products/error.tsx`
3. 创建 `app/[locale]/about/error.tsx`
4. 添加友好的错误提示和恢复选项

**参考**:
- PROJECT_PLAN.md: 48-58行

---

### 7. SEO工具配置不完整 (低优先级)

**当前状态**:
- 手动实现了 `app/sitemap.ts` 和 `app/robots.ts`
- `next-sitemap` 已安装但未配置
- 缺少 `next-sitemap.config.js`
- 缺少 `postbuild` 脚本

**影响**:
- ✅ 基本SEO功能正常
- ❌ 缺少自动化的hreflang生成
- ❌ 缺少多环境robots.txt策略
- ❌ 依赖未被充分利用

**改进计划**:
- **选项A**: 配置 `next-sitemap.config.js` 和 `postbuild` 脚本
- **选项B**: 移除 `next-sitemap` 依赖，继续使用手动方式

**建议**: 选项B（手动方式在Next.js 14中是推荐做法）

**参考**:
- PROJECT_PLAN.md: 37-40行, 758-759行

---

### 8. middleware.ts的locale处理 (低优先级)

**当前状态**:
- 访问 `/fr/about` 会变成 `/en/fr/about`
- 未知locale被嵌套而非替换

**影响**:
- ❌ 未知locale导致404
- ❌ URL不符合预期

**改进计划**:
1. 检测并替换未知locale
2. 而非简单地添加前缀
3. 添加locale验证逻辑

---

## 📋 测试清单（未完成）

根据 `DEVELOPMENT.md` 阶段七，以下测试尚未执行：

### 功能测试
- [ ] 多语言切换测试
- [ ] 响应式布局测试
- [ ] API请求测试
- [ ] 导航功能测试
- [ ] 图片/视频加载测试

### 性能测试
- [ ] Lighthouse 性能测试
- [ ] Core Web Vitals 测试
- [ ] 图片优化验证
- [ ] 缓存策略验证

### SEO测试
- [ ] Sitemap 生成验证
- [ ] 结构化数据验证
- [ ] Meta标签验证
- [ ] Hreflang 标签验证

### Docker测试
- [ ] 本地Docker构建测试
- [ ] 测试环境部署测试
- [ ] 健康检查测试
- [ ] 日志输出测试

---

## 🎯 推荐实施顺序

如果要完全符合 `PROJECT_PLAN.md`，建议按以下顺序实施：

1. **国际化系统** (1-2天)
   - 影响最大，涉及多个文件
   - 解锁翻译复用和元数据功能

2. **数据获取层** (0.5-1天)
   - 相对简单，主要是调用现有函数
   - 验证API降级逻辑

3. **ProductSlider重构** (1天)
   - 独立模块，不影响其他功能
   - 提升用户体验

4. **API弹性机制** (0.5天)
   - 提升稳定性
   - 修复潜在内存泄漏

5. **其他小问题** (1天)
   - LazyVideo、错误页面、middleware等

**总计**: 约4-5天工作量

---

## 💡 使用建议

### 如果你只是想快速使用模板：
- ✅ 当前版本完全可用
- ✅ 所有页面都能正常渲染
- ✅ 没有运行时错误
- ⚠️ 注意：多语言功能较简单，扩展时需要重构

### 如果你需要生产级质量：
- 📋 按照上述顺序逐步实施改进
- 📋 完成测试清单中的所有项目
- 📋 考虑添加单元测试和E2E测试

### 如果你要扩展功能：
- 🔍 先阅读 `PROJECT_PLAN.md` 了解原始设计
- 🔍 评估是否需要先修复架构偏差
- 🔍 特别注意国际化和数据获取层

---

## 📚 相关文档

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - 原始技术规划
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发进度记录
- [CLAUDE.md](./CLAUDE.md) - Claude开发指南
- [README.md](./README.md) - 项目说明

---

## 🤝 贡献

如果你修复了上述任何问题，欢迎：
1. 更新此文档，标记为已完成
2. 在 `DEVELOPMENT.md` 中记录
3. 提交Pull Request

---

**备注**: 本文档基于Codex AI的代码审查结果创建，旨在帮助开发者了解项目现状和改进方向。

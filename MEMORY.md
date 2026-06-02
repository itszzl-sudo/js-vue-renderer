# js-vue-renderer 项目记忆

## 项目概述
- **项目名称**: js-vue-renderer
- **描述**: Vue + WebGPU 自研渲染引擎 - 纯浏览器端实现
- **语言**: JavaScript (ES Module)
- **平台**: 现代浏览器（需支持 WebGPU）

## 核心设计理念

### 不使用现有方案
- 不依赖 Vue 官方运行时（完全自研）
- 不依赖 CSS 解析库（自研简单解析器）
- 不依赖 DOM/CSSOM（完全自研节点和布局）

### 从简单开始
- Phase 1: 单文件、纯 div、无文字图片 ✅ 已完成
- Phase 2: 添加文字支持
- Phase 3: 添加更多 CSS 属性
- Phase 4: 添加 Flexbox 布局
- Phase 5: 组件嵌套

## 核心模块

### 1. createApp
入口函数，创建 Vue 应用实例。

### 2. VueRenderer
主渲染器，协调各模块工作：
- 初始化 WebGPU
- 解析模板
- 布局计算
- 帧循环渲染

### 3. CustomDOMHost
自研 DOM 宿主接口：
- `createElement(tag)` - 创建元素节点
- `createTextNode(text)` - 创建文本节点
- `insert/remove` - 节点操作
- `setElementText` - 文本设置
- `patchProps` - 属性变更

### 4. VNode
虚拟节点类，存储：
- tag, textContent
- props, style, className
- children, parent

### 5. parseTemplate
模板解析器：
- 使用正则解析 HTML 标签
- 提取 class、style 等属性
- 构建 VNode 树

### 6. LayoutEngine
布局引擎：
- 递归计算节点坐标
- 支持 class 样式映射
- 支持基础样式属性

### 7. WebGPURenderer
WebGPU 渲染器：
- 初始化适配器和设备
- 创建渲染管线
- 绘制矩形元素
- 帧循环更新

## 当前状态

### 已实现
✅ 模板解析（HTML 标签）
✅ 基础样式解析（backgroundColor, borderRadius, width, height）
✅ Class 样式映射
✅ VNode 虚拟节点
✅ 简单布局计算（垂直流式）
✅ WebGPU 渲染管线
✅ 帧循环更新

### 待实现
❌ 文字渲染
❌ 更多 CSS 属性
❌ Flexbox 布局
❌ 组件嵌套
❌ 事件处理
❌ 响应式数据

## 文件结构
```
js-vue-renderer/
├── package.json
├── index.html
├── MEMORY.md
└── src/
    └── vue-runtime.js   # 全部代码（模板解析、布局、WebGPU）
```

## 使用方法

需要通过 HTTP 服务器访问（WebGPU 需要安全上下文）：
```bash
# 使用 Python
python -m http.server 8080

# 或使用 npx
npx serve .
```

然后访问 http://localhost:8080

## 测试模板
```javascript
const app = createApp({
    template: `
        <div class="container">
            <div class="card">
                <div class="box red"></div>
                <div class="box blue"></div>
                <div class="box green"></div>
            </div>
        </div>
    `
});
```

## 内置 Class 样式
```javascript
const classStyles = {
    'container': { backgroundColor: '#1a1a2e', padding: '20px' },
    'card': { backgroundColor: '#ffffff', borderRadius: '20px', padding: '30px' },
    'box': { width: 100, height: 80, borderRadius: '10px', margin: '10px' },
    'red': { backgroundColor: '#ff6b6b' },
    'blue': { backgroundColor: '#4ecdc4' },
    'green': { backgroundColor: '#45b7d1' }
};
```

---
*最后更新: 2026-05-31*

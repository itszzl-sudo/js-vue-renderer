<template>
  <div class="dashboard">
    <div class="header">
      <h1 class="title">WebGPU Vue Renderer</h1>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">12.8K</div>
          <div class="stat-label">渲染帧率</div>
        </div>
        <div class="stat">
          <div class="stat-value">99%</div>
          <div class="stat-label">性能优化</div>
        </div>
        <div class="stat">
          <div class="stat-value">79</div>
          <div class="stat-label">测试通过</div>
        </div>
      </div>
    </div>
    
    <div class="grid-section">
      <div class="card primary-card">
        <div class="card-header">
          <h2 class="card-title">Flex 布局系统</h2>
        </div>
        <div class="card-content">
          <div class="flex-row">
            <div class="item item-blue">flex</div>
            <div class="item item-green">布局</div>
            <div class="item item-purple">完美</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">对齐模式</h2>
        </div>
        <div class="card-content">
          <div class="align-demo">
            <div class="align-item">1</div>
            <div class="align-item">2</div>
            <div class="align-item">3</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">间距与圆角</h2>
        </div>
        <div class="card-content">
          <div class="grid-items">
            <div class="grid-item grid-red"></div>
            <div class="grid-item grid-blue"></div>
            <div class="grid-item grid-green"></div>
            <div class="grid-item grid-yellow"></div>
            <div class="grid-item grid-purple"></div>
            <div class="grid-item grid-pink"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="card large-card">
        <div class="card-header">
          <h2 class="card-title">组件系统与样式隔离</h2>
        </div>
        <div class="card-content">
          <div class="columns">
            <div class="column">
              <div class="feature">
                <div class="feature-icon">🎨</div>
                <h3>完整样式系统</h3>
                <p>支持全局样式和 Scoped 样式隔离</p>
              </div>
            </div>
            <div class="column">
              <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>高性能引擎</h3>
                <p>LRU 缓存 + 前缀和优化，性能拉满</p>
              </div>
            </div>
            <div class="column">
              <div class="feature">
                <div class="feature-icon">🌳</div>
                <h3>虚拟 DOM</h3>
                <p>完整的 Virtual DOM 运行时实现</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>💖 Vue Renderer + 自研布局引擎 + Canvas 渲染 - 100% 原生实现</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.dashboard {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  width: 100%;
  height: 100%;
  padding: 30px;
  gap: 25px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 35px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}

.title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats {
  display: flex;
  gap: 40px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #60a5fa;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
}

.grid-section {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  padding: 20px;
}

.primary-card {
  flex: 1.5;
}

.card-header {
  margin-bottom: 18px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.card-content {
  display: flex;
  justify-content: center;
}

.flex-row {
  display: flex;
  gap: 15px;
  background: rgba(0,0,0,0.2);
  padding: 25px;
  border-radius: 15px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 70px;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.item-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.item-green {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.item-purple {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.align-demo {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
}

.align-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f472b6, #fb923c);
  color: white;
  font-weight: 700;
}

.grid-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 15px;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
}

.grid-item {
  width: 55px;
  height: 55px;
  border-radius: 12px;
}

.grid-red { background: linear-gradient(135deg, #ef4444, #f87171); }
.grid-blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.grid-green { background: linear-gradient(135deg, #10b981, #34d399); }
.grid-yellow { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.grid-purple { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.grid-pink { background: linear-gradient(135deg, #ec4899, #f472b6); }

.main-content {
  flex: 1;
}

.large-card {
  height: 100%;
}

.columns {
  display: flex;
  gap: 30px;
  padding: 10px;
}

.column {
  flex: 1;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background: rgba(255,255,255,0.05);
  border-radius: 15px;
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature h3 {
  font-size: 18px;
  color: #e2e8f0;
  margin-bottom: 8px;
  font-weight: 600;
}

.feature p {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
}

.footer {
  padding: 20px;
  text-align: center;
  background: rgba(0,0,0,0.3);
  border-radius: 15px;
}

.footer p {
  color: #cbd5e1;
  font-size: 15px;
}
</style>

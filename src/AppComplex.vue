<template>
  <div class="app">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="logo">Vue 渲染器</div>
      <div class="nav">
        <div class="nav-item active">首页</div>
        <div class="nav-item">产品</div>
        <div class="nav-item">关于</div>
        <div class="nav-item">联系</div>
      </div>
      <div class="user-area">
        <div class="avatar"></div>
        <div class="username">User</div>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main">
      <!-- 左侧栏 -->
      <div class="sidebar">
        <div class="menu-item active">📊 仪表盘</div>
        <div class="menu-item">📁 项目</div>
        <div class="menu-item">📈 统计</div>
        <div class="menu-item">⚙️ 设置</div>
        <div class="menu-spacer"></div>
        <div class="menu-footer">v1.0.0</div>
      </div>

      <!-- 内容区 -->
      <div class="content">
        <!-- 顶部卡片区 -->
        <div class="stats">
          <div class="stat-card stat-1">
            <div class="stat-label">总收入</div>
            <div class="stat-value">¥128,560</div>
            <div class="stat-trend up">↑ 12.5%</div>
          </div>
          <div class="stat-card stat-2">
            <div class="stat-label">新用户</div>
            <div class="stat-value">2,458</div>
            <div class="stat-trend up">↑ 8.2%</div>
          </div>
          <div class="stat-card stat-3">
            <div class="stat-label">转化率</div>
            <div class="stat-value">3.24%</div>
            <div class="stat-trend down">↓ 0.5%</div>
          </div>
          <div class="stat-card stat-4">
            <div class="stat-label">订单数</div>
            <div class="stat-value">1,892</div>
            <div class="stat-trend up">↑ 15.3%</div>
          </div>
        </div>

        <!-- 图表区 -->
        <div class="charts">
          <div class="chart-main">
            <div class="chart-header">
              <div class="chart-title">销售趋势</div>
              <div class="chart-tabs">
                <div class="tab active">日</div>
                <div class="tab">周</div>
                <div class="tab">月</div>
              </div>
            </div>
            <div class="chart-body">
              <div class="bar" style="height: 30%"></div>
              <div class="bar" style="height: 50%"></div>
              <div class="bar" style="height: 45%"></div>
              <div class="bar" style="height: 70%"></div>
              <div class="bar" style="height: 60%"></div>
              <div class="bar" style="height: 85%"></div>
              <div class="bar" style="height: 75%"></div>
              <div class="bar" style="height: 90%"></div>
              <div class="bar" style="height: 65%"></div>
              <div class="bar" style="height: 95%"></div>
            </div>
          </div>
          <div class="chart-side">
            <div class="pie-title">分类占比</div>
            <div class="pie-item">
              <div class="pie-color c1"></div>
              <div class="pie-label">电子产品</div>
              <div class="pie-value">45%</div>
            </div>
            <div class="pie-item">
              <div class="pie-color c2"></div>
              <div class="pie-label">服装</div>
              <div class="pie-value">25%</div>
            </div>
            <div class="pie-item">
              <div class="pie-color c3"></div>
              <div class="pie-label">食品</div>
              <div class="pie-value">18%</div>
            </div>
            <div class="pie-item">
              <div class="pie-color c4"></div>
              <div class="pie-label">其他</div>
              <div class="pie-value">12%</div>
            </div>
          </div>
        </div>

        <!-- 列表区 -->
        <div class="list">
          <div class="list-header">
            <div class="list-title">最近活动</div>
            <div class="list-action">查看全部 →</div>
          </div>
          <div class="list-row">
            <div class="row-avatar a1">张</div>
            <div class="row-info">
              <div class="row-name">张三提交了订单 #1234</div>
              <div class="row-time">5 分钟前</div>
            </div>
            <div class="row-amount">¥1,280</div>
          </div>
          <div class="list-row">
            <div class="row-avatar a2">李</div>
            <div class="row-info">
              <div class="row-name">李四完成了支付</div>
              <div class="row-time">15 分钟前</div>
            </div>
            <div class="row-amount">¥560</div>
          </div>
          <div class="list-row">
            <div class="row-avatar a3">王</div>
            <div class="row-info">
              <div class="row-name">王五注册了新账号</div>
              <div class="row-time">1 小时前</div>
            </div>
            <div class="row-amount">免费</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppComplex'
}
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  width: 100%;
  height: 100%;
  font-family: -apple-system, sans-serif;
}

/* ========== 顶部栏 ========== */
.header {
  display: flex;
  flex-direction: row;
  background-color: #1a1a2e;
  height: 64px;
  padding: 0 24px;
  align-items: center;
}
.logo {
  width: 180px;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
}
.nav {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  gap: 8px;
  margin-left: 40px;
}
.nav-item {
  padding: 8px 16px;
  color: #a0a0b0;
  border-radius: 6px;
  font-size: 14px;
}
.nav-item.active {
  color: #ffffff;
  background-color: #4ecdc4;
}
.user-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #ff6b6b;
}
.username {
  color: #ffffff;
  font-size: 14px;
}

/* ========== 主体 ========== */
.main {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  background-color: #2a2a3e;
  padding: 20px 12px;
}
.menu-item {
  padding: 12px 16px;
  color: #a0a0b0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 4px;
}
.menu-item.active {
  color: #ffffff;
  background-color: #4ecdc4;
}
.menu-spacer {
  flex-grow: 1;
}
.menu-footer {
  color: #6a6a7a;
  font-size: 12px;
  padding: 8px 16px;
}

/* 内容区 */
.content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px;
  gap: 20px;
}

/* 统计卡片 */
.stats {
  display: flex;
  flex-direction: row;
  gap: 20px;
  height: 110px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  justify-content: space-between;
}
.stat-1 { border-left: 4px solid #ff6b6b; }
.stat-2 { border-left: 4px solid #4ecdc4; }
.stat-3 { border-left: 4px solid #45b7d1; }
.stat-4 { border-left: 4px solid #f9ca24; }
.stat-label {
  color: #888;
  font-size: 13px;
}
.stat-value {
  color: #1a1a2e;
  font-size: 26px;
  font-weight: bold;
}
.stat-trend {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  width: 60px;
  text-align: center;
}
.stat-trend.up {
  color: #27ae60;
  background-color: #e8f8f0;
}
.stat-trend.down {
  color: #e74c3c;
  background-color: #fde8e8;
}

/* 图表区 */
.charts {
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-grow: 1;
}
.chart-main {
  display: flex;
  flex-direction: column;
  flex: 3;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
}
.chart-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
}
.chart-title {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  flex-grow: 1;
}
.chart-tabs {
  display: flex;
  flex-direction: row;
  gap: 4px;
  background-color: #f0f0f5;
  border-radius: 6px;
  padding: 2px;
}
.tab {
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  border-radius: 4px;
}
.tab.active {
  color: #ffffff;
  background-color: #4ecdc4;
}
.chart-body {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 12px;
  flex-grow: 1;
}
.bar {
  flex: 1;
  background-color: #4ecdc4;
  border-radius: 4px 4px 0 0;
  min-height: 10px;
}
.chart-side {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  gap: 12px;
}
.pie-title {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 10px;
}
.pie-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 0;
}
.pie-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 10px;
}
.pie-color.c1 { background-color: #ff6b6b; }
.pie-color.c2 { background-color: #4ecdc4; }
.pie-color.c3 { background-color: #45b7d1; }
.pie-color.c4 { background-color: #f9ca24; }
.pie-label {
  flex-grow: 1;
  font-size: 14px;
  color: #555;
}
.pie-value {
  font-size: 14px;
  font-weight: bold;
  color: #1a1a2e;
}

/* 列表区 */
.list {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  height: 200px;
}
.list-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
}
.list-title {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a2e;
  flex-grow: 1;
}
.list-action {
  font-size: 13px;
  color: #4ecdc4;
  cursor: pointer;
}
.list-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f5;
}
.row-avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  color: #ffffff;
  text-align: center;
  line-height: 36px;
  font-size: 14px;
  margin-right: 12px;
}
.row-avatar.a1 { background-color: #ff6b6b; }
.row-avatar.a2 { background-color: #4ecdc4; }
.row-avatar.a3 { background-color: #45b7d1; }
.row-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.row-name {
  font-size: 14px;
  color: #1a1a2e;
  margin-bottom: 2px;
}
.row-time {
  font-size: 12px;
  color: #999;
}
.row-amount {
  font-size: 14px;
  font-weight: bold;
  color: #4ecdc4;
}
</style>

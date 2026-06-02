// 自动布局检测脚本 - 使用 Playwright 启动无头浏览器，访问 DOM 调试页，检查布局
// 验证：根容器 / 卡片 / 三个色块的 layout 是否正确
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'http://localhost:8080/index-complex.html';

const report = {
  pageLoaded: false,
  elementsFound: 0,
  layouts: [],
  issues: [],
  summary: ''
};

async function run() {
  console.log('🔍 启动自动布局检测...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (text.includes('🔍') || text.includes('🐛') || text.includes('🚶')) {
      process.stdout.write('  📝 ' + text + '\n');
    }
  });
  page.on('pageerror', err => consoleLogs.push(`[pageerror] ${err.message}`));
  
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 10000 });
    report.pageLoaded = true;
    console.log('✅ 页面加载完成');
    
    await page.waitForTimeout(2000);
    
    // 输出控制台日志
    consoleLogs.forEach(l => console.log('  📝 ' + l));
    
    // 收集所有 vue-dom-root 下的 div
    const elements = await page.evaluate(() => {
      const root = document.getElementById('vue-dom-root');
      const app = document.getElementById('app');
      const result = {
        appSize: app ? { w: app.clientWidth, h: app.clientHeight } : null,
        domRoot: root ? { w: root.clientWidth, h: root.clientHeight } : null,
        windowSize: { w: window.innerWidth, h: window.innerHeight },
        elements: []
      };
      if (!root) return result;
      const walk = (dom) => {
        if (!dom) return;
        result.elements.push({
          tagName: dom.tagName,
          className: dom.className,
          layout: dom.dataset.layout,
          style: dom.dataset.style,
          computedLayout: {
            left: dom.style.left,
            top: dom.style.top,
            width: dom.style.width,
            height: dom.style.height,
            background: dom.style.background
          }
        });
        dom.childNodes.forEach(c => {
          if (c.nodeType === 1) walk(c);
        });
      };
      walk(root);
      return result;
    });
    
    if (!elements) {
      report.issues.push('未找到 #vue-dom-root 容器！');
    } else {
      console.log(`\n🖼️  Viewport: ${elements.windowSize.w}x${elements.windowSize.h}`);
      console.log(`🖼️  #app: ${elements.appSize?.w}x${elements.appSize?.h}`);
      console.log(`🖼️  #vue-dom-root: ${elements.domRoot?.w}x${elements.domRoot?.h}\n`);
      
      report.elementsFound = elements.elements.length;
      report.layouts = elements.elements;
      
      console.log(`\n📊 共发现 ${elements.elements.length} 个渲染元素：\n`);
      elements.elements.forEach((el, i) => {
        const layout = el.layout ? JSON.parse(el.layout) : null;
        const x = layout ? layout.x : '?';
        const y = layout ? layout.y : '?';
        const w = layout ? layout.width : '?';
        const h = layout ? layout.height : '?';
        const bg = el.computedLayout.background || 'transparent';
        const cls = el.className ? '.' + el.className : '';
        console.log(`  [${i}] <${el.tagName.toLowerCase()}${cls}> x=${x} y=${y} w=${x === '?' ? '?' : w} h=${x === '?' ? '?' : h} bg=${bg}`);
      });
      
      // 验证规则
      const app = elements.elements.find(e => e.className && e.className.includes('app'));
      const header = elements.elements.find(e => e.className && e.className.includes('header'));
      const main = elements.elements.find(e => e.className && e.className.includes('main'));
      const sidebar = elements.elements.find(e => e.className && e.className.includes('sidebar'));
      const content = elements.elements.find(e => e.className && e.className.includes('content'));
      const stats = elements.elements.find(e => e.className && e.className.includes('stats'));
      const statCards = elements.elements.filter(e => e.className && e.className.includes('stat-card'));
      const charts = elements.elements.find(e => e.className && e.className.includes('charts'));
      const list = elements.elements.find(e => e.className && e.className.includes('list'));
      const listRows = elements.elements.filter(e => e.className && e.className.includes('list-row'));
      const card = elements.elements.find(e => e.className && e.className === 'card');
      const container = elements.elements.find(e => e.className && e.className === 'container');
      
      if (!app) {
        report.issues.push('❌ 未找到 .app 元素！');
      } else {
        const l = JSON.parse(app.layout);
        console.log(`✅ app 尺寸: ${l.width}x${l.height}`);
      }
      
      if (!header) {
        report.issues.push('❌ 未找到 .header 元素！');
      } else {
        const l = JSON.parse(header.layout);
        console.log(`✅ header 尺寸: ${l.width}x${l.height}`);
        if (l.height !== 64) {
          report.issues.push(`⚠️  header 高度异常: ${l.height} (期望 64)`);
        }
      }
      
      if (!main) {
        report.issues.push('❌ 未找到 .main 元素！');
      } else {
        const l = JSON.parse(main.layout);
        console.log(`✅ main 尺寸: ${l.width}x${l.height}`);
      }
      
      if (!sidebar) {
        report.issues.push('❌ 未找到 .sidebar 元素！');
      } else {
        const l = JSON.parse(sidebar.layout);
        console.log(`✅ sidebar 尺寸: ${l.width}x${l.height}`);
        if (l.width !== 220) {
          report.issues.push(`⚠️  sidebar 宽度异常: ${l.width} (期望 220)`);
        }
      }
      
      if (!content) {
        report.issues.push('❌ 未找到 .content 元素！');
      } else {
        const l = JSON.parse(content.layout);
        console.log(`✅ content 尺寸: ${l.width}x${l.height}`);
      }
      
      if (statCards.length !== 4) {
        report.issues.push(`❌ 期望 4 个 stat-card，实际找到 ${statCards.length} 个！`);
      } else {
        console.log(`✅ 找到 ${statCards.length} 个 stat-card`);
      }
      
      if (!charts) {
        report.issues.push('❌ 未找到 .charts 元素！');
      } else {
        const l = JSON.parse(charts.layout);
        console.log(`✅ charts 尺寸: ${l.width}x${l.height}`);
      }
      
      if (!list) {
        report.issues.push('❌ 未找到 .list 元素！');
      } else {
        const l = JSON.parse(list.layout);
        console.log(`✅ list 尺寸: ${l.width}x${l.height}`);
      }
      
      if (listRows.length !== 3) {
        report.issues.push(`❌ 期望 3 个 list-row，实际找到 ${listRows.length} 个！`);
      } else {
        console.log(`✅ 找到 ${listRows.length} 个 list-row`);
        
        const row1 = JSON.parse(listRows[0].layout);
        const row2 = JSON.parse(listRows[1].layout);
        const row3 = JSON.parse(listRows[2].layout);
        
        console.log(`  list-row[0]: y=${row1.y} h=${row1.height}`);
        console.log(`  list-row[1]: y=${row2.y} h=${row2.height}`);
        console.log(`  list-row[2]: y=${row3.y} h=${row3.height}`);
        
        if (!(row1.y < row2.y && row2.y < row3.y)) {
          report.issues.push('❌ list-row 未正确垂直排列！');
        } else {
          console.log('✅ list-row 按 column 方向正确排列');
        }
      }
    }
    
    if (consoleLogs.length > 0) {
      console.log('\n📋 浏览器控制台输出:');
      consoleLogs.forEach(l => console.log('  ' + l));
      consoleLogs.filter(l => l.includes('error') || l.includes('Error')).forEach(l => {
        report.issues.push('⚠️  控制台错误: ' + l);
      });
    }
    
  } catch (err) {
    report.issues.push('💥 页面加载失败: ' + err.message);
    console.log('💥 错误:', err.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 检测报告');
  console.log('='.repeat(50));
  console.log(`页面加载: ${report.pageLoaded ? '✅' : '❌'}`);
  console.log(`发现元素: ${report.elementsFound}`);
  console.log(`问题数量: ${report.issues.length}`);
  
  if (report.issues.length > 0) {
    console.log('\n问题列表:');
    report.issues.forEach(i => console.log('  ' + i));
  } else {
    console.log('\n🎉 所有检查通过！');
  }
  
  process.exit(report.issues.length === 0 ? 0 : 1);
}

run();
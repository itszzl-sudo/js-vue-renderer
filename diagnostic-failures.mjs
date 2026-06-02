// Diagnostic for failed tests
import('./src/vue-runtime.js').then(async (mod) => {
  const { LayoutEngine } = mod;
  
  function createNode(tag, style = {}) {
    return {
      nodeType: 'element',
      tag,
      style: { ...style },
      children: [],
      layout: { x: 0, y: 0, width: 0, height: 0 },
      parent: null
    };
  }

  function setChildren(parent, ...children) {
    parent.children = children;
    children.forEach(c => c.parent = parent);
  }

  console.log('=== Test 1: flex-shrink: 0 (no shrink) ===');
  {
    const parent = createNode('div', { display: 'flex' });
    const c1 = createNode('div', { width: '300px', flexShrink: '0' });
    setChildren(parent, c1);
    LayoutEngine.calcFlexLayout(parent, { width: 200, height: 200 });
    console.log('c1.width:', c1.layout.width, '(expected: 300)');
    console.log('Result:', c1.layout.width === 300 ? 'PASS' : 'FAIL');
  }

  console.log('\n=== Test 2: grid with default single column ===');
  {
    const parent = createNode('div', { display: 'grid' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcGridLayout(parent, { width: 500, height: 400 });
    console.log('c1: x=' + c1.layout.x + ', y=' + c1.layout.y + ', w=' + c1.layout.width + ', h=' + c1.layout.height);
    console.log('c2: x=' + c2.layout.x + ', y=' + c2.layout.y + ', w=' + c2.layout.width + ', h=' + c2.layout.height);
    console.log('Expected: c1(x=0, y=0), c2(x=0, y=100)');
    console.log('Result:', c1.layout.x === 0 && c1.layout.y === 0 && c2.layout.x === 0 && c2.layout.y === 100 ? 'PASS' : 'FAIL');
  }

  console.log('\n=== Test 3: very small container ===');
  {
    const parent = createNode('div', { display: 'flex' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1);
    LayoutEngine.calcFlexLayout(parent, { width: 50, height: 30 });
    console.log('c1.width:', c1.layout.width, '(expected: 100)');
    console.log('Result:', c1.layout.width === 100 ? 'PASS' : 'FAIL');
  }

}).catch(err => console.error('Error:', err));
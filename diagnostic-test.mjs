// Simple diagnostic test
import('./src/vue-runtime.js').then(async (mod) => {
  const { LayoutEngine } = mod;
  
  function createNode(tag, style = {}, attrs = {}) {
    return {
      nodeType: 'element',
      tag,
      style: { ...style },
      attrs: { ...attrs },
      children: [],
      layout: { x: 0, y: 0, width: 0, height: 0 },
      parent: null
    };
  }

  function setChildren(parent, ...children) {
    parent.children = children;
    children.forEach(c => c.parent = parent);
  }

  function test(name, actual, expected, tolerance = 0) {
    let pass = false;
    if (tolerance > 0) {
      pass = Math.abs(actual - expected) <= tolerance;
    } else {
      pass = actual === expected;
    }
    console.log((pass ? 'PASS' : 'FAIL') + ': ' + name + ' (actual=' + actual + ', expected=' + expected + ')');
    return pass;
  }

  let passed = 0;
  let failed = 0;

  console.log('=== Test 1: flex-direction: row ===');
  {
    const parent = createNode('div', { display: 'flex', flexDirection: 'row' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.x', c1.layout.x, 0)) passed++; else failed++;
    if (test('c1.width', c1.layout.width, 100)) passed++; else failed++;
    if (test('c2.x', c2.layout.x, 100)) passed++; else failed++;
  }

  console.log('\n=== Test 2: flex-direction: column ===');
  {
    const parent = createNode('div', { display: 'flex', flexDirection: 'column' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.y', c1.layout.y, 0)) passed++; else failed++;
    if (test('c1.height', c1.layout.height, 50)) passed++; else failed++;
    if (test('c2.y', c2.layout.y, 50)) passed++; else failed++;
  }

  console.log('\n=== Test 3: flex-direction: row-reverse ===');
  {
    const parent = createNode('div', { display: 'flex', flexDirection: 'row-reverse' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.x', c1.layout.x, 400)) passed++; else failed++;
    if (test('c2.x', c2.layout.x, 300)) passed++; else failed++;
  }

  console.log('\n=== Test 4: justify-content: center ===');
  {
    const parent = createNode('div', { display: 'flex', justifyContent: 'center' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.x', c1.layout.x, 150)) passed++; else failed++;
    if (test('c2.x', c2.layout.x, 250)) passed++; else failed++;
  }

  console.log('\n=== Test 5: justify-content: flex-end ===');
  {
    const parent = createNode('div', { display: 'flex', justifyContent: 'flex-end' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.x', c1.layout.x, 300)) passed++; else failed++;
    if (test('c2.x', c2.layout.x, 400)) passed++; else failed++;
  }

  console.log('\n=== Test 6: gap: 10px ===');
  {
    const parent = createNode('div', { display: 'flex', gap: '10px' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    const c2 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.x', c1.layout.x, 0)) passed++; else failed++;
    if (test('c2.x', c2.layout.x, 110)) passed++; else failed++;
  }

  console.log('\n=== Test 7: flex-grow: 1 ===');
  {
    const parent = createNode('div', { display: 'flex' });
    const c1 = createNode('div', { width: '100px', flexGrow: '1' });
    setChildren(parent, c1);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.width', c1.layout.width, 500)) passed++; else failed++;
  }

  console.log('\n=== Test 8: flex-grow distributed proportionally ===');
  {
    const parent = createNode('div', { display: 'flex' });
    const c1 = createNode('div', { width: '100px', flexGrow: '1' });
    const c2 = createNode('div', { width: '100px', flexGrow: '2' });
    setChildren(parent, c1, c2);
    LayoutEngine.calcFlexLayout(parent, { width: 600, height: 200 });
    if (test('c1.width', c1.layout.width, 233, 2)) passed++; else failed++;
    if (test('c2.width', c2.layout.width, 367, 2)) passed++; else failed++;
  }

  console.log('\n=== Test 9: align-items: stretch ===');
  {
    const parent = createNode('div', { display: 'flex', alignItems: 'stretch' });
    const c1 = createNode('div', { width: '100px' });
    setChildren(parent, c1);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.height', c1.layout.height, 200)) passed++; else failed++;
  }

  console.log('\n=== Test 10: align-items: center ===');
  {
    const parent = createNode('div', { display: 'flex', alignItems: 'center' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.y', c1.layout.y, 75)) passed++; else failed++;
  }

  console.log('\n=== Test 11: align-items: flex-end ===');
  {
    const parent = createNode('div', { display: 'flex', alignItems: 'flex-end' });
    const c1 = createNode('div', { width: '100px', height: '50px' });
    setChildren(parent, c1);
    LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
    if (test('c1.y', c1.layout.y, 150)) passed++; else failed++;
  }

  console.log('\n=== SUMMARY ===');
  console.log('Passed: ' + passed + '/' + (passed + failed));
  console.log('Failed: ' + failed + '/' + (passed + failed));
  
}).catch(err => {
  console.error('Error:', err);
});
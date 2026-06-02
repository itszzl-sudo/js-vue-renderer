// Comprehensive Layout Test Suite
import('./src/vue-runtime.js').then(async (mod) => {
  const { LayoutEngine } = mod;
  
  function createNode(tag, style = {}, attrs = {}) {
    return {
      nodeType: 'element',
      tag,
      style: { ...style },
      attrs: { ...attrs },
      children: [],
      layout: { x: 0, y: 0, width: 0, height: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 },
      parent: null
    };
  }

  function setChildren(parent, ...children) {
    parent.children = children;
    children.forEach(c => c.parent = parent);
  }

  function assertNear(actual, expected, tolerance = 1) {
    if (Math.abs(actual - expected) <= tolerance) return { passed: true };
    return { passed: false, expected, actual };
  }

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      const result = fn();
      if (result === true || result.passed) {
        passed++;
        console.log(`  ✅ ${name}`);
      } else {
        failed++;
        console.log(`  ❌ ${name}`);
        if (result.expected !== undefined) {
          console.log(`     Expected: ${JSON.stringify(result.expected)}`);
          console.log(`     Actual:   ${JSON.stringify(result.actual)}`);
        }
      }
    } catch (err) {
      failed++;
      console.log(`  ❌ ${name}`);
      console.log(`     Error: ${err.message}`);
    }
  }

  function suite(name, fn) {
    console.log(`\n📋 ${name}`);
    fn();
  }

  // ==================== Flex Direction Tests ====================
  suite('Flex Layout - flex-direction', () => {
    test('flex-direction: row', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'row' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 100).passed;
    });

    test('flex-direction: column', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c2.layout.y, 50).passed;
    });

    test('flex-direction: row-reverse', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'row-reverse' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 400).passed && 
             assertNear(c2.layout.x, 300).passed;
    });

    test('flex-direction: column-reverse', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column-reverse' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.y, 150).passed && 
             assertNear(c2.layout.y, 100).passed;
    });
  });

  // ==================== Justify Content Tests ====================
  suite('Flex Layout - justify-content', () => {
    test('justify-content: flex-start (default)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 100).passed;
    });

    test('justify-content: center', () => {
      const parent = createNode('div', { display: 'flex', justifyContent: 'center' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 150).passed && 
             assertNear(c2.layout.x, 250).passed;
    });

    test('justify-content: flex-end', () => {
      const parent = createNode('div', { display: 'flex', justifyContent: 'flex-end' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 300).passed && 
             assertNear(c2.layout.x, 400).passed;
    });

    test('justify-content: space-between (2 items)', () => {
      const parent = createNode('div', { display: 'flex', justifyContent: 'space-between' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 400).passed;
    });

    test('justify-content: space-between (3 items)', () => {
      const parent = createNode('div', { display: 'flex', justifyContent: 'space-between' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      const c3 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 200).passed &&
             assertNear(c3.layout.x, 400).passed;
    });

    test('justify-content: space-around', () => {
      const parent = createNode('div', { display: 'flex', justifyContent: 'space-around' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      // Total space = 500, items = 200, free = 300, each item gets 150 around (75 each side)
      return assertNear(c1.layout.x, 75).passed && 
             assertNear(c2.layout.x, 325).passed;
    });

    test('justify-content: space-evenly', () => {
      const parent = createNode('div', { display: 'flex', justifyContent: 'space-evenly' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      // Total space = 500, items = 200, free = 300, 3 gaps = 100 each
      return assertNear(c1.layout.x, 100).passed && 
             assertNear(c2.layout.x, 300).passed;
    });
  });

  // ==================== Align Items Tests ====================
  suite('Flex Layout - align-items', () => {
    test('align-items: stretch', () => {
      const parent = createNode('div', { display: 'flex', alignItems: 'stretch' });
      const c1 = createNode('div', { width: '100px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.height, 200).passed;
    });

    test('align-items: flex-start', () => {
      const parent = createNode('div', { display: 'flex', alignItems: 'flex-start' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c1.layout.height, 50).passed;
    });

    test('align-items: center', () => {
      const parent = createNode('div', { display: 'flex', alignItems: 'center' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.y, 75).passed;
    });

    test('align-items: flex-end', () => {
      const parent = createNode('div', { display: 'flex', alignItems: 'flex-end' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.y, 150).passed;
    });
  });

  // ==================== Gap Tests ====================
  suite('Flex Layout - gap', () => {
    test('gap: 10px (2 items)', () => {
      const parent = createNode('div', { display: 'flex', gap: '10px' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 110).passed;
    });

    test('gap: 20px (3 items)', () => {
      const parent = createNode('div', { display: 'flex', gap: '20px' });
      const c1 = createNode('div', { width: '50px', height: '50px' });
      const c2 = createNode('div', { width: '50px', height: '50px' });
      const c3 = createNode('div', { width: '50px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 70).passed &&
             assertNear(c3.layout.x, 140).passed;
    });

    test('gap with justify-content: center', () => {
      const parent = createNode('div', { display: 'flex', gap: '10px', justifyContent: 'center' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      // Total = 210, centered at (500-210)/2 = 145
      return assertNear(c1.layout.x, 145).passed && 
             assertNear(c2.layout.x, 255).passed;
    });
  });

  // ==================== Flex Grow/Shrink Tests ====================
  suite('Flex Layout - flex-grow', () => {
    test('flex-grow: 1 (single item)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', flexGrow: '1' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.width, 500).passed;
    });

    test('flex-grow: distributed proportionally (1:2)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', flexGrow: '1' });
      const c2 = createNode('div', { width: '100px', flexGrow: '2' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 600, height: 200 });
      return assertNear(c1.layout.width, 233, 2).passed && 
             assertNear(c2.layout.width, 367, 2).passed;
    });

    test('flex-grow: equal distribution', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { flexGrow: '1' });
      const c2 = createNode('div', { flexGrow: '1' });
      const c3 = createNode('div', { flexGrow: '1' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 600, height: 200 });
      return assertNear(c1.layout.width, 200).passed && 
             assertNear(c2.layout.width, 200).passed &&
             assertNear(c3.layout.width, 200).passed;
    });
  });

  suite('Flex Layout - flex-shrink', () => {
    test('flex-shrink: 0 (no shrink)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '300px', flexShrink: '0' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 200, height: 200 });
      return assertNear(c1.layout.width, 300).passed;
    });

    test('flex-shrink: default (shrink enabled)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '300px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 200, height: 200 });
      return assertNear(c1.layout.width, 200).passed;
    });
  });

  suite('Flex Layout - flex-basis', () => {
    test('flex-basis: 200px', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { flexBasis: '200px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.width, 200).passed;
    });

    test('flex-basis with flex-grow', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { flexBasis: '100px', flexGrow: '1' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.width, 500).passed;
    });
  });

  // ==================== Percentage Size Tests ====================
  suite('Flex Layout - percentage sizes', () => {
    test('width: 50%', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '50%', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.width, 200).passed;
    });

    test('height: 50% in column', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column' });
      const c1 = createNode('div', { width: '100px', height: '50%' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.height, 100).passed;
    });

    test('mixed percentage and px', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '50%', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.width, 200).passed && 
             assertNear(c2.layout.width, 100).passed;
    });
  });

  // ==================== Block Layout Tests ====================
  suite('Block Layout', () => {
    test('block elements stack vertically', () => {
      const parent = createNode('div', { display: 'block' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcBlockLayout(parent, { width: 500, height: 400 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c2.layout.y, 50).passed;
    });

    test('block uses full container width', () => {
      const parent = createNode('div', { display: 'block' });
      const c1 = createNode('div', { height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcBlockLayout(parent, { width: 500, height: 400 });
      return assertNear(c1.layout.width, 500).passed;
    });
  });

  // ==================== Grid Layout Tests ====================
  suite('Grid Layout', () => {
    test('grid with default single column', () => {
      const parent = createNode('div', { display: 'grid' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcGridLayout(parent, { width: 500, height: 400 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 0).passed &&
             assertNear(c1.layout.y, 0).passed &&
             assertNear(c2.layout.y, 100).passed;
    });

    test('grid with 2 columns', () => {
      const parent = createNode('div', { display: 'grid', gridTemplateColumns: '1fr 1fr' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcGridLayout(parent, { width: 500, height: 400 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 250).passed;
    });

    test('grid with gap', () => {
      const parent = createNode('div', { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcGridLayout(parent, { width: 500, height: 400 });
      // Each column = (500 - 10) / 2 = 245
      return assertNear(c1.layout.width, 245).passed && 
             assertNear(c2.layout.x, 255).passed;
    });
  });

  // ==================== Parse Padding Tests ====================
  suite('Parse Padding', () => {
    test('parsePadding: "10px"', () => {
      const result = LayoutEngine.parsePadding('10px');
      return result.top === 10 && result.right === 10 && 
             result.bottom === 10 && result.left === 10;
    });

    test('parsePadding: "10px 20px"', () => {
      const result = LayoutEngine.parsePadding('10px 20px');
      return result.top === 10 && result.right === 20 && 
             result.bottom === 10 && result.left === 20;
    });

    test('parsePadding: "10px 20px 30px 40px"', () => {
      const result = LayoutEngine.parsePadding('10px 20px 30px 40px');
      return result.top === 10 && result.right === 20 && 
             result.bottom === 30 && result.left === 40;
    });

    test('parsePadding: "0"', () => {
      const result = LayoutEngine.parsePadding('0');
      return result.top === 0 && result.right === 0 && 
             result.bottom === 0 && result.left === 0;
    });
  });

  // ==================== Edge Cases ====================
  suite('Edge Cases', () => {
    test('empty flex container', () => {
      const parent = createNode('div', { display: 'flex' });
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return true;
    });

    test('single item in flex container', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c1.layout.width, 100).passed;
    });

    test('zero gap', () => {
      const parent = createNode('div', { display: 'flex', gap: '0' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 100).passed;
    });

    test('very small container (element shrinks)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 50, height: 30 });
      return assertNear(c1.layout.width, 50).passed;
    });

    test('very small container with flex-shrink: 0', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px', flexShrink: '0' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 50, height: 30 });
      return assertNear(c1.layout.width, 100).passed;
    });
  });

  // ==================== Column Direction Tests ====================
  suite('Flex Layout - column direction', () => {
    test('column + justify-content: center', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column', justifyContent: 'center' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 400 });
      return assertNear(c1.layout.y, 150).passed && 
             assertNear(c2.layout.y, 200).passed;
    });

    test('column + align-items: center', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column', alignItems: 'center' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 400 });
      return assertNear(c1.layout.x, 200).passed;
    });

    test('column + flex-grow', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column' });
      const c1 = createNode('div', { height: '50px', flexGrow: '1' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 300 });
      return assertNear(c1.layout.height, 300).passed;
    });
  });

  // ==================== Padding/Margin Tests ====================
  suite('Flex Layout - padding/margin', () => {
    test('container padding affects content area', () => {
      const parent = createNode('div', { display: 'flex', padding: '20px' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 20).passed && 
             assertNear(c1.layout.y, 20).passed;
    });

    test('child margin affects position', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px', margin: '10px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 10).passed && 
             assertNear(c1.layout.y, 10).passed;
    });

    test('container padding + child margin', () => {
      const parent = createNode('div', { display: 'flex', padding: '20px' });
      const c1 = createNode('div', { width: '100px', height: '50px', margin: '10px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 30).passed && 
             assertNear(c1.layout.y, 30).passed;
    });

    test('margin between items', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px', marginRight: '20px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 120).passed;
    });

    test('asymmetric padding', () => {
      const parent = createNode('div', { display: 'flex', padding: '10px 20px 30px 40px' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 40).passed && 
             assertNear(c1.layout.y, 10).passed;
    });

    test('asymmetric margin', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px', margin: '10px 20px 30px 40px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 40).passed && 
             assertNear(c1.layout.y, 10).passed;
    });
  });

  // ==================== Flex Wrap Tests ====================
  suite('Flex Layout - flex-wrap', () => {
    test('flex-wrap: nowrap (default, no wrap)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      const c3 = createNode('div', { width: '200px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c2.layout.y, 0).passed &&
             assertNear(c3.layout.y, 0).passed;
    });

    test('flex-wrap: wrap (items wrap to new line)', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      const c3 = createNode('div', { width: '200px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c2.layout.y, 0).passed &&
             assertNear(c3.layout.y, 50).passed;
    });

    test('flex-wrap: wrap with 4 items', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap' });
      const c1 = createNode('div', { width: '150px', height: '40px' });
      const c2 = createNode('div', { width: '150px', height: '40px' });
      const c3 = createNode('div', { width: '150px', height: '40px' });
      const c4 = createNode('div', { width: '150px', height: '40px' });
      setChildren(parent, c1, c2, c3, c4);
      LayoutEngine.calcFlexLayout(parent, { width: 350, height: 200 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c2.layout.y, 0).passed &&
             assertNear(c3.layout.y, 40).passed &&
             assertNear(c4.layout.y, 40).passed;
    });

    test('flex-wrap: wrap with gap', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap', gap: '10px' });
      const c1 = createNode('div', { width: '150px', height: '40px' });
      const c2 = createNode('div', { width: '150px', height: '40px' });
      const c3 = createNode('div', { width: '150px', height: '40px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 350, height: 200 });
      return assertNear(c1.layout.y, 0).passed && 
             assertNear(c2.layout.y, 0).passed &&
             assertNear(c3.layout.y, 50).passed;
    });

    test('flex-wrap: wrap with justify-content: center', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      const c3 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c3.layout.x, 150).passed;
    });

    test('flex-wrap: wrap-reverse', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap-reverse' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      const c3 = createNode('div', { width: '200px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.y, 150).passed && 
             assertNear(c2.layout.y, 150).passed &&
             assertNear(c3.layout.y, 100).passed;
    });
  });

  // ==================== Flex Wrap Advanced Tests ====================
  suite('Flex Layout - flex-wrap advanced', () => {
    test('flex-wrap: wrap with align-content: center', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap', alignContent: 'center' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      const c3 = createNode('div', { width: '200px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.y, 50).passed && 
             assertNear(c3.layout.y, 100).passed;
    });

    test('flex-wrap: wrap with align-content: flex-end', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap', alignContent: 'flex-end' });
      const c1 = createNode('div', { width: '200px', height: '50px' });
      const c2 = createNode('div', { width: '200px', height: '50px' });
      const c3 = createNode('div', { width: '200px', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.y, 100).passed && 
             assertNear(c3.layout.y, 150).passed;
    });

    test('flex-wrap: wrap in column direction', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column', flexWrap: 'wrap' });
      const c1 = createNode('div', { width: '50px', height: '80px' });
      const c2 = createNode('div', { width: '50px', height: '80px' });
      const c3 = createNode('div', { width: '50px', height: '80px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 200, height: 200 });
      return assertNear(c1.layout.x, 0).passed && 
             assertNear(c2.layout.x, 0).passed &&
             assertNear(c3.layout.x, 50).passed;
    });

    test('flex-wrap: wrap with min-width', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap' });
      const c1 = createNode('div', { width: '300px', minWidth: '100px', height: '50px', flexShrink: '0' });
      const c2 = createNode('div', { width: '300px', minWidth: '100px', height: '50px', flexShrink: '0' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 150, height: 200 });
      return assertNear(c1.layout.width, 300).passed &&
             assertNear(c2.layout.y, 50).passed;
    });

    test('flex-wrap: wrap with flex-grow', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap' });
      const c1 = createNode('div', { flexGrow: '1', height: '50px' });
      const c2 = createNode('div', { flexGrow: '1', height: '50px' });
      const c3 = createNode('div', { flexGrow: '1', height: '50px' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 300, height: 200 });
      return assertNear(c1.layout.width, 150).passed && 
             assertNear(c2.layout.width, 150).passed &&
             assertNear(c3.layout.width, 300).passed;
    });
  });

  // ==================== Min/Max Size Tests ====================
  suite('Flex Layout - min/max size', () => {
    test('min-width prevents shrinking below minimum', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '200px', minWidth: '150px', height: '50px' });
      const c2 = createNode('div', { width: '200px', minWidth: '150px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 250, height: 200 });
      return assertNear(c1.layout.width, 150).passed && 
             assertNear(c2.layout.width, 150).passed;
    });

    test('max-width limits growth', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { flexGrow: '1', maxWidth: '200px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.width, 200).passed;
    });

    test('min-height in column', () => {
      const parent = createNode('div', { display: 'flex', flexDirection: 'column' });
      const c1 = createNode('div', { flexGrow: '1', minHeight: '100px', width: '100px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 50 });
      return assertNear(c1.layout.height, 100).passed;
    });
  });

  // ==================== Align-Self Tests ====================
  suite('Flex Layout - align-self', () => {
    test('align-self: center overrides align-items: stretch', () => {
      const parent = createNode('div', { display: 'flex', alignItems: 'stretch', height: '200px' });
      const c1 = createNode('div', { width: '100px', height: '50px', alignSelf: 'center' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 300, height: 200 });
      return assertNear(c1.layout.y, 75).passed &&
             assertNear(c1.layout.height, 50).passed;
    });

    test('align-self: flex-end on single item', () => {
      const parent = createNode('div', { display: 'flex', alignItems: 'flex-start', height: '200px' });
      const c1 = createNode('div', { width: '100px', height: '50px', alignSelf: 'flex-end' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 300, height: 200 });
      return assertNear(c1.layout.y, 150).passed;
    });
  });

  // ==================== Order Tests ====================
  suite('Flex Layout - order', () => {
    test('order property reorders elements', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px', order: '2' });
      const c2 = createNode('div', { width: '100px', height: '50px', order: '1' });
      const c3 = createNode('div', { width: '100px', height: '50px', order: '0' });
      setChildren(parent, c1, c2, c3);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c3.layout.x, 0).passed &&
             assertNear(c2.layout.x, 100).passed &&
             assertNear(c1.layout.x, 200).passed;
    });

    test('default order is 0', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px', order: '-1' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c2.layout.x, 0).passed &&
             assertNear(c1.layout.x, 100).passed;
    });
  });

  // ==================== Flex Shorthand Tests ====================
  suite('Flex Layout - flex shorthand', () => {
    test('flex: 1 equals flex-grow: 1, flex-shrink: 1, flex-basis: 0', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { flex: '1', height: '50px' });
      const c2 = createNode('div', { flex: '1', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 400, height: 200 });
      return assertNear(c1.layout.width, 200).passed &&
             assertNear(c2.layout.width, 200).passed;
    });

    test('flex: auto equals flex: 1 1 auto', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', flex: 'auto', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.width, 500).passed;
    });

    test('flex: none disables grow and shrink', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', flex: 'none', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 1000, height: 200 });
      return assertNear(c1.layout.width, 100).passed;
    });

    test('flex: 0 1 200px (grow 0, shrink 1, basis 200px)', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { flex: '0 1 200px', height: '50px' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.width, 200).passed;
    });
  });

  // ==================== Margin Auto Tests ====================
  suite('Flex Layout - margin auto', () => {
    test('margin: auto centers item on both axes', () => {
      const parent = createNode('div', { display: 'flex', height: '200px' });
      const c1 = createNode('div', { width: '100px', height: '50px', margin: 'auto' });
      setChildren(parent, c1);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 200).passed &&
             assertNear(c1.layout.y, 75).passed;
    });

    test('margin-left: auto pushes item to right', () => {
      const parent = createNode('div', { display: 'flex' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px', marginLeft: 'auto' });
      setChildren(parent, c1, c2);
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 200 });
      return assertNear(c1.layout.x, 0).passed &&
             assertNear(c2.layout.x, 400).passed;
    });
  });

  // ==================== Align-Content Advanced Tests ====================
  suite('Flex Layout - align-content advanced', () => {
    test('align-content: space-between', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap', alignContent: 'space-between', height: '300px' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      const c3 = createNode('div', { width: '100px', height: '50px' });
      const c4 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2, c3, c4);
      LayoutEngine.calcFlexLayout(parent, { width: 100, height: 300 });
      return assertNear(c1.layout.y, 0).passed &&
             assertNear(c4.layout.y, 250).passed;
    });

    test('align-content: space-around', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap', alignContent: 'space-around', height: '300px' });
      const c1 = createNode('div', { width: '100px', height: '50px' });
      const c2 = createNode('div', { width: '100px', height: '50px' });
      const c3 = createNode('div', { width: '100px', height: '50px' });
      const c4 = createNode('div', { width: '100px', height: '50px' });
      setChildren(parent, c1, c2, c3, c4);
      LayoutEngine.calcFlexLayout(parent, { width: 100, height: 300 });
      return assertNear(c1.layout.y, 12.5).passed;
    });
  });

  // ==================== Performance Tests ====================
  suite('Performance Tests', () => {
    test('large flex container (100 items) completes in reasonable time', () => {
      const parent = createNode('div', { display: 'flex', flexWrap: 'wrap' });
      const children = [];
      for (let i = 0; i < 100; i++) {
        children.push(createNode('div', { width: '50px', height: '30px' }));
      }
      setChildren(parent, ...children);
      const start = Date.now();
      LayoutEngine.calcFlexLayout(parent, { width: 500, height: 1000 });
      const duration = Date.now() - start;
      return duration < 100;
    });

    test('nested flex layouts complete quickly', () => {
      const root = createNode('div', { display: 'flex', flexDirection: 'column' });
      const children = [];
      for (let i = 0; i < 20; i++) {
        const child = createNode('div', { display: 'flex', width: '500px', height: '30px' });
        const grandchildren = [];
        for (let j = 0; j < 10; j++) {
          grandchildren.push(createNode('div', { width: '40px', height: '20px' }));
        }
        setChildren(child, ...grandchildren);
        children.push(child);
      }
      setChildren(root, ...children);
      const start = Date.now();
      LayoutEngine.calcFlexLayout(root, { width: 500, height: 1000 });
      const duration = Date.now() - start;
      return duration < 200;
    });
  });

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`${'='.repeat(50)}`);
  
  process.exit(failed > 0 ? 1 : 0);
  
}).catch(err => {
  console.error('Failed to load module:', err);
  process.exit(1);
});
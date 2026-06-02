
console.log('=== vue-runtime-debug.js 已加载 ===');

// ==================== 1. NodeType ====================
const NodeType = {
  ELEMENT: 'element',
  TEXT: 'text'
};

// ==================== 2. VueRuntimeDOM ====================
const VueRuntimeDOM = {
  createElement(tagName) {
    const node = {
      nodeType: NodeType.ELEMENT,
      tagName: tagName,
      attrs: {},
      children: [],
      layout: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0
      },
      style: {}
    };
    return node;
  },

  createTextNode(text) {
    return {
      nodeType: NodeType.TEXT,
      text: text,
      children: []
    };
  },

  appendChild(parent, child) {
    parent.children.push(child);
  },

  insertBefore(parent, child, refChild) {
    const index = parent.children.indexOf(refChild);
    if (index !== -1) {
      parent.children.splice(index, 0, child);
    } else {
      parent.children.push(child);
    }
  },

  removeChild(parent, child) {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
      parent.children.splice(index, 1);
    }
  },

  addEventListener() {},
  removeEventListener() {}
};

// ==================== 3. Color Parser ====================
class ColorParser {
  hexToRgba(hex, opacity = 1) {
    if (!hex) return [0, 0, 0, opacity];
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b, opacity];
  }
}

// ==================== 4. Style Parser ====================
class StyleParser {
  parseStyle(styleStr) {
    const style = {};
    if (!styleStr) return style;
    
    const declarations = styleStr.split(';');
    declarations.forEach(decl => {
      const parts = decl.split(':');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        if (key && value) {
          style[this._camelCase(key)] = value;
        }
      }
    });
    return style;
  }

  _camelCase(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }
}

// ==================== 5. Template Parser ====================
class TemplateParser {
  constructor() {
    this.styleParser = new StyleParser();
  }

  parse(template) {
    console.log('TemplateParser.parse 输入模板长度:', template.length);
    if (!template) return null;
    
    const root = VueRuntimeDOM.createElement('root');
    this._parseElement(template, root);
    console.log('TemplateParser.parse 结果:', root);
    return root;
  }

  _parseElement(html, parent) {
    let i = 0;
    const len = html.length;
    
    while (i < len) {
      while (i < len && /\s/.test(html[i])) i++;
      if (i >= len) break;
      
      if (html[i] === '<') {
        i++;
        if (html[i] === '/') {
          i++;
          let tagName = '';
          while (i < len && /[a-zA-Z0-9]/.test(html[i])) {
            tagName += html[i];
            i++;
          }
          while (i < len && html[i] !== '>') i++;
          i++;
          continue;
        }
        
        let tagName = '';
        while (i < len && /[a-zA-Z0-9]/.test(html[i])) {
          tagName += html[i];
          i++;
        }
        
        if (!tagName) continue;
        
        tagName = tagName.toLowerCase();
        console.log('  解析标签:', tagName);
        
        let attrsStr = '';
        while (i < len && html[i] !== '>' && html[i] !== '/') {
          attrsStr += html[i];
          i++;
        }
        
        let isSelfClosing = false;
        if (i < len && html[i] === '/') {
          isSelfClosing = true;
          i++;
        }
        while (i < len && html[i] !== '>') i++;
        i++;
        
        const attrs = this._parseAttributes(attrsStr.trim());
        
        const node = VueRuntimeDOM.createElement(tagName);
        node.attrs = attrs;
        if (attrs.style) {
          node.style = this.styleParser.parseStyle(attrs.style);
        }
        VueRuntimeDOM.appendChild(parent, node);
        
        if (isSelfClosing) continue;
        
        let innerContent = '';
        let tagStack = 1;
        while (i < len && tagStack > 0) {
          if (html[i] === '<') {
            if (i + 1 < len && html[i + 1] === '/') {
              tagStack--;
              if (tagStack === 0) {
                i += 2;
                while (i < len && html[i] !== '>') i++;
                i++;
                break;
              }
            } else {
              tagStack++;
            }
          }
          innerContent += html[i];
          i++;
        }
        
        if (innerContent.trim()) {
          this._parseElement(innerContent, node);
        }
      } else {
        i++;
      }
    }
  }

  _parseAttributes(attrsStr) {
    const attrs = {};
    if (!attrsStr) return attrs;

    const attrRegex = /([a-zA-Z][a-zA-Z0-9_-]*)\s*=\s*["']([^"']+)["']/g;
    let match;

    while ((match = attrRegex.exec(attrsStr)) !== null) {
      attrs[match[1]] = match[2];
    }

    return attrs;
  }
}

// ==================== 6. Style System ====================
class StyleSystem {
  static _styles = {};
  static _scoped = {};

  static addStyleSheet(css, componentId = null) {
    if (componentId) {
      this._scoped[componentId] = this._parseCSS(css);
    } else {
      const parsed = this._parseCSS(css);
      for (const key in parsed) {
        this._styles[key] = parsed[key];
      }
    }
  }

  static makeScopedCSS(css, componentId) {
    let result = '';
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    while ((match = ruleRegex.exec(css)) !== null) {
      const selectors = match[1].trim();
      const rules = match[2].trim();
      const scopedSelectors = selectors.split(',').map(s => 
        `${s.trim()}[${componentId}]`
      ).join(', ');
      result += `${scopedSelectors} { ${rules} }\n`;
    }
    return result;
  }

  static _parseCSS(css) {
    const styles = {};
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const ruleStr = match[2].trim();
      const rule = {};
      
      ruleStr.split(';').forEach(decl => {
        const parts = decl.split(':');
        if (parts.length === 2) {
          const key = parts[0].trim();
          const value = parts[1].trim();
          if (key && value) {
            rule[new StyleParser()._camelCase(key)] = value;
          }
        }
      });
      
      styles[selector] = rule;
    }
    return styles;
  }

  static computeStyle(node) {
    const style = { ...node.style };
    
    const nodeAttrs = Object.keys(node.attrs);
    for (const componentId in this._scoped) {
      if (nodeAttrs.includes(componentId)) {
        for (const selector in this._scoped[componentId]) {
          if (this._matchesSelector(node, selector)) {
            Object.assign(style, this._scoped[componentId][selector]);
          }
        }
      }
    }
    
    for (const selector in this._styles) {
      if (this._matchesSelector(node, selector)) {
        Object.assign(style, this._styles[selector]);
      }
    }
    
    return style;
  }

  static _matchesSelector(node, selector) {
    if (selector === '.' + node.attrs.class) return true;
    if (selector === node.tagName) return true;
    if (selector === '*') return true;
    return false;
  }

  static parseLineHeight(lineHeight, fontSize) {
    if (!lineHeight) return fontSize;
    if (lineHeight.includes('px')) return parseFloat(lineHeight);
    return parseFloat(lineHeight) * parseFloat(fontSize);
  }
}

// ==================== 7. CPU Renderer ====================
class CPURenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colorParser = new ColorParser();
  }

  init() {
    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  hexToRgba(hex, opacity = 1) {
    return this.colorParser.hexToRgba(hex, opacity);
  }

  drawRect(node) {
    if (!node || !node.layout) return;
    const { x, y, width, height } = node.layout;
    const style = node.style || {};
    
    if (width <= 0 || height <= 0) return;
    
    this.ctx.save();
    
    const opacity = parseFloat(style.opacity) || 1;
    this.ctx.globalAlpha = opacity;
    
    const bgColor = style.backgroundColor || '#ffffff';
    const [r, g, b, a] = this.hexToRgba(bgColor);
    
    const borderRadius = style.borderRadius ? this.parseBorderRadius(style.borderRadius) : { tl: 0, tr: 0, br: 0, bl: 0 };
    
    this.ctx.fillStyle = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    
    this.drawRoundRect(x, y, width, height, borderRadius);
    
    if (style.border || style.borderWidth) {
      const borderWidth = parseFloat(style.borderWidth) || 1;
      const borderColor = style.borderColor || '#000000';
      const [br, bg, bb, ba] = this.hexToRgba(borderColor);
      
      this.ctx.strokeStyle = `rgba(${Math.round(br * 255)}, ${Math.round(bg * 255)}, ${Math.round(bb * 255)}, ${ba})`;
      this.ctx.lineWidth = borderWidth;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawRoundRect(x, y, width, height, radius) {
    const { tl, tr, br, bl } = radius;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + tl, y);
    this.ctx.lineTo(x + width - tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
    this.ctx.lineTo(x + width, y + height - br);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
    this.ctx.lineTo(x + bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
    this.ctx.lineTo(x, y + tl);
    this.ctx.quadraticCurveTo(x, y, x + tl, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  parseBorderRadius(radiusStr) {
    const vals = radiusStr.split(' ').map(v => parseFloat(v) || 0);
    if (vals.length === 1) {
      return { tl: vals[0], tr: vals[0], br: vals[0], bl: vals[0] };
    } else if (vals.length === 2) {
      return { tl: vals[0], tr: vals[1], br: vals[0], bl: vals[1] };
    } else if (vals.length === 3) {
      return { tl: vals[0], tr: vals[1], br: vals[2], bl: vals[1] };
    } else if (vals.length >= 4) {
      return { tl: vals[0], tr: vals[1], br: vals[2], bl: vals[3] };
    }
    return { tl: 0, tr: 0, br: 0, bl: 0 };
  }

  drawText(node) {
    if (!node || !node.layout) return;
    if (!node.text || node.text.trim() === "") return;

    const { x, y, width, height } = node.layout;
    const style = node.style || {};
    
    this.ctx.save();
    
    const fontSize = parseInt(style.fontSize) || 16;
    const textColor = style.color || "#333333";
    const textAlign = style.textAlign || "left";
    const lineHeight = StyleSystem.parseLineHeight(style.lineHeight, fontSize.toString());
    
    this.ctx.font = `${fontSize}px system-ui, sans-serif`;
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = "middle";
    
    const paddingLeft = node.layout.paddingLeft || 0;
    const paddingRight = node.layout.paddingRight || 0;
    const paddingTop = node.layout.paddingTop || 0;
    const paddingBottom = node.layout.paddingBottom || 0;
    
    const textWidth = width - paddingLeft - paddingRight;
    const textHeight = height - paddingTop - paddingBottom;
    
    let drawX = x + paddingLeft;
    if (textAlign === "center") {
      drawX = x + width / 2;
    } else if (textAlign === "right") {
      drawX = x + width - paddingRight;
    }
    
    const drawY = y + paddingTop + textHeight / 2;
    
    const lines = this.wrapText(node.text, textWidth, fontSize);
    const totalTextHeight = lines.length * lineHeight;
    const startY = drawY - totalTextHeight / 2 + lineHeight / 2;
    
    lines.forEach((line, idx) => {
      const lineY = startY + idx * lineHeight;
      this.ctx.fillText(line, drawX, lineY);
    });
    
    this.ctx.restore();
  }

  wrapText(text, maxWidth, fontSize) {
    const lines = [];
    const words = text.split(' ');
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  render(nodeTree) {
    console.log('CPURenderer.render 开始');
    if (!nodeTree) return;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const elemList = [];
    const dfs = (n) => {
      if (!n) return;
      if (n.nodeType === NodeType.ELEMENT) elemList.push(n);
      if (n.children) {
        n.children.forEach(dfs);
      }
    };
    dfs(nodeTree);
    
    console.log('  找到元素:', elemList.length, elemList);
    
    elemList.forEach(node => {
      this.drawRect(node);
    });
    
    const textList = [];
    const textDfs = (n) => {
      if (!n) return;
      if (n.nodeType === NodeType.TEXT) textList.push(n);
      if (n.children) {
        n.children.forEach(textDfs);
      }
    };
    textDfs(nodeTree);
    
    textList.forEach(node => {
      this.drawText(node);
    });
    
    console.log('CPURenderer.render 完成');
  }
}

// ==================== 8. LRU Cache ====================
class LRUCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.size = 0;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.size--;
    }
    if (this.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.size--;
    }
    this.cache.set(key, value);
    this.size++;
  }

  clear() {
    this.cache.clear();
    this.size = 0;
  }
}

// ==================== 9. Layout Engine ====================
class LayoutEngine {
  static sizeCache = new LRUCache(2000);
  static marginCache = new LRUCache(1000);
  static flexCache = new LRUCache(500);

  static layout(root, viewport) {
    console.log('LayoutEngine.layout 开始');
    if (!root) return;
    if (!root.layout) {
      root.layout = { x: 0, y: 0, width: 0, height: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 };
    }
    root.layout.x = 0;
    root.layout.y = 0;
    root.layout.width = viewport.width;
    root.layout.height = viewport.height;
    
    this.walk(root, viewport);
    console.log('LayoutEngine.layout 结束');
  }

  static walk(node, container) {
    if (!node) return;
    if (!node.children || node.children.length === 0) return;
    
    const style = node.style || {};
    const display = style.display || 'block';
    
    if (display === 'flex') {
      this.calcFlexLayout(node, container);
    } else if (display === 'grid') {
      this.calcGridLayout(node, container);
    } else {
      this.calcBlockLayout(node, container);
    }
  }

  static calcBlockLayout(node, container) {
    const style = node.style || {};
    const padding = this.parsePadding(style.padding || '0');
    
    let y = node.layout.y + padding.top;
    const x = node.layout.x + padding.left;
    const availableWidth = node.layout.width - padding.left - padding.right;
    
    node.layout.paddingTop = padding.top;
    node.layout.paddingRight = padding.right;
    node.layout.paddingBottom = padding.bottom;
    node.layout.paddingLeft = padding.left;
    
    const children = node.children.filter(c => c.nodeType === NodeType.ELEMENT);
    
    children.forEach(child => {
      const margin = this.parseMargin(child.style.margin || '0');
      
      const childWidth = this.parseSize(child.style.width, availableWidth) || availableWidth;
      const childHeight = this.parseSize(child.style.height, node.layout.height) || 50;
      
      child.layout.x = x + margin.left;
      child.layout.y = y + margin.top;
      child.layout.width = childWidth;
      child.layout.height = childHeight;
      
      y += childHeight + margin.top + margin.bottom;
      
      this.walk(child, { width: childWidth, height: childHeight });
    });
  }

  static parsePadding(paddingStr) {
    const cacheKey = `padding:${paddingStr}`;
    if (this.sizeCache.get(cacheKey)) return this.sizeCache.get(cacheKey);
    
    const vals = paddingStr.split(' ').map(v => parseFloat(v) || 0);
    let result;
    if (vals.length === 1) {
      result = { top: vals[0], right: vals[0], bottom: vals[0], left: vals[0] };
    } else if (vals.length === 2) {
      result = { top: vals[0], right: vals[1], bottom: vals[0], left: vals[1] };
    } else if (vals.length === 3) {
      result = { top: vals[0], right: vals[1], bottom: vals[2], left: vals[1] };
    } else if (vals.length >= 4) {
      result = { top: vals[0], right: vals[1], bottom: vals[2], left: vals[3] };
    } else {
      result = { top: 0, right: 0, bottom: 0, left: 0 };
    }
    
    this.sizeCache.set(cacheKey, result);
    return result;
  }

  static parseMargin(marginStr) {
    const cacheKey = `margin:${marginStr}`;
    if (this.marginCache.get(cacheKey)) return this.marginCache.get(cacheKey);
    
    const autoMargin = { top: false, right: false, bottom: false, left: false };
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    
    const vals = marginStr.split(' ');
    
    if (vals.length === 1) {
      if (vals[0].trim() === 'auto') {
        autoMargin.top = autoMargin.right = autoMargin.bottom = autoMargin.left = true;
      } else {
        const val = parseFloat(vals[0]) || 0;
        margin.top = margin.right = margin.bottom = margin.left = val;
      }
    } else if (vals.length === 2) {
      if (vals[0].trim() === 'auto') autoMargin.top = autoMargin.bottom = true;
      else { margin.top = margin.bottom = parseFloat(vals[0]) || 0; }
      
      if (vals[1].trim() === 'auto') autoMargin.right = autoMargin.left = true;
      else { margin.right = margin.left = parseFloat(vals[1]) || 0; }
    } else if (vals.length >= 4) {
      if (vals[0].trim() === 'auto') autoMargin.top = true;
      else margin.top = parseFloat(vals[0]) || 0;
      
      if (vals[1].trim() === 'auto') autoMargin.right = true;
      else margin.right = parseFloat(vals[1]) || 0;
      
      if (vals[2].trim() === 'auto') autoMargin.bottom = true;
      else margin.bottom = parseFloat(vals[2]) || 0;
      
      if (vals[3].trim() === 'auto') autoMargin.left = true;
      else margin.left = parseFloat(vals[3]) || 0;
    }
    
    const result = { ...margin, auto: autoMargin };
    this.marginCache.set(cacheKey, result);
    return result;
  }

  static parseSize(sizeStr, containerSize) {
    if (!sizeStr) return null;
    const cacheKey = `size:${sizeStr}:${containerSize}`;
    if (this.sizeCache.get(cacheKey)) return this.sizeCache.get(cacheKey);
    
    if (sizeStr.endsWith('%')) {
      const pct = parseFloat(sizeStr) / 100;
      const result = containerSize * pct;
      this.sizeCache.set(cacheKey, result);
      return result;
    }
    
    const result = parseFloat(sizeStr) || 0;
    this.sizeCache.set(cacheKey, result);
    return result;
  }

  static calcFlexLayout(node, container) {
    const style = node.style || {};
    const flexDirection = style.flexDirection || 'row';
    const justifyContent = style.justifyContent || 'flex-start';
    const alignItems = style.alignItems || 'stretch';
    const flexWrap = style.flexWrap || 'nowrap';
    const alignContent = style.alignContent || 'normal';
    const gap = parseFloat(style.gap) || 0;
    
    const isRow = flexDirection === 'row' || flexDirection === 'row-reverse';
    const isReverse = flexDirection === 'row-reverse' || flexDirection === 'column-reverse';
    const isWrap = flexWrap === 'wrap' || flexWrap === 'wrap-reverse';
    const isWrapReverse = flexWrap === 'wrap-reverse';
    
    const containerPadding = this.parsePadding(style.padding || '0');
    const contentWidth = node.layout.width - containerPadding.left - containerPadding.right;
    const contentHeight = node.layout.height - containerPadding.top - containerPadding.bottom;
    
    const mainSize = isRow ? contentWidth : contentHeight;
    const crossSize = isRow ? contentHeight : contentWidth;
    
    node.layout.paddingTop = containerPadding.top;
    node.layout.paddingRight = containerPadding.right;
    node.layout.paddingBottom = containerPadding.bottom;
    node.layout.paddingLeft = containerPadding.left;
    
    const children = node.children.filter(c => c.nodeType === NodeType.ELEMENT);
    
    const itemInfos = children.map(child => {
      const flexGrow = this.parseFlexGrow(child.style.flexGrow, child.style.flex);
      const flexShrink = this.parseFlexShrink(child.style.flexShrink, child.style.flex);
      const flexBasis = this.parseFlexBasis(child.style.flexBasis, child.style.flex, isRow ? child.style.width : child.style.height);
      const alignSelf = child.style.alignSelf || null;
      const order = parseInt(child.style.order) || 0;
      const margin = this.parseMargin(child.style.margin || '0');
      
      const mainMargin = isRow ? (margin.left + margin.right) : (margin.top + margin.bottom);
      const crossMargin = isRow ? (margin.top + margin.bottom) : (margin.left + margin.right);
      
      const minSize = this.parseSize(isRow ? child.style.minWidth : child.style.minHeight, mainSize);
      const maxSize = this.parseSize(isRow ? child.style.maxWidth : child.style.maxHeight, mainSize);
      
      const specifiedMainSize = this.parseSize(isRow ? child.style.width : child.style.height, mainSize);
      
      let basis = flexBasis;
      if (basis === 'auto' || basis === null) {
        if (specifiedMainSize) {
          basis = specifiedMainSize;
        } else {
          basis = this.parseSize(isRow ? child.style.width : child.style.height, mainSize) || 100;
        }
      } else {
        basis = typeof basis === 'string' ? this.parseSize(basis, mainSize) : basis;
      }
      
      if (minSize !== null && basis < minSize) basis = minSize;
      if (maxSize !== null && basis > maxSize) basis = maxSize;
      
      return {
        child,
        flexGrow,
        flexShrink,
        flexBasis: basis,
        alignSelf,
        order,
        margin,
        mainMargin,
        crossMargin,
        minSize,
        maxSize,
        mainSize: basis,
        crossSize: this.parseSize(isRow ? child.style.height : child.style.width, crossSize) || 100
      };
    });
    
    itemInfos.sort((a, b) => a.order - b.order);
    const sortedItems = itemInfos.map(info => info.child);
    
    const lines = [];
    if (isWrap) {
      let currentLine = [];
      let currentLineSize = 0;
      
      itemInfos.forEach(info => {
        const itemSize = info.flexBasis + info.mainMargin;
        if (currentLine.length > 0 && currentLineSize + itemSize + gap > mainSize) {
          lines.push(currentLine);
          currentLine = [info];
          currentLineSize = itemSize;
        } else {
          currentLine.push(info);
          currentLineSize += itemSize + (currentLine.length > 1 ? gap : 0);
        }
      });
      
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    } else {
      lines.push(itemInfos);
    }
    
    const totalGap = lines.length > 1 ? (lines.length - 1) * gap : 0;
    let totalLinesHeight = 0;
    lines.forEach(line => {
      let lineMaxCross = 0;
      line.forEach(info => {
        const itemCross = info.crossSize + info.crossMargin;
        if (itemCross > lineMaxCross) lineMaxCross = itemCross;
      });
      totalLinesHeight += lineMaxCross;
    });
    
    let freeCrossSpace = crossSize - totalLinesHeight - totalGap;
    let crossAxisOffset = node.layout.y + containerPadding.top;
    let lineSpacing = 0;
    
    if (isWrapReverse) {
      crossAxisOffset = node.layout.y + containerPadding.top + freeCrossSpace;
    }
    
    if (lines.length > 1) {
      if (alignContent === 'center') {
        crossAxisOffset += freeCrossSpace / 2;
      } else if (alignContent === 'flex-end') {
        if (!isWrapReverse) crossAxisOffset += freeCrossSpace;
      } else if (alignContent === 'space-between') {
        lineSpacing = freeCrossSpace / (lines.length - 1);
      } else if (alignContent === 'space-around') {
        lineSpacing = freeCrossSpace / lines.length;
        crossAxisOffset += lineSpacing / 2;
      } else if (alignContent === 'stretch' && freeCrossSpace > 0) {
        lineSpacing = freeCrossSpace / lines.length;
      }
    }
    
    lines.forEach(line => {
      let lineMaxCross = 0;
      line.forEach(info => {
        const itemCross = info.crossSize + info.crossMargin;
        if (itemCross > lineMaxCross) lineMaxCross = itemCross;
      });
      
      if (alignContent === 'stretch' && freeCrossSpace > 0 && lines.length > 1) {
        lineMaxCross += lineSpacing;
      }
      
      let lineComputedSizes = {};
      let totalGrow = 0;
      let totalShrink = 0;
      let lineTotalBasis = 0;
      line.forEach(info => {
        lineTotalBasis += info.flexBasis + info.mainMargin;
        totalGrow += info.flexGrow;
        totalShrink += info.flexShrink;
      });
      lineTotalBasis += (line.length - 1) * gap;
      
      const freeSpace = mainSize - lineTotalBasis;
      
      if (freeSpace > 0 && totalGrow > 0) {
        const growUnit = freeSpace / totalGrow;
        line.forEach(info => {
          const growAmount = info.flexGrow * growUnit;
          let finalSize = info.flexBasis + growAmount;
          
          if (info.maxSize !== null && finalSize > info.maxSize) {
            finalSize = info.maxSize;
          }
          lineComputedSizes[info.child] = finalSize;
        });
      } else if (freeSpace < 0 && totalShrink > 0) {
        let totalWeight = 0;
        line.forEach(info => {
          totalWeight += info.flexBasis * info.flexShrink;
        });
        
        if (totalWeight > 0) {
          const shrinkRatio = Math.abs(freeSpace) / totalWeight;
          line.forEach(info => {
            const shrinkAmount = info.flexBasis * info.flexShrink * shrinkRatio;
            let finalSize = info.flexBasis - shrinkAmount;
            
            if (info.minSize !== null && finalSize < info.minSize) {
              finalSize = info.minSize;
            }
            lineComputedSizes[info.child] = finalSize;
          });
        } else {
          line.forEach(info => {
            lineComputedSizes[info.child] = info.flexBasis;
          });
        }
      } else {
        line.forEach(info => {
          lineComputedSizes[info.child] = info.flexBasis;
        });
      }
      
      let totalComputedMain = 0;
      line.forEach(info => {
        totalComputedMain += lineComputedSizes[info.child] + info.mainMargin;
      });
      totalComputedMain += (line.length - 1) * gap;
      
      let mainAxisOffset;
      let spacing = 0;
      if (isReverse) {
        mainAxisOffset = node.layout.x + (isRow ? containerPadding.left : containerPadding.top) + mainSize;
      } else {
        mainAxisOffset = node.layout.x + (isRow ? containerPadding.left : containerPadding.top);
      }
      
      const remainingSpace = mainSize - totalComputedMain;
      
      if (justifyContent === 'center') {
        mainAxisOffset += remainingSpace / 2;
      } else if (justifyContent === 'flex-end') {
        if (!isReverse) mainAxisOffset += remainingSpace;
      } else if (justifyContent === 'space-between' && line.length > 1) {
        spacing = remainingSpace / (line.length - 1);
      } else if (justifyContent === 'space-around' && line.length > 1) {
        spacing = remainingSpace / line.length;
        mainAxisOffset += spacing / 2;
      } else if (justifyContent === 'space-evenly' && line.length > 1) {
        spacing = remainingSpace / (line.length + 1);
        mainAxisOffset += spacing;
      }
      
      const lineItems = isReverse ? [...line].reverse() : line;
      
      lineItems.forEach(info => {
        const child = info.child;
        const margin = info.margin;
        const computedMainSize = lineComputedSizes[child];
        let computedCrossSize = info.crossSize;
        
        const alignToUse = info.alignSelf || alignItems;
        if (alignToUse === 'stretch') {
          computedCrossSize = lineMaxCross - info.crossMargin;
        }
        
        if (isRow) {
          child.layout.width = computedMainSize;
          child.layout.height = computedCrossSize;
          
          let childX = mainAxisOffset + margin.left;
          
          let childY;
          if (alignToUse === 'flex-start') {
            childY = crossAxisOffset + margin.top;
          } else if (alignToUse === 'center') {
            childY = crossAxisOffset + (lineMaxCross - computedCrossSize) / 2;
          } else if (alignToUse === 'flex-end') {
            childY = crossAxisOffset + lineMaxCross - computedCrossSize - margin.bottom;
          } else {
            childY = crossAxisOffset + margin.top;
          }
          
          if (margin.auto.left || margin.auto.right) {
            const autoAvailable = mainSize - computedMainSize - margin.left - margin.right;
            if (margin.auto.left && margin.auto.right) {
              childX = mainAxisOffset + autoAvailable / 2 + margin.left;
            } else if (margin.auto.right) {
              childX = mainAxisOffset + autoAvailable + margin.left;
            }
          }
          
          child.layout.x = childX;
          child.layout.y = childY;
          
          mainAxisOffset += computedMainSize + margin.left + margin.right + gap + spacing;
        } else {
          child.layout.width = computedCrossSize;
          child.layout.height = computedMainSize;
          
          let childX;
          if (alignToUse === 'flex-start') {
            childX = crossAxisOffset + margin.left;
          } else if (alignToUse === 'center') {
            childX = crossAxisOffset + (lineMaxCross - computedCrossSize) / 2;
          } else if (alignToUse === 'flex-end') {
            childX = crossAxisOffset + lineMaxCross - computedCrossSize - margin.right;
          } else {
            childX = crossAxisOffset + margin.left;
          }
          
          let childY = mainAxisOffset + margin.top;
          
          if (margin.auto.top || margin.auto.bottom) {
            const autoAvailable = mainSize - computedMainSize - margin.top - margin.bottom;
            if (margin.auto.top && margin.auto.bottom) {
              childY = mainAxisOffset + autoAvailable / 2 + margin.top;
            } else if (margin.auto.bottom) {
              childY = mainAxisOffset + autoAvailable + margin.top;
            }
          }
          
          child.layout.x = childX;
          child.layout.y = childY;
          
          mainAxisOffset += computedMainSize + margin.top + margin.bottom + gap + spacing;
        }
        
        this.walk(child, { width: child.layout.width, height: child.layout.height });
      });
      
      if (isWrapReverse) {
        crossAxisOffset -= lineMaxCross + gap + (alignContent === 'stretch' ? 0 : lineSpacing);
      } else {
        crossAxisOffset += lineMaxCross + gap + lineSpacing;
      }
    });
  }

  static parseFlexGrow(growStr, flexStr) {
    const cacheKey = `flexgrow:${growStr}:${flexStr}`;
    if (this.flexCache.get(cacheKey) !== undefined) return this.flexCache.get(cacheKey);
    
    if (flexStr) {
      const parsed = this.parseFlex(flexStr);
      if (parsed.grow !== null) {
        this.flexCache.set(cacheKey, parsed.grow);
        return parsed.grow;
      }
    }
    const result = growStr !== undefined ? parseFloat(growStr) : 0;
    this.flexCache.set(cacheKey, result);
    return result;
  }

  static parseFlexShrink(shrinkStr, flexStr) {
    const cacheKey = `flexshrink:${shrinkStr}:${flexStr}`;
    if (this.flexCache.get(cacheKey) !== undefined) return this.flexCache.get(cacheKey);
    
    if (flexStr) {
      const parsed = this.parseFlex(flexStr);
      if (parsed.shrink !== null) {
        this.flexCache.set(cacheKey, parsed.shrink);
        return parsed.shrink;
      }
    }
    const result = shrinkStr !== undefined ? parseFloat(shrinkStr) : 1;
    this.flexCache.set(cacheKey, result);
    return result;
  }

  static parseFlexBasis(basisStr, flexStr, fallback) {
    const cacheKey = `flexbasis:${basisStr}:${flexStr}:${fallback}`;
    if (this.flexCache.get(cacheKey) !== undefined) return this.flexCache.get(cacheKey);
    
    if (flexStr) {
      const parsed = this.parseFlex(flexStr);
      if (parsed.basis !== null) {
        this.flexCache.set(cacheKey, parsed.basis);
        return parsed.basis;
      }
    }
    const result = basisStr || 'auto';
    this.flexCache.set(cacheKey, result);
    return result;
  }

  static parseFlex(flexStr) {
    const cacheKey = `flex:${flexStr}`;
    if (this.flexCache.get(cacheKey)) return this.flexCache.get(cacheKey);
    
    let grow = null, shrink = null, basis = null;
    
    if (flexStr === 'none') {
      grow = 0;
      shrink = 0;
      basis = 'auto';
    } else if (flexStr === 'auto') {
      grow = 1;
      shrink = 1;
      basis = 'auto';
    } else {
      const parts = flexStr.split(' ').filter(p => p.trim());
      
      if (parts.length === 1) {
        const val = parseFloat(parts[0]);
        if (!isNaN(val)) {
          grow = val;
          shrink = 1;
          basis = 0;
        } else {
          basis = parts[0];
        }
      } else if (parts.length === 2) {
        const val1 = parseFloat(parts[0]);
        if (!isNaN(val1)) {
          grow = val1;
        }
        
        const val2 = parseFloat(parts[1]);
        if (!isNaN(val2)) {
          shrink = val2;
        } else {
          basis = parts[1];
        }
      } else if (parts.length >= 3) {
        const val1 = parseFloat(parts[0]);
        if (!isNaN(val1)) grow = val1;
        
        const val2 = parseFloat(parts[1]);
        if (!isNaN(val2)) shrink = val2;
        
        basis = parts[2];
      }
    }
    
    const result = { grow, shrink, basis };
    this.flexCache.set(cacheKey, result);
    return result;
  }

  static calcGridLayout(node, container) {
    const style = node.style || {};
    const padding = this.parsePadding(style.padding || '0');
    const gap = parseFloat(style.gap) || 0;
    
    node.layout.paddingTop = padding.top;
    node.layout.paddingRight = padding.right;
    node.layout.paddingBottom = padding.bottom;
    node.layout.paddingLeft = padding.left;
    
    const templateCols = style.gridTemplateColumns;
    const templateRows = style.gridTemplateRows;
    
    let cols = [];
    let rows = [];
    
    if (templateCols) {
      const parts = templateCols.split(' ');
      parts.forEach(part => {
        if (part.endsWith('fr')) {
          cols.push({ type: 'fr', value: parseFloat(part) });
        } else {
          cols.push({ type: 'fixed', value: this.parseSize(part, node.layout.width) });
        }
      });
    } else {
      cols = [{ type: 'fr', value: 1 }];
    }
    
    if (templateRows) {
      const parts = templateRows.split(' ');
      parts.forEach(part => {
        if (part.endsWith('fr')) {
          rows.push({ type: 'fr', value: parseFloat(part) });
        } else {
          rows.push({ type: 'fixed', value: this.parseSize(part, node.layout.height) });
        }
      });
    } else {
      rows = [{ type: 'fr', value: 1 }];
    }
    
    const contentWidth = node.layout.width - padding.left - padding.right;
    const contentHeight = node.layout.height - padding.top - padding.bottom;
    
    let colFixedTotal = 0;
    let colFrTotal = 0;
    cols.forEach(col => {
      if (col.type === 'fixed') colFixedTotal += col.value;
      else colFrTotal += col.value;
    });
    colFixedTotal += (cols.length - 1) * gap;
    const colFrUnit = colFrTotal > 0 ? (contentWidth - colFixedTotal) / colFrTotal : 0;
    
    let rowFixedTotal = 0;
    let rowFrTotal = 0;
    rows.forEach(row => {
      if (row.type === 'fixed') rowFixedTotal += row.value;
      else rowFrTotal += row.value;
    });
    rowFixedTotal += (rows.length - 1) * gap;
    const rowFrUnit = rowFrTotal > 0 ? (contentHeight - rowFixedTotal) / rowFrTotal : 0;
    
    const computedCols = cols.map(col => {
      if (col.type === 'fixed') return col.value;
      return colFrUnit * col.value;
    });
    
    const computedRows = rows.map(row => {
      if (row.type === 'fixed') return row.value;
      return rowFrUnit * row.value;
    });
    
    let colPrefix = [0];
    for (let i = 0; i < cols.length; i++) {
      colPrefix.push(colPrefix[i] + computedCols[i] + gap);
    }
    
    let rowPrefix = [0];
    for (let i = 0; i < rows.length; i++) {
      rowPrefix.push(rowPrefix[i] + computedRows[i] + gap);
    }
    
    const children = node.children.filter(c => c.nodeType === NodeType.ELEMENT);
    children.forEach((child, index) => {
      const colIndex = index % cols.length;
      const rowIndex = Math.floor(index / cols.length);
      
      if (rowIndex < rows.length) {
        child.layout.x = node.layout.x + padding.left + colPrefix[colIndex];
        child.layout.y = node.layout.y + padding.top + rowPrefix[rowIndex];
        child.layout.width = computedCols[colIndex];
        child.layout.height = computedRows[rowIndex];
        
        this.walk(child, { width: child.layout.width, height: child.layout.height });
      }
    });
  }
}

// ==================== 10. Component Loader ====================
const ComponentLoader = {
  async load(url) {
    console.log('ComponentLoader.load 开始加载:', url);
    const response = await fetch(url);
    const content = await response.text();
    console.log('ComponentLoader.load 内容长度:', content.length);
    
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
    const styleMatches = content.match(/<style([\s\S]*?)>([\s\S]*?)<\/style>/g);
    
    const template = templateMatch ? templateMatch[1].trim() : '';
    const styles = [];
    
    if (styleMatches) {
      styleMatches.forEach(styleTag => {
        const scopedMatch = styleTag.match(/scoped/);
        const styleContentMatch = styleTag.match(/>([\s\S]*?)<\/style>/);
        if (styleContentMatch) {
          styles.push({
            code: styleContentMatch[1].trim(),
            scoped: !!scopedMatch
          });
        }
      });
    }
    
    const componentId = 'data-v-' + Math.random().toString(36).substr(2, 9);
    console.log('ComponentLoader.load 完成:', { template: template.length, styles: styles.length, componentId });
    
    return { template, styles, componentId };
  }
};

// ==================== 11. Global Entry ====================
export async function createApp(url) {
  console.log('createApp 开始:', url);
  try {
    const res = await ComponentLoader.load(url);
    const { template, styles, componentId } = res;
    
    console.log('createApp 加载模板完成');
    
    styles.forEach(styleItem => {
      if (styleItem.scoped) {
        const scopedCss = StyleSystem.makeScopedCSS(styleItem.code, componentId);
        StyleSystem.addStyleSheet(scopedCss, componentId);
      } else {
        StyleSystem.addStyleSheet(styleItem.code);
      }
    });
    
    console.log('createApp 样式添加完成');
    
    const parser = new TemplateParser();
    const rootNode = parser.parse(template);
    
    console.log('createApp 模板解析完成:', rootNode);
    
    const injectScopedId = (node) => {
      if (!node) return;
      
      if (node.nodeType === NodeType.ELEMENT) {
        node.componentId = componentId;
        node.attrs[componentId] = "";
      }
      
      if (node.children && node.children.length) {
        node.children.forEach(child => injectScopedId(child));
      }
    };
    injectScopedId(rootNode);
    
    console.log('createApp scopedId 注入完成');
    
    const calcTreeStyle = (node) => {
      if (!node) return;
      
      node.style = StyleSystem.computeStyle(node);
      
      if (node.children && node.children.length) {
        node.children.forEach(child => calcTreeStyle(child));
      }
    };
    calcTreeStyle(rootNode);
    
    console.log('createApp 样式计算完成');
    
    let cpuRenderer = null;
    
    const app = {
      async mount(container) {
        console.log('app.mount 开始');
        
        if (typeof container === 'string') {
          container = document.querySelector(container);
        }
        
        const canvas = document.createElement('canvas');
        canvas.id = 'vue-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.innerHTML = '';
        container.appendChild(canvas);
        
        console.log('app.mount canvas 已添加');
        
        cpuRenderer = new CPURenderer(canvas);
        cpuRenderer.init();
        
        console.log('app.mount CPU 渲染器初始化完成');
        
        const frameLoop = () => {
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
          };
          
          LayoutEngine.layout(rootNode, viewport);
          cpuRenderer.render(rootNode);
          
          requestAnimationFrame(frameLoop);
        };
        frameLoop();
        
        console.log('app.mount 渲染循环已启动');
        
        window.addEventListener('resize', () => {
          if (cpuRenderer) {
            cpuRenderer.resize(window.innerWidth, window.innerHeight);
          }
        });
        
        console.log('app.mount 完成');
      }
    };
    
    console.log('createApp 返回');
    return app;
    
  } catch (err) {
    console.error('createApp 错误:', err);
    console.error(err.stack);
    throw err;
  }
}

export { VueRuntimeDOM, NodeType, CPURenderer, LayoutEngine, StyleSystem, TemplateParser, ComponentLoader };
console.log('=== vue-runtime-debug.js 导出完成 ===');

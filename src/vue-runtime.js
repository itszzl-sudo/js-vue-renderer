/**
 * Vue Runtime Engine (CPU Rendering Version)
 * Complete implementation: Vue SFC parsing, Virtual DOM, Style calculation, Layout engine, Canvas 2D rendering
 * 
 * Core modules are shared with embed-renderer via shared-core/js/
 */
import { StyleParser } from '../shared-core/js/style-parser.js';
import { ColorParser } from '../shared-core/js/color-parser.js';

// ==================== 1. Vue SFC Parser ====================
class VueParser {
  static generateComponentId() {
    return "data-v-" + Math.random().toString(16).slice(2, 10);
  }

  static parse(source) {
    const componentId = this.generateComponentId();
    const result = {
      template: "",
      script: "",
      styles: [],
      componentId
    };

    const templateReg = /<template\s*>([\s\S]*?)<\/template\s*>/;
    const templateMatch = source.match(templateReg);
    if (templateMatch) result.template = templateMatch[1].trim();

    const scriptReg = /<script[\s\S]*?>([\s\S]*?)<\/script\s*>/;
    const scriptMatch = source.match(scriptReg);
    if (scriptMatch) result.script = scriptMatch[1].trim();

    const styleReg = /<style([\s\S]*?)>([\s\S]*?)<\/style\s*>/g;
    let styleMatch;
    while ((styleMatch = styleReg.exec(source)) !== null) {
      const attrStr = styleMatch[1];
      const code = styleMatch[2].trim();
      const scoped = /scoped/.test(attrStr);
      const langMatch = attrStr.match(/lang=["'](.*?)["']/);
      const lang = langMatch ? langMatch[1] : null;
      result.styles.push({ code, scoped, lang });
    }

    return result;
  }
}

// ==================== 2. Component Loader ====================
class ComponentLoader {
  static async load(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load component: ${url}, status: ${res.status}`);
    const source = await res.text();
    return VueParser.parse(source);
  }

  static resolveImport(basePath, importPath) {
    if (importPath.startsWith("http") || importPath.startsWith("/")) return importPath;
    const baseDir = basePath.substring(0, basePath.lastIndexOf("/") + 1);
    return baseDir + importPath;
  }
}

// ==================== 3. Custom Virtual Node ====================
class CustomNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.tag = "";
    this.text = "";
    this.attrs = {};
    this.style = {};
    this.componentId = "";
    this.parent = null;
    this.children = [];
    this.layout = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0
    };
  }
}

const NodeType = {
  ELEMENT: "element",
  TEXT: "text"
};

const LayoutConstants = {
  DEFAULT_FLEX_ITEM_SIZE: 50,
  DEFAULT_LINE_HEIGHT: 35
};

// ==================== 4. Virtual DOM Runtime ====================
const VueRuntimeDOM = {
  createElement(tag) {
    const node = new CustomNode(NodeType.ELEMENT);
    node.tag = tag;
    node.tagName = tag;
    return node;
  },
  createTextNode(text) {
    const node = new CustomNode(NodeType.TEXT);
    node.text = text;
    return node;
  },
  appendChild(parent, child) {
    child.parent = parent;
    parent.children.push(child);
  },
  removeChild(parent, child) {
    const idx = parent.children.indexOf(child);
    if (idx > -1) parent.children.splice(idx, 1);
    child.parent = null;
  },
  setElementText(el, text) {
    el.text = text;
  },
  setAttribute(el, key, value) {
    el.attrs[key] = value;
    if (key.startsWith("data-v-")) {
      el.componentId = key;
    }
  },
  addEventListener() {},
  removeEventListener() {}
};

// ==================== 5. Template Parser ====================
class TemplateParser {
  constructor() {
    this.styleParser = new StyleParser();
  }

  parse(template) {
    if (!template) return null;
    
    const root = VueRuntimeDOM.createElement('root');
    this._parseElement(template, root);
    return root;
  }

  _parseElement(html, parent) {
    // 用栈式 HTML 解析：找到下一个 <tag 标记，分类处理（开标签/闭标签/自闭合）
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
    const stack = [parent];
    let lastIndex = 0;
    let m;
    
    while ((m = tagRegex.exec(html)) !== null) {
      const isClose = m[0].startsWith('</');
      const tagName = m[1].toLowerCase();
      const attrsStr = m[2] || '';
      const selfClosing = !isClose && /\/\s*$/.test(attrsStr);
      const cleanAttrs = attrsStr.replace(/\/\s*$/, '');
      
      if (isClose) {
        if (stack.length > 1 && stack[stack.length - 1].tagName === tagName) {
          stack.pop();
        }
        lastIndex = m.index + m[0].length;
        continue;
      }
      
      const attrs = this._parseAttributes(cleanAttrs);
      const node = VueRuntimeDOM.createElement(tagName);
      node.attrs = attrs;
      
      if (attrs.style) {
        node.style = this.styleParser.parseStyle(attrs.style);
      }
      
      VueRuntimeDOM.appendChild(stack[stack.length - 1], node);
      
      if (!selfClosing) {
        stack.push(node);
      }
      lastIndex = m.index + m[0].length;
    }
    
    return parent;
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
  static globalStyles = new Map();
  static scopedStyles = new Map();

  static addStyleSheet(css, componentId) {
    const styleParser = new StyleParser();
    const rules = styleParser.parseCSSText(css);

    if (componentId) {
      if (!this.scopedStyles.has(componentId)) {
        this.scopedStyles.set(componentId, new Map());
      }
      rules.forEach((style, selector) => {
        this.scopedStyles.get(componentId).set(selector, style);
      });
    } else {
      rules.forEach((style, selector) => {
        this.globalStyles.set(selector, style);
      });
    }
  }

  static makeScopedCSS(css, componentId) {
    return css.replace(/([^{]+)\s*\{/g, (_, s) => {
      const selector = s.trim();
      if (selector.includes("@") || selector.includes(":") || selector.startsWith(".")) return selector + " {";
      return `${selector}[${componentId}] {`;
    });
  }

  static computeStyle(node) {
    const finalStyle = {};
    const styleParser = new StyleParser();
    
    this.globalStyles.forEach((style, selector) => {
      if (this._matchesSelector(node, selector)) {
        Object.assign(finalStyle, style);
      }
    });
    
    if (node.componentId && this.scopedStyles.has(node.componentId)) {
      this.scopedStyles.get(node.componentId).forEach((style, selector) => {
        if (this._matchesSelector(node, selector)) {
          Object.assign(finalStyle, style);
        }
      });
    }
    
    Object.assign(finalStyle, node.style);

    finalStyle.color = finalStyle.color || "#333333";
    finalStyle.fontSize = finalStyle.fontSize || "16px";
    finalStyle.lineHeight = finalStyle.lineHeight || "1.5";
    finalStyle.textAlign = finalStyle.textAlign || "left";
    finalStyle.opacity = finalStyle.opacity || "1";
    finalStyle.borderRadius = finalStyle.borderRadius || "0px";
    finalStyle.padding = finalStyle.padding || "0px";
    finalStyle.display = finalStyle.display || "block";

    return finalStyle;
  }

  static _matchesSelector(node, selector) {
    if (!node || !selector) return false;
    
    selector = selector.trim();
    
    if (selector.startsWith('.')) {
      const className = selector.slice(1);
      return node.attrs.class && node.attrs.class.split(/\s+/).includes(className);
    }
    
    if (selector.startsWith('#')) {
      return node.attrs.id === selector.slice(1);
    }
    
    if (/^[a-z]+$/i.test(selector)) {
      return selector.toLowerCase() === node.tag.toLowerCase();
    }
    
    if (selector.includes('[data-v-')) {
      const cleanSelector = selector.replace(/\[[^\]]+\]/g, '');
      return this._matchesSelector(node, cleanSelector);
    }
    
    return false;
  }

  static parseLineHeight(lineHeight, fontSize) {
    const numFontSize = parseFloat(fontSize) || 16;
    if (lineHeight === 'normal') return numFontSize * 1.5;
    if (lineHeight.includes('px')) return parseFloat(lineHeight);
    return parseFloat(lineHeight) * numFontSize;
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
  }
}

// ==================== 7.5 DOM Renderer (Debug) ====================
// 把虚拟节点树渲染为真实 DOM，方便用 DevTools 观察和测试
class DOMRenderer {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.colorParser = new ColorParser();
    this._domMap = new WeakMap();
  }

  render(nodeTree) {
    if (!nodeTree) return;
    
    this._syncDOM(nodeTree, this.rootElement, true);
  }
  
  _syncDOM(vnode, parentDom, isRoot) {
    if (!vnode) return;
    
    if (vnode.nodeType === NodeType.ELEMENT) {
      let domNode = this._domMap.get(vnode);
      if (!domNode) {
        if (isRoot || vnode.tagName === 'root') {
          domNode = parentDom;
        } else {
          domNode = document.createElement(vnode.tagName);
          if (vnode.attrs && vnode.attrs.class) {
            domNode.className = vnode.attrs.class;
          }
          parentDom.appendChild(domNode);
        }
        this._domMap.set(vnode, domNode);
      }
      
      this._applyStyle(domNode, vnode);
      
      if (vnode.children) {
        vnode.children.forEach(child => {
          this._syncDOM(child, domNode, false);
        });
      }
    } else if (vnode.nodeType === NodeType.TEXT) {
      let textNode = this._domMap.get(vnode);
      if (!textNode) {
        if (isRoot) {
          return;
        }
        textNode = document.createTextNode(vnode.text || '');
        parentDom.appendChild(textNode);
        this._domMap.set(vnode, textNode);
      } else {
        textNode.textContent = vnode.text || '';
      }
    }
  }
  
  _applyStyle(domNode, vnode) {
    if (!vnode.layout) return;
    
    const { x, y, width, height } = vnode.layout;
    const style = vnode.style || {};
    
    if (vnode.tagName === 'root') return;
    
    domNode.style.position = 'absolute';
    domNode.style.left = `${x}px`;
    domNode.style.top = `${y}px`;
    domNode.style.width = `${width}px`;
    domNode.style.height = `${height}px`;
    
    if (style.backgroundColor) {
      domNode.style.background = style.backgroundColor;
    } else {
      domNode.style.background = 'transparent';
    }
    
    if (style.borderRadius) {
      domNode.style.borderRadius = style.borderRadius;
    }
    
    if (style.color) {
      domNode.style.color = style.color;
    }
    
    if (style.fontSize) {
      domNode.style.fontSize = style.fontSize;
    }
    
    if (style.fontWeight) {
      domNode.style.fontWeight = style.fontWeight;
    }
    
    if (style.textAlign) {
      domNode.style.textAlign = style.textAlign;
    }
    
    if (style.display) {
      domNode.style.display = style.display;
    }
    
    if (style.opacity !== undefined) {
      domNode.style.opacity = style.opacity;
    }
    
    domNode.style.boxSizing = 'border-box';
    domNode.dataset.layout = JSON.stringify(vnode.layout);
    domNode.dataset.style = JSON.stringify(style);
  }
}

// ==================== 5. LRU Cache ====================
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

// ==================== 5. Layout Engine ====================
class LayoutEngine {
  static sizeCache = new LRUCache(2000);
  static marginCache = new LRUCache(1000);
  static flexCache = new LRUCache(500);
  static layout(root, viewport) {
    if (!root) return;
    if (!root.layout) {
      root.layout = { x: 0, y: 0, width: 0, height: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 };
    }
    root.layout.x = 0;
    root.layout.y = 0;
    root.layout.width = viewport.width;
    root.layout.height = viewport.height;
    
    this.walk(root, viewport);
  }

  static ensureLayout(node) {
    if (!node) return;
    if (!node.layout) {
      node.layout = {
        x: 0, y: 0, width: 0, height: 0,
        paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0
      };
    }
  }
  
  static walk(node, container) {
    if (!node) return;
    this.ensureLayout(node);
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

  static calcFlexLayout(node, container) {
    const style = node.style;
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
    const contentWidth = container.width - containerPadding.left - containerPadding.right;
    const contentHeight = container.height - containerPadding.top - containerPadding.bottom;
    
    const mainSize = isRow ? contentWidth : contentHeight;
    const crossSize = isRow ? contentHeight : contentWidth;
    
    const items = node.children.filter(c => c.nodeType === NodeType.ELEMENT);
    items.forEach(child => this.ensureLayout(child));
    
    const parseSize = (val, percentBase = 0) => {
      if (!val) return 0;
      if (val === 'auto') return 0;
      const cacheKey = val + '_' + percentBase;
      let result = this.sizeCache.get(cacheKey);
      if (result !== undefined) return result;
      
      if (typeof val === 'string' && val.includes('%')) {
        const num = parseFloat(val);
        result = isNaN(num) ? 0 : (num / 100) * percentBase;
      } else {
        const num = parseFloat(val);
        result = isNaN(num) ? 0 : num;
      }
      this.sizeCache.set(cacheKey, result);
      return result;
    };
    
    const parseMargin = (style) => {
      if (style.margin) {
        const vals = style.margin.split(' ').map(v => {
          if (v === 'auto') return 'auto';
          return parseFloat(v) || 0;
        });
        let top, right, bottom, left;
        if (vals.length === 1) {
          top = right = bottom = left = vals[0];
        } else if (vals.length === 2) {
          top = bottom = vals[0];
          right = left = vals[1];
        } else if (vals.length === 3) {
          top = vals[0];
          right = left = vals[1];
          bottom = vals[2];
        } else {
          top = vals[0];
          right = vals[1];
          bottom = vals[2];
          left = vals[3];
        }
        return { top, right, bottom, left };
      }
      const cacheKey = style;
      let result = this.marginCache.get(cacheKey);
      if (result !== undefined) return result;
      
      result = {
        top: style.marginTop === 'auto' ? 'auto' : parseSize(style.marginTop, 0),
        right: style.marginRight === 'auto' ? 'auto' : parseSize(style.marginRight, 0),
        bottom: style.marginBottom === 'auto' ? 'auto' : parseSize(style.marginBottom, 0),
        left: style.marginLeft === 'auto' ? 'auto' : parseSize(style.marginLeft, 0)
      };
      this.marginCache.set(cacheKey, result);
      return result;
    };
    
    const parseFlex = (val) => {
      if (val === undefined || val === null) return null;
      let cached = this.flexCache.get(val);
      if (cached !== undefined) return cached;
      
      let result = null;
      if (typeof val === 'number') {
        if (val === 0) {
          result = { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' };
        } else if (val === 1) {
          result = { flexGrow: 1, flexShrink: 1, flexBasis: 0 };
        } else {
          result = { flexGrow: val, flexShrink: 1, flexBasis: 0 };
        }
      } else {
        const str = String(val).trim();
        if (str === 'none') {
          result = { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' };
        } else if (str === 'auto') {
          result = { flexGrow: 1, flexShrink: 1, flexBasis: 'auto' };
        } else if (str === 'initial') {
          result = { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' };
        } else {
          const parts = str.split(/\s+/);
          let flexGrow = 0, flexShrink = 1, flexBasis = 'auto';
          
          if (parts.length === 1) {
            const v = parts[0];
            if (!isNaN(parseFloat(v))) {
              flexGrow = parseFloat(v);
              flexShrink = 1;
              flexBasis = 0;
            } else {
              flexBasis = v;
            }
          } else if (parts.length === 2) {
            flexGrow = parseFloat(parts[0]) || 0;
            flexShrink = parseFloat(parts[1]) || 0;
          } else if (parts.length >= 3) {
            flexGrow = parseFloat(parts[0]) || 0;
            flexShrink = parseFloat(parts[1]) || 0;
            flexBasis = parts[2];
          }
          result = { flexGrow, flexShrink, flexBasis };
        }
      }
      this.flexCache.set(val, result);
      return result;
    };
    
    let totalFlexBasis = 0;
    let totalFlexGrow = 0;
    const itemInfo = items.map((child, idx) => {
      const childStyle = child.style;
      let mainAxisSize = isRow ? parseSize(childStyle.width, mainSize) : parseSize(childStyle.height, mainSize);
      let crossAxisSize = isRow ? parseSize(childStyle.height, crossSize) : parseSize(childStyle.width, crossSize);
      
      if (mainAxisSize === 0 && !childStyle.width && !childStyle.height) {
        mainAxisSize = LayoutConstants.DEFAULT_FLEX_ITEM_SIZE;
      }
      
      if (crossAxisSize === 0 && !childStyle.width && !childStyle.height) {
        crossAxisSize = crossSize;
      }
      
      const flexParsed = parseFlex(childStyle.flex);
      const flexGrow = flexParsed ? flexParsed.flexGrow : parseSize(childStyle.flexGrow);
      let flexShrink;
      if (flexParsed && childStyle.flexShrink === undefined) {
        flexShrink = flexParsed.flexShrink;
      } else {
        flexShrink = childStyle.flexShrink !== undefined ? parseSize(childStyle.flexShrink) : 1;
      }
      
      let flexBasis;
      if (flexParsed && flexParsed.flexBasis !== 'auto' && childStyle.flexBasis === undefined) {
        flexBasis = parseSize(flexParsed.flexBasis, mainSize);
      } else if (childStyle.flexBasis && childStyle.flexBasis !== 'auto') {
        flexBasis = parseSize(childStyle.flexBasis, mainSize);
      } else {
        flexBasis = mainAxisSize;
      }
      
      const minSize = parseSize(isRow ? childStyle.minWidth : childStyle.minHeight, mainSize);
      const maxSize = childStyle.maxWidth !== undefined || childStyle.maxHeight !== undefined 
        ? parseSize(isRow ? childStyle.maxWidth : childStyle.maxHeight, mainSize) 
        : Infinity;
      
      const order = parseInt(childStyle.order, 10) || 0;
      
      const alignSelf = childStyle.alignSelf || null;
      
      const rawMargin = parseMargin(childStyle);
      const margin = {
        top: rawMargin.top === 'auto' ? 0 : rawMargin.top,
        right: rawMargin.right === 'auto' ? 0 : rawMargin.right,
        bottom: rawMargin.bottom === 'auto' ? 0 : rawMargin.bottom,
        left: rawMargin.left === 'auto' ? 0 : rawMargin.left
      };
      const autoMargin = {
        top: rawMargin.top === 'auto',
        right: rawMargin.right === 'auto',
        bottom: rawMargin.bottom === 'auto',
        left: rawMargin.left === 'auto'
      };
      
      totalFlexBasis += flexBasis;
      totalFlexGrow += flexGrow;
      
      return { 
        child, idx, flexBasis, flexGrow, flexShrink, minSize, maxSize, 
        mainAxisSize, crossAxisSize, order, alignSelf, margin, autoMargin 
      };
    });
    
    itemInfo.sort((a, b) => a.order - b.order);
    const sortedItems = itemInfo.map(info => info.child);
    
    const totalGap = gap * (items.length - 1);
    
    let freeSpace = mainSize - totalFlexBasis - totalGap;
    const computedSizes = itemInfo.map(info => {
      let size = info.flexBasis;
      
      if (freeSpace > 0 && totalFlexGrow > 0 && !isWrap) {
        size += (freeSpace * info.flexGrow) / totalFlexGrow;
      } else if (freeSpace < 0 && info.flexShrink > 0 && !isWrap) {
        const totalShrink = itemInfo.reduce((sum, i) => sum + i.flexShrink * i.flexBasis, 0);
        if (totalShrink > 0) {
          size += (freeSpace * info.flexShrink * info.flexBasis) / totalShrink;
        }
      }
      
      return Math.max(info.minSize, Math.min(size, info.maxSize));
    });
    
    const lines = [];
    if (isWrap) {
      let currentLine = [];
      let currentLineSize = 0;
      let currentLineFlexGrow = 0;
      
      computedSizes.forEach((size, index) => {
        const info = itemInfo[index];
        const margin = info.margin;
        const itemMainMargin = isRow ? margin.left + margin.right : margin.top + margin.bottom;
        
        let effectiveSize = Math.max(size, info.minSize);
        
        if (size === 0 && info.flexGrow > 0 && info.flexBasis === 0) {
          const styleProp = isRow ? info.child.style.width : info.child.style.height;
          if (!styleProp || styleProp === 'auto') {
            effectiveSize = Math.max(effectiveSize, mainSize / 2);
          }
        }
        
        const totalItemSize = effectiveSize + itemMainMargin;
        
        if (currentLineSize + totalItemSize > mainSize && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [index];
          currentLineSize = totalItemSize + gap;
          currentLineFlexGrow = info.flexGrow;
        } else {
          currentLine.push(index);
          currentLineSize += totalItemSize + gap;
          currentLineFlexGrow += info.flexGrow;
        }
      });
      
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
    } else {
      lines.push(computedSizes.map((_, i) => i));
    }
    
    const lineHeights = lines.map(line => {
      const computeItemCrossSize = (index) => {
        const info = itemInfo[index];
        const margin = info.margin;
        const crossMargin = isRow ? margin.top + margin.bottom : margin.left + margin.right;
        const itemCrossSize = (info.crossAxisSize || 0) + crossMargin;
        return itemCrossSize > 0 ? itemCrossSize : (alignItems === 'stretch' ? crossSize : LayoutConstants.DEFAULT_FLEX_ITEM_SIZE);
      };
      
      const maxItemCrossSize = line.reduce((max, index) => {
        return Math.max(max, computeItemCrossSize(index));
      }, 0);
      
      if (lines.length === 1 && alignItems === 'stretch') {
        return crossSize;
      }
      
      return maxItemCrossSize;
    });
    
    const totalLinesHeight = lineHeights.reduce((a, b) => a + b, 0) + gap * (lines.length - 1);
    const freeCrossSpace = crossSize - totalLinesHeight;
    let crossAxisOffset = 0;
    let extraCrossGap = 0;
    
    if (lines.length > 1) {
      if (alignContent === 'center') {
        crossAxisOffset = freeCrossSpace / 2;
      } else if (alignContent === 'flex-end') {
        crossAxisOffset = freeCrossSpace;
      } else if (alignContent === 'space-between') {
        extraCrossGap = freeCrossSpace / (lines.length - 1);
      } else if (alignContent === 'space-around') {
        extraCrossGap = freeCrossSpace / lines.length;
        crossAxisOffset = extraCrossGap / 2;
      } else if (alignContent === 'space-evenly') {
        extraCrossGap = freeCrossSpace / (lines.length + 1);
        crossAxisOffset = extraCrossGap;
      } else if (alignContent === 'normal' || alignContent === 'stretch') {
        // stretch is default for flex-wrap containers, but only when there's free space
        if (alignContent === 'stretch' && freeCrossSpace > 0) {
          const stretchPerLine = freeCrossSpace / lines.length;
          for (let i = 0; i < lineHeights.length; i++) {
            lineHeights[i] += stretchPerLine;
          }
        }
        // For 'normal', just use default flex-start behavior
      }
    }
    
    if (isWrapReverse) {
      crossAxisOffset = crossSize - lineHeights[0];
    }    
    const totalItemsSize = computedSizes.reduce((a, b) => a + b, 0);
    const totalMainAxisSize = totalItemsSize + totalGap;
    
    let mainAxisOffset = 0;
    let extraGap = 0;
    
    lines.forEach((line, lineIndex) => {
      const lineHeight = lineHeights[lineIndex];
      const lineMargins = line.reduce((sum, index) => {
        const margin = itemInfo[index].margin;
        return sum + (isRow ? margin.left + margin.right : margin.top + margin.bottom);
      }, 0);
      
      const lineComputedSizes = line.map(index => computedSizes[index]);
      let lineItemsSize = lineComputedSizes.reduce((sum, size) => sum + size, 0);
      let lineTotalSize = lineItemsSize + lineMargins + gap * (line.length - 1);
      const lineFreeSpace = mainSize - lineItemsSize - lineMargins;
      
      if (isWrap) {
        if (lineFreeSpace < 0) {
          const lineTotalShrink = line.reduce((sum, index) => {
            const info = itemInfo[index];
            return sum + info.flexShrink * Math.max(info.flexBasis, info.minSize);
          }, 0);
          
          if (lineTotalShrink > 0) {
            lineComputedSizes.forEach((_, posInLine) => {
              const index = line[posInLine];
              const info = itemInfo[index];
              if (info.flexShrink > 0) {
                const shrinkAmount = (lineFreeSpace * info.flexShrink * Math.max(info.flexBasis, info.minSize)) / lineTotalShrink;
                lineComputedSizes[posInLine] = Math.max(info.minSize, lineComputedSizes[posInLine] + shrinkAmount);
              }
            });
            lineItemsSize = lineComputedSizes.reduce((sum, size) => sum + size, 0);
            lineTotalSize = lineItemsSize + lineMargins + gap * (line.length - 1);
          }
        }
        
        const lineFlexGrow = line.reduce((sum, index) => sum + itemInfo[index].flexGrow, 0);
        if (lineFreeSpace > 0 && lineFlexGrow > 0) {
          lineComputedSizes.forEach((_, posInLine) => {
            const index = line[posInLine];
            if (itemInfo[index].flexGrow > 0) {
              lineComputedSizes[posInLine] += (lineFreeSpace * itemInfo[index].flexGrow) / lineFlexGrow;
            }
          });
          lineItemsSize = lineComputedSizes.reduce((sum, size) => sum + size, 0);
          lineTotalSize = lineItemsSize + lineMargins + gap * (line.length - 1);
        }
      }
      
      // 重置每行的对齐偏移（复用外层变量）
      mainAxisOffset = 0;
      extraGap = 0;
      
      if (justifyContent === 'center') {
        mainAxisOffset = (mainSize - lineTotalSize) / 2;
      } else if (justifyContent === 'flex-end') {
        if (isReverse) {
          mainAxisOffset = lineTotalSize;
        } else {
          mainAxisOffset = mainSize - lineTotalSize;
        }
      } else if (isReverse) {
        mainAxisOffset = mainSize;
      }
      
      if (justifyContent === 'space-between') {
        if (line.length > 1) {
          extraGap = lineFreeSpace / (line.length - 1);
        }
      } else if (justifyContent === 'space-around') {
        extraGap = lineFreeSpace / line.length;
        if (!isReverse) {
          mainAxisOffset = extraGap / 2;
        }
      } else if (justifyContent === 'space-evenly') {
        extraGap = lineFreeSpace / (line.length + 1);
        if (!isReverse) {
          mainAxisOffset = extraGap;
        }
      }
      
      let lineCrossAxisOffset = crossAxisOffset;
      let lineCrossExtraGap = extraCrossGap;
      
      line.forEach((itemIndex, posInLine) => {
        const child = sortedItems[itemIndex];
        const info = itemInfo[itemIndex];
        let mainAxisSize = lineComputedSizes[posInLine];
        const childAlignItems = info.alignSelf || alignItems;
        const hasAutoMainMargin = isRow 
          ? (info.autoMargin.left || info.autoMargin.right)
          : (info.autoMargin.top || info.autoMargin.bottom);
        let crossAxisSize = (childAlignItems === 'stretch' && !hasAutoMainMargin) ? lineHeight : (info.crossAxisSize || (childAlignItems === 'stretch' ? lineHeight : 0));
        
        const childMargin = info.margin;
        const autoMargin = info.autoMargin;
        const childPadding = this.parsePadding(child.style.padding || '0');
        
        let mainStartMargin = 0;
        let mainEndMargin = 0;
        let crossStartMargin = 0;
        let crossEndMargin = 0;
        
        if (isRow) {
          mainStartMargin = childMargin.left;
          mainEndMargin = childMargin.right;
          crossStartMargin = childMargin.top;
          crossEndMargin = childMargin.bottom;
          
          if (autoMargin.left && autoMargin.right) {
            const autoSpace = Math.max(0, (mainSize - lineItemsSize) / 2);
            mainStartMargin = autoSpace;
            mainEndMargin = autoSpace;
          } else if (autoMargin.left) {
            const remainingSpace = Math.max(0, mainSize - mainAxisOffset - mainAxisSize);
            mainStartMargin = remainingSpace;
          } else if (autoMargin.right) {
            const remainingSpace = Math.max(0, mainSize - mainAxisOffset - mainAxisSize);
            mainEndMargin = remainingSpace;
          }
        } else {
          mainStartMargin = childMargin.top;
          mainEndMargin = childMargin.bottom;
          crossStartMargin = childMargin.left;
          crossEndMargin = childMargin.right;
          
          if (autoMargin.top && autoMargin.bottom) {
            const autoSpace = Math.max(0, (mainSize - lineItemsSize) / 2);
            mainStartMargin = autoSpace;
            mainEndMargin = autoSpace;
          } else if (autoMargin.top) {
            const remainingSpace = Math.max(0, mainSize - mainAxisOffset - mainAxisSize);
            mainStartMargin = remainingSpace;
          } else if (autoMargin.bottom) {
            const remainingSpace = Math.max(0, mainSize - mainAxisOffset - mainAxisSize);
            mainEndMargin = remainingSpace;
          }
        }
        
        if (isRow) {
          if (isReverse) {
            child.layout.x = containerPadding.left + mainAxisOffset - mainAxisSize - mainStartMargin;
          } else {
            child.layout.x = containerPadding.left + mainAxisOffset + mainStartMargin;
          }
          
          let crossY;
          if (autoMargin.top && autoMargin.bottom) {
            crossY = (lineHeight - crossAxisSize) / 2 + crossStartMargin;
          } else if (autoMargin.top) {
            crossY = crossStartMargin;
          } else if (autoMargin.bottom) {
            crossY = lineHeight - crossAxisSize - crossEndMargin;
          } else if (childAlignItems === 'center') {
            crossY = (lineHeight - crossAxisSize) / 2 + crossStartMargin;
          } else if (childAlignItems === 'flex-end') {
            crossY = lineHeight - crossAxisSize - crossEndMargin;
          } else {
            crossY = crossStartMargin;
          }
          child.layout.y = containerPadding.top + lineCrossAxisOffset + crossY;
          child.layout.width = mainAxisSize;
          child.layout.height = crossAxisSize;
        } else {
          let crossX;
          if (autoMargin.left && autoMargin.right) {
            crossX = (lineHeight - crossAxisSize) / 2 + crossStartMargin;
          } else if (autoMargin.left) {
            crossX = crossStartMargin;
          } else if (autoMargin.right) {
            crossX = lineHeight - crossAxisSize - crossEndMargin;
          } else if (childAlignItems === 'center') {
            crossX = (lineHeight - crossAxisSize) / 2 + crossStartMargin;
          } else if (childAlignItems === 'flex-end') {
            crossX = lineHeight - crossAxisSize - crossEndMargin;
          } else {
            crossX = crossStartMargin;
          }
          child.layout.x = containerPadding.left + lineCrossAxisOffset + crossX;
          
          if (isReverse) {
            child.layout.y = containerPadding.top + mainAxisOffset - mainAxisSize - mainEndMargin;
          } else {
            child.layout.y = containerPadding.top + mainAxisOffset + mainStartMargin;
          }
          child.layout.width = crossAxisSize;
          child.layout.height = mainAxisSize;
        }
        
        if (isReverse) {
          mainAxisOffset -= mainAxisSize + gap + extraGap + mainStartMargin;
        } else {
          mainAxisOffset += mainAxisSize + gap + extraGap + mainEndMargin;
        }
        
        child.layout.paddingTop = childPadding.top;
        child.layout.paddingRight = childPadding.right;
        child.layout.paddingBottom = childPadding.bottom;
        child.layout.paddingLeft = childPadding.left;
        child.layout.marginTop = childMargin.top;
        child.layout.marginRight = childMargin.right;
        child.layout.marginBottom = childMargin.bottom;
        child.layout.marginLeft = childMargin.left;
      });
      
      if (isWrapReverse) {
        if (isRow) {
          crossAxisOffset -= lineHeight + gap + extraCrossGap;
        } else {
          crossAxisOffset -= lineHeights[lineIndex] + gap + extraCrossGap;
        }
      } else {
        if (isRow) {
          crossAxisOffset += lineHeight + gap + extraCrossGap;
        } else {
          crossAxisOffset += lineHeights[lineIndex] + gap + extraCrossGap;
        }
      }
    });
    
    // 递归计算子节点的布局
    items.forEach(child => {
      this.walk(child, child.layout);
      
      // 修复：flex item 的 main axis size 为 0 时，根据其子节点尺寸回填
      // 避免 chicken-and-egg 问题：父布局假设子项为 0
      if (child.children && child.children.length > 0) {
        const childDisplay = child.style?.display;
        if (childDisplay === 'flex' || childDisplay === 'grid' || childDisplay === 'block') {
          if (isRow) {
            // row 方向：main = width
            if (child.layout.width === 0) {
              const childMax = child.children
                .filter(c => c.nodeType === NodeType.ELEMENT)
                .reduce((max, c) => Math.max(max, c.layout.x + c.layout.width), 0);
              if (childMax > 0) child.layout.width = childMax;
            }
          } else {
            // column 方向：main = height
            if (child.layout.height === 0) {
              const childMax = child.children
                .filter(c => c.nodeType === NodeType.ELEMENT)
                .reduce((max, c) => Math.max(max, c.layout.y + c.layout.height), 0);
              if (childMax > 0) child.layout.height = childMax;
            }
          }
        }
      }
    });
  }
  static calcGridLayout(node, container) {
    const style = node.style;
    const gap = parseFloat(style.gap) || 0;
    
    const parseSize = (val, percentBase = 0) => {
      if (!val) return 0;
      if (val === 'auto') return 0;
      if (typeof val === 'string' && val.includes('%')) {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : (num / 100) * percentBase;
      }
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };
    
    const items = node.children.filter(c => c.nodeType === NodeType.ELEMENT);
    items.forEach(child => this.ensureLayout(child));
    
    let cols = [container.width];
    let rows = [];
    
    if (style.gridTemplateColumns) {
      const colDefs = style.gridTemplateColumns.split(' ').filter(v => v.trim());
      const frCols = colDefs.filter(v => v.endsWith('fr')).map(v => parseFloat(v) || 1);
      const totalFr = frCols.reduce((a, b) => a + b, 0);
      const fixedWidth = colDefs.filter(v => !v.endsWith('fr')).reduce((a, v) => a + parseSize(v, container.width), 0);
      const availableWidth = container.width - fixedWidth - gap * (colDefs.length - 1);
      
      cols = colDefs.map(v => {
        if (v.endsWith('fr')) {
          const fr = parseFloat(v) || 1;
          return (fr / totalFr) * availableWidth;
        }
        return parseSize(v, container.width);
      });
    }
    
    const numCols = cols.length;
    const numRows = Math.ceil(items.length / numCols);
    
    if (style.gridTemplateRows) {
      const rowDefs = style.gridTemplateRows.split(' ').filter(v => v.trim());
      const frRows = rowDefs.filter(v => v.endsWith('fr')).map(v => parseFloat(v) || 1);
      const totalFr = frRows.reduce((a, b) => a + b, 0);
      const fixedHeight = rowDefs.filter(v => !v.endsWith('fr')).reduce((a, v) => a + parseSize(v, container.height), 0);
      const availableHeight = container.height - fixedHeight - gap * (rowDefs.length - 1);
      
      rows = rowDefs.map(v => {
        if (v.endsWith('fr')) {
          const fr = parseFloat(v) || 1;
          return (fr / totalFr) * availableHeight;
        }
        return parseSize(v, container.height);
      });
    } else {
      for (let i = 0; i < numRows; i++) {
        rows.push(100);
      }
    }
    
    // 预计算前缀和，减少重复计算
    let colPrefix = [0];
    for (let i = 0; i < cols.length; i++) {
      colPrefix.push(colPrefix[i] + cols[i] + gap);
    }
    
    let rowPrefix = [0];
    for (let i = 0; i < rows.length; i++) {
      rowPrefix.push(rowPrefix[i] + rows[i] + gap);
    }
    
    items.forEach((child, index) => {
      const col = index % numCols;
      const row = Math.floor(index / numCols);
      
      child.layout.x = colPrefix[col];
      child.layout.y = rowPrefix[row];
      child.layout.width = cols[col];
      child.layout.height = rows[row] || 100;
      
      const padding = this.parsePadding(child.style.padding || '0');
      child.layout.paddingTop = padding.top;
      child.layout.paddingRight = padding.right;
      child.layout.paddingBottom = padding.bottom;
      child.layout.paddingLeft = padding.left;
    });
    
    // 递归计算子节点的布局
    items.forEach(child => {
      this.walk(child, child.layout);
    });
  }

  static calcBlockLayout(node, container) {
    let y = 0;
    const items = node.children.filter(c => c.nodeType === NodeType.ELEMENT);
    items.forEach(child => this.ensureLayout(child));
    
    const parseBlockSize = (val, base, defaultVal) => {
      if (!val) return defaultVal;
      if (typeof val === 'string' && val.includes('%')) {
        const num = parseFloat(val);
        return isNaN(num) ? defaultVal : (num / 100) * base;
      }
      const num = parseFloat(val);
      return isNaN(num) ? defaultVal : num;
    };
    
    // 第一遍：计算所有子元素的初始布局
    items.forEach(child => {
      const style = child.style;
      const display = style.display || 'block';
      const width = parseBlockSize(style.width, container.width, container.width);
      
      // 如果是 flex 容器且没有设置高度，使用容器剩余高度
      let height;
      if (display === 'flex' && !style.height) {
        height = container.height - y;
      } else {
        height = parseBlockSize(style.height, container.height, 50);
      }
      
      child.layout.x = 0;
      child.layout.y = y;
      child.layout.width = width;
      child.layout.height = height;
      
      const padding = this.parsePadding(style.padding || '0');
      child.layout.paddingTop = padding.top;
      child.layout.paddingRight = padding.right;
      child.layout.paddingBottom = padding.bottom;
      child.layout.paddingLeft = padding.left;
      
      y += height + (parseFloat(style.marginBottom) || 0);
    });
    
    // 递归计算子节点的布局
    items.forEach(child => {
      this.walk(child, child.layout);
    });
  }

  static parsePadding(paddingStr) {
    const vals = paddingStr.split(' ').map(v => parseFloat(v) || 0);
    if (vals.length === 1) {
      return { top: vals[0], right: vals[0], bottom: vals[0], left: vals[0] };
    } else if (vals.length === 2) {
      return { top: vals[0], right: vals[1], bottom: vals[0], left: vals[1] };
    } else if (vals.length === 3) {
      return { top: vals[0], right: vals[1], bottom: vals[2], left: vals[1] };
    } else if (vals.length >= 4) {
      return { top: vals[0], right: vals[1], bottom: vals[2], left: vals[3] };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}

// ==================== 9. Vue Application ====================
class VueApplication {
  constructor(opts) {
    this.renderer = opts.render;
    this._context = { renderer: VueRuntimeDOM };
    this.config = { runtimeOptions: { DOM: VueRuntimeDOM } };
  }

  mount(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    this._container = container;
    this._setupCanvas();
    this._render();
  }

  _setupCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'vue-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    this._container.innerHTML = '';
    this._container.appendChild(canvas);
    
    this._cpuRenderer = new CPURenderer(canvas);
    this._cpuRenderer.init();
  }

  _render() {
    if (this.renderer) {
      this.renderer();
    }
  }
}

// ==================== 10. Global Entry ====================
export async function createApp(url) {
  try {
    const res = await ComponentLoader.load(url);
    const { template, styles, componentId } = res;
    
    styles.forEach(styleItem => {
      if (styleItem.scoped) {
        const scopedCss = StyleSystem.makeScopedCSS(styleItem.code, componentId);
        StyleSystem.addStyleSheet(scopedCss, componentId);
      } else {
        StyleSystem.addStyleSheet(styleItem.code);
      }
    });
    
    const parser = new TemplateParser();
    const rootNode = parser.parse(template);
    
    const injectScopedId = (node) => {
      if (!node) return;
      if (node.nodeType === NodeType.ELEMENT) {
        node.componentId = componentId;
        node.attrs[componentId] = "";
      }
      if (node.children) {
        node.children.forEach(injectScopedId);
      }
    };
    injectScopedId(rootNode);
    
    const calcTreeStyle = (node) => {
      if (!node) return;
      node.style = StyleSystem.computeStyle(node);
      if (node.children) {
        node.children.forEach(calcTreeStyle);
      }
    };
    calcTreeStyle(rootNode);
    
    let cpuRenderer = null;
    
    const app = {
      async mount(container, options = {}) {
        if (typeof container === 'string') {
          container = document.querySelector(container);
        }
        
        const useDOM = options.useDOM === true;
        const useCanvas = !useDOM;
        
        if (useCanvas) {
          const canvas = document.createElement('canvas');
          canvas.id = 'vue-canvas';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.display = 'block';
          container.innerHTML = '';
          container.appendChild(canvas);
          
          cpuRenderer = new CPURenderer(canvas);
          cpuRenderer.init();
          
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
        } else {
          container.innerHTML = '';
          container.style.position = 'relative';
          container.style.overflow = 'hidden';
          container.style.background = '#1a1a2e';
          
          const domRoot = document.createElement('div');
          domRoot.id = 'vue-dom-root';
          domRoot.style.position = 'absolute';
          domRoot.style.left = '0';
          domRoot.style.top = '0';
          domRoot.style.width = '100%';
          domRoot.style.height = '100%';
          domRoot.style.background = 'transparent';
          container.appendChild(domRoot);
          
          const domRenderer = new DOMRenderer(domRoot);
          
          const frameLoop = () => {
            const viewport = {
              width: window.innerWidth,
              height: window.innerHeight
            };
            
            LayoutEngine.layout(rootNode, viewport);
            domRenderer.render(rootNode);
            
            requestAnimationFrame(frameLoop);
          };
          frameLoop();
        }
        
        window.addEventListener('resize', () => {
          if (cpuRenderer) {
            cpuRenderer.resize(window.innerWidth, window.innerHeight);
          }
        });
      }
    };
    
    return app;
    
  } catch (err) {
    console.error('Failed to create app:', err.message);
    throw err;
  }
}

// ==================== 11. Virtual DOM Diff Algorithm ====================
class VNode {
  constructor(tag, data = {}, children = [], text = '', elm = null) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.key = data && data.key;
    this.componentInstance = null;
  }
}

class VNodeDiff {
  static patch(oldVNode, newVNode) {
    if (!oldVNode) {
      return this.createElm(newVNode);
    }
    
    if (!newVNode) {
      this.removeElm(oldVNode.elm);
      return null;
    }
    
    if (this.sameVNode(oldVNode, newVNode)) {
      this.patchVNode(oldVNode, newVNode);
      return oldVNode.elm;
    }
    
    const oldElm = oldVNode.elm;
    const parentElm = oldElm.parentNode;
    const newElm = this.createElm(newVNode);
    
    if (parentElm) {
      parentElm.insertBefore(newElm, oldElm);
      this.removeElm(oldVNode.elm);
    }
    
    return newElm;
  }
  
  static sameVNode(oldVNode, newVNode) {
    return (
      oldVNode.tag === newVNode.tag &&
      oldVNode.key === newVNode.key
    );
  }
  
  static patchVNode(oldVNode, newVNode) {
    const elm = newVNode.elm = oldVNode.elm;
    
    if (oldVNode.text !== newVNode.text) {
      elm.textContent = newVNode.text;
    }
    
    if (oldVNode.data || newVNode.data) {
      this.patchData(elm, oldVNode.data || {}, newVNode.data || {});
    }
    
    this.patchChildren(oldVNode.children, newVNode.children, elm);
  }
  
  static patchData(elm, oldData, newData) {
    for (const key in newData) {
      if (newData[key] !== oldData[key]) {
        if (key === 'style') {
          Object.assign(elm.style, newData[key]);
        } else if (key.startsWith('on')) {
          const event = key.slice(2).toLowerCase();
          elm.removeEventListener(event, oldData[key]);
          elm.addEventListener(event, newData[key]);
        } else {
          elm.setAttribute(key, newData[key]);
        }
      }
    }
    
    for (const key in oldData) {
      if (!(key in newData)) {
        if (key === 'style') {
          for (const styleKey in oldData[key]) {
            elm.style[styleKey] = '';
          }
        } else if (key.startsWith('on')) {
          const event = key.slice(2).toLowerCase();
          elm.removeEventListener(event, oldData[key]);
        } else {
          elm.removeAttribute(key);
        }
      }
    }
  }
  
  static patchChildren(oldChildren, newChildren, elm) {
    let oldStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newChildren.length - 1;
    
    let oldStartVNode = oldChildren[oldStartIdx];
    let oldEndVNode = oldChildren[oldEndIdx];
    let newStartVNode = newChildren[newStartIdx];
    let newEndVNode = newChildren[newEndIdx];
    
    const oldKeyToIdx = {};
    
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (!oldStartVNode) {
        oldStartVNode = oldChildren[++oldStartIdx];
      } else if (!oldEndVNode) {
        oldEndVNode = oldChildren[--oldEndIdx];
      } else if (this.sameVNode(oldStartVNode, newStartVNode)) {
        this.patchVNode(oldStartVNode, newStartVNode);
        oldStartVNode = oldChildren[++oldStartIdx];
        newStartVNode = newChildren[++newStartIdx];
      } else if (this.sameVNode(oldEndVNode, newEndVNode)) {
        this.patchVNode(oldEndVNode, newEndVNode);
        oldEndVNode = oldChildren[--oldEndIdx];
        newEndVNode = newChildren[--newEndIdx];
      } else if (this.sameVNode(oldStartVNode, newEndVNode)) {
        this.patchVNode(oldStartVNode, newEndVNode);
        elm.insertBefore(oldStartVNode.elm, oldEndVNode.elm.nextSibling);
        oldStartVNode = oldChildren[++oldStartIdx];
        newEndVNode = newChildren[--newEndIdx];
      } else if (this.sameVNode(oldEndVNode, newStartVNode)) {
        this.patchVNode(oldEndVNode, newStartVNode);
        elm.insertBefore(oldEndVNode.elm, oldStartVNode.elm);
        oldEndVNode = oldChildren[--oldEndIdx];
        newStartVNode = newChildren[++newStartIdx];
      } else {
        if (!oldKeyToIdx.length) {
          for (let i = oldStartIdx; i <= oldEndIdx; i++) {
            if (oldChildren[i] && oldChildren[i].key) {
              oldKeyToIdx[oldChildren[i].key] = i;
            }
          }
        }
        
        const idxInOld = newStartVNode.key ? oldKeyToIdx[newStartVNode.key] : null;
        
        if (idxInOld !== null) {
          const vnodeToMove = oldChildren[idxInOld];
          this.patchVNode(vnodeToMove, newStartVNode);
          oldChildren[idxInOld] = undefined;
          elm.insertBefore(vnodeToMove.elm, oldStartVNode.elm);
        } else {
          const newElm = this.createElm(newStartVNode);
          elm.insertBefore(newElm, oldStartVNode.elm);
        }
        
        newStartVNode = newChildren[++newStartIdx];
      }
    }
    
    while (oldStartIdx <= oldEndIdx) {
      if (oldChildren[oldStartIdx]) {
        this.removeElm(oldChildren[oldStartIdx].elm);
      }
      oldStartIdx++;
    }
    
    while (newStartIdx <= newEndIdx) {
      const newElm = this.createElm(newChildren[newStartIdx]);
      elm.appendChild(newElm);
      newStartIdx++;
    }
  }
  
  static createElm(vnode) {
    const { tag, data, children, text } = vnode;
    
    let elm;
    if (tag) {
      elm = document.createElement(tag);
      if (data) {
        this.patchData(elm, {}, data);
      }
    } else {
      elm = document.createTextNode(text);
    }
    
    vnode.elm = elm;
    
    if (children && children.length) {
      children.forEach(child => {
        elm.appendChild(this.createElm(child));
      });
    }
    
    return elm;
  }
  
  static removeElm(elm) {
    if (elm && elm.parentNode) {
      elm.parentNode.removeChild(elm);
    }
  }
}

// ==================== 12. Reactive Data Binding ====================
class Dep {
  constructor() {
    this.subs = [];
  }
  
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
  
  addSub(sub) {
    this.subs.push(sub);
  }
  
  removeSub(sub) {
    const idx = this.subs.indexOf(sub);
    if (idx > -1) {
      this.subs.splice(idx, 1);
    }
  }
}

Dep.target = null;

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.cb = cb;
    this.deps = [];
    this.depIds = new Set();
    
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = this.parsePath(expOrFn);
    }
    
    this.value = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    return value;
  }
  
  addDep(dep) {
    if (!this.depIds.has(dep)) {
      this.depIds.add(dep);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  
  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
  
  parsePath(path) {
    const segments = path.split('.');
    return function(obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj) return;
        obj = obj[segments[i]];
      }
      return obj;
    };
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      dep.depend();
      return val;
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    }
  });
  
  if (typeof val === 'object' && val !== null) {
    observe(val);
  }
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
  });
}

class VueReactive {
  constructor(data) {
    this._data = data;
    observe(data);
    this.proxyData();
  }
  
  proxyData() {
    Object.keys(this._data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get: () => this._data[key],
        set: (val) => {
          this._data[key] = val;
        }
      });
    });
  }
  
  $watch(expOrFn, cb) {
    return new Watcher(this, expOrFn, cb);
  }
}

// ==================== 13. Directive System ====================
class DirectiveManager {
  static parseDirectives(attrs) {
    const directives = {};
    
    for (const key in attrs) {
      if (key.startsWith('v-')) {
        const directiveName = key.slice(2);
        directives[directiveName] = attrs[key];
        delete attrs[key];
      }
    }
    
    return directives;
  }
  
  static processDirectives(node, directives, context) {
    if (!directives) return;
    
    if (directives['if'] !== undefined) {
      this.processVIf(node, directives['if'], context);
    }
    
    if (directives['for'] !== undefined) {
      return this.processVFor(node, directives['for'], context);
    }
    
    if (directives['bind'] !== undefined) {
      this.processVBind(node, directives['bind'], context);
    }
    
    if (directives['on'] !== undefined) {
      this.processVOn(node, directives['on'], context);
    }
    
    return [node];
  }
  
  static processVIf(node, expression, context) {
    const value = this.evaluateExpression(expression, context);
    if (!value) {
      node._hidden = true;
    } else {
      delete node._hidden;
    }
  }
  
  static processVFor(node, expression, context) {
    const match = expression.match(/(\w+)\s+in\s+(.+)/);
    if (!match) return [node];
    
    const [, itemName, listExpr] = match;
    const list = this.evaluateExpression(listExpr, context);
    
    if (!Array.isArray(list)) return [node];
    
    const nodes = [];
    
    list.forEach((item, index) => {
      const newNode = this.cloneNode(node);
      newNode._forIndex = index;
      newNode._forItem = item;
      
      const itemContext = { ...context };
      itemContext[itemName] = item;
      itemContext['index'] = index;
      
      newNode.text = this.interpolateText(newNode.text || '', itemContext);
      
      if (newNode.children) {
        newNode.children.forEach(child => {
          this.processChildNode(child, itemContext);
        });
      }
      
      nodes.push(newNode);
    });
    
    return nodes;
  }
  
  static processVBind(node, expression, context) {
    const match = expression.match(/(\w+)\s*:\s*(.+)/);
    if (!match) return;
    
    const [, attrName, valueExpr] = match;
    const value = this.evaluateExpression(valueExpr, context);
    
    if (attrName === 'style') {
      Object.assign(node.style, value);
    } else {
      node.attrs[attrName] = value;
    }
  }
  
  static processVOn(node, expression, context) {
    const match = expression.match(/(\w+)\s*=\s*(.+)/);
    if (!match) return;
    
    const [, eventName, handlerName] = match;
    
    if (context && typeof context[handlerName] === 'function') {
      node._events = node._events || {};
      node._events[eventName] = context[handlerName].bind(context);
    }
  }
  
  static evaluateExpression(expr, context) {
    try {
      const fn = new Function(...Object.keys(context || {}), `return ${expr}`);
      return fn(...Object.values(context || {}));
    } catch (e) {
      console.warn('Expression evaluation error:', expr, e);
      return null;
    }
  }
  
  static interpolateText(text, context) {
    if (!text) return text;
    
    return text.replace(/\{\{(.+?)\}\}/g, (match, expr) => {
      const value = this.evaluateExpression(expr.trim(), context);
      return value !== undefined ? value : '';
    });
  }
  
  static processChildNode(node, context) {
    if (!node) return;
    
    if (node.nodeType === NodeType.TEXT) {
      node.text = this.interpolateText(node.text, context);
    }
    
    if (node.children) {
      node.children.forEach(child => this.processChildNode(child, context));
    }
  }
  
  static cloneNode(node) {
    const newNode = new CustomNode(node.nodeType);
    Object.assign(newNode, node);
    newNode.children = node.children ? node.children.map(c => this.cloneNode(c)) : [];
    return newNode;
  }
}

// ==================== 14. Event System ====================
class EventSystem {
  constructor() {
    this.listeners = {};
  }
  
  on(eventName, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }
  
  off(eventName, handler) {
    if (!this.listeners[eventName]) return;
    
    const idx = this.listeners[eventName].indexOf(handler);
    if (idx > -1) {
      this.listeners[eventName].splice(idx, 1);
    }
  }
  
  emit(eventName, ...args) {
    if (!this.listeners[eventName]) return;
    
    this.listeners[eventName].forEach(handler => {
      try {
        handler(...args);
      } catch (e) {
        console.error('Event handler error:', e);
      }
    });
  }
  
  once(eventName, handler) {
    const onceHandler = (...args) => {
      handler(...args);
      this.off(eventName, onceHandler);
    };
    this.on(eventName, onceHandler);
  }
  
  delegate(el, eventName, selector, handler) {
    const delegateHandler = (e) => {
      const target = e.target;
      const matched = target.closest(selector);
      
      if (matched && el.contains(matched)) {
        handler.call(matched, e);
      }
    };
    
    this.on(eventName, delegateHandler);
    return () => this.off(eventName, delegateHandler);
  }
}

// Export other classes for debugging
export { VueRuntimeDOM, NodeType, CPURenderer, LayoutEngine, StyleSystem, TemplateParser, VueParser, VNode, VNodeDiff, VueReactive, DirectiveManager, EventSystem };
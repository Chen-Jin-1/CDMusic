export function flattenCSS(css) {
  let i = 0;
  const len = css.length;

  function parseRules(endChar = null) {
    const rules = [];
    while (i < len) {
      skipWs();
      if (i >= len) break;
      if (endChar && css[i] === endChar) { i++; break; }

      const prelude = readUntil('{;');          // ← 修复：字符串，不是正则
      if (i >= len && prelude.trim() === '') break;

      const ch = css[i];

      if (ch === ';') {
        i++;
        rules.push({ type: 'raw', text: prelude.trim() + ';' });
        continue;
      }

      i++; // '{'
      const body = parseRules('}');
      const trimmed = prelude.trim();

      if (trimmed.startsWith('@')) {
        rules.push({ type: 'at', name: trimmed, body });
      } else {
        rules.push({ type: 'rule', selector: trimmed, body });
      }
    }
    return rules;
  }

  function skipWs() {
    while (i < len) {
      const c = css[i];
      if (c === '/' && css[i + 1] === '*') {
        const end = css.indexOf('*/', i + 2);
        i = end === -1 ? len : end + 2;
      } else if (/\s/.test(c)) {
        i++;
      } else break;
    }
  }

  function readUntil(chars) {
    let depthParen = 0, depthBracket = 0, str = null, out = '';
    while (i < len) {
      const c = css[i];
      if (str) {
        out += c;
        if (c === '\\') {                    // ← 修复：转义只跳一个字符
          i++;
          if (i < len) out += css[i];
          i++;
          continue;
        }
        if (c === str) str = null;
        i++;
        continue;
      }
      if (c === '"' || c === "'") { str = c; out += c; i++; continue; }
      if (c === '(') depthParen++;
      else if (c === ')') depthParen--;
      else if (c === '[') depthBracket++;
      else if (c === ']') depthBracket--;
      if (depthParen === 0 && depthBracket === 0 && chars.includes(c)) break;
      out += c;
      i++;
    }
    return out;
  }

  function splitTopLevel(str, sep) {
    const parts = [];
    let depth = 0, buf = '', strChar = null;
    for (let k = 0; k < str.length; k++) {
      const c = str[k];
      if (strChar) {
        buf += c;
        if (c === '\\') { buf += str[++k]; continue; }
        if (c === strChar) strChar = null;
        continue;
      }
      if (c === '"' || c === "'") { strChar = c; buf += c; continue; }
      if (c === '(' || c === '[') depth++;
      if (c === ')' || c === ']') depth--;
      if (c === sep && depth === 0) { parts.push(buf); buf = ''; }
      else buf += c;
    }
    if (buf) parts.push(buf);
    return parts;
  }

  function expandSelector(parent, selector) {
    const parentList = splitTopLevel(parent, ',');
    const selfList = splitTopLevel(selector, ',');

    const out = [];
    for (const p of parentList) {
      for (const s of selfList) {
        const sp = s.trim();
        if (!sp) continue;
        if (sp.includes('&')) {
          out.push(sp.replace(/&/g, p.trim()));
        } else {
          out.push(p.trim() + ' ' + sp);
        }
      }
    }
    return out.join(', ');
  }

  function render(nodes, parentSelector = null) {
    let declBuf = '';
    let ruleBuf = '';
    let atBuf = '';

    for (const node of nodes) {
      if (node.type === 'raw') {
        declBuf += node.text + '\n';
      } else if (node.type === 'at') {
        const name = node.name;
        if (/^@(keyframes|-webkit-keyframes|font-face|page|import|charset|namespace)/i.test(name)) {
          atBuf += name + ' {\n' + render(node.body, null) + '}\n';
        } else {
          atBuf += name + ' {\n' + render(node.body, parentSelector) + '}\n';
        }
      } else if (node.type === 'rule') {
        if (!parentSelector && node.selector.includes('&')) {
          throw new Error('Top-level "&" is not allowed: ' + node.selector);
        }
        const child = parentSelector
          ? expandSelector(parentSelector, node.selector)
          : node.selector;
        ruleBuf += render(node.body, child);
      }
    }

    let out = '';
    if (parentSelector && declBuf.trim()) {
      out += parentSelector + ' {\n' + declBuf + '}\n';
    }
    out += ruleBuf;
    out += atBuf;
    if (!parentSelector && declBuf.trim()) {
      out += declBuf;
    }
    return out;
  }

  const ast = parseRules();
  return render(ast, null);
}
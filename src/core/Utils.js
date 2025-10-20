// Utils.js - small helper functions

export function qs(selector, root = document) { return root.querySelector(selector); }
export function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
export function debounce(fn, ms = 200) { let t; return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); }; }
export function el(tag='div', attrs={}, children=[]) {
  const n = document.createElement(tag);
  Object.keys(attrs).forEach(k => { if (k === 'class') n.className = attrs[k]; else if (k.startsWith('on') && typeof attrs[k] === 'function') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]); else n.setAttribute(k, attrs[k]); });
  (Array.isArray(children)?children:[children]).forEach(c => { if (c == null) return; if (typeof c === 'string') n.appendChild(document.createTextNode(c)); else n.appendChild(c); });
  return n;
}

export default { qs, qsa, debounce, el };

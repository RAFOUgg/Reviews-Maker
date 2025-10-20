// Router.js
// Lightweight router that uses history API to switch views inside pages.

export function navigateTo(path, state = {}) {
  const url = typeof path === 'string' ? path : '/' + (path || '');
  history.pushState(state, '', url);
  dispatchRoute(url, state);
}

const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function dispatchRoute(path, state = {}) {
  // try exact then prefix
  let fn = routes.get(path) || routes.get(new URL(path, location.href).pathname);
  if (!fn) {
    for (const [p, h] of routes.entries()) {
      if (path.startsWith(p)) { fn = h; break; }
    }
  }
  if (fn) try { fn(state); } catch(e) { console.warn('route handler failed', e); }
}

window.addEventListener('popstate', (ev) => {
  dispatchRoute(location.pathname, ev.state || {});
});

export default { navigateTo, registerRoute, dispatchRoute };

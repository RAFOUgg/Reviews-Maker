// StateManager.js
// Minimal central state manager using a simple pub/sub pattern.
// Designed to be tiny and dependency-free for easy integration during migration.

const state = {
  user: null,
  currentReview: null,
  ui: {
    modalOpen: null,
  }
};

const listeners = new Map();

export function getState() { return state; }

export function setState(path, value) {
  const keys = path.split('.');
  let cur = state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  // Notify listeners for this path and global ("*")
  const notify = (k, v) => {
    const list = listeners.get(k) || [];
    list.forEach(fn => { try { fn(v); } catch(e){} });
  };
  notify(path, value);
  notify('*', state);
}

export function subscribe(path, fn) {
  if (!listeners.has(path)) listeners.set(path, []);
  listeners.get(path).push(fn);
  return () => {
    const arr = listeners.get(path) || [];
    listeners.set(path, arr.filter(x => x !== fn));
  };
}

export default {
  getState,
  setState,
  subscribe
};

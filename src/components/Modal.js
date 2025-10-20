// Modal.js - generic modal component
// Usage: import Modal from './Modal.js'; const m = new Modal(document.getElementById('myModal'));
// Methods: open(), close(), on(event, handler) - events: open, close

export default class Modal {
  constructor(root) {
    if (!root) throw new Error('Modal root element required');
    this.root = root;
    this.overlay = root.querySelector('.modal-overlay') || root.querySelector('.overlay');
    this.content = root.querySelector('.modal-content') || root;
    this.handlers = { open: [], close: [] };
    this._boundOnDoc = this._onDocClick.bind(this);
    this._boundOnKey = this._onKey.bind(this);
  }

  open() {
    try {
  // Close any other modals on page (do not set inline display; CSS controls layout)
  document.querySelectorAll('.modal').forEach(m => { try { m.classList.remove('show'); } catch(e){} });
  if (this.overlay) { this.overlay.classList.add('show'); }
  this.root.classList.add('show');
      try { document.body.classList.add('modal-open'); } catch(e){}
      document.addEventListener('click', this._boundOnDoc, true);
      document.addEventListener('keydown', this._boundOnKey, true);
      this._emit('open');
    } catch(e) { console.warn('Modal.open error', e); }
  }

  close() {
    try {
  if (this.overlay) { this.overlay.classList.remove('show'); }
  this.root.classList.remove('show');
      try { document.body.classList.remove('modal-open'); } catch(e){}
      document.removeEventListener('click', this._boundOnDoc, true);
      document.removeEventListener('keydown', this._boundOnKey, true);
      this._emit('close');
    } catch(e) { console.warn('Modal.close error', e); }
  }

  _onDocClick(e) {
    // close if click outside content
    if (!this.content.contains(e.target)) {
      this.close();
    }
  }

  _onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') this.close();
  }

  on(event, fn) { if (!this.handlers[event]) this.handlers[event] = []; this.handlers[event].push(fn); }
  _emit(event, ...args) { (this.handlers[event]||[]).forEach(fn => { try{fn(...args);}catch(e){} }); }
}

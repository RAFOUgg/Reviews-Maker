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
    // Track original overlay placement so we can restore it when closing
    this._overlayOriginalParent = this.overlay ? this.overlay.parentNode : null;
    this._overlayOriginalNextSibling = this.overlay ? this.overlay.nextSibling : null;
    this._overlayMoved = false;
    this._rootOriginalStyle = { position: root.style.position || '', inset: root.style.inset || '', left: root.style.left || '', top: root.style.top || '', transform: root.style.transform || '' };
  }

  open() {
    try {
  // Close any other modals on page (do not set inline display; CSS controls layout)
  document.querySelectorAll('.modal').forEach(m => { try { m.classList.remove('show'); } catch(e){} });
  // Ensure overlay covers the viewport even if modal is inside a transformed/staked container
  if (this.overlay) {
    try {
      if (this.overlay.parentNode !== document.body) {
        // Move overlay to body so fixed positioning covers full viewport
        this._overlayOriginalParent = this.overlay.parentNode;
        this._overlayOriginalNextSibling = this.overlay.nextSibling;
        document.body.appendChild(this.overlay);
        this._overlayMoved = true;
      }
      // Make overlay fixed full-viewport to avoid layout-dependent clipping
      this.overlay.style.position = 'fixed';
      this.overlay.style.inset = '0';
      this.overlay.style.width = '100%';
      this.overlay.style.height = '100%';
      this.overlay.style.zIndex = '10060';
    } catch (err) { /* non-fatal */ }
    this.overlay.classList.add('show');
  }
  // Force modal root into fixed full-viewport stacking context to avoid
  // being clipped by transformed ancestors. Store previous inline styles.
  try {
    this.root.style.position = 'fixed';
    this.root.style.inset = '0';
    this.root.style.left = '0';
    this.root.style.top = '0';
    this.root.style.transform = 'none';
  } catch (err) {}
  this.root.classList.add('show');
      try { document.body.classList.add('modal-open'); } catch(e){}
      document.addEventListener('click', this._boundOnDoc, true);
      document.addEventListener('keydown', this._boundOnKey, true);
      this._emit('open');
    } catch(e) { console.warn('Modal.open error', e); }
  }

  close() {
    try {
  if (this.overlay) {
    this.overlay.classList.remove('show');
    try {
      // restore overlay to its original place in the DOM if we moved it
      if (this._overlayMoved && this._overlayOriginalParent) {
        if (this._overlayOriginalNextSibling && this._overlayOriginalNextSibling.parentNode === this._overlayOriginalParent) {
          this._overlayOriginalParent.insertBefore(this.overlay, this._overlayOriginalNextSibling);
        } else {
          this._overlayOriginalParent.appendChild(this.overlay);
        }
        this._overlayMoved = false;
      }
      // remove any inline styles we set
      this.overlay.style.position = '';
      this.overlay.style.inset = '';
      this.overlay.style.width = '';
      this.overlay.style.height = '';
      this.overlay.style.zIndex = '';
    } catch (err) { /* non-fatal */ }
  }
  this.root.classList.remove('show');
    try {
      // Restore root inline styles that were present before opening
      if (this._rootOriginalStyle) {
        this.root.style.position = this._rootOriginalStyle.position || '';
        this.root.style.inset = this._rootOriginalStyle.inset || '';
        this.root.style.left = this._rootOriginalStyle.left || '';
        this.root.style.top = this._rootOriginalStyle.top || '';
        this.root.style.transform = this._rootOriginalStyle.transform || '';
      }
    } catch (err) {}
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

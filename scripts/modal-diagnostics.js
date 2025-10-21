// Enhanced diagnostic helper: logs when modals open, prints computed styles for account modal
// and records timestamp + truncated stack to help identify the caller.
(function(){
  if (typeof document === 'undefined') return;
  function now() { try { return new Date().toISOString(); } catch(e) { return String(Date.now()); } }
  function getStack() {
    try {
      const err = new Error();
      const stack = (err.stack || '').split('\n').slice(2, 8).map(s => s.trim()).join('\n');
      return stack || '<no-stack>';
    } catch(e) { return '<stack-unavailable>'; }
  }
  function inspectAccount() {
    try {
      const modal = document.getElementById('accountModal');
      if (!modal) return;
      const dlg = modal.querySelector('.modal-content');
      if (!dlg) return;
      const cs = window.getComputedStyle(dlg);
      console.groupCollapsed('[modal-diagnostics] accountModal shown @ ' + now());
      console.log('Computed style for account modal content:', {
        position: cs.position,
        top: cs.top,
        left: cs.left,
        transform: cs.transform,
        margin: cs.margin,
        display: cs.display
      });
      console.log('Bounding rect:', dlg.getBoundingClientRect());
      console.groupEnd();
    } catch(e){ console.warn('[modal-diagnostics] inspect error', e); }
  }

  const obs = new MutationObserver(mutations => {
    for (const m of mutations) {
      try {
        if (m.type === 'attributes' && m.attributeName === 'class' && m.target.classList && m.target.classList.contains('modal')) {
          const el = m.target;
          const isShown = el.classList.contains('show');
          console.log(`[modal-diagnostics] ${now()} modal ${el.id || el.className} show=${isShown} (mutation)`);
          if (el.id === 'accountModal' && isShown) inspectAccount();
        }
      } catch(e) { /* ignore */ }
    }
  });
  document.querySelectorAll('.modal').forEach(modal => obs.observe(modal, { attributes: true, attributeFilter: ['class'] }));

  // Wrap global showModalById to capture caller stack
  try {
    const orig = window.showModalById;
    if (typeof orig === 'function') {
      window.showModalById = function(id, opts){
        try {
          console.groupCollapsed('[modal-diagnostics] showModalById called @ ' + now());
          console.log('id:', id, 'opts:', opts);
          console.log('call stack:\n' + getStack());
          console.groupEnd();
        } catch(e){}
        const ret = orig.call(this, id, opts);
        // Schedule a small inspect pass for account modal
        setTimeout(()=>{ if (id === 'accountModal') inspectAccount(); }, 80);
        return ret;
      };
    }
  } catch(e){ console.warn('[modal-diagnostics] wrapper install failed', e); }
})();

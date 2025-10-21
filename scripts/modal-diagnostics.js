// Temporary diagnostic helper: logs when modals open and prints computed styles for account modal
(function(){
  if (typeof document === 'undefined') return;
  function inspectAccount() {
    try {
      const modal = document.getElementById('accountModal');
      if (!modal) return;
      const dlg = modal.querySelector('.modal-content');
      if (!dlg) return;
      const cs = window.getComputedStyle(dlg);
      console.groupCollapsed('[modal-diagnostics] accountModal shown');
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
      if (m.type === 'attributes' && m.attributeName === 'class' && m.target.classList.contains('modal')) {
        const el = m.target;
        const isShown = el.classList.contains('show');
        console.log('[modal-diagnostics] modal', el.id || el.className, 'show=', isShown);
        if (el.id === 'accountModal' && isShown) inspectAccount();
      }
    }
  });
  document.querySelectorAll('.modal').forEach(modal => obs.observe(modal, { attributes: true, attributeFilter: ['class'] }));
  // Also listen to global showModalById if available
  try {
    const orig = window.showModalById;
    if (typeof orig === 'function') {
      window.showModalById = function(id, opts){
        console.log('[modal-diagnostics] showModalById called for', id, opts);
        const ret = orig.call(this, id, opts);
        setTimeout(()=>{ if (id === 'accountModal') inspectAccount(); }, 80);
        return ret;
      };
    }
  } catch(e){}
})();

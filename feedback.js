// Minimal feedback widget
(function(){
  if (typeof document === 'undefined') return;

  const openBtn = document.getElementById('floatingFeedbackBtn');
  const modal = document.getElementById('feedbackModal');
  const overlay = document.getElementById('feedbackModalOverlay');
  const closeBtn = document.getElementById('closeFeedback');
  const cancelBtn = document.getElementById('cancelFeedback');
  const sendBtn = document.getElementById('sendFeedback');
  const textarea = document.getElementById('feedbackText');
  const status = document.getElementById('feedbackStatus');

  function showModal() {
    if (!modal) return;
    // Prefer centralized helper when available
    if (typeof window !== 'undefined' && typeof window.showModalById === 'function') {
      try { window.showModalById('feedbackModal'); } catch(e){}
      try { textarea && textarea.focus(); } catch(e){}
      return;
    }
  // Legacy fallback: keep behavior but ensure overlay, centering and important display
  try { modal.style.setProperty('display','flex','important'); } catch(e){}
  if (overlay) try { overlay.classList.add('show'); overlay.classList.add('visible'); overlay.style.setProperty('display','block','important'); } catch(e){}
  try { modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); } catch(e){}
  try { document.body.classList.add('modal-open'); } catch(e){}
    try { textarea && textarea.focus(); } catch(e){}
  }
  function hideModal() {
    if (!modal) return;
    if (typeof window !== 'undefined' && typeof window.hideModalById === 'function') {
      try { window.hideModalById('feedbackModal'); } catch(e){}
      if (status) { status.style.display = 'none'; status.textContent = ''; }
      return;
    }
  // Legacy fallback: ensure consistent hide (use important to override competing styles)
  try { modal.style.setProperty('display','none','important'); } catch(e){}
  if (overlay) try { overlay.classList.remove('show'); overlay.classList.remove('visible'); overlay.style.setProperty('display','none','important'); } catch(e){}
  try { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } catch(e){}
  try { document.body.classList.remove('modal-open'); } catch(e){}
    if (status) { status.style.display = 'none'; status.textContent = ''; }
  }

  async function sendFeedback() {
    if (!textarea) return;
    const text = textarea.value && textarea.value.trim();
    if (!text) {
      showStatus('Veuillez saisir un message.', 'error');
      return;
    }
    sendBtn.disabled = true;
    showStatus('Envoi en cours...', 'info');

    const payload = {
      message: text,
      url: location.href,
      ts: new Date().toISOString(),
      userEmail: localStorage.getItem('authEmail') || null
    };

    try {
      // Try server endpoint first
      const base = (typeof AUTH_API_BASE !== 'undefined' && AUTH_API_BASE) ? AUTH_API_BASE : (window.remoteBase || '');
      if (base) {
        const resp = await fetch(base + '/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          showStatus('Merci ! Votre message a bien été envoyé.', 'success');
          textarea.value = '';
          setTimeout(hideModal, 900);
          return;
        }
      }
    } catch (e) {
      console.warn('Feedback submit failed (server):', e);
    }

    // Fallback: store locally
    try {
      const pending = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
      pending.push(payload);
      localStorage.setItem('pendingFeedback', JSON.stringify(pending));
      showStatus('Pas de serveur détecté — feedback sauvegardé localement.', 'warning');
      textarea.value = '';
      setTimeout(hideModal, 900);
    } catch (e) {
      console.error('Failed to store feedback locally', e);
      showStatus('Erreur lors de la sauvegarde du feedback.', 'error');
    } finally {
      sendBtn.disabled = false;
    }
  }

  function showStatus(msg, type) {
    if (!status) return;
    status.style.display = 'block';
    status.textContent = msg;
    status.className = 'feedback-status ' + (type || 'info');
  }

  // Wire events
  try {
    if (openBtn) openBtn.addEventListener('click', showModal);
    if (closeBtn) closeBtn.addEventListener('click', hideModal);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
    if (overlay) overlay.addEventListener('click', hideModal);
    if (sendBtn) sendBtn.addEventListener('click', sendFeedback);
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') hideModal(); });
  } catch (e) { console.warn('Feedback widget init failed', e); }
})();

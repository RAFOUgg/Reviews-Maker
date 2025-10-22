/* QuickEntry Compat - attach quick-entry UI to inputs/elements with data-quickentry
   It exposes window.QuickEntry.insert(tag) to insert tokens into the focused input.
*/
(function(){
  if (window.QuickEntry) return;
  const QuickEntry = {
    active: null,
    init() {
      document.addEventListener('focusin', (e) => {
        const target = e.target;
        if (!target) return;
        if (target.matches && target.matches('[data-quickentry]')) {
          this.active = target;
        }
      });
    },
    insert(text) {
      try {
        const t = this.active || document.activeElement;
        if (!t) return false;
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) {
          // Insert at cursor position for input/textarea
          if (t.selectionStart != null) {
            const start = t.selectionStart, end = t.selectionEnd;
            const v = t.value || '';
            const nv = v.slice(0, start) + text + v.slice(end);
            t.value = nv;
            t.selectionStart = t.selectionEnd = start + text.length;
            t.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
          // fallback append
          t.value = (t.value || '') + text;
          t.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        } else if (t.isContentEditable) {
          document.execCommand('insertText', false, text);
          return true;
        }
        return false;
      } catch(e) { return false; }
    }
  };
  window.QuickEntry = QuickEntry;
  try { QuickEntry.init(); } catch(e){}
})();

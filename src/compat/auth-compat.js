/* Auth Compat - lightweight client-side account management
   Exposes window.Auth with basic methods and localStorage persistence.
   Integrates lightly with existing app.js: calls window.renderAccountView() when needed.
*/
(function(){
  if (window.Auth) return;
  const STORAGE_TOKEN = 'authToken';
  const STORAGE_EMAIL = 'authEmail';
  const PREF_PREFIX = 'rm_user_prefs:';

  function getStored() {
    return {
      token: localStorage.getItem(STORAGE_TOKEN) || null,
      email: localStorage.getItem(STORAGE_EMAIL) || null
    };
  }

  function saveStored(token, email) {
    if (token) localStorage.setItem(STORAGE_TOKEN, token); else localStorage.removeItem(STORAGE_TOKEN);
    if (email) localStorage.setItem(STORAGE_EMAIL, email); else localStorage.removeItem(STORAGE_EMAIL);
  }

  function prefsKey(email) { return PREF_PREFIX + (email || '').toLowerCase(); }

  function loadPreferences(email) {
    try {
      const v = localStorage.getItem(prefsKey(email));
      return v ? JSON.parse(v) : {};
    } catch(e){ return {}; }
  }

  function savePreferences(email, prefs) {
    try { localStorage.setItem(prefsKey(email), JSON.stringify(prefs || {})); return true; } catch(e){ return false; }
  }

  const Auth = {
    user: null,
    init() {
      const s = getStored();
      if (s.email) this.user = { email: s.email, token: s.token, prefs: loadPreferences(s.email) };
      else this.user = null;
      // If app exposes renderAccountView, call to update UI
      try { if (typeof renderAccountView === 'function') renderAccountView().catch(()=>{}); } catch(e){}
      return this.user;
    },
    login(email, token) {
      if (!email) return false;
      saveStored(token || '', email);
      this.user = { email, token: token || null, prefs: loadPreferences(email) };
      try { if (typeof renderAccountView === 'function') renderAccountView().catch(()=>{}); } catch(e){}
      return true;
    },
    logout() {
      saveStored('', '');
      this.user = null;
      try { if (typeof updateAuthUI === 'function') updateAuthUI(); } catch(e){}
      try { if (typeof renderAccountView === 'function') renderAccountView().catch(()=>{}); } catch(e){}
    },
    isLogged() { return !!(this.user && this.user.email); },
    getUser() { return this.user; },
    getPref(key, fallback) { try { if (!this.user) return fallback; return (this.user.prefs||{})[key] ?? fallback; } catch(e){ return fallback; } },
    setPref(key, value) {
      try {
        if (!this.user) return false;
        this.user.prefs = this.user.prefs || {};
        this.user.prefs[key] = value;
        savePreferences(this.user.email, this.user.prefs);
        return true;
      } catch(e){ return false; }
    },
    loadPrefs() {
      if (!this.user) return {};
      this.user.prefs = loadPreferences(this.user.email);
      return this.user.prefs;
    }
  };

  window.Auth = Auth;
  // auto-init
  try { Auth.init(); } catch(e){}
})();

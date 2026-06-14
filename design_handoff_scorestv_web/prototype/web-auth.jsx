/* ScoresTV WEB — Giriş / Kayıt modalı (Next.js'e uygun: <AuthModal/> + provider butonları) */

function GoogleMark({ s = 19 }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
function AppleMark({ s = 19 }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.6-.8.8-1.7 1.1-2.5-2.4-.9-2.5-3.5-2.5-3.5zM14.2 5.6c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.7 1 .1 2-.5 2.6-1.2z"/>
    </svg>
  );
}
function EyeIcon({ off, s = 18 }) {
  return off
    ? <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.4 5.2A9.3 9.3 0 0112 5c5 0 9 4.5 9 7-.4 1-1.2 2.2-2.4 3.3M6.1 6.2C3.8 7.6 2.4 9.7 2 11c.7 1.8 4 6 10 6 .9 0 1.8-.1 2.6-.3"/></svg>
    : <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
}

const AUTH_STR = {
  tr: {
    welcome: 'ScoresTV’ye hoş geldin', subtitle: 'Favori takımlarını takip et, gol bildirimlerini kaçırma.',
    tabIn: 'Giriş Yap', tabUp: 'Kayıt Ol',
    google: 'Google ile devam et', apple: 'Apple ile devam et',
    or: 'veya e-posta ile', name: 'Ad Soyad', email: 'E-posta', pass: 'Şifre', passAgain: 'Şifre (tekrar)',
    forgot: 'Şifremi unuttum', remember: 'Beni hatırla',
    doIn: 'Giriş Yap', doUp: 'Hesap Oluştur',
    noAcc: 'Hesabın yok mu?', hasAcc: 'Zaten üye misin?', switchUp: 'Kayıt ol', switchIn: 'Giriş yap',
    terms: 'Kayıt olarak Kullanım Şartları ve Gizlilik Politikası’nı kabul edersin.',
    placeName: 'Adın', placeEmail: 'ornek@eposta.com', placePass: '••••••••',
    loading: 'Yönlendiriliyor…', success: 'Giriş başarılı',
  },
  en: {
    welcome: 'Welcome to ScoresTV', subtitle: 'Follow your favorite teams, never miss a goal alert.',
    tabIn: 'Sign in', tabUp: 'Sign up',
    google: 'Continue with Google', apple: 'Continue with Apple',
    or: 'or with email', name: 'Full name', email: 'Email', pass: 'Password', passAgain: 'Confirm password',
    forgot: 'Forgot password', remember: 'Remember me',
    doIn: 'Sign in', doUp: 'Create account',
    noAcc: 'No account yet?', hasAcc: 'Already a member?', switchUp: 'Sign up', switchIn: 'Sign in',
    terms: 'By signing up you agree to the Terms of Use and Privacy Policy.',
    placeName: 'Your name', placeEmail: 'you@email.com', placePass: '••••••••',
    loading: 'Redirecting…', success: 'Signed in',
  },
};

function AuthModal({ open, mode, setMode, onClose, onAuth, lang }) {
  const a = AUTH_STR[lang] || AUTH_STR.tr;
  const [showPass, setShowPass] = React.useState(false);
  const [busy, setBusy] = React.useState(null); // 'google' | 'apple' | 'email'
  const isUp = mode === 'signup';

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  React.useEffect(() => { if (!open) { setBusy(null); setShowPass(false); } }, [open]);

  if (!open) return null;

  const finish = (provider, name) => {
    setBusy(provider);
    setTimeout(() => { onAuth({ name: name || (isUp ? 'Yeni Üye' : 'Mauro'), provider, email: 'uye@scorestv.app' }); }, 850);
  };

  return (
    <div className="auth-overlay" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="auth-close" onClick={onClose} aria-label="Kapat"><I.close s={18} /></button>

        <div className="auth-head">
          <div className="auth-logo"><Logo h={26} /></div>
          <h2>{a.welcome}</h2>
          <p>{a.subtitle}</p>
        </div>

        <div className="auth-tabs">
          <button className={!isUp ? 'on' : ''} onClick={() => setMode('signin')}>{a.tabIn}</button>
          <button className={isUp ? 'on' : ''} onClick={() => setMode('signup')}>{a.tabUp}</button>
          <span className="auth-tab-ind" style={{ transform: isUp ? 'translateX(100%)' : 'translateX(0)' }} />
        </div>

        <div className="auth-body">
          <button className="prov-btn google" disabled={!!busy} onClick={() => finish('google')}>
            {busy === 'google' ? <span className="spin" /> : <GoogleMark s={19} />}
            <span>{busy === 'google' ? a.loading : a.google}</span>
          </button>
          <button className="prov-btn apple" disabled={!!busy} onClick={() => finish('apple')}>
            {busy === 'apple' ? <span className="spin" /> : <AppleMark s={19} />}
            <span>{busy === 'apple' ? a.loading : a.apple}</span>
          </button>

          <div className="auth-divider"><span>{a.or}</span></div>

          <form className="auth-form" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); finish('email', fd.get('name')); }}>
            {isUp && (
              <label className="auth-field">
                <span className="af-label">{a.name}</span>
                <div className="af-input"><span className="af-ic"><I.user s={17} /></span><input name="name" type="text" placeholder={a.placeName} autoComplete="name" required /></div>
              </label>
            )}
            <label className="auth-field">
              <span className="af-label">{a.email}</span>
              <div className="af-input"><span className="af-ic"><MailIcon /></span><input name="email" type="email" placeholder={a.placeEmail} autoComplete="email" required /></div>
            </label>
            <label className="auth-field">
              <span className="af-label">{a.pass}</span>
              <div className="af-input">
                <span className="af-ic"><LockIcon /></span>
                <input name="pass" type={showPass ? 'text' : 'password'} placeholder={a.placePass} autoComplete={isUp ? 'new-password' : 'current-password'} required />
                <button type="button" className="af-eye" onClick={() => setShowPass(s => !s)} tabIndex={-1}><EyeIcon off={!showPass} /></button>
              </div>
            </label>
            {isUp && (
              <label className="auth-field">
                <span className="af-label">{a.passAgain}</span>
                <div className="af-input"><span className="af-ic"><LockIcon /></span><input name="pass2" type={showPass ? 'text' : 'password'} placeholder={a.placePass} required /></div>
              </label>
            )}

            {!isUp && (
              <div className="auth-row">
                <label className="auth-check"><input type="checkbox" defaultChecked /> <span>{a.remember}</span></label>
                <button type="button" className="auth-link">{a.forgot}</button>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={!!busy}>
              {busy === 'email' ? <span className="spin dark" /> : null}
              {busy === 'email' ? a.loading : (isUp ? a.doUp : a.doIn)}
            </button>
          </form>

          {isUp && <p className="auth-terms">{a.terms}</p>}

          <div className="auth-switch">
            {isUp ? a.hasAcc : a.noAcc}{' '}
            <button onClick={() => setMode(isUp ? 'signin' : 'signup')}>{isUp ? a.switchIn : a.switchUp}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailIcon({ s = 17 }) { return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>; }
function LockIcon({ s = 17 }) { return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/></svg>; }

/* giriş yapılmış kullanıcı menüsü (header) */
function UserMenu({ user, onLogout, lang }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const initial = (user.name || 'U').trim().charAt(0).toUpperCase();
  return (
    <div className="user-menu" ref={ref}>
      <button className="user-pill" onClick={() => setOpen(o => !o)}>
        <span className="user-av">{initial}</span>
        <span className="user-nm">{user.name}</span>
        <I.chevD s={15} />
      </button>
      {open && (
        <div className="user-drop">
          <div className="ud-head"><span className="user-av big">{initial}</span><div><b>{user.name}</b><span>{user.email}</span></div></div>
          <button className="ud-item"><I.star s={16} /> {lang === 'tr' ? 'Favorilerim' : 'My Favorites'}</button>
          <button className="ud-item"><I.bell s={16} /> {lang === 'tr' ? 'Bildirimler' : 'Notifications'}</button>
          <button className="ud-item"><I.user s={16} /> {lang === 'tr' ? 'Hesap Ayarları' : 'Account'}</button>
          <button className="ud-item danger" onClick={() => { setOpen(false); onLogout(); }}><LogoutIcon /> {lang === 'tr' ? 'Çıkış Yap' : 'Sign out'}</button>
        </div>
      )}
    </div>
  );
}
function LogoutIcon({ s = 16 }) { return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 12H4M8 8l-4 4 4 4"/><path d="M11 4h7a1 1 0 011 1v14a1 1 0 01-1 1h-7"/></svg>; }

Object.assign(window, { AuthModal, UserMenu, GoogleMark, AppleMark });

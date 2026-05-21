// src/lib/styles.js — Feuille de style globale
//
// ARCHITECTURE :
//   1. Reset + variables CSS (thème clair Apple-style)
//   2. SAFE AREAS iOS — gérées via une variable --safe-top calculée une fois,
//      utilisée par la nav fixe + les pages plein écran (admin, login...).
//   3. Composants : fields, buttons, nav, modal, calendrier, sponsors, etc.
//   4. Responsive mobile + animations.
//
// NOTE : on importe Inter depuis Google Fonts via @import. C'est volontaire pour
// éviter d'ajouter un <link> dans index.html (le pré-style critique y est déjà).
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  /* THÈME CLAIR APPLE-STYLE */
  --bg:#fbfbfd;--s1:#ffffff;--s2:#f5f5f7;--s3:#f5f5f7;--s4:#ffffff;
  --b1:rgba(0,0,0,0.06);--b2:rgba(0,0,0,0.1);--b3:rgba(0,0,0,0.15);
  --t1:#1d1d1f;--t2:#424245;--t3:#6e6e73;--t4:#86868b;
  --blue:#0066cc;--blue2:#0071e3;--green:#30a653;--red:#e30000;--yellow:#f59e0b;
  --re-b:#2563eb;--re-y:#fbbf24;--re-r:#dc2626;
  --ease:cubic-bezier(0.28,0.11,0.32,1);

  /* SAFE AREAS iOS — calculées une fois, propagées partout */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);

  /* Hauteur nominale de la navbar */
  --nav-h: 48px;
}

html,body{
  background:var(--bg);
  font-family:'SF Pro Display','SF Pro Text','Inter',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  color:var(--t1);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  line-height:1.2;
  /* iOS PWA standalone : empêche le scroll élastique au-dessus du header */
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}
html{height:-webkit-fill-available;}
body{
  min-height:100vh;
  min-height:100dvh; /* dynamic viewport — pas affecté par la barre Safari */
}

::-webkit-scrollbar{width:0;}

/* ========== FORM ========== */
.field{
  width:100%;background:#ffffff;border:1px solid #d2d2d7;border-radius:12px;
  padding:13px 16px;color:var(--t1);font-family:inherit;font-size:16px;
  /* ↑ 16px : empêche le zoom auto iOS sur focus */
  outline:none;transition:all 0.2s;-webkit-appearance:none;appearance:none;
}
.field:focus{border-color:var(--blue);box-shadow:0 0 0 4px rgba(0,102,204,0.15);}
.field::placeholder{color:var(--t4);}
.lbl{display:block;font-size:11px;font-weight:600;color:var(--t3);margin-bottom:7px;letter-spacing:0.8px;text-transform:uppercase;}

/* ========== BUTTONS ========== */
.btn{
  border:none;border-radius:980px;padding:11px 22px;
  font-family:inherit;font-size:14px;font-weight:400;cursor:pointer;
  transition:all 0.18s var(--ease);white-space:nowrap;letter-spacing:-0.01em;
  /* iOS : zone tactile minimum 44px sur les boutons importants — géré via .btn-lg */
  -webkit-touch-callout:none;user-select:none;
}
.btn-w{background:var(--blue);color:white;}.btn-w:hover{background:#0056b3;}
.btn-w:disabled{background:#9ec3ed;cursor:not-allowed;}
.btn-ghost{background:rgba(0,0,0,0.04);color:var(--t1);border:none;}.btn-ghost:hover{background:rgba(0,0,0,0.08);}
.btn-ghost:disabled{opacity:0.5;cursor:not-allowed;}
.btn-sm{padding:7px 16px;font-size:12px;}
.btn-lg{padding:14px 32px;font-size:16px;font-weight:500;min-height:48px;}

.tag{display:inline-flex;align-items:center;background:rgba(0,0,0,0.05);color:var(--t2);border-radius:980px;padding:3px 11px;font-size:11px;font-weight:500;letter-spacing:-0.005em;}
.tag-b{background:rgba(0,102,204,0.1);color:var(--blue);}
.tag-g{background:rgba(48,166,83,0.12);color:var(--green);}
.tag-y{background:rgba(245,158,11,0.14);color:#b45309;}

.err-box{background:#fff3f3;border:1px solid #ffcdd2;border-radius:10px;padding:10px 14px;font-size:13px;color:#c62828;margin-bottom:16px;}
.info-box{background:rgba(0,102,204,0.06);border-left:3px solid var(--blue);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--blue);margin-bottom:16px;}
.warn-box{background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:16px;margin-bottom:16px;}

/* ========== NAVBAR — SAFE-AREA AWARE ==========
   Le bloc nav est positionné en haut MAIS sa hauteur intègre safe-area-inset-top.
   On utilise padding-top = safe-area pour que le contenu (logo+tabs) reste bien sous l'encoche. */
.nav{
  position:fixed;
  top:0;left:0;right:0;
  z-index:200;
  /* Hauteur = safe-area + nav-h ; padding-top pousse le contenu sous l'encoche */
  height: calc(var(--nav-h) + var(--safe-top));
  padding-top: var(--safe-top);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
  background:rgba(251,251,253,0.88);
  backdrop-filter:saturate(180%) blur(20px);
  -webkit-backdrop-filter:saturate(180%) blur(20px);
  border-bottom:1px solid rgba(0,0,0,0.06);
}
.nav-in{
  max-width:1024px;margin:0 auto;
  height: var(--nav-h);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 22px;gap:12px;
}
.nav-tabs{display:flex;gap:0;}
.nav-tab{background:none;border:none;color:var(--t3);font-family:inherit;font-size:12px;font-weight:400;cursor:pointer;padding:5px 12px;border-radius:0;transition:color 0.2s;white-space:nowrap;letter-spacing:-0.01em;}
.nav-tab:hover{color:var(--t1);}
.nav-tab.on{color:var(--t1);font-weight:500;}
@media(max-width:600px){
  .nav-in{padding:0 14px;gap:6px;}
  .nav-tab{padding:5px 8px;font-size:11px;}
  .nl{display:none;}
}
.nav-link{background:none;border:none;color:var(--t3);font-size:12px;font-weight:500;cursor:pointer;padding:5px 11px;border-radius:7px;font-family:inherit;letter-spacing:-0.1px;transition:color 0.15s;}
.nav-link:hover{color:var(--t1);}
.nav-link-admin{background:rgba(0,0,0,0.04);border:none;color:var(--t2);font-size:12px;font-weight:500;cursor:pointer;padding:6px 14px;border-radius:980px;font-family:inherit;letter-spacing:-0.1px;transition:all 0.15s;}
.nav-link-admin:hover{background:rgba(0,0,0,0.08);color:var(--t1);}

/* PAGE : décalée pour passer sous la nav fixe (nav-h + safe-area) */
.page{
  padding-top: calc(var(--nav-h) + var(--safe-top));
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
  min-height:100vh;
  min-height:100dvh;
}

/* ========== OVERLAY / MODAL ========== */
.overlay{
  position:fixed;inset:0;
  background:rgba(0,0,0,0.45);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  z-index:500;
  display:flex;align-items:center;justify-content:center;
  padding: calc(16px + var(--safe-top)) calc(16px + var(--safe-right)) calc(16px + var(--safe-bottom)) calc(16px + var(--safe-left));
  animation:fi 0.18s ease;
}
.modal{
  background:#ffffff;border:none;border-radius:18px;padding:32px;
  width:100%;max-width:480px;
  max-height: calc(100vh - 32px - var(--safe-top) - var(--safe-bottom));
  max-height: calc(100dvh - 32px - var(--safe-top) - var(--safe-bottom));
  overflow-y:auto;animation:su 0.28s var(--ease);
  box-shadow:0 30px 60px rgba(0,0,0,0.2);
  -webkit-overflow-scrolling: touch;
}
@media(max-width:600px){.modal{padding:24px 20px;border-radius:18px;max-width:100%;}}

/* ========== CALENDRIER ========== */
.cal-wrap{background:#ffffff;border:none;border-radius:18px;overflow:hidden;margin-bottom:24px;padding:24px 16px 18px;}
.cal-hdr{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:0 6px 16px;}
.cal-title{font-size:15px;font-weight:600;letter-spacing:-0.3px;text-align:center;color:var(--t1);font-variant-numeric:tabular-nums;flex:1;}
.cal-nav{background:rgba(0,0,0,0.04);border:none;color:var(--t1);font-size:18px;cursor:pointer;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background 0.15s;font-family:inherit;line-height:1;}
.cal-nav:hover{background:rgba(0,0,0,0.08);}
.cal-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
.cal-dn{text-align:center;padding:6px 0;font-size:11px;font-weight:600;color:var(--t4);letter-spacing:0.5px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cal-cell{aspect-ratio:1/1;padding:0;cursor:pointer;transition:background 0.15s;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:7px;border-radius:8px;border:none;position:relative;background:transparent;}
.cal-cell:hover{background:#f5f5f7;}
.cal-cell.sel{background:var(--blue);color:white;}
.cal-num{font-size:14px;color:var(--t1);width:auto;height:auto;display:flex;align-items:center;justify-content:center;border-radius:0;font-weight:400;font-variant-numeric:tabular-nums;line-height:1;}
.cal-num.td{background:transparent;color:var(--blue);font-weight:600;}
.cal-cell.sel .cal-num{color:white;}
.cal-cell.sel .cal-num.td{color:white;}
.cal-dot{width:4px;height:4px;border-radius:50%;background:var(--blue);display:inline-block;margin:0 1px;}
.cal-cell.sel .cal-dot{background:white;}
@media(max-width:600px){.cal-num{font-size:13px;}.cal-dn{font-size:10px;}.cal-wrap{padding:18px 10px 14px;}}

/* ========== TOURNOI CARDS — style Apple ========== */
.t-card{background:#f5f5f7;border:none;border-radius:18px;overflow:hidden;cursor:pointer;transition:all 0.4s var(--ease);position:relative;}
.t-card:hover{transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,0.08);}
.t-card-cover{width:100%;height:160px;background:linear-gradient(180deg,#e5e7eb,#d1d5db);display:flex;align-items:center;justify-content:center;font-size:64px;object-fit:cover;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.08));}
.t-card-body{padding:22px 22px 24px;}
.t-card-name{font-size:20px;font-weight:600;letter-spacing:-0.3px;margin-bottom:8px;line-height:1.15;color:var(--t1);}
.t-card-meta{display:flex;flex-direction:column;gap:5px;}
.t-meta-row{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--t2);}
.t-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;animation:fadeSlide 0.3s var(--ease);}
@media(max-width:600px){.t-cards-grid{grid-template-columns:1fr;}}

/* ========== MAP ========== */
.map-wrap{position:relative;width:100%;height:420px;border-radius:16px;overflow:hidden;border:1px solid var(--b1);box-shadow:0 1px 0 rgba(0,0,0,0.04),0 8px 22px rgba(0,0,0,0.06);background:#e5e7eb;}
@media (max-width:600px){.map-wrap{height:340px;}}
.leaflet-container{font-family:inherit !important;}
.leaflet-popup-content-wrapper{border-radius:10px !important;}
.leaflet-popup-content{margin:10px 12px !important;line-height:1.5;}

/* ========== INTRO / LOGIN ========== */
.intro-page{
  min-height:100vh;
  min-height:100dvh;
  background:var(--bg);
  display:flex;align-items:center;justify-content:center;
  padding: calc(20px + var(--safe-top)) calc(20px + var(--safe-right)) calc(20px + var(--safe-bottom)) calc(20px + var(--safe-left));
  overflow:hidden;position:relative;
}
.intro-card{background:#ffffff;border:none;border-radius:20px;padding:40px 32px;width:100%;max-width:400px;position:relative;box-shadow:0 1px 0 rgba(0,0,0,0.04),0 20px 40px rgba(0,0,0,0.06);}
@media(max-width:480px){.intro-card{padding:32px 24px;border-radius:18px;}}

/* ========== ADMIN ========== */
.adm-page{
  min-height:100vh;
  min-height:100dvh;
  background:var(--bg);
  padding-top: calc(var(--nav-h) + var(--safe-top));
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}
.adm-tab{background:none;border:none;border-bottom:2px solid transparent;padding:13px 16px;font-size:13px;font-weight:500;color:var(--t3);cursor:pointer;font-family:inherit;transition:all 0.15s;}
.adm-tab.on{border-bottom-color:var(--blue);color:var(--t1);}
.adm-badge{background:rgba(0,0,0,0.06);color:var(--t3);border-radius:980px;padding:1px 8px;font-size:10px;margin-left:4px;font-weight:500;}
.adm-badge.on{background:var(--blue);color:white;}
.adm-wrap{max-width:880px;margin:0 auto;padding:28px 22px;}
@media(max-width:600px){.adm-wrap{padding:20px 14px;}}

.sp-slot{background:#ffffff;border:none;border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:0 1px 0 rgba(0,0,0,0.04);}
.sp-prev{width:68px;height:68px;border-radius:12px;background:#f5f5f7;border:none;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;}
.sp-prev img{width:100%;height:100%;object-fit:cover;}

.upzone{display:flex;flex-direction:column;align-items:center;gap:5px;background:#f5f5f7;border:1.5px dashed #c7c7cc;border-radius:12px;padding:16px;cursor:pointer;transition:all 0.18s;text-align:center;}
.upzone:hover{border-color:var(--blue);background:rgba(0,102,204,0.04);}

.tbl-head{display:grid;grid-template-columns:1fr 2fr 1fr 1.5fr;background:#f5f5f7;padding:10px 18px;border-radius:14px 14px 0 0;border-bottom:none;font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:0.5px;}
.tbl-row{display:grid;grid-template-columns:1fr 2fr 1fr 1.5fr;padding:14px 18px;border-bottom:1px solid var(--b1);transition:background 0.1s;background:#ffffff;}
.tbl-row:last-child{border-bottom:none;border-radius:0 0 14px 14px;}
.tbl-row:hover{background:#f9f9fb;}
@media(max-width:640px){.tbl-head,.tbl-row{grid-template-columns:1fr 2fr 1.2fr;}.hc{display:none;}}

/* ========== FORM GRID ========== */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
@media(max-width:520px){.form-grid{grid-template-columns:1fr;}}

/* ========== ADD HERE BUTTON ========== */
.add-here-btn{display:flex;align-items:center;gap:10px;width:100%;background:rgba(0,102,204,0.06);border:1.5px dashed rgba(0,102,204,0.3);border-radius:14px;padding:14px 18px;cursor:pointer;transition:all 0.18s;font-family:inherit;}
.add-here-btn:hover{background:rgba(0,102,204,0.1);border-color:rgba(0,102,204,0.5);}

/* ========== ADMIN BUTTONS ========== */
.btn-reject{background:rgba(227,0,0,0.07);border:none;color:var(--red);border-radius:980px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.15s;}
.btn-reject:hover{background:rgba(227,0,0,0.13);}
.btn-approve{background:var(--green);border:none;border-radius:980px;padding:8px 18px;font-size:13px;font-weight:600;color:white;cursor:pointer;font-family:inherit;}
.btn-approve:hover{filter:brightness(1.05);}

/* ========== PARTENAIRES PAGE ========== */
.part-page{
  min-height:100vh;
  min-height:100dvh;
  background:var(--bg);
  padding-top: calc(var(--nav-h) + var(--safe-top));
  padding-bottom: var(--safe-bottom);
}
.part-hero{text-align:center;padding:60px 24px 40px;position:relative;}
.part-hero::before{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(0,102,204,0.06) 0%,transparent 70%);pointer-events:none;}

/* Bande tricolore (drapeau Réunion) — placée SOUS la nav (donc sous le safe-area) */
.strip{height:3px;background:linear-gradient(90deg,var(--re-b) 0% 33%,var(--re-y) 33% 66%,var(--re-r) 66% 100%);opacity:1;}

/* ========== ROLE CARDS ========== */
.role-card{background:#f5f5f7;border:none;border-radius:16px;padding:20px;cursor:pointer;transition:all 0.2s var(--ease);display:flex;align-items:center;gap:14px;}
.role-card:hover{background:#ececef;transform:translateY(-2px);}

/* ========== HERO Apple ========== */
.hero-title{font-size:clamp(34px,6vw,64px);line-height:1.05;letter-spacing:-0.015em;font-weight:600;color:var(--t1);}
.hero-sub{font-size:clamp(17px,2vw,21px);line-height:1.2;letter-spacing:0.004em;font-weight:400;color:var(--t3);margin-top:8px;}
.section-title{font-size:clamp(28px,4.5vw,44px);line-height:1.08;letter-spacing:-0.005em;font-weight:600;}
.link{color:var(--blue);text-decoration:none;font-size:17px;line-height:1.23;letter-spacing:-0.022em;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:3px;transition:color 0.2s;background:none;border:none;font-family:inherit;}
.link:hover{text-decoration:underline;}
.link::after{content:'›';font-size:1.2em;transition:transform 0.2s;}
.link:hover::after{transform:translateX(2px);}
.link-sm{font-size:14px;}

/* ========== CLOSE BUTTON ========== */
.close-btn{background:rgba(0,0,0,0.05);border:none;color:var(--t1);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;line-height:1;transition:background 0.15s;font-family:inherit;}
.close-btn:hover{background:rgba(0,0,0,0.1);}

/* ========== ANIMATIONS ========== */
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{opacity:0;transform:translateY(18px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes splLogo{0%{opacity:0;transform:scale(0.82)}100%{opacity:1;transform:scale(1)}}
@keyframes splTxt{0%{opacity:0;transform:translateY(7px)}100%{opacity:1;transform:translateY(0)}}
@keyframes splDot{0%,80%,100%{transform:scale(0.4);opacity:0.25}40%{transform:scale(1);opacity:1}}
@keyframes splFlare{0%{transform:translateX(-120%) skewX(-14deg);opacity:0}20%{opacity:0.55}70%{transform:translateX(320%) skewX(-14deg);opacity:0.55}100%{opacity:0}}
@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(48,166,83,0.3)}50%{box-shadow:0 0 0 5px rgba(48,166,83,0)}}
@keyframes fadeImg{from{opacity:0.4}to{opacity:1}}
`;

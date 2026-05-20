import { useState, useEffect } from "react";
import {
  getJoueurByEmail,
  createJoueur,
  getAllJoueurs,
  signInOrganisateur,
  signOut,
  getOrganisateurByEmail,
  soumettreDemande,
  getAllAdhesions,
  validerAdhesion as apiValiderAdhesion,
  refuserAdhesion as apiRefuserAdhesion,
  supprimerAdhesion as apiSupprimerAdhesion,
  getAllTournois,
  createTournoi,
  deleteTournoi,
  uploadAffiche,
  getDashboardStats,
  enregistrerVisite,
  getVisitesStats,
} from "./lib/api.js";
import { supabase } from "./lib/supabase.js";

// LOGO injecté au build
const LOGO_B64 = "data:image/jpeg;base64,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";

const AU = "kevinjuju", AP = "kevinjuju974";
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MC = ["JAN","FÉV","MAR","AVR","MAI","JUN","JUL","AOÛ","SEP","OCT","NOV","DÉC"];
const TTYPES = ["Beach Volley","Green Volley","Volley Indoor","Mixte","Loisir"];

const SPONSOR_SLOTS = [
  "Emplacement Gold",
  "Emplacement Silver 1",
  "Emplacement Silver 2",
  "Emplacement Bronze 1",
  "Emplacement Bronze 2",
  "Emplacement Bronze 3",
];
const INIT_SP = Array.from({length:6},(_,i)=>({id:i+1,slot:SPONSOR_SLOTS[i],nom:"",texte:"",image:null,actif:false,siteWeb:"",instagram:"",facebook:"",whatsapp:""}));

// ── SITE VIERGE — chaque utilisateur démarre à zéro ──
// Les tournois sont créés via "Publier un tournoi" (organisateurs)
// Les partenaires sont activés via le panneau Admin
const TOURNOIS_INIT = [];

// Sponsors fictifs utilisés UNIQUEMENT sur la page Partenaires (aperçu démo)
const FAKE_SPONSORS = [
  {id:1,nom:"Decathlon Réunion",texte:"Partenaire équipement officiel",emoji:"🏪",color:"#0082C3",bg:"rgba(0,130,195,0.08)"},
  {id:2,nom:"Red Bull",texte:"Donne des ailes au volley",emoji:"🐂",color:"#CC1E1E",bg:"rgba(204,30,30,0.08)"},
  {id:3,nom:"Beach Store 974",texte:"La boutique du beach volley",emoji:"🏖️",color:"#F59E0B",bg:"rgba(245,158,11,0.08)"},
  {id:4,nom:"Rhum Charrette",texte:"Tradition péi",emoji:"🥃",color:"#a16207",bg:"rgba(161,98,7,0.08)"},
  {id:5,nom:"Réunion Tourisme",texte:"L'île intense",emoji:"🌋",color:"#10b981",bg:"rgba(16,185,129,0.08)"},
  {id:6,nom:"Royal Bourbon",texte:"Spécialités locales",emoji:"☕",color:"#7c2d12",bg:"rgba(124,45,18,0.08)"},
];

function gj(a,m){const p=new Date(a,m,1),d=new Date(a,m+1,0),j=[];for(let i=0;i<p.getDay();i++)j.push(null);for(let x=1;x<=d.getDate();x++)j.push(x);return j;}
function fd(a,m,j){return `${a}-${String(m+1).padStart(2,"0")}-${String(j).padStart(2,"0")}`;}

const CSS = `
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
}
html,body{background:var(--bg);font-family:'SF Pro Display','SF Pro Text','Inter',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;color:var(--t1);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.2;}
::-webkit-scrollbar{width:0;}
.field{width:100%;background:#ffffff;border:1px solid #d2d2d7;border-radius:12px;padding:13px 16px;color:var(--t1);font-family:inherit;font-size:15px;outline:none;transition:all 0.2s;-webkit-appearance:none;}
.field:focus{border-color:var(--blue);box-shadow:0 0 0 4px rgba(0,102,204,0.15);}
.field::placeholder{color:var(--t4);}
.lbl{display:block;font-size:11px;font-weight:600;color:var(--t3);margin-bottom:7px;letter-spacing:0.8px;text-transform:uppercase;}
.btn{border:none;border-radius:980px;padding:11px 22px;font-family:inherit;font-size:14px;font-weight:400;cursor:pointer;transition:all 0.18s var(--ease);white-space:nowrap;letter-spacing:-0.01em;}
.btn-w{background:var(--blue);color:white;}.btn-w:hover{background:#0056b3;}
.btn-ghost{background:rgba(0,0,0,0.04);color:var(--t1);border:none;}.btn-ghost:hover{background:rgba(0,0,0,0.08);}
.btn-sm{padding:7px 16px;font-size:12px;}
.btn-lg{padding:14px 32px;font-size:16px;font-weight:500;}
.tag{display:inline-flex;align-items:center;background:rgba(0,0,0,0.05);color:var(--t2);border-radius:980px;padding:3px 11px;font-size:11px;font-weight:500;letter-spacing:-0.005em;}
.tag-b{background:rgba(0,102,204,0.1);color:var(--blue);}
.tag-g{background:rgba(48,166,83,0.12);color:var(--green);}
.tag-y{background:rgba(245,158,11,0.14);color:#b45309;}
.err-box{background:#fff3f3;border:1px solid #ffcdd2;border-radius:10px;padding:10px 14px;font-size:13px;color:#c62828;margin-bottom:16px;}
.info-box{background:rgba(0,102,204,0.06);border-left:3px solid var(--blue);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--blue);margin-bottom:16px;}
.warn-box{background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:16px;margin-bottom:16px;}
/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:200;height:48px;background:rgba(251,251,253,0.72);backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(0,0,0,0.06);}
.nav-in{max-width:1024px;margin:0 auto;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 22px;gap:12px;}
.nav-tabs{display:flex;gap:0;}
.nav-tab{background:none;border:none;color:var(--t3);font-family:inherit;font-size:12px;font-weight:400;cursor:pointer;padding:5px 12px;border-radius:0;transition:color 0.2s;white-space:nowrap;letter-spacing:-0.01em;}
.nav-tab:hover{color:var(--t1);}
.nav-tab.on{color:var(--t1);}
@media(max-width:600px){.nav-in{padding:0 16px;}.nav-tab{padding:5px 9px;font-size:11px;}.nl{display:none;}}
.page{padding-top:48px;min-height:100vh;}
/* OVERLAY */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;animation:fi 0.18s ease;}
.modal{background:#ffffff;border:none;border-radius:18px;padding:32px;width:100%;max-width:480px;max-height:92vh;overflow-y:auto;animation:su 0.28s var(--ease);box-shadow:0 30px 60px rgba(0,0,0,0.2);}
@media(max-width:600px){.modal{padding:24px 20px;border-radius:18px;max-width:100%;}}
/* CALENDRIER */
.cal-wrap{background:#ffffff;border:none;border-radius:18px;overflow:hidden;margin-bottom:24px;padding:24px 16px 18px;}
.cal-nav{display:flex;align-items:center;justify-content:center;gap:14px;padding:0 0 16px;}
.cal-month{font-size:15px;font-weight:600;letter-spacing:-0.3px;min-width:120px;text-align:center;color:var(--t1);font-variant-numeric:tabular-nums;}
.cal-arrow{background:rgba(0,0,0,0.04);border:none;color:var(--t1);font-size:16px;cursor:pointer;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background 0.15s;}
.cal-arrow:hover{background:rgba(0,0,0,0.08);}
.cal-dh{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
.cal-dn{text-align:center;padding:6px 0;font-size:11px;font-weight:600;color:var(--t4);letter-spacing:0.5px;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cal-cell{aspect-ratio:1/1;padding:0;cursor:pointer;transition:background 0.15s;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:7px;border-radius:8px;border:none;position:relative;}
.cal-cell:hover{background:#f5f5f7;}
.cal-cell.sel{background:var(--blue);color:white;}
.cal-num{font-size:14px;color:var(--t1);width:auto;height:auto;display:flex;align-items:center;justify-content:center;border-radius:0;font-weight:400;font-variant-numeric:tabular-nums;line-height:1;}
.cal-num.td{background:transparent;color:var(--blue);font-weight:600;}
.cal-cell.sel .cal-num{color:white;}
.cal-cell.sel .cal-num.td{color:white;}
.cal-dot{width:4px;height:4px;border-radius:50%;background:var(--blue);display:inline-block;margin:0 1px;}
.cal-cell.sel .cal-dot{background:white;}
@media(max-width:600px){.cal-num{font-size:13px;}.cal-dn{font-size:10px;}}
/* TOURNOI CARDS - style produit Apple */
.t-card{background:#f5f5f7;border:none;border-radius:18px;overflow:hidden;cursor:pointer;transition:all 0.4s var(--ease);position:relative;}
.t-card:hover{transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,0.08);}
.t-card-cover{width:100%;height:160px;background:linear-gradient(180deg,#e5e7eb,#d1d5db);display:flex;align-items:center;justify-content:center;font-size:64px;object-fit:cover;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.08));}
.t-card-body{padding:22px 22px 24px;}
.t-card-name{font-size:20px;font-weight:600;letter-spacing:-0.3px;margin-bottom:8px;line-height:1.15;color:var(--t1);}
.t-card-meta{display:flex;flex-direction:column;gap:5px;}
.t-meta-row{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--t2);}
.t-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;animation:fadeSlide 0.3s var(--ease);}
@media(max-width:600px){.t-cards-grid{grid-template-columns:1fr;}}
/* MAP */
.map-wrap{border-radius:18px;overflow:hidden;border:none;height:460px;}
@media(max-width:600px){.map-wrap{height:300px;}}
/* INTRO / LOGIN */
.intro-page{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:20px;overflow:hidden;position:relative;}
.intro-card{background:#ffffff;border:none;border-radius:20px;padding:40px 32px;width:100%;max-width:400px;position:relative;box-shadow:0 1px 0 rgba(0,0,0,0.04),0 20px 40px rgba(0,0,0,0.06);}
@media(max-width:480px){.intro-card{padding:32px 24px;border-radius:18px;}}
/* ADMIN */
.adm-page{min-height:100vh;background:var(--bg);padding-top:48px;}
.adm-tab{background:none;border:none;border-bottom:2px solid transparent;padding:13px 16px;font-size:13px;font-weight:500;color:var(--t3);cursor:pointer;font-family:inherit;transition:all 0.15s;}
.adm-tab.on{border-bottom-color:var(--blue);color:var(--t1);}
.adm-badge{background:rgba(0,0,0,0.06);color:var(--t3);border-radius:980px;padding:1px 8px;font-size:10px;margin-left:4px;font-weight:500;}
.adm-badge.on{background:var(--blue);color:white;}
.adm-wrap{max-width:880px;margin:0 auto;padding:28px 22px;}
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
/* PARTENAIRES PAGE */
.part-page{min-height:100vh;background:var(--bg);padding-top:48px;}
.part-hero{text-align:center;padding:60px 24px 40px;position:relative;}
.part-hero::before{content:'';position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(0,102,204,0.06) 0%,transparent 70%);pointer-events:none;}
.strip{height:3px;background:linear-gradient(90deg,var(--re-b) 0% 33%,var(--re-y) 33% 66%,var(--re-r) 66% 100%);opacity:1;}
/* ROLE CARDS */
.role-card{background:#f5f5f7;border:none;border-radius:16px;padding:20px;cursor:pointer;transition:all 0.2s var(--ease);display:flex;align-items:center;gap:14px;}
.role-card:hover{background:#ececef;transform:translateY(-2px);}
/* HERO style Apple */
.hero-title{font-size:clamp(34px,6vw,64px);line-height:1.05;letter-spacing:-0.015em;font-weight:600;color:var(--t1);}
.hero-sub{font-size:clamp(17px,2vw,21px);line-height:1.2;letter-spacing:0.004em;font-weight:400;color:var(--t3);margin-top:8px;}
.section-title{font-size:clamp(28px,4.5vw,44px);line-height:1.08;letter-spacing:-0.005em;font-weight:600;}
.link{color:var(--blue);text-decoration:none;font-size:17px;line-height:1.23;letter-spacing:-0.022em;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:3px;transition:color 0.2s;background:none;border:none;font-family:inherit;}
.link:hover{text-decoration:underline;}
.link::after{content:'›';font-size:1.2em;transition:transform 0.2s;}
.link:hover::after{transform:translateX(2px);}
.link-sm{font-size:14px;}
/* CLOSE BUTTON modal */
.close-btn{background:rgba(0,0,0,0.05);border:none;color:var(--t1);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;line-height:1;transition:background 0.15s;font-family:inherit;}
.close-btn:hover{background:rgba(0,0,0,0.1);}
/* ANIMATIONS */
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{opacity:0;transform:translateY(18px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes splLogo{0%{opacity:0;transform:scale(0.82)}100%{opacity:1;transform:scale(1)}}
@keyframes splTxt{0%{opacity:0;transform:translateY(7px)}100%{opacity:1;transform:translateY(0)}}
@keyframes splDot{0%,80%,100%{transform:scale(0.4);opacity:0.25}40%{transform:scale(1);opacity:1}}
@keyframes splFlare{0%{transform:translateX(-120%) skewX(-14deg);opacity:0}20%{opacity:0.55}70%{transform:translateX(320%) skewX(-14deg);opacity:0.55}100%{opacity:0}}
@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(48,166,83,0.3)}50%{box-shadow:0 0 0 5px rgba(48,166,83,0)}}
`;

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
// ─── PAGE INTRO ───────────────────────────────────────────────────────────────
function PageIntro({onVisiteur, onOrganisateur}){
  return(
    <div style={{position:"fixed",inset:0,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:100,fontFamily:"Inter,-apple-system,sans-serif",padding:"0 24px"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",top:0,left:0,right:0}}><div className="strip"/></div>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 65%)",pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:380,position:"relative"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src={LOGO_B64} alt="VolleyPéi" style={{width:72,height:72,borderRadius:18,margin:"0 auto 16px",display:"block",boxShadow:"0 8px 28px rgba(37,99,235,0.2)"}}/>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.6,color:"var(--t1)",marginBottom:6}}>VolleyPéi</div>
          <div style={{fontSize:14,color:"var(--t3)",lineHeight:1.5}}>Le calendrier du volley péi 🏐</div>
        </div>

        {/* Choix */}
        <div style={{marginBottom:12}}>
          <div
            onClick={onVisiteur}
            style={{display:"flex",alignItems:"center",gap:14,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:16,padding:"18px 20px",cursor:"pointer",transition:"all 0.15s",marginBottom:10}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(37,99,235,0.1)";e.currentTarget.style.borderColor="rgba(37,99,235,0.3)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="var(--b1)";}}>
            <div style={{width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,#2563eb,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🏐</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--t1)",marginBottom:3}}>Accéder en tant que visiteur</div>
              <div style={{fontSize:12,color:"var(--t3)"}}>Consulter le calendrier des tournois</div>
            </div>
            <span style={{color:"var(--t3)",fontSize:18}}>→</span>
          </div>

          <div
            onClick={onOrganisateur}
            style={{display:"flex",alignItems:"center",gap:14,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:16,padding:"18px 20px",cursor:"pointer",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(251,191,36,0.12)";e.currentTarget.style.borderColor="rgba(251,191,36,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="var(--b1)";}}>
            <div style={{width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🏆</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <span style={{fontSize:15,fontWeight:700,color:"var(--t1)"}}>Espace organisateur</span>
                <span style={{background:"rgba(251,191,36,0.15)",color:"#d97706",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,letterSpacing:0.5}}>VALIDATION</span>
              </div>
              <div style={{fontSize:12,color:"var(--t3)"}}>Publier et gérer vos tournois</div>
            </div>
            <span style={{color:"var(--t3)",fontSize:18}}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplashScreen({onDone}){
  const [out,setOut]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setOut(true),2000);
    const t2=setTimeout(()=>onDone(),2500);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return(
    <div style={{position:"fixed",inset:0,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999,opacity:out?0:1,transition:"opacity 500ms cubic-bezier(0.22,1,0.36,1)",fontFamily:"Inter,-apple-system,sans-serif"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)",animation:"splLogo 1.2s ease both"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0}}>
        <div className="strip"/>
      </div>
      <div style={{position:"relative",animation:"splLogo 0.9s cubic-bezier(0.22,1,0.36,1) both"}}>
        <img src={LOGO_B64} alt="VolleyPéi" style={{width:96,height:96,borderRadius:22,boxShadow:"0 16px 48px rgba(37,99,235,0.25)",position:"relative",zIndex:2}}/>
        <div style={{position:"absolute",inset:0,borderRadius:22,overflow:"hidden",zIndex:3}}>
          <div style={{position:"absolute",top:0,bottom:0,left:0,width:"35%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",animation:"splFlare 2s ease 0.8s both"}}/>
        </div>
      </div>
      <div style={{marginTop:24,fontSize:22,fontWeight:800,letterSpacing:-0.6,color:"var(--t1)",animation:"splTxt 0.6s ease 0.5s both"}}>VolleyPéi</div>
      <div style={{marginTop:6,fontSize:13,color:"var(--t3)",animation:"splTxt 0.6s ease 0.7s both"}}>Le calendrier du volley péi 🏐</div>
      <div style={{marginTop:36,display:"flex",gap:7,animation:"splTxt 0.6s ease 0.9s both"}}>
        {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"var(--t4)",animation:`splDot 1.3s ease-in-out ${i*0.14}s infinite`}}/>)}
      </div>
    </div>
  );
}

// ─── MODAL ORGANISATEUR (demande adhésion) ───────────────────────────────────
function ModalOrganisateur({onClose,adhesions,setAdhesions}){
  const [vue,setVue]=useState("choix"); // choix | demande | confirm | connexion

  return(
    <div className="overlay" onClick={onClose}>
      <style>{CSS}</style>
      <div className="intro-card" style={{maxWidth:460,width:"94vw",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:20,cursor:"pointer",color:"var(--t3)",lineHeight:1}}>✕</button>

        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO_B64} alt="VolleyPéi" style={{width:52,height:52,borderRadius:14,margin:"0 auto 12px",display:"block",boxShadow:"0 6px 24px rgba(37,99,235,0.2)"}}/>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.5}}>Espace organisateur</div>
        </div>

        {vue==="choix"&&(
          <>
            <div style={{fontSize:13,color:"var(--t3)",marginBottom:22,textAlign:"center",lineHeight:1.6}}>Vous souhaitez publier des tournois sur VolleyPéi ?</div>
            <button onClick={()=>setVue("demande")} className="btn btn-w btn-lg" style={{width:"100%",marginBottom:10}}>Faire une demande d'adhésion →</button>
            <button onClick={()=>setVue("connexion")} className="btn btn-ghost btn-lg" style={{width:"100%"}}>Déjà organisateur ? Se connecter</button>
          </>
        )}

        {vue==="demande"&&<VueOrganisateur onBack={()=>setVue("choix")} adhesions={adhesions} setAdhesions={setAdhesions} onDone={()=>setVue("confirm")}/>}
        {vue==="connexion"&&<VueConnexionOrga onBack={()=>setVue("choix")} onEnter={(u)=>{onClose(); if(u) window.dispatchEvent(new CustomEvent("orga-login", {detail:u}));}} />}

        {vue==="confirm"&&(
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{width:60,height:60,background:"rgba(48,209,88,0.1)",border:"1px solid rgba(48,209,88,0.25)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 18px"}}>✅</div>
            <div style={{fontSize:17,fontWeight:700,letterSpacing:-0.4,marginBottom:8}}>Demande envoyée !</div>
            <div style={{fontSize:13,color:"var(--t3)",lineHeight:1.7,marginBottom:24}}>Votre demande a bien été reçue.<br/>Notre équipe la validera sous peu.</div>
            <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
}


function VueOrganisateur({onBack,adhesions,setAdhesions,onDone}){
  const [prenom,setPrenom]=useState("");
  const [nom,setNom]=useState("");
  const [association,setAssociation]=useState("");
  const [email,setEmail]=useState("");
  const [mdp,setMdp]=useState("");
  const [mdp2,setMdp2]=useState("");
  const [showMdp,setShowMdp]=useState(false);
  const [showMdp2,setShowMdp2]=useState(false);
  const [err,setErr]=useState("");

  async function envoyer(){
    if(!prenom.trim()||!nom.trim()||!association.trim()||!email.trim()||!email.includes("@")){setErr("Merci de remplir tous les champs obligatoires.");return;}
    if(!mdp||mdp.length<6){setErr("Le mot de passe doit contenir au moins 6 caractères.");return;}
    if(mdp!==mdp2){setErr("Les mots de passe ne correspondent pas.");return;}
    setErr("");
    try {
      await soumettreDemande({prenom, nom, association, email, mdp});
      onDone();
    } catch(e) {
      if(e.message==="UNE_DEMANDE_EN_ATTENTE") setErr("Une demande est déjà en cours pour cet email.");
      else if(e.message==="DEJA_VALIDEE") setErr("Ce compte est déjà validé. Connectez-vous directement.");
      else { setErr("Erreur lors de l'envoi. Réessayez."); console.error(e); }
    }
  }

  const mdpForce=mdp.length===0?0:mdp.length<6?1:mdp.length<10?2:3;
  const mdpCouleur=["transparent","var(--red)","var(--yellow)","var(--green)"][mdpForce];
  const mdpLabel=["","Trop court","Correct","Fort"][mdpForce];

  return(<>
    <button onClick={onBack} style={{background:"none",border:"none",color:"var(--t3)",fontSize:13,cursor:"pointer",marginBottom:18,padding:0,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>← Retour</button>
    <div style={{fontSize:16,fontWeight:700,letterSpacing:-0.3,marginBottom:4}}>Devenir organisateur 🏆</div>
    <div className="info-box" style={{marginBottom:18}}>Votre demande sera examinée par notre équipe. Une fois validée, vous pourrez vous connecter avec votre email et mot de passe.</div>
    {err&&<div className="err-box">{err}</div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
      <div><label className="lbl">Prénom *</label><input type="text" value={prenom} onChange={e=>{setPrenom(e.target.value);setErr("");}} placeholder="Jean-Paul" className="field"/></div>
      <div><label className="lbl">Nom *</label><input type="text" value={nom} onChange={e=>{setNom(e.target.value);setErr("");}} placeholder="Dupont" className="field"/></div>
    </div>
    <div style={{marginBottom:10}}><label className="lbl">Association / Club *</label><input type="text" value={association} onChange={e=>{setAssociation(e.target.value);setErr("");}} placeholder="Beach Volley Réunion, Club XYZ..." className="field"/></div>
    <div style={{marginBottom:10}}><label className="lbl">Adresse email *</label><input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="votre@email.com" className="field" style={{fontSize:16}}/></div>
    <div style={{marginBottom:10}}>
      <label className="lbl">Mot de passe *</label>
      <div style={{position:"relative"}}>
        <input type={showMdp?"text":"password"} value={mdp} onChange={e=>{setMdp(e.target.value);setErr("");}} placeholder="Minimum 6 caractères" className="field" style={{paddingRight:44}}/>
        <button type="button" onClick={()=>setShowMdp(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--t3)",padding:0,lineHeight:1}}>{showMdp?"🙈":"👁️"}</button>
      </div>
      {mdp.length>0&&(
        <div style={{marginTop:6,display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,height:3,borderRadius:2,background:"var(--b2)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${[0,33,66,100][mdpForce]}%`,background:mdpCouleur,transition:"all 0.3s",borderRadius:2}}/>
          </div>
          <span style={{fontSize:11,color:mdpCouleur,fontWeight:600,minWidth:40}}>{mdpLabel}</span>
        </div>
      )}
    </div>
    <div style={{marginBottom:22}}>
      <label className="lbl">Confirmer le mot de passe *</label>
      <div style={{position:"relative"}}>
        <input type={showMdp2?"text":"password"} value={mdp2} onChange={e=>{setMdp2(e.target.value);setErr("");}} placeholder="Répétez votre mot de passe" onKeyDown={e=>e.key==="Enter"&&envoyer()} className="field" style={{paddingRight:44,borderColor:mdp2&&mdp2!==mdp?"var(--red)":mdp2&&mdp2===mdp?"var(--green)":""}}/>
        <button type="button" onClick={()=>setShowMdp2(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--t3)",padding:0,lineHeight:1}}>{showMdp2?"🙈":"👁️"}</button>
      </div>
      {mdp2&&<div style={{marginTop:5,fontSize:11,fontWeight:600,color:mdp2===mdp?"var(--green)":"var(--red)"}}>{mdp2===mdp?"✓ Mots de passe identiques":"✕ Ne correspond pas"}</div>}
    </div>
    <button onClick={envoyer} className="btn btn-w btn-lg" style={{width:"100%"}}>Envoyer ma demande →</button>
    <p style={{fontSize:11,color:"var(--t4)",textAlign:"center",marginTop:12}}>Votre demande sera traitée sous 24-48h</p>
  </>);
}

// ─── VUE CONNEXION ORGANISATEUR ──────────────────────────────────────────────
function VueConnexionOrga({onBack, onEnter}){
  const [email,setEmail]=useState("");
  const [mdp,setMdp]=useState("");
  const [showMdp,setShowMdp]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [welcome,setWelcome]=useState(false);
  const [nom,setNom]=useState("");

  async function connecter(){
    if(!email.trim()||!mdp){setErr("Email et mot de passe requis.");return;}
    setErr(""); setLoading(true);
    try {
      const orga = await signInOrganisateur(email, mdp);
      setNom(orga.prenom);
      setWelcome(true);
      setTimeout(()=>onEnter({...orga, role:"organisateur"}), 1500);
    } catch(e){
      if(e.message==="COMPTE_INTROUVABLE") setErr("Compte introuvable. Votre demande est peut-être en attente de validation.");
      else if(e.message==="MOT_DE_PASSE_INCORRECT") setErr("Mot de passe incorrect.");
      else setErr("Email ou mot de passe incorrect.");
      setLoading(false);
    }
  }

  if(welcome) return(
    <div style={{textAlign:"center",padding:"16px 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>🏆</div>
      <div style={{fontSize:15,fontWeight:300,color:"var(--t2)",marginBottom:4}}>Bienvenue,</div>
      <div style={{fontSize:24,fontWeight:800,letterSpacing:-0.8,marginBottom:16}}>{nom}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",animation:"pulse 1.2s infinite"}}/>
        <span style={{fontSize:12,color:"var(--t3)"}}>Connexion en cours...</span>
      </div>
    </div>
  );

  return(<>
    <button onClick={onBack} style={{background:"none",border:"none",color:"var(--t3)",fontSize:13,cursor:"pointer",marginBottom:18,padding:0,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>← Retour</button>
    <div style={{fontSize:16,fontWeight:700,letterSpacing:-0.3,marginBottom:20}}>Connexion organisateur 🏆</div>
    {err&&<div className="err-box">{err}</div>}
    <div style={{marginBottom:10}}><label className="lbl">Email *</label><input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="votre@email.com" className="field" style={{fontSize:16}}/></div>
    <div style={{marginBottom:24}}>
      <label className="lbl">Mot de passe *</label>
      <div style={{position:"relative"}}>
        <input type={showMdp?"text":"password"} value={mdp} onChange={e=>{setMdp(e.target.value);setErr("");}} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&connecter()} className="field" style={{paddingRight:44}}/>
        <button type="button" onClick={()=>setShowMdp(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--t3)",padding:0}}>{showMdp?"🙈":"👁️"}</button>
      </div>
    </div>
    <button onClick={connecter} disabled={loading} className="btn btn-w btn-lg" style={{width:"100%"}}>{loading?"Connexion...":"Se connecter →"}</button>
  </>);
}

// ─── LOGIN ADMIN ──────────────────────────────────────────────────────────────
function LoginAdmin({onLogin,onBack,onRetourAccueil}){
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(false);
  function go(){if(u===AU&&p===AP){onLogin();}else{setErr(true);setTimeout(()=>setErr(false),2000);}}
  return(
    <div className="intro-page">
      <style>{CSS}</style>
      <div style={{position:"absolute",top:0,left:0,right:0}}><div className="strip"/></div>
      <div className="intro-card" style={{maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:44,height:44,background:"var(--s4)",border:"1px solid var(--b2)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,margin:"0 auto 14px"}}>🔐</div>
          <div style={{fontSize:20,fontWeight:700,letterSpacing:-0.4}}>Espace Admin</div>
          <div style={{fontSize:13,color:"var(--t3)",marginTop:3}}>VolleyPéi</div>
        </div>
        {err&&<div className="err-box" style={{textAlign:"center"}}>Identifiants incorrects</div>}
        <div style={{marginBottom:12}}><label className="lbl">Identifiant</label><input type="text" value={u} onChange={e=>setU(e.target.value)} className="field" placeholder="" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <div style={{marginBottom:22}}><label className="lbl">Mot de passe</label><input type="password" value={p} onChange={e=>setP(e.target.value)} className="field" placeholder="" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <button className="btn btn-w" onClick={go} style={{width:"100%",padding:"13px",fontSize:15}}>Se connecter</button>
        <button onClick={onBack} className="btn btn-ghost" style={{width:"100%",marginTop:9,padding:"12px"}}>← Retour</button>
        {onRetourAccueil&&<button onClick={onRetourAccueil} className="btn btn-ghost" style={{width:"100%",marginTop:6,padding:"12px",fontSize:12,color:"var(--t3)"}}>⌂ Retour à l'accueil</button>}
      </div>
    </div>
  );
}

// ─── PANNEAU ADMIN ────────────────────────────────────────────────────────────
function PanneauAdmin({sponsors,setSponsors,inscrits,setInscrits,tournois,setTournois,adhesions,setAdhesions,getAllAdhesions,getAllJoueurs,onBack,onRetourAccueil}){
  const [visitesStats,setVisitesStats]=useState(null);

  useEffect(()=>{
    async function loadAdmin(){
      try {
        const [adh, jou, vis] = await Promise.all([
          getAllAdhesions(),
          getAllJoueurs(),
          getVisitesStats(30),
        ]);
        setAdhesions(adh);
        setInscrits(jou);
        setVisitesStats(vis);
      } catch(e){ console.error("Admin load error:", e); }
    }
    loadAdmin();
  },[]);
  const [saved,setSaved]=useState(false);
  const [onglet,setOnglet]=useState("adhesions");
  function handleImage(id,file){if(!file)return;const r=new FileReader();r.onload=e=>setSponsors(prev=>prev.map(s=>s.id===id?{...s,image:e.target.result,actif:true}:s));r.readAsDataURL(file);}
  function handleField(id,k,v){setSponsors(prev=>prev.map(s=>s.id===id?{...s,[k]:v,actif:!!(v||s.image||s.nom)}:s));}
  function removeImg(id){setSponsors(prev=>prev.map(s=>s.id===id?{...s,image:null}:s));}
  function save(){setSaved(true);setTimeout(()=>setSaved(false),2200);}
  async function deleteTournoi(id){
    if(!window.confirm("Supprimer ce tournoi ?")) return;
    try {
      await deleteTournoi(id);
      setTournois(prev=>prev.filter(t=>t.id!==id));
    } catch(e) { alert("Erreur : "+e.message); }
  }
  async function validerAdhesion(id){
    try {
      await apiValiderAdhesion(id);
      // Recharge les adhésions depuis Supabase
      const updated = await getAllAdhesions();
      setAdhesions(updated);
    } catch(e) {
      alert("Erreur lors de la validation : " + e.message);
      console.error(e);
    }
  }
  async function refuserAdhesion(id){
    if(!window.confirm("Refuser cette demande ?")) return;
    try {
      await apiRefuserAdhesion(id);
      setAdhesions(prev=>prev.map(a=>a.id===id?{...a,statut:"refusee"}:a));
    } catch(e) {
      alert("Erreur : " + e.message);
      console.error(e);
    }
  }
  async function supprimerAdhesion(id){
    if(!window.confirm("Supprimer définitivement cette demande ? Toutes les données liées seront effacées.")) return;
    try {
      await apiSupprimerAdhesion(id);
      setAdhesions(prev=>prev.filter(a=>a.id!==id));
    } catch(e) {
      alert("Erreur lors de la suppression : " + e.message);
      console.error(e);
    }
  }
  const nbEnAttente=adhesions.filter(a=>a.statut==="en_attente").length;

  return(
    <div className="adm-page">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-in">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={LOGO_B64} alt="" style={{width:28,height:28,borderRadius:7}}/>
            <span style={{fontSize:15,fontWeight:600,letterSpacing:-0.2}} className="nl">Admin</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saved&&<span style={{fontSize:12,color:"var(--green)",fontWeight:500}}>✓ Sauvegardé</span>}
            {onglet==="sponsors"&&<button className="btn btn-w btn-sm" onClick={save}>Sauvegarder</button>}
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Calendrier</button>
            <button className="btn btn-ghost btn-sm" onClick={onRetourAccueil} style={{color:"var(--t3)"}}>⌂ Accueil</button>
          </div>
        </div>
      </nav>
      <div style={{background:"var(--s1)",borderBottom:"1px solid var(--b1)"}}>
        <div style={{maxWidth:840,margin:"0 auto",padding:"0 16px",display:"flex"}}>
          {[["adhesions","Adhésions"],["visites","Visites"],["sponsors","Sponsors"],["tournois","Tournois"]].map(([k,l])=>(
            <button key={k} className={`adm-tab ${onglet===k?"on":""}`} onClick={()=>setOnglet(k)}>
              {l}<span className={`adm-badge ${onglet===k?"on":""}`}>{k==="adhesions"?nbEnAttente:k==="visites"?(visitesStats?.moyenne||0):k==="tournois"?tournois.length:sponsors.filter(s=>s.actif).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="adm-wrap">
        {onglet==="adhesions"&&(
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.6,marginBottom:4}}>Demandes d'adhésion organisateur</div>
            <div style={{fontSize:13,color:"var(--t3)",marginBottom:20}}>{nbEnAttente} demande{nbEnAttente!==1?"s":""} en attente de validation</div>
            {adhesions.length===0?(
              <div style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,padding:"48px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:10}}>📋</div>
                <div style={{color:"var(--t3)",fontSize:14}}>Aucune demande d'adhésion pour l'instant.</div>
              </div>
            ):(
              <div>
                {adhesions.map(a=>(
                  <div key={a.id} style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,padding:"20px 22px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:200}}>
                      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
                        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏆</div>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,letterSpacing:-0.3}}>{a.prenom} {a.nom}</div>
                          <div style={{fontSize:12,color:"var(--t3)"}}>{a.association}</div>
                        </div>
                      </div>
                      <div style={{fontSize:12,color:"var(--t2)",marginBottom:3}}>✉️ {a.email}</div>
                      <div style={{fontSize:11,color:"var(--t4)"}}>Demande reçue le {a.date}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      {a.statut==="en_attente"&&(<>
                        <button onClick={()=>refuserAdhesion(a.id)} style={{background:"rgba(227,0,0,0.07)",border:"none",color:"var(--red)",borderRadius:980,padding:"8px 16px",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(227,0,0,0.13)"}
                          onMouseLeave={e=>e.currentTarget.style.background="rgba(227,0,0,0.07)"}>Refuser</button>
                        <button onClick={()=>validerAdhesion(a.id)} className="btn btn-w btn-sm" style={{background:"var(--green)",border:"none",borderRadius:980,padding:"8px 18px",fontSize:13,fontWeight:600}}>✓ Valider</button>
                      </>)}
                      {a.statut==="validee"&&<span style={{background:"rgba(48,166,83,0.1)",color:"var(--green)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:600}}>✓ Validée</span>}
                      {a.statut==="refusee"&&<span style={{background:"rgba(227,0,0,0.07)",color:"var(--red)",borderRadius:980,padding:"6px 14px",fontSize:12,fontWeight:600}}>✕ Refusée</span>}
                      <button onClick={()=>supprimerAdhesion(a.id)} title="Supprimer définitivement" style={{background:"rgba(0,0,0,0.04)",border:"none",color:"var(--t3)",borderRadius:980,padding:"8px 10px",fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",marginLeft:2}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(227,0,0,0.1)";e.currentTarget.style.color="var(--red)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0.04)";e.currentTarget.style.color="var(--t3)";}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet==="visites"&&(
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.6,marginBottom:4}}>Statistiques de visites</div>
            <div style={{fontSize:13,color:"var(--t3)",marginBottom:24}}>30 derniers jours</div>

            {/* Cards résumé */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:32}}>
              {[
                {label:"Visites totales",val:visitesStats?.total??"—",icon:"👁️"},
                {label:"Moyenne / jour",val:visitesStats?.moyenne??"—",icon:"📈"},
                {label:"Jours avec visites",val:visitesStats?.jours?.length??"—",icon:"📅"},
              ].map(({label,val,icon})=>(
                <div key={label} style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,padding:"20px 18px"}}>
                  <div style={{fontSize:26,marginBottom:8}}>{icon}</div>
                  <div style={{fontSize:28,fontWeight:800,letterSpacing:-1,marginBottom:4}}>{val}</div>
                  <div style={{fontSize:12,color:"var(--t3)",fontWeight:500}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Mini graphe en barres */}
            {visitesStats?.jours?.length>0?(
              <div style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,padding:"22px 20px"}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:18}}>Visites par jour</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,overflowX:"auto"}}>
                  {(()=>{
                    const max=Math.max(...visitesStats.jours.map(j=>j.nb),1);
                    return visitesStats.jours.map(j=>(
                      <div key={j.jour} title={`${j.jour} : ${j.nb} visites`}
                        style={{flex:"0 0 auto",width:18,height:`${Math.max(4,(j.nb/max)*76)}px`,
                          background:"var(--blue)",borderRadius:"4px 4px 0 0",cursor:"default",
                          transition:"opacity 0.15s",opacity:0.8}}
                        onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                        onMouseLeave={e=>e.currentTarget.style.opacity="0.8"}/>
                    ));
                  })()}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:"var(--t4)"}}>
                  <span>{visitesStats.jours[0]?.jour}</span>
                  <span>{visitesStats.jours[visitesStats.jours.length-1]?.jour}</span>
                </div>
              </div>
            ):(
              <div style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,padding:"48px",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:10}}>📊</div>
                <div style={{color:"var(--t3)",fontSize:14}}>Pas encore de données de visites.<br/>Assure-toi que la table <code>visites</code> est créée dans Supabase.</div>
              </div>
            )}
          </div>
        )}

        {onglet==="sponsors"&&(
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.6,marginBottom:4}}>Gestion des sponsors</div>
            <div style={{fontSize:13,color:"var(--t3)",marginBottom:20}}>Photo carrée recommandée (1000×1000px). Sponsors actifs visibles sur la page d'accueil.</div>
            {sponsors.map(s=>(
              <div key={s.id} className="sp-slot">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:s.actif?"var(--green)":"var(--t4)"}}/>
                    <span style={{fontSize:11,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:0.8}}>{s.slot}</span>
                  </div>
                  {s.actif&&<span style={{fontSize:11,color:"var(--green)",fontWeight:500}}>● Actif</span>}
                </div>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div>
                    <div className="sp-prev">{s.image?<img src={s.image} alt=""/>:"🖼️"}</div>
                    {s.image&&<button onClick={()=>removeImg(s.id)} style={{display:"block",marginTop:5,background:"none",border:"none",color:"var(--red)",fontSize:11,cursor:"pointer",width:"68px",textAlign:"center",fontFamily:"inherit"}}>Supprimer</button>}
                  </div>
                  <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                    {[["Nom","nom","text","Rhum Charrette"],["Slogan","texte","text","Partenaire officiel"],["🌐 Site web","siteWeb","text","https://..."],["📸 Instagram","instagram","text","@compte"],["👥 Facebook","facebook","text","https://facebook.com/..."],["💬 WhatsApp","whatsapp","text","0692 00 00 00"]].map(([label,key,type,ph])=>(
                      <div key={key}><label className="lbl">{label}</label><input type={type} value={s[key]||""} onChange={e=>handleField(s.id,key,e.target.value)} className="field" placeholder={ph} style={{fontSize:12,padding:"9px 11px"}}/></div>
                    ))}
                    <div style={{gridColumn:"1/-1"}}>
                      <label className="lbl">Photo</label>
                      <label className="upzone"><span style={{fontSize:20}}>📁</span><span style={{fontSize:12,fontWeight:500,color:"var(--blue2)"}}>{s.image?"Changer":"Choisir une photo"}</span><span style={{fontSize:10,color:"var(--t3)"}}>JPG, PNG — 1000×1000px</span><input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImage(s.id,e.target.files[0])}/></label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet==="tournois"&&(
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.6,marginBottom:4}}>Tournois</div>
            <div style={{fontSize:13,color:"var(--t3)",marginBottom:20}}>{tournois.length} tournoi{tournois.length!==1?"s":""} référencé{tournois.length!==1?"s":""}</div>
            {tournois.length===0?<div style={{textAlign:"center",padding:"48px 0",color:"var(--t3)"}}>Aucun tournoi</div>:
              <div style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,overflow:"hidden"}}>
                <div className="tbl-head">
                  {["Tournoi","Lieu","Date","Organisateur"].map(h=><div key={h} style={{fontSize:10,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:0.5}} className={h==="Organisateur"?"hc":""}>{h}</div>)}
                </div>
                {tournois.map((t,i)=>(
                  <div key={t.id} className="tbl-row">
                    <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.nom}</div>
                    <div style={{fontSize:12,color:"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.ville}</div>
                    <div style={{fontSize:12,color:"var(--t2)"}}>{t.date.split("-").reverse().join("/")}</div>
                    <div style={{fontSize:12,color:"var(--t3)",display:"flex",alignItems:"center",justifyContent:"space-between"}} className="hc">
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.organisateur}</span>
                      <button onClick={()=>deleteTournoi(t.id)} style={{background:"none",border:"none",color:"var(--red)",fontSize:14,cursor:"pointer",padding:"2px 5px",flexShrink:0}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {onglet==="joueurs"&&(
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.6,marginBottom:4}}>Joueurs inscrits</div>
            <div style={{fontSize:13,color:"var(--t3)",marginBottom:20}}>{inscrits.length} joueur{inscrits.length!==1?"s":""} inscrit{inscrits.length!==1?"s":""}</div>
            {inscrits.length===0?
              <div style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,padding:"40px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:10}}>👥</div>
                <div style={{color:"var(--t3)",fontSize:14}}>Aucun joueur inscrit pour l'instant.</div>
              </div>:
              <div style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:14,overflow:"hidden"}}>
                <div className="tbl-head">
                  {["Prénom","Email","Ville","Date"].map(h=><div key={h} style={{fontSize:10,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:0.5}} className={h==="Ville"?"hc":""}>{h}</div>)}
                </div>
                {inscrits.map((v,i)=>(
                  <div key={i} className="tbl-row">
                    <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{v.prenom}</div>
                    <div style={{fontSize:12,color:"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.email}</div>
                    <div style={{fontSize:12,color:"var(--t3)"}} className="hc">{v.ville||"—"}</div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>{v.date}</div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL TOURNOI ────────────────────────────────────────────────────────────
function ModalTournoi({tournoi,onClose}){
  const typeColor={"Beach Volley":"tag-b","Green Volley":"tag-g","Volley Indoor":"tag","Mixte":"tag-y","Loisir":"tag"};
  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span className={typeColor[tournoi.type]||"tag"}>{tournoi.type}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {tournoi.affiche&&<div style={{width:"100%",borderRadius:12,overflow:"hidden",marginBottom:16,border:"1px solid var(--b1)"}}><img src={tournoi.affiche} alt="Affiche" style={{width:"100%",objectFit:"cover"}}/></div>}
        <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.4,marginBottom:6,lineHeight:1.2}}>{tournoi.nom}</div>
        <div style={{color:"var(--blue2)",fontSize:13,fontWeight:500,marginBottom:20}}>📅 {tournoi.date.split("-").reverse().join("/")} · ⏰ {tournoi.heure||"—"}</div>
        {[["📍 Lieu",tournoi.lieu+", "+tournoi.ville],["🏐 Format",tournoi.type],["👥 Équipes max",tournoi.joueurs+" équipes"],["🏛️ Organisateur",tournoi.organisateur],["📞 Contact",tournoi.contact]].map(([l,v])=>(
          <div key={l} style={{marginBottom:11,paddingBottom:11,borderBottom:"1px solid var(--b1)"}}>
            <div style={{fontSize:10,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:3}}>{l}</div>
            <div style={{fontSize:14,color:"var(--t1)"}}>{v}</div>
          </div>
        ))}
        {tournoi.description&&<div style={{background:"var(--s3)",borderRadius:10,padding:"11px 13px",marginTop:8,color:"var(--t2)",fontSize:13,lineHeight:1.6}}>{tournoi.description}</div>}
      </div>
    </div>
  );
}

// ─── MODAL FORM TOURNOI ───────────────────────────────────────────────────────
function ModalFormTournoi({onClose,onSubmit,tournois,initialDate}){
  const [form,setForm]=useState({nom:"",date:initialDate||"",heure:"",lieu:"",ville:"",type:"Beach Volley",joueurs:"",contact:"",organisateur:"",description:"",affiche:null,lat:"",lng:""});
  const [err,setErr]=useState("");
  const [warnDoublon,setWarnDoublon]=useState(null);

  const [afficheFile,setAfficheFile]=useState(null);
  const [uploading,setUploading]=useState(false);

  function handleAffiche(file){
    if(!file) return;
    setAfficheFile(file);
    // Prévisualisation locale
    const r=new FileReader();
    r.onload=e=>setForm(f=>({...f,affiche:e.target.result}));
    r.readAsDataURL(file);
  }

  async function trySubmit(){
    if(!form.nom||!form.date||!form.lieu||!form.contact||!form.organisateur){setErr("Merci de remplir tous les champs obligatoires.");return;}
    if(!form.affiche){setErr("L'affiche de l'événement est obligatoire.");return;}
    setErr("");
    const doublons=tournois.filter(t=>t.date===form.date);
    if(doublons.length>0){setWarnDoublon(doublons);return;}
    await doSubmit();
  }

  const [success,setSuccess]=useState(false);

  async function doSubmit(){
    setUploading(true);
    setErr("");
    try {
      // On passe le File brut à onSubmit → createTournoi s'occupe de l'upload
      await onSubmit({...form, lat:parseFloat(form.lat)||null, lng:parseFloat(form.lng)||null}, afficheFile||null);
      setSuccess(true);
    } catch(e) {
      setErr("Erreur : "+e.message);
      setUploading(false);
    }
  }

  if(success) return(
    <div className="overlay">
      <div className="modal" style={{maxWidth:380,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:64,height:64,background:"rgba(48,209,88,0.1)",border:"1px solid rgba(48,209,88,0.25)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 18px"}}>✅</div>
        <div style={{fontSize:18,fontWeight:700,letterSpacing:-0.4,marginBottom:8}}>Tournoi publié !</div>
        <div style={{fontSize:13,color:"var(--t3)",lineHeight:1.6}}>Votre tournoi est maintenant visible sur le calendrier.</div>
      </div>
    </div>
  );

  if(warnDoublon) return(
    <div className="overlay" onClick={()=>setWarnDoublon(null)}>
      <div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:36,textAlign:"center",marginBottom:14}}>⚠️</div>
        <div style={{fontSize:18,fontWeight:700,textAlign:"center",marginBottom:8}}>Attention</div>
        <div style={{fontSize:14,color:"var(--t2)",textAlign:"center",marginBottom:20,lineHeight:1.5}}>
          {warnDoublon.length} tournoi{warnDoublon.length>1?"s":""}
          {warnDoublon.length>1?" sont":" est"} déjà prévu{warnDoublon.length>1?"s":""} ce jour-là.
        </div>
        <div style={{background:"var(--s3)",borderRadius:11,padding:12,marginBottom:20}}>
          {warnDoublon.map(t=><div key={t.id} style={{fontSize:13,color:"var(--t2)",padding:"4px 0",borderBottom:"1px solid var(--b1)"}}>🏐 {t.nom} — {t.heure||"—"}</div>)}
        </div>
        <div style={{display:"flex",gap:9}}>
          <button className="btn btn-ghost" onClick={()=>setWarnDoublon(null)} style={{flex:1,padding:"12px"}}>Voir les tournois</button>
          <button className="btn btn-w" disabled={uploading} onClick={()=>{setWarnDoublon(null);doSubmit();}} style={{flex:1,padding:"12px"}}>{uploading?"Upload...":"Publier quand même"}</button>
        </div>
      </div>
    </div>
  );

  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-hdr">
          <div><div className="modal-title">Publier un tournoi</div><div className="modal-sub">Visible immédiatement sur le calendrier</div></div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {err&&<div className="err-box">{err}</div>}
        {/* AFFICHE */}
        <div style={{marginBottom:16}}>
          <label className="lbl">Affiche <span style={{color:"var(--red)"}}>*</span></label>
          {form.affiche?(
            <div style={{position:"relative",borderRadius:11,overflow:"hidden",border:"1px solid var(--b1)"}}>
              <img src={form.affiche} alt="" style={{width:"100%",maxHeight:170,objectFit:"cover"}}/>
              <button onClick={()=>setForm(f=>({...f,affiche:null}))} style={{position:"absolute",top:7,right:7,background:"rgba(0,0,0,0.6)",border:"none",color:"white",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
          ):(
            <label className="upzone" style={{height:90}}>
              <span style={{fontSize:22}}>🖼️</span>
              <span style={{fontSize:12,fontWeight:600,color:"var(--blue2)"}}>Choisir l'affiche</span>
              <span style={{fontSize:10,color:"var(--t3)"}}>Format portrait recommandé</span>
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleAffiche(e.target.files[0])}/>
            </label>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{gridColumn:"1/-1"}}><label className="lbl">Nom du tournoi *</label><input type="text" placeholder="Open Beach de Saint-Gilles" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Date *</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Heure</label><input type="time" value={form.heure} onChange={e=>setForm(f=>({...f,heure:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Lieu *</label><input type="text" placeholder="Plage de Boucan Canot" value={form.lieu} onChange={e=>setForm(f=>({...f,lieu:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Ville</label><input type="text" placeholder="Saint-Gilles" value={form.ville} onChange={e=>setForm(f=>({...f,ville:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Organisateur *</label><input type="text" placeholder="Beach Volley Réunion" value={form.organisateur} onChange={e=>setForm(f=>({...f,organisateur:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Contact *</label><input type="text" placeholder="0692 00 00 00" value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} className="field"/></div>
          <div><label className="lbl">Type</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="field">
              {TTYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="lbl">Équipes max</label><input type="number" placeholder="16" value={form.joueurs} onChange={e=>setForm(f=>({...f,joueurs:e.target.value}))} className="field"/></div>
        </div>
        <div style={{marginBottom:20}}><label className="lbl">Description</label><textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="field" style={{resize:"vertical"}}/></div>
        <div style={{display:"flex",gap:9}}>
          <button className="btn btn-ghost" onClick={onClose} style={{flex:1}}>Annuler</button>
          <button className="btn btn-w" onClick={trySubmit} disabled={uploading} style={{flex:2,padding:"13px"}}>{uploading?"Upload en cours...":"Publier le tournoi"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL INSCRIPTION ORGANISATEUR ──────────────────────────────────────────
function ModalInscription({onClose}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({prenom:"",nom:"",club:"",ville:"",email:"",tel:"",message:""});
  function go(){if(!form.prenom||!form.nom||!form.club||!form.email){alert("Remplir tous les champs *");return;}setStep(2);}
  return(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        {step===1?(<>
          <div className="modal-hdr">
            <div><div className="modal-title">Devenir organisateur</div><div className="modal-sub">Validé par notre équipe</div></div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="info-box">Une fois validé par mail, vous pourrez publier vos tournois.</div>
          {[["Prénom *","prenom","text"],["Nom *","nom","text"],["Club / Association *","club","text"],["Ville","ville","text"],["Email *","email","email"],["Téléphone","tel","tel"]].map(([l,k,t])=>(
            <div key={k} style={{marginBottom:10}}><label className="lbl">{l}</label><input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="field"/></div>
          ))}
          <div style={{marginBottom:18}}><label className="lbl">Message</label><textarea rows={2} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} className="field" style={{resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:9}}>
            <button className="btn btn-ghost" onClick={onClose} style={{flex:1}}>Annuler</button>
            <button className="btn btn-w" onClick={go} style={{flex:2,padding:"13px"}}>Envoyer</button>
          </div>
        </>):(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{width:52,height:52,background:"rgba(48,209,88,0.1)",border:"1px solid rgba(48,209,88,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 16px"}}>✅</div>
            <div className="modal-title" style={{marginBottom:6}}>Demande envoyée !</div>
            <div style={{color:"var(--t3)",fontSize:13,lineHeight:1.7,marginBottom:22}}>Nous reviendrons vers vous à <strong style={{color:"var(--blue2)"}}>{form.email}</strong>.</div>
            <button className="btn btn-w" onClick={onClose} style={{padding:"12px 28px"}}>Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── SPONSOR BLOCK COMPONENT ──────────────────────────────────────────────────
// tier: "gold" | "silver" | "bronze"
// sponsor: object | null (null = show placeholder on partners page)
// showEmpty: bool (show placeholder on partners page)
function SponsorBlock({sponsor,tier,showEmpty,index}){
  const cfg={
    gold:{label:"Partenaire Gold",gradient:"linear-gradient(180deg,#fef3c7,#fde68a)",accent:"#92400e",badge:"GOLD"},
    silver:{label:"Partenaire Silver",gradient:"linear-gradient(180deg,#f3f4f6,#e5e7eb)",accent:"#4b5563",badge:"SILVER"},
    bronze:{label:"Partenaire Bronze",gradient:"linear-gradient(180deg,#fed7aa,#fdba74)",accent:"#9a3412",badge:"BRONZE"},
  }[tier]||{label:"Partenaire",gradient:"linear-gradient(180deg,#f5f5f7,#e5e7eb)",accent:"#6e6e73",badge:"•"};

  if(!sponsor&&!showEmpty) return null;

  // Format compact pour silver/bronze
  if(tier!=="gold"){
    if(!sponsor&&showEmpty){
      return(
        <div style={{background:cfg.gradient,borderRadius:14,padding:"16px 14px",textAlign:"center",opacity:0.55,minHeight:tier==="silver"?110:90,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:5}}>
          <div style={{fontSize:9,fontWeight:600,color:cfg.accent,letterSpacing:1.2,textTransform:"uppercase"}}>{cfg.badge}</div>
          <div style={{fontSize:tier==="silver"?13:11,fontWeight:600,color:"#1d1d1f",opacity:0.6}}>Emplacement disponible</div>
        </div>
      );
    }
    return(
      <div style={{background:cfg.gradient,borderRadius:14,padding:"16px 14px",textAlign:"center",cursor:"pointer",transition:"all 0.3s var(--ease)",minHeight:tier==="silver"?110:90,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:tier==="silver"?6:4}}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 24px rgba(0,0,0,0.08)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
        <div style={{fontSize:9,fontWeight:600,color:cfg.accent,letterSpacing:1.2,textTransform:"uppercase"}}>{cfg.badge}</div>
        <div style={{width:tier==="silver"?38:28,height:tier==="silver"?38:28,borderRadius:9,overflow:"hidden",background:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:tier==="silver"?20:14,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.05))"}}>
          {sponsor.image?<img src={sponsor.image} alt={sponsor.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
            <span>{sponsor.emoji||"🏅"}</span>}
        </div>
        <div style={{fontSize:tier==="silver"?14:11,fontWeight:600,color:"#1d1d1f",letterSpacing:-0.2,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sponsor.nom||"Partenaire"}</div>
      </div>
    );
  }

  // GOLD = section produit principale type Apple
  if(!sponsor&&showEmpty){
    return(
      <div style={{background:cfg.gradient,borderRadius:18,padding:"28px 22px",textAlign:"center",opacity:0.6,border:"1px dashed rgba(146,64,14,0.2)"}}>
        <div style={{fontSize:10,fontWeight:600,color:cfg.accent,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>{cfg.label}</div>
        <div style={{fontSize:22,fontWeight:600,color:"#1d1d1f",letterSpacing:-0.3,marginBottom:6,opacity:0.7}}>Emplacement disponible</div>
        <div style={{fontSize:14,color:"#1d1d1f",opacity:0.55}}>Votre marque ici · Contactez-nous</div>
      </div>
    );
  }
  return(
    <div style={{background:cfg.gradient,borderRadius:18,padding:"28px 22px",textAlign:"center",cursor:"pointer",transition:"all 0.4s var(--ease)"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 24px 48px rgba(0,0,0,0.08)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
      <div style={{fontSize:10,fontWeight:600,color:cfg.accent,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>{cfg.label}</div>
      <div style={{width:54,height:54,borderRadius:14,background:"rgba(255,255,255,0.5)",margin:"0 auto 12px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.08))"}}>
        {sponsor.image?<img src={sponsor.image} alt={sponsor.nom} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:
          <span>{sponsor.emoji||"🏅"}</span>}
      </div>
      <div style={{fontSize:24,fontWeight:600,color:"#1d1d1f",letterSpacing:-0.3,marginBottom:6,lineHeight:1.1}}>{sponsor.nom||"Partenaire"}</div>
      {sponsor.texte&&<div style={{fontSize:15,color:"#1d1d1f",opacity:0.7,marginBottom:14,lineHeight:1.3}}>{sponsor.texte}</div>}
      <button className="link link-sm">En savoir plus</button>
    </div>
  );
}

// ─── PAGE CALENDRIER ──────────────────────────────────────────────────────────
function PageCalendrier({tournois,setTournois,currentUser,sponsors,inscrits,onGoAdmin,onShowOrga,showEmpty,visitesStats}){
  const today=new Date();
  const [annee,setAnnee]=useState(today.getFullYear());
  const [mois,setMois]=useState(today.getMonth());
  const [selected,setSelected]=useState(null);
  const [showDetail,setShowDetail]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [preselectedDate,setPreselectedDate]=useState(null);
  const [nextId,setNextId]=useState(100);
  const jours=gj(annee,mois);
  const tbd={};
  tournois.forEach(t=>{if(!tbd[t.date])tbd[t.date]=[];tbd[t.date].push(t);});
  function pm(){if(mois===0){setMois(11);setAnnee(a=>a-1);}else setMois(m=>m-1);setSelected(null);}
  function nm(){if(mois===11){setMois(0);setAnnee(a=>a+1);}else setMois(m=>m+1);setSelected(null);}
  const prochains=[...tournois].filter(t=>t.date>=today.toISOString().slice(0,10)).sort((a,b)=>a.date.localeCompare(b.date));
  const selT=selected?(tbd[selected]||[]):[];
  const displayT=selected?selT:prochains;
  const activeSponsors=sponsors.filter(s=>s.actif);
  const typeEmoji={"Beach Volley":"🏖️","Green Volley":"🌿","Volley Indoor":"🏟️","Mixte":"⚡","Loisir":"😎"};
  const typeTagClass={"Beach Volley":"tag-b","Green Volley":"tag-g","Volley Indoor":"tag","Mixte":"tag-y","Loisir":"tag"};

  // Sponsor slots by tier
  const goldSponsor = showEmpty ? FAKE_SPONSORS[0] : (activeSponsors[0]||null);
  const silverSponsors = showEmpty ? [FAKE_SPONSORS[1],FAKE_SPONSORS[2]] : [activeSponsors[1]||null,activeSponsors[2]||null];
  const bronzeSponsors = showEmpty
    ? [FAKE_SPONSORS[0],FAKE_SPONSORS[1],FAKE_SPONSORS[2],FAKE_SPONSORS[0]]
    : [activeSponsors[3]||null,activeSponsors[4]||null,activeSponsors[5]||null,null];
  const hasBronze = showEmpty || bronzeSponsors.some(Boolean);
  const hasSilver = showEmpty || silverSponsors.some(Boolean);

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"28px 16px 60px"}}>
      {showDetail&&<ModalTournoi tournoi={showDetail} onClose={()=>setShowDetail(null)}/>}
      {showForm&&<ModalFormTournoi tournois={tournois} onClose={()=>{setShowForm(false);setPreselectedDate(null);}} initialDate={preselectedDate} onSubmit={async (form, afficheFile)=>{
        try {
          const t = await createTournoi(form, afficheFile, currentUser?.email||"");
          setTournois(prev=>[...prev, t]);
          setShowForm(false);
          const[y,m]=form.date.split("-");
          setAnnee(parseInt(y)); setMois(parseInt(m)-1); setSelected(form.date);
        } catch(e){ alert("Erreur publication : "+e.message); console.error(e); }
      }}/>}

      {/* ── GOLD SPONSOR (au-dessus de tout) ── */}
      {(showEmpty||goldSponsor)&&(
        <div style={{marginBottom:24}}>
          <SponsorBlock sponsor={goldSponsor} tier="gold" showEmpty={showEmpty&&!goldSponsor}/>
        </div>
      )}

      {/* Salutation - hero style Apple */}
      {/* Bouton publier pour organisateur connecté */}
      {currentUser?.role==="organisateur"&&(
        <div style={{textAlign:"center",padding:"24px 0 20px"}}>
          <div style={{fontSize:13,fontWeight:500,color:"var(--t3)",marginBottom:4}}>Salut {currentUser.prenom} 👋</div>
          <div style={{fontSize:11,color:"var(--t4)",letterSpacing:1.2,textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Organisateur</div>
          <button className="btn btn-w" onClick={()=>setShowForm(true)} style={{width:"100%"}}>+ Publier un tournoi</button>
        </div>
      )}

      {/* Bouton devenir organisateur pour visiteur non connecté */}
      {!currentUser&&(
        <div style={{textAlign:"center",padding:"16px 0 20px"}}>
          <button className="btn btn-ghost" onClick={onShowOrga} style={{width:"100%",fontSize:13}}>🏆 Espace organisateur</button>
        </div>
      )}

      {/* Stats pills */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",justifyContent:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(0,0,0,0.04)",borderRadius:50,padding:"6px 14px"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{visitesStats?.moyenne??"—"}</span>
          <span style={{fontSize:12,color:"var(--t3)"}}>visites/jour</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(0,0,0,0.04)",borderRadius:50,padding:"6px 14px"}}>
          <span style={{fontSize:12}}>🏆</span>
          <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{tournois.length}</span>
          <span style={{fontSize:12,color:"var(--t3)"}}>tournoi{tournois.length!==1?"s":""}</span>
        </div>
      </div>

      {/* ── SILVER SPONSORS (après les stats) ── */}
      {hasSilver&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
          {silverSponsors.map((sp,i)=>(
            <SponsorBlock key={i} sponsor={sp} tier="silver" showEmpty={showEmpty&&!sp}/>
          ))}
        </div>
      )}

      {/* CALENDRIER */}
      <div className="cal-wrap">
        <div className="cal-nav">
          <button className="cal-arrow" onClick={pm}>‹</button>
          <div className="cal-month">{MOIS[mois]} {annee}</div>
          <button className="cal-arrow" onClick={nm}>›</button>
        </div>
        <div className="cal-dh">
          {["D","L","M","M","J","V","S"].map((j,i)=><div key={i} className="cal-dn">{j}</div>)}
        </div>
        <div className="cal-grid">
          {jours.map((jour,i)=>{
            const d=jour?fd(annee,mois,jour):null;
            const ht=d&&tbd[d];
            const it=d===today.toISOString().slice(0,10);
            const is=d===selected;
            return(
              <div key={i} className={`cal-cell${is?" sel":""}`} onClick={()=>{
                if(!jour) return;
                setSelected(d===selected?null:d);
                if(currentUser?.role==="organisateur"&&d!==selected){
                  // Show "Ajouter ici" hint — handled below
                }
              }}>
                {jour&&(<>
                  <div className={`cal-num${it?" td":""}`}>{jour}</div>
                  {ht&&<div style={{display:"flex",flexWrap:"wrap",gap:1,marginTop:1}}>{tbd[d].map((_,ti)=><div key={ti} className="cal-dot"/>)}</div>}
                </>)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BRONZE SPONSORS (entre calendrier et tournois) ── */}
      {hasBronze&&(
        <div style={{marginTop:20,marginBottom:20}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:9}}>
            {bronzeSponsors.map((sp,i)=>(
              <SponsorBlock key={i} sponsor={sp} tier="bronze" showEmpty={showEmpty&&!sp}/>
            ))}
          </div>
        </div>
      )}

      {/* Légende sélection */}
      {selected&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,padding:"0 4px"}}>
          <div style={{fontSize:20,fontWeight:600,color:"var(--t1)",letterSpacing:-0.3}}>
            {selT.length>0?`${selT.length} tournoi${selT.length>1?"s":""} · ${selected.split("-").reverse().join("/")}`:
            `Aucun tournoi le ${selected.split("-").reverse().join("/")}`}
          </div>
          <button onClick={()=>setSelected(null)} className="link link-sm">Tout voir</button>
        </div>
      )}
      {/* Bouton "Ajouter un tournoi ici" pour organisateur connecté */}
      {selected&&currentUser?.role==="organisateur"&&(
        <div style={{marginBottom:16}}>
          <button
            onClick={()=>{
              // Pré-sélectionner la date dans le form
              setShowForm(true);
              // On stocke la date pré-sélectionnée dans un état dédié
              setPreselectedDate(selected);
            }}
            style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"rgba(0,102,204,0.06)",border:"1.5px dashed rgba(0,102,204,0.3)",borderRadius:14,padding:"14px 18px",cursor:"pointer",transition:"all 0.18s",fontFamily:"inherit"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,102,204,0.1)";e.currentTarget.style.borderColor="rgba(0,102,204,0.5)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,102,204,0.06)";e.currentTarget.style.borderColor="rgba(0,102,204,0.3)";}}>
            <div style={{width:34,height:34,borderRadius:9,background:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:"white",fontSize:18,lineHeight:1}}>+</span>
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--blue)"}}>Ajouter un tournoi ici</div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>Le {selected.split("-").reverse().join("/")}</div>
            </div>
          </button>
        </div>
      )}
      {!selected&&displayT.length>0&&(
        <div style={{textAlign:"center",marginBottom:22,marginTop:8}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",letterSpacing:1.5,textTransform:"uppercase"}}>Prochains tournois</div>
        </div>
      )}

      {/* CARTES TOURNOIS */}
      {displayT.length===0?
        <div style={{textAlign:"center",padding:"60px 20px",color:"var(--t3)"}}>
          <div style={{fontSize:36,marginBottom:14,opacity:0.4}}>📅</div>
          <div style={{fontSize:15,fontWeight:500,color:"var(--t1)",marginBottom:4}}>Aucun tournoi pour l'instant</div>
          <div style={{fontSize:13,color:"var(--t3)"}}>{currentUser?.role==="organisateur"?"Soyez le premier à publier un tournoi !":"Les prochains tournois apparaîtront ici."}</div>
        </div>:
        <div className="t-cards-grid">
          {displayT.map(t=>{
            const tagCls=typeTagClass[t.type]||"tag";
            const typeGrad={
              "Beach Volley":"linear-gradient(180deg,#dbeafe,#bfdbfe)",
              "Green Volley":"linear-gradient(180deg,#d1fae5,#a7f3d0)",
              "Volley Indoor":"linear-gradient(180deg,#f3f4f6,#e5e7eb)",
              "Mixte":"linear-gradient(180deg,#fef3c7,#fde68a)",
              "Loisir":"linear-gradient(180deg,#fce7f3,#fbcfe8)",
            }[t.type]||"linear-gradient(180deg,#f5f5f7,#e5e7eb)";
            return(
              <div key={t.id} className="t-card" onClick={()=>setShowDetail(t)}>
                {t.affiche?
                  <img src={t.affiche} alt="" className="t-card-cover"/>:
                  <div className="t-card-cover" style={{background:typeGrad}}>{typeEmoji[t.type]||"🏐"}</div>
                }
                <div className="t-card-body">
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10}}>
                    <div className="t-card-name">{t.nom}</div>
                    <span className={tagCls} style={{flexShrink:0,marginTop:2}}>{t.type}</span>
                  </div>
                  <div className="t-card-meta">
                    <div className="t-meta-row"><span>📅</span><span>{t.date.split("-").reverse().join("/")} {t.heure&&`· ${t.heure}`}</span></div>
                    <div className="t-meta-row"><span>📍</span><span>{t.lieu}{t.ville&&`, ${t.ville}`}</span></div>
                    <div className="t-meta-row"><span>👥</span><span>{t.joueurs} équipes max</span></div>
                    <div className="t-meta-row"><span>🏛️</span><span>{t.organisateur}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ─── PAGE CARTE ───────────────────────────────────────────────────────────────
function PageCarte({tournois}){
  const lieux=[...new Map(tournois.filter(t=>t.lat&&t.lng).map(t=>[`${t.lat},${t.lng}`,t])).values()];
  const bounds=lieux.length>0?lieux.map(t=>`${t.lat},${t.lng}`).join("|"):"-21.1151,55.5364";
  const mapUrl=`https://www.openstreetmap.org/export/embed.html?bbox=55.16%2C-21.42%2C55.84%2C-20.85&layer=mapnik&marker=-21.1151%2C55.5364`;
  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"28px 16px 60px"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Carte des tournois</div>
        <div style={{fontSize:13,color:"var(--t3)"}}>Tous les lieux de tournois sur l'île</div>
      </div>
      <div className="map-wrap">
        <iframe
          title="Carte La Réunion"
          src={mapUrl}
          style={{width:"100%",height:"100%",border:"none",filter:"invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)"}}
          loading="lazy"
        />
      </div>
      {/* Liste des lieux */}
      <div style={{marginTop:24}}>
        <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",letterSpacing:0.8,textTransform:"uppercase",marginBottom:12}}>{tournois.length} tournoi{tournois.length!==1?"s":""} référencé{tournois.length!==1?"s":""}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[...tournois].sort((a,b)=>a.date.localeCompare(b.date)).map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:12,padding:"12px 14px"}}>
              <div style={{width:36,height:36,borderRadius:9,background:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                {{"Beach Volley":"🏖️","Green Volley":"🌿","Volley Indoor":"🏟️","Mixte":"⚡","Loisir":"😎"}[t.type]||"🏐"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.nom}</div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>📍 {t.lieu}{t.ville&&`, ${t.ville}`} · 📅 {t.date.split("-").reverse().join("/")}</div>
              </div>
              <span style={{fontSize:11,color:"var(--t3)",flexShrink:0}}>{t.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PARTENAIRES (privée) ────────────────────────────────────────────────
function PagePartenaires({onBack,tournois,inscrits}){
  const [pwOK,setPwOK]=useState(false);
  const [pw,setPw]=useState("");
  const [pwErr,setPwErr]=useState(false);
  // Mot de passe test (à sécuriser plus tard)
  const PARTENAIRES_PW="partenaires974";

  function checkPw(){
    if(pw===PARTENAIRES_PW){setPwOK(true);}
    else{setPwErr(true);setTimeout(()=>setPwErr(false),2000);}
  }

  if(!pwOK){
    return(
      <div className="intro-page">
        <style>{CSS}</style>
        <div style={{position:"absolute",top:0,left:0,right:0}}><div className="strip"/></div>
        <div className="intro-card" style={{maxWidth:360}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <img src={LOGO_B64} alt="VolleyPéi" style={{width:56,height:56,borderRadius:14,margin:"0 auto 14px",display:"block",boxShadow:"0 6px 24px rgba(37,99,235,0.2)"}}/>
            <div style={{fontSize:19,fontWeight:800,letterSpacing:-0.4,marginBottom:4}}>Espace Partenaires</div>
            <div style={{fontSize:13,color:"var(--t3)",lineHeight:1.5}}>Aperçu exclusif réservé aux partenaires</div>
          </div>
          {pwErr&&<div className="err-box" style={{textAlign:"center"}}>Code d'accès incorrect</div>}
          <div style={{marginBottom:20}}>
            <label className="lbl">Code d'accès</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&checkPw()} className="field" placeholder="••••••••••••" style={{fontSize:16}}/>
          </div>
          <button className="btn btn-w" onClick={checkPw} style={{width:"100%",padding:"13px",fontSize:15}}>Accéder →</button>
          <button onClick={onBack} className="btn btn-ghost" style={{width:"100%",marginTop:9,padding:"12px"}}>← Retour</button>
          <p style={{fontSize:11,color:"var(--t4)",textAlign:"center",marginTop:12}}>Accès réservé · Confidentiel</p>
        </div>
      </div>
    );
  }

  // Vue partenaires = vraie page publique avec tous les emplacements visibles
  const DUMMY_SPONSORS = Array.from({length:6},(_,i)=>FAKE_SPONSORS[i%FAKE_SPONSORS.length]);
  const DUMMY_INSCRITS = [...inscrits,...Array.from({length:Math.max(0,12-inscrits.length)},(_,i)=>({prenom:"Joueur",email:"demo@volleypei.re"}))];

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <style>{CSS}</style>

      {/* NAV — identique à la vraie */}
      <nav className="nav">
        <div className="nav-in">
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <img src={LOGO_B64} alt="VolleyPéi" style={{width:28,height:28,borderRadius:7,flexShrink:0}}/>
            <span style={{fontSize:15,fontWeight:700,letterSpacing:-0.3}} className="nl">VolleyPéi</span>
          </div>
          <div className="nav-tabs">
            <button className="nav-tab on">Calendrier</button>
            <button className="nav-tab">Carte</button>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={onBack} style={{background:"rgba(0,0,0,0.04)",border:"none",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",padding:"6px 14px",borderRadius:980,fontFamily:"inherit",letterSpacing:-0.1}}>← Retour</button>
          </div>
        </div>
      </nav>
      <div style={{height:3,background:"linear-gradient(90deg,var(--re-b) 0% 33%,var(--re-y) 33% 66%,var(--re-r) 66% 100%)",opacity:1,marginTop:48}}/>

      {/* Bandeau aperçu */}
      <div style={{background:"linear-gradient(90deg,rgba(0,102,204,0.06),rgba(48,166,83,0.04))",borderBottom:"1px solid rgba(0,102,204,0.12)",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"var(--blue)",animation:"pulse 1.8s infinite"}}/>
        <span style={{fontSize:12,fontWeight:500,color:"var(--blue)",letterSpacing:0.2}}>Aperçu partenaires · Tous les emplacements sont affichés</span>
      </div>

      {/* Vraie page calendrier avec showEmpty=true */}
      <div className="page" style={{paddingTop:0}}>
        <PageCalendrier
          tournois={tournois}
          setTournois={()=>{}}
          currentUser={{prenom:"Kevin",role:"organisateur"}}
          sponsors={DUMMY_SPONSORS}
          inscrits={DUMMY_INSCRITS}
          onGoAdmin={()=>{}}
          onShowOrga={()=>setShowOrga(true)}
          showEmpty={true}
        />
      </div>
    </div>
  );
}
function clamp(min,max){return `clamp(${min}px, 4vw, ${max}px)`;}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [showSplash,setShowSplash]=useState(true);
  const [showIntro,setShowIntro]=useState(true); // choix visiteur/organisateur
  const [page,setPage]=useState("home");
  const [currentUser,setCurrentUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [inscrits,setInscrits]=useState([]);
  const [sponsors,setSponsors]=useState(INIT_SP);
  const [tournois,setTournois]=useState([]);
  const [showOrga,setShowOrga]=useState(false); // modal organisateur
  const [visitesStats,setVisitesStats]=useState(null);
  const [adhesions,setAdhesions]=useState([]);
  const [showPopup,setShowPopup]=useState(false);

  // ── Chargement initial + session organisateur ────────────────────────────
  useEffect(()=>{
    if(window.location.hash==="#partenaires") setPage("partenaires");

    // Tournois publics — visibles sans connexion
    getAllTournois().then(ts=>setTournois(ts)).catch(()=>{});

    // Stats visites publiques
    getVisitesStats(30).then(v=>setVisitesStats(v)).catch(()=>{});

    // Compteur de visites
    enregistrerVisite().catch(()=>{});

    // Écoute connexion organisateur depuis la modal
    const handleOrgaLogin = (e) => {
      if(e.detail){ setCurrentUser(e.detail); }
    };
    window.addEventListener("orga-login", handleOrgaLogin);

    // Session organisateur persistante
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session)=>{
      if(session?.user){
        const email = session.user.email;
        try {
          const orga = await getOrganisateurByEmail(email);
          if(orga) setCurrentUser({...orga, role:"organisateur"});
        } catch(e){ console.warn(e); }
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    });

    return () => { subscription.unsubscribe(); window.removeEventListener("orga-login", handleOrgaLogin); };
  },[]);

  async function loadInscrits(){ getAllJoueurs().then(js=>setInscrits(js)).catch(()=>{}); }

  async function handleLogout(){
    await signOut();
    setCurrentUser(null);
  }

  if(showSplash) return <SplashScreen onDone={()=>setShowSplash(false)}/>;
  if(showIntro) return <PageIntro onVisiteur={()=>setShowIntro(false)} onOrganisateur={()=>{setShowIntro(false);setShowOrga(true);}}/>;
  if(page==="partenaires") return <PagePartenaires onBack={()=>setPage("home")} tournois={tournois} inscrits={inscrits}/>;
  if(page==="login") return <LoginAdmin onLogin={()=>setPage("admin")} onBack={()=>setPage("home")} onRetourAccueil={()=>{setPage("home");setShowIntro(true);setCurrentUser(null);signOut().catch(()=>{})}}/>;
  if(page==="admin") return <PanneauAdmin sponsors={sponsors} setSponsors={setSponsors} inscrits={inscrits} setInscrits={setInscrits} tournois={tournois} setTournois={setTournois} adhesions={adhesions} setAdhesions={setAdhesions} getAllAdhesions={getAllAdhesions} getAllJoueurs={getAllJoueurs} onBack={()=>{loadInscrits();setPage("home");}} onRetourAccueil={()=>{setPage("home");setShowIntro(true);setCurrentUser(null);signOut().catch(()=>{});}}/>;

  return(
    <>
      <style>{CSS}</style>
      {showOrga&&<ModalOrganisateur onClose={()=>setShowOrga(false)} adhesions={adhesions} setAdhesions={setAdhesions}/>}

      {/* VIDEO POPUP */}
      {showPopup&&(
        <div className="overlay" onClick={()=>setShowPopup(false)}>
          <div style={{width:"min(600px,94vw)",background:"var(--s1)",border:"1px solid var(--b2)",borderRadius:22,overflow:"hidden",boxShadow:"0 30px 70px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:"linear-gradient(90deg,#0071e3,#2997ff)",padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{color:"white",fontSize:12,fontWeight:600,letterSpacing:0.5}}>⭐ ESPACE PARTENAIRE</span>
              <button onClick={()=>setShowPopup(false)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",width:26,height:26,borderRadius:"50%",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{paddingBottom:"52%",position:"relative",background:"#050505"}}>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
                <div style={{width:62,height:62,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>▶</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:15,fontWeight:300}}>Votre vidéo ici</div>
                <div style={{color:"rgba(255,255,255,0.2)",fontSize:11}}>Emplacement vidéo partenaire</div>
              </div>
            </div>
            <div style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div><div style={{fontWeight:600,fontSize:13}}>Votre vidéo ici</div><div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>Partenaire officiel VolleyPéi</div></div>
              <button className="btn btn-w btn-sm" onClick={()=>setShowPopup(false)}>Voir le calendrier →</button>
            </div>
          </div>
        </div>
      )}

      <div className="page">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-in">
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <img src={LOGO_B64} alt="VolleyPéi" style={{width:28,height:28,borderRadius:7,flexShrink:0}}/>
              <span style={{fontSize:15,fontWeight:700,letterSpacing:-0.3}} className="nl">VolleyPéi</span>
            </div>
            <div className="nav-tabs">
              <button className={`nav-tab ${page==="home"?"on":""}`} onClick={()=>setPage("home")}>Calendrier</button>
              <button className={`nav-tab ${page==="carte"?"on":""}`} onClick={()=>setPage("carte")}>Carte</button>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>setPage("partenaires")} style={{background:"none",border:"none",color:"var(--t3)",fontSize:12,fontWeight:500,cursor:"pointer",padding:"5px 11px",borderRadius:7,fontFamily:"inherit",letterSpacing:-0.1,transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}>Partenaires</button>
              <button style={{background:"rgba(0,0,0,0.04)",border:"none",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",padding:"6px 14px",borderRadius:980,fontFamily:"inherit",letterSpacing:-0.1,transition:"all 0.15s"}} onClick={()=>setPage("login")}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,0.08)";e.currentTarget.style.color="var(--t1)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0.04)";e.currentTarget.style.color="var(--t2)";}}>Admin</button>
              <button style={{background:"none",border:"none",color:"var(--t3)",fontSize:12,fontWeight:500,cursor:"pointer",padding:"5px 11px",borderRadius:7,fontFamily:"inherit",letterSpacing:-0.1,transition:"color 0.15s"}}
                onClick={()=>{setShowIntro(true);setCurrentUser(null);signOut().catch(()=>{});}}
                onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}>⌂ Accueil</button>
              {currentUser?.role==="organisateur"&&<button onClick={handleLogout} style={{background:"none",border:"none",color:"var(--t4)",fontSize:12,cursor:"pointer",padding:"5px 10px",borderRadius:980,fontFamily:"inherit",transition:"color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.color="var(--red)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t4)"}>Déconnexion</button>}
            </div>
          </div>
        </nav>

        {/* Bande drapeau sous la nav */}
        <div style={{height:3,background:"linear-gradient(90deg,var(--re-b) 0% 33%,var(--re-y) 33% 66%,var(--re-r) 66% 100%)",opacity:1}}/>

        {/* PAGES */}
        {page==="home"&&<PageCalendrier tournois={tournois} setTournois={setTournois} currentUser={currentUser} sponsors={sponsors} inscrits={inscrits} onGoAdmin={()=>setPage("login")} onShowOrga={()=>setShowOrga(true)} visitesStats={visitesStats} onRetourAccueil={()=>{setShowIntro(true);setCurrentUser(null);signOut().catch(()=>{});}}/>}
        {page==="carte"&&<PageCarte tournois={tournois}/>}
      </div>
    </>
  );
}

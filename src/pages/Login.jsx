import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { loginApi } from '../api/auth'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Stained glass panel shimmer ── */
@keyframes panelPulse{
  0%,100%{opacity:var(--base,0.28)}
  50%{opacity:calc(var(--base,0.28)*1.45)}
}
/* ── Light ray drift ── */
@keyframes rayDrift{
  0%,100%{transform:skewX(-6deg) translateX(0);opacity:0.18}
  50%{transform:skewX(4deg) translateX(22px);opacity:0.32}
}
/* ── Liquid metal blob morph ── */
@keyframes morphA{
  0%,100%{border-radius:54% 46% 60% 40%/44% 58% 42% 56%}
  33%{border-radius:40% 60% 44% 56%/60% 38% 58% 42%}
  66%{border-radius:58% 42% 50% 50%/40% 56% 52% 48%}
}
@keyframes morphB{
  0%,100%{border-radius:46% 54% 52% 48%/58% 42% 60% 40%}
  40%{border-radius:60% 40% 46% 54%/40% 60% 42% 58%}
  70%{border-radius:48% 52% 58% 42%/52% 46% 56% 44%}
}
@keyframes morphC{
  0%,100%{border-radius:52% 48% 44% 56%/46% 52% 56% 44%}
  50%{border-radius:44% 56% 58% 42%/58% 44% 46% 54%}
}
/* ── Blob drifts ── */
@keyframes driftA{
  0%,100%{transform:translate(0,0)}
  35%{transform:translate(40px,-28px)}
  68%{transform:translate(-22px,34px)}
}
@keyframes driftB{
  0%,100%{transform:translate(0,0)}
  42%{transform:translate(-50px,22px)}
  72%{transform:translate(28px,-38px)}
}
@keyframes driftC{
  0%,100%{transform:translate(0,0)}
  50%{transform:translate(32px,28px)}
}
/* ── Metal iridescent sweep ── */
@keyframes iridSweep{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
/* ── Ferrofluid border morph ── */
@keyframes ferroBR{
  0%,100%{border-radius:18px}
  16%{border-radius:20px 16px 19px 17px}
  32%{border-radius:16px 20px 17px 21px}
  48%{border-radius:21px 17px 20px 16px}
  64%{border-radius:17px 21px 16px 20px}
  80%{border-radius:19px 15px 21px 17px}
}
/* ── Ferrofluid glow pulse ── */
@keyframes ferroGlow{
  0%,100%{opacity:0.6;filter:blur(14px)}
  50%{opacity:1;filter:blur(10px)}
}
/* ── Ferrofluid border sweep ── */
@keyframes ferroBorderSweep{
  0%{background-position:0% 0%}
  50%{background-position:100% 100%}
  100%{background-position:0% 0%}
}
/* ── Logo rings ── */
@keyframes ringCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ringCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes logoPulse{
  0%,100%{box-shadow:0 0 0 0 rgba(160,130,240,0.35)}
  60%{box-shadow:0 0 0 12px rgba(160,130,240,0)}
}
/* ── Entrance ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
/* ── Input scan ── */
@keyframes scanBeam{from{transform:translateX(-100%)}to{transform:translateX(500%)}}
/* ── Error shake ── */
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
/* ── Spinner ── */
@keyframes spin{to{transform:rotate(360deg)}}

/* ══════════════════════════════
   ROOT
══════════════════════════════ */
.lr{
  min-height:100vh;
  background:#06040f;
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Sans',sans-serif;
  overflow:hidden;position:relative;padding:24px;
}

/* ══════════════════════════════
   LAYER 1 — STAINED GLASS
   Full background tiling with
   real geometric jewel panels
══════════════════════════════ */
.glass-bg{
  position:absolute;inset:0;pointer-events:none;
  overflow:hidden;
}
.glass-svg{
  position:absolute;inset:0;width:100%;height:100%;
}
/* Light rays cutting through panels */
.ray{
  position:absolute;top:0;bottom:0;
  pointer-events:none;
  animation:rayDrift ease-in-out infinite;
}

/* ══════════════════════════════
   LAYER 2 — LIQUID METAL
   Large iridescent chrome blobs
══════════════════════════════ */
.metal-layer{
  position:absolute;inset:0;pointer-events:none;overflow:hidden;
}
.mblob{
  position:absolute;
  filter:blur(60px);
  mix-blend-mode:screen;
}
.mb1{
  width:560px;height:460px;top:-140px;left:-120px;
  background:radial-gradient(ellipse at 42% 42%,
    rgba(210,195,255,0.28) 0%,
    rgba(150,100,230,0.16) 40%,
    rgba(80,40,180,0.08) 65%,
    transparent 80%);
  animation:morphA 18s ease-in-out infinite, driftA 26s ease-in-out infinite;
}
.mb2{
  width:480px;height:400px;bottom:-120px;right:-100px;
  background:radial-gradient(ellipse at 56% 48%,
    rgba(200,220,255,0.22) 0%,
    rgba(120,80,210,0.14) 40%,
    rgba(60,30,160,0.07) 65%,
    transparent 80%);
  animation:morphB 22s ease-in-out infinite 5s, driftB 30s ease-in-out infinite;
}
.mb3{
  width:340px;height:300px;top:35%;left:45%;
  background:radial-gradient(ellipse at 50% 50%,
    rgba(255,240,210,0.14) 0%,
    rgba(200,150,80,0.08) 45%,
    transparent 70%);
  animation:morphC 26s ease-in-out infinite 8s, driftC 20s ease-in-out infinite;
}
/* Iridescent chrome surface shimmer */
.msheen{
  position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(
    112deg,
    transparent 0%,
    rgba(190,180,240,0.04) 28%,
    rgba(230,220,255,0.07) 50%,
    rgba(190,180,240,0.04) 72%,
    transparent 100%
  );
  background-size:300% 300%;
  animation:iridSweep 14s ease infinite;
}

/* ══════════════════════════════
   CARD WRAPPER + FERROFLUID
══════════════════════════════ */
.card-wrap{
  position:relative;z-index:10;
  width:100%;max-width:420px;
  animation:fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both;
}

/* Ferrofluid outer diffuse aura */
.ferro-aura{
  position:absolute;inset:-12px;pointer-events:none;
  background:linear-gradient(
    135deg,
    rgba(140,100,240,0.22) 0%,
    rgba(80,50,180,0.16) 30%,
    rgba(30,15,80,0.08) 55%,
    rgba(80,50,180,0.16) 75%,
    rgba(140,100,240,0.22) 100%
  );
  background-size:250% 250%;
  border-radius:24px;
  animation:ferroBR 9s ease-in-out infinite, ferroGlow 5s ease-in-out infinite, ferroBorderSweep 7s linear infinite;
  z-index:0;
}
/* Ferrofluid crisp border ring */
.ferro-ring{
  position:absolute;inset:-1px;pointer-events:none;
  background:linear-gradient(
    135deg,
    rgba(180,150,255,0.7) 0%,
    rgba(100,70,200,0.5) 20%,
    rgba(50,30,120,0.3) 40%,
    rgba(180,150,255,0.15) 50%,
    rgba(50,30,120,0.3) 60%,
    rgba(100,70,200,0.5) 80%,
    rgba(180,150,255,0.7) 100%
  );
  background-size:300% 300%;
  border-radius:19px;
  animation:ferroBR 9s ease-in-out infinite, ferroBorderSweep 6s linear infinite;
  z-index:0;
}

/* ── CARD INNER ── */
.card{
  position:relative;z-index:1;
  background:rgba(8,6,18,0.92);
  backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
  border-radius:18px;
  border:1px solid rgba(255,255,255,0.06);
  padding:42px 38px 38px;
  overflow:hidden;
}
/* Top glass highlight edge */
.card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,
    transparent,
    rgba(255,255,255,0.12) 30%,
    rgba(255,255,255,0.22) 50%,
    rgba(255,255,255,0.12) 70%,
    transparent);
  pointer-events:none;
}
/* Subtle stained glass colour leak into card corners */
.card::after{
  content:'';position:absolute;inset:0;border-radius:18px;pointer-events:none;
  background:
    radial-gradient(ellipse at 0% 0%,   rgba(100,10,30,0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 0%,  rgba(10,25,110,0.09) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%,  rgba(60,8,100,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%,rgba(10,80,30,0.07) 0%, transparent 50%);
}

/* ══════════════════════════════
   LOGO
══════════════════════════════ */
.logo-area{
  display:flex;flex-direction:column;align-items:center;
  margin-bottom:32px;
  animation:fadeIn 0.7s ease 0.2s both;
}
.logo-icon-wrap{position:relative;width:58px;height:58px;margin-bottom:16px}
.ring-outer{
  position:absolute;inset:-8px;border-radius:50%;
  border:1px solid rgba(160,130,240,0.25);
  animation:ringCW 20s linear infinite;
}
.ring-outer::before{
  content:'';position:absolute;top:-3px;left:50%;transform:translateX(-50%);
  width:6px;height:6px;border-radius:50%;
  background:rgba(160,130,240,0.8);
  box-shadow:0 0 8px rgba(160,130,240,0.6),0 0 16px rgba(160,130,240,0.3);
}
.ring-inner{
  position:absolute;inset:-2px;border-radius:50%;
  border:1px dashed rgba(160,130,240,0.14);
  animation:ringCCW 13s linear infinite;
}
.logo-icon-box{
  width:58px;height:58px;border-radius:15px;
  background:linear-gradient(145deg,#110e24,#1e1540);
  border:1px solid rgba(160,130,240,0.22);
  display:flex;align-items:center;justify-content:center;
  position:relative;z-index:1;
  animation:logoPulse 3.8s ease-in-out infinite;
}
.brand-name{
  font-size:21px;font-weight:600;letter-spacing:0.20em;
  background:linear-gradient(90deg,#d0c0f8 0%,#fff 45%,#d0c0f8 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  display:block;margin-bottom:5px;
}
.brand-sub{
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.34em;
  color:rgba(160,130,240,0.40);text-transform:uppercase;
}

/* ══════════════════════════════
   DIVIDER
══════════════════════════════ */
.divider{
  display:flex;align-items:center;gap:12px;margin-bottom:26px;
  animation:fadeIn 0.5s ease 0.3s both;
}
.div-line{flex:1;height:1px;background:rgba(255,255,255,0.07)}
.div-text{
  font-family:'DM Mono',monospace;font-size:10px;
  color:rgba(255,255,255,0.22);letter-spacing:0.14em;white-space:nowrap;
}

/* ══════════════════════════════
   ERROR
══════════════════════════════ */
.err-box{
  background:rgba(160,20,50,0.10);
  border:1px solid rgba(180,35,65,0.25);
  border-radius:10px;padding:11px 14px;
  display:flex;gap:10px;align-items:flex-start;
  margin-bottom:20px;animation:shake 0.4s ease;
}
.err-dot{width:5px;height:5px;border-radius:50%;background:#c03050;flex-shrink:0;margin-top:5px}
.err-msg{font-size:12px;color:rgba(220,130,148,0.9);line-height:1.55;font-weight:400}

/* ══════════════════════════════
   FORM
══════════════════════════════ */
.fields{display:flex;flex-direction:column;gap:18px}
.fg{animation:fadeUp 0.5s ease both}
.fg:nth-child(1){animation-delay:0.34s}
.fg:nth-child(2){animation-delay:0.42s}
.flabel{
  display:block;font-size:11px;font-weight:500;letter-spacing:0.06em;
  color:rgba(255,255,255,0.38);margin-bottom:7px;text-transform:uppercase;
}
.fi-wrap{position:relative}
.fi{
  width:100%;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.09);
  border-radius:10px;padding:12px 15px;
  color:#fff;font-family:'DM Sans',sans-serif;
  font-size:14px;font-weight:400;outline:none;
  transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
}
.fi::placeholder{color:rgba(255,255,255,0.18);font-weight:300}
.fi:focus{
  border-color:rgba(150,120,230,0.55);
  background:rgba(150,120,230,0.05);
  box-shadow:0 0 0 3px rgba(150,120,230,0.10);
}
.fi.err{border-color:rgba(180,35,65,0.48);box-shadow:0 0 0 3px rgba(180,35,65,0.08)}
.fi.eye{padding-right:44px}
/* Purple scan sweep on focus */
.sw{position:absolute;inset:0;border-radius:10px;overflow:hidden;pointer-events:none}
.sb{position:absolute;top:0;bottom:0;width:38px;opacity:0;background:linear-gradient(90deg,transparent,rgba(150,120,230,0.18),transparent)}
.fi:focus~.sw .sb{opacity:1;animation:scanBeam 0.85s ease forwards}
.eye-btn{
  position:absolute;right:12px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;padding:4px;
  color:rgba(255,255,255,0.24);display:flex;align-items:center;transition:color 0.15s;
}
.eye-btn:hover{color:rgba(150,120,230,0.75)}
.ferr{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(210,110,128,0.9);margin-top:6px}
.ferr-dot{width:3px;height:3px;border-radius:50%;background:rgba(200,80,100,0.8);flex-shrink:0}

/* ══════════════════════════════
   SUBMIT BUTTON
══════════════════════════════ */
.sub-wrap{margin-top:26px;animation:fadeUp 0.5s ease 0.5s both}
.sub-btn{
  width:100%;padding:13px 24px;border:none;border-radius:10px;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;letter-spacing:0.04em;
  position:relative;overflow:hidden;
  transition:transform 0.15s,box-shadow 0.15s;
}
.sub-btn:not(:disabled){
  background:linear-gradient(135deg,#5530a8 0%,#7850c8 45%,#4a28a0 100%);
  color:#fff;
  box-shadow:0 2px 20px rgba(100,70,200,0.35),inset 0 1px 0 rgba(255,255,255,0.10);
}
.sub-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(100,70,200,0.48),inset 0 1px 0 rgba(255,255,255,0.10)}
.sub-btn:not(:disabled):active{transform:scale(0.99)}
.sub-btn:disabled{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.22);cursor:not-allowed}
.sub-btn::before{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transition:left 0.5s}
.sub-btn:not(:disabled):hover::before{left:160%}
.sub-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 60%);border-radius:inherit;pointer-events:none}
.btn-c{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:8px}

/* ══════════════════════════════
   CARD FOOTER
══════════════════════════════ */
.cfoot{
  margin-top:26px;padding-top:18px;
  border-top:1px solid rgba(255,255,255,0.05);
  display:flex;align-items:center;justify-content:center;gap:8px;
  animation:fadeIn 0.5s ease 0.65s both;
}
.cfoot-icon{color:rgba(150,120,230,0.32);flex-shrink:0}
.cfoot-text{font-size:11px;color:rgba(255,255,255,0.18);font-weight:300;text-align:center}

/* ══════════════════════════════
   PAGE FOOTER
══════════════════════════════ */
.pfooter{
  position:absolute;bottom:18px;left:50%;transform:translateX(-50%);
  font-family:'DM Mono',monospace;font-size:10px;
  color:rgba(255,255,255,0.10);white-space:nowrap;letter-spacing:0.10em;
}
`

/* ─── SVG stained glass panels that fill the whole background ─── */
function StainedGlassBg () {
  return (
    <svg
      className="glass-svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Jewel-tone gradients for each panel */}
        <radialGradient id="g-ruby"    cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#8b0c22" stopOpacity="0.55"/><stop offset="100%" stopColor="#4a0410" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-sapph"   cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#0c1e8a" stopOpacity="0.45"/><stop offset="100%" stopColor="#050d40" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-emer"    cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#0a5c28" stopOpacity="0.40"/><stop offset="100%" stopColor="#042414" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-ameth"   cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#5a0c88" stopOpacity="0.48"/><stop offset="100%" stopColor="#280540" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-amber"   cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#8a5c04" stopOpacity="0.40"/><stop offset="100%" stopColor="#3a2402" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-teal"    cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#045a6a" stopOpacity="0.42"/><stop offset="100%" stopColor="#022430" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-crimson" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#7a0830" stopOpacity="0.50"/><stop offset="100%" stopColor="#380414" stopOpacity="0"/></radialGradient>
        <radialGradient id="g-indigo"  cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#1c0c7a" stopOpacity="0.44"/><stop offset="100%" stopColor="#0a0538" stopOpacity="0"/></radialGradient>
      </defs>

      {/* ── Panel fill polygons ── */}
      {/* Row 1 */}
      <polygon points="0,0 360,0 320,220 0,200"           fill="url(#g-ruby)"    style={{animation:'panelPulse 10s ease-in-out infinite 0s',    '--base':0.32}} />
      <polygon points="360,0 780,0 740,230 320,220"        fill="url(#g-sapph)"   style={{animation:'panelPulse 13s ease-in-out infinite 1.5s',  '--base':0.28}} />
      <polygon points="780,0 1160,0 1120,215 740,230"      fill="url(#g-emer)"    style={{animation:'panelPulse 11s ease-in-out infinite 3s',    '--base':0.26}} />
      <polygon points="1160,0 1440,0 1440,200 1120,215"    fill="url(#g-ameth)"   style={{animation:'panelPulse 14s ease-in-out infinite 0.8s',  '--base':0.30}} />
      {/* Row 2 */}
      <polygon points="0,200 320,220 275,460 0,440"        fill="url(#g-ameth)"   style={{animation:'panelPulse 12s ease-in-out infinite 2s',    '--base':0.26}} />
      <polygon points="320,220 740,230 700,465 275,460"    fill="url(#g-amber)"   style={{animation:'panelPulse 9s  ease-in-out infinite 4s',    '--base':0.28}} />
      <polygon points="740,230 1120,215 1090,455 700,465"  fill="url(#g-ruby)"    style={{animation:'panelPulse 15s ease-in-out infinite 1s',    '--base':0.24}} />
      <polygon points="1120,215 1440,200 1440,440 1090,455"fill="url(#g-teal)"    style={{animation:'panelPulse 11s ease-in-out infinite 2.5s',  '--base':0.26}} />
      {/* Row 3 */}
      <polygon points="0,440 275,460 230,700 0,680"        fill="url(#g-teal)"    style={{animation:'panelPulse 10s ease-in-out infinite 0.4s',  '--base':0.28}} />
      <polygon points="275,460 700,465 660,705 230,700"    fill="url(#g-indigo)"  style={{animation:'panelPulse 13s ease-in-out infinite 3.5s',  '--base':0.26}} />
      <polygon points="700,465 1090,455 1055,695 660,705"  fill="url(#g-amber)"   style={{animation:'panelPulse 8s  ease-in-out infinite 1.8s',  '--base':0.30}} />
      <polygon points="1090,455 1440,440 1440,680 1055,695"fill="url(#g-crimson)" style={{animation:'panelPulse 12s ease-in-out infinite 2.8s',  '--base':0.28}} />
      {/* Row 4 */}
      <polygon points="0,680 230,700 195,900 0,900"        fill="url(#g-sapph)"   style={{animation:'panelPulse 14s ease-in-out infinite 1.2s',  '--base':0.26}} />
      <polygon points="230,700 660,705 625,900 195,900"    fill="url(#g-ruby)"    style={{animation:'panelPulse 11s ease-in-out infinite 0.6s',  '--base':0.30}} />
      <polygon points="660,705 1055,695 1025,900 625,900"  fill="url(#g-emer)"    style={{animation:'panelPulse 9s  ease-in-out infinite 4.5s',  '--base':0.24}} />
      <polygon points="1055,695 1440,680 1440,900 1025,900"fill="url(#g-indigo)"  style={{animation:'panelPulse 12s ease-in-out infinite 2.2s',  '--base':0.28}} />

      {/* ── Lead lines (dark) ── */}
      <g stroke="rgba(0,0,0,0.70)" strokeWidth="2.5" fill="none">
        <polyline points="360,0 320,220 275,460 230,700 195,900"/>
        <polyline points="780,0 740,230 700,465 660,705 625,900"/>
        <polyline points="1160,0 1120,215 1090,455 1055,695 1025,900"/>
        <line x1="0" y1="200"  x2="1440" y2="200"/>
        <line x1="0" y1="440"  x2="1440" y2="440"/>
        <line x1="0" y1="680"  x2="1440" y2="680"/>
      </g>

      {/* ── Gold lead-line gleam ── */}
      <g stroke="rgba(212,180,60,0.10)" strokeWidth="1" fill="none">
        <polyline points="360,0 320,220 275,460 230,700 195,900"/>
        <polyline points="1160,0 1120,215 1090,455 1055,695 1025,900"/>
      </g>
    </svg>
  )
}

/* ─── Logo ─── */
function BoltIcon () {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="bl" x1="4.5" y1="2" x2="19.5" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#c8b8f8"/>
          <stop offset="100%" stopColor="#8060d0"/>
        </linearGradient>
      </defs>
      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
        fill="url(#bl)" strokeLinejoin="round"/>
    </svg>
  )
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function Login () {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()

  const validate = () => {
    const e = {}
    if (!email.trim())                    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email address'
    if (!password)                         e.password = 'Password is required'
    else if (password.length < 6)          e.password = 'Minimum 6 characters required'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const clearErr = f => {
    if (fieldErrors[f]) setFieldErrors(p => ({ ...p, [f]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const data = await loginApi(email.trim().toLowerCase(), password)
      if (data.token && data.admin) {
        login(data.token, data.admin)
        addToast(`Welcome back, ${data.admin.name}!`, 'success')
        navigate('/', { replace: true })
      } else {
        setError(data.error || 'Login failed — unexpected response')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to connect. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="lr">

        {/* ══ Layer 1: Stained Glass ══ */}
        <div className="glass-bg">
          <StainedGlassBg />
          {/* Coloured light rays cutting through glass */}
          <div className="ray" style={{left:'22%',width:'48px',height:'100%',background:'linear-gradient(to bottom,rgba(100,10,28,0.18),rgba(100,10,28,0.06),transparent)',animationDuration:'11s'}}/>
          <div className="ray" style={{left:'51%',width:'60px',height:'100%',background:'linear-gradient(to bottom,rgba(12,24,100,0.14),rgba(12,24,100,0.05),transparent)',animationDuration:'14s',animationDelay:'-4s'}}/>
          <div className="ray" style={{left:'78%',width:'40px',height:'100%',background:'linear-gradient(to bottom,rgba(70,10,100,0.14),transparent)',animationDuration:'12s',animationDelay:'-7s'}}/>
        </div>

        {/* ══ Layer 2: Liquid Metal ══ */}
        <div className="metal-layer">
          <div className="mblob mb1"/>
          <div className="mblob mb2"/>
          <div className="mblob mb3"/>
          <div className="msheen"/>
        </div>

        {/* ══ Layer 3: Ferrofluid Card ══ */}
        <div className="card-wrap">
          <div className="ferro-aura"/>
          <div className="ferro-ring"/>

          <div className="card">

            {/* Logo */}
            <div className="logo-area">
              <div className="logo-icon-wrap">
                <div className="ring-outer"/>
                <div className="ring-inner"/>
                <div className="logo-icon-box"><BoltIcon/></div>
              </div>
              <div className="brand-name">ZYNTELL</div>
              <div className="brand-sub">Admin Platform</div>
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="div-line"/>
              <span className="div-text">Sign in to continue</span>
              <div className="div-line"/>
            </div>

            {/* Error */}
            {error && (
              <div className="err-box">
                <div className="err-dot"/>
                <span className="err-msg">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="fields">

                <div className="fg">
                  <label className="flabel">Email Address</label>
                  <div className="fi-wrap">
                    <input type="email"
                      className={`fi${fieldErrors.email ? ' err' : ''}`}
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearErr('email') }}
                      placeholder="you@zyntell.in"
                      autoComplete="email" autoFocus
                    />
                    <div className="sw"><div className="sb"/></div>
                  </div>
                  {fieldErrors.email && <div className="ferr"><div className="ferr-dot"/>{fieldErrors.email}</div>}
                </div>

                <div className="fg">
                  <label className="flabel">Password</label>
                  <div className="fi-wrap">
                    <input type={showPass ? 'text' : 'password'}
                      className={`fi eye${fieldErrors.password ? ' err' : ''}`}
                      value={password}
                      onChange={e => { setPassword(e.target.value); clearErr('password') }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <div className="sw"><div className="sb"/></div>
                    <button type="button" className="eye-btn"
                      onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  {fieldErrors.password && <div className="ferr"><div className="ferr-dot"/>{fieldErrors.password}</div>}
                </div>

              </div>

              <div className="sub-wrap">
                <button type="submit" className="sub-btn" disabled={loading}>
                  <span className="btn-c">
                    {loading
                      ? <><Loader2 size={15} style={{animation:'spin 0.75s linear infinite'}}/>Signing in...</>
                      : 'Sign In'}
                  </span>
                </button>
              </div>
            </form>

            <div className="cfoot">
              <ShieldCheck size={13} className="cfoot-icon"/>
              <span className="cfoot-text">JWT secured · Authorized admins only</span>
            </div>

          </div>
        </div>

        <div className="pfooter">ZYNTELL © {new Date().getFullYear()} · All rights reserved</div>
      </div>
    </>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { loginApi } from '../api/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

/* ─────────────────────────────────────────
   SPIKE GEOMETRY
   20 spikes positioned around an ellipse
   rx = approx half-width, ry = half-height
───────────────────────────────────────── */
const SPIKES = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2
  return {
    ex      : 196 * Math.cos(angle),
    ey      : 252 * Math.sin(angle),
    rot     : (i / 20) * 360 + 90,
    h       : 10 + Math.random() * 16,
    w       : 2  + Math.random() * 2.5,
    delay   : Math.random() * 4,
    duration: 1.8 + Math.random() * 2.4,
  }
})

/* ─── Bolt icon ─── */
function BoltIcon () {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="bg" x1="4.5" y1="2" x2="19.5" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9050C8" />
        </linearGradient>
      </defs>
      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
        fill="url(#bg)" stroke="rgba(212,175,55,0.55)" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Stained Glass SVG panels + lead lines ─── */
function StainedGlass () {
  const panels = [
    ['0,0 320,0 285,190 0,175',          'rgba(130,8,25,0.19)',   '7s','0s'   ],
    ['320,0 700,0 665,210 285,190',       'rgba(10,28,130,0.16)', '9s','1.2s' ],
    ['700,0 1100,0 1085,195 665,210',     'rgba(35,105,20,0.15)', '8s','2.4s' ],
    ['1100,0 1440,0 1440,175 1085,195',   'rgba(85,8,130,0.17)',  '11s','0.6s'],
    ['0,175 285,190 245,415 0,400',       'rgba(130,85,5,0.15)',  '10s','1.8s'],
    ['285,190 665,210 625,425 245,415',   'rgba(110,8,28,0.17)',  '7s','3.2s' ],
    ['665,210 1085,195 1065,420 625,425', 'rgba(5,65,130,0.15)',  '9s','0.9s' ],
    ['1085,195 1440,175 1440,400 1065,420','rgba(55,125,18,0.14)','8s','2.1s' ],
    ['0,400 245,415 205,645 0,635',       'rgba(105,5,85,0.16)',  '11s','1.3s'],
    ['245,415 625,425 585,655 205,645',   'rgba(5,110,80,0.15)',  '7s','2.7s' ],
    ['625,425 1065,420 1045,655 585,655', 'rgba(125,65,5,0.16)',  '9s','0.4s' ],
    ['1065,420 1440,400 1440,635 1045,655','rgba(85,5,125,0.17)', '8s','1.9s' ],
    ['0,635 205,645 165,900 0,900',       'rgba(8,48,130,0.14)',  '10s','0.8s'],
    ['205,645 585,655 545,900 165,900',   'rgba(110,18,8,0.16)',  '7s','3.0s' ],
    ['585,655 1045,655 1025,900 545,900', 'rgba(18,110,18,0.14)', '9s','1.5s' ],
    ['1045,655 1440,635 1440,900 1025,900','rgba(85,42,5,0.15)',  '8s','2.3s' ],
  ]
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      {panels.map(([pts,fill,d,dl],i) => (
        <polygon key={i} points={pts} fill={fill}
          style={{animation:`panelBreath ${d} ease-in-out infinite ${dl}`}} />
      ))}
      {/* Vertical lead lines */}
      <polyline points="320,0 285,190 245,415 205,645 165,900"  fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth="2" />
      <polyline points="700,0 665,210 625,425 585,655 545,900"  fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth="2" />
      <polyline points="1100,0 1085,195 1065,420 1045,655 1025,900" fill="none" stroke="rgba(0,0,0,0.65)" strokeWidth="2" />
      {/* Horizontal lead lines */}
      <line x1="0" y1="175" x2="1440" y2="175" stroke="rgba(0,0,0,0.45)" strokeWidth="1.2" />
      <line x1="0" y1="400" x2="1440" y2="400" stroke="rgba(0,0,0,0.45)" strokeWidth="1.2" />
      <line x1="0" y1="635" x2="1440" y2="635" stroke="rgba(0,0,0,0.45)" strokeWidth="1.2" />
      {/* Gold gleam on two lead lines */}
      <polyline points="320,0 285,190 245,415 205,645 165,900"  fill="none" stroke="rgba(212,175,55,0.07)" strokeWidth="1" />
      <polyline points="1100,0 1085,195 1065,420 1045,655 1025,900" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="1" />
    </svg>
  )
}

/* ═══════════════════════════════════════
   ALL CSS + KEYFRAMES
═══════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Fira+Code:wght@300;400;500&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

/* Stained glass panel pulse */
@keyframes panelBreath {
  0%,100% { opacity:0.8; }
  50%      { opacity:1.4; }
}
/* Light beam drift */
@keyframes beamDrift {
  0%,100% { transform:translateX(0) skewX(-4deg); opacity:0.45; }
  50%     { transform:translateX(28px) skewX(4deg); opacity:0.78; }
}
/* Liquid metal morph A */
@keyframes metalMorphA {
  0%,100% { border-radius:58% 42% 62% 38% / 44% 56% 42% 58%; }
  25%     { border-radius:42% 58% 44% 56% / 60% 40% 58% 42%; }
  50%     { border-radius:56% 44% 38% 62% / 42% 58% 54% 46%; }
  75%     { border-radius:38% 62% 56% 44% / 56% 42% 40% 60%; }
}
/* Liquid metal morph B */
@keyframes metalMorphB {
  0%,100% { border-radius:44% 56% 46% 54% / 60% 40% 58% 42%; }
  33%     { border-radius:62% 38% 58% 42% / 38% 62% 44% 56%; }
  66%     { border-radius:50% 50% 42% 58% / 54% 46% 62% 38%; }
}
/* Blob drifts */
@keyframes driftA {
  0%,100% { transform:translate(0,0); }
  33%     { transform:translate(34px,-24px); }
  66%     { transform:translate(-18px,28px); }
}
@keyframes driftB {
  0%,100% { transform:translate(0,0); }
  40%     { transform:translate(-44px,18px); }
  70%     { transform:translate(22px,-32px); }
}
@keyframes driftC {
  0%,100% { transform:translate(0,0); }
  50%     { transform:translate(24px,34px); }
}
/* Ferrofluid card border morph */
@keyframes ferroMorph {
  0%,100% { border-radius:62% 38% 54% 46% / 48% 58% 42% 52%; }
  14%     { border-radius:48% 52% 42% 58% / 60% 44% 56% 40%; }
  28%     { border-radius:54% 46% 64% 36% / 42% 56% 44% 58%; }
  42%     { border-radius:40% 60% 48% 52% / 54% 42% 58% 46%; }
  57%     { border-radius:58% 42% 44% 56% / 46% 62% 38% 54%; }
  71%     { border-radius:44% 56% 58% 42% / 62% 46% 52% 38%; }
  85%     { border-radius:50% 50% 46% 54% / 40% 54% 60% 46%; }
}
/* Ferrofluid spikes */
@keyframes spikeBreath {
  0%,100% { transform:rotate(var(--rot)) scaleY(1);    opacity:0.45; }
  50%     { transform:rotate(var(--rot)) scaleY(1.7);  opacity:1;    }
}
/* Logo rings */
@keyframes ringCW  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
@keyframes ringCCW { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
@keyframes logoPulse {
  0%,100% { box-shadow:0 0 0 0 rgba(212,175,55,0.38); }
  70%     { box-shadow:0 0 0 14px rgba(212,175,55,0);  }
}
/* Brand + button shimmer */
@keyframes shimmer {
  0%   { background-position:-220% center; }
  100% { background-position:220% center;  }
}
/* Entrance */
@keyframes fadeUp {
  from { opacity:0; transform:translateY(22px); }
  to   { opacity:1; transform:translateY(0);    }
}
/* Input gold scan sweep */
@keyframes scanSweep {
  0%   { transform:translateX(-100%); }
  100% { transform:translateX(500%);  }
}
/* Error shake */
@keyframes errShake {
  0%,100% { transform:translateX(0);   }
  20%     { transform:translateX(-7px);}
  40%     { transform:translateX(7px); }
  60%     { transform:translateX(-4px);}
  80%     { transform:translateX(4px); }
}
/* Spinner */
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
/* Glass global shimmer */
@keyframes glassGlimmer {
  0%,100% { filter:brightness(1);    }
  50%     { filter:brightness(1.18); }
}
/* Metal iridescence */
@keyframes metalIrid {
  0%   { background-position:0% 50%;   }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%;   }
}

/* ROOT */
.lr{
  min-height:100vh; background:#040209;
  display:flex; align-items:center; justify-content:center;
  font-family:'Syne',sans-serif; overflow:hidden; position:relative;
}

/* STAINED GLASS */
.glass-layer{ position:absolute; inset:0; pointer-events:none; animation:glassGlimmer 9s ease-in-out infinite; }
.beam{ position:absolute; top:0; bottom:0; pointer-events:none; animation:beamDrift ease-in-out infinite; }

/* LIQUID METAL */
.metal-layer{ position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.mblob{ position:absolute; filter:blur(52px); mix-blend-mode:screen; }
.mb1{
  width:440px; height:360px; top:-95px; left:-75px;
  background:radial-gradient(ellipse at 40% 45%, rgba(202,188,232,0.22) 0%, rgba(152,112,212,0.14) 45%, transparent 70%);
  animation:metalMorphA 16s ease-in-out infinite, driftA 23s ease-in-out infinite;
}
.mb2{
  width:360px; height:310px; bottom:-75px; right:-55px;
  background:radial-gradient(ellipse at 55% 45%, rgba(218,205,244,0.18) 0%, rgba(172,92,212,0.12) 45%, transparent 70%);
  animation:metalMorphB 20s ease-in-out infinite, driftB 27s ease-in-out infinite;
}
.mb3{
  width:270px; height:250px; top:38%; left:52%;
  background:radial-gradient(ellipse at 50% 50%, rgba(255,232,182,0.12) 0%, rgba(212,102,82,0.08) 50%, transparent 70%);
  animation:metalMorphA 25s ease-in-out infinite 4s, driftC 19s ease-in-out infinite;
}
/* Chrome streak */
.mstreak{
  position:absolute; inset:0;
  background:linear-gradient(105deg,
    transparent 0%, rgba(202,192,232,0.05) 30%,
    rgba(255,242,202,0.09) 50%, rgba(202,192,232,0.05) 70%, transparent 100%);
  background-size:300% 300%; animation:metalIrid 14s ease infinite;
}

/* CARD WRAP */
.card-wrap{
  position:relative; z-index:10;
  width:100%; max-width:448px; padding:28px;
  animation:fadeUp 0.85s cubic-bezier(0.22,1,0.36,1) both;
}

/* FERROFLUID OUTER */
.ferro-outer{
  position:relative; padding:2.5px;
  animation:ferroMorph 8s ease-in-out infinite;
  background:linear-gradient(138deg,
    rgba(212,175,55,0.62) 0%,  rgba(102,52,182,0.46) 28%,
    rgba(40,20,92,0.56) 55%,   rgba(182,122,22,0.52) 78%,
    rgba(212,175,55,0.58) 100%);
}
.ferro-outer::before{
  content:''; position:absolute; inset:-4px; border-radius:inherit;
  background:linear-gradient(138deg,
    rgba(212,175,55,0.20) 0%, rgba(120,62,202,0.15) 50%, rgba(212,175,55,0.14) 100%);
  filter:blur(18px); z-index:-1; pointer-events:none;
}
/* Spikes */
.spike{
  position:absolute; left:50%; top:50%;
  border-radius:50% 50% 0 0 / 35% 35% 0 0;
  background:linear-gradient(to top, rgba(212,175,55,0.95), rgba(182,122,255,0.45), transparent);
  transform-origin:50% 100%;
  animation:spikeBreath ease-in-out infinite;
  pointer-events:none; z-index:20;
}

/* FERRO MASK — clips to morphing shape */
.ferro-mask{ border-radius:inherit; overflow:hidden; }

/* CARD INNER */
.card-inner{
  background:rgba(5,3,13,0.91);
  backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
  border-radius:inherit; padding:42px 38px 38px;
  position:relative; overflow:hidden;
}
/* Colour leak from stained glass */
.card-inner::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(ellipse at 28% 18%, rgba(130,8,25,0.07) 0%, transparent 50%),
    radial-gradient(ellipse at 74% 82%, rgba(40,10,102,0.06) 0%, transparent 50%);
}
/* Metal sheen overlay */
.card-inner::after{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(135deg,
    rgba(212,175,55,0.04) 0%, rgba(160,122,255,0.03) 50%, transparent 100%);
}

/* LOGO */
.logo-area{ display:flex; flex-direction:column; align-items:center; margin-bottom:34px; animation:fadeUp 0.7s ease 0.2s both; }
.logo-icon-wrap{ position:relative; width:62px; height:62px; margin-bottom:16px; }
.logo-ring-outer{ position:absolute; inset:-8px; border-radius:50%; border:1px dashed rgba(212,175,55,0.22); animation:ringCW 18s linear infinite; }
.logo-ring-inner{
  position:absolute; inset:-2px; border-radius:50%;
  border:1.5px solid rgba(212,175,55,0.38); animation:ringCCW 9s linear infinite;
}
.logo-ring-inner::after{
  content:''; position:absolute; top:-4px; left:50%; transform:translateX(-50%);
  width:7px; height:7px; border-radius:50%; background:#D4AF37;
  box-shadow:0 0 10px #D4AF37, 0 0 22px rgba(212,175,55,0.5);
}
.logo-icon{
  width:62px; height:62px; border-radius:16px;
  background:linear-gradient(135deg,#0c0820,#190d3a);
  border:1px solid rgba(212,175,55,0.25);
  display:flex; align-items:center; justify-content:center;
  position:relative; z-index:1; animation:logoPulse 3.2s ease-in-out infinite;
}
.brand-name{
  font-size:27px; font-weight:800; letter-spacing:0.22em;
  background:linear-gradient(90deg,#D4AF37 0%,#fff 35%,#c890ff 55%,#D4AF37 80%,#fff 100%);
  background-size:220% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  animation:shimmer 5.5s linear infinite;
}
.brand-sub{
  font-family:'Fira Code',monospace; font-size:9px; letter-spacing:0.38em;
  color:rgba(212,175,55,0.38); margin-top:6px; text-transform:uppercase;
}

/* CARD HEADING */
.card-head{ margin-bottom:28px; animation:fadeUp 0.6s ease 0.38s both; }
.card-head h2{ font-size:20px; font-weight:700; color:#fff; margin-bottom:5px; }
.card-head p{ font-family:'Fira Code',monospace; font-size:11px; color:rgba(255,255,255,0.26); }

/* ERROR */
.err-box{
  background:rgba(180,20,60,0.09); border:1px solid rgba(202,30,72,0.28);
  border-radius:12px; padding:12px 14px;
  display:flex; gap:10px; align-items:flex-start;
  margin-bottom:22px; animation:errShake 0.45s ease;
}
.err-dot{ width:6px; height:6px; border-radius:50%; background:#e02050; box-shadow:0 0 7px #e02050; flex-shrink:0; margin-top:4px; }
.err-text{ font-family:'Fira Code',monospace; font-size:11px; color:rgba(255,140,165,0.9); line-height:1.55; }

/* FORM */
.field{ margin-bottom:20px; animation:fadeUp 0.6s ease both; }
.field:nth-child(1){ animation-delay:0.44s; }
.field:nth-child(2){ animation-delay:0.52s; }
.flabel{ font-family:'Fira Code',monospace; font-size:9px; font-weight:500; letter-spacing:0.24em; color:rgba(212,175,55,0.55); text-transform:uppercase; display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.flabel-line{ flex:1; height:1px; background:linear-gradient(90deg,rgba(212,175,55,0.22),transparent); }
.finput-wrap{ position:relative; }
.finput{
  width:100%; background:rgba(255,255,255,0.035);
  border:1px solid rgba(212,175,55,0.12); border-radius:12px;
  padding:13px 16px; color:#fff;
  font-family:'Fira Code',monospace; font-size:13px;
  outline:none; transition:all 0.2s; letter-spacing:0.03em;
}
.finput::placeholder{ color:rgba(255,255,255,0.18); }
.finput:focus{
  border-color:rgba(212,175,55,0.48); background:rgba(212,175,55,0.04);
  box-shadow:0 0 0 3px rgba(212,175,55,0.09), inset 0 0 24px rgba(212,175,55,0.03);
}
.finput.fe{ border-color:rgba(202,30,72,0.5); box-shadow:0 0 0 3px rgba(202,30,72,0.08); }
.finput.eye{ padding-right:46px; }
/* Gold scan sweep */
.scan-wrap{ position:absolute; inset:0; border-radius:12px; overflow:hidden; pointer-events:none; }
.scan-line{ position:absolute; top:0; bottom:0; width:42px; opacity:0; background:linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent); }
.finput:focus ~ .scan-wrap .scan-line{ opacity:1; animation:scanSweep 0.9s ease forwards; }
.eye-btn{ position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.26); padding:4px; display:flex; align-items:center; transition:color 0.15s; }
.eye-btn:hover{ color:rgba(212,175,55,0.72); }
.ferr{ font-family:'Fira Code',monospace; font-size:10px; color:rgba(255,122,148,0.9); margin-top:7px; display:flex; align-items:center; gap:6px; }
.ferr::before{ content:'!'; width:14px; height:14px; border-radius:50%; background:rgba(202,30,72,0.18); border:1px solid rgba(202,30,72,0.38); font-size:9px; text-align:center; line-height:14px; flex-shrink:0; }

/* SUBMIT */
.sub-wrap{ margin-top:28px; animation:fadeUp 0.6s ease 0.62s both; }
.sub-btn{
  width:100%; padding:14px 24px; border-radius:12px; border:none; cursor:pointer;
  font-family:'Syne',sans-serif; font-size:13px; font-weight:700; letter-spacing:0.09em;
  position:relative; overflow:hidden; transition:transform 0.15s, box-shadow 0.15s;
}
.sub-btn:not(:disabled){
  background:linear-gradient(135deg,#7a5c10,#D4AF37,#8040a8,#5020a0,#D4AF37);
  background-size:260% auto; color:#fff;
  box-shadow:0 4px 28px rgba(212,175,55,0.22);
  animation:shimmer 4.5s linear infinite;
}
.sub-btn:not(:disabled):hover{ transform:translateY(-1px); box-shadow:0 8px 36px rgba(212,175,55,0.36); }
.sub-btn:not(:disabled):active{ transform:scale(0.99); }
.sub-btn:disabled{ background:rgba(212,175,55,0.07); color:rgba(255,255,255,0.22); cursor:not-allowed; }
.sub-btn::before{ content:''; position:absolute; top:0; left:-100%; width:55%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent); transition:left 0.5s; }
.sub-btn:not(:disabled):hover::before{ left:150%; }
.btn-in{ position:relative; display:flex; align-items:center; justify-content:center; gap:8px; }

/* FOOTER */
.cfoot{ margin-top:28px; padding-top:20px; border-top:1px solid rgba(212,175,55,0.08); display:flex; align-items:center; justify-content:center; gap:8px; animation:fadeUp 0.6s ease 0.75s both; }
.fdot{ width:3px; height:3px; border-radius:50%; background:rgba(212,175,55,0.32); }
.ftext{ font-family:'Fira Code',monospace; font-size:10px; color:rgba(255,255,255,0.14); text-align:center; line-height:1.6; }
.pfooter{ position:absolute; bottom:18px; left:50%; transform:translateX(-50%); font-family:'Fira Code',monospace; font-size:9px; color:rgba(255,255,255,0.07); white-space:nowrap; letter-spacing:0.12em; }
`

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
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
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email'
    if (!password)                         e.password = 'Password is required'
    else if (password.length < 6)          e.password = 'Min 6 characters required'
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
      setError(err.response?.data?.error || 'Unable to connect. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="lr">

        {/* ══ Layer 1: Stained Glass ══ */}
        <div className="glass-layer">
          <StainedGlass />
          <div className="beam" style={{left:'19%',width:'40px',height:'100%',background:'linear-gradient(to bottom,rgba(130,8,25,0.10),rgba(130,8,25,0.04),transparent)',animationDuration:'10s'}} />
          <div className="beam" style={{left:'46%',width:'56px',height:'100%',background:'linear-gradient(to bottom,rgba(10,28,130,0.08),rgba(10,28,130,0.03),transparent)',animationDuration:'13s',animationDelay:'-4s'}} />
          <div className="beam" style={{left:'71%',width:'46px',height:'100%',background:'linear-gradient(to bottom,rgba(85,8,130,0.08),rgba(85,8,130,0.03),transparent)',animationDuration:'11s',animationDelay:'-7s'}} />
          <div className="beam" style={{left:'88%',width:'30px',height:'100%',background:'linear-gradient(to bottom,rgba(35,105,20,0.06),transparent)',animationDuration:'15s',animationDelay:'-2s'}} />
        </div>

        {/* ══ Layer 2: Liquid Metal ══ */}
        <div className="metal-layer">
          <div className="mblob mb1" />
          <div className="mblob mb2" />
          <div className="mblob mb3" />
          <div className="mstreak" />
        </div>

        {/* ══ Layer 3: Ferrofluid Card ══ */}
        <div className="card-wrap">
          <div className="ferro-outer">

            {/* Ferrofluid spikes around perimeter */}
            {SPIKES.map((s, i) => (
              <div key={i} className="spike" style={{
                width         : s.w,
                height        : s.h,
                marginLeft    : -(s.w / 2),
                marginTop     : -s.h,
                transform     : `translate(${s.ex}px,${s.ey}px)`,
                '--rot'       : `${s.rot}deg`,
                animationDuration : `${s.duration}s`,
                animationDelay    : `-${s.delay}s`,
              }} />
            ))}

            {/* Clips everything inside to the morphing shape */}
            <div className="ferro-mask">
              <div className="card-inner">

                {/* Logo */}
                <div className="logo-area">
                  <div className="logo-icon-wrap">
                    <div className="logo-ring-outer" />
                    <div className="logo-ring-inner" />
                    <div className="logo-icon"><BoltIcon /></div>
                  </div>
                  <div className="brand-name">ZYNTELL</div>
                  <div className="brand-sub">// Admin&nbsp;Platform</div>
                </div>

                {/* Heading */}
                <div className="card-head">
                  <h2>Sign in</h2>
                  <p>{'>'}&nbsp;credentials required for secure access</p>
                </div>

                {/* Global error */}
                {error && (
                  <div className="err-box">
                    <div className="err-dot" />
                    <span className="err-text">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                  {/* Email */}
                  <div className="field">
                    <label className="flabel">Email <span className="flabel-line" /></label>
                    <div className="finput-wrap">
                      <input type="email"
                        className={`finput${fieldErrors.email ? ' fe' : ''}`}
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearErr('email') }}
                        placeholder="you@zyntell.in"
                        autoComplete="email" autoFocus
                      />
                      <div className="scan-wrap"><div className="scan-line" /></div>
                    </div>
                    {fieldErrors.email && <div className="ferr">{fieldErrors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className="field">
                    <label className="flabel">Password <span className="flabel-line" /></label>
                    <div className="finput-wrap">
                      <input type={showPass ? 'text' : 'password'}
                        className={`finput eye${fieldErrors.password ? ' fe' : ''}`}
                        value={password}
                        onChange={e => { setPassword(e.target.value); clearErr('password') }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <div className="scan-wrap"><div className="scan-line" /></div>
                      <button type="button" className="eye-btn"
                        onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {fieldErrors.password && <div className="ferr">{fieldErrors.password}</div>}
                  </div>

                  {/* Submit */}
                  <div className="sub-wrap">
                    <button type="submit" className="sub-btn" disabled={loading}>
                      <span className="btn-in">
                        {loading
                          ? <><Loader2 size={14} style={{animation:'spin 0.8s linear infinite'}} />Authenticating...</>
                          : 'Access Dashboard →'}
                      </span>
                    </button>
                  </div>

                </form>

                <div className="cfoot">
                  <div className="fdot" />
                  <span className="ftext">JWT secured · Authorized admins only</span>
                  <div className="fdot" />
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="pfooter">ZYNTELL © {new Date().getFullYear()}</div>
      </div>
    </>
  )
}
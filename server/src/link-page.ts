export const LINK_PAGE_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>UraanxAI — AI-генерация в Telegram</title>
<meta name="description" content="Создавай фото, видео и аватары с помощью AI прямо в Telegram">
<meta property="og:title" content="UraanxAI — AI-генерация в Telegram">
<meta property="og:description" content="Фото, видео, motion и говорящие аватары за секунды">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden}
body{
  font-family:'Inter',system-ui,sans-serif;
  background:#030711;
  color:#e2e8f0;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100dvh;
  position:relative;
}

/* Aurora animated background */
.aurora{
  position:fixed;inset:0;z-index:0;overflow:hidden;
}
.aurora::before,.aurora::after{
  content:'';position:absolute;border-radius:50%;filter:blur(120px);animation:drift 8s ease-in-out infinite alternate;
}
.aurora::before{
  width:600px;height:600px;top:-200px;left:-100px;
  background:conic-gradient(from 0deg,rgba(139,92,246,.35),rgba(6,182,212,.25),rgba(139,92,246,.15),rgba(6,182,212,.35));
  animation-duration:8s;
}
.aurora::after{
  width:500px;height:500px;bottom:-200px;right:-100px;
  background:conic-gradient(from 180deg,rgba(6,182,212,.3),rgba(139,92,246,.2),rgba(34,211,238,.25));
  animation-duration:12s;animation-direction:alternate-reverse;
}
.glow-orb{
  position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;
}
.glow-orb.a{width:300px;height:300px;top:20%;left:60%;background:rgba(139,92,246,.15);animation:drift 10s ease-in-out infinite alternate}
.glow-orb.b{width:250px;height:250px;top:60%;left:20%;background:rgba(6,182,212,.12);animation:drift 14s ease-in-out infinite alternate-reverse}

@keyframes drift{
  0%{transform:translate(0,0) scale(1)}
  100%{transform:translate(60px,-40px) scale(1.15)}
}

/* Particles container */
#tsparticles{position:fixed;inset:0;z-index:1}

/* Main content */
.card{
  position:relative;z-index:10;
  text-align:center;
  padding:48px 32px;
  max-width:420px;width:100%;
  animation:fadeUp .8s ease-out both;
}
@keyframes fadeUp{
  from{opacity:0;transform:translateY(30px)}
  to{opacity:1;transform:translateY(0)}
}

/* Logo */
.logo{
  width:80px;height:80px;margin:0 auto 20px;
  border-radius:24px;
  background:linear-gradient(135deg,#7c3aed,#06b6d4);
  display:flex;align-items:center;justify-content:center;
  font-size:36px;font-weight:900;color:#fff;
  box-shadow:0 0 60px rgba(139,92,246,.4),0 0 120px rgba(6,182,212,.2);
  animation:logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse{
  0%,100%{box-shadow:0 0 60px rgba(139,92,246,.4),0 0 120px rgba(6,182,212,.2)}
  50%{box-shadow:0 0 80px rgba(139,92,246,.6),0 0 160px rgba(6,182,212,.35)}
}

.brand{font-size:28px;font-weight:800;margin-bottom:8px;letter-spacing:-.5px}
.brand span{background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.subtitle{font-size:15px;color:#94a3b8;margin-bottom:36px;line-height:1.5}

/* Buttons */
.btn{
  display:flex;align-items:center;justify-content:center;gap:10px;
  width:100%;padding:18px 24px;border-radius:16px;
  font-size:17px;font-weight:700;text-decoration:none;
  transition:all .25s ease;cursor:pointer;border:none;
  position:relative;overflow:hidden;
}
.btn::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.1),transparent);
  opacity:0;transition:opacity .3s;
}
.btn:hover::before{opacity:1}
.btn:active{transform:scale(.97)}

.btn-primary{
  background:linear-gradient(135deg,#7c3aed,#06b6d4);
  color:#fff;
  box-shadow:0 8px 32px rgba(139,92,246,.4),0 0 80px rgba(139,92,246,.15);
  margin-bottom:14px;
}
.btn-primary:hover{
  box-shadow:0 12px 40px rgba(139,92,246,.55),0 0 100px rgba(139,92,246,.25);
  transform:translateY(-2px);
}

.btn-glass{
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);
  color:#e2e8f0;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  margin-bottom:14px;
}
.btn-glass:hover{
  background:rgba(255,255,255,.1);
  border-color:rgba(255,255,255,.2);
  transform:translateY(-2px);
  box-shadow:0 8px 32px rgba(6,182,212,.2);
}

.btn svg{width:22px;height:22px;flex-shrink:0}

/* Badges */
.badges{
  display:flex;gap:8px;justify-content:center;flex-wrap:wrap;
  margin-top:28px;
  animation:fadeUp 1s ease-out .4s both;
}
.badge{
  padding:8px 14px;border-radius:10px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.08);
  font-size:12px;font-weight:600;color:#94a3b8;
}
.badge strong{
  color:#22d3ee;font-weight:800;
}
.badge.free strong{color:#22c55e}

.hint{
  margin-top:20px;
  font-size:15px;
  font-weight:600;
  color:#94a3b8;
  line-height:1.6;
  letter-spacing:-.2px;
  animation:fadeUp 1s ease-out .5s both;
}
.hint strong{
  background:linear-gradient(135deg,#a78bfa,#22d3ee);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  font-weight:800;
}

/* Footer */
.footer{
  position:fixed;bottom:16px;left:0;right:0;
  text-align:center;z-index:10;
  font-size:11px;color:rgba(255,255,255,.15);
  animation:fadeUp 1s ease-out .6s both;
}
</style>
</head>
<body>

<div class="aurora"></div>
<div class="glow-orb a"></div>
<div class="glow-orb b"></div>
<div id="tsparticles"></div>

<div class="card">
  <div class="logo"><img src="/logo-mammoth.png" alt="UraanxAI" style="width:60px;height:60px;object-fit:contain"></div>
  <div class="brand"><span>UraanxAI</span></div>
  <p class="subtitle">AI-генерация фото, видео и аватаров<br>прямо в Telegram за секунды</p>

  <a href="https://t.me/UraanxAI_bot?start=c_nashapromo_mnyfgmnv" class="btn btn-primary" target="_blank">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    Открыть UraanxAI
  </a>

  <a href="https://t.me/+Plk0-UZ5yv1hNTJi" class="btn btn-glass" target="_blank">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    Промпты и генерации
  </a>

  <div class="badges">
    <div class="badge free"><strong>300 бесплатных кредитов</strong> ждут тебя в приложении</div>
  </div>
  <p class="hint">Создавай <strong>трендовый контент</strong> для Reels и TikTok<br>и начни <strong>зарабатывать</strong> на AI-генерации</p>
</div>

<div class="footer">UraanxAI &copy; 2026</div>

<script src="https://cdn.jsdelivr.net/npm/tsparticles-slim@2/tsparticles.slim.bundle.min.js"></script>
<script>
tsParticles.load("tsparticles",{
  fullScreen:false,
  particles:{
    number:{value:60,density:{enable:true,area:900}},
    color:{value:["#a78bfa","#22d3ee","#7c3aed","#06b6d4"]},
    shape:{type:"circle"},
    opacity:{value:{min:.15,max:.5},animation:{enable:true,speed:.8,minimumValue:.1}},
    size:{value:{min:1,max:3},animation:{enable:true,speed:1.5,minimumValue:.5}},
    links:{
      enable:true,distance:130,color:"#a78bfa",opacity:.08,width:1
    },
    move:{
      enable:true,speed:.6,direction:"none",outModes:"out",
      attract:{enable:true,rotateX:600,rotateY:1200}
    },
  },
  interactivity:{
    events:{
      onHover:{enable:true,mode:"grab",parallax:{enable:true,force:30,smooth:20}},
      onClick:{enable:true,mode:"push"}
    },
    modes:{
      grab:{distance:180,links:{opacity:.25,color:"#22d3ee"}},
      push:{quantity:3}
    }
  },
  detectRetina:true,
});
</script>
</body>
</html>`;

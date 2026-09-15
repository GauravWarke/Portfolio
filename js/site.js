// SECTION ORDER — lead with Projects (Hero → Projects → About → Skills → Experience → Research → Contact)
(function(){
  var order=['home','about','projects','skills','contact'];
  var footer=document.querySelector('footer'); if(!footer) return;
  var parent=footer.parentNode;
  document.querySelectorAll('.divider').forEach(function(d){d.remove();});
  order.forEach(function(id,i){
    var s=document.getElementById(id); if(!s) return;
    parent.insertBefore(s,footer);                       // move section into new order
    if(i<order.length-1){
      var d=document.createElement('div'); d.className='divider';
      parent.insertBefore(d,footer);                     // re-insert a divider between sections
    }
  });
})();

// LEFT DROPDOWN MENU
(function(){
  var btn=document.getElementById('menuBtn'),panel=document.getElementById('menuPanel'),nav=document.getElementById('nav');
  if(!btn||!panel)return;
  function setOpen(o){panel.hidden=!o;btn.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);nav.classList.toggle('menu-open',o);}
  btn.addEventListener('click',function(e){e.stopPropagation();setOpen(panel.hidden);});
  panel.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setOpen(false);});});
  var srch=document.getElementById('menuSearch');
  if(srch)srch.addEventListener('click',function(){setOpen(false);if(window.openCmdk)window.openCmdk();});
  document.addEventListener('click',function(e){if(!panel.hidden&&!panel.contains(e.target)&&e.target!==btn&&!btn.contains(e.target))setOpen(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false);});
})();

// HERO — interactive plain-English project summary (for non-technical stakeholders)
// Panel content and the domain pills both come from WORK (js/projects.js).
const HERO_SUM=WORK.reduce(function(m,w){if(w.hero)m[w.id]=w.hero;return m;},{});
(function(){
  var $=function(id){return document.getElementById(id);};
  // build the domain pills from WORK so a new project appears here automatically
  var pillWrap=document.querySelector('.hv-pills');
  if(pillWrap){
    pillWrap.innerHTML=WORK.filter(function(w){return w.hero;}).map(function(w,i){
      return '<button class="hv-pill'+(i?'':' on')+'" data-id="'+w.id+'" type="button">'+w.label+'</button>';
    }).join('');
  }
  var pills=document.querySelectorAll('.hv-pill'), cur=(WORK[0]||{}).id;
  function donut(pct,center,sub){
    var R=52,C=(2*Math.PI*R).toFixed(1),off=(C*(1-pct/100)).toFixed(1);
    return '<svg viewBox="0 0 130 130" role="img">'
      +'<circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="10"/>'
      +'<circle cx="65" cy="65" r="52" fill="none" stroke="#F7F1EF" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'" transform="rotate(-90 65 65)"/>'
      +'<text x="65" y="62" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="800" font-size="25" fill="#fff">'+center+'</text>'
      +'<text x="65" y="82" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8.5" letter-spacing="1.2" fill="rgba(255,255,255,.62)">'+sub+'</text>'
      +'</svg>';
  }
  function render(id){
    var d=HERO_SUM[id];if(!d)return;cur=id;
    $('hvHeadline').textContent=d.headline;
    $('hvNum').textContent=d.num;
    $('hvNumLbl').textContent=d.numLbl;
    $('hvViz').innerHTML=donut(d.pct,d.center,d.sub);
    pills.forEach(function(x){x.classList.toggle('on',x.dataset.id===id);});
  }
  pills.forEach(function(b){b.addEventListener('click',function(){render(b.dataset.id);});});
  var more=$('hvMore');
  if(more)more.addEventListener('click',function(){if(typeof openCase==='function')openCase(cur);});
  if(cur)render(cur);
})();

// PROJECTS — Relief-Decor bento gallery (hand-built mini-visuals per case study)
const PROJECTS=WORK;
(function(){
  // ---- hand-drawn SVG mini-visuals, one per project, echoing the real dashboard chart ----
  var COL=['#F7F1EF','#C9C4BC','#8E8880'];
  function frame(inner){return '<svg viewBox="0 0 320 172" preserveAspectRatio="xMidYMid meet">'+
    '<line x1="26" y1="8" x2="26" y2="150" stroke="rgba(255,255,255,.18)"/><line x1="26" y1="150" x2="312" y2="150" stroke="rgba(255,255,255,.18)"/>'+inner+'</svg>';}
  function charts(type){
    var i,s='';
    if(type==='scatter'){
      var xs=[0.12,0.2,0.27,0.31,0.38,0.42,0.48,0.52,0.55,0.6,0.63,0.68,0.71,0.75,0.79,0.83,0.86,0.9,0.35,0.58,0.44,0.7,0.25,0.8];
      var ys=[0.3,0.55,0.4,0.7,0.35,0.6,0.5,0.75,0.42,0.66,0.3,0.58,0.8,0.48,0.7,0.55,0.85,0.62,0.85,0.9,0.2,0.35,0.72,0.9];
      for(i=0;i<xs.length;i++){var cx=26+xs[i]*280,cy=150-ys[i]*130,c=COL[xs[i]>0.66?0:xs[i]>0.4?1:2],r=3+(i%3);s+='<circle cx="'+cx.toFixed(0)+'" cy="'+cy.toFixed(0)+'" r="'+r+'" fill="'+c+'" opacity="0.9"/>';}
      s+='<line x1="'+(26+0.66*280)+'" y1="8" x2="'+(26+0.66*280)+'" y2="150" stroke="#F7F1EF" stroke-dasharray="4 4" opacity=".5"/>';
    } else if(type==='bars'){
      var h=[[0.55,0.9],[0.7,0.5],[0.35,0.8],[0.6,0.42]],gw=64,bw=22,x0=40;
      for(i=0;i<h.length;i++){var gx=x0+i*gw;
        s+='<rect x="'+gx+'" y="'+(150-h[i][0]*128)+'" width="'+bw+'" height="'+(h[i][0]*128)+'" rx="3" fill="'+COL[0]+'"/>';
        s+='<rect x="'+(gx+bw+4)+'" y="'+(150-h[i][1]*128)+'" width="'+bw+'" height="'+(h[i][1]*128)+'" rx="3" fill="'+COL[2]+'" opacity=".85"/>';}
    } else if(type==='line'){
      var av=[0.35,0.42,0.38,0.5,0.55,0.6],fc=[0.6,0.68,0.72,0.66,0.78],pa='',pf='';
      for(i=0;i<av.length;i++){var X=26+i*30,Y=150-av[i]*130;pa+=(i?'L':'M')+X+' '+Y.toFixed(0)+' ';}
      for(i=0;i<fc.length;i++){var Xf=26+(5+i)*30,Yf=150-fc[i]*130;pf+=(i?'L':'M')+Xf+' '+Yf.toFixed(0)+' ';}
      s+='<path d="'+pa+'" fill="none" stroke="'+COL[1]+'" stroke-width="2.5"/>';
      s+='<path d="'+pf+'" fill="none" stroke="'+COL[2]+'" stroke-width="2.5" stroke-dasharray="5 4"/>';
      s+='<circle cx="'+(26+5*30)+'" cy="'+(150-0.6*130)+'" r="4" fill="'+COL[0]+'"/><circle cx="'+(26+7*30)+'" cy="'+(150-0.72*130)+'" r="4" fill="'+COL[0]+'"/>';
    } else if(type==='area'){
      var av2=[0.3,0.45,0.4,0.58,0.52,0.7,0.66,0.82],pt='';
      for(i=0;i<av2.length;i++){var Xa=26+i*40,Ya=150-av2[i]*130;pt+=(i?'L':'M')+Xa+' '+Ya.toFixed(0)+' ';}
      s+='<path d="'+pt+'L'+(26+(av2.length-1)*40)+' 150 L26 150 Z" fill="'+COL[1]+'" opacity=".35"/>';
      s+='<path d="'+pt+'" fill="none" stroke="'+COL[0]+'" stroke-width="2.5"/>';
    } else if(type==='treemap'){
      var rects=[[30,14,150,80],[184,14,120,52],[184,70,58,60],[246,70,58,60],[30,98,80,46],[114,98,66,46]];
      for(i=0;i<rects.length;i++){var r2=rects[i];s+='<rect x="'+r2[0]+'" y="'+r2[1]+'" width="'+r2[2]+'" height="'+r2[3]+'" rx="4" fill="'+COL[i%3]+'" opacity="'+(0.85-i*0.09).toFixed(2)+'"/>';}
    }
    return frame(s);
  }
  // capability strip — numbered, built from WORK so the numbering never goes stale
  var strip=document.getElementById('capStrip');
  if(strip){
    strip.innerHTML=WORK.map(function(w,i){
      return '<div class="cap'+(i?'':' on')+'" data-id="'+w.id+'"><span class="cap-n">'+
        String(i+1).padStart(2,'0')+'</span><h4>'+w.label+'</h4><p>'+w.blurb+'</p></div>';
    }).join('');
  }
  var bento=document.getElementById('bento');
  bento.innerHTML=PROJECTS.map(function(p){
    // every field except id/title is optional, so each block is emitted only if present
    var kpi=p.kpi?'<span class="tile-kpi"><b>'+p.kpi+'</b><span>'+(p.kpiSub||'')+'</span></span>':'';
    var live=p.dash?'<a class="tile-live" href="'+p.dash+'" target="_blank" onclick="event.stopPropagation()"><span class="ld"></span>Live ↗</a>':'';
    return '<article class="tile '+(p.span||'s3')+'" data-id="'+p.id+'">'+
      '<div class="tile-prev"><span class="tile-cat">'+(p.cat||p.label||'')+'</span>'+
        kpi+charts(p.chart)+'</div>'+
      '<div class="tile-cap"><div><h4>'+p.title+'</h4><div class="csub">'+(p.csub||'')+'</div></div>'+
        '<div class="tile-links">'+live+
          '<a href="#" onclick="event.preventDefault();event.stopPropagation();openCase(\''+p.id+'\')">Case study →</a>'+
        '</div></div>'+
    '</article>';
  }).join('');
  document.querySelectorAll('.tile').forEach(function(t){t.addEventListener('click',function(){openCase(t.dataset.id);});});
  // capability strip → jump to the matching tile + brief highlight
  document.querySelectorAll('#capStrip .cap').forEach(function(cap){
    cap.addEventListener('click',function(){
      document.querySelectorAll('#capStrip .cap').forEach(function(c){c.classList.toggle('on',c===cap);});
      var tile=document.querySelector('.tile[data-id="'+cap.dataset.id+'"]');
      if(tile){tile.scrollIntoView({behavior:'smooth',block:'center'});tile.classList.remove('pulse');void tile.offsetWidth;tile.classList.add('pulse');}
    });
  });
})();

// CASE STUDY INSPECTOR — Triple-M data
// Built from WORK (js/projects.js) — the inspector reads whatever each entry provides.
const CASES=WORK.reduce(function(m,w){
  m[w.id]={
    cat:'// '+(w.cat||w.label||'').replace(/·/g,'·'),catColor:w.accent||'var(--teal)',
    title:w.title,
    kpi:w.kpi||'',kpiColor:w.accent||'var(--teal)',kpiLabel:w.kpiSub||'',
    market:w.market||w.blurb||'',
    arch:w.arch||[],
    metric:w.metric||'',
    tags:w.tags||[],
    repo:w.repo,
    dash:w.dash
  };
  return m;
},{});

const insp=document.getElementById('insp');
function openCase(id){
  const c=CASES[id];if(!c)return;
  const cat=document.getElementById('insp-cat');
  cat.textContent=c.cat;cat.style.color=c.catColor;
  document.getElementById('insp-title').textContent=c.title;
  const kv=document.getElementById('insp-kpi-v');
  kv.textContent=c.kpi;kv.style.color=c.kpiColor;
  document.getElementById('insp-kpi-l').textContent=c.kpiLabel;
  document.getElementById('insp-market').textContent=c.market;
  document.getElementById('insp-metric').textContent=c.metric;
  document.getElementById('insp-arch').innerHTML=c.arch.map(a=>`<li>${a}</li>`).join('');
  document.getElementById('insp-tags').innerHTML=c.tags.map(t=>`<span class="pc-tag">${t}</span>`).join('');
  if(c.repo)document.getElementById('insp-cta').href=c.repo;
  var dash=document.getElementById('insp-dash');
  if(c.dash){dash.href=c.dash;dash.style.display='block';}else{dash.style.display='none';}
  insp.classList.add('show');document.body.classList.add('insp-lock');
}
function closeCase(){insp.classList.remove('show');document.body.classList.remove('insp-lock');}
document.querySelectorAll('.pc').forEach(card=>{
  card.addEventListener('click',()=>openCase(card.dataset.id));
});
insp.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',closeCase));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCase();});

// NAV SCROLL
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>60);
});

// SCROLL FADE
const els=document.querySelectorAll('.sk,.pc,.ti,.edu-card,.r-card,.c-link,.avail,.info-item,.data-card');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.opacity='1';
      e.target.style.transform='translateY(0)';
      io.unobserve(e.target);
    }
  });
},{threshold:.08});
els.forEach(el=>{
  el.style.opacity='0';
  el.style.transform='translateY(12px)';
  el.style.transition='opacity .45s ease, transform .45s ease';
  io.observe(el);
});

// BAR ANIMATION
const bars=document.querySelectorAll('.bar-fill');
const bio=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const w=e.target.style.width;
      e.target.style.width='0';
      setTimeout(()=>e.target.style.width=w,100);
      bio.unobserve(e.target);
    }
  });
},{threshold:.5});
bars.forEach(b=>bio.observe(b));

// INTERACTIVE 3D POINTER-TILT + GLARE
// Each surface gets its own "feel" — projects tilt sharp, the photo leans gently, BI cards lift.
// rAF-throttled so pointermove never thrashes layout. Skipped on touch / reduced-motion.
(function(){
  var mq=window.matchMedia;
  var noHover=mq&&mq('(hover: none)').matches;
  var reduce=mq&&mq('(prefers-reduced-motion: reduce)').matches;
  if(noHover||reduce) return;
  // selector -> tuning: max tilt (deg), glare intensity, hover lift (px)
  var GROUPS=[
    ['.tile',     {max:5,  gi:.14, lift:4}],   // project tiles — gentle depth on hover
    ['.pc',       {max:7,  gi:.16, lift:6}],   // projects — crisp, responsive
    ['.data-card',{max:9,  gi:.18, lift:4}],   // hero metrics — most playful
    ['.sk',       {max:8,  gi:.13, lift:5}],   // skills — structured lift
    ['.photo-box',{max:5,  gi:.10, lift:0}],   // portrait — subtle, dignified
    ['.r-card',   {max:3.5,gi:.09, lift:3}],   // research — barely there, premium
    ['.edu-card', {max:6,  gi:.11, lift:3}]    // education — gentle
  ];
  GROUPS.forEach(function(g){
    var sel=g[0], cfg=g[1];
    document.querySelectorAll(sel).forEach(function(el){
      el.classList.add('tilt');
      if(getComputedStyle(el).position==='static') el.style.position='relative';
      var glare=document.createElement('div');
      glare.className='glare'; glare.style.setProperty('--gi',cfg.gi);
      el.appendChild(glare);
      var raf=0,nx=0,ny=0,gx=50,gy=50,active=false;
      function render(){
        raf=0;
        el.style.transform='perspective(900px) rotateX('+(ny*cfg.max)+'deg) rotateY('+(nx*cfg.max)+'deg) translateY('+(active?-cfg.lift:0)+'px)';
        glare.style.setProperty('--gx',gx+'%');
        glare.style.setProperty('--gy',gy+'%');
      }
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        nx=(px-0.5)*2; ny=-(py-0.5)*2;            // -1..1
        gx=px*100; gy=py*100;
        if(!raf) raf=requestAnimationFrame(render);
      });
      el.addEventListener('pointerenter',function(){active=true;el.classList.add('is-tilting');});
      el.addEventListener('pointerleave',function(){
        active=false;el.classList.remove('is-tilting');
        if(raf){cancelAnimationFrame(raf);raf=0;}
        nx=ny=0;el.style.transform='';           // ease back to rest via .tilt transition
      });
    });
  });

  // MAGNETIC BUTTONS — the CTAs lean toward the cursor, then snap back. Hand-built feel.
  document.querySelectorAll('.btn-fill,.btn-line,.nav-cta,.hsoc').forEach(function(b){
    b.style.transition=(b.style.transition?b.style.transition+',':'')+'transform .25s cubic-bezier(.2,.7,.3,1)';
    var pull=10;
    b.addEventListener('pointermove',function(e){
      var r=b.getBoundingClientRect();
      var dx=(e.clientX-(r.left+r.width/2))/r.width;
      var dy=(e.clientY-(r.top+r.height/2))/r.height;
      b.style.transform='translate('+(dx*pull)+'px,'+(dy*pull)+'px)';
    });
    b.addEventListener('pointerleave',function(){b.style.transform='';});
  });
})();

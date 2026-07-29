var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function bn(mv){return '$'+(mv/1000).toFixed(1)+'bn';}

/* ---------- REAL DATA — ABS Retail Trade, Australia (seasonally adjusted, $ million) ---------- */
var SERIES=[
  {m:'Jun 24',v:36204.5},{m:'Sep 24',v:36458.4},{m:'Nov 24',v:37040.9},
  {m:'Dec 24',v:36991.5},{m:'Mar 25',v:37275.1},{m:'Jun 25',v:37906.6}
];
var IND=[
  {name:'Food retailing',        short:'Food',        v:14995.5,mom:0.9, color:'#2f3b4d'},
  {name:'Household goods',       short:'Household',   v:6129.0, mom:2.3, color:'#456187'},
  {name:'Other retailing',       short:'Other',       v:6052.4, mom:1.9, color:'#6E7C63'},
  {name:'Cafes, restaurants & takeaway', short:'Cafes',v:5581.6,mom:-0.4,color:'#9A5B3B'},
  {name:'Clothing & footwear',   short:'Clothing',    v:3160.4, mom:1.5, color:'#B0853C'},
  {name:'Department stores',     short:'Dept stores', v:1987.7, mom:1.9, color:'#8B877F'}
];
var STATES=[
  {name:'NSW',mom:1.6},{name:'VIC',mom:1.2},{name:'QLD',mom:1.2},{name:'SA',mom:0.7},
  {name:'WA',mom:0.3},{name:'TAS',mom:0.4},{name:'NT',mom:0.8},{name:'ACT',mom:1.6}
];

function fitCanvas(cv){var r=cv.getBoundingClientRect();if(r.width<2)return null;var dpr=Math.min(devicePixelRatio||1,2);cv.width=r.width*dpr;cv.height=r.height*dpr;var cx=cv.getContext('2d');cx.setTransform(dpr,0,0,dpr,0,0);return {cx:cx,W:r.width,H:r.height};}

/* ---------- trend line ---------- */
var trend=document.getElementById('trend');
function drawTrend(){
  var f=fitCanvas(trend);if(!f)return;var cx=f.cx,W=f.W,H=f.H,padL=42,padB=28,padT=18;cx.clearRect(0,0,W,H);
  var vals=SERIES.map(function(d){return d.v;});
  var lo=35500,hi=38500;
  function X(i){return padL+i/(SERIES.length-1)*(W-padL-14);}
  function Y(v){return (H-padB)-(v-lo)/(hi-lo)*(H-padB-padT);}
  cx.font='10px "JetBrains Mono", monospace';
  cx.strokeStyle='rgba(20,19,17,.07)';cx.fillStyle='#8B877F';cx.lineWidth=1;
  [36000,36500,37000,37500,38000].forEach(function(v){var y=Y(v);cx.beginPath();cx.moveTo(padL,y);cx.lineTo(W-8,y);cx.stroke();cx.fillText('$'+(v/1000).toFixed(1)+'bn',2,y+3);});
  // area
  cx.beginPath();cx.moveTo(X(0),Y(vals[0]));SERIES.forEach(function(d,i){cx.lineTo(X(i),Y(d.v));});cx.lineTo(X(SERIES.length-1),H-padB);cx.lineTo(X(0),H-padB);cx.closePath();
  cx.fillStyle='rgba(78,124,90,.10)';cx.fill();
  // line
  cx.strokeStyle='#4E7C5A';cx.lineWidth=2.4;cx.beginPath();SERIES.forEach(function(d,i){i?cx.lineTo(X(i),Y(d.v)):cx.moveTo(X(i),Y(d.v));});cx.stroke();
  // points + labels
  SERIES.forEach(function(d,i){var x=X(i),y=Y(d.v);cx.fillStyle='#4E7C5A';cx.beginPath();cx.arc(x,y,3.2,0,7);cx.fill();
    cx.fillStyle='#141311';cx.font='bold 10px "JetBrains Mono", monospace';cx.textAlign='center';cx.fillText((d.v/1000).toFixed(1),x,y-9);
    cx.fillStyle='#8B877F';cx.font='9px "JetBrains Mono", monospace';cx.fillText(d.m,x,H-9);cx.textAlign='left';});
}

/* ---------- state bullets ---------- */
function renderStates(){
  var max=Math.max.apply(null,STATES.map(function(s){return s.mom;}));
  document.getElementById('states').innerHTML=STATES.map(function(s){
    var w=(s.mom/max*100).toFixed(1);
    var col=s.mom>=1.3?'#2f3b4d':s.mom>=0.7?'#456187':'#9AA089';
    return '<div class="blt"><span class="blt-name">'+s.name+'</span><div class="blt-track"><div class="blt-fill" style="width:'+w+'%;background:'+col+'"></div></div><span class="blt-val">+'+s.mom.toFixed(1)+'%</span></div>';
  }).join('');
}

/* ---------- category bars ---------- */
var cats=document.getElementById('cats');
function drawCats(){
  var f=fitCanvas(cats);if(!f)return;var cx=f.cx,W=f.W,H=f.H;cx.clearRect(0,0,W,H);
  var maxV=Math.max.apply(null,IND.map(function(c){return c.v;}));
  var padL=92,padR=60,top=8,rh=(H-top-6)/IND.length,bh=Math.min(24,rh*0.62);
  cx.font='11px "JetBrains Mono", monospace';
  IND.forEach(function(c,i){
    var y=top+rh*i+rh/2,w=(c.v/maxV)*(W-padL-padR);
    cx.fillStyle='#57544E';cx.textAlign='right';cx.fillText(c.short,padL-8,y+4);
    cx.fillStyle=c.color;cx.textAlign='left';
    var x=padL,h=bh,rr=3;cx.beginPath();cx.moveTo(x,y-h/2);cx.lineTo(x+Math.max(w-rr,0),y-h/2);cx.arcTo(x+w,y-h/2,x+w,y-h/2+rr,rr);cx.lineTo(x+w,y+h/2-rr);cx.arcTo(x+w,y+h/2,x+w-rr,y+h/2,rr);cx.lineTo(x,y+h/2);cx.closePath();cx.fill();
    cx.fillStyle='#141311';cx.font='bold 11px "JetBrains Mono", monospace';cx.fillText(bn(c.v),padL+w+7,y+4);
    cx.font='11px "JetBrains Mono", monospace';
  });
  cx.textAlign='left';
}

/* ---------- table ---------- */
function renderTable(){
  var tot=IND.reduce(function(a,c){return a+c.v;},0);
  var maxV=Math.max.apply(null,IND.map(function(c){return c.v;}));
  document.getElementById('tbody').innerHTML=IND.map(function(c){
    var pct=(c.v/tot*100),w=(c.v/maxV*100);
    var mom=(c.mom>=0?'<span class="up">+'+c.mom.toFixed(1)+'%</span>':'<span class="down">'+c.mom.toFixed(1)+'%</span>');
    return '<tr><td class="mono"><span class="chip"><i style="background:'+c.color+'"></i>'+c.name+'</span></td>'+
      '<td class="num mono">'+bn(c.v)+'</td><td class="num mono">'+pct.toFixed(1)+'%</td><td class="num">'+mom+'</td></tr>';
  }).join('');
}

/* ================= 3D CATEGORY TOWERS ================= */
function makeTextSprite(txt,color,fs){
  fs=fs||30;var pad=8,cv=document.createElement('canvas'),ctx=cv.getContext('2d');
  ctx.font='bold '+fs+'px "JetBrains Mono", monospace';var w=Math.ceil(ctx.measureText(txt).width);
  cv.width=w+pad*2;cv.height=fs+pad*2;ctx.font='bold '+fs+'px "JetBrains Mono", monospace';
  ctx.fillStyle=color;ctx.textBaseline='middle';ctx.fillText(txt,pad,cv.height/2);
  var tex=new THREE.CanvasTexture(cv);tex.needsUpdate=true;
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  var sc=0.42;sp.scale.set(cv.width*sc,cv.height*sc,1);return sp;
}
function axisLine(a,b,color,op){var g=new THREE.BufferGeometry().setFromPoints([a,b]);return new THREE.Line(g,new THREE.LineBasicMaterial({color:color,transparent:true,opacity:op||0.55}));}
/* 3D BUBBLE CHART — categories as floating spheres (size = turnover, height = growth), click to focus */
(function(){
  var canvas=document.getElementById('scene'),wrap=document.getElementById('sceneWrap'),tip=document.getElementById('tip');
  if(typeof THREE==='undefined')return;
  var W=wrap.clientWidth||600,H=wrap.clientHeight||360;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(W,H,false);
  var scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,W/H||1,1,4000);camera.position.set(0,150,650);camera.lookAt(0,115,0);
  var group=new THREE.Group();scene.add(group);
  var grid=new THREE.GridHelper(820,12,0x3a4658,0x242c38);group.add(grid);
  var GAP=140, x0=-(IND.length-1)*GAP/2, green=0x4E7C5A, red=0xBE4A31;
  var maxV=Math.max.apply(null,IND.map(function(c){return c.v;}));
  function yOf(m){return 120+m*46;}
  var gmat=new THREE.LineBasicMaterial({color:0x2f3a49,transparent:true,opacity:.4});
  var AX=x0-70, EX=x0+GAP*(IND.length-1)+70;
  group.add(axisLine(new THREE.Vector3(AX,yOf(0),0),new THREE.Vector3(EX,yOf(0),0),0x8FA6C6,0.5));
  var z0=makeTextSprite('0% MoM','#8FA6C6',22);z0.position.set(EX+40,yOf(0),0);group.add(z0);
  [1,2].forEach(function(v){var yy=yOf(v);var s=makeTextSprite('+'+v+'%','#8794a8',20);s.position.set(AX-32,yy,0);group.add(s);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(AX,yy,0),new THREE.Vector3(EX,yy,0)]),gmat));});
  var bubbles=[], sel=-1, t0=Date.now();
  IND.forEach(function(c,i){
    var rad=24+Math.sqrt(c.v/maxV)*48, by=yOf(c.mom), x=x0+i*GAP;
    var mesh=new THREE.Mesh(new THREE.SphereGeometry(rad,30,22),new THREE.MeshBasicMaterial({color:(c.mom>=0?green:red),transparent:true,opacity:.82}));mesh.position.set(x,by,0);group.add(mesh);
    var wf=new THREE.Mesh(new THREE.SphereGeometry(rad+1,18,12),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.08}));wf.position.set(x,by,0);group.add(wf);
    group.add(axisLine(new THREE.Vector3(x,0,0),new THREE.Vector3(x,by-rad,0),(c.mom>=0?green:red),0.25));
    var lbl=makeTextSprite(c.short,'#C9C3B8',22);lbl.position.set(x,-16,0);group.add(lbl);
    bubbles.push({mesh:mesh,wf:wf,c:c,by:by,rad:rad,x:x,phase:i*1.3});
  });
  function applySel(){bubbles.forEach(function(b,i){var on=(sel<0||i===sel);b.mesh.material.opacity=on?0.88:0.28;b.wf.material.opacity=on?0.1:0.03;var s=(i===sel)?1.16:1;b.mesh.scale.setScalar(s);b.wf.scale.setScalar(s);});}
  var drag=false,px=0,py=0,ry=0.3,rx=0.08,vy=0.0013,moved=false;
  wrap.addEventListener('pointerdown',function(e){drag=true;moved=false;px=e.clientX;py=e.clientY;wrap.classList.add('drag');});
  addEventListener('pointerup',function(){drag=false;wrap.classList.remove('drag');});
  wrap.addEventListener('pointermove',function(e){var r=wrap.getBoundingClientRect();if(drag){var dx=e.clientX-px;if(Math.abs(dx)>3||Math.abs(e.clientY-py)>3)moved=true;ry+=dx*0.006;rx+=(e.clientY-py)*0.005;rx=Math.max(-0.4,Math.min(0.7,rx));px=e.clientX;py=e.clientY;}hover(e.clientX-r.left,e.clientY-r.top,r.width,r.height);});
  wrap.addEventListener('pointerleave',function(){if(sel<0)tip.style.opacity=0;});
  wrap.addEventListener('click',function(e){if(moved)return;var r=wrap.getBoundingClientRect();var i=pick(e.clientX-r.left,e.clientY-r.top,r.width,r.height);sel=(i===sel)?-1:i;applySel();if(sel>=0)showTip(sel,e.clientX-r.left,e.clientY-r.top,r.width,r.height);else tip.style.opacity=0;});
  var proj=new THREE.Vector3();
  function pick(mx,my,rw,rh){var best=-1,bd=1e9;for(var i=0;i<bubbles.length;i++){var b=bubbles[i];proj.set(b.x,b.mesh.position.y,0).applyMatrix4(group.matrixWorld).project(camera);var sx=(proj.x*0.5+0.5)*rw,sy=(-proj.y*0.5+0.5)*rh;var dd=Math.hypot(sx-mx,sy-my);if(dd<b.rad*0.95&&dd<bd){bd=dd;best=i;}}return best;}
  function showTip(i,mx,my,rw,rh){var c=bubbles[i].c;tip.innerHTML='<b>'+c.name+'</b><br>'+bn(c.v)+' turnover<br>'+(c.mom>=0?'+':'')+c.mom.toFixed(1)+'% month-on-month';tip.style.left=Math.min(mx+14,rw-185)+'px';tip.style.top=Math.max(my-10,6)+'px';tip.style.opacity=1;}
  function hover(mx,my,rw,rh){if(sel>=0)return;var i=pick(mx,my,rw,rh);if(i>=0)showTip(i,mx,my,rw,rh);else tip.style.opacity=0;}
  function loop(){var tt=(Date.now()-t0)/1000;bubbles.forEach(function(b){var yy=b.by+Math.sin(tt*1.1+b.phase)*7;b.mesh.position.y=yy;b.wf.position.y=yy;});if(!drag)ry+=vy;group.rotation.y+=(ry-group.rotation.y)*0.08;group.rotation.x+=(rx-group.rotation.x)*0.08;renderer.render(scene,camera);if(!reduce)requestAnimationFrame(loop);}
  function resize(){W=wrap.clientWidth;H=wrap.clientHeight;if(W<2||H<2)return;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H,false);if(reduce)renderer.render(scene,camera);}
  addEventListener('resize',resize);if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  applySel();if(reduce)renderer.render(scene,camera);else loop();
})();

/* init */
renderStates();renderTable();
requestAnimationFrame(function(){requestAnimationFrame(function(){drawTrend();drawCats();});});
setTimeout(function(){drawTrend();drawCats();},400);
addEventListener('resize',function(){drawTrend();drawCats();});
if('ResizeObserver' in window){new ResizeObserver(function(){drawTrend();}).observe(trend);new ResizeObserver(function(){drawCats();}).observe(cats);}

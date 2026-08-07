var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function bn(v){return '$'+v.toFixed(1)+'bn';}

/* ---------- REAL DATA — parsed from the CGC 2026 Update by scripts/fetch_gst_reconciliation.py ---------- */
var GST=[
  {name:'Victoria',          short:'VIC', v:27.867,color:'#2f3b4d'},
  {name:'New South Wales',   short:'NSW', v:26.123,color:'#456187'},
  {name:'Queensland',        short:'QLD', v:18.438,color:'#5B7BA6'},
  {name:'South Australia',   short:'SA',  v:9.548, color:'#6E7C63'},
  {name:'Western Australia', short:'WA',  v:9.337, color:'#8a8a5e'},
  {name:'Northern Territory',short:'NT',  v:5.142, color:'#B0853C'},
  {name:'Tasmania',          short:'TAS', v:3.968, color:'#9A5B3B'},
  {name:'ACT',               short:'ACT', v:2.095, color:'#8B877F'}
];
/* Total GST pool by year ($bn) — CGC 2026 Update, Table 1 */
var POOL=[{y:'2025-26',v:96.554},{y:'2026-27',v:102.518}];

function fitCanvas(cv){if(!cv)return null;var r=cv.getBoundingClientRect();if(r.width<2)return null;var dpr=Math.min(devicePixelRatio||1,2);cv.width=r.width*dpr;cv.height=r.height*dpr;var cx=cv.getContext('2d');cx.setTransform(dpr,0,0,dpr,0,0);return {cx:cx,W:r.width,H:r.height};}

/* ---------- per-state distribution (horizontal) ---------- */
var pool=document.getElementById('pool');
function drawPool(){
  var f=fitCanvas(pool);if(!f)return;var cx=f.cx,W=f.W,H=f.H;cx.clearRect(0,0,W,H);
  var maxV=Math.max.apply(null,GST.map(function(d){return d.v;}));
  var padL=132,padR=64,top=8,rh=(H-top-6)/GST.length,bh=Math.min(26,rh*0.6);
  cx.font='11px "JetBrains Mono", monospace';
  GST.forEach(function(d,i){
    var y=top+rh*i+rh/2,w=(d.v/maxV)*(W-padL-padR);
    cx.fillStyle='#57544E';cx.textAlign='right';cx.font='bold 11px "JetBrains Mono", monospace';cx.fillText(d.name,padL-8,y+4);
    cx.fillStyle=d.color;cx.textAlign='left';
    var x=padL,h=bh,rr=3;cx.beginPath();cx.moveTo(x,y-h/2);cx.lineTo(x+Math.max(w-rr,0),y-h/2);cx.arcTo(x+w,y-h/2,x+w,y-h/2+rr,rr);cx.lineTo(x+w,y+h/2-rr);cx.arcTo(x+w,y+h/2,x+w-rr,y+h/2,rr);cx.lineTo(x,y+h/2);cx.closePath();cx.fill();
    cx.fillStyle='#141311';cx.font='bold 12px "JetBrains Mono", monospace';cx.fillText(bn(d.v),padL+w+8,y+4);
  });
  cx.textAlign='left';
}

/* ---------- pool trend ---------- */
var trend=document.getElementById('trend');
function drawTrend(){
  var f=fitCanvas(trend);if(!f)return;var cx=f.cx,W=f.W,H=f.H,padL=40,padB=28,padT=18;cx.clearRect(0,0,W,H);
  var lo=80,hi=105;
  function X(i){return padL+i/(POOL.length-1)*(W-padL-16);}
  function Y(v){return (H-padB)-(v-lo)/(hi-lo)*(H-padB-padT);}
  cx.font='10px "JetBrains Mono", monospace';
  cx.strokeStyle='rgba(20,19,17,.07)';cx.fillStyle='#8B877F';cx.lineWidth=1;
  [80,90,100].forEach(function(v){var y=Y(v);cx.beginPath();cx.moveTo(padL,y);cx.lineTo(W-8,y);cx.stroke();cx.fillText('$'+v+'bn',2,y+3);});
  cx.beginPath();cx.moveTo(X(0),Y(POOL[0].v));POOL.forEach(function(d,i){cx.lineTo(X(i),Y(d.v));});cx.lineTo(X(POOL.length-1),H-padB);cx.lineTo(X(0),H-padB);cx.closePath();
  cx.fillStyle='rgba(69,97,135,.10)';cx.fill();
  cx.strokeStyle='#456187';cx.lineWidth=2.4;cx.beginPath();POOL.forEach(function(d,i){i?cx.lineTo(X(i),Y(d.v)):cx.moveTo(X(i),Y(d.v));});cx.stroke();
  POOL.forEach(function(d,i){var x=X(i),y=Y(d.v);cx.fillStyle='#456187';cx.beginPath();cx.arc(x,y,3.4,0,7);cx.fill();
    cx.fillStyle='#141311';cx.font='bold 11px "JetBrains Mono", monospace';cx.textAlign='center';cx.fillText('$'+d.v.toFixed(0)+'bn',x,y-9);
    cx.fillStyle='#8B877F';cx.font='9px "JetBrains Mono", monospace';cx.fillText(d.y,x,H-9);cx.textAlign='left';});
}

/* ---------- table ---------- */
function renderTable(){
  var tot=GST.reduce(function(a,d){return a+d.v;},0);
  var maxV=Math.max.apply(null,GST.map(function(d){return d.v;}));
  document.getElementById('tbody').innerHTML=GST.map(function(d){
    var pct=(d.v/tot*100),w=(d.v/maxV*100);
    return '<tr><td class="mono"><span class="chip"><i style="background:'+d.color+'"></i>'+d.name+'</span></td>'+
      '<td class="num mono">'+bn(d.v)+'</td><td class="num mono">'+pct.toFixed(1)+'%</td>'+
      '<td class="bar-cell"><span class="bar" style="width:'+w+'%;background:'+d.color+'"></span></td></tr>';
  }).join('');
}

/* ================= 3D STATE BARS ================= */
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
function hex2int(h){return parseInt(h.slice(1),16);}
/* 3D STACKED COLUMN — the GST pool as one column split into state slabs, click a slab to pull it out */
(function(){
  var canvas=document.getElementById('scene'),wrap=document.getElementById('sceneWrap'),tip=document.getElementById('tip');
  if(typeof THREE==='undefined')return;
  var W=wrap.clientWidth||600,H=wrap.clientHeight||360;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(W,H,false);
  var scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,W/H||1,1,4000);camera.position.set(0,150,560);camera.lookAt(0,118,0);
  var group=new THREE.Group();scene.add(group);
  var grid=new THREE.GridHelper(560,10,0x3a4658,0x20272f);group.add(grid);
  var SC=2.35, WID=94, sel=-1, tot=GST.reduce(function(a,d){return a+d.v;},0);
  var order=GST.slice().sort(function(a,b){return b.v-a.v;}); // largest slab at the base
  var ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
  var slabs=[], cum=0;
  order.forEach(function(d){
    var h=Math.max(2,d.v*SC), yc=cum+h/2;
    var m=new THREE.Mesh(new THREE.BoxGeometry(WID,h,WID),new THREE.MeshBasicMaterial({color:hex2int(d.color),transparent:true,opacity:.96}));m.position.set(0,yc,0);group.add(m);
    var wf=new THREE.Mesh(new THREE.BoxGeometry(WID+1.5,h,WID+1.5),new THREE.MeshBasicMaterial({color:0x0c0b08,wireframe:true,transparent:true,opacity:.3}));wf.position.set(0,yc,0);group.add(wf);
    var lbl=makeTextSprite(d.short+'  $'+d.v.toFixed(1)+'bn','#D6D0C6',20);lbl.position.set(WID*0.5+96,yc,0);group.add(lbl);
    slabs.push({m:m,wf:wf,lbl:lbl,d:d,yc:yc,h:h});
    cum+=h;
  });
  var totLbl=makeTextSprite('GST POOL ≈$102bn','#9FC3AC',24);totLbl.position.set(0,cum+28,0);group.add(totLbl);
  function applySel(){slabs.forEach(function(s,i){var off=(i===sel)?88:0;s.m.position.x=off;s.wf.position.x=off;s.lbl.position.x=WID*0.5+96+off;s.m.material.opacity=(sel<0||i===sel)?0.98:0.4;s.wf.material.opacity=(sel<0||i===sel)?0.32:0.12;});}
  var drag=false,px=0,py=0,ry=0.25,rx=0.02,vy=0.0012,moved=false;
  wrap.addEventListener('pointerdown',function(e){drag=true;moved=false;px=e.clientX;py=e.clientY;wrap.classList.add('drag');});
  addEventListener('pointerup',function(){drag=false;wrap.classList.remove('drag');});
  wrap.addEventListener('pointermove',function(e){var r=wrap.getBoundingClientRect();if(drag){var dx=e.clientX-px;if(Math.abs(dx)>3||Math.abs(e.clientY-py)>3)moved=true;ry+=dx*0.006;rx+=(e.clientY-py)*0.004;rx=Math.max(-0.3,Math.min(0.5,rx));px=e.clientX;py=e.clientY;}hover(e.clientX-r.left,e.clientY-r.top,r.width,r.height);});
  wrap.addEventListener('pointerleave',function(){if(sel<0)tip.style.opacity=0;});
  wrap.addEventListener('click',function(e){if(moved)return;var r=wrap.getBoundingClientRect();var i=pick(e.clientX-r.left,e.clientY-r.top,r.width,r.height);sel=(i===sel)?-1:i;applySel();if(sel>=0)showTip(sel,e.clientX-r.left,e.clientY-r.top,r.width,r.height);else tip.style.opacity=0;});
  function pick(mx,my,rw,rh){ndc.set(mx/rw*2-1,-(my/rh)*2+1);ray.setFromCamera(ndc,camera);var meshes=slabs.map(function(s){return s.m;});var hit=ray.intersectObjects(meshes,false);if(!hit.length)return -1;for(var i=0;i<slabs.length;i++)if(slabs[i].m===hit[0].object)return i;return -1;}
  function showTip(i,mx,my,rw,rh){var d=slabs[i].d;tip.innerHTML='<b>'+d.name+'</b><br>'+bn(d.v)+' GST<br>'+(d.v/tot*100).toFixed(1)+'% of the pool';tip.style.left=Math.min(mx+14,rw-185)+'px';tip.style.top=Math.max(my-10,6)+'px';tip.style.opacity=1;}
  function hover(mx,my,rw,rh){if(sel>=0)return;var i=pick(mx,my,rw,rh);if(i>=0)showTip(i,mx,my,rw,rh);else tip.style.opacity=0;}
  function loop(){if(!drag)ry+=vy;group.rotation.y+=(ry-group.rotation.y)*0.08;group.rotation.x+=(rx-group.rotation.x)*0.08;renderer.render(scene,camera);if(!reduce)requestAnimationFrame(loop);}
  function resize(){W=wrap.clientWidth;H=wrap.clientHeight;if(W<2||H<2)return;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H,false);if(reduce)renderer.render(scene,camera);}
  addEventListener('resize',resize);if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  applySel();if(reduce)renderer.render(scene,camera);else loop();
})();

/* init */
renderTable();
requestAnimationFrame(function(){requestAnimationFrame(function(){drawPool();drawTrend();});});
setTimeout(function(){drawPool();drawTrend();},400);
addEventListener('resize',function(){drawPool();drawTrend();});
/* Some charts are rendered ahead of time in R, so their canvas may not be on the
   page. Only observe the ones that are. */
function observeIfPresent(el,fn){if(el)new ResizeObserver(fn).observe(el);}
if('ResizeObserver' in window){observeIfPresent(pool,drawPool);observeIfPresent(trend,drawTrend);}

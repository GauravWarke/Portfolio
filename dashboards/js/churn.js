var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function fmt(n){return n.toLocaleString('en-AU');}

/* ---------- REAL DATA — parsed from ABS datacube 8165DC01.xlsx by scripts/fetch_business_churn.py ---------- */
var NAT={total:2729648,entries:437150,exits:370500,entryRate:16.4,exitRate:13.9,net:66650,netPct:2.5};
var STATES=[
  {name:'New South Wales',   short:'NSW',        v:916603,add:20040,color:'#2f3b4d'},
  {name:'Victoria',          short:'VIC',        v:754400,add:16486,color:'#456187'},
  {name:'Queensland',        short:'QLD',        v:524024,add:13579,color:'#5B7BA6'},
  {name:'Other states & territories',short:'SA·TAS·NT·ACT',v:268348,add:5558,color:'#6E7C63'},
  {name:'Western Australia', short:'WA',         v:266273,add:10877,color:'#B0853C'}
];
/* Four-year survival, Jun 2021 -> Jun 2025 (%) — ABS 8165.0 Tables 2 and 5 */
var SURV=[
  {name:'Agriculture (best industry)', v:74.9,color:'#4E7C5A'},
  {name:'Health Care & Social Assist.',v:71.5,color:'#456187'},
  {name:'All industries',              v:63.1,color:'#B0853C'},
  {name:'Accommodation & Food',        v:54.7,color:'#9A5B3B'},
  {name:'Transport & Warehousing',     v:48.5,color:'#8C4A46'}
];

function fitCanvas(cv){var r=cv.getBoundingClientRect();if(r.width<2)return null;var dpr=Math.min(devicePixelRatio||1,2);cv.width=r.width*dpr;cv.height=r.height*dpr;var cx=cv.getContext('2d');cx.setTransform(dpr,0,0,dpr,0,0);return {cx:cx,W:r.width,H:r.height};}

/* ---------- entries vs exits flow ---------- */
var flow=document.getElementById('flow');
function drawFlow(){
  var f=fitCanvas(flow);if(!f)return;var cx=f.cx,W=f.W,H=f.H,padB=40,padT=24;cx.clearRect(0,0,W,H);
  var bars=[{l:'Entries',v:NAT.entries,c:'#4E7C5A'},{l:'Exits',v:NAT.exits,c:'#BE4A31'}];
  var maxV=NAT.entries*1.18;
  function Y(v){return (H-padB)-v/maxV*(H-padB-padT);}
  cx.font='10px "JetBrains Mono", monospace';
  cx.strokeStyle='rgba(20,19,17,.07)';cx.fillStyle='#8B877F';cx.lineWidth=1;
  [0,100000,200000,300000,400000].forEach(function(v){var y=Y(v);cx.beginPath();cx.moveTo(70,y);cx.lineTo(W-8,y);cx.stroke();cx.fillText((v/1000)+'k',36,y+3);});
  var slot=(W-78)/bars.length,bw=Math.min(120,slot*0.5);
  bars.forEach(function(b,i){
    var cxp=70+slot*(i+0.5),x=cxp-bw/2,y=Y(b.v);
    cx.fillStyle=b.c;cx.fillRect(x,y,bw,(H-padB)-y);
    cx.fillStyle='#141311';cx.font='bold 15px Archivo, sans-serif';cx.textAlign='center';cx.fillText(fmt(b.v),cxp,y-8);
    cx.fillStyle='#57544E';cx.font='11px "JetBrains Mono", monospace';cx.fillText(b.l,cxp,H-22);
    cx.fillStyle='#8B877F';cx.font='10px "JetBrains Mono", monospace';cx.fillText(i===0?NAT.entryRate+'% rate':NAT.exitRate+'% rate',cxp,H-8);
  });
  // net badge
  cx.textAlign='center';cx.fillStyle='#4E7C5A';cx.font='bold 12px "JetBrains Mono", monospace';
  cx.fillText('net +'+fmt(NAT.net)+' businesses',W/2,padT-8);
  cx.textAlign='left';
}

/* ---------- table ---------- */
function renderTable(){
  var rows=STATES.slice().sort(function(a,b){return b.v-a.v;});
  var maxV=Math.max.apply(null,rows.map(function(d){return d.v;}));
  document.getElementById('tbody').innerHTML=rows.map(function(d){
    var pct=(d.v/NAT.total*100),w=(d.v/maxV*100);
    return '<tr><td class="mono"><span class="chip"><i style="background:'+d.color+'"></i>'+d.name+'</span></td>'+
      '<td class="num mono">'+fmt(d.v)+'</td><td class="num mono">'+pct.toFixed(1)+'%</td>'+
      '<td class="num"><span class="up">+'+fmt(d.add)+'</span></td></tr>';
  }).join('')+
    '<tr><td class="mono"><b>Australia</b></td><td class="num mono"><b>'+fmt(NAT.total)+'</b></td><td class="num mono">100%</td><td class="num"><span class="up">+'+fmt(NAT.net)+'</span></td></tr>';
}

/* ================= 3D STATE BARS ================= */
function makeTextSprite(txt,color,fs){
  fs=fs||28;var pad=8,cv=document.createElement('canvas'),ctx=cv.getContext('2d');
  ctx.font='bold '+fs+'px "JetBrains Mono", monospace';var w=Math.ceil(ctx.measureText(txt).width);
  cv.width=w+pad*2;cv.height=fs+pad*2;ctx.font='bold '+fs+'px "JetBrains Mono", monospace';
  ctx.fillStyle=color;ctx.textBaseline='middle';ctx.fillText(txt,pad,cv.height/2);
  var tex=new THREE.CanvasTexture(cv);tex.needsUpdate=true;
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  var sc=0.42;sp.scale.set(cv.width*sc,cv.height*sc,1);return sp;
}
function axisLine(a,b,color,op){var g=new THREE.BufferGeometry().setFromPoints([a,b]);return new THREE.Line(g,new THREE.LineBasicMaterial({color:color,transparent:true,opacity:op||0.55}));}
function hex2int(h){return parseInt(h.slice(1),16);}
/* 3D RADIAL BAR CHART — states in a ring, click a bar to focus */
(function(){
  var canvas=document.getElementById('scene'),wrap=document.getElementById('sceneWrap'),tip=document.getElementById('tip');
  if(typeof THREE==='undefined')return;
  var order=STATES.slice().sort(function(a,b){return b.v-a.v;}), N=order.length;
  var W=wrap.clientWidth||600,H=wrap.clientHeight||360;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(W,H,false);
  var scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,W/H||1,1,4000);camera.position.set(0,320,560);camera.lookAt(0,30,0);
  var group=new THREE.Group();scene.add(group);
  var R=195, SC=0.00028, sel=-1;
  var maxV=Math.max.apply(null,order.map(function(d){return d.v;})), Ymax=maxV*SC+40;
  group.add(axisLine(new THREE.Vector3(0,0,0),new THREE.Vector3(0,Ymax,0),0x9FC3AC,0.45));
  var gmat=new THREE.LineBasicMaterial({color:0x2f3a49,transparent:true,opacity:.35});
  [250000,500000,750000].forEach(function(v){var yy=v*SC;var s=makeTextSprite((v/1000)+'k','#8794a8',22);s.position.set(-20,yy,0);group.add(s);
    var pts=[];for(var a=0;a<=54;a++){var t=a/54*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*R*1.06,yy,Math.sin(t)*R*1.06));}
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gmat));});
  var lblY=makeTextSprite('BUSINESSES BY STATE','#9FC3AC',24);lblY.position.set(0,Ymax+24,0);group.add(lblY);
  var bars=[];
  order.forEach(function(d,i){
    var ang=-Math.PI/2+i/N*Math.PI*2, bx=Math.cos(ang)*R, bz=Math.sin(ang)*R, h=Math.max(2,d.v*SC);
    var g=new THREE.Group();g.position.set(bx,0,bz);group.add(g);
    var m=new THREE.Mesh(new THREE.BoxGeometry(48,1,48),new THREE.MeshBasicMaterial({color:hex2int(d.color),transparent:true,opacity:.95}));m.scale.y=h;m.position.y=h/2;g.add(m);
    var wf=new THREE.Mesh(new THREE.BoxGeometry(49,1,49),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.12}));wf.scale.y=h;wf.position.y=h/2;g.add(wf);
    var lbl=makeTextSprite(d.short,'#C9C3B8',22);lbl.position.set(0,-20,0);g.add(lbl);
    var vlbl=makeTextSprite(Math.round(d.v/1000)+'k','#EFE9DF',22);vlbl.position.set(0,h+18,0);g.add(vlbl);
    bars.push({g:g,m:m,wf:wf,d:d,bx:bx,bz:bz,h:h});
  });
  function applySel(){bars.forEach(function(b,i){var out=(i===sel)?1.3:1;b.g.position.set(b.bx*out,0,b.bz*out);b.m.material.opacity=(sel<0||i===sel)?0.95:0.35;b.wf.material.opacity=(sel<0||i===sel)?0.16:0.05;});}
  var drag=false,px=0,py=0,ry=0.35,rx=0.5,vy=0.001,moved=false;
  wrap.addEventListener('pointerdown',function(e){drag=true;moved=false;px=e.clientX;py=e.clientY;wrap.classList.add('drag');});
  addEventListener('pointerup',function(){drag=false;wrap.classList.remove('drag');});
  wrap.addEventListener('pointermove',function(e){var r=wrap.getBoundingClientRect();if(drag){var dx=e.clientX-px;if(Math.abs(dx)>3||Math.abs(e.clientY-py)>3)moved=true;ry+=dx*0.006;rx+=(e.clientY-py)*0.005;rx=Math.max(0.1,Math.min(1.1,rx));px=e.clientX;py=e.clientY;}hover(e.clientX-r.left,e.clientY-r.top,r.width,r.height);});
  wrap.addEventListener('pointerleave',function(){if(sel<0)tip.style.opacity=0;});
  wrap.addEventListener('click',function(e){if(moved)return;var r=wrap.getBoundingClientRect();var i=pick(e.clientX-r.left,e.clientY-r.top,r.width,r.height);sel=(i===sel)?-1:i;applySel();if(sel>=0)showTip(sel,e.clientX-r.left,e.clientY-r.top,r.width,r.height);else tip.style.opacity=0;});
  var proj=new THREE.Vector3();
  function pick(mx,my,rw,rh){var best=-1,bd=46;for(var i=0;i<bars.length;i++){var b=bars[i];proj.set(b.g.position.x,b.h,b.g.position.z).applyMatrix4(group.matrixWorld).project(camera);var sx=(proj.x*0.5+0.5)*rw,sy=(-proj.y*0.5+0.5)*rh;var dd=Math.hypot(sx-mx,sy-my);if(dd<bd){bd=dd;best=i;}}return best;}
  function showTip(i,mx,my,rw,rh){var d=bars[i].d;tip.innerHTML='<b>'+d.name+'</b><br>'+fmt(d.v)+' businesses<br>'+(d.v/NAT.total*100).toFixed(1)+'% of Australia · +'+fmt(d.add);tip.style.left=Math.min(mx+14,rw-185)+'px';tip.style.top=Math.max(my-10,6)+'px';tip.style.opacity=1;}
  function hover(mx,my,rw,rh){if(sel>=0)return;var i=pick(mx,my,rw,rh);if(i>=0)showTip(i,mx,my,rw,rh);else tip.style.opacity=0;}
  function loop(){if(!drag)ry+=vy;group.rotation.y+=(ry-group.rotation.y)*0.08;group.rotation.x+=(rx-group.rotation.x)*0.08;renderer.render(scene,camera);if(!reduce)requestAnimationFrame(loop);}
  function resize(){W=wrap.clientWidth;H=wrap.clientHeight;if(W<2||H<2)return;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H,false);if(reduce)renderer.render(scene,camera);}
  addEventListener('resize',resize);if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  applySel();if(reduce)renderer.render(scene,camera);else loop();
})();

/* init */
renderTable();
requestAnimationFrame(function(){requestAnimationFrame(drawFlow);});
setTimeout(drawFlow,400);
addEventListener('resize',drawFlow);
/* Some charts are rendered ahead of time in R, so their canvas may not be on the
   page. Only observe the ones that are. */
function observeIfPresent(el,fn){if(el)new ResizeObserver(fn).observe(el);}
if('ResizeObserver' in window){observeIfPresent(flow,drawFlow);}

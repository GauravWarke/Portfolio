var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function fmtM(n){return '$'+(n/1e6).toFixed(1)+'M';}

/* ---------- REAL DATA (published open data) ---------- */
/* Commonwealth campaign advertising — Dept of Finance annual reports */
var FED=[
  {y:'2021-22',total:339200000,media:null,dev:null},
  {y:'2022-23',total:179300000,media:null,dev:null},
  {y:'2023-24',total:250600000,media:173800000,dev:76600000}
];
/* 2023-24 media placement by channel — parsed from the Dept of Finance report
   by scripts/fetch_govt_ad_spend.py; the seven channels sum to the published
   $173.8M media placement total. */
var CH=[
  {key:'digital',name:'Digital',   v:75900000,color:'#2f3b4d'},
  {key:'tv',     name:'Television', v:54700000,color:'#456187'},
  {key:'ooh',    name:'Out-of-home',v:17700000,color:'#6E7C63'},
  {key:'radio',  name:'Radio',     v:15200000,color:'#B0853C'},
  {key:'cinema', name:'Cinema',    v:6200000, color:'#9A5B3B'},
  {key:'press',  name:'Press',     v:3700000, color:'#8B877F'},
  {key:'mag',    name:'Magazine',  v:400000,  color:'#7C8A93'}
];
var chOn={digital:true,tv:true,ooh:true,radio:true,cinema:true,press:true,mag:true};
/* Audience cuts of that spend — subsets, not additional channels */
var AUD=[
  {name:'Regional',      v:34200000},
  {name:'Ethnic',        v:10100000},
  {name:'First Nations', v:6800000}
];
/* cross-jurisdiction — latest published media / placement spend */
var JUR=[
  {name:'Commonwealth',v:173800000,yr:'2023-24',color:'#2f3b4d'},
  {name:'New South Wales',v:131460000,yr:'2022-23',color:'#456187'},
  {name:'Queensland',v:50718130,yr:'2023-24',color:'#B0853C'}
];
var measure='total';

/* ---------- canvas helper ---------- */
function fitCanvas(cv){var r=cv.getBoundingClientRect();if(r.width<2)return null;var dpr=Math.min(devicePixelRatio||1,2);cv.width=r.width*dpr;cv.height=r.height*dpr;var cx=cv.getContext('2d');cx.setTransform(dpr,0,0,dpr,0,0);return {cx:cx,W:r.width,H:r.height};}
function hexA(hex,a){var n=parseInt(hex.slice(1),16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}

/* ---------- trend: yearly columns ---------- */
var trend=document.getElementById('trend');
function drawTrend(){
  var f=fitCanvas(trend);if(!f)return;var cx=f.cx,W=f.W,H=f.H,padL=38,padB=30,padT=16;cx.clearRect(0,0,W,H);
  var maxV=Math.max.apply(null,FED.map(function(d){return d.total;}))*1.12;
  function Y(v){return (H-padB)-v/maxV*(H-padB-padT);}
  cx.font='10px '+'"JetBrains Mono", monospace';
  // gridlines + $ ticks
  cx.strokeStyle=hexA('#141311',.07);cx.fillStyle='#8B877F';cx.lineWidth=1;
  [0,100000000,200000000,300000000].forEach(function(v){var y=Y(v);cx.beginPath();cx.moveTo(padL,y);cx.lineTo(W-8,y);cx.stroke();cx.fillText('$'+(v/1e6)+'M',4,y+3);});
  // axis
  cx.strokeStyle=hexA('#141311',.28);cx.beginPath();cx.moveTo(padL,H-padB);cx.lineTo(W-8,H-padB);cx.stroke();
  var n=FED.length,slot=(W-padL-16)/n,bw=Math.min(64,slot*0.5);
  FED.forEach(function(d,i){
    var cxpos=padL+slot*(i+0.5),x=cxpos-bw/2;
    if(measure==='split'&&d.media!=null){
      var ym=Y(d.media),yt=Y(d.total);
      cx.fillStyle='#456187';cx.fillRect(x,ym,bw,(H-padB)-ym);
      cx.fillStyle='#B0853C';cx.fillRect(x,yt,bw,ym-yt);
    }else{
      cx.fillStyle=i===n-1?'#141311':'#6f6b63';cx.fillRect(x,Y(d.total),bw,(H-padB)-Y(d.total));
    }
    cx.fillStyle='#141311';cx.font='bold 11px "JetBrains Mono", monospace';cx.textAlign='center';
    cx.fillText(fmtM(d.total),cxpos,Y(d.total)-6);
    cx.fillStyle='#8B877F';cx.font='10px "JetBrains Mono", monospace';cx.fillText(d.y,cxpos,H-10);cx.textAlign='left';
  });
  if(measure==='split'){
    cx.fillStyle='#456187';cx.fillRect(padL,padT-6,9,9);cx.fillStyle='#57544E';cx.font='10px "JetBrains Mono", monospace';cx.fillText('media',padL+13,padT+2);
    cx.fillStyle='#B0853C';cx.fillRect(padL+70,padT-6,9,9);cx.fillStyle='#57544E';cx.fillText('development',padL+83,padT+2);
  }
}

/* ---------- channel mix: horizontal bars ---------- */
var chmix=document.getElementById('chmix');
function drawChmix(){
  var f=fitCanvas(chmix);if(!f)return;var cx=f.cx,W=f.W,H=f.H;cx.clearRect(0,0,W,H);
  var rows=CH.filter(function(c){return chOn[c.key];});
  var maxV=Math.max.apply(null,CH.map(function(c){return c.v;}));
  var padL=96,padR=64,top=10,rh=(H-top-6)/rows.length,bh=Math.min(24,rh*0.62);
  cx.font='11px "JetBrains Mono", monospace';
  rows.forEach(function(c,i){
    var y=top+rh*i+rh/2, w=(c.v/maxV)*(W-padL-padR);
    cx.fillStyle='#57544E';cx.textAlign='right';cx.fillText(c.name,padL-8,y+4);
    cx.fillStyle=c.color;cx.beginPath();
    var x=padL,h=bh,rr=3;cx.moveTo(x,y-h/2);cx.lineTo(x+Math.max(w-rr,0),y-h/2);cx.arcTo(x+w,y-h/2,x+w,y-h/2+rr,rr);cx.lineTo(x+w,y+h/2-rr);cx.arcTo(x+w,y+h/2,x+w-rr,y+h/2,rr);cx.lineTo(x,y+h/2);cx.closePath();cx.fill();
    cx.fillStyle='#141311';cx.font='bold 11px "JetBrains Mono", monospace';cx.textAlign='left';cx.fillText(fmtM(c.v),padL+w+7,y+4);
    cx.font='11px "JetBrains Mono", monospace';
  });
  cx.textAlign='left';
}

/* ---------- cross-jurisdiction ---------- */
var juris=document.getElementById('juris');
function drawJuris(){
  var f=fitCanvas(juris);if(!f)return;var cx=f.cx,W=f.W,H=f.H;cx.clearRect(0,0,W,H);
  var maxV=Math.max.apply(null,JUR.map(function(d){return d.v;}))*1.02;
  var padL=130,padR=70,top=12,rh=(H-top-8)/JUR.length,bh=Math.min(30,rh*0.55);
  cx.font='11px "JetBrains Mono", monospace';
  JUR.forEach(function(d,i){
    var y=top+rh*i+rh/2,w=(d.v/maxV)*(W-padL-padR);
    cx.fillStyle='#57544E';cx.textAlign='right';cx.font='bold 11px "JetBrains Mono", monospace';cx.fillText(d.name,padL-8,y+1);
    cx.fillStyle='#8B877F';cx.font='9px "JetBrains Mono", monospace';cx.fillText(d.yr,padL-8,y+13);
    cx.fillStyle=d.color;cx.textAlign='left';
    var x=padL,h=bh,rr=3;cx.beginPath();cx.moveTo(x,y-h/2);cx.lineTo(x+Math.max(w-rr,0),y-h/2);cx.arcTo(x+w,y-h/2,x+w,y-h/2+rr,rr);cx.lineTo(x+w,y+h/2-rr);cx.arcTo(x+w,y+h/2,x+w-rr,y+h/2,rr);cx.lineTo(x,y+h/2);cx.closePath();cx.fill();
    cx.fillStyle='#141311';cx.font='bold 12px "JetBrains Mono", monospace';cx.fillText(fmtM(d.v),padL+w+8,y+4);
  });
  cx.textAlign='left';
}

/* ---------- table ---------- */
function renderTable(){
  var tot=CH.reduce(function(a,c){return a+c.v;},0);
  var maxV=Math.max.apply(null,CH.map(function(c){return c.v;}));
  document.getElementById('tbody').innerHTML=CH.map(function(c){
    var pct=(c.v/tot*100),w=(c.v/maxV*100);
    return '<tr><td class="mono"><span class="chip"><i style="background:'+c.color+'"></i>'+c.name+'</span></td>'+
      '<td class="num mono">'+fmtM(c.v)+'</td><td class="num mono">'+pct.toFixed(1)+'%</td>'+
      '<td class="bar-cell"><span class="bar" style="width:'+w+'%;background:'+c.color+'"></span></td></tr>';
  }).join('');
}

/* ---------- channel filter UI ---------- */
function renderChFilter(){
  document.getElementById('chFilter').innerHTML=CH.map(function(c){
    return '<div class="chk'+(chOn[c.key]?' on':'')+'" data-ch="'+c.key+'"><span class="tick"></span><span class="sw" style="background:'+c.color+'"></span>'+c.name+'</div>';
  }).join('');
  document.querySelectorAll('#chFilter .chk').forEach(function(n){n.addEventListener('click',function(){var k=n.dataset.ch;chOn[k]=!chOn[k];if(CH.every(function(c){return !chOn[c.key];}))chOn[k]=true;renderChFilter();drawChmix();if(window.updateBars)window.updateBars();});});
}
document.getElementById('legend3d').innerHTML=CH.map(function(c){return '<span class="lg"><i style="background:'+c.color+'"></i>'+c.name+'</span>';}).join('');

/* ---------- measure toggle ---------- */
document.querySelectorAll('#measSeg button').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('#measSeg button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');measure=b.dataset.meas;drawTrend();});});

/* ================= 3D CHANNEL BARS ================= */
var updateBars=function(){};
function makeTextSprite(txt,color,fs){
  fs=fs||34;var pad=8,cv=document.createElement('canvas'),ctx=cv.getContext('2d');
  ctx.font='bold '+fs+'px "JetBrains Mono", monospace';var w=Math.ceil(ctx.measureText(txt).width);
  cv.width=w+pad*2;cv.height=fs+pad*2;ctx.font='bold '+fs+'px "JetBrains Mono", monospace';
  ctx.fillStyle=color;ctx.textBaseline='middle';ctx.fillText(txt,pad,cv.height/2);
  var tex=new THREE.CanvasTexture(cv);tex.needsUpdate=true;
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  var sc=0.42;sp.scale.set(cv.width*sc,cv.height*sc,1);return sp;
}
function axisLine(a,b,color,op){var g=new THREE.BufferGeometry().setFromPoints([a,b]);return new THREE.Line(g,new THREE.LineBasicMaterial({color:color,transparent:true,opacity:op||0.55}));}
function hex2int(h){return parseInt(h.slice(1),16);}
/* 3D PIE CHART — media channels as extruded wedges, click a slice to explode */
(function(){
  var canvas=document.getElementById('scene'),wrap=document.getElementById('sceneWrap'),tip=document.getElementById('tip');
  if(typeof THREE==='undefined')return;
  var W=wrap.clientWidth||600,H=wrap.clientHeight||320;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(W,H,false);
  var scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,W/H||1,1,4000);camera.position.set(0,300,340);camera.lookAt(0,0,0);
  var group=new THREE.Group();scene.add(group);
  var grid3=new THREE.GridHelper(560,10,0x3a4658,0x20272f);grid3.position.y=-24;group.add(grid3);
  var RAD=150,HGT=36,slices=[],sel=-1;
  var ray=new THREE.Raycaster(), ndc=new THREE.Vector2();
  function buildPie(){
    for(var k=pieGroup.children.length-1;k>=0;k--){var ch=pieGroup.children[k];pieGroup.remove(ch);if(ch.geometry)ch.geometry.dispose();}
    slices=[];
    var vis=CH.filter(function(c){return chOn[c.key];});
    var tot=vis.reduce(function(a,c){return a+c.v;},0)||1, acc=-Math.PI/2;
    vis.forEach(function(c){
      var frac=c.v/tot, theta=frac*Math.PI*2, mid=acc+theta/2;
      var geo=new THREE.CylinderGeometry(RAD,RAD,HGT,48,1,false,acc,theta);
      var mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:hex2int(c.color),transparent:true,opacity:.95}));
      pieGroup.add(mesh);
      slices.push({mesh:mesh,c:c,mid:mid,frac:frac});
      acc+=theta;
    });
    if(sel>=slices.length)sel=-1;
    applySel();
  }
  var pieGroup=new THREE.Group();group.add(pieGroup);
  function applySel(){slices.forEach(function(s,i){var off=(i===sel)?46:0;s.mesh.position.set(Math.sin(s.mid)*off,(i===sel)?10:0,Math.cos(s.mid)*off);s.mesh.material.opacity=(sel<0||i===sel)?0.98:0.5;});}
  updateBars=function(){buildPie();};window.updateBars=updateBars;buildPie();
  var drag=false,px=0,py=0,ry=0,rxr=0,vy=0.0016,moved=false;
  wrap.addEventListener('pointerdown',function(e){drag=true;moved=false;px=e.clientX;py=e.clientY;wrap.classList.add('drag');});
  addEventListener('pointerup',function(){drag=false;wrap.classList.remove('drag');});
  wrap.addEventListener('pointermove',function(e){var r=wrap.getBoundingClientRect();if(drag){var dx=e.clientX-px;if(Math.abs(dx)>3||Math.abs(e.clientY-py)>3)moved=true;ry+=dx*0.006;rxr+=(e.clientY-py)*0.004;rxr=Math.max(-0.5,Math.min(0.5,rxr));px=e.clientX;py=e.clientY;}hover(e.clientX-r.left,e.clientY-r.top,r.width,r.height);});
  wrap.addEventListener('pointerleave',function(){if(sel<0)tip.style.opacity=0;});
  wrap.addEventListener('click',function(e){if(moved)return;var r=wrap.getBoundingClientRect();var i=pick(e.clientX-r.left,e.clientY-r.top,r.width,r.height);sel=(i===sel)?-1:i;applySel();if(sel>=0)showTip(sel,e.clientX-r.left,e.clientY-r.top,r.width,r.height);else tip.style.opacity=0;});
  function pick(mx,my,rw,rh){ndc.set(mx/rw*2-1,-(my/rh)*2+1);ray.setFromCamera(ndc,camera);var hit=ray.intersectObjects(pieGroup.children,false);if(!hit.length)return -1;for(var i=0;i<slices.length;i++)if(slices[i].mesh===hit[0].object)return i;return -1;}
  function showTip(i,mx,my,rw,rh){var s=slices[i];tip.innerHTML='<b>'+s.c.name+'</b><br>'+fmtM(s.c.v)+'<br>'+(s.frac*100).toFixed(1)+'% of media';tip.style.left=Math.min(mx+14,rw-165)+'px';tip.style.top=Math.max(my-10,6)+'px';tip.style.opacity=1;}
  function hover(mx,my,rw,rh){if(sel>=0)return;var i=pick(mx,my,rw,rh);if(i>=0)showTip(i,mx,my,rw,rh);else tip.style.opacity=0;}
  function loop(){if(!drag)ry+=vy;group.rotation.y+=(ry-group.rotation.y)*0.08;group.rotation.x+=(rxr-group.rotation.x)*0.08;renderer.render(scene,camera);if(!reduce)requestAnimationFrame(loop);}
  function resize(){W=wrap.clientWidth;H=wrap.clientHeight;if(W<2||H<2)return;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H,false);if(reduce)renderer.render(scene,camera);}
  addEventListener('resize',resize);if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  if(reduce)renderer.render(scene,camera);else loop();
})();

/* init */
renderChFilter();renderTable();
requestAnimationFrame(function(){requestAnimationFrame(function(){drawTrend();drawChmix();drawJuris();});});
setTimeout(function(){drawTrend();drawChmix();drawJuris();},400);
addEventListener('resize',function(){drawTrend();drawChmix();drawJuris();});
if('ResizeObserver' in window){new ResizeObserver(function(){drawTrend();}).observe(trend);new ResizeObserver(function(){drawChmix();}).observe(chmix);new ResizeObserver(function(){drawJuris();}).observe(juris);}

(function(){
  var canvas=document.getElementById('bg3d');
  if(!canvas||typeof THREE==='undefined') return;                  // graceful fallback → noise+grid stay
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W=window.innerWidth, H=window.innerHeight;
  var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(W,H,false);

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(60,W/H,1,3000);
  camera.position.z=640;

  // ---- generate nodes (data points) sized to fill the viewport ----
  var N = W<700 ? 70 : 150;
  var BX=1100, BY=760, BZ=640;                                     // generation box
  var pos=new Float32Array(N*3);
  var vel=[];
  for(var i=0;i<N;i++){
    pos[i*3]  =(Math.random()-0.5)*BX;
    pos[i*3+1]=(Math.random()-0.5)*BY;
    pos[i*3+2]=(Math.random()-0.5)*BZ;
    vel.push([(Math.random()-0.5)*0.22,(Math.random()-0.5)*0.22,(Math.random()-0.5)*0.22]);
  }

  var group=new THREE.Group();
  scene.add(group);

  // points (nodes)
  var pGeo=new THREE.BufferGeometry();
  pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  var points=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xB83A24,size:2.3,transparent:true,opacity:0.42,sizeAttenuation:true}));
  group.add(points);

  // connecting lines (rebuilt each frame for nearby nodes)
  var LINK=135, LINK2=LINK*LINK, MAXSEG=N*14;
  var linePos=new Float32Array(MAXSEG*2*3);
  var lGeo=new THREE.BufferGeometry();
  lGeo.setAttribute('position',new THREE.BufferAttribute(linePos,3));
  var lines=new THREE.LineSegments(lGeo,new THREE.LineBasicMaterial({color:0x7A2415,transparent:true,opacity:0.07}));
  group.add(lines);

  // ---- fluid morphing blob: an organic liquid shape behind the network ----
  var blobGroup=new THREE.Group(); blobGroup.position.z=-170; scene.add(blobGroup);
  var blobGeo=new THREE.IcosahedronGeometry(330,3);                // detail 3 → smooth enough for wireframe, light to morph
  var blobBase=blobGeo.attributes.position.array.slice(0);         // store rest positions
  // precompute per-vertex unit normal + radius ONCE (was recomputing a sqrt per vertex every frame)
  var vCount=blobBase.length/3;
  var blobN=new Float32Array(blobBase.length), blobLen=new Float32Array(vCount);
  for(var bi=0;bi<vCount;bi++){
    var o3=bi*3, bx0=blobBase[o3],by0=blobBase[o3+1],bz0=blobBase[o3+2];
    var l0=Math.sqrt(bx0*bx0+by0*by0+bz0*bz0)||1;
    blobLen[bi]=l0; blobN[o3]=bx0/l0; blobN[o3+1]=by0/l0; blobN[o3+2]=bz0/l0;
  }
  var blob=new THREE.Mesh(blobGeo,new THREE.MeshBasicMaterial({color:0x8A2418,wireframe:true,transparent:true,opacity:0.05}));
  blobGroup.add(blob);
  var tBlob=0;
  function morphBlob(t){                                           // displace each vertex along its (precomputed) normal by layered sine "noise"
    var arr=blobGeo.attributes.position.array;
    for(var i=0;i<vCount;i++){
      var o=i*3, nx=blobN[o],ny=blobN[o+1],nz=blobN[o+2];
      var n=Math.sin(nx*2.0+t)*Math.cos(ny*2.0+t*0.8)+Math.sin(nz*2.6+t*1.3);
      var d=blobLen[i] + n*30;                                     // amplitude of the fluid undulation
      arr[o]=nx*d; arr[o+1]=ny*d; arr[o+2]=nz*d;
    }
    blobGeo.attributes.position.needsUpdate=true;
  }

  // ---- per-section domain themes: the network recolours + changes energy as you scroll ----
  var THEMES={
    home:      {c:0xE8442B,l:0x9E2A18,spin:0.0012,shape:'cloud'},   // red    · free data-network
    projects:  {c:0xFF5A3C,l:0xB0301C,spin:0.0013,shape:'sphere'},  // red-orange · orbital case studies
    about:     {c:0xFF7A4D,l:0xC24A28,spin:0.0009,shape:'cloud'},   // warm orange · identity
    skills:    {c:0xFF9E5A,l:0xC26A28,spin:0.0017,shape:'grid'},    // amber-orange · BI lattice
    experience:{c:0xFF6F59,l:0xB0301C,spin:0.0010,shape:'helix'},   // coral · timeline
    research:  {c:0xFF9E5A,l:0xC26A28,spin:0.0011,shape:'sphere'},  // amber-orange · publications
    contact:   {c:0xFF5A3C,l:0x9E2A18,spin:0.0012,shape:'cloud'}    // red-orange · invite
  };

  // ---- domain shape generators: node target positions per motif ----
  function shapeTargets(type){
    if(type==='cloud') return null;
    var a=new Float32Array(N*3), i;
    if(type==='sphere'){                                  // FinTech / research — tight orbital
      var R=300;
      for(i=0;i<N;i++){
        var phi=Math.acos(1-2*(i+0.5)/N), th=Math.PI*(1+Math.sqrt(5))*i;
        a[i*3]=R*Math.sin(phi)*Math.cos(th);
        a[i*3+1]=R*Math.sin(phi)*Math.sin(th)*0.85;
        a[i*3+2]=R*Math.cos(phi);
      }
    } else if(type==='grid'){                             // BI — structured lattice
      var cols=Math.ceil(Math.sqrt(N)), gap=86;
      for(i=0;i<N;i++){
        a[i*3]=((i%cols)-cols/2)*gap;
        a[i*3+1]=(Math.floor(i/cols)-cols/2)*gap*0.72;
        a[i*3+2]=(((i*53)%3)-1)*70;
      }
    } else if(type==='helix'){                            // timeline — ascending strand
      for(i=0;i<N;i++){
        var t=i/N, ang=t*Math.PI*8, rad=170;
        a[i*3]=Math.cos(ang)*rad;
        a[i*3+1]=(t-0.5)*640;
        a[i*3+2]=Math.sin(ang)*rad;
      }
    }
    return a;
  }
  var SHAPES={cloud:null,sphere:shapeTargets('sphere'),grid:shapeTargets('grid'),helix:shapeTargets('helix')};
  var targetShape=null;
  var curC=new THREE.Color(0xE8442B), tgtC=new THREE.Color(0xE8442B);
  var curL=new THREE.Color(0x9E2A18), tgtL=new THREE.Color(0x9E2A18);
  var spin=0.0012, tgtSpin=0.0012;
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          var t=THEMES[e.target.id];
          if(t){ tgtC.setHex(t.c); tgtL.setHex(t.l); tgtSpin=t.spin; targetShape=SHAPES[t.shape]; }
        }
      });
    },{rootMargin:'-45% 0px -45% 0px'});   // active when a section crosses viewport centre
    document.querySelectorAll('section[id]').forEach(function(s){ so.observe(s); });
  }

  // mouse parallax + scroll parallax
  var tx=0,ty=0,sy=0;
  window.addEventListener('mousemove',function(e){
    tx=(e.clientX/window.innerWidth-0.5);
    ty=(e.clientY/window.innerHeight-0.5);
  });
  window.addEventListener('scroll',function(){ sy=window.scrollY; });

  function rebuildLines(){
    var seg=0,a=lGeo.attributes.position.array;
    for(var i=0;i<N;i++){
      var ix=pos[i*3],iy=pos[i*3+1],iz=pos[i*3+2];
      for(var j=i+1;j<N;j++){
        var dx=ix-pos[j*3],dy=iy-pos[j*3+1],dz=iz-pos[j*3+2];
        var d2=dx*dx+dy*dy+dz*dz;
        if(d2<LINK2 && seg<MAXSEG){
          var o=seg*6;
          a[o]=ix;a[o+1]=iy;a[o+2]=iz;
          a[o+3]=pos[j*3];a[o+4]=pos[j*3+1];a[o+5]=pos[j*3+2];
          seg++;
        }
      }
    }
    lGeo.setDrawRange(0,seg*2);
    lGeo.attributes.position.needsUpdate=true;
  }

  var breath=0;
  function drift(){
    if(targetShape){                                       // ease nodes toward the domain motif
      breath+=0.012;
      for(var i=0;i<N;i++){
        var bx=Math.sin(breath+i)*4, by=Math.cos(breath+i*1.3)*4;
        pos[i*3]   += (targetShape[i*3]  +bx - pos[i*3])   *0.03;
        pos[i*3+1] += (targetShape[i*3+1]+by - pos[i*3+1]) *0.03;
        pos[i*3+2] += (targetShape[i*3+2]    - pos[i*3+2]) *0.03;
      }
      pGeo.attributes.position.needsUpdate=true;
      return;
    }
    for(var i2=0;i2<N;i2++){                                // free drift (cloud sections)
      for(var k=0;k<3;k++){
        var idx=i2*3+k;
        pos[idx]+=vel[i2][k];
        var bound = k===0 ? BX*0.55 : (k===1 ? BY*0.55 : BZ*0.55);
        if(pos[idx]> bound || pos[idx]< -bound) vel[i2][k]*=-1;
      }
    }
    pGeo.attributes.position.needsUpdate=true;
  }

  function frame(){
    drift();
    rebuildLines();
    curC.lerp(tgtC,0.05); points.material.color.copy(curC);        // ease colour to section theme
    curL.lerp(tgtL,0.05); lines.material.color.copy(curL);
    spin += (tgtSpin-spin)*0.05; group.rotation.y += spin;         // ease spin to section energy
    tBlob+=0.006; morphBlob(tBlob);                                // fluid undulation
    blob.material.color.copy(curL);                                // blob shares the section colour
    blobGroup.rotation.y -= 0.0006; blobGroup.rotation.x += 0.0003;
    group.rotation.x += ((ty*0.30) - group.rotation.x)*0.04;       // ease toward mouse Y
    group.rotation.z = sy*0.00007;                                 // subtle turn as you scroll
    camera.position.x += (tx*70 - camera.position.x)*0.04;
    camera.position.y += (-ty*45 - camera.position.y)*0.04;
    camera.lookAt(scene.position);
    renderer.render(scene,camera);
    if(!reduce) requestAnimationFrame(frame);
  }

  function resize(){
    W=window.innerWidth;H=window.innerHeight;
    camera.aspect=W/H;camera.updateProjectionMatrix();
    renderer.setSize(W,H,false);
  }
  window.addEventListener('resize',resize);

  if(reduce){ rebuildLines(); morphBlob(0); renderer.render(scene,camera); }   // static frame, respects reduced-motion
  else frame();
})();

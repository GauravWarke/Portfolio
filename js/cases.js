(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,r){return (r||document).querySelector(s);};

  /* ---------- scroll progress ---------- */
  var sp=$('#scrollProgress');
  function onScroll(){var h=document.documentElement,max=h.scrollHeight-h.clientHeight;sp.style.width=(max>0?(h.scrollTop/max*100):0)+'%';}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();

  /* ---------- section numbering (systematised look) ---------- */
  document.querySelectorAll('.stag').forEach(function(el,i){
    if(el.querySelector('.stag-num'))return;
    var n=('0'+(i+1)).slice(-2);
    el.insertAdjacentHTML('afterbegin','<span class="stag-num">'+n+'</span>');
  });

  /* ---------- ⌘K hint in nav ---------- */
  var navUl=$('#nav .nav-links');
  if(navUl){var li=document.createElement('li');var b=document.createElement('button');b.className='cmdk-hint';b.type='button';b.innerHTML='<kbd>⌘</kbd>K';b.setAttribute('aria-label','Open command palette');b.addEventListener('click',openCmdk);li.appendChild(b);navUl.insertBefore(li,navUl.firstChild);}

  /* ---------- helpers ---------- */
  function scrollToSel(sel,label){var t=$(sel);if(t){t.scrollIntoView({behavior:reduce?'auto':'smooth'});}}
  function openUrl(u,nt){if(nt)window.open(u,'_blank','noopener');else location.href=u;}

  /* ---------- command palette ---------- */
  var ACTIONS=[
    {ico:'▲',l:'Go to Home',h:'home',run:function(){scrollToSel('#home');}},
    {ico:'▤',l:'Go to Projects',h:'projects',run:function(){scrollToSel('#projects');}},
    {ico:'✦',l:'Go to Skills',h:'skills',run:function(){scrollToSel('#skills');}},
    {ico:'◐',l:'Go to About',h:'about',run:function(){scrollToSel('#about');}},
    {ico:'✉',l:'Go to Contact',h:'contact',run:function(){scrollToSel('#contact');}},
    {ico:'⚡',l:'Open Business Churn dashboard',h:'dashboard',run:function(){openUrl('dashboards/churn.html',true);}},
    {ico:'⚡',l:'Open GST Reconciliation dashboard',h:'dashboard',run:function(){openUrl('dashboards/reconciliation.html',true);}},
    {ico:'⚡',l:'Open Retail Demand dashboard',h:'dashboard',run:function(){openUrl('dashboards/demand.html',true);}},
    {ico:'⚡',l:'Open Government Ad Spend dashboard',h:'dashboard',run:function(){openUrl('dashboards/market.html',true);}},
    {ico:'in',l:'Open LinkedIn',h:'link',run:function(){openUrl('https://www.linkedin.com/in/gaurav-warke-b5493b394',true);}},
    {ico:'gh',l:'Open GitHub',h:'link',run:function(){openUrl('https://github.com/GauravWarke',true);}},
    {ico:'✦',l:'Email / Hire Me',h:'contact',run:function(){openUrl('mailto:gauravwarke8@gmail.com');}}
  ];
  var modal=$('#cmdk'),input=$('#cmdkInput'),list=$('#cmdkList'),sel=0,shown=ACTIONS.slice();
  function renderList(){
    list.innerHTML=shown.map(function(a,i){return '<li class="cmdk-item'+(i===sel?' on':'')+'" role="option" data-i="'+i+'"><span class="ci-ico">'+a.ico+'</span><span class="ci-l">'+a.l+'</span><span class="ci-h">'+a.h+'</span></li>';}).join('')||'<li class="cmdk-item" style="cursor:default"><span class="ci-l" style="color:var(--t3,#5b6b82)">No matches</span></li>';
    list.querySelectorAll('.cmdk-item[data-i]').forEach(function(n){n.addEventListener('click',function(){run(+n.dataset.i);});n.addEventListener('mousemove',function(){sel=+n.dataset.i;paint();});});
  }
  function paint(){list.querySelectorAll('.cmdk-item[data-i]').forEach(function(n){n.classList.toggle('on',+n.dataset.i===sel);});}
  function filter(){var q=input.value.trim().toLowerCase();shown=q?ACTIONS.filter(function(a){return (a.l+' '+a.h).toLowerCase().indexOf(q)!==-1;}):ACTIONS.slice();sel=0;renderList();}
  function run(i){var a=shown[i];if(a){closeCmdk();a.run();}}
  function openCmdk(){modal.hidden=false;input.value='';shown=ACTIONS.slice();sel=0;renderList();setTimeout(function(){input.focus();},20);}
  function closeCmdk(){modal.hidden=true;}
  input.addEventListener('input',filter);
  modal.addEventListener('click',function(e){if(e.target.hasAttribute('data-close'))closeCmdk();});
  input.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,shown.length-1);paint();scrollSel();}
    else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0);paint();scrollSel();}
    else if(e.key==='Enter'){e.preventDefault();run(sel);}
    else if(e.key==='Escape'){closeCmdk();}
  });
  function scrollSel(){var el=list.querySelector('.cmdk-item.on');if(el)el.scrollIntoView({block:'nearest'});}
  addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();modal.hidden?openCmdk():closeCmdk();}
    else if(e.key==='Escape'&&!modal.hidden){closeCmdk();}
  });
  window.openCmdk=openCmdk;
})();

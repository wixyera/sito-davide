/* Presentation only: all account and data services remain in their original modules. */
(() => {
 const auth=document.getElementById('authOverlay');
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('motion-paused');
 const intro=document.createElement('dialog');intro.className='cinema-dialog';intro.setAttribute('aria-label','Benvenuto in DV SPACE');
 intro.innerHTML='<div class="cinema-top"><span>DV / SPACE</span><button class="cinema-close" autofocus>Salta intro ↗</button></div><div class="intro-stage"><div class="intro-orbit" aria-hidden="true"></div><div class="intro-kicker">IL TUO UNIVERSO PERSONALE</div><h1 class="intro-title">Il tuo mondo.<br><em>Fuori orbita.</em></h1><p class="intro-caption">Idee, momenti, possibilità. Tutto comincia qui.</p></div><div class="intro-bottom"><span>DAVIDE VILLANO / PERSONAL SPACE</span><span>UN NUOVO PUNTO DI PARTENZA</span></div><div class="intro-progress" aria-hidden="true"></div>';
 document.body.append(intro);
 let introTimer;function finishIntro(){clearTimeout(introTimer);if(intro.open)intro.close();try{sessionStorage.setItem('dv-director-intro','seen')}catch(_){} }
 intro.querySelector('button').onclick=finishIntro;intro.addEventListener('cancel',e=>{e.preventDefault();finishIntro()});
 let seen=false;try{seen=sessionStorage.getItem('dv-director-intro')==='seen'}catch(_){}
 // Email confirmation and recovery links must reach the original auth handler immediately.
 if(!seen&&!reduced()&&!location.hash&&!location.search){intro.showModal();introTimer=setTimeout(finishIntro,4000)}
 const menu=document.createElement('dialog');menu.className='cinema-dialog';menu.setAttribute('aria-labelledby','cinemaMenuTitle');
 menu.innerHTML='<div class="cinema-top"><span>DV / SPACE — ESPLORA</span><button class="cinema-close" autofocus>Chiudi ×</button></div><div class="menu-layout"><div class="menu-art"><span class="menu-chapter">COLLEZIONE PERSONALE / 06</span><h2 id="cinemaMenuTitle">Scegli la tua<br><em>prossima orbita.</em></h2><p id="cinemaPreview">Uno spazio per ogni parte di te. Scegli da dove ripartire.</p></div><nav class="cinema-links" aria-label="Esplora le sezioni"></nav></div>';
 document.body.append(menu);
 const descriptions={home:'Il tuo oggi, a colpo d’occhio.',calendario:'Fai spazio ai momenti che contano.',percorso:'Ogni passo racconta la tua storia.',contatti:'Le persone, sempre a portata di mano.',wishlist:'Dai un posto ai tuoi prossimi desideri.',spese:'Più chiarezza nelle scelte di ogni giorno.',esperimenti:'Segui la curiosità. Scopri qualcosa di nuovo.'};
 const toggle=document.getElementById('navToggle');toggle.setAttribute('aria-controls','cinemaMenu');menu.id='cinemaMenu';
 function closeMenu(){if(menu.open)menu.close();toggle.setAttribute('aria-expanded','false')}
 menu.querySelector('.cinema-close').onclick=closeMenu;menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu()});menu.addEventListener('close',()=>toggle.setAttribute('aria-expanded','false'));
 document.querySelectorAll('.tab-btn').forEach((tab,i)=>{const button=document.createElement('button');button.className='cinema-link';button.type='button';button.dataset.section=tab.dataset.module;button.style.setProperty('--i',i);const num=document.createElement('small');num.textContent=String(i).padStart(2,'0');const label=document.createElement('strong');label.textContent=tab.querySelector('span').textContent;const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');button.append(num,label,arrow);const preview=()=>{menu.querySelector('#cinemaPreview').textContent=descriptions[tab.dataset.module]};button.onpointerenter=preview;button.onfocus=preview;button.onclick=()=>{closeMenu();showModule(tab.dataset.module,{transition:true});setTimeout(()=>document.getElementById('mod-'+tab.dataset.module).focus({preventScroll:true}),750)};menu.querySelector('nav').append(button)});
 addEventListener('director:menu',()=>{if(!auth.classList.contains('hidden'))return;menu.querySelectorAll('[data-section]').forEach(b=>{if(document.getElementById('mod-'+b.dataset.section).classList.contains('active'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});menu.showModal();toggle.setAttribute('aria-expanded','true')});
 new MutationObserver(()=>{if(!auth.classList.contains('hidden'))closeMenu()}).observe(auth,{attributes:true,attributeFilter:['class']});
 const utility=document.createElement('div');utility.className='cinema-utilities';
 for(const [label,id] of [['Un momento di focus','sidebarFocus'],['Esci dall’account','logoutBtn']]){const b=document.createElement('button');b.className='cinema-close';b.type='button';b.textContent=label;b.onclick=()=>{closeMenu();document.getElementById(id).click()};utility.append(b)}
 const replayMenu=document.createElement('button');replayMenu.className='cinema-close';replayMenu.textContent='Rivedi intro';replayMenu.onclick=()=>{closeMenu();intro.showModal();introTimer=setTimeout(finishIntro,4000)};utility.append(replayMenu);menu.querySelector('nav').append(utility);
 const replay=document.createElement('button');replay.type='button';replay.className='sidebar-focus';replay.textContent='↻ Rivedi l’intro';replay.onclick=()=>{intro.showModal();introTimer=setTimeout(finishIntro,4000)};document.querySelector('.sidebar-bottom').prepend(replay);
 addEventListener('space:motion',()=>{if(reduced())finishIntro()});
})();

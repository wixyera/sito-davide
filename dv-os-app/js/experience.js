/* DV / SPACE — interface behavior. The existing services remain in their original modules. */
(() => {
  const $ = id => document.getElementById(id);
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  const auth = $('authOverlay');
  const shell = $('appShell');
  let motionPaused = motionQuery.matches;
  try { motionPaused = motionPaused || localStorage.getItem('dv-space-motion') === 'paused'; } catch (_) {}
  let galleryApi = null;
  function setMotion(paused) {
    motionPaused = paused || motionQuery.matches;
    body.classList.toggle('motion-paused', motionPaused);
    for (const id of ['welcomeMotion', 'motionToggle']) {
      const button = $(id);
      button.textContent = motionPaused ? '▷' : 'Ⅱ';
      button.setAttribute('aria-label', motionPaused ? 'Riprendi le animazioni' : 'Metti in pausa le animazioni');
      button.setAttribute('aria-pressed', String(motionPaused));
    }
    galleryApi?.setPaused(motionPaused);
    window.dispatchEvent(new CustomEvent('space:motion', {detail: {paused: motionPaused}}));
  }
  for (const id of ['welcomeMotion', 'motionToggle']) $(id).addEventListener('click', () => {
    if (motionQuery.matches) {
      toastInfo('Le animazioni sono ridotte secondo le impostazioni del tuo dispositivo.');
      return;
    }
    setMotion(!motionPaused);
    try { localStorage.setItem('dv-space-motion', motionPaused ? 'paused' : 'active'); } catch (_) {}
  });
  motionQuery.addEventListener('change', () => {
    let preference = false;
    try { preference = localStorage.getItem('dv-space-motion') === 'paused'; } catch (_) {}
    setMotion(preference);
  });
  setMotion(motionPaused);

  function syncAccess() {
    const signedIn = auth.classList.contains('hidden');
    shell.inert = !signedIn;
    $('musicWidget').inert = !signedIn;
    $('musicWidget').hidden = !signedIn;
    if (signedIn) {
      const user = currentUser;
      const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Il tuo account';
      $('sidebarName').textContent = name;
      $('profileInitials').textContent = name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
      window.refreshDashboard();
    }
  }
  new MutationObserver(syncAccess).observe(auth, { attributes: true, attributeFilter: ['class'] });
  auth.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || auth.classList.contains('hidden')) return;
    const visible = [...auth.querySelectorAll('a[href],input,button')].filter(el => !el.disabled && el.getClientRects().length);
    const first = visible[0], last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  });
  $('passwordToggle').addEventListener('click', () => {
    const input = $('authPassword');
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    $('passwordToggle').setAttribute('aria-label', visible ? 'Nascondi password' : 'Mostra password');
    $('passwordToggle').setAttribute('aria-pressed', String(visible));
  });
  $('authEmail').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); $('authPassword').focus(); }
  });

  function closeMenu() {
    body.classList.remove('menu-open');
    $('navToggle').setAttribute('aria-expanded', 'false');
  }
  $('sidebarScrim').addEventListener('click', closeMenu);
  $('sidebarScrim').inert = true;
  function syncMobileMenu() { $('sidebarScrim').inert = !body.classList.contains('menu-open'); }
  new MutationObserver(syncMobileMenu).observe(body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { closeMenu(); $('navToggle').focus(); }
  });
  window.addEventListener('workspace:module', e => {
    $('currentSection').textContent = MODULE_TITLES[e.detail] || 'Panoramica';
    if (e.detail === 'calendario' && !selectedDateKey) openToday();
    if (e.detail === 'home') window.refreshDashboard();
  });
  function openToday() {
    const now = new Date();
    viewYear = now.getFullYear(); viewMonth = now.getMonth();
    resetEventForm();
    selectDay(dateKey(viewYear, viewMonth, now.getDate()), now.getDate());
  }
  $('calToday').addEventListener('click', openToday);
  $('newEventQuick').addEventListener('click', () => {
    showModule('calendario'); openToday();
    $('evTitle').focus({ preventScroll: true });
    if (innerWidth < 1000) $('evForm').scrollIntoView({ behavior: motionPaused ? 'instant' : 'smooth', block: 'center' });
  });

  function upcomingEvents() {
    const now = new Date();
    const key = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
    const time = now.toTimeString().slice(0, 5);
    return Object.values(events).flat().filter(event => event.dateKey > key || (event.dateKey === key && (event.all_day || !event.time || event.endDateKey > key || (event.endTime || event.time) >= time))).sort((a,b) => a.dateKey.localeCompare(b.dateKey) || (a.time || '00:00').localeCompare(b.time || '00:00'));
  }
  window.refreshDashboard = () => {
    const now = new Date();
    $('homeDate').textContent = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    const prefix = dateKey(now.getFullYear(), now.getMonth(), 1).slice(0, 7);
    $('monthEventCount').textContent = Object.entries(events).reduce((n,[key,list]) => n + (key.startsWith(prefix) ? list.length : 0), 0);
    $('monthLabel').textContent = now.toLocaleDateString('it-IT', { month:'long' });
    $('statCareer').textContent = careerEntries.length;
    const upcoming = upcomingEvents();
    const next = upcoming[0];
    if (next) {
      const date = new Date(next.dateKey + 'T12:00:00');
      $('nextDayNumber').textContent = date.getDate();
      $('nextDayMonth').textContent = date.toLocaleDateString('it-IT', { month:'short' }).replace('.', '').toUpperCase();
      $('nextEventTitle').textContent = next.title;
      $('nextEventDate').textContent = date.toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long' }) + (next.all_day ? ' · Tutto il giorno' : next.time ? ' · ' + next.time : '');
    } else {
      $('nextDayNumber').textContent = '—';
      $('nextDayMonth').textContent = 'AGENDA';
      $('nextEventTitle').textContent = 'Nessun evento in programma';
      $('nextEventDate').textContent = 'Il prossimo impegno inizia da qui.';
    }
    const list = $('homeAgenda');
    list.replaceChildren();
    upcoming.slice(1,3).forEach(event => {
      const button = document.createElement('button'); button.type='button'; button.className='agenda-row';
      const when = document.createElement('span');
      when.textContent = new Date(event.dateKey+'T12:00:00').toLocaleDateString('it-IT',{ day:'numeric', month:'short' });
      const title = document.createElement('span'); title.textContent=event.title;
      button.append(when,title);
      button.addEventListener('click',()=>{
        showModule('calendario');
        const [y,m,d]=event.dateKey.split('-').map(Number); viewYear=y;viewMonth=m-1;
        selectDay(event.dateKey,d);
      });
      list.append(button);
    });
  };
  new MutationObserver(() => window.refreshDashboard()).observe($('careerMenu'), { childList:true, subtree:true });
  new MutationObserver(() => window.refreshDashboard()).observe($('calGrid'), { childList:true });
  syncAccess();
  window.refreshDashboard();

  // Every project link from the original collection is retained.
  const projectCategories = {
    'wiki-searcher':'tools','pass-generator':'tools','qr-generator':'tools','palette-generator':'tools','generatore-nomi':'tools','oracolo-ai':'tools',
    'meteo-radar':'explore','meraviglie-mondo':'explore','universo':'explore','cosmo-explorer':'explore','outer-banks':'explore','outer-banks-serie':'explore','serie-a':'explore',
    'flip-coin':'play','snake':'play','dado-fortunato':'play','sasso-carta-forbici':'play','quiz-lampo':'play','piano-virtuale':'play','sfera-magica':'play','fuochi-artificio':'play','surprise':'play','surprise2':'play','surprise3':'play','scroll-infinito':'play',
    'test-dna':'test','test-ritmo':'test','test-futuro':'test'
  };
  const cards = [...document.querySelectorAll('.project-grid > .quick-card')];
  const categoryNames = {tools:'Strumenti',play:'Play',explore:'Esplora',test:'Test'};
  cards.forEach((card,index)=> {
    const link=card.querySelector('a[href]');
    const slug=link.getAttribute('href').split('/').pop().replace('.html','');
    const category=projectCategories[slug] || 'play';
    card.dataset.category=category;
    card.style.setProperty('--stagger', `${Math.min(index%6,5)*.045}s`);
    card.querySelector('.qk').textContent=categoryNames[category]+' / '+String(index+1).padStart(2,'0');
    const cover=document.createElement('div');cover.className='project-cover';cover.setAttribute('aria-hidden','true');
    const icon = category==='tools'?'grid':category==='explore'?'cube':category==='test'?'focus':'spark';
    cover.innerHTML=`<svg class="icon" viewBox="0 0 24 24"><use href="#i-${icon}"/></svg><span>${String(index+1).padStart(2,'0')} / LAB</span>`;
    if (['universo','cosmo-explorer','outer-banks-serie'].includes(slug)) {
      const img=document.createElement('img');
      img.src=slug==='outer-banks-serie'?'assets/backgrounds/statue-cosmic.jpg':'assets/earth.jpg';
      img.alt='';img.loading='lazy';img.width=512;img.height=256;
      cover.prepend(img);cover.classList.add('with-image');
    }
    card.prepend(cover);
    link.textContent='Esplora progetto';
    link.setAttribute('aria-label', 'Apri '+card.querySelector('.qv').textContent+' in una nuova scheda');
  });
  $('projectCount').textContent=cards.length;
  $('statExperiments').textContent=cards.length;
  const filters=[...document.querySelectorAll('[data-project-filter]')];
  filters.forEach(button=>button.addEventListener('click',()=> {
    const filter=button.dataset.projectFilter;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    cards.forEach(card=>card.hidden=filter!=='all' && card.dataset.category!==filter);
    $('projectEmpty').hidden=cards.some(card=>!card.hidden);
  }));

  // Gentle pointer depth; the native cursor remains visible.
  const tilt=document.querySelector('[data-tilt]');
  if(matchMedia('(hover: hover) and (pointer: fine)').matches){
    addEventListener('pointermove',e=>{
      body.style.setProperty('--pointer-x',`${e.clientX}px`);
      body.style.setProperty('--pointer-y',`${e.clientY}px`);
    },{passive:true});
    addEventListener('pointerleave',()=>{
      body.style.setProperty('--pointer-x','50vw');
      body.style.setProperty('--pointer-y','25vh');
    },{passive:true});
    tilt.addEventListener('pointermove',e=>{
      if(motionPaused)return;
      const rect=tilt.getBoundingClientRect();
      tilt.style.setProperty('--tilt-x',`${(e.clientX-rect.left-rect.width/2)/rect.width*3}deg`);
      tilt.style.setProperty('--tilt-y',`${-(e.clientY-rect.top-rect.height/2)/rect.height*3}deg`);
    },{passive:true});
    tilt.addEventListener('pointerleave',()=>{tilt.style.setProperty('--tilt-x','0deg');tilt.style.setProperty('--tilt-y','0deg')});
    cards.forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const rect=card.getBoundingClientRect();
        card.style.setProperty('--spot-x',`${e.clientX-rect.left}px`);
        card.style.setProperty('--spot-y',`${e.clientY-rect.top}px`);
      },{passive:true});
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--spot-x','50%');card.style.setProperty('--spot-y','20%')});
    });
  }
  function scrollProgress(){
    const range=document.documentElement.scrollHeight-innerHeight;
    $('scrollProgress').style.transform=`scaleX(${range>0?Math.min(1,scrollY/range):0})`;
  }
  addEventListener('scroll',scrollProgress,{passive:true});
  window.addEventListener('workspace:module',scrollProgress);

  // Focus sessions never write to the account's personal data.
  import('./js/focus-timer.js').then(({FocusTimer})=>{
    const timer=new FocusTimer(25);
    let notified=false;
    function paint(){
      const state=timer.snapshot();
      $('focusTime').textContent=`${String(Math.floor(state.seconds/60)).padStart(2,'0')}:${String(state.seconds%60).padStart(2,'0')}`;
      $('focusTime').setAttribute('aria-label',`${Math.floor(state.seconds/60)} minuti e ${state.seconds%60} secondi rimanenti`);
      $('focusProgress').style.strokeDashoffset=String(state.progress*565.487);
      $('focusStart').textContent=state.running?'Metti in pausa':state.finished?'Un’altra sessione':state.progress>0?'Riprendi la sessione':'Inizia la sessione';
      $('focusState').textContent=state.finished?'Ben fatto. Respira.':state.running?'Una cosa alla volta.':state.progress>0?'Prenditi un momento.':'Trova il tuo ritmo.';
      $('focusCard').classList.toggle('running',state.running);
      if(state.finished&&!notified){
        notified=true;
        $('focusAnnouncement').textContent='Sessione completata. Prenditi un momento di pausa.';
        toastSuccess('Sessione completata. È il momento di una pausa.');
      }
    }
    $('focusStart').addEventListener('click',()=>{
      if(timer.snapshot().running)timer.pause();else timer.start();
      notified=false;paint();
      $('focusAnnouncement').textContent=timer.snapshot().running?'Sessione iniziata.':'Sessione in pausa.';
    });
    $('focusReset').addEventListener('click',()=>{timer.reset();notified=false;paint();$('focusAnnouncement').textContent='Timer reimpostato.'});
    document.querySelectorAll('[data-focus-minutes]').forEach(button=>button.addEventListener('click',()=>{
      timer.setDuration(Number(button.dataset.focusMinutes));notified=false;
      document.querySelectorAll('[data-focus-minutes]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      paint();$('focusAnnouncement').textContent='Durata impostata a '+button.dataset.focusMinutes+' minuti.';
    }));
    setInterval(paint,1000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint()});
    paint();
  }).catch(()=>{
    $('focusStart').disabled=true;$('focusState').textContent='Ricarica per attivare Focus.';
  });
  $('sidebarFocus').addEventListener('click',()=>{
    showModule('home');
    $('focusCard').scrollIntoView({behavior:motionPaused?'instant':'smooth',block:'center'});
    $('focusStart').focus({preventScroll:true});
    $('focusCard').classList.remove('focus-highlight');void $('focusCard').offsetWidth;
    $('focusCard').classList.add('focus-highlight');
  });

  const dialog=$('galleryDialog');
  let galleryLoading=false;
  const openGalleryDialog = () => {
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    body.classList.add('gallery-open');
  };
  const closeGalleryDialog = () => {
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else {
      dialog.removeAttribute('open');
      galleryApi?.stop();
      body.classList.remove('gallery-open');
    }
  };
  $('openGallery').addEventListener('click',async()=>{
    openGalleryDialog();
    if(galleryApi){galleryApi.start();return;}
    if(galleryLoading)return;
    galleryLoading=true;
    try{
      const {mountGallery}=await import('./js/gallery.js');
      galleryApi=mountGallery({stage:$('galleryStage'),host:$('galleryArt'),dialog,paused:motionPaused});
      $('galleryLoading').hidden=true;
      if(dialog.open || dialog.hasAttribute('open'))galleryApi.start();
    }catch(error){
      $('galleryLoading').textContent='La galleria 3D non è disponibile in questo browser. Tutti gli strumenti del tuo spazio restano accessibili.';
      console.warn('Galleria 3D non disponibile:',error);
    }finally{galleryLoading=false;}
  });
  $('closeGallery').addEventListener('click',closeGalleryDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeGalleryDialog();}});
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeGalleryDialog()});
  dialog.addEventListener('close',()=>{galleryApi?.stop();body.classList.remove('gallery-open')});
})();

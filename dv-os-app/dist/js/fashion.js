/* Progressive editorial motion. Never captures wheel or touch scrolling. */
(()=>{
 const home=document.getElementById('mod-home');
 const ticker=document.createElement('div');ticker.className='editorial-ticker';ticker.setAttribute('aria-hidden','true');
 const line='Personal style <i>✦</i> New perspectives <i>✦</i> Everyday culture <i>✦</i> ';
 ticker.innerHTML='<span>'+line.repeat(4)+'</span>';home.append(ticker);
 const story=document.createElement('section');story.className='editorial-story';story.setAttribute('aria-label','La tua collezione personale');
 story.innerHTML='<figure><video class="editorial-art-film" controls playsinline preload="none" poster="assets/editorial/black-gold-poster.jpg" src="assets/editorial/black-gold.mp4" aria-label="Film astratto nero e oro"></video><figcaption>THE EDITORIAL / 01</figcaption></figure><div><span class="eyebrow">A COLLECTION OF YOU</span><h2>Il dettaglio<br>fa la <em>differenza.</em></h2><p>Ciò che ti ispira. Quello che desideri. Le idee da non lasciare a domani. Una collezione che parla di te.</p><button type="button" class="primary-button">Sfoglia la wishlist ↗</button></div>';
 story.querySelector('button').onclick=()=>showModule('wishlist',{transition:true});home.append(story);
 const auth=document.getElementById('authOverlay');const form=document.querySelector('.auth-form-side');
 document.getElementById('coverLogin').onclick=()=>form.scrollIntoView({behavior:paused()?'instant':'smooth',block:'start'});
 let wasHidden=auth.classList.contains('hidden'), previousView=auth.dataset.view;
 const accessObserver=new MutationObserver(()=>{const hidden=auth.classList.contains('hidden');if(hidden!==wasHidden){window.scrollTo({top:0,behavior:'instant'});wasHidden=hidden;}if(!hidden&&previousView!==auth.dataset.view){previousView=auth.dataset.view;if(innerWidth<=820)form.scrollIntoView({behavior:'instant',block:'start'});}});
 accessObserver.observe(auth,{attributes:true,attributeFilter:['class','data-view']});
 if(innerWidth<=820&&auth.dataset.view&&auth.dataset.view!=='authViewLogin')requestAnimationFrame(()=>form.scrollIntoView({behavior:'instant',block:'start'}));
 const query=matchMedia('(prefers-reduced-motion:reduce)');const paused=()=>query.matches||document.body.classList.contains('motion-paused');const running=new Set();
 const targets=document.querySelectorAll('.shortcut-card,.home-bottom-grid>*,.project-grid>.quick-card,.editorial-story,.module-heading');
 let observer;if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;observer.unobserve(target);if(paused()||!target.animate)return;const a=target.animate([{opacity:.3,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});running.add(a);a.finished.catch(()=>{}).finally(()=>running.delete(a))}),{threshold:.06});targets.forEach(el=>observer.observe(el))}
 function sync(){const artVideo=story.querySelector('video');if(artVideo&&(paused()||document.hidden||!home.classList.contains('active')))artVideo.pause();if(paused())running.forEach(a=>a.cancel());document.querySelectorAll('.runway-video').forEach(v=>{if(paused()||document.hidden||!v.closest('dialog').open)v.pause()})}
 addEventListener('workspace:module',sync);query.addEventListener('change',sync);addEventListener('space:motion',sync);document.addEventListener('visibilitychange',sync);addEventListener('pagehide',()=>{observer?.disconnect();accessObserver.disconnect();running.forEach(a=>a.cancel())});
})();

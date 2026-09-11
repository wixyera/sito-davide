/* Progressive enhancement: the complete UI remains available without animation. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  const paused=()=>motion.matches||document.body.classList.contains('motion-paused');
  const host=document.getElementById('entranceScene');
  if(host) import('./entrance-scene.js').then(({mountEntranceScene})=>{
    try {mountEntranceScene(host);} catch(error){host.classList.remove('ready');host.closest('.auth-welcome')?.classList.remove('has-live-art');console.info('Scultura: immagine alternativa attiva.');}
  }).catch(()=>{});

  // A brief light sweep is coupled to navigation, never to a waiting screen.
  const sweep=document.createElement('div');sweep.className='navigation-sweep';sweep.setAttribute('aria-hidden','true');document.body.append(sweep);
  let sweepAnimation;
  addEventListener('workspace:module',()=>{
    sweepAnimation?.cancel();if(paused()||!sweep.animate)return;
    sweepAnimation=sweep.animate([{transform:'scaleX(0)',opacity:1},{transform:'scaleX(.75)',opacity:1,offset:.65},{transform:'scaleX(1)',opacity:0}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
    revealVisibleCards();
  });
  // Reveal below-the-fold content once. No permanently hidden text if JS fails.
  const revealed=new WeakSet();let observer;
  const targets=[...document.querySelectorAll('.home-shortcuts>.shortcut-card,.home-bottom-grid>*,.project-grid>.quick-card,.lab-test-card')];
  function reveal(element,index=0){
    if(revealed.has(element)||element.hidden||!element.getClientRects().length)return;
    revealed.add(element);if(paused()||!element.animate)return;
    element.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,delay:(index%4)*55,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  function revealVisibleCards(){targets.forEach((element,index)=>{const rect=element.getBoundingClientRect();if(rect.top<innerHeight&&rect.bottom>0)reveal(element,index);});}
  if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>entries.forEach((entry,index)=>{if(entry.isIntersecting)reveal(entry.target,index);}),{threshold:.08});targets.forEach(element=>observer.observe(element));}

  // Magnetic movement is small, pointer-only and does not shift the hit target.
  const magnets=[...document.querySelectorAll('.auth-actions>button,.light-button,.gallery-link')];
  if(matchMedia('(hover:hover) and (pointer:fine)').matches) magnets.forEach(button=>{
    button.addEventListener('pointermove',event=>{
      if(paused()||button.disabled)return;
      const rect=button.getBoundingClientRect();
      button.style.translate=`${(event.clientX-rect.left-rect.width/2)*.045}px ${(event.clientY-rect.top-rect.height/2)*.08}px`;
      button.style.setProperty('--shine-x',`${(event.clientX-rect.left)/rect.width*100}%`);
    },{passive:true});
    button.addEventListener('pointerleave',()=>{button.style.translate='0px 0px';});
  });
  function stopMotion(){
    if(!paused())return;sweepAnimation?.cancel();
    magnets.forEach(button=>{button.style.translate='0px 0px';});
    targets.forEach(element=>element.getAnimations?.().forEach(animation=>animation.finish()));
  }
  addEventListener('space:motion',stopMotion);
  motion.addEventListener('change',stopMotion);

  // Scroll-driven scene depth uses native scrolling, including touch and keyboard.
  const feature=document.querySelector('.inspiration-card');let scrollFrame=0;
  function paintScroll(){scrollFrame=0;if(!feature||paused())return;const rect=feature.getBoundingClientRect();feature.style.setProperty('--scene-shift',`${Math.max(-25,Math.min(25,-rect.top*.045))}px`);}
  addEventListener('scroll',()=>{if(!scrollFrame&&!paused())scrollFrame=requestAnimationFrame(paintScroll);},{passive:true});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(scrollFrame);observer?.disconnect();});
})();

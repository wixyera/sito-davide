(() => {
  const CONFIGS = {
    dna: {
      number: '01', kicker: 'TEST 01 / SPACE DNA', title: 'Che cosa sta orbitando dentro di te?', intro: 'Cinque scelte rapide per capire quale energia porti nel tuo spazio.',
      questions: [
        {text:'Quando ti arriva un’idea nuova, cosa fai per prima cosa?',note:'Non pensarci troppo: scegli l’istinto.',answers:[['La trasformo subito in qualcosa da provare.','creator'],['La scompongo e cerco il modo migliore per costruirla.','architect'],['La racconto a qualcuno e la faccio crescere insieme.','connector'],['La lascio sedimentare finché non vedo la direzione.','navigator']]},
        {text:'Quale scena ti fa sentire immediatamente nel posto giusto?',note:'Immagina di entrare in una stanza nuova.',answers:[['Un tavolo pieno di prototipi e materiali.','creator'],['Una parete di mappe, schemi e possibilità.','architect'],['Una stanza viva, piena di persone e conversazioni.','connector'],['Una finestra enorme, con una strada ancora da scegliere.','navigator']]},
        {text:'Quando un piano cambia all’ultimo momento…',note:'La prima reazione dice già molto.',answers:[['Improvviso: magari viene fuori qualcosa di migliore.','creator'],['Ricalcolo tutto e rimetto ordine.','architect'],['Sento chi c’è con me e decido insieme.','connector'],['Faccio un passo indietro per capire dove porta.','navigator']]},
        {text:'Che cosa ti dà più soddisfazione?',note:'Scegli il tipo di traccia che ti piace lasciare.',answers:[['Vedere qualcosa che prima non esisteva.','creator'],['Far funzionare perfettamente un sistema.','architect'],['Far sentire qualcuno visto e capito.','connector'],['Scoprire una strada che nessuno aveva considerato.','navigator']]},
        {text:'Se il tuo spazio avesse una modalità segreta, sarebbe…',note:'Ultimo impulso. Qui non esistono risposte sbagliate.',answers:[['RENDER — porta l’idea nel mondo.','creator'],['BUILD — dai struttura al caos.','architect'],['LINK — accendi le connessioni.','connector'],['ORBIT — guarda tutto da un’altra prospettiva.','navigator']]}
      ],
      results:{creator:['Il Creatore','Non aspetti che la scintilla diventi perfetta: la accendi. Hai un’energia concreta, curiosa e capace di trasformare un’intuizione in qualcosa che si può toccare.','curiosità','iniziativa','immaginazione'],architect:['L’Architetto','Vedi strutture dove gli altri vedono solo pezzi. Il tuo superpotere è dare forma, ordine e direzione alle idee senza spegnerne la parte più interessante.','visione','precisione','strategia'],connector:['Il Connettore','Le cose prendono senso quando circolano. Sai unire persone, idee e occasioni con una naturalezza rara: il tuo spazio è una costellazione, non una stanza chiusa.','empatia','energia','comunità'],navigator:['Il Navigatore','Non ti serve avere subito tutte le risposte. Ti basta una direzione abbastanza buona per iniziare a muoverti e scoprire un panorama nuovo lungo il percorso.','intuizione','coraggio','prospettiva']}
    },
    ritmo: {
      number:'02', kicker:'TEST 02 / RHYTHM SCAN', title:'Qual è il tuo ritmo naturale?', intro:'Un piccolo scan del modo in cui alterni accelerazione, pausa e concentrazione.',
      questions:[
        {text:'Hai un pomeriggio libero. Dove finisce la tua energia?',note:'Immagina il tuo sabato ideale.',answers:[['Inizio mille cose e seguo quella che mi prende.','spark'],['Scelgo una cosa e la porto più lontano possibile.','deep'],['Mi muovo, vedo persone, lascio che succedano cose.','flow'],['Sistemo quello che ho intorno e mi ricarico.','balance']]},
        {text:'Quando lavori meglio?',note:'Pensa al momento in cui ti senti più lucido.',answers:[['Quando arriva l’onda giusta, senza preavviso.','spark'],['Quando posso isolarmi e non interrompermi.','deep'],['Quando c’è movimento e posso reagire al momento.','flow'],['Quando ho un piano chiaro e spazio tra le cose.','balance']]},
        {text:'Il tuo rapporto con le pause è…',note:'Scegli quella che ti somiglia di più.',answers:[['Una scintilla per ripartire con un’idea diversa.','spark'],['Un confine: quando mi fermo, mi fermo davvero.','deep'],['Un cambio di scena, anche breve.','flow'],['Una parte del piano, non un premio finale.','balance']]},
        {text:'Se il tuo ritmo fosse una traccia sonora?',note:'Ascolta la sensazione, non la logica.',answers:[['Un beat che cambia spesso.','spark'],['Un basso profondo e regolare.','deep'],['Una playlist che non sta mai ferma.','flow'],['Un loop pulito con il momento giusto per respirare.','balance']]}
      ],
      results:{spark:['Modalità Scintilla','Funzioni per accensioni: quando qualcosa ti prende, la tua energia diventa contagiosa. Lascia spazio all’imprevisto, ma raccogli le idee prima che volino via.','impatto','curiosità','slancio'],deep:['Modalità Deep Focus','Il tuo ritmo ama la profondità. Una cosa alla volta, meno rumore, più presenza: quando entri nel flusso puoi costruire molto più di quanto sembri.','concentrazione','qualità','presenza'],flow:['Modalità Flow','Ti nutri di movimento. Il tuo talento è leggere il momento, cambiare passo e trovare opportunità proprio mentre tutto si sposta.','adattabilità','energia','istinto'],balance:['Modalità Equilibrio','Sai che la continuità vale più della corsa. Il tuo ritmo migliore alterna ambizione e recupero, così ogni giornata resta sostenibile.','costanza','chiarezza','respiro']}
    },
    futuro: {
      number:'03', kicker:'TEST 03 / NEXT HORIZON', title:'Che cosa stai davvero costruendo?', intro:'Non predice il futuro: legge il prossimo movimento che vuoi fare.',
      questions:[
        {text:'Quale messaggio vorresti leggere tra sei mesi?',note:'Scegli quello che ti farebbe sorridere davvero.',answers:[['Ho iniziato qualcosa di mio.','launch'],['Finalmente so dove sto andando.','direction'],['Ho trovato le persone giuste.','people'],['Mi sono preso lo spazio che meritavo.','space']]},
        {text:'Quale ostacolo vuoi lasciare indietro?',note:'Il futuro spesso comincia da una cosa che smetti di rimandare.',answers:[['Aspettare il momento perfetto.','launch'],['Cambiare idea ogni volta che qualcosa è difficile.','direction'],['Fare tutto da solo.','people'],['Riempire ogni spazio senza respirare.','space']]},
        {text:'Quale porta apriresti senza sapere cosa c’è dietro?',note:'La curiosità è già una direzione.',answers:[['Un laboratorio con tutto ancora da inventare.','launch'],['Una mappa con un percorso evidenziato.','direction'],['Una tavola apparecchiata con posti per nuovi incontri.','people'],['Una stanza vuota, luminosa e solo tua.','space']]},
        {text:'La tua prossima versione dovrebbe avere più…',note:'Ultima scelta: scegli una parola che vuoi sentire vicina.',answers:[['Coraggio di pubblicare e provare.','launch'],['Chiarezza per scegliere e restare.','direction'],['Connessioni che fanno bene.','people'],['Tempo che non devi giustificare.','space']]}
      ],
      results:{launch:['Protocollo Lancio','Il tuo prossimo capitolo chiede un primo gesto visibile. Non serve avere tutto pronto: serve mettere in orbita una versione vera e lasciarla imparare.','azione','coraggio','inizio'],direction:['Protocollo Direzione','Stai cercando meno rumore e una rotta più nitida. Il prossimo passo non è fare di più: è scegliere cosa merita davvero la tua energia.','scelta','chiarezza','rotta'],people:['Protocollo Connessioni','Il futuro che vuoi non è una missione solitaria. Le persone giuste non sono una distrazione: sono il sistema che rende possibile il prossimo salto.','fiducia','relazioni','slancio'],space:['Protocollo Spazio','Hai bisogno di margine per sentirti di nuovo te stesso. Proteggere tempo, attenzione e desideri non è fermarsi: è preparare un decollo più grande.','respiro','confini','possibilità']}
    }
  };

  const mode = document.body.dataset.test || 'dna';
  const config = CONFIGS[mode] || CONFIGS.dna;
  const $ = id => document.getElementById(id);
  const state = {index:0,answers:[]};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.title = `${config.kicker} — DV / SPACE`;
  $('testKicker').textContent = config.kicker;
  $('testTitle').innerHTML = config.title.replace(/(energia|ritmo|costruendo\?)/i, '<em>$1</em>');
  $('testIntro').textContent = config.intro;
  $('testNumber').innerHTML = `<b>${config.number}</b><span>/ 03</span>`;
  $('testTotal').textContent = String(config.questions.length).padStart(2,'0');

  function updateProgress() {
    const current = state.index + 1;
    $('testCurrent').textContent = String(current).padStart(2,'0');
    $('testProgressBar').style.width = `${current / config.questions.length * 100}%`;
  }
  function focusFirst() { $('answers').querySelector('button')?.focus({preventScroll:true}); }
  function renderQuestion() {
    const question = config.questions[state.index];
    $('questionText').textContent = question.text;
    $('questionNote').textContent = question.note;
    const answers = $('answers');
    answers.replaceChildren();
    question.answers.forEach(([text], index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'answer';
      button.setAttribute('aria-pressed', String(state.answers[state.index] === index));
      button.innerHTML = `<span class="answer-mark">${String.fromCharCode(65 + index)}</span><span>${text}</span>`;
      if (state.answers[state.index] === index) button.classList.add('selected');
      button.addEventListener('click', () => {
        state.answers[state.index] = index;
        answers.querySelectorAll('.answer').forEach((item, i) => { item.classList.toggle('selected', i === index); item.setAttribute('aria-pressed', String(i === index)); });
        $('nextQuestion').disabled = false;
      });
      answers.append(button);
    });
    $('nextQuestion').disabled = state.answers[state.index] === undefined;
    $('nextQuestion').textContent = state.index === config.questions.length - 1 ? 'Rivela il risultato ↗' : 'Prossima domanda ↗';
    $('backQuestion').hidden = state.index === 0;
    updateProgress();
    if (!reduced) { $('questionCard').classList.remove('question-card'); void $('questionCard').offsetWidth; $('questionCard').classList.add('question-card'); }
    setTimeout(focusFirst, reduced ? 0 : 120);
  }
  function tally() {
    const counts = {};
    config.questions.forEach((question, index) => {
      const answer = question.answers[state.answers[index]];
      if (answer) counts[answer[1]] = (counts[answer[1]] || 0) + 1;
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0] || Object.keys(config.results)[0];
  }
  function reveal() {
    const key = tally();
    const [title, copy, ...tags] = config.results[key];
    $('resultTitle').textContent = title;
    $('resultCopy').textContent = copy;
    $('resultTags').replaceChildren(...tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
    $('testCard').classList.add('result-mode');
    $('questionCard').hidden = true;
    $('result').classList.add('visible');
    $('result').dataset.result = title;
    $('resultShare').dataset.share = `${title} — ${copy}`;
    try { localStorage.setItem(`dv-space-test-${mode}`, JSON.stringify({title,at:new Date().toISOString()})); } catch (_) {}
    $('resultTitle').focus({preventScroll:true});
  }
  $('nextQuestion').addEventListener('click', () => {
    if (state.answers[state.index] === undefined) return;
    if (state.index === config.questions.length - 1) reveal();
    else { state.index += 1; renderQuestion(); }
  });
  $('backQuestion').addEventListener('click', () => { if (state.index > 0) { state.index -= 1; renderQuestion(); } });
  $('restartTest').addEventListener('click', () => { state.index = 0; state.answers = []; $('result').classList.remove('visible'); $('questionCard').hidden = false; $('testCard').classList.remove('result-mode'); renderQuestion(); });
  $('resultShare').addEventListener('click', async () => {
    const text = `Il mio risultato su DV / SPACE: ${$('resultShare').dataset.share}`;
    try { await navigator.clipboard.writeText(text); $('resultShare').textContent = 'Copiato ✓'; }
    catch (_) { $('resultShare').textContent = 'Risultato pronto da condividere'; }
    setTimeout(() => { $('resultShare').textContent = 'Copia il risultato'; }, 2200);
  });
  $('answers').addEventListener('keydown', event => {
    const buttons = [...$('answers').querySelectorAll('.answer')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0 || !['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1;
    buttons[(current + direction + buttons.length) % buttons.length].focus();
  });
  renderQuestion();

  const canvas = $('testCanvas');
  const ctx = canvas?.getContext('2d', {alpha:true});
  if (ctx) {
    let width=0,height=0,dpr=1,frame=0,time=0;
    const particles = Array.from({length:32},(_,i)=>({x:Math.random(),y:Math.random(),r:1+Math.random()*2,v:.008+Math.random()*.018,p:i*.8}));
    function resize(){dpr=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
    function loop(){ctx.clearRect(0,0,width,height);if(!reduced&&!document.hidden){time+=.01;particles.forEach(p=>{p.y-=p.v;if(p.y<-.04)p.y=1.04;const x=p.x*width+Math.sin(time+p.p)*14,y=p.y*height;ctx.fillStyle='rgba(214,252,82,.24)';ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill()})}frame=requestAnimationFrame(loop)}
    resize();addEventListener('resize',resize,{passive:true});loop();addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
  }
})();

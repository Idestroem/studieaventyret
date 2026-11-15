
let matchRound=[],matchOrder=[],matchLeft=null,matchRight=null,matchDone=new Set();

// Glittereffekter är dekorativa, och kan stängas av eller minskas via systeminställning.
let glitterTimers=[];
function saveGlitterSetting(){try{localStorage.setItem('vasaGlitter',document.getElementById('glitterEnabled').checked?'1':'0')}catch(e){}if(!document.getElementById('glitterEnabled').checked)clearGlitter()}
function clearGlitter(){glitterTimers.forEach(clearTimeout);glitterTimers=[];document.getElementById('glitterLayer').replaceChildren();document.querySelectorAll('.glitter-toast').forEach(e=>e.remove())}
function celebrateGlitter(level){
 if(!document.getElementById('glitterEnabled').checked||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 clearGlitter();
 const layer=document.getElementById('glitterLayer');
 const counts={small:16,streak:85,match:140,perfect:220};
 const palette=['#ff56a8','#e91e87','#ffd166','#ffb6dc','#b65bff','#ffffff','#ff8dca'];
 for(let i=0;i<(counts[level]||16);i++){
  const piece=document.createElement('span');piece.className='glitter-piece';
  const r=Math.random,star=r()>.7;
  piece.style.setProperty('--x',`${r()*100}%`);
  piece.style.setProperty('--w',`${star?6:5+r()*8}px`);
  piece.style.setProperty('--h',`${star?6:8+r()*12}px`);
  piece.style.setProperty('--radius',star?'50%':'2px');
  piece.style.setProperty('--color',palette[Math.floor(r()*palette.length)]);
  piece.style.setProperty('--duration',`${1.8+r()*2.1}s`);
  piece.style.setProperty('--delay',`${r()*(level==='small'?.15:1)}s`);
  piece.style.setProperty('--drift',`${(r()-.5)*260}px`);
  piece.style.setProperty('--rotation',`${r()*360}deg`);
  piece.style.setProperty('--spin',`${(r()-.5)*1300}deg`);
  layer.appendChild(piece);
 }
 const labels={streak:'🌟 Fem rätt i rad! 🌟',match:'🎉 Alla par hittade! 🎉',perfect:'🏆 ALLA RÄTT! 💖✨'};
 if(labels[level]){const toast=document.createElement('div');toast.className='glitter-toast';toast.textContent=labels[level];document.body.appendChild(toast)}
 glitterTimers.push(setTimeout(clearGlitter,5100));
}

function shuffle(a){const copy=[...a];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
const QUESTION_LIMIT=12;
let quizQuestions=[];
let lastQuestionIds=[];
function buildQuizSession(pool=questions){
 const indexed=pool.map(q=>({q,id:questions.indexOf(q)}));
 const unseen=indexed.filter(x=>!lastQuestionIds.includes(x.id));
 const used=indexed.filter(x=>lastQuestionIds.includes(x.id));
 const picked=shuffle(unseen).concat(shuffle(used)).slice(0,Math.min(QUESTION_LIMIT,indexed.length));
 lastQuestionIds=picked.map(x=>x.id);
 quizQuestions=picked.map(({q})=>{
   const options=shuffle(q.a.map((text,i)=>({text,correct:i===q.c})));
   return {...q,a:options.map(x=>x.text),c:options.findIndex(x=>x.correct)};
 });
}

function newMatchRound(){stopReading();matchRound=shuffle(matchPairs).slice(0,5);matchOrder=shuffle([0,1,2,3,4]);matchDone=new Set();matchLeft=null;matchRight=null;renderMatch();if(document.getElementById('autoRead').checked&&!document.getElementById('match').classList.contains('hidden'))readMatchRound()}
function pickMatch(side,i){stopReading();if(matchDone.has(i))return;if(side==='left')matchLeft=i;else matchRight=i;const note=document.getElementById('matchNote');note.className='match-note';note.textContent='';if(matchLeft!==null&&matchRight!==null){if(matchLeft===matchRight){matchDone.add(matchLeft);note.textContent=matchDone.size===5?'🎉✨ Alla rätt! Fantastiskt! ✨🎉':'💖 Snyggt parat!';if(matchDone.size===5)celebrateGlitter('match');else celebrateGlitter('small');note.classList.add('success');matchLeft=null;matchRight=null}else{note.textContent='💡 Inte riktigt – välj ett annat kort!';note.classList.add('error');if(side==='left')matchRight=null;else matchLeft=null}}renderMatchCards()}
function renderMatch(){if(!matchRound.length)newMatchRound();else renderMatchCards()}
function renderMatchCards(){document.getElementById('matchScore').textContent=matchDone.size+' av 5 par';document.getElementById('matchBar').style.width=(matchDone.size*20)+'%';document.getElementById('matchLeft').innerHTML=matchRound.map((p,i)=>`<button class="match-card ${matchDone.has(i)?'matched':matchLeft===i?'selected':''}" ${matchDone.has(i)?'disabled':''} onclick="pickMatch('left',${i})">${matchDone.has(i)?'✓ ':''}${p[0]}</button>`).join('');document.getElementById('matchRight').innerHTML=matchOrder.map(i=>`<button class="match-card ${matchDone.has(i)?'matched':matchRight===i?'selected':''}" ${matchDone.has(i)?'disabled':''} onclick="pickMatch('right',${i})">${matchDone.has(i)?'✓ ':''}${matchRound[i][1]}</button>`).join('')}
function toggleSettings(){const panel=document.getElementById('settingsPanel');panel.classList.toggle('hidden');document.getElementById('settingsToggle').setAttribute('aria-expanded',String(!panel.classList.contains('hidden')))}

let index=0,score=0,streak=0,wrong=[],selected=null,examIndex=0;let examAnswers=JSON.parse(localStorage.getItem('vasaAnswers')||'{}');
function showMode(mode){stopReading();document.getElementById('match').classList.toggle('hidden',mode!=='match');document.getElementById('tabMatch').classList.toggle('active',mode==='match');document.getElementById('quiz').classList.toggle('hidden',mode!=='quiz');document.getElementById('exam').classList.toggle('hidden',mode!=='exam');document.getElementById('tabQuiz').classList.toggle('active',mode==='quiz');document.getElementById('tabExam').classList.toggle('active',mode==='exam');if(mode==='exam')renderExam();if(mode==='match'){renderMatch();if(document.getElementById('autoRead').checked)readMatchRound()}}
function renderQuiz(){stopReading();const content=document.getElementById('quizContent');document.getElementById('score').textContent='⭐ '+score+' poäng';document.getElementById('streak').textContent='🔥 '+streak+' i rad';document.getElementById('bar').style.width=(index/quizQuestions.length*100)+'%';if(index>=quizQuestions.length){document.getElementById('counter').textContent='Färdigt!';if(score===quizQuestions.length)celebrateGlitter('perfect');content.innerHTML=`<h2>🎉 Bra jobbat!</h2><p>Du fick <strong>${score} av ${quizQuestions.length}</strong> poäng.</p><p>${wrong.length?'Du kan träna extra på '+wrong.length+' frågor.':'Alla rätt! Fantastiskt!'}</p><div class="row"><button class="primary" onclick="restart(false)">Spela igen</button>${wrong.length?'<button class="secondary" onclick="restart(true)">Repetera fel</button>':''}</div>`;return}const q=quizQuestions[index];document.getElementById('counter').textContent='Fråga '+(index+1)+' av '+quizQuestions.length;content.innerHTML=`<h3>${q.q}</h3><div class="answers">${q.a.map((a,i)=>`<button class="answer" id="ans${i}" onclick="choose(${i})">${String.fromCharCode(65+i)}. ${a}</button>`).join('')}</div><div id="feedbackArea"></div>`;if(document.getElementById('autoRead').checked)readQuizQuestion()}
function choose(i){stopReading();if(selected!==null)return;selected=i;const q=quizQuestions[index];let ok=i===q.c;if(ok){score++;streak++;celebrateGlitter(streak===5?'streak':'small')}else{wrong.push(q);streak=0}q.a.forEach((_,j)=>{let el=document.getElementById('ans'+j);el.disabled=true;if(j===q.c)el.classList.add('correct');if(j===i&&!ok)el.classList.add('wrong')});document.getElementById('feedbackArea').innerHTML=`<div class="feedback"><strong>${ok?'🌟 Rätt svar!':'💡 Bra försök!'}</strong><p>${q.why}</p></div>${streak===5?'<div id="celebrate">🎉✨🎊✨🎉 Fem rätt i rad!</div>':''}<button class="primary" onclick="nextQuestion()">${index===quizQuestions.length-1?'Se resultat':'Nästa fråga →'}</button>`;document.getElementById('score').textContent='⭐ '+score+' poäng';document.getElementById('streak').textContent='🔥 '+streak+' i rad';if(document.getElementById('autoRead').checked)readFeedback()}
function nextQuestion(){index++;selected=null;if(!maybeBreak())renderQuiz()}
function restart(onlyWrong){const pool=onlyWrong?wrong.map(w=>questions.find(q=>q.q===w.q)).filter(Boolean):questions;buildQuizSession(pool);activeQuizSeconds=0;lastQuizInteraction=Date.now();index=0;score=0;streak=0;wrong=[];selected=null;renderQuiz()}
function renderExam(){stopReading();document.getElementById('examCounter').textContent='Fråga '+(examIndex+1)+' av '+exams.length;document.getElementById('examBar').style.width=(examIndex/exams.length*100)+'%';document.getElementById('examQuestion').textContent=exams[examIndex].q;document.getElementById('examAnswer').value=examAnswers[examIndex]||'';document.getElementById('examAnswer').classList.remove('hidden');document.getElementById('examHelp').classList.add('hidden');document.getElementById('reveal').classList.remove('hidden');document.getElementById('nextExam').textContent=examIndex===exams.length-1?'Börja om →':'Nästa fråga →';document.getElementById('spellingNote').textContent='';if(document.getElementById('autoRead').checked)readExamQuestion()}
function revealExam(){saveAnswer();document.getElementById('examHelp').innerHTML='<strong>Det här är bra att få med:</strong><ul>'+exams[examIndex].points.map(x=>'<li>'+x+'</li>').join('')+'</ul><p class="small">Jämför med ditt eget svar. Det behöver inte vara exakt samma ord!</p>';document.getElementById('examHelp').classList.remove('hidden');if(document.getElementById('autoRead').checked)readExamHelp()}
function saveAnswer(){examAnswers[examIndex]=document.getElementById('examAnswer').value;localStorage.setItem('vasaAnswers',JSON.stringify(examAnswers))}
function advanceExam(){saveAnswer();examIndex=(examIndex+1)%exams.length;renderExam()}

// Uppläsning med webbläsarens inbyggda talsyntes. Ingen extern tjänst behövs.
const speechAvailable=('speechSynthesis' in window)&&('SpeechSynthesisUtterance' in window);
let speechToken=0;let activeSpeechElement=null;
function stopReading(){speechToken++;if(speechAvailable)window.speechSynthesis.cancel();document.querySelectorAll('.reading-now').forEach(el=>el.classList.remove('reading-now'));activeSpeechElement=null}
function updateSpeechRate(){try{localStorage.setItem('vasaSpeechRate',document.getElementById('speechRate').value)}catch(e){}}
function updateSpeechVoice(){try{localStorage.setItem('vasaSpeechVoice',document.getElementById('speechVoice').value)}catch(e){}}
function populateVoices(){
 if(!speechAvailable)return;
 const select=document.getElementById('speechVoice');
 const previous=select.value;
 let saved='';try{saved=localStorage.getItem('vasaSpeechVoice')||''}catch(e){}
 const voices=window.speechSynthesis.getVoices().filter(v=>/^sv(?:-|$)/i.test(v.lang));
 select.replaceChildren(new Option('Automatisk (svenska)',''));
 voices.forEach(v=>select.add(new Option(v.name+' ('+v.lang+')',v.voiceURI)));
 select.value=voices.some(v=>v.voiceURI===(previous||saved))?(previous||saved):'';
}
function preferredVoice(voices){
 const chosen=document.getElementById('speechVoice').value;
 if(chosen){const selected=voices.find(v=>v.voiceURI===chosen);if(selected)return selected}
 const swedish=voices.filter(v=>/^sv(?:-|$)/i.test(v.lang));
 const femaleNames=/(sara|sofie|sofia|anna|elin|alva|agnes|astrid|hedvig|klara|maja|matilda|maria|female|woman|kvinna)/i;
 return swedish.find(v=>femaleNames.test(v.name))||swedish[0]||null;
}
function toggleAutoRead(){try{localStorage.setItem('vasaAutoRead',document.getElementById('autoRead').checked?'1':'0')}catch(e){}}
// Varje uppläst del har en egen markering. Vi förlitar oss inte på opålitliga ordgränser i vissa röster.
function speakSequence(parts){
 if(!speechAvailable){document.getElementById('speechInfo').textContent='Uppläsning stöds inte i den här webbläsaren.';return}
 stopReading();const token=speechToken;
 const voices=window.speechSynthesis.getVoices(), voice=preferredVoice(voices);
 const rate=Number(document.getElementById('speechRate').value)||0.9;
 function next(i){
  if(token!==speechToken)return;
  document.querySelectorAll('.reading-now').forEach(el=>el.classList.remove('reading-now'));
  if(i>=parts.length){document.getElementById('speechInfo').textContent='';return}
  const part=parts[i],el=typeof part.selector==='string'?document.querySelector(part.selector):null;
  if(el){el.classList.add('reading-now');activeSpeechElement=el}
  const utterance=new SpeechSynthesisUtterance(part.text);utterance.lang='sv-SE';utterance.rate=rate;if(voice)utterance.voice=voice;
  utterance.onend=()=>next(i+1);
  utterance.onerror=e=>{if(token===speechToken){document.getElementById('speechInfo').textContent=e.error==='canceled'?'':'Uppläsningen kunde inte slutföras.';document.querySelectorAll('.reading-now').forEach(x=>x.classList.remove('reading-now'))}};
  document.getElementById('speechInfo').textContent='🔊 Läser upp…';window.speechSynthesis.speak(utterance);
 }
 next(0)
}
function speak(text){speakSequence([{text:String(text)}])}
function readQuizQuestion(){if(index>=quizQuestions.length)return;const q=quizQuestions[index];speakSequence([{text:'Fråga '+(index+1)+'. '+q.q,selector:'#quizContent h3'},...q.a.map((a,i)=>({text:'Alternativ '+String.fromCharCode(65+i)+'. '+a,selector:'#ans'+i}))])}
function readFeedback(){const q=quizQuestions[index];if(q)speakSequence([{text:(selected===q.c?'Rätt svar. ':'Bra försök. ')+q.why,selector:'#feedbackArea .feedback'}])}
function readExamQuestion(){speakSequence([{text:'Fråga '+(examIndex+1)+'. '+exams[examIndex].q,selector:'#examQuestion'}])}
function readExamHelp(){speakSequence([{text:'Det här är bra att få med. '+exams[examIndex].points.join('. '),selector:'#examHelp'}])}
function readExamAnswer(){const text=document.getElementById('examAnswer').value.trim();if(text)speakSequence([{text,selector:'#examAnswer'}])}
function readMatchRound(){if(!matchRound.length)return;const parts=[{text:document.getElementById('matchInstructions').textContent,selector:'#matchInstructions'}];matchRound.forEach((pair,i)=>parts.push({text:pair[0],selector:'#matchLeft button:nth-child('+(i+1)+')'}));matchOrder.forEach((i,k)=>parts.push({text:matchRound[i][1],selector:'#matchRight button:nth-child('+(k+1)+')'}));speakSequence(parts)}
function saveSpellHelp(){const checked=document.getElementById('spellHelp').checked;document.getElementById('examAnswer').spellcheck=checked;try{localStorage.setItem('studySpellHelp',checked?'1':'0')}catch(e){}}
function showSpellingHelp(){const area=document.getElementById('examAnswer');if(!document.getElementById('spellHelp').checked){document.getElementById('spellHelp').checked=true;saveSpellHelp()}area.focus();document.getElementById('spellingNote').textContent='Webbläsaren kan markera felstavade ord. Högerklicka (eller håll ned på mobilen) på ett markerat ord för förslag. Inga ändringar görs automatiskt.'}
try{const glitter=localStorage.getItem('vasaGlitter');document.getElementById('glitterEnabled').checked=glitter!=='0';const rate=localStorage.getItem('vasaSpeechRate');if(['0.75','0.9','1.05'].includes(rate))document.getElementById('speechRate').value=rate;document.getElementById('autoRead').checked=localStorage.getItem('vasaAutoRead')==='1';document.getElementById('spellHelp').checked=localStorage.getItem('studySpellHelp')!=='0';saveSpellHelp()}catch(e){}
if(speechAvailable){populateVoices();window.speechSynthesis.addEventListener('voiceschanged',populateVoices)}
if(!speechAvailable){document.getElementById('readQuiz').disabled=true;document.getElementById('speechInfo').textContent='Den här webbläsaren saknar stöd för uppläsning.'}

const THEMES=[['pink','💖 Rosa'],['ocean','🌊 Havsblå'],['forest','🌿 Skogsgrön'],['violet','🔮 Lila'],['night','🌙 Mörk']];
document.getElementById('examAnswer').addEventListener('input',saveAnswer);
buildQuizSession();initTheme();renderQuiz();

function initTheme(){
 let saved='pink';try{saved=localStorage.getItem('studyTheme')||'pink'}catch(e){}
 setTheme(THEMES.some(t=>t[0]===saved)?saved:'pink');
 const picker=document.getElementById('themePicker');
 THEMES.forEach(([id,label])=>{const b=document.createElement('button');b.className='theme-choice';b.textContent=label;b.dataset.theme=id;b.onclick=()=>setTheme(id);picker.appendChild(b)});
 refreshThemeButtons();
 try{document.getElementById('breaksEnabled').checked=localStorage.getItem('studyBreaks')!=='0'}catch(e){}
}
function setTheme(id){document.body.dataset.theme=id;try{localStorage.setItem('studyTheme',id)}catch(e){}refreshThemeButtons()}
function refreshThemeButtons(){document.querySelectorAll('.theme-choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===document.body.dataset.theme)))}
function saveBreakSetting(){try{localStorage.setItem('studyBreaks',document.getElementById('breaksEnabled').checked?'1':'0')}catch(e){}}
const breakIdeas=[
 ['KUNGLIGT DEKRET','Ställ dig upp och sträck armarna mot taket som om du försökte nå kungens krona.'],
 ['VIKTIGT MEDDELANDE','Gå tre varv runt en stol som en mycket upptagen hovmarskalk.'],
 ['RIKETS FRAMTID','Stå på ett ben och säg: ”Jag är en kunglig potatis!”'],
 ['AKUT MINISTERBESLUT','Gör tio lugna marschsteg på stället. En osynlig trumpetorkester tackar dig.'],
 ['HÖGST NÖDVÄNDIGT','Rulla axlarna fem gånger och gör din mest högtidliga bugning.']
];
let activeQuizSeconds=0,lastQuizInteraction=Date.now(),nextBreakAfter=300+Math.floor(Math.random()*180),breakOpen=false;
function maybeBreak(){
 const now=Date.now();activeQuizSeconds+=Math.min((now-lastQuizInteraction)/1000,90);lastQuizInteraction=now;
 if(!document.getElementById('breaksEnabled').checked||breakOpen||activeQuizSeconds<nextBreakAfter)return false;
 // Slumpas mellan frågor och har ingen koppling till om svaret var rätt eller fel.
 const [title,task]=breakIdeas[Math.floor(Math.random()*breakIdeas.length)];
 breakOpen=true;stopReading();
 const mount=document.getElementById('breakMount');mount.innerHTML='';
 const overlay=document.createElement('div');overlay.className='break-overlay';
 overlay.innerHTML='<div class="break-dialog" role="dialog" aria-modal="true" aria-labelledby="breakTitle"><div style="font-size:2.6rem">🎩</div><p>Ministeriet för Fullständigt Nödvändiga Avbrott</p><h2 id="breakTitle"></h2><p id="breakTask"></p><div class="break-actions"><button class="secondary" id="breakRead">🔊 Läs upp</button><button class="primary" id="breakDone">Jag lyder! 🫡</button><button class="secondary" id="breakSkip">Jag överklagar!</button></div></div>';
 overlay.querySelector('#breakTitle').textContent=title;overlay.querySelector('#breakTask').textContent=task;
 const close=()=>{stopReading();mount.replaceChildren();breakOpen=false;activeQuizSeconds=0;nextBreakAfter=480+Math.floor(Math.random()*420);lastQuizInteraction=Date.now();if(!document.getElementById('quiz').classList.contains('hidden'))renderQuiz()};
 overlay.querySelector('#breakRead').onclick=()=>readBreak();overlay.querySelector('#breakDone').onclick=close;overlay.querySelector('#breakSkip').onclick=close;
 mount.appendChild(overlay);overlay.querySelector('#breakDone').focus();if(document.getElementById('autoRead').checked)readBreak();return true;
}

function readBreak(){const title=document.getElementById('breakTitle'),task=document.getElementById('breakTask');if(!title||!task)return;speakSequence([{text:'Ministeriet för Fullständigt Nödvändiga Avbrott',selector:'.break-dialog > p'},{text:title.textContent,selector:'#breakTitle'},{text:task.textContent,selector:'#breakTask'}])}
function testBreak(){if(breakOpen)return;if(!document.getElementById('breaksEnabled').checked){document.getElementById('breaksEnabled').checked=true;saveBreakSetting()}activeQuizSeconds=nextBreakAfter;lastQuizInteraction=Date.now();maybeBreak()}

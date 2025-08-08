// MOVĒ — Mega Ultimate Build (prototype)
// Implements many systems (music, film, TV, Spotify charts, tours, festivals, talent agency, scandals, mini-games, awards, promo codes, etc.)

/* -----------------------
   DEFAULT STATE & UTILS
   ----------------------- */
const DEFAULT = {
  cash: 5000,
  energy: 100, maxEnergy: 100,
  singing: 2, acting: 2, charisma: 2, songwriting: 1, studioLevel: 1, fitness:1,
  xp:0, level:1, week:1, perception:70,
  companies: [], awards: [], songs: [], projects: [], tours: [], followers: 1000,
  staff: {managers:0,producers:0,stylists:0}, properties: [], festivals:[],
  scandals: [], events: [], offers: [], talentAgency: [], merchandise: [],
  settings:{}
};
const $ = id => document.getElementById(id);
const fmt = n => (n>=1000? '£'+n.toLocaleString() : '£'+n);
let state = loadState();

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem('move_mega_v1'));
    if(saved) return {...DEFAULT, ...saved};
  }catch(e){}
  return {...DEFAULT};
}
function saveState(){
  localStorage.setItem('move_mega_v1', JSON.stringify(state));
  log('Game saved.');
  refreshUI();
}
function log(msg){ const ts = `W${state.week} • ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`; state.events.push(`${ts} — ${msg}`); if(state.events.length>400) state.events.shift(); refreshUI(); }

/* -----------------------
   UI REFS & REFRESH
   ----------------------- */
const UI = {
  cash: $('cash'), energy: $('energy'), level: $('level-val'), week: $('week-val'),
  xp: $('xp'), perceptionFill: $('perception-fill'), perceptionText: $('perception-text'),
  singing: $('stat-singing'), acting: $('stat-acting'), charisma: $('stat-charisma'),
  songwriting: $('stat-songwriting'), studio: $('stat-studio'), fitness: $('stat-fitness'),
  eventsLog: $('events-log'), spotifyList: $('spotify-list'), projectsList: $('projects-list'),
  companiesList: $('companies-list'), tourLog: $('tour-log'), offersList: $('offers-list'),
  awardsList: $('awards-list')
};

function refreshUI(){
  UI.cash.textContent = fmt(Math.max(0, Math.floor(state.cash)));
  UI.energy.textContent = Math.floor(state.energy);
  $('level-val').textContent = state.level;
  $('week-val').textContent = state.week;
  UI.xp.textContent = Math.floor(state.xp);
  UI.singing.textContent = Math.floor(state.singing);
  UI.acting.textContent = Math.floor(state.acting);
  UI.charisma.textContent = Math.floor(state.charisma);
  UI.songwriting.textContent = Math.floor(state.songwriting);
  UI.studio.textContent = Math.floor(state.studioLevel);
  UI.fitness.textContent = Math.floor(state.fitness);
  UI.perceptionFill.style.width = `${Math.max(0,Math.min(100,state.perception))}%`;
  UI.perceptionFill.style.background = state.perception>=66? 'var(--good)': (state.perception>=33? 'var(--warn)':'var(--bad)');
  UI.perceptionText.textContent = state.perception>=66? 'Green' : (state.perception>=33? 'Orange' : 'Red');

  UI.eventsLog.innerHTML = state.events.slice().reverse().map(e=>`<div class="event">${e}</div>`).join('');
  UI.companiesList.textContent = state.companies.length? state.companies.join(', '): 'None';
  UI.projectsList.innerHTML = state.projects.length? state.projects.map(p=>`<div class="project-item"><strong>${p.title}</strong> [${p.type}] — ${p.inProduction? 'In production('+p.progress+'%)':'Not in production'} ${p.soldTo? '• Sold to '+p.soldTo : ''}<br><small>Actors: ${p.actors.join(', ') || '—'} • Studio: ${p.studio || '—'}</small></div>`).join('') : 'No projects.';
  UI.spotifyList.innerHTML = state.songs.length? state.songs.slice().sort((a,b)=>b.monthlyListeners-a.monthlyListeners).map((s,i)=>`<div class="spotify-song"><div><strong>${s.name}</strong> — ${s.artist}${s.features? ' (ft. '+s.features +')':''}</div><div>${s.monthlyListeners.toLocaleString()} listens • #${i+1}</div></div>`).join('') : 'No songs yet.';
  UI.tourLog.textContent = state.tours.length? state.tours.map(t=>`${t.name} • Profit: ${fmt(t.profit)}`).join('\n') : 'No tours.';
  UI.offersList.textContent = state.offers.length? state.offers.map(o=>`${o.project} → ${o.buyer} offered ${fmt(o.amount)}`).join('\n') : 'No offers.';
  UI.awardsList.textContent = state.awards.length? state.awards.join(', ') : 'None yet.';
}

/* -----------------------
   XP & LEVELS
   ----------------------- */
function gainXP(amount){
  state.xp += amount;
  while(state.xp >= state.level*state.level*100){
    state.xp -= state.level*state.level*100;
    state.level++;
    log(`Level Up! Now LVL. ${state.level}`);
    state.cash += 5000;
    state.perception = Math.min(100, state.perception+3);
  }
  refreshUI();
}

/* -----------------------
   ACTION FUNCTIONS
   ----------------------- */
function spendEnergy(cost){
  if(state.energy < cost){ log('Not enough energy.'); return false; }
  state.energy = Math.max(0, state.energy - cost);
  return true;
}

function practiceSinging(){
  if(!spendEnergy(10)) return;
  state.singing += 1; state.charisma += 0.5; gainXP(25);
  log('Practiced singing — skills improved.');
}

function writeLyricsMini(){
  if(!spendEnergy(15)) return;
  // mini-game: simple random skill check influenced by songwriting & charisma
  const skill = state.songwriting*10 + state.charisma*2 + Math.random()*50;
  if(skill > 60){
    gainXP(60); state.songwriting += 0.5; log('Lyric mini-game success! Songwriting leveled.');
  } else {
    gainXP(10); log('Lyric mini-game: rough draft — practice more.');
  }
}

function audition(){
  if(!spendEnergy(15)) return;
  const roll = Math.random()*100 + state.acting + state.charisma;
  if(roll > 65){ const pay = 8000 + Math.floor(state.charisma*200); state.cash += pay; state.acting += 1; state.perception = Math.min(100, state.perception+4); gainXP(60); log(`Won audition! Earned ${fmt(pay)}.`); }
  else { state.perception = Math.max(0, state.perception-4); gainXP(10); log('Audition failed.'); }
}

function createSong(){
  if(!spendEnergy(20)) return;
  const name = prompt('Song title:','New Track');
  if(!name) return;
  const artist = prompt('Artist name (leave blank = You)','You');
  const features = prompt('Feature artist (optional)','');
  const studio = prompt('Studio name (blank = your studio)', `Studio L${state.studioLevel}`);
  const writer = prompt('Songwriter (blank = You)','You');
  const video = confirm('Produce a music video? (helps later)');
  // base listeners
  let base = 500 + (state.singing + state.charisma + state.songwriting*3 + state.studioLevel*5)*100;
  if(features) base += 2000; if(video) base += 1500;
  const song = { id: Date.now()+Math.random(), name, artist, features, studio, writer, monthlyListeners: Math.floor(base), marketing:0, video, genre:'Pop' };
  state.songs.push(song);
  state.perception = Math.min(100, state.perception+3);
  gainXP(70);
  log(`Created song "${name}" by ${artist}${features? ' (ft. '+features+')':''}.`);
}

function promoteSong(){
  if(state.songs.length===0){ log('No songs to promote.'); return; }
  const list = state.songs.map((s,i)=>`${i+1}. ${s.name} (${s.artist})`).join('\n');
  const pick = parseInt(prompt('Choose song:\n'+list,'1'))-1;
  const idx = isNaN(pick)? 0 : pick;
  if(!state.songs[idx]) return log('Invalid selection.');
  const spend = parseInt(prompt('Marketing spend (min £100):','1000'));
  if(isNaN(spend) || spend < 100) return log('Invalid spend.');
  if(state.cash < spend) return log('Not enough cash.');
  state.cash -= spend; state.songs[idx].marketing += spend;
  const boost = Math.floor(spend*(0.6 + Math.random()*0.8) + state.songwriting*20 + state.charisma*10 + (state.songs[idx].video?500:0));
  state.songs[idx].monthlyListeners += boost; state.perception = Math.min(100, state.perception+1); gainXP(20);
  log(`Promoted "${state.songs[idx].name}" for ${fmt(spend)} — +${boost.toLocaleString()} listeners.`);
}

function updateCharts(){
  state.songs.forEach(s => {
    const drift = Math.floor((Math.random()*300 - 100) + (state.charisma + state.singing + state.songwriting)*4 + s.marketing*0.001);
    s.monthlyListeners = Math.max(0, s.monthlyListeners + drift);
    if(s.marketing < 1000 && Math.random() < 0.2) s.monthlyListeners = Math.max(0, s.monthlyListeners - Math.floor(Math.random()*300));
  });
  log('Charts updated.');
}

/* -----------------------
   PROJECTS & PRODUCTION
   ----------------------- */
function writeProject(){
  const title = prompt('Project title:','Untitled Show');
  if(!title) return;
  const type = (prompt('Type "tv" or "movie"','tv') || 'tv').toLowerCase() === 'movie' ? 'movie' : 'tv';
  const writer = prompt('Writer name (blank = you)','You');
  const requestedPrice = parseInt(prompt('Asking price if selling (e.g., 50000):','50000')) || 50000;
  state.projects.push({ id: Date.now()+Math.random(), title, type, writer, actors:[], studio:null, inProduction:false, progress:0, marketing:0, soldTo:null, priceAsked: requestedPrice });
  gainXP(40); log(`Wrote ${type.toUpperCase()} "${title}".`);
}

function assignActors(){
  if(state.projects.length===0) return log('No projects.');
  const list = state.projects.map((p,i)=>`${i+1}. ${p.title}`).join('\n');
  const pick = parseInt(prompt('Choose project:\n'+list,'1'))-1;
  const idx = pick;
  if(!state.projects[idx]) return log('Invalid.');
  const actor = prompt('Actor name to add:','Famous Actor');
  if(!actor) return;
  state.projects[idx].actors.push(actor);
  state.perception = Math.min(100, state.perception+2);
  log(`Added actor ${actor} to "${state.projects[idx].title}".`);
}

function startProduction(){
  if(state.projects.length===0) return log('No projects.');
  const list = state.projects.map((p,i)=>`${i+1}. ${p.title} ${p.inProduction? '(in production)':''}`).join('\n');
  const pick = parseInt(prompt('Choose project to start production:\n'+list,'1'))-1;
  const proj = state.projects[pick];
  if(!proj) return log('Invalid.');
  if(proj.inProduction) return log('Already in production.');
  const studio = prompt('Production studio (blank = own):', state.companies.includes('Production Company')? 'ProdCo Studio' : `Studio L${state.studioLevel}`);
  const cost = proj.type === 'movie' ? 20000 + state.studioLevel*5000 : 12000 + state.studioLevel*3000;
  if(state.cash < cost) return log('Not enough cash to start production.');
  state.cash -= cost; proj.inProduction = true; proj.studio = studio; proj.progress = 0;
  gainXP(60); log(`Started production on "${proj.title}" at ${proj.studio}. Paid ${fmt(cost)}.`);
}

function productionTick(){
  state.projects.forEach(p=>{
    if(p.inProduction){
      const speed = 12 + state.studioLevel*3 + Math.floor(state.charisma/5) + state.staff.producers*5;
      p.progress = Math.min(100, p.progress + speed + Math.floor(Math.random()*12));
      if(p.progress >= 100){
        p.inProduction = false; p.progress = 100;
        const releaseIncome = p.type === 'movie' ? 30000 + Math.floor(state.perception*200) : 20000 + Math.floor(state.perception*150);
        state.cash += releaseIncome; state.perception = Math.min(100, state.perception+6);
        log(`Production complete: "${p.title}" released. Earned ${fmt(releaseIncome)}.`);
        // chance to get offers
        if(Math.random() < 0.5){
          const buyer = ['Nartflix','StreamBox','GlobalNet'][Math.floor(Math.random()*3)];
          const offer = Math.floor(releaseIncome * (1 + Math.random()));
          state.offers.push({project:p.title, buyer, amount: offer});
          log(`Offer received: ${buyer} offers ${fmt(offer)} for "${p.title}".`);
        }
      } else {
        log(`"${p.title}" production ${p.progress}%.`);
      }
    }
  });
}

/* -----------------------
   SELLING & NEGOTIATION
   ----------------------- */
function checkOffers(){
  if(state.offers.length===0) return log('No current offers.');
  const list = state.offers.map((o,i)=>`${i+1}. ${o.project} from ${o.buyer} — ${fmt(o.amount)}`).join('\n');
  alert('Offers:\n' + list);
}

function negotiateLast(){
  if(state.offers.length===0) return log('No offers to negotiate.');
  const last = state.offers[state.offers.length-1];
  const counter = Math.floor(last.amount * (1 + (state.perception-50)/200 + Math.random()*0.2));
  const accept = confirm(`${last.buyer} offered ${fmt(last.amount)} for ${last.project}. Counter to ${fmt(counter)}?`);
  if(!accept) return;
  state.cash += counter;
  log(`Sold ${last.project} to ${last.buyer} for ${fmt(counter)}.`);
  state.offers.pop();
  state.projects.forEach(p=>{ if(p.title === last.project) p.soldTo = last.buyer; });
  state.perception = Math.min(100, state.perception+5);
  gainXP(80);
}

/* -----------------------
   TOURS, FESTIVALS, MERCH
   ----------------------- */
function planTour(){
  const name = prompt('Tour name:','UK Small Tour');
  if(!name) return;
  const days = parseInt(prompt('Number of shows (e.g., 5):','5')) || 5;
  const baseTicket = parseInt(prompt('Ticket price (£):','25')) || 25;
  const cost = days * 1000 + 2000;
  if(state.cash < cost) return log('Not enough cash to start tour.');
  state.cash -= cost;
  // earnings influenced by singing, charisma, followers
  const fans = Math.floor((state.followers/1000 + state.singing + state.charisma) * days * (10 + Math.random()*20));
  const revenue = Math.floor(fans * baseTicket);
  const profit = revenue - cost;
  state.cash += revenue;
  state.tours.push({name, days, profit});
  state.perception = Math.min(100, state.perception + 5);
  gainXP(120);
  log(`Tour "${name}" completed — profit ${fmt(profit)}.`);
}

function releaseMerch(){
  const cost = 2000;
  if(state.cash < cost) return log('Not enough cash for merch drop.');
  state.cash -= cost; const sales = 2000 + Math.floor(state.followers*0.2 + Math.random()*5000);
  const revenue = Math.floor(sales * (10 + Math.random()*30));
  state.cash += revenue; state.perception = Math.min(100, state.perception+3);
  log(`Merch drop earned ${fmt(revenue)}.`);
}

function hostFestival(){
  const cost = 150000;
  if(state.cash < cost) return log('Buy festival costs £150,000.');
  state.cash -= cost; state.festivals.push({name:`Fest ${Date.now()}`, year: new Date().getFullYear()});
  log('You now own a music festival — big branding opportunities.');
}

/* -----------------------
   COMPANIES, STAFF & REAL ESTATE
   ----------------------- */
function buyCompany(type){
  if(type==='prod'){
    if(state.cash < 250000) return log('Not enough cash.'); state.cash -= 250000; state.companies.push('Production Company'); log('Bought Production Company.');
  } else if(type==='label'){
    if(state.cash < 200000) return log('Not enough cash.'); state.cash -= 200000; state.companies.push('Record Label'); log('Bought Record Label.');
  } else if(type==='studio'){
    if(state.cash < 40000) return log('Not enough cash.'); state.cash -= 40000; state.studioLevel += 1; log(`Bought/Upgraded Studio to L${state.studioLevel}.`);
  } else if(type==='writer'){
    if(state.cash < 5000) return log('Not enough cash.'); state.cash -= 5000; state.songwriting += 1; log('Hired songwriter.');
  }
  refreshUI();
}

/* -----------------------
   SOCIAL, PR, SCANDALS
   ----------------------- */
function postCampaign(){
  const reach = parseInt(prompt('Campaign budget (£):','1000')) || 1000;
  if(state.cash < reach) return log('Not enough cash.');
  state.cash -= reach;
  const followersGain = Math.floor(reach*0.1 + state.charisma*10 + Math.random()*500);
  state.followers += followersGain; state.perception = Math.min(100, state.perception + 2);
  log(`Campaign ran: +${followersGain} followers.`);
}

function doInterview(){
  const choice = confirm('Do a safe interview? (OK safe - Cancel risky)');
  if(choice){ state.perception = Math.min(100, state.perception+3); state.followers += 200; gainXP(20); log('Safe interview—audience happy.'); }
  else {
    // risky
    if(Math.random() < 0.5){ state.perception = Math.min(100, state.perception+8); state.followers += 1000; gainXP(60); log('Bold interview went viral—huge boost.'); }
    else { state.perception = Math.max(0, state.perception-12); log('Interview backfired—public upset.'); }
  }
}

function charityEvent(){

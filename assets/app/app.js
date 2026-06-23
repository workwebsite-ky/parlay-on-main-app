/* ======================================================================
   Parlay On Main — App logic
   ====================================================================== */
'use strict';

const BIZ = {
  name: 'Parlay On Main',
  phone: '+12624560680',
  phoneFmt: '(262) 456-0680',
  email: 'parlaysonmain@gmail.com',
  address: '240 Main St, Unit A, Racine, WI 53403',
  mapsQ: '240+Main+St,+Racine,+WI+53403',
  ig: 'https://www.instagram.com/parlayonmain/',
  fb: 'https://www.facebook.com/profile.php?id=61579379300233',
  web: 'index.html'
};

/* Weekly programming. dow: 0=Sun … 6=Sat. img = flyer in assets/images */
const EVENTS = [
  { dow:3, dowLabel:'Wed', time:'All night', name:'Wednesday Wings', blurb:'Wing specials and cold drinks to get you over the hump.', cls:'ev--lime',   img:'winds_flyer.png' },
  { dow:5, dowLabel:'Fri', time:'Lunch–Late', name:'Fish Fry Friday', blurb:'Wisconsin tradition done Parlay-style — fried fresh to order.', cls:'ev--blue', img:'Fish_Fry_Friday_flyer.jpg' },
  { dow:6, dowLabel:'Sat', time:'11 AM–3 PM', name:'Saturday Brunch', blurb:'Chicken & waffles, shrimp & grits, mimosas and a full brunch board.', cls:'ev--purple', img:'Saturday_Brunch_flyer.jpg' },
  { dow:6, dowLabel:'Sat', time:'Night',      name:'R&B Nights',      blurb:'Smooth R&B, craft cocktails and good company after dark.', cls:'ev--green', img:'RNB_vibes_flyer.jpg' },
  { dow:0, dowLabel:'Sun', time:'12 Noon',    name:'Soul Food Sunday', blurb:'Pot roast, fried catfish, mac, greens and yams ’til it’s gone.', cls:'ev--red', img:'Soul_Food_Sunday_flyer.jpg' },
  { dow:-1,dowLabel:'Daily',time:'Happy Hour', name:'Ultimate Happy Hour', blurb:'Drink specials and small bites — the everyday reason to stop in.', cls:'ev--amber', img:'happy_hour.jpg' }
];

/* Headline program per weekday for the home "Tonight" card & status pill */
const TODAY_MAP = {
  0:'Soul Food Sunday', 1:'Ultimate Happy Hour', 2:'Ultimate Happy Hour',
  3:'Wednesday Wings', 4:'R&B Nights', 5:'Fish Fry Friday', 6:'Saturday Brunch'
};

const VIP = [
  { name:'High-Top',  price:'$250', meta:'2–3 guests · 1 bottle' },
  { name:'Premium',   price:'$450', meta:'6–8 guests · 2 bottles', feat:true },
  { name:'VIP',       price:'$650', meta:'10–12 guests · 3 bottles' }
];

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = (s='') => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------- Navigation ---------------- */
const VIEWS = ['home','menu','events','book','more'];
function go(view, push=true){
  if(!VIEWS.includes(view)) view='home';
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-'+view));
  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.go === view)));
  $('.main').scrollTop = 0;
  if(push && location.hash !== '#'+view) history.replaceState(null,'','#'+view);
  document.title = view==='home' ? 'Parlay On Main' : `${view[0].toUpperCase()+view.slice(1)} · Parlay On Main`;
}

/* ---------------- Time helpers ---------------- */
function todayHeadline(){
  const name = TODAY_MAP[new Date().getDay()];
  return EVENTS.find(e => e.name === name) || EVENTS[5];
}

/* ---------------- Render: Home ---------------- */
function renderHome(){
  const t = todayHeadline();
  const dow = new Date().getDay();
  $('#tonight').innerHTML = `
    <div class="tonight__bar"></div>
    <div class="tonight__in">
      <div>
        <div class="tonight__day">${dow===t.dow||t.dow===-1?'Today':'This week'} · ${t.dowLabel}</div>
        <div class="tonight__name">${esc(t.name)}</div>
        <div class="tonight__meta">${esc(t.time)} · ${esc(t.blurb.split('—')[0].trim())}</div>
      </div>
      <a class="btn btn--primary tonight__cta" data-go="events" href="#events">See all</a>
    </div>`;

  // status pill reflects today's program (honest — exact hours vary)
  $('#statusText').textContent = 'Today · ' + t.name.replace('Ultimate ','').replace('Wednesday ','').replace(' Sunday','').replace(' Friday','');
  $('#statusDot').classList.add('open');

  // featured dishes rail
  const feats = [
    ['food_pic__1_.jpg','Burger & Wings'],['food_pic__4_.jpg','Grilled Lamb Chops'],
    ['food_pic__3_.jpg','Catfish · Mac · Greens'],['food_pic__19_.jpg','Chicken Philly'],
    ['food_pic__11_.jpg','Honey BBQ Wings'],['food_pic__6_.jpg','Sunday Pot Roast'],
    ['food_pic__15_.jpg','Egg Rolls & Consommé']
  ];
  $('#featRail').innerHTML = feats.map(([img,cap]) =>
    `<a class="fcard" data-go="menu" href="#menu"><img src="assets/images/${img}" alt="${esc(cap)}" loading="lazy"><span>${esc(cap)}</span></a>`).join('');

  // hours / programming list
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const prog = ['Soul Food · 12 Noon','Open · Happy Hour','Open · Happy Hour','Wing Night','Open · R&B','Fish Fry · R&B Night','Brunch 11–3 · Late Night'];
  $('#hoursList').innerHTML = days.map((d,i) =>
    `<div class="hours-row ${i===dow?'is-today':''}"><b>${d}</b><span>${prog[i]}</span></div>`).join('');
}

/* ---------------- Render: Menu ---------------- */
let MENU = [];
async function renderMenu(){
  // Prefer inline data island (works offline / when opened directly); fall back to fetch.
  const island = document.getElementById('menu-data');
  if(island && island.textContent.trim()){
    try{ MENU = JSON.parse(island.textContent); }catch(e){ MENU = []; }
  }
  if(!MENU.length){
    try{ MENU = await (await fetch('assets/app/menu-data.json')).json(); }catch(e){ MENU = []; }
  }
  const chips = $('#menuChips'), body = $('#menuBody');
  chips.innerHTML = MENU.map((c,i) =>
    `<button class="chip ${i===0?'active':''}" data-cat="${c.id}">${esc(c.title)}</button>`).join('');

  body.innerHTML = MENU.map(c => `
    <section class="mcat" id="mcat-${c.id}">
      <div class="mcat__head"><h2>${esc(c.title)}</h2>${c.sub?`<span class="mcat__when">${esc(c.sub)}</span>`:''}</div>
      ${c.photos.length?`<div class="mphotos">${c.photos.map(p=>
        `<figure class="mphoto"><img src="${p.src}" alt="${esc(p.alt)}" loading="lazy"><figcaption>${esc(p.cap)}</figcaption></figure>`).join('')}</div>`:''}
      <div class="mlist">${c.items.map(it=>`
        <div class="mrow" data-text="${esc((it.name+' '+it.desc).toLowerCase())}">
          <div class="mrow__top"><span class="mrow__name">${esc(it.name)}</span><span class="mrow__dots"></span><span class="mrow__price">${esc(it.price)}</span></div>
          ${it.desc?`<div class="mrow__desc">${esc(it.desc)}</div>`:''}
        </div>`).join('')}</div>
    </section>`).join('') + `<div class="noresults" id="noResults" hidden>No dishes match “<span id="nrTerm"></span>”.</div>`;

  const main = $('.main');
  // chip → scroll to category (rect-based so it works regardless of offsetParent)
  $$('.chip', chips).forEach(ch => ch.addEventListener('click', () => {
    const el = $('#mcat-'+ch.dataset.cat);
    if(!el) return;
    const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 6;
    main.scrollTo({ top, behavior:'smooth' });
  }));

  // spy active chip on scroll
  main.addEventListener('scroll', () => {
    if(!$('#view-menu').classList.contains('active')) return;
    const mainTop = main.getBoundingClientRect().top;
    let cur = MENU[0]?.id;
    for(const c of MENU){ const el = $('#mcat-'+c.id); if(el && (el.getBoundingClientRect().top - mainTop) <= 70) cur = c.id; }
    $$('.chip', chips).forEach(ch => ch.classList.toggle('active', ch.dataset.cat === cur));
  }, { passive:true });
}

function runSearch(term){
  term = term.trim().toLowerCase();
  let any = false;
  $$('.mrow').forEach(r => {
    const hit = !term || r.dataset.text.includes(term);
    r.classList.toggle('hide', !hit); if(hit) any = true;
  });
  // hide empty categories
  $$('.mcat').forEach(cat => {
    const visible = $$('.mrow', cat).some(r => !r.classList.contains('hide'));
    cat.style.display = visible ? '' : 'none';
  });
  const nr = $('#noResults');
  if(nr){ nr.hidden = any; $('#nrTerm').textContent = term; }
}

/* ---------------- Render: Events ---------------- */
function renderEvents(){
  $('#eventsList').innerHTML = EVENTS.map(e => `
    <div class="ev ${e.cls}">
      <div class="ev__day"><div class="ev__dow">${esc(e.dowLabel)}</div><div class="ev__time">${esc(e.time)}</div></div>
      <div class="ev__body"><h3>${esc(e.name)}</h3><p>${esc(e.blurb)}</p></div>
    </div>`).join('');

  const cels = [['Birthday_celebration_flyer__1_.jpg','21st Birthday'],['Birthday_celebration_flyer__2_.jpg','Zodiac Nights'],['Birthday_celebration_flyer__5_.jpg','Group Bashes'],['Inner_view.jpg','Private Bookings']];
  $('#celGrid').innerHTML = cels.map(([img,cap]) =>
    `<figure><img src="assets/images/${img}" alt="${esc(cap)}" loading="lazy"></figure>`).join('');
}

/* ---------------- Render: Book ---------------- */
function renderBook(){
  $('#vipRow').innerHTML = VIP.map(v => `
    <div class="vip__c ${v.feat?'feat':''}">
      <div class="vip__name">${esc(v.name)}</div><div class="vip__price">${esc(v.price)}</div><div class="vip__meta">${esc(v.meta)}</div>
    </div>`).join('');

  const today = new Date().toISOString().slice(0,10);
  $('#bDate').min = today; $('#bDate').value = today;

  $('#bookForm').addEventListener('submit', ev => {
    ev.preventDefault();
    const f = ev.target;
    const data = {
      Name:f.name.value.trim(), Phone:f.phone.value.trim(), Date:f.date.value,
      Time:f.time.value, Party:f.party.value, Type:f.type.value, Notes:f.notes.value.trim()
    };
    if(!data.Name || !data.Phone){ toast('Add your name and phone'); return; }
    const body = Object.entries(data).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join('\n');
    const subject = `Table Request — ${data.Name} (${data.Party||'?'} guests)`;
    location.href = `mailto:${BIZ.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body+'\n\nSent from the Parlay On Main app')}`;
    toast('Opening your email…');
  });
}

/* ---------------- Render: More ---------------- */
function renderMore(){
  $('#moreLinks').innerHTML = `
    <a class="mlink" href="tel:${BIZ.phone}"><span class="ic">${IC.phone}</span><span><span class="mlink__t">Call us</span><span class="mlink__s">${BIZ.phoneFmt}</span></span><span class="mlink__chev">${IC.chev}</span></a>
    <a class="mlink" href="https://www.google.com/maps?q=${BIZ.mapsQ}" target="_blank" rel="noopener"><span class="ic">${IC.pin}</span><span><span class="mlink__t">Get directions</span><span class="mlink__s">${esc(BIZ.address)}</span></span><span class="mlink__chev">${IC.chev}</span></a>
    <a class="mlink" href="mailto:${BIZ.email}"><span class="ic">${IC.mail}</span><span><span class="mlink__t">Email</span><span class="mlink__s">${BIZ.email}</span></span><span class="mlink__chev">${IC.chev}</span></a>
    <a class="mlink" href="${BIZ.web}"><span class="ic">${IC.globe}</span><span><span class="mlink__t">Full website</span><span class="mlink__s">Browse the complete site</span></span><span class="mlink__chev">${IC.chev}</span></a>
    <button class="mlink" id="shareBtn" style="width:100%;text-align:left"><span class="ic">${IC.share}</span><span><span class="mlink__t">Share Parlay</span><span class="mlink__s">Send the app to a friend</span></span><span class="mlink__chev">${IC.chev}</span></button>
    <button class="mlink" id="installLink" hidden style="width:100%;text-align:left"><span class="ic">${IC.plus}</span><span><span class="mlink__t">Install app</span><span class="mlink__s">Add Parlay to your home screen</span></span><span class="mlink__chev">${IC.chev}</span></button>`;

  $('#mapEmbed').src = `https://www.google.com/maps?q=${BIZ.mapsQ}&output=embed`;
  $('#igLink').href = BIZ.ig; $('#fbLink').href = BIZ.fb;

  $('#shareBtn').addEventListener('click', async () => {
    const share = { title:'Parlay On Main', text:'Eat · Drink · Socialize — Racine’s spot for soul food, cocktails & R&B nights.', url:location.href };
    if(navigator.share){ try{ await navigator.share(share); }catch{} }
    else { try{ await navigator.clipboard.writeText(share.url); toast('Link copied'); }catch{ toast('Copy this page’s URL to share'); } }
  });
  const il = $('#installLink');
  if(deferredPrompt) il.hidden = false;
  il.addEventListener('click', promptInstall);
}

/* ---------------- Install (PWA) ---------------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredPrompt = e;
  const il = $('#installLink'); if(il) il.hidden = false;
  if(!sessionStorage.getItem('parlay_install_dismissed')) $('#installBanner').classList.add('show');
});
async function promptInstall(){
  if(!deferredPrompt){ toast('In your browser menu, choose “Add to Home Screen”'); return; }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $('#installBanner').classList.remove('show');
  const il = $('#installLink'); if(il) il.hidden = true;
}
window.addEventListener('appinstalled', () => { toast('Installed — find Parlay on your home screen'); $('#installBanner').classList.remove('show'); });

/* ---------------- Toast ---------------- */
let toastT;
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------------- Icons ---------------- */
const IC = {
  phone:'<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/></svg>',
  share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  chev:'<svg viewBox="0 0 24 24" width="18" height="18" style="stroke:currentColor;fill:none;stroke-width:2"><path d="m9 18 6-6-6-6"/></svg>'
};

/* ---------------- Online / offline ---------------- */
function setNet(){ document.body.classList.toggle('is-offline', !navigator.onLine); }
window.addEventListener('online', () => { setNet(); toast('Back online'); });
window.addEventListener('offline', () => { setNet(); toast('Offline — showing saved content'); });

/* ---------------- Boot ---------------- */
function boot(){
  renderHome(); renderMenu(); renderEvents(); renderBook(); renderMore(); setNet();

  // tab + delegated nav
  $$('.tab').forEach(t => t.addEventListener('click', () => go(t.dataset.go)));
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-go]');
    if(nav && nav.dataset.go){ e.preventDefault(); go(nav.dataset.go); }
  });

  $('#searchInput').addEventListener('input', e => runSearch(e.target.value));
  $('#installBtn').addEventListener('click', promptInstall);
  $('#installX').addEventListener('click', () => { $('#installBanner').classList.remove('show'); sessionStorage.setItem('parlay_install_dismissed','1'); });

  window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'home', false));
  go(location.hash.slice(1) || 'home', false);

  // iOS install hint (no beforeinstallprompt on iOS Safari)
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if(isiOS && !standalone && !sessionStorage.getItem('parlay_install_dismissed')){
    $('#installCopy').innerHTML = 'Install Parlay <span>Tap Share, then “Add to Home Screen”</span>';
    $('#installBtn').style.display = 'none';
    $('#installBanner').classList.add('show');
  }
}

if('serviceWorker' in navigator){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
document.addEventListener('DOMContentLoaded', boot);

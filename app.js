(function(){
"use strict";

/* ---------- data ---------- */
// Listings live in data.js (loaded first) so they can be edited without touching app code.
const PLACES = window.PLACES || [];

const ZIPS = {"73070":[35.207,-97.445,"Norman"],"73068":[35.139,-97.394,"Noble"],"73065":[35.247,-97.600,"Newcastle"],"73084":[35.522,-97.352,"Spencer"],"73020":[35.483,-97.270,"Choctaw"],"73049":[35.566,-97.290,"Jones"],"73089":[35.291,-97.812,"Tuttle"],"73066":[35.490,-97.324,"Nicoma Park"],"73003":[35.668,-97.497,"Edmond"],"73008":[35.519,-97.637,"Bethany"],"73013":[35.618,-97.478,"Edmond"],"73034":[35.678,-97.427,"Edmond"],"73099":[35.509,-97.742,"Yukon"],"73064":[35.384,-97.725,"Mustang"],"73069":[35.222,-97.442,"Norman"],"73071":[35.233,-97.393,"Norman"],"73072":[35.211,-97.497,"Norman"],"73150":[35.402,-97.378,"SE OKC"],"73165":[35.335,-97.358,"SE OKC"],"73173":[35.339,-97.623,"SW OKC"],"73102":[35.471,-97.519,"Downtown"],"73103":[35.490,-97.519,"Midtown / Heritage Hills"],"73104":[35.477,-97.503,"Northeast / Capitol"],"73105":[35.519,-97.502,"Lincoln Terrace"],"73106":[35.482,-97.535,"Near northwest"],"73107":[35.484,-97.574,"West Penn / May"],"73108":[35.446,-97.563,"Stockyards / Southwest"],"73109":[35.426,-97.526,"South Capitol Hill"],"73110":[35.461,-97.398,"Midwest City"],"73111":[35.504,-97.480,"Northeast"],"73112":[35.518,-97.574,"Northwest / Penn Square"],"73114":[35.576,-97.517,"North Broadway"],"73115":[35.440,-97.442,"Del City"],"73116":[35.544,-97.564,"Nichols Hills area"],"73117":[35.474,-97.465,"East side"],"73118":[35.513,-97.531,"Crown Heights / Classen"],"73119":[35.421,-97.566,"Southwest"],"73120":[35.583,-97.572,"Lake Hefner area"],"73121":[35.506,-97.445,"Northeast"],"73122":[35.521,-97.613,"Warr Acres area"],"73127":[35.483,-97.648,"West Reno"],"73128":[35.444,-97.649,"Southwest"],"73129":[35.432,-97.491,"Southeast"],"73130":[35.461,-97.350,"Midwest City east"],"73131":[35.578,-97.462,"Northeast rural"],"73132":[35.553,-97.637,"Tulakes / Wiley Post"],"73134":[35.613,-97.572,"Far north"],"73135":[35.401,-97.438,"Southeast"],"73139":[35.387,-97.526,"South OKC"],"73141":[35.519,-97.392,"Spencer area"],"73142":[35.598,-97.625,"Northwest"],"73149":[35.389,-97.495,"Southeast"],"73159":[35.396,-97.555,"South OKC"],"73160":[35.333,-97.475,"Moore"],"73162":[35.580,-97.641,"Northwest"],"73169":[35.388,-97.660,"Southwest"],"73170":[35.335,-97.553,"South OKC"],"73179":[35.425,-97.645,"Airport area"]};

const STORES = [
 {name:"Homeland",what:"Oklahoma's largest locally owned grocery chain. Digital coupons and weekly ads in the Homeland app.",url:"https://www.homelandstores.com/"},
 {name:"Walmart",what:"Rollbacks and the weekly ad in the Walmart app. Accepts SNAP EBT for online pickup and delivery.",url:"https://www.walmart.com/"},
 {name:"Aldi",what:"Low everyday prices and a weekly specials ad. EBT accepted in stores.",url:"https://www.aldi.us/"},
 {name:"Crest Foods",what:"OKC-based grocer with weekly specials and in-store deals.",url:"https://www.crestfoods.com/"},
 {name:"Target",what:"Target Circle deals are free to join and save on groceries and household items.",url:"https://www.target.com/circle"},
 {name:"Sprouts",what:"Weekly produce sales, with digital coupons in the Sprouts app.",url:"https://www.sprouts.com/"}
];

const CHARITIES = [
 {name:"Regional Food Bank of Oklahoma",what:"Supplies food to hundreds of pantries, shelters and school programs across central and western Oklahoma.",tag:"Food",url:"https://www.regionalfoodbank.org/"},
 {name:"Homeless Alliance",what:"Runs the OKC Day Shelter, the winter shelter and housing programs on the WestTown campus.",tag:"Shelter",url:"https://www.homelessalliance.org/"},
 {name:"City Rescue Mission",what:"Emergency shelter, meals and recovery programs for men, women and families since 1960.",tag:"Shelter",url:"https://www.cityrescue.org/give"},
 {name:"Infant Crisis Services",what:"Formula, food and diapers for babies and toddlers in crisis. SNAP and WIC don't cover diapers.",tag:"Families",url:"https://www.infantcrisis.org/"},
 {name:"Sisu Youth Services",what:"Overnight shelter, meals and case management for young people ages 15–24.",tag:"Youth",url:"https://www.sisuyouth.org/"},
 {name:"Hunger Free Oklahoma",what:"Runs the SNAP hotline and Double Up Oklahoma, helping families stretch food dollars.",tag:"Food",url:"https://www.hungerfreeok.org/"}
];

/* ---------- state ---------- */
const DOWNTOWN = {lat:35.4676, lon:-97.5164, label:"Downtown Oklahoma City"};
const S = {loc:{...DOWNTOWN}, custom:false, radius:5, type:"all", kinds:new Set(), openNow:false, sel:null, zoom:"fit"};
try{ const r = localStorage.getItem("okcff-radius"); if(r) S.radius = Math.min(25,Math.max(1,+r||5)); }catch(e){}

const KIND_LABEL = {pantry:"Pantry",meal:"Hot meals",baby:"Baby & kids",overnight:"Overnight",day:"Day center",youth:"Youth",family:"Families",women:"Women"};
const CHIPS = {all:[], food:["pantry","meal","baby"], shelter:["overnight","day","youth","family"]};

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function miles(a,b){
  const R=3958.8, r=Math.PI/180;
  const dLat=(b.lat-a.lat)*r, dLon=(b.lon-a.lon)*r;
  const x=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function nowCT(){
  const parts = new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",weekday:"short",hour:"numeric",minute:"numeric",month:"numeric",day:"numeric",hourCycle:"h23"}).formatToParts(new Date());
  const g = t => (parts.find(p=>p.type===t)||{}).value;
  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"));
  return {day, mins:(+g("hour")%24)*60 + +g("minute"), month:+g("month"), date:+g("day")};
}
const toMin = t => { const [h,m]=t.split(":").map(Number); return h*60+m; };
function fmtT(t){ let [h,m]=t.split(":").map(Number); const ap=h>=12&&h<24?"pm":"am"; h=h%12||12; return h+(m?":"+String(m).padStart(2,"0"):"")+" "+ap; }
function inWinterSeason(n){ return n.month>=11 || n.month<=3; }
function status(p){
  const n = nowCT();
  if(p.seasonal && !inWinterSeason(n)) return {cls:"soon",t:"Opens Nov. 1",open:false};
  if(!p.h) return {cls:"",t:"Call for hours",open:null};
  const today = p.h.filter(s=>s[0].includes(String(n.day)));
  for(const s of today){ if(n.mins>=toMin(s[1]) && n.mins<toMin(s[2])) return {cls:"open",t: s[2]==="24:00"||(s[1]==="00:00"&&s[2]==="24:00") ? "Open now" : "Open now · until "+fmtT(s[2]),open:true}; }
  const next = today.map(s=>s[1]).filter(o=>toMin(o)>n.mins).sort((a,b)=>toMin(a)-toMin(b))[0];
  if(next) return {cls:"",t:"Opens today at "+fmtT(next),open:false};
  return {cls:"",t:"Closed now",open:false};
}
function dirUrl(p){ return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.addr); }

/* ---------- filtering ---------- */
function filtered(){
  return PLACES.map(p=>({...p, d: p.lat ? miles(S.loc,p) : null, st: status(p)}))
    .filter(p => S.type==="all" || p.cat===S.type)
    .filter(p => !S.kinds.size || p.kind.some(k=>S.kinds.has(k)))
    .filter(p => !S.openNow || p.st.open===true);
}

/* ---------- render: controls ---------- */
function renderChips(){
  const el = $("#chips"); const ks = CHIPS[S.type];
  el.hidden = !ks.length;
  el.innerHTML = ks.map(k=>`<button type="button" class="chip" data-kind="${k}" aria-pressed="${S.kinds.has(k)}">${KIND_LABEL[k]}</button>`).join("");
}
function renderLoc(){
  $("#locNow").innerHTML = `Distances from <b>${esc(S.loc.label)}</b>` + (S.custom ? ` · <button type="button" class="btn ghost small" id="resetLoc">Reset</button>` : "");
  $("#radiusOut").textContent = S.radius+" mi";
  $("#radius").value = S.radius;
}

/* ---------- render: list ---------- */
const kindText = p => p.kind.map(k=>KIND_LABEL[k]).join(" · ");
const distText = d => (d<0.1?"<0.1":d.toFixed(1))+" mi";
function card(p, n, sel){
  return `<article class="card${sel?" sel":""}" id="c-${p.id}" data-id="${p.id}" tabindex="0" aria-current="${sel}">
    <div class="card-head"><span class="eyebrow ${p.cat}">${n?n+" · ":""}${esc(kindText(p))}</span>${p.d!=null?`<span class="dist">${distText(p.d)}</span>`:""}</div>
    <h3>${esc(p.name)}</h3>
    <div class="tags"><span class="pill ${p.st.cls}">${esc(p.st.t)}</span>${(p.feat||[]).map(f=>`<span class="feat">${esc(f)}</span>`).join("")}</div>
    <span class="line">${esc(p.hoursText)}</span>
    <span class="line">${p.addr?esc(p.addr):"Address not public · call for location"}</span>
  </article>`;
}
function renderList(){
  const all = filtered();
  const mapped = all.filter(p=>p.d!=null);
  const near = mapped.filter(p=>p.d<=S.radius).sort((a,b)=>a.d-b.d);
  const farther = mapped.length - near.length;
  const callOnly = all.filter(p=>p.d==null);
  // selection falls back to the closest place so the details panel is never empty
  const shown = near.concat(callOnly);
  const selId = shown.some(p=>p.id===S.sel) ? S.sel : (shown[0]||{}).id;
  const noun = S.type==="food"?"food sources":S.type==="shelter"?"shelters":"places";
  $("#countH").textContent = `${near.length} ${near.length===1?noun.replace(/s$/,""):noun} within ${S.radius} mi`;
  $("#countS").textContent = farther ? `${farther} more farther away` : "";
  let html = near.map((p,i)=>card(p,i+1,p.id===selId)).join("");
  if(!near.length){
    html = `<div class="empty">Nothing matches within ${S.radius} miles${S.openNow?" that's open right now":""}.<br>${farther?`<button type="button" class="btn small" id="widen" style="margin-top:10px">Widen to ${Math.min(25,Math.ceil(Math.min(...mapped.map(p=>p.d)))+1)} mi</button>`:"Try clearing a filter."}</div>`;
  }
  if(callOnly.length){
    html += `<div class="callonly"><h2>Call to reach</h2></div>` + callOnly.map(p=>card(p,0,p.id===selId)).join("");
  }
  $("#list").innerHTML = html;
  return {near, selId, sel: shown.find(p=>p.id===selId)};
}

/* ---------- render: details ---------- */
function field(label, value){ return `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`; }
function renderDetails(p){
  const el = $("#details");
  if(!p){ el.innerHTML = `<h2>No matching places</h2><p class="muted">Try a bigger distance or clear a filter.</p>`; return; }
  const tel = p.phone ? p.phone.replace(/[^\d+]/g,"") : "";
  el.innerHTML = `
    <span class="eyebrow ${p.cat}">${p.cat==="food"?"Food":"Shelter"} · ${esc(kindText(p))}</span>
    <h3>${esc(p.name)}</h3>
    <span class="pill ${p.st.cls}">${esc(p.st.t)}</span>
    ${p.note?`<p class="muted">${esc(p.note)}</p>`:""}
    ${p.cat==="shelter"?`<p class="call-note">Call to check bed availability before you go.</p>`:""}
    <dl class="detail-grid">
      ${field("Address", p.addr || "Not public. Call for the location")}
      ${field("Hours", p.hoursText)}
      ${p.d!=null?field("Distance", distText(p.d)+" from "+S.loc.label):""}
      ${p.serves?field("Serves", p.serves):""}
      ${p.phone?field("Phone", p.phone):""}
      ${p.feat&&p.feat.length?field("Good to know", p.feat.join(" · ")):""}
    </dl>
    <div class="actions">
      ${p.phone?`<a class="btn" href="tel:${tel}">Call</a>`:""}
      ${p.addr?`<a class="btn ghost" href="${dirUrl(p)}" target="_blank" rel="noopener">Directions</a>`:""}
      ${p.phone?`<button type="button" class="btn ghost" data-copy="${esc(p.phone)}">Copy number</button>`:""}
      ${/^https?:\/\//.test(p.web||"")?`<a class="btn ghost" href="${esc(p.web)}" target="_blank" rel="noopener">Website</a>`:""}
    </div>`;
}

/* ---------- render: map ---------- */
const FULL = L.latLngBounds([35.13,-97.77],[35.68,-97.25]);
const map = L.map("map", {zoomControl:true, attributionControl:true, scrollWheelZoom:false}).fitBounds(FULL);
// Esri World Street Map: Google-like styling, no API key needed
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  maxZoom:19,
  attribution:"Tiles &copy; Esri &mdash; Esri, HERE, Garmin, USGS, NGA, EPA, USDA, NPS"
}).addTo(map);
const layer = L.layerGroup().addTo(map);
let lastView = "";

// Pin glyphs (Lucide "utensils" and "house"); food pins are circles, shelter pins are rounded squares.
const PIN_ICON = {
  food:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  shelter:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>'
};
document.querySelectorAll(".legend [data-icon]").forEach(el=>{ el.innerHTML = PIN_ICON[el.dataset.icon]; });

function renderMap(near, selId){
  layer.clearLayers();
  const ring = L.circle([S.loc.lat,S.loc.lon], {radius:S.radius*1609.34, color:"#2f7a50", weight:1.5, dashArray:"6 5", fillOpacity:.06, interactive:false}).addTo(layer);
  const num = new Map(near.map((p,i)=>[p.id,i+1]));
  for(const p of filtered().filter(p=>p.lat)){
    const n = num.get(p.id), sel = selId===p.id;
    const icon = n
      ? L.divIcon({className:"", html:`<span class="map-pin ${p.cat}${sel?" active":""}">${PIN_ICON[p.cat]}<b>${n}</b></span>`, iconSize:[32,32], iconAnchor:[16,16]})
      : L.divIcon({className:"", html:`<span class="map-pin ${p.cat} far">${PIN_ICON[p.cat]}</span>`, iconSize:[18,18], iconAnchor:[9,9]});
    L.marker([p.lat,p.lon], {icon, title:p.name, alt:p.name, zIndexOffset: sel?1000:n?500:0, riseOnHover:true})
      .on("click", ()=>select(p.id,true)).addTo(layer);
  }
  L.marker([S.loc.lat,S.loc.lon], {icon:L.divIcon({className:"",html:'<div class="you-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]}), interactive:false, zIndexOffset:2000}).addTo(layer);
  // only move the camera when the location/radius/zoom mode changes, so panning isn't undone by re-renders
  const key = `${S.zoom}|${S.loc.lat}|${S.loc.lon}|${S.radius}`;
  if(key!==lastView){ lastView = key; map.fitBounds(S.zoom==="all" ? FULL : ring.getBounds(), {padding:[20,20]}); }
}

/* ---------- render all ---------- */
function render(){ renderLoc(); renderChips(); const r = renderList(); renderMap(r.near, r.selId); renderDetails(r.sel); }

/* ---------- events ---------- */
$("#zipForm").addEventListener("submit", e=>{
  e.preventDefault();
  const z = $("#zipInput").value.trim(), err = $("#zipErr");
  if(ZIPS[z]){ const [lat,lon,lab]=ZIPS[z]; S.loc={lat,lon,label:`${z} (${lab})`}; S.custom=true; S.zoom="fit"; S.sel=null; err.hidden=true; $("#locStatus").textContent=""; render(); }
  else { err.textContent = /^\d{5}$/.test(z) ? "That ZIP isn't in the Oklahoma City area yet. Try a nearby OKC ZIP, or tap the map." : "Enter a 5-digit ZIP code."; err.hidden=false; }
});
$("#locateBtn").addEventListener("click", ()=>{
  const btn = $("#locateBtn"), msg = $("#locStatus");
  $("#zipErr").hidden = true;
  if(!navigator.geolocation){ msg.textContent = "Your browser can't share location. Enter a ZIP code instead."; return; }
  btn.disabled = true; msg.textContent = "Finding your location. It isn't saved or sent anywhere.";
  navigator.geolocation.getCurrentPosition(pos=>{
    btn.disabled = false;
    const loc = {lat:pos.coords.latitude, lon:pos.coords.longitude, label:"your current location"};
    const away = miles(loc, DOWNTOWN);
    S.loc = loc; S.custom = true; S.zoom = "fit"; S.sel = null;
    $("#zipInput").value = "";
    msg.textContent = away > 40
      ? `You look about ${Math.round(away)} miles from Oklahoma City. These listings only cover the OKC area.`
      : "";
    render();
  }, err=>{
    btn.disabled = false;
    msg.textContent = err.code===1
      ? "Location permission was blocked. Allow it in your browser's address bar, or enter a ZIP code."
      : "Couldn't get your location. Try again, or enter a ZIP code.";
  }, {enableHighAccuracy:true, timeout:10000, maximumAge:60000});
});
$("#radius").addEventListener("input", e=>{ S.radius=+e.target.value; try{localStorage.setItem("okcff-radius",S.radius);}catch(_){} render(); });
document.querySelector(".seg").addEventListener("click", e=>{
  const b = e.target.closest("button[data-type]"); if(!b) return;
  S.type=b.dataset.type; S.kinds.clear();
  document.querySelectorAll(".seg button").forEach(x=>x.setAttribute("aria-pressed", x===b));
  render();
});
$("#chips").addEventListener("click", e=>{
  const b = e.target.closest("[data-kind]"); if(!b) return;
  const k=b.dataset.kind; S.kinds.has(k)?S.kinds.delete(k):S.kinds.add(k); render();
});
$("#openNow").addEventListener("change", e=>{ S.openNow=e.target.checked; render(); });
$("#fitBtn").addEventListener("click", ()=>{ S.zoom="fit"; lastView=""; render(); });
$("#allBtn").addEventListener("click", ()=>{ S.zoom="all"; lastView=""; render(); });

function select(id, scroll){
  S.sel = id;
  render();
  if(scroll){ const c=document.getElementById("c-"+id); if(c) c.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth", block:"nearest"}); }
}
map.on("click", e=>{
  S.loc = {lat:e.latlng.lat, lon:e.latlng.lng, label:"the spot you picked"}; S.custom=true; S.sel=null; S.zoom="fit";
  render();
});
function copyNumber(cp){
  const t=cp.dataset.copy, done=()=>{cp.textContent="Copied"; setTimeout(()=>cp.textContent="Copy number",1500);};
  try{ navigator.clipboard.writeText(t).then(done).catch(()=>selectText(cp)); }catch(_){ selectText(cp); }
}
$("#details").addEventListener("click", e=>{ const cp=e.target.closest("[data-copy]"); if(cp) copyNumber(cp); });
$("#list").addEventListener("click", e=>{
  if(e.target.closest("#widen")){ const mapped=filtered().filter(p=>p.d!=null); S.radius=Math.min(25,Math.ceil(Math.min(...mapped.map(p=>p.d)))+1); render(); return; }
  const c = e.target.closest(".card"); if(c) select(c.dataset.id,false);
});
$("#list").addEventListener("keydown", e=>{ const c=e.target.closest(".card"); if(c&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); select(c.dataset.id,false); $("#c-"+c.dataset.id).focus(); } });
document.addEventListener("click", e=>{ if(e.target.id==="resetLoc"){ S.loc={...DOWNTOWN}; S.custom=false; S.zoom="fit"; $("#zipInput").value=""; render(); } });
function selectText(el){ if(!el) return; const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }

/* ---------- static views ---------- */
$("#storeGrid").innerHTML = STORES.map(s=>`<div class="box"><h3>${esc(s.name)}</h3><p>${esc(s.what)}</p><a class="linkbtn ghost" href="${s.url}" target="_blank" rel="noopener">See deals</a></div>`).join("");
$("#donateGrid").innerHTML = CHARITIES.map(c=>`<div class="box"><div class="eyebrow">${esc(c.tag)}</div><h3>${esc(c.name)}</h3><p>${esc(c.what)}</p><a class="linkbtn" href="${c.url}" target="_blank" rel="noopener">Donate</a></div>`).join("");

/* ---------- routing ---------- */
const VIEWS = ["find","snap","save","donate"];
function route(){
  const h = location.hash.replace("#",""); const v = VIEWS.includes(h)?h:"find";
  VIEWS.forEach(x=>{ document.getElementById("view-"+x).hidden = x!==v; });
  document.querySelectorAll("nav.tabs a").forEach(a=>a.setAttribute("aria-current", a.dataset.view===v?"page":"false"));
  if(v==="find") map.invalidateSize();
}
window.addEventListener("hashchange", route);
route(); render();
setInterval(()=>{ if(!document.hidden && !$("#view-find").hidden) render(); }, 60000);
})();
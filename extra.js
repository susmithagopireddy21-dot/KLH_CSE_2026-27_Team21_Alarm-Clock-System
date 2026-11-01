/* ChronoOS extra tools: focus timer, holidays, and interactive time-zone map. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pad = value => String(value).padStart(2, '0');
  const format = seconds => `${pad(Math.floor(Math.max(0, seconds) / 60))}:${pad(Math.max(0, seconds) % 60)}`;

  // Focus Studio / Pomodoro timer
  function initFocus() {
    const display = $('#focusCountdown');
    if (!display) return;
    const modeLabel = $('#focusModeLabel');
    const status = $('#focusStatus');
    const start = $('#focusStartButton');
    const reset = $('#focusResetButton');
    const skip = $('#focusSkipButton');
    const ring = $('.focus-ring');
    let mode = 'Focus';
    let totalSeconds = 1500;
    let remaining = totalSeconds;
    let endsAt = 0;
    let interval = null;
    let running = false;
    let completed = loadStats();

    function todayKey() { const d=new Date(); return `chronoosFocusStats-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
    function loadStats() {
      try { const v = JSON.parse(localStorage.getItem(todayKey()) || '{}'); return {sessions:Number(v.sessions)||0,minutes:Number(v.minutes)||0}; }
      catch { return {sessions:0,minutes:0}; }
    }
    function saveStats() { localStorage.setItem(todayKey(), JSON.stringify(completed)); renderStats(); }
    function renderStats() {
      $('#focusSessionsDone').textContent = completed.sessions;
      $('#focusMinutesDone').textContent = `${completed.minutes} min`;
      $('#focusProgressBar').style.width = `${Math.min(100, completed.sessions / 8 * 100)}%`;
    }
    function paint() {
      display.textContent = format(remaining);
      const passed = totalSeconds - remaining;
      const angle = totalSeconds ? Math.round(passed / totalSeconds * 360) : 0;
      if (ring) ring.style.background = `radial-gradient(circle at center,var(--card,#111724) 61%,transparent 62%),conic-gradient(var(--primary,#7c5cff) ${angle}deg,rgba(124,92,255,.16) ${angle}deg)`;
    }
    function stopInterval() { if (interval) clearInterval(interval); interval = null; }
    function finishSession(message = 'Session complete! Take a breath before the next one.') {
      stopInterval(); running = false; remaining = 0; paint();
      start.innerHTML = '<i class="fa-solid fa-play"></i> Start session';
      if (mode === 'Focus') { completed.sessions += 1; completed.minutes += Math.round(totalSeconds / 60); saveStats(); }
      status.textContent = message;
      modeLabel.textContent = 'SESSION COMPLETE';
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC && window.chronoosSoundEnabled !== false) { const ctx = new AC(); ctx.resume().then(() => { [660,880,1046].forEach((hz,i) => { const osc=ctx.createOscillator(), gain=ctx.createGain(); osc.frequency.value=hz; gain.gain.setValueAtTime(.0001,ctx.currentTime+i*.16); gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+i*.16+.02); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+i*.16+.22); osc.connect(gain);gain.connect(ctx.destination);osc.start(ctx.currentTime+i*.16);osc.stop(ctx.currentTime+i*.16+.24); }); setTimeout(()=>ctx.close(),1000); }); }
      } catch {}
    }
    function tick() {
      remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)); paint();
      if (remaining <= 0) finishSession();
    }
    function choose(minutes, type, button) {
      stopInterval(); running = false; mode = type; totalSeconds = minutes * 60; remaining = totalSeconds;
      $$('.focus-mode-tab').forEach(b => b.classList.toggle('active', b === button));
      modeLabel.textContent = type.toUpperCase() + ' SESSION';
      start.innerHTML = '<i class="fa-solid fa-play"></i> Start session';
      status.textContent = `${type} timer ready.`; paint();
    }
    $$('.focus-mode-tab').forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.focusMinutes), button.dataset.focusType, button)));
    start.addEventListener('click', () => {
      if (running) { remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)); stopInterval(); running = false; start.innerHTML = '<i class="fa-solid fa-play"></i> Resume session'; status.textContent = 'Paused. Resume whenever you are ready.'; paint(); return; }
      if (remaining <= 0) remaining = totalSeconds;
      endsAt = Date.now() + remaining * 1000; running = true;
      start.innerHTML = '<i class="fa-solid fa-pause"></i> Pause'; modeLabel.textContent = mode.toUpperCase() + ' IN PROGRESS';
      const task = $('#focusTaskName').value.trim(); status.textContent = task ? `Stay with it: ${task}` : `${mode} session is running. You’ve got this!`;
      stopInterval(); interval = setInterval(tick, 200); tick();
    });
    reset.addEventListener('click', () => { stopInterval(); running = false; remaining = totalSeconds; start.innerHTML = '<i class="fa-solid fa-play"></i> Start session'; modeLabel.textContent = mode.toUpperCase() + ' SESSION'; status.textContent = 'Timer reset.'; paint(); });
    skip.addEventListener('click', () => { stopInterval(); running=false; remaining=0; paint(); start.innerHTML='<i class="fa-solid fa-play"></i> Start session'; modeLabel.textContent='SESSION SKIPPED'; status.textContent='Session skipped. Pick another interval whenever you are ready.'; });
    $('#focusClearStats').addEventListener('click', () => { if (confirm('Reset today’s focus statistics?')) { completed = {sessions:0,minutes:0}; saveStats(); } });
    renderStats(); paint();
    // Dashboard card shortcuts navigate to the full Focus Studio page.
    $$('.focus-button').forEach(button => button.addEventListener('click', () => {
      const nav = $('.navigation [data-page="focus"]'); if (nav) nav.click();
      if (!running) start.click();
    }));
  }

  // Real geographic world map with hoverable city markers and live local times.
  const zones = [
    ['Honolulu','United States','Pacific/Honolulu',21.3069,-157.8583],['Anchorage','United States','America/Anchorage',61.2181,-149.9003],['Los Angeles','United States','America/Los_Angeles',34.0522,-118.2437],['Denver','United States','America/Denver',39.7392,-104.9903],['Chicago','United States','America/Chicago',41.8781,-87.6298],['New York','United States','America/New_York',40.7128,-74.0060],['Toronto','Canada','America/Toronto',43.6532,-79.3832],['Mexico City','Mexico','America/Mexico_City',19.4326,-99.1332],['São Paulo','Brazil','America/Sao_Paulo',-23.5505,-46.6333],['Buenos Aires','Argentina','America/Argentina/Buenos_Aires',-34.6037,-58.3816],['Reykjavík','Iceland','Atlantic/Reykjavik',64.1466,-21.9426],['London','United Kingdom','Europe/London',51.5072,-0.1276],['Paris','France','Europe/Paris',48.8566,2.3522],['Berlin','Germany','Europe/Berlin',52.5200,13.4050],['Cairo','Egypt','Africa/Cairo',30.0444,31.2357],['Nairobi','Kenya','Africa/Nairobi',-1.2921,36.8219],['Dubai','United Arab Emirates','Asia/Dubai',25.2048,55.2708],['Mumbai','India','Asia/Kolkata',19.0760,72.8777],['Hyderabad','India','Asia/Kolkata',17.3850,78.4867],['Singapore','Singapore','Asia/Singapore',1.3521,103.8198],['Bangkok','Thailand','Asia/Bangkok',13.7563,100.5018],['Beijing','China','Asia/Shanghai',39.9042,116.4074],['Tokyo','Japan','Asia/Tokyo',35.6762,139.6503],['Seoul','South Korea','Asia/Seoul',37.5665,126.9780],['Jakarta','Indonesia','Asia/Jakarta',-6.2088,106.8456],['Perth','Australia','Australia/Perth',-31.9505,115.8605],['Sydney','Australia','Australia/Sydney',-33.8688,151.2093],['Auckland','New Zealand','Pacific/Auckland',-36.8509,174.7645],['Fiji','Fiji','Pacific/Fiji',-18.1248,178.4501]
  ];
  let selectedZone = zones.find(z => z[0] === 'Hyderabad') || zones[0];
  const zoneTime = zone => new Intl.DateTimeFormat('en-US',{timeZone:zone[2],hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date());
  const zoneOffset = zone => new Intl.DateTimeFormat('en-US',{timeZone:zone[2],timeZoneName:'shortOffset'}).formatToParts(new Date()).find(p=>p.type==='timeZoneName')?.value || '';
  function renderSelectedZone() {
    const city=$('#selectedZoneCity'); if(!city)return;
    city.textContent=selectedZone[0]; $('#selectedZoneName').textContent=`${selectedZone[2]} · ${zoneOffset(selectedZone)}`;
    $('#selectedZoneTime').textContent=zoneTime(selectedZone);
  }
  function initMap() {
    const host=$('#aclockWorldMap'); if(!host)return;
    if(!window.L){ host.innerHTML='<div class="map-fallback">The interactive map needs an internet connection to load its map library and map tiles. Use the World Clock city list above in the meantime.</div>'; return; }
    const map=L.map(host,{worldCopyJump:true,scrollWheelZoom:false}).setView([20,8],2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:7,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const markers=[];
    zones.forEach(zone=>{
      const marker=L.circleMarker([zone[3],zone[4]],{radius:5,color:'#9b1717',weight:1.5,fillColor:'#ff3030',fillOpacity:.95}).addTo(map);
      const tooltip=()=>`<strong>${zone[0]}, ${zone[1]}</strong><br>${zoneTime(zone)} · ${zone[2]}<br>${zoneOffset(zone)}`;
      marker.bindTooltip(tooltip(),{direction:'top',sticky:true,opacity:1,className:'aclock-map-tooltip'});
      marker.bindPopup(tooltip());
      marker.on('mouseover',()=>{selectedZone=zone;renderSelectedZone();marker.setStyle({radius:8,fillColor:'#ff5555'});marker.setTooltipContent(tooltip()).openTooltip();});
      marker.on('mouseout',()=>marker.setStyle({radius:5,fillColor:'#ff3030'}));
      marker.on('click',()=>{selectedZone=zone;renderSelectedZone();marker.setPopupContent(tooltip()).openPopup();});
      markers.push(marker);
    });
    setTimeout(()=>map.invalidateSize(),250);
    const worldSection=host.closest('[data-dashboard-page]');
    if(worldSection){new MutationObserver(()=>{if(!worldSection.hidden)setTimeout(()=>map.invalidateSize(),120);}).observe(worldSection,{attributes:true,attributeFilter:['hidden']});}
    window.addEventListener('resize',()=>map.invalidateSize());
    renderSelectedZone();
    setInterval(()=>{renderSelectedZone();markers.forEach((marker,i)=>{const z=zones[i];marker.setTooltipContent(`<strong>${z[0]}, ${z[1]}</strong><br>${zoneTime(z)} · ${z[2]}<br>${zoneOffset(z)}`);});},1000);
  }

  function initExtraWorldClocks() {
    const select=$('#worldClockCity'),button=$('#addWorldClockButton'),grid=$('#worldClockGrid'); if(!select||!button||!grid)return;
    button.addEventListener('click',()=>{
      const [zone,city,country]=select.value.split('|');
      if([...grid.querySelectorAll('.chronoos-world-time')].some(el=>el.dataset.zone===zone)){ const existing=[...grid.querySelectorAll('.chronoos-world-time')].find(el=>el.dataset.zone===zone);existing.closest('.chronoos-world-card').scrollIntoView({behavior:'smooth',block:'center'});return; }
      const card=document.createElement('article');card.className='dashboard-card chronoos-world-card';
      const label=document.createElement('span');label.textContent=country.toUpperCase();
      const title=document.createElement('h2');title.textContent=city;
      const zoneName=document.createElement('p');zoneName.textContent=zone;
      const time=document.createElement('strong');time.className='chronoos-world-time';time.dataset.zone=zone;time.textContent='--:--:--';
      const remove=document.createElement('button');remove.type='button';remove.className='secondary-button world-clock-remove';remove.textContent='Remove city';remove.addEventListener('click',()=>card.remove());
      card.append(label,title,zoneName,time,remove);grid.appendChild(card);updateWorldTimes();
    });
  }
  function updateWorldTimes(){ $$('.chronoos-world-time').forEach(el=>{try{el.textContent=new Intl.DateTimeFormat('en-US',{timeZone:el.dataset.zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date());}catch{el.textContent='Invalid time zone';}}); }

  // Public holiday list from Nager.Date API; clear error feedback if offline/unavailable.
  async function loadHolidays() {
    const country = $('#holidayCountry')?.value || 'IN';
    const year = $('#holidayYear')?.value || String(new Date().getFullYear());
    const list = $('#holidayList'); const status = $('#holidayStatus');
    if (!list || !status) return;
    list.innerHTML = '<div class="dashboard-card holiday-empty">Loading holidays…</div>';
    status.textContent = `Loading ${year} public holidays…`;
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${encodeURIComponent(year)}/${encodeURIComponent(country)}`);
      if (!response.ok) throw new Error(`Holiday service returned ${response.status}`);
      const holidays = await response.json();
      holidays.sort((a,b)=>a.date.localeCompare(b.date));
      if (!holidays.length) { list.innerHTML='<div class="dashboard-card holiday-empty">No holidays were returned for this selection.</div>'; status.textContent='No holiday entries found.'; return; }
      list.innerHTML = '';
      holidays.forEach(holiday => {
        const date = new Date(`${holiday.date}T12:00:00`);
        const card = document.createElement('article'); card.className='dashboard-card holiday-item';
        const dateBox=document.createElement('div');dateBox.className='holiday-date';
        const day=document.createElement('span');day.textContent=String(date.getDate()).padStart(2,'0');
        const month=document.createElement('small');month.textContent=date.toLocaleDateString('en-US',{month:'short'}).toUpperCase();dateBox.append(day,month);
        const details=document.createElement('div');const title=document.createElement('h3');title.textContent=holiday.localName || holiday.name;
        const sub=document.createElement('p');sub.textContent=`${date.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}${holiday.global ? ' · Nationwide' : ' · Regional'}`;
        details.append(title,sub);card.append(dateBox,details);list.appendChild(card);
      });
      status.textContent=`${holidays.length} holidays found for ${year}. Dates may vary by regional observance.`;
    } catch (error) {
      const india2026 = [
        ['2026-01-26','Republic Day'],['2026-03-04','Holi'],['2026-03-21','Eid-ul-Fitr (estimated)'],
        ['2026-04-03','Good Friday'],['2026-08-15','Independence Day'],['2026-09-04','Janmashtami'],
        ['2026-10-02','Gandhi Jayanti'],['2026-10-20','Dussehra'],['2026-11-08','Diwali'],['2026-12-25','Christmas Day']
      ];
      const fixedByCountry = {
        IN:[['01-26','Republic Day'],['08-15','Independence Day'],['10-02','Gandhi Jayanti'],['12-25','Christmas Day']],
        US:[['01-01','New Year’s Day'],['07-04','Independence Day'],['11-11','Veterans Day'],['12-25','Christmas Day']],
        GB:[['01-01','New Year’s Day'],['12-25','Christmas Day'],['12-26','Boxing Day']],
        JP:[['01-01','New Year’s Day'],['02-11','National Foundation Day'],['02-23','Emperor’s Birthday'],['11-03','Culture Day'],['11-23','Labor Thanksgiving Day']],
        AU:[['01-01','New Year’s Day'],['01-26','Australia Day'],['04-25','Anzac Day'],['12-25','Christmas Day'],['12-26','Boxing Day']],
        CA:[['01-01','New Year’s Day'],['07-01','Canada Day'],['11-11','Remembrance Day'],['12-25','Christmas Day']],
        DE:[['01-01','New Year’s Day'],['05-01','Labour Day'],['10-03','German Unity Day'],['12-25','Christmas Day'],['12-26','Second Day of Christmas']],
        FR:[['01-01','New Year’s Day'],['05-01','Labour Day'],['07-14','Bastille Day'],['11-11','Armistice Day'],['12-25','Christmas Day']],
        SG:[['01-01','New Year’s Day'],['05-01','Labour Day'],['08-09','National Day'],['12-25','Christmas Day']]
      };
      const fallback = country==='IN' && year==='2026' ? india2026 : (fixedByCountry[country]||[]).map(([md,name])=>[`${year}-${md}`,name]);
      if (fallback.length) {
        list.innerHTML='';
        fallback.forEach(([iso,name])=>{
          const date=new Date(`${iso}T12:00:00`);
          const card=document.createElement('article');card.className='dashboard-card holiday-item';
          const dateBox=document.createElement('div');dateBox.className='holiday-date';
          const day=document.createElement('span');day.textContent=String(date.getDate()).padStart(2,'0');
          const month=document.createElement('small');month.textContent=date.toLocaleDateString('en-US',{month:'short'}).toUpperCase();dateBox.append(day,month);
          const details=document.createElement('div');const title=document.createElement('h3');title.textContent=name;
          const sub=document.createElement('p');sub.textContent=date.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+' · India (offline reference)';
          details.append(title,sub);card.append(dateBox,details);list.appendChild(card);
        });
        status.textContent='Showing a small offline reference list. Dates for some festivals may vary; reconnect for an authoritative full list.';
      } else {
        list.innerHTML = '<div class="dashboard-card holiday-empty"><strong>Live holiday data could not be reached.</strong><p>Check your internet connection and try again. A limited offline list of commonly observed fixed-date holidays is available for this country.</p></div>';
        status.textContent = 'Holiday data service unavailable — showing offline data where available.';
      }
    }
  }
  function initHolidays() { const button=$('#loadHolidaysButton'); if(!button)return;button.addEventListener('click',loadHolidays);$('#holidayCountry').addEventListener('change',loadHolidays);$('#holidayYear').addEventListener('change',loadHolidays);loadHolidays(); }

  document.addEventListener('DOMContentLoaded', () => { initFocus(); initMap(); initExtraWorldClocks(); initHolidays(); updateWorldTimes(); setInterval(updateWorldTimes,1000); });
})();

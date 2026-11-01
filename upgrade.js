/* ChronoOS feature upgrade: alarms, sounds, world clocks, laps, fullscreen. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readAlarms = () => {
    try { const value = JSON.parse(localStorage.getItem('chronoosAlarms') || '[]'); return Array.isArray(value) ? value.map(a => ({...a, days: Array.isArray(a.days) ? a.days : [], sound: a.sound || 'classic', snoozeMinutes: Number(a.snoozeMinutes || 5), active: a.active !== false})).filter(a => a.time) : []; }
    catch { return []; }
  };
  // Keep the existing app's global alarm collection in sync with saved alarms.
  try { alarms = readAlarms(); } catch {}
  let editingAlarmId = null;
  let ringingAlarm = null;
  let ringInterval = null;
  let ringContext = null;
  let ringCard = null;
  let previewContext = null;
  const fired = new Set();

  function persistAlarms() {
    localStorage.setItem('chronoosAlarms', JSON.stringify(alarms));
    if (typeof updateAlarmCount === 'function') updateAlarmCount();
    if (typeof updateNextAlarm === 'function') updateNextAlarm();
    renderAlarms();
  }
  function stopTone(context = ringContext) {
    if (context) { try { context.close(); } catch {} }
    if (context === ringContext) { ringContext = null; if (ringInterval) clearInterval(ringInterval); ringInterval = null; }
  }
  function tone(context, sound, duration = 0.34) {
    if (!context || context.state === 'closed') return;
    // Each sound has its own rhythm, notes, waveform and envelope so previews
    // remain recognizably different instead of sharing the same short beep.
    const motifs = {
      classic: { notes:[880,660,880,660], gap:0.16, wave:'square', length:0.12, volume:0.075 },
      piano:   { notes:[523.25,659.25,783.99,1046.5], gap:0.23, wave:'triangle', length:0.28, volume:0.16 },
      digital: { notes:[1200,0,880,0,1320,0,990], gap:0.11, wave:'square', length:0.075, volume:0.055 },
      gentle:  { notes:[523.25,587.33,659.25,783.99], gap:0.28, wave:'sine', length:0.4, volume:0.12 }
    };
    const motif = motifs[sound] || motifs.classic;
    motif.notes.forEach((frequency, index) => {
      if (!frequency) return;
      const startAt = context.currentTime + index * motif.gap;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = motif.wave;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      if (sound === 'gentle') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.12, startAt + motif.length * .7);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(motif.volume, startAt + .018);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + motif.length);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(startAt); oscillator.stop(startAt + motif.length + .025);
    });
  }
  function playSoundPreview(sound) {
    try {
      if (previewContext) { try { previewContext.close(); } catch {} previewContext = null; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return alert('Audio preview is not supported by this browser.');
      previewContext = new AC();
      const ctx = previewContext;
      ctx.resume().then(() => {
        tone(ctx, sound);
        // A second phrase gives the preview enough length to compare tones.
        const interval = setInterval(() => {
          if (ctx.state === 'closed') { clearInterval(interval); return; }
          tone(ctx, sound);
        }, sound === 'piano' || sound === 'gentle' ? 1250 : 850);
        setTimeout(() => { clearInterval(interval); try { ctx.close(); } catch {} if (previewContext === ctx) previewContext = null; }, 3500);
      });
    } catch (error) { console.warn('Sound preview failed', error); }
  }

  // Replace the existing alarm dialog with a richer version.
  window.createAlarmModal = function createAlarmModal() {
    if ($('#alarmModal')) return;
    const modal = document.createElement('div'); modal.id = 'alarmModal';
    modal.innerHTML = `<div class="alarm-modal-overlay"><div class="alarm-modal chronoos-upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgradeAlarmTitle">
      <div class="alarm-modal-header"><div><p class="card-label">CHRONOOS / ALARMS</p><h2 id="upgradeAlarmTitle">Create an alarm</h2></div><button class="alarm-close" id="closeAlarmModal" aria-label="Close">×</button></div>
      <label>Alarm time<input type="time" id="alarmTimeInput" required></label>
      <label>Label<input type="text" id="alarmLabelInput" maxlength="70" placeholder="Morning study, class, workout…"></label>
      <div class="upgrade-field"><span>Repeat</span><div class="weekday-picker">${days.map((d,i)=>`<label><input type="checkbox" value="${i}" class="alarm-day"><span>${d}</span></label>`).join('')}</div><small>Leave every day unchecked for a one-time alarm.</small></div>
      <div class="upgrade-sound-row"><label>Alarm sound<select id="alarmSoundInput"><option value="classic">Classic beep</option><option value="piano">Piano tones</option><option value="digital">Digital</option><option value="gentle">Gentle chime</option></select></label><button type="button" class="secondary-button" id="previewAlarmSound">▶ Preview</button></div>
      <label>Snooze duration<select id="alarmSnoozeInput"><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label>
      <div class="alarm-modal-actions"><button class="secondary-button" id="cancelAlarm">Cancel</button><button class="primary-button" id="saveAlarm">Save alarm</button></div>
    </div></div>`;
    document.body.appendChild(modal);
    $('#closeAlarmModal').addEventListener('click', window.closeAlarmModal);
    $('#cancelAlarm').addEventListener('click', window.closeAlarmModal);
    $('#previewAlarmSound').addEventListener('click', () => playSoundPreview($('#alarmSoundInput').value));
    $('#saveAlarm').addEventListener('click', () => window.addNewAlarm());
    $('#alarmTimeInput').addEventListener('keydown', e => { if (e.key === 'Enter') window.addNewAlarm(); });
  };
  window.addNewAlarm = function addNewAlarm() {
    const time = $('#alarmTimeInput')?.value;
    const label = $('#alarmLabelInput')?.value.trim() || 'Alarm';
    if (!time) { alert('Please select an alarm time.'); return; }
    const selectedDays = $$('.alarm-day:checked').map(input => Number(input.value));
    const fields = {time, label, days: selectedDays, sound: $('#alarmSoundInput').value, snoozeMinutes: Number($('#alarmSnoozeInput').value)};
    if (editingAlarmId !== null) {
      const existing = alarms.find(a => String(a.id) === String(editingAlarmId));
      if (existing) Object.assign(existing, fields);
      editingAlarmId = null;
      $('#upgradeAlarmTitle').textContent = 'Create an alarm';
      $('#saveAlarm').textContent = 'Save alarm';
    } else {
      alarms.push({id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), ...fields, active: true, createdAt: Date.now()});
    }
    persistAlarms(); window.closeAlarmModal();
    if ($('#alarmLabelInput')) $('#alarmLabelInput').value = '';
  };
  window.openAlarmModal = function openAlarmModal() { window.createAlarmModal(); $('#alarmModal').style.display = 'flex'; $('#alarmTimeInput').focus(); };
  window.closeAlarmModal = function closeAlarmModal() { const modal = $('#alarmModal'); if (modal) modal.style.display = 'none'; editingAlarmId = null; const title=$('#upgradeAlarmTitle'); if(title)title.textContent='Create an alarm'; const save=$('#saveAlarm'); if(save)save.textContent='Save alarm'; };

  function nextOccurrence(alarm, now = new Date()) {
    const [h,m] = alarm.time.split(':').map(Number);
    for (let offset = 0; offset <= 7; offset++) {
      const candidate = new Date(now); candidate.setDate(now.getDate() + offset); candidate.setHours(h,m,0,0);
      const weekdayMatches = !alarm.days?.length || alarm.days.includes(candidate.getDay());
      if (weekdayMatches && candidate.getTime() > now.getTime()) return candidate;
    }
    return null;
  }
  function renderAlarms() {
    const list = $('#alarm-list'); if (!list) return;
    list.innerHTML = '';
    if (!alarms.length) { list.innerHTML = '<p class="upgrade-empty">No alarms yet. Create your first alarm above.</p>'; return; }
    alarms.slice().sort((a,b) => (nextOccurrence(a)?.getTime() || Infinity) - (nextOccurrence(b)?.getTime() || Infinity)).forEach(alarm => {
      const card = document.createElement('article'); card.className = 'upgrade-alarm-item';
      const repeat = alarm.days?.length ? alarm.days.map(d => days[d]).join(' · ') : 'One time';
      const date = nextOccurrence(alarm); const nextText = date ? `Next: ${dayNames[date.getDay()]} ${date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : 'No upcoming time';
      card.innerHTML = `<div class="upgrade-alarm-main"><div class="upgrade-alarm-bell">◷</div><div><div class="upgrade-alarm-time">${escapeHTML(formatClock(alarm.time))}</div><h3>${escapeHTML(alarm.label || 'Alarm')}</h3><p>${escapeHTML(repeat)} · ${escapeHTML(nextText)}</p><small>${escapeHTML((alarm.sound || 'classic').replace(/^./, c=>c.toUpperCase()))} sound · Snooze ${Number(alarm.snoozeMinutes || 5)} min</small></div></div><div class="upgrade-alarm-actions"><label class="upgrade-toggle" title="Enable alarm"><input type="checkbox" data-alarm-toggle="${escapeHTML(alarm.id)}" ${alarm.active ? 'checked' : ''}><span></span></label><button class="icon-button" data-alarm-edit="${escapeHTML(alarm.id)}" aria-label="Edit alarm">✎</button><button class="icon-button" data-alarm-delete="${escapeHTML(alarm.id)}" aria-label="Delete alarm">×</button></div>`;
      list.appendChild(card);
    });
    list.querySelectorAll('[data-alarm-toggle]').forEach(el => el.addEventListener('change', () => { const a=alarms.find(x=>String(x.id)===el.dataset.alarmToggle); if(a){a.active=el.checked;persistAlarms();} }));
    list.querySelectorAll('[data-alarm-delete]').forEach(el => el.addEventListener('click', () => { alarms=alarms.filter(a=>String(a.id)!==el.dataset.alarmDelete); persistAlarms(); }));
    list.querySelectorAll('[data-alarm-edit]').forEach(el => el.addEventListener('click', () => {
      const a=alarms.find(x=>String(x.id)===el.dataset.alarmEdit); if(!a)return;
      window.createAlarmModal(); editingAlarmId = a.id; $('#alarmTimeInput').value=a.time; $('#alarmLabelInput').value=a.label || ''; $('#alarmSoundInput').value=a.sound || 'classic'; $('#alarmSnoozeInput').value=String(a.snoozeMinutes || 5); $$('.alarm-day').forEach(box=>box.checked=(a.days||[]).includes(Number(box.value))); $('#upgradeAlarmTitle').textContent='Edit alarm'; $('#saveAlarm').textContent='Update alarm';
      $('#alarmModal').style.display='flex';
    }));
  }
  function formatClock(time) { const [h,m]=time.split(':').map(Number); return `${String(h%12||12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`; }
  window.renderAlarmPage = renderAlarms;
  window.refreshAlarmPage = renderAlarms;
  window.checkAlarms = function checkAlarms() {
    const now = new Date(); const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    alarms.forEach(alarm => {
      if (!alarm.active || alarm.time !== time || (alarm.days?.length && !alarm.days.includes(now.getDay()))) return;
      const key = `${alarm.id}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${time}`;
      if (fired.has(key)) return; fired.add(key);
      if (!alarm.days?.length) alarm.active = false;
      persistAlarms(); ringAlarm(alarm);
    });
  };
  function ringAlarm(alarm) {
    stopRinging(); ringingAlarm = alarm;
    if (window.chronoosSoundEnabled !== false) {
      const AC=window.AudioContext||window.webkitAudioContext;
      try { if(AC){ringContext=new AC();ringContext.resume();tone(ringContext,alarm.sound||'classic');const repeatEvery=['piano','gentle'].includes(alarm.sound)?1400:850;ringInterval=setInterval(()=>tone(ringContext,alarm.sound||'classic'),repeatEvery);} } catch(e){console.warn(e);}
    }
    const overlay=document.createElement('div');overlay.className='chronoos-ring-overlay';overlay.innerHTML=`<div class="chronoos-ring-panel"><div class="chronoos-ring-icon">🔔</div><p>CHRONOOS ALARM</p><h2>${escapeHTML(alarm.label||'Alarm')}</h2><strong>${escapeHTML(formatClock(alarm.time))}</strong><p>Time to get moving.</p><div class="chronoos-ring-actions"><button class="secondary-button" data-snooze> snooze ${Number(alarm.snoozeMinutes||5)} min</button><button class="primary-button" data-stop>Stop alarm</button></div></div>`;document.body.appendChild(overlay);ringCard=overlay;
    overlay.querySelector('[data-stop]').addEventListener('click',stopRinging);
    overlay.querySelector('[data-snooze]').addEventListener('click',()=>{const minutes=Number(alarm.snoozeMinutes||5);stopRinging();setTimeout(()=>ringAlarm({...alarm,label:`${alarm.label||'Alarm'} (Snoozed)`,days:[]}),minutes*60000);});
    if (navigator.vibrate) navigator.vibrate([500,250,500,250,700]);
    if(window.chronoosNotificationsEnabled && 'Notification' in window && Notification.permission==='granted') new Notification('ChronoOS alarm',{body:alarm.label||'Alarm'});
  }
  function stopRinging(){stopTone();ringingAlarm=null;if(ringCard){ringCard.remove();ringCard=null;}if(navigator.vibrate)navigator.vibrate(0);}

  function updateWorldClocks() {
    const zones=[['🇮🇳 Hyderabad','Asia/Kolkata','IST'],['🇬🇧 London','Europe/London','UK'],['🇺🇸 New York','America/New_York','ET'],['🇯🇵 Tokyo','Asia/Tokyo','JST']];
    $$('.world-time').forEach((row,i)=>{const z=zones[i % zones.length];const b=$('b',row);if(b)b.textContent=new Intl.DateTimeFormat('en-US',{timeZone:z[1],hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date());const span=$('span',row);if(span)span.textContent=z[2];});
    $$('.chronoos-world-time').forEach(el=>{el.textContent=new Intl.DateTimeFormat('en-US',{timeZone:el.dataset.zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date());});
  }
  function installFullscreenButton() {
    const target=$('.topbar-actions');if(!target||$('#chronoosFullscreen'))return;
    const button=document.createElement('button');button.id='chronoosFullscreen';button.className='icon-button';button.title='Toggle fullscreen clock';button.setAttribute('aria-label','Toggle fullscreen');button.textContent='⛶';button.addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{alert('Fullscreen is not available in this browser window.');}});target.prepend(button);
  }
  function installStopwatchLaps() {
    const display=$('#stopwatchElapsedDisplay');if(!display||$('#chronoosLapButton'))return;
    const actions=display.parentElement.querySelector('.timer-actions');if(!actions)return;
    const lapButton=document.createElement('button');lapButton.id='chronoosLapButton';lapButton.className='icon-button';lapButton.textContent='Lap';actions.appendChild(lapButton);
    const laps=document.createElement('ol');laps.id='chronoosLapList';laps.className='chronoos-lap-list';actions.after(laps);let last=0,number=0;
    lapButton.addEventListener('click',()=>{const match=display.textContent.trim().match(/^(\d+):(\d+):(\d+)$/);if(!match)return;const total=Number(match[1])*3600+Number(match[2])*60+Number(match[3]);if(total===0)return;const lap=total-last;last=total;number++;const li=document.createElement('li');li.textContent=`Lap ${number} · ${formatSeconds(lap)} (total ${formatSeconds(total)})`;laps.prepend(li);});
    const reset=$('#resetStopwatch');if(reset)reset.addEventListener('click',()=>{last=0;number=0;laps.innerHTML='';});
  }
  function formatSeconds(s){return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
  function installTimerPresets(){const area=$('.timer-page-layout .timer-actions');if(!area||area.dataset.upgraded)return;area.dataset.upgraded='1';[1,25,60].forEach(min=>{const b=document.createElement('button');b.className='icon-button timer-preset';b.textContent=`${min} Min`;b.dataset.minutes=String(min);b.addEventListener('click',()=>{const h=$('#timerHours'),m=$('#timerMinutes'),s=$('#timerSeconds');if(!h||!m||!s)return;h.value=String(Math.floor(min/60));m.value=String(min%60);s.value='0';$('#timerCountdownDisplay').textContent=formatSeconds(min*60);$('#timerStatus').textContent='Preset selected. Press Start when ready.';});area.appendChild(b);});}
  function loadTheme(){try{const saved=JSON.parse(localStorage.getItem('chronoosSettings')||'{}');if(saved.darkMode===false)document.body.dataset.theme='light';else document.body.dataset.theme='dark';const toggle=$('#darkModeSetting');if(toggle)toggle.checked=saved.darkMode!==false;}catch{}}
  document.addEventListener('DOMContentLoaded',()=>{
    renderAlarms(); updateWorldClocks();setInterval(updateWorldClocks,1000);installFullscreenButton();installStopwatchLaps();installTimerPresets();loadTheme();
    // Persist the current appearance toggle immediately as well as through Save Preferences.
    const dark=$('#darkModeSetting');if(dark)dark.addEventListener('change',()=>{document.body.dataset.theme=dark.checked?'dark':'light';try{const s=JSON.parse(localStorage.getItem('chronoosSettings')||'{}');s.darkMode=dark.checked;localStorage.setItem('chronoosSettings',JSON.stringify(s));}catch{}});
    const add=$('#openAlarmPageButton');if(add)add.addEventListener('click',window.openAlarmModal);
    const timerStart=$('#startTimerButton');if(timerStart)timerStart.addEventListener('click',()=>{const total=Number($('#timerHours').value)*3600+Number($('#timerMinutes').value)*60+Number($('#timerSeconds').value);if(total>0){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC&&window.chronoosSoundEnabled!==false){const ctx=new AC();ctx.resume();window.chronoosTimerAudio=ctx;}}catch{}}});
  });
})();

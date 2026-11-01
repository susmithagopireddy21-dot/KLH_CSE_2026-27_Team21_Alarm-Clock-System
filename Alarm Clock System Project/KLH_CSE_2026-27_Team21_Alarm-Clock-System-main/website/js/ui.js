/* AClock interface fixes: theme, sensible navigation and scroll-wheel time fields. */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  function initTheme() {
    const button=$('#themeToggle');
    const saved=localStorage.getItem('aclockTheme');
    if(saved==='light') document.body.classList.add('light-mode');
    const paint=()=>{ if(!button)return; const light=document.body.classList.contains('light-mode'); button.innerHTML=`<i class="fa-solid fa-${light?'moon':'sun'}"></i>`; button.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode'); button.title=light?'Switch to dark mode':'Switch to light mode'; };
    paint();
    button?.addEventListener('click',()=>{document.body.classList.toggle('light-mode');localStorage.setItem('aclockTheme',document.body.classList.contains('light-mode')?'light':'dark');paint();});
  }
  function initWheelTimeFields() {
    $$('input[type="number"][min][max]').forEach(input=>{
      input.addEventListener('wheel',event=>{
        if(document.activeElement!==input)return;
        event.preventDefault();
        const min=Number(input.min||0),max=Number(input.max||999),step=Number(input.step||1);
        let value=Number(input.value||0)+(event.deltaY<0?step:-step);
        if(input.id.toLowerCase().includes('hour')) value=Math.max(min,Math.min(max,value));
        else value=Math.max(min,Math.min(max,value));
        input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
      },{passive:false});
    });
  }
  function initMapMarkers() {
    const svg=$('.timezone-svg'); if(!svg || svg.querySelector('.city-marker'))return;
    const markers=[
      {name:'Los Angeles',zone:'America/Los_Angeles',x:150,y:125},{name:'New York',zone:'America/New_York',x:250,y:118},
      {name:'London',zone:'Europe/London',x:470,y:96},{name:'Dubai',zone:'Asia/Dubai',x:570,y:145},
      {name:'Hyderabad',zone:'Asia/Kolkata',x:620,y:155},{name:'Tokyo',zone:'Asia/Tokyo',x:760,y:130},
      {name:'Sydney',zone:'Australia/Sydney',x:790,y:250}
    ];
    const ns='http://www.w3.org/2000/svg';
    markers.forEach(m=>{
      const g=document.createElementNS(ns,'g');g.setAttribute('class','city-marker');g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',m.name+' local time');
      const c=document.createElementNS(ns,'circle');c.setAttribute('cx',m.x);c.setAttribute('cy',m.y);c.setAttribute('r','6');c.setAttribute('class','city-dot');
      const t=document.createElementNS(ns,'title');t.textContent=m.name;g.append(c,t);svg.appendChild(g);
      const show=()=>{const tip=$('#timezoneHoverTip');if(!tip)return;const now=new Intl.DateTimeFormat('en-GB',{timeZone:m.zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date());tip.querySelector('strong').textContent=m.name;tip.querySelector('span').textContent=now+' · '+m.zone;tip.classList.add('visible');const map=$('.timezone-map');tip.style.left=Math.min(map.clientWidth-190,Math.max(8,m.x/svg.viewBox.baseVal.width*map.clientWidth+10))+'px';tip.style.top=Math.min(map.clientHeight-70,Math.max(8,m.y/svg.viewBox.baseVal.height*map.clientHeight+8))+'px';};
      g.addEventListener('pointerenter',show);g.addEventListener('focus',show);g.addEventListener('click',show);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});
    });
  }
  function goToPage(name) {
    const nav=$(`[data-page="${name}"]`);
    if(nav) nav.click();
  }
  function initDashboardActions() {
    const add= document.querySelector('[data-dashboard-page="dashboard"] .next-alarm .primary-button');
    add?.addEventListener('click',()=>goToPage('alarms'));
    document.querySelector('.focus-button')?.addEventListener('click',()=>goToPage('focus'));
    document.querySelectorAll('.tool-card').forEach(button=>{
      const label=(button.textContent||'').toLowerCase();
      button.addEventListener('click',()=>goToPage(label.includes('stopwatch')?'stopwatch':label.includes('countdown')||label.includes('timer')?'timer':label.includes('reminder')?'reminders':'alarms'));
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{initTheme();initWheelTimeFields();initMapMarkers();initDashboardActions();});
})();

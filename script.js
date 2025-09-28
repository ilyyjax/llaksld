// Seeded values & simulation
const birthsPerSecond = 4.189;
const globalFertilityRate = 2.2;
const worldPopulation = 8.2e9;
const femalePct = 49.72 / 100;
const initialWomen = Math.round(worldPopulation * femalePct);
const condomMarketLower = 5.79;
const condomMarketHigher = 11.59;

const secondsWindow = 60;
let babiesTotal = 0;
let condomPrice = 0.8;
let womenTotal = initialWomen;
const condomVolatility = 0.005;
const womenAnnualGrowth = 0.008;
const womenPerSecond = (womenTotal * womenAnnualGrowth) / (365*24*3600);

// ---------- Helpers
function formatNumber(n){ if(n>=1e9) return (n/1e9).toFixed(2)+' B'; if(n>=1e6) return (n/1e6).toFixed(2)+' M'; if(n>=1e3) return (n/1e3).toFixed(0)+' K'; return Math.round(n).toString();}
function formatCurrency(n){return '$'+n.toFixed(2);}
function buildInitialSeries(value){ const arr=[]; const now=new Date(); for(let i=secondsWindow-1;i>=0;i--){arr.push({t:new Date(now.getTime()-i*1000).toLocaleTimeString(), v:value})} return arr;}
function createChart(id,label,color,data){
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx,{
    type:"line",
    data:{labels:data.map(d=>d.t), datasets:[{label,data:data.map(d=>d.v),borderColor:color,backgroundColor:color+"33",fill:true,tension:0.3,pointRadius:0,borderWidth:2}]},
    options:{animation:{duration:600,easing:'easeOutQuart'},responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}, tooltip:{mode:'index', intersect:false}},scales:{x:{display:false},y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#cfe4f8'}}}}
  });
}

// ---------- Init charts
const babiesChart = createChart("babies-chart","Babies","rgb(124,58,237)", buildInitialSeries(0));
const condomsChart = createChart("condoms-chart","Condom Price","rgb(34,197,94)", buildInitialSeries(condomPrice));
const womenChart = createChart("women-chart","Women","rgb(14,165,233)", buildInitialSeries(womenTotal));

document.getElementById("babies-counter").textContent = formatNumber(babiesTotal);
document.getElementById("condoms-counter").textContent = formatCurrency(condomPrice);
document.getElementById("women-counter").textContent = formatNumber(womenTotal);

// ---------- Side info cards
const infoCol = document.getElementById('info-col');
const infoCards = [
  { title:'Births / sec (2023)', value: birthsPerSecond.toFixed(3), note:'~132,110,264 births in 2023 (UN/UNICEF)' },
  { title:'Global fertility rate', value: globalFertilityRate+' children/woman', note:'UN estimate (2024)' },
  { title:'Estimated women in world', value: formatNumber(initialWomen), note:'~49.72% of ~8.2B (2024)' },
  { title:'Condom market (examples)', value:`$${condomMarketLower}B — $${condomMarketHigher}B`, note:'Market reports (sources vary)' }
];
infoCards.forEach(c => {
  const el=document.createElement('div'); el.className='info-card';
  el.innerHTML=`<h4>${c.title}</h4><div class="value">${c.value}</div><div class="small" style="color:var(--muted); margin-top:6px; font-size:12px">${c.note}</div>`;
  infoCol.appendChild(el);
});

// ---------- Live update
function push(chart,label,value){ chart.data.labels.push(label); chart.data.datasets[0].data.push(value); if(chart.data.labels.length>secondsWindow){ chart.data.labels.shift(); chart.data.datasets[0].data.shift(); } chart.update(); }
setInterval(()=>{
  const time=new Date().toLocaleTimeString();
  babiesTotal+=birthsPerSecond; document.getElementById('babies-counter').textContent=formatNumber(Math.floor(babiesTotal)); push(babiesChart,time,Math.floor(babiesTotal));
  const shock=(Math.random()-0.5)*condomVolatility*2; condomPrice=Math.max(0.05,condomPrice*(1+shock)); document.getElementById('condoms-counter').textContent=formatCurrency(condomPrice); push(condomsChart,time,condomPrice);
  womenTotal+=womenPerSecond; document.getElementById('women-counter').textContent=formatNumber(Math.floor(womenTotal)); push(womenChart,time,Math.floor(womenTotal));
},1000);

// ---------- Tabs (fade transition without shifting)
const tabs=document.querySelectorAll('.tab');
tabs.forEach(t => t.addEventListener('click', e=>{
  tabs.forEach(x=>x.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const target=e.currentTarget.dataset.tab;
  document.querySelectorAll('.panel').forEach(p=>{
    if(p.id===target){ p.classList.add('active'); p.removeAttribute('aria-hidden'); p.style.opacity='1';
      if(target==='babies'){ babiesChart.resize(); babiesChart.update(); }
      if(target==='condoms'){ condomsChart.resize(); condomsChart.update(); }
      if(target==='women'){ womenChart.resize(); womenChart.update(); }
    } else { p.classList.remove('active'); p.setAttribute('aria-hidden','true'); p.style.opacity='0'; }
  });
}));

// ---------- Start overlay
const startOverlay=document.getElementById('start-overlay');
document.getElementById('enter-btn').addEventListener('click',()=>{
  startOverlay.style.transition='opacity .6s ease';
  startOverlay.style.opacity='0';
  setTimeout(()=>startOverlay.remove(),650);
  ['babies','condoms','women'].forEach((id,idx)=>{
    const p=document.getElementById(id); p.style.opacity='0';
    setTimeout(()=>{p.style.opacity='1'; if(id==='babies') babiesChart.resize(); if(id==='condoms') condomsChart.resize(); if(id==='women') womenChart.resize();}, 300+idx*140);
  });
});

// Resize safety
window.addEventListener('resize',()=>{ babiesChart.resize(); condomsChart.resize(); womenChart.resize(); });

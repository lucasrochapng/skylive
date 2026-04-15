let lat=0, lon=0;
let sunrise=6, sunset=18;
let weatherCode=0, temperature=0;

navigator.geolocation.getCurrentPosition(async pos=>{
  lat=pos.coords.latitude;
  lon=pos.coords.longitude;
  await getSunTimes();
  getWeather();
  getCity();
});

async function getCity(){
  const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
  const d=await res.json();
  document.getElementById('city').innerText=`${d.address.city||d.address.town} - ${d.address.state}`;
}

async function getSunTimes(){
  const res=await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
  const d=await res.json();
  sunrise=new Date(d.results.sunrise).getUTCHours()-3;
  sunset=new Date(d.results.sunset).getUTCHours()-3;
}

async function getWeather(){
  const res=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  const d=await res.json();
  weatherCode=d.current_weather.weathercode;
  temperature=d.current_weather.temperature;

  document.getElementById('weather').innerText=getWeatherText(weatherCode);
  document.getElementById('temp').innerText=`🌡️ ${temperature}°C`;

  updateRain();
  updateSound();
}

function getWeatherText(c){
  if(c===0)return'☀️ Limpo';
  if(c<3)return'🌤️ Parcial';
  if(c<50)return'☁️ Nublado';
  if(c<70)return'🌧️ Chuva';
  return'⛈️ Tempestade';
}

function updateRain(){
  const rain=document.getElementById('rain');
  rain.innerHTML='';
  if(weatherCode>=50){
    for(let i=0;i<120;i++){
      const d=document.createElement('div');
      d.className='drop';
      d.style.left=Math.random()*100+'vw';
      d.style.animationDuration=(0.4+Math.random())+'s';
      rain.appendChild(d);
    }
  }
}

function updateSound(){
  const rainSound=document.getElementById('rainSound');
  if(weatherCode>=50) rainSound.play(); else rainSound.pause();
}

setInterval(()=>{
  if(weatherCode>=95){
    const l=document.getElementById('lightning');
    const t=document.getElementById('thunderSound');
    l.style.opacity=0.8;
    t.currentTime=0;
    t.play();
    setTimeout(()=>l.style.opacity=0,100);
  }
},4000);

function getMoonPhaseIndex(){
  const now=new Date();
  const lp=2551443;
  const newMoon=new Date(1970,0,7,20,35,0);
  const phase=((now-newMoon)/1000)%lp;
  return Math.floor((phase/lp)*8);
}

function updateMoonPhase(){
  const idx=getMoonPhaseIndex()+1;
  document.getElementById('moon').src=`img/moon-phases/moon${idx}.png`;
}

function getHourFloat(){
  const now=new Date();
  const p=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'numeric',minute:'numeric',second:'numeric',hour12:false}).formatToParts(now);
  return +p[0].value + p[2].value/60 + p[4].value/3600;
}

function updateSky(hour){
  let t= (hour>=sunrise && hour<=sunset) ? (hour-sunrise)/(sunset-sunrise) : 0;
  let color = t===0 ? '#020617' : `hsl(${210-t*30},70%,${20+t*60}%)`;
  document.getElementById('sky').style.background=color;
}

function updateSunMoon(hour){
  const sun=document.getElementById('sun');
  const moon=document.getElementById('moon');

  const isDay=hour>=sunrise&&hour<=sunset;
  let p=isDay?(hour-sunrise)/(sunset-sunrise):(hour>=sunset?hour-sunset:hour+(24-sunset))/(24-(sunset-sunrise));

  const x=p*window.innerWidth;
  const y=Math.sin(p*Math.PI)*(isDay?300:200);

  if(isDay){
    sun.style.display='block';
    moon.style.display='none';
    sun.style.left=x+'px';
    sun.style.bottom=y+'px';
  }else{
    sun.style.display='none';
    moon.style.display='block';
    moon.style.left=x+'px';
    moon.style.bottom=y+'px';
  }
}

function generateStars(){
  const c=document.getElementById('stars');
  for(let i=0;i<100;i++){
    const s=document.createElement('div');
    s.className='star';
    s.style.width=s.style.height=Math.random()*2+'px';
    s.style.left=Math.random()*100+'vw';
    s.style.top=Math.random()*100+'vh';
    c.appendChild(s);
  }
}

function generateClouds(){
  const c=document.getElementById('clouds');
  for(let i=0;i<5;i++){
    const cl=document.createElement('img');
    cl.src='img/cloud.png';
    cl.className='cloud';
    cl.style.top=Math.random()*60+'vh';
    cl.style.animationDuration=(60+Math.random()*60)+'s';
    c.appendChild(cl);
  }
}

function updateClock(){
  const now=new Date();
  document.getElementById('clock').innerText=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);

  const hour=getHourFloat();
  updateSky(hour);
  updateSunMoon(hour);
  updateMoonPhase();
}

setInterval(updateClock,1000);
setInterval(getWeather,60000);

generateStars();
generateClouds();
updateClock();
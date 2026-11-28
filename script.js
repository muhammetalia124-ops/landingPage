/* Çevrimdışı çalışma: service worker kaydı */
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

(()=>{
const MOB=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const P=[
{k:'HAKKIMDA',t:'CV & Profil',s:'Eğitim · Deneyim · Teknolojiler',c:'#ffb347',ic:0,ch:['C#','ASP.NET Core','SQL Server'],cta:'Profili görüntüle'},
{k:'CANLI DEMO',t:'Çalışan Projeler',s:'Canlı demolar ve proje detayları',c:'#7dd3fc',ic:1,live:1,ch:['Integration Hub','REST API','JWT'],cta:'Projeleri incele'},
{k:'AÇIK KAYNAK',t:'GitHub',s:'Kaynak kodları ve depolar',c:'#86efac',ic:2,ch:['2 proje','Açık kaynak','muhammetalia124-ops'],cta:'Depoları görüntüle'}];
const $=id=>document.getElementById(id);
const M='https://mail.google.com/mail/?view=cm&fs=1&to=aydemirmuhammetali5@gmail.com',GH='https://github.com/muhammetalia124-ops',HUB='https://integrationhub-y0m3.onrender.com';
const A_=(h,t)=>`<a class="b" href="${h.replace(/&/g,'&amp;')}" target="_blank" rel="noopener">${t}</a>`;
const GO=(g,t)=>`<button class="b" data-go="${g}">${t}</button>`;
const tg=l=>l.map(x=>`<span class="tg">${x}</span>`).join('');
const cd=(n,t,d)=>`<div class="cd"><small>${n}</small><h3>${t}</h3><p>${d}</p></div>`;
const gp=(n,t,l)=>`<div class="cd"><small>${n}</small><h3>${t}</h3>${tg(l)}</div>`;
const li=(a,b)=>`<li><b>${a}:</b> ${b}</li>`;
const PG=[
`<small class="ey">YAZILIM GELİŞTİRİCİ · BACKEND &amp; WEB</small><h2>Merhaba, ben Muhammet Ali.</h2><p class="ld">Fikirleri çalışan ürünlere dönüştürmeyi seven bir yazılım geliştiriciyim.</p><p>Web geliştirme, API’ler ve yeni şeyler öğrenmek üzerine çalışıyorum. Şu anda Efor.ai’de staj yapıyor, her gün daha iyisini üretmeye odaklanıyorum.</p><p>${tg(['⌘ Öğrenerek geliştiriyorum','⌖ Türkiye','&lt;developer /&gt;','{"curious": true}'])}</p><p class="m">BUILDING THINGS ONE LINE AT A TIME</p>
<small class="ey">KISACA BEN</small><h2>Merakla başlar,<br>üreterek devam eder.</h2><p>Yazılım dünyasında sağlam temeller atıyor; öğrendiklerimi gerçek projelerle pekiştiriyorum.</p>
<div class="g">${cd('01 / EĞİTİM','Bilgisayar Programcılığı','Pamukkale Üniversitesi<br>Çivril Atasay Kamer Meslek Yüksekokulu')}${cd('02 / DENEYİM','Gerçek dünyada öğrenme','Efor.ai’de staj yapıyor, yazılım geliştirme süreçlerinde deneyim kazanıyor.')}${cd('03 / DENGE','Üret, hareket et, tekrarla','Yazılım geliştirmenin yanında calisthenics ile disiplinimi ve odağımı besliyorum.')}</div>
<small class="ey">ARAÇ KUTUM</small><h2>Her gün biraz<br>daha fazlası.</h2><p>Projelerimde kullandığım ve geliştirmeye devam ettiğim teknolojiler.</p>
<div class="g">${gp('01','Frontend',['HTML','CSS','JavaScript'])}${gp('02','Backend',['C#','ASP.NET Core','JWT','Entity Framework Core'])}${gp('03','Veri &amp; araçlar',['SQL Server','SQL','REST','Layered Architecture'])}</div>
<div class="row">${A_(M,'E-posta ↗')}${A_(GH,'GitHub ↗')}${GO('h','← Ana sayfaya dön')}</div>`,
`<small class="ey">SEÇİLİ İŞLER</small><h2>Fikirden<br>uygulamaya.</h2>
<div class="cd"><small>BACKEND · WEB API</small><h3>Integration Hub</h3><p class="ld">Monolitik REST API</p><p>${tg(['C#','ASP.NET Core Web API','JWT','SQL Server','Entity Framework Core','Layered Architecture'])}</p><div class="row" style="justify-content:flex-start">${A_(HUB,'Canlı demoyu aç ↗')}${GO(2,'Proje detayları →')}</div></div>
<small class="ey">ÖNE ÇIKANLAR</small><h2>Integration Hub<br>kısaca.</h2>
<div class="g">${cd('01 / VERİ','Tek merkezde toplanır','Döviz kurları, altın fiyatları, hava durumu ve namaz vakitleri farklı dış kaynaklardan alınıp tek yerde sunulur.')}${cd('02 / GÜVENLİK','Oturum ve yetkilendirme','BCrypt ile şifreleme, JWT tabanlı oturum yönetimi ve yönetici paneli.')}${cd('03 / MİMARİ','Dayanıklı ve katmanlı','Çok katmanlı önbellek, yedek kaynak mekanizması ve Docker ile paketlenmiş dağıtım.')}</div>
<div class="row">${GO('h','← Ana sayfaya dön')}</div>`,
`<small class="ey">DENEME, ÖĞRENME, GELİŞTİRME</small><h2>Üzerinde çalıştığım<br>projeler.</h2><p>Her proje yeni bir şey öğrenmek ve öğrendiklerimi çalışan bir ürüne dönüştürmek için bir fırsat.</p><p class="m">02 PROJE · KAYNAK KODLARI AÇIK</p>
<div class="cd"><small>01 · BACKEND / FULL-STACK</small><h3>IntegrationHub — Monolitik REST API</h3><p>Döviz kurları, altın fiyatları, hava durumu ve namaz vakitleri gibi farklı dış kaynaklardan gelen verileri tek bir merkezde toplayan monolitik bir web uygulaması. C# ile geliştirilmiş; JWT ile oturum doğrulama, çok katmanlı önbellekleme ve yedek kaynak mekanizması sunar.</p><p>${tg(['C#','.NET 8','ASP.NET Core Web API','JWT','BCrypt','Entity Framework Core','PostgreSQL','Docker','Layered Architecture'])}</p>
<details><summary>Detaylı açıklamayı gör ▾</summary><p>IntegrationHub, farklı dış kaynaklardan (döviz kurları, altın fiyatları, hava durumu, namaz vakitleri ve ters coğrafi kodlama) alınan verileri tek bir merkezde toplayan, .NET 8 tabanlı bir web uygulamasıdır. Proje; çok katmanlı önbellekleme, yedek kaynak (fallback) mekanizması, yönetici veri yönetimi ve kullanıcı işlem geçmişi ile uçtan uca bir deneyim sunar.</p>
<h3>Uygulamanın Sunduğu Temel Özellikler</h3><ul>${li('Döviz','Türkiye Cumhuriyet Merkez Bankası (TCMB) üzerinden günlük kurları çeker ve TL karşılığı dönüşüm yapar.')}${li('Altın','Birincil kaynak olarak Truncgil Finans verilerini kullanır. Erişim sorunu yaşanırsa uluslararası ons altın fiyatı ve TCMB dolar kuru üzerinden otomatik hesaplama yapan yedek sisteme geçer.')}${li('Hava Durumu','Open-Meteo Geocoding ve Forecast servislerini kullanır; yanıt alınamazsa wttr.in yedek servisine geçer.')}${li('Namaz Vakitleri','Diyanet verileri üzerinden il ve ilçe bazında günlük vakitleri sunar.')}${li('Konum Çözümleme','Tarayıcı koordinatlarını OpenStreetMap Nominatim üzerinden il ve ilçe bilgisine dönüştürür.')}${li('Kullanıcı Hesapları ve İşlem Geçmişi','BCrypt ile şifreleme ve JWT tabanlı oturum yönetimi sayesinde her kullanıcı yaptığı hesaplamaları kişisel geçmişinde görüntüleyebilir; tekrarlı kayıt oluşturmayan (idempotent) yapı sayesinde geçmiş dilediği zaman temizlenebilir.')}${li('Yönetici Paneli ve Veri Ezme (Admin Override)','Yöneticiler kullanıcı hesaplarını yönetebilir, şifre sıfırlayabilir ve ortak veri arşivindeki kayıtları ekleyip güncelleyebilir veya silebilir. Yönetici tarafından düzenlenen günlük kayıtlar dış API güncellemeleriyle ezilmez ve o günkü hesaplamalarda öncelikli kullanılır.')}</ul>
<h3>Teknik Altyapı ve Mimari Yapı</h3><ul>${li('Katmanlı Mimari','Proje, sorumlulukların ayrılması ilkesine göre Domain, Infrastructure ve Web katmanlarına ayrılmıştır. Domain hiçbir katmana bağımlı değildir (EF Core/Npgsql paketi içermez); yalnızca entity, DTO, arayüz ve iş kurallarını barındırır. Infrastructure, dış dünya entegrasyonları ile EF Core, repository ve cache sorumluluğunu üstlenir.')}${li('Modüler Entegrasyon Mimarisi','<code>IIntegrationService</code> arayüzünü uygulayan tüm servisler reflection ile otomatik olarak sisteme kaydedilir ve dinamik form metadata’sı üretir.')}${li('Çok Katmanlı Önbellek ve Günlük Arşiv','Dış API çağrılarını azaltmak ve eşzamanlı isteklerde (cache stampede) dış servisleri korumak için <code>SemaphoreSlim</code> kilitli veritabanı önbelleği kullanılır. Çekilen günlük veriler otomatik olarak ortak veri arşivine (SharedApiData) kaydedilir.')}${li('PostgreSQL ve Dağıtım','Veriler PostgreSQL üzerinde şema bazlı (Auth, Activity, Cache) ayrıştırılmış bir yapıda tutulur. Docker konteyner teknolojisiyle paketlenen uygulama bulut ortamında yayınlanır; açılışta DatabaseInitializer migration’ları uygular ve yönetici yoksa ilk yönetici hesabını oluşturur.')}</ul></details>
<div class="row" style="justify-content:flex-start">${A_(HUB,'Canlı demoyu aç ↗')}${A_(GH+'/integrationHub','Kaynak kodu ↗')}</div></div>
<div class="cd"><small>02 · FRONTEND / WEB</small><h3>Kişisel Portföy Sitesi</h3><p>Kişisel bilgilerimi, kullandığım teknolojileri ve projelerimi tanıtan; farklı ekran boyutlarına uyum sağlayan kişisel web sitesi.</p><p>${tg(['HTML','CSS','JavaScript','Responsive tasarım'])}</p><div class="row" style="justify-content:flex-start">${A_(GH+'/landingPage','Kaynak kodu ↗')}</div></div>
<div class="row">${A_(GH,'GitHub profilimi aç ↗')}${GO('h','← Ana sayfaya dön')}</div>`];
$('nav').innerHTML=P.map((p,i)=>`<button data-go="${i}">${p.t}</button>`).join('')+A_(HUB,'Integration Hub canlı demo')+A_(GH,'GitHub')+A_(M,'E-posta');
if(!window.THREE||!window.gsap){document.body.className='nogl';$('pc').innerHTML=PG.join('<hr>');return}
const cv=$('c');let R;
try{R=new THREE.WebGLRenderer({canvas:cv,powerPreference:'high-performance'})}catch(e){document.body.className='nogl';$('pc').innerHTML=PG.join('<hr>');return}
const maxPr=()=>{const d=window.devicePixelRatio||1;return MOB?Math.min(d,2):Math.min(Math.max(d,2),Math.sqrt(8.3e6/(cv.clientWidth*cv.clientHeight)))};
let pr=maxPr(),asp=1;
const rs=()=>{if(!cv.clientWidth||!cv.clientHeight)return;pr=Math.min(pr,maxPr());R.setPixelRatio(pr);R.setSize(cv.clientWidth,cv.clientHeight,false);asp=cv.clientWidth/cv.clientHeight};rs();
let lw=innerWidth;addEventListener('resize',()=>{if(innerWidth!==lw){lw=innerWidth;rs()}});

/* ---------- Karadelik: tam ekran ray-march (Schwarzschild ışın bükülmesi) ---------- */
const VS='varying vec2 vUv;void main(){vUv=position.xy;gl_Position=vec4(position.xy,0.,1.);}';
const FS=`varying vec2 vUv;uniform vec3 uCam;uniform mat3 uRot;uniform float uT,uAsp,uTan;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
vec3 h33(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
vec3 bb(float t){
vec3 c=mix(vec3(.85,.1,.02),vec3(1.,.45,.08),smoothstep(0.,.3,t));
c=mix(c,vec3(1.,.68,.25),smoothstep(.25,.6,t));
c=mix(c,vec3(1.,.88,.58),smoothstep(.65,1.1,t));
return mix(c,vec3(.78,.88,1.),smoothstep(1.2,1.9,t));}
vec3 sky(vec3 d,float fw){
vec3 c=vec3(0.);
for(int k=0;k<4;k++){
float sc=26.+float(k)*44.,w=min(.1+fw*sc,.34);
vec3 q=d*sc,id=floor(q),f=fract(q)-.5,h=h33(id+float(k)*13.1);
float dd=length(f-(h-.5)*.4),core=1.-smoothstep(0.,w,dd);core*=core;
float mag=h.x*h.x*h.x,on=step(.72+float(k)*.05,h.z);
vec3 st=mix(vec3(.6,.75,1.),vec3(1.,.78,.55),h.y);
c+=st*(core*(.15+3.8*mag)*(.1/w)*(.1/w)+exp(-dd*14.)*.35*mag)*on*(1.-.12*float(k))*(.88+.12*sin(uT*2.+h.x*90.));}
float b=dot(d,normalize(vec3(.3,.85,.35))),nb=fbm(d.xz*5.+d.y*3.);
c+=exp(-b*b*7.)*(.02+.55*nb*nb)*(1.-.6*smoothstep(.48,.68,fbm(d.zy*9.+3.)))*mix(vec3(.38,.42,.8),vec3(.95,.6,.38),nb);
c+=mix(vec3(.55,.12,.4),vec3(.08,.3,.6),fbm(d.zx*1.7))*pow(fbm(d.xy*3.+9.),3.)*.32;
return c;}
void main(){
vec3 rd=normalize(uRot*vec3(vUv.x*uAsp*uTan,vUv.y*uTan,-1.));
vec3 p=uCam,v=rd,cr=cross(p,v);float h2=dot(cr,cr);
vec3 col=vec3(0.),hl=vec3(0.);float tr=1.;bool hit=false;
for(int i=0;i<130;i++){
float r=length(p);
if(r<1.){hit=true;break;}
if(r>80.&&dot(p,v)>0.)break;
float dt=clamp(.055*r,.035,2.5);
vec3 a=-1.5*h2*p/(r*r*r*r*r);
vec3 nv=normalize(v+a*dt),np=p+nv*dt;
hl+=vec3(1.,.78,.5)*exp(-pow((r-1.5)*4.5,2.))*.018*tr;
float rr=length(p.xz);
if(rr>2.8&&rr<15.&&abs(p.y)<3.)col+=tr*bb(.55*pow(3./rr,.75))*pow(3./rr,1.8)*exp(-abs(p.y)*1.5)*dt*.03;
if(p.y*np.y<0.){
vec3 q=mix(p,np,p.y/(p.y-np.y));float rad=length(q.xz);
if(rad>2.9&&rad<14.){
float om=3.*pow(rad,-1.5),pa=fract(uT/24.),pb=fract(uT/24.+.5),wa=1.-abs(2.*pa-1.);
float ta=pa*24.*om,tb=pb*24.*om,ca=cos(ta),sa=sin(ta),cb=cos(tb),sb=sin(tb);
float n=mix(fbm(mat2(cb,-sb,sb,cb)*q.xz*1.1),fbm(mat2(ca,-sa,sa,ca)*q.xz*1.1),wa);
float arms=.5+.5*sin(2.*atan(q.z,q.x)-3.2*log(rad)+uT*.4);
float edge=smoothstep(2.9,3.3,rad)*(1.-smoothstep(9.,14.,rad));
float dens=edge*(.35+.5*n+.35*arms*n);
vec3 tg=normalize(vec3(-q.z,0.,q.x));
float be=sqrt(.5/rad),dop=sqrt(1.-be*be)/(1.-be*dot(tg,-nv));
float g=dop*sqrt(1.-1./rad),T=pow(3./rad,.75)*g;
float a2=clamp(dens*1.5,0.,.96);
col+=tr*a2*bb(T)*pow(g,3.)*(.1+1.7*pow(T,1.4))*(.75+.5*n);
tr*=1.-a2*.75;}}
p=np;v=nv;}
float fw=length(fwidth(v));
if(!hit)col+=hl+tr*sky(v,fw);
col*=smoothstep(1.,1.8,length(uCam))*mix(.72,1.05,smoothstep(3.,18.,length(uCam)));
col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
col=mix(vec3(dot(col,vec3(.3,.59,.11))),col,1.22);
col=pow(clamp(col,0.,1.),vec3(.86))*(1.-.1*dot(vUv,vUv));
gl_FragColor=vec4(col+(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.,1.);}`;
const bhM=new THREE.ShaderMaterial({uniforms:{uCam:{value:new THREE.Vector3()},uRot:{value:new THREE.Matrix3()},uT:{value:0},uAsp:{value:1},uTan:{value:.47}},vertexShader:VS,fragmentShader:MOB?FS.replace('i<130;','i<90;').replace('.055*r','.075*r'):FS,depthTest:false,depthWrite:false,extensions:{derivatives:true}});
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,400);
const bh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),bhM);bh.frustumCulled=false;bh.renderOrder=-1;sc.add(bh);

/* ---------- 3D link panelleri ---------- */
const PV=`uniform float uCap;varying vec2 vUv;varying vec3 vW;varying float vS;
void main(){vUv=uv;vec3 w=(modelMatrix*vec4(position,1.)).xyz;vS=0.;
if(uCap>0.){float rho=length(w.xz),g=(17.-rho)/17.,s=clamp(uCap+g*9.*uCap*(1.-uCap),0.,1.);vS=s;
float r2=rho*pow(1.-s,1.7),an=atan(w.z,w.x)+5.5*s*s+3.*s/(1.+.25*r2);
w.xz=r2*vec2(cos(an),sin(an));w.y*=(1.-s)*(1.-s);}
vW=w;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`;
const PF=`uniform sampler2D map;uniform float uA,uH;varying vec2 vUv;varying vec3 vW;varying float vS;
void main(){vec4 t=texture2D(map,vUv);vec3 ro=cameraPosition,d=vW-ro;float L=length(d);d/=L;
float tc=dot(-ro,d),b=length(ro+d*tc);
float occ=(tc>0.&&tc<L)?smoothstep(2.4,4.,b):1.;
vec3 c=t.rgb*(1.+.35*uH)*(1.+1.2*vS)+vec3(1.,.5,.15)*vS*vS*t.a*1.6;
gl_FragColor=vec4(c,t.a*uA*occ*(1.-smoothstep(.8,1.,vS)));}`;
const FN='"Space Grotesk",system-ui,sans-serif';
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
const GHP='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';
const IC=i=>['<svg viewBox="-16 -16 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cy="-6" r="5.5"/><path d="M-11 12a11 11 0 0 1 22 0"/></svg>','<svg viewBox="-16 -16 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><circle r="12.5"/><path d="M-4-6.5 7 0-4 6.5z" fill="currentColor"/></svg>','<svg viewBox="0 0 16 16" fill="currentColor"><path d="'+GHP+'"/></svg>'][i];
function tex(p){const c=document.createElement('canvas');c.width=1536;c.height=864;const g=c.getContext('2d');g.scale(2,2);
const I=P.indexOf(p),ls=v=>{if('letterSpacing' in g)g.letterSpacing=v};
rr(g,6,6,756,420,28);g.fillStyle='rgba(8,10,18,.8)';g.fill();
g.save();g.clip();
let gr=g.createLinearGradient(0,0,768,432);gr.addColorStop(0,p.c+'44');gr.addColorStop(.55,p.c+'06');gr.addColorStop(1,p.c+'2a');g.fillStyle=gr;g.fillRect(0,0,768,432);
gr=g.createRadialGradient(690,40,0,690,40,260);gr.addColorStop(0,p.c+'38');gr.addColorStop(1,p.c+'00');g.fillStyle=gr;g.fillRect(0,0,768,432);
gr=g.createLinearGradient(40,0,728,0);gr.addColorStop(0,p.c+'00');gr.addColorStop(.5,p.c);gr.addColorStop(1,p.c+'00');g.fillStyle=gr;g.fillRect(0,6,768,3);
g.restore();
rr(g,6,6,756,420,28);g.lineWidth=2;g.strokeStyle=p.c+'99';g.stroke();
rr(g,48,40,64,64,18);g.fillStyle=p.c+'22';g.fill();g.lineWidth=2;g.strokeStyle=p.c+'77';g.stroke();
g.save();g.translate(80,72);g.strokeStyle=g.fillStyle=p.c;g.lineWidth=3.4;g.lineCap=g.lineJoin='round';
if(p.ic===0){g.beginPath();g.arc(0,-10,8,0,7);g.stroke();g.beginPath();g.arc(0,22,17,3.6,5.82);g.stroke()}
else if(p.ic===1){g.beginPath();g.arc(0,0,19,0,7);g.stroke();g.beginPath();g.moveTo(-5.5,-9);g.lineTo(9.5,0);g.lineTo(-5.5,9);g.closePath();g.fill()}
else{g.scale(2.3,2.3);g.translate(-8,-8);g.fill(new Path2D(GHP))}
g.restore();
if(p.live){g.beginPath();g.arc(106,46,7,0,7);g.lineWidth=4;g.strokeStyle='#0a0e1c';g.stroke();g.fillStyle='#4ade80';g.fill()}
g.fillStyle=p.c;g.font='600 21px '+FN;ls('3px');g.fillText(p.k,128,80);
g.textAlign='right';g.fillStyle='#9a9488';g.fillText('0'+(I+1)+' / 0'+P.length,720,80);g.textAlign='left';ls('0px');
g.fillStyle='#f4efe6';g.font='600 58px '+FN;g.fillText(p.t,48,204);
g.fillStyle='#9a9488';g.font='400 24px '+FN;g.fillText(p.s,48,250);
g.fillStyle='#ffffff1f';g.fillRect(48,276,672,1.5);
g.font='600 18px '+FN;let x=48;
for(const s of p.ch){const w=g.measureText(s).width+28;if(x+w>720)break;rr(g,x,296,w,36,18);g.fillStyle='#ffffff0d';g.fill();g.lineWidth=1.5;g.strokeStyle=p.c+'55';g.stroke();g.fillStyle='#d8d2c4';g.fillText(s,x+14,320);x+=w+10}
g.fillStyle=p.c;g.font='600 24px '+FN;g.fillText(p.cta,48,385);
g.beginPath();g.arc(694,376,28,0,7);g.fillStyle=p.c;g.fill();
g.save();g.translate(694,376);g.strokeStyle='#070a14';g.lineWidth=3.6;g.lineCap=g.lineJoin='round';g.beginPath();g.moveTo(-8,8);g.lineTo(8,-8);g.moveTo(-3,-8);g.lineTo(8,-8);g.lineTo(8,3);g.stroke();g.restore();
const t=new THREE.CanvasTexture(c);t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());return t}
const A=P.map((_,i)=>.4+i*1.25),Y=[1.6,-1.4,1.8];
const BP=A.map((a,i)=>new THREE.Vector3(17*Math.cos(a),Y[i],17*Math.sin(a)));
const PM=[];
const build=()=>P.forEach((p,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(6.4,3.6,72,40),new THREE.ShaderMaterial({uniforms:{map:{value:tex(p)},uA:{value:1},uH:{value:0},uCap:{value:0}},vertexShader:PV,fragmentShader:PF,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
m.userData={i,cap:0,fz:0,p:new THREE.Vector3(),q:new THREE.Quaternion()};m.position.copy(BP[i]);sc.add(m);PM.push(m)});

/* ---------- Kamera yolu ---------- */
const cl=(x,a=0,b=1)=>Math.min(Math.max(x,a),b),E=x=>x*x*(3-2*x),N=P.length;
const S={t:0},B={g:new THREE.Vector3(),R:30,a:0,y:5,idx:0,dw:1},tmp=new THREE.Vector3(),KK={v:0};
function base(t){
const x=cl((t-.1)/.5)*(N-1),i=Math.min(Math.floor(x),N-2),f=x-i,e=E(cl((f-.3)/.4)),dw=1-Math.sin(Math.PI*e),k0=1-E(cl(t/.1)),pt=asp<1;
B.a=A[i]+(A[i+1]-A[i])*e+(pt?.12:.55);B.R=31-7*dw+14*k0+(pt?6:0);B.y=6-3.4*dw+4*k0+(pt?6*dw:0);
B.g.copy(BP[i]).lerp(BP[i+1],e).multiplyScalar(.5*dw*(1-k0));B.dw=dw;B.idx=i+(e>.5?1:0)}

gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
ScrollTrigger.create({trigger:'#sp',start:'top top',end:'bottom bottom',onUpdate:s=>{S.t=s.progress},onRefresh:s=>{S.t=s.progress}});
gsap.to('#hero',{opacity:0,y:-40,ease:'none',scrollTrigger:{trigger:'#sp',start:'top top',end:'+=70%',scrub:true}});

/* ---------- Durum, tıklama, sayfalar ---------- */
const cap=$('cap'),railI=document.querySelector('#rail i'),end=$('end'),pg=$('pg'),pc=$('pc'),fl=$('fl'),vg=$('vg'),sw=$('sw');
let tx=0,ty=0,px=0,py=0,K=0,clk=-1,clkT=0,po=0,ex=0,cur=0,Dp=0,T=0,last=performance.now(),acc=0,fc=0,cs='',hov=-1,wu=0,slow=0;
const rc=new THREE.Raycaster(),mv=new THREE.Vector2(9,9);let dn=null;
const setM=e=>{const r=cv.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1)};
const pick=()=>{rc.setFromCamera(mv,cam);return rc.intersectObjects(PM.filter(m=>m.visible&&m.userData.cap<.01))[0]};
const canClick=()=>clk<0&&!po&&cl((cur-.66)/.26)<.05;
function show(i){const c=P[i].c,n=(i+1)%N,v=(i+N-1)%N;
pg.style.setProperty('--pa',c);pg.style.setProperty('--pb',c+'22');pg.style.setProperty('--pc',c+'55');
pc.innerHTML=`<div class="ph"><span class="pi">${IC(i)}</span><span class="pk">${P[i].k}</span><span class="pn">0${i+1} / 0${N}</span></div>${PG[i]}<hr><div class="row ft">${GO(v,'← '+P[v].t)}${GO(n,P[n].t+' →')}</div><p class="ft-c">© 2026 Muhammet Ali</p>`;
pg.scrollTop=0;pg.className='on'}
function go(i){clk=i;clkT=cur;gsap.killTweensOf(KK);
gsap.to(KK,{v:1,duration:4.2,ease:'power2.in',onUpdate(){K=KK.v;if(K>.93&&!po){po=1;show(i)}}})}
function reset(){gsap.killTweensOf(KK);scrollTo(0,0);S.t=0;cur=0;K=0;KK.v=0;Dp=0;clk=-1;ex=0;end.style.opacity=0;end.style.pointerEvents='none';gsap.set('#hero',{opacity:1,y:0})}
function shut(){if(!po)return;po=0;pg.className='';gsap.killTweensOf([KK,'#hero div']);scrollTo(0,0);S.t=0;cur=0;clkT=0;ex=1;gsap.set('#hero div',{opacity:0});
gsap.to(KK,{v:0,duration:2.8,delay:.45,ease:'power3.out',onUpdate(){K=KK.v},onComplete(){clk=-1;ex=0;resume()}});
gsap.fromTo('#hero div',{opacity:0,y:30,scale:.96},{opacity:1,y:0,scale:1,duration:1.4,delay:1.5,ease:'power2.out'})}
addEventListener('pointermove',e=>{setM(e);tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5});
addEventListener('pointerdown',e=>{setM(e);dn=[e.clientX,e.clientY]});
addEventListener('pointerup',e=>{if(dn&&e.target===cv&&canClick()&&Math.hypot(e.clientX-dn[0],e.clientY-dn[1])<10){setM(e);const h=pick();if(h)go(h.object.userData.i)}dn=null});
addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-go]');if(!b)return;const g=b.dataset.go;if(g==='h')shut();else if(po)show(+g);else if(canClick())go(+g)});
addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
$('up').onclick=reset;$('bk').onclick=shut;

/* ---------- bfcache / sekme dönüşü: ölçümü sıfırla, boyutu ve dokuları yenile ---------- */
const resume=full=>{last=performance.now();acc=fc=slow=0;wu=T+2.5;
if(full){lw=innerWidth;pr=maxPr();rs();PM.forEach((m,i)=>{const u=m.material.uniforms,o=u.map.value;u.map.value=tex(P[i]);o.dispose()})}};
addEventListener('pageshow',e=>{if(e.persisted)resume(1)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume()});
cv.addEventListener('webglcontextrestored',()=>resume(1));

/* ---------- Döngü ---------- */
function loop(now){
const raw=(now-last)/1e3,dt=Math.min(raw,.1);last=now;T+=dt;
cur+=(S.t-cur)*(1-Math.exp(-dt*5));
const ds=cl((cur-.66)/.26),D=clk>=0?K:ds;
base(clk>=0?clkT:cur);px+=(tx-px)*.04;py+=(ty-py)*.04;B.a+=(Math.sin(T*.13)*.04+px*.06)*(1-D);B.y+=(Math.sin(T*.17)*.25-py*.5)*(1-D);
const R0=B.R,Rn=R0*Math.exp(Math.log(.5/R0)*Math.pow(D,1.6)),a=B.a+9*D*D,y=(B.y+(.45*R0-B.y)*E(D))*Rn/R0;
cam.position.set(Rn*Math.cos(a),y,Rn*Math.sin(a));const sh=D*D*D*.14;cam.position.x+=Math.sin(T*53)*sh;cam.position.y+=Math.cos(T*61)*sh;cam.lookAt(tmp.copy(B.g).multiplyScalar(1-D));cam.rotateZ(D*D*1.8);
cam.aspect=asp;cam.fov=(asp<1?70:50)+44*D;cam.updateProjectionMatrix();cam.updateMatrixWorld();
if((Dp-.86)*(D-.86)<0){gsap.fromTo(fl,{opacity:ex?1:.6},{opacity:0,duration:ex?1.5:.7,ease:'power2.out'});if(ex)gsap.fromTo(sw,{scale:0,opacity:1},{scale:12,opacity:0,duration:1.7,ease:'power2.out'})}Dp=D;
const u=bhM.uniforms;u.uCam.value.copy(cam.position);u.uRot.value.setFromMatrix4(cam.matrixWorld);u.uT.value=T;u.uAsp.value=asp;u.uTan.value=Math.tan(cam.fov*Math.PI/360);
if(!MOB){const h=pick();hov=h?h.object.userData.i:-1;cv.style.cursor=hov>=0&&canClick()?'pointer':''}
const PS=asp<1?.85:1;
PM.forEach((m,i)=>{const w=m.userData,q=m.material.uniforms;
const c=ex?0:E(clk>=0?(i>=clk?cl((D-.12*(i-clk))/.55):0):cl((D-.12*i)/.55)),al=ex?cl((.4-K)/.4):((clk>=0&&i<clk)?1-cl(D*4):1)*(1-cl((D-.78)/.1));
if(c>0){if(!w.fz){w.fz=1;w.p.copy(m.position);w.q.copy(m.quaternion)}m.position.copy(w.p);m.quaternion.copy(w.q)}
else{w.fz=0;m.position.copy(BP[i]);m.position.y+=Math.sin(T*.8+i*1.7)*.3;m.lookAt(cam.position);
const hv=!MOB&&hov===i&&clk<0;m.scale.setScalar(m.scale.x+((hv?1.08:1)*PS-m.scale.x)*.15);q.uH.value+=((hv?1:0)-q.uH.value)*.15}
w.cap=c;q.uCap.value=c;q.uA.value=al;m.visible=al>.01&&c<.999});
const c2=(clk<0&&ds<.01&&cur>.08&&B.dw>.6)?`0${B.idx+1} / 0${N} — ${P[B.idx].t} · ${MOB?'dokun':'tıkla'}`:'';
if(c2!==cs){cap.textContent=c2;cs=c2}
railI.style.transform=`scaleY(${cl(cur)})`;vg.style.opacity=cl(D*1.4-.15);
const eo=clk>=0?0:cl((cur-.93)/.05);end.style.opacity=eo;end.style.pointerEvents=eo>.5?'auto':'none';
if(!po){if(Rn<1)R.clear();else R.render(sc,cam)}
if(!po&&clk<0&&!ex&&T>2.5){if(T<wu||raw>.25){acc=0;fc=0;slow=0}else{acc+=raw;fc++}if(fc>=30){const av=acc/fc;acc=0;fc=0;if(av>.022&&pr>.6){if(++slow>=(av>.05?1:2)){slow=0;pr=Math.max(.6,pr*Math.sqrt(.0185/av));rs()}}else slow=0}}
requestAnimationFrame(loop)}
Promise.race([document.fonts?document.fonts.load('600 40px "Space Grotesk"'):0,new Promise(r=>setTimeout(r,1500))]).catch(()=>{}).then(()=>{build();requestAnimationFrame(loop)});
})();

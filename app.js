(() => {
'use strict';
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);const W=1440,H=900;
const CROPS=[
 {id:'wheat',emoji:'🌾',seed:1,grow:3600,qty:100.4167,price:.01},
 {id:'carrot',emoji:'🥕',seed:2,grow:7200,qty:100.8333,price:.02},
 {id:'potato',emoji:'🥔',seed:4,grow:14400,qty:101.6667,price:.04},
 {id:'corn',emoji:'🌽',seed:7,grow:21600,qty:102.5,price:.07},
 {id:'sunflower',emoji:'🌻',seed:12,grow:32400,qty:103.75,price:.12},
 {id:'pumpkin',emoji:'🎃',seed:20,grow:43200,qty:105,price:.20},
 {id:'strawberry',emoji:'🍓',seed:35,grow:64800,qty:107.5,price:.35},
 {id:'watermelon',emoji:'🍉',seed:60,grow:97200,qty:111.25,price:.60},
 {id:'rose',emoji:'🌹',seed:100,grow:129600,qty:115,price:1}
];
const COSTS=[0,.5,1,2,4,7,12,20,35];
const T={en:{tagline:'Grow. Upgrade. Build Your Fortune.',playBalance:'Play balance',salesBalance:'Sales balance',wallet:'Wallet',settings:'Settings',level:'Level',hint:'Tap a field to plant, grow or harvest',farm:'Farm',fishing:'Fishing',honey:'Honey',eggs:'Eggs',prototype:'Interactive world prototype',notice:'Farm actions work locally in this browser. Deposits and withdrawals are not connected to real payments.',market:'Market',field:'Field',locked:'Locked field',unlock:'Unlock field',plant:'Plant seeds',harvest:'Harvest',growing:'Growing',ready:'Ready to harvest',empty:'Empty field',seedCost:'Seed cost',growth:'Growth time',yield:'Harvest quantity',sell:'Sell all produce',close:'Close',notEnough:'Not enough play balance.',unlocked:'Field unlocked!',planted:'Seeds planted!',harvested:'Harvest collected!',sold:'Produce sold to sales balance.',nothing:'Nothing to sell yet.',lockedText:'Unlock this field to continue your farming journey.',plantPrompt:'Buy seeds for this field. The crop grows while you are away.',marketText:'Your harvested produce is sold here at fixed prices.',inventory:'Inventory',fishingText:'The fishing spot will be activated in a later stage.',hiveText:'The beehive area is reserved for its production system.',coopText:'The chicken coop area is reserved for egg production.',walletText:'Demo wallet only. Real deposits and withdrawals are not enabled.',ok:'Got it',timeLeft:'Time remaining'},fr:{tagline:'Cultivez. Améliorez. Bâtissez votre fortune.',playBalance:'Solde de jeu',salesBalance:'Solde des ventes',wallet:'Portefeuille',settings:'Paramètres',level:'Niveau',hint:'Touchez un champ pour planter ou récolter',farm:'Ferme',fishing:'Pêche',honey:'Miel',eggs:'Œufs',prototype:'Prototype de monde interactif',notice:'Les actions sont enregistrées localement. Aucun dépôt ni retrait réel n’est activé.',market:'Marché',field:'Champ',locked:'Champ verrouillé',unlock:'Déverrouiller',plant:'Planter',harvest:'Récolter',growing:'En croissance',ready:'Prêt à récolter',empty:'Champ vide',seedCost:'Coût des graines',growth:'Temps de croissance',yield:'Quantité récoltée',sell:'Tout vendre',close:'Fermer',notEnough:'Solde de jeu insuffisant.',unlocked:'Champ débloqué !',planted:'Graines plantées !',harvested:'Récolte récupérée !',sold:'Récolte vendue sur le solde des ventes.',nothing:'Rien à vendre pour le moment.',lockedText:'Débloquez ce champ pour continuer.',plantPrompt:'Achetez les graines. La culture pousse même hors ligne.',marketText:'Les récoltes sont vendues ici à prix fixes.',inventory:'Stock',fishingText:'La zone de pêche sera activée dans une prochaine étape.',hiveText:'La zone de la ruche attend son système de production.',coopText:'Le poulailler attend son système de production des œufs.',walletText:'Portefeuille de démonstration. Les paiements réels ne sont pas activés.',ok:'Compris',timeLeft:'Temps restant'}};
let lang='en',toastTimer;const names={en:['Wheat','Carrot','Potato','Corn','Sunflower','Pumpkin','Strawberry','Watermelon','Rare rose'],fr:['Blé','Carotte','Pomme de terre','Maïs','Tournesol','Citrouille','Fraise','Pastèque','Rose rare']};
const plotBoxes=[{x:230,y:365,w:170,h:120},{x:425,y:365,w:170,h:120},{x:620,y:365,w:170,h:120},{x:230,y:520,w:170,h:120},{x:425,y:520,w:170,h:120},{x:620,y:520,w:170,h:120},{x:230,y:675,w:170,h:120},{x:425,y:675,w:170,h:120},{x:620,y:675,w:170,h:120}];
const fresh=()=>({play:10,sales:0,unlocked:1,plots:Array.from({length:9},()=>({plantedAt:0,harvested:false})),inventory:Array(9).fill(0)});
let state;try{state=JSON.parse(localStorage.getItem('growora-world-v1'))||fresh()}catch{state=fresh()};
if(!state.plots||state.plots.length!==9)state=fresh();
const save=()=>{try{localStorage.setItem('growora-world-v1',JSON.stringify(state))}catch{}};
const money=n=>'$'+Number(n||0).toFixed(2);const tr=k=>(T[lang]&&T[lang][k])||T.en[k]||k;const cropName=i=>names[lang][i];
function text(x,y,s,size=16,color='#fff4cf',align='center'){ctx.font=`bold ${size}px system-ui,sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.lineWidth=Math.max(2,size/6);ctx.strokeStyle='#4a2d1b';ctx.strokeText(s,x,y);ctx.fillStyle=color;ctx.fillText(s,x,y)}
function poly(points,fill,stroke='#76502b',lw=4){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}
function ellipse(x,y,rx,ry,fill,stroke){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=4;ctx.stroke()}}
function drawWorld(){ctx.clearRect(0,0,W,H);
 // ocean base and waves
 let sea=ctx.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#28b8d0');sea.addColorStop(1,'#087f9d');ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);
 for(let y=15;y<H;y+=44)for(let x=(y%2?5:28);x<W;x+=95){ctx.strokeStyle='rgba(183,246,239,.38)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+16,y-8,x+33,y);ctx.stroke()}
 // island outline
 ellipse(610,480,560,390,'#d7b56b','#8b6039');ellipse(600,466,542,377,'#68b94e','#3d7c3d');
 // grass patches
 for(let i=0;i<180;i++){let x=90+(i*173)%1030,y=80+(i*97)%730;if(((x-610)/540)**2+((y-465)/370)**2<.92){ctx.fillStyle=i%3?'#78c95b':'#4a9c46';ctx.fillRect(x,y,12+(i%3)*4,8)}}
 // shoreline sand at bottom/right
 poly([[90,700],[190,820],[480,860],[780,850],[1010,780],[1100,690],[1020,760],[800,830],[500,840],[240,800]],'#e8ce83','#b98a4e',3);
 // pond
 ellipse(950,565,195,165,'#287d87','#9b7746');ellipse(950,555,178,151,'#28b8d1','#63dce0');
 for(let i=0;i<12;i++){ctx.strokeStyle='#a5f0e5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(865+(i*43)%170,490+(i*31)%135,12,4,0,0,Math.PI*2);ctx.stroke()}
 // path
 poly([[720,270],[790,285],[875,415],[840,450],[745,345]],'#d8b778','#aa8047',5);poly([[700,690],[760,700],[845,785],[800,810],[730,760]],'#d8b778','#aa8047',5);
 // trees
 const tree=(x,y,s=1)=>{ellipse(x,y+20*s,28*s,12*s,'#42783b');poly([[x-5*s,y+20*s],[x+5*s,y+20*s],[x+6*s,y+45*s],[x-6*s,y+45*s]],'#8b542e','#704323',2);ellipse(x,y,25*s,28*s,'#2f8e47','#27683a');ellipse(x-13*s,y+7*s,16*s,18*s,'#48ad4e');ellipse(x+12*s,y+8*s,15*s,16*s,'#68c94f')};
 [[150,230,1.1],[200,300,.9],[840,235,1],[1050,320,.8],[160,570,.9],[785,710,.9],[1040,700,1],[380,180,.8],[730,150,.9],[300,760,.8],[570,240,.8]].forEach(a=>tree(...a));
 // farmhouse and roof
 poly([[385,180],[475,115],[565,180]],'#b84f37','#663c2a',6);ctx.fillStyle='#e6c18a';ctx.fillRect(400,178,150,105);ctx.strokeStyle='#85522f';ctx.lineWidth=6;ctx.strokeRect(400,178,150,105);ctx.fillStyle='#77442b';ctx.fillRect(455,220,34,63);ctx.fillStyle='#7bd4df';ctx.fillRect(415,202,24,24);ctx.fillRect(510,202,24,24);text(475,296,'FARM',13);
 // coop pen
 poly([[810,225],[1035,230],[1050,365],[830,375]],'rgba(175,135,69,.12)','#89562c',5);for(let x=820;x<1050;x+=28){ctx.fillStyle='#e1c17a';ctx.fillRect(x,280,7,38)}
 poly([[875,210],[935,170],[995,210]],'#b64b35','#663c2a',5);ctx.fillStyle='#e7c58b';ctx.fillRect(884,208,102,76);ctx.strokeStyle='#80502f';ctx.lineWidth=5;ctx.strokeRect(884,208,102,76);ctx.fillStyle='#73452b';ctx.fillRect(925,235,25,49);text(934,300,'COOP',12);
 // beehive zone
 ellipse(710,230,60,36,'#9ccc59','#477e39');ctx.fillStyle='#c78b26';ctx.fillRect(692,202,34,42);for(let y=210;y<242;y+=10){ctx.strokeStyle='#714d24';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(692,y);ctx.lineTo(726,y);ctx.stroke()}ellipse(709,200,18,9,'#f4c64e','#714d24');text(710,267,'HIVE',12);
 // dock and boat
 poly([[1080,345],[1130,320],[1205,410],[1160,440]],'#b78a4b','#71482c',5);for(let i=0;i<6;i++){ctx.strokeStyle='#6d482a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1090+i*15,350+i*12);ctx.lineTo(1110+i*15,338+i*12);ctx.stroke()}poly([[1150,425],[1230,425],[1210,455],[1170,455]],'#f3eee0','#63472e',4);poly([[1170,423],[1190,390],[1210,423]],'#e6e2ce','#63472e',3);text(1190,475,'FISHING',13);
 // market stall
 poly([[440,805],[620,805],[640,850],[420,850]],'#9c5c31','#6a3c23',4);poly([[420,805],[640,805],[625,785],[435,785]],'#fff0c9','#6a3c23',4);for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#d64f37':'#fff1c8';ctx.fillRect(435+i*31,786,16,20)}text(530,831,lang==='fr'?'MARCHÉ':'MARKET',17);
 // fence line around farm
 for(let x=140;x<800;x+=38){ctx.fillStyle='#b47a42';ctx.fillRect(x,330,7,25);ctx.fillRect(x-4,338,16,5)}
 // plots are world objects, not website cards
 plotBoxes.forEach((b,i)=>drawPlot(b,i));
 // bees and chicken moving locally in the world
 const now=Date.now()/450;for(let i=0;i<3;i++){let x=710+Math.sin(now+i*2)*35,y=180+Math.cos(now*1.2+i)*15;ctx.fillStyle='#f9c83e';ctx.beginPath();ctx.ellipse(x,y,7,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#533a20';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-2,y-4);ctx.lineTo(x-2,y+4);ctx.moveTo(x+3,y-4);ctx.lineTo(x+3,y+4);ctx.stroke();ellipse(x-3,y-6,3,2,'#d9f4ed');ellipse(x+4,y-6,3,2,'#d9f4ed')}
 let cx=900+Math.sin(now*.45)*22,cy=325+Math.cos(now*.65)*12;ellipse(cx,cy,14,12,'#fff8df','#8b6b43');ellipse(cx+12,cy-8,8,8,'#fff8df','#8b6b43');ellipse(cx+15,cy-9,2,2,'#242b27');poly([[cx-6,cy+9],[cx-5,cy+16],[cx-1,cy+16]],'#e5a33d','#9b642a',1);poly([[cx+3,cy+9],[cx+4,cy+16],[cx+8,cy+16]],'#e5a33d','#9b642a',1);
 // butterflies
 ctx.fillStyle='#ff7fb0';for(let i=0;i<2;i++){let x=320+Math.sin(now*.7+i*2)*25,y=320+Math.cos(now+i)*15;ellipse(x-4,y,5,4,'#ff7fb0');ellipse(x+4,y,5,4,'#f6c6ff');ctx.fillStyle='#533d58';ctx.fillRect(x-1,y-4,2,9)}
 // island edge sparkle
 for(let i=0;i<40;i++){let a=i*Math.PI*2/40;ellipse(610+Math.cos(a)*550,465+Math.sin(a)*380,3,3,'#f4dc91')}
 updateHud();requestAnimationFrame(drawWorld)}
function drawPlot(b,i){const crop=CROPS[i],p=state.plots[i],unlocked=i<state.unlocked,elapsed=p.plantedAt?Date.now()-p.plantedAt:0,ready=p.plantedAt&&elapsed>=crop.grow*1000;
 ctx.save();ctx.translate(b.x,b.y);
 // wood edging + soil perspective
 poly([[0,10],[b.w-10,0],[b.w, b.h-16],[10,b.h]],'#8c552e','#5e3a25',5);poly([[8,17],[b.w-17,8],[b.w-10,b.h-23],[17,b.h-8]],unlocked?'#744426':'#4e4540','#b8894b',3);
 if(unlocked){for(let r=0;r<4;r++){ctx.strokeStyle='#a66b3d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(17,30+r*22);ctx.lineTo(b.w-25,22+r*22);ctx.stroke()}}
 if(unlocked&&p.plantedAt){let ratio=Math.min(1,elapsed/(crop.grow*1000));for(let r=0;r<3;r++)for(let c=0;c<5;c++){let x=28+c*26+(r%2)*5,y=35+r*24;let height=8+ratio*18;ctx.strokeStyle='#246c37';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y+12);ctx.lineTo(x,y+12-height);ctx.stroke();ellipse(x-5,y+12-height*.7,5+ratio*3,3+ratio*2,ratio>.8?['#e4b64a','#ec7c31','#65a43e'][i%3]:'#48a94d');ellipse(x+5,y+9-height*.65,5+ratio*3,3+ratio*2,ratio>.8?['#e4b64a','#ec7c31','#65a43e'][i%3]:'#63c451')}}
 if(!unlocked){ctx.fillStyle='#061d27a8';ctx.fillRect(8,17,b.w-25,b.h-26);text(b.w/2,b.h/2,'🔒',28)}
 ctx.fillStyle='#6d3d23';ctx.fillRect(20,-7,b.w-40,23);ctx.strokeStyle='#d7ad63';ctx.lineWidth=2;ctx.strokeRect(20,-7,b.w-40,23);text(b.w/2,5,unlocked?cropName(i):money(COSTS[i]),13);
 if(unlocked&&p.plantedAt){if(ready){ctx.fillStyle='#f9d45e';ctx.beginPath();ctx.arc(b.w-24,20,10,0,Math.PI*2);ctx.fill();text(b.w-24,20,'!',13,'#5d381d')}else{ctx.fillStyle='#0d2c29cc';ctx.fillRect(25,b.h-27,b.w-52,15);ctx.fillStyle='#f5ca55';ctx.fillRect(27,b.h-25,Math.max(0,(b.w-56)*ratio),11);}}
 ctx.restore();}
function updateHud(){$('playBalance').textContent=money(state.play);$('salesBalance').textContent=money(state.sales);$('inventoryCount').textContent=state.inventory.reduce((a,b)=>a+b,0).toFixed(1).replace(/\.0$/,'')}
function showToast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
function modal(title,icon,description,choices){$('modalTitle').textContent=title;$('modalIcon').textContent=icon;$('modalText').textContent=description;const wrap=$('modalChoices');wrap.innerHTML='';choices.forEach(c=>{const b=document.createElement('button');b.textContent=c.label;if(c.secondary)b.className='secondary';b.disabled=!!c.disabled;b.onclick=()=>{if(c.action)c.action();if(c.keepOpen)return;closeModal()};wrap.appendChild(b)});$('modalLayer').hidden=false}
function closeModal(){$('modalLayer').hidden=true}
function clickPlot(i){const crop=CROPS[i],p=state.plots[i],unlocked=i<state.unlocked,elapsed=Date.now()-p.plantedAt,ready=p.plantedAt&&elapsed>=crop.grow*1000;
 if(!unlocked){const cost=COSTS[i];modal(tr('locked'), '🔒',tr('lockedText')+' '+tr('unlock')+': '+money(cost),[{label:tr('unlock')+' · '+money(cost),disabled:state.play<cost,action:()=>{state.play-=cost;state.unlocked=i+1;save();showToast(tr('unlocked'));drawOnce()}},{label:tr('close'),secondary:true}]);return}
 if(!p.plantedAt){modal(cropName(i),crop.emoji,`${tr('seedCost')}: ${money(crop.seed)} · ${tr('growth')}: ${formatTime(crop.grow)} · ${tr('yield')}: ${crop.qty}`, [{label:tr('plant')+' · '+money(crop.seed),disabled:state.play<crop.seed,action:()=>{state.play-=crop.seed;p.plantedAt=Date.now();save();showToast(tr('planted'));drawOnce()}},{label:tr('close'),secondary:true}]);return}
 if(ready){modal(cropName(i),crop.emoji,tr('ready')+' · '+crop.qty+' units',[{label:tr('harvest'),action:()=>{state.inventory[i]+=crop.qty;p.plantedAt=0;save();showToast(tr('harvested'));drawOnce()}},{label:tr('close'),secondary:true}]);return}
 modal(cropName(i),'🌱',tr('growing')+' · '+formatTime(Math.max(0,crop.grow*1000-elapsed)/1000),[{label:tr('close')}]);}
function formatTime(seconds){seconds=Math.ceil(seconds);const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60);return h?`${h}h ${m}m`:`${m} min`}
function drawOnce(){
  drawWorld();
}

function resizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  drawOnce();
}

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click',e=>{
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*W/r.width;
  const y=(e.clientY-r.top)*H/r.height;

  for(let i=0;i<plotBoxes.length;i++){
    const b=plotBoxes[i];
    if(x>=b.x-4&&x<=b.x+b.w+4&&y>=b.y-10&&y<=b.y+b.h+4){
      clickPlot(i);
      return;
    }
  }

  if(x>1070&&y>300&&y<510){zone('fishing');return}
  if(x>830&&x<1060&&y>180&&y<380){zone('coop');return}
  if(x>650&&x<770&&y>170&&y<285){zone('hive');return}
});

function zone(which){
  if(which==='farm'){
    showToast(tr('hint'));
    return;
  }
  const info={
    fishing:['🎣',tr('fishing'),tr('fishingText')],
    hive:['🐝',tr('honey'),tr('hiveText')],
    coop:['🥚',tr('eggs'),tr('coopText')]
  };
  const [icon,title,desc]=info[which]||info.fishing;
  modal(title,icon,desc,[{label:tr('ok')}]);
}

$('marketBtn').addEventListener('click',()=>{
  const total=state.inventory.reduce((a,q,i)=>a+q*CROPS[i].price,0);
  const lines=state.inventory.map((q,i)=>
    q>0?`${names[lang][i]}: ${q.toFixed(2)} × ${money(CROPS[i].price)}`:null
  ).filter(Boolean).join(' · ');

  modal(tr('market'),'🧺',
    lines?`${tr('inventory')}: ${lines}. Total: ${money(total)}`:tr('nothing'),
    [{
      label:tr('sell')+' · '+money(total),
      disabled:total<=0,
      action:()=>{
        state.sales+=total;
        state.inventory=Array(9).fill(0);
        save();
        showToast(tr('sold'));
        drawOnce();
      }
    },{label:tr('close'),secondary:true}]
  );
});

$('walletBtn').onclick=()=>modal(tr('wallet'),'👛',tr('walletText'),[{label:tr('ok')}]);
$('settingsBtn').onclick=()=>modal(tr('settings'),'⚙️',tr('walletText'),[{label:tr('ok')}]);
$('closeModal').onclick=closeModal;
$('modalLayer').addEventListener('click',e=>{
  if(e.target===$('modalLayer'))closeModal();
});

document.querySelectorAll('[data-zone]').forEach(b=>
  b.addEventListener('click',()=>zone(b.dataset.zone))
);

$('languageSelect').addEventListener('change',e=>{
  lang=e.target.value;
  document.documentElement.lang=lang;
  document.documentElement.dir='ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n;
    if(T[lang][k])el.textContent=T[lang][k];
  });
  drawOnce();
});

requestAnimationFrame(drawWorld);
})();

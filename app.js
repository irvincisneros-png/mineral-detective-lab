'use strict';
const $ = s => document.querySelector(s);
const minerals = [
 {name:'Calcite',density:2.71,h:3,lustre:'Glassy',habit:'Rhombohedral',streak:'White',colour:'#e9e7df',acid:true},
 {name:'Fluorite',density:3.18,h:4,lustre:'Glassy',habit:'Octahedral',streak:'White',colour:'#e9e7df'},
 {name:'Gypsum',density:2.32,h:2,lustre:'Pearly / silky',habit:'Bladed',streak:'White',colour:'#e9e7df',soluble:true},
 {name:'Halite',density:2.17,h:2.5,lustre:'Glassy',habit:'Cubic',streak:'White',colour:'#e9e7df',soluble:true},
 {name:'Magnetite',density:5.18,h:6,lustre:'Metallic',habit:'Granular',streak:'Black',colour:'#303637'},
 {name:'Pyrite',density:5.02,h:6.25,lustre:'Metallic',habit:'Cubic',streak:'Greenish-black',colour:'#424a38'},
 {name:'Quartz',density:2.65,h:7,lustre:'Glassy',habit:'Hexagonal prisms',streak:'Scratches tile; no reliable mineral streak',colour:'#a2a39a'},
 {name:'Talc',density:2.75,h:1,lustre:'Pearly / greasy',habit:'Flaky / micaceous',streak:'White',colour:'#e9e7df'}
];
const stations = [
 ['mass','Balance','⚖','Electronic balance','Press Tare, then drag the specimen onto the steel pan. Wait for a stable reading.'],
 ['volume','Cylinder','▥','Liquid displacement','Record the initial level. Lower the specimen into the cylinder, then read the bottom of the meniscus again.'],
 ['observe','Inspect','◉','Specimen examination','Drag to turn the specimen. Adjust illumination and magnification to examine its texture and crystal form.'],
 ['scratch','Scratch kit','╱','Mohs scratch test','Choose a hardness point, then drag it across the specimen. Wipe loose powder away to check for a permanent groove.'],
 ['streak','Streak','≋','Unglazed porcelain','Drag the specimen across the tile. Examine the powdered trail, which may differ from its surface colour.'],
 ['acid','Dropper','♧','Dilute acid reaction','Put on simulated eye protection. Drag the pipette tip over the specimen and release one drop.']
];
const points=[{label:'H 2',h:2},{label:'H 3',h:3},{label:'H 4',h:4},{label:'H 5.5',h:5.5},{label:'H 6.5',h:6.5},{label:'H 8',h:8}];
const canvas=$('#bench'),ctx=canvas.getContext('2d');
const atlas=new Image(),equipment=new Image();let atlasOK=false,equipmentOK=false;
const mineralSprites=[],equipmentSprites=[];
function cutout(image,x,y,w,h){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(image,x,y,w,h,0,0,w,h);
 const pixels=g.getImageData(0,0,w,h),data=pixels.data,seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let start=0,end=0;
 function add(i){if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4;if(Math.min(data[p],data[p+1],data[p+2])>232){queue[end++]=i;data[p+3]=0}}
 for(let xx=0;xx<w;xx++){add(xx);add((h-1)*w+xx)}for(let yy=0;yy<h;yy++){add(yy*w);add(yy*w+w-1)}
 while(start<end){const i=queue[start++];if(i%w)add(i-1);if(i%w<w-1)add(i+1);add(i-w);add(i+w)}g.putImageData(pixels,0,0);return c;
}
atlas.src='assets/specimen-atlas.png';equipment.src='assets/equipment-atlas.png';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state,drag=null,animation=null,frame=0,lastTime=0;
const sprite={x:210,y:385,w:165};const tool={x:770,y:240};
function newCase(){
 const index=state?(state.index+1)%8:0;
 state={index,station:'mass',volume:12+index*.5,initial:38+(index%3),tared:false,loaded:false,stable:false,immersed:false,water:0,visited:new Set(),scratchTool:3,scratches:[],scratchTests:new Set(),trails:[],streakLength:0,ppe:false,drops:[],reaction:false,angle:0,light:65,magnify:1,solved:false};
 state.mass=+(state.volume*minerals[index].density).toFixed(1);state.water=state.initial;
 animation=null;drag=null;
 document.querySelectorAll('.sheet input,.sheet textarea').forEach(e=>e.value='');document.querySelectorAll('.sheet select').forEach(e=>e.value='');document.querySelectorAll('.feedback').forEach(e=>e.textContent='');
 $('#case-label').textContent=`SPECIMEN ${String(index+1).padStart(2,'0')} / 08`;$('#sample-label').textContent=`UNKNOWN / M-${String(index+1).padStart(3,'0')}`;selectStation('mass');setSheet('measurements');
}
function mineral(){return minerals[state.index]}
function status(s){$('#status').textContent=s}
function visited(name=state.station){state.visited.add(name);updateProgress()}
function updateProgress(){ $('#progress').textContent=`${state.visited.size} of 6 procedures explored`;document.querySelectorAll('[data-station]').forEach(b=>b.classList.toggle('done',state.visited.has(b.dataset.station))); }
function selectStation(name){
 if(animation){status('Allow the current procedure to finish first.');return}
 drag=null;state.station=name;positionObjects();const data=stations.find(s=>s[0]===name);
 $('#station-number').textContent=`0${stations.indexOf(data)+1} / ${data[1].toUpperCase()}`;$('#station-title').textContent=data[3];$('#instruction').textContent=data[4];status('');
 document.querySelectorAll('[data-station]').forEach(b=>{b.classList.toggle('active',b.dataset.station===name);b.setAttribute('aria-pressed',String(b.dataset.station===name))});controls();updateProgress();draw();
}
function positionObjects(){sprite.x=210;sprite.y=385;sprite.w=165;tool.x=780;tool.y=230;
 if(state.station==='mass'&&state.loaded){sprite.x=670;sprite.y=245;sprite.w=135}
 if(state.station==='volume'&&state.immersed){sprite.x=650;sprite.y=463;sprite.w=62}
 if(['observe','scratch','acid'].includes(state.station)){sprite.x=500;sprite.y=310;sprite.w=state.station==='observe'?285:235}
 if(state.station==='streak'){sprite.x=200;sprite.y=350;sprite.w=135}
}
function button(label,fn,chosen=false){const b=document.createElement('button');b.textContent=label;b.classList.toggle('chosen',chosen);b.onclick=fn;$('#controls').append(b);return b}
function controls(){ $('#controls').replaceChildren();
 if(state.station==='mass'){button('Tare / zero',tare);button(state.loaded?'Return to tray':'Place on balance',()=>state.loaded?returnMass():loadMass());}
 if(state.station==='volume'){button(state.immersed?'Lift out specimen':'Lower into cylinder',()=>state.immersed?liftVolume():immerse());button('Enlarge graduations',()=>{$('body').classList.toggle('expanded');resize()});}
 if(state.station==='observe'){
  [['Illumination',15,100,state.light,v=>state.light=+v],['Magnification',100,170,state.magnify*100,v=>state.magnify=v/100]].forEach(([label,min,max,value,fn])=>{const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.value=value;input.oninput=()=>{fn(input.value);visited();draw()};l.append(input);$('#controls').append(l)});button('Turn specimen',()=>{state.angle+=.25;visited();draw()});visited();
 }
 if(state.station==='scratch'){points.forEach((p,i)=>button(p.label,()=>{state.scratchTool=i;status(`${p.label} point selected. Drag the orange handle across the mineral.`);controls();draw()},state.scratchTool===i));button('Make a scratch',keyboardScratch);button('Wipe powder',()=>{state.scratches=state.scratches.filter(s=>s.groove);status('Loose material wiped away. Permanent grooves remain.');draw()});}
 if(state.station==='streak'){button('Draw across tile',keyboardStreak);button('Clean tile',()=>{state.trails=[];state.streakLength=0;draw()});}
 if(state.station==='acid'){const l=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=state.ppe;check.onchange=()=>{state.ppe=check.checked;status(state.ppe?'Eye protection on. Position the pipette tip above the sample.':'Put on simulated eye protection before adding acid.');draw()};l.append(check,document.createTextNode('Eye protection on'));$('#controls').append(l);button('Position & add one drop',()=>dropAcid(500,300));}
}
function tween(duration,update,finish){if(animation)return;const start=performance.now();animation={start,duration:reduced?1:duration,update,finish};requestDraw()}
function requestDraw(){if(!frame)frame=requestAnimationFrame(tick)}
function tick(now){frame=0;if(document.hidden){requestDraw();return}lastTime=now;if(animation){const a=animation,t=Math.min(1,(now-a.start)/a.duration);a.update(1-Math.pow(1-t,3));if(t>=1){animation=null;a.finish?.()}}draw(now);if(animation||state.drops.some(d=>now-d.time<4500))requestDraw()}
function tare(){if(state.loaded){status('Return the sample to the tray before zeroing.');return}state.tared=true;status('Balance zeroed. Move the specimen onto the pan.');draw()}
function returnMass(){if(animation)return;state.loaded=false;state.stable=false;positionObjects();controls();status('Specimen returned to the tray.');draw()}
function loadMass(){if(animation||state.loaded)return;if(!state.tared){status('Press Tare to zero the empty balance first.');return}const a={...sprite};state.loaded=true;state.stable=false;tween(1100,t=>{sprite.x=a.x+(670-a.x)*t;sprite.y=a.y+(245-a.y)*t-Math.sin(t*Math.PI)*65;sprite.w=a.w+(135-a.w)*t},()=>{state.stable=true;visited();status('Reading stable. Record the mass shown on the display.');controls()})}
function immerse(){if(animation||state.immersed)return;const a={...sprite};state.immersed=true;const target=state.initial+state.volume;tween(1450,t=>{sprite.x=a.x+(650-a.x)*Math.min(1,t*1.8);sprite.y=t<.45?a.y+(80-a.y)*(t/.45):80+(463-80)*((t-.45)/.55);sprite.w=a.w+(62-a.w)*t;state.water=state.initial+(target-state.initial)*Math.max(0,(t-.5)*2)},()=>{state.water=target;visited();status('Specimen immersed. Read the bottom of the meniscus at eye level.');controls()})}
function liftVolume(){if(animation)return;state.immersed=false;state.water=state.initial;positionObjects();controls();status('Initial level restored.');draw()}
function scratch(a,b){const h=points[state.scratchTool].h,groove=h>mineral().h;state.scratchTests.add(h);state.scratches.push({a,b,groove});visited();status(groove?`H ${h} point leaves a permanent groove.`:`H ${h} point leaves no permanent groove. Wipe away any loose material.`);draw()}
function keyboardScratch(){if(animation)return;const a={x:435,y:295},b={x:560,y:325};const start={...tool};tween(850,t=>{tool.x=start.x+(b.x+80-start.x)*t;tool.y=start.y+(b.y-80-start.y)*t},()=>{scratch(a,b);tool.x=780;tool.y=230})}
function addTrail(a,b){const length=Math.hypot(b.x-a.x,b.y-a.y);state.trails.push({a,b});state.streakLength+=length;if(state.streakLength>80){visited();status(mineral().h>=7?'The specimen scratches the tile; this is not a reliable mineral powder streak.':'A powdered trail remains on the unglazed surface. Record its colour.')}}
function keyboardStreak(){if(animation)return;const start={...sprite};let previous={x:415,y:290};tween(1100,t=>{sprite.x=415+220*t;sprite.y=290+80*t;sprite.w=135;const p={x:sprite.x,y:sprite.y+35};if(t>.03)addTrail(previous,p);previous=p},()=>{Object.assign(sprite,start);draw()})}
function dropAcid(x,y){if(animation)return;if(!state.ppe){status('Select eye protection before handling the simulated acid.');return}const a={...tool};tween(900,t=>{tool.x=a.x+(x-a.x)*t;tool.y=a.y+(y-150-a.y)*t},()=>{state.drops.push({x,y,time:performance.now()});state.reaction=true;visited();status(mineral().acid?'Bubbles form where the acid contacts the surface.':'The surface becomes wet. No bubbles are visible.');tool.x=780;tool.y=230;requestDraw()})}
function reset(){if(animation){animation=null}drag=null;const s=state.station;
 if(s==='mass'){state.loaded=false;state.stable=false;state.tared=false}
 if(s==='volume'){state.immersed=false;state.water=state.initial}
 if(s==='scratch'){state.scratches=[];state.scratchTests.clear()}
 if(s==='streak'){state.trails=[];state.streakLength=0}
 if(s==='acid'){state.drops=[];state.reaction=false}
 if(s==='observe'){state.angle=0;state.light=65;state.magnify=1}
 state.visited.delete(s);positionObjects();controls();updateProgress();status('Test reset. Your notebook entries are retained for comparison.');draw();
}
// All interaction coordinates belong to this one untransformed 1000 × 620 surface.
function pointer(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1000/r.width,y:(e.clientY-r.top)*620/r.height}}
function within(p,x,y,w,h){return p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h}
function onSample(p,pad=20){return within(p,sprite.x-sprite.w/2-pad,sprite.y-sprite.w*.65-pad,sprite.w+pad*2,sprite.w*1.3+pad*2)}
canvas.addEventListener('pointerdown',e=>{if(animation)return;const p=pointer(e),s=state.station;
 if(s==='mass'&&within(p,724,383,55,55)){tare();return}
 let kind='';if(['mass','volume','streak'].includes(s)&&onSample(p)&&!(s==='mass'&&state.loaded)&&!(s==='volume'&&state.immersed))kind='sample';
 if(s==='observe'&&onSample(p,60))kind='rotate';
 if(s==='scratch'&&(within(p,tool.x-100,tool.y-90,170,200)||onSample(p,25)))kind='scratch';
 if(s==='acid'&&within(p,tool.x-48,tool.y-80,96,230)){if(!state.ppe){status('Put on simulated eye protection first.');return}kind='dropper'}
 if(!kind)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);drag={kind,start:p,last:p,offset:{x:p.x-sprite.x,y:p.y-sprite.y},toolOffset:{x:p.x-tool.x,y:p.y-tool.y},length:0,contact:0};
 if(kind==='scratch'&&onSample(p,25))drag.toolOffset={x:-80,y:80};
 if(kind==='sample')status('Drag onto the instrument; release when the target is highlighted.');draw();
});
canvas.addEventListener('pointermove',e=>{const p=pointer(e);if(!drag)return;e.preventDefault();const d=drag;d.length+=Math.hypot(p.x-d.last.x,p.y-d.last.y);
 if(d.kind==='sample'){sprite.x=Math.max(45,Math.min(955,p.x-d.offset.x));sprite.y=Math.max(55,Math.min(560,p.y-d.offset.y));if(state.station==='streak'){const contact={x:sprite.x,y:sprite.y+35};if(within(contact,340,220,460,250)){if(d.prevContact)addTrail(d.prevContact,contact);d.prevContact=contact}else d.prevContact=null}}
 if(d.kind==='rotate'){state.angle+=(p.x-d.last.x)*.006;visited()}
 if(d.kind==='scratch'){tool.x=p.x-d.toolOffset.x;tool.y=p.y-d.toolOffset.y;const tip={x:tool.x-80,y:tool.y+80};if(onSample(tip,-20)){d.contact+=Math.hypot(p.x-d.last.x,p.y-d.last.y);d.firstContact??=tip;d.lastContact=tip}}
 if(d.kind==='dropper'){tool.x=p.x-d.toolOffset.x;tool.y=p.y-d.toolOffset.y}
 d.last=p;draw();
});
canvas.addEventListener('pointerup',e=>{if(!drag)return;const d=drag,p=pointer(e);drag=null;canvas.releasePointerCapture?.(e.pointerId);
 if(d.kind==='sample'){if(state.station==='mass'&&within({x:sprite.x,y:sprite.y},510,130,320,220))loadMass();else if(state.station==='volume'&&within({x:sprite.x,y:sprite.y},560,30,180,470))immerse();else {positionObjects();if(state.station!=='streak')status('Move the specimen over the highlighted instrument and release.')}}
 if(d.kind==='scratch'){if(d.contact>45)scratch(d.firstContact,d.lastContact);else status('Drag the selected point across the mineral surface to make a test.');tool.x=780;tool.y=230}
 if(d.kind==='dropper'){const tip={x:tool.x,y:tool.y+145};if(within(tip,350,170,310,290)||onSample(p,45))dropAcid(Math.max(410,Math.min(580,tip.x)),Math.max(240,Math.min(380,tip.y)));else{status('Bring the glass tip over the specimen, then release.');tool.x=780;tool.y=230}}
 draw();
});
canvas.addEventListener('pointercancel',()=>{drag=null;positionObjects();draw()});
function grad(x,y,w,h,stops){const g=ctx.createLinearGradient(x,y,x+w,y+h);stops.forEach(([p,c])=>g.addColorStop(p,c));return g}
function box(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill,stroke){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function text(t,x,y,size=15,colour='#63746a',align='left',font='sans-serif'){ctx.font=`${size}px ${font}`;ctx.fillStyle=colour;ctx.textAlign=align;ctx.fillText(t,x,y)}
function line(x1,y1,x2,y2,col,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke()}
function shadow(x,y,rx,ry){ctx.save();ctx.filter='blur(12px)';ellipse(x,y,rx,ry,'#26382c22');ctx.restore()}
function sample(x=sprite.x,y=sprite.y,w=sprite.w,angle=0){if(!atlasOK)return;const image=mineralSprites[state.index],h=w*image.height/image.width;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(image,-w/2,-h/2,w,h);ctx.restore()}
function equip(cell,x,y,w,h){if(!equipmentOK)return false;ctx.save();ctx.beginPath();ctx.rect(x,y,w,cell===0?h*.88:h);ctx.clip();ctx.drawImage(equipmentSprites[cell],x,y,w,h);ctx.restore();return true}
function tray(){shadow(210,490,120,13);ellipse(210,468,135,30,'#d5d9d2','#b7c2b7');ellipse(210,460,135,27,'#edf0e9','#bdc6bd');ellipse(210,460,116,19,'#e1e5dd');text('SPECIMEN TRAY',210,532,12,'#89958b','center')}
function target(x,y,w,h){ctx.save();ctx.setLineDash([7,6]);box(x,y,w,h,16,'#497b5b0c','#779982');ctx.restore()}
function drawMass(){
 tray();shadow(670,494,170,20);
 if(equipmentOK){
  equip(0,430,170,460,420);
  ctx.save();ctx.translate(549,389);ctx.rotate(.125);
  text(!state.tared?'0.3':state.loaded?(state.stable?state.mass.toFixed(1):(state.mass+(Math.sin(lastTime*.03)*.3)).toFixed(1)):'0.0',0,0,32,'#d9ebce');text('g',133,0,16,'#bfd6b3');ctx.restore();
  if(drag?.kind==='sample')target(515,150,310,170);sample();text('PRECISION BALANCE · 0.1 g',675,571,12,'#82917f','center');return;
 }
 // Photographic body with a calibrated, live display drawn in the same coordinate space.
 if(!equip(0,470,140,400,365))box(495,335,350,160,20,grad(495,330,330,150,[[0,'#fcfdfc'],[.6,'#d9dfdc'],[1,'#b6c0bd']]),'#acb6b1');
 box(538,350,250,112,10,grad(538,350,0,112,[[0,'#e9eeea'],[1,'#c9d3cd']]),'#a3b1a8');
 box(554,366,210,52,5,'#253b34','#88978c');text(!state.tared?'0.3':state.loaded?(state.stable?state.mass.toFixed(1):(state.mass+(Math.sin(lastTime*.03)*.3)).toFixed(1)):'0.0',652,401,32,'#d7ebcb','center','monospace');text('g',745,400,16,'#bfd6b3');
 box(675,431,75,32,5,'#426957');text('TARE',712,452,12,'white','center');text('0.1 g',570,449,12,'#5e7465');
 box(657,289,26,57,3,grad(657,0,26,0,[[0,'#a0adab'],[.4,'#f6fbfa'],[1,'#778d84']]));
 const down=state.loaded?5:0;ellipse(670,294+down,143,28,grad(525,280,285,50,[[0,'#91a3a0'],[.3,'#eef4f3'],[.7,'#c8d3d0'],[1,'#788e84']]),'#7e9589');ellipse(670,286+down,140,25,'#edf1ef','#b9c6bf');ellipse(670,286+down,127,18,grad(540,268,260,25,[[0,'#dbe3df'],[.5,'#fdfefd'],[1,'#bccbc4']]));
 if(drag?.kind==='sample')target(515,150,310,170);sample();text('PRECISION BALANCE',670,532,12,'#89958b','center');
}
const scaleY=v=>500-v*6;
function drawVolume(){
 tray();shadow(650,525,115,15);ellipse(650,520,104,22,'#c2cdca88','#bac6c2');ellipse(650,513,103,18,'#e8eeebbb','#b7c5bf');
 const y=scaleY(state.water);
 box(589,95,122,407,14,grad(589,0,122,0,[[0,'#b5d0d12b'],[.13,'#ffffffa0'],[.45,'#ffffff10'],[.83,'#a9c0be30'],[1,'#a2b7b970']]),'#a9bdb7');
 ctx.save();ctx.beginPath();ctx.rect(596,100,108,399);ctx.clip();box(596,y,108,500-y,0,grad(596,y,108,160,[[0,'#a6d0cb88'],[.5,'#bee1d990'],[1,'#8fbbb4b0']]));if(state.immersed||animation)sample();ctx.restore();
 ctx.beginPath();ctx.moveTo(597,y-5);ctx.quadraticCurveTo(650,y+5,703,y-5);ctx.strokeStyle='#477d77';ctx.lineWidth=2;ctx.stroke();
 for(let v=0;v<=65;v++){const sy=scaleY(v),major=v%5===0;line(668,sy,major?701:687,sy,'#3f5a51',major?1.6:.85);if(major)text(String(v),659,sy+4,14,'#365449','right','monospace')}
 ellipse(650,95,62,9,'#f1f8f660','#9aafa7');line(600,111,600,480,'#ffffffbb',4);text('mL',650,75,15,'#48665a','center');
 if(!state.immersed&&!animation)sample();if(drag?.kind==='sample')target(570,58,160,430);
 box(790,153,158,290,10,'#ffffffd9','#d8dfd6');text('EYE-LEVEL DETAIL',869,178,11,'#6b7e6e','center');
 // Detail window uses the exact same linear calibration as the full cylinder.
 const low=Math.floor(state.water/5)*5-7,high=low+14,dy=v=>410-(v-low)*14;
 ctx.save();ctx.beginPath();ctx.rect(800,198,138,222);ctx.clip();box(805,dy(state.water),125,230,0,'#b8dcd488');
 for(let v=low;v<=high;v++){const sy=dy(v);line(857,sy,v%5===0?927:911,sy,'#476154',1);text(String(v),846,sy+5,15,'#365449','right','monospace')}
 ctx.beginPath();ctx.moveTo(805,dy(state.water)-7);ctx.quadraticCurveTo(865,dy(state.water)+7,930,dy(state.water)-7);ctx.strokeStyle='#467b72';ctx.lineWidth=2;ctx.stroke();ctx.restore();
 text('1 mL per division',869,463,13,'#62786a','center');text(mineral().soluble?'NON-AQUEOUS LIQUID':'WATER DISPLACEMENT',650,561,12,'#7e8c80','center');
}
function drawObserve(){shadow(500,480,205,23);ellipse(500,465,224,42,'#c6cfc5','#a9b8aa');ellipse(500,455,223,36,'#f2f3ee','#cad3c6');ctx.save();ctx.filter=`brightness(${.7+state.light/170})`;sample(500,295,285*state.magnify,state.angle);ctx.restore();text('DRAG TO TURN · ENLARGE TO EXAMINE',500,546,13,'#7c8b7e','center');text('Surface view',850,520,12,'#879486','center')}
function drawStylus(x=tool.x,y=tool.y){if(equipmentOK){equip(3,x-100,y-100,200,200);text(points[state.scratchTool].label,x+50,y-105,15,'#566b5c');return}ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);box(-13,-80,26,130,9,grad(-13,0,26,0,[[0,'#9c592a'],[.4,'#e1a66a'],[1,'#9e683f']]),'#986642');box(-5,47,10,61,2,grad(-5,0,10,0,[[0,'#708080'],[.4,'#f3f8f7'],[1,'#697c75']]));ctx.beginPath();ctx.moveTo(-5,107);ctx.lineTo(0,120);ctx.lineTo(5,107);ctx.fillStyle='#738580';ctx.fill();ctx.restore();text(points[state.scratchTool].label,x+50,y-65,15,'#566b5c');}
function drawScratch(){shadow(500,476,235,20);box(285,180,430,310,12,grad(285,180,0,300,[[0,'#eceee8'],[1,'#d6ddd2']]),'#bdc9bb');sample();
 for(const s of state.scratches){line(s.a.x,s.a.y,s.b.x,s.b.y,s.groove?'#41463bd0':'#c7ba9977',s.groove?3:6);if(s.groove)line(s.a.x,s.a.y+2,s.b.x,s.b.y+2,'#fff9',1)}drawStylus();text('SCRATCH TEST SURFACE',500,537,12,'#82917f','center');text('Grab the orange handle',792,407,13,'#6b7c6c','center');}
function drawStreak(){shadow(550,486,240,18);box(327,203,486,285,9,'#babdb1');box(330,195,480,285,8,grad(330,195,480,285,[[0,'#eeeae0'],[.5,'#dbdbd0'],[1,'#c6cabe']]),'#bcc3b5');
 if(equipmentOK){ctx.fillStyle='#f1f3ed';ctx.fillRect(310,180,520,325);ctx.save();ctx.globalCompositeOperation='multiply';ctx.drawImage(equipment,equipment.width*.525,equipment.height*.105,equipment.width*.448,equipment.height*.282,330,195,480,285);ctx.restore()}
 // Fine, deterministic ceramic grain; no decorative border around the powder.
 ctx.save();ctx.globalAlpha=.12;for(let i=0;i<450;i++){ctx.fillStyle=i%2?'#fff':'#6c7064';ctx.fillRect(340+(i*137%457),204+(i*79%264),1,1)}ctx.restore();
 for(const [index,s] of state.trails.entries()){
  ctx.save();ctx.lineCap='round';ctx.globalAlpha=.45;line(s.a.x,s.a.y,s.b.x,s.b.y,mineral().colour,mineral().h>=7?1.4:5);
  const length=Math.hypot(s.b.x-s.a.x,s.b.y-s.a.y);for(let i=0;i<Math.ceil(length*2);i++){const t=i/Math.max(1,Math.ceil(length*2));const noise=Math.sin((index*39+i)*78.233)*43758.54;const offset=(noise-Math.floor(noise)-.5)*12;ctx.globalAlpha=.2+Math.abs(Math.sin(i*5+index))*.5;ellipse(s.a.x+(s.b.x-s.a.x)*t,s.a.y+(s.b.y-s.a.y)*t+offset,.5+Math.abs(Math.sin(i)),.5,mineral().colour)}ctx.restore();
 }sample();text('UNGLAZED PORCELAIN · MOHS ≈ 6.5',568,533,12,'#7c8c7c','center');}
function drawPipette(){const x=tool.x,y=tool.y;ctx.save();ctx.translate(x,y);box(-20,-60,40,75,18,grad(-20,0,40,0,[[0,'#222a29'],[.4,'#616966'],[1,'#1e2724']]),'#1c2422');box(-8,10,16,108,5,grad(-8,0,16,0,[[0,'#92b0aa80'],[.4,'#ffffffaa'],[1,'#709b9380']]),'#94aaa1');ctx.beginPath();ctx.moveTo(-8,111);ctx.lineTo(-2,146);ctx.lineTo(2,146);ctx.lineTo(8,111);ctx.closePath();ctx.fillStyle='#c8ddd699';ctx.fill();line(-3,28,-3,114,'#fafffd',2);ctx.restore();}
function photographicPipette(){if(!equipmentOK){drawPipette();return}ctx.save();ctx.globalCompositeOperation='multiply';ctx.drawImage(equipment,equipment.width*.207,equipment.height*.47,equipment.width*.075,equipment.height*.51,tool.x-20,tool.y-65,40,215);ctx.restore()}
function drawAcid(now){shadow(500,479,225,20);ellipse(500,451,218,47,'#c2ccc9','#a7b9b0');ellipse(500,440,218,47,'#f1f5f2','#afc0b6');ellipse(500,440,198,35,'#e3e9e3');sample();
 for(const d of state.drops){const age=now-d.time;if(age<220){ellipse(d.x,d.y-45+45*(age/220)**2,3,5,'#a0cbc6','#6eaaa0');continue}ellipse(d.x,d.y,14,7,'#8dbdb670','#91b4a4');if(age<4500&&mineral().acid){for(let i=0;i<16;i++){const t=((age/900+i*.17)%1);ellipse(d.x+Math.sin(i*8)*24,d.y-t*65,2+Math.sin(i)*1.2,2+Math.sin(i)*1.2,`rgba(244,252,247,${1-t})`,`rgba(84,140,119,${1-t})`)}}}
 photographicPipette();if(drag?.kind==='dropper')target(355,200,290,210);text('DILUTE HCl · ONE DROP',790,448,12,'#768873','center');text(state.ppe?'EYE PROTECTION ON':'SELECT EYE PROTECTION BELOW',500,540,12,state.ppe?'#477256':'#a4773c','center');}
function draw(now=performance.now()){if(!state)return;ctx.setTransform(canvas.width/1000,0,0,canvas.height/620,0,0);ctx.clearRect(0,0,1000,620);ctx.fillStyle=grad(0,0,0,620,[[0,'#f8f9f5'],[.55,'#f1f3ed'],[1,'#e8ece3']]);ctx.fillRect(0,0,1000,620);line(0,560,1000,560,'#dce2d6',1);({mass:drawMass,volume:drawVolume,observe:drawObserve,scratch:drawScratch,streak:drawStreak,acid:()=>drawAcid(now)})[state.station]()}
function resize(){const r=canvas.getBoundingClientRect(),ratio=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(r.width*ratio);canvas.height=Math.round(r.width*620/1000*ratio);draw()}
function setSheet(name){document.querySelectorAll('.sheet').forEach(s=>s.hidden=s.id!==`sheet-${name}`);document.querySelectorAll('[data-sheet]').forEach(b=>b.classList.toggle('selected',b.dataset.sheet===name))}
function feedback(id,message,error=false){const e=$(id);e.textContent=message;e.classList.toggle('error',error)}
function checkMeasurements(){const n=id=>$(id).value.trim()===''?NaN:Number($(id).value),errors=[];
 if(!state.stable)errors.push('Measure a stable mass first');else if(Math.abs(n('#mass')-state.mass)>.11||!Number.isFinite(n('#mass')))errors.push('Recheck the balance reading');
 if(!state.immersed)errors.push('Immerse the specimen');
 if(!Number.isFinite(n('#initial'))||Math.abs(n('#initial')-state.initial)>.26)errors.push('Recheck the initial meniscus');
 if(!Number.isFinite(n('#final'))||Math.abs(n('#final')-(state.initial+state.volume))>.26)errors.push('Recheck the final meniscus');
 if(!Number.isFinite(n('#volume'))||Math.abs(n('#volume')-(n('#final')-n('#initial')))>.11||n('#volume')<=0)errors.push('Volume must equal final minus initial');
 const expected=n('#mass')/n('#volume');if(!Number.isFinite(n('#density'))||!Number.isFinite(expected)||Math.abs(n('#density')-expected)>.03)errors.push('Recalculate mass ÷ volume');
 feedback('#measurement-feedback',errors.length?errors.join('. ')+'.':'Your readings and density calculation agree.',!!errors.length);return !errors.length}
function saveObservations(){
 const missing=['#lustre','#habit','#scratch-notes','#streak','#reaction'].filter(id=>!$(id).value.trim());const procedures=['observe','scratch','streak','acid'].filter(s=>!state.visited.has(s));
 if(missing.length||procedures.length){feedback('#observation-feedback','Complete the observation fields and explore all four observation stations.',true);return false}
 if(state.scratchTests.size<2){feedback('#observation-feedback','Compare at least two hardness points and record the results.',true);return false}
 const expected={'#lustre':mineral().lustre,'#habit':mineral().habit,'#streak':mineral().streak,'#reaction':mineral().acid?'Bubbles / effervescence':'No visible reaction'};
 const conflicting=Object.entries(expected).filter(([id,value])=>$(id).value!==value).map(([id])=>({'#lustre':'lustre','#habit':'crystal form','#streak':'streak','#reaction':'acid reaction'}[id]));
 if(conflicting.length){feedback('#observation-feedback',`Revisit your ${conflicting.join(', ')} observations and compare the field guide.`,true);return false}
 feedback('#observation-feedback','Observations recorded. Compare them with the field guide.');return true;
}
function identify(){const measured=checkMeasurements(),observed=saveObservations();if(!measured||!observed){feedback('#identification-feedback','Complete and check your measurements and observations before identifying the sample.',true);return}if($('#claim').value.trim().split(/\s+/).length<8){feedback('#identification-feedback','Explain your claim using at least two observations.',true);return}if($('#candidate').value!==mineral().name){feedback('#identification-feedback','That identification does not match all the evidence. Compare the field guide again.',true);return}state.solved=true;feedback('#identification-feedback',`Identified: ${mineral().name}. Compare your explanation with its properties in the field guide.`)}
stations.forEach(([id,label,icon])=>{const b=document.createElement('button');b.dataset.station=id;b.setAttribute('aria-label',label);b.innerHTML=`<span aria-hidden="true">${icon}</span>${label}`;b.onclick=()=>selectStation(id);$('#stations').append(b)});
minerals.forEach(m=>{const option=document.createElement('option');option.textContent=m.name;$('#candidate').append(option);const row=document.createElement('tr');[m.name,m.density.toFixed(2),String(m.h),m.lustre,m.streak,m.acid?'Bubbles':'No visible reaction',m.habit].forEach(t=>{const td=document.createElement('td');td.textContent=t;row.append(td)});$('#key-body').append(row)});
document.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>setSheet(b.dataset.sheet));document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#help').onclick=()=>$('#help-dialog').showModal();$('#about').onclick=()=>$('#about-dialog').showModal();$('#open-key').onclick=$('#key-shortcut').onclick=()=>$('#guide').showModal();$('#next').onclick=()=>{if(!animation)newCase()};$('#reset').onclick=reset;$('#enlarge').onclick=()=>{document.body.classList.toggle('expanded');resize()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('expanded');resize()}});$('#check-measurements').onclick=checkMeasurements;$('#save-observations').onclick=saveObservations;$('#identify').onclick=identify;
atlas.onload=()=>{for(let i=0;i<8;i++){const cw=atlas.width/4,ch=atlas.height/2;mineralSprites.push(cutout(atlas,(i%4)*cw,Math.floor(i/4)*ch,cw,ch))}atlasOK=true;$('#loading').hidden=true;draw()};atlas.onerror=()=>{$('#loading').textContent='The specimen image could not load. Refresh to try again.'};equipment.onload=()=>{for(let i=0;i<4;i++){const cw=equipment.width/2,ch=equipment.height/2;equipmentSprites.push(cutout(equipment,(i%2)*cw,Math.floor(i/2)*ch,cw,ch))}equipmentOK=true;draw()};equipment.onerror=()=>{equipmentOK=false;draw()};
newCase();new ResizeObserver(resize).observe(canvas.parentElement);document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestDraw()});

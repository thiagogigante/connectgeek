const galleryTrack=document.getElementById('galleryTrack');
const activityCategories={
  inicio:{label:'Programação Completa',prefix:'inicio',extension:'png',count:1},
  arenagamer:{label:'Arena Gamer',prefix:'arenagamer',count:5},
  cosplay:{label:'Cosplay',prefix:'cosplay',count:4},
  oficinas:{label:'Oficinas',prefix:'oficinas',count:5},
  kpop:{label:'K-Pop',prefix:'kpop',count:7},
  joganerd:{label:'Joga Nerd',prefix:'joganerd',count:4},
  expositores:{label:'Expositores',prefix:'expositor',extension:'png',count:13},
  palco:{label:'Palco',prefix:'palco',count:9},
  alimentacao:{label:'Alimentação',prefix:'alimentacao',count:5,pngFrom:4},
  extra:{label:'Bônus',prefix:'extra',extension:'png',count:3}
};
let activeCategory='inicio';
let activeCardIndex=0;
const categoryKeys=Object.keys(activityCategories);
const renderActivityCards=(category,direction=0,startOffset=0)=>{
  const previousCard=galleryTrack.querySelector('.gallery-item:not(.is-leaving)');
  const outgoing=direction&&previousCard?previousCard.cloneNode(true):null;
  galleryTrack.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
  const {label,prefix,extension='jpg',pngFrom=Infinity}=activityCategories[category];
  const number=String(activeCardIndex+1).padStart(2,'0');
  const fileExtension=activeCardIndex+1>=pngFrom?'png':extension;
  galleryTrack.innerHTML=`<article class="gallery-item"><button class="gallery-image" type="button" aria-label="Ampliar ${label} ${number}" aria-haspopup="dialog"><img src="assets/cards/${prefix}_${number}.${fileExtension}" alt="${label} ${number}" draggable="false"></button></article>`;
  if(outgoing&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const incoming=galleryTrack.querySelector('.gallery-item');
    const distance=galleryTrack.clientWidth+16;
    const options={duration:280,easing:'cubic-bezier(.22,.61,.36,1)'};
    outgoing.classList.add('is-leaving');
    outgoing.setAttribute('aria-hidden','true');
    outgoing.inert=true;
    outgoing.style.transform='';
    galleryTrack.append(outgoing);
    outgoing.animate([
      {transform:`translateX(${startOffset}px)`},
      {transform:`translateX(${-direction*distance}px)`}
    ],options).finished.catch(()=>{}).then(()=>outgoing.remove());
    incoming.animate([
      {transform:`translateX(${direction*distance+startOffset}px)`},
      {transform:'translateX(0)'}
    ],options);
  }
  galleryTrack.querySelectorAll('img').forEach(image=>image.addEventListener('error',()=>{
    image.closest('.gallery-item').remove();
    if(!galleryTrack.children.length)galleryTrack.innerHTML='<p class="gallery-empty">Novidades em breve nesta categoria.</p>';
  },{once:true}));
};
const selectActivityCategory=(category,cardIndex=0,direction=0,startOffset=0)=>{
  activeCategory=category;
  activeCardIndex=cardIndex;
  document.querySelectorAll('.activity-filter').forEach(button=>{
    const isActive=button.dataset.category===category;
    button.classList.toggle('is-active',isActive);
    button.setAttribute('aria-pressed',String(isActive));
  });
  renderActivityCards(category,direction,startOffset);
};
document.querySelectorAll('.activity-filter').forEach(button=>button.addEventListener('click',()=>{
  const direction=categoryKeys.indexOf(button.dataset.category)>=categoryKeys.indexOf(activeCategory)?1:-1;
  selectActivityCategory(button.dataset.category,0,direction);
}));
selectActivityCategory(activeCategory);
const scrollGallery=(direction,startOffset=0)=>{
  const nextCardIndex=activeCardIndex+direction;
  if(nextCardIndex>=0&&nextCardIndex<activityCategories[activeCategory].count){
    activeCardIndex=nextCardIndex;
    renderActivityCards(activeCategory,direction,startOffset);
    return;
  }
  const nextCategoryIndex=(categoryKeys.indexOf(activeCategory)+direction+categoryKeys.length)%categoryKeys.length;
  const nextCategory=categoryKeys[nextCategoryIndex];
  selectActivityCategory(nextCategory,direction>0?0:activityCategories[nextCategory].count-1,direction,startOffset);
};
document.querySelector('.gallery-control.prev').addEventListener('click',()=>scrollGallery(-1));
document.querySelector('.gallery-control.next').addEventListener('click',()=>scrollGallery(1));

let galleryDrag=null,suppressGalleryClickUntil=0;
galleryTrack.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  const card=galleryTrack.querySelector('.gallery-item:not(.is-leaving)');
  if(!card)return;
  suppressGalleryClickUntil=0;
  galleryDrag={id:event.pointerId,x:event.clientX,y:event.clientY,offset:0,dragging:false,card};
});
galleryTrack.addEventListener('pointermove',event=>{
  if(!galleryDrag||event.pointerId!==galleryDrag.id)return;
  const dx=event.clientX-galleryDrag.x,dy=event.clientY-galleryDrag.y;
  if(!galleryDrag.dragging){
    if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){galleryDrag=null;return}
    if(Math.abs(dx)<8||Math.abs(dx)<=Math.abs(dy))return;
    galleryDrag.dragging=true;
    galleryTrack.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    galleryTrack.setPointerCapture(event.pointerId);
    galleryTrack.classList.add('is-dragging');
  }
  galleryDrag.offset=dx;
  galleryDrag.card.style.transform=`translateX(${dx}px)`;
});
const endGalleryDrag=event=>{
  if(!galleryDrag||event.pointerId!==galleryDrag.id)return;
  const drag=galleryDrag;
  galleryDrag=null;
  galleryTrack.classList.remove('is-dragging');
  if(!drag.dragging)return;
  suppressGalleryClickUntil=performance.now()+400;
  drag.card.style.transform='';
  if(event.type==='pointerup'&&Math.abs(drag.offset)>=Math.min(72,galleryTrack.clientWidth*.2)){
    scrollGallery(drag.offset<0?1:-1,drag.offset);
  }else if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    drag.card.animate([{transform:`translateX(${drag.offset}px)`},{transform:'translateX(0)'}],{duration:180,easing:'ease-out'});
  }
};
galleryTrack.addEventListener('pointerup',endGalleryDrag);
galleryTrack.addEventListener('pointercancel',endGalleryDrag);
galleryTrack.addEventListener('lostpointercapture',endGalleryDrag);

const imageZoom=document.getElementById('imageZoom');
const zoomStage=document.getElementById('zoomStage');
const zoomImage=document.getElementById('zoomImage');
const closeImageZoom=document.getElementById('closeImageZoom');
const zoomPointers=new Map();
let zoomScale=1,zoomX=0,zoomY=0;
const updateImageZoom=()=>{
  const maxX=Math.max(0,(zoomImage.offsetWidth*zoomScale-zoomStage.clientWidth)/2);
  const maxY=Math.max(0,(zoomImage.offsetHeight*zoomScale-zoomStage.clientHeight)/2);
  zoomX=Math.max(-maxX,Math.min(maxX,zoomX));
  zoomY=Math.max(-maxY,Math.min(maxY,zoomY));
  zoomImage.style.transform=`translate(${zoomX}px,${zoomY}px) scale(${zoomScale})`;
  zoomStage.classList.toggle('is-zoomed',zoomScale>1);
};
const zoomAt=(scale,point)=>{
  const nextScale=Math.max(1,Math.min(5,scale));
  const ratio=nextScale/zoomScale;
  zoomX=point.x-(point.x-zoomX)*ratio;
  zoomY=point.y-(point.y-zoomY)*ratio;
  zoomScale=nextScale;
};
const zoomPoint=event=>{
  const bounds=zoomStage.getBoundingClientRect();
  return {x:event.clientX-bounds.left-bounds.width/2,y:event.clientY-bounds.top-bounds.height/2};
};
const pointerGesture=()=>{
  const points=Array.from(zoomPointers.values()).slice(0,2);
  if(points.length===1)return {center:points[0],distance:0};
  return {
    center:{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2},
    distance:Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)
  };
};
const openImageZoom=image=>{
  zoomScale=1;zoomX=0;zoomY=0;
  zoomPointers.clear();
  zoomImage.src=image.currentSrc||image.src;
  zoomImage.alt=image.alt;
  imageZoom.showModal();
  document.body.classList.add('image-zoom-open');
  updateImageZoom();
  closeImageZoom.focus();
};
galleryTrack.addEventListener('click',event=>{
  if(event.detail!==0&&performance.now()<suppressGalleryClickUntil){event.preventDefault();return}
  const button=event.target.closest('.gallery-image');
  if(button)openImageZoom(button.querySelector('img'));
});
const eventMapImage=document.getElementById('eventMapImage');
eventMapImage.addEventListener('click',()=>openImageZoom(eventMapImage.querySelector('img')));
closeImageZoom.addEventListener('click',()=>imageZoom.close());
imageZoom.addEventListener('close',()=>{
  document.body.classList.remove('image-zoom-open');
  zoomPointers.clear();
  zoomScale=1;zoomX=0;zoomY=0;
  updateImageZoom();
  zoomImage.removeAttribute('src');
});
zoomImage.addEventListener('load',updateImageZoom);
window.addEventListener('resize',()=>{if(imageZoom.open)updateImageZoom()});
zoomStage.addEventListener('wheel',event=>{
  event.preventDefault();
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?zoomStage.clientHeight:1);
  zoomAt(zoomScale*Math.exp(-delta*.002),zoomPoint(event));
  updateImageZoom();
},{passive:false});
zoomStage.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  zoomPointers.set(event.pointerId,zoomPoint(event));
  zoomStage.setPointerCapture(event.pointerId);
});
zoomStage.addEventListener('pointermove',event=>{
  if(!zoomPointers.has(event.pointerId))return;
  const previous=pointerGesture();
  zoomPointers.set(event.pointerId,zoomPoint(event));
  const current=pointerGesture();
  if(zoomPointers.size>1&&previous.distance>0){
    zoomAt(zoomScale*current.distance/previous.distance,previous.center);
  }
  zoomX+=current.center.x-previous.center.x;
  zoomY+=current.center.y-previous.center.y;
  updateImageZoom();
});
const releaseZoomPointer=event=>zoomPointers.delete(event.pointerId);
zoomStage.addEventListener('pointerup',releaseZoomPointer);
zoomStage.addEventListener('pointercancel',releaseZoomPointer);
zoomStage.addEventListener('lostpointercapture',releaseZoomPointer);

const logoFiles={
  realizacao:['realizacao-1.png','realizacao-2.png'],
  coproducao:['co-1.png','co-2.png','co-3.png','co-4.png','co-5.png','co-6.png','co-7.png','co-8.png','co-9.png','co-10.png','co-11.png','co-12.png'],
  apoio:['apoio-1.png','apoio-2.png','apoio-.png','apoio-4.png','apoio-5.png','apoio-6.png','apoio-7.png','apoio-8.png','apoio-9.png','apoio-10.png','apoio-11.png','apoio-12.png','apoio-13.png','apoio-14.png','apoio-15.png','apoio-16.png'],
};
document.querySelectorAll('[data-logos]').forEach(grid=>{const group=grid.dataset.logos;grid.innerHTML=logoFiles[group].map((file,index)=>`<div class="partner-logo">${file?`<img src="assets/logos/${file}" alt="Logo ${index+1}">`:''}<span${file?' hidden':''}>LOGO ${index+1}</span></div>`).join('')});

const MAP_EMBED_URL='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.9233033630803!2d-43.04167102552442!3d-22.65664802897767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x99a318028c5d5f%3A0x705960b1d2c144a!2sShopping%20da%20Pra%C3%A7a!5e0!3m2!1spt-BR!2sbr!4v1789499671583!5m2!1spt-BR!2sbr';
if(MAP_EMBED_URL){document.getElementById('mapFrame').src=MAP_EMBED_URL;document.getElementById('mapFrame').classList.remove('is-hidden');document.getElementById('mapPlaceholder').classList.add('is-hidden')}

const modal=document.getElementById('modal');
const showSoon=event=>{event.preventDefault();modal.classList.add('active');modal.setAttribute('aria-hidden','false');document.getElementById('closeModal').focus()};
document.querySelectorAll('[data-soon]').forEach(item=>item.addEventListener('click',showSoon));
document.querySelectorAll('.link-card').forEach((card,index)=>{
  if(index<4&&card.dataset.registration!=='closed'){
    card.querySelector('.status-tag.open').hidden=false;
    card.querySelector('.status-tag.soon').hidden=true;
  }
});
document.querySelector('.links').insertAdjacentHTML('afterend','<p class="registration-notice">ATENÇÃO: As pré-inscrições encerram no dia 05/10/2026.</p>');
document.querySelectorAll('.status-tag.soon:not([hidden])').forEach(tag=>tag.closest('.link-card').addEventListener('click',showSoon));
const closeModal=()=>{modal.classList.remove('active');modal.setAttribute('aria-hidden','true')};
document.getElementById('closeModal').addEventListener('click',closeModal);modal.addEventListener('click',event=>{if(event.target===modal)closeModal()});document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal()});

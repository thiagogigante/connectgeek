const galleryItems=Array.from({length:30},(_,index)=>({label:`Atividade confirmada ${String(index+1).padStart(2,'0')}`,image:`assets/cards/card-${String(index+1).padStart(2,'0')}.png`}));
const galleryTrack=document.getElementById('galleryTrack');
galleryTrack.innerHTML=galleryItems.map(item=>`<article class="gallery-item"><div class="gallery-image"><img src="${item.image}" alt="${item.label}"></div></article>`).join('');
const scrollGallery=direction=>galleryTrack.scrollBy({left:direction*Math.max(224,galleryTrack.clientWidth*.82),behavior:'smooth'});
document.querySelector('.gallery-control.prev').addEventListener('click',()=>scrollGallery(-1));
document.querySelector('.gallery-control.next').addEventListener('click',()=>scrollGallery(1));
let isDown=false,startX=0,startScroll=0,autoScroll;
galleryTrack.addEventListener('pointerdown',event=>{isDown=true;startX=event.clientX;startScroll=galleryTrack.scrollLeft;galleryTrack.classList.add('dragging');if(galleryTrack.setPointerCapture)galleryTrack.setPointerCapture(event.pointerId);stopAutoScroll()});
galleryTrack.addEventListener('pointermove',event=>{if(isDown)galleryTrack.scrollLeft=startScroll-(event.clientX-startX)});
const endDrag=()=>{isDown=false;galleryTrack.classList.remove('dragging');startAutoScroll()};
galleryTrack.addEventListener('pointerup',endDrag);galleryTrack.addEventListener('pointercancel',endDrag);
const stopAutoScroll=()=>clearInterval(autoScroll);
const startAutoScroll=()=>{stopAutoScroll();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)autoScroll=setInterval(()=>{const atEnd=galleryTrack.scrollLeft+galleryTrack.clientWidth>=galleryTrack.scrollWidth-4;galleryTrack.scrollTo({left:atEnd?0:galleryTrack.scrollLeft+224,behavior:'smooth'})},10000)};
galleryTrack.addEventListener('mouseenter',stopAutoScroll);galleryTrack.addEventListener('mouseleave',startAutoScroll);startAutoScroll();

const logoFiles={
  realizacao:['realizacao-1.png','realizacao-2.png'],
  coproducao:['co-1.png','co-2.png','co-3.png','co-4.png','co-5.png','co-6.png','co-7.png','co-8.png','co-9.png','co-10.png','co-11.png','co-12.png'],
  apoio:['apoio-1.png','apoio-2.png','apoio-3.png','apoio-4.png','apoio-5.png','apoio-6.png','apoio-7.png','apoio-8.png']
};
document.querySelectorAll('[data-logos]').forEach(grid=>{const group=grid.dataset.logos;grid.innerHTML=logoFiles[group].map((file,index)=>`<div class="partner-logo">${file?`<img src="assets/logos/${file}" alt="Logo ${index+1}">`:''}<span${file?' hidden':''}>LOGO ${index+1}</span></div>`).join('')});

const MAP_EMBED_URL='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.9233033630803!2d-43.04167102552442!3d-22.65664802897767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x99a318028c5d5f%3A0x705960b1d2c144a!2sShopping%20da%20Pra%C3%A7a!5e0!3m2!1spt-BR!2sbr!4v1789499671583!5m2!1spt-BR!2sbr';
if(MAP_EMBED_URL){document.getElementById('mapFrame').src=MAP_EMBED_URL;document.getElementById('mapFrame').classList.remove('is-hidden');document.getElementById('mapPlaceholder').classList.add('is-hidden')}

const modal=document.getElementById('modal');
const showSoon=event=>{event.preventDefault();modal.classList.add('active');modal.setAttribute('aria-hidden','false');document.getElementById('closeModal').focus()};
document.querySelectorAll('[data-soon]').forEach(item=>item.addEventListener('click',showSoon));
document.querySelectorAll('.link-card').forEach((card,index)=>{
  if(index<3){
    card.querySelector('.status-tag.open').hidden=false;
    card.querySelector('.status-tag.soon').hidden=true;
  }
});
document.querySelectorAll('.status-tag.soon:not([hidden])').forEach(tag=>tag.closest('.link-card').addEventListener('click',showSoon));
const closeModal=()=>{modal.classList.remove('active');modal.setAttribute('aria-hidden','true')};
document.getElementById('closeModal').addEventListener('click',closeModal);modal.addEventListener('click',event=>{if(event.target===modal)closeModal()});document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal()});

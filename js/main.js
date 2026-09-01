const root=document.documentElement,intro=document.querySelector('#intro');
if(intro&&root.classList.contains('intro-pending')){let done=false;const close=()=>{if(done)return;done=true;intro.setAttribute('aria-hidden','true');intro.classList.add('is-leaving');try{sessionStorage.setItem('cp-intro-v3','1')}catch(e){}setTimeout(()=>{root.classList.remove('intro-pending');intro.remove()},450)};document.querySelector('#introSkip')?.addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()},{once:true});setTimeout(close,1950)}else{root.classList.remove('intro-pending');intro?.remove()}

const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.15});reveals.forEach(el=>revealObserver.observe(el))}else reveals.forEach(el=>el.classList.add('is-visible'));

const categoryNav=document.querySelector('.category-nav');
const categoryLinks=[...categoryNav.querySelectorAll('a')];
const categories=categoryLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
const categoryProgress=document.querySelector('#categoryProgress');
const categoryName=document.querySelector('#categoryName');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
categoryNav.setAttribute('role','tablist');

const showCategory=(link,{updateHash=false,focus=false}={})=>{
  const index=categoryLinks.indexOf(link);
  if(index<0)return;
  categoryLinks.forEach((item,itemIndex)=>{
    const active=itemIndex===index;
    item.classList.toggle('active',active);
    item.setAttribute('role','tab');
    item.setAttribute('aria-selected',String(active));
    item.tabIndex=active?0:-1;
    active?item.setAttribute('aria-current','true'):item.removeAttribute('aria-current');
    categories[itemIndex].hidden=!active;
  });
  categoryProgress.textContent=`${String(index+1).padStart(2,'0')} / ${String(categoryLinks.length).padStart(2,'0')}`;
  categoryName.textContent=link.textContent;
  const targetLeft=link.offsetLeft-(categoryNav.clientWidth-link.offsetWidth)/2;
  categoryNav.scrollTo({left:Math.max(0,targetLeft),behavior:reducedMotion?'auto':'smooth'});
  if(updateHash)history.replaceState(null,'',link.hash);
  if(focus)link.focus();
};

categoryLinks.forEach((link,index)=>{
  const panel=categories[index];
  link.id=`category-tab-${panel.id}`;
  link.setAttribute('aria-controls',panel.id);
  panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby',link.id);
  link.addEventListener('click',event=>{event.preventDefault();showCategory(link,{updateHash:true})});
});

categoryNav.addEventListener('keydown',event=>{
  const current=categoryLinks.indexOf(document.activeElement);
  if(current<0)return;
  let next=current;
  if(event.key==='ArrowRight')next=(current+1)%categoryLinks.length;
  else if(event.key==='ArrowLeft')next=(current-1+categoryLinks.length)%categoryLinks.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=categoryLinks.length-1;
  else return;
  event.preventDefault();
  showCategory(categoryLinks[next],{updateHash:true,focus:true});
});

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  if(categoryNav.contains(link))return;
  const categoryLink=categoryLinks.find(item=>item.hash===link.hash);
  if(!categoryLink)return;
  link.addEventListener('click',event=>{
    event.preventDefault();
    showCategory(categoryLink,{updateHash:true});
    document.querySelector('#carta').scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  });
});

const initialCategory=categoryLinks.find(link=>link.hash===location.hash)||categoryLinks[0];
showCategory(initialCategory);

let initialTarget=null;
try{initialTarget=location.hash&&document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch(e){}
if(initialTarget){const scrollTarget=initialTarget.classList.contains('menu-category')?document.querySelector('#carta'):initialTarget;requestAnimationFrame(()=>setTimeout(()=>scrollTarget.scrollIntoView({behavior:'auto',block:'start'}),180))}

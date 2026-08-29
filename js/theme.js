(function(){
  const STORAGE_KEY='flux_theme';
  const allowed=new Set(['blue','red','green','black']);
  const root=document.documentElement;
  const switcher=document.getElementById('themeSwitcher');
  const current=document.getElementById('themeCurrent');
  const options=[...document.querySelectorAll('.theme-option')];

  function setTheme(theme, save=true){
    if(!allowed.has(theme)) theme='blue';
    root.dataset.theme=theme;
    options.forEach(btn=>{
      const active=btn.dataset.theme===theme;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',String(active));
    });
    if(save){
      try{localStorage.setItem(STORAGE_KEY,theme)}catch(e){}
    }
  }

  let saved='blue';
  try{saved=localStorage.getItem(STORAGE_KEY)||'blue'}catch(e){}
  setTheme(saved,false);

  if(!switcher||!current) return;
  current.addEventListener('click',e=>{
    e.stopPropagation();
    const open=switcher.classList.toggle('open');
    current.setAttribute('aria-expanded',String(open));
  });
  options.forEach(btn=>btn.addEventListener('click',()=>{
    setTheme(btn.dataset.theme);
    switcher.classList.remove('open');
    current.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('click',e=>{
    if(!switcher.contains(e.target)){
      switcher.classList.remove('open');
      current.setAttribute('aria-expanded','false');
    }
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      switcher.classList.remove('open');
      current.setAttribute('aria-expanded','false');
    }
  });
})();

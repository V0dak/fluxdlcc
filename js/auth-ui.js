(function(){
  const REFERRAL_BASE = "https://v0dak.github.io/fluxdlcc/";
  const protectedTabs = new Set(["account","security","referral","freeze","roulette","configs"]);
  let authMode = "login";
  let pendingTab = null;

  function currentUser(){
    return localStorage.getItem("flux_user") || "";
  }
  function isLogged(){
    return !!currentUser();
  }
  function getAccount(){ return null; }
  function updateAccountUI(){
    const account = currentUser();
    const profileBtn=document.querySelector(".profile-pill");
    const topAvatar=document.getElementById("topAvatar");
    const topText=document.getElementById("topProfileText");
    if(!account){
      if(profileBtn) profileBtn.classList.add("guest-login");
      if(topText) topText.textContent="Кабинет";
      if(topAvatar) topAvatar.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5"/></svg>';
    }else{
      if(profileBtn) profileBtn.classList.remove("guest-login");
      if(topText) topText.textContent=account;
      if(topAvatar) topAvatar.textContent=(account[0]||"F").toUpperCase();
    }
    document.querySelectorAll(".account-name").forEach(x=>x.textContent=account||"—");
    document.querySelectorAll(".profile-avatar").forEach(x=>x.textContent=account?(account[0]||"F").toUpperCase():"—");
  }

  function setAuthMode(mode){
    authMode = mode || "login";
    const modal=document.querySelector(".login-modal");
    const title=document.getElementById("authTitle");
    const text=document.getElementById("authText");
    const login=document.getElementById("authLogin");
    const pass=document.getElementById("authPass");
    const submit=document.getElementById("authSubmit");
    const sw=document.getElementById("authSwitch");
    const forgot=document.getElementById("forgotSwitch");
    const showPass=document.querySelector(".auth-show-password");

    if(modal){
      modal.classList.remove("auth-login","auth-register","auth-forgot","auth-verify-reset","auth-recovery");
      modal.classList.add("auth-"+authMode);
    }

    if(login){
      login.style.display="";
      login.readOnly=false;
    }
    if(sw) sw.style.display="";
    if(forgot) forgot.style.display="";
    if(showPass) showPass.style.display="";
    if(pass){
      pass.type="password";
      pass.removeAttribute("maxlength");
      pass.removeAttribute("inputmode");
    }

    if(authMode==="register"){
      title.textContent="Создание аккаунта";
      text.innerHTML='Создай аккаунт прямо сейчас · <b>FLUX</b>';
      login.placeholder="E-mail";
      pass.value="";
      pass.placeholder="Придумай пароль";
      pass.autocomplete="new-password";
      submit.textContent="Зарегистрироваться";
      sw.innerHTML='Уже есть аккаунт? <b>Войти</b>';
      forgot.style.display="none";

    }else if(authMode==="forgot"){
      title.textContent="Забыли пароль?";
      text.innerHTML='Введи e-mail аккаунта — мы отправим на него <b>6-значный код</b>.';
      login.placeholder="E-mail";
      pass.value="";
      submit.textContent="Получить код";
      sw.style.display="none";
      forgot.style.display="none";

    }else if(authMode==="verify-reset"){
      title.textContent="Введите код";
      text.innerHTML='Мы отправили 6-значный код на указанную почту. Введи его ниже.';
      login.readOnly=true;
      pass.value="";
      pass.type="text";
      pass.placeholder="000000";
      pass.autocomplete="one-time-code";
      pass.setAttribute("inputmode","numeric");
      pass.setAttribute("maxlength","6");
      if(showPass) showPass.style.display="none";
      submit.textContent="Проверить код";
      sw.style.display="none";
      forgot.style.display="none";

    }else if(authMode==="recovery"){
      title.textContent="Новый пароль";
      text.innerHTML='Почта подтверждена. Теперь придумай новый пароль · <b>FLUX</b>';
      login.style.display="none";
      pass.value="";
      pass.placeholder="Новый пароль";
      pass.autocomplete="new-password";
      submit.textContent="Сохранить новый пароль";
      sw.style.display="none";
      forgot.style.display="none";

    }else{
      title.textContent="С возвращением";
      text.innerHTML='Начни свой путь прямо сейчас · <b>FLUX</b>';
      login.placeholder="E-mail";
      pass.value="";
      pass.placeholder="Введи пароль";
      pass.autocomplete="current-password";
      submit.textContent="Войти";
      sw.innerHTML='Нет аккаунта? <b>Зарегистрироваться</b>';
      forgot.style.display="block";
    }
  }

  function updateAuthUI(){ setAuthMode(authMode); }

  window.openLogin=function(){
    const o=document.getElementById("loginOverlay");
    if(!o)return;
    setAuthMode("login");
    o.classList.add("open");
    o.setAttribute("aria-hidden","false");
    setTimeout(()=>document.getElementById("authLogin")?.focus(),0);
  };

  window.closeLogin=function(){
    const o=document.getElementById("loginOverlay");
    if(o){
      o.classList.remove("open");
      o.setAttribute("aria-hidden","true");
    }
    pendingTab=null;
    setAuthMode("login");
    const l=document.getElementById("authLogin"), p=document.getElementById("authPass");
    if(l)l.value="";
    if(p)p.value="";
  };

  window.setAuthMode=setAuthMode;

  window.toggleAuthMode=function(){
    setAuthMode(authMode==="register" ? "login" : "register");
    setTimeout(()=>document.getElementById("authLogin")?.focus(),0);
  };

  window.toggleForgotMode=function(){
    setAuthMode(authMode==="forgot" ? "login" : "forgot");
    setTimeout(()=>document.getElementById("authLogin")?.focus(),0);
  };

  window.submitAuth=function(){ toast("Подключение к серверу авторизации…"); };

  window.logout=function(){
    localStorage.removeItem("flux_user");
    updateAccountUI();
    toast("Вы вышли из аккаунта.");
    showTab("home");
  };
  function updateReferralUI(){
    const user=currentUser();
    const link=document.getElementById("referralLink");
    if(link) link.textContent=REFERRAL_BASE+"?ref="+encodeURIComponent(user||"");
  }

  function updateInitialSubscriptionUI(){
    // Every account starts with zero subscription days.
    const profileValue=document.getElementById("subscriptionValue");
    const freezeValue=document.getElementById("subscriptionDaysFreeze");
    const statusTitle=document.getElementById("subscriptionStatusTitle");
    const statusText=document.getElementById("subscriptionStatusText");
    const endsAt=document.getElementById("subscriptionEndsAt");
    if(profileValue) profileValue.textContent="0 дней · не активна";
    if(freezeValue) freezeValue.textContent="0 дн.";
    if(statusTitle) statusTitle.textContent="Подписки нет";
    if(statusText) statusText.textContent="Сначала купи или активируй подписку, чтобы использовать заморозку.";
    if(endsAt) endsAt.textContent="—";
  }

  window.copyReferral=function(){
    const link=REFERRAL_BASE+"?ref="+encodeURIComponent(currentUser()||"");
    if(navigator.clipboard) navigator.clipboard.writeText(link);
    toast("Реферальная ссылка скопирована.");
  };

  const ROULETTE_REWARDS = [
    { key:"none", title:"Ничего", sub:"Попробуй завтра", tone:"violet", icon:"gift", chance:25 },
    { key:"1flx", title:"1 FLX", sub:"Один коин", tone:"blue", icon:"coin", chance:25 },
    { key:"5flx", title:"5 FLX", sub:"Пять коинов", tone:"purple", icon:"coin", chance:15 },
    { key:"10flx", title:"10 FLX", sub:"Десять коинов", tone:"purple", icon:"coin", chance:10 },
    { key:"reroll", title:"Перекрут", sub:"Дополнительный спин", tone:"pink", icon:"reroll", chance:8 },
    { key:"hwid", title:"Сброс HWID", sub:"Выдача позже", tone:"cyan", icon:"shield", chance:4 },
    { key:"freeze", title:"1 заморозка", sub:"Выдача позже", tone:"pink", icon:"snow", chance:4 },
    { key:"sub1", title:"Подписка 1 день", sub:"Выдача позже", tone:"green", icon:"calendar", chance:2 },
    { key:"sub7", title:"Подписка 7 дней", sub:"Выдача позже", tone:"gold", icon:"calendar", chance:1 },
    { key:"100flx", title:"100 FLX", sub:"Легендарная награда", tone:"gold", icon:"coin", chance:5.5 },
    { key:"beta", title:"Бета", sub:"Ранний доступ", tone:"cyan", icon:"flask", chance:0.5 }
  ];

  function pickRouletteRewardIndex(){
    const total = ROULETTE_REWARDS.reduce((sum, reward) => sum + Number(reward.chance || 0), 0);
    let roll = Math.random() * total;
    for(let i = 0; i < ROULETTE_REWARDS.length; i++){
      roll -= Number(ROULETTE_REWARDS[i].chance || 0);
      if(roll < 0) return i;
    }
    return 0;
  }

  const ROULETTE_MAX_SPINS = 2;
  let rouletteSpinning = false;
  let rouletteResetTimer = null;

  function rouletteUserKey(){
    const id = localStorage.getItem("flux_user_id") || "";
    const name = localStorage.getItem("flux_user") || "guest";
    return encodeURIComponent(id || name || "guest");
  }

  // The daily cycle resets at 01:00 Moscow time (UTC+3), matching the UI text.
  function rouletteCycleKey(now = new Date()){
    // Moscow time minus one hour -> date changes exactly at 01:00 MSK.
    return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0,10);
  }

  function rouletteStorageKey(){
    return "flux_roulette_v2_" + rouletteUserKey();
  }

  function rouletteState(){
    const day = rouletteCycleKey();
    let s = { day, spins: 0, history: [], balance: 0 };
    try{
      const saved = JSON.parse(localStorage.getItem(rouletteStorageKey()) || "null");
      if(saved && typeof saved === "object") s = Object.assign(s, saved);
    }catch(e){}

    // New daily cycle: reset spins, keep balance/history.
    if(s.day !== day){
      s.day = day;
      s.spins = 0;
      localStorage.setItem(rouletteStorageKey(), JSON.stringify(s));
    }
    if(!Array.isArray(s.history)) s.history = [];
    if(typeof s.balance !== "number" || !Number.isFinite(s.balance)) s.balance = 0;
    if(typeof s.spins !== "number" || !Number.isFinite(s.spins)) s.spins = 0;
    s.spins = Math.max(0, Math.min(ROULETTE_MAX_SPINS, Math.floor(s.spins)));
    return s;
  }

  function saveRouletteState(s){
    localStorage.setItem(rouletteStorageKey(), JSON.stringify(s));
  }

  function rouletteIcon(icon){
    switch(icon){
      case "coin": return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16"/><path d="M16 7.5c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"/></svg>';
      case "reroll": return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a7 7 0 0 0 11.95 4.95L17 15"/><path d="M21 12A7 7 0 0 0 9.05 7.05L7 9"/><path d="M17 15h-4v4"/><path d="M7 9h4V5"/></svg>';
      case "shield": return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 6 5.5v5.2c0 4 2.4 6.8 6 8.3 3.6-1.5 6-4.3 6-8.3V5.5L12 3Z"/><path d="m9.8 11.7 1.5 1.5 3.1-3.3"/></svg>';
      case "snow": return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5.6 6.7 18.4 17.3M18.4 6.7 5.6 17.3"/><path d="m9.8 4 2.2 2.2L14.2 4M9.8 20 12 17.8 14.2 20M4.8 9.5l3-.5-.3-3M19.2 14.5l-3 .5.3 3M19.2 9.5l-3-.5.3-3M4.8 14.5l3 .5-.3 3"/></svg>';
      case "calendar": return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg>';
      case "flask": return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4"/><path d="M10 3v5l-4.8 7.7A3 3 0 0 0 7.8 20h8.4a3 3 0 0 0 2.6-4.3L14 8V3"/><path d="M8.7 14h6.6"/></svg>';
      default: return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="17" height="12" rx="2"/><path d="M12 8v12"/><path d="M4 12h16"/><path d="M7.6 8c-1.1 0-1.9-.8-1.9-1.9 0-.9.6-1.7 1.5-1.9 1.7-.4 3 1.1 4.8 3.8"/><path d="M16.4 8c1.1 0 1.9-.8 1.9-1.9 0-.9-.6-1.7-1.5-1.9-1.7-.4-3 1.1-4.8 3.8"/></svg>';
    }
  }

  function renderRouletteUI(){
    const track = document.getElementById("rouletteTrack");
    const grid = document.getElementById("rouletteRewardsGrid");
    if(track && !track.dataset.ready){
      // Five copies give enough runway for a smooth spin on all screen sizes.
      const seq = [];
      for(let i=0;i<5;i++) seq.push(...ROULETTE_REWARDS);
      track.innerHTML = seq.map((reward, idx)=>
        '<article class="roulette-track-item reward-tone-'+reward.tone+'" data-reward-index="'+(idx % ROULETTE_REWARDS.length)+'">'+
          '<div class="reward-icon-box">'+rouletteIcon(reward.icon)+'</div>'+
          '<h4>'+reward.title+'</h4>'+
          '<p>'+reward.sub+'</p>'+
        '</article>'
      ).join('');
      track.dataset.ready = '1';
    }
    if(grid && !grid.dataset.ready){
      grid.innerHTML = ROULETTE_REWARDS.map(reward =>
        '<article class="roulette-reward-card reward-tone-'+reward.tone+'">'+
          '<div class="reward-grid-icon">'+rouletteIcon(reward.icon)+'</div>'+
          '<h4>'+reward.title+'</h4>'+
          '<p>'+reward.sub+'</p>'+
        '</article>'
      ).join('');
      grid.dataset.ready = '1';
    }
  }

  function nextRouletteReset(){
    const HOUR = 60 * 60 * 1000;
    const now = new Date();
    const msk = new Date(now.getTime() + 3 * HOUR);
    let resetMsk = Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate(), 1, 0, 0);
    if(msk.getTime() >= resetMsk) resetMsk += 24 * HOUR;
    const resetUtc = resetMsk - 3 * HOUR;
    const diffMs = Math.max(0, resetUtc - now.getTime());
    const hours = Math.floor(diffMs / HOUR);
    const mins = Math.floor((diffMs % HOUR) / 60000);
    return { hours, mins, text: 'через '+hours+' ч. '+mins+' мин.' };
  }

  function renderRouletteHistory(history){
    const wrap = document.getElementById('rouletteHistoryList');
    if(!wrap) return;
    if(!history || !history.length){
      wrap.classList.add('is-empty');
      wrap.innerHTML = '';
      return;
    }
    wrap.classList.remove('is-empty');
    wrap.innerHTML = history.slice(0,6).map(item =>
      '<div class="roulette-history-item"><div><strong>'+item.title+'</strong><span style="display:block;margin-top:4px">'+item.sub+'</span></div><span>'+item.time+'</span></div>'
    ).join('');
  }

  window.spinRoulette = function(){
    if(rouletteSpinning) return;
    renderRouletteUI();

    const btn = document.getElementById('spinButton');
    const track = document.getElementById('rouletteTrack');
    const shell = document.querySelector('#roulette .roulette-strip-shell');
    const result = document.getElementById('rouletteResult');
    if(!btn || !track || !shell){
      toast('Не удалось запустить рулетку. Обнови страницу.');
      return;
    }

    let s = rouletteState();
    if(s.spins >= ROULETTE_MAX_SPINS){
      updateRouletteUI();
      toast('На сегодня попытки закончились.');
      return;
    }

    rouletteSpinning = true;
    btn.disabled = true;
    btn.textContent = 'Рулетка крутится…';
    if(result) result.textContent = 'Рулетка вращается…';

    // Reset without animation, then start from a stable position.
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
    void track.offsetWidth;

    const rewardIndex = pickRouletteRewardIndex();
    const reward = ROULETTE_REWARDS[rewardIndex];
    // Aim into the fourth copy so the strip always travels a long distance.
    const targetIndex = ROULETTE_REWARDS.length * 3 + rewardIndex;
    const targetCard = track.children[targetIndex];
    if(!targetCard){
      rouletteSpinning = false;
      updateRouletteUI();
      toast('Ошибка рулетки. Обнови страницу.');
      return;
    }

    const targetCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
    const translate = Math.round(shell.clientWidth / 2 - targetCenter);

    let finished = false;
    const finishSpin = () => {
      if(finished) return;
      finished = true;
      rouletteSpinning = false;

      // Only consume the spin after the animation actually completes.
      const fresh = rouletteState();
      if(fresh.spins < ROULETTE_MAX_SPINS) fresh.spins += 1;
      if(reward.key === '1flx') fresh.balance += 1;
      if(reward.key === '5flx') fresh.balance += 5;
      if(reward.key === '10flx') fresh.balance += 10;
      if(reward.key === '100flx') fresh.balance += 100;
      fresh.history = [{
        title: reward.title,
        sub: reward.sub,
        time: new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})
      }, ...fresh.history].slice(0,10);
      saveRouletteState(fresh);

      if(result) result.innerHTML = 'Твоя награда: <b class="roulette-prize">'+reward.title+'</b> — '+reward.sub+'.';
      updateRouletteUI();
      toast('Результат рулетки: '+reward.title);
    };

    const onEnd = (event) => {
      if(event && event.target !== track) return;
      track.removeEventListener('transitionend', onEnd);
      finishSpin();
    };
    track.addEventListener('transitionend', onEnd);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transition = 'transform 4.2s cubic-bezier(.12,.78,.12,1)';
        track.style.transform = 'translate3d('+translate+'px,0,0)';
      });
    });

    // Fallback for browsers that sometimes skip transitionend.
    setTimeout(() => {
      track.removeEventListener('transitionend', onEnd);
      finishSpin();
    }, 4700);
  };

  function updateRouletteUI(){
    renderRouletteUI();
    const s = rouletteState();
    const spinsValue = document.getElementById('spinCountValue');
    const spinsLeft = Math.max(0, ROULETTE_MAX_SPINS - s.spins);
    const spinRemaining = document.getElementById('spinRemaining');
    const spinRemainingBottom = document.getElementById('spinRemainingBottom');
    const balance = document.getElementById('rouletteBalance');
    const btn = document.getElementById('spinButton');
    const resetHuman = document.getElementById('rouletteResetHuman');
    const resetCaption = document.getElementById('rouletteResetCaption');
    const statusText = document.getElementById('rouletteStatusText');
    const heroTitle = document.getElementById('rouletteHeroTitle');
    const heroText = document.getElementById('rouletteHeroText');

    if(spinsValue) spinsValue.textContent = String(s.spins);
    if(spinRemaining) spinRemaining.textContent = String(spinsLeft);
    if(spinRemainingBottom) spinRemainingBottom.textContent = String(spinsLeft);
    if(balance) balance.textContent = String(s.balance || 0);
    if(btn && !rouletteSpinning){
      btn.disabled = s.spins >= ROULETTE_MAX_SPINS;
      btn.textContent = s.spins >= ROULETTE_MAX_SPINS ? 'Прокрутки закончились' : 'Прокрутить рулетку';
    }

    const reset = nextRouletteReset();
    if(resetHuman) resetHuman.textContent = reset.text;
    if(resetCaption) resetCaption.textContent = 'Ежедневно в 01:00 МСК';
    if(statusText) statusText.textContent = 'Следующий сброс — '+reset.text.toLowerCase();

    if(heroTitle) heroTitle.textContent = s.spins >= ROULETTE_MAX_SPINS ? 'Попытки на сегодня закончились' : 'Аккаунт готов к рулетке';
    if(heroText) heroText.textContent = s.spins >= ROULETTE_MAX_SPINS
      ? 'Новые попытки откроются после ежедневного сброса. История наград сохранена ниже.'
      : 'Используй ежедневные попытки и забирай награды — от FLX до подписки и заморозок.';

    renderRouletteHistory(s.history);
  }

  // Make every sidebar item functional.
  document.addEventListener("DOMContentLoaded",()=>{
    const overlay=document.getElementById("loginOverlay");
    if(overlay) overlay.addEventListener("click",(e)=>{if(e.target===overlay) closeLogin();});
    updateAccountUI();
    updateReferralUI();
    updateInitialSubscriptionUI();
    updateRouletteUI();
    if(rouletteResetTimer) clearInterval(rouletteResetTimer);
    rouletteResetTimer = setInterval(updateRouletteUI, 60000);
    showTab("home");
  });
})();

function toggleFluxPassword(){
  const input=document.getElementById('authPass');
  const btn=document.querySelector('.auth-show-password');
  if(!input||!btn)return;
  const show=input.type==='password';
  input.type=show?'text':'password';
  btn.textContent=show?'Скрыть':'Показать';
}

document.addEventListener('keydown',function(e){
  const overlay=document.getElementById('loginOverlay');
  if(e.key==='Enter' && overlay && overlay.classList.contains('open')){
    const active=document.activeElement;
    if(active && (active.id==='authLogin' || active.id==='authPass')){
      e.preventDefault();
      submitAuth();
    }
  }
});

document.addEventListener("DOMContentLoaded",function(){
  if(typeof setAuthMode==="function") setAuthMode("login");
});
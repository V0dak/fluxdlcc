(function(){
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
    if(link) link.textContent=location.origin+location.pathname+"?ref="+encodeURIComponent(user||"");
  }

  window.copyReferral=function(){
    const link=location.origin+location.pathname+"?ref="+encodeURIComponent(currentUser()||"");
    if(navigator.clipboard) navigator.clipboard.writeText(link);
    toast("Реферальная ссылка скопирована.");
  };

  function rouletteState(){
    const day=new Date().toISOString().slice(0,10);
    let s={day,spins:0};
    try{s=JSON.parse(localStorage.getItem("flux_roulette")||"null")||s}catch(e){}
    if(s.day!==day)s={day,spins:0};
    return s;
  }

  window.spinRoulette=function(){
    const btn=document.getElementById("spinButton"), wheel=document.getElementById("rouletteWheel"), result=document.getElementById("rouletteResult"), count=document.getElementById("spinCount");
    let s=rouletteState();
    if(s.spins>=2){toast("На сегодня попытки закончились.");return;}
    s.spins++; localStorage.setItem("flux_roulette",JSON.stringify(s));
    count.textContent=s.spins+" / 2"; btn.disabled=true; result.textContent="Рулетка вращается…";
    const rewards=["10 FLX","+1 день","Сброс HWID","Удача ×2","Заморозка","25 FLX"];
    const reward=rewards[Math.floor(Math.random()*rewards.length)];
    const turns=6+Math.floor(Math.random()*3), angle=Math.floor(Math.random()*360);
    wheel.style.transform="rotate("+(turns*360+angle)+"deg)";
    setTimeout(()=>{
      result.innerHTML='Твой приз: <b class="roulette-prize">'+reward+'</b>';
      btn.disabled=s.spins>=2;
      if(s.spins>=2) btn.textContent="Попытки закончились";
      toast("Результат рулетки: "+reward);
    },4500);
  }

  function updateRouletteUI(){
    const c=document.getElementById("spinCount"), b=document.getElementById("spinButton");
    if(!c)return;
    const s=rouletteState(); c.textContent=s.spins+" / 2";
    if(s.spins>=2){b.disabled=true;b.textContent="Попытки закончились";}
  }

  // Make every sidebar item functional.
  document.addEventListener("DOMContentLoaded",()=>{
    const overlay=document.getElementById("loginOverlay");
    if(overlay) overlay.addEventListener("click",(e)=>{if(e.target===overlay) closeLogin();});
    updateAccountUI();
    updateReferralUI();
    updateRouletteUI();
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
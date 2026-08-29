/* ===== FLUX Supabase Auth ===== */
(function(){
  const REFERRAL_BASE = "https://v0dak.github.io/fluxdlcc/";
  const SUPABASE_URL = "https://hgxjpocdjhlpkfaxmadh.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RMcP26AnepYSxMBoSZSztQ_nyaeztye";

  if(!window.supabase){
    console.error("Supabase JS did not load");
    return;
  }

  const fluxSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
  window.fluxSupabase = fluxSupabase;

  function displayName(user){
    if(!user) return "";
    const metaName = user.user_metadata && user.user_metadata.username;
    if(metaName) return String(metaName);
    const email = user.email || "";
    return email ? email.split("@")[0] : "FLUX";
  }

  function updateVisibleAccount(user){
    const name = displayName(user);
    const email = user && user.email ? user.email : "";
    const uid = user && user.id ? user.id : "";

    const profileBtn=document.querySelector(".profile-pill");
    const topAvatar=document.getElementById("topAvatar");
    const topText=document.getElementById("topProfileText");

    if(user){
      localStorage.setItem("flux_user", name);
      localStorage.setItem("flux_user_email", email);
      localStorage.setItem("flux_user_id", uid);
      if(profileBtn) profileBtn.classList.remove("guest-login");
      if(topText) topText.textContent=name;
      if(topAvatar) topAvatar.textContent=(name[0]||"F").toUpperCase();
    }else{
      localStorage.removeItem("flux_user");
      localStorage.removeItem("flux_user_email");
      localStorage.removeItem("flux_user_id");
      if(profileBtn) profileBtn.classList.add("guest-login");
      if(topText) topText.textContent="Кабинет";
      if(topAvatar) topAvatar.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5"/></svg>';
    }

    // Delete passwords left by the old local demo.
    localStorage.removeItem("flux_account");

    document.querySelectorAll(".account-name").forEach(x=>x.textContent=name||"—");
    document.querySelectorAll(".profile-avatar").forEach(x=>x.textContent=name?(name[0]||"F").toUpperCase():"—");

    const emailEl=document.getElementById("accountEmail");
    if(emailEl) emailEl.textContent=email||"—";
    const uidEl=document.getElementById("accountUid");
    if(uidEl) uidEl.textContent=uid ? uid.slice(0,8).toUpperCase() : "—";

    const referral=document.getElementById("referralLink");
    if(referral){
      referral.textContent=REFERRAL_BASE+"?ref="+encodeURIComponent(name||"");
    }

    // New users start with 0 subscription days until purchase/activation is wired to backend data.
    const subscriptionValue=document.getElementById("subscriptionValue");
    const subscriptionDaysFreeze=document.getElementById("subscriptionDaysFreeze");
    const subscriptionStatusTitle=document.getElementById("subscriptionStatusTitle");
    const subscriptionStatusText=document.getElementById("subscriptionStatusText");
    const subscriptionEndsAt=document.getElementById("subscriptionEndsAt");
    if(subscriptionValue) subscriptionValue.textContent="0 дней · не активна";
    if(subscriptionDaysFreeze) subscriptionDaysFreeze.textContent="0 дн.";
    if(subscriptionStatusTitle) subscriptionStatusTitle.textContent="Подписки нет";
    if(subscriptionStatusText) subscriptionStatusText.textContent="Сначала купи или активируй подписку, чтобы использовать заморозку.";
    if(subscriptionEndsAt) subscriptionEndsAt.textContent="—";
  }

  function niceError(error){
    const m=(error && error.message ? error.message : "").toLowerCase();
    if(m.includes("invalid login credentials")) return "Неверный e-mail или пароль.";
    if(m.includes("user already registered")) return "Аккаунт с таким e-mail уже существует.";
    if(m.includes("password should be")) return "Пароль слишком короткий. Используй минимум 6 символов.";
    if(m.includes("invalid") && m.includes("email")) return "Введи правильный e-mail.";
    if(m.includes("rate limit")) return "Слишком много попыток. Попробуй немного позже.";
    return error && error.message ? error.message : "Ошибка авторизации.";
  }

  function currentAuthMode(){
    const modal=document.querySelector(".login-modal");
    if(modal && modal.classList.contains("auth-register")) return "register";
    if(modal && modal.classList.contains("auth-forgot")) return "forgot";
    if(modal && modal.classList.contains("auth-verify-reset")) return "verify-reset";
    if(modal && modal.classList.contains("auth-recovery")) return "recovery";
    return "login";
  }

  window.submitAuth = async function(){
    const email=(document.getElementById("authLogin")?.value||"").trim().toLowerCase();
    const pass=document.getElementById("authPass")?.value||"";
    const mode=currentAuthMode();
    const btn=document.getElementById("authSubmit");

    // Step 3: e-mail code has been verified; set a new password.
    if(mode==="recovery"){
      if(!pass){
        toast("Введи новый пароль.");
        return;
      }
      if(pass.length<6){
        toast("Пароль должен быть не короче 6 символов.");
        return;
      }

      if(btn) btn.disabled=true;
      try{
        const {data,error}=await fluxSupabase.auth.updateUser({password:pass});
        if(error) throw error;

        updateVisibleAccount(data.user);
        toast("Пароль успешно изменён.");
        if(typeof closeLogin==="function") closeLogin();
        if(typeof showTab==="function") showTab("account");
      }catch(error){
        console.error(error);
        toast(niceError(error));
      }finally{
        if(btn) btn.disabled=false;
      }
      return;
    }

    // Step 2: verify the 6-digit recovery code received by e-mail.
    if(mode==="verify-reset"){
      const code=pass.replace(/\D/g,"");
      if(!email || !email.includes("@")){
        toast("Сначала укажи e-mail.");
        if(typeof setAuthMode==="function") setAuthMode("forgot");
        return;
      }
      if(code.length!==6){
        toast("Введи 6-значный код из письма.");
        return;
      }

      if(btn) btn.disabled=true;
      try{
        const {data,error}=await fluxSupabase.auth.verifyOtp({
          email,
          token:code,
          type:"recovery"
        });
        if(error) throw error;

        if(data && data.user) updateVisibleAccount(data.user);
        toast("Почта подтверждена.");
        if(typeof setAuthMode==="function") setAuthMode("recovery");
        setTimeout(()=>document.getElementById("authPass")?.focus(),0);
      }catch(error){
        console.error(error);
        const msg=(error?.message||"").toLowerCase();
        if(msg.includes("expired") || msg.includes("invalid")){
          toast("Неверный или просроченный код.");
        }else{
          toast(niceError(error));
        }
      }finally{
        if(btn) btn.disabled=false;
      }
      return;
    }

    if(!email || (mode!=="forgot" && !pass)){
      toast(mode==="forgot" ? "Введи e-mail." : "Введи e-mail и пароль.");
      return;
    }
    if(!email.includes("@")){
      toast("Введи правильный e-mail.");
      return;
    }

    if(btn) btn.disabled=true;
    try{
      if(mode==="register"){
        const {data,error} = await fluxSupabase.auth.signUp({
          email,
          password: pass,
          options: { data: { username: email.split("@")[0] } }
        });
        if(error) throw error;

        if(data.session && data.user){
          updateVisibleAccount(data.user);
          toast("Аккаунт создан. Добро пожаловать!");
          if(typeof closeLogin==="function") closeLogin();
          if(typeof showTab==="function") showTab("account");
        }else{
          toast("Аккаунт создан. Проверь почту для подтверждения.");
          if(typeof setAuthMode==="function") setAuthMode("login");
        }
        return;
      }

      // Step 1: request recovery e-mail.
      // Supabase intentionally does not reveal whether an account exists.
      if(mode==="forgot"){
        const {error} = await fluxSupabase.auth.resetPasswordForEmail(email);
        if(error) throw error;

        toast("Если такой аккаунт есть, код отправлен на почту.");
        if(typeof setAuthMode==="function") setAuthMode("verify-reset");
        setTimeout(()=>document.getElementById("authPass")?.focus(),0);
        return;
      }

      const {data,error} = await fluxSupabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if(error) throw error;

      updateVisibleAccount(data.user);
      toast("Добро пожаловать!");
      if(typeof closeLogin==="function") closeLogin();
      if(typeof showTab==="function") showTab("account");
    }catch(error){
      console.error(error);
      toast(niceError(error));
    }finally{
      if(btn) btn.disabled=false;
    }
  };

  window.logout = async function(){
    try{
      await fluxSupabase.auth.signOut();
    }catch(error){
      console.error(error);
    }
    updateVisibleAccount(null);
    toast("Вы вышли из аккаунта.");
    if(typeof showTab==="function") showTab("home");
  };

  async function restoreSession(){
    const {data,error} = await fluxSupabase.auth.getSession();
    if(error){
      console.error(error);
      updateVisibleAccount(null);
      return;
    }
    updateVisibleAccount(data.session ? data.session.user : null);
  }

  fluxSupabase.auth.onAuthStateChange((_event, session)=>{
    updateVisibleAccount(session ? session.user : null);
  });

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", restoreSession);
  }else{
    restoreSession();
  }
})();
let tabSwitchTimer=null;
function showTab(id){
 if((id==="account"||id==="security"||id==="referral"||id==="freeze"||id==="roulette"||id==="configs")
    && !localStorage.getItem("flux_user")){
   if(typeof openLogin==="function") openLogin();
   return;
 }
 const next=document.getElementById(id);
 const current=document.querySelector(".page.active");
 document.body.classList.toggle("security-dashboard-open", id==="security");
 if(!next || current===next) return;

 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));
 clearTimeout(tabSwitchTimer);

 if(current){
   current.classList.add("is-leaving");
   tabSwitchTimer=setTimeout(()=>{
     current.classList.remove("active","is-leaving");
     next.classList.add("active");
     window.scrollTo({top:0,behavior:"smooth"});
   },160);
 }else{
   next.classList.add("active");
   window.scrollTo({top:0,behavior:"smooth"});
 }
}

function toast(s){const x=document.getElementById("toast");x.textContent=s;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2400)}
function toggleMode(){mode=mode==="login"?"register":"login";document.getElementById("accountHeading").textContent=mode==="login"?T[lang].loginTitle:T[lang].register;applyLang()}
function accountAction(){toast("Авторизация работает через Supabase.");}
function downloadLoader(){
 const blob=new Blob(["FLUX LOADER DEMO\n\nReplace this file with your real Windows loader."],{type:"application/octet-stream"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="FLUX-Loader.exe";a.click();URL.revokeObjectURL(a.href);toast(lang==="en"?"Loader downloaded.":lang==="uk"?"Лоадер завантажено.":"Лоадер скачан.");
}
function buyProduct(name,price){
 window.purchase={name,price,server:"FunPay",discount:0};
 document.getElementById("purchaseProductName").textContent=name;
 document.getElementById("purchaseBase").textContent=price+" ₽";
 document.getElementById("purchasePromo").value="";
 document.getElementById("purchasePromoSuccess").classList.remove("show");
 document.getElementById("purchaseOverlay").classList.add("open");
 updatePurchaseTotal();
}
function selectServer(btn){
 document.querySelectorAll(".server-btn").forEach(b=>b.classList.remove("active"));
 btn.classList.add("active");
 window.purchase.server=btn.dataset.server;
 document.getElementById("purchaseServer").textContent=window.purchase.server;
}
function applyPurchasePromo(){
 const input=document.getElementById("purchasePromo").value.trim();
 const lowered=input.toLowerCase();
 const valid=lowered==="v0dak" || lowered==="happy";
 window.purchase.discount=valid?7:0;
 document.getElementById("purchasePromoSuccess").classList.toggle("show",valid);
 if(!valid && input) toast("Неверный промокод.");
 updatePurchaseTotal();
}
function updatePurchaseTotal(){
 if(!window.purchase)return;
 const discount=Math.round(window.purchase.price*(window.purchase.discount/100));
 const total=window.purchase.price-discount;
 document.getElementById("purchaseDiscount").textContent="−"+discount+" ₽";
 document.getElementById("purchaseTotal").textContent=total+" ₽";
 document.querySelector(".pay-btn").textContent="Перейти на FunPay";
}
function continuePayment(){
 if(!window.purchase)return;
 const url="https://funpay.com/users/17146757/";
 window.open(url, "_blank", "noopener");
}
function closePurchase(){document.getElementById("purchaseOverlay").classList.remove("open");}
function buy(price){buyProduct("Подписка FLUX",price);}

function openConfig(name){
 const ok=name==="V0dak"||name==="Happy";
 if(!ok){toast("Этот конфиг пока недоступен.");return;}
 const text=lang==="en" ? ("Config "+name+" selected.") :
            lang==="uk" ? ("Конфіг "+name+" обрано.") :
            ("Конфиг "+name+" выбран.");
 toast(text);
}

function activateKey(){const v=document.getElementById('activationKey').value.trim();toast(v?(lang==='en'?'Key activated.':lang==='uk'?'Ключ активовано.':'Ключ активирован.'):(lang==='en'?'Enter a key.':lang==='uk'?'Введи ключ.':'Введи ключ.'));}
function logout(){localStorage.removeItem('flux_user');toast(lang==='en'?'Logged out.':lang==='uk'?'Ви вийшли з акаунта.':'Вы вышли из аккаунта.');}


/* Central click dispatcher: HTML stays declarative; behavior lives in JS. */
document.addEventListener("click", function(event){
  const actionEl = event.target.closest("[data-action]");
  const tabEl = event.target.closest(".tab[data-tab]");

  if(!actionEl && tabEl){
    event.preventDefault();
    showTab(tabEl.dataset.tab);
    return;
  }
  if(!actionEl) return;

  const action = actionEl.dataset.action;
  if(actionEl.tagName === "A" || actionEl.getAttribute("href") === "#") event.preventDefault();

  switch(action){
    case "show-tab": showTab(actionEl.dataset.tabTarget); break;
    case "open-account": localStorage.getItem("flux_user") ? showTab("account") : openLogin(); break;
    case "download-loader": downloadLoader(); break;
    case "buy-product": buyProduct(actionEl.dataset.productName, Number(actionEl.dataset.price)); break;
    case "open-link": window.open(actionEl.dataset.url, "_blank", "noopener,noreferrer"); break;
    case "toast": toast(actionEl.dataset.message || ""); break;
    case "open-config": openConfig(actionEl.dataset.config); break;
    case "logout": logout(); break;
    case "activate-key": activateKey(); break;
    case "copy-referral": copyReferral(); break;
    case "spin-roulette": spinRoulette(); break;
    case "close-login": closeLogin(); break;
    case "set-auth-mode": setAuthMode(actionEl.dataset.mode || "login"); break;
    case "toggle-password": toggleFluxPassword(); break;
    case "toggle-on": actionEl.classList.toggle("on"); break;
    case "toggle-auth-mode": toggleAuthMode(); break;
    case "toggle-forgot-mode": toggleForgotMode(); break;
    case "submit-auth": submitAuth(); break;
    case "close-purchase": closePurchase(); break;
    case "close-purchase-backdrop": if(event.target === actionEl) closePurchase(); break;
    case "select-payment": selectPayment(actionEl); break;
    case "select-server": selectServer(actionEl); break;
    case "apply-promo": applyPurchasePromo(); break;
    case "complete-purchase": completePurchase(); break;
    case "continue-payment": continuePayment(); break;
    case "navigate-profile": navigateProfile(actionEl.dataset.profileTarget); break;
  }
});

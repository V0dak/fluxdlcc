let purchaseBasePrice=800;
let purchaseDiscount=0;

window.openPurchase=function(title,price){
  purchaseBasePrice=Number(price)||800;
  purchaseDiscount=0;
  document.getElementById("purchaseTitle").textContent=title||"Подписка FLUX";
  document.getElementById("purchasePrice").textContent=purchaseBasePrice+" ₽";
  document.getElementById("purchasePay").textContent="Перейти на FunPay";
  document.getElementById("purchasePromo").value="";
  document.getElementById("promoStatus").textContent="";
  const o=document.getElementById("purchaseOverlay");
  o.classList.add("open");o.setAttribute("aria-hidden","false");
}
window.closePurchase=function(){
  const o=document.getElementById("purchaseOverlay");
  o.classList.remove("open");o.setAttribute("aria-hidden","true");
}
window.selectPayment=function(el){
  document.querySelectorAll(".payment-method").forEach(x=>x.classList.remove("active"));
  el.classList.add("active");
}
window.applyPurchasePromo=function(){
  const code=(document.getElementById("purchasePromo").value||"").trim();
  const status=document.getElementById("promoStatus");
  if(code==="V0dak" || code==="Happy"){
    purchaseDiscount=10;
    const total=Math.round(purchaseBasePrice*(1-purchaseDiscount/100));
    status.textContent="Промокод применён: скидка 10%";
    document.getElementById("purchasePrice").textContent=total+" ₽";
    document.getElementById("purchasePay").textContent="Перейти на FunPay";
  }else{
    purchaseDiscount=0;
    status.textContent=code ? "Промокод недействителен" : "";
    document.getElementById("purchasePrice").textContent=purchaseBasePrice+" ₽";
    document.getElementById("purchasePay").textContent="Перейти на FunPay";
  }
}
window.completePurchase=function(){
  window.open("https://funpay.com/users/17146757/","_blank","noopener");
}
document.addEventListener("click",e=>{
  if(e.target && e.target.id==="purchaseOverlay") closePurchase();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && document.getElementById("purchaseOverlay")?.classList.contains("open")) closePurchase();
});
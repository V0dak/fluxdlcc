/* FLUX intro: show on every page load, then fade into the site. */
(function(){
  const intro=document.getElementById("fluxIntro");
  if(!intro) return;

  document.documentElement.style.overflow="hidden";

  window.addEventListener("load",()=>{
    setTimeout(()=>{
      intro.classList.add("hide");
      document.documentElement.style.overflow="";
      setTimeout(()=>intro.remove(),750);
    },1800);
  });

  // Failsafe in case some external resource never finishes loading.
  setTimeout(()=>{
    if(document.body.contains(intro)){
      intro.classList.add("hide");
      document.documentElement.style.overflow="";
      setTimeout(()=>intro.remove(),750);
    }
  },4200);
})();
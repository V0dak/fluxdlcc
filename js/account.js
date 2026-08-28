(function(){
  function profileMenu(activeId){
    return `
      <button class="side-item ${activeId==='account'?'active':''}" data-action="navigate-profile" data-profile-target="account"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg></span><b>Главная</b></button>
      <button class="side-item ${activeId==='security'?'active':''}" data-action="navigate-profile" data-profile-target="security"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.8 2.8 8 7 10 4.2-2 7-5.2 7-10V6l-7-3Z"/><path d="m9.5 12 1.6 1.6 3.5-3.7"/></svg></span><b>Безопасность</b></button>
      <button class="side-item ${activeId==='referral'?'active':''}" data-action="navigate-profile" data-profile-target="referral"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M16 11a4 4 0 0 1 4 4v2"/><path d="M17 3.5a4 4 0 0 1 0 7"/></svg></span><b>Реферальная программа</b></button>
      <label>ПОДПИСКА</label>
      <button class="side-item ${activeId==='freeze'?'active':''}" data-action="navigate-profile" data-profile-target="freeze"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5l-15.6 11"/><path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2M4.8 9.5l3-.5-.2-3M19.2 14.5l-3 .5.2 3M19.2 9.5l-3-.5.2-3M4.8 14.5l3 .5-.2 3"/></svg></span><b>Заморозка</b></button>
      <label>РАЗВЛЕЧЕНИЯ</label>
      <button class="side-item ${activeId==='roulette'?'active':''}" data-action="navigate-profile" data-profile-target="roulette"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5V6h18v2.5a3 3 0 0 0 0 6V18H3v-3.5a3 3 0 0 0 0-6Z"/><path d="M13 6v12"/></svg></span><b>Рулетка</b></button>
      <label>МАГАЗИН</label>
      <button class="side-item ${activeId==='configs'?'active':''}" data-action="navigate-profile" data-profile-target="configs"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5V6h18v2.5a3 3 0 0 0 0 6V18H3v-3.5a3 3 0 0 0 0-6Z"/><path d="M13 6v12"/></svg></span><b>Конфиги</b></button>
    `;
  }

  function refreshProfileMenus(){
    document.querySelectorAll('.page .profile-nav').forEach(menu=>{
      const page=menu.closest('.page');
      if(page) menu.innerHTML=profileMenu(page.id);
    });
  }

  document.addEventListener('DOMContentLoaded', refreshProfileMenus);
  window.addEventListener('load', refreshProfileMenus);
})();
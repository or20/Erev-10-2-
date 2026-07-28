(()=>{
  let deferredPrompt=null;
  let installing=false;

  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const installButtons=()=>[...document.querySelectorAll('[onclick*="installApp"],#installFab,.installFab')];
  const installBoxes=()=>[...document.querySelectorAll('#installBox,.install-box')];

  function hideInstall(){
    installBoxes().forEach(el=>el.classList.remove('show'));
    installButtons().forEach(el=>el.style.display='none');
  }

  function showInstall(){
    if(standalone()||!deferredPrompt)return hideInstall();
    installBoxes().forEach(el=>el.classList.add('show'));
    installButtons().forEach(el=>el.style.display='');
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredPrompt=event;
    showInstall();
  });

  window.installApp=async function(){
    if(installing||standalone())return hideInstall();
    if(!deferredPrompt)return;

    installing=true;
    const promptEvent=deferredPrompt;
    deferredPrompt=null;

    try{
      await promptEvent.prompt();
      const choice=await promptEvent.userChoice;
      if(choice?.outcome==='accepted')hideInstall();
      else setTimeout(showInstall,250);
    }finally{
      installing=false;
    }
  };

  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    hideInstall();
  });

  if(standalone())hideInstall();
  else setTimeout(showInstall,800);
})();
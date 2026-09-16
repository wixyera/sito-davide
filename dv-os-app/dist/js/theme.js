(function(){
  var root = document.documentElement;
  var moonIcon = document.getElementById('themeIconMoon');
  var sunIcon = document.getElementById('themeIconSun');
  var btn = document.getElementById('themeToggleBtn');
  function updateIcon(t){
    if(!moonIcon || !sunIcon) return;
    var isLight = t === 'light';
    moonIcon.style.display = isLight ? 'none' : '';
    sunIcon.style.display = isLight ? '' : 'none';
  }
  window.addEventListener('personal:appearance',event=>updateIcon(event.detail.theme));
  updateIcon(root.getAttribute('data-theme') || 'dark');
  if (btn) {
    btn.addEventListener('click', function(){
      var current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', current);
      if(typeof applyPersonalAppearance==='function')applyPersonalAppearance(normalizedPreferences({...currentUser?.user_metadata?.workspace_preferences,theme:current,accent:readPersonalPreference('accent',currentUser?.user_metadata?.workspace_preferences?.accent||'gold'),motion:readPersonalPreference('motion','active')}));
      try{ writePersonalPreference('theme', current); }catch(e){}
      updateIcon(current);
    });
  }
})();

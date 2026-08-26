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
  updateIcon(root.getAttribute('data-theme') || 'dark');
  if (btn) {
    btn.addEventListener('click', function(){
      var current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', current);
      try{ localStorage.setItem('dv-os-theme', current); }catch(e){}
      updateIcon(current);
    });
  }
})();

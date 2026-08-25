(function(){
  var root = document.documentElement;
  var icon = document.getElementById('themeToggleIcon');
  var btn = document.getElementById('themeToggleBtn');
  function updateIcon(t){ if(icon) icon.textContent = t === 'light' ? '☀' : '🌙'; }
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

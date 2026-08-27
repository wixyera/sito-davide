/* ==================================================================
   WIDGET MUSICA — player Spotify incorporato (nessuna API key richiesta)
   Permette di scegliere tra alcune playlist consigliate o di incollare
   un link Spotify qualsiasi (playlist / brano / album / artista).
   ================================================================== */
(function () {
  const toggle = document.getElementById('musicToggle');
  const widget = document.getElementById('musicWidget');
  const panel = document.getElementById('musicPanel');
  const closeBtn = document.getElementById('musicClose');
  const embed = document.getElementById('musicEmbed');
  const customInput = document.getElementById('musicCustomUrl');
  const loadBtn = document.getElementById('musicLoadCustom');
  const msg = document.getElementById('musicCustomMsg');
  const presetBtns = document.querySelectorAll('#musicPresets button');

  if (!toggle || !panel || !embed) return;

  function setEmbed(type, id) {
    embed.src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    widget.classList.add('playing');
  }

  function openPanel() {
    panel.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn && closeBtn.addEventListener('click', closePanel);

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) closePanel();
  });

  const searchInput = document.getElementById('musicSearchInput');
  const searchBtn = document.getElementById('musicSearchBtn');
  const resultsBox = document.getElementById('musicResults');

  async function runSearch() {
    const q = (searchInput.value || '').trim();
    if (!q) return;
    resultsBox.innerHTML = '<div class="music-loading">Cerco «' + escapeHtml(q) + '»…</div>';
    resultsBox.classList.add('open');
    try {
      const res = await fetch('/api/spotify-search?q=' + encodeURIComponent(q));
      const data = await res.json();
      if (!res.ok || data.error) {
        resultsBox.innerHTML = '<div class="music-loading error">' + escapeHtml(data.error || 'Ricerca non riuscita.') + '</div>';
        return;
      }
      const tracks = data.tracks || [];
      if (!tracks.length) {
        resultsBox.innerHTML = '<div class="music-loading">Nessun risultato per «' + escapeHtml(q) + '».</div>';
        return;
      }
      resultsBox.innerHTML = tracks
        .map(
          (t) => `
        <button type="button" class="music-result" data-id="${t.id}">
          ${t.image ? `<img src="${t.image}" alt="">` : '<span class="music-result-noimg"></span>'}
          <span class="music-result-txt">
            <span class="music-result-title">${escapeHtml(t.name)}</span>
            <span class="music-result-sub">${escapeHtml(t.artists)}</span>
          </span>
        </button>`
        )
        .join('');
    } catch (e) {
      resultsBox.innerHTML = '<div class="music-loading error">Errore di rete durante la ricerca.</div>';
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  searchBtn && searchBtn.addEventListener('click', runSearch);
  searchInput &&
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
    });

  resultsBox &&
    resultsBox.addEventListener('click', (e) => {
      const btn = e.target.closest('.music-result');
      if (!btn) return;
      setEmbed('track', btn.dataset.id);
      presetBtns.forEach((b) => b.classList.remove('active'));
      resultsBox.classList.remove('open');
      resultsBox.innerHTML = '';
      searchInput.value = '';
    });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setEmbed(btn.dataset.type, btn.dataset.id);
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      msg.textContent = '';
    });
  });

  function parseSpotifyUrl(raw) {
    try {
      const url = new URL(raw.trim());
      if (!/(^|\.)spotify\.com$/.test(url.hostname)) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      const kinds = ['playlist', 'track', 'album', 'artist', 'show', 'episode'];
      const idx = parts.findIndex((p) => kinds.includes(p));
      if (idx === -1 || !parts[idx + 1]) return null;
      return { type: parts[idx], id: parts[idx + 1].split('?')[0] };
    } catch (e) {
      return null;
    }
  }

  loadBtn &&
    loadBtn.addEventListener('click', () => {
      const parsed = parseSpotifyUrl(customInput.value || '');
      if (parsed) {
        setEmbed(parsed.type, parsed.id);
        presetBtns.forEach((b) => b.classList.remove('active'));
        msg.textContent = '';
        msg.style.color = 'var(--accent-soft)';
      } else {
        msg.textContent = 'Link non valido: incolla un URL open.spotify.com';
        msg.style.color = 'var(--red)';
      }
    });

  customInput &&
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); loadBtn.click(); }
    });
})();

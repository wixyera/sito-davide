/* ===================================================================
   RICERCA GLOBALE — indicizza in memoria i dati già caricati dai
   moduli (eventi, percorso, contatti, wishlist, spese) e li filtra
   in tempo reale. Nessuna nuova chiamata di rete: usa gli stessi
   array/oggetti che i singoli moduli tengono già aggiornati.
   =================================================================== */
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResultsEl = document.getElementById('searchResults');
const searchEmptyEl = document.getElementById('searchEmpty');
const searchHintEl = document.getElementById('searchHint');

const SEARCH_ICONS = {
  calendario: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  percorso:   '<svg viewBox="0 0 24 24"><path d="M12 2l3 6 6 1-4.5 4.3L17.5 20 12 17l-5.5 3 1-6.7L3 9l6-1z"/></svg>',
  contatti:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6"/></svg>',
  wishlist:   '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.6 8 2.4 4 6.4 4 8.8 4 10.7 5.3 12 7c1.3-1.7 3.2-3 5.6-3 4 0 5.8 4 4.4 7.7C19.5 16.4 12 21 12 21z"/></svg>',
  spese:      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 .9 3 2.2c0 3-6 1.8-6 4.6 0 1.3 1.3 2.2 3 2.2s3-1.1 3-2.5"/></svg>'
};
const SEARCH_LABELS = { calendario: 'Calendario', percorso: 'Percorso', contatti: 'Contatti', wishlist: 'Wishlist', spese: 'Spese' };

function norm(s) { return String(s || '').toLowerCase(); }

/* Ricostruisce l'indice al volo ad ogni ricerca: leggero, i dati sono già in memoria */
function buildSearchIndex() {
  const idx = [];

  // Eventi (oggetto {dateKey: [eventi]})
  if (typeof events === 'object' && events) {
    Object.values(events).flat().forEach(ev => {
      idx.push({
        module: 'calendario', id: ev.id, dateKey: ev.dateKey,
        title: ev.title, sub: [ev.dateKey, ev.time, ev.location].filter(Boolean).join(' · '),
        haystack: norm([ev.title, ev.description, ev.location, ev.category].join(' '))
      });
    });
  }

  // Percorso
  if (typeof careerEntries !== 'undefined') {
    careerEntries.forEach(c => {
      idx.push({
        module: 'percorso', id: c.id,
        title: c.role_title || 'Voce percorso', sub: [c.organization, c.period].filter(Boolean).join(' · '),
        haystack: norm([c.role_title, c.organization, c.period, c.description].join(' '))
      });
    });
  }

  // Contatti
  if (typeof contactEntries !== 'undefined') {
    contactEntries.forEach(c => {
      idx.push({
        module: 'contatti', id: c.id,
        title: c.email || c.phone || 'Contatto', sub: [c.email && c.phone ? c.phone : ''].filter(Boolean).join(' · '),
        haystack: norm([c.email, c.phone].join(' '))
      });
    });
  }

  // Wishlist
  if (typeof wishlistEntries !== 'undefined') {
    wishlistEntries.forEach(w => {
      idx.push({
        module: 'wishlist', id: w.id,
        title: w.title || 'Prodotto', sub: [w.site_name, w.category].filter(Boolean).join(' · '),
        haystack: norm([w.title, w.site_name, w.category].join(' '))
      });
    });
  }

  // Spese
  if (typeof expenseEntries !== 'undefined') {
    expenseEntries.forEach(e => {
      idx.push({
        module: 'spese', id: e.id,
        title: e.description || 'Spesa', sub: [e.expense_date, e.category, e.amount != null ? fmtEuro(e.amount) : ''].filter(Boolean).join(' · '),
        haystack: norm([e.description, e.category, e.notes].join(' '))
      });
    });
  }

  return idx;
}

function renderSearchResults(query) {
  const q = norm(query).trim();
  searchResultsEl.innerHTML = '';
  if (!q) {
    searchEmptyEl.style.display = 'none';
    searchHintEl.style.display = 'block';
    return;
  }
  searchHintEl.style.display = 'none';

  const idx = buildSearchIndex();
  const matches = idx.filter(r => r.haystack.includes(q)).slice(0, 40);

  searchEmptyEl.style.display = matches.length ? 'none' : 'block';

  const groups = {};
  matches.forEach(m => { (groups[m.module] ??= []).push(m); });

  Object.keys(groups).forEach(mod => {
    const groupEl = document.createElement('div');
    groupEl.className = 'search-group';
    groupEl.innerHTML = `<div class="search-group-label">${SEARCH_ICONS[mod]}<span></span></div>`;
    groupEl.querySelector('span').textContent = SEARCH_LABELS[mod];

    groups[mod].forEach(m => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'search-result';
      row.innerHTML = `<div class="search-result-title"></div><div class="search-result-sub"></div>`;
      row.querySelector('.search-result-title').textContent = m.title;
      row.querySelector('.search-result-sub').textContent = m.sub;
      row.addEventListener('click', () => goToSearchResult(m));
      groupEl.appendChild(row);
    });

    searchResultsEl.appendChild(groupEl);
  });
}

function goToSearchResult(m) {
  closeSearch();
  showModule(m.module);
  if (m.module === 'calendario' && m.dateKey) {
    const [y, mo, d] = m.dateKey.split('-').map(Number);
    viewYear = y; viewMonth = mo - 1;
    selectedDateKey = m.dateKey;
    renderCalendar();
    renderEventList();
  }
}

function openSearch() {
  searchOverlay.classList.add('open');
  document.body.classList.add('search-open');
  searchInput.value = '';
  renderSearchResults('');
  setTimeout(() => searchInput.focus(), 60);
}
function closeSearch() {
  searchOverlay.classList.remove('open');
  document.body.classList.remove('search-open');
}

document.getElementById('searchTriggerBtn').addEventListener('click', openSearch);
document.getElementById('searchCloseBtn').addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchOverlay.classList.contains('open') ? closeSearch() : openSearch();
  } else if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
    closeSearch();
  }
});

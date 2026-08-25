/* ===================================================================
   WISHLIST — CRUD su "wishlist_items", isolato per utente.
   Prodotti da qualsiasi sito, con carrello (selezione) e totali.
   =================================================================== */
const wlGrid = document.getElementById('wlGrid');
const wlEmpty = document.getElementById('wlEmpty');
const wlForm = document.getElementById('wlForm');
let wishlistEntries = [];
let editingWlId = null;

/* ---------- Caricamento ---------- */
async function loadWishlist() {
  try {
    wishlistEntries = await wishlistRequest('?select=*&order=created_at.desc', { method: 'GET' });
    renderWishlist();
  } catch (err) {
    console.error('Errore nel caricamento della wishlist:', err);
  }
}

/* ---------- Formattazione prezzo ---------- */
function fmtPrice(amount, currency) {
  if (amount === null || amount === undefined || amount === '') return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  try {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: currency || 'EUR' }).format(n);
  } catch (_) {
    return `${n.toFixed(2)} ${currency || 'EUR'}`;
  }
}

/* ---------- Render ---------- */
function renderWishlist() {
  wlGrid.innerHTML = '';
  wlEmpty.style.display = wishlistEntries.length ? 'none' : 'block';

  let totalAll = 0;
  let totalCart = 0;
  let countCart = 0;

  wishlistEntries.forEach(item => {
    const price = Number(item.price);
    const hasPrice = !Number.isNaN(price);
    if (hasPrice) totalAll += price;
    if (item.in_cart && hasPrice) { totalCart += price; }
    if (item.in_cart) countCart++;

    const card = document.createElement('div');
    card.className = 'wl-card hud' + (item.in_cart ? ' in-cart' : '');
    card.innerHTML = `
      <div class="corners"><span></span><span></span><span></span><span></span></div>
      <label class="wl-check">
        <input type="checkbox" ${item.in_cart ? 'checked' : ''}>
        <span>Nel carrello</span>
      </label>
      <div class="wl-img-wrap">
        ${item.image_url ? `<img src="${escapeAttr(item.image_url)}" alt="" loading="lazy" onerror="this.closest('.wl-img-wrap').classList.add('broken')">` : ''}
        <span class="wl-noimg">SENZA IMMAGINE</span>
      </div>
      <div class="wl-body">
        <span class="wl-site">${escapeHtml(item.site_name || '')}</span>
        <div class="wl-title"></div>
        <div class="wl-price">${fmtPrice(item.price, item.currency)}</div>
        ${item.category ? `<span class="wl-cat">${escapeHtml(item.category)}</span>` : ''}
        <div class="wl-actions">
          ${item.product_url ? `<a class="wl-link" href="${escapeAttr(item.product_url)}" target="_blank" rel="noopener">APRI ↗</a>` : '<span></span>'}
          <div class="ev-item-actions">
            <button class="ev-edit" type="button">EDIT</button>
            <button class="ev-del" type="button">DEL</button>
          </div>
        </div>
      </div>`;

    card.querySelector('.wl-title').textContent = item.title || 'Prodotto senza nome';

    card.querySelector('.wl-check input').onchange = async (e) => {
      const checked = e.target.checked;
      try {
        await wishlistRequest(`?id=eq.${encodeURIComponent(item.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ in_cart: checked, updated_at: new Date().toISOString() }),
          headers: { Prefer: 'return=minimal' }
        });
        item.in_cart = checked;
        renderWishlist();
      } catch (err) {
        alert('Errore nell\u2019aggiornamento: ' + err.message);
        e.target.checked = !checked;
      }
    };

    card.querySelector('.ev-edit').onclick = () => editWishlistItem(item);
    card.querySelector('.ev-del').onclick = async () => {
      if (!confirm('Rimuovere questo prodotto dalla wishlist?')) return;
      try {
        await wishlistRequest(`?id=eq.${encodeURIComponent(item.id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        if (editingWlId === item.id) resetWishlistForm();
        await loadWishlist();
      } catch (err) { alert('Errore durante l\u2019eliminazione: ' + err.message); }
    };

    wlGrid.appendChild(card);
  });

  document.getElementById('wlTotalAll').textContent = fmtPrice(totalAll, 'EUR');
  document.getElementById('wlTotalCart').textContent = fmtPrice(totalCart, 'EUR');
  document.getElementById('wlCountAll').textContent = wishlistEntries.length;
  document.getElementById('wlCountCart').textContent = countCart;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

/* ---------- Analisi automatica da URL (chiama la Cloudflare Function) ---------- */
const wlUrlInput = document.getElementById('wlUrlInput');
const wlAnalyzeBtn = document.getElementById('wlAnalyzeBtn');
const wlAnalyzeMsg = document.getElementById('wlAnalyzeMsg');

wlAnalyzeBtn.addEventListener('click', async () => {
  const url = wlUrlInput.value.trim();
  if (!url) { wlAnalyzeMsg.textContent = 'Incolla prima un link al prodotto.'; return; }
  wlAnalyzeBtn.disabled = true;
  wlAnalyzeBtn.textContent = 'ANALISI...';
  wlAnalyzeMsg.textContent = '';
  try {
    const res = await fetch('/api/fetch-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Errore ${res.status}`);

    if (data.title) document.getElementById('wlTitle').value = data.title;
    if (data.price) document.getElementById('wlPrice').value = data.price;
    if (data.currency) document.getElementById('wlCurrency').value = data.currency.toUpperCase();
    if (data.image) document.getElementById('wlImage').value = data.image;
    if (data.site_name) document.getElementById('wlSite').value = data.site_name;
    document.getElementById('wlProductUrl').value = data.product_url || url;

    wlAnalyzeMsg.textContent = (data.title || data.image)
      ? 'Dati recuperati: controlla e completa i campi qui sotto, poi salva.'
      : 'Non sono riuscito a leggere titolo/immagine da questo sito: compila i campi a mano.';
  } catch (err) {
    document.getElementById('wlProductUrl').value = url;
    wlAnalyzeMsg.textContent = 'Impossibile analizzare automaticamente questo link (molti negozi bloccano la lettura automatica). Compila i campi a mano qui sotto — il link resta comunque salvato.';
  } finally {
    wlAnalyzeBtn.disabled = false;
    wlAnalyzeBtn.textContent = 'ANALIZZA LINK';
  }
});

/* ---------- Form manuale ---------- */
function resetWishlistForm() {
  editingWlId = null;
  wlForm.reset();
  wlUrlInput.value = '';
  wlAnalyzeMsg.textContent = '';
  document.getElementById('wlFormTitle').textContent = 'Nuovo prodotto';
  document.getElementById('wlSubmitBtn').textContent = '+ Aggiungi alla wishlist';
  document.getElementById('wlCancelBtn').style.display = 'none';
}

function editWishlistItem(item) {
  editingWlId = item.id;
  document.getElementById('wlTitle').value = item.title || '';
  document.getElementById('wlPrice').value = item.price ?? '';
  document.getElementById('wlCurrency').value = item.currency || 'EUR';
  document.getElementById('wlImage').value = item.image_url || '';
  document.getElementById('wlProductUrl').value = item.product_url || '';
  document.getElementById('wlSite').value = item.site_name || '';
  document.getElementById('wlCategory').value = item.category || '';
  document.getElementById('wlNotes').value = item.notes || '';
  wlUrlInput.value = '';
  document.getElementById('wlFormTitle').textContent = 'Modifica prodotto';
  document.getElementById('wlSubmitBtn').textContent = 'SALVA MODIFICHE';
  document.getElementById('wlCancelBtn').style.display = 'inline-block';
  wlForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('wlCancelBtn').onclick = resetWishlistForm;

wlForm.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('wlTitle').value.trim();
  if (!title) return;

  const priceRaw = document.getElementById('wlPrice').value.trim();
  const payload = {
    title,
    price: priceRaw ? Number(priceRaw.replace(',', '.')) : null,
    currency: document.getElementById('wlCurrency').value || 'EUR',
    image_url: document.getElementById('wlImage').value.trim() || null,
    product_url: document.getElementById('wlProductUrl').value.trim() || null,
    site_name: document.getElementById('wlSite').value.trim() || null,
    category: document.getElementById('wlCategory').value.trim() || null,
    notes: document.getElementById('wlNotes').value.trim() || null,
    updated_at: new Date().toISOString()
  };

  const btn = document.getElementById('wlSubmitBtn');
  btn.disabled = true; btn.textContent = 'SALVATAGGIO...';
  try {
    if (editingWlId) {
      await wishlistRequest(`?id=eq.${encodeURIComponent(editingWlId)}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
    } else {
      await wishlistRequest('', { method: 'POST', body: JSON.stringify(payload) });
    }
    resetWishlistForm();
    await loadWishlist();
  } catch (err) {
    alert('Errore nel salvataggio: ' + err.message);
  } finally {
    btn.disabled = false;
    if (!editingWlId) btn.textContent = '+ Aggiungi alla wishlist';
  }
});

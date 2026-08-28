/* ===================================================================
   SPESE — CRUD su "expenses", isolato per utente.
   Aggiunta spese con importo/categoria/data + conteggio automatico
   del mese selezionato (con navigazione mese per mese) e per categoria.
   =================================================================== */
let expenseEntries = [];
let editingSpeseId = null;
let speseViewDate = new Date();
speseViewDate.setDate(1);

const spMonthLabel = document.getElementById('spMonthLabel');
const spList = document.getElementById('spList');
const spEmpty = document.getElementById('spEmpty');
const spForm = document.getElementById('spForm');
const spCatBreakdown = document.getElementById('spCatBreakdown');

const spMonthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

/* ---------- Caricamento ---------- */
async function loadExpenses() {
  try {
    expenseEntries = await expensesRequest('?select=*&order=expense_date.desc', { method: 'GET' });
    renderExpenses();
  } catch (err) {
    console.error('Errore nel caricamento delle spese:', err);
  }
}

/* ---------- Formattazione valuta ---------- */
function fmtEuro(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return '€0,00';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
}

function speseMonthKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

/* ---------- Render ---------- */
function renderExpenses() {
  const monthKey = speseMonthKey(speseViewDate);
  spMonthLabel.textContent = `${spMonthNames[speseViewDate.getMonth()]} ${speseViewDate.getFullYear()}`;

  const monthEntries = expenseEntries.filter(e => String(e.expense_date || '').slice(0, 7) === monthKey);

  spList.innerHTML = '';
  spEmpty.style.display = monthEntries.length ? 'none' : 'block';

  let monthTotal = 0;
  const byCategory = {};

  monthEntries.forEach(item => {
    const amount = Number(item.amount) || 0;
    monthTotal += amount;
    const cat = item.category || 'Altro';
    byCategory[cat] = (byCategory[cat] || 0) + amount;

    const row = document.createElement('details');
    row.className = 'ev-item';
    const dateFmt = item.expense_date ? new Date(item.expense_date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '';
    row.innerHTML = `
      <summary>
        <div class="ev-info">
          <span class="ev-time">${dateFmt} · ${escapeHtml(cat)}</span>
          <div class="ev-title"></div>
        </div>
        <div class="ev-item-actions">
          <b style="font-family:var(--font-display);color:var(--ink);white-space:nowrap;">${fmtEuro(amount)}</b>
        </div>
      </summary>
      <div class="ev-body">
        ${item.notes ? `<div class="ev-meta"></div>` : ''}
        <div class="ev-item-actions">
          <button class="ev-edit" type="button" title="Modifica" aria-label="Modifica">${ICON_EDIT}</button>
          <button class="ev-del" type="button" title="Elimina" aria-label="Elimina">${ICON_DEL}</button>
        </div>
      </div>`;
    row.querySelector('.ev-title').textContent = item.description || 'Spesa senza descrizione';
    if (item.notes) row.querySelector('.ev-meta').textContent = item.notes;

    row.querySelector('.ev-edit').onclick = (e) => { e.preventDefault(); editExpense(item); };
    row.querySelector('.ev-del').onclick = async (e) => {
      e.preventDefault();
      if (!confirm('Eliminare questa spesa?')) return;
      try {
        await expensesRequest(`?id=eq.${encodeURIComponent(item.id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        if (editingSpeseId === item.id) resetSpeseForm();
        await loadExpenses();
      } catch (err) { alert('Errore durante l\u2019eliminazione: ' + err.message); }
    };

    spList.appendChild(row);
  });

  document.getElementById('spMonthTotal').textContent = fmtEuro(monthTotal);
  document.getElementById('spMonthCount').textContent = monthEntries.length;

  const allTotal = expenseEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  document.getElementById('spAllTotal').textContent = fmtEuro(allTotal);
  document.getElementById('spAllCount').textContent = expenseEntries.length;

  spCatBreakdown.innerHTML = '';
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, amount]) => {
    const chip = document.createElement('span');
    chip.className = 'sp-cat-chip';
    chip.innerHTML = `<b></b><em></em>`;
    chip.querySelector('b').textContent = cat;
    chip.querySelector('em').textContent = fmtEuro(amount);
    spCatBreakdown.appendChild(chip);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- Navigazione mese ---------- */
document.getElementById('spPrevMonth').addEventListener('click', () => {
  speseViewDate.setMonth(speseViewDate.getMonth() - 1);
  renderExpenses();
});
document.getElementById('spNextMonth').addEventListener('click', () => {
  speseViewDate.setMonth(speseViewDate.getMonth() + 1);
  renderExpenses();
});
document.getElementById('spTodayMonth').addEventListener('click', () => {
  speseViewDate = new Date();
  speseViewDate.setDate(1);
  renderExpenses();
});

/* ---------- Form ---------- */
function resetSpeseForm() {
  editingSpeseId = null;
  spForm.reset();
  document.getElementById('spDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('spFormTitle').textContent = 'Nuova spesa';
  document.getElementById('spSubmitBtn').textContent = '+ Aggiungi spesa';
  document.getElementById('spCancelBtn').style.display = 'none';
}

function editExpense(item) {
  editingSpeseId = item.id;
  document.getElementById('spDescription').value = item.description || '';
  document.getElementById('spAmount').value = item.amount ?? '';
  document.getElementById('spCategory').value = item.category || 'Altro';
  document.getElementById('spDate').value = item.expense_date || new Date().toISOString().slice(0, 10);
  document.getElementById('spNotes').value = item.notes || '';
  document.getElementById('spFormTitle').textContent = 'Modifica spesa';
  document.getElementById('spSubmitBtn').textContent = 'Salva modifiche';
  document.getElementById('spCancelBtn').style.display = 'inline-block';
  spForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
document.getElementById('spCancelBtn').onclick = resetSpeseForm;

spForm.addEventListener('submit', async e => {
  e.preventDefault();
  const description = document.getElementById('spDescription').value.trim();
  const amountRaw = document.getElementById('spAmount').value.trim();
  if (!description || !amountRaw) return;

  const payload = {
    description,
    amount: Number(amountRaw.replace(',', '.')),
    category: document.getElementById('spCategory').value || 'Altro',
    expense_date: document.getElementById('spDate').value || new Date().toISOString().slice(0, 10),
    notes: document.getElementById('spNotes').value.trim() || null,
    updated_at: new Date().toISOString()
  };

  const btn = document.getElementById('spSubmitBtn');
  btn.disabled = true; btn.textContent = 'Salvataggio...';
  try {
    if (editingSpeseId) {
      await expensesRequest(`?id=eq.${encodeURIComponent(editingSpeseId)}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
    } else {
      await expensesRequest('', { method: 'POST', body: JSON.stringify(payload) });
      // se la nuova spesa non è nel mese in vista, sposta la vista sul suo mese
      const d = new Date(payload.expense_date + 'T00:00:00');
      speseViewDate = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    resetSpeseForm();
    await loadExpenses();
  } catch (err) {
    alert('Errore nel salvataggio: ' + err.message);
  } finally {
    btn.disabled = false;
    if (!editingSpeseId) btn.textContent = '+ Aggiungi spesa';
  }
});

resetSpeseForm();

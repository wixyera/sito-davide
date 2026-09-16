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
  reportModuleLoad('spese','loading');
  showSkeleton(spList, 3);
  try {
    expenseEntries = await expensesRequest('?select=*&order=expense_date.desc', { method: 'GET' });
    renderExpenses();
    reportModuleLoad('spese','ok');
  } catch (err) {
    reportModuleLoad('spese','error',err.message);
    console.error('Errore nel caricamento delle spese:', err);
    showLoadError(spList, loadExpenses, err.message);
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

  clearSkeleton(spList);
  spList.innerHTML = '';
  spEmpty.style.display = monthEntries.length ? 'none' : 'block';

  let monthTotal = 0;
  const byCategory = {};

  const query=(document.getElementById('spSearch')?.value||'').trim().toLocaleLowerCase('it');
  const category=document.getElementById('spCategoryFilter')?.value||'';
  const visible=monthEntries.filter(x=>(!category||x.category===category)&&[x.description,x.notes,x.category].join(' ').toLocaleLowerCase('it').includes(query));
  monthTotal=monthEntries.reduce((n,x)=>n+expenseCents(x.amount),0);
  spEmpty.style.display=visible.length?'none':'block';
  spEmpty.textContent=monthEntries.length?'Nessuna spesa corrisponde ai filtri.':'Nessuna spesa in questo mese.';
  monthEntries.forEach(item=>{const cat=item.category||'Altro';byCategory[cat]=(byCategory[cat]||0)+expenseCents(item.amount)/100});
  visible.forEach(item => {
    const amount = Number(item.amount) || 0;

    const cat = item.category || 'Altro';


    const row = document.createElement('details');
    row.className = 'ev-item';row.dataset.recordId=item.id;
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
      } catch (err) { toastError('Errore durante l\u2019eliminazione: ' + err.message); }
    };

    spList.appendChild(row);
  });

  document.getElementById('spMonthTotal').textContent = fmtEuro(monthTotal/100);
  document.getElementById('spMonthCount').textContent = monthEntries.length;

  const allTotal = expenseEntries.reduce((sum, e) => sum + expenseCents(e.amount), 0);
  document.getElementById('spAllTotal').textContent = fmtEuro(allTotal/100);
  document.getElementById('spAllCount').textContent = expenseEntries.length;

  document.getElementById('spFilterCount')?.replaceChildren(document.createTextNode(`${visible.length} di ${monthEntries.length} spese del mese`));
  window.dispatchEvent(new Event('workspace:expenses'));
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
  document.getElementById('spDate').value = localCalendarDate();
  document.getElementById('spFormTitle').textContent = 'Nuova spesa';
  document.getElementById('spSubmitBtn').textContent = '+ Aggiungi spesa';
  document.getElementById('spCancelBtn').style.display = 'none';
}

function editExpense(item) {
  editingSpeseId = item.id;
  document.getElementById('spDescription').value = item.description || '';
  document.getElementById('spAmount').value = item.amount ?? '';
  document.getElementById('spCategory').value = item.category || 'Altro';
  document.getElementById('spDate').value = item.expense_date || localCalendarDate();
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

  const amountCents=parseMoneyCents(amountRaw);
  if(amountCents===null||amountCents<=0)return toastError('Inserisci un importo positivo, ad esempio 24,50 oppure 1.234,56.');
  if(!validCalendarDate(document.getElementById('spDate').value||localCalendarDate()))return toastError('Inserisci una data valida.');
  const payload = {
    description,
    amount: amountCents / 100,
    category: document.getElementById('spCategory').value || 'Altro',
    expense_date: document.getElementById('spDate').value || localCalendarDate(),
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
    if(typeof clearWorkspaceDraft==='function')clearWorkspaceDraft('spForm');
    resetSpeseForm();
    await loadExpenses();
    toastSuccess('Spesa salvata.');
  } catch (err) {
    toastError('Errore nel salvataggio: ' + err.message);
  } finally {
    btn.disabled = false;
    if (!editingSpeseId) btn.textContent = '+ Aggiungi spesa';
  }
});

resetSpeseForm();

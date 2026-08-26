/* ===================================================================
   PERCORSO — CRUD su "career_entries", isolato per utente.
   =================================================================== */
const careerMenu = document.getElementById('careerMenu');
const careerForm = document.getElementById('careerForm');
let careerEntries = [];
let editingCareerId = null;

async function loadCareer() {
  try {
    careerEntries = await careerRequest('?select=*&order=sort_order.asc,created_at.asc', { method: 'GET' });
    renderCareer();
  } catch (err) {
    console.error('Errore nel caricamento del percorso:', err);
  }
}

function renderCareer() {
  careerMenu.innerHTML = '';
  if (!careerEntries.length) {
    const e = document.createElement('div');
    e.className = 'ev-empty';
    e.textContent = 'Nessuna voce nel percorso. Aggiungine una qui sotto.';
    careerMenu.appendChild(e);
    return;
  }
  careerEntries.forEach((c, i) => {
    const d = document.createElement('details');
    if (i === 0) d.open = true;
    const sub = [c.organization, c.period].filter(Boolean).join(' — ');
    d.innerHTML = `<summary><span></span></summary><div class="section-content"></div>`;
    d.querySelector('summary span').textContent = c.role_title || 'Senza titolo';
    const content = d.querySelector('.section-content');
    const bEl = document.createElement('b');
    bEl.textContent = sub;
    content.appendChild(bEl);
    if (c.description) { content.appendChild(document.createElement('br')); content.appendChild(document.createTextNode(c.description)); }
    const actions = document.createElement('div');
    actions.className = 'ev-item-actions';
    actions.style.marginTop = '12px';
    actions.innerHTML = `<button class="ev-edit" type="button" title="Modifica" aria-label="Modifica">${ICON_EDIT}</button><button class="ev-del" type="button" title="Elimina" aria-label="Elimina">${ICON_DEL}</button>`;
    actions.querySelector('.ev-edit').onclick = ev => { ev.stopPropagation?.(); editCareer(c); };
    actions.querySelector('.ev-del').onclick = async ev => {
      ev.preventDefault();
      if (!confirm(`Eliminare "${c.role_title}"?`)) return;
      try {
        await careerRequest(`?id=eq.${encodeURIComponent(c.id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        if (editingCareerId === c.id) resetCareerForm();
        await loadCareer();
      } catch (err) { alert('Errore durante l\u2019eliminazione: ' + err.message); }
    };
    content.appendChild(actions);
    careerMenu.appendChild(d);
  });
}

function resetCareerForm() {
  editingCareerId = null;
  careerForm.reset();
  document.getElementById('careerFormTitle').textContent = 'Nuova voce del percorso';
  document.getElementById('careerSubmitBtn').textContent = '+ Aggiungi voce';
  document.getElementById('careerCancelBtn').style.display = 'none';
}

function editCareer(c) {
  editingCareerId = c.id;
  document.getElementById('crRole').value = c.role_title || '';
  document.getElementById('crOrg').value = c.organization || '';
  document.getElementById('crPeriod').value = c.period || '';
  document.getElementById('crDescription').value = c.description || '';
  document.getElementById('crOrder').value = c.sort_order ?? '';
  document.getElementById('careerFormTitle').textContent = 'Modifica voce del percorso';
  document.getElementById('careerSubmitBtn').textContent = 'SALVA MODIFICHE';
  document.getElementById('careerCancelBtn').style.display = 'inline-block';
  careerForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('careerCancelBtn').onclick = resetCareerForm;

careerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    role_title: document.getElementById('crRole').value.trim(),
    organization: document.getElementById('crOrg').value.trim() || null,
    period: document.getElementById('crPeriod').value.trim() || null,
    description: document.getElementById('crDescription').value.trim() || null,
    sort_order: document.getElementById('crOrder').value ? Number(document.getElementById('crOrder').value) : null
  };
  if (!payload.role_title) return;
  const btn = document.getElementById('careerSubmitBtn');
  btn.disabled = true; btn.textContent = 'SALVATAGGIO...';
  try {
    if (editingCareerId) {
      await careerRequest(`?id=eq.${encodeURIComponent(editingCareerId)}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
    } else {
      await careerRequest('', { method: 'POST', body: JSON.stringify(payload) });
    }
    resetCareerForm();
    await loadCareer();
  } catch (err) {
    alert('Errore nel salvataggio: ' + err.message);
  } finally {
    btn.disabled = false;
    if (!editingCareerId) btn.textContent = '+ Aggiungi voce';
  }
});


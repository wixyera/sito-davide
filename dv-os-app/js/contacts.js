/* ===================================================================
   CONTATTI — CRUD su "contacts", isolato per utente.
   =================================================================== */
const contactList = document.getElementById('contactList');
const contactEmpty = document.getElementById('contactEmpty');
const contactForm = document.getElementById('contactForm');
let contactEntries = [];
let editingContactId = null;

async function loadContacts() {
  try {
    contactEntries = await contactsRequest('?select=*&order=updated_at.desc', { method: 'GET' });
    renderContacts();
  } catch (err) {
    console.error('Errore nel caricamento dei contatti:', err);
  }
}

function renderContacts() {
  contactList.innerHTML = '';
  contactEmpty.style.display = contactEntries.length ? 'none' : 'block';
  contactEntries.forEach(c => {
    const item = document.createElement('div');
    item.className = 'ev-item';
    item.innerHTML = `<div class="ev-info"><div class="ev-title"></div><div class="ev-details"></div></div><div class="ev-item-actions"><button class="ev-edit" type="button" title="Modifica" aria-label="Modifica">${ICON_EDIT}</button><button class="ev-del" type="button" title="Elimina" aria-label="Elimina">${ICON_DEL}</button></div>`;
    item.querySelector('.ev-title').textContent = c.email || c.phone || 'Contatto';
    const details = [];
    if (c.email) details.push('EMAIL: ' + c.email);
    if (c.phone) details.push('TEL: ' + c.phone);
    item.querySelector('.ev-details').textContent = details.join(' | ');
    item.querySelector('.ev-edit').onclick = () => editContact(c);
    item.querySelector('.ev-del').onclick = async () => {
      if (!confirm('Eliminare questo contatto?')) return;
      try {
        await contactsRequest(`?id=eq.${encodeURIComponent(c.id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        if (editingContactId === c.id) resetContactForm();
        await loadContacts();
      } catch (err) { alert('Errore durante l\u2019eliminazione: ' + err.message); }
    };
    contactList.appendChild(item);
  });
}

function resetContactForm() {
  editingContactId = null;
  contactForm.reset();
  document.getElementById('contactFormTitle').textContent = 'Nuovo contatto';
  document.getElementById('contactSubmitBtn').textContent = '+ Aggiungi contatto';
  document.getElementById('contactCancelBtn').style.display = 'none';
}

function editContact(c) {
  editingContactId = c.id;
  document.getElementById('ctEmail').value = c.email || '';
  document.getElementById('ctPhone').value = c.phone || '';
  document.getElementById('contactFormTitle').textContent = 'Modifica contatto';
  document.getElementById('contactSubmitBtn').textContent = 'Salva modifiche';
  document.getElementById('contactCancelBtn').style.display = 'inline-block';
  contactForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('contactCancelBtn').onclick = resetContactForm;

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    email: document.getElementById('ctEmail').value.trim() || null,
    phone: document.getElementById('ctPhone').value.trim() || null,
    updated_at: new Date().toISOString()
  };
  if (!payload.email && !payload.phone) return;
  const btn = document.getElementById('contactSubmitBtn');
  btn.disabled = true; btn.textContent = 'Salvataggio...';
  try {
    if (editingContactId) {
      await contactsRequest(`?id=eq.${encodeURIComponent(editingContactId)}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
    } else {
      await contactsRequest('', { method: 'POST', body: JSON.stringify(payload) });
    }
    resetContactForm();
    await loadContacts();
  } catch (err) {
    alert('Errore nel salvataggio: ' + err.message);
  } finally {
    btn.disabled = false;
    if (!editingContactId) btn.textContent = '+ Aggiungi contatto';
  }
});


/* ===================================================================
   CALENDARIO: eventi isolati per utente
   =================================================================== */
let events = {};
const today = new Date();
let viewYear = today.getFullYear(), viewMonth = today.getMonth(), selectedDateKey = null;
const calGrid = document.getElementById('calGrid'), calMonthLabel = document.getElementById('calMonthLabel'),
      ddDate = document.getElementById('ddDate'), ddDay = document.getElementById('ddDay'),
      evList = document.getElementById('evList'), evForm = document.getElementById('evForm'),
      evPicker = document.getElementById('evPicker'), evPickerRow = document.getElementById('evPickerRow');

/* Popola le tendine dell'ora (slot ogni 15 minuti) al posto dell'input time nativo */
function buildTimeOptions(selectEl, placeholder) {
  selectEl.innerHTML = '';
  const blank = document.createElement('option');
  blank.value = ''; blank.textContent = placeholder;
  selectEl.appendChild(blank);
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, '0'), mm = String(m).padStart(2, '0');
      const opt = document.createElement('option');
      opt.value = `${hh}:${mm}`;
      opt.textContent = `${hh}:${mm}`;
      selectEl.appendChild(opt);
    }
  }
}
buildTimeOptions(document.getElementById('evTime'), '— Nessuna —');
buildTimeOptions(document.getElementById('evEndTime'), '— Nessuna —');

function dateKey(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function todayKey() { return dateKey(today.getFullYear(), today.getMonth(), today.getDate()); }

function mapRow(row) {
  const iso = String(row.start_at || '');
  const endIso = String(row.end_at || '');
  const key = iso.slice(0, 10);
  const time = row.all_day ? '' : iso.slice(11, 16);
  const endTime = row.all_day ? '' : endIso.slice(11, 16);
  return {
    id: row.id, title: row.title || 'Senza titolo', description: row.description || '',
    time, endTime, dateKey: key, all_day: !!row.all_day, location: row.location || '',
    category: row.category || 'Personale', color: row.color || '#00eeff'
  };
}

async function loadEvents() {
  showSkeleton(evList, 3);
  try {
    const rows = await supabaseRequest('?select=*&order=start_at.asc', { method: 'GET' });
    events = {};
    (rows || []).map(mapRow).forEach(ev => { (events[ev.dateKey] ??= []).push(ev); });
    renderCalendar();
    if (selectedDateKey) renderEventList(); else clearSkeleton(evList);
  } catch (err) {
    console.error('Errore nel caricamento degli eventi:', err);
    clearSkeleton(evList);
    if (!navigator.onLine) toastInfo('Offline: eventi non aggiornabili ora.');
  }
}

function renderCalendar() {
  calMonthLabel.textContent = `${monthNames[viewMonth].toUpperCase()} ${viewYear}`;
  calGrid.innerHTML = '';
  ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'].forEach(d => {
    const e = document.createElement('div'); e.className = 'cal-dow'; e.textContent = d; calGrid.appendChild(e);
  });
  const first = new Date(viewYear, viewMonth, 1), offset = (first.getDay() + 6) % 7, days = new Date(viewYear, viewMonth + 1, 0).getDate();
  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div'); e.className = 'cal-day empty'; calGrid.appendChild(e);
  }
  for (let d = 1; d <= days; d++) {
    const key = dateKey(viewYear, viewMonth, d), cell = document.createElement('div');
    cell.className = 'cal-day'; cell.textContent = d;
    if (key === todayKey()) cell.classList.add('today');
    if (key === selectedDateKey) cell.classList.add('selected');
    if (events[key]?.length) {
      const dot = document.createElement('span'); dot.className = 'ev-dot'; cell.appendChild(dot);
    }
    cell.addEventListener('click', () => selectDay(key, d));
    calGrid.appendChild(cell);
  }
  updateMonthCount();
}

function updateMonthCount() {
  const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  let count = 0;
  Object.keys(events).forEach(k => { if (k.startsWith(prefix)) count += events[k].length; });
  document.getElementById('monthEventCount').textContent = count;
  document.getElementById('monthLabel').textContent = `${monthNames[viewMonth]} ${viewYear}`;
  updateNextEvent();
}

function updateNextEvent() {
  const now = new Date();
  const all = Object.values(events).flat().sort((a, b) => a.dateKey.localeCompare(b.dateKey) || (a.time || '99').localeCompare(b.time || '99'));
  const next = all.find(e => e.dateKey >= dateKey(now.getFullYear(), now.getMonth(), now.getDate()));
  const title = document.getElementById('nextEventTitle'), sub = document.getElementById('nextEventDate');
  if (next) { title.textContent = next.title; sub.textContent = `${next.dateKey}${next.time ? ' · ' + next.time : ''}`; }
  else { title.textContent = 'Nessun evento in programma'; sub.innerHTML = '&nbsp;'; }
}

function selectDay(key, dayNum) {
  selectedDateKey = key;
  const dObj = new Date(key + 'T00:00:00');
  ddDate.textContent = `${dowNames[dObj.getDay()].toUpperCase()}, ${key}`;
  ddDay.textContent = `${dayNum} ${monthNames[viewMonth]}`;
  renderEventList();
  renderCalendar();
}

let editingEventId = null;

function resetEventForm() {
  editingEventId = null;
  evForm.reset();
  document.getElementById('evColor').value = '#00eeff';
  evForm.querySelector('button[type="submit"]').textContent = '+ Aggiungi evento';
  if (evPicker) evPicker.value = '';
}

function editEvent(ev) {
  editingEventId = ev.id;
  if (evPicker) evPicker.value = ev.id;
  document.getElementById('evTitle').value = ev.title || '';
  document.getElementById('evDescription').value = ev.description || '';
  document.getElementById('evTime').value = ev.time || '';
  document.getElementById('evEndTime').value = ev.endTime || '';
  document.getElementById('evLocation').value = ev.location || '';
  document.getElementById('evCategory').value = ev.category || 'Personale';
  document.getElementById('evColor').value = ev.color || '#00eeff';
  document.getElementById('evAllDay').checked = !!ev.all_day;
  evForm.querySelector('button[type="submit"]').textContent = 'Salva modifiche';
  evForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderEventList() {
  clearSkeleton(evList);
  evList.innerHTML = '';
  const list = (events[selectedDateKey] || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

  evPicker.innerHTML = '<option value="">— Nuovo evento —</option>';
  list.forEach(ev => {
    const opt = document.createElement('option');
    opt.value = ev.id;
    opt.textContent = `${ev.time ? ev.time + ' — ' : ''}${ev.title}`;
    evPicker.appendChild(opt);
  });
  evPickerRow.style.display = list.length ? 'block' : 'none';
  evPicker.value = editingEventId || '';

  if (!list.length) {
    const e = document.createElement('div');
    e.className = 'ev-empty';
    e.textContent = 'Nessun evento per questo giorno.';
    evList.appendChild(e);
    return;
  }
  list.forEach(ev => {
    const item = document.createElement('details');
    item.className = 'ev-item';
    item.style.borderLeft = `3px solid ${ev.color || '#00eeff'}`;
    item.innerHTML = `<summary><div class="ev-info">${ev.time ? `<div class="ev-time">${ev.time}${ev.endTime ? ' - ' + ev.endTime : ''}</div>` : ''}<div class="ev-title"></div></div></summary><div class="ev-body"><div class="ev-details"></div><div class="ev-item-actions"><button class="ev-edit" type="button" title="Modifica" aria-label="Modifica">${ICON_EDIT}</button><button class="ev-ics" title="Esporta .ics" aria-label="Esporta .ics" type="button">${ICON_ICS}</button><button class="ev-del" title="Elimina" aria-label="Elimina" type="button">${ICON_DEL}</button></div></div>`;
    item.querySelector('.ev-title').textContent = ev.title;
    const details = [];
    if (ev.location) details.push('LUOGO: ' + ev.location);
    if (ev.category) details.push('CATEGORIA: ' + ev.category);
    if (ev.description) details.push(ev.description);
    item.querySelector('.ev-details').textContent = details.join(' | ');
    item.querySelector('.ev-edit').onclick = () => editEvent(ev);
    item.querySelector('.ev-ics').onclick = () => downloadICS(`${ev.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'evento'}.ics`, buildICS([ev]));
    item.querySelector('.ev-del').onclick = async () => {
      if (!confirm(`Eliminare "${ev.title}"?`)) return;
      try {
        await supabaseRequest(`?id=eq.${encodeURIComponent(ev.id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        if (editingEventId === ev.id) resetEventForm();
        await loadEvents();
      } catch (err) { toastError('Errore durante l\u2019eliminazione: ' + err.message); }
    };
    evList.appendChild(item);
  });
}

function toDbPayload(data, key) {
  const allDay = data.allDay;
  if (allDay) {
    return {
      title: data.title, description: data.description || null,
      start_at: `${key}T00:00:00.000Z`, end_at: `${key}T23:59:59.999Z`,
      all_day: true, location: data.location || null,
      category: data.category || 'Personale', color: data.color || '#00eeff'
    };
  }
  const startTime = data.time || '00:00', endTime = data.endTime || startTime;
  const start = new Date(`${key}T${startTime}:00`), end = new Date(`${key}T${endTime}:00`);
  if (!data.endTime) end.setHours(end.getHours() + 1);
  return {
    title: data.title, description: data.description || null,
    start_at: start.toISOString(), end_at: end.toISOString(),
    all_day: false, location: data.location || null,
    category: data.category || 'Personale', color: data.color || '#00eeff'
  };
}

evForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!selectedDateKey) { toastError('Seleziona prima un giorno nel calendario.'); return; }
  const data = {
    title: document.getElementById('evTitle').value.trim(),
    description: document.getElementById('evDescription').value.trim(),
    time: document.getElementById('evTime').value,
    endTime: document.getElementById('evEndTime').value,
    location: document.getElementById('evLocation').value.trim(),
    category: document.getElementById('evCategory').value,
    color: document.getElementById('evColor').value,
    allDay: document.getElementById('evAllDay').checked
  };
  if (!data.title) return;
  const btn = evForm.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Salvataggio...';
  try {
    const payload = toDbPayload(data, selectedDateKey);
    if (editingEventId) {
      await supabaseRequest(`?id=eq.${encodeURIComponent(editingEventId)}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
    } else {
      await supabaseRequest('', { method: 'POST', body: JSON.stringify(payload) });
    }
    resetEventForm();
    await loadEvents();
  } catch (err) {
    toastError('Errore nel salvataggio: ' + err.message);
  } finally {
    btn.disabled = false;
    if (!editingEventId) btn.textContent = '+ Aggiungi evento';
  }
});

document.getElementById('prevMonth').onclick = () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar(); };

evPicker.addEventListener('change', () => {
  const id = evPicker.value;
  if (!id) { resetEventForm(); return; }
  const ev = (events[selectedDateKey] || []).find(e => String(e.id) === String(id));
  if (ev) editEvent(ev);
});


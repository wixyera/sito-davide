/* ===================================================================
   IMPORT / EXPORT .ICS
   =================================================================== */
function escapeICS(s) { return String(s).replace(/([,;])/g, '\\$1'); }

function buildICS(arr) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DavideVillano//PersonalOS//IT', 'CALSCALE:GREGORIAN'];
  arr.forEach(ev => {
    const [y, m, d] = ev.dateKey.split('-');
    lines.push('BEGIN:VEVENT', `UID:${ev.id || crypto.randomUUID()}@dv-os`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`);
    if (ev.time) {
      const [hh, mm] = ev.time.split(':');
      lines.push(`DTSTART:${y}${m}${d}T${hh}${mm}00`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${y}${m}${d}`);
    }
    lines.push(`SUMMARY:${escapeICS(ev.title)}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(name, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

document.getElementById('exportAllBtn').onclick = () => {
  const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const list = Object.values(events).flat().filter(e => e.dateKey.startsWith(prefix));
  if (!list.length) { toastError('Nessun evento da esportare in questo mese.'); return; }
  downloadICS(`dv-os-${prefix}.ics`, buildICS(list));
};

document.getElementById('importICSBtn').onclick = () => document.getElementById('importICSInput').click();
document.getElementById('importICSInput').addEventListener('change', async e => {
  const f = e.target.files?.[0];
  if (!f) return;
  try {
    const txt = await f.text();
    const blocks = txt.split('BEGIN:VEVENT').slice(1);
    const payload = [];
    for (const b of blocks) {
      const summary = (b.match(/(?:\r?\n|^)SUMMARY:(.*)/) || [])[1]?.trim();
      const dt = (b.match(/(?:\r?\n|^)DTSTART(?:;[^:]+)?:([0-9]{8})(?:T([0-9]{4,6}))?/) || []);
      if (!summary || !dt[1]) continue;
      const key = `${dt[1].slice(0, 4)}-${dt[1].slice(4, 6)}-${dt[1].slice(6, 8)}`;
      const time = dt[2] ? `${dt[2].slice(0, 2)}:${dt[2].slice(2, 4)}` : '';
      payload.push(toDbPayload({ title: summary, time, endTime: '', description: '', location: '', category: 'Personale', color: '#00eeff', allDay: !time }, key));
    }
    if (!payload.length) { toastError('Nessun evento valido trovato nel file.'); return; }
    await supabaseRequest('', { method: 'POST', body: JSON.stringify(payload) });
    await loadEvents();
    toastSuccess(`${payload.length} eventi importati.`);
  } catch (err) {
    toastError('Errore durante l\u2019importazione: ' + err.message);
  } finally {
    e.target.value = '';
  }
});


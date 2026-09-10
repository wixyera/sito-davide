/* Calendar import/export. Dates, durations and text survive a round trip. */
function escapeICS(value) { return String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
function unescapeICS(value) { return String(value || '').replace(/\\([nN,;\\])/g, (_, c) => /n/i.test(c) ? '\n' : c); }
function stampICS(date) { return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
function foldICS(line) {
  const encoder = new TextEncoder(); let part = '', size = 0, result = [];
  for (const ch of line) { const bytes = encoder.encode(ch).length; if (size + bytes > 75) { result.push(part); part = ' '; size = 1; } part += ch; size += bytes; }
  result.push(part); return result.join('\r\n');
}
function buildICS(eventsToExport) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DavideVillano//Space//IT', 'CALSCALE:GREGORIAN'];
  eventsToExport.forEach(event => {
    lines.push('BEGIN:VEVENT', `UID:${event.id || crypto.randomUUID()}@dv-space`, `DTSTAMP:${stampICS(new Date())}`);
    if (event.all_day || !event.time) {
      const start = event.dateKey.replace(/-/g, '');
      const lastDay = event.end_at ? new Date(event.end_at) : new Date(event.dateKey + 'T23:59:59.999Z');
      // Stored all-day end dates are inclusive; ICS end dates are exclusive.
      const exclusive = new Date(Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate() + 1));
      lines.push(`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${exclusive.toISOString().slice(0,10).replace(/-/g,'')}`);
    } else {
      const start = event.start_at || new Date(event.dateKey + 'T' + event.time + ':00');
      const end = event.end_at || (event.endTime ? new Date((event.endDateKey || event.dateKey) + 'T' + event.endTime + ':00') : new Date(new Date(start).getTime() + 3600000));
      lines.push(`DTSTART:${stampICS(start)}`, `DTEND:${stampICS(end)}`);
    }
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);
    if (event.category) lines.push(`CATEGORIES:${escapeICS(event.category)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR'); return lines.map(foldICS).join('\r\n') + '\r\n';
}
function parseICSDate(field) {
  if (!field) return null;
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(field.value);
  if (!match) throw new Error('Data non valida nel file calendario.');
  const [,y,m,d,h,mi,se,z] = match, key = `${y}-${m}-${d}`, allDay = !h;
  const iso = `${key}T${h || '00'}:${mi || '00'}:${se || '00'}`;
  const basic = new Date(iso + 'Z');
  if (!Number.isFinite(basic.getTime()) || basic.toISOString().slice(0,10) !== key) throw new Error('Data non valida nel file calendario.');
  if (allDay || z) return {date:basic, allDay, key};
  const zone = /(?:^|;)TZID=(?:"([^"]+)"|([^;]+))/.exec(field.params);
  if (!zone) return {date:new Date(iso), allDay:false, key};
  const formatter = new Intl.DateTimeFormat('en-GB', {timeZone:zone[1] || zone[2],year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  const target = basic.getTime(); let instant = target;
  for (let i=0; i<4; i++) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p => [p.type,p.value]));
    const displayed = Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);
    const delta = target - displayed; instant += delta; if (!delta) return {date:new Date(instant),allDay:false,key};
  }
  throw new Error('Orario ambiguo o non valido al cambio dell’ora. Esporta il calendario in UTC.');
}
function parseICS(text) {
  if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error('Il file non è un calendario ICS.');
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const blocks = [...unfolded.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g)];
  const rows = [];
  for (const [,block] of blocks) {
    const fields = {};
    for (const line of block.split(/\r?\n/)) {
      const colon = line.indexOf(':'); if (colon < 0) continue;
      const [name,...params] = line.slice(0,colon).split(';');
      fields[name.toUpperCase()] = {params:params.join(';'),value:line.slice(colon+1)};
    }
    if (fields.STATUS?.value === 'CANCELLED') continue;
    if (fields.RRULE || fields.RDATE || fields['RECURRENCE-ID']) throw new Error('Il file contiene eventi ricorrenti. Esporta le singole occorrenze: nessun evento è stato importato.');
    if (!fields.DTSTART) throw new Error('Un evento non contiene la data iniziale. Nessun evento è stato importato.');
    if (fields.DURATION && !fields.DTEND) throw new Error('Esporta gli eventi con una data di fine (DTEND) anziché DURATION. Nessun evento è stato importato.');
    const start = parseICSDate(fields.DTSTART), parsedEnd = parseICSDate(fields.DTEND);
    const end = parsedEnd?.date || new Date(start.date.getTime() + (start.allDay ? 86400000 : 3600000));
    if (end <= start.date || (parsedEnd && parsedEnd.allDay !== start.allDay)) throw new Error('Un evento ha una data di fine non valida.');
    rows.push({ title:unescapeICS(fields.SUMMARY?.value) || 'Senza titolo', description:unescapeICS(fields.DESCRIPTION?.value) || null, location:unescapeICS(fields.LOCATION?.value) || null, category:unescapeICS(fields.CATEGORIES?.value) || 'Personale', color:'#8ce9ff', all_day:start.allDay, start_at:start.date.toISOString(), end_at:new Date(end.getTime() - (start.allDay ? 1 : 0)).toISOString() });
  }
  return rows;
}
function downloadICS(name, content) {
  const url = URL.createObjectURL(new Blob([content], {type:'text/calendar;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.getElementById('exportAllBtn').onclick = () => {
  const prefix = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}`;
  const list = Object.values(events).flat().filter(event => event.dateKey.startsWith(prefix));
  if (!list.length) return toastError('Nessun evento da esportare in questo mese.');
  downloadICS(`dv-space-${prefix}.ics`,buildICS(list));
};
document.getElementById('importICSBtn').onclick = () => document.getElementById('importICSInput').click();
document.getElementById('importICSInput').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  const button = document.getElementById('importICSBtn'); button.disabled = true;
  try {
    if (file.size > 5*1024*1024) throw new Error('Il file supera 5 MB. Esporta un periodo più breve.');
    const rows = parseICS(await file.text());
    if (!rows.length) return toastError('Nessun evento valido trovato nel file.');
    if (rows.length > 1000) throw new Error('Importa al massimo 1000 eventi alla volta.');
    await supabaseRequest('', {method:'POST',body:JSON.stringify(rows)});
    await loadEvents(); toastSuccess(`${rows.length} eventi importati.`);
  } catch (error) { toastError('Importazione non completata: ' + error.message); }
  finally { button.disabled = false; event.target.value = ''; }
});

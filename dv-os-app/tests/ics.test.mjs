import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const c=vm.createContext({Date,Intl,TextEncoder,crypto:globalThis.crypto,document:{getElementById:()=>({addEventListener(){}})}});
vm.runInContext(await readFile(new URL('../js/ics.js',import.meta.url),'utf8'),c);
const calendar=body=>`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n${body}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
test('UTC times, long Unicode text, multiline descriptions and location survive export/import',()=>{
 const event={id:'one',dateKey:'2026-09-10',time:'09:30',start_at:'2026-09-10T07:30:00.000Z',end_at:'2026-09-10T08:40:00.000Z',title:'Caffè, studio; idee '.repeat(8),description:'Prima riga\nSeconda \\ nota',location:'Bologna; aula 101',all_day:false};
 const content=c.buildICS([event]);const rows=c.parseICS(content);
 assert.equal(rows[0].start_at,event.start_at);assert.equal(rows[0].end_at,event.end_at);assert.equal(rows[0].title,event.title);assert.equal(rows[0].description,event.description);assert.equal(rows[0].location,event.location);
 for (const line of content.split('\r\n')) assert.ok(Buffer.byteLength(line)<=75);
});
test('Europe/Rome timezone is respected for both winter and summer',()=>{
 for(const [day,hour] of [['20260110','08'],['20260710','07']]) {
  const rows=c.parseICS(calendar(`DTSTART;TZID=Europe/Rome:${day}T093000\r\nDTEND;TZID=Europe/Rome:${day}T103000\r\nSUMMARY:Riunione`));
  assert.equal(rows[0].start_at.slice(11,16),hour+':30');
 }
});
test('multi-day all-day events retain the inclusive stored end date',()=>{
 const event={id:'holiday',dateKey:'2026-09-10',all_day:true,end_at:'2026-09-12T23:59:59.999Z',title:'Viaggio'};
 const content=c.buildICS([event]);assert.match(content,/DTEND;VALUE=DATE:20260913/);
 const rows=c.parseICS(content);assert.equal(rows[0].end_at,event.end_at);assert.equal(rows[0].all_day,true);
});
test('unsupported recurring events fail before any partial import',()=>{
 assert.throws(()=>c.parseICS(calendar('DTSTART:20260910T090000Z\r\nRRULE:FREQ=WEEKLY\r\nSUMMARY:Ripetuto')),/ricorrenti/);
});
test('invalid calendar dates cannot silently overflow into another month',()=>{
 assert.throws(()=>c.parseICS(calendar('DTSTART;VALUE=DATE:20260231\r\nSUMMARY:Errato')),/Data non valida/);
});

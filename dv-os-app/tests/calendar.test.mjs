import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/calendar.js',import.meta.url),'utf8');
const els=new Map();
const element=key=>{if(!els.has(key))els.set(key,{value:'',innerHTML:'',appendChild(){},addEventListener(){},setAttribute(){},querySelector(){return {textContent:''}},reset(){}});return els.get(key)};
const c=vm.createContext({Date,document:{getElementById:element,createElement:element},window:{},console});
vm.runInContext(source,c);
test('timed events preserve the entered local time after a database round trip',()=>{
 const date='2026-09-09';
 const data={title:'Riunione',time:'09:30',endTime:'10:15',allDay:false};
 const payload=c.toDbPayload(data,date);const event=c.mapRow({id:'example',...payload});
 assert.equal(event.dateKey,date);assert.equal(event.time,'09:30');assert.equal(event.endTime,'10:15');
});
test('late-night and early-morning appointments stay on the local date',()=>{
 for(const time of ['00:15','23:45']){
  const payload=c.toDbPayload({title:'Test',time,allDay:false},'2026-09-09');
  const event=c.mapRow({id:'example',...payload});assert.equal(event.dateKey,'2026-09-09');assert.equal(event.time,time);
 }
});
test('all-day events retain the calendar date in every timezone',()=>{
 const payload=c.toDbPayload({title:'Festa',allDay:true},'2026-09-09');const event=c.mapRow(payload);
 assert.equal(event.dateKey,'2026-09-09');assert.equal(event.time,'');assert.equal(event.endTime,'');
});

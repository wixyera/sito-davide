import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/director.js',import.meta.url),'utf8');
function mount({reduced=false,hash='',blockedStorage=false,rejectPlayback=false}={}){
 const elements=[],timers=new Map(),storage=new Map();let next=0;
 class Element{
  constructor(){this.open=false;this.children=[];this.attributes={};this.dataset={};this.style={setProperty(){}};const classes=new Set();this.classList={add:(...c)=>c.forEach(x=>classes.add(x)),remove:(...c)=>c.forEach(x=>classes.delete(x)),contains:c=>classes.has(c)};this.events={};}
  setAttribute(k,v){this.attributes[k]=v}getAttribute(k){return this.attributes[k]??null}
  append(...e){this.children.push(...e)}prepend(e){this.children.unshift(e)}
  querySelector(s){this.nodes??={};if(!this.nodes[s]){const el=new Element();if(s==='video'){el.dataset.src='assets/editorial/fashion-film.mp4';el.play=()=>{el.played=true;return rejectPlayback?Promise.reject(Error('Autoplay blocked')):Promise.resolve()};el.pause=()=>{el.paused=true}}this.nodes[s]=el;}return this.nodes[s]}
  querySelectorAll(){return []}addEventListener(k,f){this.events[k]=f}showModal(){this.open=true}close(){this.open=false;this.events.close?.()}animate(){return {finished:Promise.resolve()}}focus(){}
 }
 const document={body:new Element(),getElementById:id=>document.ids[id]??(document.ids[id]=new Element()),ids:{},querySelector:s=>document.body.querySelector(s),querySelectorAll:()=>[],createElement:()=>{const el=new Element();elements.push(el);return el}};
 vm.runInNewContext(source,{document,matchMedia:()=>({matches:reduced,addEventListener(){}}),location:{hash,search:''},sessionStorage:{getItem:k=>{if(blockedStorage)throw Error('Blocked');return storage.get(k)},setItem:(k,v)=>{if(blockedStorage)throw Error('Blocked');storage.set(k,v)}},setTimeout:f=>{timers.set(++next,f);return next},clearTimeout:id=>timers.delete(id),addEventListener(){},MutationObserver:class{observe(){}},showModule(){}});
 return {intro:elements[0],timers};
}
test('Skipping the fashion intro closes the dialog and stops blocked or playing video',async()=>{for(const rejectPlayback of [false,true]){const {intro,timers}=mount({rejectPlayback});assert.equal(intro.open,true);intro.querySelector('button').onclick();await Promise.resolve();assert.equal(intro.open,false);assert.equal(intro.querySelector('video').paused,true);assert.equal(timers.size,0)}});
test('Unavailable storage and autoplay never prevent timed entry',async()=>{const {intro,timers}=mount({blockedStorage:true,rejectPlayback:true});assert.equal(intro.open,true);[...timers.values()][0]();await Promise.resolve();assert.equal(intro.open,false)});
test('Recovery and reduced motion entry bypass video entirely',()=>{for(const options of [{hash:'#type=recovery'},{reduced:true}]){const {intro}=mount(options);assert.equal(intro.open,false);assert.equal(intro.querySelector('video').played,undefined)}});
test('Escape closes the intro',async()=>{const {intro}=mount();let prevented=false;intro.events.cancel({preventDefault(){prevented=true}});await Promise.resolve();assert.equal(prevented,true);assert.equal(intro.open,false)});
test('The real intro ends with the clip instead of waiting for the safety timeout',async()=>{const {intro}=mount();assert.equal(intro.querySelector('video').muted,true);intro.querySelector('video').events.ended();await Promise.resolve();assert.equal(intro.open,false);assert.equal(intro.querySelector('video').paused,true)});

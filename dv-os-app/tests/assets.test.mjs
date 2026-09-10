import test from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';
const root = new URL('../',import.meta.url);
test('Focus and gallery load from the external script location, including their module dependencies',async()=>{
 const script=new URL('js/experience.js',root),source=await readFile(script,'utf8');
 const imports=[...source.matchAll(/import\('([^']+)'\)/g)].map(match=>new URL(match[1],script));
 assert.equal(imports.length,2);
 for(const file of imports){await access(file);await import(file.href);}
});
test('all precached assets exist and HTML ids are unique',async()=>{
 const sw=await readFile(new URL('service-worker.js',root),'utf8');
 const assets=[...sw.match(/const APP_SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 for(const asset of assets)await access(new URL(asset,root));
 const html=await readFile(new URL('index.html',root),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
});

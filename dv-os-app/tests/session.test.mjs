import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source = await readFile(new URL('../js/config.js',import.meta.url),'utf8');
function setup(fetcher) {
  const storage = new Map([['dv_os_access_token','old'],['dv_os_refresh_token','refresh-old'],['dv_os_expires_at','1']]);
  const c = vm.createContext({URL,AbortSignal,Date,console,fetch:fetcher,navigator:{},document:{getElementById:()=>({classList:{remove(){}}})},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  vm.runInContext(source,c); return {c,storage};
}
test('concurrent requests rotate a refresh token only once', async () => {
  let refreshes=0;
  const {c,storage}=setup(async url => {assert.match(url,/grant_type=refresh_token/);refreshes++;await new Promise(resolve=>setTimeout(resolve,5));return Response.json({access_token:'new',refresh_token:'refresh-new',expires_in:3600});});
  await Promise.all([c.refreshSession(),c.refreshSession(),c.refreshSession()]);
  assert.equal(refreshes,1);assert.equal(storage.get('dv_os_access_token'),'new');assert.equal(storage.get('dv_os_refresh_token'),'refresh-new');
});
test('a network outage never deletes a recoverable session', async () => {
  const {c,storage}=setup(async()=>{throw new TypeError('offline');});
  await assert.rejects(c.refreshSession(),/offline/);assert.equal(storage.get('dv_os_refresh_token'),'refresh-old');
});
test('a revoked refresh token clears both session tokens',async()=>{
  const {c,storage}=setup(async()=>Response.json({msg:'invalid refresh token'},{status:400}));
  await assert.rejects(c.refreshSession());assert.equal(storage.has('dv_os_access_token'),false);assert.equal(storage.has('dv_os_refresh_token'),false);
});
test('RLS refusal is an authorization error, not an expired login',async()=>{
  const {c,storage}=setup(async()=>Response.json({message:'permission denied'},{status:403}));
  storage.set('dv_os_expires_at',String(Date.now()+3600000));vm.runInContext("currentUser={id:'user-a'}",c);
  await assert.rejects(c.tableRequest('https://example.test/rest/v1/events'),/Accesso ai dati negato/);
  assert.equal(storage.get('dv_os_access_token'),'old');
});
test('writes force the signed-in owner and scope updates to that owner',async()=>{
  const requests=[];const {c,storage}=setup(async(url,options)=>{requests.push({url,options});return Response.json([]);});
  storage.set('dv_os_expires_at',String(Date.now()+3600000));vm.runInContext("currentUser={id:'user-a'}",c);
  await c.tableRequest('https://example.test/rest/v1/events','',{method:'POST',body:JSON.stringify([{user_id:'user-b',title:'Test'}])});
  assert.equal(JSON.parse(requests[0].options.body)[0].user_id,'user-a');
  await c.tableRequest('https://example.test/rest/v1/events','?id=eq.record',{method:'PATCH',body:'{}'});
  assert.equal(new URL(requests[1].url).searchParams.get('user_id'),'eq.user-a');
});
test('an unexpected expired access token retries once after refreshing',async()=>{
  let calls=0;const {c,storage}=setup(async(url,options)=>{
    if(url.includes('grant_type=refresh_token')) return Response.json({access_token:'new',refresh_token:'next',expires_in:3600});
    calls++; return options.headers.Authorization==='Bearer new' ? Response.json({ok:true}) : new Response('',{status:401});
  });
  storage.set('dv_os_expires_at',String(Date.now()+3600000));
  const response=await c.authorizedFetch('https://example.test/rest/v1/events');assert.equal(response.status,200);assert.equal(calls,2);
});

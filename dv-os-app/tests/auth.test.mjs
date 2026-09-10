import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/auth.js',import.meta.url),'utf8');
const init=await readFile(new URL('../js/init.js',import.meta.url),'utf8');
function app(){
 const elements=new Map(),calls=[],requests=[],storage=new Map(),session=new Map();
 const element=id=>{if(!elements.has(id)){const classes=new Set();elements.set(id,{value:'',textContent:'',style:{},dataset:{},hidden:false,disabled:false,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},addEventListener(){},setAttribute(){},focus(){}});}return elements.get(id);};
 const kv=map=>({setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)||null,removeItem:k=>map.delete(k)});
 const c=vm.createContext({URL,URLSearchParams,Date,document:{getElementById:element,querySelector:element,querySelectorAll:()=>[]},console,navigator:{},accessToken:null,currentUser:null,localStorage:kv(storage),sessionStorage:kv(session),location:{reload(){calls.push('reload')},origin:'https://example.test',pathname:'/index.html',hash:'',search:''},history:{replaceState(){calls.push('replace-url')}},getCurrentUser:async()=>({id:'account-a'}),applyDisplayName:()=>calls.push('name'),refreshSession:async()=>{},clearSession:()=>{c.accessToken=null;storage.clear()},saveSession:data=>{c.accessToken=data.access_token;storage.set('dv_os_access_token',data.access_token)},authRequest:async(path,options)=>{requests.push({path,options});calls.push('auth');return {access_token:'test-session'}},...Object.fromEntries(['loadEvents','loadCareer','loadContacts','loadWishlist','loadExpenses'].map(name=>[name,async()=>calls.push(name)]))});
 vm.runInContext(source,c);return {c,element,calls,requests,storage,session};
}
test('private UI stays closed when session verification fails',async()=>{const {c,element,calls}=app();c.getCurrentUser=async()=>{throw Error('expired')};await assert.rejects(c.startApp(),/expired/);assert.equal(element('authOverlay').classList.contains('hidden'),false);assert.deepEqual(calls,[])});
test('first registration click only opens setup, without creating an account',async()=>{const {c,element,requests}=app();await c.signup();assert.equal(element('nameFieldWrap').style.display,'block');assert.equal(requests.length,0);assert.equal(element('authPassword').autocomplete,'new-password')});
test('verified login restores all five personal modules',async()=>{const {c,element,calls,storage}=app();element('authEmail').value='test@example.com';element('authPassword').value='old-six-character-password';await c.login();assert.equal(storage.get('dv_os_access_token'),'test-session');assert.equal(element('authOverlay').classList.contains('hidden'),true);assert.deepEqual(calls,['auth','name','loadEvents','loadCareer','loadContacts','loadWishlist','loadExpenses'])});
test('switching from signup to login does not submit credentials',async()=>{const {c,requests,element}=app();await c.signup();await c.login();assert.equal(requests.length,0);assert.equal(element('nameFieldWrap').style.display,'none')});
test('signup sends only identity metadata and opens the email confirmation state',async()=>{
 const {c,element}=app();let request;c.authRequest=async(path,options)=>{request={path,options};return {id:'new-user'}};
 element('authEmail').value='new@example.com';element('authPassword').value='strong-password';element('authName').value='Davide';await c.signup();await c.signup();
 assert.match(request.path,/\/signup\?redirect_to=https%3A%2F%2Fexample.test%2F/);
 assert.deepEqual(JSON.parse(request.options.body).data,{full_name:'Davide'});
 assert.equal(element('authViewEmailSent').classList.contains('hidden'),false);assert.equal(element('sentEmailAddress').textContent,'new@example.com');
});
test('recovery requests an email, without collecting a recovery code or new password',async()=>{
 const {c,element,requests}=app();element('forgotEmail').value='test@example.com';await c.sendRecoveryEmail();await c.sendRecoveryEmail();
 assert.equal(requests.length,1);assert.match(requests[0].path,/^\/recover\?redirect_to=/);assert.deepEqual(JSON.parse(requests[0].options.body),{email:'test@example.com'});
 assert.match(element('forgotMsg').textContent,/Attendi/);
});
test('failed email requests stay retryable and never display success',async()=>{
 const {c,element}=app();let attempts=0;c.authRequest=async()=>{attempts++;throw Error('SMTP unavailable');};element('forgotEmail').value='test@example.com';await c.sendRecoveryEmail();await c.sendRecoveryEmail();assert.equal(attempts,2);assert.match(element('forgotMsg').textContent,/SMTP unavailable/);
});
test('resending confirmation uses the native signup resend route',async()=>{
 const {c,element,requests}=app();element('authEmail').value='test@example.com';await c.resendConfirmation();assert.match(requests[0].path,/^\/resend\?redirect_to=/);assert.deepEqual(JSON.parse(requests[0].options.body),{type:'signup',email:'test@example.com'});
});
test('mismatched new passwords never reach the server',async()=>{
 const {c,element,requests}=app();element('emailNewPassword').value='strong-one';element('emailConfirmPassword').value='strong-two';await c.saveNewPassword();assert.equal(requests.length,0);assert.match(element('newPasswordMsg').textContent,/non coincidono/);
});
test('saving a new password uses the recovered user session and clears recovery state',async()=>{
 const {c,element,requests,session}=app();c.accessToken='recovery-session';session.set('dv-space-email-recovery','pending');element('emailNewPassword').value='strong-password';element('emailConfirmPassword').value='strong-password';await c.saveNewPassword();assert.equal(requests[0].path,'/user');assert.equal(requests[0].options.headers.Authorization,'Bearer recovery-session');assert.equal(session.has('dv-space-email-recovery'),false);assert.match(session.get('dv-space-auth-notice'),/Password aggiornata/);
});
test('recovery links show the password form and remove credentials from the URL',async()=>{
 const {c,element,calls,session}=app();c.location.hash='#access_token=recovery&refresh_token=next&type=recovery&expires_in=3600';await vm.runInContext(init,c);assert.equal(element('authViewNewPassword').classList.contains('hidden'),false);assert.ok(calls.includes('replace-url'));assert.equal(calls.includes('loadEvents'),false);assert.equal(session.get('dv-space-email-recovery'),'pending');
});
test('refreshing the password page preserves the unfinished recovery flow',async()=>{
 const {c,element,calls,session}=app();c.accessToken='recovery';session.set('dv-space-email-recovery','pending');await vm.runInContext(init,c);assert.equal(element('authViewNewPassword').classList.contains('hidden'),false);assert.equal(calls.includes('loadEvents'),false);
});
test('expired email links show a retry message and never open private data',async()=>{
 const {c,element,calls}=app();c.location.hash='#error=access_denied&error_description=expired';await vm.runInContext(init,c);assert.match(element('authMsg').textContent,/scaduto/);assert.equal(calls.includes('loadEvents'),false);
});

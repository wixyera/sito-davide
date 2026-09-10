import {cp,mkdir,readFile,access,rm,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL('.',import.meta.url)));
const output=path.resolve(root,'dist');
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Invalid build destination');
try{if(await realpath(output)!==output)throw Error('Build destination cannot be a link')}catch(e){if(e.code!=='ENOENT')throw e}
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const files=['index.html','privacy.html','manifest.json','service-worker.js','robots.txt','_headers','assets','css','js','experiments','vendor'];
for(const file of files)await cp(path.join(root,file),path.join(output,file),{recursive:true});
const html=await readFile(path.join(root,'index.html'),'utf8');
for(const [,file] of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){
 if(!file.startsWith('http')&&!file.startsWith('data:')&&!file.startsWith('mailto:'))await access(path.join(output,file));
}
for(const api of ['oracolo','spotify-search','fetch-product'])await access(path.join(root,'functions/api',api+'.js'));
console.log('Cloudflare Pages build ready in dist/. Pages Functions remain in functions/.');

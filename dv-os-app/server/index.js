import * as press from '../functions/api/press-news.js';
import * as paypalConfig from '../functions/api/paypal-config.js';
import * as paypalOrder from '../functions/api/paypal-order.js';
import * as productImage from '../functions/api/product-image.js';
import * as football from '../functions/api/football-news.js';
import * as oracle from '../functions/api/oracolo.js';
import * as spotify from '../functions/api/spotify-search.js';
import * as product from '../functions/api/fetch-product.js';
const routes={'/api/press-news':{GET:press.onRequestGet},'/api/paypal-config':{GET:paypalConfig.onRequestGet},'/api/paypal-order':{POST:paypalOrder.onRequestPost},'/api/product-image':{GET:productImage.onRequestGet},'/api/football-news':{GET:football.onRequestGet},'/api/oracolo':{POST:oracle.onRequestPost},'/api/spotify-search':{GET:spotify.onRequestGet},'/api/fetch-product':{POST:product.onRequestPost}};
export default {
 async fetch(request,env,ctx){
  const url=new URL(request.url),route=routes[url.pathname];
  if(route){
   const handler=route[request.method];
   if(!handler)return Response.json({error:'Metodo non consentito.'},{status:405,headers:{Allow:Object.keys(route).join(', ')}});
   const response=await handler({request,env,waitUntil:ctx?.waitUntil?.bind(ctx)});
   const out=new Response(response.body,response);out.headers.set('Cache-Control','no-store');return out;
  }
  if(url.pathname.startsWith('/api/'))return Response.json({error:'Servizio non trovato.'},{status:404});
  return env.ASSETS.fetch(request);
 }
};

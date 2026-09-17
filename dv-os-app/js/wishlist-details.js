/* Versioned envelope in the existing notes column; legacy plain notes stay readable. */
function wishlistDetails(notes){
 const base={notes:typeof notes==='string'?notes:'',size:'',color:'',priority:'normal',purchased:false};
 if(typeof notes!=='string'||!notes.startsWith('DV-WISHLIST/1\n'))return base;
 try{const x=JSON.parse(notes.slice(14));if(!x||typeof x!=='object'||typeof x.notes!=='string')return base;
 return {notes:x.notes,size:typeof x.size==='string'?x.size.slice(0,40):'',color:typeof x.color==='string'?x.color.slice(0,60):'',priority:['normal','high','low'].includes(x.priority)?x.priority:'normal',purchased:x.purchased===true};}catch{return base}
}
function packWishlistDetails(value){return 'DV-WISHLIST/1\n'+JSON.stringify({notes:String(value.notes||''),size:String(value.size||'').slice(0,40),color:String(value.color||'').slice(0,60),priority:['normal','high','low'].includes(value.priority)?value.priority:'normal',purchased:value.purchased===true})}

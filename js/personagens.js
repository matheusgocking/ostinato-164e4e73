/* Avatares dos pacientes, estilo "massinha 3D" (escolha de Matheus, 23/11/2026; quadro em Identidade Visual/Avatares - estilos.html).
   Sem foto real (decisão dele, 23/11/2026): o rosto é desenhado em código. Sem ajuste, sai um rosto sorteado
   pelo nome, gênero e idade (sempre o mesmo para o mesmo nome); na ficha, "Mudar avatar" abre o editor
   (pele, penteado, cor do cabelo, óculos, barba, roupa, fundo, só as iniciais). O ajuste fica no paciente, em p.av
   (uma lista, uma posição por pessoa; o casal tem duas). Usado na lista de Pacientes, na busca e na ficha. */
(function(){
"use strict";
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function pick(r,a){return a[Math.floor(r()*a.length)]}
var PELE=['#F6DCC6','#EBC09A','#D39A6C','#B0744A','#83512F','#5A3824'];
var CABELO=['#1E1A18','#4A2E1E','#7B5232','#B98B4E','#9C4326','#C9CBD3'];
var ROUPA=['#2C4E9E','#16203A','#4F7A6A','#7A6C9E','#A65B3F','#586176'];
var FUNDO=['#DCE5F5','#E6E2F3','#E3EEE8','#F0E7DC','#E3E8EF','#EFE3E8'];
var ESTILOS=[['curto','Curto'],['lado','De lado'],['cacheado','Cacheado'],['longo','Longo'],['chanel','Chanel'],['coque','Coque'],['rabo','Rabo de cavalo'],['raspado','Raspado']];
var NOME_PELE=['Pele muito clara','Pele clara','Pele morena clara','Pele morena','Pele escura','Pele muito escura'];
var NOME_CAB=['Preto','Castanho escuro','Castanho','Loiro','Ruivo','Grisalho'];
var NOME_COR=['Azul','Marinho','Verde','Lilás','Terracota','Cinza'];
var NOME_FUNDO=['Azul claro','Lilás claro','Verde claro','Areia','Cinza claro','Rosa claro'];
function shade(hex,p){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function f(c){return Math.max(0,Math.min(255,Math.round(p<0?c*(1+p):c+(255-c)*p)))}return '#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1)}

/* rosto sorteado: o ponto de partida antes de qualquer ajuste */
function base(pe,sorteio){
  var r=rng(hash(pe.n)+(sorteio||0)*7919), g=pe.g, a=pe.a, child=a<13, old=a>=62;
  var estilos=child?(g==='f'?['rabo','coque','cacheado','longo']:['curto','cacheado','lado']):g==='f'?['longo','chanel','coque','cacheado','rabo']:['curto','lado','cacheado','curto','raspado'];
  var o={g:g,a:a,pele:Math.floor(r()*PELE.length),estilo:pick(r,estilos),roupa:pick(r,ROUPA),fundo:pick(r,FUNDO)};
  o.cabelo=old?CABELO[5]:pick(r,CABELO.slice(0,5));
  o.oculos=a>=45?r()<.6:r()<.2;
  o.barba=g==='m'&&!child&&a>=18&&r()<.35;
  o.ini=false;
  return o;
}
/* "Esconder rostos" (23/11/2026): troca todos os rostos pelas iniciais, para compartilhar a tela; fica guardado no navegador */
var OCULTO=false; try{OCULTO=localStorage.getItem('ostinato-sem-rostos')==='1'}catch(e){}
function cfg(pe){var aj=pe.cfg||{};var o=base(pe,aj.sorteio);for(var k in aj)if(k!=='sorteio')o[k]=aj[k];if(OCULTO&&!pe.real)o.ini=true;return o}
function iniciais(n){var w=String(n||'').trim().split(/\s+/);return ((w[0]||'')[0]||'').toUpperCase()+(w.length>1?(w[w.length-1][0]||'').toUpperCase():'')}

var UID=0;
function draw(o,nome){
  var uid='av'+(UID++),defs='',k=0;
  function F(c){var id=uid+'g'+(k++);defs+='<radialGradient id="'+id+'" cx=".36" cy=".28" r=".9"><stop offset="0" stop-color="'+shade(c,.32)+'"/><stop offset=".55" stop-color="'+c+'"/><stop offset="1" stop-color="'+shade(c,-.28)+'"/></radialGradient>';return 'url(#'+id+')'}
  if(o.ini){var bg=F(o.fundo); return '<svg viewBox="0 0 120 120" aria-hidden="true"><defs>'+defs+'</defs><rect width="120" height="120" fill="'+bg+'"/><text x="60" y="61" text-anchor="middle" dominant-baseline="central" font-family="Hanken Grotesk, system-ui, sans-serif" font-weight="600" font-size="44" fill="#1C1A47">'+iniciais(nome)+'</text></svg>';}
  var child=o.a<13,hx=60,hy=child?60:55,rx=child?23:21,ry=child?24:25,top=hy-ry,by=child?102:98;
  var skin=PELE[o.pele]||PELE[1],hair=o.cabelo,s='';
  s+='<rect width="120" height="120" fill="'+F(o.fundo)+'"/>';
  if(o.estilo==='longo')s+='<path d="M'+(hx-rx-4)+' '+(hy-4)+' Q'+(hx-rx-9)+' '+(hy+46)+' '+(hx-14)+' '+(hy+50)+' L'+(hx+14)+' '+(hy+50)+' Q'+(hx+rx+9)+' '+(hy+46)+' '+(hx+rx+4)+' '+(hy-4)+' Z" fill="'+F(shade(hair,-.12))+'"/>';
  if(o.estilo==='chanel')s+='<path d="M'+(hx-rx-5)+' '+(hy-8)+' Q'+(hx-rx-7)+' '+(hy+24)+' '+(hx-rx+2)+' '+(hy+27)+' L'+(hx+rx-2)+' '+(hy+27)+' Q'+(hx+rx+7)+' '+(hy+24)+' '+(hx+rx+5)+' '+(hy-8)+' Z" fill="'+F(shade(hair,-.12))+'"/>';
  if(o.estilo==='rabo')s+='<ellipse cx="'+(hx+rx+3)+'" cy="'+(hy+6)+'" rx="7" ry="15" fill="'+F(shade(hair,-.1))+'" transform="rotate(-20 '+(hx+rx+3)+' '+(hy+6)+')"/>';
  s+='<path d="M14 122 Q16 '+(by-2)+' 60 '+(by-5)+' Q104 '+(by-2)+' 106 122Z" fill="'+F(o.roupa)+'"/>';
  s+='<path d="M'+(hx-8)+' '+(hy+16)+' L'+(hx-8)+' '+(by-3)+' Q60 '+(by+3)+' '+(hx+8)+' '+(by-3)+' L'+(hx+8)+' '+(hy+16)+'Z" fill="'+shade(skin,-.16)+'"/>';
  var h='';
  h+='<circle cx="'+(hx-rx)+'" cy="'+(hy+3)+'" r="4.6" fill="'+F(skin)+'"/><circle cx="'+(hx+rx)+'" cy="'+(hy+3)+'" r="4.6" fill="'+F(skin)+'"/>';
  h+='<ellipse cx="'+hx+'" cy="'+hy+'" rx="'+rx+'" ry="'+ry+'" fill="'+F(skin)+'"/>';
  if(o.estilo!=='raspado')h+='<ellipse cx="'+hx+'" cy="'+(top+14)+'" rx="'+(rx-3)+'" ry="5" fill="'+shade(skin,-.22)+'" opacity=".45"/>';
  if(o.barba)h+='<path d="M'+(hx-rx+1)+' '+(hy+1)+' Q'+(hx-rx+2)+' '+(hy+ry+3)+' '+hx+' '+(hy+ry+4)+' Q'+(hx+rx-2)+' '+(hy+ry+3)+' '+(hx+rx-1)+' '+(hy+1)+' Q'+(hx+rx-6)+' '+(hy+13)+' '+hx+' '+(hy+12)+' Q'+(hx-rx+6)+' '+(hy+13)+' '+(hx-rx+1)+' '+(hy+1)+'Z" fill="'+F(hair)+'"/>';
  var cap='<path d="M'+(hx-rx-1)+' '+(hy-3)+' Q'+(hx-rx-2)+' '+(top-3)+' '+hx+' '+(top-3)+' Q'+(hx+rx+2)+' '+(top-3)+' '+(hx+rx+1)+' '+(hy-3)+' Q'+(hx+rx-7)+' '+(top+10)+' '+hx+' '+(top+11)+' Q'+(hx-rx+7)+' '+(top+10)+' '+(hx-rx-1)+' '+(hy-3)+'Z" fill="'+F(hair)+'"/>';
  if(['curto','longo','chanel','rabo','coque'].indexOf(o.estilo)>=0)h+=cap;
  if(o.estilo==='coque')h+='<circle cx="'+hx+'" cy="'+(top-6)+'" r="8.5" fill="'+F(hair)+'"/>';
  if(o.estilo==='lado')h+='<path d="M'+(hx-rx-2)+' '+(hy-1)+' Q'+(hx-rx-4)+' '+(top-4)+' '+(hx+2)+' '+(top-3)+' Q'+(hx+rx+4)+' '+(top-2)+' '+(hx+rx+1)+' '+(hy-1)+' Q'+(hx+rx-2)+' '+(top+8)+' '+(hx-6)+' '+(top+12)+' Q'+(hx-rx+3)+' '+(top+16)+' '+(hx-rx-2)+' '+(hy-1)+'Z" fill="'+F(hair)+'"/>';
  if(o.estilo==='raspado')h+='<path d="M'+(hx-rx+1)+' '+(hy-6)+' Q'+(hx-rx+1)+' '+(top-1)+' '+hx+' '+(top-1)+' Q'+(hx+rx-1)+' '+(top-1)+' '+(hx+rx-1)+' '+(hy-6)+' Q'+hx+' '+(top+5)+' '+(hx-rx+1)+' '+(hy-6)+'Z" fill="'+F(hair)+'" opacity=".9"/>';
  if(o.estilo==='cacheado')[[-19,6,8],[-13,-5,10],[0,-10,11],[13,-5,10],[19,6,8],[-22,16,6],[22,16,6],[-7,-9,8],[7,-9,8]].forEach(function(c){h+='<circle cx="'+(hx+c[0])+'" cy="'+(top+c[1]+8)+'" r="'+c[2]+'" fill="'+F(hair)+'"/>'});
  var ey=hy+2,er=child?3:2.5,br=shade(hair,-.2);
  h+='<path d="M'+(hx-13)+' '+(ey-7)+' Q'+(hx-9)+' '+(ey-9)+' '+(hx-5)+' '+(ey-7)+'" stroke="'+br+'" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M'+(hx+5)+' '+(ey-7)+' Q'+(hx+9)+' '+(ey-9)+' '+(hx+13)+' '+(ey-7)+'" stroke="'+br+'" stroke-width="2" fill="none" stroke-linecap="round"/>';
  h+='<circle cx="'+(hx-9)+'" cy="'+ey+'" r="'+er+'" fill="#1A1C2C"/><circle cx="'+(hx+9)+'" cy="'+ey+'" r="'+er+'" fill="#1A1C2C"/>';
  h+='<circle cx="'+(hx-8.2)+'" cy="'+(ey-.9)+'" r=".9" fill="#fff"/><circle cx="'+(hx+9.8)+'" cy="'+(ey-.9)+'" r=".9" fill="#fff"/><circle cx="'+(hx-13)+'" cy="'+(hy+10)+'" r="4" fill="#E8828A" opacity=".28"/><circle cx="'+(hx+13)+'" cy="'+(hy+10)+'" r="4" fill="#E8828A" opacity=".28"/>';
  h+='<path d="M'+(hx-1.5)+' '+(hy+5)+' Q'+hx+' '+(hy+9)+' '+(hx+2)+' '+(hy+8)+'" stroke="'+shade(skin,-.3)+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  h+='<path d="M'+(hx-6)+' '+(hy+14)+' Q'+hx+' '+(hy+19)+' '+(hx+6)+' '+(hy+14)+'" stroke="'+(o.barba?shade(skin,.1):'#8A3E36')+'" stroke-width="2" fill="none" stroke-linecap="round"/>';
  if(o.oculos)h+='<circle cx="'+(hx-9)+'" cy="'+ey+'" r="7" fill="rgba(255,255,255,.14)" stroke="#1A1C2C" stroke-width="1.7"/><circle cx="'+(hx+9)+'" cy="'+ey+'" r="7" fill="rgba(255,255,255,.14)" stroke="#1A1C2C" stroke-width="1.7"/><path d="M'+(hx-2)+' '+ey+' L'+(hx+2)+' '+ey+'" stroke="#1A1C2C" stroke-width="1.7"/>';
  defs+='<filter id="'+uid+'f" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.2" flood-color="#1A1C2C" flood-opacity=".28"/></filter>';
  return '<svg viewBox="0 0 120 120" aria-hidden="true"><defs>'+defs+'</defs>'+s+'<g filter="url(#'+uid+'f)">'+h+'</g></svg>';
}
/* pe = {n: nome, g: 'f' ou 'm', a: idade, cfg: ajuste salvo (opcional)} */
function av(pe){return '<span class="av">'+draw(cfg(pe),pe.n)+'</span>'}

/* ---------- editor (na ficha do paciente) ---------- */
var ED={pid:null,i:0};
var R=function(){return window.Rastro};
function pessoasDe(p){return window.RastroPacientes&&window.RastroPacientes.pessoas?window.RastroPacientes.pessoas(p):[{n:p.nome,g:'f',a:35}]}
function esc(s){return R()?R().escH(s):s}
/* avatar grande no alto da ficha: é o botão que abre e fecha o editor */
function cabeca(p){
  var P=pessoasDe(p), aberto=ED.pid===p.id;
  return '<button class="av-fi" type="button" data-avx="abrir" data-pid="'+p.id+'" aria-expanded="'+aberto+'" aria-label="'+(aberto?'Fechar o editor do avatar':'Mudar o avatar de '+esc(p.nome))+'" title="Mudar avatar">'
    +(P.length>1?'<span class="duo">'+P.map(av).join('')+'</span>':av(P[0]))+'<span class="av-lapis" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5l3 3L6 13H3v-3z"/></svg></span></button>';
}
function bt(campo,v,on,rot,dentro,cls){return '<button type="button" class="'+(cls||'av-sw')+'" data-avx="'+campo+'" data-v="'+v+'" aria-pressed="'+on+'" aria-label="'+rot+'" title="'+rot+'">'+dentro+'</button>'}
function editor(p){
  if(ED.pid!==p.id) return '';
  var P=pessoasDe(p); if(ED.i>=P.length)ED.i=0;
  var pe=Object.assign({},P[ED.i],{real:true}), o=cfg(pe);
  var h='<section class="panel av-ed" aria-label="Editor do avatar"><div class="av-ed-in"><div class="av-ed-hero">'+av(pe)+'<p>'+esc(pe.n)+'</p></div><div class="av-ed-op">';
  if(P.length>1)h+='<span class="av-t">Pessoa</span><div class="av-ch">'+P.map(function(x,i){return bt('pessoa',i,i===ED.i,esc(x.n),esc(x.n.split(' ')[0]),'av-pill')}).join('')+'</div>';
  h+='<span class="av-t">Pele</span><div class="av-ch">'+PELE.map(function(c,i){return bt('pele',i,!o.ini&&o.pele===i,NOME_PELE[i],'<i style="background:'+c+'"></i>')}).join('')+'</div>';
  h+='<span class="av-t">Penteado</span><div class="av-ch">'+ESTILOS.map(function(e){var x=Object.assign({},pe,{cfg:Object.assign({},pe.cfg||{},{estilo:e[0],ini:false})});return bt('estilo',e[0],!o.ini&&o.estilo===e[0],e[1],av(x),'av-mini')}).join('')+'</div>';
  h+='<span class="av-t">Cabelo</span><div class="av-ch">'+CABELO.map(function(c,i){return bt('cabelo',c,!o.ini&&o.cabelo===c,NOME_CAB[i],'<i style="background:'+c+'"></i>')}).join('')+'</div>';
  h+='<span class="av-t">Detalhes</span><div class="av-ch">'+bt('oculos','',!!o.oculos,'Óculos','Óculos','av-pill')+bt('barba','',!!o.barba,'Barba','Barba','av-pill')+'</div>';
  h+='<span class="av-t">Roupa</span><div class="av-ch">'+ROUPA.map(function(c,i){return bt('roupa',c,o.roupa===c,'Roupa '+NOME_COR[i].toLowerCase(),'<i style="background:'+c+'"></i>')}).join('')+'</div>';
  h+='<span class="av-t">Fundo</span><div class="av-ch">'+FUNDO.map(function(c,i){return bt('fundo',c,o.fundo===c,'Fundo '+NOME_FUNDO[i].toLowerCase(),'<i style="background:'+c+'"></i>')}).join('')+'</div>';
  h+='<span class="av-t"></span><div class="av-ch">'+bt('ini','',!!o.ini,'Só as iniciais','Só as iniciais','av-pill')+'<button type="button" class="av-pill" data-avx="sortear">Sortear outro rosto</button><button type="button" class="btn pri sm" data-avx="fechar">Pronto</button></div>';
  return h+'</div></div></section>';
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-avx]'); if(!b||!R())return;
  var a=b.dataset.avx;
  if(a==='rostos'){OCULTO=!OCULTO;try{localStorage.setItem('ostinato-sem-rostos',OCULTO?'1':'0')}catch(e){}rotulo();R().render();if(R().toast)R().toast(OCULTO?'Rostos escondidos: só as iniciais aparecem.':'Rostos de volta.');return}
  if(a==='abrir'){var id=Number(b.dataset.pid);ED.pid=ED.pid===id?null:id;ED.i=0;R().render();return}
  if(a==='fechar'){ED.pid=null;R().render();return}
  if(a==='pessoa'){ED.i=Number(b.dataset.v);R().render();return}
  var p=R().pac(ED.pid); if(!p)return;
  var P=pessoasDe(p), pe=P[ED.i], o=cfg(pe);
  p.av=Array.isArray(p.av)?p.av:[];
  var aj=Object.assign({},p.av[ED.i]||{});
  if(a==='sortear'){aj={sorteio:((aj.sorteio||0)+1)}}
  else if(a==='oculos'||a==='barba'||a==='ini'){aj[a]=!o[a]}
  else {aj[a]=a==='pele'?Number(b.dataset.v):b.dataset.v; if(a!=='fundo')aj.ini=false}
  p.av[ED.i]=aj;
  R().guarda(); R().render();
  var f=document.querySelector('[data-avx="'+a+'"]'+(b.dataset.v!==undefined?'[data-v="'+b.dataset.v+'"]':'')); if(f)f.focus({preventScroll:true});
});
window.addEventListener('hashchange',function(){ED.pid=null});
function rotulo(){var b=document.getElementById('rostos-bt');if(b){b.textContent=OCULTO?'Mostrar rostos':'Esconder rostos';b.setAttribute('aria-pressed',OCULTO)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rotulo);else rotulo();

/* rosto pequeno ao lado do nome nas outras telas: xs 18 px (agenda), s 28 px (listas), m 36 px (títulos), l 48 px (cabeçalho) */
function mini(p,tam){var P=window.RastroPacientes;if(!P||!P.fotos||!p)return '';return '<span class="avm avm-'+(tam||'s')+'" aria-hidden="true">'+P.fotos(p)+'</span>'}

window.RastroPersonagens={av:av,hash:hash,cfg:cfg,cabeca:cabeca,editor:editor,mini:mini,oculto:function(){return OCULTO}};
})();

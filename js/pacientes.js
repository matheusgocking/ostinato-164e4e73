/* Tela de Pacientes do Rastro (14/11/2026), do desenho de Matheus:
   busca em cima; cabeçalho "≡ Nome … +" como o Explorer ou o Excel (≡ classifica e agrupa, + põe colunas);
   uma pessoa por linha, separadas por um fio; etiqueta = selinho na foto com símbolo
   (✓ em dia, $ pagamento em aberto, ! sem próxima sessão, + novo). O casal fica por último.
   Lê os dados pela ponte window.Rastro, que o app (js/app.js) abre no fim do arquivo. */
(function(){
"use strict";
var R=function(){return window.Rastro};
/* ordem padrão por status (Matheus aprovou os cinco status em 16/11/2026); a chave nova do navegador faz quem já usava começar nela */
var VIS={ord:'status',grp:'',cols:['hor','prox'],mostrar:'ativos',modo:'mapa'}; /* modo: 'mapa' (visão geral, js/mapa.js) ou 'lista' */
try{var sv=JSON.parse(localStorage.getItem('rastro-pac-vis3')||'null');if(sv)for(var k in VIS)if(sv[k]!==undefined)VIS[k]=sv[k]}catch(e){}
function guarda(){try{localStorage.setItem('rastro-pac-vis3',JSON.stringify(VIS))}catch(e){}}

var COR={verde:'#2FA86A',amarelo:'#E0A91B',vermelho:'#DD4B4B',cinza:'#9AA3B4',fim:'#6E7687'};
var SIG={verde:'Em dia',amarelo:'Pagamento em aberto',vermelho:'Sem próxima sessão',cinza:'Novo, ainda sem sessão',fim:'Encerrado'};
var ORD={verde:0,amarelo:1,vermelho:2,cinza:3,fim:4};
var ICO={
 verde:'<path d="M2.5 6.2l2.3 2.3 4.7-5"/>',
 amarelo:'<path d="M8 3.8c-.4-.6-1.1-.9-1.9-.9-1 0-1.8.5-1.8 1.3 0 1.8 3.8 1 3.8 2.8 0 .8-.8 1.3-1.9 1.3-.9 0-1.6-.3-2-.9M6 1.5v9"/>',
 vermelho:'<path d="M6 2.5v4.2M6 9.3v.1"/>',
 cinza:'<path d="M6 2.5v7M2.5 6h7"/>',
 fim:'<path d="M3 6h6"/>'
};
/* Status do atendimento, calculado sozinho (pedido de Matheus, 16/11/2026): fala só de como o atendimento anda;
   dinheiro fica na coluna Em aberto e no selinho. Ordem de prioridade: encerrado, novo, faltando, sem sessão, em atendimento. */
var ST={
 novo:{t:'Novo',d:'Ainda não teve a primeira sessão'},
 atend:{t:'Em atendimento',d:'Já atendido e com a próxima sessão marcada'},
 semsess:{t:'Sem sessão marcada',d:'Já atendido, mas nada marcado daqui para a frente'},
 faltando:{t:'Faltando',d:'Faltou às duas últimas sessões'},
 enc:{t:'Encerrado',d:'Atendimento encerrado'}
};
var ST_ORD={faltando:0,semsess:1,novo:2,atend:3,enc:4};
function status(p){
  if(!p.ativo) return 'enc';
  if(!realizadas(p)) return 'novo';
  var ult=R().dados().sess.filter(function(s){return s.pid===p.id&&(s.status==='realizada'||s.status==='falta')})
    .sort(function(a,b){return a.date+a.hora<b.date+b.hora?1:-1}).slice(0,2);
  if(ult.length===2&&ult.every(function(s){return s.status==='falta'})) return 'faltando';
  if(!R().proxima(p.id)) return 'semsess';
  return 'atend';
}
function stH(p){var k=status(p);return '<span class="pst st-'+k+'" title="'+ST[k].d+'">'+ST[k].t+'</span>'}
function realizadas(p){return R().dados().sess.filter(function(s){return s.pid===p.id&&s.status==='realizada'}).length}
function etiqueta(p){
  if(!p.ativo) return 'fim';
  if(!realizadas(p)&&!R().proxima(p.id)) return 'cinza';
  if(!R().proxima(p.id)) return 'vermelho';
  return R().saldo(p.id)?'amarelo':'verde';
}
function selo(c){return '<span class="selo" style="--c:'+COR[c]+'" title="'+SIG[c]+'" role="img" aria-label="'+SIG[c]+'"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="'+(c==='amarelo'?1.8:2)+'" stroke-linecap="round" stroke-linejoin="round">'+ICO[c]+'</svg></span>'}
function dias(p){var nx=R().proxima(p.id);if(!nx)return null;return Math.round((new Date(nx.date+'T12:00')-new Date(R().TODAY+'T12:00'))/864e5)}
function rel(n){return n===0?'hoje':n===1?'amanhã':'em '+n+' dias'}
function casal(p){return p.tipo==='Casal'}
/* cada pessoa do atendimento, para o avatar (js/personagens.js); cfg = ajuste feito no editor da ficha (p.av) */
function pessoas(p){
  var aj=Array.isArray(p.av)?p.av:[];
  if(!casal(p)){var a=p.tipo==='Criança'?9:p.tipo==='Adolescente'?15:25+window.RastroPersonagens.hash(p.nome)%35;
    return [{n:p.nome,g:p.genero==='M'?'m':'f',a:a,cfg:aj[0]}]}
  var src=(p.resp||p.nome).split(',')[0].split(' e ');
  var sob=p.nome.split(' ').pop();
  return src.slice(0,2).map(function(n,i){n=n.trim();if(n.indexOf(' ')<0)n+=' '+sob;return {n:n,g:/a$/i.test(n.split(' ')[0])?'f':'m',a:30+window.RastroPersonagens.hash(n)%25,cfg:aj[i]}});
}
function fotos(p){var P=pessoas(p);return P.length>1?'<span class="duo">'+P.map(window.RastroPersonagens.av).join('')+'</span>':window.RastroPersonagens.av(P[0])}
function sub(p){
  var c=etiqueta(p), n=dias(p), sd=R().saldo(p.id);
  if(c==='fim') return 'Encerrado';
  if(c==='cinza') return 'Ainda sem sessão';
  var t=(casal(p)?'Casal · ':'');
  if(c==='vermelho') return t+'<span class="c-bad">Sem próxima sessão</span>'+(sd?' · <span class="c-warn">'+R().brl(sd)+' em aberto</span>':'');
  return t+'Próxima sessão '+rel(n)+(sd?' · <span class="c-warn">'+R().brl(sd)+' em aberto</span>':'');
}
var COLS={
 tipo:{t:'Tipo',v:function(p){return casal(p)?'Casal':'Individual'}},
 hor:{t:'Horário',v:function(p){return p.ativo?R().cap(R().DOWL[p.dow%7])+' às '+p.hora+(p.freq===14?' <i>quinzenal</i>':''):'<i>Nenhum</i>'}},
 prox:{t:'Próxima sessão',v:function(p){var nx=R().proxima(p.id);return nx?R().cap(rel(dias(p)))+' <i>'+R().dm(nx.date)+'</i>':'<i>Nenhuma marcada</i>'}},
 saldo:{t:'Em aberto',v:function(p){var s=R().saldo(p.id);return s?R().brl(s):'<i>Em dia</i>'}},
 mod:{t:'Modalidade',v:function(p){return p.mod}}
};
var KEYS={
 status:function(p){return ST_ORD[status(p)]*1000+(casal(p)?500:0)},
 etiqueta:function(p){return (casal(p)?9:ORD[etiqueta(p)])+p.nome},
 nome:function(p){return p.nome},
 prox:function(p){var n=dias(p);return n===null?999:n},
 hor:function(p){return ((p.dow+6)%7)*10000+Number(p.hora.replace(':',''))},
 saldo:function(p){return -R().saldo(p.id)}
};
var I={
 menu:'<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 5h12M3 9h12M3 13h12"/></svg>',
 mais:'<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 3v12M3 9h12"/></svg>',
 vai:'<svg class="pvai" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>',
 lupa:'<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="M12 12l3.5 3.5"/></svg>'
};
/* a frase embaixo do titulo: quantos em cada situacao, sem numero solto */
function resumo(l){
  var n={};l.forEach(function(p){var k=status(p);n[k]=(n[k]||0)+1});
  var f=[];
  if(n.atend)f.push(n.atend+' em atendimento');
  if(n.semsess)f.push(n.semsess+' sem sessão marcada');
  if(n.faltando)f.push(R().plural(n.faltando,'faltando','faltando'));
  if(n.novo)f.push(R().plural(n.novo,'novo','novos'));
  if(n.enc)f.push(R().plural(n.enc,'encerrado','encerrados'));
  if(!f.length)return 'Nenhum paciente ainda.';
  return f.length>1?f.slice(0,-1).join(', ')+' e '+f[f.length-1]+'.':f[0]+'.';
}
function linha(p){
  var c=etiqueta(p);
  return '<button class="prow" data-act="pac" data-id="'+p.id+'" data-nome="'+R().escH(p.nome.toLowerCase())+'">'
    +'<span class="pav">'+fotos(p)+selo(c)+'</span>'
    +'<span class="ptx"><span class="pnm">'+R().escH(p.nome)+'</span><span class="psub">'+(status(p)==='atend'?COLS.hor.v(p):'<b class="st-'+status(p)+'">'+ST[status(p)].t+'</b>')+'</span></span>'
    +VIS.cols.map(function(k){return '<span class="pcol">'+COLS[k].v(p)+'</span>'}).join('')
    +'<span class="pstc">'+stH(p)+'</span>'+I.vai
    +'</button>';
}
function vista(){
  var S=R().dados();
  var l=S.pac.filter(function(p){return VIS.mostrar==='todos'?true:VIS.mostrar==='ativos'?p.ativo:!p.ativo});
  l.sort(function(a,b){var x=KEYS[VIS.ord](a),y=KEYS[VIS.ord](b);return typeof x==='number'?x-y:String(x).localeCompare(String(y),'pt-BR')});
  var h='<div class="head hg"><h1>Pacientes</h1><span class="sp"></span><button class="btn pri sm" data-act="pac-new">Novo paciente</button><p>'+resumo(l)+'</p></div>';
  h+='<div class="pbusca">'+I.lupa+'<input id="pbusca" type="search" placeholder="Buscar pelo nome…" aria-label="Buscar paciente pelo nome" autocomplete="off"></div>';
  h+='<div class="ptab"><div class="phead">'
    +'<button class="ib" type="button" data-pm="menu" aria-label="Classificar, agrupar e escolher quem aparece" aria-expanded="false">'+I.menu+'</button>'
    +'<button class="pth ptx'+(VIS.ord==='nome'?' on':'')+'" type="button" data-pm="ord" data-v="nome">Nome'+(VIS.ord==='nome'?' ↓':'')+'</button>'
    +VIS.cols.map(function(k){return '<button class="pth pcol'+(VIS.ord===k?' on':'')+'" type="button" data-pm="ord" data-v="'+(KEYS[k]?k:'nome')+'">'+COLS[k].t+(VIS.ord===k?' ↓':'')+'</button>'}).join('')
    +'<button class="pth pstc'+(VIS.ord==='status'?' on':'')+'" type="button" data-pm="ord" data-v="status">Status'+(VIS.ord==='status'?' ↓':'')+'</button>'
    +'<button class="ib" type="button" data-pm="cols" aria-label="Pôr ou tirar colunas" aria-expanded="false">'+I.mais+'</button></div>';
  h+='<div class="plist" id="plist">';
  if(!l.length) h+='<p class="empty">Nenhum paciente aqui.</p>';
  else if(VIS.grp==='etiqueta'){
    ['verde','amarelo','vermelho','cinza','fim'].forEach(function(c){var g=l.filter(function(p){return etiqueta(p)===c});if(!g.length)return;
      h+='<div class="pgrp">'+selo(c)+SIG[c]+' <span>'+g.length+'</span></div>'+g.map(linha).join('')});
  } else if(VIS.grp==='status'){
    ['faltando','semsess','novo','atend','enc'].forEach(function(k){var g=l.filter(function(p){return status(p)===k});if(!g.length)return;
      h+='<div class="pgrp">'+ST[k].t+' <span>'+g.length+'</span></div>'+g.map(linha).join('')});
  } else h+=l.map(linha).join('');
  return h+'</div></div>';
}
/* menus do cabeçalho */
var pop=null,pb=null;
function fecha(){if(pop){pop.remove();pop=null}if(pb){pb.setAttribute('aria-expanded','false');pb=null}}
function o(g,v,t){return '<button class="o" type="button" data-pg="'+g+'" data-v="'+v+'" aria-checked="'+(VIS[g]===v)+'">'+t+'</button>'}
function menuM(){return '<h3>Classificar por</h3>'+o('ord','status','Status')+o('ord','etiqueta','Etiqueta')+o('ord','nome','Nome')+o('ord','prox','Próxima sessão')+o('ord','saldo','Valor em aberto')
  +'<hr><h3>Agrupar por</h3>'+o('grp','','Nada')+o('grp','status','Status')+o('grp','etiqueta','Etiqueta')
  +'<hr><h3>Mostrar</h3>'+o('mostrar','ativos','Em atendimento')+o('mostrar','encerrados','Encerrados')+o('mostrar','todos','Todos')}
function menuC(){return '<h3>Colunas</h3>'+Object.keys(COLS).map(function(k){return '<label class="sw">'+COLS[k].t+'<input type="checkbox" data-pc="'+k+'"'+(VIS.cols.indexOf(k)>=0?' checked':'')+'></label>'}).join('')}
function abre(qual){
  var b=document.querySelector('[data-pm="'+qual+'"]');if(!b)return;
  fecha();pb=b;b.setAttribute('aria-expanded','true');
  pop=document.createElement('div');pop.className='ppop';pop.innerHTML=qual==='menu'?menuM():menuC();document.body.appendChild(pop);
  var r=b.getBoundingClientRect(), left=qual==='cols'?r.right+scrollX-pop.offsetWidth:r.left+scrollX;
  pop.style.top=(r.bottom+scrollY+8)+'px';pop.style.left=Math.max(8,Math.min(left,innerWidth-pop.offsetWidth-8))+'px';
  pop.addEventListener('click',function(ev){ev.stopPropagation();var x=ev.target.closest('[data-pg]');if(x){VIS[x.dataset.pg]=x.dataset.v;guarda();R().render();abre('menu')}});
  pop.addEventListener('change',function(ev){var x=ev.target.closest('[data-pc]');if(!x)return;var k=x.dataset.pc;
    VIS.cols=x.checked?Object.keys(COLS).filter(function(y){return y===k||VIS.cols.indexOf(y)>=0}):VIS.cols.filter(function(y){return y!==k});guarda();R().render();abre('cols')});
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest('[data-pm]');
  if(!b){if(pop&&!ev.target.closest('.ppop'))fecha();return}
  ev.stopPropagation();
  if(b.dataset.pm==='ord'){VIS.ord=b.dataset.v;guarda();fecha();R().render();return}
  if(pb===b){fecha();return}
  abre(b.dataset.pm);
},true);
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')fecha()});
window.addEventListener('hashchange',fecha);
window.RastroPacientes={vista:vista,fotos:fotos,pessoas:pessoas,status:status,modo:function(v){VIS.modo=v;guarda()}};
})();

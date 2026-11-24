/* Tela Financeiro do Ostinato (23/11/2026, pedido de Matheus: "não estou gostando do visual do financeiro").
   Mesma gramática do Início: o mês numa frase, e cada linha se lê como frase com um botão só.
   Saíram o número gigante, o filtro "Tudo" e a lista única com tudo misturado.
   Entraram: a frase do mês, a barra recebido / a receber / em atraso, os seis meses em barrinhas (que também
   trocam o mês) e a lista separada pelo que fazer: Em atraso e A receber abertos, Recebido e Despesas a um toque.
   Lê os dados pela ponte window.Rastro (js/app.js); as contas continuam em monthData(), sem mudança. */
(function(){
"use strict";
var R=function(){return window.Rastro};
var ABERTO={recebido:false,despesa:false}; /* o que está aberto continua aberto quando a tela se redesenha */
var Q=''; /* busca pelo nome (pedido de Matheus, 23/11/2026): fica guardada enquanto se usa a tela */
var LUPA='<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="M12 12l3.5 3.5"/></svg>';
function liso(t){return String(t||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'')}
var SETA='<svg class="fn-chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>';

function av(p){var P=window.RastroPersonagens;return P&&P.mini?P.mini(p):''}
function mes(ym){return R().MES[Number(ym.slice(5))-1]}
function mesAno(ym){return mes(ym)+' de '+ym.slice(0,4)}
function dif(a,b){var x=a.split('-').map(Number),y=b.split('-').map(Number);return (x[0]-y[0])*12+(x[1]-y[1])}
function ha(date){var n=Math.round((new Date(R().TODAY+'T12:00')-new Date(date+'T12:00'))/864e5);return n<=0?'hoje':n===1?'ontem':'há '+n+' dias'}
function soma(l){return l.reduce(function(t,x){return t+x.valor},0)}

/* os seis meses da faixa: terminam no mês de hoje, a não ser que o mês aberto esteja fora dela */
function janela(ref){
  var cur=R().TODAY.slice(0,7), fim=ref>cur?ref:cur, ini=R().ymAdd(fim,-5), l=[];
  if(ref<ini)ini=ref;
  for(var i=0;i<6;i++)l.push(R().ymAdd(ini,i));
  return l;
}
function mesesH(ref){
  var cur=R().TODAY.slice(0,7), D=janela(ref).map(function(m){return {m:m,r:R().monthData(m).rec}});
  var max=Math.max.apply(null,D.map(function(x){return x.r}))||1;
  var h='<nav class="fn-meses" aria-label="Escolher o mês"><p class="fn-mcap">Recebido por mês</p><div class="fn-mrow">'
    +'<button class="fn-seta" type="button" data-act="fin-nav" data-n="-1" aria-label="Mês anterior">‹</button><div class="fn-mb">';
  D.forEach(function(x){
    var alt=x.r?Math.max(4,Math.round(x.r/max*56)):2, t=R().cap(mesAno(x.m))+': '+R().brl(x.r)+' recebidos', in_='<i style="height:'+alt+'px"></i><span>'+mes(x.m).slice(0,3)+'</span>';
    h+=x.m===ref?'<span class="fn-mes on" aria-current="true" title="'+t+'">'+in_+'</span>'
      :'<button class="fn-mes" type="button" data-act="fin-nav" data-n="'+dif(x.m,ref)+'" title="'+t+'" aria-label="'+t+'">'+in_+'</button>';
  });
  h+='</div><button class="fn-seta" type="button" data-act="fin-nav" data-n="1" aria-label="Próximo mês">›</button></div>';
  if(ref!==cur)h+='<button class="link fn-volta" type="button" data-act="fin-nav" data-n="0">Voltar para '+mes(cur)+'</button>';
  return h+'</nav>';
}

/* a frase do mês: quanto entrou do que já foi atendido */
function fraseH(ym,M){
  var cur=R().TODAY.slice(0,7), b=R().brl, tot=M.rec+M.arec+M.atr, onde=ym.slice(0,4)===cur.slice(0,4)?mes(ym):mesAno(ym), ja=ym===cur?' já':'';
  if(!tot) return 'Nenhuma sessão atendida em '+onde+(ym>=cur?' ainda.':'.');
  if(M.rec>=tot) return 'Entrou tudo o que você'+ja+' atendeu em '+onde+': '+b(M.rec)+'.';
  if(!M.rec) return 'Nada entrou ainda dos '+b(tot)+' que você'+ja+' atendeu em '+onde+'.';
  return 'Entraram '+b(M.rec)+' dos '+b(tot)+' que você'+ja+' atendeu em '+onde+'.';
}
function barraH(M){
  var tot=M.rec+M.arec+M.atr, pc=function(v){return Math.round(v/tot*100)};
  if(!tot) return '';
  return '<div class="fn-bar" role="img" aria-label="Do que foi atendido no mês: '+pc(M.rec)+'% recebido, '+pc(M.arec)+'% a receber e '+pc(M.atr)+'% em atraso.">'
    +(M.rec?'<i class="ok" style="flex-grow:'+M.rec+'"></i>':'')+(M.arec?'<i class="ar" style="flex-grow:'+M.arec+'"></i>':'')+(M.atr?'<i class="at" style="flex-grow:'+M.atr+'"></i>':'')+'</div>';
}

/* linhas */
function nomeH(p){return '<span class="n">'+av(p)+'<span class="nm">'+R().escH(p.nome)+'</span></span>'}
function devida(x){var s=x.s,p=R().pac(s.pid);
  return '<div class="fn-row"><button class="fn-rm" type="button" data-act="sess" data-id="'+s.id+'"><span class="d">'+R().dm(s.date)+'</span>'+nomeH(p)
    +'<span class="q">'+(s.status==='falta'?'Falta cobrada, '+ha(s.date):R().cap(ha(s.date)))+'.</span><span class="v">'+R().brl(x.valor)+'</span></button>'
    +'<button class="btn sm" type="button" data-act="sess" data-id="'+s.id+'">Receber</button></div>';
}
function paga(x){var s=x.s,p=R().pac(s.pid);
  return '<div class="fn-row pg"><button class="fn-rm" type="button" data-act="sess" data-id="'+s.id+'"><span class="d">'+R().dm(s.date)+'</span>'+nomeH(p)
    +'<span class="q">'+(s.forma?'Por '+R().escH(s.forma)+'.':'')+'</span><span class="v">'+R().brl(x.valor)+'</span></button><span></span></div>';
}
function despesa(x){var d=x.d, U=R().UI;
  return '<div class="fn-row pg"><div class="fn-rm"><span class="d">'+R().dm(x.date)+'</span><span class="n"><span class="nm">'+R().escH(d.desc)+'</span></span>'
    +'<span class="q">'+(d.cat?R().escH(d.cat)+'.':'')+'</span><span class="v">− '+R().brl(x.valor)+'</span></div>'
    +(U.confirmDesp===d.id?'<button class="link c-bad" type="button" data-act="desp-del-ok" data-id="'+d.id+'">Confirmar</button>':'<button class="link" type="button" data-act="desp-del" data-id="'+d.id+'">Apagar</button>')+'</div>';
}
function cab(cls,t,l,un,uns,menos){
  return '<span class="tt"><i></i>'+t+'<span class="c">'+R().plural(l.length,un,uns)+'</span></span><span class="tot">'+(menos?'− ':'')+R().brl(soma(l))+'</span>';
}
function aberta(cls,t,l,un,uns,fn){
  return l.length?'<section class="fn-sec '+cls+'"><h2>'+cab(cls,t,l,un,uns)+'<span></span></h2><div class="fn-list">'+l.map(fn).join('')+'</div></section>':'';
}
function fechada(k,cls,t,l,un,uns,fn,menos){
  return l.length?'<details class="fn-sec '+cls+'" data-fn="'+k+'"'+(ABERTO[k]||Q?' open':'')+'><summary><h2>'+cab(cls,t,l,un,uns,menos)+'</h2>'+SETA+'</summary><div class="fn-list">'+l.map(fn).join('')+'</div></details>':'';
}

/* relatórios (a um toque, pelo menu "…"): previsão, recebido e despesas dos seis meses e o pago por paciente no ano */
function grafico(){
  var cur=R().TODAY.slice(0,7), ms=[]; for(var i=5;i>=0;i--)ms.push(R().ymAdd(cur,-i));
  var D=ms.map(function(m){var x=R().monthData(m);return {m:m,r:x.rec,d:x.desp}}), max=Math.max.apply(null,D.map(function(x){return Math.max(x.r,x.d)}))||1, top=Math.ceil(max/1000)*1000;
  var W=420,H=200,l=44,r=8,t=10,b=24,bw=(W-l-r)/D.length,Y=function(v){return t+(H-t-b)*(1-v/top)},g='';
  for(var k=0;k<=top;k+=top/4) g+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(k)+'" y2="'+Y(k)+'" style="stroke:var(--line)"/><text x="'+(l-5)+'" y="'+(Y(k)+4)+'" text-anchor="end">'+(k>=1000?(k/1000).toLocaleString('pt-BR')+' mil':k)+'</text>';
  D.forEach(function(x,i){ var x0=l+bw*i+bw*.16, w=bw*.3;
    g+='<rect x="'+x0+'" y="'+Y(x.r)+'" width="'+w+'" height="'+(Y(0)-Y(x.r))+'" rx="2" style="fill:var(--accent)"><title>'+R().brl(x.r)+' recebido</title></rect><rect x="'+(x0+w+3)+'" y="'+Y(x.d)+'" width="'+w+'" height="'+(Y(0)-Y(x.d))+'" rx="2" style="fill:var(--bar2)"><title>'+R().brl(x.d)+' de despesas</title></rect><text x="'+(l+bw*i+bw/2)+'" y="'+(H-7)+'" text-anchor="middle">'+mes(x.m).slice(0,3)+'</text>'; });
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Recebido e despesas dos últimos seis meses">'+g+'</svg><div class="legend" style="margin-top:8px"><span><i style="background:var(--accent)"></i>Recebido</span><span><i style="background:var(--bar2)"></i>Despesas</span></div>';
}
function relatoriosH(ym,M){
  var S=R().dados(), b=R().brl, ano=ym.slice(0,4);
  var porPac=S.pac.map(function(p){var l=S.sess.filter(function(s){return s.pid===p.id&&s.pago&&R().due(s)&&s.date.slice(0,4)===ano});return {p:p,n:l.length,t:l.reduce(function(t,s){return t+s.valor},0)}}).filter(function(x){return x.n}).sort(function(x,y){return y.t-x.t});
  return '<div class="col"><div class="panel"><h3>Previsão do mês</h3><dl class="kv"><dt>Já realizado</dt><dd class="num">'+b(M.rec+M.arec+M.atr)+'</dd><dt>Ainda marcado</dt><dd class="num">'+b(M.prev)+'</dd><dt>Se tudo acontecer</dt><dd class="num"><b>'+b(M.rec+M.arec+M.atr+M.prev)+'</b></dd></dl></div>'
    +'<div class="panel"><h3>Recebido e despesas</h3><div class="pad chart">'+grafico()+'</div></div>'
    +'<div class="panel"><h3>Relatório de '+ano+' <small>pago por paciente, para o imposto de renda.</small></h3><div class="rows">'+(porPac.length?porPac.map(function(x){return '<div class="row"><span class="t num">'+x.n+'</span><span class="d">'+av(x.p)+R().escH(x.p.nome)+'<small>'+R().plural(x.n,'sessão paga','sessões pagas')+'.</small></span><span class="v">'+b(x.t)+'</span></div>'}).join(''):'<p class="empty">Nada pago neste ano.</p>')+'</div></div></div>';
}

function vista(){
  var U=R().UI, ym=U.finRef, M=R().monthData(ym), cur=R().TODAY.slice(0,7);
  if(U.finBuscaMes!==ym){Q='';U.finBuscaMes=ym} /* trocou de mês, a busca recomeça */
  var h='<div class="head hg"><h1>Financeiro</h1><span class="sp"></span>'
    +'<details class="mais"><summary class="btn sm" aria-label="Mais opções">…</summary><div class="mais-m"><button class="fn-cel" data-act="desp-new">Lançar despesa</button><button data-act="fin-rel">'+(U.finRel?'Esconder relatórios':'Relatórios')+'</button><button data-act="decl">Declaração para reembolso</button></div></details>'
    +'<button class="btn pri sm fn-desk" data-act="desp-new">Lançar despesa</button><p>'+R().cap(mesAno(ym))+'</p></div>';
  h+='<div class="fn-topo"><p class="fn-frase">'+fraseH(ym,M)+'</p>'+mesesH(ym)+barraH(M)
    +(M.prev&&ym>=cur?'<p class="fn-prev">Ainda há '+R().brl(M.prev)+' em sessões marcadas até o fim do mês.</p>':'')+'</div>';
  if(M.items.length)h+='<div class="pbusca fn-busca">'+LUPA+'<input id="fbusca" type="search" placeholder="Buscar pelo nome…" aria-label="Buscar no financeiro pelo nome do paciente ou da despesa" autocomplete="off" value="'+R().escH(Q)+'"></div>';
  var secs=secoesH(ym,M);
  return h+(U.finRel?'<div class="two">'+secs+relatoriosH(ym,M)+'</div>':secs);
}
/* as seções, já com a busca: quem não casa com o nome some, e as contagens e os totais passam a ser só do que ficou */
function secoesH(ym,M){
  var q=liso(Q).trim();
  var casa=function(x){return !q||liso(x.k==='despesa'?x.d.desc:R().pac(x.s.pid).nome).indexOf(q)>=0};
  var por=function(k){return M.items.filter(function(x){return x.k===k&&casa(x)})};
  var secs=aberta('at','Em atraso',por('atraso'),'sessão','sessões',devida)
    +aberta('ar','A receber',por('receber'),'sessão','sessões',devida)
    +fechada('recebido','ok','Recebido',por('recebido'),'sessão','sessões',paga)
    +fechada('despesa','dp','Despesas',por('despesa'),'lançamento','lançamentos',despesa,true);
  var vazio=q?'Ninguém com “'+R().escH(Q.trim())+'” em '+mes(ym)+'.':'Nada para receber nem despesa lançada em '+mes(ym)+'.';
  return '<div class="fn-secs" id="fn-secs">'+(secs||'<p class="empty">'+vazio+'</p>')+'</div>';
}
/* ao digitar, troca só a lista (o campo fica onde está, com o cursor) */
document.addEventListener('input',function(ev){
  if(!ev.target||ev.target.id!=='fbusca')return;
  Q=ev.target.value;
  var U=R().UI, box=document.getElementById('fn-secs');
  if(box)box.outerHTML=secoesH(U.finRef,R().monthData(U.finRef));
});
/* "toggle" não sobe na página: escuta na descida */
document.addEventListener('toggle',function(ev){var d=ev.target;if(d&&d.dataset&&d.dataset.fn)ABERTO[d.dataset.fn]=d.open},true);
window.RastroFinanceiro={vista:vista};
})();

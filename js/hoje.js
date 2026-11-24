/* Tela Hoje enxuta (pedido de Matheus, 14/11/2026: menos informação na tela, mais simples que a Sintropia).
   Jeito escolhido por ele entre três (o 1, "só o dia"): as sessões do dia com as bolinhas e uma linha discreta
   com o que ficou para trás, que abre ao tocar. Nada de valor em dinheiro nem frase longa.
   Entra pelo vHoje do app.js, que chama window.RastroHoje.vista(). */
(function(){
  var R=window.Rastro, S=R.dados(), UI=R.UI, TODAY=R.TODAY, NOW=R.NOW, DUR=R.DUR, ACT=R.ACT, go=R.go, render=R.render;
  var sessOn=R.sessOn,viva=R.viva,estado=R.estado,porRegistrar=R.porRegistrar,due=R.due,recState=R.recState,pac=R.pac,curto=R.curto,rastroH=R.rastroH,longDate=R.longDate,quando=R.quando,cap=R.cap,iso=R.iso,addDays=R.addDays,minOf=R.minOf,nowMin=R.nowMin,compsOn=R.compsOn,escH=R.escH,dm=R.dm,plural=R.plural;
  var $$=function(q){return Array.prototype.slice.call(document.querySelectorAll(q))};
  var asc=function(a,b){return a.date<b.date?-1:(a.date>b.date?1:(a.hora<b.hora?-1:1))};

  function diaAlvo(){ var hoje=sessOn(TODAY).filter(viva); if(hoje.length)return TODAY;
    for(var i=1;i<10;i++){var x=iso(addDays(NOW,i)); if(sessOn(x).some(viva))return x} return null }
  function pend(){
    var ac=S.sess.filter(function(s){return estado(s)==='aconf'&&s.date!==TODAY}).sort(asc);
    var reg=porRegistrar().filter(function(s){return s.date!==TODAY});
    var rec=S.sess.filter(function(s){return due(s)&&!s.pago&&recState(s)==='atraso'}).sort(asc);
    return [
      {k:'marcar',t:'Dizer se aconteceu',l:ac,row:function(s){return linha('ev','data-id="'+s.id+'"',pac(s.pid).nome,cap(longDate(s.date))+', '+s.hora)}},
      {k:'registrar',t:'Registrar',l:reg,row:function(s){return linha('pr-open','data-id="'+s.pid+'" data-sid="'+s.id+'"',pac(s.pid).nome,cap(longDate(s.date)))}},
      {k:'receber',t:'Receber',l:rec,row:function(s){return linha('sess','data-id="'+s.id+'"',pac(s.pid).nome,'desde '+dm(s.date))}}
    ].filter(function(g){return g.l.length});
  }
  function linha(act,attrs,nome,sub){return '<button class="hj-l" data-act="'+act+'" '+attrs+'><b>'+escH(nome)+'</b><span>'+sub+'</span></button>'}
  function sessLinha(s,mostraDia){var p=pac(s.pid);
    return '<button class="hj-s'+(s.status==='realizada'||s.status==='falta'?' feita':'')+'" data-act="ev" data-id="'+s.id+'"><span class="h">'+s.hora+'</span><b>'+escH(curto(p))+'</b>'+rastroH(s)+'</button>'}
  function compLinha(o){return '<button class="hj-s comp" data-act="cp" data-id="'+o.c.id+'" data-orig="'+o.orig+'"><span class="h">'+o.ini+'</span><b>'+escH(o.c.tit)+'</b><span></span></button>'}
  function itensDo(d){var it=[];sessOn(d).filter(viva).forEach(function(s){it.push({t:s.hora,h:sessLinha(s)})});compsOn(d).forEach(function(o){it.push({t:o.ini,h:compLinha(o)})});
    return it.sort(function(a,b){return a.t<b.t?-1:1})}
  function titulo(d){return d===TODAY?'Hoje':d?cap(quando(d)):'Hoje'}

  function v1(){
    var d=diaAlvo(), it=d?itensDo(d):[], g=pend(), tot=g.reduce(function(t,x){return t+x.l.length},0);
    var h='<div class="hj hj1"><header><p class="hj-data">'+cap(longDate(TODAY))+'</p><h1>'+(d===TODAY?plural(it.length,'sessão','sessões')+' hoje':d?'Nada hoje. Próximas: '+quando(d):'Dia livre')+'</h1></header>';
    h+='<section class="hj-lista">'+(it.length?it.map(function(x){return x.h}).join(''):'<p class="empty">Nenhuma sessão marcada.</p>')+'</section>';
    if(tot){ h+='<details class="hj-pend"><summary>'+plural(tot,'coisa ficou','coisas ficaram')+' para trás</summary>'+g.map(function(x){return '<p class="hj-g">'+x.t+' <span>'+x.l.length+'</span></p>'+x.l.slice(0,4).map(x.row).join('')}).join('')+'</details>'; }
    else h+='<p class="hj-ok">Nada ficou para trás.</p>';
    return h+'</div>';
  }
  /* Hoje, versão 2 (16/11/2026). Pesquisa: no SimplePractice a tela inicial é a agenda, com o aviso de nota por
     escrever no próprio horário; no TherapyNotes a inicial traz um resumo de pendências por categoria, cada uma com
     a contagem e o link para a lista. Daí: a sessão que vem a seguir em destaque, o resto do dia em lista curta,
     as pendências sempre à vista como contadores (abrem ao tocar) e uma linha sobre amanhã.
     A versão 1 continua em v1() e abre com ?hoje=1 no endereço. */
  function seguinte(it){ var nm=nowMin(); for(var i=0;i<it.length;i++){var s=it[i]; if(minOf(s.hora)+DUR>nm&&s.status!=='realizada'&&s.status!=='falta')return s} return null }
  function falta(m){ if(m<=0)return 'agora'; if(m<60)return 'em '+m+' min'; var h=Math.floor(m/60),r=m%60; return 'em '+h+'h'+(r?(r<10?'0':'')+r:'') }
  function v2(){
    var ss=sessOn(TODAY).filter(viva).sort(asc), nx=seguinte(ss), g=pend(), outro=false;
    /* dia acabou: o destaque vira a primeira sessão dos próximos dias */
    if(!nx){ for(var i=1;i<15&&!nx;i++){var l=sessOn(iso(addDays(NOW,i))).filter(viva).sort(asc); if(l.length){nx=l[0];outro=true}} }
    var h='<div class="hj hj2"><header><p class="hj-data">'+cap(longDate(TODAY))+'</p><h1>'+(ss.length?plural(ss.length,'sessão','sessões')+' hoje':'Nenhuma sessão hoje')+'</h1></header>';
    var card='';
    if(nx){ var p=pac(nx.pid), m=minOf(nx.hora)-nowMin();
      card='<section class="hj-next'+(outro?' outro':'')+'"><p class="hj-k">'+(outro?'Próxima sessão · '+quando(nx.date)+', '+nx.hora:(m<=0?'Agora':'A seguir')+' · '+nx.hora+' · '+falta(m))+'</p>'
        +(site?'<p class="hj-nome">'+escH(p.nome)+'</p>':'<button class="hj-nome" data-act="pac" data-id="'+p.id+'">'+escH(p.nome)+'</button>')
        +'<p class="hj-meta">'+escH(p.tipo==='Casal'?'Casal':'Individual')+(p.mod?' · '+escH(p.mod):'')+' · '+rastroH(nx)+'</p>'
        +'<div class="hj-acts"><button class="btn pri sm" data-act="pr-open" data-id="'+p.id+'" data-sid="'+nx.id+'">Abrir prontuário</button><button class="btn sm" data-act="ev" data-id="'+nx.id+'">Sessão</button></div></section>'; }
    var resto=ss.filter(function(s){return s!==nx}), cs=compsOn(TODAY);
    if(resto.length||cs.length){ var it=resto.map(function(s){return {t:s.hora,h:sessLinha(s)}}).concat(cs.map(function(o){return {t:o.ini,h:compLinha(o)}})).sort(function(a,b){return a.t<b.t?-1:1});
      var lista='<section class="hj-lista">'+it.map(function(x){return x.h}).join('')+'</section>'; h+=outro?lista+card:card+lista; }
    else h+=card;
    h+='<section class="hj-pz"><h2>Pendências</h2>';
    if(g.length){ h+='<div class="hj-cont">'+g.map(function(x){return '<details class="hj-c k-'+x.k+'"><summary><b>'+x.l.length+'</b><span>'+x.t+'</span></summary><div class="hj-cl">'+x.l.slice(0,6).map(x.row).join('')+(x.l.length>6?'<p class="hj-mais">e mais '+(x.l.length-6)+'</p>':'')+'</div></details>'}).join('')+'</div>'; }
    else h+='<p class="hj-ok">Nada ficou para trás.</p>';
    h+='</section>';
    var am=iso(addDays(NOW,1)), sa=sessOn(am).filter(viva), sc=sa.filter(function(s){return s.status==='agendada'}).length;
    h+='<button class="hj-am" data-act="hj-amanha" data-d="'+am+'"><span>Amanhã</span>'+(sa.length?plural(sa.length,'sessão','sessões')+(sc?', '+sc+' sem confirmar':', todas confirmadas'):'nenhuma sessão')+' <i>›</i></button>';
    return h+'</div>';
  }
  ACT['hj-amanha']=function(b){UI.agRef=b.dataset.d;UI.agDay=b.dataset.d;UI.agMode='semana';go('app-agenda')};

  /* Hoje, versão 3 (18/11/2026): "o dia como um rastro". Pedido de Matheus: simples, mas dinâmico, com um
     display das informações no início. O dia vira uma linha de pontos (o desenho do produto, na escala do dia):
     ponto cheio já foi, anel é a de agora, vazio ainda vem, e um marcador anda com a hora. Tocar num ponto troca
     o cartão de baixo. Embaixo, o que ficou para trás (abre ao tocar) e a semana em pontinhos.
     Referências: Dayline (github.com/bitmux/Dayline, o dia numa linha só com marcador do agora e barra de
     progresso no que está acontecendo) e a regra de mostrar o resumo e abrir o detalhe só quando a pessoa pede.
     Por enquanto abre com ?hoje=3 no endereço; a versão 2 continua sendo a padrão. */
  var faltaInfo=R.faltaInfo, DOWC=['dom','seg','ter','qua','qui','sex','sáb'];
  function hm(m){var h=Math.floor(m/60),r=m%60;return (h<10?'0':'')+h+':'+(r<10?'0':'')+r}
  /* DIA: o dia que a linha desenha. No app é sempre hoje; na abertura do site pode ser o próximo dia com sessão. */
  var DIA=TODAY;
  function agoraM(){return DIA===TODAY?nowMin():(DIA<TODAY?1e5:-1e5)}
  function noDia(d,f){var a=DIA;DIA=d;try{return f()}finally{DIA=a}}
  function itens3(){ var it=[];
    sessOn(DIA).filter(viva).forEach(function(s){it.push({k:'s',id:String(s.id),t:s.hora,s:s})});
    compsOn(DIA).forEach(function(o){it.push({k:'c',id:'c'+o.c.id,t:o.ini,o:o})});
    return it.sort(function(a,b){return a.t<b.t?-1:1}) }
  function ptCls(x){ if(x.k==='c')return 'c'+(minOf(x.t)+DUR<=agoraM()?' d':'');
    var s=x.s, ini=minOf(s.hora), nm=agoraM();
    if(s.status==='realizada')return 'd'; if(s.status==='falta')return 'x';
    if(nm>=ini&&nm<ini+DUR)return 'a'; if(estado(s)==='aconf')return 'r'; return '' }
  /* onde o marcador do agora fica na linha, de 0 a 1: os pontos têm o mesmo espaço entre si, e a hora anda entre eles */
  function posAgora(it){ var n=it.length, nm=agoraM(), c=function(i){return (i+.5)/n}, t=it.map(function(x){return minOf(x.t)});
    if(nm<=t[0])return c(0)*Math.max(0,1-(t[0]-nm)/120);
    for(var i=0;i<n-1;i++) if(nm<t[i+1])return c(i)+(c(i+1)-c(i))*(nm-t[i])/Math.max(1,t[i+1]-t[i]);
    return c(n-1)+(1-c(n-1))*Math.min(1,(nm-t[n-1])/120) }
  function linha3(it,sel,site){ var p=posAgora(it)*100;
    return '<div class="hj-dia'+(it.length>6?' muitos':'')+(DIA!==TODAY?' fora':'')+'"'+(site?' data-site="'+DIA+'"':'')+' style="--n:'+it.length+';--p:'+p.toFixed(2)+'%"><span class="hj-tr"><i></i></span><span class="hj-ag"><b>'+hm(nowMin())+'</b></span>'
      +it.map(function(x){ var nome=x.k==='c'?x.o.c.tit:(pac(x.s.pid).tipo==='Casal'?curto(pac(x.s.pid)):pac(x.s.pid).nome.split(' ')[0]);
        return '<button class="hj-pt '+ptCls(x)+'" style="--i:'+it.indexOf(x)+'" data-act="hj-sel" data-id="'+x.id+'" aria-pressed="'+(x.id===sel)+'"><i></i><span class="h">'+x.t+'</span><span class="n">'+escH(nome)+'</span></button>' }).join('')+'</div>' }
  function card3(x,outro,site){
    if(!x)return '';
    var noSite='<p class="hj-leg">Os cinco pontos de cada sessão: marcada, confirmada, realizada, registrada e paga.</p><div class="hj-acts"><button class="btn pri sm" data-act="nav" data-to="app-hoje">Abrir no consultório de exemplo</button></div>';
    if(x.k==='c'&&site){ return '<section class="hj-next comp"><p class="hj-k">Compromisso, '+x.o.ini+'</p><p class="hj-nome">'+escH(x.o.c.tit)+'</p><p class="hj-leg">Compromissos entram na mesma agenda, sem rastro.</p></section>' }
    if(x.k==='c'){ var o=x.o; return '<section class="hj-next comp"><p class="hj-k">Compromisso, '+o.ini+'</p><p class="hj-nome">'+escH(o.c.tit)+'</p><div class="hj-acts"><button class="btn sm" data-act="cp" data-id="'+o.c.id+'" data-orig="'+o.orig+'">Abrir</button></div></section>' }
    var s=x.s, p=pac(s.pid), nm=agoraM(), ini=minOf(s.hora), fi=faltaInfo(s), k, prog='';
    if(outro)k='Próxima sessão, '+quando(s.date)+' às '+s.hora;
    else if(DIA!==TODAY)k=cap(quando(s.date))+', '+s.hora;
    else if(s.status==='realizada')k='Atendida às '+s.hora;
    else if(s.status==='falta')k='Não veio às '+s.hora;
    else if(nm>=ini&&nm<ini+DUR){k='Agora, até '+hm(ini+DUR);prog='<span class="hj-bar" role="img" aria-label="'+(nm-ini)+' de '+DUR+' minutos"><i style="width:'+Math.round((nm-ini)/DUR*100)+'%"></i></span>'}
    else if(nm<ini)k='A seguir, '+s.hora+', '+falta(ini-nm);
    else k='Era às '+s.hora;
    var pri=fi.a?'<button class="btn pri sm" data-act="'+fi.act+'" data-id="'+(fi.act==='pr-open'?p.id+'" data-sid="'+s.id:s.id)+'">'+fi.a+'</button>':'';
    var pront='<button class="btn sm'+(pri?'':' pri')+'" data-act="pr-open" data-id="'+p.id+'" data-sid="'+s.id+'">Abrir prontuário</button>';
    if(fi.act==='pr-open')pront='<button class="btn sm" data-act="ev" data-id="'+s.id+'">Sessão</button>';
    var foto=window.RastroPacientes&&window.RastroPacientes.fotos?'<span class="pav hj-av">'+window.RastroPacientes.fotos(p)+'</span>':'';
    return '<section class="hj-next hj-n3'+(outro?' outro':'')+'">'+foto+'<div><p class="hj-k">'+k+'</p>'+prog
      +'<button class="hj-nome" data-act="pac" data-id="'+p.id+'">'+escH(p.nome)+'</button>'
      +'<p class="hj-meta">'+escH(p.tipo==='Casal'?'Casal':'Individual')+(p.mod?', '+escH(String(p.mod).toLowerCase()):'')+rastroH(s)+'<span>'+escH(fi.t)+'</span></p>'
      +(site?noSite:'<div class="hj-acts">'+pri+pront+'</div>')+'</div></section>';
  }
  function semana3(){ var seg=addDays(NOW,-((NOW.getDay()+6)%7)), h='';
    for(var i=0;i<7;i++){ var dt=addDays(seg,i), d=iso(dt), l=sessOn(d).filter(viva).sort(asc);
      if(i>4&&!l.length)continue;
      h+='<button class="hj-wd'+(d===TODAY?' hoje':'')+'" data-act="hj-amanha" data-d="'+d+'" aria-label="'+cap(longDate(d))+', '+plural(l.length,'sessão','sessões')+'"><span class="hj-wp">'
        +l.map(function(s){var c=s.status==='realizada'?'d':s.status==='falta'?'x':estado(s)==='aconf'?'r':'';return '<i class="'+c+'"></i>'}).join('')+'</span><b>'+DOWC[dt.getDay()]+'</b><span>'+dt.getDate()+'</span></button>' }
    return h }
  function v3(){
    var it=itens3(), ss=it.filter(function(x){return x.k==='s'}), g=pend(), sel=null, outro=false, anim=!document.querySelector('.hj3');
    DIA=TODAY;
    var feitas=ss.filter(function(x){return x.s.status==='realizada'||x.s.status==='falta'}).length;
    if(UI.hjSel)sel=it.filter(function(x){return x.id===UI.hjSel})[0]||null;
    if(!sel){ var nx=seguinte(ss.map(function(x){return x.s})); if(nx)sel=ss.filter(function(x){return x.s===nx})[0];
      else { for(var i=1;i<15&&!sel;i++){var l=sessOn(iso(addDays(NOW,i))).filter(viva).sort(asc); if(l.length){sel={k:'s',id:String(l[0].id),s:l[0]};outro=true}} } }
    var sub=!ss.length?'':feitas===ss.length?'Todas atendidas.':feitas?feitas+' já '+(feitas>1?'atendidas':'atendida')+', '+(ss.length-feitas)+' por vir.':'Nenhuma atendida ainda.';
    var h='<div class="hj hj3'+(anim?' hj-entra':'')+'"><header><p class="hj-data">'+cap(longDate(TODAY))+'</p><h1>'+(ss.length?plural(ss.length,'sessão','sessões')+' hoje':'Nenhuma sessão hoje')+'</h1>'+(sub?'<p class="hj-sub">'+sub+'</p>':'')+'</header>';
    if(it.length)h+=linha3(it,sel&&!outro?sel.id:null);
    h+='<div id="hj-card">'+card3(sel,outro)+'</div>';
    h+='<div class="hj-baixo"><section class="hj-pz"><h2>Ficou para trás</h2>';
    if(g.length)h+=g.map(function(x){return '<details class="hj-f k-'+x.k+'"><summary><b>'+x.l.length+'</b><span>'+x.t+'</span><i>›</i></summary><div class="hj-cl">'+x.l.slice(0,6).map(x.row).join('')+(x.l.length>6?'<p class="hj-mais">e mais '+(x.l.length-6)+'</p>':'')+'</div></details>'}).join('');
    else h+='<p class="hj-ok">Nada ficou para trás.</p>';
    var am=iso(addDays(NOW,1)), sa=sessOn(am).filter(viva), sc=sa.filter(function(s){return s.status==='agendada'}).length;
    h+='</section><section class="hj-pz"><h2>A semana</h2><div class="hj-sem">'+semana3()+'</div><p class="hj-amt">Amanhã, '+(sa.length?plural(sa.length,'sessão','sessões')+(sc?', '+sc+' sem confirmar.':', todas confirmadas.'):'nenhuma sessão.')+'</p></section></div>';
    return h+'</div>';
  }
  ACT['hj-sel']=function(b){ var dia=b.closest('.hj-dia'), site=dia&&dia.dataset.site, c=document.getElementById(site?'wk-body':'hj-card'); if(!c)return;
    if(site)UI.hjSiteSel=b.dataset.id; else UI.hjSel=b.dataset.id;
    var h=noDia(site||TODAY,function(){var x=itens3().filter(function(y){return y.id===b.dataset.id})[0];return x?card3(x,false,!!site):null}); if(h==null)return;
    Array.prototype.forEach.call(dia.querySelectorAll('.hj-pt'),function(p){p.setAttribute('aria-pressed',String(p===b))});
    c.innerHTML=h; c.classList.remove('troca'); void c.offsetWidth; c.classList.add('troca') };
  /* a linha do dia na abertura do site (o renderWk do app.js chama): o dia de hoje do consultório de exemplo ou,
     sem sessão hoje, o próximo dia com sessão. O cartão não tem os botões do app, só a entrada na demonstração. */
  function siteDia(){ var d=diaAlvo(); if(!d)return null;
    return noDia(d,function(){ var it=itens3(), ss=it.filter(function(x){return x.k==='s'}), sel=null; if(!it.length)return null;
      if(UI.hjSiteSel)sel=it.filter(function(x){return x.id===UI.hjSiteSel})[0]||null;
      if(!sel&&d===TODAY){var nx=seguinte(ss.map(function(x){return x.s})); if(nx)sel=ss.filter(function(x){return x.s===nx})[0]}
      if(!sel)sel=ss[ss.length-1]||it[0];
      return {linha:'<p class="hj-site-cap">'+(d===TODAY?'Hoje':cap(quando(d)))+' no consultório de exemplo. Toque num ponto.</p>'+linha3(it,sel.id,true),card:card3(sel,false,true)} }) }
  /* a hora anda sozinha: a cada 20 s o marcador, a barra da sessão e os textos se atualizam; quando um ponto muda de estado, a tela se refaz */
  var sig3='';
  function tick3(){
    var sd=document.querySelector('#site:not([hidden]) .hj-dia[data-site]');
    if(sd&&sd.dataset.site===TODAY){ sd.style.setProperty('--p',(posAgora(itens3())*100).toFixed(2)+'%'); sd.querySelector('.hj-ag b').textContent=hm(nowMin()) }
    var el=document.querySelector('.hj3 .hj-dia'); if(!el||UI.route!=='app-hoje')return;
    var it=itens3(), sg=it.map(ptCls).join('|'); if(sig3&&sg!==sig3){sig3=sg;render();return} sig3=sg;
    el.style.setProperty('--p',(posAgora(it)*100).toFixed(2)+'%'); el.querySelector('.hj-ag b').textContent=hm(nowMin());
    var c=document.getElementById('hj-card'), pr=el.querySelector('.hj-pt[aria-pressed="true"]');
    if(c&&pr&&!c.querySelector(':focus')){var x=it.filter(function(y){return y.id===pr.dataset.id})[0]; if(x)c.innerHTML=card3(x,false)} }
  setInterval(tick3,20000);
  /* Hoje, versão 4 (18/11/2026): "painel de pontos". Matheus achou a versão 3 com cara de IA (cartão roxo, linha
     do tempo, rostinho) e pediu algo moderno e original. Referências vistas no Chrome: as que têm visual próprio
     (Nothing, Teenage Engineering, PostHog) partem de um objeto só delas. O objeto do Rastro são os pontos. Daí:
     1. um mostrador com o número grande (era desenhado em pontos até 19/11/2026; quanto falta para a próxima sessão, ou quanto resta da atual),
        que muda sozinho com a hora;
     2. o dia como um quadro: uma linha por sessão e, em colunas, os cinco pontos dela (marcada, confirmada,
        realizada, registrada, paga). Tocar na linha abre o que falta e os botões. Sem cartão, sem rosto.
     As versões 3, 2 e 1 abrem com ?hoje=3, 2 ou 1. */
  /* número do mostrador: letra de verdade (19/11/2026). Os números desenhados em pontos saíram: Matheus achou
     que pareciam pixelados. O desenho antigo está em "Backup antes do modo sessao 19-11". */
  function pmH(t,cls,rot){ return '<span class="pm '+(cls||'')+'" role="img" aria-label="'+escH(rot||t)+'">'+escH(t)+'</span>' }
  function pmPoe(el,t,rot){ if(!el)return; if(el.textContent!==String(t))el.textContent=t; el.setAttribute('aria-label',rot||t) }
  /* o mostrador fala sempre em horas e minutos, como um cronômetro: 0:53, 1:07 */
  function durT(m){ var h=Math.floor(m/60),r=m%60; return h+':'+(r<10?'0':'')+r }
  function durFala(m){ if(m<60)return m+' minutos'; var h=Math.floor(m/60),r=m%60; return h+' h'+(r?' e '+r+' min':'') }
  /* o que o mostrador diz: resta da sessão de agora, falta para a próxima, ou a hora da primeira de outro dia */
  function mostra(it){ var ss=it.filter(function(x){return x.k==='s'}).map(function(x){return x.s}), nm=agoraM();
    if(DIA===TODAY){ var nx=seguinte(ss);
      if(nx){ var ini=minOf(nx.hora);
        if(nm>=ini)return {t:durT(ini+DUR-nm),rot:'Restam '+durFala(ini+DUR-nm),a:'restam da sessão das '+nx.hora,s:nx};
        return {t:durT(ini-nm),rot:'Faltam '+durFala(ini-nm),a:'até a sessão das '+nx.hora,s:nx} }
      for(var i=1;i<15;i++){ var d=iso(addDays(NOW,i)), l=sessOn(d).filter(viva).sort(asc); if(l.length)return {t:l[0].hora,rot:l[0].hora,a:'próxima sessão, '+quando(d),s:l[0],outro:true} }
      return {t:'0',rot:'Nenhuma sessão marcada',a:'nenhuma sessão marcada',s:null} }
    return {t:ss.length?ss[0].hora:'0',rot:ss.length?ss[0].hora:'',a:'primeira sessão, '+quando(DIA),s:ss[0]||null,outro:true} }
  function topo4(it,site){ var M=mostra(it), ss=it.filter(function(x){return x.k==='s'}), fe=ss.filter(function(x){return x.s.status==='realizada'||x.s.status==='falta'}).length, p=M.s?pac(M.s.pid):null;
    var sub=DIA!==TODAY?plural(ss.length,'sessão','sessões')+' no dia.':!ss.length?'Nenhuma sessão hoje.':plural(ss.length,'sessão','sessões')+' hoje, '+(fe===ss.length?'todas atendidas.':fe?fe+(fe>1?' atendidas.':' atendida.'):'nenhuma atendida ainda.');
    return '<div class="pn-topo">'+pmH(M.t,'pm-g',M.rot)+'<div class="pn-cap"><p class="pn-c1">'+M.a+'</p>'
      +(p?(site?'<p class="pn-c2">'+escH(p.nome)+'</p>':'<button class="pn-c2" data-act="pac" data-id="'+p.id+'">'+escH(p.nome)+'</button>'):'')
      +'<p class="pn-c3">'+sub+'</p></div></div>' }
  /* aniversários: avisa a partir de 7 dias antes; a lista do mês abre ao tocar */
  function niverH(){ var l=R.niverProx(7), ym=TODAY.slice(0,7), mes=R.niverMes(ym); if(!l.length&&!mes.length)return '';
    var h='<div class="nv-faixa">'+l.map(function(x){ var q=x.em===0?'hoje':x.em===1?'amanhã':'em '+x.em+' dias, '+R.DOWL[R.parse(x.dia).getDay()]+', '+dm(x.dia);
      return '<p class="nv-l">'+R.CHAPEU+'<span><button class="nv-q" data-act="pac" data-id="'+x.p.id+'">'+escH(x.q)+'</button> faz '+x.idade+' anos '+q+'.</span><button class="link" data-act="nv-msg" data-q="'+escH(x.q)+'">Copiar mensagem de parabéns</button></p>' }).join('');
    return h+'<details class="nv-mes"><summary>Aniversariantes de '+R.MES[Number(ym.slice(5))-1]+'<b>'+mes.length+'</b><i>›</i></summary>'+R.niverMesH(ym)+'</details></div>' }
  var COLS=['marcada','confirmada','realizada','registrada','paga'];
  function pts4(s){ var c=R.rastroC?R.rastroC(s):[]; return '<span class="pn-pts" role="img" aria-label="'+escH(faltaInfo(s).t)+'">'+c.map(function(x){return '<b class="'+x+'"></b>'}).join('')+'</span>' }
  function linha4(x,sel,site){ var ab=x.id===sel;
    if(x.k==='c'){ var o=x.o; return '<'+(site?'div':'button')+' class="pn-r comp'+(minOf(x.t)+DUR<=agoraM()?' feita':'')+'"'+(site?'':' data-act="cp" data-id="'+o.c.id+'" data-orig="'+o.orig+'"')+'><span class="h">'+x.t+'</span><span class="n">'+escH(o.c.tit)+'</span><span class="pn-pts vazio"></span><span class="pn-a"></span></'+(site?'div':'button')+'>' }
    var s=x.s, p=pac(s.pid), fi=faltaInfo(s), cl=ptCls(x), ini=minOf(s.hora), ag=cl==='a';
    var h='<button class="pn-r'+(cl==='d'||cl==='x'?' feita':'')+(ag?' agora':'')+'" data-act="pn-abre" data-id="'+x.id+'"'+(site?' data-site="1"':'')+' aria-expanded="'+ab+'"'+(ag?' style="--pg:'+Math.round((agoraM()-ini)/DUR*100)+'%"':'')+'><span class="h">'+s.hora+'</span><span class="n">'+escH(p.nome)+'</span>'+pts4(s)+'<span class="pn-a'+(fi.k==='w'?' w':'')+'">'+(ag?'agora':fi.a||'')+'</span></button>';
    if(ab){ var bt=site?'<button class="btn pri sm" data-act="nav" data-to="app-hoje">Abrir no consultório de exemplo</button>'
        :(fi.a?'<button class="btn pri sm" data-act="'+fi.act+'" data-id="'+(fi.act==='pr-open'?p.id+'" data-sid="'+s.id:s.id)+'">'+fi.a+'</button>':'')
         +(fi.act==='pr-open'?'':'<button class="btn sm'+(fi.a?'':' pri')+'" data-act="pr-open" data-id="'+p.id+'" data-sid="'+s.id+'">Abrir prontuário</button>')
         +'<button class="btn sm" data-act="ev" data-id="'+s.id+'">Sessão</button>';
      /* sessão de hoje que ainda não aconteceu: o botão principal passa a ser entrar no modo sessão (js/sessao.js) */
      if(!site&&DIA===TODAY&&(s.status==='agendada'||s.status==='confirmada'))bt='<button class="btn pri sm" data-act="ss-abre" data-id="'+s.id+'">Iniciar sessão</button>'+bt.replace(/btn pri sm/g,'btn sm').replace(/btn sm pri/g,'btn sm');
      h+='<div class="pn-x"><p>'+escH(p.tipo==='Casal'?'Casal':'Individual')+(p.mod?', '+escH(String(p.mod).toLowerCase()):'')+'. '+escH(fi.t)+'</p><div class="hj-acts">'+bt+'</div></div>' }
    return h }
  function quadro4(it,sel,site){
    return '<div class="pn-q"><div class="pn-qh" aria-hidden="true"><span></span><span></span><span class="pn-cols">'+COLS.map(function(c){return '<i>'+c+'</i>'}).join('')+'</span><span></span></div>'
      +it.map(function(x){return linha4(x,sel,site)}).join('')+'<p class="pn-leg">Os cinco pontos, da esquerda para a direita: '+COLS.slice(0,4).join(', ')+' e '+COLS[4]+'.</p></div>' }
  function selPadrao(it,guardado){ if(guardado==='nenhum')return null; if(guardado&&it.some(function(x){return x.id===guardado}))return guardado;
    var M=mostra(it); return M.s&&!M.outro?String(M.s.id):null }
  function v4(){ DIA=TODAY;
    var it=itens3(), g=pend(), anim=!document.querySelector('.pn');
    var h='<div class="hj pn'+(anim?' pn-liga':'')+'"><h1 class="pn-data">'+cap(longDate(TODAY))+'</h1>'+topo4(it,false);
    h+=it.length?quadro4(it,selPadrao(it,UI.pnSel),false):'';
    h+=niverH();
    h+='<div class="pn-baixo"><section><h2>Ficou para trás</h2>';
    if(g.length)h+=g.map(function(x){return '<details class="pn-f k-'+x.k+'"><summary><b class="pn-n">'+x.l.length+'</b><span>'+x.t+'</span><i>›</i></summary><div class="hj-cl">'+x.l.slice(0,6).map(x.row).join('')+(x.l.length>6?'<p class="hj-mais">e mais '+(x.l.length-6)+'</p>':'')+'</div></details>'}).join('');
    else h+='<p class="hj-ok">Nada ficou para trás.</p>';
    var am=iso(addDays(NOW,1)), sa=sessOn(am).filter(viva), sc=sa.filter(function(s){return s.status==='agendada'}).length;
    h+='</section><section><h2>A semana</h2><div class="hj-sem">'+semana3()+'</div><p class="hj-amt">Amanhã, '+(sa.length?plural(sa.length,'sessão','sessões')+(sc?', '+sc+' sem confirmar.':', todas confirmadas.'):'nenhuma sessão.')+'</p></section></div>';
    return h+'</div>' }
  function site4(){ var d=diaAlvo(); if(!d)return null;
    return noDia(d,function(){ var it=itens3(); if(!it.length)return null;
      return {linha:'<p class="hj-site-cap">'+(d===TODAY?'Hoje':cap(quando(d)))+' no consultório de exemplo. Toque numa sessão.</p>'+topo4(it,true),card:quadro4(it,selPadrao(it,UI.pnSiteSel),true),cls:'pn pn-site'} }) }
  /* ---- Hoje, versão 5 (19/11/2026, pedido de Matheus: "muitas informações, não está intuitivo de ler nem de mexer") ----
     Saem desta tela o mostrador grande (o relógio com "até a sessão das 18:00", o nome e a contagem), os cinco pontos
     com a legenda e a faixa da semana. Cada sessão vira uma linha que se lê como frase: hora, nome e o que falta,
     com um botão só, o da próxima ação. Tocar na linha abre o resto. Nada vem aberto. A versão 4 continua em ?hoje=4. */
  function linha5(x,sel,site,prox){ var ab=x.id===sel;
    if(x.k==='c'){ var o=x.o, pas=minOf(x.t)+DUR<=agoraM();
      return '<div class="h5-r comp'+(pas?' feita':'')+'">'+(site?'<div class="h5-m">':'<button class="h5-m" data-act="cp" data-id="'+o.c.id+'" data-orig="'+o.orig+'">')+'<span class="h">'+x.t+'</span><span class="n">'+escH(o.c.tit)+'</span><span class="st">Compromisso.</span>'+(site?'</div>':'</button>')+'</div>' }
    var s=x.s, p=pac(s.pid), fi=faltaInfo(s), ag=ptCls(x)==='a', fut=s.status==='agendada'||s.status==='confirmada', ini=!site&&DIA===TODAY&&fut&&(ag||prox===x.id), bt='';
    if(ini)bt='<button class="btn pri sm" data-act="ss-abre" data-id="'+s.id+'">Iniciar sessão</button>';
    /* 23/11/2026: sessão de hoje já confirmada não tem outra coisa a fazer, então o botão dela é entrar no modo sessão */
    else if(!site&&DIA===TODAY&&fut&&!fi.a)bt='<button class="btn sm" data-act="ss-abre" data-id="'+s.id+'">Iniciar sessão</button>';
    else if(!site&&fi.a)bt='<button class="btn sm" data-act="'+fi.act+'" data-id="'+(fi.act==='pr-open'?p.id+'" data-sid="'+s.id:s.id)+'">'+(fi.a==='Marcar'?'Responder':fi.a)+'</button>';
    var h='<div class="h5-r'+(fi.done?' feita':'')+(ag?' agora':'')+'" data-pid="'+p.id+'"><button class="h5-m" data-act="pn-abre" data-id="'+x.id+'"'+(site?' data-site="1"':'')+' aria-expanded="'+ab+'"><span class="h">'+s.hora+'</span><span class="n">'+(site||!window.RastroPersonagens?'':window.RastroPersonagens.mini(p))+escH(p.nome)+'</span><span class="st'+(fi.k==='w'?' w':'')+'">'+escH(ag?'Em sessão agora.':fi.t)+'</span></button>'+bt+'</div>';
    if(ab){ var mais=site?'<button class="btn pri sm" data-act="nav" data-to="app-hoje">Abrir no consultório de exemplo</button>'
        :(ini&&fi.a?'<button class="btn sm" data-act="'+fi.act+'" data-id="'+s.id+'">'+fi.a+'</button>':'')
         +(!ini&&DIA===TODAY&&fut&&fi.a?'<button class="btn sm" data-act="ss-abre" data-id="'+s.id+'">Iniciar sessão</button>':'')
         +(fi.act==='pr-open'?'':'<button class="btn sm" data-act="pr-open" data-id="'+p.id+'" data-sid="'+s.id+'">Abrir prontuário</button>')
         +'<button class="btn sm" data-act="ev" data-id="'+s.id+'">Detalhes da sessão</button>';
      h+='<div class="pn-x"><p>'+escH(p.tipo==='Casal'?'Casal':'Individual')+(p.mod?', '+escH(String(p.mod).toLowerCase()):'')+'.</p><div class="hj-acts">'+mais+'</div></div>' }
    return h }
  function lista5(it,sel,site){ var M=mostra(it), prox=M.s&&!M.outro?String(M.s.id):null;
    return '<div class="h5-l">'+it.map(function(x){return linha5(x,sel,site,prox)}).join('')+'</div>' }
  function sel5(it,g){ return g&&g!=='nenhum'&&it.some(function(x){return x.id===g})?g:null }
  /* Início (23/11/2026, pedido de Matheus): a tela Hoje virou Início. A visão geral dos pacientes (o mapa, js/mapa.js)
     saiu de Pacientes e veio para cá; as sessões do dia ficam ao lado do mapa, e passar o mouse numa sessão acende
     o paciente no mapa. Sem o mapa carregado, cai na versão 5 de sempre. */
  function ini5(){ var it=itens3(), g=pend();
    var h='<h2 class="ini-h">Hoje</h2>'+(it.length?lista5(it,sel5(it,UI.pnSel),false):'<p class="hj-ok">Nenhuma sessão hoje.</p>');
    if(g.length)h+='<h3 class="ini-h3">Para resolver de outros dias</h3>'+g.map(function(x){return '<details class="pn-f k-'+x.k+'"><summary><b class="pn-n">'+x.l.length+'</b><span>'+x.t+'</span><i>›</i></summary><div class="hj-cl">'+x.l.slice(0,6).map(x.row).join('')+(x.l.length>6?'<p class="hj-mais">e mais '+(x.l.length-6)+'</p>':'')+'</div></details>'}).join('');
    var nv=niverH(); if(nv)h+='<h3 class="ini-h3">Aniversários</h3>'+nv;
    var am=iso(addDays(NOW,1)), sa=sessOn(am).filter(viva), sc=sa.filter(function(s){return s.status==='agendada'}).length;
    return h+'<p class="hj-amt">Amanhã, '+(sa.length?plural(sa.length,'sessão','sessões')+(sc?', '+sc+' sem confirmar.':', todas confirmadas.'):'nenhuma sessão.')+'</p>' }
  /* Próxima sessão (23/11/2026, pedido de Matheus: "precisa ter no início uma opção de iniciar sessão de forma fácil"):
     faixa no alto do Início com a sessão de agora ou a próxima de hoje e um botão só, que abre o modo sessão (js/sessao.js).
     Some quando não há mais sessão hoje. O "daqui a" se atualiza sozinho pelo tick4. */
  function proxS(){ var nm=nowMin(); return sessOn(TODAY).filter(viva).sort(asc).filter(function(s){return (s.status==='agendada'||s.status==='confirmada')&&minOf(s.hora)+DUR>nm})[0]||null }
  function proxQ(s){ var f=minOf(s.hora)-nowMin(); return f<=0?'em sessão agora, desde as '+s.hora:'às '+s.hora+', '+(f<1?'agora':'daqui a '+durFala(f)) }
  function proxH(){ var s=proxS(); if(!s)return ''; var p=pac(s.pid), ag=minOf(s.hora)<=nowMin();
    return '<div class="ini-px'+(ag?' agora':'')+'" data-sid="'+s.id+'">'+(window.RastroPersonagens?window.RastroPersonagens.mini(p,'m'):'')
      +'<p><span class="ini-px-r">'+(ag?'Agora':'Próxima sessão')+'</span><b>'+escH(p.nome)+'</b>, <span class="ini-px-q">'+escH(proxQ(s))+'</span></p>'
      +'<button class="btn pri" data-act="ss-abre" data-id="'+s.id+'">Iniciar sessão</button></div>' }
  function v5(){ DIA=TODAY;
    if(window.RastroMapa)return '<div class="hj pn h5 ini"><h1 class="h5-t">Início</h1><p class="h5-d">'+cap(longDate(TODAY))+'</p>'+proxH()+window.RastroMapa.vista({hoje:ini5()})+'</div>';
    var it=itens3(), g=pend();
    var h='<div class="hj pn h5"><h1 class="h5-t">Hoje</h1><p class="h5-d">'+cap(longDate(TODAY))+'</p>'+proxH();
    h+='<section class="h5-s"><h2>Sessões de hoje</h2>'+(it.length?lista5(it,sel5(it,UI.pnSel),false):'<p class="hj-ok">Nenhuma sessão hoje.</p>')+'</section>';
    h+='<section class="h5-s"><h2>Para resolver de outros dias</h2>';
    if(g.length)h+=g.map(function(x){return '<details class="pn-f k-'+x.k+'"><summary><b class="pn-n">'+x.l.length+'</b><span>'+x.t+'</span><i>›</i></summary><div class="hj-cl">'+x.l.slice(0,6).map(x.row).join('')+(x.l.length>6?'<p class="hj-mais">e mais '+(x.l.length-6)+'</p>':'')+'</div></details>'}).join('');
    else h+='<p class="hj-ok">Nada ficou para trás.</p>';
    h+='</section>';
    var nv=niverH(); if(nv)h+='<section class="h5-s"><h2>Aniversários</h2>'+nv+'</section>';
    var am=iso(addDays(NOW,1)), sa=sessOn(am).filter(viva), sc=sa.filter(function(s){return s.status==='agendada'}).length;
    h+='<p class="hj-amt">Amanhã, '+(sa.length?plural(sa.length,'sessão','sessões')+(sc?', '+sc+' sem confirmar.':', todas confirmadas.'):'nenhuma sessão.')+'</p>';
    return h+'</div>' }
  function site5(){ var d=diaAlvo(); if(!d)return null;
    return noDia(d,function(){ var it=itens3(); if(!it.length)return null;
      return {linha:'<p class="hj-site-cap">'+(d===TODAY?'Hoje':cap(quando(d)))+' no consultório de exemplo. Toque numa sessão.</p>',card:lista5(it,sel5(it,UI.pnSiteSel),true),cls:'pn pn-site h5'} }) }
  ACT['pn-abre']=function(b){ var k=b.dataset.site?'pnSiteSel':'pnSel'; UI[k]=b.getAttribute('aria-expanded')==='true'?'nenhum':b.dataset.id; render() };
  var sig4='';
  function tick4(){ var px=document.querySelector('#app:not([hidden]) .ini-px');
    if(px){ var ps=proxS(); if(!ps||String(ps.id)!==px.dataset.sid){render();return} var q=px.querySelector('.ini-px-q'); if(q)q.textContent=proxQ(ps) }
    var raiz=document.querySelector('#app:not([hidden]) .hj.pn, #site:not([hidden]) .pn-site'); if(!raiz)return;
    var site=raiz.classList.contains('pn-site'), d=site?(diaAlvo()||TODAY):TODAY;
    noDia(d,function(){ var it=itens3(), M=mostra(it), sg=it.map(ptCls).join('|')+'/'+(M.s?M.s.id:'');
      if(sig4&&sg!==sig4){sig4=sg;render();return} sig4=sg;
      pmPoe(document.querySelector((site?'#site':'#app')+' .pm-g'),M.t,M.rot);
      var ag=document.querySelector((site?'#site':'#app')+' .pn-r.agora'); if(ag){var id=ag.dataset.id, x=it.filter(function(y){return y.id===id})[0]; if(x)ag.style.setProperty('--pg',Math.round((agoraM()-minOf(x.s.hora))/DUR*100)+'%')} }) }
  setInterval(tick4,20000);
  var modo=(location.search.match(/[?&]hoje=(\d)/)||[])[1];
  window.RastroHoje={vista:function(){S=R.dados();return modo==='1'?v1():modo==='2'?v2():modo==='3'?v3():modo==='4'?v4():v5()},site:function(){S=R.dados();return modo==='3'?siteDia():modo==='4'?site4():site5()},
    /* pecas do painel de pontos para as outras telas (Prontuario e Financeiro, no app.js) */
    pm:pmH,pts:pts4,cab:function(){return '<div class="pn-qh" aria-hidden="true"><span></span><span></span><span class="pn-cols">'+COLS.map(function(c){return '<i>'+c+'</i>'}).join('')+'</span><span></span></div>'},
    leg:function(){return '<p class="pn-leg">Os cinco pontos, da esquerda para a direita: '+COLS.slice(0,4).join(', ')+' e '+COLS[4]+'.</p>'}};
  render();
})();

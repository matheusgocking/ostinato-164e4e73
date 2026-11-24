/* Visão geral dos pacientes (ideia de Matheus, 19/11/2026): a rede do Obsidian, com o psicólogo no centro e os
   pacientes em volta, mas em que cada coisa do desenho quer dizer algo:
   - distância do centro = quanto o paciente está perto do atendimento. Três faixas: "em dia" (veio e tem a próxima
     marcada, ou é novo), "uma sessão sem vir" (a última sessão está mais longe que o ritmo combinado) e "se afastando"
     (nada marcado daqui para a frente, ou faltou às duas últimas). Quem começa a sumir vai para a borda.
   - fatia = dia da semana do horário fixo (segunda no alto, em sentido horário), então o mapa também mostra a semana.
   - tamanho do círculo = quantas sessões já fez; fio tracejado = quinzenal; dois círculos = casal;
     círculo com um pequeno ao lado = criança ou adolescente (o responsável).
   - marcas no círculo: ponto roxo = sessão por registrar; ponto amarelo = valor em aberto; chapeuzinho = aniversário
     nos próximos 7 dias.
   Tocar num paciente abre o resumo dele ao lado, com os atalhos. Tocar num número do resumo destaca aquele grupo.
   Dia com mais de quatro pacientes: os nomes somem e aparecem ao passar o mouse, focar ou tocar (as iniciais ficam).
   A lista de sempre continua a um toque (botão Lista). Só entram pacientes em atendimento.
   Em 14/11/2026 ele tinha recusado "fio ligando pacientes" na lista; aqui o fio liga o psicólogo ao paciente, a pedido dele. */
(function(){
  var R=window.Rastro, P=function(){return window.RastroPacientes}, escH=R.escH;
  var SEL=null, FOCO='', HJ={}, HL=null;
  /* quem tem sessão hoje (anel no mapa) e quem está em sessão agora (anel que pulsa) */
  function hojeMapa(){ var o={}, nm=R.nowMin(); R.sessOn(R.TODAY).filter(R.viva).forEach(function(s){ if(s.status==='realizada'||s.status==='falta')return; var i=R.minOf(s.hora); o[s.pid]=(nm>=i&&nm<i+R.DUR)?'agora':(o[s.pid]||'hj') }); return o }
  /* a fatia do dia de hoje, um pouco mais clara */
  function setor(si){ var r1=440,r0=72,a0=(-90+si*60)*Math.PI/180,a1=(-30+si*60)*Math.PI/180,P=function(r,a){return (500+Math.cos(a)*r).toFixed(1)+' '+(500+Math.sin(a)*r).toFixed(1)};
    return '<path class="mp-hoje" d="M'+P(r0,a0)+' L'+P(r1,a0)+' A'+r1+' '+r1+' 0 0 1 '+P(r1,a1)+' L'+P(r0,a1)+' A'+r0+' '+r0+' 0 0 0 '+P(r0,a0)+'Z"/>' }
  var DN=['Seg','Ter','Qua','Qui','Sex','Sáb'], RAIO={1:[.38,.59],2:[.77],3:[.93]}, CHEIO=[.34,.63,.49], GUIA=[.67,.86,1], ESC=44;
  var ANEL={1:'Em dia',2:'Uma sessão sem vir',3:'Se afastando'};
  function dif(a,b){return Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5)}
  function infos(){ var S=R.dados(), nv=R.niverProx(7);
    return S.pac.filter(function(p){return p.ativo}).map(function(p){
      var st=P().status(p), fe=S.sess.filter(function(s){return s.pid===p.id&&s.status==='realizada'}).sort(function(a,b){return a.date<b.date?1:-1});
      var d=fe.length?dif(fe[0].date,R.TODAY):null, anel=(st==='semsess'||st==='faltando')?3:st==='novo'?1:(d!==null&&d/p.freq>1.6?2:1);
      return {p:p,st:st,anel:anel,d:d,ult:fe[0]||null,n:fe.length,sd:R.saldo(p.id),reg:R.porRegistrar(p.id).length,nx:R.proxima(p.id),nv:nv.filter(function(x){return x.p.id===p.id})[0]||null} }) }
  function poe(l){ [1,2,3,4,5,6].forEach(function(dw,si){ var g=l.filter(function(x){return (x.p.dow%7||7)===dw}).sort(function(a,b){return a.p.hora<b.p.hora?-1:1});
      g.forEach(function(x,i){ var rr=x.anel===1&&g.length>4?CHEIO:RAIO[x.anel]; x.cheio=g.length>4; var a=(-90+si*60+7+(i+.5)/g.length*46)*Math.PI/180, r=rr[i%rr.length]*ESC; x.x=50+Math.cos(a)*r; x.y=50+Math.sin(a)*r }) }); return l }
  function ini(p){ var a=p.nome.split(' e '); if(p.tipo==='Casal'&&a.length>1)return a[0].trim()[0]+a[1].trim()[0]; var w=p.nome.trim().split(/\s+/); return (w[0][0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase() }
  function curto(p){ if(p.tipo==='Casal'){var a=p.nome.split(' e ');return a[0].split(' ')[0]+' e '+(a[1]||'').split(' ')[0]} return p.nome.split(' ')[0] }
  function menor(p){return p.tipo==='Criança'||p.tipo==='Adolescente'}
  function emFoco(x){return !FOCO||(FOCO==='din'?x.sd>0:FOCO==='reg'?x.reg>0:FOCO==='nv'?!!x.nv:('a'+x.anel)===FOCO)}
  function porque(x){
    if(x.st==='novo')return 'Novo: ainda não teve a primeira sessão.';
    if(x.st==='semsess')return 'Se afastando: não tem nada marcado daqui para a frente.';
    if(x.st==='faltando')return 'Se afastando: faltou às duas últimas sessões.';
    if(x.anel===2)return 'Uma sessão sem vir: a última foi há '+x.d+' dias, mais que o ritmo combinado.';
    return 'Em dia: veio na última sessão e tem a próxima marcada.' }
  function fala(x){return x.p.nome+'. '+porque(x)+(x.reg?' '+R.plural(x.reg,'sessão por registrar','sessões por registrar')+'.':'')+(x.sd?' '+R.brl(x.sd)+' em aberto.':'')+(x.nv?' Aniversário em '+x.nv.em+' dias.':'')}

  function mapaH(l){
    var s='<svg viewBox="0 0 1000 1000" aria-hidden="true">', dh=R.parse(R.TODAY).getDay();
    if(dh>0)s+=setor(dh-1);
    GUIA.forEach(function(g,i){s+='<circle class="mp-g g'+(i+1)+'" cx="500" cy="500" r="'+(g*ESC*10).toFixed(0)+'"/><text class="mp-gt" x="492" y="'+(500-g*ESC*10+24).toFixed(0)+'">'+ANEL[i+1].toLowerCase()+'</text>'});
    for(var k=0;k<6;k++){var a=(-90+k*60)*Math.PI/180;s+='<line class="mp-div" x1="'+(500+Math.cos(a)*90).toFixed(0)+'" y1="'+(500+Math.sin(a)*90).toFixed(0)+'" x2="'+(500+Math.cos(a)*ESC*10).toFixed(0)+'" y2="'+(500+Math.sin(a)*ESC*10).toFixed(0)+'"/>'}
    l.forEach(function(x){s+='<line data-id="'+x.p.id+'" class="mp-fio a'+x.anel+(x.p.freq===14?' q':'')+(emFoco(x)?'':' off')+(SEL===x.p.id?' sel':'')+'" x1="500" y1="500" x2="'+(x.x*10).toFixed(1)+'" y2="'+(x.y*10).toFixed(1)+'"/>'});
    s+='</svg>';
    DN.forEach(function(d,i){var a=(-60+i*60)*Math.PI/180;s+='<span class="mp-dia'+(i===dh-1?' hoje':'')+'" style="left:'+(50+Math.cos(a)*47.5).toFixed(2)+'%;top:'+(50+Math.sin(a)*47.5).toFixed(2)+'%">'+d+'</span>'});
    s+='<span class="mp-eu">Você</span>';
    l.forEach(function(x,k){var p=x.p, d=(3.6+Math.min(2.4,Math.sqrt(x.n)*.5)).toFixed(2);
      s+='<button class="mp-n a'+x.anel+(HJ[p.id]?' '+HJ[p.id]:'')+(x.st==='novo'?' novo':'')+(p.tipo==='Casal'?' casal':menor(p)?' menor':'')+(emFoco(x)?'':' off')+(x.cheio?' cheio':'')+'" style="left:'+x.x.toFixed(2)+'%;top:'+x.y.toFixed(2)+'%;--d:'+d+';--i:'+k+'" data-act="mp-sel" data-id="'+p.id+'" aria-pressed="'+(SEL===p.id)+'" aria-label="'+escH(fala(x)+(HJ[p.id]==='agora'?' Em sessão agora.':HJ[p.id]?' Tem sessão hoje.':''))+'">'
        +'<span class="mp-b"><i>'+escH(ini(p))+'</i>'+(x.reg?'<u class="reg"></u>':'')+(x.sd?'<u class="din"></u>':'')+(x.nv?R.CHAPEU:'')+'</span><span class="mp-nm">'+escH(curto(p))+'</span></button>'});
    return s }

  function ladoH(l,o){
    var x=SEL!=null?l.filter(function(y){return y.p.id===SEL})[0]:null;
    if(x){ var p=x.p, kv=function(a,b){return '<dt>'+a+'</dt><dd>'+b+'</dd>'};
      return '<button class="link" data-act="mp-sel" data-id="">Voltar à visão geral</button><h2 class="serif">'+(window.RastroPersonagens?window.RastroPersonagens.mini(p,'l'):'')+escH(p.nome)+'</h2>'
        +'<p class="mp-pq a'+x.anel+'">'+porque(x)+'</p><dl class="kv">'
        +kv('Próxima sessão',x.nx?R.cap(R.quando(x.nx.date))+', '+x.nx.hora:'<span class="c-bad">Nenhuma</span>')
        +kv('Última sessão',x.ult?R.dm(x.ult.date)+(x.d===0?', hoje':x.d===1?', ontem':', há '+x.d+' dias'):'Ainda não houve')
        +kv('Horário fixo',R.cap(R.DOWL[p.dow%7])+', '+p.hora+(p.freq===14?', a cada 15 dias':''))
        +kv('Sessões feitas',String(x.n))
        +(x.reg?kv('Por registrar','<span class="c-warn">'+R.plural(x.reg,'sessão','sessões')+'</span>'):'')
        +(x.sd?kv('Em aberto','<span class="c-warn">'+R.brl(x.sd)+'</span>'):'')
        +(x.nv?kv('Aniversário',x.nv.em===0?'Hoje':x.nv.em===1?'Amanhã':'Em '+x.nv.em+' dias'):'')+'</dl>'
        +'<div class="mp-bts"><button class="btn pri sm" data-act="pac" data-id="'+p.id+'">Abrir a ficha</button>'
        +(x.reg?'<button class="btn sm" data-act="pr-open" data-id="'+p.id+'">Registrar</button>':'<button class="btn sm" data-act="pr-open" data-id="'+p.id+'">Prontuário</button>')
        +(x.nx?'':'<button class="btn sm" data-act="sess-new" data-pid="'+p.id+'">Marcar sessão</button>')+'</div>' }
    var c=function(k,n,t,cls){return '<button class="mp-c '+(cls||'')+'" data-act="mp-foco" data-v="'+k+'" aria-pressed="'+(FOCO===k)+'"'+(n?'':' disabled')+'><b>'+n+'</b><span>'+t+'</span></button>'};
    var n=function(f){return l.filter(f).length};
    var h='<h2>'+R.plural(l.length,'paciente','pacientes')+' em atendimento</h2>'
      +'<div class="mp-cs">'+c('a1',n(function(x){return x.anel===1}),'em dia','a1')+c('a2',n(function(x){return x.anel===2}),'uma sessão sem vir','a2')+c('a3',n(function(x){return x.anel===3}),'se afastando','a3')+'</div>'
      +'<div class="mp-cs fino">'+c('reg',n(function(x){return x.reg>0}),'com sessão por registrar','reg')+c('din',n(function(x){return x.sd>0}),'com valor em aberto','din')+c('nv',n(function(x){return !!x.nv}),'de aniversário em 7 dias','nv')+'</div>';
    if(o&&o.hoje)h=h.replace(/^<h2>[^<]*<\/h2>/,'<h2>Destacar no mapa</h2>');
    if(FOCO){var g=l.filter(emFoco);h+='<div class="mp-quem">'+g.map(function(y){return '<button data-act="mp-sel" data-id="'+y.p.id+'">'+escH(y.p.nome)+'</button>'}).join('')+'</div>'
      +(FOCO==='reg'?'<button class="btn sm" data-act="nav" data-to="app-prontuario">Registrar no Prontuário</button>':FOCO==='din'?'<button class="btn sm" data-act="nav" data-to="app-financeiro">Ver no Financeiro</button>':'')}
    return (o&&o.hoje?'<section class="ini-hoje">'+o.hoje+'</section>':'')+'<section class="ini-vis">'+h+'</section>' }
  /* 23/11/2026, pedido de Matheus: a explicação do mapa fica num "i" no canto do mapa, aberta só quando ele quer */
  var INFO=false;
  function infoH(){
    return '<div class="mp-info"><button class="mp-i" data-act="mp-info" aria-expanded="'+INFO+'" aria-controls="mp-pop" aria-label="Como ler o mapa">i</button>'
      +(INFO?'<div class="mp-pop" id="mp-pop" role="dialog" aria-label="Como ler o mapa"><p class="mp-como">Você está no centro. Quem está perto está em dia; quem vai para a borda está ficando sem sessão. Cada fatia é um dia da semana, e a de hoje fica mais clara.</p><ul class="mp-leg"><li><i class="l-hj"></i>Anel: tem sessão hoje (pulsa durante a sessão)</li><li><i class="l-tam"></i>Círculo maior: mais sessões feitas</li><li><i class="l-q"></i>Fio tracejado: sessão a cada 15 dias</li><li><i class="l-casal"></i>Dois círculos: casal</li><li><i class="l-menor"></i>Círculo com um pequeno: criança ou adolescente</li><li><i class="l-reg"></i>Ponto roxo: sessão por registrar</li><li><i class="l-din"></i>Ponto amarelo: valor em aberto</li><li><i class="l-nv">'+R.CHAPEU+'</i>Chapéu: aniversário em até 7 dias</li></ul><p class="mp-dica">Toque num paciente para ver o resumo. Arraste para mexer; ao soltar, ele volta ao lugar.</p></div>':'')+'</div>' }

  /* Resumo do Início (23/11/2026, pedido de Matheus: "o início tem que ser um resumo de pacientes, agenda e financeiro").
     Três colunas que se leem como frase, cada uma leva à sua tela. Os pontos da agenda são as sessões da semana,
     uma bolinha por sessão (cheia = aconteceu, vazia = pela frente, âmbar = falta dizer se aconteceu). */
  function resumoH(l){
    var n=function(f){return l.filter(f).length}, a1=n(function(x){return x.anel===1}), a2=n(function(x){return x.anel===2}), a3=n(function(x){return x.anel===3});
    var seg=R.monday(R.NOW), nm=R.nowMin(), tot=0, fe=0, fr=0, sd=0, cols='', DL=['S','T','Q','Q','S','S'];
    for(var i=0;i<6;i++){ var d=R.iso(R.addDays(seg,i)), ss=R.sessOn(d).filter(R.viva).sort(function(a,b){return a.hora<b.hora?-1:1}), pts='';
      ss.forEach(function(s){ var k=(s.status==='realizada'||s.status==='falta')?'f':(d>R.TODAY||(d===R.TODAY&&R.minOf(s.hora)+R.DUR>nm))?'a':'w';
        tot++; if(k==='f')fe++; else if(k==='a')fr++; else sd++; pts+='<b class="'+k+'"></b>' });
      cols+='<span class="ir-dia'+(d===R.TODAY?' hoje':'')+'"><span class="ir-pts">'+pts+'</span><i>'+DL[i]+'</i></span>' }
    var ym=R.TODAY.slice(0,7), M=R.monthData(ym), mes=R.MES[Number(ym.slice(5))-1], ft=M.rec+M.arec+M.atr+M.prev;
    var seg2=function(v,c){return v>0?'<i class="'+c+'" style="flex-grow:'+v+'"></i>':''};
    var barP=l.length?'<span class="ir-bar" aria-hidden="true">'+seg2(a1,'b-ok')+seg2(a2,'b-w')+seg2(a3,'b-x')+'</span>':'';
    var barF=ft>0?'<span class="ir-bar" aria-hidden="true">'+seg2(M.rec,'b-rec')+seg2(M.arec,'b-ar')+seg2(M.atr,'b-x')+seg2(M.prev,'b-prev')+'</span>':'';
    var partes=[], e=function(a){return a.length>1?a.slice(0,-1).join(', ')+' e '+a[a.length-1]:a[0]||''};
    if(a1)partes.push(a1+' em dia'); if(a2)partes.push(a2+' com uma sessão sem vir'); if(a3)partes.push(a3+' se afastando');
    var ag=[]; if(fe)ag.push(R.plural(fe,'feita','feitas')); if(fr)ag.push(fr+' pela frente'); if(sd)ag.push(sd+' sem dizer se aconteceu');
    var nb=function(v){return '<span class="nw">'+R.brl(v)+'</span>'}, fi=[]; if(M.arec)fi.push(nb(M.arec)+' a receber'); if(M.atr)fi.push('<span class="c-bad">'+nb(M.atr)+' em atraso</span>');
    var col=function(to,t,num,cap,frase,vis){return '<button class="ir" data-act="nav" data-to="'+to+'"><span class="ir-t">'+t+'</span><span class="ir-n"><b>'+num+'</b> '+cap+'</span>'+vis+'<span class="ir-f">'+frase+'</span></button>'};
    return '<section class="ini-res" aria-label="Resumo">'
      +col('app-pacientes','Pacientes',l.length,l.length===1?'em atendimento':'em atendimento',(e(partes)||'Ninguém em atendimento')+'.',barP)
      +col('app-agenda','Agenda',tot,tot===1?'sessão nesta semana':'sessões nesta semana',(e(ag)||'Semana livre')+'.','<span class="ir-sem" aria-hidden="true">'+cols+'</span>')
      +col('app-financeiro','Financeiro',R.brl(M.rec),'recebidos em '+mes,(fi.length?e(fi)+'. ':'')+'Se tudo o que está marcado acontecer, '+nb(ft)+' no mês.',barF)
      +'</section>' }

  function vista(o){ o=o||{}; var l=poe(infos()), entra=!document.querySelector('#main .mp'); HJ=hojeMapa(); HL=null;
    if(SEL!=null&&!l.some(function(x){return x.p.id===SEL}))SEL=null;
    if(!l.length)return '<p class="empty">Nenhum paciente em atendimento. Use "Novo paciente" para começar.</p>';
    return '<div class="mp'+(o.hoje?' mp-ini':'')+(entra?' entra':'')+(FOCO?' foco':'')+(SEL!=null?' tem-sel':'')+'">'+(o.hoje?resumoH(l):'')+'<div class="mp-mapa" role="group" aria-label="Mapa dos pacientes em atendimento">'+mapaH(l)+infoH()+'</div><aside class="mp-lado" aria-live="polite">'+ladoH(l,o)+'</aside></div>' }

  /* Arrastar os pacientes, como no grafo do Obsidian (23/11/2026, pedido de Matheus): o paciente segue o dedo ou o
     mouse com o fio esticando, os vizinhos se afastam um pouco, e ao soltar todos voltam ao lugar com uma mola.
     O lugar de cada um continua sendo o que o desenho quer dizer (distância e dia), por isso nada fica onde foi solto.
     Mexer menos de 6 px conta como toque (abre o resumo, como antes). */
  var DR=null, SUPR=0, NOS=null, LOOP=0, QUIETO=matchMedia('(prefers-reduced-motion: reduce)');
  function prepara(m){ var W=m.clientWidth, H=m.clientHeight, k=1000/W;
    NOS=Array.prototype.map.call(m.querySelectorAll('.mp-n'),function(el){ var f=m.querySelector('.mp-fio[data-id="'+el.dataset.id+'"]');
      return {el:el,id:el.dataset.id,cx:parseFloat(el.style.left)/100*W,cy:parseFloat(el.style.top)/100*H,ox:0,oy:0,vx:0,vy:0,f:f,fx:f?Number(f.getAttribute('x2')):0,fy:f?Number(f.getAttribute('y2')):0,k:k} }) }
  function poeNo(n){ n.el.style.translate=(Math.abs(n.ox)<.05&&Math.abs(n.oy)<.05)?'':n.ox.toFixed(1)+'px '+n.oy.toFixed(1)+'px';
    if(n.f){n.f.setAttribute('x2',(n.fx+n.ox*n.k).toFixed(1));n.f.setAttribute('y2',(n.fy+n.oy*n.k).toFixed(1))} }
  function passo(){ LOOP=0; if(!NOS||!NOS[0]||!NOS[0].el.isConnected){NOS=null;return}
    var a=DR&&DR.on?NOS.filter(function(n){return n.id===DR.id})[0]:null, ax=a?a.cx+DR.dx:0, ay=a?a.cy+DR.dy:0, mexe=false;
    NOS.forEach(function(n){ var tx=0, ty=0;
      if(n===a){ n.ox=DR.dx; n.oy=DR.dy; n.vx=n.vy=0; poeNo(n); mexe=true; return }
      if(a&&!QUIETO.matches){ var dx=n.cx-ax, dy=n.cy-ay, d=Math.sqrt(dx*dx+dy*dy)||1, R0=120; if(d<R0){ var f=(R0-d)/R0*30; tx=dx/d*f; ty=dy/d*f } }
      if(QUIETO.matches&&!a){ n.ox=n.oy=n.vx=n.vy=0; poeNo(n); return }
      n.vx=(n.vx+(tx-n.ox)*.09)*.8; n.vy=(n.vy+(ty-n.oy)*.09)*.8; n.ox+=n.vx; n.oy+=n.vy;
      if(Math.abs(n.vx)+Math.abs(n.vy)+Math.abs(n.ox-tx)+Math.abs(n.oy-ty)>.25)mexe=true; else{ n.ox=tx; n.oy=ty; n.vx=n.vy=0 }
      poeNo(n) });
    if(mexe||a)LOOP=requestAnimationFrame(passo); else NOS=null }
  function anda(){ if(!LOOP)LOOP=requestAnimationFrame(passo) }
  document.addEventListener('pointerdown',function(e){ var b=e.target.closest&&e.target.closest('#main .mp-n'); if(!b||e.button>0)return;
    DR={b:b,m:b.closest('.mp-mapa'),id:b.dataset.id,x0:e.clientX,y0:e.clientY,dx:0,dy:0,on:false,pid:e.pointerId} });
  document.addEventListener('pointermove',function(e){ if(!DR||e.pointerId!==DR.pid)return; var dx=e.clientX-DR.x0, dy=e.clientY-DR.y0;
    if(!DR.on){ if(dx*dx+dy*dy<36)return; DR.on=true; if(!NOS||!NOS[0].el.isConnected)prepara(DR.m);
      /* começa de onde a mola estava, se ele pegar de novo antes de voltar */
      var a=NOS.filter(function(n){return n.id===DR.id})[0]; if(a){DR.x0-=a.ox;DR.y0-=a.oy;dx+=a.ox;dy+=a.oy}
      try{DR.b.setPointerCapture(e.pointerId)}catch(_){} DR.b.classList.add('arrasta'); DR.m.classList.add('arrastando') }
    DR.dx=dx; DR.dy=dy; e.preventDefault(); anda() });
  function solta(e){ if(!DR||e.pointerId!==DR.pid)return; if(DR.on){ SUPR=Date.now(); DR.b.classList.remove('arrasta'); DR.m.classList.remove('arrastando') } DR=null; anda() }
  document.addEventListener('pointerup',solta); document.addEventListener('pointercancel',solta);
  /* o clique que vem logo depois de soltar não abre o resumo */
  document.addEventListener('click',function(e){ if(SUPR&&Date.now()-SUPR<400&&e.target.closest&&e.target.closest('.mp-n')){e.stopPropagation();e.preventDefault()} SUPR=0 },true);
  /* o "i" fecha ao tocar fora ou com Esc */
  document.addEventListener('click',function(e){ if(INFO&&!(e.target.closest&&e.target.closest('.mp-info'))){INFO=false;var w=document.querySelector('#main .mp-info');if(w)w.outerHTML=infoH()} });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&INFO){INFO=false;var w=document.querySelector('#main .mp-info');if(w){w.outerHTML=infoH();var b=document.querySelector('#main .mp-i');if(b)b.focus()}} });
  R.ACT['mp-info']=function(){ INFO=!INFO; var w=document.querySelector('#main .mp-info'); if(w)w.outerHTML=infoH(); var b=document.querySelector('#main .mp-i'); if(b)b.focus() };
  /* passar o mouse (ou o foco) numa sessão de hoje acende o paciente no mapa */
  function acende(id){ if(id===HL)return; HL=id; var m=document.querySelector('#main .mp'); if(!m)return;
    Array.prototype.forEach.call(m.querySelectorAll('.hl'),function(e){e.classList.remove('hl')});
    if(id)Array.prototype.forEach.call(m.querySelectorAll('.mp-n[data-id="'+id+'"],.mp-fio[data-id="'+id+'"]'),function(e){e.classList.add('hl')});
    m.classList.toggle('tem-hl',!!id&&!!m.querySelector('.mp-n.hl')) }
  function sobre(e){ var r=e.target.closest&&e.target.closest('.ini-hoje [data-pid]'); acende(r?r.dataset.pid:null) }
  document.addEventListener('mouseover',sobre); document.addEventListener('focusin',sobre);

  R.ACT['mp-sel']=function(b){var id=b.dataset.id===''?null:Number(b.dataset.id); SEL=SEL===id?null:id; R.render(); var e=document.querySelector(SEL!=null?'.mp-lado .btn.pri':'.mp-n[data-id="'+id+'"]'); if(e&&SEL!=null&&innerWidth<900)e.scrollIntoView({block:'center',behavior:'instant'})};
  R.ACT['mp-foco']=function(b){FOCO=FOCO===b.dataset.v?'':b.dataset.v; SEL=null; R.render()};
  R.ACT['pac-modo']=function(b){P().modo(b.dataset.v); SEL=null; R.render()};
  window.RastroMapa={vista:vista};
  R.render(); /* o app desenha antes deste arquivo chegar: redesenha */
})();

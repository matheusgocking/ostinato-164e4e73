/* Modo sessão (esboço de Matheus, 19/11/2026): a tela de quando o atendimento está acontecendo.
   Barra em cima; à esquerda as notas e observações (só do psicólogo, não entram no prontuário); no meio a tela
   da chamada e, embaixo dela, o prontuário da sessão; à direita o plano de ação do paciente.
   O botão redondo no canto da tela liga e desliga o modo sessão: desligado, fica só a tela.
   Onde cada coisa é guardada:
   - anotações: s.obs (desta sessão) e p.cad (o caderno do paciente), as duas em markdown (js/caderno.js);
   - lousa: p.lousa, o desenho do paciente (js/lousa.js, Excalidraw embutido);
   - prontuário: s.rasc, o mesmo rascunho do caderno, então ao encerrar o caderno abre com o texto pronto para aprovar;
   - plano de ação: p.plano (do paciente, continua de uma sessão para a outra).
   Abre pelo botão "Iniciar sessão" na linha da sessão, na tela Hoje. */
(function(){
  var R=window.Rastro, UI=R.UI, ACT=R.ACT, escH=R.escH, pad=R.pad, minOf=R.minOf, nowMin=R.nowMin, DUR=R.DUR, TODAY=R.TODAY;
  var SS={sid:null,pick:null,t:null,aba:'obs',lousa:false};
  /* o botão redondo do esboço: ligado mostra os painéis (modo sessão); desligado fica só a tela */
  var MODO_T=['Modo sessão ligado. Toque para esconder os painéis e ficar só com a tela.','Só a tela. Toque para mostrar os painéis (modo sessão).'];
  function raiz(){return document.getElementById('ss')}
  function sess(){return SS.sid==null?null:R.sessById(SS.sid)}
  function hm(m){var h=Math.floor(m/60),r=m%60;return h+':'+(r<10?'0':'')+r}
  /* o relógio da barra: quanto resta, quanto falta para começar, ou quanto passou do horário */
  function relogio(s){
    if(s.date!==TODAY)return {n:s.hora,t:'horário da sessão'};
    var ini=minOf(s.hora), nm=nowMin();
    if(nm<ini)return {n:hm(ini-nm),t:'para começar'};
    if(nm<ini+DUR)return {n:hm(ini+DUR-nm),t:'restam'};
    return {n:hm(nm-ini-DUR),t:'além do horário',w:true};
  }
  function planoDe(p){if(!p.plano)p.plano=[];return p.plano}
  function planoH(p,pv){
    var l=planoDe(p), h='';
    if(pv)h+='<div class="ss-comb"><b>Combinado na sessão anterior</b>'+escH(R.capF(pv))+'.</div>';
    h+=l.length?'<ul class="ss-pl">'+l.map(function(x){return '<li class="'+(x.ok?'ok':'')+'"><label><input type="checkbox" data-ssp="'+x.id+'"'+(x.ok?' checked':'')+'><span>'+escH(x.t)+'</span></label><button data-act="ss-pl-rm" data-id="'+x.id+'" aria-label="Tirar do plano: '+escH(x.t)+'">×</button></li>'}).join('')+'</ul>'
      :'<p class="ss-vazio">Nenhum passo ainda. Escreva o primeiro embaixo.</p>';
    return h+'<form class="ss-novo" data-ssf><input id="ss-pl-in" autocomplete="off" placeholder="Novo passo do plano" aria-label="Novo passo do plano"><button class="btn sm" type="submit">Adicionar</button></form>';
  }
  function docH(p,s){
    if(s.nota)return {h:s.nota.split('\n').filter(function(x){return x.trim()}).map(function(x){return '<p>'+escH(x)+'</p>'}).join(''),ed:false};
    var l=R.cadList(p.id), i=l.findIndex(function(x){return x.id===s.id}), h;
    if(s.rasc&&s.rasc.sit===0){h=s.rasc.h;SS.pick=s.rasc.pick==null?null:s.rasc.pick}
    else{SS.pick=null;h=R.cadBody(p,s,l,i,0)}
    /* os botões "realizou / não realizou" trocam de dono aqui dentro, para o caderno não responder por eles */
    return {h:h.replace(/data-cd="pick"/g,'data-ss="pick"'),ed:true,pv:R.cadPrev(l,i<0?l.length:i)};
  }
  /* A chamada: o Meet não aceita rodar dentro de outro site (bloqueio do Google, medido em 19/11/2026). Então o link
     da chamada fica guardado no paciente (p.meet) e abre numa janela ao lado; o Rastro continua aqui.
     Só entra endereço https, para nada além de uma página comum ser aberto. */
  function linkOk(v){ if(!/^[a-z][a-z0-9+.-]*:/i.test(v))v='https://'+v;
    try{var u=new URL(v); return u.protocol==='https:'&&u.hostname.indexOf('.')>0?u.href:''}catch(e){return ''} }
  function linkCurto(u){return u.replace(/^https:\/\//,'').replace(/[?#].*$/,'').replace(/\/$/,'')}
  /* Quem usa decide para quais sessões o link vale (Matheus, 19/11/2026): em todas as do paciente (p.meet)
     ou só nesta (s.meet). O da sessão, quando existe, passa na frente do do paciente. */
  function chamH(p,s){ var q=p.tipo==='Casal'?p.nome:p.nome.split(' ')[0], lk=s.meet||p.meet, so=!!s.meet, h='<p class="ss-cn">'+escH(p.nome)+'</p>';
    if(lk&&!SS.troca)return h+'<button class="ss-ir" data-act="ss-meet"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10.5l6-3.5v10l-6-3.5z"/></svg><span>Abrir a chamada</span></button>'
      +'<p class="ss-ch-t">Abre numa janela ao lado e o Ostinato continua aqui.<span class="ss-lk">'+escH(linkCurto(lk))+'</span><span class="ss-qd">'+(so?'Link só desta sessão.':'Link de todas as sessões de '+escH(q)+'.')+'</span><button class="ss-tr" data-act="ss-meet-troca">Trocar o link</button></p>';
    return h+'<form class="ss-mf" data-ssm novalidate><label for="ss-meet-in">Link do Meet de '+escH(q)+'</label><div><input id="ss-meet-in" inputmode="url" autocomplete="off" spellcheck="false" placeholder="meet.google.com/abc-defg-hij" value="'+escH(lk||'')+'" aria-describedby="ss-meet-msg"><button class="ss-mb" type="submit">Guardar</button></div>'
      +'<div class="ss-mq" role="radiogroup" aria-label="Para quais sessões o link vale"><label><input type="radio" name="ss-meet-q" value="p"'+(so?'':' checked')+'>Em todas as sessões de '+escH(q)+'</label><label><input type="radio" name="ss-meet-q" value="s"'+(so?' checked':'')+'>Só nesta sessão</label></div>'
      +'<p class="ss-ch-t" id="ss-meet-msg">'+(lk?'Para tirar o link, apague o campo e guarde.':'Abre numa janela ao lado. O Google não deixa a chamada rodar dentro de outro site.')+'</p></form>';
  }
  function redesenhaCham(foco){var s=sess(), e=document.getElementById('ss-cham'); if(!s||!e)return; e.innerHTML=chamH(R.pac(s.pid),s);
    var f=e.querySelector(foco); if(f){f.focus(); if(f.select)f.select()}}
  function abre(sid){
    var s=R.sessById(sid); if(!s)return; var p=R.pac(s.pid); SS.sid=sid; SS.troca=false;
    var d=docH(p,s), rl=relogio(s), el=raiz();
    if(!el){el=document.createElement('div');el.id='ss';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el)}
    el.className='ss'; el.setAttribute('aria-label','Sessão com '+p.nome);
    var num=s._n?'Sessão '+pad(s._n)+', ':'', nv=R.niverProx(7).filter(function(x){return x.p.id===p.id})[0];
    el.innerHTML='<header class="ss-bar"><div class="ss-quem"><p>'+num+(s.date===TODAY?'hoje':R.dm(s.date))+' às '+s.hora+(nv?'<span class="ss-nv">'+R.CHAPEU+(nv.em===0?'faz aniversário hoje':nv.em===1?'faz aniversário amanhã':'faz aniversário em '+nv.em+' dias')+'</span>':'')+'</p><h1>'+(window.RastroPersonagens?window.RastroPersonagens.mini(p,'m'):'')+escH(p.nome)+'</h1></div>'
      +'<p class="ss-rel'+(rl.w?' w':'')+'" id="ss-rel"><b>'+rl.n+'</b><span>'+rl.t+'</span></p>'
      +'<div class="ss-bts"><button class="btn sm" data-act="ss-fecha" title="Guarda o que você escreveu. A sessão continua marcada e você volta por Iniciar sessão.">Sair sem encerrar</button>'+(R.isFut(s)?'<button class="btn pri sm" data-act="ss-fim" title="Marca a sessão como realizada e abre o registro para você conferir e aprovar.">Encerrar e registrar</button>':'<button class="btn pri sm" data-act="ss-cad">Abrir no prontuário</button>')+'</div></header>'
      +'<div class="ss-g">'
      +'<section class="ss-p ss-notas" id="ss-notas">'+notasH(s,p)+'</section>'
      +'<section class="ss-tela'+(SS.lousa?' com-lousa':'')+'" id="ss-tela" aria-label="Tela da chamada"><button class="ss-lb" data-act="ss-lousa" aria-pressed="'+SS.lousa+'" title="Lousa: desenhar e escrever com o paciente, no lugar da chamada"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg><span>'+(SS.lousa?'Voltar à chamada':'Lousa')+'</span></button><button class="ss-modo" data-act="ss-modo" aria-pressed="true" aria-label="'+MODO_T[0]+'" title="'+MODO_T[0]+'"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M8 13h8"/></svg></button>'
      +'<div class="ss-cham" id="ss-cham">'+chamH(p,s)+'</div><div class="ss-lousa" id="ss-lousa"></div></section>'
      +'<section class="ss-p ss-pront"><h2>Prontuário<small id="ss-rasc">'+(s.nota?'Registro aprovado.':s.rasc?'Rascunho salvo às '+s.rasc.em+'. Vale depois de aprovado.':'Rascunho. Vale depois de aprovado.')+'</small>'+(d.ed?'<button class="link ss-frb" data-act="ss-fr" aria-expanded="false" aria-controls="ss-fr" title="Trechos prontos. Atalho: a tecla / no texto">Frases</button>':'')+'</h2>'+(d.ed?'<div class="ss-fr" id="ss-fr" hidden>'+R.frasesH()+'</div>':'')+'<div class="ss-doc" id="ss-doc"'+(d.ed?' contenteditable="true" spellcheck="true"':'')+'>'+d.h+'</div></section>'
      +'<section class="ss-p ss-plano"><h2>Plano de ação</h2><div id="ss-plano">'+planoH(p,d.pv)+'</div></section>'
      +'</div>';
    document.getElementById('app').inert=true;
    document.documentElement.classList.add('ss-on');
    clearInterval(SS.t); SS.t=setInterval(tique,20000);
    if(SS.lousa)montaLousa();
    var o=el.querySelector('.cdn[data-modo="esc"] .cdn-esc'); if(o&&innerWidth>=900)o.focus();
  }
  /* o painel de anotações tem dois lados: as notas desta sessão e o caderno do paciente, que continua entre as sessões */
  function notasH(s,p){ var C=window.RastroCaderno, k=SS.aba==='cad'?'cad:'+p.id:'obs:'+s.id;
    return '<h2><span>Anotações</span><span class="seg ss-abas" role="group" aria-label="Qual anotação"><button data-act="ss-aba" data-v="obs" aria-pressed="'+(SS.aba!=='cad')+'" title="Só desta sessão">Desta sessão</button><button data-act="ss-aba" data-v="cad" aria-pressed="'+(SS.aba==='cad')+'" title="O caderno do paciente, que continua de uma sessão para a outra">Caderno do paciente</button></span></h2>'
      +'<div class="ss-cdn">'+C.campo(k,SS.aba==='cad'?'Caderno de '+p.nome.split(' ')[0]+'. Continua de uma sessão para a outra.':'Notas desta sessão. Só para você, não entram no prontuário.')+'</div>' }
  function montaLousa(){var s=sess(); if(s&&window.RastroLousa)window.RastroLousa.abre(document.getElementById('ss-lousa'),s.pid)}
  function tique(){var s=sess(), e=document.getElementById('ss-rel'); if(!s||!e)return; var rl=relogio(s);
    e.className='ss-rel'+(rl.w?' w':''); e.firstChild.textContent=rl.n; e.lastChild.textContent=rl.t}
  function fecha(){if(window.RastroLousa)window.RastroLousa.fecha(); var el=raiz(); if(el)el.remove(); clearInterval(SS.t); SS.sid=null;
    document.getElementById('app').inert=false; document.documentElement.classList.remove('ss-on'); R.render()}
  function guardaDoc(){
    var d=document.getElementById('ss-doc'), s=sess(); if(!d||!s||s.nota||!d.isContentEditable)return; var a=new Date();
    s.rasc={h:d.innerHTML.replace(/data-ss="pick"/g,'data-cd="pick"').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,''),sit:0,pick:SS.pick,em:pad(a.getHours())+':'+pad(a.getMinutes())};
    R.guarda(); var e=document.getElementById('ss-rasc'); if(e)e.textContent='Rascunho salvo às '+s.rasc.em+'. Vale depois de aprovado.';
  }
  function redesenhaPlano(){var s=sess(); if(!s)return; var p=R.pac(s.pid), l=R.cadList(p.id), i=l.findIndex(function(x){return x.id===s.id});
    document.getElementById('ss-plano').innerHTML=planoH(p,s.nota?'':R.cadPrev(l,i<0?l.length:i)); R.guarda()}
  function sel(g){R.lacArruma.l=g.dataset.l;var r=document.createRange();r.selectNodeContents(g);var sl=getSelection();sl.removeAllRanges();sl.addRange(r)}

  ACT['ss-abre']=function(b){abre(Number(b.dataset.id))};
  ACT['ss-fecha']=function(){guardaDoc();fecha();R.toast('Anotações guardadas. A sessão continua na tela Hoje.')};
  ACT['ss-aba']=function(b){var s=sess(); if(!s)return; SS.aba=b.dataset.v; document.getElementById('ss-notas').innerHTML=notasH(s,R.pac(s.pid))};
  ACT['ss-lousa']=function(b){SS.lousa=!SS.lousa; b.setAttribute('aria-pressed',String(SS.lousa)); document.getElementById('ss-tela').classList.toggle('com-lousa',SS.lousa); b.querySelector('span').textContent=SS.lousa?'Voltar à chamada':'Lousa'; if(SS.lousa)montaLousa()};
  ACT['ss-modo']=function(b){var el=raiz(), on=el.classList.toggle('so-tela'), t=MODO_T[on?1:0]; b.setAttribute('aria-pressed',String(!on)); b.title=t; b.setAttribute('aria-label',t)};
  /* abre a chamada na metade direita da tela; no celular o navegador abre em outra aba */
  ACT['ss-meet']=function(){var s=sess(), p=s&&R.pac(s.pid), lk=p&&(s.meet||p.meet); if(!lk)return;
    var sw=screen.availWidth||1280, sh=screen.availHeight||720, w=Math.max(480,Math.round(sw/2)),
      j=window.open(lk,'_blank','popup=yes,width='+w+',height='+sh+',left='+((screen.availLeft||0)+sw-w)+',top='+(screen.availTop||0));
    if(!j){R.toast('O navegador bloqueou a janela. Permita janelas deste site e tente de novo.');return}
    try{j.opener=null}catch(e){}
    R.toast('Chamada aberta em outra janela.')};
  ACT['ss-meet-troca']=function(){SS.troca=true; redesenhaCham('#ss-meet-in')};
  ACT['ss-pl-rm']=function(b){var s=sess(), p=R.pac(s.pid), id=Number(b.dataset.id); p.plano=planoDe(p).filter(function(x){return x.id!==id}); redesenhaPlano()};
  /* encerrar: a sessão passa a realizada e o caderno abre com o que foi escrito, para conferir e aprovar */
  ACT['ss-fim']=function(b){var s=sess(); if(!s)return;
    /* fora da reta final da sessão, pede um segundo toque: encerrar muda a sessão para realizada */
    var antes=s.date===TODAY&&nowMin()<minOf(s.hora), cedo=s.date!==TODAY||nowMin()<minOf(s.hora)+DUR-15;
    if(cedo&&!SS.conf){SS.conf=true; b.textContent=antes?'A sessão ainda não começou. Encerrar mesmo assim?':'Ainda está no horário. Encerrar mesmo assim?'; clearTimeout(SS.ct); SS.ct=setTimeout(function(){SS.conf=false; if(b.isConnected)b.textContent='Encerrar e registrar'},5000); return}
    SS.conf=false; guardaDoc(); var pid=s.pid, sid=s.id;
    if(R.isFut(s)){R.mark();s.status='realizada';s.cobrar=false;R.save()}
    fecha(); R.abreCad(pid,sid); R.go('app-prontuario',true); R.toastU('Sessão marcada como realizada. Confira o registro e aprove.')};
  /* frases (23/11/2026): o mesmo bloco do prontuário; entram depois de onde está o cursor */
  function frAbre(abre){var f=document.getElementById('ss-fr'), b=document.querySelector('.ss-frb'); if(!f)return null; f.hidden=!abre; if(b)b.setAttribute('aria-expanded',String(abre)); return f}
  ACT['ss-fr']=function(){var f=document.getElementById('ss-fr'); if(f)frAbre(f.hidden)};
  document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('#ss [data-fr]'); if(!b)return; var s=sess(), d=document.getElementById('ss-doc'); if(!s||!d)return;
    if(R.fraseIns(d,b.dataset.fr,R.pac(s.pid),s)){frAbre(false);guardaDoc()}});
  document.addEventListener('keydown',function(ev){ if(!raiz())return;
    if(ev.target.id==='ss-doc'&&ev.key==='/'&&!ev.ctrlKey&&!ev.metaKey&&!ev.altKey){var f=frAbre(true), x=f&&f.querySelector('button'); if(x){ev.preventDefault();x.focus()}}
    if(ev.key==='Escape'&&ev.target.closest&&ev.target.closest('#ss-fr')){ev.preventDefault();ev.stopImmediatePropagation();frAbre(false);var d=document.getElementById('ss-doc');if(d)d.focus()}},true);
  ACT['ss-cad']=function(){var s=sess(); if(!s)return; var pid=s.pid, sid=s.id; fecha(); R.abreCad(pid,sid); R.go('app-prontuario',true)};

  document.addEventListener('input',function(ev){var t=ev.target, s=sess(); if(!s)return;
    if(t.id==='ss-doc'){R.lacArruma(t,ev);Array.prototype.forEach.call(t.querySelectorAll('.lac'),function(g){var v=g.textContent.trim();if(v&&v!==g.dataset.l)g.className='lac-ok'});clearTimeout(SS.d);SS.d=setTimeout(guardaDoc,700)}});
  document.addEventListener('change',function(ev){var t=ev.target, s=sess(); if(!s||!t.dataset||t.dataset.ssp==null)return;
    var x=planoDe(R.pac(s.pid)).filter(function(y){return y.id===Number(t.dataset.ssp)})[0]; if(x){x.ok=t.checked;redesenhaPlano()}});
  document.addEventListener('submit',function(ev){if(!ev.target.hasAttribute('data-ssm'))return; ev.preventDefault();
    var s=sess(); if(!s)return; var p=R.pac(s.pid), i=document.getElementById('ss-meet-in'), m=document.getElementById('ss-meet-msg'), v=i.value.trim(), u=v&&linkOk(v);
    function erro(t){m.textContent=t; m.classList.add('er'); i.setAttribute('aria-invalid','true'); i.focus()}
    var so=ev.target.querySelector('input[name="ss-meet-q"]:checked').value==='s';
    if(!v){ if(!s.meet&&!p.meet){erro('Cole o link da chamada para guardar.');return}
      var ds=!!s.meet; if(ds)delete s.meet; else delete p.meet; R.guarda(); SS.troca=false; redesenhaCham('.ss-ir,#ss-meet-in');
      R.toast(ds?(p.meet?'Link desta sessão tirado. Voltou o link de todas as sessões.':'Link desta sessão tirado.'):'Link tirado deste paciente.'); return}
    if(!u){erro('Isso não parece um link. Cole o endereço inteiro, como meet.google.com/abc-defg-hij.');return}
    if(so)s.meet=u; else{p.meet=u; delete s.meet}
    R.guarda(); SS.troca=false; redesenhaCham('.ss-ir'); R.toast(so?'Link guardado só para esta sessão.':'Link guardado para todas as sessões.')});
  document.addEventListener('submit',function(ev){if(!ev.target.hasAttribute('data-ssf'))return; ev.preventDefault();
    var i=document.getElementById('ss-pl-in'), v=i.value.trim(), s=sess(); if(!v||!s)return;
    var l=planoDe(R.pac(s.pid)); l.push({id:l.reduce(function(m,x){return Math.max(m,x.id)},0)+1,t:v,ok:false}); redesenhaPlano(); document.getElementById('ss-pl-in').focus()});
  document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-ss="pick"]'); if(!b)return;
    SS.pick=Number(b.dataset.o); Array.prototype.forEach.call(b.parentNode.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',String(x===b))}); guardaDoc()});
  document.addEventListener('mouseup',function(ev){var g=ev.target.closest&&ev.target.closest('#ss-doc .lac'); if(g)sel(g)});
  /* com a sessão aberta, o teclado é dela (o app.js fica quieto): Esc volta para o modo sessão ou sai;
     Tab pula entre os campos em vermelho do prontuário. Dentro da lousa as teclas são da lousa. */
  document.addEventListener('keydown',function(ev){ if(!raiz())return;
    if(ev.target.closest&&ev.target.closest('.ss-lousa'))return;
    if(ev.key==='Escape'){ var cp=ev.target.closest&&ev.target.closest('input,textarea,[contenteditable="true"]'); if(cp){cp.blur();return} if(SS.lousa)return; /* dentro de um campo, Esc só larga o campo */
      var el=raiz(); if(el.classList.contains('so-tela'))ACT['ss-modo'](el.querySelector('.ss-modo')); else ACT['ss-fecha'](); return}
    if(ev.target.id==='ss-doc'&&ev.key==='Tab'){var ls=Array.prototype.slice.call(ev.target.querySelectorAll('.lac')); if(ls.length){ev.preventDefault();var a=getSelection().anchorNode, cur=a&&a.parentElement&&a.parentElement.closest('.lac'), i=ls.indexOf(cur); sel(ls[ev.shiftKey?(i<=0?ls.length-1:i-1):(i+1)%ls.length])}}
  },true);
  window.RastroSessao={abre:abre,fecha:fecha,sai:function(){guardaDoc();fecha()}};
})();

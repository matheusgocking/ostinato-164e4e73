/* Configurações → Prontuário (23/11/2026, pedido de Matheus): quem usa edita os pré-textos de cada registro,
   as frases prontas, os nomes das seções e a folha. Os dados e o desenho do texto ficam em js/app.js
   (PR, prSave, linhaH, modeloH, foBodyH, folhaH); aqui é só a tela.
   Quatro abas:
   - Modelos: um modelo por tipo de atendimento (adulto, casal, criança ou adolescente) e por situação; cada
     modelo é uma lista de linhas. {campo} vira campo em vermelho, {a|b} vira escolha, e as variáveis da lista
     o app preenche sozinho. Ao lado, como o texto abre no prontuário, com um paciente do exemplo.
   - Frases: os trechos que entram por um botão ou pela tecla / no meio do registro.
   - Seções: os nomes das seções da folha. As três exigidas pela Res. CFP 001/2009 (art. 2º, II a IV) se
     renomeiam e não se apagam; as seções novas entram em todo registro de sessão, com o seu próprio pré-texto.
   - Folha: as mesmas opções do "Personalizar a folha", com a folha de exemplo ao lado. */
(function(){
  var R=window.Rastro, escH=R.escH, CF={tab:'modelos',tipo:'adulto',sit:'sessao',foco:null};
  var TABS=[['modelos','Modelos'],['frases','Frases'],['secoes','Seções'],['folha','Folha']];
  var OBRIG={dem:'Res. CFP 001/2009, art. 2º, II',evol:'Res. CFP 001/2009, art. 2º, III',enc:'Res. CFP 001/2009, art. 2º, IV'};
  var SETA_C='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  var SETA_B='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var XIS='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function P(){return R.PR()}
  function sits(){return R.PR_SIT.concat((P().extra||[]).map(function(x){return [x.id,x.n,'Seção sua, em todo registro de sessão.']}))}
  function linhas(){var m=P().mod[CF.tipo];if(!m[CF.sit])m[CF.sit]=[];return m[CF.sit]}
  /* um paciente do exemplo do mesmo tipo, para a prévia */
  function exemplo(){var t=CF.tipo, l=R.dados().pac.filter(function(p){return R.tipoMod(p)===t});
    var p=l.filter(function(x){return x.ativo})[0]||l[0];
    if(!p)p={id:0,nome:t==='casal'?'Ana e Bruno Lima':t==='crianca'?'Lia Souza':'Paula Reis',tipo:t==='casal'?'Casal':t==='crianca'?'Criança':'Adulto',genero:t==='casal'?'C':'F',mod:'Online',freq:7,dow:2,hora:'15:00',resp:'Marta Souza, mãe'};
    return p}
  function prevH(){ var p=exemplo(), s={date:R.TODAY,hora:p.hora,_n:5};
    var h=R.modeloH(p,s,CF.sit,'registrar o sono por uma semana');
    return '<p class="cf-pv-q">Com '+escH(p.nome)+', do exemplo.</p><div class="cf-pv-doc">'+(h||'<p class="muted">Nenhuma linha. O registro abre com um campo só, em branco.</p>')+'</div>' }
  function avisos(){ var t=linhas().map(function(x){return x.t||''}).join(' '), a=[];
    if(CF.sit==='remarcada'&&!/\{nova data\}/i.test(t))a.push('Sem {nova data}, o Rastro não consegue mudar a data da sessão na agenda.');
    if((CF.sit==='sessao'||CF.sit==='primeira')&&!/\{atividade\}/i.test(t))a.push('Sem {atividade}, a próxima sessão não mostra o que ficou combinado.');
    if(/\{[^}]*$/.test(t)||/^[^{]*\}/.test(t))a.push('Há uma chave sem par. Todo campo abre com { e fecha com }.');
    return a.map(function(x){return '<p class="cf-av">'+escH(x)+'</p>'}).join('') }

  function abas(){return '<div class="cf-tabs" role="tablist" aria-label="Partes do prontuário">'+TABS.map(function(t){return '<button role="tab" data-cf="tab" data-v="'+t[0]+'" aria-selected="'+(CF.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>'}
  function lnH(i,t,n,dc){return '<div class="cf-ln"><span class="cf-n">'+(i+1)+'</span><textarea data-cf="'+dc+'" data-i="'+i+'" rows="2" spellcheck="true" aria-label="Linha '+(i+1)+'">'+escH(t)+'</textarea><span class="cf-lb"><button data-cf="up" data-i="'+i+'" aria-label="Subir a linha '+(i+1)+'"'+(i===0?' disabled':'')+'>'+SETA_C+'</button><button data-cf="dn" data-i="'+i+'" aria-label="Descer a linha '+(i+1)+'"'+(i===n-1?' disabled':'')+'>'+SETA_B+'</button><button data-cf="rm" data-i="'+i+'" aria-label="Apagar a linha '+(i+1)+'">'+XIS+'</button></span></div>'}

  function vModelos(){
    var S0=sits(), cur=S0.filter(function(x){return x[0]===CF.sit})[0]; if(!cur){CF.sit='sessao';cur=S0[1]}
    var L=linhas();
    var h='<div class="cf-tipo"><span>Tipo de atendimento</span><div class="fo-seg">'+R.PR_TIPOS.map(function(t){return '<button data-cf="tipo" data-v="'+t[0]+'" aria-pressed="'+(CF.tipo===t[0])+'">'+t[1]+'</button>'}).join('')+'</div><small>O prontuário escolhe sozinho pelo cadastro do paciente.</small></div>';
    h+='<div class="cf-grid"><nav class="cf-sits" aria-label="Situação">'+S0.map(function(x){return '<button data-cf="sit" data-v="'+x[0]+'" aria-current="'+(CF.sit===x[0])+'">'+escH(x[1])+'<small>'+escH(x[2])+'</small></button>'}).join('')+'</nav>'
      +'<select class="cf-sitsel" data-cfsel="sit" aria-label="Situação">'+S0.map(function(x){return '<option value="'+x[0]+'"'+(CF.sit===x[0]?' selected':'')+'>'+escH(x[1])+'</option>'}).join('')+'</select>';
    h+='<section class="cf-ed"><h2>'+escH(cur[1])+'<small>'+escH(cur[2])+' Cada linha vira um parágrafo; você escreve só o que fica em vermelho.</small></h2>'
      +'<div id="cf-lns">'+L.map(function(x,i){return lnH(i,x.t||'',L.length,'ln')}).join('')+'</div>'
      +'<div class="btnrow"><button class="btn sm" data-cf="add">Adicionar linha</button><button class="link" data-cf="ex">Voltar ao modelo de exemplo</button></div>'
      +'<div id="cf-av">'+avisos()+'</div>'
      +'<div class="cf-vars"><p>Toque para pôr na linha onde está o cursor:</p><div class="chips">'
      +'<button data-cf="var" data-v="{campo}" title="Vira um campo em vermelho para você escrever">{campo em vermelho}</button><button data-cf="var" data-v="{realizou|não realizou}" title="Vira dois botões: você escolhe com um toque">{escolha|outra}</button>'
      +R.PR_VARS.map(function(v){return '<button data-cf="var" data-v="{'+v[0]+'}" title="'+escH(v[1])+'">{'+v[0]+'}</button>'}).join('')+'</div>'
      +'<details class="cf-ajuda"><summary>O que cada variável vira</summary><dl>'+R.PR_VARS.map(function(v){return '<dt>{'+v[0]+'}</dt><dd>'+escH(v[1])+'.</dd>'}).join('')+'<dt>{qualquer outro texto}</dt><dd>campo em vermelho com esse nome; o registro não aprova enquanto ele estiver vazio.</dd><dt>{a|b}</dt><dd>dois ou mais botões para escolher com um toque.</dd></dl></details></div></section>';
    h+='<aside class="cf-pv"><h3>Como abre no prontuário</h3><div id="cf-pv">'+prevH()+'</div><p class="muted cf-nota">Mudar o modelo não mexe em registro já aprovado: o registro guarda o texto final.</p></aside></div>';
    return h }

  function vFrases(){var F=P().frases;
    return '<p class="cf-intro">Entram no registro pelo bloco Frases, ao lado da folha, ou pela tecla / enquanto você escreve. Valem as mesmas variáveis e campos dos modelos.</p>'
      +'<div class="cf-frs">'+F.map(function(f,i){return '<div class="cf-fr"><input data-cf="fn" data-i="'+i+'" value="'+escH(f.n)+'" aria-label="Nome da frase '+(i+1)+'" placeholder="Nome da frase">'+lnH(i,f.t,F.length,'ft').replace('<span class="cf-n">'+(i+1)+'</span>','')+'</div>'}).join('')+'</div>'
      +'<div class="btnrow"><button class="btn sm" data-cf="fadd">Adicionar frase</button><button class="link" data-cf="fex">Voltar às frases de exemplo</button></div>' }

  function vSecoes(){ var ks=['dem','evol','comp','enc'], X=P().extra||[];
    var row=function(k){var ob=OBRIG[k];return '<div class="cf-sec"><label for="cf-sec-'+k+'">'+(ob?'Exigida':'Do seu modelo')+'<small>'+(ob?escH(ob)+'. Pode mudar o nome; não pode apagar.':'O que acontece entre uma sessão e outra (contato, remarcação). Pode mudar o nome.')+'</small></label><input id="cf-sec-'+k+'" data-cf="sec" data-k="'+k+'" value="'+escH(R.secNome(k))+'" placeholder="'+escH(R.PR_SEC_DEF[k])+'"></div>'};
    return '<p class="cf-intro">As seções que toda folha de prontuário tem. A Res. CFP 001/2009 exige identificação, demanda e objetivos, evolução com os procedimentos e encaminhamento ou encerramento; elas ficam travadas, e você só muda o nome. A identificação se ajusta na aba Folha.</p>'
      +ks.map(row).join('')
      +'<h3 class="cf-h3">Seções suas</h3><p class="cf-intro">Entram em todo registro de sessão, depois da evolução, com o pré-texto que você escrever na aba Modelos.</p>'
      +(X.length?X.map(function(x,i){return '<div class="cf-sec cf-sx"><label for="cf-x-'+i+'">Seção sua<small>Pré-texto na aba Modelos.</small></label><input id="cf-x-'+i+'" data-cf="xn" data-i="'+i+'" value="'+escH(x.n)+'"><button class="btn sm" data-cf="xmod" data-v="'+x.id+'">Pré-texto</button><button class="cd-ic" data-cf="xrm" data-i="'+i+'" aria-label="Apagar a seção '+escH(x.n)+'">'+XIS+'</button></div>'}).join(''):'<p class="muted">Nenhuma ainda.</p>')
      +'<form class="cf-xnova" data-cff><input id="cf-xin" autocomplete="off" placeholder="Nome da seção nova, por exemplo Observações" aria-label="Nome da seção nova"><button class="btn sm" type="submit">Adicionar seção</button></form>' }

  function vFolha(){ var p=exemplo(), s={date:R.TODAY,hora:p.hora,_n:5};
    var inner=R.modeloH(p,s,'sessao','registrar o sono por uma semana').replace(/<span class="cd-pick"[^>]*>.*?<\/span>/g,'realizou');
    return '<div class="cf-grid cf-gf"><div class="cf-fo">'+R.foBodyH()+'</div><div class="cf-fpv"><h3>Folha de exemplo</h3><div class="cf-fbox" id="cf-fbox">'+R.folhaH(p,s,inner,'evol',false)+'</div></div></div>' }

  function vista(){
    var h='<div class="head"><div><h1>Configurações</h1><p>Prontuário: o texto que abre em cada registro, as frases, as seções e a folha.</p></div></div>'+abas();
    h+='<div class="cf-body" role="tabpanel">'+(CF.tab==='frases'?vFrases():CF.tab==='secoes'?vSecoes():CF.tab==='folha'?vFolha():vModelos())+'</div>';
    requestAnimationFrame(ajusta); return h }
  /* a folha de exemplo tem a largura do A4: encolhe para caber na coluna */
  /* a caixa de cada linha cresce com o texto, para nada ficar escondido */
  function cresce(t){t.style.height='auto';t.style.height=(t.scrollHeight+2)+'px'}
  function ajusta(){Array.prototype.forEach.call(document.querySelectorAll('.cf-ln textarea'),cresce);var b=document.getElementById('cf-fbox');if(!b)return;var f=b.querySelector('.folha');if(!f)return;f.style.zoom='1';var w=f.offsetWidth;if(w>b.clientWidth)f.style.zoom=(b.clientWidth/w).toFixed(3)}
  addEventListener('resize',function(){clearTimeout(ajusta.t);ajusta.t=setTimeout(ajusta,150)});

  function salva(){R.prSave()}
  function redesenha(){var y=scrollY;R.render();scrollTo(0,y)}
  function atualizaPrev(){var e=document.getElementById('cf-pv');if(e)e.innerHTML=prevH();var a=document.getElementById('cf-av');if(a)a.innerHTML=avisos()}
  function poeNoCursor(v){var ta=CF.foco&&document.body.contains(CF.foco)?CF.foco:document.querySelector('#cf-lns textarea:last-of-type, .cf-frs textarea');
    if(!ta){R.toast('Toque primeiro numa linha.');return}
    var a=ta.selectionStart==null?ta.value.length:ta.selectionStart, b=ta.selectionEnd==null?a:ta.selectionEnd;
    ta.value=ta.value.slice(0,a)+v+ta.value.slice(b); ta.focus(); var c=a+v.length; if(v==='{campo}'){ta.setSelectionRange(a+1,a+6)}else ta.setSelectionRange(c,c);
    ta.dispatchEvent(new Event('input',{bubbles:true}))}
  function move(arr,i,d){var j=i+d;if(j<0||j>=arr.length)return;var x=arr[i];arr[i]=arr[j];arr[j]=x}

  document.addEventListener('focusin',function(ev){var t=ev.target;if(t.tagName==='TEXTAREA'&&(t.dataset.cf==='ln'||t.dataset.cf==='ft'))CF.foco=t});
  document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-cf]');if(!b||b.tagName==='TEXTAREA'||b.tagName==='INPUT')return;
    var a=b.dataset.cf, i=Number(b.dataset.i), L, F=P().frases;
    if(a==='tab'){CF.tab=b.dataset.v;redesenha();return}
    if(a==='tipo'){CF.tipo=b.dataset.v;redesenha();return}
    if(a==='sit'){CF.sit=b.dataset.v;redesenha();return}
    if(a==='var'){poeNoCursor(b.dataset.v);return}
    if(a==='add'){linhas().push({t:''});salva();redesenha();var t=document.querySelectorAll('#cf-lns textarea');if(t.length)t[t.length-1].focus();return}
    if(a==='ex'){var base=R.prBase(CF.tipo)[CF.sit];P().mod[CF.tipo][CF.sit]=base?JSON.parse(JSON.stringify(base)):[];salva();redesenha();R.toast('O modelo de exemplo voltou.');return}
    if(a==='up'||a==='dn'||a==='rm'){var arr=b.closest('.cf-frs')?F:linhas();
      if(a==='rm'){var vel=arr.splice(i,1)[0];salva();redesenha();var e=document.getElementById('toast');e.innerHTML='Linha apagada. <button data-cf="desfaz">Desfazer</button>';e.hidden=false;clearTimeout(R.toast.t);R.toast.t=setTimeout(function(){e.hidden=true},6000);CF.volta={arr:arr,i:i,v:vel};return}
      move(arr,i,a==='up'?-1:1);salva();redesenha();return}
    if(a==='desfaz'){var v=CF.volta;if(v){v.arr.splice(v.i,0,v.v);CF.volta=null;salva();redesenha();document.getElementById('toast').hidden=true}return}
    if(a==='fadd'){F.push({id:'f'+Date.now(),n:'Frase nova',t:''});salva();redesenha();var fi=document.querySelectorAll('.cf-frs input');if(fi.length){fi[fi.length-1].focus();fi[fi.length-1].select()}return}
    if(a==='fex'){P().frases=R.prFrasesSeed();salva();redesenha();R.toast('As frases de exemplo voltaram.');return}
    if(a==='xmod'){CF.tab='modelos';CF.sit=b.dataset.v;redesenha();return}
    if(a==='xrm'){var X=P().extra||[], x=X.splice(i,1)[0];if(x)R.PR_TIPOS.forEach(function(t){delete P().mod[t[0]][x.id]});salva();redesenha();R.toast('Seção apagada. Os registros já aprovados continuam como estavam.');return}
  });
  document.addEventListener('input',function(ev){var t=ev.target, a=t.dataset&&t.dataset.cf; if(!a)return; var i=Number(t.dataset.i); if(t.tagName==='TEXTAREA')cresce(t);
    if(a==='ln'){var L=linhas();if(L[i])L[i].t=t.value;salva();clearTimeout(CF.tp);CF.tp=setTimeout(atualizaPrev,200);return}
    if(a==='ft'){P().frases[i].t=t.value;salva();return}
    if(a==='fn'){P().frases[i].n=t.value;salva();return}
    if(a==='sec'){P().sec[t.dataset.k]=t.value;salva();return}
    if(a==='xn'){P().extra[i].n=t.value;salva();return}
  });
  document.addEventListener('change',function(ev){var t=ev.target;if(t.dataset&&t.dataset.cfsel==='sit'){CF.sit=t.value;redesenha()}});
  document.addEventListener('submit',function(ev){var f=ev.target;if(!f.hasAttribute||!f.hasAttribute('data-cff'))return;ev.preventDefault();
    var v=document.getElementById('cf-xin').value.trim();if(!v){R.toast('Escreva o nome da seção.');return}
    var X=P().extra=P().extra||[], id='x'+Date.now();X.push({id:id,n:v});R.PR_TIPOS.forEach(function(t){P().mod[t[0]][id]=[{t:'{'+v.toLowerCase()+'}'}]});salva();redesenha();R.toast('Seção "'+v+'" criada. O pré-texto dela está na aba Modelos.')});

  window.RastroConfig={vista:vista,abre:function(tab,tipo,sit){CF.tab=tab||'modelos';if(tipo)CF.tipo=tipo;if(sit)CF.sit=sit;R.go('app-config')}};
  R.render(); /* o app desenha antes deste arquivo chegar: redesenha */
})();

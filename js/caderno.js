/* Caderno (pedido de Matheus, 19/11/2026): as anotações livres do psicólogo, escritas em markdown, no jeito do Obsidian.
   Não é o prontuário (documento oficial, com modelo e aprovação): é o rascunho de trabalho, só de quem atende.
   Dois lugares guardam texto:
   - p.cad: o caderno do paciente, um texto só, que continua de uma sessão para a outra (chave "cad:ID");
   - s.obs: as notas de uma sessão (chave "obs:ID").
   Cada campo tem dois modos, como no Obsidian: Ler (o markdown desenhado) e Escrever (o texto cru). Ctrl+E troca.
   Markdown aceito: # títulos, **negrito**, *itálico*, ~~riscado~~, ==destaque==, `código`, listas, tarefas "- [ ]"
   (o quadradinho marca direto no modo Ler), > citação, > [!nota] destaque, ---, [texto](link), #etiqueta e
   [[Nome do paciente]], que vira atalho para a ficha.
   Aparece no modo sessão (painel de anotações) e na aba Caderno da ficha do paciente. */
(function(){
  var R=window.Rastro, escH=R.escH, MODO={};
  function le(k){var a=k.split(':'), id=Number(a[1]); if(a[0]==='cad'){var p=R.pac(id);return p?(p.cad||''):''} var s=R.sessById(id);return s?(s.obs||''):''}
  /* O caderno é registro documental (Manual do CFP, 2025, 3.3: hipótese e interpretação não compartilhada vão
     no registro documental, não no prontuário). Ele é sigiloso e tem guarda como o prontuário, então nada escrito
     se perde: no primeiro toque de cada dia, o texto do dia anterior fica guardado em p.cadHist. Decisão de Matheus
     de 23/11/2026. */
  function poe(k,v){var a=k.split(':'), id=Number(a[1]); if(a[0]==='cad'){var p=R.pac(id);if(!p)return;
      var ant=p.cad||'', h=p.cadHist||(p.cadHist=[]), ult=h[h.length-1];
      if(ant.trim()&&ant!==v&&(!ult||ult.em!==R.TODAY)&&(!ult||ult.t!==ant))h.push({em:R.TODAY,t:ant});
      p.cad=v}else{var s=R.sessById(id);if(s)s.obs=v}}
  function acha(nome){var n=nome.trim().toLowerCase(), l=R.dados().pac; return l.filter(function(p){return p.nome.toLowerCase()===n})[0]||l.filter(function(p){return p.nome.toLowerCase().split(' ')[0]===n})[0]||null}

  function inl(t){ t=escH(t);
    t=t.replace(/`([^`]+)`/g,'<code>$1</code>');
    t=t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>').replace(/(^|[\s(])_([^_\s][^_]*)_(?=[\s.,;:!?)]|$)/g,'$1<em>$2</em>');
    t=t.replace(/~~([^~]+)~~/g,'<del>$1</del>').replace(/==([^=]+)==/g,'<mark>$1</mark>');
    t=t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,function(_,a,b){var p=acha(a);return p?'<button class="cdn-wl" data-act="cdn-pac" data-id="'+p.id+'" title="Abrir a ficha de '+escH(p.nome)+'">'+(b||a)+'</button>':'<span class="cdn-wl novo" title="Nenhum paciente com esse nome">'+(b||a)+'</span>'});
    t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return t.replace(/(^|\s)#([A-Za-zÀ-ÿ][\wÀ-ÿ\/-]*)/g,'$1<span class="cdn-tag">#$2</span>') }
  var CALL={nota:'Nota',note:'Nota',dica:'Dica',tip:'Dica',aviso:'Atenção',warning:'Atenção',importante:'Importante',important:'Importante',pergunta:'Pergunta',question:'Pergunta'};
  /* markdown para HTML. ed=true deixa os quadradinhos de tarefa clicáveis */
  function md(src,ed){
    var L=String(src||'').replace(/\r/g,'').split('\n'), h='', i=0, tk=0, par=[];
    function fechaPar(){if(par.length){h+='<p>'+par.map(inl).join('<br>')+'</p>';par=[]}}
    while(i<L.length){ var l=L[i], m;
      if(/^```/.test(l)){fechaPar();var c=[];i++;while(i<L.length&&!/^```/.test(L[i])){c.push(L[i]);i++}i++;h+='<pre><code>'+escH(c.join('\n'))+'</code></pre>';continue}
      if((m=/^(#{1,6})\s+(.*)$/.exec(l))){fechaPar();var n=Math.min(m[1].length,4);h+='<p class="cdn-h cdn-h'+n+'" role="heading" aria-level="'+(n+2)+'">'+inl(m[2])+'</p>';i++;continue}
      if(/^\s*(---|\*\*\*|___)\s*$/.test(l)){fechaPar();h+='<hr>';i++;continue}
      if(/^>/.test(l)){fechaPar();var q=[];while(i<L.length&&/^>/.test(L[i])){q.push(L[i].replace(/^>\s?/,''));i++}
        var cm=/^\[!(\w+)\]\s*(.*)$/.exec(q[0]||'');
        if(cm){h+='<div class="cdn-call"><b>'+escH(cm[2]||CALL[cm[1].toLowerCase()]||cm[1])+'</b>'+q.slice(1).filter(function(x){return x.trim()}).map(function(x){return '<p>'+inl(x)+'</p>'}).join('')+'</div>'}
        else h+='<blockquote>'+q.map(inl).join('<br>')+'</blockquote>';
        continue}
      if((m=/^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(l))){fechaPar();var ord=/\d/.test(m[2]);h+=ord?'<ol>':'<ul>';
        while(i<L.length&&(m=/^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(L[i]))){ var rec=Math.min(3,Math.floor(m[1].replace(/\t/g,'  ').length/2)), t=/^\[( |x|X)\]\s+(.*)$/.exec(m[3]);
          if(t){var ok=t[1]!==' ';h+='<li class="tk'+(ok?' ok':'')+'" style="--rec:'+rec+'"><input type="checkbox" data-tk="'+(tk++)+'"'+(ok?' checked':'')+(ed?'':' disabled')+' aria-label="'+escH(t[2])+'"><span>'+inl(t[2])+'</span></li>'}
          else h+='<li style="--rec:'+rec+'">'+inl(m[3])+'</li>';
          i++}
        h+=ord?'</ol>':'</ul>';continue}
      if(!l.trim()){fechaPar();i++;continue}
      par.push(l);i++ }
    fechaPar(); return h }

  var DICA='Formatação (markdown): # no começo faz título, **assim** fica em negrito, - faz lista, - [ ] faz tarefa de marcar, [[nome do paciente]] vira atalho para a ficha. Ctrl+E troca entre ler e escrever.';
  /* o campo: k é a chave ("cad:9" ou "obs:304"), ph o texto de quando está vazio */
  function campo(k,ph){ var t=le(k), modo=MODO[k]||(t.trim()?'ler':'esc'); MODO[k]=modo;
    return '<div class="cdn" data-k="'+k+'" data-modo="'+modo+'"><div class="cdn-bar"><div class="seg cdn-seg" role="group" aria-label="Ler ou escrever"><button data-act="cdn-modo" data-v="ler" aria-pressed="'+(modo==='ler')+'">Ler</button><button data-act="cdn-modo" data-v="esc" aria-pressed="'+(modo==='esc')+'">Escrever</button></div><span class="cdn-salvo" hidden></span></div>'
      +'<div class="cdn-ler" tabindex="0" title="Dois cliques para escrever">'+(t.trim()?md(t,true):'<p class="cdn-vazio">'+escH(ph||'Nada escrito ainda.')+'</p>')+'</div>'
      +'<textarea class="cdn-esc" spellcheck="true" placeholder="'+escH(ph||'')+'" aria-label="'+escH(ph||'Caderno')+'">'+escH(t)+'</textarea><p class="cdn-dica">'+DICA+'</p></div>' }
  function troca(c,modo){ if(!c)return; var k=c.dataset.k, ta=c.querySelector('.cdn-esc'), t=le(k); MODO[k]=modo; c.dataset.modo=modo;
    Array.prototype.forEach.call(c.querySelectorAll('.cdn-seg button'),function(b){b.setAttribute('aria-pressed',String(b.dataset.v===modo))});
    if(modo==='ler')c.querySelector('.cdn-ler').innerHTML=t.trim()?md(t,true):'<p class="cdn-vazio">'+escH(ta.placeholder||'Nada escrito ainda.')+'</p>';
    else{ta.value=t;ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)} }
  function salvo(c){var e=c.querySelector('.cdn-salvo'), a=new Date(); if(e){e.textContent='Salvo às '+R.pad(a.getHours())+':'+R.pad(a.getMinutes());e.hidden=false}}

  /* a aba Caderno da ficha: o caderno do paciente e, embaixo, as notas de cada sessão */
  function ficha(p){
    var ss=R.dados().sess.filter(function(s){return s.pid===p.id&&s.obs&&s.obs.trim()}).sort(function(a,b){return a.date<b.date?1:-1});
    var H=p.cadHist||[];
    var h='<div class="panel cdn-ficha"><h3>Caderno de '+escH(p.nome.split(' ')[0])+'<small>Registro documental: sigiloso, guardado junto com o prontuário e pelo mesmo prazo. Não entra no prontuário que o paciente pode pedir. Nada escrito aqui se perde: o texto de cada dia fica guardado.</small></h3>'+campo('cad:'+p.id,'Hipóteses, lembretes, o que observar nas próximas sessões.')
      +(H.length?'<details class="cdn-hist"><summary>Versões guardadas ('+H.length+')</summary>'+H.slice().reverse().map(function(x){return '<section class="cdn-sess"><h4>Até '+R.dmy(x.em)+'</h4><div class="cdn-ler">'+md(x.t,false)+'</div></section>'}).join('')+'</details>':'')+'</div>';
    if(ss.length)h+='<div class="panel cdn-ficha"><h3>Anotações de cada sessão<small>Escritas durante o atendimento.</small></h3>'+ss.map(function(s){return '<section class="cdn-sess"><h4>'+R.cap(R.longDate(s.date))+'</h4><div class="cdn-ler">'+md(s.obs,false)+'</div></section>'}).join('')+'</div>';
    return h }

  R.ACT['cdn-modo']=function(b){troca(b.closest('.cdn'),b.dataset.v)};
  R.ACT['cdn-pac']=function(b){var id=Number(b.dataset.id); if(window.RastroSessao&&document.getElementById('ss'))window.RastroSessao.sai(); R.UI.pid=id; R.UI.ptab='resumo'; R.go('app-pacientes',true)};
  var T=null;
  document.addEventListener('input',function(ev){var t=ev.target; if(!t.classList||!t.classList.contains('cdn-esc'))return; var c=t.closest('.cdn'); poe(c.dataset.k,t.value); clearTimeout(T); T=setTimeout(function(){R.guarda();salvo(c)},500)});
  document.addEventListener('change',function(ev){var t=ev.target; if(!t.dataset||t.dataset.tk==null)return; var c=t.closest('.cdn'); if(!c)return;
    var n=Number(t.dataset.tk), k=c.dataset.k, i=-1, novo=le(k).replace(/^(\s*(?:[-*+]|\d+[.)])\s+\[)( |x|X)(\])/gm,function(tudo,a,x,z){i++;return i===n?a+(x===' '?'x':' ')+z:tudo});
    poe(k,novo); R.guarda(); troca(c,'ler'); salvo(c)});
  document.addEventListener('dblclick',function(ev){var l=ev.target.closest&&ev.target.closest('.cdn > .cdn-ler'); if(l&&!ev.target.closest('a,button,input'))troca(l.parentNode,'esc')});
  document.addEventListener('keydown',function(ev){ if(!(ev.ctrlKey||ev.metaKey)||ev.key.toLowerCase()!=='e')return; var c=ev.target.closest&&ev.target.closest('.cdn'); if(!c)return; ev.preventDefault(); troca(c,c.dataset.modo==='ler'?'esc':'ler'); if(c.dataset.modo==='ler')c.querySelector('.cdn-ler').focus()});
  window.RastroCaderno={md:md,campo:campo,ficha:ficha};
  R.render(); /* o app desenha antes deste arquivo chegar: redesenha */
})();

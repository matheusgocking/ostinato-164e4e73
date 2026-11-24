/* Busca única (18/11/2026): Ctrl+K, o botão Buscar do menu ou a lupa no celular abrem uma caixa que acha
   qualquer paciente ou tela. Setas escolhem, Enter abre, Esc fecha. Só dentro do app (a demonstração).
   Lê a ponte window.Rastro; não guarda nada. Modelo: a busca por comando de Linear e Twenty, reduzida a
   duas coisas (ir para uma tela, abrir um paciente). */
(function(){
  var R=window.Rastro, UI=R.UI, ACT=R.ACT, go=R.go, escH=R.escH;
  var TELAS=[['app-hoje','Início'],['app-agenda','Agenda'],['app-pacientes','Pacientes'],['app-prontuario','Prontuário'],['app-financeiro','Financeiro']];
  var el=null, itens=[], ix=0, antes=null;
  function semAcento(t){return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
  function noApp(){return /^app-/.test(UI.route||'')}
  function lista(q){ q=semAcento(q).trim(); var S=R.dados(), out=[];
    S.pac.slice().sort(function(a,b){return a.ativo===b.ativo?a.nome.localeCompare(b.nome):(a.ativo?-1:1)}).forEach(function(p){
      if(!q||semAcento(p.nome).indexOf(q)>=0)out.push({k:'p',p:p}) });
    var t=TELAS.filter(function(x){return !q||semAcento(x[1]).indexOf(q)>=0}).map(function(x){return {k:'t',r:x[0],n:x[1]}});
    /* sem texto digitado, as telas vêm primeiro e só os pacientes em atendimento aparecem */
    return q?out.concat(t):t.concat(out.filter(function(x){return x.p.ativo})) }
  function linhaH(x,i){ var sel=i===ix?' aria-selected="true"':'';
    if(x.k==='t')return '<button class="bq-l" role="option" data-bq="'+i+'"'+sel+'><span class="bq-t"></span><b>'+escH(x.n)+'</b><span>tela</span></button>';
    var foto=window.RastroPacientes&&window.RastroPacientes.fotos?'<span class="pav bq-av">'+window.RastroPacientes.fotos(x.p)+'</span>':'<span class="bq-t"></span>';
    return '<button class="bq-l" role="option" data-bq="'+i+'"'+sel+'>'+foto+'<b>'+escH(x.p.nome)+'</b><span>'+(x.p.ativo?'paciente':'encerrado')+'</span></button>' }
  function desenha(){ var q=el.querySelector('input').value; itens=lista(q); if(ix>=itens.length)ix=Math.max(0,itens.length-1);
    el.querySelector('.bq-r').innerHTML=itens.length?itens.map(linhaH).join(''):'<p class="bq-vazio">Nenhum paciente ou tela com “'+escH(q)+'”.</p>';
    var s=el.querySelector('[aria-selected="true"]'); if(s&&s.scrollIntoView)s.scrollIntoView({block:'nearest'}) }
  function abre(){ if(el||!noApp())return; antes=document.activeElement; ix=0;
    el=document.createElement('div'); el.id='busca';
    el.innerHTML='<div class="bq" role="dialog" aria-modal="true" aria-label="Buscar paciente ou tela"><input type="search" placeholder="Nome do paciente ou da tela" aria-label="Buscar" autocomplete="off" spellcheck="false"><div class="bq-r" role="listbox"></div><p class="bq-p">Setas escolhem, Enter abre, Esc fecha.</p></div>';
    document.body.appendChild(el); desenha(); el.querySelector('input').focus() }
  function fecha(){ if(!el)return; el.remove(); el=null; if(antes&&antes.focus&&document.contains(antes))antes.focus() }
  function escolhe(i){ var x=itens[i]; if(!x)return; fecha();
    if(x.k==='t')go(x.r); else ACT.pac({dataset:{id:String(x.p.id)}}) }
  ACT.busca=function(){abre()};
  document.addEventListener('keydown',function(ev){
    if((ev.ctrlKey||ev.metaKey)&&!ev.shiftKey&&!ev.altKey&&(ev.key==='k'||ev.key==='K')){ if(!noApp())return; ev.preventDefault(); if(el)fecha(); else abre(); return }
    if(!el)return;
    if(ev.key==='Escape'){ev.stopPropagation();fecha()}
    else if(ev.key==='ArrowDown'){ev.preventDefault();ix=Math.min(itens.length-1,ix+1);desenha()}
    else if(ev.key==='ArrowUp'){ev.preventDefault();ix=Math.max(0,ix-1);desenha()}
    else if(ev.key==='Enter'){ev.preventDefault();escolhe(ix)}
  },true);
  document.addEventListener('input',function(ev){ if(el&&el.contains(ev.target)){ix=0;desenha()} });
  document.addEventListener('click',function(ev){ if(!el)return;
    var b=ev.target.closest&&ev.target.closest('[data-bq]'); if(b){escolhe(Number(b.dataset.bq));return}
    if(ev.target===el)fecha() });
})();

/* App e site do Rastro (vieram da versão 14, enquadre.html). */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var escH=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var pad=function(n){return String(n).padStart(2,'0')};
var iso=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
var parse=function(s){var a=s.split('-').map(Number);return new Date(a[0],a[1]-1,a[2])};
var addDays=function(d,n){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x};
var monday=function(d){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());return addDays(x,-((x.getDay()+6)%7))};
var NOW=new Date(), TODAY=iso(NOW);
var DOW=['dom','seg','ter','qua','qui','sex','sáb'];
var DOWL=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
var MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var cap=function(s){return s.charAt(0).toUpperCase()+s.slice(1)};
var brl=function(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})};
var dm=function(s){var d=parse(s);return pad(d.getDate())+'/'+pad(d.getMonth()+1)};
var dmy=function(s){return dm(s)+'/'+parse(s).getFullYear()};
var longDate=function(s){var d=parse(s);return DOWL[d.getDay()]+', '+d.getDate()+' de '+MES[d.getMonth()]};
var quando=function(s){if(s===TODAY)return 'hoje';if(s===iso(addDays(NOW,1)))return 'amanhã';return DOWL[parse(s).getDay()]+', '+dm(s)};
var plural=function(n,a,b){return n+' '+(n===1?a:b)};
var STATUS={agendada:'Agendada',confirmada:'Confirmada',realizada:'Realizada',falta:'Falta',cancelada:'Cancelada'};
var H0=7,H1=20,ROW=52,HOURS=[];for(var hh=H0;hh<=H1;hh++)HOURS.push(hh);
var KEY='rastro-demo-v6'; /* v5: exemplos só de terapia individual e um casal (14/11/2026) */
/* Meus dados (23/11/2026, pedido de Matheus): os pacientes, sessões, pagamentos, compromissos e registros aprovados
   dele, copiados do Controle Único pelo Importação/ostinato-do-controle-unico.js. Ficam só neste navegador, em chave
   própria, e não recomeçam toda semana como o exemplo. A cópia é de mão única: nada volta para o Controle Único. */
var KEY_MEUS='ostinato-meus-dados-v1', MODO=(function(){try{return localStorage.getItem('ostinato-modo')==='meus'?'meus':'exemplo'}catch(e){return 'exemplo'}})();
function KEYD(){return MODO==='meus'?KEY_MEUS:KEY}
var UNDO=[],MARKED=false;
var GEN={1:'F',2:'M',3:'C',4:'M',5:'F',6:'M',7:'F',8:'M'};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- dados de exemplo ---------- */
var NOTAS=[
 'Revisão da semana e da tarefa combinada. Registro de pensamentos em situações de trabalho.\nPlano: manter o registro e trazer dois exemplos.',
 'Semana mais estável. Retomamos a lista de atividades e ajustamos a meta de sono.\nPlano: manter o horário de dormir e anotar as noites difíceis.',
 'Sessão sobre um conflito recente. Ensaio da conversa difícil e resolução de problemas em etapas.\nPlano: testar a conversa e observar o que acontece.',
 'Psicoeducação sobre ansiedade e respiração. Montamos a hierarquia para exposição gradual.\nPlano: primeiro item da hierarquia, três vezes na semana.'
];
function seed(){
  var P=[
   {id:1,nome:'Helena Prado',tipo:'Individual',valor:180,dow:1,hora:'09:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'F'},
   {id:2,nome:'Caio Menezes',tipo:'Individual',valor:180,dow:1,hora:'14:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'M'},
   {id:3,nome:'Lívia e Otávio Ramos',tipo:'Casal',valor:260,dow:2,hora:'19:00',freq:14,mod:'Online',ativo:true,resp:'Lívia Ramos e Otávio Ramos, atendidos juntos.'},
   {id:4,nome:'Gustavo Lemos',tipo:'Individual',valor:180,dow:3,hora:'16:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'M'},
   {id:5,nome:'Marina Tavares',tipo:'Individual',valor:200,dow:3,hora:'10:00',freq:7,mod:'Presencial',ativo:true,resp:'',genero:'F'},
   {id:6,nome:'Rui Castanho',tipo:'Individual',valor:180,dow:4,hora:'18:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'M'},
   {id:7,nome:'Sofia Lacerda',tipo:'Individual',valor:180,dow:5,hora:'11:00',freq:14,mod:'Online',ativo:true,resp:'',genero:'F'},
   {id:8,nome:'Tomás Vidal',tipo:'Individual',valor:180,dow:2,hora:'08:00',freq:7,mod:'Online',ativo:false,resp:'',genero:'M'},
   {id:9,nome:'Isabela Nunes',tipo:'Individual',valor:200,dow:4,hora:'10:00',freq:7,mod:'Presencial',ativo:true,resp:'',genero:'F',ok:1},
   {id:10,nome:'Davi Moreira',tipo:'Individual',valor:180,dow:4,hora:'14:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'M',ini:8},
   {id:11,nome:'Beatriz Couto',tipo:'Individual',valor:180,dow:4,hora:'16:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'F',ok:1,ini:14},
   {id:12,nome:'Paulo Brandão',tipo:'Individual',valor:180,dow:2,hora:'09:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'M',ok:1,ini:4},
   {id:13,nome:'Elisa Fontes',tipo:'Individual',valor:180,dow:5,hora:'10:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'F',ok:1,ini:18},
   {id:14,nome:'Ricardo Alves',tipo:'Individual',valor:200,dow:5,hora:'16:00',freq:7,mod:'Presencial',ativo:true,resp:'',genero:'M',ok:1,ini:20},
   {id:15,nome:'Joana Sampaio',tipo:'Individual',valor:180,dow:1,hora:'17:00',freq:7,mod:'Online',ativo:true,resp:'',genero:'F',ok:1,ini:10},
   {id:16,nome:'Nuno Pacheco',tipo:'Individual',valor:180,dow:3,hora:'14:00',freq:14,mod:'Online',ativo:true,resp:'',genero:'M',ok:1,ini:6}
  ];
  var start=addDays(monday(NOW),-182), sess=[], sid=1, lim14=iso(addDays(NOW,-14)), soon=iso(addDays(NOW,2));
  for(var w=0;w<31;w++){ P.forEach(function(p){
    if(p.freq===14&&w%2)return; if(!p.ativo&&w>22)return; if(p.ini&&w<p.ini)return;
    var d=iso(addDays(start,w*7+p.dow-1));
    if(p.id===7&&d>=TODAY)return;
    var s={id:sid++,pid:p.id,date:d,hora:p.hora,valor:p.valor,status:'agendada',cobrar:false,pago:false,forma:'',nota:'',recibo:false};
    if(!p.ok&&d<TODAY&&d>=iso(addDays(NOW,-6))&&p.id%3===0){sess.push(s);return}
    if(d<TODAY){
      if((p.id*7+w)%11===0){s.status='falta';s.cobrar=p.id%2===1}else s.status='realizada';
      if(s.status==='realizada'||s.cobrar){ s.pago = d<lim14 ? (p.id+w)%13!==0 : (p.id+w)%2===0; if(s.pago){s.forma='Pix';s.recibo=d<lim14} }
      var recente=d>=iso(addDays(NOW,-6));
      if(s.status==='realizada'){ if(!(recente&&p.id%2===0)) s.nota=NOTAS[(p.id+w)%4]; }
      else if(!recente) s.nota=capF(suj(p))+' não compareceu à sessão no horário previamente acordado e não apresentou justificativa prévia ao psicólogo.';
      if(p.ok){ if(!s.nota)s.nota=s.status==='falta'?capF(suj(p))+' não compareceu à sessão no horário previamente acordado e não apresentou justificativa prévia ao psicólogo.':NOTAS[(p.id+w)%4]; if(s.status==='realizada'||s.cobrar){s.pago=true;s.forma='Pix';s.recibo=d<lim14} }
    } else if(d===TODAY){
      if(minOf(p.hora)+50<=nowMin()){ s.status='realizada'; if(p.id%2)s.nota=NOTAS[(p.id+w)%4]; if(p.id%3===0){s.pago=true;s.forma='Pix'} }
      else s.status=p.id%4===2?'agendada':'confirmada'; }
    else if(d<=soon&&p.id%2===1) s.status='confirmada';
    sess.push(s);
  })}
  var desp=[], did=1;
  for(var m=5;m>=0;m--){ var b=new Date(NOW.getFullYear(),NOW.getMonth()-m,1);
    [[5,'Plataforma de vídeo.','Ferramentas',59.9],[12,'Supervisão clínica.','Formação',300],[20,'Contabilidade.','Serviços',150]].forEach(function(x){
      var d=iso(new Date(b.getFullYear(),b.getMonth(),x[0])); if(d<=TODAY) desp.push({id:did++,date:d,desc:x[1],cat:x[2],valor:x[3]}); }); }
  var mo=monday(NOW);
  var comp=[{id:1,tit:'Supervisão clínica',date:iso(addDays(mo,-26)),ini:'12:00',fim:'13:00',rep:'semana',onde:'Online',nota:'',ex:{}},
   {id:2,tit:'Curso de formação',date:iso(addDays(mo,3)),ini:'17:30',fim:'19:00',rep:'nao',onde:'Online',nota:'Módulo de entrevista motivacional.',ex:{}},
   {id:3,tit:'Grupo de estudos',date:iso(addDays(mo,1)),ini:'20:00',fim:'21:00',rep:'mes',onde:'Online',nota:'',ex:{}}];
  var cfg={ini:8,fim:20,dias:[1,2,3,4,5],disp:{'2-10':1,'2-11':1,'4-14':1,'4-15':1,'5-15':1}};
  return {week:iso(monday(NOW)),pac:P,sess:sess,desp:desp,comp:comp,cfg:cfg,nextS:sid,nextP:17,nextD:did,nextC:4};
}
var S;
/* 23/11/2026: aberto pelo link fixo (file:///C:/Sites/Rastro/), o index.html carrega C:\Sites\Rastro-dados\ostinato-dados.js,
   gerado por Importação/ostinato-prontuarios-word.py (Controle Único + texto dos prontuários em Word). Arquivo mais novo
   que o guardado entra sozinho, sem escolher arquivo; o mesmo arquivo de novo não apaga o que ele mudou aqui. */
function meusDoArquivo(){ var F=window.OSTINATO_DADOS; if(!F||F.fonte!=='controle-unico')return;
  try{ var cur=JSON.parse(localStorage.getItem(KEY_MEUS)||'null'); if(!cur||!cur.meus||cur.meus.em!==F.em){ usarMeusDados(F); MODO='meus' } }catch(e){} }
function load(){ meusDoArquivo(); if(MODO==='meus'){ try{ var m=JSON.parse(localStorage.getItem(KEY_MEUS)); if(m&&m.pac&&m.sess){ m.week=iso(monday(NOW)); return m } }catch(e){} MODO='exemplo'; } try{ var r=JSON.parse(localStorage.getItem(KEY)); if(r&&r.week===iso(monday(NOW))&&r.pac&&r.sess) return r; }catch(e){} return seed(); }
function save(){ if(!MARKED)UNDO.length=0; MARKED=false; try{ localStorage.setItem(KEYD(),JSON.stringify(S)); }catch(e){} }
S=load();

var pac=function(id){return S.pac.find(function(p){return p.id===id})};
var sessById=function(id){return S.sess.find(function(s){return s.id===id})};
var sessOn=function(d){return S.sess.filter(function(s){return s.date===d}).sort(function(a,b){return a.hora<b.hora?-1:1})};
var due=function(s){return !s.cortesia&&(s.status==='realizada'||(s.status==='falta'&&s.cobrar))?s.valor:0};
var recState=function(s){return s.pago?'recebido':(s.date<iso(addDays(NOW,-7))?'atraso':'receber')};
var saldo=function(pid){return S.sess.reduce(function(t,s){return t+(s.pid===pid&&!s.pago?due(s):0)},0)};
var semNota=function(){return S.sess.filter(function(s){return s.status==='realizada'&&!s.nota}).sort(function(a,b){return a.date<b.date?1:-1})};
var proxima=function(pid){return S.sess.filter(function(s){return s.pid===pid&&s.date>=TODAY&&(s.status==='agendada'||s.status==='confirmada')}).sort(function(a,b){return a.date<b.date?-1:(a.date>b.date?1:(a.hora<b.hora?-1:1))})[0]};
var semProx=function(){return S.pac.filter(function(p){return p.ativo&&!proxima(p.id)})};
var primeiro=function(p){return p.tipo==='Casal'?'':p.nome.split(' ')[0]};
var lembrete=function(s){var p=pac(s.pid),n=primeiro(p);return 'Olá'+(n?', '+n:'')+'! Lembrete da nossa sessão '+quando(s.date)+', às '+s.hora+'. Pode confirmar?'};
var convite=function(p){var n=primeiro(p);return 'Olá'+(n?', '+n:'')+'! Ainda não marcamos a próxima sessão. Tenho horário na '+DOWL[p.dow%7]+' às '+p.hora+'. Fica bom para você?'};
var reciboTxt=function(s){var p=pac(s.pid);return 'Recibo\n\nRecebi de '+p.nome+' a quantia de '+brl(s.valor)+', referente a sessão de psicoterapia em '+dmy(s.date)+'.\n\nPsicóloga de exemplo, CRP 00/00000.'};

/* ---------- agenda: regras ----------
   A sessão só conta como feita quando é confirmada ("Aconteceu"); a que passou da hora sem marca fica "a confirmar". */
var DUR=50;
function minOf(h){var a=String(h).split(':');return Number(a[0])*60+Number(a[1]||0)}
function hOf(m){return pad(Math.floor(m/60))+':'+pad(m%60)}
/* ---------- aniversários (19/11/2026) ----------
   p.nasc é a data de nascimento (aaaa-mm-dd); no casal, p.nasc2 é a da segunda pessoa.
   Os pacientes do exemplo não têm data: ganham uma inventada, fixa durante a semana, para a tela ter o que mostrar.
   Só entram pacientes em atendimento. Aparecem: chapeuzinho no dia da agenda, aviso na tela Hoje a partir de
   7 dias antes e a lista de aniversariantes do mês (Hoje e agenda do mês). */
var NIVER_DEMO={9:5,2:9,13:-10,5:1,11:16,3:22};
function nascDe(p){ if(p.nasc!==undefined)return p.nasc||''; var off=NIVER_DEMO[p.id], d=off!==undefined?addDays(monday(NOW),off):new Date(2001,(p.id*5)%12,1+(p.id*11)%27);
  return (1975+(p.id*7)%28)+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()) }
function niverTodos(){var o=[];S.pac.forEach(function(p){if(!p.ativo)return;var n=nascDe(p);
  if(p.tipo==='Casal'){var a=p.nome.split(' e ');if(n)o.push({p:p,q:a[0].split(' ')[0]+' ('+p.nome+')',d:n});if(p.nasc2)o.push({p:p,q:(a[1]||'').split(' ')[0]+' ('+p.nome+')',d:p.nasc2})}
  else if(n)o.push({p:p,q:p.nome,d:n})});return o}
function niverNo(d){var md=d.slice(5);return niverTodos().filter(function(x){return x.d.slice(5)===md})}
function niverProx(n){var o=[];niverTodos().forEach(function(x){for(var i=0;i<=n;i++){var d=iso(addDays(NOW,i));if(d.slice(5)===x.d.slice(5)){o.push({p:x.p,q:x.q,d:x.d,em:i,dia:d,idade:Number(d.slice(0,4))-Number(x.d.slice(0,4))});break}}});return o.sort(function(a,b){return a.em-b.em})}
function niverMes(ym){return niverTodos().filter(function(x){return x.d.slice(5,7)===ym.slice(5,7)}).map(function(x){return {p:x.p,q:x.q,d:x.d,dia:ym+'-'+x.d.slice(8),idade:Number(ym.slice(0,4))-Number(x.d.slice(0,4))}}).sort(function(a,b){return a.dia<b.dia?-1:1})}
var CHAPEU='<svg class="chapeu" viewBox="0 0 20 20" aria-hidden="true"><g transform="rotate(-14 10 10)"><path d="M10 4 3.6 16.4c2 1.5 10.8 1.5 12.8 0z" fill="currentColor"/><path d="M7.9 8.2l5.4 2.6M6.3 11.3l8.2 3.6" stroke="#F3C84B" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="10" cy="3" r="2.2" fill="#F3C84B"/></g></svg>';
function niverSel(d){var l=niverNo(d);return l.length?'<span class="nv" title="Aniversário de '+escH(l.map(function(x){return x.q}).join(' e '))+'">'+CHAPEU+'</span>':''}
function niverMesH(ym){var l=niverMes(ym), nome=MES[Number(ym.slice(5,7))-1]; if(!l.length)return '<p class="nv-vazio">Nenhum aniversariante em '+nome+'. A data de nascimento fica na ficha do paciente.</p>';
  return '<ul class="nv-lista">'+l.map(function(x){return '<li><b>'+Number(x.dia.slice(8))+'</b><button class="nv-q" data-act="pac" data-id="'+x.p.id+'">'+escH(x.q)+'</button><span>'+DOW[parse(x.dia).getDay()]+', faz '+x.idade+' anos'+(x.dia<TODAY?', já passou':x.dia===TODAY?', é hoje':'')+'</span></li>'}).join('')+'</ul>'}
function idadeDe(n){if(!n)return '';var a=Number(TODAY.slice(0,4))-Number(n.slice(0,4));if(TODAY.slice(5)<n.slice(5))a--;return a}
function nascKv(p){var um=function(k,rot,v){return '<dt>'+rot+'</dt><dd><input type="date" class="nasc-in" data-nasc="'+k+'" value="'+escH(v||'')+'" aria-label="'+rot+'">'+(v?'<small>'+idadeDe(v)+' anos</small>':'')+'</dd>'};
  if(p.tipo==='Casal'){var a=p.nome.split(' e ');return um('nasc','Nascimento de '+escH(a[0].split(' ')[0]),nascDe(p))+um('nasc2','Nascimento de '+escH((a[1]||'').split(' ')[0]),p.nasc2)}
  return um('nasc','Nascimento',nascDe(p))}
document.addEventListener('change',function(ev){var t=ev.target;if(!t.dataset||!t.dataset.nasc||!UI.pid)return;var p=pac(UI.pid);if(!p)return;mark();p[t.dataset.nasc]=t.value;save();render();toastU('Data de nascimento guardada.')});
function nowMin(){var n=new Date();return n.getHours()*60+n.getMinutes()}
function passou(s){return s.date<TODAY||(s.date===TODAY&&minOf(s.hora)+DUR<=nowMin())}
function estado(s){return (s.status==='agendada'||s.status==='confirmada')&&passou(s)?'aconf':s.status}
var EST={agendada:'Agendada',confirmada:'Confirmou',aconf:'A confirmar',realizada:'Realizada',falta:'Falta',cancelada:'Não haverá'};
function curto(p){if(p.tipo==='Casal')return p.nome.replace(/\s+\S+$/,'');var w=p.nome.split(' ');return w.length>1?w[0]+' '+w[w.length-1]:w[0]}
function deveN(s){var fut=!(s.status==='realizada'||s.status==='falta');
  return S.sess.filter(function(x){return x.pid===s.pid&&due(x)&&!x.pago&&(fut||x.date<s.date||(x.date===s.date&&x.hora<=s.hora))}).length}
function saldoSpan(s,full){var n=deveN(s);return n?'<span class="c-bad">'+(full?'Deve '+plural(n,'sessão','sessões'):'deve '+n)+'</span>':'<span class="c-ok">'+(full?'Em dia':'em dia')+'</span>'}
/* saldo do paciente no card da agenda, embaixo das bolinhas (como na grade do Controle Único) */
function saldoCard(s){var n=deveN(s);return n?'<em>deve '+n+'</em>':'<span class="ok">em dia</span>'}
function subSess(s,e){
  if(e==='aconf')return 'a confirmar'; if(e==='falta')return s.cobrar?'falta cobrada':'falta'; if(e==='cancelada')return 'não haverá';
  if(s.cortesia)return 'cortesia';
  return (s.de?'veio de '+dm(s.de.date)+'. ':s.extra?'encaixe. ':'')+saldoSpan(s);
}
function conflito(d,h,except){var m=minOf(h);return S.sess.find(function(x){return x.id!==except&&x.date===d&&x.status!=='cancelada'&&minOf(x.hora)<m+DUR&&minOf(x.hora)+DUR>m})}
function remarcar(s,d,hr,fixo){mark();var p=pac(s.pid),nome=curto(p);
  if(fixo){var delta=Math.round((parse(d)-parse(s.date))/864e5),from=s.date;
    S.sess.forEach(function(x){if(x.pid===p.id&&x!==s&&x.date>from&&(x.status==='agendada'||x.status==='confirmada')&&!x.de&&!x.extra){x.date=iso(addDays(parse(x.date),delta));x.hora=hr}});
    s.date=d;s.hora=hr;delete s.de;delete s.extra;p.dow=parse(d).getDay();p.hora=hr;
    return 'Novo horário fixo de '+nome+': '+DOWL[p.dow]+', '+hr+'. As próximas sessões foram junto.'}
  if(!s.de)s.de={date:s.date,hora:s.hora};s.date=d;s.hora=hr;if(s.de.date===d&&s.de.hora===hr)delete s.de;if(s.status==='confirmada')s.status='agendada';
  return 'A sessão de '+nome+' passou para '+DOWL[parse(d).getDay()]+', '+dm(d)+', '+hr+'.'}
/* horário de atendimento e horários oferecidos a novos pacientes (valem toda semana) */
function CFG(){if(!S.cfg)S.cfg={ini:8,fim:20,dias:[1,2,3,4,5],disp:{}};return S.cfg}
function noExp(d,x){var c=CFG();return c.dias.indexOf(parse(d).getDay())>=0&&x>=c.ini&&x<c.fim}
function isDisp(d,x){return !!CFG().disp[parse(d).getDay()+'-'+x]}
/* compromissos: não entram em nenhuma conta. Uma vez mudada ou desmarcada fica em ex, pela data original. */
function compById(id){return (S.comp||[]).find(function(c){return c.id===id})}
function ocorre(c,d){if(d<c.date)return false;if(c.rep==='semana')return parse(d).getDay()===parse(c.date).getDay();if(c.rep==='mes')return parse(d).getDate()===parse(c.date).getDate();return d===c.date}
function compsOn(d){var out=[];(S.comp||[]).forEach(function(c){var ex=c.ex||{};
  if(ocorre(c,d)&&!ex[d])out.push({c:c,orig:d,date:d,ini:c.ini,fim:c.fim});
  Object.keys(ex).forEach(function(k){var e=ex[k];if(e&&e!=='x'&&e.date===d)out.push({c:c,orig:k,date:d,ini:e.ini,fim:e.fim,mov:true})})});
  return out.sort(function(a,b){return a.ini<b.ini?-1:1})}
function compOcc(c,orig){var e=(c.ex||{})[orig];if(e==='x')return null;if(e)return {c:c,orig:orig,date:e.date,ini:e.ini,fim:e.fim,mov:true};return ocorre(c,orig)?{c:c,orig:orig,date:orig,ini:c.ini,fim:c.fim}:null}
function moveComp(c,orig,d,ini,fim,so){
  if(c.rep==='nao'){c.date=d;c.ini=ini;c.fim=fim;return}
  if(so){c.ex=c.ex||{};if(d===orig&&ini===c.ini&&fim===c.fim)delete c.ex[orig];else c.ex[orig]={date:d,ini:ini,fim:fim};return}
  var delta=Math.round((parse(d)-parse(orig))/864e5);c.date=iso(addDays(parse(c.date),delta));c.ini=ini;c.fim=fim}
/* feriados nacionais e do Espírito Santo: a mesma lista conferida do Controle Único (Decreto estadual 124-S,
   de 22/01/2026, página do DER-ES). Os de data fixa valem todo ano; Paixão de Cristo e Nossa Senhora da Penha
   andam com a Páscoa, que é calculada. Sem municipais e sem ponto facultativo. */
var FER_FIXOS={'01-01':'Confraternização Universal','04-21':'Tiradentes','05-01':'Dia do Trabalho','09-07':'Independência do Brasil','10-12':'Nossa Senhora Aparecida','11-02':'Finados','11-15':'Proclamação da República','11-20':'Consciência Negra','12-25':'Natal'};
var FERC={};
function pascoa(ano){var a=ano%19,b=Math.floor(ano/100),c=ano%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;return new Date(ano,Math.floor(n/31)-1,(n%31)+1)}
function feriados(ano){if(FERC[ano])return FERC[ano];var l={};Object.keys(FER_FIXOS).forEach(function(md){l[ano+'-'+md]=FER_FIXOS[md]});var p=pascoa(ano);l[iso(addDays(p,-2))]='Paixão de Cristo';l[iso(addDays(p,8))]='Nossa Senhora da Penha (ES)';return FERC[ano]=l}
function feriado(d){return feriados(Number(d.slice(0,4)))[d]||''}
/* desfazer: até 60 passos; qualquer mudança feita fora da agenda (prontuário, cadastro) zera a lista */
function mark(){UNDO.push(JSON.stringify(S));if(UNDO.length>60)UNDO.shift();MARKED=true}
function desfazer(){var cur=JSON.stringify(S);while(UNDO.length&&UNDO[UNDO.length-1]===cur)UNDO.pop();if(!UNDO.length){toast('Nada para desfazer.');return}
  S=JSON.parse(UNDO.pop());MARKED=true;save();UI.modal=null;renderModal();popClose();render();toast('Desfeito.')}
function toastU(msg){var e=$('#toast');e.innerHTML=escH(msg)+' <button data-act="undo">Desfazer</button>';e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},6000)}
function changedU(msg){save();render();renderModal();if(msg)toastU(msg)}

/* ---------- estado ---------- */
var SITE=['inicio','agenda','prontuario','financeiro','formas','precos'];
var APP=['app-hoje','app-agenda','app-pacientes','app-prontuario','app-financeiro','app-config'];
var UI={route:'inicio',agMode:'semana',agRef:TODAY,agDay:TODAY,pid:null,ptab:'resumo',pfil:'ativos',finRef:TODAY.slice(0,7),finFil:'tudo',modal:null,confirmReset:false,confirmDesp:null,confirmEnc:false,
  wk:2,wkTimer:null,dg:null,prModel:'tcc',prVals:null};

function toast(t){var e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2400)}
function copy(t,ok){ var fail=function(){toast('Não deu para copiar. Selecione o texto e copie à mão.')};
  try{ navigator.clipboard.writeText(t).then(function(){toast(ok||'Copiado.')},fail); }catch(e){fail()} }

/* ---------- site: semana no consultório ---------- */
var WK=[
 {d:'Marcada',s:'Toda semana ou a cada 15 dias, pelo contrato do paciente.',t:'Marcada uma vez.',p:'O horário do contrato entra na agenda sozinho, toda semana ou a cada 15 dias.',m:function(r){return '<div class="mock"><div class="r"><b>09:00</b><span>Helena Prado<small>Terça. Online. Toda semana.</small></span>'+r+'</div><div class="r"><b></b><span>Próximas<small>17/11, 24/11 e 01/12, no mesmo horário.</small></span><span></span></div></div>'}},
 {d:'Confirmada',s:'O lembrete sai com nome, dia e hora já no texto.',t:'Confirmou pelo lembrete.',p:'O texto sai pronto da sessão marcada. Você copia e manda.',m:function(r){return '<div class="mock"><div class="r"><b>09:00</b><span>Helena Prado<small>Confirmada.</small></span>'+r+'</div><div class="note">Olá, Helena! Lembrete da nossa sessão amanhã, às 09:00. Pode confirmar?</div></div>'}},
 {d:'Realizada',s:'Atendida, falta cobrada ou remarcada, em um toque.',t:'Sessão realizada.',p:'Um toque marca a sessão. O valor entra a receber e o registro fica esperando.',m:function(r){return '<div class="mock"><div class="r"><b>09:00</b><span>Helena Prado<small>Falta registrar e receber.</small></span>'+r+'</div><div class="r"><b></b><span>A receber<small>Entrou no financeiro pela data da sessão.</small></span><span class="tag num">R$ 180,00</span></div></div>'}},
 {d:'Registrada',s:'A evolução abre escrita no seu modelo. Você completa e aprova.',t:'Registro aprovado.',p:'A sessão já abre escrita no seu modelo. Você preenche o que está em vermelho e aprova.',m:function(r){return '<div class="mock"><div class="r"><b>09:00</b><span>Helena Prado<small>Falta receber.</small></span>'+r+'</div><div class="note">No início do atendimento, a paciente relatou os acontecimentos desde o último encontro, incluindo a reunião de quinta. Durante o atendimento, foi trabalhado o medo de falar em reuniões, com o objetivo de reduzir a evitação. Como atividade para a próxima semana, ficou acordado que a paciente falará primeiro na reunião de segunda.</div></div>'}},
 {d:'Paga',s:'Recibo e declaração para reembolso saem da mesma sessão.',t:'Pix recebido, recibo pronto.',p:'O saldo da paciente zera, e o recibo sai com o valor e a data.',m:function(r){return '<div class="mock"><div class="r"><b>09:00</b><span>Helena Prado<small>Completa.</small></span>'+r+'</div><div class="note">Recebi de Helena Prado a quantia de R$ 180,00, referente a sessão de psicoterapia de terça-feira.</div></div>'}}
];
function renderWk(){
  /* 18/11/2026: a abertura mostra a linha do dia da tela Hoje (js/hoje.js) no lugar dos cinco passos, que ficam abaixo como reserva */
  var sd=window.RastroHoje&&window.RastroHoje.site&&window.RastroHoje.site();
  if(sd){var wd=$('#wk-days'),pn=sd.cls?' '+sd.cls:'';wd.className='hj-site'+pn+(wd.dataset.ok?'':(sd.cls?' pn-liga':' hj-entra'));wd.dataset.ok='1';wd.innerHTML=sd.linha;$('#wk-body').className='hj-site-card'+pn;$('#wk-body').innerHTML=sd.card;return}
  $('#wk-days').innerHTML=WK.map(function(x,i){return '<button class="'+(i<=UI.wk?'d':'')+'" data-act="wk" data-i="'+i+'" aria-pressed="'+(i===UI.wk)+'"><b>'+x.d+'</b><span>'+x.s+'</span></button>'}).join('');
  var x=WK[UI.wk], r='<span class="rastro" aria-hidden="true">'+WK.map(function(_,i){return '<i class="'+(i<=UI.wk?'d':'')+'"></i>'}).join('')+'</span>';
  $('#wk-body').innerHTML='<div><h3>'+x.t+'</h3><p>'+x.p+'</p></div><div>'+x.m(r)+'</div>';
}
function wkStop(){ if(UI.wkTimer){clearInterval(UI.wkTimer);UI.wkTimer=null} }
function wkPlay(){ wkStop(); UI.wkTimer=setInterval(function(){ if(UI.route!=='inicio'){wkStop();return} UI.wk=(UI.wk+1)%WK.length; renderWk(); },3200); renderWk(); }

/* ---------- site: agenda demo ---------- */
var DGT=['09:00','11:00','14:00','16:00','18:00'];
function dgSeed(){ return [
  {k:'a',d:0,h:'09:00',n:'Helena',v:180,s:'realizada'},{k:'b',d:0,h:'14:00',n:'Caio',v:180,s:'confirmada'},{k:'c',d:1,h:'18:00',n:'Lívia e Otávio',v:260,s:'agendada'},
  {k:'d',d:2,h:'09:00',n:'Marina',v:200,s:'agendada'},{k:'e',d:2,h:'16:00',n:'Gustavo',v:180,s:'confirmada'},{k:'f',d:3,h:'18:00',n:'Rui',v:180,s:'agendada'},{k:'g',d:4,h:'11:00',n:'Paula',v:180,s:'agendada'}] }
var CICLO=['agendada','confirmada','realizada','falta','agendada'];
function renderDg(){
  if(!UI.dg) UI.dg=dgSeed();
  var h='<div class="mini"><div class="h"></div>'+['seg','ter','qua','qui','sex'].map(function(x){return '<div class="h">'+x+'</div>'}).join('');
  DGT.forEach(function(t){ h+='<div class="t">'+t.slice(0,2)+'h</div>'; for(var d=0;d<5;d++){ var e=UI.dg.find(function(x){return x.d===d&&x.h===t}); h+='<div class="c">'+(e?'<button class="s-'+e.s+'" data-act="dg" data-k="'+e.k+'" aria-label="'+e.n+', '+STATUS[e.s]+'"><b>'+e.n+'</b>'+STATUS[e.s]+'</button>':'')+'</div>'; } });
  $('#dg-grid').innerHTML=h+'</div>';
  $('#dg-side').innerHTML='<div class="mock"><div class="r" style="grid-template-columns:minmax(0,1fr) auto"><span><b style="font-weight:600">Sem próxima sessão: Sofia Lacerda</b><small>Última sessão há 12 dias. A cada 15 dias, sexta às 11h.</small></span><button class="btn sm" data-act="copy-dg">Copiar convite</button></div><div class="note">Olá, Sofia! Ainda não marcamos a próxima sessão. Tenho horário na sexta às 11:00. Fica bom para você?</div></div>';
  var real=0,prev=0,falta=0; UI.dg.forEach(function(e){ if(e.s==='realizada')real+=e.v; else if(e.s==='falta')falta++; else prev+=e.v; });
  $('#dg-foot').innerHTML='<span>No financeiro: <b class="c-ok num">'+brl(real)+'</b> realizado, <b class="num">'+brl(prev)+'</b> ainda marcado'+(falta?', '+plural(falta,'falta não cobrada','faltas não cobradas'):'')+'.</span>';
}

/* ---------- site: prontuário demo ---------- */
var MODELOS={
  livre:{n:'Livre',f:[['Registro','Sessão sobre a volta ao trabalho depois das férias. Falou da insegurança com a nova chefia e do sono irregular. Combinamos observar os horários de sono durante a semana.']]},
  tcc:{n:'TCC',f:[['Demanda','Ansiedade antes de reuniões.'],['Intervenção','Registro de pensamentos e ensaio da fala.'],['Resposta','Identificou duas previsões catastróficas.'],['Plano','Testar uma previsão na reunião de quinta.']]},
  casal:{n:'Casal',f:[['Tema','Divisão das tarefas da casa.'],['Padrão observado','Crítica de um lado, retirada do outro.'],['Combinado','Conversa de 20 minutos no domingo, com hora para acabar.']]}
};
function renderPr(){
  var m=MODELOS[UI.prModel]; if(!UI.prVals||UI.prVals.m!==UI.prModel) UI.prVals={m:UI.prModel,v:m.f.map(function(x){return x[1]})};
  $('#pr-models').innerHTML=Object.keys(MODELOS).map(function(k){return '<button data-act="pr-m" data-m="'+k+'" aria-pressed="'+(k===UI.prModel)+'">'+MODELOS[k].n+'</button>'}).join('');
  $('#pr-fields').innerHTML=m.f.map(function(x,i){return '<div class="field"><label for="pr-'+i+'">'+x[0]+'</label><textarea id="pr-'+i+'" data-pr="'+i+'"'+(m.f.length===1?' style="min-height:170px"':'')+'>'+escH(UI.prVals.v[i])+'</textarea></div>'}).join('');
  prOut();
}
function prOut(){ var m=MODELOS[UI.prModel]; $('#pr-out').textContent=dmy(TODAY)+', '+(UI.prModel==='casal'?'Lívia e Otávio Ramos':'Helena Prado')+'. Sessão realizada.\n\n'+m.f.map(function(x,i){return (m.f.length>1?x[0]+': ':'')+(UI.prVals.v[i]||'').trim()}).join('\n'); }


/* ---------- site: estudo das formas do prontuário ---------- */
function eLista(a){return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' e '+a[a.length-1]}
function chipsH(act,arr,on){return arr.map(function(o,i){return '<button class="chip" data-act="'+act+'" data-o="'+i+'" aria-pressed="'+(on(i))+'">'+o+'</button>'}).join('')}
var FS={sit:0,tar:0,v:{rel:'a ida à reunião de quinta e a crítica que temia, que não aconteceu',tema:'a evitação de falar em reuniões',obj:'reduzir a evitação nas reuniões',tec:'o ensaio comportamental da fala da próxima reunião',bt:'preparar a paciente para falar primeiro',at:'falará primeiro na reunião de segunda',ba:'testar a previsão de crítica',dc:'07/11/2026',mot:'uma viagem de trabalho',nd:'12/11/2026'}};
var FSF=[[['rel','Relatos relevantes'],['tema','Tema trabalhado'],['obj','Com o objetivo de'],['tec','Técnica'],['bt','Buscando'],['at','Atividade para a semana'],['ba','Buscando']],[],[['dc','Data do contato'],['mot','Em razão de'],['nd','Nova data']]];
var F3={st:0,ob:0,iv:[0,1]};
var F3O=[{p:'a evitação de falar em reuniões',o:'falar nas reuniões sem evitar',iv:[['o','teste de previsões','verificar se a crítica temida acontece'],['o','ensaio comportamental','preparar a fala da próxima reunião']]},
 {p:'a irregularidade do sono',o:'dormir antes da meia-noite em cinco noites por semana',iv:[['a','psicoeducação sobre higiene do sono','organizar a rotina antes de deitar'],['o','registro do sono','identificar os horários em que deita e levanta']]}];
function renderFm(){
  $('#fs-sit').innerHTML=chipsH('fs-s',['Sessão realizada','Falta sem aviso','Reagendamento'],function(i){return FS.sit===i});
  var f=FSF[FS.sit], h='';
  if(FS.sit===0)h+='<div class="fm-g"><p class="lbl">Atividade anterior</p><div class="chips">'+chipsH('fs-t',['Realizou','Não realizou'],function(i){return FS.tar===i})+'</div></div>';
  h+=f.map(function(x){return '<div class="field" style="margin-bottom:10px"><label for="fs-'+x[0]+'">'+x[1]+'</label><input id="fs-'+x[0]+'" data-fs="'+x[0]+'" value="'+escH(FS.v[x[0]])+'"></div>'}).join('');
  $('#fs-f').innerHTML=h;
  var fo=F3O[F3.ob];
  $('#f3-form').innerHTML='<div class="goal"><span class="n">'+(F3.ob+1)+'</span><span>'+fo.o.charAt(0).toUpperCase()+fo.o.slice(1)+'<small>Da formulação. Problema: '+fo.p+'.</small></span><span class="tag c-acc">Objetivo</span></div>';
  $('#f3-st').innerHTML=chipsH('f3s',['Realizada','Não realizada'],function(i){return F3.st===i});
  $('#f3-ob').innerHTML=chipsH('f3o',['1. Falar nas reuniões','2. Dormir mais cedo'],function(i){return F3.ob===i});
  $('#f3-iv').innerHTML=chipsH('f3i',fo.iv.map(function(x){return x[1].charAt(0).toUpperCase()+x[1].slice(1)}),function(i){return F3.iv.indexOf(i)>=0});
  fmOut();
}
function fmOut(){
  var v=FS.v, t;
  if(FS.sit===1) t='Registro da evolução\nA paciente não compareceu à sessão no horário previamente acordado e não apresentou justificativa prévia ao psicólogo.';
  else if(FS.sit===2) t='Registro complementar (entre sessões)\nNo período entre as sessões ('+v.dc+'), a paciente entrou em contato com o psicólogo (via WhatsApp) informando que não poderia comparecer ao atendimento da semana em razão de '+v.mot+'. Diante disso, ficou acordado que o próximo encontro será realizado no dia '+v.nd+'.\n\nRegistro da evolução\nEm aberto até o atendimento de '+v.nd+'. A sessão continua sendo a 9.';
  else t='Registro da evolução\nNo início do atendimento, a paciente relatou os acontecimentos desde o último encontro, incluindo '+v.rel+'.\nHelena '+(FS.tar?'não realizou':'realizou')+' a atividade acordada anteriormente, a qual foi revisada durante a sessão.\nDurante o atendimento, foi trabalhada '+v.tema+', com o objetivo de '+v.obj+'.\nAlém disso, foi realizado '+v.tec+', buscando '+v.bt+'.\nComo atividade para a próxima semana, ficou acordado que a paciente '+v.at+', buscando '+v.ba+'.';
  $('#fs-out').textContent=t;
  var fo=F3O[F3.ob], L=['Registro da evolução','No início do atendimento, a paciente relatou '+$('#f3-rel').value.trim()+'.','Helena '+(F3.st?'não realizou':'realizou')+' a atividade acordada anteriormente (testar uma previsão na reunião de quinta), a qual foi revisada durante a sessão.','Durante o atendimento, foi trabalhada '+fo.p+', com o objetivo de '+fo.o+'.'];
  F3.iv.slice().sort().forEach(function(i,k){var x=fo.iv[i];L.push((k?'Também foi realizad':'Além disso, foi realizad')+x[0]+' '+x[0]+' '+x[1]+', buscando '+x[2]+'.')});
  L.push('Como atividade para a próxima semana, ficou acordado, de forma colaborativa, que a paciente '+$('#f3-at').value.trim()+'.');
  $('#f3-out').textContent=L.join('\n');
}
/* ---------- site: bloco único do prontuário ---------- */
/* Desenho do bloco tirado da skill "Registrar Sessão no Prontuário" e dos "Padrões de Escrita do Prontuário":
   a sessão abre com o texto padrão e os campos em vermelho, a situação decide o que acontece com o bloco
   (realizada e falta abrem a próxima; remarcada mantém o número, muda a data e deixa a evolução em aberto),
   e a evolução aprovada vira um parágrafo só. Textos de modelos-prontuario.js do Controle Único. */
var PB={v:0,cor:0,let:0,open:false,org:false,ed:null,q:'',del:null,sit:0,rq:0,rm:{},lastLn:null};
function pbStart(){PB.n=9;PB.data='09/11/2026';PB.prev='testar uma previsão na reunião de quinta';PB.prevD='02/11/2026';PB.comp=[];PB.hist=[];PB.sit=0;PB.rq=0;PB.rm={}}
pbStart();
var PB_C=['#2C4E9E','#2F6B4F','#7A2E3B','#3A3F4A'];
var PB_EV=[
 {k:'relato',t:'No início do atendimento, a paciente relatou os acontecimentos desde o último encontro, incluindo {relatos relevantes}.'},
 {k:'tarefa',o:'Tarefa anterior',t:'Helena {realizou|não realizou} a atividade acordada anteriormente, a qual foi revisada durante a sessão.'},
 {k:'tema',t:'Durante o atendimento, foi trabalhado {tema ou alvo clínico}, com o objetivo de {objetivo da intervenção}.'},
 {k:'tecnica',o:'Técnica',t:'Além disso, foi realizado {técnica específica}, buscando {objetivo da técnica}.'},
 {k:'ativ',o:'Tarefa da semana',t:'Como atividade para a próxima semana, ficou acordado que a paciente {atividade}, buscando {objetivo da atividade}.'}];
var PB_FALTA='A paciente não compareceu à sessão no horário previamente acordado e não apresentou justificativa prévia ao psicólogo.';
var PB_RQ=[['A paciente pediu','No período entre as sessões ({data do contato}), a paciente entrou em contato com o psicólogo (via WhatsApp) solicitando o reagendamento da consulta semanal. Diante disso, ficou acordado que o próximo encontro será realizado no dia {nova data}.'],
 ['Eu remarquei','No período entre sessões ({data do contato}), o psicólogo informou à paciente que a consulta do dia @D não será realizada em decorrência de {motivo}. Diante disso, ficou acordado que o próximo encontro será realizado no dia {nova data}.'],
 ['Sem pagamento','No período entre sessões ({data do contato}), o psicólogo entrou em contato com a paciente (via WhatsApp), realizando a cobrança referente ao pagamento mensal dos atendimentos, sem que a paciente apresentasse retorno ao contato realizado. Dessa forma, o atendimento da semana não foi realizado em decorrência da ausência de pagamento prévio.']];
var PB_NH='No período entre sessões ({data do contato}), o psicólogo informou à paciente que a consulta do dia @D não será realizada em decorrência de {motivo}.';
var PB_SIT=['Realizada','Falta','Remarcada','Não haverá'];
var PB_FO=[{n:'1. Falar nas reuniões',tema:'o medo de falar em reuniões',obj:'reduzir a evitação nas reuniões de trabalho',tec:[['o teste de previsões','verificar se a crítica temida acontece'],['o ensaio comportamental','preparar a fala da próxima reunião']]},
 {n:'2. Dormir mais cedo',tema:'o padrão irregular de sono',obj:'regularizar os horários de dormir e acordar',tec:[['o registro do sono','identificar os horários em que deita e levanta'],['a psicoeducação acerca da higiene do sono','organizar a rotina antes de deitar']]}];

/* datas */
function pbD(s){var m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec((s||'').trim());if(!m)return null;var d=new Date(+m[3],+m[2]-1,+m[1]);return d.getDate()===+m[1]&&d.getMonth()===+m[2]-1?d:null}
function pbAdd(s,n){var d=pbD(s);d.setDate(d.getDate()+n);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()}

/* campos em vermelho: {rótulo} vira lacuna; {a|b} vira escolha */
function gapH(l){if(l.indexOf('|')>=0)return '<span class="gap ch vz" contenteditable="false" tabindex="0" role="button" data-opts="'+escH(l)+'" data-l="'+escH(l.replace('|','/'))+'">'+escH(l.replace('|','/'))+'</span>';
  return '<span class="gap vz" data-l="'+escH(l)+'">'+escH(l)+'</span>'}
function tplH(t){return escH(t.replace('@D',PB.data)).replace(/\{([^}]+)\}/g,function(_,l){return gapH(l)})}
function lnH(k,t,lab){return '<div class="ln" data-k="'+k+'"><div class="ed" contenteditable="true" spellcheck="true">'+tplH(t)+'</div>'+(lab?'<button class="ln-x" data-act="pb-rm" data-k="'+k+'" aria-label="Tirar a linha: '+escH(lab)+'" title="Tirar esta linha">×</button>':'<span></span>')+'</div>'}
function compT(t){return PB.comp.length?t.replace(/^No período entre (as )?sessões/,'Ainda no período entre as sessões'):t}
function lnTxt(ed){var s='';ed.childNodes.forEach(function(n){if(n.nodeType===3)s+=n.textContent;else if(n.classList&&n.classList.contains('gap'))s+=n.classList.contains('vz')?'⟦'+n.dataset.l+'⟧':n.textContent;else s+=n.textContent});return s.replace(/\s+/g,' ').trim()}
function evTpl(){return PB_EV.map(function(x){return x.t.replace(/\{([^}]+)\}/g,function(_,l){return '⟦'+l.replace('|','/')+'⟧'})}).join(' ')}
function redH(t){return escH(t).replace(/⟦([^⟧]*)⟧/g,'<span class="red">[$1]</span>')}

function renderEd(){
  PB.rm={}; PB.lastLn=null; var h='';
  if(PB.sit===0){PB_EV.forEach(function(x){h+=lnH(x.k,x.t,x.o)});}
  else if(PB.sit===1)h=lnH('falta',PB_FALTA);
  else if(PB.sit===2)h=lnH('comp',compT(PB_RQ[PB.rq][1]));
  else h=lnH('comp',compT(PB_NH));
  $('#pb-ed').innerHTML=h;
  if(PB.sit===0&&!PB.prev){var l=$('#pb-ed .ln[data-k="tarefa"]');PB.rm.tarefa=l;l.remove()}
  $('#pb-sit').innerHTML=chipsH('pb-s',PB_SIT,function(i){return PB.sit===i});
  $('#pb-sub').innerHTML=PB.sit===2?'<div class="seg">'+PB_RQ.map(function(x,i){return '<button data-act="pb-rq" data-o="'+i+'" aria-pressed="'+(PB.rq===i)+'">'+x[0]+'</button>'}).join('')+'</div>':'';
  $('#pb-sub').hidden=PB.sit!==2;
  var c=$('#pb-carry'); c.hidden=!(PB.sit===0&&PB.prev); if(!c.hidden)c.innerHTML='<b>Atividade acordada em '+PB.prevD+'</b>'+escH(PB.prev.charAt(0).toUpperCase()+PB.prev.slice(1))+'.';
  $('#pb-sec').textContent=PB.sit<2?'Registro da Evolução do Trabalho':'Registro Complementar (Entre Sessões)';
  $('#pb-ok').textContent=PB.sit<2?'Aprovar e abrir a sessão '+pad(PB.n+1):(PB.sit===2&&PB.rq<2?'Aprovar e passar para a nova data':'Aprovar e passar para '+pbAdd(PB.data,7));
  $('#pb-h').textContent='Helena Prado, sessão '+pad(PB.n)+', '+PB.data;
  pbAddH(); pbSug(null); pbOut();
}
function pbAddH(){var k=Object.keys(PB.rm);$('#pb-add').innerHTML=k.length?'<span>Também houve</span>'+PB_EV.filter(function(x){return PB.rm[x.k]}).map(function(x){return '<button class="chip add" data-act="pb-back" data-k="'+x.k+'">+ '+x.o+'</button>'}).join(''):'';$('#pb-add').hidden=!k.length}
function pbLeft(){var n=$$('#pb-ed .gap.vz').length;$('#pb-left').textContent=n?'Faltam '+plural(n,'campo','campos')+' em vermelho.':'Tudo preenchido.';$('#pb-left').className=n?'c-bad':'c-ok'}
function pbSug(ln){
  var s=$('#pb-sug'),k=ln&&ln.dataset.k,h='';
  if(k==='tema')h='<span>Da formulação</span>'+PB_FO.map(function(f,i){return '<button class="chip" data-act="pb-fo" data-o="'+i+'">'+escH(f.n)+'</button>'}).join('');
  else if(k==='tecnica'){h='<span>Do plano</span>';PB_FO.forEach(function(f,i){f.tec.forEach(function(t,j){h+='<button class="chip" data-act="pb-tc" data-o="'+i+'" data-j="'+j+'">'+escH(t[0].replace(/^(o|a) /,'').replace(/^./,function(c){return c.toUpperCase()}))+'</button>'})})}
  if(ln||!h){s.innerHTML=h;s.hidden=!h}
}
function gapFill(ln,vals){var g=$$('.gap',ln);vals.forEach(function(v,i){if(g[i]){g[i].textContent=v;g[i].classList.remove('vz')}});pbOut()}
function gapSel(g){if(g.classList.contains('ch')){g.focus();return}var ed=g.closest('.ed');ed.focus();var r=document.createRange();if(g.firstChild)r.selectNodeContents(g.firstChild);else r.selectNodeContents(g);var s=getSelection();s.removeAllRanges();s.addRange(r)}
function renderPb(){
  $('#pb-v').innerHTML=['Word','Papel timbrado'].map(function(x,i){return '<button data-act="pb-v" data-o="'+i+'" aria-pressed="'+(PB.v===i)+'">'+x+'</button>'}).join('');
  $('#pb-opt').innerHTML=PB.v===1?'<span>Cor</span><div class="sw">'+PB_C.map(function(c,i){return '<button data-act="pb-c" data-o="'+i+'" style="background:'+c+'" aria-label="Cor '+(i+1)+'" aria-pressed="'+(PB.cor===i)+'"></button>'}).join('')+'</div><span>Letra</span><div class="seg">'+['Com serifa','Sem serifa'].map(function(x,i){return '<button data-act="pb-l" data-o="'+i+'" aria-pressed="'+(PB.let===i)+'">'+x+'</button>'}).join('')+'</div>':'<span>No formato do seu prontuário: Times New Roman 10, justificado, um bloco por sessão.</span>';
  renderPop();
  if(!$('#pb-ed').childElementCount)renderEd(); else pbOut();
}
function pbOut(){
  var ls=$$('#pb-ed .ln').map(function(l){return lnTxt($('.ed',l))}).filter(Boolean);
  var comp=PB.comp.slice(), ev;
  if(PB.sit<2)ev=ls.join(' '); else{comp.push(ls.join(' '));ev=evTpl()}
  var idl='<div class="idl"><p>Prontuário: P012</p><p>Nome Completo: Helena Prado</p><p>CPF: 000.000.000-00</p><p>Telefone: (00) 00000-0000</p><p>Data: '+PB.data+'</p><p>Sessão: '+pad(PB.n)+'</p></div>';
  var body=(comp.length?'<p class="st">Registro Complementar (Entre Sessões):</p>'+comp.map(function(c){return '<p>'+redH(c)+'</p>'}).join(''):'')+'<p class="st">Registro da Evolução do Trabalho:</p><p>'+redH(ev)+'</p>';
  var h;
  if(PB.v===0)h='<div class="paper word doc">'+idl+body+'</div>';
  else h='<div class="paper tim doc '+(PB.let?'sans-t':'serif-t')+'" style="--tc:'+PB_C[PB.cor]+'"><div class="lh"><span class="mono">PE</span><div><b>Psicólogo de exemplo</b><span>Psicólogo clínico, CRP 00/00000</span></div></div><div class="bd">'+idl+body+'</div><div class="ft">Atendimento online. Documento sigiloso, guardado conforme a Resolução CFP 001/2009.</div></div>';
  $('#pb-out').innerHTML=h; pbLeft();
}
function pbOk(){
  var e=$$('#pb-ed .gap.vz'); if(e.length){toast('Faltam '+plural(e.length,'campo','campos')+' em vermelho.');gapSel(e[0]);return}
  var ls=$$('#pb-ed .ln').map(function(l){return lnTxt($('.ed',l))}).filter(Boolean), old=pad(PB.n);
  if(PB.sit<2){
    var a=$('#pb-ed .ln[data-k="ativ"] .gap');
    PB.prev=PB.sit===0&&a?a.textContent.trim():null; PB.prevD=PB.data;
    PB.hist.push({n:PB.n,data:PB.data,ev:ls.join(' ')}); PB.n++; PB.data=pbAdd(PB.data,7); PB.comp=[];
    toast('Sessão '+old+' no prontuário. A '+pad(PB.n)+' abriu em '+PB.data+(PB.prev?'.':', sem a linha da tarefa anterior.'));
  }else{
    var nd=pbAdd(PB.data,7);
    if(PB.sit===2&&PB.rq<2){var g=$$('#pb-ed .gap').filter(function(x){return x.dataset.l==='nova data'})[0];if(!g||!pbD(g.textContent)){toast('Escreva a nova data como dd/mm/aaaa.');if(g)gapSel(g);return}nd=g.textContent.trim()}
    PB.comp.push(ls.join(' ')); PB.data=nd;
    toast('Sessão '+old+' passou para '+nd+'. O número fica, e a evolução segue em aberto.');
  }
  PB.sit=0; renderEd(); var f=$('#pb-ed .gap.vz'); if(f)gapSel(f);
}

/* frases (botão Frases): entram como linha nova, com {campo} virando lacuna */
function pbSeed(){var n=0;return [
 ['Atraso','Helena compareceu ao atendimento com {minutos} minutos de atraso.'],
 ['OQ-45.2 discutido','Durante a sessão, foram discutidos os resultados do preenchimento semanal do OQ-45.2, com exploração dos itens avaliados negativamente pela paciente.'],
 ['OQ-45.2 não preenchido','Helena não realizou o preenchimento prévio do OQ-45.2, ficando acordado que o instrumento seria preenchido após o término da sessão.'],
 ['Psicoeducação','Além disso, foi realizado a psicoeducação acerca de {tema}, buscando {objetivo}.'],
 ['Instrumentos','Ao final do atendimento, foi solicitado que a paciente preenchesse os seguintes instrumentos, com o objetivo de complementar a avaliação clínica: {instrumentos}.'],
 ['Encaminhamento','Por fim, foi discutida a necessidade de avaliação psiquiátrica, sendo realizado encaminhamento para a especialidade [Anexo 01].'],
 ['Mudança de horário','Por fim, ficou acordado que os atendimentos passarão a ocorrer {dia e horário}, sendo a alteração do horário iniciada a partir da próxima sessão.'],
 ['Aviso do psicólogo','Por fim, o psicólogo informou à paciente que a consulta do dia {data} não será realizada em decorrência de {motivo}.']
].map(function(x){return {id:'f'+(++n),n:x[0],t:x[1]}})}
PB.F=(function(){try{var x=JSON.parse(localStorage.getItem(KEY+'-frases2'));if(x&&x.length)return x}catch(e){}return pbSeed()})();
function pbSave(){try{localStorage.setItem(KEY+'-frases2',JSON.stringify(PB.F))}catch(e){}}
var GRIP='<svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="3" r="1.6"/><circle cx="9" cy="3" r="1.6"/><circle cx="3" cy="9" r="1.6"/><circle cx="9" cy="9" r="1.6"/><circle cx="3" cy="15" r="1.6"/><circle cx="9" cy="15" r="1.6"/></g></svg>';
function pbFind(id){return PB.F.find(function(x){return x.id===id})}
function renderPop(){
  var o=$('#pb-open'); o.innerHTML='Frases <span class="ct">'+PB.F.length+'</span>'; o.setAttribute('aria-expanded',String(PB.open));
  var p=$('#pb-pop'); p.hidden=!PB.open; if(!PB.open)return;
  if(PB.ed){
    var f=PB.ed==='new'?{n:PB.preN||'',t:PB.pre||''}:pbFind(PB.ed);
    p.innerHTML='<div class="fr-form"><p class="lbl" style="margin:0">'+(PB.ed==='new'?'Nova frase':'Alterar frase')+'</p>'+
      '<div class="field"><label for="fr-n">Nome do botão</label><input id="fr-n" maxlength="40" value="'+escH(f.n)+'" placeholder="Ex.: Atraso"></div>'+
      '<div class="field"><label for="fr-t">Texto</label><textarea id="fr-t" placeholder="O texto que o botão escreve">'+escH(f.t)+'</textarea></div>'+
      '<p class="note" style="margin:0">O que muda a cada vez vai entre chaves, como {minutos}: vira um campo em vermelho para preencher.</p></div>'+
      '<div class="pop-f"><button class="btn sm pri" data-act="fr-ok">Salvar frase</button><button class="btn sm ghost" data-act="fr-x">Cancelar</button></div>';
    setTimeout(function(){var n=$('#fr-n');if(n&&!n.value)n.focus()},0); return;
  }
  p.innerHTML='<div class="pop-h"><input id="fr-q" type="search" placeholder="Buscar frase" aria-label="Buscar frase" value="'+escH(PB.q)+'"><button class="btn sm'+(PB.org?' pri':'')+'" data-act="fr-org" aria-pressed="'+PB.org+'">'+(PB.org?'Pronto':'Organizar')+'</button><button class="btn sm ghost" data-act="pb-open" aria-label="Fechar">✕</button></div><div id="fr-list"></div>';
  renderFrList();
}
function renderFrList(){
  var q=PB.q.trim().toLowerCase(), l=PB.F.filter(function(x){return !q||x.n.toLowerCase().indexOf(q)>=0||x.t.toLowerCase().indexOf(q)>=0}), h='';
  if(PB.org) h='<div>'+l.map(function(x){return '<div class="fr-row" data-id="'+x.id+'"><button class="hd" data-hd="'+x.id+'" aria-label="Arrastar '+escH(x.n)+' (ou use as setas)">'+GRIP+'</button><span><b>'+escH(x.n)+'</b><small>'+escH(x.t)+'</small></span><button class="link" data-act="fr-ed" data-id="'+x.id+'">Alterar</button><button class="link'+(PB.del===x.id?' sure':'')+'" data-act="fr-del" data-id="'+x.id+'">'+(PB.del===x.id?'Excluir mesmo?':'Excluir')+'</button></div>'}).join('')+'</div><p style="font-size:13px;margin-top:8px"><button class="link" data-act="fr-reset">Voltar às frases de exemplo</button></p>';
  else if(l.length) h='<p class="lbl">Entram na linha seguinte à que você está</p><div class="chips">'+l.map(function(x){return '<button class="chip" data-act="fr-use" data-id="'+x.id+'" title="'+escH(x.t)+'">'+escH(x.n)+'</button>'}).join('')+(!q?'<button class="chip add" data-act="fr-new" aria-label="Criar frase">+ Nova</button>':'')+'</div>';
  else h='<p class="muted" style="font-size:14px">Nenhuma frase com "'+escH(PB.q)+'". <button class="link" data-act="fr-new">Criar uma com esse nome</button></p>';
  $('#fr-list').innerHTML=h;
}
function frOrder(){var ids=[];$$('#fr-list .fr-row').forEach(function(r){ids.push(r.dataset.id)});var rest=PB.F.filter(function(x){return ids.indexOf(x.id)<0});PB.F=ids.map(pbFind).concat(rest);pbSave()}
function frUse(f){
  var d=document.createElement('div'); d.innerHTML=lnH('x'+Date.now(),f.t,f.n); var ln=d.firstChild, at=PB.lastLn&&PB.lastLn.isConnected?PB.lastLn:null;
  if(at)at.parentNode.insertBefore(ln,at.nextSibling); else $('#pb-ed').appendChild(ln);
  PB.lastLn=ln; pbOut(); var g=$('.gap.vz',ln); if(g)gapSel(g); else $('.ed',ln).focus();
}
var FRD=null;
document.addEventListener('pointerdown',function(ev){var h=ev.target.closest&&ev.target.closest('[data-hd]');if(!h)return;ev.preventDefault();FRD=h.closest('.fr-row');FRD.classList.add('drag')});
document.addEventListener('pointermove',function(ev){if(!FRD)return;ev.preventDefault();var pp=$('#pb-pop').getBoundingClientRect();if(ev.clientY<pp.top+40)$('#pb-pop').scrollTop-=12;else if(ev.clientY>pp.bottom-40)$('#pb-pop').scrollTop+=12;var el=document.elementFromPoint(ev.clientX,ev.clientY),r=el&&el.closest('.fr-row');if(!r||r===FRD||r.parentNode!==FRD.parentNode)return;var bx=r.getBoundingClientRect();r.parentNode.insertBefore(FRD,ev.clientY<bx.top+bx.height/2?r:r.nextSibling)},{passive:false});
document.addEventListener('pointerup',function(){if(!FRD)return;FRD.classList.remove('drag');FRD=null;frOrder();PB.drug=true;setTimeout(function(){PB.drug=false},0)});
document.addEventListener('mousedown',function(ev){if(ev.target.closest&&ev.target.closest('#pb-sug button,#pb-open,.gap.ch'))ev.preventDefault()});
document.addEventListener('keydown',function(ev){var h=ev.target.closest&&ev.target.closest('[data-hd]');
  if(h&&(ev.key==='ArrowUp'||ev.key==='ArrowDown')){ev.preventDefault();var r=h.closest('.fr-row'),o=ev.key==='ArrowUp'?r.previousElementSibling:r.nextElementSibling;if(!o)return;r.parentNode.insertBefore(r,ev.key==='ArrowUp'?o:o.nextSibling);h.focus();frOrder()}
  if(ev.key==='Escape'&&PB.open){PB.open=false;PB.ed=null;renderPop();$('#pb-open').focus()}
  var inEd=ev.target.closest&&ev.target.closest('#pb-ed');
  if(inEd&&ev.key==='Enter'){ev.preventDefault();if(ev.target.classList.contains('ch'))ev.target.click()}
  if(inEd&&ev.key==='Tab'){var all=$$('#pb-ed .gap'),emp=all.filter(function(g){return g.classList.contains('vz')}),list=emp.length?emp:all;if(!list.length)return;
    var sel=getSelection(),cur=ev.target.classList.contains('ch')?ev.target:(sel.anchorNode&&sel.anchorNode.parentElement&&sel.anchorNode.parentElement.closest('.gap')),i=list.indexOf(cur);
    var nx=ev.shiftKey?list[(i<=0?list.length:i)-1]:list[(i+1)%list.length];ev.preventDefault();gapSel(nx)}
});
document.addEventListener('click',function(ev){
  if(PB.open&&!PB.drug&&!ev.target.closest('#pb-pop,#pb-open')){PB.open=false;PB.ed=null;PB.org=false;renderPop()}
  var g=ev.target.closest&&ev.target.closest('#pb-ed .gap');
  if(g&&g.classList.contains('ch')){var o=g.dataset.opts.split('|'),i=o.indexOf(g.textContent);g.textContent=o[(i+1)%o.length];g.classList.remove('vz');pbOut()}
  else if(g&&g.classList.contains('vz'))gapSel(g);
},true);
document.addEventListener('focusin',function(ev){var ln=ev.target.closest&&ev.target.closest('#pb-ed .ln');if(ln){PB.lastLn=ln;pbSug(ln)}});
document.addEventListener('input',function(ev){if(!(ev.target.closest&&ev.target.closest('#pb-ed')))return;
  $$('#pb-ed .gap:not(.ch)').forEach(function(g){g.classList.toggle('vz',g.textContent.trim()===''||g.textContent===g.dataset.l)});pbOut()});
/* ---------- declaração (site e app) ---------- */
function periodo(q){ var y=NOW.getFullYear(), mo=NOW.getMonth(), a,b,lab;
  if(q==='mes'){a=new Date(y,mo,1);b=new Date(y,mo+1,0);lab=MES[mo]+' de '+y}
  else if(q==='ant'){a=new Date(y,mo-1,1);b=new Date(y,mo,0);lab=MES[a.getMonth()]+' de '+a.getFullYear()}
  else if(q==='tri'){a=new Date(y,mo-2,1);b=new Date(y,mo+1,0);lab=MES[a.getMonth()]+' a '+MES[mo]+' de '+y}
  else {a=new Date(y,0,1);b=new Date(y,11,31);lab='o ano de '+y}
  return {a:iso(a),b:iso(b),lab:lab}; }
function declaracao(pid,q){
  var p=pac(pid), P=periodo(q), l=S.sess.filter(function(s){return s.pid===pid&&s.pago&&due(s)&&s.date>=P.a&&s.date<=P.b}).sort(function(a,b){return a.date<b.date?-1:1});
  var tot=l.reduce(function(t,s){return t+s.valor},0);
  var quem=(p.tipo==='Adolescente'||p.tipo==='Criança')&&p.resp?p.nome+' (responsável: '+p.resp.split(',')[0]+')':p.nome;
  var txt=l.length?'Declaração\n\nDeclaro, para fins de reembolso, que '+quem+', CPF 000.000.000-00, realizou '+plural(l.length,'sessão','sessões')+' de psicoterapia comigo em '+P.lab+', nas datas '+l.map(function(s){return dm(s.date)}).join(', ')+', no valor de '+brl(p.valor)+' cada, somando '+brl(tot)+', pagos.\n\nPsicóloga de exemplo, CRP 00/00000.':'Nenhuma sessão paga de '+p.nome+' em '+P.lab+'. Escolha outro período.';
  return {txt:txt,n:l.length,tot:tot};
}
function renderFd(){
  var sel=$('#fd-p'); if(!sel.options.length) sel.innerHTML=S.pac.filter(function(p){return p.ativo}).map(function(p){return '<option value="'+p.id+'">'+escH(p.nome)+'</option>'}).join('');
  var r=declaracao(Number(sel.value),$('#fd-q').value); $('#fd-out').textContent=r.txt; $('#fd-sum').textContent=r.n?plural(r.n,'sessão','sessões')+', '+brl(r.tot)+'.':'';
}

/* ---------- app: Hoje ---------- */
/* ---------- o rastro de uma sessão ----------
   Cinco pontos, sempre na mesma ordem: marcada, confirmada, realizada, registrada, paga.
   d: aconteceu. x: falta. r: ficou para trás. n: não se aplica. vazio: ainda não aconteceu. */
function viva(s){return s.status!=='cancelada'}
function rastroC(s){
  if(s.status==='cancelada')return ['d','n','n','n','n'];
  var e=estado(s), feita=s.status==='realizada', nv=s.status==='falta', reg=feita||nv, c=['d'];
  c.push(reg||s.status==='confirmada'?'d':'');
  c.push(feita?'d':nv?'x':e==='aconf'?'r':'');
  c.push(s.nota?'d':reg?'r':'');
  c.push(s.cortesia||(nv&&!s.cobrar)?'n':s.pago?'d':(reg&&recState(s)==='atraso'?'r':''));
  return c;
}
function faltaInfo(s){
  var e=estado(s);
  if(s.status==='cancelada')return {t:'Não haverá.',k:'',done:true};
  if(e==='aconf')return {t:'Falta dizer se aconteceu.',k:'w',a:'Marcar',act:'ev'};
  if(e==='agendada')return {t:'Falta confirmar.',k:'',a:'Lembrar',act:'ev'};
  if(e==='confirmada')return {t:'Confirmada.',k:''};
  var f=[], pre=s.status==='falta'?(s.cobrar?'Não veio, cobrada. ':'Não veio, sem cobrança. '):'';
  if(!s.nota)f.push('registrar'); if(due(s)&&!s.pago)f.push('receber');
  if(!f.length)return {t:pre+(s.cortesia?'Cortesia, completa.':'Completa.'),k:'',done:true};
  return {t:pre+'Falta '+f.join(' e ')+'.',k:(!s.nota||recState(s)==='atraso')?'w':'',a:!s.nota?'Registrar':'Receber',act:!s.nota?'pr-open':'sess'};
}
function rastroH(s){return '<span class="rastro" role="img" aria-label="'+escH(faltaInfo(s).t)+'">'+rastroC(s).map(function(x){return '<i class="'+x+'"></i>'}).join('')+'</span>'}
var RASTRO_EX='<span class="rastro" aria-hidden="true"><i class="d"></i><i class="d"></i><i class="d"></i><i class="r"></i><i></i></span>';
/* linha de sessão: hora, quem, rastro, o que falta e o que fazer */
function slH(s,showDate){ var p=pac(s.pid), f=faltaInfo(s);
  var a=f.a?'<button class="act" data-act="'+f.act+'" data-id="'+(f.act==='pr-open'?s.pid+'" data-sid="'+s.id:s.id)+'">'+f.a+'</button>':'';
  return '<div class="sl'+(f.done?' feita':'')+'"><button class="slb" data-act="ev" data-id="'+s.id+'"><span class="h">'+(showDate?dm(s.date):s.hora)+'</span><span class="n"><b>'+avM(p)+escH(p.nome)+'</b><small>'+(showDate?s.hora+'. ':'')+p.tipo+'. '+p.mod+'.'+(s.de?' Remarcada.':s.extra?' Encaixe.':'')+'</small></span>'+rastroH(s)+'<span class="falta '+f.k+'">'+f.t+'</span></button><span class="a">'+a+'</span></div>';
}
function compH(o){return '<div class="sl comp"><button class="slb" data-act="cp" data-id="'+o.c.id+'" data-orig="'+o.orig+'"><span class="h">'+o.ini+'</span><span class="n"><b>'+escH(o.c.tit)+'</b><small>Compromisso até '+o.fim+'.'+(o.c.onde?' '+escH(o.c.onde)+'.':'')+'</small></span><span></span><span class="falta"></span></button><span class="a"></span></div>'}
function diasDesde(d){return Math.round((parse(TODAY)-parse(d))/864e5)}
function haDias(d){var n=diasDesde(d);return n<=0?'Hoje.':n===1?'Ontem.':'Há '+n+' dias.'}
/* linha enxuta do Financeiro: data, nome e valor; a cor do valor diz se entrou, falta receber ou atrasou */
function sessRow(s,showDate){ var p=pac(s.pid), d=due(s);
  var v=d?(s.pago?'<small class="c-ok">Recebido.</small>':(recState(s)==='atraso'?'<small class="c-bad">Em atraso.</small>':'<small class="muted">A receber.</small>')):'';
  return '<button class="row r4" data-act="sess" data-id="'+s.id+'"><span class="t">'+(showDate?dm(s.date):s.hora)+'</span><span class="d">'+avM(p)+escH(p.nome)+'<small>'+(showDate?s.hora+'. ':'')+p.mod+'. '+faltaInfo(s).t+'</small></span>'+rastroH(s)+'<span class="v">'+brl(s.valor)+v+'</span></button>';
}
/* ---------- app: Hoje ----------
   O dia em ordem de hora, com a linha do agora, e ao lado o que ficou de outros dias, agrupado pelo que fazer. */
function vHoje(){ if(window.RastroHoje)return window.RastroHoje.vista();
  var hoje=sessOn(TODAY).filter(viva), feitas=hoje.filter(function(s){return s.status==='realizada'||s.status==='falta'}).length;
  var asc=function(a,b){return a.date<b.date?-1:(a.date>b.date?1:(a.hora<b.hora?-1:1))};
  var reg=porRegistrar(), atras=S.sess.filter(function(s){return due(s)&&!s.pago&&recState(s)==='atraso'}).sort(asc);
  var aRec=S.sess.reduce(function(t,s){return t+(!s.pago?due(s):0)},0), atr=atras.reduce(function(t,s){return t+s.valor},0);
  var sp=semProx(), amanha=iso(addDays(NOW,1)), semConf=sessOn(amanha).filter(function(s){return s.status==='agendada'});
  var prox=null; if(!hoje.length){ for(var i=1;i<10;i++){var x=iso(addDays(NOW,i)); if(sessOn(x).some(viva)){prox=x;break}} }
  var fr;
  if(hoje.length){ fr='<b>'+plural(hoje.length,'sessão','sessões')+' hoje</b>';
    if(feitas)fr+=hoje.length===1?', já atendida':feitas===hoje.length?', todas já atendidas':', '+feitas+(feitas===1?' já atendida':' já atendidas');
    fr+='.'; }
  else fr='<b>Nenhuma sessão hoje.</b>'+(prox?' A próxima é '+quando(prox)+'.':'');
  fr+=' '+(reg.length?'<b>'+(reg.length===1?'Falta 1 registro':'Faltam '+reg.length+' registros')+'.</b>':'Nenhum registro por escrever.');
  fr+=aRec?' A receber, <b class="num">'+brl(aRec)+'</b>'+(atr?', dos quais <b class="num">'+brl(atr)+'</b> em atraso.':'.'):' Nada a receber.';
  var h='<div class="head"><h1>'+cap(longDate(TODAY))+'</h1><span class="sp"></span><button class="btn pri sm" data-act="sess-new">Marcar sessão</button><p class="frase">'+fr+'</p></div>';
  var dia=hoje.length?TODAY:prox, it=[];
  if(dia){ sessOn(dia).filter(viva).forEach(function(s){it.push({t:s.hora,h:slH(s)})}); compsOn(dia).forEach(function(o){it.push({t:o.ini,h:compH(o)})}); }
  it.sort(function(a,b){return a.t<b.t?-1:1});
  var nm=nowMin(), pos=-1, out='';
  if(hoje.length){for(var k=0;k<it.length;k++){if(minOf(it[k].t)>nm){pos=k;break}}}
  it.forEach(function(x,k){if(k===pos&&k>0)out+='<div class="agora">Agora, '+hOf(nm)+'</div>';out+=x.h});
  h+='<div class="hoje"><section class="dia"><h2 class="sec">'+(hoje.length?'Sessões de hoje':prox?'Próximas sessões, '+longDate(prox):'Sessões')+'</h2>'+(it.length?out:'<p class="empty">Nenhuma sessão marcada. Abra a Agenda e toque num horário vazio.</p>')+'</section>';
  var g='';
  var grp=function(t,n,rows,mais){return '<p class="grp">'+t+' <span>'+n+'</span></p>'+rows.join('')+(mais||'')};
  var item=function(act,attrs,nome,sub,go,w){return '<button class="it" data-act="'+act+'" '+attrs+'><span>'+escH(nome)+'<small'+(w?' class="w"':'')+'>'+sub+'</small></span><span class="'+(/^R\$/.test(go)?'v num':'go')+'">'+go+'</span></button>'};
  var ac=S.sess.filter(function(s){return estado(s)==='aconf'&&s.date!==TODAY}).sort(asc);
  if(ac.length)g+=grp('Dizer se aconteceu',plural(ac.length,'sessão passou sem marca','sessões passaram sem marca'),ac.slice(0,5).map(function(s){return item('ev','data-id="'+s.id+'"',pac(s.pid).nome,cap(longDate(s.date))+', '+s.hora+'.','Marcar',true)}));
  var ro=reg.filter(function(s){return s.date!==TODAY});
  if(ro.length)g+=grp('Registrar',plural(ro.length,'sessão','sessões'),ro.slice(0,5).map(function(s){return item('pr-open','data-id="'+s.pid+'" data-sid="'+s.id+'"',pac(s.pid).nome,cap(longDate(s.date))+'. '+haDias(s.date)+(s.status==='falta'?' Não veio.':''),'Registrar',diasDesde(s.date)>2)}),ro.length>5?'<button class="link" data-act="nav" data-to="app-prontuario">Ver as '+ro.length+' no Prontuário</button>':'');
  if(semConf.length)g+=grp('Lembrar',plural(semConf.length,'sessão de amanhã sem confirmação','sessões de amanhã sem confirmação'),semConf.map(function(s){return item('ev','data-id="'+s.id+'"',pac(s.pid).nome,'Amanhã, '+s.hora+'.','Lembrar')}));
  if(sp.length)g+=grp('Convidar',plural(sp.length,'paciente sem próxima sessão','pacientes sem próxima sessão'),sp.map(function(p){var u=S.sess.filter(function(s){return s.pid===p.id&&s.status==='realizada'}).sort(asc).pop();return item('convite','data-id="'+p.id+'"',p.nome,u?'Última sessão '+haDias(u.date).toLowerCase():'Nenhuma sessão ainda.','Convidar')}));
  if(atras.length)g+=grp('Receber',plural(atras.length,'sessão em atraso','sessões em atraso'),atras.slice(0,4).map(function(s){return item('sess','data-id="'+s.id+'"',pac(s.pid).nome,'Desde '+dm(s.date)+'.',brl(s.valor))}),atras.length>4?'<button class="link" data-act="nav" data-to="app-financeiro">Ver tudo no Financeiro</button>':'');
  return h+'<section class="fora"><h2 class="sec">De outros dias</h2>'+(g||'<p class="empty">Nada ficou para trás.</p>')+'</section></div>';
}

/* ---------- app: Agenda ----------
   Semana com os tipos de horário (fora do atendimento, livre, disponível para novos pacientes), feriados
   nacionais e do ES, linha da hora atual, compromissos, saldo de cada sessão e a faixa Hoje embaixo.
   Tocar abre o menu do horário (#pop); no computador, arrastar remarca. Ctrl+Z desfaz. */
var AG_LIVRES=[];
/* menu "…" para o que não é a ação principal da tela (pedido de Matheus, 14/11/2026: o mínimo de informação) */
function maisH(itens){return '<details class="mais"><summary class="btn sm" aria-label="Mais opções">…</summary><div class="mais-m">'+itens+'</div></details>'}
function vAgenda(){
  var ref=parse(UI.agRef), sem=UI.agMode==='semana', a=monday(ref), b=addDays(a,6), tit, fr='';
  if(sem)tit=a.getDate()+(a.getMonth()!==b.getMonth()?' de '+MES[a.getMonth()]:'')+' a '+b.getDate()+' de '+MES[b.getMonth()];
  else tit=cap(MES[ref.getMonth()])+' de '+ref.getFullYear();
  /* números da semana, no jeito do Controle Único: sessões, receita prevista, horários livres divulgados e ocupação.
     Receita conta o que cobra (sem cortesia nem falta sem cobrança); ocupação é hora de atendimento com sessão. */
  if(sem){ var n=0, liv=0, rec=0, hx=0, ho=0; AG_LIVRES=[];
    for(var i=0;i<7;i++){ var d=iso(addDays(a,i)), ss=sessOn(d).filter(viva); n+=ss.length;
      ss.forEach(function(s){ if(!s.cortesia&&!(s.status==='falta'&&!s.cobrar))rec+=s.valor||0 });
      for(var x=H0;x<=H1;x++){ if(!noExp(d,x)||feriado(d))continue; hx++;
        var oc=ss.some(function(s){var m=minOf(s.hora);return m<(x+1)*60&&m+DUR>x*60}); if(oc)ho++;
        else if(isDisp(d,x)){liv++; if(d>TODAY||(d===TODAY&&x*60>nowMin()))AG_LIVRES.push({d:d,x:x})} } }
    /* números da semana (sessões, receita, livres, ocupação) tirados a pedido dele em 14/11/2026, por enquanto */ }
  /* um botão + só, com as ações da agenda (pedido de Matheus, 16/11/2026) */
  var add='<details class="mais mais-add"><summary class="btn pri sm" aria-label="Adicionar">+</summary><div class="mais-m">'
    +'<button data-act="sess-new">Nova sessão<small>Com um paciente, uma vez ou toda semana</small></button>'
    +'<button data-act="cp-new">Novo compromisso<small>Só na sua agenda, fora das contas</small></button><hr>'
    +'<button data-act="ag-google">Sincronizar com o Google Agenda<small>'+(S.cfg&&S.cfg.gcal?'Ligado':'Desligado')+'</small></button>'
    +(sem?'<button data-act="ag-divulga">Mensagem de divulgação<small>Copia os horários livres</small></button>':'')+'</div></details>';
  var h='<div class="head"><h1>'+tit+'</h1><span class="sp"></span>'+add+'</div>'+fr;
  h+='<div class="agbar"><button class="btn sm" data-act="ag-nav" data-n="-1" aria-label="'+(sem?'Semana anterior':'Mês anterior')+'">‹</button><button class="btn sm" data-act="ag-today">Hoje</button><button class="btn sm" data-act="ag-nav" data-n="1" aria-label="'+(sem?'Próxima semana':'Próximo mês')+'">›</button><div class="seg"><button data-act="ag-mode" data-m="semana" aria-pressed="'+sem+'">Semana</button><button data-act="ag-mode" data-m="mes" aria-pressed="'+!sem+'">Mês</button></div></div>';
  if(!sem)return h+agMes();
  if(innerWidth<700)return h+agDia(a);
  return h+'<details class="ajuda"><summary aria-label="O que são as bolinhas">?</summary><p>'+RASTRO_EX+'O rastro de cada sessão: marcada, confirmada, realizada, registrada, paga. Ponto vazio ainda não aconteceu; ponto vermelho ficou para trás. Arraste uma sessão para remarcar; Ctrl+Z desfaz.</p></details>'+agSemana();
}
function agSemana(){
  var start=monday(parse(UI.agRef)), days=[]; for(var i=0;i<7;i++)days.push(iso(addDays(start,i)));
  var top=function(m){m=Math.min(Math.max(m,H0*60),(H1+1)*60-30);return (m/60-H0)*ROW+1}, alt=ROW*DUR/60-2;
  var h='<div class="wkwrap" id="wkwrap"><div class="wk"><div class="wk-corner"></div>'+days.map(function(d){var f=feriado(d);return '<div class="wk-h'+(d===TODAY?' is-today':'')+'">'+DOW[parse(d).getDay()]+'<b>'+parse(d).getDate()+'</b>'+niverSel(d)+(f?'<span class="fer" title="'+escH(f)+'">'+escH(f)+'</span>':'')+'</div>'}).join('');
  h+='<div class="wk-times">'+HOURS.map(function(x){return '<div>'+pad(x)+':00</div>'}).join('')+'</div>';
  days.forEach(function(d){
    var ss=sessOn(d), cs=compsOn(d), f=feriado(d), vivas=ss.filter(viva);
    h+='<div class="wk-col'+(f?' fer':'')+'" data-d="'+d+'">'+HOURS.map(function(x){
      var exp=noExp(d,x), ocup=vivas.some(function(s){var m=minOf(s.hora);return m<(x+1)*60&&m+DUR>x*60}), di=exp&&!ocup&&isDisp(d,x);
      return '<button class="slot'+(exp?(di?' disp':''):' fora')+'" data-act="vz" data-d="'+d+'" data-h="'+x+'" aria-label="'+cap(longDate(d))+', '+x+' horas'+(di?', livre para paciente novo':exp?'':', fora do horário de atendimento')+'"></button>'}).join('');
    var clS={}, clC={};
    vivas.forEach(function(s){var m=minOf(s.hora);cs.forEach(function(o,k){if(m<minOf(o.fim)&&m+DUR>minOf(o.ini)){clS[s.id]=1;clC[k]=1}})});
    S.sess.forEach(function(s){ if(s.de&&s.de.date===d&&s.status!=='cancelada'){ h+='<button class="ev ev-ghost" data-act="ev" data-id="'+s.id+'" style="top:'+top(minOf(s.de.hora))+'px;height:'+alt+'px"><span class="nm">'+escH(curto(pac(s.pid)))+'</span><small>foi para '+DOW[parse(s.date).getDay()]+' '+dm(s.date)+', '+s.hora+'</small></button>'; }});
    ss.forEach(function(s){ var p=pac(s.pid), dr=s.status!=='cancelada', pas=passou(s)||s.status==='realizada'||s.status==='falta';
      h+='<button class="ev'+(s.status==='cancelada'?' ev-cancelada':pas?' pas':'')+(clS[s.id]?' half-l':'')+'" data-act="ev" data-id="'+s.id+'"'+(dr?' data-drag="s"':'')+' style="top:'+top(minOf(s.hora))+'px;height:'+alt+'px" aria-label="'+escH(p.nome)+', '+s.hora+'. '+escH(faltaInfo(s).t)+'"><span class="nm">'+avM(p,'xs')+(s.hora.slice(3)!=='00'?'<b>'+s.hora+'</b>':'')+escH(curto(p))+'</span><small>'+(s.status==='cancelada'?'não haverá':rastroH(s)+(s.status==='falta'?'<em>não veio</em>':s.cortesia?'cortesia':saldoCard(s)))+'</small></button>'; });
    cs.forEach(function(o,k){ var a=minOf(o.ini), b=minOf(o.fim);
      h+='<button class="ev ev-comp'+(clC[k]?' clash half-r':'')+'" data-act="cp" data-id="'+o.c.id+'" data-orig="'+o.orig+'" data-drag="c" style="top:'+top(a)+'px;height:'+Math.max(22,(b-a)/60*ROW-2)+'px" aria-label="Compromisso: '+escH(o.c.tit)+', '+o.ini+' às '+o.fim+'"><span class="nm">'+(o.ini.slice(3)!=='00'?'<b>'+o.ini+'</b>':'')+escH(o.c.tit)+'</span><small>'+(clC[k]?'Em cima de uma sessão':escH(o.c.onde||''))+'</small></button>'; });
    if(d===TODAY){var nm=nowMin();if(nm>=H0*60&&nm<=(H1+1)*60)h+='<div class="now" data-t="'+hOf(nm)+'" style="top:'+((nm/60-H0)*ROW)+'px" aria-hidden="true"></div>'}
    h+='</div>';
  });
  return h+'</div></div>';
}
/* no celular a semana vira um dia por vez, com a semana numa faixa em cima */
function agDia(a){
  var days=[]; for(var i=0;i<7;i++)days.push(iso(addDays(a,i)));
  if(days.indexOf(UI.agDay)<0)UI.agDay=days.indexOf(TODAY)>=0?TODAY:days[0];
  var h='<div class="strip7">'+days.map(function(d){ var ss=sessOn(d).filter(viva), f=feriado(d), w=parse(d).getDay();
    var pend=ss.some(function(s){return estado(s)==='aconf'||((s.status==='realizada'||s.status==='falta')&&!s.nota)});
    return '<button data-act="ag-day" data-d="'+d+'" aria-pressed="'+(d===UI.agDay)+'" aria-label="'+longDate(d)+', '+plural(ss.length,'sessão','sessões')+(pend?', com algo para trás':'')+'">'+DOW[w]+'<b>'+parse(d).getDate()+'</b>'+niverSel(d)+(pend?'<i></i>':'<small>'+(f?'feriado':ss.length?'':CFG().dias.indexOf(w)<0?'fechado':'')+'</small>')+'</button>'}).join('')+'</div>';
  var d=UI.agDay, f=feriado(d), ss=sessOn(d), vivas=ss.filter(viva), it=ss.map(function(s){return {t:s.hora,h:slH(s)}});
  compsOn(d).forEach(function(o){it.push({t:o.ini,h:compH(o)})});
  for(var x=H0;x<=H1;x++){ if(noExp(d,x)&&isDisp(d,x)&&!vivas.some(function(s){var m=minOf(s.hora);return m<(x+1)*60&&m+DUR>x*60}))
    it.push({t:pad(x)+':00',h:'<button class="livre" data-act="vz" data-d="'+d+'" data-h="'+x+'"><span class="h">'+pad(x)+':00</span><u>livre para paciente novo</u></button>'}) }
  it.sort(function(p,q){return p.t<q.t?-1:1});
  return h+'<section class="dia"><h2 class="sec">'+cap(longDate(d))+(f?'. Feriado: '+escH(f):'')+'</h2>'+(it.length?it.map(function(x){return x.h}).join(''):'<p class="empty">Dia livre.</p>')+'<div class="inline"><button class="btn sm" data-act="slot" data-d="'+d+'" data-h="09:00">Marcar sessão neste dia</button></div></section>';
}
/* mês no jeito do Controle Único (14/11/2026): um cartão por dia com a pílula "N sessões" e os horários embaixo,
   "livre" no dia sem sessão, fim de semana sombreado, feriado com o nome e contorno, hoje em destaque,
   dias de fora do mês apagados; no alto, sessões no mês, previsto no mês e pacientes ativos. */
function agMes(){
  var ref=parse(UI.agRef), y=ref.getFullYear(), mo=ref.getMonth(), first=new Date(y,mo,1), start=monday(first);
  /* números do mês (sessões, previsto, pacientes ativos) tirados a pedido dele em 14/11/2026, por enquanto */
  var h='';
  h+='<div class="mo2">'+['seg','ter','qua','qui','sex','sáb','dom'].map(function(x,i){return '<div class="dh'+(i>4?' fds':'')+'">'+x+'</div>'}).join('');
  for(var i=0;i<42;i++){ var dt=addDays(start,i), d=iso(dt), out=dt.getMonth()!==mo; if(i%7===0&&i>=28&&out)break;
    var l=sessOn(d).filter(viva), cs=compsOn(d), f=feriado(d), w=dt.getDay(), fds=(w===0||w===6);
    var hs=l.map(function(s){var m=s.hora.slice(3);return Number(s.hora.slice(0,2))+'h'+(m!=='00'?m:'')});
    var cls=(out?' out':'')+(fds?' fds':'')+(f?' isfer':'')+(d===TODAY?' is-today':'');
    h+='<button data-act="ag-day" data-d="'+d+'" class="'+cls.trim()+'" aria-pressed="'+(d===UI.agDay)+'" aria-label="'+longDate(d)+', '+plural(l.length,'sessão','sessões')+(f?', feriado: '+escH(f):'')+'">'
      +'<span class="n">'+dt.getDate()+niverSel(d)+'</span>'
      +(f?'<span class="fer">Feriado · '+escH(f)+'</span>':'')
      +(l.length?'<span class="pil"><b>'+l.length+'</b> '+(l.length>1?'sessões':'sessão')+'</span><span class="hs">'+hs.join(' · ')+'</span>':'<span class="pil livre">livre</span>')
      +(cs.length?'<span class="cp">'+plural(cs.length,'compromisso','compromissos')+'</span>':'')
      +'</button>'; }
  h+='</div><p class="mo2-leg"><span class="lg-nv">'+CHAPEU+'Aniversário de paciente</span><span><i class="lg-dia"></i>Dia de semana</span><span><i class="lg-fds"></i>Sábado e domingo</span><span><i class="lg-fer"></i>Feriado nacional ou do Espírito Santo</span></p>';
  var nvSec='<section class="nv-sec"><h2 class="sec">Aniversariantes de '+MES[mo]+'</h2>'+niverMesH(y+'-'+pad(mo+1))+'</section>';
  var l2=sessOn(UI.agDay), f2=feriado(UI.agDay), it=l2.map(function(s){return {t:s.hora,h:slH(s)}});
  compsOn(UI.agDay).forEach(function(o){it.push({t:o.ini,h:compH(o)})});
  it.sort(function(p,q){return p.t<q.t?-1:1});
  return h+'<section class="dia"><h2 class="sec">'+cap(longDate(UI.agDay))+', '+plural(l2.filter(viva).length,'sessão','sessões')+(f2?'. Feriado: '+escH(f2):'')+'</h2>'+(it.length?it.map(function(x){return x.h}).join(''):'<p class="empty">Dia livre.</p>')+'<div class="inline"><button class="btn sm" data-act="slot" data-d="'+UI.agDay+'" data-h="09:00">Marcar sessão neste dia</button><button class="btn sm" data-act="cp-new" data-d="'+UI.agDay+'">Novo compromisso</button></div></section>'+nvSec;
}

/* ---------- menu do horário ---------- */
var POP=null, JUSTDRAG=false, DRG=null;
function popOpen(o,el){POP=o;POP.r=el&&el.getBoundingClientRect?el.getBoundingClientRect():null;popDraw()}
function popClose(){POP=null;var e=$('#pop');if(e){e.hidden=true;e.innerHTML=''}}
function popDraw(){var e=$('#pop');if(!POP){popClose();return}
  var body=POP.k==='s'?popSess():POP.k==='v'?popVazio():POP.k==='c'?popComp():POP.k==='mv'?popMove():popCMove();
  if(!body){popClose();return}
  e.innerHTML='<button class="pp-x" data-act="pop-x" aria-label="Fechar">'+X_+'</button>'+body;e.hidden=false;popPlace();
  var f=e.querySelector('input,.pp-main .btn');if(f)try{f.focus({preventScroll:true})}catch(_){}
}
function popPlace(){var e=$('#pop');
  if(innerWidth<700){e.style.left='';e.style.top='';return}
  var w=e.offsetWidth,hh=e.offsetHeight,r=POP.r;
  if(!r){e.style.left=Math.round((innerWidth-w)/2)+'px';e.style.top='96px';return}
  var x=r.right+10;if(x+w>innerWidth-12)x=r.left-w-10;if(x<12)x=Math.max(12,Math.min(innerWidth-w-12,r.left));
  var y=Math.min(r.top-8,innerHeight-hh-12);e.style.left=Math.round(x)+'px';e.style.top=Math.round(Math.max(12,y))+'px'}
function ppB(act,t,pri,extra){return '<button class="btn sm'+(pri?' pri':'')+'" data-act="'+act+'"'+(extra||'')+'>'+t+'</button>'}
function popSess(){
  var s=sessById(POP.id);if(!s)return '';
  var p=pac(s.pid), e=estado(s), reg=s.status==='realizada'||s.status==='falta', viva=s.status==='agendada'||s.status==='confirmada';
  var h='<h4>'+avM(p,'m')+escH(p.nome)+'</h4><p class="pp-sub">'+cap(longDate(s.date))+', '+s.hora+' às '+hOf(minOf(s.hora)+DUR)+'. '+p.mod+'.'+(s.de?' Remarcada: o horário de sempre era '+dm(s.de.date)+', '+s.de.hora+'.':s.extra?' Encaixe.':'')+'</p>';
  var fi=faltaInfo(s); h+='<p class="pp-st">'+rastroH(s)+'<span class="falta '+fi.k+'">'+fi.t+'</span>'+(s.status!=='cancelada'&&!s.cortesia?saldoSpan(s,true):'')+'</p>';
  if(POP.falta)return h+'<p class="pp-q">Cobrar esta falta?</p><div class="pp-main">'+ppB('pp-falta','Cobrar a falta',true,' data-c="1"')+ppB('pp-falta','Não cobrar',false,' data-c="0"')+'</div>';
  var main;
  if(e==='aconf')main=ppB('pp-st','Aconteceu',true,' data-st="realizada"')+ppB('pp-falta-ask','Faltou');
  else if(e==='agendada')main=ppB('pp-st','Paciente confirmou',true,' data-st="confirmada"')+ppB('pp-lemb','Copiar lembrete');
  else if(e==='confirmada')main=ppB('pp-lemb','Copiar lembrete',true)+ppB('pp-mv','Remarcar');
  else if(reg)main='<button class="btn sm'+(s.nota?'':' pri')+'" data-cd="abrir" data-sid="'+s.id+'">'+(s.nota?'Abrir o prontuário':'Escrever no prontuário')+'</button>'+ppB('pp-full','Pagamento e recibo');
  else main=ppB('pp-st','Voltar para a agenda',true,' data-st="agendada"');
  var L=[];
  if(viva&&e!=='confirmada')L.push('<button data-act="pp-mv">Remarcar<small>outro dia ou hora</small></button>');
  if(s.status!=='cancelada')L.push('<button data-act="pp-cort">'+(s.cortesia?'Tirar a cortesia':'Cortesia')+'<small>'+(s.cortesia?'volta a cobrar':'esta sessão não cobra')+'</small></button>');
  if(viva)L.push('<button data-act="pp-nh" class="bad">Não haverá<small>não cobra e fica registrado</small></button>');
  if(reg)L.push('<button data-act="pp-st" data-st="agendada">Tirar a marca<small>volta a ficar a confirmar</small></button>');
  return h+'<div class="pp-main">'+main+'</div>'+(L.length?'<div class="pp-list">'+L.join('')+'</div>':'');
}
function popVazio(){
  var d=POP.d, x=POP.h, f=feriado(d), exp=noExp(d,x), di=isDisp(d,x), w=parse(d).getDay();
  var h='<h4>'+cap(longDate(d))+'</h4><p class="pp-sub">'+pad(x)+':00. '+(f?'Feriado: '+escH(f)+'. ':'')+(exp?(di?'Disponível para novos pacientes.':'Livre no seu horário de atendimento.'):'Fora do seu horário de atendimento.')+'</p>';
  h+='<div class="pp-main">'+ppB('pp-ns','Marcar sessão',true)+ppB('pp-cpnew','Novo compromisso')+'</div>';
  if(exp)h+='<div class="pp-list"><button data-act="pp-disp">'+(di?'Deixar de oferecer':'Oferecer a novos pacientes')+'<small>'+(w===0||w===6?'todo ':'toda ')+DOWL[w]+', '+pad(x)+':00</small></button></div>';
  return h;
}
function popComp(){
  var c=compById(POP.id);if(!c)return '';var o=compOcc(c,POP.orig);if(!o)return '';
  var rep=c.rep!=='nao', w=parse(c.date).getDay();
  var h='<h4>'+escH(c.tit)+'</h4><p class="pp-sub">'+cap(longDate(o.date))+', '+o.ini+' às '+o.fim+'.'+(c.onde?' '+escH(c.onde)+'.':'')+'</p>';
  h+='<p class="pp-st"><span class="muted">'+(rep?(c.rep==='semana'?(w===0||w===6?'Todo ':'Toda ')+DOWL[w]+'.':'Todo dia '+parse(c.date).getDate()+'.'):'Não repete.')+(o.mov?' Nesta vez, em outro horário.':'')+'</span></p>'+(c.nota?'<p class="pp-q">'+escH(c.nota)+'</p>':'');
  h+='<div class="pp-main">'+ppB('pp-cpedit','Alterar',true)+ppB('pp-cpx',rep?'Não vai acontecer nesta vez':'Apagar')+'</div>';
  if(o.mov)h+='<div class="pp-list"><button data-act="pp-cpback">Voltar ao horário de sempre<small>'+dm(o.orig)+', '+c.ini+'</small></button></div>';
  return h;
}
function popMove(){
  var s=sessById(POP.id);if(!s)return '';var p=pac(s.pid), d=POP.d||s.date, hr=POP.h||s.hora;
  var h='<h4>Remarcar '+escH(curto(p))+'</h4><p class="pp-sub">Marcada para '+longDate(s.date)+', '+s.hora+'.</p>';
  h+='<div class="pp-form"><div class="grid2"><div class="field"><label for="pm-d">Novo dia</label><input id="pm-d" type="date" value="'+d+'"></div><div class="field"><label for="pm-h">Hora</label><input id="pm-h" type="time" step="900" value="'+hr+'"></div></div><p class="err" id="pm-e" hidden></p></div>';
  return h+'<div class="pp-main">'+ppB('pm-ok','Só nesta data',true,' data-m="1"')+ppB('pm-ok','Mudar o horário fixo',false,' data-m="fixo"')+'</div><p class="pp-hint">Mudar o horário fixo leva as próximas sessões para o novo dia e hora.</p>';
}
function popCMove(){
  var c=compById(POP.id);if(!c)return '';
  return '<h4>'+escH(c.tit)+'</h4><p class="pp-sub">Para '+longDate(POP.d)+', '+POP.ini+' às '+POP.fim+'.</p><div class="pp-main">'+ppB('cm-ok','Só nesta vez',true,' data-m="1"')+ppB('cm-ok','Todas as vezes',false,' data-m="all"')+'</div>';
}
addEventListener('scroll',function(){if(POP&&innerWidth>=700&&!DRG)popClose()},{passive:true});
addEventListener('resize',function(){if(POP&&innerWidth>=700)popClose()});

/* ---------- arrastar para remarcar (mouse e caneta; no toque, Remarcar no menu) ---------- */
document.addEventListener('pointerdown',function(ev){
  JUSTDRAG=false;
  var b=ev.target.closest&&ev.target.closest('.ev[data-drag]');if(!b||ev.button!==0||UI.route!=='app-agenda')return;
  var r=b.getBoundingClientRect(),dur=DUR;
  if(b.dataset.drag==='c'){var c=compById(Number(b.dataset.id)),o=c&&compOcc(c,b.dataset.orig);if(!o)return;dur=minOf(o.fim)-minOf(o.ini)}
  DRG={el:b,x0:ev.clientX,y0:ev.clientY,off:ev.clientY-r.top,on:false,k:b.dataset.drag,id:Number(b.dataset.id),orig:b.dataset.orig,dur:dur};
});
document.addEventListener('pointermove',function(ev){
  if(!DRG)return;
  if(!DRG.on){if(Math.abs(ev.clientX-DRG.x0)+Math.abs(ev.clientY-DRG.y0)<6)return;DRG.on=true;popClose();DRG.el.classList.add('drag-src');document.body.style.userSelect='none'}
  ev.preventDefault();
  var col=null;$$('.wk-col').forEach(function(c){var r=c.getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<r.right)col=c});
  if(!col){if(DRG.g)DRG.g.remove();DRG.t=null;return}
  var r=col.getBoundingClientRect(),m=Math.round(((ev.clientY-DRG.off-r.top)/ROW*60+H0*60)/15)*15;
  m=Math.max(H0*60,Math.min((H1+1)*60-Math.min(DRG.dur,60),m));
  var d=col.dataset.d,hr=hOf(m),bad=DRG.k==='s'&&conflito(d,hr,DRG.id);DRG.t={d:d,h:hr,m:m,bad:!!bad};
  var g=DRG.g||(DRG.g=document.createElement('div'));g.className='ev-drop'+(bad?' no':'');
  if(g.parentNode!==col)col.appendChild(g);
  g.style.top=((m/60-H0)*ROW+1)+'px';g.style.height=Math.max(22,DRG.dur/60*ROW-2)+'px';
  g.textContent=DOW[parse(d).getDay()]+' '+dm(d)+', '+hr+(bad?'. Ocupado':'');
});
document.addEventListener('pointerup',function(){
  if(!DRG)return;var D=DRG;DRG=null;document.body.style.userSelect='';
  if(!D.on)return;JUSTDRAG=true;setTimeout(function(){JUSTDRAG=false},0);
  var rect=D.g&&D.g.parentNode?D.g.getBoundingClientRect():null;if(D.g)D.g.remove();D.el.classList.remove('drag-src');
  if(!D.t)return;
  if(D.k==='s'){var s=sessById(D.id);if(!s||(D.t.d===s.date&&D.t.h===s.hora))return;
    if(D.t.bad){toast('Nesse horário já tem sessão. Escolha outro.');return}
    changedU(remarcar(s,D.t.d,D.t.h,false));return}
  var cp=compById(D.id),o=cp&&compOcc(cp,D.orig);if(!o)return;
  var dur=minOf(o.fim)-minOf(o.ini),ini=D.t.h,fim=hOf(D.t.m+dur);
  if(D.t.d===o.date&&ini===o.ini)return;
  if(cp.rep!=='nao'&&!o.mov){POP={k:'cm',id:cp.id,orig:D.orig,d:D.t.d,ini:ini,fim:fim,r:rect};popDraw();return}
  mark();moveComp(cp,D.orig,D.t.d,ini,fim,true);changedU(cp.tit+' passou para '+DOWL[parse(D.t.d).getDay()]+', '+ini+'.');
});

/* ---------- app: Pacientes ---------- */
/* A lista de pacientes mora em js/pacientes.js; aqui só a chamada. */
/* rosto pequeno ao lado do nome, em todas as telas (js/personagens.js, 23/11/2026) */
function avM(p,t){return window.RastroPersonagens&&window.RastroPersonagens.mini?window.RastroPersonagens.mini(p,t):''}
function vPacientes(){ if(UI.pid&&pac(UI.pid)) return vPaciente(pac(UI.pid)); return window.RastroPacientes.vista(); }
function vPaciente(p){
  var ss=S.sess.filter(function(s){return s.pid===p.id}).sort(function(a,b){return a.date<b.date?1:-1});
  var feitas=ss.filter(function(s){return s.status==='realizada'}).length, sd=saldo(p.id), nx=proxima(p.id);
  /* avatar da ficha e o editor dele (js/personagens.js, 23/11/2026) */
  var AV=window.RastroPersonagens&&window.RastroPersonagens.cabeca?window.RastroPersonagens:null;
  var h='<div class="head">'+(AV?AV.cabeca(p):'')+'<div><button class="link" data-act="pac-back">Todos os pacientes</button><h1 class="serif">'+escH(p.nome)+'</h1></div><span class="sp"></span>'+maisH(p.ativo?'<button data-act="pac-enc" class="c-bad">Encerrar atendimento</button>':'<button data-act="pac-reativar">Retomar atendimento</button>')+'<button class="btn pri sm" data-act="sess-new" data-pid="'+p.id+'">Marcar sessão</button></div>'+(AV?AV.editor(p):'');
  var T=[['resumo','Resumo'],['prontuario','Prontuário'],['caderno','Caderno'],['financeiro','Financeiro'],['documentos','Documentos']];
  h+='<div class="tabs" role="tablist">'+T.map(function(t){return '<button role="tab" data-act="ptab" data-t="'+t[0]+'" aria-selected="'+(UI.ptab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
  if(UI.ptab==='resumo'){
    h+='<div class="panel"><dl class="kv">'+(p.resp?'<dt>'+(p.tipo==='Casal'?'Parceiros':'Responsável')+'</dt><dd>'+escH(p.resp)+'</dd>':'')+nascKv(p)+'<dt>Dia e hora</dt><dd>'+cap(DOWL[p.dow%7])+', '+p.hora+'</dd><dt>Frequência</dt><dd>'+(p.freq===7?'Toda semana':'A cada 15 dias')+'</dd><dt>Valor</dt><dd class="num">'+brl(p.valor)+'</dd></dl>'+((!nx&&p.ativo)||UI.confirmEnc?'<div class="inline">'+(!nx&&p.ativo&&!UI.confirmEnc?'<button class="btn sm" data-act="convite" data-id="'+p.id+'">Convidar para a próxima sessão</button>':'')+(UI.confirmEnc?'<span>Encerrar e cancelar as sessões futuras?</span><button class="btn sm danger" data-act="pac-enc-ok">Encerrar</button><button class="btn sm" data-act="pac-enc-no">Manter</button>':'')+'</div>':'')+'</div>';
  } else if(UI.ptab==='caderno'){
    h+=window.RastroCaderno?window.RastroCaderno.ficha(p):'';
  } else if(UI.ptab==='prontuario'){
    h+=vCaderno(p);
  } else if(UI.ptab==='financeiro'){
    var f=ss.filter(function(s){return due(s)});
    h+='<div class="panel"><h3>'+plural(f.length,'sessão cobrada','sessões cobradas')+'. <small>Total: '+brl(f.reduce(function(t,s){return t+s.valor},0))+'.</small></h3><div class="rows">'+(f.length?f.map(function(s){return sessRow(s,true)}).join(''):'<p class="empty">Nada cobrado ainda.</p>')+'</div><div class="inline"><button class="btn sm" data-act="decl" data-id="'+p.id+'">Declaração para reembolso</button></div></div>';
  } else {
    h+='<div class="panel"><div class="rows"><button class="row" data-act="doc" data-k="contrato"><span class="t muted" style="font-weight:400">Doc</span><span class="d">Contrato de atendimento '+p.mod.toLowerCase()+'<small>Valor, dia, faltas, sigilo e o que fazer em urgência.</small></span><span class="v c-acc">Abrir</span></button><button class="row" data-act="doc" data-k="termo"><span class="t muted" style="font-weight:400">Doc</span><span class="d">Termo de consentimento<small>'+(p.tipo==='Adolescente'||p.tipo==='Criança'?'Assinado pelo responsável.':'Assinado pelo paciente.')+'</small></span><span class="v c-acc">Abrir</span></button><button class="row" data-act="decl" data-id="'+p.id+'"><span class="t muted" style="font-weight:400">Doc</span><span class="d">Declaração para reembolso<small>Por mês, trimestre ou ano.</small></span><span class="v c-acc">Gerar</span></button></div></div>';
  }
  return h;
}

/* ---------- app: Prontuário (menu lateral) ----------
   Entrada direta: o que falta registrar de todos os pacientes e a lista para abrir o caderno de cada um,
   sem passar pela ficha. Aberto um paciente, mostra o mesmo caderno da aba Prontuário. */
function abreCad(pid,sid){UI.pid=pid;CAD.pid=pid;CAD.sid=sid||null;CAD.sit=null;CAD.pick=null;CAD.edit=false;CAD.pop=null}
function porRegistrar(pid){return S.sess.filter(function(s){return (pid==null||s.pid===pid)&&(s.status==='realizada'||s.status==='falta')&&!s.nota}).sort(function(a,b){return a.date<b.date?-1:(a.date>b.date?1:(a.hora<b.hora?-1:1))})}
/* há quantos dias a sessão espera o registro (depois de 2 dias, em destaque: é o prazo do registro tardio) */
function parado(s){return Math.round((new Date(TODAY+'T12:00')-new Date(s.date+'T12:00'))/864e5)}
function paradoT(s){var n=parado(s);return n<=0?'de hoje':n===1?'desde ontem':'há '+n+' dias'}
function vProntuario(){
  if(UI.pid&&pac(UI.pid)){var p=pac(UI.pid), n=cadList(p.id).filter(function(s){return !isFut(s)}).length;
    return '<div class="head">'+avM(p,'l')+'<div><button class="link" data-act="pr-back">Todos os prontuários</button><h1 class="serif">'+escH(p.nome)+'</h1></div><span class="sp"></span><button class="btn sm" data-act="pac" data-id="'+p.id+'">Ficha do paciente</button><p>'+p.tipo+'. '+p.mod+'. '+(p.ativo?cap(DOWL[p.dow%7])+' às '+p.hora+'. ':'Encerrado. ')+plural(n,'sessão','sessões')+' no prontuário.</p></div>'+vCaderno(p);}
  /* 18/11/2026: mesmo desenho da tela Hoje (painel de pontos): quantas faltam no mostrador e uma linha por sessão com os cinco pontos */
  var pend=porRegistrar(), PN=window.RastroHoje||{}, np=pend.length, velha=np?parado(pend[0]):0;
  var h='<div class="pn"><h1 class="pn-data">Prontuário</h1><div class="pn-topo">'+(PN.pm?PN.pm(String(np),'pm-g',plural(np,'sessão por registrar','sessões por registrar')):'')+'<div class="pn-cap"><p class="pn-ct">'+(np===1?'sessão por registrar':'sessões por registrar')+'</p><p class="pn-c3">'+(!np?'Tudo registrado.':velha>0?'A mais antiga espera '+paradoT(pend[0])+'.':'Todas de hoje.')+'</p></div></div>';
  if(np)h+='<div class="pn-q">'+(PN.cab?PN.cab():'')+pend.map(function(s){return '<button class="pn-r" data-act="pr-open" data-id="'+s.pid+'" data-sid="'+s.id+'"><span class="h">'+dm(s.date)+'</span><span class="n">'+avM(pac(s.pid))+escH(pac(s.pid).nome)+'<small'+(parado(s)>2?' class="c-warn"':'')+'>'+paradoT(s)+'</small></span>'+(PN.pts?PN.pts(s):rastroH(s))+'<span class="pn-a">Registrar</span></button>'}).join('')+(PN.leg?PN.leg():'')+'</div>';
  var l=S.pac.slice().sort(function(a,b){return a.ativo===b.ativo?a.nome.localeCompare(b.nome):(a.ativo?-1:1)});
  h+='<div class="btnrow"><div style="flex:1;min-width:180px;max-width:320px"><input id="pbusca" type="search" placeholder="Buscar pelo nome" aria-label="Buscar prontuário pelo nome"></div></div>';
  h+='<div class="panel pr-todos'+(UI.prTodos?' aberto':'')+'"><div class="rows" id="plist">';
  h+=l.map(function(p){ var c=cadList(p.id).filter(function(s){return !isFut(s)}), reg=c.filter(function(s){return s.nota}), ult=reg[reg.length-1], np=porRegistrar(p.id).length;
    return '<button class="row" data-act="pr-open" data-id="'+p.id+'" data-nome="'+escH(p.nome.toLowerCase())+'"><span class="t muted" style="font-weight:400">'+(p.ativo?DOW[p.dow%7]:'')+'</span><span class="d">'+avM(p)+escH(p.nome)+'</span><span class="v">'+(np?'<span class="c-warn">'+np+'</span>':'')+'</span></button>'; }).join('');
  return h+'</div></div>'+(UI.prTodos?'':'<button class="link pr-ver" data-act="pr-todos">Ver todos os prontuários</button>')+'</div>';
}

/* ---------- app: caderno do paciente (aba Prontuário) ----------
   Uma sessão por vez, escrita direto na folha. A folha segue o modelo de prontuário do Matheus
   (Prontuário Psicológico.docx): título no cabeçalho, rótulos em negrito, entrelinha 1,15, título da seção
   em negrito sublinhado, Times 10 justificado, assinatura e rodapé, borda dupla, A4 com margens 3 cm e 2,5 cm.
   Os textos padrão vêm de modelos-prontuario.js do Controle Único. */
var FOLHA_DEF={preset:'word',esp:'word',borda:'dupla',titulo:true,lh:false,ids:{pront:1,nome:1,cpf:1,tel:1,data:1,sessao:1},idsBold:true,idsRow:false,fonte:'times',tam:10,just:true,sub:true,cor:false,assin:true,rod:true,tc:'#2C4E9E',nome:'Seu nome completo',prof:'Psicólogo Clínico',crp:'CRP 00/00000',cid:'Cidade, UF',mail:'seuemail@exemplo.com'};
var FOLHA_PRE={word:{esp:'word',borda:'dupla',titulo:true,lh:false,idsBold:true,idsRow:false,fonte:'times',tam:10,just:true,sub:true,cor:false,assin:true,rod:true},
 timbre:{esp:'ar',borda:'nenhuma',titulo:false,lh:true,idsBold:false,idsRow:true,fonte:'lit',tam:11,just:true,sub:false,cor:true,assin:false,rod:true},
 limpa:{esp:'ar',borda:'nenhuma',titulo:false,lh:false,idsBold:false,idsRow:true,fonte:'arial',tam:11,just:false,sub:false,cor:false,assin:false,rod:false}};
function FC(){if(!S.folha)S.folha=JSON.parse(JSON.stringify(FOLHA_DEF));return S.folha}
/* nome e data não se desligam: são a identificação mínima da Res. CFP 001/2009, art. 2º, I */
var ID_FIXO={nome:1,data:1};
function idOn(k){if(ID_FIXO[k])return true;var v=FC().ids[k];return v===undefined?true:!!v}
var CAD={sid:null,pid:null,sit:null,pick:null,edit:false,pop:null,full:false,panel:false,undo:null};
var CAD_SIT=[['Sessão realizada','abre a próxima'],['Falta','conta como realizada'],['Remarcada','muda a data, mesmo número'],['Não haverá','passa para a semana seguinte']];
function gen(p){return p.genero||GEN[p.id]||'F'}
function suj(p){var g=gen(p);return g==='C'?'o casal':g==='M'?'o paciente':'a paciente'}
function aSuj(p){var g=gen(p);return g==='C'?'ao casal':g==='M'?'ao paciente':'à paciente'}
function nomeP(p){return gen(p)==='C'?'O casal':p.nome.split(' ')[0]}
function capF(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function lac(l){return '<span class="lac" data-l="'+escH(l)+'">'+escH(l)+'</span>'}
function cadList(pid){var l=S.sess.filter(function(s){return s.pid===pid&&(s.status==='realizada'||s.status==='falta')}).sort(function(a,b){return a.date<b.date?-1:(a.date>b.date?1:(a.hora<b.hora?-1:1))});
  l.forEach(function(s,i){s._n=i+1}); var nx=proxima(pid); if(nx){nx._n=l.length+1;l.push(nx)} return l}
function isFut(s){return s.status==='agendada'||s.status==='confirmada'}
function ativOf(s){if(s.ativ)return s.ativ;var m=/Plano: ?(.+)/.exec(s.nota||'');return m?m[1].replace(/\.$/,'').replace(/^./,function(c){return c.toLowerCase()}):''}
function cadPrev(l,i){for(var k=i-1;k>=0;k--){if(l[k].status==='realizada'&&l[k].nota)return ativOf(l[k])}return ''}
function cadSit(s){if(CAD.sit!==null)return CAD.sit;return isFut(s)?-1:(s.status==='falta'?1:0)}
/* ---------- modelos de pré-texto (23/11/2026, pedido de Matheus) ----------
   O texto que abre em cada registro vem do modelo do tipo de atendimento (adulto, casal, criança ou adolescente),
   escolhido sozinho pelo cadastro. Cada modelo é uma lista de linhas; em cada linha {campo} vira campo em vermelho,
   {a|b} vira escolha de um toque, e as variáveis de PR_VARS o app preenche sozinho. Quem usa edita tudo em
   Configurações → Prontuário (js/modelos.js). O registro aprovado guarda o texto final, então mudar o modelo nunca
   mexe no que já foi aprovado. Os modelos ficam fora dos dados de exemplo (chave própria), para não sumirem
   quando o exemplo recomeça. */
var PR_SIT=[['primeira','Primeira sessão','Abre no registro da sessão 01.'],['sessao','Sessão','Toda sessão realizada.'],['falta','Falta','Quando a situação é Falta.'],['remarcada','Remarcada','Vai para o Registro Complementar.'],['naohavera','Não haverá','Vai para o Registro Complementar da sessão seguinte.'],['dem','Demanda e objetivos','Escrito uma vez por paciente.'],['enc','Encaminhamento ou encerramento','Escrito quando o trabalho termina.']];
var PR_TIPOS=[['adulto','Adulto'],['casal','Casal'],['crianca','Criança ou adolescente']];
var PR_VARS=[['quem relatou','quem trouxe o relato (no casal e na criança, troca com um toque)'],['o paciente','"o paciente", "a paciente" ou "o casal", pelo cadastro (com O maiúsculo no começo da frase)'],['ao paciente','"ao paciente", "à paciente" ou "ao casal"'],['nome','o primeiro nome'],['tarefa anterior','o que ficou combinado na sessão anterior (a linha só aparece se houver)'],['data da sessão','a data desta sessão'],['modalidade','online ou presencial'],['frequência','semanais ou quinzenais'],['dia e horário','o dia e a hora fixos, como "às quartas-feiras, às 16h"'],['último atendimento','a data da última sessão realizada']];
var PR_SEC_DEF={dem:'Avaliação da Demanda e Objetivos do Trabalho',evol:'Registro da Evolução do Trabalho',comp:'Registro Complementar (Entre Sessões)',enc:'Registro de Encaminhamento ou Encerramento'};
function prBase(t){
  var c=t==='casal', k=t==='crianca', L=function(a){return a.map(function(x){return {t:x}})};
  return {
    primeira:L(k?['O atendimento foi realizado com {pais ou responsável}, para levantamento inicial de informações clínicas relevantes para a compreensão e formulação do caso.','{Pais ou responsável} relatou {demanda e relatos relevantes}.','Foram discutidos aspectos relacionados ao funcionamento de {nome}, incluindo {aspectos relevantes}.','Ao final do atendimento, foi solicitada a assinatura do Termo de Autorização para Atendimento de Crianças e Adolescentes.']
      :['Durante o atendimento, foi realizado o levantamento inicial de informações clínicas relevantes para a compreensão e formulação do caso.',(c?'O casal relatou':'{nome} relatou')+' {demandas e relatos relevantes}.','De forma colaborativa, foi estabelecido como objetivo terapêutico inicial {objetivo terapêutico}.','Como atividade para a semana, ficou acordado que {o paciente} {atividade}.']),
    sessao:L(['No início do atendimento, {quem relatou} relatou os acontecimentos desde o último encontro, incluindo {o que trouxe}.',
      k?'A atividade acordada anteriormente ({tarefa anterior}) foi revisada durante a sessão.':'{nome} {realizou|não realizou} a atividade acordada anteriormente ({tarefa anterior}), a qual foi revisada durante a sessão.',
      k?'Durante o atendimento, foi trabalhado {tema}, por meio de {atividade ou intervenção}, buscando {objetivo}.':'Durante o atendimento, '+(c?'foram trabalhados {aspectos ou dificuldades}, buscando {objetivo}.':'foi trabalhado {tema}, com o objetivo de {objetivo}.'),
      'Como atividade para a próxima semana, ficou acordado'+(c?', de forma colaborativa,':'')+' que {o paciente} {atividade}.']),
    falta:L(['{O paciente} não compareceu à sessão no horário previamente acordado e não apresentou justificativa prévia ao psicólogo.']),
    remarcada:L(['No período entre as sessões ({data do contato}), {o paciente} entrou em contato com o psicólogo (via WhatsApp) solicitando o reagendamento da consulta semanal. Diante disso, ficou acordado que o próximo encontro será realizado no dia {nova data}.']),
    naohavera:L(['No período entre as sessões ({data do contato}), o psicólogo informou {ao paciente} que a consulta do dia {data da sessão} não será realizada em decorrência de {motivo}.']),
    dem:L([(k?'{Pais ou responsável} buscou':'{O paciente} buscou')+' atendimento psicológico em razão de {motivo da procura}.','O acompanhamento ocorre na modalidade {modalidade}, com sessões {frequência} {dia e horário}.','De forma colaborativa, foram definidos como objetivos do trabalho {objetivos}.']),
    enc:L(['No dia {data do encerramento}, o processo terapêutico foi encerrado em razão de {motivo do encerramento}, sendo o último atendimento realizado em {último atendimento}.','Encaminhamento: {nenhum, ou a quem e com que finalidade}.'])};
}
function prFrasesSeed(){var n=0;return [
 ['Atraso','{nome} compareceu ao atendimento com {minutos} minutos de atraso.'],
 ['OQ-45.2 discutido','Durante a sessão, foram discutidos os resultados do preenchimento semanal do OQ-45.2, com exploração dos itens avaliados negativamente.'],
 ['OQ-45.2 não preenchido','{nome} não realizou o preenchimento prévio do OQ-45.2, ficando acordado que o instrumento seria preenchido após o término da sessão.'],
 ['Psicoeducação','Além disso, foi realizado a psicoeducação acerca de {tema}, buscando {objetivo}.'],
 ['Técnica','Além disso, foi realizado {técnica específica}, buscando {objetivo}.'],
 ['Instrumentos','Ao final do atendimento, foi solicitado que {o paciente} preenchesse os seguintes instrumentos, com o objetivo de complementar a avaliação clínica: {instrumentos}.'],
 ['Encaminhamento','Por fim, foi discutida a necessidade de {avaliação}, sendo realizado encaminhamento para {profissional ou serviço}.'],
 ['Mudança de horário','Por fim, ficou acordado que os atendimentos passarão a ocorrer {dia e hora novos}, sendo a alteração iniciada a partir da próxima sessão.'],
 ['Aviso do psicólogo','Por fim, o psicólogo informou {ao paciente} que a consulta do dia {data} não será realizada em decorrência de {motivo}.']
].map(function(x){return {id:'f'+(++n),n:x[0],t:x[1]}})}
var PRC=null;
function PR(){ if(PRC)return PRC;
  try{PRC=JSON.parse(localStorage.getItem(KEY+'-pront'))}catch(e){PRC=null}
  if(!PRC||!PRC.mod)PRC={mod:{},frases:prFrasesSeed(),sec:{}};
  PR_TIPOS.forEach(function(t){var b=prBase(t[0]);if(!PRC.mod[t[0]])PRC.mod[t[0]]={};PR_SIT.forEach(function(s){if(!PRC.mod[t[0]][s[0]])PRC.mod[t[0]][s[0]]=b[s[0]]})});
  if(!PRC.frases)PRC.frases=prFrasesSeed(); if(!PRC.sec)PRC.sec={};
  return PRC }
function prSave(){try{localStorage.setItem(KEY+'-pront',JSON.stringify(PR()))}catch(e){}}
function secNome(k){var v=PR().sec[k];return (v&&v.trim())||PR_SEC_DEF[k]}
function tipoMod(p){return p.tipo==='Casal'?'casal':(p.tipo==='Adolescente'||p.tipo==='Criança')?'crianca':'adulto'}
function ultimoAtend(p){var d=S.sess.filter(function(s){return s.pid===p.id&&s.status==='realizada'}).map(function(s){return s.date}).sort().pop();return d||''}
function prVar(k,p,s,pv){ var low=k.toLowerCase(), cap1=k.charAt(0)!==k.charAt(0).toLowerCase();
  if(low==='quem relatou')return quemH(p);
  if(low==='o paciente')return escH(cap1?capF(suj(p)):suj(p));
  if(low==='ao paciente')return escH(cap1?capF(aSuj(p)):aSuj(p));
  if(low==='nome')return escH(nomeP(p));
  if(low==='tarefa anterior')return escH(pv||'');
  if(low==='data da sessão')return s&&s.date?dmy(s.date):lac('data da sessão');
  if(low==='modalidade')return escH((p.mod||'online').toLowerCase());
  if(low==='frequência')return p.freq===14?'quinzenais':'semanais';
  if(low==='dia e horário'){var dw=p.dow%7;return escH((dw===0||dw===6?'aos '+DOWL[dw]+'s':'às '+DOWL[dw]+'s-feiras')+', às '+String(p.hora).replace(/:00$/,'h').replace(':','h'))}
  if(low==='último atendimento'){var u=ultimoAtend(p);return u?dmy(u):lac('último atendimento')}
  return null }
/* uma escolha {a|b}: botões de um toque; o estado fica no próprio HTML (aria-pressed), então vale para várias por texto */
function pickH(o){return '<span class="cd-pick" contenteditable="false" data-l="'+escH(o.join(' ou '))+'">'+o.map(function(x,j){return '<button data-cd="pick" data-o="'+j+'" aria-pressed="false">'+escH(x)+'</button>'}).join('')+'</span>'}
function linhaH(t,p,s,pv){
  if(/\{tarefa anterior\}/i.test(t)&&!pv)return '';
  if(s&&s.comp)t=t.replace(/^No período entre (as )?sessões/,'Ainda no período entre as sessões');
  var out='',last=0,re=/\{([^{}]+)\}/g,m;
  while((m=re.exec(t))){out+=escH(t.slice(last,m.index));var k=m[1].trim(),v=prVar(k,p,s,pv);
    if(v!==null)out+=v; else if(k.indexOf('|')>=0)out+=pickH(k.split('|').map(function(x){return x.trim()}).filter(Boolean)); else out+=lac(k);
    last=re.lastIndex}
  return out+escH(t.slice(last)) }
function modeloH(p,s,k,pv){return (PR().mod[tipoMod(p)][k]||[]).map(function(x){return linhaH(x.t||'',p,s,pv)}).filter(function(x){return x.trim()}).map(function(x){return '<p>'+x+'</p>'}).join('')}
function cadBody(p,s,l,i,sit){
  var pv=cadPrev(l,i), k=sit===0?(s._n===1&&PR().mod[tipoMod(p)].primeira.length?'primeira':'sessao'):sit===1?'falta':sit===2?'remarcada':'naohavera';
  var h=modeloH(p,s,k,pv)||'<p>'+lac('registro')+'</p>';
  if(sit===0)(PR().extra||[]).forEach(function(x){h+=secTitH(x.n)+(modeloH(p,s,x.id,pv)||'<p>'+lac(x.n.toLowerCase())+'</p>')});
  return h;
}
/* frases: entram como parágrafo novo logo depois de onde está o cursor (ou no fim), com os campos em vermelho.
   O último lugar do cursor dentro do registro fica guardado, porque tocar no botão tira o foco do texto. */
var FR_LAST=null;
document.addEventListener('selectionchange',function(){var sl=getSelection();if(!sl.rangeCount)return;var n=sl.anchorNode,e=n&&(n.nodeType===1?n:n.parentElement),d=e&&e.closest&&e.closest('#cd-doc,#ss-doc');if(d)FR_LAST={doc:d,r:sl.getRangeAt(0).cloneRange()}});
function frasesH(){var F=PR().frases;return F.length?F.map(function(f){return '<button data-fr="'+escH(f.id)+'" title="'+escH(f.t)+'">'+escH(f.n)+'</button>'}).join(''):'<p class="hint">Nenhuma frase. Crie em Configurações.</p>'}
function fraseIns(doc,id,p,s){
  var f=PR().frases.find(function(x){return x.id===id}); if(!f||!doc)return false;
  var l=cadList(p.id), i=l.findIndex(function(x){return x.id===s.id}), pv=cadPrev(l,i<0?l.length:i);
  var h=linhaH(f.t,p,s,pv); if(doc.id==='ss-doc')h=h.replace(/data-cd="pick"/g,'data-ss="pick"');
  var np=document.createElement('p'); np.innerHTML=h;
  var ref=FR_LAST&&FR_LAST.doc===doc?FR_LAST.r.startContainer:null, par=ref&&(ref.nodeType===1?ref:ref.parentElement); par=par&&par.closest?par.closest('#'+doc.id+' > p'):null;
  if(par&&par.parentNode===doc)par.after(np); else doc.appendChild(np);
  var g=np.querySelector('.lac'); doc.focus(); var r=document.createRange();
  if(g)r.selectNodeContents(g); else{r.selectNodeContents(np);r.collapse(false)}
  var sl=getSelection();sl.removeAllRanges();sl.addRange(r); if(g)lacArruma.l=g.dataset.l;
  doc.dispatchEvent(new Event('input',{bubbles:true})); return true }
/* linha que começa com § é o título de uma seção sua (Configurações → Seções) dentro do registro */
function secTitH(n){var C=FC();return '<p class="f-sec f-sx'+(C.sub?' u':'')+(C.cor?' c':'')+'" contenteditable="false" data-sx="1">'+escH(n)+(C.sub?':':'')+'</p>'}
function paras(t){return (t||'').split('\n').filter(function(x){return x.trim()}).map(function(x){return x.charAt(0)==='§'?secTitH(x.slice(1).trim()):'<p>'+escH(x)+'</p>'}).join('')}
function cadA4(){return innerWidth>=700||CAD.full}
function folhaH(p,s,inner,sec,editavel){
  var C=FC(), a4=cadA4(), cls='folha'+(a4?' a4':'')+' e-'+C.esp+' b-'+C.borda+' f-'+C.fonte+(C.just?' just':'');
  var h='<div class="'+cls+'" style="--fs:'+(a4?(C.tam*1.3333).toFixed(2):(C.tam*1.45).toFixed(1))+'px;--tc:'+C.tc+'">';
  if(C.lh)h+='<div class="f-lh"><i>'+escH(C.nome.split(' ').filter(Boolean).slice(0,2).map(function(w){return w[0]}).join('').toUpperCase())+'</i><div><b>'+escH(C.nome)+'</b><span>'+escH(C.prof)+', '+escH(C.crp)+'</span></div></div>';
  if(C.titulo)h+='<p class="f-tit">PRONTUÁRIO PSICOLÓGICO</p>';
  /* identificação: o Manual do CFP (2025) recomenda nome, nascimento e documento, e o responsável na criança;
     o modelo do apêndice tem data e horário em cada registro. Campo novo que a folha guardada não conhece vem ligado. */
  var nas=nascDe(p), menor=p.tipo==='Criança'||p.tipo==='Adolescente', sem=!!s.semSessao;
  var I=[['pront','Prontuário','P'+String(p.id).padStart(3,'0')],['nome','Nome Completo',p.nome],['nasc','Data de Nascimento',nas?dmy(nas):''],['resp','Responsável',menor&&p.resp?p.resp:''],['cpf','CPF','000.000.000-00'],['tel','Telefone','(00) 00000-0000'],['data','Data',dmy(s.date)],['hora','Horário',sem?'':s.hora||''],['sessao','Sessão',sem?'':pad(s._n)]].filter(function(x){return idOn(x[0])&&x[2]});
  h+=C.idsRow?'<div class="f-ids row">'+I.map(function(x){return '<span>'+x[1]+' <b>'+escH(x[2])+'</b></span>'}).join('')+'</div>':'<div class="f-ids'+(C.idsBold?' bold':'')+'">'+I.map(function(x){return '<p><b>'+x[1]+':</b> '+escH(x[2])+'</p>'}).join('')+'</div>';
  var tsec=function(t){return '<p class="f-sec'+(C.sub?' u':'')+(C.cor?' c':'')+'">'+t+(C.sub?':':'')+'</p>'};
  if(s.comp&&sec==='evol')h+=tsec(escH(secNome('comp')))+'<div class="f-doc">'+paras(s.comp)+'</div><div class="f-mt"></div>';
  h+=tsec(escH(secNome(sec)));
  h+='<div class="f-doc" id="cd-doc"'+(editavel?' contenteditable="true" spellcheck="true"':'')+'>'+inner+'</div>';
  h+='<div class="f-pf">';
  if(C.assin)h+='<div class="f-sign"><div class="ln"></div><b>'+escH(C.nome)+'</b><span>'+escH(C.prof)+' | '+escH(C.crp)+'</span></div>';
  if(C.rod)h+='<div class="f-foot"><b>'+escH(C.nome)+'</b> | '+escH(C.prof)+' '+escH(C.crp)+'. '+escH(C.cid)+'. E-mail: '+escH(C.mail)+'</div>';
  return h+'</div><div class="f-end"></div></div>';
}
var ARW_D='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
/* quem relatou: nos atendimentos de criança, adolescente e casal o texto padrão troca o sujeito com um toque */
function quemOpts(p){
  if(p.tipo==='Casal'){var a=p.nome.split(' e ');return ['o casal'].concat(a.length>1?[a[0].split(' ')[0],a[1].split(' ')[0]]:[])}
  if(p.tipo==='Adolescente'||p.tipo==='Criança')return [suj(p),'a mãe','o pai','a responsável','o responsável'];
  return null;
}
function quemH(p){return quemOpts(p)?'<span class="lac-ok" data-l="quem relatou">'+suj(p)+'</span>':suj(p)}
function cadEstado(s){
  if(isFut(s))return ['Marcada.',''];
  var nv=s.status==='falta'?'Não veio. ':'';
  if(!s.nota)return [nv+'Por registrar.','w'];
  return [nv+'Registrada'+(s.versoes&&s.versoes.length?', com correção':'')+'.',''];
}
function vCaderno(p){
  var l=cadList(p.id); if(!l.length)return '<p class="empty">Ainda sem sessões. O prontuário abre na primeira.</p>';
  if(CAD.pid!==p.id){CAD.pid=p.id;CAD.sid=null;CAD.sit=null;CAD.pick=null;CAD.edit=false;CAD.all=false;CAD.q=''}
  if(CAD.sid==='dem'||CAD.sid==='enc')return vCadSec(p,l,CAD.sid);
  var i=l.findIndex(function(x){return x.id===CAD.sid});
  if(i<0){for(var k=l.length-1;k>=0;k--){if(!isFut(l[k])&&!l[k].nota){i=k;break}}if(i<0)i=Math.max(0,l.length-(isFut(l[l.length-1])?2:1));CAD.sid=l[i].id}
  var s=l[i], fut=isFut(s), pend=!fut&&!s.nota, sit=cadSit(s), editavel=(pend||CAD.edit||(fut&&sit>=2));
  var st=fut?(sit>=2?'<span class="q">'+CAD_SIT[sit][0]+'</span>':'Ainda não aconteceu'):pend?'<span class="q">'+CAD_SIT[sit][0]+'</span>':'<span class="ok">'+(s.status==='falta'?'Falta':'Sessão realizada')+', aprovada</span>';
  var sitH='<div class="sitw">'+((pend||fut)?'<button class="cd-dd" data-cd="dd" aria-haspopup="menu" aria-expanded="'+(CAD.pop==='sit')+'"><span>'+st+'</span>'+ARW_D+'</button>':'<span class="cd-dd">'+st+'</span>');
  if(CAD.pop==='sit')sitH+='<div class="cd-pop" role="menu">'+CAD_SIT.map(function(x,k){if(fut&&k<2)return '';return '<button role="menuitemradio" data-cd="sit" data-o="'+k+'" aria-checked="'+(sit===k)+'">'+x[0]+'<small>'+x[1]+'</small></button>'}).join('')+(fut&&sit>=2?'<button role="menuitemradio" data-cd="sit" data-o="-1">Manter na agenda<small>sem registro agora</small></button>':'')+'</div>';
  sitH+='</div>';
  var rev=l.slice().reverse(), max=CAD.all?rev.length:Math.min(rev.length,9);
  /* no computador estreito e no celular: escolha da sessão e situação em cima da folha */
  var h='<div class="cd" id="cd"><div class="cd-top">'+cadSelH(p,rev,s.id)+sitH+'</div><div class="cad">'+cadNavH(p,rev,max,s.id);
  /* a folha */
  var inner, sec='evol', rasc=(editavel&&!CAD.edit&&s.rasc&&s.rasc.sit===sit)?s.rasc:null;
  if(fut&&sit<2)inner='<p class="f-fut">O registro abre no dia, já com o seu modelo.</p>';
  else if(pend||(fut&&sit>=2)){ if(rasc){inner=rasc.h;if(CAD.pick===null&&rasc.pick!=null)CAD.pick=rasc.pick}else inner=cadBody(p,s,l,i,sit); if(sit>=2)sec='comp' }
  else inner=paras(s.nota);
  h+='<div class="cd-paper">'+folhaH(p,s,inner,sec,editavel);
  if(CAD.edit)h+='<div class="field cd-vers"><label for="cd-mot">Motivo da correção</label><input id="cd-mot" autocomplete="off" placeholder="Erro na data da atividade."></div>';
  if(!pend&&!fut&&s.aprov)h+='<p class="cd-stamp'+(s.tardio?' t':'')+'" style="text-align:center;margin-top:12px">Aprovada em '+dmy(s.aprov.slice(0,10))+' às '+s.aprov.slice(11,16)+(s.tardio?', '+s.tardio+' dias depois da sessão (registro tardio)':'')+(s.versoes&&s.versoes.length?', corrigida '+plural(s.versoes.length,'vez','vezes'):'')+'.</p>';
  h+='<p class="btnrow" style="justify-content:center;gap:4px 18px;margin-top:6px"><button class="link" data-cd="pers">Personalizar a folha</button><button class="link cd-mfull" data-cd="full">'+(CAD.full?'Voltar ao texto ajustado':'Ver página inteira')+'</button>'+(s.versoes&&s.versoes.length?'<button class="link" data-cd="vers">'+(CAD.vers?'Esconder as correções':'Ver as correções desta sessão')+'</button>':'')+'</p>';
  if(s.versoes&&s.versoes.length&&CAD.vers)h+='<div class="cd-vers"><h4>Correções desta sessão</h4>'+s.versoes.map(function(v){return '<div><small>Texto que valeu até '+dmy(v.ate.slice(0,10))+' às '+v.ate.slice(11,16)+'.'+(v.mot?' Motivo da correção: '+escH(v.mot):'')+'</small>'+escH(v.t)+'</div>'}).join('')+'</div>';
  h+='</div>';
  /* a margem: situação, o combinado, o que falta e o botão de aprovar */
  var n=0;
  var pv=cadPrev(l,i), qo=quemOpts(p);
  h+='<aside class="mar"><h2>Sessão '+pad(s._n)+'<span>'+cap(longDate(s.date))+'</span></h2>'+sitH;
  if(pv&&(pend||fut))h+='<div class="blk"><b>Combinado na sessão anterior</b>'+escH(capF(pv))+'.</div>';
  if(editavel&&!(fut&&sit<2)){
    if(qo&&sit===0&&!CAD.edit)h+='<div class="blk"><b>Quem relatou</b><div class="chips">'+qo.map(function(q){return '<button data-cd="quem" data-v="'+escH(q)+'">'+escH(q)+'</button>'}).join('')+'</div></div>';
    if(!CAD.edit)h+='<div class="blk"><b id="cd-fn"></b><ul class="campos" id="cd-campos"></ul></div>';
    h+=cadFrasesBlk(sit===0?(s._n===1&&PR().mod[tipoMod(p)].primeira.length?'primeira':'sessao'):['sessao','falta','remarcada','naohavera'][sit],p);
    h+='<button class="btn pri" data-cd="ok">'+(CAD.edit?'Aprovar a correção':'Aprovar registro')+'</button>'+(CAD.edit?'<button class="btn" data-cd="cancel">Cancelar</button><p class="hint">Escreva o motivo embaixo da folha. O texto de antes fica guardado com a data.</p>':'<p class="hint">Tab pula para o próximo campo. A tecla / abre as frases. Ctrl+Enter aprova.</p><p class="cd-rasc"'+(s.rasc?'':' hidden')+'>'+(s.rasc?'Rascunho salvo às '+s.rasc.em+'.':'')+'</p>');
  } else if(fut) h+='<p class="hint">O registro abre no dia, já com o seu modelo. Se a sessão não for acontecer, escolha Remarcada ou Não haverá.</p>';
  else h+='<button class="btn" data-cd="fix">Corrigir</button><p class="hint">A correção fica com data e motivo, e o texto de antes é guardado.</p>';
  h+='</aside></div><div class="cd-bar" id="cd-bar">'+cadBarH(s,fut,pend,sit,n)+'</div></div>';
  return h;
}
/* ---------- demanda e objetivos, encaminhamento ou encerramento (23/11/2026) ----------
   As duas partes do prontuário que a Res. CFP 001/2009 exige (art. 2º, II e IV) e que não são de uma sessão:
   ficam em p.secs.dem e p.secs.enc, com o mesmo jeito de aprovar, corrigir com motivo e guardar a versão de antes.
   Aparecem no alto da lista de sessões, em "Do caso". */
var SEC_TIT={dem:'Demanda e objetivos',enc:'Encaminhamento ou encerramento'};
function secReg(p,k){if(!p.secs)p.secs={};return p.secs[k]||null}
function secEstado(p,k){var r=secReg(p,k);if(r&&r.t)return ['Registrado'+(r.versoes&&r.versoes.length?', com atualização':'')+'.',''];
  if(k==='enc')return p.ativo?['Quando o trabalho terminar.','']:['Por registrar.','w'];return ['Por escrever.','w']}
function cadSelH(p,rev,cur){return '<select data-cdsel aria-label="Sessão ou parte do caso">'+['dem','enc'].map(function(k){return '<option value="'+k+'"'+(cur===k?' selected':'')+'>'+SEC_TIT[k]+'. '+secEstado(p,k)[0]+'</option>'}).join('')
  +rev.map(function(x){return '<option value="'+x.id+'"'+(x.id===cur?' selected':'')+'>Sessão '+pad(x._n)+', '+DOW[parse(x.date).getDay()]+' '+dm(x.date)+'. '+cadEstado(x)[0]+'</option>'}).join('')+'</select>'}
function cadNavH(p,rev,max,cur){
  var h='<nav class="idx" aria-label="Prontuário de '+escH(p.nome)+'"><h2 class="sec">Do caso</h2><div class="idx-caso">'+['dem','enc'].map(function(k){var e=secEstado(p,k),r=secReg(p,k);
    return '<button class="s s-caso" data-cd="ir" data-sid="'+k+'" data-txt="'+escH((r&&r.t||'').toLowerCase())+'"'+(cur===k?' aria-current="true"':'')+'><b>'+(k==='dem'?'D':'E')+'</b><span>'+SEC_TIT[k]+'</span><small class="'+e[1]+'">'+e[0]+'</small></button>'}).join('')+'</div>';
  /* lista de sessões, com busca no texto */
  return h+'<h2 class="sec">Sessões</h2><input id="cd-q" type="search" placeholder="Buscar no prontuário" aria-label="Buscar no texto do prontuário" value="'+escH(CAD.q||'')+'"><p class="idx-n" id="cd-qn" hidden></p><div id="cd-idx">'+rev.map(function(x,k){var e=cadEstado(x);
    return '<button class="s" data-cd="ir" data-sid="'+x.id+'" data-txt="'+escH(((x.nota||'')+' '+(x.comp||'')).toLowerCase())+'"'+(x.id===cur?' aria-current="true"':'')+(k>=max&&x.id!==cur?' data-mais hidden':'')+'><b>'+pad(x._n)+'</b><span>'+DOW[parse(x.date).getDay()]+' '+dm(x.date)+'</span><small class="'+e[1]+'">'+e[0]+'</small></button>'}).join('')+'</div>'+(rev.length>9?'<button class="link" data-cd="todas">'+(CAD.all?'Mostrar só as últimas':'Ver as '+rev.length+' sessões')+'</button>':'')+'</nav>' }
/* o bloco Frases da margem, com o atalho para editar o modelo que abriu o texto */
function cadFrasesBlk(k,p){return '<details class="blk fr-blk"><summary><b>Frases</b> <span class="muted">'+PR().frases.length+', ou a tecla /</span></summary><div class="chips fr-l">'+frasesH()+'</div><p class="btnrow cd-mod"><button class="link" data-cd="cfmod" data-v="'+k+'" data-t="'+tipoMod(p)+'">Editar este modelo</button><button class="link" data-cd="cfmod" data-v="frases">Editar as frases</button></p></details>'}
function vCadSec(p,l,k){
  var r=secReg(p,k)||{}, pend=!r.t, ed=pend||CAD.edit, rev=l.slice().reverse(), max=CAD.all?rev.length:Math.min(rev.length,9);
  var s={date:r.aprov?r.aprov.slice(0,10):TODAY,semSessao:true}, inner;
  if(pend)inner=r.rasc?r.rasc.h:(modeloH(p,{date:TODAY},k,'')||'<p>'+lac(SEC_TIT[k].toLowerCase())+'</p>'); else inner=paras(r.t);
  var h='<div class="cd" id="cd"><div class="cd-top">'+cadSelH(p,rev,k)+'</div><div class="cad">'+cadNavH(p,rev,max,k);
  h+='<div class="cd-paper">'+folhaH(p,s,inner,k,ed);
  if(CAD.edit)h+='<div class="field cd-vers"><label for="cd-mot">Motivo da atualização</label><input id="cd-mot" autocomplete="off" placeholder="'+(k==='dem'?'Objetivo revisto com o paciente.':'Encaminhamento acrescentado.')+'"></div>';
  if(r.aprov)h+='<p class="cd-stamp" style="text-align:center;margin-top:12px">Aprovado em '+dmy(r.aprov.slice(0,10))+' às '+r.aprov.slice(11,16)+(r.versoes&&r.versoes.length?', atualizado '+plural(r.versoes.length,'vez','vezes'):'')+'.</p>';
  h+='<p class="btnrow" style="justify-content:center;gap:4px 18px;margin-top:6px"><button class="link" data-cd="pers">Personalizar a folha</button><button class="link cd-mfull" data-cd="full">'+(CAD.full?'Voltar ao texto ajustado':'Ver página inteira')+'</button>'+(r.versoes&&r.versoes.length?'<button class="link" data-cd="vers">'+(CAD.vers?'Esconder as versões':'Ver as versões de antes')+'</button>':'')+'</p>';
  if(r.versoes&&r.versoes.length&&CAD.vers)h+='<div class="cd-vers"><h4>Versões de antes</h4>'+r.versoes.map(function(v){return '<div><small>Texto que valeu até '+dmy(v.ate.slice(0,10))+' às '+v.ate.slice(11,16)+'.'+(v.mot?' Motivo: '+escH(v.mot):'')+'</small>'+escH(v.t)+'</div>'}).join('')+'</div>';
  h+='</div><aside class="mar"><h2>'+SEC_TIT[k]+'<span>'+(k==='dem'?'Escrito uma vez. Atualize quando o objetivo mudar.':'Escrito quando o trabalho termina.')+'</span></h2>';
  if(k==='enc'&&p.ativo&&pend)h+='<p class="hint">'+escH(p.nome.split(' ')[0])+' ainda está em atendimento. Este registro não encerra o paciente: isso se faz na ficha.</p>';
  if(ed){ if(!CAD.edit)h+='<div class="blk"><b id="cd-fn"></b><ul class="campos" id="cd-campos"></ul></div>';
    h+=cadFrasesBlk(k,p)+'<button class="btn pri" data-cd="ok">'+(CAD.edit?'Aprovar a atualização':'Aprovar')+'</button>'+(CAD.edit?'<button class="btn" data-cd="cancel">Cancelar</button><p class="hint">Escreva o motivo embaixo da folha. O texto de antes fica guardado com a data.</p>':'<p class="hint">Tab pula para o próximo campo. Ctrl+Enter aprova.</p><p class="cd-rasc"'+(r.rasc?'':' hidden')+'>'+(r.rasc?'Rascunho salvo às '+r.rasc.em+'.':'')+'</p>');
  } else h+='<button class="btn" data-cd="fix">Atualizar</button><p class="hint">A atualização fica com data e motivo, e o texto de antes é guardado.</p>';
  h+='</aside></div><div class="cd-bar" id="cd-bar">'+(ed?'<span class="msg cd-msg"></span>'+(CAD.edit?'<button class="btn sm" data-cd="cancel">Cancelar</button>':'')+'<button class="btn pri sm" data-cd="ok">Aprovar</button>':'<span class="msg">A atualização fica com data e motivo.</span><button class="btn sm" data-cd="fix">Atualizar</button>')+'</div></div>';
  return h }
function cadOkSec(){
  var p=pac(CAD.pid),k=CAD.sid; if(!p.secs)p.secs={}; var antes=JSON.stringify(p.secs), r=p.secs[k]||(p.secs[k]={}), txt=cadText(), a=new Date(), q=iso(a)+'T'+pad(a.getHours())+':'+pad(a.getMinutes());
  if(CAD.edit){var me=document.getElementById('cd-mot'),mot=me?me.value.trim():'';if(!mot){toast('Escreva o motivo da atualização, embaixo da folha.');if(me)me.focus();return}r.versoes=(r.versoes||[]).concat([{t:r.t,ate:q,mot:mot}])}
  r.t=txt;r.aprov=q;delete r.rasc;CAD.edit=false;CAD.pop=null;CAD.undo={sec:1,pid:p.id,antes:antes,sid:k};save();render();
  var e=$('#toast');e.innerHTML=escH(SEC_TIT[k]+' aprovado.')+' <button data-cd="undo">Desfazer</button>';e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},6000)}
function cadBarH(s,fut,pend,sit,n){
  if(!pend&&!fut&&!CAD.edit)return '<span class="msg">A correção fica com data e motivo.</span><button class="btn sm" data-cd="fix">Corrigir</button>';
  if(fut&&sit<2)return '<span class="msg">Se a sessão não for acontecer, escolha Remarcada ou Não haverá acima.</span>';
  return '<span class="msg cd-msg"></span>'+(CAD.edit?'<button class="btn sm" data-cd="cancel">Cancelar</button>':'')+'<button class="btn pri sm" data-cd="ok">Aprovar</button>';
}
function pickVazio(x){return !x.querySelector('button[aria-pressed="true"]')}
function cadLeft(){var d=document.getElementById('cd-doc');if(!d)return 0;return $$('.lac',d).length+$$('.cd-pick',d).filter(pickVazio).length}
function cadMsg(){
  var n=cadLeft(), t=n?(n===1?'Falta 1 campo':'Faltam '+n+' campos'):'Tudo preenchido';
  $$('.cd-msg').forEach(function(m){m.innerHTML=n?'<button data-cd="go">'+t+'</button>':t+'.'});
  var fn=document.getElementById('cd-fn'), ul=document.getElementById('cd-campos'), d=document.getElementById('cd-doc'); if(!fn||!ul||!d)return;
  fn.textContent=t; var o='', pk=0;
  $$('.lac,.lac-ok,.cd-pick',d).forEach(function(g){
    if(g.classList.contains('cd-pick')){o+='<li><button class="'+(pickVazio(g)?'':'ok')+'" data-cd="campo" data-l="__pick'+(pk++)+'">'+escH(capF(g.dataset.l||'Atividade anterior'))+'</button></li>';return}
    if(!g.dataset.l||g.dataset.l==='quem relatou')return;
    o+='<li><button class="'+(g.classList.contains('lac')?'':'ok')+'" data-cd="campo" data-l="'+escH(g.dataset.l)+'">'+escH(capF(g.dataset.l))+'</button></li>'});
  ul.innerHTML=o;
}
/* busca no texto das sessões aprovadas do paciente aberto */
function cadBusca(){
  var q=document.getElementById('cd-q'); if(!q)return; var v=q.value.toLowerCase().trim(), n=0; CAD.q=q.value;
  $$('#cd-idx .s').forEach(function(b){var hit=!v||b.dataset.txt.indexOf(v)>=0; b.hidden=v?!hit:(b.hasAttribute('data-mais')&&!CAD.all); if(v&&hit)n++});
  var e=document.getElementById('cd-qn'); e.hidden=!v; if(v)e.textContent=n?plural(n,'sessão cita','sessões citam')+' "'+q.value.trim()+'".':'Nenhuma sessão cita "'+q.value.trim()+'".';
}
/* rascunho: o que foi escrito e ainda não aprovado fica guardado sozinho, sem botão Salvar */
function cadRasc(){
  var d=document.getElementById('cd-doc'); if(!d||!d.isContentEditable||CAD.edit)return;
  if(CAD.sid==='dem'||CAD.sid==='enc'){var pp=pac(CAD.pid),r0=secReg(pp,CAD.sid)||(pp.secs[CAD.sid]={});if(r0.t)return;var a0=new Date();
    r0.rasc={h:d.innerHTML.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,''),em:pad(a0.getHours())+':'+pad(a0.getMinutes())};
    try{localStorage.setItem(KEYD(),JSON.stringify(S))}catch(e){} $$('.cd-rasc').forEach(function(e){e.textContent='Rascunho salvo às '+r0.rasc.em+'.';e.hidden=false}); return}
  var s=sessById(CAD.sid); if(!s||s.nota)return; var a=new Date();
  s.rasc={h:d.innerHTML.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,''),sit:cadSit(s),pick:CAD.pick,em:pad(a.getHours())+':'+pad(a.getMinutes())};
  try{localStorage.setItem(KEYD(),JSON.stringify(S))}catch(e){}
  $$('.cd-rasc').forEach(function(e){e.textContent='Rascunho salvo às '+s.rasc.em+'.';e.hidden=false});
}
function cadFit(){var f=document.querySelector('#cd .folha');if(!f)return;f.style.zoom='1';$$('.cd-brk',f).forEach(function(x){x.remove()});
  if(!f.classList.contains('a4')){f.style.zoom='';f.style.paddingBottom='';return}
  var pf=f.querySelector('.f-pf');f.style.paddingBottom=Math.max(94,(pf?pf.offsetHeight:0)+46+22)+'px';
  var H=f.offsetHeight;for(var k=1;k*1123<H-12;k++){var b=document.createElement('div');b.className='cd-brk';b.style.top=(k*1123-8)+'px';b.textContent='Página '+(k+1);f.appendChild(b)}
  var box=f.parentNode, av=box.clientWidth-2;f.style.zoom=Math.min(1.1,av/794).toFixed(3)}
function cadText(){var d=document.getElementById('cd-doc').cloneNode(true);
  $$('.cd-pick',d).forEach(function(x){var b=x.querySelector('button[aria-pressed="true"]')||x.querySelector('button');x.replaceWith(document.createTextNode(b?b.textContent:''))});
  return $$('p',d).map(function(x){var t=x.textContent.replace(/\s+/g,' ').trim();return x.dataset.sx&&t?'§'+t.replace(/:$/,''):t}).filter(Boolean).join('\n')}
function cadVal(l){var g=$$('#cd-doc .lac-ok').concat($$('#cd-doc .lac')).find(function(x){return x.dataset.l===l});return g?g.textContent.trim():''}
function cadGo(){var l=cadList(UI.pid);return l}
function cadOk(){
  if(cadLeft()){toast('Faltam campos em vermelho.');var g=document.querySelector('#cd-doc .lac');if(g)cadSel(g);return}
  if(CAD.sid==='dem'||CAD.sid==='enc'){cadOkSec();return}
  var l=cadList(UI.pid),i=l.findIndex(function(x){return x.id===CAD.sid}),s=l[i],sit=cadSit(s),fut=isFut(s),txt=cadText(),antes=JSON.stringify(s),nx=null,nxAntes=null,agora=new Date(),q=iso(agora)+'T'+pad(agora.getHours())+':'+pad(agora.getMinutes());
  if(CAD.edit){var me=document.getElementById('cd-mot'),mot=me?me.value.trim():'';if(!mot){toast('Escreva o motivo da correção, embaixo da folha.');if(me)me.focus();return}s.versoes=(s.versoes||[]).concat([{t:s.nota,ate:q,mot:mot}]);s.nota=txt;s.aprov=q;CAD.edit=false;cadDone(s,antes,null,null,'Correção aprovada. A versão de antes fica guardada.');return}
  if(sit<=1){var dd=diasDesde(s.date);if(dd>2)s.tardio=dd;else delete s.tardio;s.status=sit===0?'realizada':'falta';if(sit===1)s.cobrar=true;s.nota=txt;s.aprov=q;if(sit===0)s.ativ=cadVal('atividade');
    var nn=l[i+1];cadDone(s,antes,null,null,'Sessão '+pad(s._n)+' aprovada.'+(nn?' A '+pad(nn._n)+' é a seguinte.':''),nn?nn.id:null);return}
  var dtc=cadVal('data do contato');
  if(sit===2){var nd=pbD(cadVal('nova data'));if(!nd){toast('Escreva a nova data como dd/mm/aaaa.');return}
    s.comp=(s.comp?s.comp+'\n':'')+txt;s.date=iso(nd);s.status='agendada';cadDone(s,antes,null,null,'Sessão '+pad(s._n)+' passou para '+dmy(s.date)+'. O número continua o mesmo.',s.id);return}
  nx=S.sess.filter(function(x){return x.pid===s.pid&&x.id!==s.id&&x.date>s.date&&isFut(x)}).sort(function(a,b){return a.date<b.date?-1:1})[0];
  if(nx){nxAntes=JSON.stringify(nx);nx.comp=(s.comp?s.comp+'\n':'')+txt+(nx.comp?'\n'+nx.comp:'')}
  s.status='cancelada';cadDone(s,antes,nx,nxAntes,'A consulta de '+dmy(s.date)+' não haverá. O registro passou para a próxima sessão.',nx?nx.id:null);
}
function cadDone(s,antes,nx,nxAntes,msg,ir){CAD.undo={id:s.id,antes:antes,nx:nx?nx.id:null,nxAntes:nxAntes,sid:CAD.sid};delete s.rasc;CAD.sit=null;CAD.pick=null;CAD.pop=null;if(ir)CAD.sid=ir;save();render();
  var e=$('#toast');e.innerHTML=escH(msg)+' <button data-cd="undo">Desfazer</button>';e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},6000)}
function cadUndo(){var u=CAD.undo;if(!u)return;
  if(u.sec){var pp=pac(u.pid);if(pp)pp.secs=JSON.parse(u.antes);CAD.sid=u.sid;CAD.undo=null;save();render();$('#toast').hidden=true;return}var k=S.sess.findIndex(function(x){return x.id===u.id});if(k>=0)S.sess[k]=JSON.parse(u.antes);
  if(u.nx){var j=S.sess.findIndex(function(x){return x.id===u.nx});if(j>=0)S.sess[j]=JSON.parse(u.nxAntes)}
  CAD.sid=u.sid;CAD.undo=null;save();render();$('#toast').hidden=true}
/* Ao digitar por cima de um campo vermelho selecionado, o Chrome troca o campo por <font color> com a cor antiga:
   o texto continuava vermelho, como se ainda faltasse (achado no teste de uso de 19/11/2026). Aqui o que foi
   digitado volta a ser um campo preenchido (.lac-ok), com o nome do campo que estava selecionado. */
function lacArruma(d,ev){ if(ev&&ev.isComposing)return; var f=$$('font[color]',d); if(!f.length)return;
  f.forEach(function(x){var s=document.createElement('span');s.className='lac-ok';if(lacArruma.l)s.dataset.l=lacArruma.l;s.textContent=x.textContent;x.replaceWith(s);
    var r=document.createRange();r.selectNodeContents(s);r.collapse(false);var sl=getSelection();sl.removeAllRanges();sl.addRange(r)}) }
function cadSel(g){lacArruma.l=g.dataset.l;var d=document.getElementById('cd-doc');d.focus();g.scrollIntoView({block:'center',behavior:'instant'});var r=document.createRange();r.selectNodeContents(g);var sl=getSelection();sl.removeAllRanges();sl.addRange(r)}
function foPanel(){
  var P=document.getElementById('fo-panel');if(!CAD.panel){if(P)P.remove();document.body.classList.remove('fo-on');return}
  if(!P){P=document.createElement('aside');P.id='fo-panel';P.className='fo-panel';P.setAttribute('aria-label','Personalizar a folha');document.body.appendChild(P)}
  P.innerHTML='<header><b>Personalizar a folha</b><button class="cd-ic" data-fo="x" aria-label="Fechar">'+X_+'</button></header><div class="fo-body">'+foBodyH()+'<div class="fo-g"><button class="link" data-cd="cfmod" data-v="sessao" data-t="'+(CAD.pid&&pac(CAD.pid)?tipoMod(pac(CAD.pid)):'adulto')+'">Mais em Configurações: seções, modelos e frases</button></div></div>';
  document.body.classList.add('fo-on');
}
/* as opções da folha: no painel lateral do prontuário e na aba Folha de Configurações */
function foBodyH(){
  var C=FC(),seg=function(k,arr){return '<div class="fo-seg">'+arr.map(function(a){return '<button data-fo="k" data-k="'+k+'" data-v="'+a[0]+'" aria-pressed="'+(String(C[k])===String(a[0]))+'">'+a[1]+'</button>'}).join('')+'</div>'};
  var chk=function(k,t,sub){var v=sub?idOn(k):C[k],fx=sub&&ID_FIXO[k];return '<label class="fo-chk'+(fx?' fx':'')+'"><input type="checkbox" data-fo="c" data-k="'+k+'"'+(sub?' data-sub="1"':'')+(v?' checked':'')+(fx?' disabled':'')+'><span>'+t+(fx?'<small>exigido pela Res. CFP 001/2009</small>':'')+'</span></label>'};
  var inp=function(k,t){return '<div class="fo-in"><label for="fo-'+k+'">'+t+'</label><input id="fo-'+k+'" data-fo="i" data-k="'+k+'" value="'+escH(C[k])+'"></div>'};
  return '<div class="fo-g"><p>Ponto de partida</p><div class="fo-opts">'+[['word','Como o meu Word','Borda dupla, título no topo, rótulos em negrito, espaçamento 1,15'],['timbre','Com timbrado','Seu nome e iniciais no alto, cor'],['limpa','Limpa','Só o texto, sem assinatura']].map(function(o){return '<button class="fo-opt" data-fo="pre" data-v="'+o[0]+'" aria-checked="'+(C.preset===o[0])+'">'+o[1]+'<small>'+o[2]+'</small></button>'}).join('')+'</div></div>'+
   '<div class="fo-g"><p>Seus dados</p><div class="fo-opts">'+inp('nome','Nome')+inp('prof','Como você assina')+inp('crp','CRP')+inp('cid','Cidade')+inp('mail','E-mail')+'</div></div>'+
   '<div class="fo-g"><p>Identificação</p>'+chk('pront','Número do prontuário',1)+chk('nome','Nome completo',1)+chk('nasc','Data de nascimento',1)+chk('resp','Responsável, na criança e no adolescente',1)+chk('cpf','CPF',1)+chk('tel','Telefone',1)+chk('data','Data',1)+chk('hora','Horário',1)+chk('sessao','Número da sessão',1)+chk('idsBold','Rótulos em negrito')+'</div>'+
   '<div class="fo-g"><p>Letra</p>'+seg('fonte',[['times','Times'],['lit','Literata'],['arial','Arial']])+'<div style="height:8px"></div>'+seg('tam',[[10,'10'],[11,'11'],[12,'12']])+'</div>'+
   '<div class="fo-g"><p>Espaçamento</p>'+seg('esp',[['word','Como o Word (1,15)'],['ar','Mais arejado']])+'</div>'+
   '<div class="fo-g"><p>Borda da página</p>'+seg('borda',[['nenhuma','Sem borda'],['simples','Simples'],['dupla','Dupla']])+'</div>'+
   '<div class="fo-g"><p>Partes da folha</p>'+chk('titulo','"Prontuário Psicológico" no topo')+chk('lh','Timbrado com seu nome')+chk('sub','Títulos sublinhados')+chk('just','Texto justificado')+chk('assin','Assinatura')+chk('rod','Rodapé com contato')+'</div>'+
   '<div class="fo-g"><p>Cor do timbrado</p><div class="fo-sw">'+['#2C4E9E','#2F6B4F','#7A2E3B','#3A3F4A'].map(function(c){return '<button data-fo="tc" data-v="'+c+'" style="background:'+c+'" aria-pressed="'+(C.tc===c)+'" aria-label="Cor '+c+'"></button>'}).join('')+'</div></div>';
}
function cadRedraw(){var d=document.getElementById('cd-doc'),keep=d&&d.isContentEditable?d.innerHTML:null;render();if(keep!==null){var n=document.getElementById('cd-doc');if(n&&n.isContentEditable){n.innerHTML=keep;cadMsg()}}}
document.addEventListener('click',function(ev){
  var t=ev.target.closest&&ev.target.closest('[data-cd],[data-fo]');
  if(CAD.pop&&!(ev.target.closest&&ev.target.closest('.cd-pop,[data-cd="dd"],[data-cd="menu"]'))){CAD.pop=null;if(!t){cadRedraw();return}}
  if(!t)return;
  var a=t.dataset.cd, f=t.dataset.fo, C=FC();
  if(a==='cfmod'){var v=t.dataset.v;if(window.RastroConfig){if(v==='frases')window.RastroConfig.abre('frases');else window.RastroConfig.abre('modelos',t.dataset.t,v)}return}
  if(a==='ir'){var iv=t.dataset.sid;CAD.sid=(iv==='dem'||iv==='enc')?iv:Number(iv);CAD.sit=null;CAD.pick=null;CAD.edit=false;CAD.vers=false;render();return}
  if(a==='todas'){CAD.all=!CAD.all;cadRedraw();return}
  if(a==='quem'){var gq=document.querySelector('#cd-doc [data-l="quem relatou"]');if(gq){gq.textContent=t.dataset.v;cadRasc()}return}
  if(a==='campo'){var lb=t.dataset.l;if(lb.indexOf('__pick')===0){var pk0=$$('#cd-doc .cd-pick')[Number(lb.slice(6))||0];if(pk0)pk0.querySelector('button').focus()}else{var gc=$$('#cd-doc .lac,#cd-doc .lac-ok').find(function(x){return x.dataset.l===lb});if(gc)cadSel(gc)}return}
  if(a==='pv'||a==='nx'){var l=cadList(UI.pid),i=l.findIndex(function(x){return x.id===CAD.sid}),j=i+(a==='pv'?-1:1);if(l[j]){CAD.sid=l[j].id;CAD.sit=null;CAD.pick=null;CAD.edit=false;CAD.vers=false;render();scrollTo(0,0)}return}
  if(a==='dd'){CAD.pop=CAD.pop==='sit'?null:'sit';cadRedraw();return}
  if(a==='menu'){CAD.pop=CAD.pop==='menu'?null:'menu';cadRedraw();return}
  if(a==='sit'){var o=Number(t.dataset.o);CAD.sit=o<0?null:o;CAD.pop=null;render();return}
  if(a==='pick'){CAD.pick=Number(t.dataset.o);t.parentNode.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',String(x===t))});cadMsg();cadRasc();return}
  if(a==='go'){var g=document.querySelector('#cd-doc .lac');if(g)cadSel(g);else{var pk=$$('#cd-doc .cd-pick').filter(pickVazio)[0];if(pk)pk.querySelector('button').focus()}return}
  if(a==='abrir'){var ss=sessById(Number(t.dataset.sid));UI.modal=null;renderModal();UI.ptab='prontuario';UI.pid=ss.pid;abreCad(ss.pid,ss.id);go('app-prontuario',true);return}
  if(a==='ok'){cadOk();return}
  if(a==='undo'){cadUndo();return}
  if(a==='fix'){CAD.edit=true;render();var d=document.getElementById('cd-doc');if(d)d.focus();return}
  if(a==='cancel'){CAD.edit=false;render();return}
  if(a==='pers'){CAD.pop=null;CAD.panel=true;foPanel();render();return}
  if(a==='full'){CAD.full=!CAD.full;CAD.pop=null;render();return}
  if(a==='vers'){CAD.vers=!CAD.vers;CAD.pop=null;render();return}
  if(f==='x'){CAD.panel=false;foPanel();render();return}
  if(f==='pre'){C.preset=t.dataset.v;Object.assign(C,FOLHA_PRE[C.preset]);save();foPanel();cadRedraw();return}
  if(f==='k'){var v=t.dataset.v;C[t.dataset.k]=t.dataset.k==='tam'?Number(v):v;save();foPanel();cadRedraw();return}
  if(f==='tc'){C.tc=t.dataset.v;save();foPanel();cadRedraw();return}
},true);
document.addEventListener('change',function(ev){var t=ev.target;if(t.dataset.fo!=='c')return;var C=FC();if(t.dataset.sub)C.ids[t.dataset.k]=t.checked?1:0;else C[t.dataset.k]=t.checked;save();cadRedraw()});
document.addEventListener('input',function(ev){var t=ev.target;
  if(t.dataset&&t.dataset.fo==='i'){FC()[t.dataset.k]=t.value;save();var pos=t.selectionStart,id=t.id;cadRedraw();var n=document.getElementById(id);if(n){n.focus();n.setSelectionRange(pos,pos)}return}
  if(t.id==='cd-q'){cadBusca();return}
  if(t.id==='cd-doc'){lacArruma(t,ev);$$('#cd-doc .lac').forEach(function(g){var v=g.textContent.trim();if(v&&v!==g.dataset.l)g.className='lac-ok'});cadMsg();clearTimeout(cadFit.t);cadFit.t=setTimeout(cadFit,300);clearTimeout(cadRasc.t);cadRasc.t=setTimeout(cadRasc,700)}});
document.addEventListener('change',function(ev){var t=ev.target;if(t.hasAttribute&&t.hasAttribute('data-cdsel')){CAD.sid=(t.value==='dem'||t.value==='enc')?t.value:Number(t.value);CAD.sit=null;CAD.pick=null;CAD.edit=false;CAD.vers=false;render()}});
document.addEventListener('mouseup',function(ev){var g=ev.target.closest&&ev.target.closest('#cd-doc .lac');if(g)cadSel(g)});
document.addEventListener('keydown',function(ev){if(ev.target.id!=='cd-doc')return;
  if(ev.key==='Tab'){var ls=$$('#cd-doc .lac');if(!ls.length)return;ev.preventDefault();var sel=getSelection(),cur=sel.anchorNode&&sel.anchorNode.parentElement&&sel.anchorNode.parentElement.closest('.lac'),i=ls.indexOf(cur);cadSel(ls[ev.shiftKey?(i<=0?ls.length-1:i-1):(i+1)%ls.length])}
  if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();cadOk()}
  /* a tecla / leva às frases; Esc na lista volta ao ponto do texto */
  if(ev.key==='/'&&!ev.ctrlKey&&!ev.metaKey&&!ev.altKey){var fd=document.querySelector('#cd .fr-blk'),fb=document.querySelector('#cd .fr-l button');if(fb){ev.preventDefault();if(fd)fd.open=true;fb.focus();toast('Escolha a frase com Tab e Enter. Esc volta ao texto.')}}});
document.addEventListener('keydown',function(ev){if(ev.key!=='Escape'||!(ev.target.closest&&ev.target.closest('#cd .fr-l')))return;ev.preventDefault();
  var d=document.getElementById('cd-doc');if(!d)return;d.focus();if(FR_LAST&&FR_LAST.doc===d){var sl=getSelection();sl.removeAllRanges();sl.addRange(FR_LAST.r)}});
document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('#cd [data-fr]');if(!b)return;
  var d=document.getElementById('cd-doc'),p=pac(CAD.pid);if(!d||!d.isContentEditable||!p)return;
  var s=(CAD.sid==='dem'||CAD.sid==='enc')?{id:-1,date:TODAY}:sessById(CAD.sid);if(s)fraseIns(d,b.dataset.fr,p,s)});
addEventListener('resize',function(){clearTimeout(cadFit.r);cadFit.r=setTimeout(cadFit,150)});

/* ---------- app: Financeiro ---------- */
function monthData(ym){
  var ss=S.sess.filter(function(s){return s.date.slice(0,7)===ym}), rec=0,arec=0,atr=0,prev=0,items=[];
  ss.forEach(function(s){ var d=due(s); if(d){ var st=recState(s); if(st==='recebido')rec+=d; else if(st==='atraso')atr+=d; else arec+=d; items.push({k:st,date:s.date,s:s,valor:d}); } else if(s.status==='agendada'||s.status==='confirmada') prev+=s.valor; });
  var dp=S.desp.filter(function(d){return d.date.slice(0,7)===ym}), desp=dp.reduce(function(t,d){return t+d.valor},0);
  dp.forEach(function(d){items.push({k:'despesa',date:d.date,d:d,valor:d.valor})});
  items.sort(function(a,b){return a.date<b.date?1:-1});
  return {rec:rec,arec:arec,atr:atr,prev:prev,desp:desp,items:items};
}
function ymAdd(ym,n){var a=ym.split('-').map(Number),d=new Date(a[0],a[1]-1+n,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)}
/* 23/11/2026: a tela mora em js/financeiro.js (frase do mes, meses em barrinhas, lista separada pelo que fazer);
   a versao anterior (numero gigante, filtro e lista unica) esta em "Backup antes do redesenho Financeiro e Pacientes 23-11". */
function vFinanceiro(){ return window.RastroFinanceiro.vista(); }

/* ---------- janelas ---------- */
var X_='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function hdr(t,sub){return '<header><div><h3>'+t+'</h3>'+(sub?'<p>'+sub+'</p>':'')+'</div><button class="icon" data-act="close" aria-label="Fechar">'+X_+'</button></header>'}
function mSess(m){
  var s=sessById(m.id), p=pac(s.pid), d=due(s), h=hdr(avM(p,'m')+escH(p.nome),cap(longDate(s.date))+', '+s.hora+'. '+p.mod+'. '+p.tipo+'.');
  h+='<section><h4>Agenda</h4><p class="big st-'+s.status+'" style="text-decoration:none">'+STATUS[s.status]+(s.status==='falta'?(s.cobrar?' cobrada':' não cobrada'):'')+'.</p><p>'+rastroH(s)+' <span class="falta '+faltaInfo(s).k+'">'+faltaInfo(s).t+'</span></p>';
  if(m.askFalta) h+='<p>Cobrar esta falta?</p><div class="btnrow"><button class="btn sm" data-act="falta" data-c="1">Cobrar a falta</button><button class="btn sm" data-act="falta" data-c="0">Não cobrar</button></div>';
  else h+='<div class="btnrow">'+[['confirmada','Confirmar'],['realizada','Marcar realizada'],['falta','Faltou'],['cancelada','Cancelar sessão'],['agendada','Voltar para agendada']].filter(function(x){return x[0]!==s.status}).map(function(x){return '<button class="btn sm'+(x[0]==='cancelada'?' danger':'')+'" data-act="sess-st" data-st="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
  if(s.date>=TODAY&&(s.status==='agendada'||s.status==='confirmada')) h+='<div class="quote">'+escH(lembrete(s))+'</div><div class="btnrow"><button class="btn sm" data-act="copy-lemb">Copiar lembrete</button></div>';
  h+='</section><section><h4>Financeiro</h4>';
  if(d){ h+='<p class="big num">'+brl(s.valor)+' <span class="'+(s.pago?'c-ok':(recState(s)==='atraso'?'c-bad':'c-warn'))+'" style="font-weight:500">'+(s.pago?'recebido'+(s.forma?' por '+s.forma:'')+'.':(recState(s)==='atraso'?'em atraso.':'a receber.'))+'</span></p>';
    if(s.pago) h+=(m.recibo?'<div class="quote">'+escH(reciboTxt(s))+'</div>':'')+'<div class="btnrow">'+(m.recibo?'<button class="btn sm" data-act="copy-recibo">Copiar recibo</button>':'<button class="btn sm" data-act="recibo">'+(s.recibo?'Ver recibo':'Emitir recibo')+'</button>')+'<button class="btn sm" data-act="unpay">Desfazer recebimento</button></div>';
    else h+='<div class="btnrow">'+['Pix','Transferência','Dinheiro','Cartão'].map(function(f){return '<button class="btn sm" data-act="pay" data-f="'+f+'">Recebi por '+f+'</button>'}).join('')+'</div>';
  } else h+='<p class="num">'+brl(s.valor)+'. <span class="muted">'+(s.status==='cancelada'||s.status==='falta'?'Não entra na conta.':'Entra na conta quando a sessão for marcada como realizada.')+'</span></p>';
  h+='</section><section><h4>Prontuário</h4>';
  var reg=s.status==='realizada'||s.status==='falta';
  h+='<p class="'+(reg&&!s.nota?'c-warn':'muted')+'">'+(reg?(s.nota?'Registro aprovado.':'Por registrar.'):'O registro abre no dia da sessão.')+'</p><div class="btnrow"><button class="btn sm'+(reg&&!s.nota?' pri':'')+'" data-cd="abrir" data-sid="'+s.id+'">'+(reg&&!s.nota?'Escrever no prontuário':'Abrir o prontuário')+'</button></div>';
  return h+'</section>';
}
function mNovaSess(m){
  var ativos=S.pac.filter(function(p){return p.ativo});
  return hdr('Marcar sessão')+'<section><div class="field"><label for="ns-p">Paciente</label><select id="ns-p">'+ativos.map(function(p){return '<option value="'+p.id+'"'+(m.pid===p.id?' selected':'')+'>'+escH(p.nome)+'</option>'}).join('')+'</select></div><div class="grid2"><div class="field"><label for="ns-d">Dia</label><input id="ns-d" type="date" value="'+m.d+'"></div><div class="field"><label for="ns-h">Hora</label><input id="ns-h" type="time" step="1800" value="'+m.h+'"></div></div><label class="check"><input type="checkbox" id="ns-r"> Repetir toda semana por 8 semanas.</label><p class="err" id="ns-e" hidden></p><div class="btnrow"><button class="btn pri" data-act="ns-save">Marcar sessão</button><button class="btn" data-act="close">Cancelar</button></div></section>';
}
function mComp(m){
  var c=m.id?compById(m.id):null, o=c?compOcc(c,m.orig):null, rep=!!(c&&c.rep!=='nao'), so=rep&&m.so!==false;
  var d=o?o.date:(m.d||TODAY), ini=o?o.ini:pad(m.h!=null?m.h:9)+':00', fim=o?o.fim:hOf(minOf(ini)+60);
  var h=hdr(c?'Alterar compromisso':'Novo compromisso','Fica só na sua agenda e não entra em nenhuma conta.')+'<section>';
  if(rep)h+='<div class="seg" role="group" aria-label="O que alterar"><button data-act="cp-so" data-v="1" aria-pressed="'+so+'">Só nesta vez</button><button data-act="cp-so" data-v="0" aria-pressed="'+!so+'">Todas as vezes</button></div>';
  h+='<div class="field"><label for="cp-t">O que é</label><input id="cp-t" autocomplete="off" value="'+escH(c?c.tit:'')+'" placeholder="Supervisão, curso, consulta médica"></div>';
  h+='<div class="grid2"><div class="field"><label for="cp-d">Dia</label><input id="cp-d" type="date" value="'+d+'"></div><div class="field"><label for="cp-r">Repete</label><select id="cp-r"'+(so?' disabled':'')+'>'+[['nao','Não repete'],['semana','Toda semana'],['mes','Todo mês, no mesmo dia']].map(function(x){return '<option value="'+x[0]+'"'+((c?c.rep:'nao')===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div><div class="field"><label for="cp-i">Começa</label><input id="cp-i" type="time" step="900" value="'+ini+'"></div><div class="field"><label for="cp-f">Termina</label><input id="cp-f" type="time" step="900" value="'+fim+'"></div></div>';
  h+='<div class="field"><label for="cp-o">Onde</label><input id="cp-o" autocomplete="off" value="'+escH(c?c.onde:'')+'" placeholder="Online, endereço ou sala"></div><div class="field"><label for="cp-n">Anotação</label><textarea id="cp-n" style="min-height:64px">'+escH(c?c.nota:'')+'</textarea></div>';
  return h+'<p class="err" id="cp-e" hidden></p><div class="btnrow"><button class="btn pri" data-act="cp-save">'+(c?'Salvar':'Criar compromisso')+'</button><button class="btn" data-act="close">Cancelar</button></div></section>';
}
/* Novo paciente (19/11/2026): três caminhos no alto da janela (adulto, casal, criança ou adolescente);
   os campos de quem é atendido mudam com a escolha, o resto (valor, dia, hora) é igual. */
var NP_T=[['adulto','Adulto'],['casal','Casal'],['menor','Criança ou adolescente']];
function mNovoPac(){
  var m=UI.modal||{}, k=m.tipo||'adulto', v=m.v||{}, val=function(id,d){return escH(v[id]!==undefined?v[id]:(d||''))};
  var cmp=function(id,rot,ph,tipo){return '<div class="field"><label for="'+id+'">'+rot+'</label><input id="'+id+'"'+(tipo?' type="'+tipo+'"':' autocomplete="off"')+(ph?' placeholder="'+ph+'"':'')+' value="'+val(id)+'"></div>'};
  var sel=function(id,rot,ops){return '<div class="field"><label for="'+id+'">'+rot+'</label><select id="'+id+'">'+ops.map(function(o){var vv=o[0],tt=o[1]||o[0];return '<option value="'+vv+'"'+(String(v[id]!==undefined?v[id]:ops[0][0])===String(vv)?' selected':'')+'>'+tt+'</option>'}).join('')+'</select></div>'};
  var h=hdr('Novo paciente','As sessões das próximas 8 semanas entram na agenda.')+'<section><div class="seg np-tipo" role="group" aria-label="Quem vai ser atendido">'+NP_T.map(function(x){return '<button data-act="np-tipo" data-v="'+x[0]+'" aria-pressed="'+(k===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>';
  if(k==='casal')h+='<div class="grid2">'+cmp('np-n','Primeira pessoa','Nome inventado')+cmp('np-nasc','Nascimento','','date')+cmp('np-n2','Segunda pessoa','Nome inventado')+cmp('np-nasc2','Nascimento','','date')+'</div>';
  else if(k==='menor')h+='<div class="grid2">'+cmp('np-n','Nome da criança ou adolescente','Nome inventado')+cmp('np-nasc','Nascimento','','date')+sel('np-fx','Criança ou adolescente?',[['Criança'],['Adolescente']])+'<span></span>'+cmp('np-r','Responsável','Nome inventado')+sel('np-par','Parentesco',[['mãe','Mãe'],['pai','Pai'],['avó','Avó'],['avô','Avô'],['responsável','Outro responsável']])+'</div>';
  else h+='<div class="grid2">'+cmp('np-n','Nome','Nome inventado')+cmp('np-nasc','Nascimento','','date')+'</div>';
  h+='<div class="grid2"><div class="field"><label for="np-v">Valor da sessão (R$)</label><input id="np-v" data-money inputmode="numeric" value="'+val('np-v',k==='casal'?'260,00':'180,00')+'"></div>'
    +sel('np-w','Dia da semana',[[1,'Segunda'],[2,'Terça'],[3,'Quarta'],[4,'Quinta'],[5,'Sexta'],[6,'Sábado']])
    +'<div class="field"><label for="np-h">Hora</label><input id="np-h" type="time" step="1800" value="'+val('np-h','15:00')+'"></div>'
    +sel('np-f','Frequência',[[7,'Toda semana'],[14,'A cada 15 dias']])+sel('np-m','Modalidade',[['Online'],['Presencial']])+'</div>';
  return h+'<p class="err" id="np-e" hidden></p><div class="btnrow"><button class="btn pri" data-act="np-save">'+(k==='casal'?'Salvar casal':'Salvar paciente')+'</button><button class="btn" data-act="close">Cancelar</button></div></section>';
}
function mDesp(){
  return hdr('Lançar despesa')+'<section><div class="field"><label for="dp-d">Descrição</label><input id="dp-d" autocomplete="off" placeholder="Aluguel da sala."></div><div class="grid2"><div class="field"><label for="dp-v">Valor (R$)</label><input id="dp-v" data-money inputmode="numeric" placeholder="0,00"></div><div class="field"><label for="dp-t">Dia</label><input id="dp-t" type="date" value="'+TODAY+'"></div></div><div class="field"><label for="dp-c">Categoria</label><select id="dp-c"><option>Ferramentas</option><option>Formação</option><option>Serviços</option><option>Sala</option><option>Impostos</option><option>Outras</option></select></div><p class="err" id="dp-e" hidden></p><div class="btnrow"><button class="btn pri" data-act="dp-save">Lançar despesa</button><button class="btn" data-act="close">Cancelar</button></div></section>';
}
function mDecl(m){
  var ativos=S.pac.filter(function(p){return p.ativo}); if(!m.pid)m.pid=ativos[0].id; if(!m.q)m.q='tri';
  var r=declaracao(m.pid,m.q);
  return hdr('Declaração para reembolso','Datas e valores pagos, sem sintoma.')+'<section><div class="grid2"><div class="field"><label for="dc-p">Paciente</label><select id="dc-p" data-dc>'+ativos.map(function(p){return '<option value="'+p.id+'"'+(p.id===m.pid?' selected':'')+'>'+escH(p.nome)+'</option>'}).join('')+'</select></div><div class="field"><label for="dc-q">Período</label><select id="dc-q" data-dc>'+[['mes','Este mês'],['ant','Mês passado'],['tri','Últimos 3 meses'],['ano','Este ano']].map(function(x){return '<option value="'+x[0]+'"'+(x[0]===m.q?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div></div><div class="quote">'+escH(r.txt)+'</div><div class="btnrow"><button class="btn pri sm" data-act="copy-decl">Copiar declaração</button><span class="muted">'+(r.n?plural(r.n,'sessão','sessões')+', '+brl(r.tot)+'.':'')+'</span></div></section>';
}
function docTxt(k,p){
  var quem=(p.tipo==='Adolescente'||p.tipo==='Criança')?(p.resp?p.resp.split(',')[0]:'o responsável'):p.nome;
  if(k==='contrato') return 'Contrato de atendimento psicológico '+p.mod.toLowerCase()+'\n\nPaciente: '+p.nome+'.'+(p.resp?'\n'+(p.tipo==='Casal'?'Parceiros':'Responsável')+': '+p.resp:'')+'\nSessões: '+DOWL[p.dow%7]+', às '+p.hora+', '+(p.freq===7?'toda semana':'a cada 15 dias')+', com 50 minutos.\nValor: '+brl(p.valor)+' por sessão, pago até o dia da sessão.\nFaltas: avisadas com 24 horas de antecedência não são cobradas.\nSigilo: '+(p.mod==='Online'?'sessões em plataforma com criptografia, de local reservado dos dois lados, sem gravação.':'sessões em sala reservada, sem gravação.')+'\nUrgência: fora do horário, procurar o serviço de saúde mais próximo ou o CVV, pelo 188.\n\nModelo de exemplo. Revise antes de usar.';
  return 'Termo de consentimento\n\nEu, '+quem+', declaro que fui informado(a) sobre como funciona o atendimento'+((p.tipo==='Adolescente'||p.tipo==='Criança')?' de '+p.nome:'')+', o sigilo e seus limites, a guarda do prontuário e os recursos usados para registrar o atendimento e proteger o sigilo (prontuário eletrônico com acesso por senha pessoal do psicólogo), e concordo em começar.\n\nModelo de exemplo. Revise antes de usar.';
}
function mDoc(m){ var p=pac(UI.pid); return hdr(m.doc==='contrato'?'Contrato de atendimento':'Termo de consentimento',escH(p.nome)+'. Gerado do cadastro.')+'<section><div class="quote" id="doc-txt">'+escH(docTxt(m.doc,p))+'</div><div class="btnrow"><button class="btn pri sm" data-act="copy-doc">Copiar texto</button></div></section>'; }
function mText(m){ return hdr(m.t,m.sub)+'<section><div class="quote">'+escH(m.txt)+'</div><div class="btnrow"><button class="btn pri sm" data-act="copy-text">Copiar mensagem</button></div></section>'; }
/* Google Agenda: no protótipo só guarda a escolha; a ligação de verdade depende de login (decisão 1 do estado) */
function mGcal(){ var on=!!(S.cfg&&S.cfg.gcal);
  return hdr('Sincronizar com o Google Agenda','Sessões e compromissos do Ostinato aparecem no seu Google Agenda, e o que você marcar lá ocupa o horário aqui.')
  +'<section><p>'+(on?'Ligado. As sessões vão sem o nome completo do paciente: só as iniciais e "sessão".':'Desligado.')+'</p>'
  +'<p class="muted" style="font-size:var(--fs-2)">No protótipo a conta Google não é conectada de verdade; a escolha fica guardada neste navegador.</p>'
  +'<div class="btnrow"><button class="btn pri" data-act="gcal-tg">'+(on?'Desligar':'Conectar conta Google')+'</button><button class="btn" data-act="close">Fechar</button></div></section>'; }
function mAtalhos(){
  var L=[['Ctrl+K','Buscar um paciente ou uma tela, de qualquer lugar.'],['1 a 5','Hoje, Agenda, Pacientes, Prontuário e Financeiro.'],['N','Marcar sessão.'],['/','Buscar na tela (paciente ou texto do prontuário).'],['T','Na agenda, voltar para hoje.'],['← e →','Na agenda, semana ou mês anterior e seguinte.'],['S e M','Na agenda, ver por semana ou por mês.'],['Tab','No prontuário, pular para o próximo campo em vermelho.'],['Ctrl+Enter','No prontuário, aprovar o registro.'],['Ctrl+Z','Desfazer a última mudança da agenda.'],['Esc','Fechar a janela ou o menu aberto.'],['?','Abrir esta lista.']];
  return hdr('Atalhos do teclado','Valem quando você não está escrevendo num campo.')+'<section><dl class="atalhos">'+L.map(function(x){return '<dt>'+x[0]+'</dt><dd>'+x[1]+'</dd>'}).join('')+'</dl></section>';
}
function renderModal(){
  var m=UI.modal, box=$('#modal'); if(!m){box.hidden=true;return}
  $('#sheet').innerHTML=m.k==='sess'?mSess(m):m.k==='ns'?mNovaSess(m):m.k==='np'?mNovoPac():m.k==='dp'?mDesp():m.k==='decl'?mDecl(m):m.k==='doc'?mDoc(m):m.k==='cp'?mComp(m):m.k==='atalhos'?mAtalhos():m.k==='gcal'?mGcal():mText(m);
  box.hidden=false;
}
function openModal(m){UI.modal=m;renderModal();var f=$('#sheet input:not([type=checkbox])');if(f&&(m.k==='np'||m.k==='dp'))f.focus()}
function stash(){var n=$('#nota');if(n&&UI.modal&&UI.modal.k==='sess')UI.modal.draft=n.value}

/* ---------- desenho geral ---------- */
function render(){
  var r=UI.route, app=APP.indexOf(r)>=0;
  $('#site').hidden=app; $('#app').hidden=!app; $('#top').hidden=app;
  $('#menu').hidden=true; $('#menubtn').setAttribute('aria-expanded','false');
  $$('[data-act="nav"]').forEach(function(b){ if(b.dataset.to===r && !b.classList.contains('btn') && !b.classList.contains('logo')) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  if(!app){
    $$('#site [data-page]').forEach(function(s){s.hidden=s.dataset.page!==r});
    $('#cta').hidden=r==='precos';
    if(r==='inicio'){renderWk();$('#site-ag').innerHTML=agSemana().replace(' id="wkwrap"','')} else wkStop();
    if(r==='agenda')renderDg(); if(r==='prontuario')renderPr(); if(r==='financeiro')renderFd(); if(r==='formas'){renderFm();renderPb()}
    return;
  }
  wkStop();
  var q=$('#pbusca'), qv=q?q.value:'';
  $('#main').innerHTML=r==='app-hoje'?vHoje():r==='app-agenda'?vAgenda():r==='app-pacientes'?vPacientes():r==='app-prontuario'?vProntuario():r==='app-config'?(window.RastroConfig?window.RastroConfig.vista():''):vFinanceiro();
  if(qv&&$('#pbusca')){$('#pbusca').value=qv;filtraPac()}
  if(document.getElementById('cd')){cadFit();cadMsg();if(CAD.q)cadBusca()}
  var np=porRegistrar().length,npe=$('#n-pront');if(npe)npe.textContent=np||'';
  $('#resetbtn').textContent=UI.confirmReset?'Confirmar: desfazer o que mudei':'Restaurar o exemplo';
  modoH();
}
/* o pé do menu diz de quem são os dados e troca entre o exemplo e os dados dele */
function modoH(){ var t=$('#modo-txt'); if(!t)return; var meus=MODO==='meus', em=S.meus&&S.meus.em?new Date(S.meus.em):null;
  t.textContent=meus?'Seus dados do Controle Único'+(em?', copiados em '+dm(iso(em))+' às '+pad(em.getHours())+':'+pad(em.getMinutes()):'')+'. Ficam só neste navegador; o que você mudar aqui não volta para o Controle Único.':'Consultório de exemplo. Pacientes inventados, guardados só neste navegador.';
  $('#resetbtn').hidden=meus; $('#meus-ex').hidden=!meus; $('#meus-abre').textContent=meus?'Atualizar meus dados':(localStorage.getItem(KEY_MEUS)?'Voltar aos meus dados':'Usar meus dados do Controle Único') }
/* recebe o arquivo do conversor (formato do Ostinato) e passa a usar esses dados */
function usarMeusDados(d){
  if(!d||d.fonte!=='controle-unico'||!d.pac||!d.sess)throw new Error('Este arquivo não veio do Controle Único.');
  var mx=function(l){return l.reduce(function(m,x){return Math.max(m,x.id||0)},0)+1};
  var novo={week:iso(monday(NOW)),pac:d.pac,sess:d.sess,desp:d.desp||[],comp:d.comp||[],cfg:{ini:7,fim:20,dias:[1,2,3,4,5,6],disp:{}},nextS:mx(d.sess),nextP:mx(d.pac),nextD:mx(d.desp||[]),nextC:mx(d.comp||[]),meus:{em:d.em,pacientes:d.pac.length,sessoes:d.sess.length}};
  localStorage.setItem(KEY_MEUS,JSON.stringify(novo)); localStorage.setItem('ostinato-modo','meus');
  return novo.meus }
function filtraPac(){var v=($('#pbusca').value||'').toLowerCase().trim();$$('#plist [data-nome]').forEach(function(r){r.hidden=!!v&&r.dataset.nome.indexOf(v)<0});var pt=document.querySelector('.pr-todos');if(pt)pt.classList.toggle('buscando',!!v)}
/* O nome da aba do navegador acompanha a página aberta, para achar a aba certa e para o histórico fazer sentido. */
var TIT={agenda:'Agenda',prontuario:'Prontuário',financeiro:'Financeiro',formas:'Formas do prontuário',precos:'Preços','app-hoje':'Início','app-agenda':'Agenda','app-pacientes':'Pacientes','app-prontuario':'Prontuário','app-financeiro':'Financeiro','app-config':'Configurações'};
function titulo(){var t=TIT[UI.route]; document.title=t?t+' | Ostinato':'Ostinato: agenda, prontuário e financeiro para psicólogos'}
function go(r,keepPid){
  if(SITE.indexOf(r)<0&&APP.indexOf(r)<0)r='inicio';
  popClose();UI.route=r; if(!keepPid)UI.pid=null; UI.confirmEnc=false; UI.confirmDesp=null;
  render();titulo();
  try{history.replaceState(null,'',r==='inicio'?location.pathname+location.search:'#'+r)}catch(e){}
  window.scrollTo(0,0);
  if(r==='app-agenda'&&UI.agMode==='semana'){var w=$('#wkwrap'),t=w&&w.querySelector('.is-today');if(t)w.scrollLeft=Math.max(0,t.offsetLeft-60)}
}
function changed(msg){save();render();renderModal();if(msg)toast(msg)}
function geraSessoes(p,desde,semanas){var d=new Date(desde.getFullYear(),desde.getMonth(),desde.getDate());while(d.getDay()!==p.dow%7)d=addDays(d,1);
  for(var i=0;i<semanas;i+=p.freq/7){var x=iso(addDays(d,i*7));if(!S.sess.some(function(s){return s.date===x&&s.hora===p.hora&&s.status!=='cancelada'}))S.sess.push({id:S.nextS++,pid:p.id,date:x,hora:p.hora,valor:p.valor,status:'agendada',cobrar:false,pago:false,forma:'',nota:'',recibo:false})}}
function money(v){var n=parseInt(String(v).replace(/\D/g,''),10);return isNaN(n)?0:n/100}

var ACT={
  'nv-msg':function(b){copy('Feliz aniversário, '+b.dataset.q.split(' ')[0]+'! Desejo um ótimo dia e um novo ano com saúde. Um abraço.','Mensagem de parabéns copiada. Mude o texto antes de mandar, se quiser.')},
  'ag-google':function(){openModal({k:'gcal'})},
  'gcal-tg':function(){CFG().gcal=!CFG().gcal;save();renderModal();render();toast(S.cfg.gcal?'Google Agenda ligado (no protótipo, só a escolha).':'Google Agenda desligado.')},
  'ag-divulga':function(){ if(!AG_LIVRES.length){toast('Nenhum horário livre divulgado daqui para a frente nesta semana.');return}
    var por={}; AG_LIVRES.forEach(function(o){(por[o.d]=por[o.d]||[]).push(o.x+'h')});
    var t='Olá! Estou com horários disponíveis para novos pacientes:\n'+Object.keys(por).sort().map(function(d){var l=por[d];return '\n'+cap(DOWL[parse(d).getDay()])+', '+dm(d)+': '+(l.length>1?l.slice(0,-1).join(', ')+' e '+l[l.length-1]:l[0])}).join('')+'\n\nAs sessões são online e duram 50 minutos. Se tiver interesse, é só me chamar.';
    copy(t,'Mensagem de divulgação copiada.')},
  'nav':function(b){go(b.dataset.to)},
  'menu':function(){var m=$('#menu');m.hidden=!m.hidden;$('#menubtn').setAttribute('aria-expanded',String(!m.hidden))},
  'theme':function(){var r=document.documentElement,cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),n=cur==='dark'?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem(KEY+'-tema',n)}catch(e){}},
  'wk':function(b){wkStop();UI.wk=Number(b.dataset.i);renderWk()},
  'wk-play':function(){if(UI.wkTimer){wkStop();renderWk()}else wkPlay()},
  'dg':function(b){var e=UI.dg.find(function(x){return x.k===b.dataset.k});e.s=CICLO[CICLO.indexOf(e.s)+1];renderDg()},
  'copy-dg':function(){copy('Olá, Sofia! Ainda não marcamos a próxima sessão. Tenho horário na sexta às 11:00. Fica bom para você?','Mensagem copiada.')},
  'pr-m':function(b){UI.prModel=b.dataset.m;renderPr()},
  'pb-v':function(b){PB.v=Number(b.dataset.o);renderPb()},
  'pb-c':function(b){PB.cor=Number(b.dataset.o);renderPb()},
  'pb-l':function(b){PB.let=Number(b.dataset.o);renderPb()},
  'pb-s':function(b){PB.sit=Number(b.dataset.o);renderEd()},
  'pb-rq':function(b){PB.rq=Number(b.dataset.o);renderEd()},
  'pb-ok':function(){pbOk()},
  'pb-reset':function(){pbStart();renderEd();toast('Exemplo recomeçado na sessão 09.')},
  'pb-rm':function(b){var ln=b.closest('.ln'),k=b.dataset.k;if(k.charAt(0)!=='x')PB.rm[k]=ln;ln.remove();pbAddH();pbOut();pbSug(null)},
  'pb-back':function(b){var k=b.dataset.k,ln=PB.rm[k],ks=PB_EV.map(function(x){return x.k}),i=ks.indexOf(k),nx=null;
    for(var j=i+1;j<ks.length&&!nx;j++)nx=$('#pb-ed .ln[data-k="'+ks[j]+'"]');
    $('#pb-ed').insertBefore(ln,nx);delete PB.rm[k];pbAddH();pbOut();var g=$('.gap.vz',ln);if(g)gapSel(g)},
  'pb-fo':function(b){var f=PB_FO[Number(b.dataset.o)],ln=$('#pb-ed .ln[data-k="tema"]');if(ln)gapFill(ln,[f.tema,f.obj])},
  'pb-tc':function(b){var t=PB_FO[Number(b.dataset.o)].tec[Number(b.dataset.j)],ln=$('#pb-ed .ln[data-k="tecnica"]');if(ln)gapFill(ln,t)},
  'pb-open':function(){PB.open=!PB.open;PB.ed=null;PB.org=false;PB.del=null;PB.q='';renderPop();if(PB.open)setTimeout(function(){var q=$('#fr-q');if(q)q.focus()},0)},
  'fr-use':function(b){var f=pbFind(b.dataset.id);PB.open=false;renderPop();frUse(f)},
  'fr-org':function(){PB.org=!PB.org;PB.del=null;renderPop()},
  'fr-new':function(){var sl=getSelection(),inEd=sl.anchorNode&&sl.anchorNode.parentElement&&sl.anchorNode.parentElement.closest('#pb-ed');PB.pre=inEd?sl.toString().trim():'';PB.preN=PB.q;PB.ed='new';renderPop()},
  'fr-ed':function(b){PB.ed=b.dataset.id;PB.del=null;renderPop()},
  'fr-del':function(b){var id=b.dataset.id;if(PB.del!==id){PB.del=id;renderFrList();return}PB.F=PB.F.filter(function(x){return x.id!==id});PB.del=null;pbSave();renderPop();toast('Frase excluída.')},
  'fr-x':function(){PB.ed=null;renderPop()},
  'fr-ok':function(){var n=$('#fr-n').value.trim(),t=$('#fr-t').value.trim();if(!n||!t){toast(!n?'Dê um nome ao botão.':'Escreva o texto da frase.');($('#fr-'+(!n?'n':'t'))).focus();return}
    if(PB.ed==='new'){PB.F.push({id:'f'+Date.now(),n:n,t:t});toast('Frase criada.')}else{var f=pbFind(PB.ed);f.n=n;f.t=t;toast('Frase alterada.')}
    pbSave();PB.ed=null;PB.q='';renderPop()},
  'fr-reset':function(){PB.F=pbSeed();pbSave();renderPop();toast('Frases de exemplo de volta.')},
  'fs-s':function(b){FS.sit=Number(b.dataset.o);renderFm()},
  'fs-t':function(b){FS.tar=Number(b.dataset.o);renderFm()},
  'f3s':function(b){F3.st=Number(b.dataset.o);renderFm()},
  'f3o':function(b){var o=Number(b.dataset.o);if(o!==F3.ob){F3.ob=o;F3.iv=[0]}renderFm()},
  'f3i':function(b){var o=Number(b.dataset.o),k=F3.iv.indexOf(o);if(k>=0)F3.iv.splice(k,1);else F3.iv.push(o);renderFm()},
  'copy-fd':function(){copy($('#fd-out').textContent,'Declaração copiada.')},
  'meus-abre':function(){ if(MODO==='exemplo'&&localStorage.getItem(KEY_MEUS)&&!UI.meusNovo){localStorage.setItem('ostinato-modo','meus');location.reload();return} var f=$('#meusdados'); f.value=''; f.click() },
  'meus-ex':function(){ try{localStorage.setItem('ostinato-modo','exemplo')}catch(e){} location.reload() },
  'reset':function(){if(!UI.confirmReset){UI.confirmReset=true;render();return}UI.confirmReset=false;S=seed();UI.pid=null;var f=$('#fd-p');if(f)f.innerHTML='';changed('Exemplo restaurado.')},
  'atalhos':function(){openModal({k:'atalhos'})},
  'close':function(){UI.modal=null;renderModal()},
  'sess':function(b){openModal({k:'sess',id:Number(b.dataset.id)})},
  'sess-new':function(b){openModal({k:'ns',d:UI.route==='app-agenda'&&UI.agMode==='mes'?UI.agDay:TODAY,h:'09:00',pid:Number(b.dataset.pid)||UI.pid})},
  'slot':function(b){openModal({k:'ns',d:b.dataset.d,h:b.dataset.h,pid:null})},
  'ev':function(b){popOpen({k:'s',id:Number(b.dataset.id)},b)},
  'vz':function(b){popOpen({k:'v',d:b.dataset.d,h:Number(b.dataset.h)},b)},
  'cp':function(b){popOpen({k:'c',id:Number(b.dataset.id),orig:b.dataset.orig},b)},
  'cp-new':function(b){popClose();openModal({k:'cp',d:b.dataset.d||(UI.agMode==='mes'?UI.agDay:TODAY),h:9})},
  'pop-x':function(){popClose()},
  'undo':function(){$('#toast').hidden=true;desfazer()},
  'pp-st':function(b){var s=sessById(POP.id),st=b.dataset.st;mark();s.status=st;s.cobrar=false;if(!due(s)){s.pago=false;s.forma='';s.recibo=false}
    changedU(st==='realizada'?'Sessão confirmada: entra na conta.':st==='confirmada'?'Paciente confirmou.':'A sessão voltou para a agenda.');popDraw()},
  'pp-falta-ask':function(){POP.falta=true;popDraw()},
  'pp-falta':function(b){var s=sessById(POP.id);mark();s.status='falta';s.cobrar=b.dataset.c==='1';if(!s.cobrar){s.pago=false;s.forma='';s.recibo=false}POP.falta=false;
    changedU(s.cobrar?'Falta cobrada: entra no financeiro.':'Falta sem cobrança.');popDraw()},
  'pp-lemb':function(){copy(lembrete(sessById(POP.id)),'Lembrete copiado.')},
  'pp-cort':function(){var s=sessById(POP.id);mark();s.cortesia=!s.cortesia;if(s.cortesia){s.pago=false;s.forma='';s.recibo=false}changedU(s.cortesia?'Cortesia: esta sessão não cobra.':'A sessão volta a cobrar.');popDraw()},
  'pp-nh':function(){var s=sessById(POP.id);mark();s.status='cancelada';s.pago=false;s.forma='';s.recibo=false;popClose();changedU('Não haverá a sessão de '+dm(s.date)+'.')},
  'pp-mv':function(){POP.k='mv';POP.d=null;POP.h=null;popDraw()},
  'pp-full':function(){var id=POP.id;popClose();openModal({k:'sess',id:id})},
  'pp-ns':function(){var d=POP.d,x=POP.h;popClose();openModal({k:'ns',d:d,h:pad(x)+':00',pid:null})},
  'pp-cpnew':function(){var d=POP.d,x=POP.h;popClose();openModal({k:'cp',d:d,h:x})},
  'pp-disp':function(){var k=parse(POP.d).getDay()+'-'+POP.h,c=CFG();mark();if(c.disp[k])delete c.disp[k];else c.disp[k]=1;
    changedU(c.disp[k]?'Horário oferecido a novos pacientes, toda semana.':'O horário deixou de ser oferecido.');popDraw()},
  'pp-cpedit':function(){var o={k:'cp',id:POP.id,orig:POP.orig,so:true};popClose();openModal(o)},
  'pp-cpx':function(){var c=compById(POP.id),orig=POP.orig;mark();if(c.rep==='nao')S.comp=S.comp.filter(function(x){return x!==c});else{c.ex=c.ex||{};c.ex[orig]='x'}
    popClose();changedU(c.rep==='nao'?'Compromisso apagado.':'Compromisso desmarcado nesta vez.')},
  'pp-cpback':function(){var c=compById(POP.id);mark();delete c.ex[POP.orig];popClose();changedU('Voltou ao horário de sempre.')},
  'pm-ok':function(b){var s=sessById(POP.id),d=$('#pm-d').value,hr=$('#pm-h').value,e=$('#pm-e');
    if(!d||!hr){e.textContent='Escolha o dia e a hora.';e.hidden=false;return}
    var c=conflito(d,hr,s.id);if(c){e.textContent='Nesse horário já tem '+pac(c.pid).nome+'.';e.hidden=false;return}
    var msg=remarcar(s,d,hr,b.dataset.m==='fixo');popClose();UI.agRef=d;UI.agDay=d;changedU(msg)},
  'cm-ok':function(b){var c=compById(POP.id),so=b.dataset.m==='1';mark();moveComp(c,POP.orig,POP.d,POP.ini,POP.fim,so);popClose();changedU(c.tit+(so?' mudou só nesta vez.':' mudou em todas as vezes.'))},
  'cp-so':function(b){UI.modal.so=b.dataset.v==='1';$$('[data-act="cp-so"]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});$('#cp-r').disabled=UI.modal.so},
  'cp-save':function(){var m=UI.modal,t=$('#cp-t').value.trim(),d=$('#cp-d').value,i=$('#cp-i').value,f=$('#cp-f').value,r=$('#cp-r').value,e=$('#cp-e');
    if(!t){e.textContent='Escreva o que é o compromisso.';e.hidden=false;$('#cp-t').focus();return}
    if(!d||!i||!f||f<=i){e.textContent='Confira o dia e os horários: o fim vem depois do começo.';e.hidden=false;return}
    mark();if(!S.comp)S.comp=[];var c=m.id?compById(m.id):null,o=$('#cp-o').value.trim(),n=$('#cp-n').value.trim();
    if(!c){var id=S.nextC||1;S.nextC=id+1;S.comp.push({id:id,tit:t,date:d,ini:i,fim:f,rep:r,onde:o,nota:n,ex:{}})}
    else{c.tit=t;c.onde=o;c.nota=n;if(c.rep!=='nao'&&m.so!==false)moveComp(c,m.orig,d,i,f,true);else{moveComp(c,m.orig,d,i,f,false);c.rep=r}}
    UI.modal=null;UI.agRef=d;UI.agDay=d;changedU(c?'Compromisso salvo.':'Compromisso criado.')},
  'ag-mode':function(b){UI.agMode=b.dataset.m;render()},
  'ag-today':function(){UI.agRef=TODAY;UI.agDay=TODAY;render()},
  'ag-nav':function(b){var n=Number(b.dataset.n),d=parse(UI.agRef);UI.agRef=UI.agMode==='semana'?iso(addDays(d,7*n)):iso(new Date(d.getFullYear(),d.getMonth()+n,1));if(UI.agMode==='mes')UI.agDay=UI.agRef;else UI.agDay=iso(addDays(parse(UI.agDay),7*n));render()},
  'ag-day':function(b){UI.agDay=b.dataset.d;render()},
  'sess-st':function(b){stash();var s=sessById(UI.modal.id),st=b.dataset.st;if(st==='falta'){UI.modal.askFalta=true;renderModal();return}
    mark();s.status=st;s.cobrar=false;if(!due(s)){s.pago=false;s.forma='';s.recibo=false}changed('Sessão marcada como '+STATUS[st].toLowerCase()+'.')},
  'falta':function(b){stash();mark();var s=sessById(UI.modal.id);s.status='falta';s.cobrar=b.dataset.c==='1';if(!s.cobrar){s.pago=false;s.forma='';s.recibo=false}UI.modal.askFalta=false;changed(s.cobrar?'Falta cobrada: entra no financeiro.':'Falta não cobrada: fica fora da conta.')},
  'pay':function(b){stash();mark();var s=sessById(UI.modal.id);s.pago=true;s.forma=b.dataset.f;changed('Recebimento registrado.')},
  'unpay':function(){stash();mark();var s=sessById(UI.modal.id);s.pago=false;s.forma='';s.recibo=false;UI.modal.recibo=false;changed('Recebimento desfeito.')},
  'recibo':function(){stash();var s=sessById(UI.modal.id);s.recibo=true;UI.modal.recibo=true;changed('Recibo emitido.')},
  'copy-recibo':function(){copy(reciboTxt(sessById(UI.modal.id)),'Recibo copiado.')},
  'copy-lemb':function(){copy(lembrete(sessById(UI.modal.id)),'Lembrete copiado.')},
  'note-model':function(){var n=$('#nota'),t='Demanda: \nIntervenção: \nResposta: \nPlano: ';n.value=n.value.trim()?n.value+'\n\n'+t:t;n.focus()},
  'note-save':function(){var s=sessById(UI.modal.id);s.nota=$('#nota').value.trim();UI.modal.draft=null;changed(s.nota?'Evolução salva.':'Evolução apagada.')},
  'pac':function(b){UI.modal=null;renderModal();UI.ptab=b.dataset.tab||'resumo';UI.pid=Number(b.dataset.id);go('app-pacientes',true)},
  'pac-back':function(){UI.pid=null;render();window.scrollTo(0,0)},
  'pr-back':function(){UI.pid=null;render();window.scrollTo(0,0)},
  'pr-open':function(b){UI.modal=null;renderModal();abreCad(Number(b.dataset.id),b.dataset.sid?Number(b.dataset.sid):null);go('app-prontuario',true)},
  'ptab':function(b){UI.ptab=b.dataset.t;UI.confirmEnc=false;render()},
  'pfil':function(b){UI.pfil=b.dataset.f;render()},
  'pac-new':function(){openModal({k:'np'})},
  'pac-enc':function(){UI.confirmEnc=true;render()},
  'pac-enc-no':function(){UI.confirmEnc=false;render()},
  'pac-enc-ok':function(){var p=pac(UI.pid);p.ativo=false;S.sess.forEach(function(s){if(s.pid===p.id&&s.date>=TODAY&&(s.status==='agendada'||s.status==='confirmada'))s.status='cancelada'});UI.confirmEnc=false;changed('Atendimento encerrado. Sessões futuras canceladas.')},
  'pac-reativar':function(){var p=pac(UI.pid);p.ativo=true;geraSessoes(p,NOW,8);changed('Atendimento retomado, com 8 semanas na agenda.')},
  'convite':function(b){var p=pac(Number(b.dataset.id));openModal({k:'text',t:'Convite para a próxima sessão',sub:escH(p.nome)+'. Horário do contrato.',txt:convite(p)})},
  'copy-text':function(){copy(UI.modal.txt,'Mensagem copiada.')},
  'decl':function(b){openModal({k:'decl',pid:Number(b.dataset.id)||null})},
  'copy-decl':function(){var m=UI.modal;copy(declaracao(m.pid,m.q).txt,'Declaração copiada.')},
  'doc':function(b){openModal({k:'doc',doc:b.dataset.k})},
  'copy-doc':function(){copy($('#doc-txt').textContent,'Texto copiado.')},
  'fin-nav':function(b){var n=Number(b.dataset.n);UI.finRef=n?ymAdd(UI.finRef,n):TODAY.slice(0,7);UI.confirmDesp=null;render()},
  'fin-fil':function(b){UI.finFil=b.dataset.f||b.value;render()},
  'fin-rel':function(){UI.finRel=!UI.finRel;render()},
  'pr-todos':function(){UI.prTodos=true;render()},
  'desp-new':function(){openModal({k:'dp'})},
  'desp-del':function(b){UI.confirmDesp=Number(b.dataset.id);render()},
  'desp-del-ok':function(b){var id=Number(b.dataset.id);S.desp=S.desp.filter(function(d){return d.id!==id});UI.confirmDesp=null;changed('Despesa apagada.')},
  'ns-save':function(){var p=pac(Number($('#ns-p').value)),d=$('#ns-d').value,h=$('#ns-h').value,e=$('#ns-e'),n=$('#ns-r').checked?8:1;
    if(!p||!d||!h){e.textContent='Preencha paciente, dia e hora.';e.hidden=false;return}
    var c=S.sess.find(function(s){return s.date===d&&s.hora===h&&s.status!=='cancelada'});
    if(c){e.textContent='Já existe sessão nesse horário: '+pac(c.pid).nome+'. Escolha outra hora.';e.hidden=false;return}
    mark();var feitas=0;for(var i=0;i<n;i++){var x=iso(addDays(parse(d),i*7));if(S.sess.some(function(s){return s.date===x&&s.hora===h&&s.status!=='cancelada'}))continue;S.sess.push({id:S.nextS++,pid:p.id,date:x,hora:h,valor:p.valor,status:'agendada',cobrar:false,pago:false,forma:'',nota:'',recibo:false,extra:(parse(x).getDay()!==p.dow%7||h!==p.hora)});feitas++}
    UI.modal=null;UI.agRef=d;UI.agDay=d;changed(plural(feitas,'sessão marcada','sessões marcadas')+'.')},
  'np-tipo':function(b){var v={};$$('#sheet input,#sheet select').forEach(function(x){if(x.id&&x.id!=='np-v')v[x.id]=x.value});UI.modal.v=v;UI.modal.tipo=b.dataset.v;renderModal();var f=$('#np-n');if(f)f.focus()},
  'np-save':function(){var k=UI.modal.tipo||'adulto',g=function(id){var x=$('#'+id);return x?x.value.trim():''},nome=g('np-n'),v=money($('#np-v').value),e=$('#np-e'),erro=function(msg,id){e.textContent=msg;e.hidden=false;$('#'+id).focus()};
    if(!nome){erro(k==='casal'?'Escreva o nome da primeira pessoa.':'Escreva o nome do paciente.','np-n');return}
    if(k==='casal'&&!g('np-n2')){erro('Escreva o nome da segunda pessoa.','np-n2');return}
    if(k==='menor'&&!g('np-r')){erro('Escreva o nome do responsável.','np-r');return}
    if(!v){erro('Informe o valor da sessão.','np-v');return}
    var hh=$('#np-h').value||'15:00',dw=Number($('#np-w').value),oc=S.sess.filter(function(s){return s.status!=='cancelada'&&s.date>=TODAY&&s.hora===hh&&parse(s.date).getDay()===dw%7})[0];
    if(oc){erro(cap(DOWL[dw%7])+' às '+hh+' já tem sessão com '+pac(oc.pid).nome+'. Escolha outro dia ou outra hora.','np-h');return}
    var p={id:S.nextP++,nome:nome,tipo:'Individual',valor:v,dow:Number($('#np-w').value),hora:$('#np-h').value||'15:00',freq:Number($('#np-f').value),mod:$('#np-m').value,ativo:true,resp:'',nasc:g('np-nasc')};
    if(k==='casal'){var n2=g('np-n2'),s1=nome.split(' '),s2=n2.split(' ');p.tipo='Casal';p.genero='C';p.nasc2=g('np-nasc2');p.resp=nome+' e '+n2+', atendidos juntos.';
      p.nome=(s1.length>1&&s2.length>1&&s1[s1.length-1]===s2[s2.length-1])?s1.slice(0,-1).join(' ')+' e '+n2:nome+' e '+n2}
    if(k==='menor'){p.tipo=g('np-fx')||'Adolescente';p.resp=g('np-r')+', '+g('np-par')+'.'}
    S.pac.push(p);geraSessoes(p,NOW,8);UI.modal=null;UI.pid=p.id;UI.ptab='resumo';UI.pfil='ativos';var f=$('#fd-p');if(f)f.innerHTML='';
    if(UI.route!=='app-pacientes'){save();go('app-pacientes',true);toast((p.tipo==='Casal'?'Casal salvo':'Paciente salvo')+', com as sessões na agenda.')}else changed('Paciente salvo, com as sessões na agenda.')},
  'dp-save':function(){var d=$('#dp-d').value.trim(),v=money($('#dp-v').value),e=$('#dp-e');
    if(!d||!v){e.textContent='Preencha a descrição e o valor.';e.hidden=false;return}
    if(!/[.!?]$/.test(d))d+='.';var dt=$('#dp-t').value||TODAY;S.desp.push({id:S.nextD++,date:dt,desc:d,cat:$('#dp-c').value,valor:v});UI.modal=null;UI.finRef=dt.slice(0,7);changed('Despesa lançada.')}
};
document.addEventListener('click',function(ev){
  if(JUSTDRAG){JUSTDRAG=false;return}
  var b=ev.target.closest('[data-act]');
  if(POP&&!ev.target.closest('#pop')&&!(b&&/^(ev|vz|cp)$/.test(b.dataset.act)))popClose();
  if(!b){if(ev.target.id==='modal'){UI.modal=null;renderModal()}return}
  if(b.dataset.act!=='reset'&&UI.confirmReset)UI.confirmReset=false;
  var f=ACT[b.dataset.act];if(f)f(b);
});
document.addEventListener('keydown',function(ev){
  if(document.getElementById('ss'))return; /* modo sessão aberto: o teclado é dele (js/sessao.js) */
  if(ev.key==='Escape'){if(POP){popClose();return}if(UI.modal){UI.modal=null;renderModal()}return}
  if((ev.ctrlKey||ev.metaKey)&&!ev.shiftKey&&(ev.key==='z'||ev.key==='Z')&&APP.indexOf(UI.route)>=0){
    var t=ev.target;if(t.closest&&t.closest('input,textarea,select,[contenteditable="true"]'))return;ev.preventDefault();desfazer();return}
  /* atalhos do app: só fora de campo de texto, sem janela nem menu aberto */
  if(APP.indexOf(UI.route)<0||ev.ctrlKey||ev.metaKey||ev.altKey||UI.modal||POP)return;
  var tg=ev.target;if(tg.closest&&tg.closest('input,textarea,select,[contenteditable="true"]'))return;
  var k=ev.key.toLowerCase(), ix=['1','2','3','4','5'].indexOf(k);
  if(ix>=0){go(APP[ix]);return}
  if(k==='n'){ev.preventDefault();ACT['sess-new']({dataset:{}});return}
  if(k==='?'){ACT.atalhos();return}
  if(k==='/'){var qb=document.getElementById('cd-q')||document.getElementById('pbusca');if(qb&&qb.offsetParent){ev.preventDefault();qb.focus()}return}
  if(UI.route==='app-agenda'){
    if(k==='t')ACT['ag-today']();else if(k==='arrowleft')ACT['ag-nav']({dataset:{n:'-1'}});else if(k==='arrowright')ACT['ag-nav']({dataset:{n:'1'}});
    else if(k==='s')ACT['ag-mode']({dataset:{m:'semana'}});else if(k==='m')ACT['ag-mode']({dataset:{m:'mes'}}); }
});
document.addEventListener('input',function(ev){
  var t=ev.target;
  if(t.id==='pbusca')filtraPac();
  if(t.dataset&&t.dataset.pr!=null){UI.prVals.v[Number(t.dataset.pr)]=t.value;prOut()}
  if(t.dataset&&t.dataset.fs){FS.v[t.dataset.fs]=t.value;fmOut()}
  if(t.dataset&&t.dataset.f3)fmOut();
  if(t.id==='fr-q'){PB.q=t.value;PB.del=null;renderFrList()}
  if(t.hasAttribute&&t.hasAttribute('data-money')){var n=parseInt(t.value.replace(/\D/g,''),10);t.value=isNaN(n)?'':(n/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
});
document.addEventListener('change',function(ev){
  var t=ev.target;
  if(t.dataset&&t.dataset.actChange==='fin-fil'){UI.finFil=t.value;render()}
  if(t.id==='fd-p'||t.id==='fd-q')renderFd();
  if(t.dataset&&t.dataset.dc!=null&&UI.modal){UI.modal.pid=Number($('#dc-p').value);UI.modal.q=$('#dc-q').value;renderModal()}
});
/* a agenda e o caderno mudam de forma abaixo de 700 px: redesenha ao cruzar a largura, sem perder o que está escrito */
var WIDE=innerWidth>=700;
addEventListener('resize',function(){var w=innerWidth>=700;if(w===WIDE)return;WIDE=w;if(APP.indexOf(UI.route)<0)return;if(document.getElementById('cd'))cadRedraw();else render()});
/* símbolo do Rastro, Curvas de nível (o mesmo desenho do guia, com menos contornos para caber pequeno) */
function curvas(ks,sw,dotR){
  var o='',f=function(n){return n.toFixed(2)};
  ks.forEach(function(k){ var s=1-k*0.118,R=43*s,cx=48+k*2.9,cy=54-k*3.1,pts=[];
    for(var i=0;i<120;i++){var t=i/120*Math.PI*2,r=R*(1+0.055*Math.sin(2*t+0.9+k*0.08)+0.03*Math.cos(3*t-0.3));pts.push(f(cx+r*Math.cos(t))+' '+f(cy+r*Math.sin(t)))}
    o+='<path d="M'+pts.join('L')+'Z" fill="none" style="stroke:var(--logo-ink)" stroke-width="'+sw+'"/>'; });
  return o+'<circle cx="'+f(48+8*2.9)+'" cy="'+f(54-8*3.1)+'" r="'+dotR+'" style="fill:var(--logo-dot)"/>';
}
/* símbolo do Rastro desde 16/11/2026: Elo, dois anéis entrelaçados com o ponto no encontro (guia de identidade, seção 3).
   Versão para tamanho pequeno: anel cheio no lugar do anel vazado; o "por cima e por baixo" sai por máscara, sem cor de fundo,
   porque o logo fica sobre vidro. curvas() fica guardada caso o símbolo volte. */
var ELO_N=0;
function elo(){
  var n=++ELO_N,a='eloA'+n,b='eloB'+n,t='eloT'+n,u='eloU'+n,
      halo=function(cx){return '<circle cx="'+cx+'" cy="50" r="23" fill="none" stroke="#000" stroke-width="15"/>'},
      ring=function(cx,m){return '<circle cx="'+cx+'" cy="50" r="23" fill="none" style="stroke:var(--logo-ink)" stroke-width="7" mask="url(#'+m+')"/>'};
  return '<defs><clipPath id="'+t+'"><rect x="38" y="8" width="24" height="32"/></clipPath><clipPath id="'+u+'"><rect x="38" y="60" width="24" height="32"/></clipPath>'+
    '<mask id="'+a+'" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g clip-path="url(#'+u+')">'+halo(62)+'</g></mask>'+
    '<mask id="'+b+'" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g clip-path="url(#'+t+')">'+halo(38)+'</g></mask></defs>'+
    ring(38,a)+ring(62,b)+'<circle cx="50" cy="50" r="5" style="fill:var(--logo-dot)"/>';
}
/* símbolo do Ostinato desde 23/11/2026 (escolha de Matheus: o terceiro logo, Eco): três círculos que voltam um sobre o outro,
   como a figura que se repete no ostinato; o último, cheio, é a sessão de agora. Os dois primeiros só em contorno, mais claros.
   elo() e curvas() ficam guardadas caso o símbolo volte. */
function eco(){
  return '<g fill="none" style="stroke:var(--logo-dot)" stroke-width="7"><circle cx="26" cy="50" r="19" opacity=".38"/><circle cx="50" cy="50" r="19" opacity=".68"/></g>'+
    '<circle cx="74" cy="50" r="19" style="fill:var(--logo-dot)"/>';
}
$$('[data-sym]').forEach(function(el){el.innerHTML=eco()});
function route(){var h=(location.hash||'').slice(1);UI.route=(SITE.indexOf(h)>=0||APP.indexOf(h)>=0)?h:'inicio';render();titulo()}
/* "Pular para o conteúdo": o primeiro Tab da página leva direto ao miolo, sem passar pelo menu inteiro. */
document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('.pula'); if(!a)return; ev.preventDefault();
  var m=document.getElementById(APP.indexOf(UI.route)>=0?'main':'site'); m.setAttribute('tabindex','-1'); m.focus(); m.scrollIntoView()});
try{var tm=localStorage.getItem(KEY+'-tema');if(tm)document.documentElement.setAttribute('data-theme',tm)}catch(e){}
/* Ponte para os arquivos de cada tela (js/pacientes.js): o que eles podem ler do app. */
window.Rastro={UI:UI,dados:function(){return S},pac:pac,saldo:saldo,proxima:proxima,escH:escH,brl:brl,dm:dm,plural:plural,DOW:DOW,TODAY:TODAY,render:render,
  /* para a tela Hoje (js/hoje.js) */ sessOn:sessOn,viva:viva,estado:estado,porRegistrar:porRegistrar,due:due,recState:recState,curto:curto,rastroH:rastroH,longDate:longDate,quando:quando,cap:cap,iso:iso,addDays:addDays,NOW:NOW,minOf:minOf,nowMin:nowMin,DUR:DUR,compsOn:compsOn,go:go,ACT:ACT,faltaInfo:faltaInfo,rastroC:rastroC,
  /* modelos do prontuário e Configurações (js/modelos.js, 23/11/2026) */ PR:PR,prSave:prSave,prBase:prBase,prFrasesSeed:prFrasesSeed,PR_SIT:PR_SIT,PR_TIPOS:PR_TIPOS,PR_VARS:PR_VARS,PR_SEC_DEF:PR_SEC_DEF,secNome:secNome,tipoMod:tipoMod,modeloH:modeloH,linhaH:linhaH,foBodyH:foBodyH,folhaH:folhaH,fraseIns:fraseIns,frasesH:frasesH,
  /* para o modo sessão (js/sessao.js) */ sessById:sessById,cadList:cadList,cadBody:cadBody,cadPrev:cadPrev,isFut:isFut,abreCad:abreCad,save:save,mark:mark,toastU:toastU,toast:toast,lacArruma:lacArruma,pad:pad,capF:capF,
  usarMeusDados:usarMeusDados, modo:function(){return MODO}, monthData:monthData, ymAdd:ymAdd, monday:monday,
  guarda:function(){try{localStorage.setItem(KEYD(),JSON.stringify(S))}catch(e){}},
  /* aniversários, caderno, mapa e lousa (19/11/2026) */ nascDe:nascDe,niverNo:niverNo,niverProx:niverProx,niverMes:niverMes,niverMesH:niverMesH,CHAPEU:CHAPEU,idadeDe:idadeDe,dmy:dmy,DOWL:DOWL,parse:parse,MES:MES};
/* menu "…" ou "+": fecha ao escolher uma opção ou ao tocar fora */
document.addEventListener('click',function(ev){ setTimeout(function(){ Array.prototype.forEach.call(document.querySelectorAll('details.mais[open]'),function(d){
  if(!d.contains(ev.target)||ev.target.closest('.mais-m button'))d.open=false }) },0) });
/* o arquivo escolhido em "Usar meus dados" */
document.addEventListener('change',function(ev){ if(!ev.target||ev.target.id!=='meusdados'||!ev.target.files[0])return;
  var rd=new FileReader(); rd.onload=function(){ try{ usarMeusDados(JSON.parse(rd.result)); location.reload() }catch(e){ toast(e.message||'Não consegui ler o arquivo.') } }; rd.readAsText(ev.target.files[0]) });
window.addEventListener('hashchange',route);
route();
})();

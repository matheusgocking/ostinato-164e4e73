/* Lousa (pedido de Matheus, 19/11/2026): o Excalidraw embutido, sem sair do site.
   O Excalidraw é de código aberto (licença MIT) e existe como peça pronta para pôr dentro de outra página.
   Ele só é baixado na primeira vez que a lousa abre (três arquivos, do unpkg.com), então precisa de internet;
   o resto do site continua funcionando sem. Para não depender de fora, dá para copiar os três arquivos para o site.
   O desenho fica guardado no paciente (p.lousa) e volta na sessão seguinte. Imagens coladas não são guardadas.
   Testado em 19/11/2026 com react 18.2.0 e @excalidraw/excalidraw 0.17.6, em português. */
(function(){
  var R=window.Rastro, V='0.17.6', BASE='https://unpkg.com/@excalidraw/excalidraw@'+V+'/dist/';
  var pronto=null, raiz=null, T=null;
  function script(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=function(){no(new Error(u))};document.head.appendChild(s)})}
  function carrega(){ if(pronto)return pronto;
    window.EXCALIDRAW_ASSET_PATH=BASE;
    pronto=(window.React?Promise.resolve():script('https://unpkg.com/react@18.2.0/umd/react.production.min.js'))
      .then(function(){return window.ReactDOM?null:script('https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js')})
      .then(function(){return window.ExcalidrawLib?null:script(BASE+'excalidraw.production.min.js')});
    pronto.catch(function(){pronto=null}); return pronto }
  function escuro(){var t=document.documentElement.getAttribute('data-theme'); return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
  function fecha(){ clearTimeout(T); if(raiz){try{raiz.unmount()}catch(e){} raiz=null} }
  function abre(el,pid){ if(!el)return; fecha();
    el.innerHTML='<p class="ls-msg">Abrindo a lousa…</p>';
    carrega().then(function(){ if(!el.isConnected)return; var p=R.pac(pid), g=(p&&p.lousa)||{}; el.innerHTML='';
      raiz=window.ReactDOM.createRoot(el);
      raiz.render(window.React.createElement(window.ExcalidrawLib.Excalidraw,{
        langCode:'pt-BR', theme:escuro()?'dark':'light',
        initialData:{elements:g.elements||[],appState:{viewBackgroundColor:g.fundo||'#ffffff'},scrollToContent:true},
        UIOptions:{canvasActions:{loadScene:false,saveToActiveFile:false,toggleTheme:false,export:false}},
        onChange:function(els,st){ clearTimeout(T); T=setTimeout(function(){ var q=R.pac(pid); if(!q)return;
          q.lousa={elements:els.filter(function(e){return !e.isDeleted&&e.type!=='image'}),fundo:st.viewBackgroundColor}; R.guarda() },800) }
      }));
    }).catch(function(){ el.innerHTML='<p class="ls-msg">A lousa não abriu. Ela precisa de internet na primeira vez. <button class="link" data-act="ls-de-novo" data-pid="'+pid+'">Tentar de novo</button></p>' });
  }
  R.ACT['ls-de-novo']=function(b){abre(b.closest('.ss-lousa'),Number(b.dataset.pid))};
  window.RastroLousa={abre:abre,fecha:fecha};
})();

/* Same-origin authenticated D1 library. No credentials in persistent JS storage. */
;(function () {
  if (window.BikoAnimeCloud) return
  window.BikoAnimeCloud = { create: function (hooks) {
    var root=document.querySelector('.anime-page'), bar=document.getElementById('anime-cloud-bar'), status=bar.querySelector('[role="status"]'), loginForm=bar.querySelector('form'), loginInput=loginForm.querySelector('input');
    var input=document.getElementById('searchInput'), clear=document.getElementById('searchClearBtn'), results=document.getElementById('anime-discover-results'), scope='library', found=[], rows=[], connected=false, alive=true, loading=false, flushing=false, timer, searchTimer, searchController, searchEpoch=0, connectionEpoch=0, authenticating=false;
    var queueKey='biko-anime-sync:preview:v1', queue={}, conflicts={}, controllers=new Set(), lastSyncError='';
    try { queue=JSON.parse(localStorage.getItem(queueKey)||'{}') || {} } catch(_) {}
    function save() { localStorage.setItem(queueKey,JSON.stringify(queue)) }
    function message(text) { if(status.textContent!==text)status.textContent=text }
    function notice() {
      var n=Object.keys(queue).length;
      message(Object.keys(conflicts).length ? '其他设备有新修改，请处理下方冲突' : !connected ? '连接云端后可跨设备同步' : n ? (navigator.onLine===false?'离线 · ':'')+n+' 项修改等待同步'+(lastSyncError?' · '+lastSyncError:'') : '已同步 · 多设备共享');
      bar.querySelector('[data-cloud-connect]').hidden=connected;
      bar.querySelector('[data-cloud-retry]').hidden=!n;
      renderConflicts();
    }
    function listen(target,event,fn) { target.addEventListener(event,fn);listeners.push([target,event,fn]) }
    var listeners=[];
    async function request(path,options) {
      var controller=new AbortController();controllers.add(controller);
      var timeout=setTimeout(function(){controller.abort()},20000);
      var external=options?.signal, abort=function(){controller.abort()};
      if(external){if(external.aborted)controller.abort();else external.addEventListener('abort',abort,{once:true})}
      try {
        var response=await fetch('/api/anime/'+path,Object.assign({credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'}},options||{},{signal:controller.signal}));
        var data=await response.json();if(!response.ok){var error=new Error(data.error||'暂时无法同步');error.status=response.status;error.item=data.item;throw error}return data;
      } finally {clearTimeout(timeout);controllers.delete(controller);external?.removeEventListener('abort',abort)}
    }
    function publish() {
      if(!alive||!root.isConnected)return;
      hooks.onRows(rows.map(function(row){return Object.assign({},row,queue[row.id]?.patch||{}, {cloud_record:true})}));
    }
    function migrateLocal() {
      var local=hooks.localTracker();
      rows.forEach(function(row){
        var patch=local[row.id],changed=Number(patch?.updatedAt),remote=Date.parse(row.updated_at+'Z')||Date.parse(row.updated_at);
        // Only genuinely newer device edits migrate; later cloud records win.
        if(!patch||queue[row.id]||row.version>0||!changed||changed>Date.now()+300000||changed<=remote)return;
        var update={};if(patch.status!==undefined)update.status=patch.status==='completed'?'completed':'watching';
        if(patch.score!==undefined)update.rating=Number(patch.score);
        if(patch.epsWatched!==undefined)update.episodes_watched=Math.max(0,Math.min(Number(row.total_episodes)||0,Number(patch.epsWatched)||0));
        if(Object.keys(update).length)queue[row.id]={version:row.version,patch:update,operationId:crypto.randomUUID()};
      });save();
    }
    async function load() {
      if(loading||authenticating||!alive||!root.isConnected)return;loading=true;var epoch=connectionEpoch;
      try {
        var data=await request('library');if(!alive||epoch!==connectionEpoch)return;
        connected=true;
        var merged=new Map(rows.map(function(row){return [row.id,row]}));
        data.items.forEach(function(row){var old=merged.get(row.id);if(!old||row.version>=old.version)merged.set(row.id,row)});
        rows=Array.from(merged.values());migrateLocal();publish();notice();flush();
        if(scope==='discover'&&found.length)renderResults();
        return true;
      } catch(error){if(!alive||epoch!==connectionEpoch)return false;if(error.status===401){connected=false;notice()}else message(navigator.onLine===false?'离线 · 修改将保留，联网后续传':error.message+'，本机记录仍可查看');return false;}
      finally {if(epoch===connectionEpoch)loading=false}
    }
    async function login(password) {
      message('正在连接云端…');var epoch=++connectionEpoch;authenticating=true;loading=false;
      try {
        var seal=window.AnimeSeal.create(),meta=await seal.fetch(),encoder=new TextEncoder();
        var base=await crypto.subtle.importKey('raw',encoder.encode(String(password).trim()),'PBKDF2',false,['deriveBits']);
        var bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:seal.b64ToBytes(meta.salt),iterations:600000,hash:'SHA-256'},base,256);
        var hex=function(buffer){return Array.from(new Uint8Array(buffer),function(b){return b.toString(16).padStart(2,'0')}).join('')};
        var envelopeId=hex(await crypto.subtle.digest('SHA-256',encoder.encode(meta.ct)));
        if(!alive||epoch!==connectionEpoch)return false;
        await request('auth',{method:'POST',body:JSON.stringify({derivedKey:hex(bits),envelopeId:envelopeId})});
        if(!alive||epoch!==connectionEpoch)return false;loginInput.value='';loginForm.hidden=true;connected=true;authenticating=false;await load();if(scope==='discover'&&input.value.trim())search();return true
      }
      catch(error){message(error.message);return false}
      finally{if(epoch===connectionEpoch)authenticating=false}
    }
    function setQueue(id,patch,version,isCloudRecord) {
      if(!connected&&!rows.length&&!isCloudRecord){message('已保存到本机，连接云端后合并');return;}
      var old=queue[id];queue[id]={version:old?old.version:version,patch:Object.assign({},old?.patch||{},patch),operationId:crypto.randomUUID()};save();notice();flush();
    }
    async function flush() {
      if(flushing||!alive||!connected||navigator.onLine===false)return;flushing=true;
      try {
        for(var id of Object.keys(queue)){
          if(conflicts[id])continue;
          var sent=JSON.parse(JSON.stringify(queue[id]));
          try {
            var data=await request('library/'+id,{method:'PATCH',body:JSON.stringify(sent)});if(!alive)return;
            rows=rows.map(function(r){return String(r.id)===id&&data.item.version>=r.version?data.item:r});
            if(queue[id]?.operationId===sent.operationId)delete queue[id];
            else if(queue[id])queue[id].version=data.item.version;
            save();publish();
            lastSyncError='';
          } catch(error){
            if(error.status===409){conflicts[id]=error.item;continue;}
            if(error.status===401)connected=false;
            lastSyncError=error.message;message('已保留本机修改，稍后重试：'+error.message);break;
          }
        }
      }finally{flushing=false;if(alive){notice();if(connected&&!lastSyncError&&navigator.onLine!==false&&Object.keys(queue).some(function(id){return !conflicts[id]}))setTimeout(flush,0)}}
    }
    function renderConflicts() {
      var box=bar.querySelector('[data-cloud-conflicts]');box.textContent='';
      Object.keys(conflicts).forEach(function(id){
        var remote=conflicts[id],local=queue[id]?.patch||{},line=document.createElement('div'),text=document.createElement('p');
        text.textContent=remote.title+'：云端 '+(remote.status==='completed'?'已看完':'还在看')+' / 已看 '+remote.episodes_watched+' 集；本机待同步 '+(local.status?(local.status==='completed'?'已看完':'还在看')+' ':'')+(local.episodes_watched!==undefined?'已看 '+local.episodes_watched+' 集':'');line.appendChild(text);
        [['采用云端',false],['保留本机',true]].forEach(function(item){var button=document.createElement('button');button.type='button';button.textContent=item[0];button.onclick=function(){rows=rows.map(function(r){return String(r.id)===id?remote:r});if(item[1]&&queue[id]){queue[id].version=remote.version;queue[id].operationId=crypto.randomUUID()}else delete queue[id];delete conflicts[id];save();publish();notice();flush()};line.appendChild(button)});box.appendChild(line);
      });
    }
    function setScope(value) {
      hooks.beforeScopeChange?.();
      scope=value;root.classList.toggle('is-discovering',scope==='discover');results.hidden=scope!=='discover';
      root.querySelectorAll('[data-anime-scope]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.animeScope===scope))});
      input.placeholder=scope==='discover'?'搜索其他动漫，加入追番库':'搜索番剧、题材或制作方';
      if(scope==='discover')search();else input.dispatchEvent(new Event('input',{bubbles:true}));
    }
    function hint(text) {results.textContent='';var p=document.createElement('p');p.className='anime-discover-hint';p.setAttribute('role','status');p.textContent=text;results.appendChild(p)}
    async function search() {
      clearTimeout(searchTimer);searchController?.abort();var epoch=++searchEpoch,q=input.value.trim();
      if(!q){found=[];hint('输入动漫名称，找到后选择观看状态加入。');return;}
      if(!connected){hint('请先连接云端，再搜索和加入其他动漫。');return;}
      hint('正在搜索…');searchController=new AbortController();var thisSearch=searchController;controllers.add(thisSearch);
      try {
        var data=await request('search?q='+encodeURIComponent(q),{signal:thisSearch.signal});if(!alive||epoch!==searchEpoch||scope!=='discover')return;
        found=data.items;renderResults();
      }catch(error){if(alive&&epoch===searchEpoch&&error.name!=='AbortError'){hint('搜索未完成：'+error.message);var retry=document.createElement('button');retry.type='button';retry.textContent='重试搜索';retry.onclick=search;results.appendChild(retry)}}
      finally{controllers.delete(thisSearch)}
    }
    function renderResults() {
      results.textContent='';if(!found.length){hint('没有找到匹配动漫，换个名称试试。');return;}
      var note=document.createElement('p');note.className='anime-discover-hint';note.textContent='结果来自 Bangumi · 加入后同步到你的追番库';results.appendChild(note);
      found.forEach(function(subject){
        var card=document.createElement('article');card.className='anime-discover-card';
        if(subject.cover){var img=document.createElement('img');img.className='no-lightbox';img.src=subject.cover;img.alt=subject.title;img.loading='lazy';img.referrerPolicy='no-referrer';card.appendChild(img)}
        var body=document.createElement('div'),title=document.createElement('h2'),meta=document.createElement('p'),summary=document.createElement('p');
        title.textContent=subject.title;meta.textContent=(subject.year||'年份未提供')+' · '+(subject.totalEpisodes?'共 '+subject.totalEpisodes+' 集':'集数待确认');summary.textContent=subject.summary||'暂无简介';summary.className='anime-discover-summary';body.append(title,meta,summary);
        var existing=rows.find(function(row){return String(row.bangumi_id)===subject.subjectId});
        if(existing){var label=document.createElement('p');label.textContent='已在追番库 · '+(existing.status==='completed'?'已看完':'还在看');body.appendChild(label)}
        else {var label=document.createElement('label');label.textContent='加入状态 ';var select=document.createElement('select');select.setAttribute('aria-label',subject.title+'加入状态');[['watching','还在看'],['completed','已看完']].forEach(function(o){var option=document.createElement('option');option.value=o[0];option.textContent=o[1];select.appendChild(option)});label.appendChild(select);body.appendChild(label);
          var add=document.createElement('button');add.type='button';add.textContent='加入追番';add.setAttribute('aria-label','将'+subject.title+'加入追番');
          add.onclick=async function(){add.disabled=true;add.textContent='正在加入…';try{var data=await request('library',{method:'POST',body:JSON.stringify({subjectId:subject.subjectId,status:select.value})});if(!alive)return;await load();renderResults();message(data.existing?'这部动漫已在追番库，没有重复加入':'已加入并同步，可在「我的追番」查看')}catch(error){add.disabled=false;add.textContent='重试加入';message(error.message)}};body.appendChild(add);
        }
        card.appendChild(body);results.appendChild(card);
      });
    }
    listen(bar.querySelector('[data-cloud-connect]'),'click',function(){loginForm.hidden=!loginForm.hidden;if(!loginForm.hidden)loginInput.focus()});
    listen(loginForm,'submit',async function(event){event.preventDefault();var password=loginInput.value;var button=loginForm.querySelector('button');button.disabled=true;try{await login(password)}finally{button.disabled=false}});
    listen(bar.querySelector('[data-cloud-retry]'),'click',function(){flush();load()});
    root.querySelectorAll('[data-anime-scope]').forEach(function(button){listen(button,'click',function(){setScope(button.dataset.animeScope)})});
    function discoverInput(event){if(scope!=='discover')return;event.stopImmediatePropagation();clear.hidden=!input.value;clearTimeout(searchTimer);searchTimer=setTimeout(search,350)}
    input.addEventListener('input',discoverInput,true);
    function discoverClear(event){if(scope!=='discover')return;event.stopImmediatePropagation();input.value='';clear.hidden=true;search();input.focus()}
    clear.addEventListener('click',discoverClear,true);
    listen(window,'online',function(){flush();load()});
    listen(document,'visibilitychange',function(){if(!document.hidden)load()});
    function destroy(){alive=false;clearTimeout(searchTimer);clearInterval(timer);controllers.forEach(function(c){c.abort()});listeners.forEach(function(x){x[0].removeEventListener(x[1],x[2])});input.removeEventListener('input',discoverInput,true);clear.removeEventListener('click',discoverClear,true)}
    listen(document,'pjax:complete',function(){if(!root.isConnected)destroy()});
    timer=setInterval(function(){if(!document.hidden&&connected)load()},30000);
    notice();
    return {start:load,login:login,queue:setQueue,destroy:destroy};
  }};
})()

(function () {
  if (window.BikoFeedback) return;
  var timer, activeRestore;
  function show(message, options) {
    options = options || {};
    clearTimeout(timer);
    var box = document.getElementById('ui-feedback');
    if (!box) { box = document.createElement('div'); box.id = 'ui-feedback'; document.body.appendChild(box); }
    box.replaceChildren(); box.hidden = false;
    var kind = options.kind || (/失败|异常|错误|不可达/.test(message) ? 'error' : /正在|加载中|刷新中/.test(message) ? 'loading' : /已保存|已更新|已收|成功/.test(message) ? 'success' : 'info');
    box.className = 'ui-feedback ui-feedback--' + kind;
    box.onfocusin = box.onmouseenter = function () { clearTimeout(timer); };
    box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
    var text = document.createElement('span'); text.textContent = message; box.appendChild(text);
    if (options.retry) {
      var retry = document.createElement('button'); retry.type = 'button'; retry.textContent = '重试';
      function currentRetry() { return !box.hidden && retry.parentNode === box && box.isConnected; }
      function retryFailed() {
        if (!currentRetry()) return;
        retry.disabled = false; text.textContent = message + '（重试未完成）';
      }
      retry.onclick = function () {
        if (retry.disabled) return;
        retry.disabled = true;
        try {
          var task = options.retry();
          // Legacy callbacks replace their own notice; promise callbacks can also
          // finish without replacing it. Neither may update a later page's notice.
          if (task && typeof task.then === 'function') Promise.resolve(task).then(function () {
            if (currentRetry()) retry.disabled = false;
          }, retryFailed);
        } catch (_) { retryFailed(); }
      }; box.appendChild(retry);
    }
    var close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭提示');
    close.onclick = function () { box.hidden = true; clearTimeout(timer); }; box.appendChild(close);
    if (kind !== 'error' && kind !== 'loading') timer = setTimeout(function () { box.hidden = true; }, 4500);
  }
  function read(key) { try { return JSON.parse(sessionStorage.getItem('biko-view:v1:' + key) || 'null'); } catch (_) { return null; } }
  function save(key, value) { try { sessionStorage.setItem('biko-view:v1:' + key, JSON.stringify(value)); } catch (_) {} }
  var providers = {};
  function clearFeedback() { clearTimeout(timer); var box = document.getElementById('ui-feedback'); if (box) box.hidden = true; }
  function persist() {
    Object.keys(providers).forEach(function (key) {
      var p = providers[key];
      if (p.path !== location.pathname) return;
      // One detached page widget must not prevent other view states from saving.
      try { var value = p.snapshot(); if (value) save(key, value); } catch (_) {}
    });
  }
  function restoreScroll(y, root) {
    if (activeRestore) activeRestore();
    if (!Number.isFinite(y) || y <= 0 || !root) return;
    var stopped = false, observer, timeout;
    function stop() { stopped = true; if (observer) observer.disconnect(); clearTimeout(timeout); if (activeRestore === stop) activeRestore = null; ['wheel','touchstart','pointerdown','keydown'].forEach(function (event) { window.removeEventListener(event, stop, true); }); }
    function move() { if (stopped || !root.isConnected) return stop(); window.scrollTo(0, y); }
    activeRestore = stop;
    ['wheel','touchstart','pointerdown','keydown'].forEach(function (event) { window.addEventListener(event, stop, { capture: true, passive: true }); });
    requestAnimationFrame(move);
    if (window.ResizeObserver) { observer = new ResizeObserver(move); observer.observe(root); }
    timeout = setTimeout(stop, 2500);
  }
  window.BikoFeedback = { show: show };
  window.BikoView = { read: read, save: save, register: function (key, snapshot) { providers[key] = { path: location.pathname, snapshot: snapshot }; }, restoreScroll: restoreScroll };
  window.addEventListener('pagehide', function () { persist(); clearFeedback(); if (activeRestore) activeRestore(); });
  document.addEventListener('pjax:send', function () { persist(); clearFeedback(); if (activeRestore) activeRestore(); });
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (link && new URL(link.href, location.href).pathname !== location.pathname) persist();
  }, true);
})();

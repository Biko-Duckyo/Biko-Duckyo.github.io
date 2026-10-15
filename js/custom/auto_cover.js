// ======================================================
// 自动给没有封面的文章卡片配一张封面
// ------------------------------------------------------
// 策略（双通道，本地生成始终兜底）：
//   1) 本地生成（默认、永远可用）：按「标题 + 摘要」哈希生成确定性渐变 SVG。
//      - 零外部请求，离线可用，永不 404
//      - 同一篇文章始终得到同一配色，不会随机闪色
//   2) Unsplash（可选，需开关 + API Key）：按标题/分类关键词取一张真实照片。
//      - 未配置或请求失败（限流 / 无 Key / 离线）自动回退到本地生成
//      - Key 只放在 _config.butterfly.yml 的 cover_generator.unsplash。
//        ⚠️ 静态站点会把配置原样编译进 HTML/JS，Key 会公开可见，
//        仅建议使用 Unsplash 的「Demo/开发」用途 Key，勿用生产密钥。
// ======================================================
(function () {
  // ---- 运行时配置：构建期由 scripts/gen-cover-config.js 生成 ----
  // 默认值保证「配置未加载完成」时也能先铺本地渐变封面。
  var CFG = { unsplashEnable: false, unsplashKey: '', query: '' };
  var CACHE_PREFIX = 'biko-cover:';
  var CACHE_TTL = 24 * 60 * 60 * 1000; // Unsplash 结果缓存 24h

  // 配置只拉一次；失败则永久使用本地渐变（不重试、不报错）
  var cfgReady = null;
  function loadConfig() {
    if (cfgReady) return cfgReady;
    cfgReady = fetch('/js/custom/cover.config.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d === 'object') {
          CFG.unsplashEnable = !!d.unsplashEnable;
          CFG.unsplashKey = d.unsplashKey || '';
          CFG.query = d.query || '';
        }
      })
      .catch(function () { /* 无配置：仅用本地渐变 */ });
    return cfgReady;
  }

  // 一组与站点蓝灰主题协调的渐变配色
  var PALETTES = [
    ['#7e96b8', '#4c6b96'],
    ['#6a8fc7', '#3f5f8f'],
    ['#8aa2c8', '#556b96'],
    ['#7bb0c4', '#3f7d94'],
    ['#9aa7d1', '#5a6796'],
    ['#6fa9b8', '#3d7285'],
    ['#8f9ec4', '#4f5f8f'],
    ['#7a8fb5', '#465c85']
  ];

  // 稳定字符串哈希（FNV-1a）
  function hash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }

  // 生成渐变封面 data URI（内联 SVG，无网络请求）
  function makeCover(seed) {
    var h = hash(seed || 'biko');
    var p = PALETTES[h % PALETTES.length];
    var angle = h % 360;
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">' +
        '<defs><linearGradient id="g" gradientTransform="rotate(' + angle + ' .5 .5)">' +
          '<stop offset="0%" stop-color="' + p[0] + '"/>' +
          '<stop offset="100%" stop-color="' + p[1] + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="400" height="250" fill="url(#g)"/>' +
        '<circle cx="' + (60 + h % 280) + '" cy="' + (40 + (h >> 3) % 170) + '" r="' + (30 + (h >> 5) % 60) + '" fill="#ffffff" opacity="0.06"/>' +
        '<circle cx="' + (40 + (h >> 7) % 320) + '" cy="' + (60 + (h >> 9) % 150) + '" r="' + (20 + (h >> 11) % 50) + '" fill="#ffffff" opacity="0.05"/>' +
      '</svg>';
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  // ---- Unsplash 结果缓存（localStorage，带 TTL）----
  function readCache(key) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || (Date.now() - obj.t) > CACHE_TTL) return null;
      return obj.url;
    } catch (e) { return null; }
  }
  function writeCache(key, url) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), url: url }));
    } catch (e) { /* 隐私模式 / 配额满：忽略 */ }
  }

  function applyCover(item, cssUrl, isPhoto) {
    var cover = item.querySelector('.recent-post-cover');
    if (!cover) {
      cover = document.createElement('div');
      cover.className = 'recent-post-cover';
      item.insertBefore(cover, item.firstChild);
      var info = item.querySelector('.recent-post-info');
      if (info) { info.style.position = 'relative'; info.style.zIndex = '1'; }
    }
    cover.style.cssText =
      'position:absolute;inset:0;z-index:0;pointer-events:none;' +
      'background-image:' + cssUrl + ';' +
      'background-size:cover;background-position:center;' +
      'opacity:' + (isPhoto ? '.9' : '.14') + ';';
  }

  // 取文章卡片上的标题与摘要，拼成稳定的 seed 和搜索关键词
  function readMeta(item) {
    var titleEl = item.querySelector('.article-title') || item.querySelector('.recent-post-info a');
    var title = (titleEl && titleEl.textContent.trim()) || '';
    var catEl = item.querySelector('.article-meta__categories');
    var cat = (catEl && catEl.textContent.trim()) || '';
    var descEl = item.querySelector('.recent-post-info .content');
    var desc = (descEl && descEl.textContent.trim().slice(0, 80)) || '';
    return { title: title, cat: cat, desc: desc };
  }

  function queryFor(meta) {
    if (CFG.query) return CFG.query;
    return meta.cat || meta.title || 'nature';
  }

  function decorate(item) {
    if (item.dataset.bikoCover === '1') return;
    item.dataset.bikoCover = '1';
    item.style.position = 'relative';
    item.style.overflow = 'hidden';

    var meta = readMeta(item);
    var seed = meta.title + '|' + meta.desc;

    // 1) 先立即铺上本地渐变，保证任何情况下都有封面、不闪空白
    applyCover(item, makeCover(seed), false);

    // 2) 配置加载完成后再决定是否用 Unsplash 真实照片增强；失败保留渐变
    loadConfig().then(function () {
      if (!CFG.unsplashEnable || !CFG.unsplashKey) return;
      if (!item.isConnected) return; // pjax 已换页，节点被移除则放弃
      var q = queryFor(meta);
      var cached = readCache(q);
      if (cached) { applyCover(item, 'url("' + cached + '")', true); return; }

      return fetch('https://api.unsplash.com/photos/random?orientation=landscape&query=' +
            encodeURIComponent(q), { headers: { Authorization: 'Client-ID ' + CFG.unsplashKey } })
        .then(function (r) { if (!r.ok) throw new Error('unsplash ' + r.status); return r.json(); })
        .then(function (data) {
          var u = data && data.urls && (data.urls.small || data.urls.regular);
          if (!u) throw new Error('no url');
          writeCache(q, u);
          if (item.isConnected) applyCover(item, 'url("' + u + '")', true);
        })
        .catch(function () { /* 静默回退到已铺好的本地渐变 */ });
    });
  }

  function addCovers() {
    var items = document.querySelectorAll('#recent-posts .recent-post-item');
    if (!items.length) return;
    items.forEach(function (item) {
      // 已有真实封面（主题自带的 img）就不处理
      if (item.querySelector('img.post-bg')) return;
      decorate(item);
    });
  }

  if (document.readyState !== 'loading') addCovers();
  else document.addEventListener('DOMContentLoaded', addCovers);
  document.addEventListener('pjax:complete', function () { setTimeout(addCovers, 300); });
})();


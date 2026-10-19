// ======================================================
// 自动给没有封面的文章卡片配一张封面
// ------------------------------------------------------
// 策略（双通道，本地生成始终兜底）：
//   1) 本地生成（默认、永远可用）：按「标题 + 摘要」哈希生成确定性渐变 SVG。
//      - 零外部请求，离线可用，永不 404
//      - 同一篇文章始终得到同一配色，不会随机闪色
//   2) Unsplash（可选，需开关）：按关键词取一张真实照片，替换掉主题自带封面
//      与本地渐变（开启后全站统一用 Unsplash 图）。
//      - 未配置或请求失败（限流 / 无 Key / 离线）自动回退到本地渐变 / 原封面
//      - 关键：本文件不含任何密钥。请求打到本站同源代理
//        /api/cover/random?query=xxx（functions/api/cover/[[action]].js），
//        Unsplash Key 只存在于 Cloudflare Pages 环境变量 UNSPLASH_KEY。
//        开源仓库 + 静态产物都拿不到 Key，也就无法被蹭配额。
//      - 开关与关键词来自 /js/custom/cover.config.json（构建期生成，
//        scripts/gen-cover-config.js），该文件同样是公开的，故只放
//        unsplashEnable / query 两个非敏感字段。
//      - 代理不可用（未配 Key / 跨站 / 上游 4xx）时静默回退，见下方 catch。
// ======================================================
(function () {
  // ---- 运行时配置：构建期由 scripts/gen-cover-config.js 生成 ----
  // 默认值保证「配置未加载完成」时也能先铺本地渐变封面。
  var CFG = { unsplashEnable: false, query: '' };
  var CACHE_PREFIX = 'biko-cover:';
  var CACHE_TTL = 24 * 60 * 60 * 1000; // Unsplash 结果缓存 24h
  var PROXY = '/api/cover/random'; // 同源代理（Key 在服务端）

  // 配置只拉一次；失败则永久使用本地渐变（不重试、不报错）
  var cfgReady = null;
  function loadConfig() {
    if (cfgReady) return cfgReady;
    cfgReady = fetch('/js/custom/cover.config.json', { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d === 'object') {
          CFG.unsplashEnable = !!d.unsplashEnable;
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

  // 把封面图铺到卡片上。
  //   - 卡片没有 .recent-post-cover 时创建一个绝对定位的覆盖层（用于无封面卡片）
  //   - 卡片已有主题自带封面时，直接改写它的 background-image / 图片 src
  // 用 backgroundImage 单属性而非 background 简写：简写会把 opacity 一起重置，
  // 导致本地渐变层的 .14 透明度被冲掉、整张卡片被实色盖住。
  function applyCover(item, cssUrl, isPhoto) {
    // 1) 主题自带的真实封面图：直接改写图片 src
    //    本地渐变（isPhoto=false）也要写入，否则默认封面会一直盖住渐变层，
    //    导致全站文章共用 default_cover 里的同一张图。
    var bgImg = item.querySelector('img.post-bg');
    if (bgImg) {
      var dataUri = cssUrl.replace(/^url\((["']?)/, '').replace(/(["']?)\)$/, '');
      bgImg.removeAttribute('srcset');
      bgImg.removeAttribute('data-lazy-src');
      bgImg.style.objectPosition = 'center';
      bgImg.src = dataUri;
      if (isPhoto) {
        bgImg.style.filter = 'none';
        bgImg.style.opacity = '1';
      }
      return;
    }

    // 2) 无封面卡片：创建 / 复用一个覆盖层
    var cover = item.querySelector('.recent-post-cover');
    if (!cover) {
      cover = document.createElement('div');
      cover.className = 'recent-post-cover';
      item.insertBefore(cover, item.firstChild);
      var info = item.querySelector('.recent-post-info');
      if (info) { info.style.position = 'relative'; info.style.zIndex = '1'; }
    }
    cover.style.position = 'absolute';
    cover.style.inset = '0';
    cover.style.zIndex = '0';
    cover.style.pointerEvents = 'none';
    cover.style.backgroundSize = 'cover';
    cover.style.backgroundPosition = 'center';
    cover.style.backgroundRepeat = 'no-repeat';
    cover.style.backgroundImage = cssUrl;
    cover.style.opacity = isPhoto ? '.9' : '.14';
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

  // 搜索关键词：CFG.query 有值就用它（推荐填英文，中文在 Unsplash 命中很差），
  // 否则退回「文章分类 → 标题 → nature」。
  function queryFor(meta) {
    if (CFG.query) return CFG.query;
    return meta.cat || meta.title || 'nature';
  }

  // 同一个关键词的请求只发一次，其余卡片复用同一个 Promise。
  // 固定 query 时全站共用一个关键词，去重后 12 张卡片只消耗 1 次 API 配额。
  var inflight = {};

  function fetchPhoto(q) {
    if (inflight[q]) return inflight[q];
    // 同源代理，不带任何鉴权头（Key 在服务端函数里注入）。
    // 代理只回 { ok, data: { url } }，第三方 JSON 结构不进入前端。
    inflight[q] = fetch(PROXY + '?query=' + encodeURIComponent(q))
      .then(function (r) {
        if (!r.ok) throw new Error('cover proxy ' + r.status);
        return r.json();
      })
      .then(function (res) {
        var u = res && res.ok && res.data && res.data.url;
        if (!u) throw new Error('no url');
        writeCache(q, u);
        return u;
      })
      .catch(function (e) { delete inflight[q]; throw e; });
    return inflight[q];
  }

  // 记录每张卡片主题自带的原始封面，供请求失败时回滚
  var ORIG_SRC = 'data-biko-orig-src';
  var ORIG_CSS = 'data-biko-orig-css';

  function snapshotOwnCover(item) {
    var bgImg = item.querySelector('img.post-bg');
    if (bgImg && !bgImg.getAttribute(ORIG_SRC)) {
      bgImg.setAttribute(ORIG_SRC, bgImg.getAttribute('src') || '');
      if (bgImg.getAttribute('srcset')) {
        bgImg.setAttribute(ORIG_CSS, bgImg.getAttribute('srcset'));
      }
    }
  }

  function restoreOwnCover(item) {
    var bgImg = item.querySelector('img.post-bg');
    if (!bgImg) return;
    var orig = bgImg.getAttribute(ORIG_SRC);
    if (orig === null) return;
    bgImg.src = orig;
    var origSet = bgImg.getAttribute(ORIG_CSS);
    if (origSet) bgImg.setAttribute('srcset', origSet);
    bgImg.style.filter = '';
    bgImg.style.opacity = '';
  }

  function decorate(item) {
    if (item.dataset.bikoCover === '1') return;
    item.dataset.bikoCover = '1';
    item.style.position = 'relative';
    item.style.overflow = 'hidden';

    var meta = readMeta(item);
    var seed = meta.title + '|' + meta.desc;
    var hadOwnCover = !!item.querySelector('img.post-bg');
    if (hadOwnCover) snapshotOwnCover(item);

    // 1) 先立即铺上本地渐变，保证任何情况下都有封面、不闪空白
    applyCover(item, makeCover(seed), false);

    // 2) 配置加载完成后再决定是否用 Unsplash 真实照片增强；失败保留渐变/原封面
    loadConfig().then(function () {
      if (!CFG.unsplashEnable) return;
      if (!item.isConnected) return; // pjax 已换页，节点被移除则放弃
      var q = queryFor(meta);
      var cached = readCache(q);
      if (cached) {
        if (item.isConnected) applyCover(item, 'url("' + cached + '")', true);
        return;
      }

      return fetchPhoto(q)
        .then(function (u) {
          if (item.isConnected) applyCover(item, 'url("' + u + '")', true);
        })
        .catch(function () {
          // 静默回退：无封面卡片保留已铺好的本地渐变；
          // 自带封面的卡片恢复主题原图。
          if (hadOwnCover && item.isConnected) restoreOwnCover(item);
        });
    });
  }

  function addCovers() {
    var items = document.querySelectorAll('#recent-posts .recent-post-item');
    if (!items.length) return;
    items.forEach(function (item) {
      // 无论是否开启 Unsplash，都先铺本地确定性渐变（按标题哈希，每篇不同）；
      // 开启照片源时 decorate 内部再用照片做增强。这样关闭 Unsplash 时
      // 默认封面也会被渐变替换，不再全站共用同一张图。
      decorate(item);
    });
  }

  // 配置可能比首屏渲染晚到；开启 Unsplash 时补跑一次，覆盖被跳过的自带封面卡片。
  function addCoversWhenReady() {
    loadConfig().then(function () {
      if (!CFG.unsplashEnable) return;
      addCovers();
    });
  }

  function boot() {
    addCovers();
    addCoversWhenReady();
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('pjax:complete', function () { setTimeout(boot, 300); });
})();


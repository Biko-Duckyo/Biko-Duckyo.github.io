/* Load after anime_seal.js, including ordered Pjax script execution. */
;(function () {
const pageGate = document.getElementById("animeGate");
if (!pageGate || pageGate.__animeInitialized) return;
pageGate.__animeInitialized = true;

// ========== 追番门禁：口令经 PBKDF2-SHA256(60万) + AES-GCM-256 解密密文清单（对齐相册方案） ==========
// 前端不存口令：口令由用户输入，派生密钥后解 /anime/data/anime.enc.html 信封；
// 解锁记忆为 sessionStorage 缓存密钥与解密清单 12h，关闭标签页即清空。
const gateEl = document.getElementById('animeGate');
const gateForm = document.getElementById('animeGateForm');
const gateInput = document.getElementById('animeGatePass');
const gateErr = document.getElementById('animeGateErr');
const gateBox = document.getElementById('animeGateBox');
let animeSeal = null;
try { animeSeal = window.AnimeSeal ? window.AnimeSeal.create() : null; } catch (e) { animeSeal = null; }
let unlocked = false;

// 解密成功统一入口：信封对象 {data:[...]} 与裸数组都兼容
function unlockWithData(d, offline, at) {
  if (!gateEl.isConnected) return;
  const arr = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : []);
  unlocked = true;
  window.BikoAccessGate?.ready('unlocked');
  if (gateErr) gateErr.textContent = '';
  if (gateEl) {
    gateEl.classList.add('is-leaving');
    setTimeout(function () { if (gateEl) gateEl.hidden = true; }, 360);
  }
  applyRawData(arr, offline, at);
  if (cloud) cloud.start();
}

function showGate() { if (!gateEl.isConnected || unlocked) return; if (gateEl) gateEl.hidden = false; window.BikoAccessGate?.ready('locked'); }

function gateFail() {
  try { animeSeal && animeSeal.remember(animeSeal.KEY_STORE, null); } catch (e) {}
  if (gateErr) gateErr.textContent = '口令不正确，或密文不可达，请重新输入';
  if (gateBox) {
    gateBox.classList.remove('is-shaking');
    void gateBox.offsetWidth; // 强制回流，保证第二次输错也能重放抖动
    gateBox.classList.add('is-shaking');
  }
  if (gateInput) gateInput.select();
}

async function animeGateSubmit(e) {
  e.preventDefault();
  const pass = (gateInput && gateInput.value || '').trim();
  if (!pass || !animeSeal) return false;
  try {
    const data = await animeSeal.open(pass);
    unlockWithData(data, false);
    if (gateInput) gateInput.value = '';
    if (cloud) await cloud.login(pass);
  } catch (err) {
    console.warn('追番清单解密失败：', err);
    gateFail();
  }
  return false;
}

// 启动解锁：① 12h 明文缓存直接展开；② 缓存密钥重解信封；③ 停门等输入
async function bootUnlock() {
  if (!animeSeal) { showGate(); return; }
  const cached = animeSeal.getData();
  if (cached) { unlockWithData(cached, true, Date.now()); return; }
  if (cloud && await cloud.start()) return;

  const hex = animeSeal.recall(animeSeal.KEY_STORE);
  if (hex) {
    const keyBytes = animeSeal.hexToBytes(hex);
    if (keyBytes) {
      try {
        const meta = await animeSeal.fetch();
        const data = await animeSeal.decryptWith(keyBytes, meta);
        animeSeal.putData(data);
        unlockWithData(data, false);
        return;
      } catch (err) {
        console.warn('缓存密钥重解失败，回到口令门：', err);
        try { animeSeal.remember(animeSeal.KEY_STORE, null); } catch (e) {}
      }
    }
  }
  showGate();
}

if (gateForm) gateForm.addEventListener('submit', animeGateSubmit);

// ========== 数据与全局状态 ==========
// 清单来源：密文信封 /anime/data/anime.enc.html（tools/anime/lock.mjs 构建期加密生成），
// 由 animeSeal 用口令派生密钥解密；前端不再调用明文 Worker 备用链。
// 状态 / 评分 / 进度仍写本机 localStorage + 导出 JSON 备份（本机私有、不加密、不外发）。
const LS_KEY_TRACKER = 'anime-tracker:v1';
let animeData = [];
let cinema = null;
let filtersInitialized = false;

// 筛选 / 排序状态
let currentStatus = 'watching';
let currentGenre = 'all';
let searchQuery = '';
let sortKey = 'default';
let currentDecade = 'all';

// 视图 / 密度 / AI 偏好（仅本机浏览器 localStorage，不进远端数据、不随导出外发密钥）
const LS_KEY_VIEW = 'anime-view:v1';
const LS_KEY_AI = 'anime-ai:v1';
const LS_KEY_DENSITY = 'anime-density:v1';
let currentView = localStorage.getItem(LS_KEY_VIEW) || 'grid';
let densityCompact = localStorage.getItem(LS_KEY_DENSITY) === '1';

// 未完成条目统一归入还在看，兼容原清单及旧本机备份的四态。
function normalizeStatus(s) {
  return s === 'completed' ? 'completed' : 'watching';
}
const STATUS_LABEL = { watching: '还在看', completed: '已看完' };

// 题材筛选大类（方案 A：把零散小标签归并为 5 类，只作用于筛选层；
// 详情弹窗与卡片仍展示原始小标签，元数据不丢失。「童年回忆」属情感向，不进筛选大类。）
const GENRE_CATEGORIES = [
  { key: 'adventure', label: '热血冒险', members: ['热血', '冒险', '格斗', '长篇连载', '竞技', '武侠', '励志', '成长'] },
  { key: 'scifi', label: '奇幻科幻', members: ['奇幻', '魔法少女', '科幻', '特摄', '机器人', '神话'] },
  { key: 'iyashikei', label: '日常治愈', members: ['治愈', '日常', '搞笑', '喜剧', '亲子', '美食', '收集养成'] },
  { key: 'romance', label: '校园恋爱', members: ['校园', '恋爱'] },
  { key: 'classic_cn', label: '国风经典', members: ['国风', '寓言', '经典美术片', '动画短片'] }
];
function genresOf(a) { return Array.isArray(a.genres) ? a.genres.map(String) : []; }
function matchCategory(a, key) {
  const cat = GENRE_CATEGORIES.find(c => c.key === key);
  if (!cat) return false;
  const gs = genresOf(a);
  return cat.members.some(m => gs.includes(m));
}

// bgm 图床三域名等价候选：前端按顺序直连尝试，全部失败则由 coverFallback 生成本地首字占位，
// 不再经过 Worker 图片代理（境外节点不可达时不再产生裂图/长等待）。
const COVER_HOSTS = ['lain.bgm.tv', 'pic.bgm.tv', 'img.bgm.tv'];
function coverCandidates(url) {
  if (!url) return [];
  if (url.indexOf('data:') === 0) return [url];
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('bgm.tv')) {
      return COVER_HOSTS.map(h => `https://${h}${u.pathname}${u.search}`);
    }
    return [url];
  } catch { return [url]; }
}
// 兼容旧调用：不再包裹 Worker 代理，原样返回直链
function proxyCover(url) { return url || ''; }

// 读取本地追踪覆盖（状态 / 评分 / 进度；服务端同步在 M2 接入 token 后补写）
function readLocalTracker() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_TRACKER) || '{}'); }
  catch { return {}; }
}
function writeLocalPatch(id, patch) {
  const t = readLocalTracker();
  t[id] = Object.assign({}, t[id] || {}, patch, { updatedAt: Date.now() });
  localStorage.setItem(LS_KEY_TRACKER, JSON.stringify(t));
  const row = animeData.find(a => String(a.id) === String(id));
  if (cloud && row) {
    const update = {};
    if (patch.status !== undefined) update.status = normalizeStatus(patch.status);
    if (patch.score !== undefined) update.rating = Number(patch.score);
    if (patch.epsWatched !== undefined) update.episodes_watched = Number(patch.epsWatched);
    if (Object.keys(update).length) cloud.queue(id, update, row.cloudVersion || 0, row.cloudRecord);
  }
}

// 解密后的清单缓存由 animeSeal 的 DATA_STORE（sessionStorage，12h）统一管理；
// 本机只持久化状态/评分/进度（LS_KEY_TRACKER、LS_KEY_PROGRESS），不缓存整份明文清单。

// 把服务端原始列表映射为前端数据并渲染（联网成功 / 离线缓存共用同一套渲染链）
function applyRawData(raw, offline, at) {
  const local = readLocalTracker();
  animeData = (raw || []).map(a => {
    const stored = local[a.id] || {};
    const patch = a.cloud_record ? { genres: stored.genres, year: stored.year, studio: stored.studio, summary: stored.summary, aiEnriched: stored.aiEnriched } : stored;
    let genres = [];
    if (Array.isArray(a.genres)) genres = a.genres.map(String);
    else if (typeof a.genres === 'string') { try { genres = JSON.parse(a.genres); } catch { genres = a.genres.split(',').filter(Boolean); } }
    else if (a.tags) genres = a.tags.split(',').map(s => s.trim()).filter(Boolean);
    if (Array.isArray(patch.genres) && patch.genres.length) genres = patch.genres.map(String);
    return {
      id: a.id,
      cloudVersion: a.version || 0,
      cloudRecord: !!a.cloud_record,
      bangumiId: verifiedBangumiId(a.title, patch.year || a.year, a.bangumi_id),
      bilibili_id: a.bilibili_id || '',
      name: a.original_title || a.title,
      name_cn: a.title,
      coverList: [resolvedCover(a.title, patch.year || a.year), ...coverCandidates(a.cover || '')].filter(Boolean),
      images: { large: resolvedCover(a.title, patch.year || a.year) || coverCandidates(a.cover || '')[0] || '' },
      score: patch.score != null ? patch.score : (a.rating || 0),
      eps: a.total_episodes || 0,
      epsWatched: patch.epsWatched != null ? patch.epsWatched : (a.episodes_watched || 0),
      genres,
      year: patch.year != null ? patch.year : (a.year || ''),
      season: a.season || '',
      studio: patch.studio || a.studio || '',
      summary: patch.summary || a.summary || '',
      official_url: a.official_url || '',
      pv_url: a.pv_url || '',
      aiEnriched: !!patch.aiEnriched,
      status: normalizeStatus(patch.status || a.status),
      updatedAt: patch.updatedAt || a.updated_at || '',
    };
  });

  // 先应用 URL 里的筛选参数，再渲染
  if (!filtersInitialized) { applyQueryFromUrl(); filtersInitialized = true; }
  renderGenreChips();
  renderDecadeOptions();
  renderGrid();
  updateStatusCounts();
  refreshDensityBtn();
  toggleOfflineBanner(offline, at);
}

// 离线提示条（动态插在网格之前；联网成功后移除）
function toggleOfflineBanner(on, at) {
  let banner = document.getElementById('animeOfflineBanner');
  if (!on || navigator.onLine !== false) { if (banner) banner.remove(); return; }
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'animeOfflineBanner';
    document.getElementById('animeGrid').insertAdjacentElement('beforebegin', banner);
  }
  const t = at ? new Date(at).toLocaleString('zh-CN', { hour12: false }) : '';
  banner.className = 'anime-offline-banner';
  banner.innerHTML =
    `<span>📡 当前展示最近一次解锁后的本机缓存清单${t ? '（生成于 ' + escHtml(t) + '）' : ''}，联网恢复后更新</span>` +
    `<button type="button" class="anime-filter-btn" onclick="retryUnlock()">重新解锁</button>`;
}

// 无任何缓存时的失败态：保持页面骨架 + 可点重试
function showLoadError() {
  toggleOfflineBanner(false);
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = `<div class="anime-empty anime-empty--error">
      <div style="font-size:2rem;margin-bottom:8px;">🔐</div>
      <div>密文清单不可达且本机暂无缓存。请确认网络后重试；首次查看需在口令门输入口令解锁。</div>
      <button class="anime-filter-btn" style="margin-top:14px;" onclick="retryUnlock()">重新解锁</button>
    </div>`;
  updateStatusCounts();
}

// 重新尝试解锁：优先 12h 解密缓存，否则走 bootUnlock（缓存密钥重解 / 停门等输入）。
// 供「重试」按钮与导入本机状态后刷新视图调用。
async function retryUnlock() {
  if (!animeSeal) { showGate(); return; }
  const cached = animeSeal.getData();
  if (cached) { unlockWithData(cached, true, Date.now()); return; }
  showSkeleton(12);
  await bootUnlock();
}

// 简单 HTML 转义，防止标题/简介破坏模板
function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 封面多候选直连回退：按 coverList 顺序换源；全部失败再交给 coverFallback 生成本地首字占位
function coverListOf(id) {
  const a = animeData.find(x => String(x.id) === String(id));
  return (a && Array.isArray(a.coverList)) ? a.coverList : [];
}
function resolvedCover(title, year) {
  // Only verified local artwork; no runtime metadata queries or clear-text catalog.
  const covers = {"19136091":"bgm-9565.jpg","64385023":"bgm-37418.jpg","bb78bd98":"bgm-1940.jpg","43dbb882":"bgm-11304.jpg","2dca7840":"bgm-3128.jpg","500ea409":"bgm-7777.jpg","d6e7e374":"bgm-24823.jpg","f002ce8c":"bgm-1972.jpg","2b032244":"bgm-5870.jpg","6cb04be0":"bgm-1934.jpg","eb24bb6f":"bgm-33820.jpg","808c6daa":"bgm-29399.jpg","bd903675":"one-piece.jpg","9f39f292":"pokemon.jpg"};
  let hash = 2166136261;
  for (const ch of String(title || '') + '|' + String(year || '')) {
    hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0;
  }
  const file = covers[hash.toString(16)];
  return file ? '/img/anime/' + file : '';
}
function verifiedBangumiId(title, year, fallback) {
  const local = resolvedCover(title, year);
  const id = local.match(/bgm-(\d+)\.jpg$/)?.[1];
  if (id) return id;
  if (local.endsWith('/pokemon.jpg')) return '3019';
  if (local.endsWith('/one-piece.jpg')) return '975';
  return /^\d+$/.test(String(fallback || '')) ? String(fallback) : '';
}
// 封面加载超时兜底：bgm 等境外图床在部分网络下会一直 pending（不触发 onerror），
// 20s 内未成功加载就主动推进下一候选；候选耗尽再转哈希占位，杜绝长期裂图。
const COVER_TIMEOUT_MS = 20000;
function armCover(img) {
  if (!img) return;
  if (img.dataset.timer) { clearTimeout(Number(img.dataset.timer)); img.dataset.timer = ''; }
  img.addEventListener('load', function onOk() {
    if (img.dataset.timer) { clearTimeout(Number(img.dataset.timer)); img.dataset.timer = ''; }
    img.removeEventListener('load', onOk);
  }, { once: true });
  img.dataset.timer = String(setTimeout(function () {
    if (!img.isConnected) return;
    if (img.naturalWidth > 0 || img.dataset.fbk === '1') return;
    coverNextImg(img);
  }, COVER_TIMEOUT_MS));
}

function coverNextImg(img) {
  if (img.dataset.fbk === '1') return;
  const list = coverListOf(img.dataset.cid);
  let idx = Number(img.dataset.idx || '0') + 1;
  while (idx < list.length) {
    const next = list[idx];
    if (next) { img.dataset.idx = String(idx); img.src = next; armCover(img); return; }
    idx++;
  }
  img.dataset.fbk = '1';
  coverFallback(img, img.alt || '番剧');
}

// 本地首字占位封面（纯 data URI，零网络请求；按标题哈希取色相生成渐变，避免全部灰底单调）
function placeholderCoverDataUri(name) {
  const title = (name || '?').trim() || '?';
  const ch = title.charAt(0);
  let h = 0;
  for (let i = 0; i < title.length; i++) { h = (h * 31 + title.charCodeAt(i)) >>> 0; }
  const hue = h % 360;
  const c1 = 'hsl(' + hue + ',42%,30%)';
  const c2 = 'hsl(' + ((hue + 30) % 360) + ',46%,17%)';
  const fg = 'hsl(' + hue + ',62%,86%)';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="252" cy="76" r="118" fill="rgba(255,255,255,0.06)"/>
    <text x="50%" y="46%" fill="${fg}" font-size="76" font-weight="700" text-anchor="middle" dy=".3em">${escHtml(ch)}</text>
    <text x="50%" y="63%" fill="rgba(255,255,255,0.55)" font-size="13" text-anchor="middle">封面暂缺</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// 封面加载失败占位（深色底 + 首字 + 提示）
function coverFallback(img, name) {
  if (img.dataset.fallbacked) return;
  img.dataset.fallbacked = '1';
  img.src = placeholderCoverDataUri(name || img.alt || '番剧');
}

// 骨架屏
function showSkeleton(n) {
  const grid = document.getElementById('animeGrid');
  let html = '';
  for (let i = 0; i < n; i++) {
    html += `<div class="anime-skeleton"><div class="sk-cover"></div><div class="sk-line"></div><div class="sk-line short"></div></div>`;
  }
  grid.innerHTML = html;
}

function decadeOfYear(a) {
  const y = Number(a && a.year);
  if (!y || y < 1900) return 'unknown';
  return Math.floor(y / 10) * 10 + 's';
}
function getFilteredSorted() {
  let list = animeData.filter(a => {
    if (a.status !== currentStatus) return false;
    if (currentGenre !== 'all' && !matchCategory(a, currentGenre)) return false;
    if (currentDecade !== 'all' && decadeOfYear(a) !== currentDecade) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = [
        a.name_cn, a.name,
        (a.genres || []).join(' '),
        a.studio, a.summary
      ].map(s => String(s || '').toLowerCase()).join(' ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const yearNum = a => Number(a.year) || 0;
  list = list.slice().sort((x, y) => {
    switch (sortKey) {
      case 'score': return scoreNum(y) - scoreNum(x);
      case 'year': return yearNum(y) - yearNum(x);
      case 'eps': return (y.eps || 0) - (x.eps || 0);
      case 'updated': return String(y.updatedAt || '').localeCompare(String(x.updatedAt || ''));
      default: return 0;
    }
  });
  return list;
}

function renderGrid() {
  cinema?.update();
  document.querySelectorAll('#statusTabs [data-status]').forEach(button => {
    const active = button.dataset.status === currentStatus;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  applyViewState();
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '';
  const list = getFilteredSorted();

  if (animeData.length === 0) {
    if (currentView === 'timeline') renderTimeline();
    grid.innerHTML = `<div class="anime-empty">📭 还没有收藏番剧，可稍后补充第一部。</div>`;
    return;
  }
  if (list.length === 0) {
    if (currentView === 'timeline') renderTimeline();
    grid.innerHTML = `<div class="anime-empty">
      <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
      <div>没有匹配当前筛选条件的番剧</div>
      <button class="anime-filter-btn" style="margin-top:14px;" onclick="resetFilters()">清除筛选条件</button>
    </div>`;
    return;
  }

  list.forEach(a => {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', (a.name_cn || a.name) + '，查看详情与播放入口');
    let cover = a.images?.large || '';
    if (!cover) cover = placeholderCoverDataUri(a.name_cn || a.name);
    const score = scoreNum(a);
    const progressTotal = a.eps || 0;
    const progressWatched = a.epsWatched || 0;
    const pct = progressTotal > 0 ? Math.min(100, Math.round(progressWatched / progressTotal * 100)) : 0;
    const subParts = [];
    if (a.year) subParts.push(escHtml(a.year));
    if (a.genres?.length) subParts.push(escHtml(a.genres.slice(0, 2).join(' / ')));
    const subLine = subParts.join(' · ');
    const progressLabel = a.status === 'completed' ? '已看完' : progressWatched > 0 ? '看到第 ' + progressWatched + ' 集' : '尚未开始';

    card.innerHTML = `
      <div class="anime-cover-wrap">
        <img class="anime-card-cover no-lightbox" src="${escHtml(cover)}" data-cid="${a.id}" data-idx="0" alt="${escHtml(a.name_cn || a.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"
             onerror="coverNextImg(this)"
             onload="if(this.naturalWidth>0 && this.naturalWidth<=2)coverNextImg(this)">
        <div class="anime-cover-overlay"></div>
        ${score > 0 ? `<span class="anime-score-badge">⭐${scoreNum(a).toFixed(1)}</span>` : ''}
        ${a.aiEnriched ? `<span class="anime-ai-badge" title="AI 已补全元数据">✨</span>` : ''}
        <span class="anime-card-play" aria-hidden="true">▶ 查看 / 播放</span>
        <div class="anime-cover-footer">${progressLabel}${progressTotal > 0 ? ' · 共 ' + progressTotal + ' 集' : ''}</div>
      </div>
      <div class="anime-card-info">
        <div class="anime-card-title">${escHtml(a.name_cn || a.name)}</div>
        ${subLine ? `<div class="anime-card-sub">${subLine}</div>` : ''}
        ${progressWatched > 0 && a.status === 'watching' ? `<div class="anime-progress" aria-label="已看 ${pct}%"><div class="anime-progress-bar" style="width:${pct}%"></div></div>` : ''}
      </div>`;
    card.onclick = () => showDetail(a);
    card.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDetail(a); }
    };
    grid.appendChild(card);
    armCover(card.querySelector('.anime-card-cover'));
  });
  if (currentView === 'timeline') renderTimeline();
}

// ===== 视图切换：网格 / 2D 年代时间线（纯前端，无 WebGL 依赖） =====
function applyViewState() {
  const grid = document.getElementById('animeGrid');
  const tl = document.getElementById('animeTimeline');
  const isGrid = currentView !== 'timeline';
  if (grid) {
    grid.hidden = !isGrid;
    grid.style.display = isGrid ? '' : 'none';
    grid.classList.toggle('density-compact', densityCompact);
  }
  if (tl) { tl.hidden = isGrid; tl.style.display = isGrid ? 'none' : ''; }
  document.querySelectorAll('#viewSwitch .anime-view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === currentView));
  document.body.classList.toggle('anime-view-timeline', !isGrid);
}
function switchView(v) {
  currentView = (v === 'timeline') ? 'timeline' : 'grid';
  try { localStorage.setItem(LS_KEY_VIEW, currentView); } catch {}
  applyViewState();
  renderGrid();
}
function renderTimeline() {
  const tl = document.getElementById('animeTimeline');
  if (!tl) return;
  const list = getFilteredSorted();
  if (!list.length) {
    tl.innerHTML = `<div class="anime-empty"><div style="font-size:2rem;margin-bottom:8px;">🔍</div><div>时间线暂无匹配条目</div></div>`;
    return;
  }
  const groups = {};
  list.forEach(a => { const d = decadeOfYear(a); (groups[d] = groups[d] || []).push(a); });
  const order = Object.keys(groups).sort((x, y) => {
    if (x === 'unknown') return 1;
    if (y === 'unknown') return -1;
    return Number(x) - Number(y);
  });
  const label = d => d === 'unknown' ? '年份未标' : `${d.replace('s', '')} 年代`;
  tl.innerHTML = order.map(d => `
    <section class="am-tl-group">
      <header class="am-tl-head"><span class="am-tl-dot"></span><h3>${label(d)}</h3><span class="am-tl-count">${groups[d].length} 部</span></header>
      <div class="am-tl-row">${groups[d].map(timelineNode).join('')}</div>
    </section>`).join('');
  tl.querySelectorAll('.am-tl-cover img').forEach(armCover);
}
function timelineNode(a) {
  const cover = a.images?.large || placeholderCoverDataUri(a.name_cn || a.name);
  const score = scoreNum(a);
  return `
    <button type="button" class="am-tl-node" onclick="openDetailById(${JSON.stringify(a.id)})">
      <span class="am-tl-cover"><img src="${escHtml(cover)}" data-cid="${a.id}" data-idx="0" loading="lazy" decoding="async" onerror="coverNextImg(this)" alt="${escHtml(a.name_cn || a.name)}"></span>
      <span class="am-tl-info">
        <span class="am-tl-name">${escHtml(a.name_cn || a.name)}</span>
        <span class="am-tl-meta">${a.year || '—'} · ${score > 0 ? '⭐' + score.toFixed(1) : '暂无评分'}</span>
        <span class="am-tl-status s-${a.status}">${STATUS_LABEL[a.status] || a.status}</span>
      </span>
    </button>`;
}

function scoreNum(a) { return Number(a.score) || 0; }

// 类型 chips（聚合去重 + 命中计数）
function renderGenreChips() {
  const wrap = document.getElementById('genreChips');
  if (!wrap) return;
  let html = `<button class="anime-genre-chip ${currentGenre === 'all' ? 'active' : ''}" data-genre="all">全部类型</button>`;
  GENRE_CATEGORIES.forEach(cat => {
    const n = animeData.filter(a => matchCategory(a, cat.key)).length;
    if (!n) return; // 当前清单无命中的大类不显示，保持筛选条精简
    html += `<button class="anime-genre-chip ${currentGenre === cat.key ? 'active' : ''}" data-genre="${cat.key}">${escHtml(cat.label)}<span class="chip-count">${n}</span></button>`;
  });
  wrap.innerHTML = html;
}

function updateStatusCounts() {
  ['watching', 'completed'].forEach(status => {
    document.getElementById('count-' + status).textContent = animeData.filter(a => a.status === status).length;
  });
}

function openDetailById(id) {
  const a = animeData.find(x => String(x.id) === String(id));
  if (a) showDetail(a);
}
function applyGenreFilter(g) {
  currentGenre = (currentGenre === g) ? 'all' : g;
  renderGenreChips();
  renderGrid();
  syncQueryToUrl();
}

function resetFilters() {
  currentStatus = 'watching';
  currentGenre = 'all';
  currentDecade = 'all';
  searchQuery = '';
  sortKey = 'default';
  document.getElementById('searchInput').value = '';
  updateSearchClearBtn();
  document.getElementById('sortSelect').value = 'default';
  const ds = document.getElementById('decadeSelect');
  if (ds) ds.value = 'all';
  document.querySelectorAll('.anime-status-tab').forEach(b => b.classList.toggle('active', b.dataset.status === 'watching'));
  renderGenreChips();
  renderGrid();
  syncQueryToUrl();
}

// ========== M3：环境探测 + 详情弹窗 + 双模式播放 ==========
const LS_KEY_PROGRESS = 'anime-progress:v1';
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
let localSvcAlive = false;
let currentDetail = null;
let currentHls = null;
let localObjectUrl = null;
let progressTimer = null;

async function probeLocalService() {
  if (!isLocal) { localSvcAlive = false; return; }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 800);
    const r = await fetch('http://localhost:3001/api/health', { signal: ctrl.signal });
    clearTimeout(t);
    localSvcAlive = r.ok;
  } catch { localSvcAlive = false; }
}
probeLocalService();

function loadHlsScript() {
  return new Promise((resolve, reject) => {
    if (window.Hls) return resolve(true);
    if (window.__hlsPromise) return window.__hlsPromise;
    window.__hlsPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = '../js/vendor/hls.min.js';
      s.onload = () => res(true);
      s.onerror = () => rej(new Error('hls.js 加载失败'));
      document.head.appendChild(s);
    });
    window.__hlsPromise.then(resolve, reject);
  });
}

function readProgress(id) {
  try { return JSON.parse(localStorage.getItem(LS_KEY_PROGRESS) || '{}')[id] || null; }
  catch { return null; }
}
function writeProgress(id, patch) {
  const all = JSON.parse(localStorage.getItem(LS_KEY_PROGRESS) || '{}');
  all[id] = Object.assign({}, all[id] || {}, patch, { updatedAt: Date.now() });
  localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(all));
}

// 状态 / 评分：先写本地，再尝试服务端 PUT（公网无 token 时静默降级为本地覆盖）
function setDetailStatus(s) {
  if (!currentDetail) return;
  currentDetail.status = s;
  writeLocalPatch(currentDetail.id, { status: s });
  renderStatusRow();
  renderGrid();
  updateStatusCounts();
}
function setDetailScore(v) {
  if (!currentDetail) return;
  currentDetail.score = Number(v);
  writeLocalPatch(currentDetail.id, { score: Number(v) });
  renderScoreRow();
  renderGrid();
  updateStatusCounts();
}
// 静态清单模式：状态 / 评分 / 进度只写 localStorage，不再向 Worker 发起 PUT；
// 跨设备迁移由工具栏「导出 JSON / 导入 JSON」完成。保留函数签名以兼容既有调用点。

function renderStatusRow() {
  const row = document.getElementById('modalStatusRow');
  row.innerHTML = '';
  ['watching', 'completed'].forEach((s) => {
    const b = document.createElement('button');
    b.className = 'am-status-btn' + (currentDetail.status === s ? ' active ' + s : '');
    b.textContent = STATUS_LABEL[s];
    b.onclick = () => setDetailStatus(s);
    row.appendChild(b);
  });
}
function renderScoreRow() {
  const row = document.getElementById('modalScoreRow');
  row.innerHTML = '';
  const cur = Math.round(scoreNum(currentDetail));
  for (let v = 1; v <= 10; v++) {
    const b = document.createElement('button');
    b.className = 'am-score-btn' + (cur === v ? ' active' : '');
    b.textContent = v;
    b.onclick = () => setDetailScore(v);
    row.appendChild(b);
  }
}

// 详情弹窗：已看集数手动增减 + 完成率条（写本地 patch，联动网格与统计）
function renderEpsEditor() {
  const row = document.getElementById('modalEpsRow');
  if (!row || !currentDetail) return;
  renderDetailMeta();
  const total = Number(currentDetail.eps) || 0;
  const watched = Number(currentDetail.epsWatched) || 0;
  if (!total) {
    row.innerHTML = '<span class="am-eps-hint">总集数未知，补充总集数后即可记录观看进度</span>';
    return;
  }
  const pct = Math.min(100, Math.round(watched / total * 100));
  const canMarkDone = total > 0 && watched < total && currentDetail.status !== 'completed';
  row.innerHTML = `
    <div class="am-eps-head">
      <span class="am-eps-label">观看进度</span>
      <span class="am-eps-count">
        <button type="button" class="am-eps-step" onclick="setDetailEps(-1)" aria-label="已看集数减一">−</button>
        <b>${watched}</b><span class="am-eps-total"> / ${total} 集 · ${pct}%</span>
        <button type="button" class="am-eps-step" onclick="setDetailEps(1)" aria-label="已看集数加一">＋</button>
      </span>
    </div>
    <div class="anime-progress am-eps-progress"><div class="anime-progress-bar" style="width:${pct}%"></div></div>
    ${canMarkDone ? `<button type="button" class="am-eps-done" onclick="markAllWatched()" title="一次性记为全部看完并把状态切到「看完」">✅ 一键看完（共 ${total} 集）</button>` : ''}`;
}
// 一键看完：集数一次写满并同步状态为看完，只写一次本机 patch，避免逐集点 ＋ 与多次重复渲染
function markAllWatched() {
  if (!currentDetail) return;
  const total = Number(currentDetail.eps) || 0;
  if (!total) return;
  currentDetail.epsWatched = total;
  currentDetail.status = 'completed';
  writeLocalPatch(currentDetail.id, { epsWatched: total, status: 'completed' });
  renderStatusRow();
  renderEpsEditor();
  renderGrid();
  updateStatusCounts();
}
function setDetailEps(delta) {
  if (!currentDetail) return;
  const total = Number(currentDetail.eps) || 0;
  const next = Math.max(0, Math.min(total, (Number(currentDetail.epsWatched) || 0) + delta));
  currentDetail.epsWatched = next;
  writeLocalPatch(currentDetail.id, { epsWatched: next });
  renderEpsEditor();
  renderGrid();
  updateStatusCounts();
}

function renderDetailMeta() {
  const a = currentDetail;
  if (!a) return;
  const parts = [];
  if (a.year) parts.push(`${a.year} 年`);
  if (a.studio) parts.push(a.studio);
  parts.push(a.eps ? `${a.eps} 集` : '集数未知');
  if (a.eps) parts.push(`已看 ${a.epsWatched || 0}/${a.eps}`);
  document.getElementById('modalMeta').innerHTML = parts.map(escHtml).join('<span class="am-sep">·</span>');
}

let modalReturnFocus = null;
function showDetail(a) {
  if (!document.getElementById('animeModal').classList.contains('active')) modalReturnFocus = document.activeElement;
  currentDetail = a;
  const coverEl = document.getElementById('modalCover');
  coverEl.dataset.fallbacked = '';
  coverEl.dataset.fbk = '';
  coverEl.dataset.cid = a.id;
  coverEl.dataset.idx = '0';
  coverEl.alt = a.name_cn || a.name || '番剧';
  coverEl.src = (a.coverList && a.coverList[0]) || a.images?.large || placeholderCoverDataUri(a.name_cn || a.name);
  armCover(coverEl);

  document.getElementById('modalTitle').textContent = a.name_cn || a.name;
  const origEl = document.getElementById('modalOriginal');
  origEl.textContent = (a.name && a.name !== a.name_cn) ? a.name : '';

  renderDetailMeta();

  document.getElementById('modalSummary').textContent = a.summary || '暂无简介。';
  const genreWrap = document.getElementById('modalGenres');
  genreWrap.innerHTML = (a.genres || []).map(g =>
    `<span class="am-genre-chip">${escHtml(g)}</span>`).join('');

  renderStatusRow();
  renderScoreRow();
  renderEpsEditor();
  renderOnlineLinks(a);

  // 本地面板仅本机显示
  document.getElementById('amLocalSection').style.display = isLocal ? 'block' : 'none';
  document.getElementById('amSvcDown').style.display = (isLocal && !localSvcAlive) ? 'block' : 'none';

  // 续播条
  renderResumeRow(a);
  // 清空播放器
  resetPlayer();

  document.getElementById('animeModal').classList.add('active');
  document.querySelector('.anime-modal-content').scrollTop = 0;
  document.body.style.overflow = 'hidden'; // 详情浮层打开时锁定底层页面滚动
  document.querySelector('.anime-modal-close')?.focus({ preventScroll: true });
}

function renderOnlineLinks(a) {
  const wrap = document.getElementById('amOnlineLinks');
  wrap.innerHTML = '';
  const kw = encodeURIComponent(a.name_cn || a.name || '');
  const add = (href, text, cls) => {
    if (!href) return;
    const el = document.createElement('a');
    el.className = 'am-link-btn ' + (cls || '');
    el.href = href; el.target = '_blank'; el.rel = 'noopener noreferrer';
    el.textContent = text;
    wrap.appendChild(el);
  };
  // 资料档案：Bangumi 有真实条目 id 时直链，否则统一走关键词检索
  if (a.bangumiId) add(`https://bgm.tv/subject/${encodeURIComponent(a.bangumiId)}`, '📚 Bangumi 条目', 'bgm');
  add(`https://search.douban.com/movie/subject_search?search_text=${kw}`, '🎬 豆瓣资料');
  // 正版视频平台：关键词搜索直达，即使本条没有平台直链 id 也能一键跳转检索
  if ((a.name_cn || a.name) === '九色鹿' && String(a.year) === '1981') {
    add('https://www.bilibili.com/bangumi/play/ep63463', '📺 B站官方正片', 'bili');
  }
  add(`https://search.bilibili.com/all?keyword=${kw}`, '📺 B站搜片', 'bili');
  add(`https://so.iqiyi.com/so/q_${kw}`, '🎞️ 爱奇艺搜片');
  add(`https://v.qq.com/x/search/?q=${kw}`, '▶️ 腾讯搜片');
  add(`https://search.youku.com/search_video?keyword=${kw}`, '🟢 优酷搜片');
  add(`https://so.mgtv.com/so?k=${kw}`, '🥭 芒果搜片');
  // 官方资源：去除历史数据里可能存在的前导空格（C3）
  if (a.official_url) add(String(a.official_url).trim(), '🌐 官方站点');
  if (a.pv_url) add(a.pv_url, '▶️ 官方 PV');
  if (!wrap.children.length) wrap.innerHTML = '<span style="color:#888;font-size:0.8rem;">暂无外部链接</span>';
}

function renderResumeRow(a) {
  const row = document.getElementById('amResumeRow');
  const p = readProgress(a.id);
  if (p && p.position > 8 && p.duration - p.position > 5) {
    const mm = Math.floor(p.position / 60), ss = Math.floor(p.position % 60);
    row.style.display = 'flex';
    row.innerHTML = `
      <button class="am-resume-btn" onclick="resumePlayback()">继续播放 · ${mm}:${String(ss).padStart(2,'0')}</button>
      <button class="am-restart-btn" onclick="restartPlayback()">从头看</button>`;
  } else {
    row.style.display = 'none';
  }
}
function resumePlayback() { /* 加载视频后由 loadedmetadata 自动定位，见 loadVideo */ }
function restartPlayback() {
  const vp = document.getElementById('videoPlayer');
  const p = readProgress(currentDetail.id);
  if (p) writeProgress(currentDetail.id, { position: 0, duration: 0 });
  if (vp.src) vp.currentTime = 0;
  renderResumeRow(currentDetail);
}

// ---- 播放器核心 ----
function resetPlayer() {
  const vp = document.getElementById('videoPlayer');
  if (currentHls) { currentHls.destroy(); currentHls = null; }
  vp.pause();
  vp.removeAttribute('src');
  vp.load();
  if (localObjectUrl) { URL.revokeObjectURL(localObjectUrl); localObjectUrl = null; }
  document.getElementById('amEpList').style.display = 'none';
  document.getElementById('amEpList').innerHTML = '';
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

async function loadVideo(url, { resume = true } = {}) {
  const vp = document.getElementById('videoPlayer');
  resetPlayer();
  const lower = url.toLowerCase();
  if (lower.endsWith('.m3u8')) {
    try {
      await loadHlsScript();
      if (window.Hls && window.Hls.isSupported()) {
        currentHls = new window.Hls();
        currentHls.loadSource(url);
        currentHls.attachMedia(vp);
        currentHls.on(window.Hls.Events.MANIFEST_PARSED, () => { try { vp.play(); } catch {} });
      } else {
        vp.src = url; // Safari 原生 HLS
      }
    } catch {
      vp.src = url;
    }
  } else {
    vp.src = url;
    vp.play().catch(() => {});
  }
  bindProgress(vp, resume);
}

function bindProgress(vp, resume) {
  const saved = resume ? readProgress(currentDetail.id) : null;
  vp.onloadedmetadata = () => {
    if (saved && saved.position > 0 && saved.position < vp.duration - 2) {
      vp.currentTime = saved.position;
    }
  };
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!vp.paused && vp.currentTime) {
      writeProgress(currentDetail.id, { position: vp.currentTime, duration: vp.duration || 0 });
    }
  }, 5000);
}

// 来源 A：本地解析服务
async function playViaLocalParse() {
  if (!isLocal) return;
  const vp = document.getElementById('videoPlayer');
  vp.removeAttribute('poster');
  if (!localSvcAlive) {
    document.getElementById('amSvcDown').style.display = 'block';
    return;
  }
  const a = currentDetail;
  let targetUrl;
  // 仅信任真实 bilibili_id（ep 号）；Bangumi id 与 B站 ss 号不是同一套编号，不再互相拼接
  if (a.bilibili_id) targetUrl = `https://www.bilibili.com/bangumi/play/${a.bilibili_id}`;
  else {
    const kw = encodeURIComponent(a.name_cn || a.name);
    window.open(`https://search.bilibili.com/all?keyword=${kw}`, '_blank', 'noopener');
    alert('本条缺少 B 站直链标识，已打开 B 站搜索结果页，可从官方番剧页进入。');
    return;
  }
  try {
    const resp = await fetch(`http://localhost:3001/api/parse?url=${encodeURIComponent(targetUrl)}`);
    const data = await resp.json();
    if (data.success && data.streams && data.streams.length) {
      renderEpList(data.episodes || []);
      loadVideo(data.streams[0].url);
    } else {
      alert('解析未返回可用流：' + (data.error || '未知原因'));
    }
  } catch (e) {
    alert('无法连接 localhost:3001，请先运行启动脚本。');
  }
}

function renderEpList(episodes) {
  const wrap = document.getElementById('amEpList');
  if (!episodes || !episodes.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = episodes.slice(0, 40).map((ep, i) =>
    `<div class="am-ep-chip" data-i="${i}">第 ${ep.number || i + 1} 集${ep.title ? ' · ' + escHtml(ep.title) : ''}</div>`
  ).join('');
}

// 来源 B：本机文件
function playLocalFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  localObjectUrl = URL.createObjectURL(file);
  loadVideo(localObjectUrl);
  input.value = '';
}

// 来源 C：直链
function playDirectUrl() {
  const v = document.getElementById('amUrlInput').value.trim();
  if (!/^https?:\/\/.+/i.test(v)) { alert('请输入 http/https 开头的地址'); return; }
  if (!/\.(m3u8|mp4|webm|ogg)(\?.*)?$/i.test(v)) {
    if (!confirm('该地址看起来不是常见视频格式，仍要加载吗？')) return;
  }
  loadVideo(v);
}

// 拖放绑定（脚本位于 body 末尾，DOM 已就绪，直接绑定）
(function bindDropzone() {
  const dz = document.getElementById('amDropzone');
  if (!dz) return;
  ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
  dz.addEventListener('drop', e => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) { localObjectUrl = URL.createObjectURL(f); loadVideo(localObjectUrl); }
  });
})();

function closeAnimeModal() {
  resetPlayer();
  document.getElementById('animeModal').classList.remove('active');
  document.body.style.overflow = ''; // 解除底层滚动锁定
  currentDetail = null;
  const returnTo = modalReturnFocus?.isConnected ? modalReturnFocus : document.querySelector('.anime-card');
  returnTo?.focus({ preventScroll: true });
  modalReturnFocus = null;
}

document.getElementById('animeModal').onclick = (e) => {
  if (e.target === e.currentTarget) closeAnimeModal();
};

// ========== 筛选 / 排序 / URL 同步 ==========
function applyQueryFromUrl() {
  const p = new URLSearchParams(location.search);
  const qStatus = p.get('status');
  // 老的想看/弃番链接仍能查看对应的未完成内容。
  currentStatus = normalizeStatus(qStatus);
  const qGenre = p.get('genre');
  currentGenre = (qGenre && (qGenre === 'all' || GENRE_CATEGORIES.some(c => c.key === qGenre))) ? qGenre : 'all';
  if (p.get('q')) {
    searchQuery = p.get('q').toLowerCase();
    const si = document.getElementById('searchInput');
    if (si) si.value = p.get('q');
  }
  updateSearchClearBtn();
  if (p.get('sort')) sortKey = p.get('sort');
  document.querySelectorAll('.anime-status-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.status === currentStatus));
  const sel = document.getElementById('sortSelect');
  if (sel) sel.value = sortKey;
}
function syncQueryToUrl() {
  const p = new URLSearchParams();
  p.set('status', currentStatus);
  if (currentGenre !== 'all') p.set('genre', currentGenre);
  if (searchQuery) p.set('q', searchQuery);
  if (sortKey !== 'default') p.set('sort', sortKey);
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
}

function updateSearchClearBtn() {
  const si = document.getElementById('searchInput');
  const btn = document.getElementById('searchClearBtn');
  if (!si || !btn) return;
  btn.hidden = !si.value;
}
function clearSearch() {
  const si = document.getElementById('searchInput');
  if (si) si.value = '';
  searchQuery = '';
  updateSearchClearBtn();
  renderGrid();
  syncQueryToUrl();
  if (si) si.focus();
}
let searchTimer;
document.getElementById('searchInput').addEventListener('input', (e) => {
  updateSearchClearBtn();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderGrid();
    syncQueryToUrl();
  }, 280);
});
const _searchClearBtn = document.getElementById('searchClearBtn');
if (_searchClearBtn) _searchClearBtn.addEventListener('click', clearSearch);

document.getElementById('sortSelect').addEventListener('change', (e) => {
  sortKey = e.target.value;
  renderGrid();
  syncQueryToUrl();
});

document.getElementById('statusTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.anime-status-tab');
  if (!btn) return;
  currentStatus = btn.dataset.status;
  document.querySelectorAll('.anime-status-tab').forEach(b => b.classList.toggle('active', b === btn));
  renderGrid();
  syncQueryToUrl();
});

document.getElementById('genreChips').addEventListener('click', (e) => {
  const btn = e.target.closest('.anime-genre-chip');
  if (!btn) return;
  currentGenre = btn.dataset.genre;
  renderGenreChips();
  renderGrid();
  syncQueryToUrl();
});

// ===== 视图切换 / 年代筛选 / 网格密度（P0） =====
document.getElementById('viewSwitch').addEventListener('click', (e) => {
  const btn = e.target.closest('.anime-view-btn');
  if (!btn) return;
  switchView(btn.dataset.view);
});
document.getElementById('decadeSelect').addEventListener('change', (e) => {
  currentDecade = e.target.value;
  renderGrid();
});
document.getElementById('viewDensityBtn').addEventListener('click', () => {
  densityCompact = !densityCompact;
  try { localStorage.setItem(LS_KEY_DENSITY, densityCompact ? '1' : '0'); } catch {}
  document.getElementById('animeGrid').classList.toggle('density-compact', densityCompact);
  refreshDensityBtn();
});
function renderDecadeOptions() {
  const sel = document.getElementById('decadeSelect');
  if (!sel) return;
  const set = new Set();
  animeData.forEach(a => { const d = decadeOfYear(a); if (d !== 'unknown') set.add(d); });
  const opts = ['<option value="all">全部年代</option>'];
  Array.from(set).sort((x, y) => Number(x) - Number(y)).forEach(d =>
    opts.push(`<option value="${d}">${d.replace('s', '')} 年代</option>`));
  opts.push('<option value="unknown">年份未标</option>');
  sel.innerHTML = opts.join('');
  sel.value = currentDecade;
}
function refreshDensityBtn() {
  const b = document.getElementById('viewDensityBtn');
  if (!b) return;
  b.textContent = densityCompact ? '◫ 紧凑' : '◫ 舒适';
  b.classList.toggle('active', densityCompact);
}

// 快捷键：Esc 关弹窗；按 / 聚焦搜索。命名函数 + addEventListener，避免覆盖全站 document.onkeydown；
// 每个分支都先判节点是否存在，pjax 残留监听在非追番页也不会报错或误操作。
function animeKeydown(e) {
  if (document.querySelector('.anime-cinema-shell[open]')) return;
  const modal = document.getElementById('animeModal');
  if (modal?.classList.contains('active') && e.key === 'Tab') {
    const items = [...modal.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el => {
      for (let node = el; node && node !== modal; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (node.hidden || style.display === 'none' || style.visibility === 'hidden') return false;
      }
      return true;
    });
    const first = items[0], last = items[items.length - 1];
    if (first && (e.shiftKey && document.activeElement === first || !e.shiftKey && document.activeElement === last || !modal.contains(document.activeElement))) {
      e.preventDefault(); (e.shiftKey ? last : first).focus();
    }
    return;
  }
  if (e.key === 'Escape') {
    if (modal && modal.classList.contains('active')) closeAnimeModal();
    return;
  }
  if (e.key !== '/') return;
  const si = document.getElementById('searchInput');
  if (!si) return;
  const tag = ((e.target && e.target.tagName) || '').toLowerCase();
  if (['input', 'select', 'textarea'].includes(tag)) return;
  e.preventDefault();
  si.focus();
}
// pjax 安全（见 docs/pjax-safety.md 约定一）：先移除上一轮绑定的函数引用，
// 再绑定本轮，保证 window 上同一键位监听恒定为 1 份；脚本被重复执行时不再线性堆积。
if (window.__BIKO_ANIME_KEYDOWN__) {
  window.removeEventListener('keydown', window.__BIKO_ANIME_KEYDOWN__);
}
window.__BIKO_ANIME_KEYDOWN__ = animeKeydown;
window.addEventListener('keydown', animeKeydown);

// ========== P1-6 DeepSeek 元数据批量补全（Key 仅存本机浏览器 localStorage，不外传、不入仓库） ==========
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
function readAiCfg() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_AI) || '{}'); } catch { return {}; }
}
function saveAiCfg(cfg) {
  try { localStorage.setItem(LS_KEY_AI, JSON.stringify(cfg)); } catch {}
}
function aiNeedsEnrich(a) {
  const s = String(a.summary || '').trim();
  return s.length < 24 || (a.genres || []).length < 2 || !a.studio;
}
function stripFence(t) {
  if (!t) return '';
  let s = String(t).trim();
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) s = m[1].trim();
  const i = s.indexOf('{'), j = s.lastIndexOf('}');
  if (i >= 0 && j > i) s = s.slice(i, j + 1);
  return s;
}
async function callDeepSeek(cfg, prompt) {
  const payload = {
    model: cfg.model || 'deepseek-chat',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: '你是严谨的番剧资料助手。只输出一个 JSON 对象，字段固定为：summary（80字以内中文简介，客观不剧透）、genres（中文类型数组，2-4个）、studio（制作公司中文名称，不确定给空字符串）、year（首播年份整数，不确定给 null）。不要输出解释或 Markdown。' },
      { role: 'user', content: prompt }
    ]
  };
  // 优先本机 3001 代理（规避浏览器 CORS，Key 不写入服务端文件）；服务不在线时尝试浏览器直连
  if (localSvcAlive) {
    const r = await fetch('http://localhost:3001/api/ai/enrich', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: cfg.apiKey, payload })
    });
    if (!r.ok) throw new Error('AI 代理 HTTP ' + r.status);
    const data = await r.json();
    return data.content || '';
  }
  const r = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error('DeepSeek HTTP ' + r.status);
  const data = await r.json();
  return data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
}
async function enrichOne(a, cfg) {
  const prompt = `番剧名称：${a.name_cn || a.name}；已知年份：${a.year || '未知'}；已知类型：${(a.genres || []).join('、') || '未知'}；制作方：${a.studio || '未知'}。请补全资料。`;
  const raw = await callDeepSeek(cfg, prompt);
  const obj = JSON.parse(stripFence(raw));
  const patch = { aiEnriched: true };
  if (typeof obj.summary === 'string' && obj.summary.trim()) patch.summary = obj.summary.trim().slice(0, 300);
  if (Array.isArray(obj.genres) && obj.genres.length) patch.genres = obj.genres.map(String).slice(0, 5);
  if (typeof obj.studio === 'string' && obj.studio.trim()) patch.studio = obj.studio.trim();
  if (Number(obj.year)) patch.year = String(obj.year);
  return patch;
}
async function runAiEnrich() {
  const btn = document.getElementById('aiEnrichBtn');
  let cfg = readAiCfg();
  if (!cfg.apiKey) {
    const input = window.prompt('请输入 DeepSeek API Key（仅保存在本机浏览器，不会上传、也不会进入代码仓库）：\n获取：https://platform.deepseek.com/api_keys');
    if (!input || !input.trim()) return;
    cfg = Object.assign({}, cfg, { apiKey: input.trim() });
    saveAiCfg(cfg);
  }
  const candidates = animeData.filter(aiNeedsEnrich);
  if (!candidates.length) { alert('现有条目资料已较完整，无需补全。'); return; }
  btn.disabled = true;
  let ok = 0, fail = 0;
  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    btn.textContent = `✨ 补全中 ${i + 1}/${candidates.length}`;
    try {
      const patch = await enrichOne(a, cfg);
      writeLocalPatch(a.id, patch);
      const target = animeData.find(x => String(x.id) === String(a.id));
      if (target) Object.assign(target, patch);
      ok++;
    } catch (e) {
      console.warn('AI 补全失败:', a.name_cn || a.name, e);
      fail++;
    }
  }
  btn.disabled = false;
  btn.textContent = '✨ AI 补全';
  renderGenreChips();
  renderGrid();
  updateStatusCounts();
  const hint = (!fail || localSvcAlive) ? '' : '\n提示：本机解析服务未启动，浏览器直连可能被 CORS 拦截；启动 3001 服务后可走本机代理。';
  alert(`AI 补全完成：成功 ${ok} 条，失败 ${fail} 条。结果仅写入本机浏览器，可用「导出 JSON」备份。${hint}`);
}
document.getElementById('aiEnrichBtn').addEventListener('click', runAiEnrich);

// ========== M5：导出 / 导入 JSON（本机状态与进度迁移；不直写服务端，线上只读原则不变） ==========
function buildExportPayload() {
  return {
    v: 1,
    exportedAt: new Date().toISOString(),
    count: animeData.length,
    items: animeData.map(a => ({
      id: a.id,
      title: a.name_cn || a.name,
      status: a.status,
      score: Number(a.score) || 0,
      epsWatched: a.epsWatched || 0,
      totalEps: a.eps || 0,
      year: a.year || '',
      genres: a.genres || [],
      summary: a.summary || ''
    })),
    localTracker: readLocalTracker(),
    progress: JSON.parse(localStorage.getItem(LS_KEY_PROGRESS) || '{}')
  };
}
function exportJson() {
  const payload = buildExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date();
  a.href = url;
  a.download = `anime-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.items)) throw new Error('格式不符：缺少 items 数组');
      const tracker = readLocalTracker();
      data.items.forEach(it => {
        if (it.id == null) return;
        tracker[it.id] = Object.assign({}, tracker[it.id], {
          status: it.status,
          score: it.score,
          epsWatched: it.epsWatched,
          updatedAt: Date.now()
        });
      });
      localStorage.setItem(LS_KEY_TRACKER, JSON.stringify(tracker));
      if (data.progress && typeof data.progress === 'object') {
        const old = JSON.parse(localStorage.getItem(LS_KEY_PROGRESS) || '{}');
        localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(Object.assign({}, old, data.progress)));
      }
      alert(`已导入 ${data.items.length} 条本机状态（仅保存到当前浏览器，不会改写线上数据库）`);
      const cached = animeSeal && animeSeal.getData();
      const arr = cached ? (Array.isArray(cached) ? cached : (cached.data || [])) : [];
      if (arr.length) applyRawData(arr, true, Date.now()); else retryUnlock();
    } catch (e) {
      alert('导入失败：' + e.message);
    }
  };
  reader.readAsText(file);
}
document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
document.getElementById('importJsonBtn').addEventListener('click', () =>
  document.getElementById('importJsonFile').click());
document.getElementById('importJsonFile').addEventListener('change', e => {
  if (e.target.files[0]) importJson(e.target.files[0]);
  e.target.value = '';
});

// 封面缺失占位（卡片网格使用）由 placeholderCoverDataUri 承担，见下方封面工具区。

// 页面启动：先查 12h 解密缓存 / 缓存密钥重解，都没有则停在口令门等待输入

Object.assign(window, { closeAnimeModal, playViaLocalParse, playDirectUrl, retryUnlock, resetFilters, openDetailById, applyGenreFilter, setDetailEps, markAllWatched, resumePlayback, restartPlayback, coverNextImg, playLocalFile });
const cloud = window.BikoAnimeCloud?.create({
  beforeScopeChange() { clearTimeout(searchTimer); },
  localTracker: readLocalTracker,
  onRows(rows) {
    if (!gateEl.isConnected) return;
    animeSeal?.putData({ data: rows });
    if (!unlocked) { unlockWithData(rows, false); return; }
    applyRawData(rows, false);
    if (currentDetail) {
      const updated = animeData.find(a => String(a.id) === String(currentDetail.id));
      if (updated) { currentDetail = updated; renderStatusRow(); renderScoreRow(); renderEpsEditor(); }
    }
  }
});
cinema = window.BikoAnimeCinema?.create({rows:()=>animeData,unlocked:()=>unlocked,open:openDetailById});
bootUnlock();

})();

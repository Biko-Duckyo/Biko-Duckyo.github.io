// ======================================================
// 天气组件（和风天气 QWeather · 全量 v1 坐标口径 · 同源代理版）
// 渲染目标：
//   1) 顶栏胶囊 #he-plugin-simple（图标 + 城市 + 温度 + 状况 + AQI + 预警）
//   2) 首页卡片 .dash-weather（大温度/7 日条/逐小时/统计/AQI/手动搜索）
//   3) 时钟卡 #hexo_electric_clock（状况 + 地点）
// 安全：Key 与专属 Host 只存服务端 functions/api/weather，前端永不接触密钥。
// 城市策略：浏览器自动定位 → Geo 反查城市；失败则不静默兜底，首页卡片提示并开放
//           手动搜索（搜索框仅存在于首页卡片，顶栏胶囊不做搜索）；手动选择的城市
//           写入 localStorage，换机/换浏览器不共享（纯本地偏好，无后端账号体系）。
// 接口（经同源代理 /api/weather/*，统一 v1 坐标接口，Geo 保留 v2）：
//   city     GET /city?q=<城市名|lon,lat>
//   now      GET /now?lat=&lon=
//   daily    GET /daily?lat=&lon=&days=7
//   hourly   GET /hourly?lat=&lon=&hours=24
//   air      GET /air?lat=&lon=
//   warning  GET /warning?lat=&lon=
// ======================================================
(function () {
  'use strict';

  // ====== 配置区 ======
  var PROXY = '/api/weather';
  var CACHE_KEY = 'biko-weather-loc';
  var TTL_AUTO = 6 * 60 * 60 * 1000;      // 自动定位缓存 6 小时（避免反复弹权限）
  var TTL_MANUAL = 24 * 60 * 60 * 1000;   // 手动选择缓存 24 小时
  // 本地无 Functions（hexo server）时用假数据目视 UI；线上必须 false
  var USE_MOCK = false;

  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var WIND_CN = {
    n: '北', nne: '北北东北', ne: '东北', ene: '东北东',
    e: '东', ese: '东南东', se: '东南', sse: '南南东',
    s: '南', ssw: '南南西', sw: '西南', wsw: '西南西',
    w: '西', wnw: '西北西', nw: '西北', nnw: '北西北',
    none: '不定', vrb: '不定'
  };

  var busy = false;

  // ---------- 基础工具 ----------
  function fetchJSON(url, signal) {
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 10000) : null;
    var opts = controller ? { signal: signal || controller.signal } : undefined;
    return fetch(url, opts)
      .then(function (r) {
        if (timer) clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (data && data.error) throw new Error(data.error.message || data.error);
        return data;
      });
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setText(root, sel, text) {
    var el = qs(sel, root);
    if (el) el.textContent = text;
  }

  function qi(code) { return 'qi-' + (code || '999'); }
  function weekCN(d) { return WEEK[d.getDay()]; }
  function windCN(c) { return WIND_CN[c] || '微风'; }

  // ---------- 缓存（纯本地，换机不共享；云端同步由后端方案另行承担） ----------
  function readLoc() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !isFinite(o.lat) || !isFinite(o.lon)) return null;
      var ttl = o.source === 'manual' ? TTL_MANUAL : TTL_AUTO;
      if (Date.now() - o.ts > ttl) return null;
      return o;
    } catch (e) { return null; }
  }
  function writeLoc(loc, source) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({
        id: loc.id, name: loc.name, lat: loc.lat, lon: loc.lon,
        source: source, ts: Date.now()
      }));
    } catch (e) {}
  }
  function clearLoc() { try { window.localStorage.removeItem(CACHE_KEY); } catch (e) {} }

  // ---------- 数据归一化（把 v1 原始结构转成渲染层可用的扁平对象） ----------
  function normalizeNow(raw) {
    if (!raw || !raw.condition) return null;
    var c = raw.condition || {};
    var hum = Number(raw.humidity);
    if (!isFinite(hum)) hum = NaN;
    return {
      code: String(c.code || ''),
      text: c.text || '',
      temp: Math.round(Number((raw.temperature || {}).value)),
      feels: Math.round(Number((raw.feelsLike || {}).value)),
      humidity: isFinite(hum) ? (hum <= 1 ? Math.round(hum * 100) : Math.round(hum)) : NaN,
      windScale: Number((raw.wind || {}).scale),
      windCompass: ((raw.wind || {}).direction || {}).compass || ''
    };
  }

  function normalizeDaily(raw) {
    if (!raw || !Array.isArray(raw.days)) return [];
    return raw.days.map(function (d, i) {
      var day = d.daytime || {}, night = d.nighttime || {};
      var dc = day.condition || {}, nc = night.condition || {};
      var dt = new Date(d.forecastStartTime);
      var pop = Number((day.precipitation || {}).probability);
      return {
        label: i === 0 ? '今天' : i === 1 ? '明天' : weekCN(dt),
        code: String(dc.code || nc.code || ''),
        text: dc.text || nc.text || '',
        tMax: Math.round(Number((d.temperatureMax || {}).value)),
        tMin: Math.round(Number((d.temperatureMin || {}).value)),
        pop: Math.round((isFinite(pop) ? pop : 0) * 100)
      };
    });
  }

  function normalizeHourly(raw) {
    if (!raw || !Array.isArray(raw.hours)) return [];
    return raw.hours.slice(0, 4).map(function (h, i) {
      var c = h.condition || {};
      var dt = new Date(h.forecastTime);
      var hh = dt.getHours();
      return {
        label: i === 0 ? '现在' : (hh < 10 ? '0' + hh : hh) + ':00',
        code: String(c.code || ''),
        text: c.text || '',
        temp: Math.round(Number((h.temperature || {}).value))
      };
    });
  }

  function normalizeAir(raw) {
    if (!raw || !Array.isArray(raw.indexes) || !raw.indexes.length) return null;
    var idx = null;
    for (var i = 0; i < raw.indexes.length; i++) {
      if (raw.indexes[i].code === 'cn-mee') { idx = raw.indexes[i]; break; }
    }
    if (!idx) idx = raw.indexes[0];
    var color = idx.color
      ? 'rgba(' + idx.color.red + ',' + idx.color.green + ',' + idx.color.blue + ',' + (idx.color.alpha == null ? 1 : idx.color.alpha) + ')'
      : '';
    return {
      aqi: idx.aqiDisplay != null ? idx.aqiDisplay : idx.aqi,
      category: idx.category || '',
      color: color,
      pollutant: idx.primaryPollutant ? idx.primaryPollutant.name : ''
    };
  }

  function normalizeWarning(raw) {
    if (!raw) return false;
    if (raw.metadata && raw.metadata.zeroResult === true) return false;
    return Array.isArray(raw.alerts) && raw.alerts.length > 0;
  }

  function normalizeCity(raw) {
    if (!raw || !Array.isArray(raw.location) || !raw.location.length) return null;
    var g = raw.location[0];
    return { id: g.id, name: g.name, lat: Number(g.lat), lon: Number(g.lon), adm1: g.adm1, adm2: g.adm2 };
  }

  // ---------- 定位 ----------
  function geolocate() {
    return new Promise(function (resolve) {
      if (!navigator.geolocation) return resolve(null);
      var done = false;
      navigator.geolocation.getCurrentPosition(
        function (pos) { done = true; resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
        function () { resolve(null); },
        { timeout: 8000, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false }
      );
      setTimeout(function () { if (!done) resolve(null); }, 9000);
    });
  }

  function autoLocate() {
    return geolocate().then(function (c) {
      if (!c) return null;
      return fetchJSON(PROXY + '/city?q=' + encodeURIComponent(c.lon.toFixed(2) + ',' + c.lat.toFixed(2)))
        .then(normalizeCity);
    });
  }

  // ---------- 渲染 ----------
  function renderTopBar(p) {
    var box = document.getElementById('he-plugin-simple');
    if (!box) return;
    box.style.display = '';
    var now = p.now;
    var aqiHtml = p.air
      ? '<span class="bn-aqi" style="color:' + p.air.color + ';">· ' + p.air.aqi + ' ' + p.air.category + '</span>'
      : '';
    var warnHtml = p.warning
      ? ' <i class="fas fa-exclamation-triangle bn-warn" title="当前有气象预警"></i>'
      : '';
    box.innerHTML =
      '<span class="bn-wx-icon" aria-hidden="true"><i class="' + qi(now.code) + '"></i></span>' +
      '<span class="bn-wx-detail">' +
        '<span class="bn-city" title="' + p.loc.name + '"><i class="fas fa-location-dot"></i> ' + p.loc.name + '</span>' +
        '<span class="bn-wx"><i class="' + qi(now.code) + '"></i> ' + now.temp + '° ' + now.text + '</span>' +
        aqiHtml + warnHtml +
      '</span>';
  }

  function renderDashboard(p) {
    var card = qs('.dash-weather');
    if (!card) return;
    card.style.display = '';
    var now = p.now;

    var cityEl = qs('.dash-weather__city', card);
    if (cityEl) {
      var srcTag = p.loc.source === 'manual' ? '手动' : '自动';
      cityEl.innerHTML = '<i class="fas fa-map-marker-alt"></i> ' +
        '<span class="dash-weather__city-name">' + p.loc.name + '</span>' +
        '<span class="dash-weather__src">' + srcTag + '</span>';
    }

    setText(card, '.dash-weather__temp', now.temp + '°');
    var iconEl = qs('.dash-weather__icon', card);
    if (iconEl) iconEl.innerHTML = '<i class="' + qi(now.code) + '"></i>';
    setText(card, '.dash-weather__desc', now.text);

    if (p.daily && p.daily.length) {
      var d0 = p.daily[0];
      setText(card, '.dash-weather__range', '最高' + d0.tMax + '° · 最低' + d0.tMin + '°');
    }

    var hourEls = qsa('.dash-weather__hour', card);
    (p.hourly || []).forEach(function (h, i) {
      if (!hourEls[i]) return;
      hourEls[i].innerHTML =
        '<div class="dash-weather__hour-label">' + h.label + '</div>' +
        '<div class="dash-weather__hour-icon"><i class="' + qi(h.code) + '"></i></div>' +
        '<div class="dash-weather__hour-temp">' + h.temp + '°</div>';
    });

    var dailyEl = qs('.dash-weather__daily', card);
    if (dailyEl) {
      if (!p.daily || !p.daily.length) {
        dailyEl.setAttribute('hidden', '');
      } else {
        dailyEl.removeAttribute('hidden');
        dailyEl.innerHTML = p.daily.map(function (d) {
          return '<div class="dash-weather__day" title="' + d.text + '">' +
            '<div class="dash-weather__day-name">' + d.label + '</div>' +
            '<div class="dash-weather__day-icon"><i class="' + qi(d.code) + '"></i></div>' +
            '<div class="dash-weather__day-temp">' + d.tMax + '°/' + d.tMin + '°</div>' +
            '<div class="dash-weather__day-pop">' + (d.pop >= 20 ? d.pop + '%' : '') + '</div>' +
          '</div>';
        }).join('');
      }
    }

    var aqiEl = qs('.dash-weather__aqi', card);
    if (aqiEl) {
      if (!p.air) {
        aqiEl.setAttribute('hidden', '');
      } else {
        aqiEl.removeAttribute('hidden');
        aqiEl.innerHTML =
          '<span class="dash-weather__aqi-badge" style="color:' + p.air.color + '">' + p.air.aqi + ' ' + p.air.category + '</span>' +
          (p.air.pollutant ? '<span class="dash-weather__aqi-poll">首要 ' + p.air.pollutant + '</span>' : '') +
          '<a class="dash-weather__attrib" href="https://developer.qweather.com/attribution.html" target="_blank" rel="noopener">QWeather</a>';
      }
    }

    var alertEl = qs('.dash-weather__alert', card);
    if (alertEl) {
      if (!p.warning) {
        alertEl.setAttribute('hidden', '');
      } else {
        alertEl.removeAttribute('hidden');
        alertEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 当前有气象预警，请留意官方信息';
      }
    }

    var stats = qsa('.dash-weather__stat', card);
    if (stats[0]) stats[0].innerHTML = '<i class="fas fa-temperature-half"></i>体感 <span>' + (isFinite(now.feels) ? now.feels + '°' : '--') + '</span>';
    if (stats[1]) stats[1].innerHTML = '<i class="fas fa-droplet"></i>湿度 <span>' + (isFinite(now.humidity) ? now.humidity + '%' : '--') + '</span>';
    if (stats[2]) stats[2].innerHTML = '<i class="fas fa-wind"></i>' + windCN(now.windCompass) + '风 <span>' + (now.windScale || '--') + '级</span>';

    var notice = qs('.dash-weather__notice', card);
    if (notice) { notice.setAttribute('hidden', ''); notice.innerHTML = ''; }
  }

  function renderClock(p) {
    var clock = document.getElementById('hexo_electric_clock');
    if (!clock) return;
    var wEl = qs('.card-clock-weather', clock);
    if (wEl) wEl.textContent = ' ' + p.now.text + ' ' + p.now.temp + '°C';
    var hEl = qs('.card-clock-humidity', clock);
    if (hEl) hEl.textContent = isFinite(p.now.humidity) ? ' 💧' + p.now.humidity + '%' : '';
    var lEl = qs('.card-clock-location', clock);
    if (lEl) lEl.textContent = ' ' + p.loc.name;
  }

  function renderAll(p) {
    renderTopBar(p);
    renderDashboard(p);
    renderClock(p);
  }

  // ---------- 状态渲染：定位中 / 无定位 / 加载失败 ----------
  function showNotice(card, html) {
    var notice = qs('.dash-weather__notice', card);
    if (!notice) return;
    notice.removeAttribute('hidden');
    notice.innerHTML = html;
  }

  function renderLocating() {
    var box = document.getElementById('he-plugin-simple');
    if (box && box.style.display !== 'none') {
      box.style.display = '';
      box.innerHTML = '<span class="bn-wx-icon" aria-hidden="true"><i class="fas fa-spinner fa-spin"></i></span>' +
        '<span class="bn-wx-detail"><span class="bn-city" style="opacity:.55;">定位中…</span></span>';
    }
    var card = qs('.dash-weather');
    if (card) {
      card.style.display = '';
      showNotice(card, '<i class="fas fa-location-crosshairs"></i> 正在获取定位…');
    }
  }

  function renderNoLocation() {
    var box = document.getElementById('he-plugin-simple');
    if (box) {
      box.style.display = '';
      box.innerHTML = '<span class="bn-city bn-wx-error" data-wx-retry title="点击重试定位"><i class="fas fa-location-dot"></i> 未定位 · 重试</span>';
    }
    var card = qs('.dash-weather');
    if (card) {
      card.style.display = '';
      showNotice(card, '<i class="fas fa-circle-info"></i> 未获取到定位，点右上角 <b>搜索</b> 选择城市，或点定位按钮重试。');
      var wrap = qs('.dash-weather__search', card);
      if (wrap) wrap.classList.add('open');
    }
    var clock = document.getElementById('hexo_electric_clock');
    if (clock) {
      var wEl = qs('.card-clock-weather', clock);
      if (wEl) wEl.textContent = '';
      var hEl = qs('.card-clock-humidity', clock);
      if (hEl) hEl.textContent = '';
    }
  }

  // 诊断：同时写入 window 与 DOM dataset，便于在隔离/无控制台环境定位失败原因
  function recordErr(tag, err) {
    var msg = tag + ' :: ' + (err && (err.stack || err.message || err));
    window.__wxErr = msg;
    var n = document.querySelector('.dash-weather__notice');
    if (n) n.setAttribute('data-wx-err', String(msg).slice(0, 900));
  }

  function renderFetchError(loc) {
    var box = document.getElementById('he-plugin-simple');
    if (box) {
      box.style.display = '';
      box.innerHTML = '<span class="bn-wx-icon" aria-hidden="true"><i class="fas fa-cloud"></i></span>' +
        '<span class="bn-wx-detail"><span class="bn-city bn-wx-error" data-wx-retry title="点击重试"><i class="fas fa-rotate-right"></i> 天气暂不可用</span></span>';
    }
    var card = qs('.dash-weather');
    if (card) {
      card.style.display = '';
      showNotice(card, '<i class="fas fa-triangle-exclamation"></i> 天气数据加载失败，<a href="javascript:void(0)" data-wx-retry>点击重试</a>。');
    }
    // 失败但已有缓存城市时，保留最后一次数据不被清空
    if (loc && lastPayload && lastPayload.loc && loc.name === lastPayload.loc.name) {
      renderDashboard(lastPayload);
      renderClock(lastPayload);
    }
  }

  // ---------- 主流程 ----------
  var PROXY_STATE = 'unknown'; // unknown | ok | unavailable
  function probeProxy() {
    if (PROXY_STATE !== 'unknown') return Promise.resolve(PROXY_STATE === 'ok');
    return fetch(PROXY + '/now?lat=32.04&lon=118.77', { method: 'HEAD' })
      .then(function (r) {
        PROXY_STATE = (r.status === 404 || r.status === 405 || r.status === 501) ? 'unavailable' : 'ok';
        return PROXY_STATE === 'ok';
      })
      .catch(function () { return false; });
  }

  function hideOnStaticHost() {
    var box = document.getElementById('he-plugin-simple');
    if (box) box.style.display = 'none';
    var card = qs('.dash-weather');
    if (card) card.style.display = 'none';
    var clock = document.getElementById('hexo_electric_clock');
    if (clock) {
      var wEl = qs('.card-clock-weather', clock);
      if (wEl) wEl.textContent = '';
      var hEl = qs('.card-clock-humidity', clock);
      if (hEl) hEl.textContent = '';
    }
  }

  var lastPayload = null;

  function fetchWeather(loc) {
    busy = true;
    var q = 'lat=' + encodeURIComponent(loc.lat) + '&lon=' + encodeURIComponent(loc.lon);
    fetchJSON(PROXY + '/now?' + q).then(function (nowRaw) {
      return Promise.all([
        Promise.resolve(nowRaw),
        fetchJSON(PROXY + '/daily?' + q + '&days=7').catch(function () { return null; }),
        fetchJSON(PROXY + '/hourly?' + q + '&hours=24').catch(function () { return null; }),
        fetchJSON(PROXY + '/air?' + q).catch(function () { return null; }),
        fetchJSON(PROXY + '/warning?' + q).catch(function () { return null; })
      ]);
    }).then(function (rs) {
      var payload = {
        loc: loc,
        now: normalizeNow(rs[0]),
        daily: normalizeDaily(rs[1]),
        hourly: normalizeHourly(rs[2]),
        air: normalizeAir(rs[3]),
        warning: normalizeWarning(rs[4])
      };
      if (!payload.now) {
        recordErr('BAD_NOW', new Error('bad now payload :: raw=' + JSON.stringify(rs[0]).slice(0, 300)));
        throw new Error('bad now payload');
      }
      lastPayload = payload;
      try {
        renderAll(payload);
      } catch (renderErr) {
        recordErr('RENDER', renderErr);
        throw renderErr;
      }
    }).catch(function (err) {
      recordErr('FETCH', err);
      renderFetchError(loc);
    }).then(function () { busy = false; });
  }

  function start() {
    if (busy) return;
    probeProxy().then(function (available) {
      if (!available) { hideOnStaticHost(); return; }

      if (USE_MOCK) {
        var mock = buildMock();
        lastPayload = mock;
        renderAll(mock);
        return;
      }

      var cached = readLoc();
      if (cached) { fetchWeather(cached); return; }

      renderLocating();
      autoLocate().then(function (g) {
        if (!g) { renderNoLocation(); return; }
        writeLoc(g, 'auto');
        fetchWeather(g);
      });
    });
  }

  // ---------- 首页手动搜索（仅 .dash-weather） ----------
  var searchTimer = null;
  function closeAllResults() {
    qsa('.dash-weather__results').forEach(function (ul) { ul.innerHTML = ''; });
    qsa('.dash-weather__search.open').forEach(function (wrap) { wrap.classList.remove('open'); });
  }

  function toggleSearch(card) {
    var wrap = qs('.dash-weather__search', card);
    if (!wrap) return;
    var open = wrap.classList.toggle('open');
    var input = qs('.dash-weather__search-input', wrap);
    var ul = qs('.dash-weather__results', wrap);
    if (open) {
      if (input) { input.value = ''; input.focus(); }
    } else if (ul) { ul.innerHTML = ''; }
  }

  function scheduleSearch(card, val) {
    val = (val || '').trim();
    var ul = qs('.dash-weather__results', card);
    if (!ul) return;
    if (searchTimer) clearTimeout(searchTimer);
    if (!val) { ul.innerHTML = ''; return; }
    searchTimer = setTimeout(function () {
      fetchJSON(PROXY + '/city?q=' + encodeURIComponent(val)).then(function (data) {
        var list = (data && Array.isArray(data.location)) ? data.location.slice(0, 6) : [];
        ul._list = list;
        if (!list.length) {
          ul.innerHTML = '<li class="dash-weather__result-empty">无匹配城市</li>';
          return;
        }
        ul.innerHTML = list.map(function (g, i) {
          var sub = [g.adm2, g.adm1].filter(Boolean).join(' · ');
          return '<li class="dash-weather__result-item" data-i="' + i + '">' +
            '<span class="dash-weather__result-name">' + g.name + '</span>' +
            (sub ? '<span class="dash-weather__result-sub">' + sub + '</span>' : '') +
          '</li>';
        }).join('');
      }).catch(function () {
        ul.innerHTML = '<li class="dash-weather__result-empty">搜索失败，请重试</li>';
      });
    }, 300);
  }

  function chooseCity(item) {
    var card = item.closest('.dash-weather');
    if (!card) return;
    var ul = qs('.dash-weather__results', card);
    var list = (ul && ul._list) || [];
    var g = list[Number(item.getAttribute('data-i'))];
    if (!g) return;
    var loc = { id: g.id, name: g.name, lat: Number(g.lat), lon: Number(g.lon), source: 'manual' };
    writeLoc(loc, 'manual');
    closeAllResults();
    fetchWeather(loc);
  }

  function resetAndLocate() {
    clearLoc();
    closeAllResults();
    start();
  }

  function bindInteractions() {
    if (window.__BIKO_WX_BIND__) return;
    window.__BIKO_WX_BIND__ = true;

    document.addEventListener('click', function (e) {
      var retry = e.target.closest && e.target.closest('[data-wx-retry]');
      if (retry) { e.preventDefault(); start(); return; }

      var btn = e.target.closest && e.target.closest('[data-wx]');
      if (btn) {
        var card = btn.closest('.dash-weather');
        var kind = btn.getAttribute('data-wx');
        if (kind === 'search' && card) toggleSearch(card);
        else if (kind === 'locate' && card) resetAndLocate();
        return;
      }
      var item = e.target.closest && e.target.closest('.dash-weather__result-item');
      if (item) { chooseCity(item); return; }
      if (!(e.target.closest && e.target.closest('.dash-weather__search'))) closeAllResults();
    });

    document.addEventListener('input', function (e) {
      var input = e.target.closest && e.target.closest('.dash-weather__search-input');
      if (!input) return;
      scheduleSearch(input.closest('.dash-weather'), input.value);
    });

    document.addEventListener('focusout', function (e) {
      if (e.target.closest && e.target.closest('.dash-weather__search-input')) {
        setTimeout(closeAllResults, 180);
      }
    });
  }

  // ---------- Mock（仅本地目视，线上 false） ----------
  function buildMock() {
    return {
      loc: { name: '南京', source: 'auto' },
      now: { code: '101', text: '多云', temp: 18, feels: 17, humidity: 46, windScale: 2, windCompass: 'ne' },
      daily: [
        { label: '今天', code: '101', tMax: 22, tMin: 13, pop: 10 },
        { label: '明天', code: '102', tMax: 24, tMin: 14, pop: 0 },
        { label: '周四', code: '305', tMax: 21, tMin: 15, pop: 60 },
        { label: '周五', code: '104', tMax: 20, tMin: 14, pop: 20 },
        { label: '周六', code: '101', tMax: 23, tMin: 15, pop: 5 },
        { label: '周日', code: '103', tMax: 25, tMin: 16, pop: 0 },
        { label: '周一', code: '305', tMax: 19, tMin: 12, pop: 45 }
      ],
      hourly: [
        { label: '现在', code: '101', temp: 18 },
        { label: '10:00', code: '101', temp: 19 },
        { label: '11:00', code: '102', temp: 20 },
        { label: '12:00', code: '102', temp: 21 }
      ],
      air: { aqi: 45, category: '优', color: 'rgba(76,175,80,1,.9)', pollutant: 'PM 10' },
      warning: false
    };
  }

  // ---------- 启动 ----------
  bindInteractions();
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('pjax:complete', function () { setTimeout(start, 300); });
})();

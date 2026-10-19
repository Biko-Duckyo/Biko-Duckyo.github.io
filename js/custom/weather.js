// ======================================================
// 顶栏左侧天气组件（和风天气 QWeather · 同源代理版）
// 显示：天气图标 + 温度 + 天气状况 + 空气质量 + 预警
// 安全说明：API Key 与专属 Host 均保存在服务端（functions/api/weather），
//           前端只请求本站同源 /api/weather/*，源码中不再出现任何密钥。
// 定位策略：优先浏览器 Geolocation（需用户授权）→ 失败则回退默认城市，
//           不再把访客 IP 交给第三方定位服务，仅用坐标经代理反查城市。
//
// 用到的 4 个和风接口（全部经同源代理转发）：
//   1) GeoAPI      /api/weather/city?q=lon,lat  → 用浏览器坐标反查城市（在用！）
//   2) 实时天气     /api/weather/now?loc=ID       → 温度 + 天气图标 + 天气文字
//   3) 空气质量     /api/weather/air?loc=ID       → 末尾 AQI 等级（优/良/轻度…）
//   4) 气象预警     /api/weather/warning?loc=ID   → 有预警时补一个橙色 ⚠️
// 说明：GeoAPI 并非「没用到的」，浏览器定位拿到经纬度后必须经它反查 locationId，
//       ／now 等接口只接受 locationId，不接受裸坐标。
// ======================================================
(function () {
  // ====== 配置区 ======
  var PROXY = '/api/weather';            // 同源代理前缀（Key 在服务端）
  var DEFAULT_LOCATION = '101190101';    // 兜底：南京
  var DEFAULT_CITY = '南京';
  var LOCATION_CACHE_KEY = 'biko-weather-loc';
  var LOCATION_CACHE_TTL = 6 * 60 * 60 * 1000; // 定位结果缓存 6 小时，避免反复弹权限
  // ====================

  // 和风天气 code → FontAwesome 图标
  var ICON_MAP = {
    '100': 'sun',      '150': 'sun',
    '101': 'cloud-sun','151': 'cloud-sun','152': 'cloud-sun','153': 'cloud-sun',
    '102': 'cloud-sun','103': 'cloud-sun',
    '104': 'cloud',
    '300': 'cloud-showers-heavy','301': 'cloud-showers-heavy',
    '302': 'bolt','303': 'bolt','304': 'bolt',
    '305': 'cloud-showers-heavy','306': 'cloud-showers-heavy','307': 'cloud-showers-heavy','308': 'cloud-showers-heavy',
    '309': 'cloud-sun-rain','310': 'cloud-showers-heavy','311': 'cloud-showers-heavy','312': 'cloud-showers-heavy',
    '313': 'cloud-showers-heavy','314': 'cloud-showers-heavy','315': 'cloud-showers-heavy','316': 'cloud-showers-heavy',
    '317': 'cloud-showers-heavy','318': 'cloud-showers-heavy',
    '399': 'cloud-showers-heavy',
    '400': 'snowflake','401': 'snowflake','402': 'snowflake','403': 'snowflake',
    '404': 'cloud-meatball','405': 'cloud-meatball','406': 'cloud-meatball','407': 'cloud-meatball',
    '408': 'snowflake','409': 'snowflake','410': 'cloud-showers-heavy',
    '499': 'snowflake',
    '500': 'smog','501': 'smog','502': 'smog','503': 'smog','504': 'smog','507': 'smog','508': 'smog',
    '509': 'smog','510': 'smog','511': 'smog','512': 'smog','513': 'smog','514': 'smog','515': 'smog',
    '900': 'thermometer-empty','901': 'temperature-low','999': 'truck'
  };

  var AQI_MAP = [
    { max: 50,  label: '优',   color: '#4caf50' },
    { max: 100, label: '良',   color: '#ffc107' },
    { max: 150, label: '轻度', color: '#ff9800' },
    { max: 200, label: '中度', color: '#f44336' },
    { max: 300, label: '重度', color: '#9c27b0' },
    { max: 9999,label: '严重', color: '#795548' }
  ];

  // 8s 超时 + 统一错误抛出的 JSON 请求
  function fetchJSON(url) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 8000) : null;
    return fetch(url, controller ? { signal: controller.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (timer) clearTimeout(timer);
        if (data && data.error) throw new Error(data.error);
        return data;
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  function readCachedLocation() {
    try {
      var raw = window.localStorage.getItem(LOCATION_CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.id || Date.now() - parsed.ts > LOCATION_CACHE_TTL) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function writeCachedLocation(loc) {
    try {
      window.localStorage.setItem(LOCATION_CACHE_KEY,
        JSON.stringify({ id: loc.locationId, name: loc.cityName, ts: Date.now() }));
    } catch (e) {}
  }

  // 用经纬度经代理反查城市（geo/v2/city/lookup 支持 "lon,lat"）
  function lookupByCoords(lon, lat) {
    return fetchJSON(PROXY + '/city?q=' + encodeURIComponent(lon.toFixed(2) + ',' + lat.toFixed(2)))
      .then(function (geoData) {
        if (geoData.code === '200' && geoData.location && geoData.location[0]) {
          return { locationId: geoData.location[0].id, cityName: geoData.location[0].name };
        }
        throw new Error('geo lookup failed');
      });
  }

  // 浏览器定位（用户授权）→ 反查城市；任何失败都回退默认城市，绝不外发 IP
  function locate() {
    var cached = readCachedLocation();
    if (cached) return Promise.resolve({ locationId: cached.id, cityName: cached.name, fallback: false });

    return new Promise(function (resolve) {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        function (pos) { resolve(pos.coords); },
        function () { resolve(null); },
        { timeout: 6000, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false }
      );
    }).then(function (coords) {
      if (!coords) return null;
      return lookupByCoords(coords.longitude, coords.latitude).catch(function () { return null; });
    }).then(function (loc) {
      if (loc) {
        writeCachedLocation(loc);
        return { locationId: loc.locationId, cityName: loc.cityName, fallback: false };
      }
      // 定位被拒 / 失败：回退默认城市，并标记 fallback 以便给出提示
      return { locationId: DEFAULT_LOCATION, cityName: DEFAULT_CITY, fallback: true };
    });
  }

  function render(data) {
    var box = document.getElementById('he-plugin-simple');
    if (!box) return;
    var now = data.now;
    var icon = ICON_MAP[now.icon] || 'cloud';
    var aqiHtml = '';
    if (data.aqi !== null && data.aqi !== undefined) {
      var level = AQI_MAP.find(function (a) { return data.aqi <= a.max; });
      aqiHtml = '<span class="bn-aqi" style="color:' + level.color + ';">· ' + level.label + '</span>';
    }
    var warnHtml = data.warning ? ' <i class="fas fa-exclamation-triangle bn-warn" title="当前有气象预警"></i>' : '';
    // 定位（城市）+ 天气图标 + 温度 + 状况 + 空气质量
    var cityTitle = data.fallback ? ' title="未能获取定位，显示默认城市"' : '';
    var cityHtml = '<span class="bn-city" title="' + data.cityName + '"><i class="fas fa-location-dot"></i> ' + data.cityName + '</span>';
    // 常规态只露图标（由 CSS 的 .bn-weather 收起控制），
    // 鼠标悬停顶栏左区时 .bn-wx-detail 展开显示：温度 / 状况 / AQI / 预警
    box.innerHTML =
      '<span class="bn-wx-icon" aria-hidden="true"><i class="fas fa-' + icon + '"></i></span>' +
      '<span class="bn-wx-detail">' +
        cityHtml +
        '<span class="bn-wx"><i class="fas fa-' + icon + '"></i> ' + now.temp + '° ' + now.text + '</span>' +
        aqiHtml + warnHtml +
      '</span>';

    // 同时更新侧边栏时钟卡片上的天气和地点
    var clockCard = document.getElementById('hexo_electric_clock');
    if (clockCard) {
      var weekMap2 = { MON: '周一', TUE: '周二', WED: '周三', THU: '周四', FRI: '周五', SAT: '周六', SUN: '周日' };
      var dateEl = clockCard.querySelector('.card-clock-clockdate');
      if (dateEl) {
        var txt = dateEl.textContent;
        for (var en in weekMap2) { txt = txt.replace(en, weekMap2[en]); }
        dateEl.textContent = txt;
      }
      var weatherEl = clockCard.querySelector('.card-clock-weather');
      if (weatherEl) weatherEl.textContent = ' ' + now.text + ' ' + now.temp + '°C';
      var locEl = clockCard.querySelector('.card-clock-location');
      if (locEl) locEl.textContent = ' ' + data.cityName;
    }
  }

  function renderError() {
    var box = document.getElementById('he-plugin-simple');
    if (!box) return;
    var txt = '<span class="bn-wx-icon" aria-hidden="true"><i class="fas fa-cloud"></i></span>' +
      '<span class="bn-wx-detail"><span class="bn-city bn-wx-error" title="点击重试">' +
      '<i class="fas fa-rotate-right"></i> 天气暂不可用</span></span>';
    box.innerHTML = txt;
    var retry = box.querySelector('.bn-wx-error');
    if (retry) {
      retry.style.cursor = 'pointer';
      retry.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        box.innerHTML = '';
        loadWeather();
      });
    }
  }

  var loading = false;
  // ------------------------------------------------------------
  // 代理可用性探测（只在 GitHub Pages 上发生一次）
  // 为什么需要：functions/ 目录是 Cloudflare Pages Functions 专属约定，
  //   GitHub Pages 不会执行它，/api/weather/* 会直接返回 404。
  //   本站按 docs/deploy/cloudflare-pages.md 的流程可能部署在 Cloudflare Pages，
  //   也可能回落到 GitHub Pages 裸托管——两种环境下脚本行为必须都是对的：
  //     · 可用   → 正常渲染天气
  //     · 不可用 → 首屏探测一次失败后就不再重试，避免每次 pjax 换页
  //                都再打 3 个必然 404 的请求（控制台刷红 + 白等 8s 超时）
  // ------------------------------------------------------------
  var PROXY_STATE = 'unknown'; // unknown | ok | unavailable

  function probeProxy() {
    if (PROXY_STATE !== 'unknown') return Promise.resolve(PROXY_STATE === 'ok');
    return fetch(PROXY + '/now?loc=' + DEFAULT_LOCATION, { method: 'HEAD' })
      .then(function (r) {
        // 404/405/501 说明这个路径根本不是 Functions 路由；
        // 其它状态（含 401/500）说明路由存在，只是这次调用有问题，仍标为可用。
        PROXY_STATE = (r.status === 404 || r.status === 405 || r.status === 501) ? 'unavailable' : 'ok';
        return PROXY_STATE === 'ok';
      })
      .catch(function () {
        // 网络层失败（断网/被拦）不永久拉黑，下次换页再试
        return false;
      });
  }

  function loadWeather() {
    if (loading) return;               // 防止 pjax 重复触发导致并发请求
    var box = document.getElementById('he-plugin-simple');
    if (!box) return;
    // 已确认代理不存在：不留占位、不请求、也不显示报错，直接静默隐藏组件
    if (PROXY_STATE === 'unavailable') {
      box.style.display = 'none';
      return;
    }
    loading = true;
    // 加载态占位，避免出现"空胶囊"看起来像 UI 损坏
    if (!box.childElementCount) {
      box.innerHTML = '<span class="bn-wx-icon" aria-hidden="true"><i class="fas fa-spinner fa-spin"></i></span>' +
        '<span class="bn-wx-detail"><span class="bn-city" style="opacity:.55;">定位中…</span></span>';
    }

    probeProxy().then(function (available) {
      if (!available) {
        // 静态托管环境：收起容器，不再浪费一次定位授权与 3 个 404 请求
        box.style.display = 'none';
        return;
      }
      return locate().then(function (loc) {
        return Promise.all([
          fetchJSON(PROXY + '/now?loc=' + encodeURIComponent(loc.locationId)),
          fetchJSON(PROXY + '/air?loc=' + encodeURIComponent(loc.locationId)).catch(function () { return {}; }),
          fetchJSON(PROXY + '/warning?loc=' + encodeURIComponent(loc.locationId)).catch(function () { return {}; })
        ]).then(function (results) {
          var nowData = results[0];
          var airData = results[1] || {};
          var warnData = results[2] || {};
          if (nowData.code !== '200') throw new Error('weather: ' + nowData.code);
          render({
            now: nowData.now,
            aqi: airData.code === '200' ? parseInt(airData.now.aqi) : null,
            warning: warnData.code === '200' && warnData.warning && warnData.warning.length > 0,
            cityName: loc.cityName,
            fallback: loc.fallback
          });
        });
      }).catch(function () {
        renderError();
      });
    }).then(function () {
      loading = false;
    });
  }

  if (document.readyState !== 'loading') loadWeather();
  else document.addEventListener('DOMContentLoaded', loadWeather);
  document.addEventListener('pjax:complete', function () { setTimeout(loadWeather, 300); });
})();

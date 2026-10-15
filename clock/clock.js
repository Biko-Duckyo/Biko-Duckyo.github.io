// ======================================================
// Butterfly 侧边栏电子钟 3.0（和风天气 + FontAwesome 图标版 · 同源代理）
// 安全说明：API Key 保存在服务端（functions/api/weather），前端只请求同源 /api/weather/*；
//           不再把访客 IP 交给第三方定位服务（原先的 ipapi.co 已移除）。
// ======================================================
(function () {
  var PROXY = '/api/weather';            // 同源代理前缀（Key 在服务端）
  var DEFAULT_LOCATION = '101190101';
  var LOCATION_CACHE_KEY = 'biko-weather-loc';
  var LOCATION_CACHE_TTL = 6 * 60 * 60 * 1000;

  // 和风天气 code → FontAwesome 图标
  var ICON_MAP = {
    '100': 'sun', '150': 'sun',
    '101': 'cloud-sun', '151': 'cloud-sun', '152': 'cloud-sun', '153': 'cloud-sun',
    '102': 'cloud-sun', '103': 'cloud-sun',
    '104': 'cloud',
    '300': 'cloud-showers-heavy', '301': 'cloud-showers-heavy',
    '302': 'bolt', '303': 'bolt', '304': 'bolt',
    '305': 'cloud-showers-heavy', '306': 'cloud-showers-heavy',
    '309': 'cloud-sun-rain', '310': 'cloud-showers-heavy',
    '400': 'snowflake', '401': 'snowflake',
    '500': 'smog', '501': 'smog',
    '999': 'truck'
  };

  function initClock() {
    var clock_box = document.getElementById('hexo_electric_clock');
    if (!clock_box) return;

    // 加载动画
    clock_box.innerHTML = '<img id="card-clock-loading" src="/clock/loading.gif" style="height:120px;width:100%;" />';

    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    function updateTime() {
      var cd = new Date();
      var h = cd.getHours();
      var time = zeroPadding(h, 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
      var date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
      var ampm = h >= 12 ? 'PM' : 'AM';

      var tEl = document.getElementById('card-clock-time');
      var dEl = document.getElementById('card-clock-clockdate');
      var aEl = document.getElementById('card-clock-dackorlight');
      if (tEl) tEl.textContent = time;
      if (dEl) dEl.textContent = date;
      if (aEl) aEl.textContent = ampm;
    }

    function zeroPadding(num, digit) {
      var zero = '';
      for (var i = 0; i < digit; i++) zero += '0';
      return (zero + num).slice(-digit);
    }

    // 读取缓存的定位结果（weather.js 与本文件共用同一缓存键）
    function readCachedLocation() {
      try {
        var raw = window.localStorage.getItem(LOCATION_CACHE_KEY);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        if (!parsed || !parsed.id || Date.now() - parsed.ts > LOCATION_CACHE_TTL) return null;
        return parsed;
      } catch (e) { return null; }
    }

    function fetchJSON(url) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (data) {
        if (data && data.error) throw new Error(data.error);
        return data;
      });
    }

    // 浏览器定位（授权）→ 经代理反查城市；失败回退默认城市，不外发 IP
    function locate() {
      var cached = readCachedLocation();
      if (cached) return Promise.resolve({ id: cached.id, name: cached.name });
      return new Promise(function (resolve) {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          function (pos) { resolve(pos.coords); },
          function () { resolve(null); },
          { timeout: 6000, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false }
        );
      }).then(function (coords) {
        if (!coords) return null;
        var q = coords.longitude.toFixed(2) + ',' + coords.latitude.toFixed(2);
        return fetchJSON(PROXY + '/city?q=' + encodeURIComponent(q))
          .then(function (geo) {
            if (geo.code === '200' && geo.location && geo.location[0]) {
              var loc = { id: geo.location[0].id, name: geo.location[0].name };
              try {
                window.localStorage.setItem(LOCATION_CACHE_KEY,
                  JSON.stringify({ id: loc.id, name: loc.name, ts: Date.now() }));
              } catch (e) {}
              return loc;
            }
            return null;
          })
          .catch(function () { return null; });
      }).then(function (loc) {
        return loc || { id: DEFAULT_LOCATION, name: '南京' };
      });
    }

    // 和风天气：定位 + 实时天气（全部走同源代理，无密钥泄漏）
    locate()
      .then(function (loc) {
        return fetchJSON(PROXY + '/now?loc=' + encodeURIComponent(loc.id))
          .then(function (w) {
            if (w.code !== '200') throw new Error('weather error');
            var icon = ICON_MAP[w.now.icon] || 'cloud';
            clock_box.innerHTML =
              '<div class="clock-row">' +
              '  <span class="card-clock-clockdate"></span>' +
              '  <span class="card-clock-weather"><i class="fas fa-' + icon + '"></i> ' + w.now.text + ' ' + w.now.temp + '°C</span>' +
              '  <span class="card-clock-humidity">💧' + w.now.humidity + '%</span>' +
              '</div>' +
              '<div class="clock-row">' +
              '  <span id="card-clock-time" class="card-clock-time"></span>' +
              '</div>' +
              '<div class="clock-row">' +
              '  <span class="card-clock-location">' + loc.name + '</span>' +
              '  <span id="card-clock-dackorlight" class="card-clock-dackorlight"></span>' +
              '</div>';
            setInterval(updateTime, 1000);
            updateTime();
          });
      })
      .catch(function () {
        // 失败兜底：只显示时间
        clock_box.innerHTML =
          '<div class="clock-row">' +
          '  <span id="card-clock-clockdate" class="card-clock-clockdate"></span>' +
          '  <span class="card-clock-weather">--</span>' +
          '  <span class="card-clock-humidity"></span>' +
          '</div>' +
          '<div class="clock-row">' +
          '  <span id="card-clock-time" class="card-clock-time"></span>' +
          '</div>' +
          '<div class="clock-row">' +
          '  <span class="card-clock-location">南京</span>' +
          '  <span id="card-clock-dackorlight" class="card-clock-dackorlight"></span>' +
          '</div>';
        setInterval(updateTime, 1000);
        updateTime();
      });
  }

  if (document.readyState !== 'loading') initClock();
  else document.addEventListener('DOMContentLoaded', initClock);
  document.addEventListener('pjax:complete', function () { setTimeout(initClock, 500); });
})();

// ======================================================
// Butterfly 侧边栏电子钟 3.0（和风天气 + FontAwesome 图标版）
// ======================================================
(function () {
  var QWEATHER_KEY = '78d33f3239ad4ae0a55f89a9d2a9f99b';
  var API_HOST = 'https://nt54dwdrmw.re.qweatherapi.com';
  var DEFAULT_LOCATION = '101190101';

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

    // 和风天气：IP 定位 + 实时天气
    fetch('https://ipapi.co/json/')
      .then(function (r) { return r.json(); })
      .then(function (ipData) {
        var cityName = ipData.city || 'Nanjing';
        return fetch(API_HOST + '/geo/v2/city/lookup?location=' + encodeURIComponent(cityName) + '&key=' + QWEATHER_KEY)
          .then(function (r) { return r.json(); })
          .then(function (geo) {
            var locId = (geo.code === '200' && geo.location && geo.location[0]) ? geo.location[0].id : DEFAULT_LOCATION;
            var city = (geo.code === '200' && geo.location && geo.location[0]) ? geo.location[0].name : '南京';
            return fetch(API_HOST + '/v7/weather/now?location=' + locId + '&key=' + QWEATHER_KEY)
              .then(function (r) { return r.json(); })
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
                  '  <span class="card-clock-ip">' + (ipData.ip || '127.0.0.1') + '</span>' +
                  '  <span class="card-clock-location">' + city + '</span>' +
                  '  <span id="card-clock-dackorlight" class="card-clock-dackorlight"></span>' +
                  '</div>';
                setInterval(updateTime, 1000);
                updateTime();
              });
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
          '  <span class="card-clock-ip"></span>' +
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

// ======================================================
// 顶栏左侧天气组件（和风天气 QWeather）
// 根据访问者 IP 自动定位城市，显示：天气图标 + 温度 + 天气状况 + 空气质量 + 预警
// ======================================================
(function () {
  // ====== 配置区 ======
  var QWEATHER_KEY = '78d33f3239ad4ae0a55f89a9d2a9f99b';
  var API_HOST = 'https://nt54dwdrmw.re.qweatherapi.com';
  var DEFAULT_LOCATION = '101190101'; // 兜底：南京（IP 定位失败时用）
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

  function fetchJSON(url) {
    return fetch(url).then(function (r) { return r.json(); });
  }

  // 根据访问者 IP 自动定位城市，返回 { locationId, cityName }
  // 先用 ip-api.com 拿城市名，再用和风 city/lookup 查 LocationID
  function locateByIP() {
    return fetchJSON('https://ipapi.co/json/')
      .then(function (ipData) {
        var cityName = ipData.city || 'Nanjing';
        return fetchJSON(API_HOST + '/geo/v2/city/lookup?location=' + encodeURIComponent(cityName) + '&key=' + QWEATHER_KEY)
          .then(function (geoData) {
            if (geoData.code === '200' && geoData.location && geoData.location[0]) {
              return { locationId: geoData.location[0].id, cityName: geoData.location[0].name };
            }
            throw new Error('geo lookup failed');
          });
      })
      .catch(function () {
        return { locationId: DEFAULT_LOCATION, cityName: '南京' };
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
      aqiHtml = '<span style="color:' + level.color + ';margin-left:6px;font-size:12px;">· ' + level.label + '</span>';
    }
    var warnHtml = data.warning ? ' <i class="fas fa-exclamation-triangle" style="color:#ff5722;margin-left:4px;" title="当前有气象预警"></i>' : '';
    var cityHtml = '<span style="opacity:.7;margin:0 4px;">' + data.cityName + '</span>';
    box.innerHTML =
      '<i class="fas fa-' + icon + '" style="margin-right:6px;"></i>' +
      '<span>' + now.temp + '° ' + now.text + '</span>' +
      cityHtml + aqiHtml + warnHtml;

    // 同时更新侧边栏时钟卡片上的天气和地点
    var clockCard = document.getElementById('hexo_electric_clock');
    if (clockCard) {
      // 星期英文转中文
      var weekMap = { MON: '周一', TUE: '周二', WED: '周三', THU: '周四', FRI: '周五', SAT: '周六', SUN: '周日' };
      var dateEl = clockCard.querySelector('.card-clock-clockdate');
      if (dateEl) {
        var txt = dateEl.textContent;
        for (var en in weekMap) { txt = txt.replace(en, weekMap[en]); }
        dateEl.textContent = txt;
      }
      // 天气：和风数据覆盖
      var weatherEl = clockCard.querySelector('.card-clock-weather');
      if (weatherEl) weatherEl.textContent = ' ' + now.text + ' ' + now.temp + '°C';
      // 地点：和风城市名覆盖
      var locEl = clockCard.querySelector('.card-clock-location');
      if (locEl) locEl.textContent = ' ' + data.cityName;
    }
  }

  function loadWeather() {
    locateByIP().then(function (loc) {
      var q = 'location=' + loc.locationId + '&key=' + QWEATHER_KEY;
      return Promise.all([
        fetchJSON(API_HOST + '/v7/weather/now?' + q),
        fetchJSON(API_HOST + '/v7/air/now?' + q),
        fetchJSON(API_HOST + '/v7/warning/now?' + q)
      ]).then(function (results) {
        var nowData = results[0];
        var airData = results[1];
        var warnData = results[2];
        if (nowData.code !== '200') throw new Error('weather: ' + nowData.code);
        render({
          now: nowData.now,
          aqi: airData.code === '200' ? parseInt(airData.now.aqi) : null,
          warning: warnData.code === '200' && warnData.warning && warnData.warning.length > 0,
          cityName: loc.cityName
        });
      });
    }).catch(function () {
      var box = document.getElementById('he-plugin-simple');
      if (box) box.innerHTML = '<span style="opacity:.6;">天气暂不可用</span>';
    });
  }

  if (document.readyState !== 'loading') loadWeather();
  else document.addEventListener('DOMContentLoaded', loadWeather);
  document.addEventListener('pjax:complete', function () { setTimeout(loadWeather, 300); });
})();

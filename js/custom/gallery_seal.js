/* ============================================================
 * Biko · 相册密文封装（门页与墙页共用）
 * ------------------------------------------------------------
 * 为什么单独一个文件：
 *   门是 layout:false 独立页，墙走主题管线。两边都要「取密文 → 用暗号
 *   派生密钥 → 解密」，格式必须只有一份实现，否则改迭代次数 / 换存储键
 *   时必然漏掉一边，表现是「在这一页能解、换一页就提示暗号错」。
 *
 * 加密格式（与旧独立页完全一致，同一暗号继续可用）：
 *   明文 = base64( JSON{ v:1, salt:b64(16B), iv:b64(12B), ct:b64 } )
 *
 * 会话记忆（两层，缺一不可）：
 *   · 密钥  sessionStorage['biko-gallery-key']  → 刷新后不必重新输暗号
 *   · 明文  sessionStorage['biko-gallery-data'] → 沿用旧页「本次会话无需再输」，
 *           同时让 pjax 来回切换不产生重复解密
 *   sessionStorage 关掉标签页即清空；拿不到（隐私模式）就只留内存一份。
 *
 * 用法：
 *   var seal = window.GallerySeal.create()   // 每个页面实例一份
 *   seal.fetch()                  → Promise<envelope>
 *   seal.decryptWith(keyBytes)    → Promise<data>
 *   seal.open(pass)               → Promise<data>（连带缓存密钥与明文）
 *   seal.getData() / seal.putData(data)
 *   seal.normalize(data)          → { albums:[...] }
 * ============================================================ */
(function (global) {
  'use strict'

  var SOURCE = '/galleryGroup/album.html'
  var ITER = 600000
  var KEY_STORE = 'biko-gallery-key'
  var DATA_STORE = 'biko-gallery-data'
  var MAX_AGE = 12 * 3600 * 1000    // 会话明文最多留 12 小时，过期重解一次

  function b64ToBytes (s) {
    var b = atob(s)
    var u = new Uint8Array(b.length)
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i)
    return u
  }

  function bytesToHex (bytes) {
    var s = ''
    for (var i = 0; i < bytes.length; i++) s += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16)
    return s
  }

  function hexToBytes (hex) {
    if (!hex || hex.length % 2) return null
    var out = new Uint8Array(hex.length / 2)
    for (var i = 0; i < out.length; i++) {
      var n = parseInt(hex.substr(i * 2, 2), 16)
      if (isNaN(n)) return null
      out[i] = n
    }
    return out
  }

  /* sessionStorage 可能被禁用（隐私模式 / 站点数据阻止）：一律降级成内存 */
  function recall (key) {
    try { return sessionStorage.getItem(key) } catch (e) { return null }
  }
  function remember (key, value) {
    try {
      if (value == null) sessionStorage.removeItem(key)
      else sessionStorage.setItem(key, value)
    } catch (e) { /* 忽略 */ }
  }

  /* 站内绝对路径：用 document.baseURI 解析，兼容子路径部署（root: 后可能带子目录） */
  function absUrl (src) {
    if (!src) return ''
    try { return new URL(String(src), document.baseURI).href } catch (e) { return String(src) }
  }

  function create () {
    var token = null
    var keyBytes = null

    function fetchToken () {
      if (token) return Promise.resolve(token)
      if (!global.fetch) return Promise.reject(new Error('no-fetch'))
      return fetch(SOURCE, { credentials: 'same-origin', cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status)
          return res.text()
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html')
          var el = doc.getElementById('gal-data')
          if (!el) throw new Error('missing payload')
          /* 信封本身是 base64(JSON)，JSON 里又套着三段 base64：
             外层用 ASCII 安全的 atob 直接解即可（纯 ASCII，无需 UTF-8 补救） */
          var meta = JSON.parse(atob((el.textContent || '').trim()))
          if (!meta || !meta.salt || !meta.iv || !meta.ct) throw new Error('bad payload')
          token = meta
          return meta
        })
    }

    function deriveKey (raw, salt, usage) {
      var subtle = global.crypto && global.crypto.subtle
      if (!subtle) return Promise.reject(new Error('no-webcrypto'))
      return subtle.importKey('raw', raw, 'PBKDF2', false, ['deriveKey'])
        .then(function (base) {
          return subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-256' },
            base,
            { name: 'AES-GCM', length: 256 },
            false, usage)
        })
    }

    /* 解密：返回明文 JSON 对象 */
    function decryptWith (raw, meta) {
      var iv = b64ToBytes(meta.iv)
      var ct = b64ToBytes(meta.ct)
      return deriveKey(raw, b64ToBytes(meta.salt), ['decrypt'])
        .then(function (key) {
          return global.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct)
        })
        .then(function (buf) {
          return JSON.parse(new TextDecoder().decode(buf))
        })
    }

    /* 用明文暗号解一次（连带缓存密钥 + 明文）；失败会 reject，由调用方决定提示 */
    function open (pass) {
      return fetchToken()
        .then(function (meta) {
          keyBytes = new TextEncoder().encode(pass)
          remember(KEY_STORE, bytesToHex(keyBytes))
          return decryptWith(keyBytes, meta)
        })
        .then(function (data) {
          putData(data)
          return data
        })
    }

    function setKey (bytes) { keyBytes = bytes }
    function getKey () { return keyBytes }

    function getData () {
      var saved = recall(DATA_STORE)
      if (!saved) return null
      try {
        var pack = JSON.parse(saved)
        if (pack && pack.data && Date.now() - (pack.t || 0) < MAX_AGE) return pack.data
      } catch (e) { /* 坏了当没有 */ }
      remember(DATA_STORE, null)
      return null
    }
    function putData (data) {
      remember(DATA_STORE, JSON.stringify({ t: Date.now(), data: data }))
    }

    /* 把任意形状的数据规范成 {albums:[...]}，坏数据不至于整页白屏 */
    function normalize (data) {
      var list = data && Array.isArray(data.albums) ? data.albums
        : (Array.isArray(data) ? data : [])
      return list.filter(function (a) { return a && (a.name || (a.photos && a.photos.length)) })
        .map(function (a) {
          var photos = (Array.isArray(a.photos) ? a.photos : []).map(function (p) {
            if (typeof p === 'string') return { src: absUrl(p), thumb: absUrl(p), caption: '' }
            p = p || {}
            return {
              src: absUrl(p.src || p.url || ''),
              thumb: absUrl(p.thumb || p.thumbnail || p.src || p.url || ''),
              caption: p.caption || p.title || ''
            }
          }).filter(function (p) { return !!p.src })
          return {
            name: a.name || '未命名相册',
            date: a.date || '',
            desc: a.desc || a.description || '',
            cover: absUrl(a.cover || (photos[0] && photos[0].thumb) || ''),
            photos: photos
          }
        })
    }

    return {
      SOURCE: SOURCE,
      ITER: ITER,
      KEY_STORE: KEY_STORE,
      DATA_STORE: DATA_STORE,
      b64ToBytes: b64ToBytes,
      bytesToHex: bytesToHex,
      hexToBytes: hexToBytes,
      recall: recall,
      remember: remember,
      absUrl: absUrl,
      fetch: fetchToken,
      decryptWith: decryptWith,
      open: open,
      setKey: setKey,
      getKey: getKey,
      getData: getData,
      putData: putData,
      normalize: normalize
    }
  }

  global.GallerySeal = { create: create }
})(window)

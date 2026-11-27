/* ============================================================
 * Biko · 持仓库密文封装（门禁解锁 + 清单解密 + 会话缓存）
 * ------------------------------------------------------------
 * 与追番 anime_seal.js 同一套加密格式：
 *   信封 = base64( JSON{ v:1, salt:b64(16B), iv:b64(12B), ct:b64 } )
 *   密钥 = PBKDF2-SHA256(口令, salt, 600000 次) → AES-GCM-256
 *
 * 页面不放口令：用户输入口令 → 这里派生密钥 → 解 /finance/data/finance.enc.html
 * 里的信封；解不开（口令错 / 密文缺失）就拒绝解锁。
 *
 * 会话记忆两层（与追番一致，关标签清空；隐私模式降级内存）：
 *   · sessionStorage['biko-finance-key']  派生密钥 hex（12h 内刷新免再输、重解一次）
 *   · sessionStorage['biko-finance-data'] 解密后的清单对象（12h 内直接展开）
 *
 * 用法：
 *   var seal = window.FinanceSeal.create()
 *   seal.fetch()                 → Promise<envelope>
 *   seal.decryptWith(keyBytes)   → Promise<data>（data 为解密后的 {data:[...]}）
 *   seal.open(pass)              → Promise<data>（成功连带缓存密钥与明文）
 *   seal.getData() / seal.putData(data)
 * ============================================================ */
(function (global) {
  'use strict'

  var SOURCE = '/finance/data/finance.enc.html'
  var ITER = 600000
  var KEY_STORE = 'biko-finance-key'
  var DATA_STORE = 'biko-finance-data'
  var MAX_AGE = 12 * 3600 * 1000    // 会话明文最多留 12 小时，过期重解

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
    }
    return out
  }

  /* sessionStorage 被禁用（隐私模式 / 站点数据阻止）时降级成内存，不报错 */
  function recall (key) {
    try { return sessionStorage.getItem(key) } catch (e) { return null }
  }
  function remember (key, value) {
    try {
      if (value == null) sessionStorage.removeItem(key)
      else sessionStorage.setItem(key, value)
    } catch (e) { /* 忽略 */ }
  }

  function absUrl (src) {
    if (!src) return ''
    try { return new URL(String(src), document.baseURI).href } catch (e) { return String(src) }
  }

  function create () {
    var keyBytes = null

    function fetchToken () {
      if (!global.fetch) return Promise.reject(new Error('no-fetch'))
      return fetch(SOURCE, { credentials: 'same-origin', cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status)
          return res.text()
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html')
          var el = doc.getElementById('finance-data')
          if (!el) throw new Error('missing payload')
          var meta = JSON.parse(atob((el.textContent || '').trim()))
          if (!meta || !meta.salt || !meta.iv || !meta.ct) throw new Error('bad payload')
          return meta
        })
    }

    function decryptWith (raw, meta) {
      var iv = b64ToBytes(meta.iv)
      var ct = b64ToBytes(meta.ct)
      var subtle = global.crypto && global.crypto.subtle
      return subtle.importKey('raw', raw, 'PBKDF2', false, ['deriveKey'])
        .then(function (base) {
          return subtle.deriveKey(
            { name: 'PBKDF2', salt: b64ToBytes(meta.salt), iterations: ITER, hash: 'SHA-256' },
            base,
            { name: 'AES-GCM', length: 256 },
            false, ['decrypt'])
        })
        .then(function (key) {
          return subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct)
        })
        .then(function (buf) {
          return JSON.parse(new TextDecoder().decode(buf))
        })
    }

    /* 用明文口令解一次（连带缓存密钥 + 明文）；失败 reject，由页面决定提示 */
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
      putData: putData
    }
  }

  global.FinanceSeal = { create: create }
})(window)

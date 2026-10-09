// ======================================================
// 小黑猫 AI 聊天浮窗（接豆包大模型，通过 Cloudflare Worker 中转）
// ======================================================
(function () {
  var WORKER_URL = 'https://biko-chat.superq-q216.workers.dev';

  // 创建聊天 UI
  function injectChatUI() {
    if (document.getElementById('biko-chat-widget')) return;

    var style = document.createElement('style');
    style.textContent = `
      #biko-chat-widget {
        position: fixed; right: 180px; bottom: 100px; z-index: 99998;
        font-family: -apple-system, "PingFang SC", sans-serif;
      }
      #biko-chat-box {
        position: absolute; right: 0; bottom: 0; width: 320px; height: 420px;
        background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.2);
        display: none; flex-direction: column; overflow: hidden;
      }
      #biko-chat-box.open { display: flex; }
      #biko-chat-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: #fff; padding: 12px 16px; font-weight: 600; font-size: 14px;
      }
      #biko-chat-messages {
        flex: 1; overflow-y: auto; padding: 12px; font-size: 13px; line-height: 1.5;
      }
      .biko-msg { margin-bottom: 10px; max-width: 85%; padding: 8px 12px; border-radius: 12px; }
      .biko-msg.user { background: #667eea; color: #fff; margin-left: auto; }
      .biko-msg.bot { background: #f1f3f5; color: #333; }
      .biko-msg.loading { background: #f1f3f5; color: #999; }
      #biko-chat-input-row { display: flex; border-top: 1px solid #eee; }
      #biko-chat-input {
        flex: 1; border: none; padding: 12px; font-size: 13px; outline: none;
      }
      #biko-chat-send {
        border: none; background: #667eea; color: #fff; padding: 0 16px; cursor: pointer;
      }
      @media (max-width: 768px) {
        #biko-chat-box { width: calc(100vw - 40px); right: -10px; }
      }
    `;
    document.head.appendChild(style);

    var widget = document.createElement('div');
    widget.id = 'biko-chat-widget';
    widget.innerHTML = `
      <div id="biko-chat-box">
        <div id="biko-chat-header">🐱 小黑猫 AI</div>
        <div id="biko-chat-messages">
          <div class="biko-msg bot">你好呀，我是小黑猫～有什么可以帮你的吗？</div>
        </div>
        <div id="biko-chat-input-row">
          <input id="biko-chat-input" placeholder="输入问题..." autocomplete="off" />
          <button id="biko-chat-send">发送</button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    document.getElementById('biko-chat-send').onclick = sendMessage;
    document.getElementById('biko-chat-input').onkeydown = function (e) {
      if (e.key === 'Enter') sendMessage();
    };

    // 点击黑猫弹出聊天框
    function bindCatClick() {
      var cat = document.getElementById('live2dcanvas');
      if (cat && !cat.__chatBound) {
        cat.__chatBound = true;
        cat.style.cursor = 'pointer';
        cat.style.zIndex = '999999';
        cat.addEventListener('click', function (e) {
          e.stopPropagation();
          var box = document.getElementById('biko-chat-box');
          if (box) box.classList.toggle('open');
        });
        console.log('黑猫点击已绑定');
      }
    }
    bindCatClick();
    // live2d 加载慢，轮询绑定
    var timer = setInterval(function () {
      bindCatClick();
      if (document.getElementById('live2dcanvas')?.__chatBound) clearInterval(timer);
    }, 1000);
  }

  function sendMessage() {
    var input = document.getElementById('biko-chat-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';

    var messages = document.getElementById('biko-chat-messages');
    var userMsg = document.createElement('div');
    userMsg.className = 'biko-msg user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);

    var loading = document.createElement('div');
    loading.className = 'biko-msg loading';
    loading.textContent = '思考中...';
    messages.appendChild(loading);
    messages.scrollTop = messages.scrollHeight;

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        loading.remove();
        var botMsg = document.createElement('div');
        botMsg.className = 'biko-msg bot';
        botMsg.textContent = data.choices[0].message.content;
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
      })
      .catch(function () {
        loading.remove();
        var err = document.createElement('div');
        err.className = 'biko-msg bot';
        err.textContent = '网络出错了，稍后再试～';
        messages.appendChild(err);
      });
  }

  if (document.readyState !== 'loading') injectChatUI();
  else document.addEventListener('DOMContentLoaded', injectChatUI);
  document.addEventListener('pjax:complete', function () { setTimeout(injectChatUI, 300); });
})();

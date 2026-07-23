/**
 * AI Chat Assistant — Embed Script
 *
 * Injects a floating chat bubble + iframe widget into any webpage.
 * The iframe loads /widget from the same origin as this script,
 * so all API calls are same-origin (no CORS issues).
 *
 * Usage:
 *   <script src="https://your-ai-chat-assistant.edgeone.app/embed.js" async></script>
 *
 * Options (data-* attributes):
 *   data-color    — Accent color (default: #6366f1)
 *   data-position — "bottom-right" (default) or "bottom-left"
 */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__aiAssistantLoaded) return;
  window.__aiAssistantLoaded = true;

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1) return scripts[i];
    }
    return null;
  })();

  var origin = '';
  if (script && script.src) {
    try { origin = new URL(script.src).origin; } catch (e) {}
  }
  if (!origin) return;

  var color = (script && script.getAttribute('data-color')) || '#6366f1';
  var position = (script && script.getAttribute('data-position')) || 'bottom-right';
  var enableMaximize = (script && script.getAttribute('data-maximize')) === 'true';
  var isLeft = position === 'bottom-left';
  var side = isLeft ? 'left' : 'right';

  // ─── Extract page context ────────────────────────────────────────────────
  function getPageContext() {
    var el = document.querySelector('article') || document.querySelector('[role="main"]') || document.querySelector('main') || document.querySelector('.post-content') || document.querySelector('.entry-content');
    var content = el ? el.innerText : document.body.innerText;
    return {
      title: document.title || '',
      url: location.href || '',
      content: (content || '').slice(0, 6000)
    };
  }

  // ─── Styles ──────────────────────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent =
    '#__aa-bubble{position:fixed;bottom:24px;' + side + ':24px;z-index:2147483647;' +
    'width:60px;height:60px;border-radius:50%;' +
    'background:linear-gradient(135deg,' + color + ',' + color + 'dd);' +
    'cursor:pointer;border:none;outline:none;' +
    'box-shadow:0 8px 24px ' + color + '44,0 2px 8px rgba(0,0,0,.1);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:all .3s cubic-bezier(.4,0,.2,1)}' +
    '#__aa-bubble:hover{transform:scale(1.1) translateY(-2px);box-shadow:0 12px 32px ' + color + '55,0 4px 12px rgba(0,0,0,.15)}' +
    '#__aa-bubble:active{transform:scale(.95)}' +
    '#__aa-bubble svg{width:28px;height:28px;fill:#fff;transition:transform .3s}' +
    '#__aa-frame{position:fixed;bottom:100px;' + side + ':24px;z-index:2147483647;' +
    'width:420px;height:640px;max-height:calc(100vh - 120px);max-width:calc(100vw - 48px);' +
    'border:none;border-radius:20px;' +
    'box-shadow:0 24px 64px rgba(0,0,0,.12),0 8px 24px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04);' +
    'opacity:0;transform:translateY(12px) scale(.97);' +
    'transition:opacity .3s cubic-bezier(.4,0,.2,1),transform .3s cubic-bezier(.4,0,.2,1);' +
    'pointer-events:none;background:#fff;overflow:hidden}' +
    '#__aa-frame.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}' +
    '@media(max-width:480px){#__aa-frame{width:100vw;height:100vh;max-height:100vh;' +
    'bottom:0;' + side + ':0;border-radius:0}}' +
    '#__aa-maximize{position:fixed;z-index:2147483648;width:28px;height:28px;border:none;border-radius:6px;background:rgba(0,0,0,.06);cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:1}#__aa-maximize:hover{background:rgba(0,0,0,.12)}#__aa-maximize svg{width:16px;height:16px;fill:#555}#__aa-frame.maximized{width:100vw;height:100vh;bottom:0;left:0;right:0;border-radius:0;max-height:100vh;max-width:100vw}';

  document.head.appendChild(css);

  // ─── Bubble ──────────────────────────────────────────────────────────────
  var bubble = document.createElement('button');
  bubble.id = '__aa-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  var chatIcon = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>';
  var closeIcon = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  bubble.innerHTML = chatIcon;
  document.body.appendChild(bubble);

  // ─── Iframe ──────────────────────────────────────────────────────────────
  var frame = document.createElement('iframe');
  frame.id = '__aa-frame';
  frame.src = origin + '/widget';
  frame.setAttribute('allow', 'clipboard-write');
  document.body.appendChild(frame);
var maxBtn = null;
var isMaximized = false;
if (enableMaximize) {
  maxBtn = document.createElement('button');
  maxBtn.id = '__aa-maximize';
  maxBtn.setAttribute('aria-label', 'Maximize');
  maxBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
  maxBtn.style.display = 'none';
  document.body.appendChild(maxBtn);
}
  

  // Send page context to iframe once it loads
  var contextSent = false;
  frame.addEventListener('load', function () {
    if (!contextSent) {
      contextSent = true;
      frame.contentWindow.postMessage({
        type: '__aa_page_context',
        payload: getPageContext()
      }, origin);
    }
  });

  // Re-send context on SPA navigation
  var lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      contextSent = false;
      setTimeout(function () {
        frame.contentWindow.postMessage({
          type: '__aa_page_context',
          payload: getPageContext()
        }, origin);
        contextSent = true;
      }, 500);
    }
  }, 1000);

  // ─── Toggle ──────────────────────────────────────────────────────────────

var restoreIcon = '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

function positionMaxBtn() {
  if (!maxBtn || !isOpen) { if (maxBtn) maxBtn.style.display = 'none'; return; }
  maxBtn.style.display = 'flex';
  if (isMaximized) {
    maxBtn.style.top = '12px';
    maxBtn.style[side] = '12px';
  } else {
    var rect = frame.getBoundingClientRect();
    maxBtn.style.top = (rect.top + 8) + 'px';
    maxBtn.style[side] = side === 'left' ? (rect.left + rect.width - 36) + 'px' : (window.innerWidth - rect.right + 8) + 'px';
  }
}

if (maxBtn) {
  maxBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    isMaximized = !isMaximized;
    frame.classList.toggle('maximized', isMaximized);
    maxBtn.innerHTML = isMaximized ? restoreIcon : maxBtn.innerHTML; // 第一次是 maximizeIcon
    // 更简洁：
    maxBtn.innerHTML = isMaximized ? restoreIcon : '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
    positionMaxBtn();
  });
  window.addEventListener('resize', positionMaxBtn);
}

  
  var isOpen = false;
  bubble.addEventListener('click', function () {
    isOpen = !isOpen;
    frame.classList.toggle('open', isOpen);
    bubble.innerHTML = isOpen ? closeIcon : chatIcon;
    if (maxBtn) setTimeout(positionMaxBtn, 350);
    if (isOpen && !contextSent) {
      frame.contentWindow.postMessage({
        type: '__aa_page_context',
        payload: getPageContext()
      }, origin);
      contextSent = true;
    }
  });
})();

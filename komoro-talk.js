/* 🗾 Talk to KOMORO — LIVE agent chat for zupit.org/japan (2026-10-15)
   KOMORO 🗾 = the Japan waste guide of the Trace Zero Waste family. Hub:
   komoro-chat worker (clone of tracey-chat lane). Self-contained, zero console.
   Cursor law (2026-09-27 scar): NEVER advance `after` on send — the poll loop
   owns the cursor; a seen-set dedupes our own echo. Catch-up renders full
   history on open. Privacy law: NO network call until the visitor opens the chat. */
(function () {
  'use strict';
  if (document.getElementById('komoroTalkRoot')) return;
  var HUB = 'https://komoro-chat.shakaverse.workers.dev';

  var css = `
  #komoroTalkRoot{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Kaku Gothic ProN",Meiryo,sans-serif}
  #komoroTalkRoot .kt-fab{display:flex;align-items:center;gap:9px;border:1px solid #e5e0d8;border-radius:999px;padding:11px 17px;cursor:pointer;color:#111;font-size:14.5px;font-weight:650;letter-spacing:.04em;background:#fffdf9;box-shadow:0 10px 32px rgba(20,12,4,.18);transition:transform .18s ease,border-color .18s ease}
  #komoroTalkRoot .kt-fab:hover{transform:translateY(-2px);border-color:#d64541}
  #komoroTalkRoot .kt-fab .kt-dot{width:8px;height:8px;border-radius:50%;background:#d64541;box-shadow:0 0 8px #d64541;flex:none;animation:ktPulse 2.2s infinite}
  @keyframes ktPulse{0%{box-shadow:0 0 0 0 rgba(214,69,65,.45)}70%{box-shadow:0 0 0 7px rgba(214,69,65,0)}100%{box-shadow:0 0 0 0 rgba(214,69,65,0)}}
  #komoroTalkRoot .kt-panel[hidden]{display:none}
  #komoroTalkRoot .kt-panel{position:absolute;right:0;bottom:calc(100% + 12px);width:min(360px,calc(100vw - 36px));height:min(520px,calc(100vh - 120px));display:flex;flex-direction:column;border-radius:18px;border:1px solid #e5e0d8;background:#fffdf9;box-shadow:0 18px 54px rgba(20,12,4,.25);overflow:hidden}
  #komoroTalkRoot .kt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 16px 10px;border-bottom:1px solid #efe9de;flex:none}
  #komoroTalkRoot .kt-title{font-size:16px;font-weight:750;color:#111;letter-spacing:.04em}
  #komoroTalkRoot .kt-sub{font-size:12px;line-height:1.45;color:#8a8172;margin-top:2px}
  #komoroTalkRoot .kt-sub .kt-live{color:#d64541;font-weight:700}
  #komoroTalkRoot .kt-x{border:1px solid #e5e0d8;background:#fff;color:#8a8172;border-radius:9px;width:28px;height:28px;cursor:pointer;font-size:14px;line-height:1;flex:none}
  #komoroTalkRoot .kt-x:hover{color:#111}
  #komoroTalkRoot .kt-log{flex:1;overflow-y:auto;padding:13px 14px;display:flex;flex-direction:column;gap:8px;-webkit-overflow-scrolling:touch}
  #komoroTalkRoot .kt-m{max-width:86%;padding:9px 12px;border-radius:13px;font-size:13.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;color:#111}
  #komoroTalkRoot .kt-m.kt-v{align-self:flex-end;background:#111;color:#faf8f4;border-bottom-right-radius:4px}
  #komoroTalkRoot .kt-m.kt-a{align-self:flex-start;background:#f5f1e8;border:1px solid #e5e0d8;border-bottom-left-radius:4px}
  #komoroTalkRoot .kt-m.kt-a .kt-who{font-size:11px;color:#d64541;font-weight:750;margin-bottom:3px;letter-spacing:.08em}
  #komoroTalkRoot .kt-note{align-self:center;font-size:11px;color:#a29a89;text-align:center;max-width:94%;line-height:1.45;font-style:italic}
  #komoroTalkRoot .kt-m a,#komoroTalkRoot .kt-note a{color:#d64541;text-decoration:underline;word-break:break-all}
  #komoroTalkRoot .kt-m.kt-v a{color:#ffd9d0}
  #komoroTalkRoot .kt-typing{display:none;padding:2px 16px 6px;color:#8a8172;font-size:13px;flex:none}
  #komoroTalkRoot .kt-typing.on{display:block}
  #komoroTalkRoot .kt-typing span{display:inline-block;animation:ktB 1.2s infinite}
  #komoroTalkRoot .kt-typing span:nth-child(2){animation-delay:.2s}
  #komoroTalkRoot .kt-typing span:nth-child(3){animation-delay:.4s}
  @keyframes ktB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  #komoroTalkRoot .kt-form{display:flex;gap:8px;padding:11px 12px;border-top:1px solid #efe9de;flex:none}
  #komoroTalkRoot .kt-in{flex:1;background:#fff;border:1px solid #e5e0d8;border-radius:10px;color:#111;padding:10px 12px;font-size:14px;resize:none;height:42px}
  #komoroTalkRoot .kt-in:focus{outline:none;border-color:#d64541}
  #komoroTalkRoot .kt-send{background:#d64541;color:#fff;border:none;border-radius:10px;padding:0 15px;font-weight:800;font-size:13.5px;cursor:pointer;letter-spacing:.06em}
  #komoroTalkRoot .kt-foot{flex:none;text-align:center;font-size:10.5px;color:#a29a89;padding:0 12px 9px;font-style:italic}
  #komoroTalkRoot .kt-foot a{color:#8a8172;text-decoration:underline}
  @media(max-width:560px){
    #komoroTalkRoot .kt-panel{position:fixed;right:0;left:0;bottom:0;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;border:none;border-top:1px solid #e5e0d8}
    #komoroTalkRoot .kt-in{font-size:16px}
    #komoroTalkRoot .kt-form{padding-bottom:calc(11px + env(safe-area-inset-bottom))}
  }
  @media print{#komoroTalkRoot{display:none}}`;

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var root = document.createElement('div');
  root.id = 'komoroTalkRoot';
  root.innerHTML =
    '<button type="button" class="kt-fab" aria-label="Talk to KOMORO — live agent chat">' +
      '<span class="kt-dot"></span><span>🗾 TALK TO KOMORO</span></button>' +
    '<div class="kt-panel" role="dialog" aria-label="KOMORO live chat" hidden>' +
      '<div class="kt-head"><div><div class="kt-title">🗾 TALK TO KOMORO</div>' +
        '<div class="kt-sub"><span class="kt-live">● live</span> — the Trace family’s Japan guide answers, usually within a minute or two.</div></div>' +
        '<button type="button" class="kt-x" aria-label="Close chat">✕</button></div>' +
      '<div class="kt-log" aria-live="polite"></div>' +
      '<div class="kt-typing"><span>●</span><span>●</span><span>●</span></div>' +
      '<form class="kt-form"><textarea class="kt-in" rows="1" placeholder="Ask about trash days, sorting, bags, stations — 日本語でもOK…"></textarea>' +
        '<button type="submit" class="kt-send">Send</button></form>' +
      '<div class="kt-foot">prefer mail? <a href="mailto:aloha@myagentohana.com">aloha@myagentohana.com</a> — opening this chat is the only time this site talks to a server.</div>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (s) { return root.querySelector(s); };
  var fab = $('.kt-fab'), panel = $('.kt-panel'), log = $('.kt-log'),
      typing = $('.kt-typing'), form = $('.kt-form'), input = $('.kt-in');

  var sess = null;
  try { sess = localStorage.getItem('zp_komoro_sess'); } catch (e) {}
  if (!sess) {
    sess = (window.crypto && crypto.randomUUID ? crypto.randomUUID()
           : Date.now() + '-' + Math.random().toString(36).slice(2)).slice(0, 36);
    try { localStorage.setItem('zp_komoro_sess', sess); } catch (e) {}
  }

  var after = 0, seen = {}, open = false, polling = false, caughtUp = false;

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function anchor(url, txt) {
    url = url.replace(/"/g, '%22');
    var label = txt || (url.length > 42 ? url.slice(0, 40) + '…' : url).replace(/^https?:\/\//, '');
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
  }
  function rich(s) {
    var h = esc(s);
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, u) { return anchor(u, t); });
    h = h.replace(/(^|[^"'>])(https?:\/\/[^\s<]+)/g, function (m, pre, u) {
      var trail = ''; var mm = u.match(/[.,!?;:)\]]+$/);
      if (mm) { trail = mm[0]; u = u.slice(0, u.length - trail.length); }
      return pre + anchor(u) + trail;
    });
    h = h.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
    return h;
  }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function add(role, text, name) {
    var m = document.createElement('div');
    m.className = 'kt-m ' + (role === 'visitor' ? 'kt-v' : 'kt-a');
    m.innerHTML = (role === 'visitor' ? '' : '<div class="kt-who">' + esc(name || 'KOMORO 🗾') + '</div>') + rich(text);
    log.appendChild(m); scroll();
  }
  function note(t) {
    var n = document.createElement('div'); n.className = 'kt-note'; n.innerHTML = rich(t);
    log.appendChild(n); scroll();
  }
  function render(m) {
    if (m.seq > after) after = m.seq;
    if (seen[m.seq]) return;
    seen[m.seq] = 1;
    if (m.role === 'visitor') add('visitor', m.text);
    else if (m.role === 'system') note(m.text);
    else add('agent', m.text, m.name);
  }
  function greet() {
    if (log.children.length) return;
    note('Live line to Komoro — a real agent answers. Conversations may be reviewed with care.');
    add('agent', '🗾 Yōkoso — welcome! I’m KOMORO, the Trace family’s Japan waste guide. Ask me about trash days, the five bags, your collection station, CleanHill runs, or anything about doing it right in Komoro. 日本語でもどうぞ！ What can I help you sort?');
  }
  function catchUp() {
    return fetch(HUB + '/poll?session=' + encodeURIComponent(sess) + '&after=0')
      .then(function (r) { return r.json(); })
      .then(function (d) { (d.messages || []).forEach(render); caughtUp = true; greet(); })
      .catch(function () { caughtUp = true; greet(); });
  }
  function poll() {
    if (polling) return; polling = true;
    (function loop() {
      if (!open) { polling = false; return; }
      fetch(HUB + '/poll?session=' + encodeURIComponent(sess) + '&after=' + after + '&wait=25')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          (d.messages || []).forEach(render);
          typing.className = 'kt-typing' + (d.typing ? ' on' : '');
          if (d.typing) scroll();
          loop();
        })
        .catch(function () { setTimeout(loop, 4000); });
    })();
  }

  function openPanel() {
    open = true; panel.hidden = false; fab.style.display = 'none';
    (caughtUp ? Promise.resolve(greet()) : catchUp()).then(function () { poll(); });
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 50);
  }
  function closePanel() { open = false; panel.hidden = true; fab.style.display = ''; }

  fab.addEventListener('click', openPanel);
  $('.kt-x').addEventListener('click', closePanel);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = input.value.trim();
    if (!t) return;
    input.value = '';
    add('visitor', t);
    fetch(HUB + '/send', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session: sess, text: t, name: 'guest' })
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.seq) seen[d.seq] = 1;
        if (d && d.error) note(d.error);
      })
      .catch(function () { note('a crow stole the packet — that message may not have sent; try again 🗾'); });
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.dispatchEvent(new Event('submit', { cancelable: true })); }
  });
})();

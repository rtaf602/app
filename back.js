/* ปุ่มกลับหน้า OPS 602 ใช้ร่วมกันทุกระบบของ ฝูง.602 (repo app)
   แต่ละระบบใส่บรรทัดเดียวก่อน </body>:   <script src="/app/back.js" defer></script>
   - เปิดระบบมาจากหน้า OPS 602 ในแท็บใหม่: กดแล้วปิดแท็บนี้ กลับไปแท็บ OPS 602 เดิม
   - เปิดตรง ๆ หรือเดินไปหน้าอื่นในแท็บนี้แล้ว: กดแล้วไปหน้า OPS 602
   - อยู่ใน Shadow DOM จึงไม่ชนกับหน้าตาของระบบนั้น ไม่ติดไปตอนพิมพ์และตอนทำ PDF ด้วย html2canvas
   - z-index 40: หน้าต่างเต็มจอของระบบ (z-index 50 ขึ้นไป เช่น PREVIEW, หน้าล็อก) ปิดทับแถบได้ ปุ่มบนหน้าต่างนั้นจึงไม่ถูกบัง
   - หัวที่ติดด้านบน (position:sticky) ของระบบ ให้ใช้ top:var(--ops602-h, env(safe-area-inset-top,0px)) */
(function () {
  'use strict';
  if (window.__ops602Back || window.top !== window) return;
  window.__ops602Back = true;
  var HOME = '/app/';
  var me = document.currentScript;
  var look = (me && me.getAttribute('data-style')) || 'bar';        // bar (ผู้ใช้เลือก 13 พ.ย.) | float

  var CREST = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="8" y1="6" x2="56" y2="58">' +
    '<stop offset="0" stop-color="#eed6a3"/><stop offset=".55" stop-color="#bd9148"/><stop offset="1" stop-color="#eed6a3"/></linearGradient></defs>' +
    '<circle cx="32" cy="32" r="31" fill="#0a2140" stroke="url(#g)" stroke-width="1.6"/><circle cx="32" cy="32" r="21" fill="none" stroke="url(#g)" stroke-width="3.6" stroke-dasharray="4.12 4.12"/>' +
    '<circle cx="32" cy="32" r="18" fill="none" stroke="url(#g)" stroke-width=".9"/><g transform="translate(32 32) scale(1.05) translate(-12 -11.5)">' +
    '<path d="M12 2c.9 0 1.5 1 1.5 2.2V9l7.5 4.5v2l-7.5-2.2v4.6l2.2 1.6V21L12 20l-3.7 1v-1.5l2.2-1.6v-4.6L3 15.5v-2L10.5 9V4.2C10.5 3 11.1 2 12 2z" fill="url(#g)"/></g></svg>';
  var ARROW = '<svg class="arr" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2L3 10l7 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CSS = ':host{all:initial}' +
    '@media print{:host{display:none!important}}' +
    'a{box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;text-decoration:none;font:600 14px/1 "IBM Plex Sans Thai","Noto Sans Thai",Tahoma,sans-serif;color:#f3e2bd;-webkit-tap-highlight-color:transparent;cursor:pointer}' +
    'a:focus-visible{outline:3px solid #eed6a3;outline-offset:3px}' +
    '.arr{width:9px;height:15px;flex:none}' +
    'svg:not(.arr){display:block;flex:none}' +
    /* ปุ่มลอยมุมล่างซ้าย */
    '.float{position:fixed;z-index:2147482000;left:calc(14px + env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));' +
    'height:48px;padding:0 14px 0 10px;border-radius:24px;background:#0f2a4a;box-shadow:0 6px 18px rgba(5,12,24,.35),inset 0 0 0 1px rgba(214,180,118,.55)}' +
    '.float svg:not(.arr){width:30px;height:30px}' +
    '.float:active{transform:scale(.96)}' +
    /* แถบบนสุด */
    '.bar{position:fixed;z-index:40;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;height:calc(46px + env(safe-area-inset-top,0px));' +
    'padding:env(safe-area-inset-top,0px) max(10px,env(safe-area-inset-right,0px)) 0 max(10px,env(safe-area-inset-left,0px));background:#0f2a4a;border-bottom:2px solid #bd9148;box-shadow:0 2px 8px rgba(5,12,24,.25)}' +
    '.bar a,.bar button{height:40px;padding:0 10px;border-radius:20px}' +
    '.bar a:hover,.bar button:hover{background:rgba(255,255,255,.08)}' +
    '.bar svg:not(.arr){width:26px;height:26px}' +
    'button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;font:500 13px/1 "IBM Plex Sans Thai","Noto Sans Thai",Tahoma,sans-serif;color:#eed6a3;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    'button:focus-visible{outline:3px solid #eed6a3;outline-offset:2px}' +
    '.ref{width:18px;height:18px}' +
    '.bar a span{letter-spacing:.08em}.bar button span{font-weight:600;font-size:11.5px;letter-spacing:.16em}' +
    '@media (prefers-reduced-motion:reduce){.float:active{transform:none}}';

  function cameFromHub() {
    try { var r = document.referrer ? new URL(document.referrer) : null; return !!r && r.origin === location.origin && /^\/app\/?(index\.html)?$/.test(r.pathname); }
    catch (e) { return false; }
  }
  function goHome(e) {
    // เปิดจากหน้า OPS 602 ในแท็บใหม่ และยังไม่ได้ไปหน้าอื่น: ปิดแท็บ กลับไปแท็บเดิม (เบราว์เซอร์ที่ไม่ยอมให้ปิด จะไปหน้า OPS 602 แทน)
    if (cameFromHub() && history.length <= 1) {
      e.preventDefault();
      try { window.close(); } catch (x) { /* ไปหน้า OPS 602 ด้านล่าง */ }
      setTimeout(function () { location.href = HOME; }, 250);
    }
  }
  function mount() {
    var host = document.createElement('div');
    host.id = 'ops602-back';
    host.setAttribute('data-html2canvas-ignore', 'true');
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var REFRESH = '<svg class="ref" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (look === 'bar') {
      root.innerHTML = '<style>' + CSS + '</style><div class="bar"><a href="' + HOME + '" aria-label="กลับหน้ารวม OPS 602">' + ARROW + CREST + '<span>OPS 602</span></a>' +
        '<button type="button" aria-label="โหลดหน้านี้ใหม่">' + REFRESH + '<span>REFRESH</span></button></div>';
      root.querySelector('button').addEventListener('click', function () { location.reload(); });
      // the page itself starts under the bar
      var st = document.createElement('style'); st.id = 'ops602-back-space';
      // --ops602-h: ความสูงของแถบ ระบบที่มีหัวติดด้านบน (sticky) ใช้ top:var(--ops602-h, …) เพื่อหยุดใต้แถบ
      st.textContent = 'html{--ops602-h:calc(46px + env(safe-area-inset-top,0px));padding-top:var(--ops602-h)!important;scroll-padding-top:var(--ops602-h)}' +
        '@media print{html{--ops602-h:0px;padding-top:0!important}}';
      document.head.appendChild(st);
    } else {
      root.innerHTML = '<style>' + CSS + '</style><a class="float" href="' + HOME + '" aria-label="กลับหน้ารวม OPS 602">' + ARROW + CREST + '<span>OPS 602</span></a>';
    }
    root.querySelector('a').addEventListener('click', goHome);
    document.body.appendChild(host);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();

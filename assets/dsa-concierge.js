/* ============================================================================
   Ridgeline DSA - Avery Concierge Launcher
   Warm, on-brand entry point that introduces Avery (GHL Conversation AI),
   opens the live chat, and offers a switch to voice (call) in one surface.
   Self-contained: injects its own styles. Does NOT replace the native GHL
   bubble - that stays as the guaranteed-working chat opener underneath.
   Owner: Ailene (AIAA) for Michael (CTO). Persona: Avery (Raj/ai). Brand: Ridgeline.
   ============================================================================ */
(function () {
  "use strict";

  var VOICE_TEL = "+16236638252";       // Ridgeline New Home Concierge voice line
  var VOICE_DISPLAY = "(623) 663-8252";
  var GREET_DELAY = 1400;               // ms before the greeting peeks in
  var SS_KEY = "ridgeline_avery_greeted";

  /* ---- styles ---------------------------------------------------------- */
  var css = ""
    + ".dsa-c *{box-sizing:border-box;margin:0;padding:0;}"
    + ".dsa-c{position:fixed;right:22px;bottom:96px;z-index:2147482000;"
    + "font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}"
    + ".dsa-card{width:330px;max-width:calc(100vw - 36px);background:#fff;border-radius:18px;"
    + "box-shadow:0 18px 50px rgba(20,40,34,.28),0 2px 8px rgba(20,40,34,.12);"
    + "overflow:hidden;transform:translateY(14px) scale(.96);opacity:0;"
    + "transition:transform .34s cubic-bezier(.2,.8,.25,1),opacity .34s ease;pointer-events:none;}"
    + ".dsa-c.show .dsa-card{transform:translateY(0) scale(1);opacity:1;pointer-events:auto;}"
    + ".dsa-head{background:linear-gradient(135deg,#1d3a32 0%,#2f5d50 78%,#356b5b 140%);"
    + "padding:18px 18px 16px;color:#fff;display:flex;gap:13px;align-items:center;position:relative;}"
    + ".dsa-av{width:48px;height:48px;border-radius:50%;flex:0 0 48px;background:#c4843c;"
    + "display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px rgba(255,255,255,.18);}"
    + ".dsa-av svg{width:26px;height:26px;}"
    + ".dsa-name{font-family:Georgia,'Times New Roman',serif;font-size:1.06rem;font-weight:700;letter-spacing:-.01em;line-height:1.1;}"
    + ".dsa-role{font-size:.76rem;opacity:.85;margin-top:3px;display:flex;align-items:center;gap:6px;}"
    + ".dsa-dot{width:7px;height:7px;border-radius:50%;background:#7CFC9B;box-shadow:0 0 0 0 rgba(124,252,155,.7);animation:dsaPulse 2s infinite;}"
    + "@keyframes dsaPulse{0%{box-shadow:0 0 0 0 rgba(124,252,155,.6)}70%{box-shadow:0 0 0 7px rgba(124,252,155,0)}100%{box-shadow:0 0 0 0 rgba(124,252,155,0)}}"
    + ".dsa-x{position:absolute;top:10px;right:12px;width:24px;height:24px;border:0;background:rgba(255,255,255,.14);"
    + "color:#fff;border-radius:50%;cursor:pointer;font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;}"
    + ".dsa-x:hover{background:rgba(255,255,255,.28);}"
    + ".dsa-body{padding:16px 18px 6px;}"
    + ".dsa-msg{color:#1a1f24;font-size:.95rem;line-height:1.5;}"
    + ".dsa-msg b{color:#1d3a32;}"
    + ".dsa-acts{padding:14px 18px 18px;display:flex;flex-direction:column;gap:9px;}"
    + ".dsa-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;"
    + "padding:13px 16px;border-radius:11px;font-size:.95rem;font-weight:600;cursor:pointer;border:0;"
    + "text-decoration:none;transition:transform .12s ease,filter .12s ease,background .12s ease;}"
    + ".dsa-btn:hover{transform:translateY(-1px);}"
    + ".dsa-chat{background:#c4843c;color:#fff;}"
    + ".dsa-chat:hover{filter:brightness(1.07);}"
    + ".dsa-call{background:#fff;color:#1d3a32;border:1.5px solid #d8ddda;}"
    + ".dsa-call:hover{background:#f6f8fa;border-color:#c4843c;}"
    + ".dsa-call small{display:block;font-weight:500;font-size:.72rem;color:#5b6670;margin-top:1px;}"
    + ".dsa-foot{text-align:center;font-size:.7rem;color:#8a949c;padding:0 18px 14px;}"
    + ".dsa-foot b{color:#2f5d50;font-weight:600;}"
    + "@media(max-width:520px){.dsa-c{right:12px;bottom:84px;}}"
    + "@media(prefers-reduced-motion:reduce){.dsa-card{transition:opacity .2s ease;transform:none;}.dsa-dot{animation:none;}}";

  function injectStyle() {
    var s = document.createElement("style");
    s.id = "dsa-concierge-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---- avery avatar (little house monogram) ---------------------------- */
  var AVATAR = "<svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>"
    + "<path d='M8 22L20 11l12 11' stroke='#fff' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/>"
    + "<path d='M12 21v9h16v-9' stroke='#fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/>"
    + "<rect x='18' y='24' width='4' height='6' rx='1' fill='#1d3a32'/></svg>";

  /* ---- open the live Avery (GHL LeadConnector) chat -------------------- */
  function deepFindLauncher() {
    var sels = [
      'chat-widget', '#lc_text-widget', '.lc_text-widget__head',
      '[id^="lc_text"]', 'button[aria-label*="chat" i]', 'button[aria-label*="Open" i]'
    ];
    for (var i = 0; i < sels.length; i++) {
      var el = document.querySelector(sels[i]);
      if (el) {
        if (el.shadowRoot) {
          var inner = el.shadowRoot.querySelector('button,[role="button"],.chat-bubble,[class*="launcher"]');
          if (inner) return inner;
        }
        return el;
      }
    }
    return null;
  }

  function openAvery() {
    var opened = false;
    try {
      if (window.leadConnector && window.leadConnector.chatWidget && typeof window.leadConnector.chatWidget.openWidget === "function") {
        window.leadConnector.chatWidget.openWidget(); opened = true;
      }
    } catch (e) {}
    if (!opened) {
      try {
        var el = deepFindLauncher();
        if (el && typeof el.click === "function") { el.click(); opened = true; }
      } catch (e) {}
    }
    if (!opened) {
      // Graceful fallback: bounce the native GHL bubble so the user taps it.
      var bubble = deepFindLauncher() || document.querySelector('chat-widget');
      if (bubble) {
        bubble.style.transition = "transform .25s ease";
        var n = 0, iv = setInterval(function () {
          bubble.style.transform = (n % 2 ? "scale(1.14)" : "scale(1)");
          if (++n > 6) { clearInterval(iv); bubble.style.transform = ""; }
        }, 220);
      }
    }
    dismiss();
  }

  /* ---- card lifecycle -------------------------------------------------- */
  var root;
  function dismiss() {
    if (!root) return;
    root.classList.remove("show");
    try { sessionStorage.setItem(SS_KEY, "1"); } catch (e) {}
    setTimeout(function () { if (root) root.style.display = "none"; }, 360);
  }

  function build() {
    root = document.createElement("div");
    root.className = "dsa-c";
    root.setAttribute("role", "complementary");
    root.setAttribute("aria-label", "Chat with Avery, Ridgeline New Home Advisor");
    root.innerHTML =
        "<div class='dsa-card'>"
      +   "<div class='dsa-head'>"
      +     "<div class='dsa-av'>" + AVATAR + "</div>"
      +     "<div><div class='dsa-name'>Avery</div>"
      +       "<div class='dsa-role'><span class='dsa-dot'></span>Ridgeline New Home Advisor</div></div>"
      +     "<button class='dsa-x' aria-label='Close'>&times;</button>"
      +   "</div>"
      +   "<div class='dsa-body'><p class='dsa-msg'>Hi, I'm <b>Avery</b> 👋 I help you find the right community, floor plan, and price across NY, NJ, CT &amp; FL. Want to start a quick chat, or would you rather talk?</p></div>"
      +   "<div class='dsa-acts'>"
      +     "<button class='dsa-btn dsa-chat'>💬 Chat with Avery</button>"
      +     "<a class='dsa-btn dsa-call' href='tel:" + VOICE_TEL + "'>📞 Prefer to talk?<small>Call " + VOICE_DISPLAY + "</small></a>"
      +   "</div>"
      +   "<div class='dsa-foot'>Switch between <b>chat</b> and <b>voice</b> anytime</div>"
      + "</div>";
    document.body.appendChild(root);

    root.querySelector(".dsa-x").addEventListener("click", dismiss);
    root.querySelector(".dsa-chat").addEventListener("click", openAvery);
    root.querySelector(".dsa-call").addEventListener("click", function () {
      setTimeout(dismiss, 50);
    });

    requestAnimationFrame(function () {
      setTimeout(function () { root.classList.add("show"); }, GREET_DELAY);
    });
  }

  function start() {
    var seen = false;
    try { seen = sessionStorage.getItem(SS_KEY) === "1"; } catch (e) {}
    injectStyle();
    if (!seen) build();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

(function () {
  'use strict';

  // =============================================
  // === TAB CONTROLLER ===
  // =============================================
  function initTabController() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tool-panel');

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.dataset.tab;
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        const panel = document.getElementById('panel-' + target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // =============================================
  // === TOOL 1: SAFE ZONE ===
  // =============================================
  const SZ = {
    currentPlatform: 'tiktok',
    dangerOn: false,
    opacity: 0.70,
    mediaLoaded: false
  };

  function initSafeZone() {
    const uploadInput = document.getElementById('sz-upload');
    const demoBtn = document.getElementById('sz-demo-btn');
    const clearBtn = document.getElementById('sz-clear-btn');
    const platformBtns = document.querySelectorAll('#sz-platform-group .pill-toggle, .sz-platform-btn');
    const dangerToggle = document.getElementById('sz-danger-toggle');
    const opacitySlider = document.getElementById('sz-opacity');
    const opacityVal = document.getElementById('sz-opacity-val');

    if (uploadInput) {
      uploadInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          szHandleUpload(e.target.files[0]);
          uploadInput.value = '';
        }
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', szLoadDemo);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', szClearMedia);
    }

    platformBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        platformBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        SZ.currentPlatform = btn.dataset.platform || 'none';
        szApplyOverlay(SZ.currentPlatform);
      });
    });

    if (dangerToggle) {
      dangerToggle.addEventListener('change', function () {
        SZ.dangerOn = dangerToggle.checked;
        szApplyDangerZones();
      });
    }

    if (opacitySlider) {
      const updateOpacityFromSlider = function () {
        const raw = parseFloat(opacitySlider.value);
        // Normalize whether slider uses 0..1 or 20..100
        SZ.opacity = raw > 1 ? raw / 100 : raw;
        if (opacityVal) opacityVal.textContent = Math.round(SZ.opacity * 100) + '%';
        szUpdateOpacity();
      };
      opacitySlider.addEventListener('input', updateOpacityFromSlider);
      updateOpacityFromSlider();
    }

    // Initial state
    szApplyOverlay(SZ.currentPlatform);
    szApplyDangerZones();
  }

  function szRenderMediaImage(src) {
    const phoneMedia = document.getElementById('phone-media');
    if (phoneMedia) {
      phoneMedia.innerHTML = '';
      const img = document.createElement('img');
      img.src = src;
      img.alt = '9:16 Media Preview';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      phoneMedia.appendChild(img);
    }
    SZ.mediaLoaded = true;
  }

  function szClearMedia() {
    const phoneMedia = document.getElementById('phone-media');
    if (phoneMedia) {
      phoneMedia.innerHTML = `
        <div class="phone-placeholder" id="sz-placeholder">
          <span>📱</span>
          <p>Upload media or load demo</p>
        </div>`;
    }
    SZ.mediaLoaded = false;
  }

  function szHandleUpload(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      szRenderMediaImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function szLoadDemo() {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 493" width="280" height="493">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1a2e"/>
          <stop offset="100%" stop-color="#0f0f1a"/>
        </linearGradient>
      </defs>
      <rect width="280" height="493" fill="url(#bgGrad)"/>
      <line x1="140" y1="0" x2="140" y2="493" stroke="rgba(100,149,237,0.3)" stroke-width="1" stroke-dasharray="6,4"/>
      <line x1="0" y1="246" x2="280" y2="246" stroke="rgba(100,149,237,0.3)" stroke-width="1" stroke-dasharray="6,4"/>
      <rect x="0" y="0" width="280" height="48" fill="rgba(220,38,38,0.4)"/>
      <text x="140" y="28" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#ff6b6b" font-weight="700">DANGER — TOP UI BAR</text>
      <rect x="0" y="393" width="280" height="100" fill="rgba(220,38,38,0.4)"/>
      <text x="110" y="445" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#ff6b6b" font-weight="700">DANGER — CAPTION</text>
      <rect x="224" y="0" width="56" height="493" fill="rgba(217,119,6,0.3)"/>
      <text x="252" y="246" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#fbbf24" font-weight="700" transform="rotate(-90,252,246)">SIDEBAR UI ZONE</text>
      <polygon points="0,0 48,0 0,48" fill="rgba(217,119,6,0.6)"/>
      <polygon points="280,0 232,0 280,48" fill="rgba(217,119,6,0.6)"/>
      <polygon points="0,493 48,493 0,445" fill="rgba(217,119,6,0.6)"/>
      <polygon points="224,493 224,445 280,493" fill="rgba(217,119,6,0.6)"/>
      <circle cx="140" cy="246" r="72" fill="none" stroke="rgba(16,185,129,0.8)" stroke-width="2" stroke-dasharray="8,4"/>
      <circle cx="140" cy="246" r="4" fill="rgba(16,185,129,0.9)"/>
      <text x="140" y="238" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="rgba(16,185,129,0.9)" font-weight="700">SAFE ZONE</text>
      <text x="140" y="256" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">Keep key content here</text>
    </svg>`;

    const encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
    szRenderMediaImage(encoded);
  }

  function szApplyOverlay(platform) {
    const container = document.getElementById('sz-overlay-container');
    if (!container) return;
    container.innerHTML = '';

    if (platform === 'tiktok') {
      container.innerHTML = `
        <div class="sz-tiktok-top">Following &nbsp;|&nbsp; <strong>For You</strong></div>
        <div class="sz-tiktok-right">
          <div class="sz-tiktok-action"><span class="icon">👤</span><span>alexc</span></div>
          <div class="sz-tiktok-action"><span class="icon">❤️</span><span>24.3K</span></div>
          <div class="sz-tiktok-action"><span class="icon">💬</span><span>847</span></div>
          <div class="sz-tiktok-action"><span class="icon">🔖</span><span>2.1K</span></div>
          <div class="sz-tiktok-action"><span class="icon">↗️</span><span>Share</span></div>
        </div>
        <div class="sz-tiktok-bottom">
          <div>@alexcreator · This tool changed my content workflow completely 🔥</div>
          <div style="margin-top:4px;color:rgba(255,255,255,0.7)">♪ original sound - alexcreator</div>
        </div>`;
    } else if (platform === 'reels') {
      container.innerHTML = `
        <div class="sz-reels-top">Reels ▾</div>
        <div class="sz-reels-right">
          <div class="sz-reels-action"><span class="icon">❤️</span><span>14K</span></div>
          <div class="sz-reels-action"><span class="icon">💬</span><span>312</span></div>
          <div class="sz-reels-action"><span class="icon">📤</span><span>Send</span></div>
          <div class="sz-reels-action"><span class="icon">⋯</span></div>
        </div>
        <div class="sz-reels-bottom">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="background:rgba(255,255,255,0.15);border-radius:20px;padding:4px 12px;font-size:11px">alexcreator ✚ Follow</span>
          </div>
          <div style="margin-top:4px;color:rgba(255,255,255,0.7);font-size:9px">♪ Original audio · alexcreator</div>
        </div>`;
    } else if (platform === 'shorts') {
      container.innerHTML = `
        <div class="sz-shorts-top"><span>🔍</span><span>📷</span></div>
        <div class="sz-shorts-right">
          <div class="sz-shorts-action"><span class="icon">👍</span><span>18K</span></div>
          <div class="sz-shorts-action"><span class="icon">👎</span><span>Dislike</span></div>
          <div class="sz-shorts-action"><span class="icon">💬</span><span>420</span></div>
          <div class="sz-shorts-action"><span class="icon">🔀</span><span>Remix</span></div>
        </div>
        <div class="sz-shorts-bottom">
          <div style="font-weight:700">alexcreator <button type="button" style="background:#fff;color:#000;border:none;border-radius:4px;padding:2px 8px;font-size:9px;font-weight:700;cursor:pointer">Subscribe</button></div>
          <div style="margin-top:3px;font-size:9px;color:rgba(255,255,255,0.7)">♪ Original sound</div>
        </div>`;
    }
    szUpdateOpacity();
  }

  function szApplyDangerZones() {
    const container = document.getElementById('sz-danger-zones');
    if (!container) return;
    if (SZ.dangerOn) {
      container.innerHTML = `
        <div class="danger-zone-top"></div>
        <div class="danger-zone-right"></div>
        <div class="danger-zone-bottom"></div>`;
    } else {
      container.innerHTML = '';
    }
  }

  function szUpdateOpacity() {
    const container = document.getElementById('sz-overlay-container');
    if (container) container.style.opacity = String(SZ.opacity);
  }

  // =============================================
  // === TOOL 2: TELEPROMPTER ===
  // =============================================
  const TP = {
    wpm: 140,
    targetDuration: 0,
    scrollInterval: null,
    isPlaying: false,
    scrollPos: 0,
    fontSize: 28,
    speed: 3
  };

  function initTeleprompter() {
    const scriptArea = document.getElementById('tp-script');
    const wpmPills = document.querySelectorAll('#tp-speed-group .pill-toggle, .wpm-pill');
    const durationPills = document.querySelectorAll('#tp-duration-group .pill-toggle');
    const customWpmInput = document.getElementById('tp-custom-wpm');
    const targetDurationInput = document.getElementById('tp-target-duration');
    const launchBtn = document.getElementById('tp-launch-btn');
    const closeBtn = document.getElementById('tp-close-modal') || document.getElementById('tp-close-btn');
    const playBtn = document.getElementById('tp-play-pause') || document.getElementById('tp-play-btn');
    const mirrorToggle = document.getElementById('tp-mirror-toggle');
    const speedSlider = document.getElementById('tp-scroll-speed');
    const fontUpBtn = document.getElementById('tp-font-up');
    const fontDownBtn = document.getElementById('tp-font-down');
    const modal = document.getElementById('tp-modal');
    const scrollArea = document.getElementById('tp-scroll-area');

    if (scriptArea) {
      scriptArea.addEventListener('input', tpUpdateMetrics);
    }

    wpmPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        tpHandleWpmPillClick(pill, wpmPills);
        tpUpdateMetrics();
      });
    });

    if (customWpmInput) {
      customWpmInput.addEventListener('input', function () {
        const val = parseInt(customWpmInput.value, 10);
        if (!isNaN(val) && val > 0) {
          TP.wpm = val;
          tpUpdateMetrics();
        }
      });
    }

    durationPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        durationPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        TP.targetDuration = parseInt(pill.dataset.duration, 10) || 0;
        tpUpdateMetrics();
      });
    });

    if (targetDurationInput) {
      targetDurationInput.addEventListener('input', function () {
        TP.targetDuration = parseInt(targetDurationInput.value, 10) || 0;
        tpUpdateMetrics();
      });
    }

    if (launchBtn) {
      launchBtn.addEventListener('click', tpLaunchPrompter);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', tpClose);
    }

    if (playBtn) {
      playBtn.addEventListener('click', tpTogglePlay);
    }

    if (mirrorToggle) {
      mirrorToggle.addEventListener('change', function () {
        const content = document.getElementById('tp-scroll-content');
        if (content) {
          content.classList.toggle('mirrored', mirrorToggle.checked);
        }
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener('input', function () {
        TP.speed = parseFloat(speedSlider.value);
      });
    }

    if (fontUpBtn) {
      fontUpBtn.addEventListener('click', function () {
        TP.fontSize = Math.min(TP.fontSize + 2, 60);
        const content = document.getElementById('tp-scroll-content');
        if (content) content.style.fontSize = TP.fontSize + 'px';
      });
    }

    if (fontDownBtn) {
      fontDownBtn.addEventListener('click', function () {
        TP.fontSize = Math.max(TP.fontSize - 2, 14);
        const content = document.getElementById('tp-scroll-content');
        if (content) content.style.fontSize = TP.fontSize + 'px';
      });
    }

    if (scrollArea) {
      scrollArea.addEventListener('scroll', function () {
        if (!TP.isPlaying) {
          TP.scrollPos = scrollArea.scrollTop;
        }
      });
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) tpClose();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (modal && modal.style.display === 'flex') {
        if (e.code === 'Space') {
          e.preventDefault();
          tpTogglePlay();
        } else if (e.code === 'Escape') {
          e.preventDefault();
          tpClose();
        }
      }
    });

    // Set default WPM pill cleanly to 140
    const wpm140Pill = document.querySelector('#tp-speed-group [data-wpm="140"]');
    if (wpm140Pill) {
      tpHandleWpmPillClick(wpm140Pill, wpmPills);
    }

    tpUpdateMetrics();
  }

  function tpUpdateMetrics() {
    const scriptArea = document.getElementById('tp-script');
    const wordsEl = document.getElementById('tp-words');
    const charsEl = document.getElementById('tp-chars');
    const timeEl = document.getElementById('tp-time');
    const overtimeChip = document.getElementById('tp-overtime-chip');
    const overtimeVal = document.getElementById('tp-overtime-val');

    if (!scriptArea) return;
    const text = scriptArea.value || '';
    const trimmed = text.trim();
    const words = trimmed === '' ? [] : trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = text.length;
    const estimatedSeconds = Math.round((wordCount / (TP.wpm || 140)) * 60);
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    const timeStr = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

    if (wordsEl) wordsEl.textContent = wordCount;
    if (charsEl) charsEl.textContent = charCount;
    if (timeEl) timeEl.textContent = timeStr;

    if (overtimeChip) {
      if (TP.targetDuration > 0) {
        const targetWords = Math.round((TP.wpm * TP.targetDuration) / 60);
        if (wordCount > targetWords) {
          overtimeChip.style.display = 'flex';
          const diffText = '+' + (wordCount - targetWords) + ' words';
          if (overtimeVal) {
            overtimeVal.textContent = diffText;
          } else {
            overtimeChip.textContent = diffText;
          }
        } else {
          overtimeChip.style.display = 'none';
        }
      } else {
        overtimeChip.style.display = 'none';
      }
    }
  }

  function tpHandleWpmPillClick(btn, allPills) {
    const pills = allPills || document.querySelectorAll('#tp-speed-group .pill-toggle, .wpm-pill');
    pills.forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    const customWpmInput = document.getElementById('tp-custom-wpm');
    if (btn.dataset.wpm === 'custom') {
      if (customWpmInput) {
        customWpmInput.style.display = 'inline-block';
        TP.wpm = parseInt(customWpmInput.value, 10) || 140;
      }
    } else {
      if (customWpmInput) customWpmInput.style.display = 'none';
      TP.wpm = parseInt(btn.dataset.wpm, 10) || 140;
    }
  }

  function tpGetPlayBtn() {
    return document.getElementById('tp-play-pause') || document.getElementById('tp-play-btn');
  }

  function tpLaunchPrompter() {
    const scriptArea = document.getElementById('tp-script');
    const scrollContent = document.getElementById('tp-scroll-content');
    const modal = document.getElementById('tp-modal');
    const playBtn = tpGetPlayBtn();

    if (!scriptArea || !scrollContent || !modal) return;

    scrollContent.textContent = scriptArea.value || '';
    scrollContent.style.fontSize = TP.fontSize + 'px';
    modal.style.display = 'flex';

    TP.isPlaying = false;
    TP.scrollPos = 0;
    if (TP.scrollInterval) {
      clearInterval(TP.scrollInterval);
      TP.scrollInterval = null;
    }

    const scrollArea = document.getElementById('tp-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;

    if (playBtn) playBtn.textContent = '▶';
  }

  function tpTogglePlay() {
    const playBtn = tpGetPlayBtn();
    const scrollArea = document.getElementById('tp-scroll-area');

    TP.isPlaying = !TP.isPlaying;

    if (TP.isPlaying) {
      if (playBtn) playBtn.textContent = '⏸';
      if (scrollArea) {
        const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
        if (maxScroll > 0 && scrollArea.scrollTop >= maxScroll - 2) {
          TP.scrollPos = 0;
          scrollArea.scrollTop = 0;
        } else {
          TP.scrollPos = scrollArea.scrollTop;
        }
      }
      TP.scrollInterval = setInterval(function () {
        if (!scrollArea) return;
        const maxScroll = scrollArea.scrollHeight - scrollArea.clientHeight;
        TP.scrollPos += TP.speed * 0.5;
        if (maxScroll > 0 && TP.scrollPos >= maxScroll) {
          TP.scrollPos = maxScroll;
          scrollArea.scrollTop = maxScroll;
          tpTogglePlay(); // Auto-stop at end of script
          return;
        }
        scrollArea.scrollTop = TP.scrollPos;
      }, 16);
    } else {
      if (playBtn) playBtn.textContent = '▶';
      if (TP.scrollInterval) {
        clearInterval(TP.scrollInterval);
        TP.scrollInterval = null;
      }
      if (scrollArea) TP.scrollPos = scrollArea.scrollTop;
    }
  }

  function tpClose() {
    const modal = document.getElementById('tp-modal');
    if (modal) modal.style.display = 'none';
    if (TP.scrollInterval) {
      clearInterval(TP.scrollInterval);
      TP.scrollInterval = null;
    }
    TP.isPlaying = false;
    const playBtn = tpGetPlayBtn();
    if (playBtn) playBtn.textContent = '▶';
  }

  // =============================================
  // === TOOL 3: THREAD SPLITTER ===
  // =============================================
  const TS = {
    platform: 'twitter',
    LIMITS: { twitter: 280, threads: 500, linkedin: 210 }
  };

  function initThreadSplitter() {
    const platformBtns = document.querySelectorAll('#ts-platform-group .pill-toggle, .ts-platform-btn');
    const splitBtn = document.getElementById('ts-split-btn');
    const copyAllBtn = document.getElementById('ts-copy-all-btn');
    const inputArea = document.getElementById('ts-input');

    platformBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        platformBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        TS.platform = btn.dataset.tsPlatform || btn.dataset.platform || 'twitter';
        tsSplit();
      });
    });

    if (splitBtn) {
      splitBtn.addEventListener('click', tsSplit);
    }

    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', function () {
        const cards = document.querySelectorAll('.thread-card-text');
        let all = Array.from(cards).map(function (c) { return c.textContent; }).join('\n\n');
        if (!all && TS.platform === 'linkedin' && inputArea) {
          all = inputArea.value.trim();
        }
        if (navigator.clipboard && all) {
          navigator.clipboard.writeText(all).then(function () {
            copyAllBtn.textContent = '✅ Copied!';
            setTimeout(function () { copyAllBtn.textContent = '📋 Copy Full Thread'; }, 2000);
          }).catch(function () {});
        }
      });
    }

    if (inputArea) {
      inputArea.addEventListener('input', function () {
        const counter = document.getElementById('ts-char-counter');
        if (counter) counter.textContent = inputArea.value.length + ' chars';
      });
    }
  }

  function tsSplit() {
    const inputArea = document.getElementById('ts-input');
    const container = document.getElementById('ts-cards-container');
    const header = document.getElementById('ts-output-header');
    if (!inputArea) return;
    const text = inputArea.value.trim();
    if (!text) {
      if (container) container.innerHTML = '';
      if (header) header.style.display = 'none';
      return;
    }

    if (TS.platform === 'linkedin') {
      tsLinkedinSplit(text);
    } else {
      const limit = TS.LIMITS[TS.platform] || 280;
      tsWordSplit(text, limit);
    }
  }

  function tsChunkText(text, effectiveLimit) {
    const sentenceRegex = /[^.!?]+[.!?]*/g;
    const rawSentences = text.match(sentenceRegex) || [text];
    const sentences = rawSentences.map(function (s) { return s.trim(); }).filter(Boolean);

    const posts = [];
    let current = '';

    function pushChunk(chunk) {
      if (chunk.trim().length > 0) posts.push(chunk.trim());
    }

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (sentence.length > effectiveLimit) {
        if (current.length > 0) {
          pushChunk(current);
          current = '';
        }
        const words = sentence.split(/\s+/);
        let wordChunk = '';
        for (let w = 0; w < words.length; w++) {
          let word = words[w];
          // Slice single words that exceed effectiveLimit
          while (word.length > effectiveLimit) {
            if (wordChunk.length > 0) {
              pushChunk(wordChunk);
              wordChunk = '';
            }
            pushChunk(word.slice(0, effectiveLimit));
            word = word.slice(effectiveLimit);
          }
          const test = wordChunk.length === 0 ? word : wordChunk + ' ' + word;
          if (test.length > effectiveLimit) {
            if (wordChunk.length > 0) pushChunk(wordChunk);
            wordChunk = word;
          } else {
            wordChunk = test;
          }
        }
        if (wordChunk.length > 0) current = wordChunk;
      } else {
        const test = current.length === 0 ? sentence : current + ' ' + sentence;
        if (test.length > effectiveLimit) {
          if (current.length > 0) pushChunk(current);
          current = sentence;
        } else {
          current = test;
        }
      }
    }
    if (current.length > 0) pushChunk(current);
    return posts;
  }

  function tsWordSplit(text, limit) {
    // Two-pass calculation to guarantee multi-digit counters like " (10/12)" never exceed limit
    let suffixLength = 6; // " (1/9)"
    let posts = tsChunkText(text, limit - suffixLength);
    const actualMaxSuffix = (' (' + posts.length + '/' + posts.length + ')').length;
    if (actualMaxSuffix > suffixLength) {
      posts = tsChunkText(text, limit - actualMaxSuffix);
    }

    const total = posts.length;
    const numbered = posts.map(function (p, idx) {
      return p + ' (' + (idx + 1) + '/' + total + ')';
    });

    tsRenderCards(numbered, limit);
  }

  function tsLinkedinSplit(text) {
    tsRenderLinkedinCard(text);
  }

  function tsRenderCards(posts, limit) {
    const header = document.getElementById('ts-output-header');
    const container = document.getElementById('ts-cards-container');
    const countEl = document.getElementById('ts-post-count');

    if (header) header.style.display = 'flex';
    if (countEl) countEl.textContent = posts.length + ' post' + (posts.length !== 1 ? 's' : '');
    if (!container) return;
    container.innerHTML = '';

    posts.forEach(function (postText, idx) {
      const charCount = postText.length;
      const pct = Math.min(100, Math.round((charCount / (limit || 280)) * 100));

      const card = document.createElement('div');
      card.className = 'thread-card';

      const cardHeader = document.createElement('div');
      cardHeader.className = 'thread-card-header';

      const indexEl = document.createElement('div');
      indexEl.className = 'thread-card-index';
      indexEl.textContent = 'Post #' + (idx + 1);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'thread-copy-btn thread-card-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(postText).then(function () {
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(function () {
              copyBtn.textContent = 'Copy';
              copyBtn.classList.remove('copied');
            }, 2000);
          }).catch(function () {});
        }
      });

      cardHeader.appendChild(indexEl);
      cardHeader.appendChild(copyBtn);

      const textEl = document.createElement('div');
      textEl.className = 'thread-card-text';
      textEl.textContent = postText;

      const progressWrap = document.createElement('div');
      progressWrap.className = 'thread-progress-wrap';

      const barWrap = document.createElement('div');
      barWrap.className = 'thread-progress-bar thread-card-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'thread-progress-fill thread-card-bar';
      bar.style.width = pct + '%';
      if (pct > 90) bar.style.background = '#ef4444';
      barWrap.appendChild(bar);

      const charEl = document.createElement('div');
      charEl.className = 'thread-progress-label thread-card-chars';
      charEl.textContent = charCount + ' / ' + (limit || 280) + ' chars (' + pct + '%)';

      progressWrap.appendChild(barWrap);
      progressWrap.appendChild(charEl);

      card.appendChild(cardHeader);
      card.appendChild(textEl);
      card.appendChild(progressWrap);
      container.appendChild(card);
    });
  }

  function tsRenderLinkedinCard(text) {
    const header = document.getElementById('ts-output-header');
    const container = document.getElementById('ts-cards-container');
    const countEl = document.getElementById('ts-post-count');
    if (header) header.style.display = 'flex';
    if (countEl) countEl.textContent = '1 post (LinkedIn Fold Preview)';
    if (!container) return;
    container.innerHTML = '';

    const lines = text.split('\n');
    const firstThreeLines = lines.slice(0, 3).join('\n');
    const foldIndex = Math.min(text.length, Math.min(210, firstThreeLines.length || 210));
    const aboveFold = text.substring(0, foldIndex);
    const belowFold = text.substring(foldIndex);

    const card = document.createElement('div');
    card.className = 'thread-card linkedin-card';

    const label = document.createElement('div');
    label.className = 'linkedin-label';
    label.innerHTML = '<span style="color:#22c55e;font-weight:600">■ Above Fold (First ~210 chars / 3 lines)</span> &nbsp;·&nbsp; <span style="color:#94a3b8">■ Below Fold</span>';
    label.style.cssText = 'font-size:12px;margin-bottom:10px;';

    const aboveEl = document.createElement('div');
    aboveEl.className = 'fold-above linkedin-above-fold';
    aboveEl.textContent = aboveFold;

    const seeMoreEl = document.createElement('div');
    seeMoreEl.style.cssText = 'color:#3b82f6;font-size:12px;margin:6px 0;font-weight:600;';
    seeMoreEl.textContent = '...see more';

    const belowEl = document.createElement('div');
    belowEl.className = 'fold-below linkedin-below-fold';
    belowEl.textContent = belowFold || '(No content below fold)';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'thread-copy-btn thread-card-copy-btn';
    copyBtn.style.marginTop = '10px';
    copyBtn.textContent = 'Copy Post';
    copyBtn.addEventListener('click', function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copy Post';
            copyBtn.classList.remove('copied');
          }, 2000);
        }).catch(function () {});
      }
    });

    card.appendChild(label);
    card.appendChild(aboveEl);
    card.appendChild(seeMoreEl);
    card.appendChild(belowEl);
    card.appendChild(copyBtn);
    container.appendChild(card);
  }

  // =============================================
  // === TOOL 4: YOUTUBE PREVIEW ===
  // =============================================
  const YT = {
    thumbDataUrl: null
  };

  function initYTPreview() {
    const titleInput = document.getElementById('yt-title');
    const channelInput = document.getElementById('yt-channel');
    const timeInput = document.getElementById('yt-time');
    const viewsInput = document.getElementById('yt-views');
    const durationInput = document.getElementById('yt-duration');
    const thumbUpload = document.getElementById('yt-thumb-upload');
    const sampleThumbBtn = document.getElementById('yt-sample-thumb-btn');

    const inputs = [titleInput, channelInput, timeInput, viewsInput, durationInput];
    inputs.forEach(function (inp) {
      if (inp) inp.addEventListener('input', ytUpdatePreview);
    });

    if (thumbUpload) {
      thumbUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = function (ev) {
            YT.thumbDataUrl = ev.target.result;
            ytApplyThumb(YT.thumbDataUrl);
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    if (sampleThumbBtn) {
      sampleThumbBtn.addEventListener('click', ytGenerateSampleThumb);
    }

    ytUpdatePreview();
  }

  function ytUpdatePreview() {
    const titleInput = document.getElementById('yt-title');
    const channelInput = document.getElementById('yt-channel');
    const timeInput = document.getElementById('yt-time');
    const viewsInput = document.getElementById('yt-views');
    const durationInput = document.getElementById('yt-duration');

    const rawTitle = titleInput ? titleInput.value : '';
    const title = rawTitle || 'Your Video Title Here';
    const channel = channelInput ? channelInput.value || 'Channel Name' : 'Channel Name';
    const uploadTime = timeInput ? timeInput.value || 'Just now' : 'Just now';
    const views = viewsInput ? viewsInput.value || '0 views' : '0 views';
    const duration = durationInput ? durationInput.value || '0:00' : '0:00';

    const mobileTitle = document.getElementById('yt-mobile-title');
    const desktopTitle = document.getElementById('yt-desktop-title');
    const channelMobile = document.getElementById('yt-channel-mobile');
    const channelDesktop = document.getElementById('yt-channel-desktop');
    const timeMobile = document.getElementById('yt-time-mobile');
    const timeDesktop = document.getElementById('yt-time-desktop');
    const viewsMobile = document.getElementById('yt-views-mobile');
    const viewsDesktop = document.getElementById('yt-views-desktop');
    const durationMobile = document.getElementById('yt-dur-badge-mobile') || document.getElementById('yt-duration-mobile');
    const durationDesktop = document.getElementById('yt-dur-badge-desktop') || document.getElementById('yt-duration-desktop');
    const titleCounter = document.getElementById('yt-title-counter');

    if (mobileTitle) mobileTitle.textContent = title;
    if (desktopTitle) desktopTitle.textContent = title;
    if (channelMobile) channelMobile.textContent = channel;
    if (channelDesktop) channelDesktop.textContent = channel;
    if (timeMobile) timeMobile.textContent = uploadTime;
    if (timeDesktop) timeDesktop.textContent = uploadTime;
    if (viewsMobile) viewsMobile.textContent = views;
    if (viewsDesktop) viewsDesktop.textContent = views;
    if (durationMobile) durationMobile.textContent = duration;
    if (durationDesktop) durationDesktop.textContent = duration;
    if (titleCounter) {
      titleCounter.textContent = rawTitle.length + '/100';
      titleCounter.classList.toggle('warning', rawTitle.length > 60 && rawTitle.length <= 100);
      titleCounter.classList.toggle('danger', rawTitle.length > 100);
    }

    ytCheckHook();

    if (YT.thumbDataUrl) {
      ytApplyThumb(YT.thumbDataUrl);
    }
  }

  function ytGenerateSampleThumb() {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 320, 180);
    grad.addColorStop(0, '#6d28d9');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 320, 180);

    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 12;
    for (let x = -180; x < 500; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 180, 180);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(320, 180, 60, Math.PI, Math.PI * 1.5);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillText('THUMBNAIL PREVIEW', 160, 90);

    ctx.font = '13px system-ui, sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText('Upload your own image above', 160, 118);

    const dataUrl = canvas.toDataURL('image/png');
    YT.thumbDataUrl = dataUrl;
    ytApplyThumb(dataUrl);
  }

  function ytApplyThumb(dataUrl) {
    const mobileContainer = document.getElementById('yt-thumb-mobile');
    const desktopContainer = document.getElementById('yt-thumb-desktop');

    function makeImg() {
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Video Thumbnail';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;';
      return img;
    }

    if (mobileContainer) {
      mobileContainer.innerHTML = '';
      mobileContainer.appendChild(makeImg());
    }
    if (desktopContainer) {
      desktopContainer.innerHTML = '';
      desktopContainer.appendChild(makeImg());
    }
  }

  function ytCheckHook() {
    const titleInput = document.getElementById('yt-title');
    const auditor = document.getElementById('yt-hook-auditor');
    const auditorMsg = document.getElementById('yt-hook-msg');
    if (!titleInput || !auditor) return;
    const title = titleInput.value || '';
    if (title.length > 50) {
      auditor.style.display = 'flex';
      if (auditorMsg) {
        auditorMsg.textContent = 'Your hook extends past character 50 (' + title.length + ' chars). On mobile feeds, only the first ~52 characters are visible before truncation. Front-load your most compelling keyword.';
      }
    } else {
      auditor.style.display = 'none';
    }
  }

  // =============================================
  // === TOOL 5: SPONSOR RATE ===
  // =============================================
  const SR = {
    CPM_RANGES: {
      high: { min: 25, max: 45 },
      mid: { min: 15, max: 25 },
      volume: { min: 8, max: 15 }
    },
    PLATFORM_MULTIPLIERS: {
      'yt-dedicated': 1.0,
      'yt-integration': 0.65,
      'ig-reel': 0.75,
      'tiktok': 0.6,
      'newsletter': 0.55
    },
    currentRates: { floor: 0, target: 0, premium: 0 },
    pitchEditing: false
  };

  function initSponsorRate() {
    const calcBtn = document.getElementById('sr-calc-btn') || document.getElementById('sr-calculate-btn');
    const engSlider = document.getElementById('sr-engagement');
    const engVal = document.getElementById('sr-eng-val');
    const generatePitchBtn = document.getElementById('sr-generate-pitch-btn');
    const editPitchBtn = document.getElementById('sr-edit-pitch-btn');
    const copyPitchBtn = document.getElementById('sr-copy-pitch-btn');
    const addon30 = document.getElementById('addon-30day');
    const addon60 = document.getElementById('addon-60day');

    // Prevent mutually exclusive 30-day and 60-day usage rights from stacking
    if (addon30 && addon60) {
      addon30.addEventListener('change', function () {
        if (addon30.checked) addon60.checked = false;
      });
      addon60.addEventListener('change', function () {
        if (addon60.checked) addon30.checked = false;
      });
    }

    if (calcBtn) {
      calcBtn.addEventListener('click', function () {
        srCalculate();
        srGeneratePitch();
      });
    }

    if (engSlider && engVal) {
      engSlider.addEventListener('input', function () {
        const pct = parseFloat(engSlider.value) / 10;
        engVal.textContent = pct.toFixed(1) + '%';
      });
    }

    if (generatePitchBtn) generatePitchBtn.addEventListener('click', srGeneratePitch);

    if (editPitchBtn) {
      editPitchBtn.addEventListener('click', function () {
        const pitchContent = document.getElementById('sr-pitch-content');
        const pitchTextarea = document.getElementById('sr-pitch-textarea');
        if (!pitchContent || !pitchTextarea) return;
        SR.pitchEditing = !SR.pitchEditing;
        if (SR.pitchEditing) {
          pitchTextarea.value = pitchContent.textContent;
          pitchContent.style.display = 'none';
          pitchTextarea.style.display = 'block';
          editPitchBtn.textContent = '✅ Done Editing';
        } else {
          pitchContent.textContent = pitchTextarea.value;
          pitchTextarea.style.display = 'none';
          pitchContent.style.display = 'block';
          editPitchBtn.textContent = '✏️ Edit Pitch';
        }
      });
    }

    if (copyPitchBtn) {
      copyPitchBtn.addEventListener('click', function () {
        const pitchContent = document.getElementById('sr-pitch-content');
        const pitchTextarea = document.getElementById('sr-pitch-textarea');
        const text = SR.pitchEditing && pitchTextarea ? pitchTextarea.value : (pitchContent ? pitchContent.textContent : '');
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(function () {
            copyPitchBtn.textContent = '✅ Copied!';
            setTimeout(function () { copyPitchBtn.textContent = '📋 Copy Pitch'; }, 2000);
          }).catch(function () {});
        }
      });
    }

    // Run initial calculation and pitch generation
    srCalculate();
    srGeneratePitch();
  }

  function srCalculate() {
    const viewsInput = document.getElementById('sr-views');
    const engSlider = document.getElementById('sr-engagement');
    const nicheSelect = document.getElementById('sr-niche');
    const platformSelect = document.getElementById('sr-platform');

    const views = Math.max(0, parseInt(viewsInput ? viewsInput.value : '0', 10) || 0);
    const engRaw = parseFloat(engSlider ? engSlider.value : '35') / 10;
    const niche = nicheSelect ? nicheSelect.value : 'mid';
    const platform = platformSelect ? platformSelect.value : 'yt-dedicated';

    const cpmRange = SR.CPM_RANGES[niche] || SR.CPM_RANGES['mid'];
    const platformMultiplier = SR.PLATFORM_MULTIPLIERS[platform] || 1.0;

    const addonMap = {
      'addon-30day': 0.30,
      'addon-60day': 0.50,
      'addon-spark': 0.35,
      'addon-bio': 0.15,
      'addon-repost': 0.25
    };
    let totalAddonMultiplier = 0;
    Object.keys(addonMap).forEach(function (id) {
      const checkbox = document.getElementById(id);
      if (checkbox && checkbox.checked) {
        totalAddonMultiplier += addonMap[id];
      }
    });

    let engBonus = 0;
    if (engRaw > 3.5) {
      engBonus = Math.min(0.20, (engRaw - 3.5) * 0.02);
    }

    const kViews = views / 1000;
    const floorRate = Math.round(kViews * cpmRange.min * platformMultiplier);
    const midCPM = (cpmRange.min + cpmRange.max) / 2;
    const targetBase = kViews * midCPM * platformMultiplier * (1 + engBonus);
    const premiumBase = kViews * cpmRange.max * platformMultiplier * (1 + engBonus);

    const targetRate = Math.round(targetBase * (1 + totalAddonMultiplier));
    const premiumRate = Math.round(premiumBase * (1 + totalAddonMultiplier));

    SR.currentRates = { floor: floorRate, target: targetRate, premium: premiumRate };

    const breakdownFloor = 'Base rate from ' + views.toLocaleString() + ' avg views';
    const breakdownTarget = 'Mid CPM + ' + Math.round(engBonus * 100) + '% eng. bonus + ' + Math.round(totalAddonMultiplier * 100) + '% add-ons';
    const breakdownPremium = 'Max CPM × all multipliers applied';

    srRenderRateCards(floorRate, targetRate, premiumRate, {
      floor: breakdownFloor,
      target: breakdownTarget,
      premium: breakdownPremium
    });
  }

  function srFormatMoney(amount) {
    return '$' + amount.toLocaleString('en-US');
  }

  function srRenderRateCards(floor, target, premium, breakdown) {
    const container = document.getElementById('sr-rate-cards');
    if (!container) return;
    container.innerHTML = '';

    const cards = [
      { label: 'Floor Rate', amount: floor, desc: breakdown.floor, featured: false, color: '#64748b' },
      { label: 'Target Rate', amount: target, desc: breakdown.target, featured: true, color: '#a78bfa' },
      { label: 'Premium Rate', amount: premium, desc: breakdown.premium, featured: false, color: '#f97316' }
    ];

    cards.forEach(function (c) {
      const card = document.createElement('div');
      card.className = 'rate-card' + (c.featured ? ' featured' : '');
      card.innerHTML = `
        <div class="rate-card-label" style="color:${c.color};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">${c.label}</div>
        <div class="rate-card-amount" style="font-size:32px;font-weight:800;color:#f8fafc;margin-bottom:8px">${srFormatMoney(c.amount)}</div>
        <div class="rate-card-breakdown" style="font-size:11px;color:#94a3b8;line-height:1.5">${c.desc}</div>
      `;
      container.appendChild(card);
    });

    const resultsSection = document.getElementById('sr-results');
    if (resultsSection) resultsSection.style.display = 'block';
  }

  function srGeneratePitch() {
    const creatorNameInput = document.getElementById('sr-creator-name');
    const channelNameInput = document.getElementById('sr-channel-name');
    const brandNameInput = document.getElementById('sr-brand-name');
    const viewsInput = document.getElementById('sr-views');
    const engSlider = document.getElementById('sr-engagement');
    const nicheSelect = document.getElementById('sr-niche');
    const platformSelect = document.getElementById('sr-platform');

    const creatorName = creatorNameInput && creatorNameInput.value.trim() ? creatorNameInput.value.trim() : '[Your Name]';
    const channelName = channelNameInput && channelNameInput.value.trim() ? channelNameInput.value.trim() : '[Your Channel]';
    const brandName = brandNameInput && brandNameInput.value.trim() ? brandNameInput.value.trim() : '[Brand Name]';
    const views = viewsInput ? (parseInt(viewsInput.value, 10) || 0).toLocaleString() : '0';
    const engPct = engSlider ? (parseFloat(engSlider.value) / 10).toFixed(1) : '3.5';
    const niche = nicheSelect ? nicheSelect.value : 'mid';
    const platform = platformSelect ? platformSelect.value : 'yt-dedicated';

    const nicheLabels = { high: 'Finance / Tech / B2B', mid: 'Lifestyle / Fitness / Beauty', volume: 'Gaming / Entertainment' };
    const platformLabels = {
      'yt-dedicated': 'YouTube (Dedicated Video)',
      'yt-integration': 'YouTube (Integrated Mention)',
      'ig-reel': 'Instagram Reel',
      'tiktok': 'TikTok',
      'newsletter': 'Newsletter'
    };

    const addonLabels = {
      'addon-30day': '30-Day Paid Digital Ad Usage Rights',
      'addon-60day': '60-Day Paid Digital Ad Usage Rights',
      'addon-spark': 'Spark Ads / Whitelisting Rights',
      'addon-bio': 'Permanent Link in Bio Placement (30 Days)',
      'addon-repost': 'Cross-Platform Repost'
    };

    const checkedAddons = [];
    Object.keys(addonLabels).forEach(function (id) {
      const cb = document.getElementById(id);
      if (cb && cb.checked) checkedAddons.push(addonLabels[id]);
    });

    const deliverablesList = checkedAddons.length > 0
      ? '• ' + platformLabels[platform] + '\n' + checkedAddons.map(function (a) { return '• ' + a; }).join('\n')
      : '• ' + (platformLabels[platform] || 'Standard brand integration within content');

    const { floor, target, premium } = SR.currentRates;

    const pitch = `Subject: Partnership Inquiry – ${channelName} × ${brandName}

Hi ${brandName} Team,

I hope this message finds you well! My name is ${creatorName}, and I run ${channelName} — a ${nicheLabels[niche] || niche} focused channel with an engaged audience on ${platformLabels[platform] || platform}.

I'm reaching out because I believe there's a strong alignment between my audience and your brand. Here's a quick snapshot of what I bring to the table:

📊 Channel Stats:
• Average Views / Readership: ${views}
• Engagement Rate: ${engPct}%
• Primary Format: ${platformLabels[platform] || platform}

💼 Proposed Deliverables:
${deliverablesList}

💰 Investment Options:
• Base Integration: ${srFormatMoney(floor)}
• Recommended Package (w/ Add-ons): ${srFormatMoney(target)}
• Premium All-Inclusive Package: ${srFormatMoney(premium)}

My audience is deeply interested in ${nicheLabels[niche] || niche} content and responds strongly to authentic product recommendations.

I'd love to schedule a quick 15-minute call this week to discuss how we can tailor a campaign around your upcoming goals.

Best regards,
${creatorName}
${channelName}`;

    const pitchContent = document.getElementById('sr-pitch-content');
    const pitchTextarea = document.getElementById('sr-pitch-textarea');
    const pitchArea = document.getElementById('sr-pitch-area');
    const editPitchBtn = document.getElementById('sr-edit-pitch-btn');

    if (pitchContent) {
      pitchContent.textContent = pitch;
      pitchContent.style.display = 'block';
    }
    if (pitchTextarea) {
      pitchTextarea.value = pitch;
      pitchTextarea.style.display = 'none';
    }
    if (editPitchBtn) editPitchBtn.textContent = '✏️ Edit Pitch';
    SR.pitchEditing = false;

    if (pitchArea) pitchArea.style.display = 'flex';
  }

  // =============================================
  // === TOOL 6: LINK-IN-BIO ===
  // =============================================
  const BIO = {
    links: [
      { id: 1, title: 'YouTube Channel', url: 'https://youtube.com', icon: 'YouTube' },
      { id: 2, title: 'Follow on Instagram', url: 'https://instagram.com', icon: 'Instagram' },
      { id: 3, title: 'My Website', url: 'https://example.com', icon: 'Website' }
    ],
    nextId: 4,
    avatarDataUrl: null,
    currentTheme: 'cyberpunk',
    THEMES: {
      cyberpunk: { bg: '#0a0a1a', card: 'rgba(124,58,237,0.15)', accent: '#7c3aed', text: '#fff', subtext: '#a78bfa', btn: 'rgba(124,58,237,0.3)', btnBorder: 'rgba(124,58,237,0.6)', font: 'system-ui, -apple-system, sans-serif' },
      slate:     { bg: '#0f172a', card: 'rgba(255,255,255,0.05)', accent: '#3b82f6', text: '#f8fafc', subtext: '#94a3b8', btn: 'rgba(59,130,246,0.2)', btnBorder: 'rgba(59,130,246,0.4)', font: 'system-ui, -apple-system, sans-serif' },
      sunset:    { bg: '#1a0a05', card: 'rgba(249,115,22,0.12)', accent: '#f97316', text: '#fff7ed', subtext: '#fdba74', btn: 'rgba(249,115,22,0.2)', btnBorder: 'rgba(249,115,22,0.5)', font: 'Georgia, serif' },
      forest:    { bg: '#0a1a0f', card: 'rgba(16,185,129,0.1)', accent: '#10b981', text: '#ecfdf5', subtext: '#6ee7b7', btn: 'rgba(16,185,129,0.15)', btnBorder: 'rgba(16,185,129,0.4)', font: 'system-ui, -apple-system, sans-serif' }
    },
    ICONS: {
      Website: '🌐', YouTube: '▶️', Instagram: '📸', 'X/Twitter': '𝕏', TikTok: '🎵', GitHub: '💻', Store: '🛍️', Discord: '💬'
    }
  };

  function initLinkBio() {
    const addLinkBtn = document.getElementById('bio-add-link-btn');
    const avatarUpload = document.getElementById('bio-avatar-upload');
    const exportBtn = document.getElementById('bio-export-btn');
    const themeBtns = document.querySelectorAll('.theme-swatch');

    const nameInput = document.getElementById('bio-name');
    const handleInput = document.getElementById('bio-handle');
    const bioInput = document.getElementById('bio-bio');

    [nameInput, handleInput, bioInput].forEach(function (inp) {
      if (inp) inp.addEventListener('input', bioUpdatePreview);
    });

    if (addLinkBtn) {
      addLinkBtn.addEventListener('click', bioAddLink);
    }

    if (avatarUpload) {
      avatarUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = function (ev) {
            BIO.avatarDataUrl = ev.target.result;
            const avatarPreview = document.getElementById('bio-avatar-preview');
            if (avatarPreview) {
              avatarPreview.style.backgroundImage = 'url(' + ev.target.result + ')';
              avatarPreview.style.backgroundSize = 'cover';
              avatarPreview.style.backgroundPosition = 'center';
              avatarPreview.textContent = '';
            }
            bioUpdatePreview();
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', bioExport);
    }

    themeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        themeBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        BIO.currentTheme = btn.dataset.theme || 'cyberpunk';
        bioUpdatePreview();
      });
    });

    bioRenderLinksList();
    bioUpdatePreview();
  }

  function bioAddLink() {
    BIO.links.push({ id: BIO.nextId++, title: 'New Link', url: 'https://', icon: 'Website' });
    bioRenderLinksList();
    bioUpdatePreview();
  }

  function bioDeleteLink(id) {
    BIO.links = BIO.links.filter(function (link) { return link.id !== id; });
    bioRenderLinksList();
    bioUpdatePreview();
  }

  function bioRenderLinksList() {
    const container = document.getElementById('bio-links-list');
    if (!container) return;
    container.innerHTML = '';

    BIO.links.forEach(function (link) {
      const item = document.createElement('div');
      item.className = 'bio-link-item';

      const iconSelect = document.createElement('select');
      iconSelect.className = 'icon-select';
      Object.keys(BIO.ICONS).forEach(function (iconName) {
        const opt = document.createElement('option');
        opt.value = iconName;
        opt.textContent = BIO.ICONS[iconName] + ' ' + iconName;
        if (iconName === link.icon) opt.selected = true;
        iconSelect.appendChild(opt);
      });
      iconSelect.addEventListener('change', function () {
        link.icon = iconSelect.value;
        bioUpdatePreview();
      });

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.placeholder = 'Link Title';
      titleInput.value = link.title;
      titleInput.addEventListener('input', function () {
        link.title = titleInput.value;
        bioUpdatePreview();
      });

      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.placeholder = 'https://';
      urlInput.value = link.url;
      urlInput.addEventListener('input', function () {
        link.url = urlInput.value;
        bioUpdatePreview();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'bio-link-delete';
      deleteBtn.textContent = '🗑';
      deleteBtn.title = 'Remove link';
      deleteBtn.addEventListener('click', function () {
        bioDeleteLink(link.id);
      });

      item.appendChild(iconSelect);
      item.appendChild(titleInput);
      item.appendChild(urlInput);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  }

  function bioSanitizeUrl(rawUrl) {
    const trimmed = String(rawUrl || '').trim();
    if (!trimmed) return '#';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return 'https://' + trimmed.replace(/^\/+/, '');
  }

  function bioUpdatePreview() {
    const previewScreen = document.getElementById('bio-preview-screen');
    if (!previewScreen) return;

    const nameInput = document.getElementById('bio-name');
    const handleInput = document.getElementById('bio-handle');
    const bioInput = document.getElementById('bio-bio');

    const name = nameInput ? (nameInput.value || 'Your Name') : 'Your Name';
    const handle = handleInput ? (handleInput.value || '@yourhandle') : '@yourhandle';
    const bio = bioInput ? (bioInput.value || 'Content creator & storyteller') : 'Content creator & storyteller';

    const theme = BIO.THEMES[BIO.currentTheme] || BIO.THEMES.cyberpunk;

    let avatarHtml = '';
    if (BIO.avatarDataUrl) {
      avatarHtml = `<img src="${BIO.avatarDataUrl}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;display:block;border:2px solid ${theme.accent};" alt="Avatar">`;
    } else {
      avatarHtml = `<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,${theme.accent},${theme.btn});display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;">✨</div>`;
    }

    const linksHtml = BIO.links.map(function (link) {
      const iconChar = BIO.ICONS[link.icon] || '🔗';
      const safeUrl = bioSanitizeUrl(link.url);
      return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="background:${theme.btn};border:1px solid ${theme.btnBorder};border-radius:50px;padding:14px 20px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;color:${theme.text};font-size:14px;font-weight:500;text-decoration:none;transition:opacity 0.2s;">
        <span>${iconChar}</span><span>${escapeHtml(link.title)}</span>
      </a>`;
    }).join('');

    previewScreen.innerHTML = `<div style="min-height:100%;background:${theme.bg};padding:32px 20px;font-family:${theme.font};text-align:center;box-sizing:border-box;">
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:center;margin-bottom:12px;">${avatarHtml}</div>
        <div style="font-size:18px;font-weight:700;color:${theme.text};">${escapeHtml(name)}</div>
        <div style="font-size:13px;color:${theme.subtext};margin-top:4px;">${escapeHtml(handle)}</div>
        <div style="font-size:12px;color:${theme.subtext};margin-top:8px;line-height:1.5;">${escapeHtml(bio)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">${linksHtml}</div>
    </div>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function bioExport() {
    const nameInput = document.getElementById('bio-name');
    const handleInput = document.getElementById('bio-handle');
    const bioInput = document.getElementById('bio-bio');

    const name = nameInput ? (nameInput.value || 'My Page') : 'My Page';
    const handle = handleInput ? (handleInput.value || '@handle') : '@handle';
    const bio = bioInput ? (bioInput.value || '') : '';

    const theme = BIO.THEMES[BIO.currentTheme] || BIO.THEMES.cyberpunk;

    let avatarTag = '';
    if (BIO.avatarDataUrl) {
      avatarTag = `<img src="${BIO.avatarDataUrl}" class="avatar-img" alt="Avatar">`;
    } else {
      avatarTag = `<div class="avatar-placeholder">✨</div>`;
    }

    const linksHtml = BIO.links.map(function (link) {
      const iconChar = BIO.ICONS[link.icon] || '🔗';
      const safeUrl = bioSanitizeUrl(link.url);
      return `      <a href="${escapeHtml(safeUrl)}" class="link-btn" target="_blank" rel="noopener noreferrer">
        <span class="link-icon">${iconChar}</span>
        <span class="link-title">${escapeHtml(link.title)}</span>
      </a>`;
    }).join('\n');

    const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${theme.bg};
      font-family: ${theme.font};
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 20px;
      color: ${theme.text};
    }
    .container {
      width: 100%;
      max-width: 420px;
      text-align: center;
    }
    .avatar-img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 14px;
      border: 2px solid ${theme.accent};
    }
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${theme.accent}, ${theme.btn});
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 0 auto 14px;
    }
    .display-name {
      font-size: 20px;
      font-weight: 700;
      color: ${theme.text};
    }
    .handle {
      font-size: 14px;
      color: ${theme.subtext};
      margin-top: 5px;
    }
    .bio-text {
      font-size: 13px;
      color: ${theme.subtext};
      margin-top: 10px;
      line-height: 1.6;
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
    }
    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }
    .link-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 15px 22px;
      background: ${theme.btn};
      border: 1px solid ${theme.btnBorder};
      border-radius: 50px;
      color: ${theme.text};
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      transition: opacity 0.2s, transform 0.15s;
    }
    .link-btn:hover {
      opacity: 0.85;
      transform: translateY(-1px);
    }
    .link-icon { font-size: 18px; }
    .footer {
      margin-top: 36px;
      font-size: 11px;
      color: ${theme.subtext};
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="container">
    ${avatarTag}
    <div class="display-name">${escapeHtml(name)}</div>
    <div class="handle">${escapeHtml(handle)}</div>
    <div class="bio-text">${escapeHtml(bio)}</div>
    <div class="links">
${linksHtml}
    </div>
    <div class="footer">Made with CreatorKit</div>
  </div>
</body>
</html>`;

    try {
      const blob = new Blob([htmlString], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      const win = window.open('', '_blank');
      if (win) win.document.write(htmlString);
    }
  }

  // =============================================
  // === INIT ===
  // =============================================
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTabController();
    initSafeZone();
    initTeleprompter();
    initThreadSplitter();
    initYTPreview();
    initSponsorRate();
    initLinkBio();

    // Populate initial Thread Splitter cards
    tsSplit();
  }

})();
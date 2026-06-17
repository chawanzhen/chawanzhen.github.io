// ============================================
// Chawan Theme - Main JavaScript
// ============================================

(function () {
  'use strict';

  const DEFAULT_THEME = 'light';
  const LIGHT_MODE = 'light';
  const DARK_MODE = 'dark';

  // ========== Theme Switching ==========
  function getStoredTheme() {
    try {
      return localStorage.getItem('theme') || DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  }

  function setTheme(theme) {
    const root = document.documentElement;
    if (theme === DARK_MODE) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
    // Sync Giscus comment theme
    sendGiscusTheme(theme);
    // Switch visual effects
    if (theme === DARK_MODE) {
      stopSakura();
      startMeteor();
    } else {
      stopMeteor();
      startSakura();
    }
  }

  function sendGiscusTheme(theme) {
    var iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    var giscusTheme = theme === DARK_MODE ? 'transparent_dark' : 'light';
    iframe.contentWindow.postMessage({
      giscus: { setConfig: { theme: giscusTheme } }
    }, 'https://giscus.app');
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains('dark')
      ? DARK_MODE
      : LIGHT_MODE;
    setTheme(current === DARK_MODE ? LIGHT_MODE : DARK_MODE);
  }

  // ========== Sakura (Cherry Blossom) Effect - Light Mode ==========
  var sakuraCanvas = null;
  var sakuraCtx = null;
  var sakuraPetals = [];
  var sakuraAnimId = null;
  var sakuraSpawnId = null;
  var sakuraRunning = false;
  var sakuraColors = ['#ffb7c5', '#ffc0cb', '#fcc2d0', '#ffaabb', '#f8b5c0'];

  function initSakuraCanvas() {
    if (sakuraCanvas) return;
    sakuraCanvas = document.createElement('canvas');
    sakuraCanvas.id = 'sakura-canvas';
    document.body.appendChild(sakuraCanvas);
    sakuraCtx = sakuraCanvas.getContext('2d');
    resizeSakura();
    window.addEventListener('resize', resizeSakura);
  }

  function resizeSakura() {
    if (!sakuraCanvas) return;
    sakuraCanvas.width = window.innerWidth;
    sakuraCanvas.height = window.innerHeight;
  }

  function createPetal() {
    return {
      x: Math.random() * window.innerWidth,
      y: -30,
      size: 10 + Math.random() * 12,
      speed: 0.3 + Math.random() * 0.7,
      swayAmp: 0.3 + Math.random() * 0.7,
      swayFreq: 0.008 + Math.random() * 0.015,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      opacity: 0.45 + Math.random() * 0.4,
      color: sakuraColors[Math.floor(Math.random() * sakuraColors.length)]
    };
  }

  function drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;

    // Main petal shape
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker center crease
    ctx.fillStyle = 'rgba(220, 120, 140, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.12, p.size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function updatePetal(p) {
    p.y += p.speed;
    p.x += Math.sin(p.swayPhase + p.y * p.swayFreq) * p.swayAmp;
    p.rotation += p.rotSpeed;
  }

  function animateSakura() {
    if (!sakuraRunning) return;
    sakuraCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

    for (var i = sakuraPetals.length - 1; i >= 0; i--) {
      var p = sakuraPetals[i];
      updatePetal(p);
      drawPetal(sakuraCtx, p);
      if (p.y > window.innerHeight + 40) {
        sakuraPetals.splice(i, 1);
      }
    }
    sakuraAnimId = requestAnimationFrame(animateSakura);
  }

  function startSakura() {
    if (sakuraRunning) return;
    initSakuraCanvas();
    resizeSakura();
    sakuraRunning = true;

    // Scatter initial petals across the screen
    for (var i = 0; i < 18; i++) {
      var p = createPetal();
      p.y = Math.random() * window.innerHeight;
      sakuraPetals.push(p);
    }

    sakuraSpawnId = setInterval(function () {
      if (sakuraPetals.length < 30) {
        sakuraPetals.push(createPetal());
      }
    }, 250);

    animateSakura();
  }

  function stopSakura() {
    sakuraRunning = false;
    if (sakuraAnimId) { cancelAnimationFrame(sakuraAnimId); sakuraAnimId = null; }
    if (sakuraSpawnId) { clearInterval(sakuraSpawnId); sakuraSpawnId = null; }
    sakuraPetals.length = 0;
    if (sakuraCtx) sakuraCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);
  }

  // ========== Meteor (Shooting Star) Effect - Dark Mode ==========
  var meteorCanvas = null;
  var meteorCtx = null;
  var meteors = [];
  var meteorAnimId = null;
  var meteorTimerId = null;
  var meteorRunning = false;

  function initMeteorCanvas() {
    if (meteorCanvas) return;
    meteorCanvas = document.createElement('canvas');
    meteorCanvas.id = 'meteor-canvas';
    document.body.appendChild(meteorCanvas);
    meteorCtx = meteorCanvas.getContext('2d');
    resizeMeteor();
    window.addEventListener('resize', resizeMeteor);
  }

  function resizeMeteor() {
    if (!meteorCanvas) return;
    meteorCanvas.width = window.innerWidth;
    meteorCanvas.height = window.innerHeight;
  }

  function createMeteor() {
    var angle = Math.PI * 0.22 + Math.random() * Math.PI * 0.38;
    return {
      x: window.innerWidth * (0.2 + Math.random() * 0.75),
      y: Math.random() * window.innerHeight * 0.08,
      length: 200 + Math.random() * 280,
      speed: 8 + Math.random() * 14,
      angle: angle,
      life: 1
    };
  }

  function drawMeteor(ctx, m) {
    var a = m.life;
    var hx = m.x;
    var hy = m.y;
    var tx = hx + Math.cos(m.angle) * m.length;
    var ty = hy - Math.sin(m.angle) * m.length;

    // Subtle glow — only around the front 25% of the trail, tight
    var glowLen = m.length * 0.25;
    var glowTx = hx + Math.cos(m.angle) * glowLen;
    var glowTy = hy - Math.sin(m.angle) * glowLen;
    var glowGrad = ctx.createLinearGradient(hx, hy, glowTx, glowTy);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (a * 0.25) + ')');
    glowGrad.addColorStop(0.6, 'rgba(255, 255, 255, ' + (a * 0.08) + ')');
    glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(glowTx, glowTy);
    ctx.strokeStyle = glowGrad;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Core line — thin, bright near head, long gentle fade
    var coreGrad = ctx.createLinearGradient(hx, hy, tx, ty);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (a * 0.7) + ')');
    coreGrad.addColorStop(0.04, 'rgba(255, 255, 255, ' + a + ')');
    coreGrad.addColorStop(0.12, 'rgba(255, 255, 255, ' + (a * 0.6) + ')');
    coreGrad.addColorStop(0.35, 'rgba(255, 255, 255, ' + (a * 0.18) + ')');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = coreGrad;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tiny bright point at the tip
    ctx.beginPath();
    ctx.arc(hx, hy, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, ' + (a * 0.9) + ')';
    ctx.fill();
  }

  function animateMeteor() {
    if (!meteorRunning) return;
    meteorCtx.clearRect(0, 0, meteorCanvas.width, meteorCanvas.height);

    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.x -= Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.life -= 0.004;
      if (m.life <= 0 || m.y > window.innerHeight + 80 || m.x < -80) {
        meteors.splice(i, 1);
      } else {
        drawMeteor(meteorCtx, m);
      }
    }
    meteorAnimId = requestAnimationFrame(animateMeteor);
  }

  function scheduleMeteor() {
    if (!meteorRunning) return;
    var delay = 800 + Math.random() * 3500;
    meteorTimerId = setTimeout(function () {
      if (!meteorRunning) return;
      meteors.push(createMeteor());
      scheduleMeteor();
    }, delay);
  }

  function startMeteor() {
    if (meteorRunning) return;
    initMeteorCanvas();
    resizeMeteor();
    meteorRunning = true;
    meteors.push(createMeteor());
    scheduleMeteor();
    animateMeteor();
  }

  function stopMeteor() {
    meteorRunning = false;
    if (meteorAnimId) { cancelAnimationFrame(meteorAnimId); meteorAnimId = null; }
    if (meteorTimerId) { clearTimeout(meteorTimerId); meteorTimerId = null; }
    meteors.length = 0;
    if (meteorCtx) meteorCtx.clearRect(0, 0, meteorCanvas.width, meteorCanvas.height);
  }

  // ========== Wallpaper Carousel ==========
  function initWallpaper() {
    var wallItems = document.querySelectorAll('.wallpaper-item');
    var carousel = document.getElementById('banner-carousel');
    if (!wallItems.length) return;

    // If there's a banner carousel, sync wallpaper with it
    if (carousel) {
      var observer = new MutationObserver(function() {
        var activeBanner = carousel.querySelector('.carousel-item.active');
        if (!activeBanner) return;
        var items = carousel.querySelectorAll('.carousel-item');
        var idx = Array.prototype.indexOf.call(items, activeBanner);
        if (idx >= 0 && idx < wallItems.length) {
          syncWallpaper(idx);
        }
      });
      observer.observe(carousel, { attributes: true, subtree: true, attributeFilter: ['class'] });
      return;
    }

    // No carousel: cycle wallpaper images
    if (wallItems.length <= 1) return;
    var wIdx = 0;
    function syncWallpaper(index) {
      for (var i = 0; i < wallItems.length; i++) {
        wallItems[i].classList.remove('active');
      }
      wallItems[index].classList.add('active');
    }
    setInterval(function() {
      wIdx = (wIdx + 1) % wallItems.length;
      syncWallpaper(wIdx);
    }, 6000);
  }

  // ========== Banner Carousel ==========
  function initCarousel() {
    var carousel = document.getElementById('banner-carousel');
    if (!carousel) { return; }

    var items = carousel.querySelectorAll('.carousel-item');
    var dots = carousel.querySelectorAll('.carousel-dot');
    if (items.length <= 1) { return; }

    var currentIndex = 0;
    var isPaused = false;
    var intervalMs = (parseInt(carousel.dataset.interval) || 3) * 1000;
    var timerId = null;

    function switchTo(index) {
      // Remove active from all items
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
        if (dots[i]) dots[i].classList.remove('active');
      }
      // Set active on target
      items[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
      currentIndex = index;
    }

    function nextSlide() {
      if (!isPaused) {
        switchTo((currentIndex + 1) % items.length);
      }
    }

    function startTimer() {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(nextSlide, intervalMs);
    }

    // Dot click handlers
    for (var d = 0; d < dots.length; d++) {
      (function(idx) {
        dots[idx].addEventListener('click', function() {
          switchTo(idx);
          // Reset timer on manual interaction
          startTimer();
        });
      })(d);
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', function() { isPaused = true; });
    carousel.addEventListener('mouseleave', function() { isPaused = false; });

    // Touch swipe for mobile
    var startX = 0;
    var isSwiping = false;
    carousel.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      isSwiping = false;
      isPaused = true;
    }, { passive: true });

    carousel.addEventListener('touchend', function(e) {
      if (isSwiping) {
        var endX = e.changedTouches[0].clientX;
        var diff = startX - endX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            switchTo((currentIndex + 1) % items.length);
          } else {
            switchTo((currentIndex - 1 + items.length) % items.length);
          }
        }
      }
      isPaused = false;
      startTimer();
    });

    startTimer();
  }

  // ========== Typewriter Effect ==========
  function initTypewriter() {
    var el = document.getElementById('banner-typewriter');
    if (!el) return;

    var texts = [];
    try {
      texts = JSON.parse(el.dataset.texts || '[]');
    } catch (e) {
      return;
    }
    if (texts.length === 0) return;

    var speed = parseInt(el.dataset.speed) || 100;
    var deleteSpeed = parseInt(el.dataset.deleteSpeed) || 50;
    var pauseTime = parseInt(el.dataset.pauseTime) || 2000;

    var textIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function type() {
      var currentText = texts[textIndex];

      if (isDeleting) {
        el.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentText.length) {
        setTimeout(function () {
          isDeleting = true;
          type();
        }, pauseTime);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, 500);
        return;
      }

      setTimeout(type, isDeleting ? deleteSpeed : speed);
    }

    type();
  }

  // ========== Navbar Scroll Detection ==========
  function initNavbarScroll() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    var mode = navbar.getAttribute('data-transparent-mode');
    if (mode !== 'semifull') return;

    var isHome = navbar.getAttribute('data-is-home') === 'true';
    if (!isHome) {
      navbar.classList.add('scrolled');
      return;
    }

    var ticking = false;
    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ========== Back to Top ==========
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    var ticking = false;
    function update() {
      if (window.pageYOffset > 300) {
        btn.classList.remove('hide');
      } else {
        btn.classList.add('hide');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
  }

  // ========== TOC Active State ==========
  function initTOC() {
    var tocLinks = document.querySelectorAll('.toc-item a');
    if (!tocLinks.length) return;

    var headings = [];
    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var el = document.getElementById(href.substring(1));
        if (el) headings.push({ link: link, el: el });
      }
    });

    if (!headings.length) return;

    var ticking = false;
    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var current = null;

      for (var i = 0; i < headings.length; i++) {
        if (headings[i].el.offsetTop - 100 <= scrollTop) {
          current = headings[i];
        } else {
          break;
        }
      }

      headings.forEach(function (h) {
        h.link.parentElement.classList.remove('active');
      });

      if (current) {
        current.link.parentElement.classList.add('active');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ========== Post List Layout Switch ==========
  function initLayoutSwitch() {
    var container = document.getElementById('post-list-container');
    if (!container) return;

    var btn = document.getElementById('layout-switch-btn');
    var saved = null;
    try { saved = localStorage.getItem('postListLayout'); } catch (e) {}

    function applyLayout(mode) {
      container.classList.remove('list-mode', 'grid-mode');
      container.classList.add(mode + '-mode');
      if (btn) {
        btn.textContent = mode === 'grid' ? '☷' : '⊞';
      }
    }

    var current = saved || container.dataset.defaultLayout || 'list';
    applyLayout(current);

    if (btn) {
      btn.addEventListener('click', function () {
        var isGrid = container.classList.contains('grid-mode');
        var next = isGrid ? 'list' : 'grid';
        applyLayout(next);
        try { localStorage.setItem('postListLayout', next); } catch (e) {}
      });
    }
  }

  // ========== Scroll Reveal ==========
  function initScrollReveal() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    var targets = document.querySelectorAll('.scroll-reveal');
    for (var i = 0; i < targets.length; i++) {
      observer.observe(targets[i]);
    }
  }

  // ========== Banner Text Fade on Scroll ==========
  function initBannerTextFade() {
    var overlay = document.querySelector('.banner-text-overlay');
    if (!overlay) return;

    var banner = document.getElementById('banner-wrapper');
    if (!banner) return;

    var ticking = false;
    function update() {
      var bannerHeight = banner.offsetHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Fade out as user scrolls, fully hidden after scrolling 40% of banner height
      var fadeStart = 0;
      var fadeEnd = bannerHeight * 0.4;
      var progress = Math.min(1, Math.max(0, (scrollTop - fadeStart) / (fadeEnd - fadeStart)));

      overlay.style.opacity = (1 - progress).toFixed(2);
      if (progress >= 1) {
        overlay.classList.add('scrolled-past');
      } else {
        overlay.classList.remove('scrolled-past');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ========== Mobile Sidebar ==========
  function initMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    var isMobile = window.matchMedia('(max-width: 1023px)');

    function setupMobile() {
      if (!isMobile.matches) return;
      if (document.getElementById('sidebar-toggle-fab')) return;

      // Create FAB button
      var fab = document.createElement('button');
      fab.id = 'sidebar-toggle-fab';
      fab.className = 'sidebar-toggle-fab';
      fab.innerHTML = '☰';
      fab.setAttribute('aria-label', 'Toggle sidebar');
      document.body.appendChild(fab);

      // Create backdrop
      var backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.style.display = 'none';
      document.body.appendChild(backdrop);

      function openSidebar() {
        sidebar.classList.add('sidebar-overlay-open');
        backdrop.style.display = 'block';
        fab.style.display = 'none';
      }

      function closeSidebar() {
        sidebar.classList.remove('sidebar-overlay-open');
        backdrop.style.display = 'none';
        fab.style.display = 'flex';
      }

      fab.addEventListener('click', openSidebar);
      backdrop.addEventListener('click', closeSidebar);
    }

    setupMobile();
    isMobile.addEventListener('change', setupMobile);
  }

  // ========== Mobile Menu Toggle ==========
  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var panel = document.getElementById('mobile-menu-panel');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', function() {
      var isOpen = panel.style.display === 'block';
      panel.style.display = isOpen ? 'none' : 'block';
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (panel.style.display !== 'block') return;
      if (!panel.contains(e.target) && e.target !== toggle) {
        panel.style.display = 'none';
      }
    });
  }

  // ========== Code Block Language Badge ==========
  function initCodeBlockBadges() {
    var blocks = document.querySelectorAll('figure.highlight');
    for (var i = 0; i < blocks.length; i++) {
      var cls = blocks[i].classList;
      for (var j = 0; j < cls.length; j++) {
        if (cls[j] !== 'highlight') {
          blocks[i].setAttribute('data-lang', cls[j]);
          break;
        }
      }
    }
  }

  // ========== Init on Load ==========
  function init() {
    // Load saved theme
    setTheme(getStoredTheme());

    // Init components
    initWallpaper();
    initCarousel();
    initTypewriter();
    initNavbarScroll();
    initBannerTextFade();
    initBackToTop();
    initTOC();
    initLayoutSwitch();
    initScrollReveal();
    initMobileSidebar();
    initMobileMenu();
    initCodeBlockBadges();

    // Theme toggle button
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var backTop = document.querySelector('[data-back-top]');

  function updateScrollState() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    if (backTop) {
      backTop.classList.toggle('is-visible', window.scrollY > 360);
    }
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.js-filter-input').forEach(function (input) {
    var container = input.closest('main') || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll('.js-filter-card'));
    var counter = container.querySelector('[data-filter-count]');

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' ').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (counter) {
        counter.textContent = visible + ' 部';
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-start]');
    var message = shell.querySelector('[data-player-message]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function initPlayer() {
      if (!video || !source || initialized) {
        return;
      }
      initialized = true;
      setMessage('正在加载播放源...');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('播放源已就绪');
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放出错，请刷新页面或稍后重试');
            if (hls) {
              hls.destroy();
              hls = null;
            }
            initialized = false;
          }
        });
      } else {
        setMessage('当前浏览器不支持 HLS 播放');
      }
    }

    function startPlayback() {
      initPlayer();
      if (!video) {
        return;
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          setMessage('浏览器阻止自动播放，请再次点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setMessage('正在播放');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
        setMessage('已暂停');
      });
      video.addEventListener('waiting', function () {
        setMessage('缓冲中...');
      });
      video.addEventListener('canplay', function () {
        setMessage('播放源已就绪');
      });
    }
  });
})();

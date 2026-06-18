
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var area = form.parentElement.querySelector('[data-filter-area]');
      var empty = form.parentElement.querySelector('[data-empty-state]');
      if (!area) {
        return;
      }
      var cards = Array.prototype.slice.call(area.querySelectorAll('[data-title]'));
      var keyword = form.querySelector('[name="keyword"]');
      var year = form.querySelector('[name="year"]');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var hay = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var ok = (!q || hay.indexOf(q) !== -1) && (!y || card.getAttribute('data-year') === y);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('reset', function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  function setupPlayers() {
    var units = Array.prototype.slice.call(document.querySelectorAll('.player-unit[data-hls]'));
    units.forEach(function (unit) {
      var video = unit.querySelector('video');
      var trigger = unit.querySelector('.player-cover');
      var src = unit.getAttribute('data-hls');
      var loaded = false;
      var hls = null;

      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      function load() {
        if (!video || !src) {
          return;
        }
        unit.classList.add('is-playing');
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(src);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          return;
        }
        video.src = src;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
      }

      if (trigger) {
        trigger.addEventListener('click', load);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            load();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.filter-grid'));
    if (!grids.length) {
      return;
    }
    var searchInput = document.querySelector('.movie-search');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var empty = document.querySelector('.empty-state');
    function matches(card, query, filterValues) {
      var title = (card.dataset.title || '').toLowerCase();
      var region = (card.dataset.region || '').toLowerCase();
      var type = (card.dataset.type || '').toLowerCase();
      var year = (card.dataset.year || '').toLowerCase();
      var tags = (card.dataset.tags || '').toLowerCase();
      var haystack = [title, region, type, year, tags].join(' ');
      var ok = !query || haystack.indexOf(query) !== -1;
      if (filterValues.type) {
        ok = ok && type.indexOf(filterValues.type) !== -1;
      }
      if (filterValues.region) {
        ok = ok && region.indexOf(filterValues.region) !== -1;
      }
      if (filterValues.year) {
        ok = ok && year.indexOf(filterValues.year) !== -1;
      }
      return ok;
    }
    function apply() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var filterValues = {};
      selects.forEach(function (select) {
        filterValues[select.dataset.filter] = select.value.trim().toLowerCase();
      });
      var visible = 0;
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
          var show = matches(card, query, filterValues);
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  function initGlobalSearch() {
    var input = document.querySelector('.global-search');
    var box = document.querySelector('.search-results');
    var data = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !box || !data.length) {
      return;
    }
    function render(items) {
      if (!items.length) {
        box.classList.remove('is-open');
        box.innerHTML = '';
        return;
      }
      box.innerHTML = items.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
          '</a>';
      }).join('');
      box.classList.add('is-open');
    }
    function search() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        render([]);
        return;
      }
      var results = data.filter(function (item) {
        return item.search.indexOf(query) !== -1;
      }).slice(0, 8);
      render(results);
    }
    input.addEventListener('input', search);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var first = box.querySelector('a');
        if (first) {
          window.location.href = first.getAttribute('href');
        }
      }
    });
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove('is-open');
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initGlobalSearch();
  });
})();

function setupPlayer(source) {
  var video = document.querySelector('.player-video');
  var overlay = document.querySelector('.player-overlay');
  var hlsInstance = null;
  if (!video || !source) {
    return;
  }
  function attach() {
    if (video.dataset.ready === 'true') {
      return;
    }
    video.dataset.ready = 'true';
    video.setAttribute('controls', 'controls');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }
  function start() {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

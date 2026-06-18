(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-soft-cover]').forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('is-hidden');
    });
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const nextButton = document.querySelector('[data-hero-next]');
  const prevButton = document.querySelector('[data-hero-prev]');
  let heroIndex = 0;
  let heroTimer = null;

  const showHero = (index) => {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  };

  const startHero = () => {
    if (slides.length < 2) return;
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => showHero(heroIndex + 1), 5600);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showHero(Number(dot.dataset.heroDot || 0));
      startHero();
    });
  });

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showHero(heroIndex + 1);
      startHero();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showHero(heroIndex - 1);
      startHero();
    });
  }

  showHero(0);
  startHero();

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const updateScope = (scope) => {
    const input = scope.querySelector('[data-search-input]');
    const typeFilter = scope.querySelector('[data-type-filter]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('[data-empty-state]');
    const q = normalize(input ? input.value : '');
    const type = typeFilter ? typeFilter.value : '';
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.search || card.textContent);
      const cardType = card.dataset.type || '';
      const okText = !q || text.includes(q);
      const okType = !type || cardType.includes(type);
      const show = okText && okType;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  document.querySelectorAll('[data-search-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-search-input]');
    const typeFilter = scope.querySelector('[data-type-filter]');
    if (input) {
      input.addEventListener('input', () => updateScope(scope));
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', () => updateScope(scope));
    }
    updateScope(scope);
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    document.querySelectorAll('[data-search-input]').forEach((input) => {
      input.value = query;
      const scope = input.closest('[data-search-scope]');
      if (scope) updateScope(scope);
    });
  }

  const startPlayer = (box) => {
    const video = box.querySelector('video');
    const cover = box.querySelector('[data-player-cover]');
    const message = box.querySelector('[data-player-message]');
    const stream = box.dataset.stream;

    if (!video || !stream) return;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;

    const playVideo = () => {
      const action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(() => {
          if (message) message.textContent = '点击视频继续播放';
        });
      }
    };

    if (video.dataset.ready === stream) {
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      const hls = new window.Hls({ enableWorker: true });
      video._hlsPlayer = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.dataset.ready = stream;
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal && message) {
          message.textContent = '播放暂时不可用，请稍后重试。';
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = stream;
      playVideo();
      return;
    }

    if (message) {
      message.textContent = '播放暂时不可用，请稍后重试。';
    }
  };

  document.querySelectorAll('[data-player]').forEach((box) => {
    const button = box.querySelector('[data-play-button]');
    const cover = box.querySelector('[data-player-cover]');
    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        startPlayer(box);
      });
    }
    if (cover) {
      cover.addEventListener('click', () => startPlayer(box));
    }
  });
})();

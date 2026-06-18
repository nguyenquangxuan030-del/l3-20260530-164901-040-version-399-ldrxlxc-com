const state = {
    hlsLoader: null
};

function selectAll(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

function setupHeader() {
    const header = document.querySelector('[data-site-header]');
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    }

    const update = () => {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > 12);
        }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
}

function setupBackTop() {
    const button = document.querySelector('[data-back-top]');

    if (!button) {
        return;
    }

    const update = () => {
        button.classList.toggle('is-visible', window.scrollY > 500);
    };

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
}

function setupHero() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = selectAll('[data-hero-slide]', hero);
    const dots = selectAll('[data-hero-dot]', hero);
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const schedule = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            show(dotIndex);
            schedule();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            show(index - 1);
            schedule();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            show(index + 1);
            schedule();
        });
    }

    show(0);
    schedule();
}

function setupLocalFilters() {
    const input = document.querySelector('[data-filter-input]');
    const region = document.querySelector('[data-region-select]');
    const year = document.querySelector('[data-year-select]');
    const cards = selectAll('[data-card]');
    const empty = document.querySelector('[data-filter-empty]');

    if (!input || !cards.length) {
        return;
    }

    const filter = () => {
        const keyword = input.value.trim().toLowerCase();
        const regionValue = region ? region.value : '';
        const yearValue = year ? year.value : '';
        let visible = 0;

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.type
            ].join(' ').toLowerCase();
            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesRegion = !regionValue || (card.dataset.region || '').includes(regionValue);
            const matchesYear = !yearValue || card.dataset.year === yearValue;
            const show = matchesKeyword && matchesRegion && matchesYear;

            card.hidden = !show;

            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    };

    input.addEventListener('input', filter);

    if (region) {
        region.addEventListener('change', filter);
    }

    if (year) {
        year.addEventListener('change', filter);
    }

    filter();
}

function movieResultCard(movie) {
    const tags = movie.genres.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

    return `
        <article class="movie-card" data-card>
            <a class="poster-link" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
                <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="poster-shade"></span>
                <span class="play-badge">▶</span>
            </a>
            <div class="movie-card-body">
                <div class="tag-row">${tags}</div>
                <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
                <p class="movie-line">${escapeHtml(movie.oneLine)}</p>
                <div class="movie-meta">
                    <span>${escapeHtml(movie.year)}</span>
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.type)}</span>
                </div>
            </div>
        </article>`;
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function setupGlobalSearch() {
    const input = document.querySelector('[data-global-search]');
    const results = document.querySelector('[data-search-results]');
    const empty = document.querySelector('[data-search-empty]');
    const chips = selectAll('[data-search-chip]');
    const data = window.FilmSearchData || [];

    if (!input || !results) {
        return;
    }

    const render = () => {
        const keyword = input.value.trim().toLowerCase();
        const matched = data.filter((movie) => {
            const text = [
                movie.title,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(' ').toLowerCase();

            return !keyword || text.includes(keyword);
        }).slice(0, 120);

        results.innerHTML = matched.map(movieResultCard).join('');

        if (empty) {
            empty.classList.toggle('is-visible', matched.length === 0);
        }
    };

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            input.value = chip.dataset.searchChip || '';
            render();
            input.focus();
        });
    });

    input.addEventListener('input', render);
    render();
}

async function loadHls() {
    if (!state.hlsLoader) {
        state.hlsLoader = import('./hls-vendor-bbsaiqh1.js').then((module) => module.H);
    }

    return state.hlsLoader;
}

function showPlayerMessage(button, message) {
    const shell = button.closest('.player-shell');
    const target = shell ? shell.querySelector('[data-player-message]') : null;

    if (target) {
        target.textContent = message;
    }
}

async function startPlayer(button) {
    const video = document.getElementById(button.dataset.video || '');
    const source = button.dataset.src || '';

    if (!video || !source) {
        showPlayerMessage(button, '播放暂不可用，请稍后再试。');
        return;
    }

    button.classList.add('is-hidden');
    showPlayerMessage(button, '');

    try {
        if (video.hlsInstance) {
            video.hlsInstance.destroy();
            video.hlsInstance = null;
        }

        const Hls = await loadHls();

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            video.hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    showPlayerMessage(button, '播放暂不可用，请稍后再试。');
                    button.classList.remove('is-hidden');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            showPlayerMessage(button, '播放暂不可用，请稍后再试。');
            button.classList.remove('is-hidden');
            return;
        }

        await video.play();
    } catch (error) {
        showPlayerMessage(button, '播放暂不可用，请稍后再试。');
        button.classList.remove('is-hidden');
    }
}

function setupPlayers() {
    selectAll('[data-player-button]').forEach((button) => {
        button.addEventListener('click', () => startPlayer(button));
    });
}

setupHeader();
setupBackTop();
setupHero();
setupLocalFilters();
setupGlobalSearch();
setupPlayers();

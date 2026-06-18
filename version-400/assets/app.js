(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));

    function filterCards() {
        if (!input || !cards.length) {
            return;
        }
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
            var query = (card.getAttribute('data-query') || card.textContent || '').toLowerCase();
            card.classList.toggle('is-hidden-card', value && query.indexOf(value) === -1);
        });
    }

    if (input) {
        input.addEventListener('input', filterCards);
    }

    sortButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var mode = button.getAttribute('data-sort');
            var containers = Array.prototype.slice.call(document.querySelectorAll('.movie-grid, .rank-list'));
            containers.forEach(function (container) {
                var children = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
                children.sort(function (a, b) {
                    if (mode === 'year') {
                        return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
                    }
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
                children.forEach(function (child) {
                    container.appendChild(child);
                });
            });
        });
    });
})();

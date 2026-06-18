(function () {
  const header = document.querySelector(".js-site-header");
  const menuButton = document.querySelector(".js-menu-toggle");
  const mobileNav = document.querySelector(".js-mobile-nav");
  const backTop = document.querySelector(".js-back-top");

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-solid", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle(
        "no-scroll",
        mobileNav.classList.contains("is-open"),
      );
    });
  }

  if (backTop) {
    window.addEventListener(
      "scroll",
      function () {
        backTop.classList.toggle("is-visible", window.scrollY > 520);
      },
      { passive: true },
    );

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const hero = document.querySelector(".js-hero");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const previous = hero.querySelector(".js-hero-prev");
    const next = hero.querySelector(".js-hero-next");
    let index = Math.max(
      0,
      slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      }),
    );
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        schedule();
      });
    });

    show(index);
    schedule();
  }

  const searchForm = document.querySelector(".js-site-search");

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = searchForm.querySelector("input");
      const value = input ? input.value.trim() : "";
      const target = searchForm.getAttribute("data-target") || "archive.html";
      window.location.href = value
        ? target + "?q=" + encodeURIComponent(value)
        : target;
    });
  }

  const filterInput = document.querySelector(".js-filter-input");
  const cards = Array.from(
    document.querySelectorAll(".movie-card[data-search]"),
  );

  if (filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
      filterInput.value = query;
    }

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function applyFilter() {
      const value = normalize(filterInput.value);
      cards.forEach(function (card) {
        const text = normalize(card.getAttribute("data-search"));
        card.classList.toggle(
          "is-hidden",
          Boolean(value) && !text.includes(value),
        );
      });
    }

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }
})();

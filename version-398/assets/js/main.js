(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function move(step) {
        show(current + step);
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          move(1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      slider.querySelectorAll("[data-slide]").forEach(function (button) {
        button.addEventListener("click", function () {
          var direction = button.getAttribute("data-slide") === "next" ? 1 : -1;
          move(direction);
          start();
        });
      });

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var search = panel.querySelector("[data-filter-search]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function applyFilters() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var values = selects.map(function (select) {
          return {
            field: select.getAttribute("data-filter-field"),
            value: select.value.trim().toLowerCase()
          };
        });
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = !query || text.indexOf(query) !== -1;
          values.forEach(function (item) {
            if (item.value) {
              var fieldValue = (card.getAttribute("data-" + item.field) || "").toLowerCase();
              ok = ok && fieldValue.indexOf(item.value) !== -1;
            }
          });
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (search) {
        search.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
    });
  });
})();

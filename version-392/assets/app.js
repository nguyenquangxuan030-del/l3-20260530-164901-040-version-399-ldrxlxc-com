(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var tabs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-tab]"));
    var cards = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-card]"));
    var images = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-bg]"));
    var activeIndex = 0;

    function setHero(index) {
      activeIndex = index % cards.length;
      tabs.forEach(function (tab, i) {
        tab.classList.toggle("active", i === activeIndex);
      });
      cards.forEach(function (card, i) {
        card.classList.toggle("active", i === activeIndex);
      });
      images.forEach(function (image, i) {
        image.classList.toggle("active", i === activeIndex);
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        setHero(index);
      });
    });

    if (cards.length > 1) {
      window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5200);
    }
  }

  var filterGrid = document.querySelector("[data-filter-grid]");
  if (filterGrid) {
    var filterInput = document.querySelector("[data-filter-input]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var emptyState = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card, .rank-item"));

    function applyFilter() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (region && card.getAttribute("data-region") !== region) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [filterInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  }

  var searchResults = document.querySelector("[data-search-results]");
  if (searchResults && window.MOVIES_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-page-input]");
    var empty = document.querySelector("[data-search-empty]");

    if (input) {
      input.value = q;
    }

    function cardTemplate(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"./" + movie.file + "\">",
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<h3><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"movie-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.genre) + "</div>",
        "<div class=\"tag-row\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    var terms = q.toLowerCase();
    var results = window.MOVIES_INDEX.filter(function (movie) {
      if (!terms) {
        return true;
      }
      return [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.tags.join(" "), movie.oneLine]
        .join(" ")
        .toLowerCase()
        .indexOf(terms) !== -1;
    }).slice(0, 240);

    searchResults.innerHTML = results.map(cardTemplate).join("");
    if (empty) {
      empty.classList.toggle("is-visible", results.length === 0);
    }
  }
})();

var MoviePlayer = {
  boot: function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !button || !source) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
};

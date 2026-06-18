(function () {
  function attach(video, url) {
    if (!video || video.getAttribute("data-ready") === "1") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.setAttribute("data-ready", "1");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hls = hls;
      video.setAttribute("data-ready", "1");
      return;
    }

    video.src = url;
    video.setAttribute("data-ready", "1");
  }

  window.startMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var layer = document.getElementById(options.layerId);
    var button = document.getElementById(options.buttonId);

    function play() {
      attach(video, options.url);
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (video) {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "1") {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
    }
  };
})();

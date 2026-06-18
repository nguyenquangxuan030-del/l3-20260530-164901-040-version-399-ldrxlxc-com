(function () {
  function initPlayer(shell) {
    const video = shell.querySelector(".js-movie-video");
    const button = shell.querySelector(".js-player-start");
    const status = shell.parentElement.querySelector(".js-player-status");

    if (!video) {
      return;
    }

    const source = video.getAttribute("data-src");

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (button) {
        button.classList.remove("is-hidden");
      }
    }

    function startPlayback() {
      hideButton();
      const playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          showButton();
          setStatus("点击播放按钮开始观看");
        });
      }
    }

    if (source) {
      const Hls = window.Hls;

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus("准备就绪");
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络连接不稳定，请稍后重试");
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("视频正在恢复播放");
            hls.recoverMediaError();
          } else {
            setStatus("播放暂时不可用，请刷新后再试");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("准备就绪");
      } else {
        setStatus("该视频暂时无法在此设备播放");
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideButton);
    video.addEventListener("pause", showButton);
  }

  document.querySelectorAll(".js-video-shell").forEach(initPlayer);
})();

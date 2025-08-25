document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('matchVideo');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const timeline = document.getElementById('videoTimeline');
    const currentTimeText = document.getElementById('currentTime');
    const durationText = document.getElementById('durationTime');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    

    if (!video || !timeline) return;

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ✅ Ensure correct numeric max/step
    video.addEventListener('loadedmetadata', () => {
        timeline.max = String(Math.floor(video.duration));
        timeline.step = "0.1";  // allow smooth scrubbing
        timeline.value = "0";
        durationText.textContent = formatTime(video.duration);
        currentTimeText.textContent = "0:00";
    });

    // ✅ Update timeline properly
    video.addEventListener('timeupdate', () => {
        timeline.value = String(video.currentTime);
        currentTimeText.textContent = formatTime(video.currentTime);
    });

    // ✅ Fix Chrome/Edge seek issue
    timeline.addEventListener('input', (e) => {
        const newTime = parseFloat(e.target.value);
        if (!isNaN(newTime)) {
            video.currentTime = newTime;
        }
    });

    // Fallback on change
    timeline.addEventListener('change', (e) => {
        const newTime = parseFloat(e.target.value);
        if (!isNaN(newTime)) {
            video.currentTime = newTime;
        }
    });

    // Play/Pause/Seek
    playBtn.addEventListener('click', () => video.play());
    pauseBtn.addEventListener('click', () => video.pause());

    rewindBtn.addEventListener('click', () => {
        const newTime = Math.max(0, video.currentTime - 5);
        video.currentTime = newTime;
        timeline.value = String(newTime);
    });

    forwardBtn.addEventListener('click', () => {
        const newTime = Math.min(video.duration, video.currentTime + 5);
        video.currentTime = newTime;
        timeline.value = String(newTime);
    });
    fullscreenBtn.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) { // Safari
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { // IE/Edge
            video.msRequestFullscreen();
        }
    });
});

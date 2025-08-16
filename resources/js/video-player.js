document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('video');

    const playBtn = document.getElementById('playBtn');
    // const pauseBtn = document.getElementById('pauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const timeline = document.getElementById('videoTimeline');
    const currentTimeText = document.getElementById('currentTime');
    const durationText = document.getElementById('durationTime');

    // Format seconds to mm:ss
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update timeline max when video metadata is loaded
    video.addEventListener('loadedmetadata', () => {
        timeline.max = video.duration;
        durationText.textContent = formatTime(video.duration);
    });

    // Update timeline and current time while video plays
    video.addEventListener('timeupdate', () => {
        timeline.value = video.currentTime;
        currentTimeText.textContent = formatTime(video.currentTime);
    });

    // Seek video when user drags timeline
    timeline.addEventListener('input', () => {
        video.currentTime = timeline.value;
    });
    playBtn.addEventListener('click', () => {
        if (video.paused) {
            playBtn.innerHTML="Stop";
            video.play();
            
        }
        else {
            playBtn.innerHTML="Play";
            video.pause();
            
        }
    });

    // pauseBtn.addEventListener('click', () => {
    //     video.pause();
    // });

    rewindBtn.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 5);
    });

    forwardBtn.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
    });
});

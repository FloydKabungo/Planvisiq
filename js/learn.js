/** Accessible chapter navigation for the self-hosted walkthrough. No services or tracking. */
export function setupWalkthrough(root = document) {
  const video = root.querySelector('#walkthrough-video');
  if (!video) return;
  const buttons = [...root.querySelectorAll('[data-seek]')];
  const status = root.querySelector('#video-status');
  const current = root.querySelector('#current-chapter');
  let pendingTime = null;
  function message(text) { status.textContent = text; status.hidden = !text; }
  function highlight() {
    const time = video.currentTime || 0;
    let active = buttons[0];
    for (const button of buttons) if (Number(button.dataset.seek) <= time + .05) active = button;
    for (const button of buttons) {
      const selected = button === active;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    }
    if (active) current.textContent = active.querySelector('small').textContent;
  }
  function play() {
    const result = video.play();
    result?.catch(() => message('Press Play in the video controls to start this chapter. You can also download the video.'));
  }
  function seek(time) {
    message('');
    const start = Math.max(0, Number(time) || 0);
    if (video.readyState < 1) {
      pendingTime = start;
      video.load();
    } else {
      video.currentTime = Number.isFinite(video.duration) ? Math.min(start, video.duration) : start;
      highlight();
    }
    play();
  }
  buttons.forEach(button => button.addEventListener('click', () => seek(button.dataset.seek)));
  root.querySelector('#restart-tour').addEventListener('click', () => seek(0));
  root.querySelector('#playback-speed').addEventListener('change', event => {video.playbackRate = Number(event.target.value);});
  video.addEventListener('loadedmetadata', () => {
    if (pendingTime !== null) {
      video.currentTime = Math.min(pendingTime, Number.isFinite(video.duration) ? video.duration : pendingTime);
      pendingTime = null;
    }
    highlight();
  });
  video.addEventListener('timeupdate', highlight);
  video.addEventListener('play', () => message(''));
  const failed = () => message('The video could not load. Try downloading the MP4, or use the transcript and section guide below.');
  video.addEventListener('error', failed);
  video.querySelector('source')?.addEventListener('error', failed);
  highlight();
}
if (typeof document !== 'undefined') setupWalkthrough();

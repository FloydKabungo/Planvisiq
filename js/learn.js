/** Accessible chapter navigation for the self-hosted walkthrough. No services or tracking. */
export function setupWalkthrough(root = document) {
  const video = root.querySelector('#walkthrough-video');
  if (!video) return;
  const buttons = [...root.querySelectorAll('[data-seek]')];
  const status = root.querySelector('#video-status');
  const current = root.querySelector('#current-chapter');
  let pendingTime = null;
  let mediaURL = null;
  let preparedMedia = null;
  // A local Blob gives the native player reliable seeking when the host does
  // not honour byte-range requests. Fetch once, only after a chapter is chosen.
  function prepareMedia() {
    if (preparedMedia) return preparedMedia;
    preparedMedia = (async () => {
      const response = await fetch(video.querySelector('source').src, {credentials:'same-origin'});
      if (!response.ok) throw new Error('Video download failed');
      const blob = await response.blob();
      mediaURL = URL.createObjectURL(blob);
      await new Promise((resolve, reject) => {
        const loaded = () => {cleanup(); resolve();};
        const failed = () => {cleanup(); reject(new Error('Video could not load'));};
        const cleanup = () => {video.removeEventListener('loadedmetadata', loaded); video.removeEventListener('error', failed);};
        video.addEventListener('loadedmetadata', loaded);
        video.addEventListener('error', failed);
        video.src = mediaURL;
        video.load();
      });
    })();
    preparedMedia.catch(() => {preparedMedia = null;});
    return preparedMedia;
  }
  window.addEventListener('pagehide', () => {if (mediaURL) URL.revokeObjectURL(mediaURL);}, {once:true});
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
  let seekRequest = 0;
  function play() {
    const result = video.play();
    result?.catch(() => message('Press Play in the video controls to start this chapter. You can also download the video.'));
  }
  async function seek(time) {
    const request = ++seekRequest;
    message('Preparing this chapter…');
    try { await prepareMedia(); } catch { message('The video could not load. Try the download link below.'); return; }
    if (request !== seekRequest) return;
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
  video.addEventListener('play', () => {
    if (!mediaURL) {const time = video.currentTime; video.pause(); seek(time);}
  }, {once:true});
  const failed = () => message('The video could not load. Try downloading the MP4, or use the transcript and section guide below.');
  video.addEventListener('error', failed);
  video.querySelector('source')?.addEventListener('error', failed);
  highlight();
}
if (typeof document !== 'undefined') setupWalkthrough();

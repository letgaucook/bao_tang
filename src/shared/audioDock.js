import '../styles/audio.css';
import { getSettings, onSettingsChange, setSetting } from './settings.js';

/*
 * Dải điều khiển thuyết minh của phòng (nhạc nền nằm riêng ở music.js, chỉnh trong Cài đặt).
 *
 * config: { src, title, loop, volume } lấy từ rooms.json (rooms[].audio).
 *   src    đường dẫn tương đối trong thư mục public/, ví dụ "audio/sanh.mp3"
 *   volume mức nền 0–1, nhân với âm lượng trong Cài đặt
 * Chưa có file (hoặc src để trống) thì nút phát bị khóa và hiện "Chưa có âm thanh";
 * nút tắt tiếng và thanh âm lượng vẫn dùng được vì chúng là cài đặt chung của cả trang web.
 *
 * Không tự phát: trình duyệt chặn phát tự động, và người xem cần được chủ động bật.
 */

const ICONS = {
  play: '<path fill="currentColor" d="M8 5.5v13l11-6.5z"/>',
  pause: '<path fill="currentColor" d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
  sound:
    '<path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  muted:
    '<path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};
const svg = (name) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${ICONS[name]}</svg>`;

/** Kiểm tra file có thật không. Máy chủ dev trả index.html cho đường dẫn không tồn tại nên phải xem cả loại nội dung. */
export async function audioExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const type = res.headers.get('content-type') ?? '';
    return res.ok && !type.includes('text/html');
  } catch {
    return false;
  }
}

export function mountAudioDock(config, { slot = document.querySelector('[data-audio-slot]'), onPlayingChange, autoplay = false } = {}) {
  const noop = { stop() {} };
  if (!slot) return noop;

  const title = config?.title || 'Âm thanh';
  const loop = Boolean(config?.loop);
  const baseVolume = Number.isFinite(config?.volume) ? config.volume : 1;
  const src = config?.src ? `${import.meta.env.BASE_URL}${config.src.replace(/^\/+/, '')}` : null;

  const dock = document.createElement('div');
  dock.className = 'audio-dock is-unavailable';
  dock.setAttribute('role', 'group');
  dock.setAttribute('aria-label', 'Điều khiển âm thanh');
  dock.innerHTML = `
    <button type="button" class="audio-dock__btn" data-play disabled aria-label="Phát ${title}">${svg('play')}</button>
    <button type="button" class="audio-dock__btn" data-mute>${svg('sound')}</button>
    <input type="range" class="audio-dock__volume" min="0" max="100" step="5" aria-label="Âm lượng" />
    <span class="audio-dock__title" data-title>Chưa có âm thanh</span>`;
  slot.append(dock);

  const ui = {
    play: dock.querySelector('[data-play]'),
    mute: dock.querySelector('[data-mute]'),
    volume: dock.querySelector('.audio-dock__volume'),
    title: dock.querySelector('[data-title]'),
  };
  let audio = null;

  function renderPlay() {
    const playing = Boolean(audio && !audio.paused);
    ui.play.innerHTML = svg(playing ? 'pause' : 'play');
    ui.play.setAttribute('aria-label', `${playing ? 'Tạm dừng' : 'Phát'} ${title}`);
    dock.classList.toggle('is-playing', playing);
    onPlayingChange?.(playing);
  }

  function applySettings({ sound, volume } = getSettings()) {
    ui.mute.innerHTML = svg(sound ? 'sound' : 'muted');
    ui.mute.setAttribute('aria-label', sound ? 'Tắt tiếng' : 'Bật tiếng');
    ui.mute.setAttribute('aria-pressed', String(!sound));
    ui.volume.value = String(Math.round(volume * 100));
    ui.volume.disabled = !sound;
    if (audio) {
      audio.muted = !sound;
      audio.volume = Math.min(1, baseVolume * volume);
    }
  }
  applySettings();
  onSettingsChange(applySettings);

  ui.mute.addEventListener('click', () => setSetting('sound', !getSettings().sound));
  ui.volume.addEventListener('input', () => setSetting('volume', Number(ui.volume.value) / 100));

  /*
   * Tự phát một lần khi vào trang (autoplay). Trình duyệt chặn phát có tiếng khi chưa tương tác:
   * khi đó phát ở lần bấm, chạm hoặc nhấn phím đầu tiên. Người xem đã tự bấm nút trên dải
   * (phát hay tạm dừng) thì thôi không tự phát nữa.
   */
  const GESTURES = ['pointerdown', 'keydown', 'touchstart'];
  let autoPending = autoplay;
  function cancelAuto() {
    autoPending = false;
    for (const type of GESTURES) document.removeEventListener(type, onGesture, true);
  }
  function tryAutoplay() {
    if (!autoPending || !audio) return;
    audio
      .play()
      .then(cancelAuto)
      .catch((error) => {
        // NotAllowedError: chờ tương tác tiếp theo; lỗi khác (file hỏng...) thì thôi
        if (error.name !== 'NotAllowedError') cancelAuto();
      });
  }
  function onGesture(event) {
    if (dock.contains(event.target)) return; // nút trên dải tự xử lý
    tryAutoplay();
  }
  if (autoplay) {
    for (const type of GESTURES) document.addEventListener(type, onGesture, { capture: true, passive: true });
  }

  ui.play.addEventListener('click', () => {
    cancelAuto();
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (!getSettings().sound) setSetting('sound', true); // bấm phát khi đang tắt tiếng: bật tiếng luôn
    audio.play().catch((error) => {
      // Trình duyệt có thể từ chối (NotAllowedError) hoặc file hỏng
      console.warn('Không phát được âm thanh:', error.name);
      renderPlay();
    });
  });

  if (src) {
    audioExists(src).then((ok) => {
      if (!ok) return;
      audio = new Audio(src);
      audio.preload = autoplay ? 'auto' : 'none';
      audio.loop = loop;
      for (const type of ['play', 'pause', 'ended']) audio.addEventListener(type, renderPlay);
      applySettings();
      ui.play.disabled = false;
      ui.title.textContent = title;
      dock.classList.remove('is-unavailable');
      tryAutoplay();
    });
  }

  const stop = () => {
    cancelAuto();
    if (audio && !audio.paused) audio.pause();
  };
  window.addEventListener('pagehide', stop);
  return { stop };
}

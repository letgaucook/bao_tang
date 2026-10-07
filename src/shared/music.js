import { getSettings, onSettingsChange } from './settings.js';
import { audioExists } from './audioDock.js';

/*
 * Nhạc nền của một trang (sảnh hoặc phòng): tự phát khi vào trang, lặp lại.
 * Bật/tắt và âm lượng chỉ chỉnh trong Cài đặt (music, musicVolume; mặc định bật, 30%).
 *
 * config: { src } lấy từ rooms.json, đường dẫn tương đối trong public/, ví dụ "audio/sanh.mp3".
 * Chưa có file thì không làm gì.
 *
 * Trình duyệt thường chặn tự phát có tiếng khi người xem chưa tương tác với trang: khi đó nhạc
 * bắt đầu ngay ở lần bấm, chạm hoặc nhấn phím đầu tiên.
 */

const DUCK = 0.35; // nhạc nhỏ lại còn 35% khi đang phát thuyết minh

export function startMusic(config) {
  let audio = null;
  let ducked = false;
  let suspended = false; // tạm dừng vì đang xem phim có tiếng
  let stopped = false; // đã rời trang

  const shouldPlay = () => audio && !stopped && !suspended && getSettings().music;

  function applyVolume() {
    if (audio) audio.volume = Math.min(1, getSettings().musicVolume * (ducked ? DUCK : 1));
  }

  /*
   * Lắng nghe tương tác ngay từ đầu (kể cả trước khi file nhạc tải xong) cho tới khi phát được:
   * người xem có thể bấm trước lúc nhạc sẵn sàng, và trình duyệt chỉ cho phát trong lúc tương tác.
   */
  const GESTURES = ['pointerdown', 'keydown', 'touchstart'];
  let started = false;
  const onGesture = () => sync();
  for (const type of GESTURES) document.addEventListener(type, onGesture, { capture: true, passive: true });
  function markStarted() {
    if (started) return;
    started = true;
    for (const type of GESTURES) document.removeEventListener(type, onGesture, true);
  }

  function sync() {
    if (!audio) return;
    applyVolume();
    if (!shouldPlay()) {
      if (!audio.paused) audio.pause();
      return;
    }
    if (!audio.paused) return;
    audio
      .play()
      .then(markStarted)
      .catch((error) => {
        // NotAllowedError: trình duyệt chặn tự phát, sẽ thử lại ở lần tương tác tiếp theo
        if (error.name !== 'NotAllowedError') console.warn('Không phát được nhạc nền:', error.name);
      });
  }

  onSettingsChange(sync);

  const src = config?.src ? `${import.meta.env.BASE_URL}${config.src.replace(/^\/+/, '')}` : null;
  if (src) {
    audioExists(src).then((ok) => {
      if (!ok || stopped) return;
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      sync();
    });
  }

  const stop = () => {
    stopped = true;
    if (audio && !audio.paused) audio.pause();
  };
  window.addEventListener('pagehide', stop);
  // Quay lại trang bằng nút Back (bfcache): phát tiếp
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    stopped = false;
    sync();
  });

  return {
    /** Nhỏ nhạc lại trong lúc phát thuyết minh. */
    duck(on) {
      ducked = on;
      applyVolume();
    },
    /** Tạm dừng nhạc trong lúc xem phim có tiếng, rồi phát tiếp. */
    suspend(on) {
      suspended = on;
      sync();
    },
    stop,
  };
}

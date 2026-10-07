import '../styles/settings.css';
import { getSettings, onSettingsChange, setSetting } from './settings.js';
import { getVisitedRooms, local, resetVisitedRooms } from './storage.js';

/*
 * Nút bánh răng + hộp thoại Cài đặt, gắn vào mọi trang.
 * Nút đặt vào phần tử [data-settings-slot] trên thanh đầu trang; trang nào không có thì nút nổi ở góc.
 * Xóa tiến độ phát sự kiện "museum:progress-reset" trên window để trang đang mở cập nhật lại.
 */

const GEAR = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.4l-.4 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.5c.1.2.4.3.6.2l2.5-1c.5.4 1.1.7 1.7 1l.4 2.6c0 .3.2.5.5.5h4c.3 0 .5-.2.5-.4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1c.2.1.5 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>`;

const GROUPS = {
  motion: {
    legend: 'Chuyển động',
    hint: 'Giảm chuyển động: bỏ phần mở màn ở sảnh, bụi đứng yên, không tự xoay, cuộn không trượt mượt.',
    options: [
      ['system', 'Theo máy'],
      ['reduce', 'Giảm'],
      ['full', 'Đầy đủ'],
    ],
  },
  fontSize: {
    legend: 'Cỡ chữ',
    options: [
      ['md', 'Vừa'],
      ['lg', 'Lớn'],
      ['xl', 'Rất lớn'],
    ],
  },
  quality: {
    legend: 'Chất lượng đồ họa (sảnh 3D)',
    hint: 'Tiết kiệm: giảm độ phân giải và tắt bụi lơ lửng, hợp với máy yếu hoặc khi cần tiết kiệm pin.',
    options: [
      ['high', 'Cao'],
      ['low', 'Tiết kiệm'],
    ],
  },
};

export function mountSettings({ totalRooms = null } = {}) {
  if (document.getElementById('settings-dialog')) return;

  /* ---------- Nút mở ---------- */
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'settings-btn';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'settings-dialog');
  button.innerHTML = `${GEAR}<span class="settings-btn__label">Cài đặt</span>`;
  const slot = document.querySelector('[data-settings-slot]');
  if (slot) slot.append(button);
  else {
    button.classList.add('settings-btn--floating');
    document.body.append(button);
  }

  /* ---------- Hộp thoại ---------- */
  const dialog = document.createElement('dialog');
  dialog.className = 'settings-dialog';
  dialog.id = 'settings-dialog';
  dialog.setAttribute('aria-labelledby', 'settings-title');
  dialog.innerHTML = `
    <div class="settings">
      <div class="settings__head">
        <h2 id="settings-title" tabindex="-1">Cài đặt</h2>
        <button type="button" class="settings__close" data-close aria-label="Đóng cài đặt">×</button>
      </div>

      <section class="settings__section" aria-labelledby="settings-music-h">
        <h3 id="settings-music-h">Nhạc nền</h3>
        <label class="settings__switch">
          <input type="checkbox" name="music" />
          <span class="settings__switch-track" aria-hidden="true"></span>
          <span>Phát nhạc nền</span>
        </label>
        <label class="settings__range">
          <span>Âm lượng</span>
          <input type="range" name="musicVolume" min="0" max="100" step="5" />
          <output name="musicVolume-out"></output>
        </label>
        <p class="settings__hint">Nhạc nền tự phát khi vào sảnh và các phòng, phát lặp lại. Nhạc tự nhỏ lại khi đang nghe thuyết minh và tạm dừng khi xem phim tư liệu có tiếng.</p>
      </section>

      <section class="settings__section" aria-labelledby="settings-sound-h">
        <h3 id="settings-sound-h">Thuyết minh và hiệu ứng</h3>
        <label class="settings__switch">
          <input type="checkbox" name="sound" />
          <span class="settings__switch-track" aria-hidden="true"></span>
          <span>Bật âm thanh</span>
        </label>
        <label class="settings__range">
          <span>Âm lượng</span>
          <input type="range" name="volume" min="0" max="100" step="5" />
          <output name="volume-out"></output>
        </label>
        <p class="settings__hint">Áp dụng cho thuyết minh trong các phòng và hiệu ứng âm thanh trong trò chơi thử thách.</p>
      </section>

      ${Object.entries(GROUPS)
        .map(
          ([key, g]) => `
      <section class="settings__section">
        <fieldset class="settings__choices">
          <legend>${g.legend}</legend>
          <div class="settings__segmented">
            ${g.options
              .map(
                ([value, label]) => `
            <label><input type="radio" name="${key}" value="${value}" /><span>${label}</span></label>`,
              )
              .join('')}
          </div>
        </fieldset>
        ${g.hint ? `<p class="settings__hint">${g.hint}</p>` : ''}
        ${key === 'quality' ? autoRotateMarkup() : ''}
      </section>`,
        )
        .join('')}

      <section class="settings__section" aria-labelledby="settings-progress-h">
        <h3 id="settings-progress-h">Tiến độ tham quan</h3>
        <p class="settings__progress" data-progress></p>
        <button type="button" class="settings__danger" data-reset>Xóa tiến độ tham quan</button>
        <p class="settings__hint" data-reset-note aria-live="polite"></p>
      </section>
    </div>`;
  document.body.append(dialog);

  const form = {
    music: dialog.querySelector('[name="music"]'),
    musicVolume: dialog.querySelector('[name="musicVolume"]'),
    musicVolumeOut: dialog.querySelector('[name="musicVolume-out"]'),
    sound: dialog.querySelector('[name="sound"]'),
    volume: dialog.querySelector('[name="volume"]'),
    volumeOut: dialog.querySelector('[name="volume-out"]'),
    autoRotate: dialog.querySelector('[name="autoRotate"]'),
    progress: dialog.querySelector('[data-progress]'),
    reset: dialog.querySelector('[data-reset]'),
    resetNote: dialog.querySelector('[data-reset-note]'),
  };

  function render(s = getSettings()) {
    form.music.checked = s.music;
    form.musicVolume.value = String(Math.round(s.musicVolume * 100));
    form.musicVolume.disabled = !s.music;
    form.musicVolumeOut.textContent = `${Math.round(s.musicVolume * 100)}%`;
    form.sound.checked = s.sound;
    form.volume.value = String(Math.round(s.volume * 100));
    form.volume.disabled = !s.sound;
    form.volumeOut.textContent = `${Math.round(s.volume * 100)}%`;
    form.autoRotate.checked = s.autoRotate;
    for (const key of Object.keys(GROUPS)) {
      for (const input of dialog.querySelectorAll(`[name="${key}"]`)) input.checked = input.value === s[key];
    }
  }

  function renderProgress() {
    const n = getVisitedRooms().length;
    form.progress.textContent =
      totalRooms != null ? `Đã tham quan ${Math.min(n, totalRooms)}/${totalRooms} phòng.` : `Đã tham quan ${n} phòng.`;
    form.reset.disabled = n === 0;
  }

  form.music.addEventListener('change', () => setSetting('music', form.music.checked));
  form.musicVolume.addEventListener('input', () => setSetting('musicVolume', Number(form.musicVolume.value) / 100));
  form.sound.addEventListener('change', () => setSetting('sound', form.sound.checked));
  form.volume.addEventListener('input', () => setSetting('volume', Number(form.volume.value) / 100));
  form.autoRotate.addEventListener('change', () => setSetting('autoRotate', form.autoRotate.checked));
  for (const key of Object.keys(GROUPS)) {
    for (const input of dialog.querySelectorAll(`[name="${key}"]`)) {
      input.addEventListener('change', () => input.checked && setSetting(key, input.value));
    }
  }
  onSettingsChange(render);

  /* Xóa tiến độ: bấm hai lần để tránh bấm nhầm */
  let confirmTimer = 0;
  const resetLabel = form.reset.textContent;
  function disarm() {
    clearTimeout(confirmTimer);
    form.reset.classList.remove('is-armed');
    form.reset.textContent = resetLabel;
  }
  form.reset.addEventListener('click', () => {
    if (!form.reset.classList.contains('is-armed')) {
      form.reset.classList.add('is-armed');
      form.reset.textContent = 'Bấm lần nữa để xác nhận xóa';
      form.resetNote.textContent = '';
      confirmTimer = setTimeout(disarm, 4000);
      return;
    }
    disarm();
    resetVisitedRooms();
    local.remove('endingCelebrated');
    window.dispatchEvent(new CustomEvent('museum:progress-reset'));
    renderProgress();
    form.resetNote.textContent = 'Đã xóa tiến độ. Các phòng trở về trạng thái chưa tham quan.';
  });

  /* Mở / đóng */
  function open() {
    if (dialog.open) return;
    if (document.pointerLockElement) document.exitPointerLock();
    render();
    renderProgress();
    form.resetNote.textContent = '';
    dialog.showModal();
    dialog.querySelector('#settings-title').focus({ preventScroll: true });
    button.setAttribute('aria-expanded', 'true');
  }
  button.addEventListener('click', open);
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close(); // bấm ra ngoài khung
  });
  dialog.addEventListener('close', () => {
    disarm();
    button.setAttribute('aria-expanded', 'false');
    button.focus({ preventScroll: true });
  });
  button.setAttribute('aria-expanded', 'false');

  return { open };
}

function autoRotateMarkup() {
  return `
        <label class="settings__switch">
          <input type="checkbox" name="autoRotate" />
          <span class="settings__switch-track" aria-hidden="true"></span>
          <span>Sảnh tự xoay nhẹ khi đứng yên</span>
        </label>`;
}

import { local } from './storage.js';

/*
 * Cài đặt dùng chung cho mọi trang (sảnh, phòng, trò chơi), lưu ở localStorage khóa "settings".
 * Đổi cài đặt ở một tab thì các tab khác cập nhật theo (sự kiện storage).
 */

const KEY = 'settings';

export const DEFAULTS = Object.freeze({
  music: true, // nhạc nền ở sảnh và các phòng (tự phát, lặp lại)
  musicVolume: 0.3, // 0–1
  sound: true, // thuyết minh trong các phòng và hiệu ứng âm thanh trong trò chơi
  volume: 0.7, // 0–1
  motion: 'system', // 'system' | 'reduce' | 'full'
  fontSize: 'md', // 'md' | 'lg' | 'xl'
  quality: 'high', // 'high' | 'low' (đồ họa sảnh 3D)
  autoRotate: true, // sảnh tự xoay nhẹ khi đứng yên
});

const CHOICES = {
  motion: ['system', 'reduce', 'full'],
  fontSize: ['md', 'lg', 'xl'],
  quality: ['high', 'low'],
};

function sanitize(raw) {
  const out = { ...DEFAULTS };
  if (!raw || typeof raw !== 'object') return out;
  if (typeof raw.music === 'boolean') out.music = raw.music;
  if (Number.isFinite(raw.musicVolume)) out.musicVolume = Math.min(1, Math.max(0, raw.musicVolume));
  if (typeof raw.sound === 'boolean') out.sound = raw.sound;
  if (typeof raw.autoRotate === 'boolean') out.autoRotate = raw.autoRotate;
  if (Number.isFinite(raw.volume)) out.volume = Math.min(1, Math.max(0, raw.volume));
  for (const [key, list] of Object.entries(CHOICES)) {
    if (list.includes(raw[key])) out[key] = raw[key];
  }
  return out;
}

let current = sanitize(local.get(KEY));
const listeners = new Set();

export function getSettings() {
  return current;
}

export function setSetting(key, value) {
  if (!(key in DEFAULTS) || current[key] === value) return;
  current = sanitize({ ...current, [key]: value });
  local.set(KEY, current);
  emit();
}

/** cb(settings) mỗi khi cài đặt đổi (kể cả từ tab khác). Trả về hàm hủy đăng ký. */
export function onSettingsChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  applyDocument();
  for (const cb of listeners) cb(current);
}

window.addEventListener('storage', (event) => {
  if (event.key !== KEY) return;
  current = sanitize(local.get(KEY));
  emit();
});

/* ---------- Giảm chuyển động: cài đặt của người dùng thắng cài đặt hệ thống ---------- */

const systemReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

function computeReduce() {
  if (current.motion === 'reduce') return true;
  if (current.motion === 'full') return false;
  return systemReduce.matches;
}

/**
 * Dùng thay cho matchMedia('(prefers-reduced-motion: reduce)'): cùng giao diện
 * (.matches, addEventListener('change', fn)), nhưng tính cả cài đặt trong trang.
 */
export const reducedMotion = (() => {
  const target = new EventTarget();
  let last = computeReduce();
  const check = () => {
    const next = computeReduce();
    if (next === last) return;
    last = next;
    target.dispatchEvent(new Event('change'));
  };
  systemReduce.addEventListener('change', () => {
    applyDocument();
    check();
  });
  listeners.add(check);
  return {
    get matches() {
      return last;
    },
    addEventListener: (type, fn) => target.addEventListener(type, fn),
    removeEventListener: (type, fn) => target.removeEventListener(type, fn),
  };
})();

/* ---------- Áp dụng lên tài liệu: cỡ chữ, chuyển động ---------- */

function applyDocument() {
  const root = document.documentElement;
  root.dataset.fontSize = current.fontSize;
  root.dataset.motion = computeReduce() ? 'reduce' : 'full';
}
applyDocument();

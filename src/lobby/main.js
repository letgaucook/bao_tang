import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import data from '../data/rooms.json';
import { buildHall, DOOR_OPEN_ANGLE } from './buildHall.js';
import { createInteraction } from './interaction.js';
import { loadFonts, loadImage, setMaxAnisotropy } from './textures.js';
import drumPatternUrl from '../assets/hoa-van-trong-dong.png';
import { getVisitedRooms, local, resetVisitedRooms, session } from '../shared/storage.js';
import { getSettings, onSettingsChange, reducedMotion } from '../shared/settings.js';
import { mountSettings } from '../shared/settingsUI.js';
import { startMusic } from '../shared/music.js';

const EYE_HEIGHT = 1.6;

const rooms = [...data.rooms].sort((a, b) => a.order - b.order);
const roomUrl = (room) => `./room.html?id=${encodeURIComponent(room.id)}`;

const el = {
  stage: document.getElementById('stage'),
  title: document.getElementById('museum-title'),
  mapToggle: document.getElementById('map-toggle'),
  mapPanel: document.getElementById('map-panel'),
  mapClose: document.getElementById('map-close'),
  mapNotice: document.getElementById('map-notice'),
  mapList: document.getElementById('map-list'),
  tooltip: document.getElementById('tooltip'),
  hint: document.getElementById('hint'),
  loading: document.getElementById('loading'),
  fade: document.getElementById('fade'),
  endingBtn: document.getElementById('ending-btn'),
  introDialog: document.getElementById('intro-dialog'),
  endingDialog: document.getElementById('ending-dialog'),
  creditsDialog: document.getElementById('credits-dialog'),
  mapProgress: document.getElementById('map-progress'),
  mapProgressText: document.getElementById('map-progress-text'),
};

el.title.textContent = data.museum.title;
document.getElementById('intro-text').textContent = data.museumIntro ?? '';
renderEnding(data.ending);

/** Lời kết: trích dẫn (nếu có) + đoạn kết của nhóm. */
function renderEnding(ending) {
  const value = typeof ending === 'string' ? { text: ending } : (ending ?? {});
  const quote = document.getElementById('ending-quote');
  quote.hidden = !value.quote;
  if (value.quote) {
    quote.querySelector('p').textContent = `“${value.quote}”`;
    quote.querySelector('footer').textContent = value.quoteSource ? `— ${value.quoteSource}` : '';
    quote.querySelector('.quote-pending').hidden = value.quoteStatus !== 'pending';
  }
  const paragraphs = Array.isArray(value.text) ? value.text : String(value.text ?? '').split(/\n\s*\n/);
  document.getElementById('ending-text').replaceChildren(
    ...paragraphs.filter((t) => t.trim()).map((t) => {
      const p = document.createElement('p');
      p.textContent = t.trim();
      return p;
    }),
  );
  const figure = document.getElementById('ending-figure');
  figure.hidden = !value.image;
  if (value.image) {
    const img = figure.querySelector('img');
    img.src = value.image;
    img.alt = value.imageHint ?? 'Ảnh tư liệu';
    figure.querySelector('figcaption').textContent = [value.imageCaption, value.imageSource && `Nguồn ảnh: ${value.imageSource}`]
      .filter(Boolean)
      .join(' · ');
    img.alt = value.imageCaption ?? img.alt;
  }
}

/* ---------- Hộp thoại: lời giới thiệu, lời kết ---------- */

for (const dialog of [el.introDialog, el.endingDialog, el.creditsDialog]) {
  dialog.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  // Bấm ra ngoài khung thì đóng
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
const openDialog = (dialog) => {
  if (dialog.open) return;
  dialog.showModal();
  // Mở ở đầu hộp thoại: đưa focus vào tiêu đề thay vì nút cuối cùng
  const heading = dialog.querySelector('h2');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  dialog.scrollTop = 0;
};
el.endingBtn.addEventListener('click', () => openDialog(el.endingDialog));
document.getElementById('map-credits').addEventListener('click', () => openDialog(el.creditsDialog));
renderCredits();

/* ---------- Nguồn tư liệu: tài liệu tham khảo, nguồn ảnh, ghi công ---------- */

function renderCredits() {
  const credits = data.credits ?? {};
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const link = (href, text) => {
    const a = make('a', null, text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  };
  const section = (title, ...children) => {
    const s = make('section', 'credits__section');
    s.append(make('h3', null, title), ...children);
    return s;
  };
  const body = document.getElementById('credits-body');
  const parts = [];

  // Nhóm thực hiện: chỉ hiện khi đã điền tên
  const team = (credits.team ?? []).filter(Boolean);
  if (team.length || credits.teamNote) {
    const ul = make('ul', 'credits__team');
    for (const name of team) ul.append(make('li', null, name));
    parts.push(section('Thực hiện', ...(credits.teamNote ? [make('p', null, credits.teamNote)] : []), ...(team.length ? [ul] : [])));
  }

  // Tài liệu tham khảo
  const refs = make('ol', 'credits__refs');
  for (const r of credits.references ?? []) {
    const li = make('li');
    li.append(make('strong', null, r.title));
    if (r.detail) li.append(`. ${r.detail}`);
    if (r.url) li.append(' · ', link(r.url, 'Xem tài liệu'));
    refs.append(li);
  }
  if (refs.children.length) parts.push(section('Tài liệu tham khảo', refs));

  // Nguồn ảnh: tổng hợp tự động từ rooms.json
  const imageBlocks = [];
  const imageItem = (title, item) => {
    const li = make('li');
    li.append(make('span', 'credits__item-title', title));
    if (item.imageCaption) li.append(make('span', 'credits__caption', item.imageCaption));
    const src = make('span', 'credits__source');
    src.append(item.imageSource ? `Nguồn: ${item.imageSource}` : 'Nguồn: đang bổ sung');
    if (item.imageSourceUrl) src.append(' · ', link(item.imageSourceUrl, 'Trang nguồn'));
    li.append(src);
    return li;
  };
  for (const room of rooms) {
    const list = make('ol', 'credits__images');
    room.items.filter((i) => i.image).forEach((i) => list.append(imageItem(i.title, i)));
    if (!list.children.length) continue;
    const block = make('div', 'credits__room');
    block.append(make('h4', null, room.chapter ? `${room.name} · ${room.chapter}` : room.name), list);
    imageBlocks.push(block);
  }
  if (data.ending?.image) {
    const block = make('div', 'credits__room');
    const list = make('ol', 'credits__images');
    list.append(imageItem('Lời kết', data.ending));
    block.append(make('h4', null, 'Lời kết'), list);
    imageBlocks.push(block);
  }
  if (imageBlocks.length) {
    const note = make('p', 'credits__note', credits.imageNote ?? '');
    parts.push(section('Nguồn ảnh tư liệu', ...(credits.imageNote ? [note] : []), ...imageBlocks));
  }

  // Video tư liệu: tổng hợp tự động từ trường video của từng tranh
  const videos = make('ol', 'credits__images');
  for (const room of rooms) {
    for (const item of room.items.filter((i) => i.video)) {
      const { video } = item;
      const li = make('li');
      li.append(make('span', 'credits__item-title', `${room.name} · ${item.title}`));
      li.append(make('span', 'credits__caption', [video.title, video.kind, video.duration].filter(Boolean).join(' · ')));
      const src = make('span', 'credits__source');
      src.append(`Nguồn: ${video.source}`);
      if (video.youtube) src.append(' · ', link(`https://www.youtube.com/watch?v=${video.youtube}`, 'Xem trên YouTube'));
      li.append(src);
      videos.append(li);
    }
  }
  if (videos.children.length) {
    const note = make('p', 'credits__note', 'Video được nhúng từ kênh YouTube chính thức của đơn vị giữ bản quyền; bảo tàng không lưu bản sao.');
    parts.push(section('Video tư liệu', note, videos));
  }

  // Hoa văn, thiết kế dùng trong bảo tàng
  const artwork = make('ul', 'credits__refs');
  for (const t of credits.artwork ?? []) {
    const li = make('li');
    li.append(make('strong', null, t.title));
    if (t.detail) li.append(`: ${t.detail}`);
    if (t.url) li.append(' · ', link(t.url, 'Nguồn'));
    artwork.append(li);
  }
  if (artwork.children.length) parts.push(section('Hoa văn trang trí', artwork));

  body.replaceChildren(...parts);
}

/* ---------- Tiến độ tham quan (localStorage visitedRooms) ---------- */

const roomIds = new Set(rooms.map((r) => r.id));
const visitedIds = () => getVisitedRooms().filter((id) => roomIds.has(id));
let onProgressChange = () => {}; // sảnh 3D gắn vào khi dựng xong
// Đang dựng sảnh 3D: chưa hiện nút Lời kết lần đầu, để sen nở xong rồi mới hiện
let hallPending = hasWebGL();

function refreshProgress({ animate = false } = {}) {
  const visited = visitedIds();
  const done = visited.length >= rooms.length;
  el.endingBtn.hidden = !done || (hallPending && !local.get('endingCelebrated', false));
  el.mapProgress.hidden = visited.length === 0;
  el.mapProgressText.textContent = done
    ? `Đã tham quan đủ ${rooms.length}/${rooms.length} phòng.`
    : `Đã tham quan ${visited.length}/${rooms.length} phòng.`;
  renderMap();
  onProgressChange(visited, { animate });
}

function resetProgress() {
  resetVisitedRooms();
  local.remove('endingCelebrated');
  if (el.endingDialog.open) el.endingDialog.close();
  refreshProgress();
}
document.getElementById('map-reset').addEventListener('click', resetProgress);
// Xóa tiến độ từ hộp thoại Cài đặt (đã xóa dữ liệu, chỉ cần cập nhật giao diện)
window.addEventListener('museum:progress-reset', () => {
  if (el.endingDialog.open) el.endingDialog.close();
  refreshProgress();
});
document.getElementById('ending-reset').addEventListener('click', () => {
  resetProgress();
  el.mapToggle.focus();
});

/* ---------- Danh sách phòng: đường đi HTML thay thế cho sảnh 3D ---------- */

function renderMap() {
  const visited = new Set(getVisitedRooms());
  el.mapList.replaceChildren(
    ...rooms.map((room, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = roomUrl(room);
      a.innerHTML = `<span class="map-list__num" aria-hidden="true">${i + 1}</span>
        <span class="map-list__name"></span><span class="map-list__desc"></span>`;
      a.querySelector('.map-list__name').textContent = room.name;
      a.querySelector('.map-list__desc').textContent = room.chapter ? `${room.chapter} · ${room.subtitle}` : room.subtitle;
      // Ô tích bên phải: đã tham quan hay chưa
      const done = visited.has(room.id);
      const tick = document.createElement('span');
      tick.className = `map-list__tick${done ? ' is-done' : ''}`;
      tick.innerHTML = '<span class="map-list__tick-box" aria-hidden="true"></span><span class="visually-hidden"></span>';
      tick.querySelector('.visually-hidden').textContent = done ? 'Đã tham quan' : 'Chưa tham quan';
      a.append(tick);
      li.append(a);
      return li;
    }),
  );
}

function setMapOpen(open, { focus = true } = {}) {
  el.mapPanel.hidden = !open;
  el.mapToggle.setAttribute('aria-expanded', String(open));
  if (open && focus) el.mapList.querySelector('a')?.focus();
  else if (!open && focus) el.mapToggle.focus();
}

el.mapToggle.addEventListener('click', () => setMapOpen(el.mapPanel.hidden));
el.mapClose.addEventListener('click', () => setMapOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !el.mapPanel.hidden && !document.body.classList.contains('no-webgl')) {
    setMapOpen(false);
  }
});

function showFallback(message) {
  document.body.classList.add('no-webgl');
  el.stage.remove();
  el.loading.remove();
  el.tooltip.remove();
  el.mapNotice.textContent = message;
  el.mapNotice.hidden = false;
  setMapOpen(true, { focus: false });
  hallPending = false;
  refreshProgress();
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/* ---------- Nhạc nền sảnh (museum.music trong rooms.json): tự phát, chỉnh trong Cài đặt ---------- */

const music = startMusic(data.museum.music);

/* ---------- Sảnh 3D ---------- */

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function shortestAngle(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** FOV dọc ~70°, nới rộng trên màn hình dọc để vẫn thấy đủ một cánh cửa. */
function fovFor(aspect) {
  const minHorizontal = THREE.MathUtils.degToRad(58);
  const vertical = 2 * Math.atan(Math.tan(minHorizontal / 2) / aspect);
  return Math.min(90, Math.max(70, THREE.MathUtils.radToDeg(vertical)));
}

/** Độ phân giải kết xuất: "Tiết kiệm" vẽ ở 1× điểm ảnh CSS. */
function pixelRatio() {
  return getSettings().quality === 'low' ? 1 : Math.min(window.devicePixelRatio, 2);
}

async function startHall() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('Không khởi tạo được WebGL:', error);
    showFallback('Trình duyệt hoặc thiết bị của bạn không hiển thị được sảnh 3D (WebGL). Bạn vẫn có thể vào từng phòng qua danh sách dưới đây.');
    return;
  }

  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  el.stage.append(renderer.domElement);
  setMaxAnisotropy(Math.min(8, renderer.capabilities.getMaxAnisotropy()));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c1b19);

  const camera = new THREE.PerspectiveCamera(fovFor(window.innerWidth / window.innerHeight), window.innerWidth / window.innerHeight, 0.05, 60);
  camera.position.set(0, EYE_HEIGHT, 0.01);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, EYE_HEIGHT, 0);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = -0.4; // đảo chiều để kéo giống viewer 360
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minPolarAngle = Math.PI * 0.35;
  controls.maxPolarAngle = Math.PI * 0.8; // ngẩng lên ~54° để thấy bông sen và giếng trời
  controls.autoRotate = false; // bật ở cuối trình tự mở màn
  controls.autoRotateSpeed = 0.35;

  // Biển tên vẽ bằng canvas: phải có font Noto Serif trước khi vẽ
  // Font cho biển tên và hoa văn trống đồng cho sàn, tải song song trong lúc màn hình chờ
  const [, floorPattern, birdImage] = await Promise.all([
    loadFonts(),
    loadImage(drumPatternUrl),
    loadImage(`${import.meta.env.BASE_URL}images/chimlac.png`),
  ]);
  const coarse = matchMedia('(pointer: coarse)').matches || window.innerWidth < 640;
  const hall = buildHall(scene, rooms, data.museum, { floorPattern, birdImage, coarse });
  const { doors, books } = hall;

  // Vừa từ một phòng quay về: đặt hướng nhìn thẳng vào cửa phòng đó, chính giữa màn hình
  const returnDoor = doors.find((d) => d.room.id === session.get('lastRoom'));
  if (returnDoor) {
    camera.position.copy(controls.target).addScaledVector(returnDoor.direction, -0.01);
    camera.lookAt(controls.target);
    controls.update();
  }

  let opening = null;
  const interaction = createInteraction({
    camera,
    dom: renderer.domElement,
    doors,
    tooltip: el.tooltip,
    onOpen: openDoor,
    extras: books.map((book) => ({
      action: book.action,
      hits: book.hits,
      name: book.title,
      desc:
        book.action === 'intro'
          ? 'Bấm vào cuốn sách để đọc lời giới thiệu bảo tàng'
          : book.action === 'game'
            ? 'Bấm vào để tham gia thử thách: Đời sinh viên (Hard Mode)'
            : 'Bấm vào cuốn sách để xem nguồn tư liệu và ghi công',
      glow(k) {
        book.coverMaterial.emissiveIntensity = k * 0.45;
        for (const m of book.pageMaterials) m.emissiveIntensity = 0.25 + k * 0.4;
      },
    })),
    onAction(action) {
      if (action === 'intro') openDialog(el.introDialog);
      if (action === 'credits') openDialog(el.creditsDialog);
      if (action === 'game') {
        el.fade.classList.add('is-on');
        setTimeout(() => {
          window.location.href = './game.html';
        }, 300);
      }
    },
  });

  /* Cánh sen theo phòng đã tham quan; đủ sáu phòng: sen nở rồi mới hiện nút "Lời kết" */
  let bloomAnim = null;
  let bloomTimer = 0;
  onProgressChange = (visited, { animate }) => {
    const set = new Set(visited);
    const instant = !animate || reducedMotion.matches;
    for (const door of doors) hall.setDoorVisited(door, set.has(door.room.id), { instant });
    const done = visited.length >= rooms.length;
    const celebrated = local.get('endingCelebrated', false);
    clearTimeout(bloomTimer);
    bloomAnim = null;
    if (done && !celebrated && animate && !reducedMotion.matches) {
      // Lần đầu đủ sáu phòng: chờ cánh cuối sáng lên, sen nở trong 2 giây, rồi hiện nút Lời kết
      hall.setBloom(0);
      el.endingBtn.hidden = true;
      bloomAnim = { delay: 1200, duration: 2000, start: null }; // start tính từ frame đầu tiên được vẽ
    } else {
      hall.setBloom(done ? 1 : 0);
    }
    if (done) local.set('endingCelebrated', true);
  };
  function finishBloom() {
    bloomAnim = null;
    hall.setBloom(1);
    el.endingBtn.hidden = false;
  }
  hallPending = false;
  refreshProgress({ animate: true });

  /*
   * Trình tự mở màn: tối → giếng trời sáng, luồng sáng và bụi hiện ra (0–1s) → đèn rọi sáu cửa
   * sáng lần lượt theo vòng (1–2,5s) → băng chữ hiện ra, bắt đầu tự xoay nhẹ (2,5–3s).
   * Chạm/kéo/nhấn phím bất kỳ lúc nào: nhảy ngay về trạng thái cuối.
   */
  const INTRO_END = 3;
  let introStart = null; // đặt ở frame đầu tiên
  let introDone = false;
  // Quay về từ một phòng: không tự xoay, để cửa phòng vừa xem đứng yên ở giữa
  let userTookControl = Boolean(returnDoor);
  const ramp = (t, from, to) => THREE.MathUtils.clamp((t - from) / (to - from), 0, 1);
  function applyIntro(t) {
    hall.setIntro({
      sky: easeInOut(ramp(t, 0, 1)),
      doors: doors.map((_, i) => easeInOut(ramp(t, 1 + i * 0.22, 1 + i * 0.22 + 0.4))),
      band: easeInOut(ramp(t, 2.5, 3)),
    });
  }
  function finishIntro() {
    if (introDone) return;
    introDone = true;
    applyIntro(INTRO_END);
    if (!userTookControl && !reducedMotion.matches && getSettings().autoRotate) controls.autoRotate = true;
  }
  const skipIntro = () => {
    userTookControl = true;
    finishIntro();
  };
  renderer.domElement.addEventListener('pointerdown', skipIntro);
  window.addEventListener('keydown', skipIntro);
  if (reducedMotion.matches) finishIntro();
  else applyIntro(0);

  /* Người dùng chạm/kéo lần đầu: dừng auto-rotate; kéo thật thì ẩn gợi ý */
  let dragging = false;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    dragging = true;
  });
  controls.addEventListener('end', () => (dragging = false));
  controls.addEventListener('change', () => {
    if (dragging) el.hint.classList.add('is-hidden');
  });

  /* Phím mũi tên trái/phải để xoay */
  const keys = new Set();
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (el.mapPanel.contains(event.target) || opening) return;
    keys.add(event.key);
    controls.autoRotate = false;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key));
  window.addEventListener('blur', () => keys.clear());

  function openDoor(index) {
    if (opening) return;
    const door = doors[index];
    const url = roomUrl(door.room);
    if (reducedMotion.matches) {
      window.location.href = url;
      return;
    }
    controls.enabled = false;
    controls.autoRotate = false;
    music.stop();
    interaction.setEnabled(false);
    el.hint.classList.add('is-hidden');

    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    // Nhìn theo hướng cửa: camera nằm ở phía ngược lại so với target
    const targetTheta = Math.atan2(-door.direction.x, -door.direction.z);
    opening = {
      door,
      url,
      start: performance.now(),
      radius: spherical.radius,
      theta0: spherical.theta,
      dTheta: shortestAngle(spherical.theta, targetTheta),
      phi0: spherical.phi,
      dPhi: Math.PI / 2 - spherical.phi,
      faded: false,
      navigated: false,
    };
  }

  const TURN = 600;
  const SWING = 900;
  const lookDir = new THREE.Vector3();
  const tmp = new THREE.Spherical();

  function animateOpening(now) {
    const o = opening;
    const t = now - o.start;
    const turn = easeInOut(Math.min(1, t / TURN));
    tmp.set(o.radius, o.phi0 + o.dPhi * turn, o.theta0 + o.dTheta * turn);
    const offset = new THREE.Vector3().setFromSpherical(tmp);
    lookDir.copy(offset).negate().normalize();

    const swing = easeInOut(THREE.MathUtils.clamp((t - TURN) / SWING, 0, 1));
    o.door.pivot.rotation.y = DOOR_OPEN_ANGLE * swing;

    // Bước nhẹ về phía cửa trong lúc cánh mở
    camera.position.copy(controls.target).add(offset).addScaledVector(lookDir, 1.6 * swing);
    camera.lookAt(camera.position.clone().add(lookDir));

    if (!o.faded && t > TURN + SWING * 0.45) {
      o.faded = true;
      el.fade.classList.add('is-on');
    }
    if (!o.navigated && t > TURN + SWING + 150) {
      o.navigated = true;
      window.location.href = o.url;
    }
  }

  /* Quay lại bằng nút Back (bfcache): khôi phục sảnh về trạng thái nhìn quanh */
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) refreshProgress({ animate: true });
    if (!event.persisted || !opening) return;
    const { door } = opening;
    door.pivot.rotation.y = 0;
    camera.position.copy(controls.target).addScaledVector(door.direction, -0.01);
    camera.lookAt(controls.target);
    opening = null;
    controls.enabled = true;
    interaction.setEnabled(true);
    el.fade.classList.remove('is-on');
  });

  function onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.fov = fovFor(aspect);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const timer = new THREE.Timer();
  timer.connect(document); // bỏ qua khoảng thời gian tab bị ẩn
  let firstFrame = true;
  const lastQuat = new THREE.Quaternion();

  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    // Kẹp trong [0; 0,1]: frame đầu có thể cho delta âm (timestamp của rAF sớm hơn mốc khởi tạo của Timer)
    const dt = THREE.MathUtils.clamp(timer.getDelta(), 0, 0.1);
    // Đồng hồ mở màn và sen nở chỉ chạy từ frame thứ hai: frame đầu còn biên dịch shader, có thể rất lâu
    if (!introDone && !firstFrame) {
      introStart ??= performance.now();
      const t = (performance.now() - introStart) / 1000;
      if (t >= INTRO_END) finishIntro();
      else applyIntro(t);
    }
    if (bloomAnim && !firstFrame) {
      bloomAnim.start ??= performance.now() + bloomAnim.delay;
      const k = THREE.MathUtils.clamp((performance.now() - bloomAnim.start) / bloomAnim.duration, 0, 1);
      hall.setBloom(easeInOut(k));
      if (k >= 1) finishBloom();
    }
    if (opening) {
      animateOpening(performance.now());
    } else {
      if (keys.size) {
        const dir = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
        // rotateLeft(+) xoay hướng nhìn sang phải khi camera ở sát target
        controls.rotateLeft(dir * 1.6 * dt);
      }
      controls.update(dt);
    }
    const moved = !camera.quaternion.equals(lastQuat);
    lastQuat.copy(camera.quaternion);
    interaction.update(dt, moved);
    hall.update(dt, camera, { dustMoving: !reducedMotion.matches });
    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      el.loading.classList.add('is-done');
      setTimeout(() => el.loading.remove(), 600);
    }
  });

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    showFallback('Sảnh 3D bị gián đoạn do thiết bị mất kết nối đồ họa (WebGL). Hãy tải lại trang, hoặc vào phòng qua danh sách dưới đây.');
  });

  // Đổi cài đặt giảm chuyển động khi đang xem
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    controls.autoRotate = false;
    finishIntro();
    if (bloomAnim) finishBloom();
  });

  // Cài đặt đồ họa và tự xoay, đổi được ngay khi đang xem
  hall.setDustVisible(getSettings().quality !== 'low');
  onSettingsChange((s) => {
    hall.setDustVisible(s.quality !== 'low');
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (!s.autoRotate) controls.autoRotate = false;
    else if (introDone && !userTookControl && !reducedMotion.matches && !opening) controls.autoRotate = true;
  });
}

mountSettings({ totalRooms: rooms.length });
refreshProgress();
if (hasWebGL()) {
  startHall().catch((error) => {
    console.error(error);
    showFallback('Không dựng được sảnh 3D trên thiết bị này. Bạn vẫn có thể vào từng phòng qua danh sách dưới đây.');
  });
} else {
  showFallback('Trình duyệt của bạn không hỗ trợ WebGL nên không hiển thị được sảnh 3D. Bạn vẫn có thể vào từng phòng qua danh sách dưới đây.');
}

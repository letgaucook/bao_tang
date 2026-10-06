import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import data from '../data/rooms.json';
import { buildHall, DOOR_OPEN_ANGLE } from './buildHall.js';
import { createInteraction } from './interaction.js';
import { loadFonts, loadImage, setMaxAnisotropy } from './textures.js';
import drumPatternUrl from '../assets/hoa-van-trong-dong.png';
import { getVisitedRooms, local, resetVisitedRooms } from '../shared/storage.js';

const EYE_HEIGHT = 1.6;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

function refreshProgress({ animate = false } = {}) {
  const visited = visitedIds();
  const done = visited.length >= rooms.length;
  el.endingBtn.hidden = !done;
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
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

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

async function startHall() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('Không khởi tạo được WebGL:', error);
    showFallback('Trình duyệt hoặc thiết bị của bạn không hiển thị được sảnh 3D (WebGL). Bạn vẫn có thể vào từng phòng qua danh sách dưới đây.');
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  controls.maxPolarAngle = Math.PI * 0.65;
  controls.autoRotate = !reducedMotion.matches;
  controls.autoRotateSpeed = 0.35;

  // Biển tên vẽ bằng canvas: phải có font Noto Serif trước khi vẽ
  // Font cho biển tên và hoa văn trống đồng cho sàn, tải song song trong lúc màn hình chờ
  const [, floorPattern, birdImage] = await Promise.all([
    loadFonts(),
    loadImage(drumPatternUrl),
    loadImage(`${import.meta.env.BASE_URL}images/chimlac.png`),
  ]);
  const hall = buildHall(scene, rooms, data.museum, { floorPattern, birdImage });
  const { doors, books } = hall;

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

  /* Đèn cửa và vòng đèn trần theo số phòng đã tham quan */
  let progressAnim = null;
  onProgressChange = (visited, { animate }) => {
    const set = new Set(visited);
    for (const door of doors) hall.setDoorVisited(door, set.has(door.room.id));
    const level = Math.min(6, visited.length);
    const celebrated = local.get('endingCelebrated', false);
    if (level === 6 && !celebrated && animate && !reducedMotion.matches) {
      // Lần đầu đủ sáu phòng: vòng đèn sáng trọn vẹn trong khoảng 1,5 giây
      hall.setProgressLevel(5);
      progressAnim = { from: 5, to: 6, start: performance.now() + 400, duration: 1500 };
    } else {
      progressAnim = null;
      hall.setProgressLevel(level);
    }
    if (level === 6) local.set('endingCelebrated', true);
  };
  refreshProgress({ animate: true });

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const timer = new THREE.Timer();
  timer.connect(document); // bỏ qua khoảng thời gian tab bị ẩn
  let firstFrame = true;
  const lastQuat = new THREE.Quaternion();

  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.1);
    if (progressAnim) {
      const k = THREE.MathUtils.clamp((performance.now() - progressAnim.start) / progressAnim.duration, 0, 1);
      hall.setProgressLevel(progressAnim.from + (progressAnim.to - progressAnim.from) * easeInOut(k));
      if (k >= 1) progressAnim = null;
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
    if (reducedMotion.matches) controls.autoRotate = false;
  });
}

refreshProgress();
if (hasWebGL()) {
  startHall().catch((error) => {
    console.error(error);
    showFallback('Không dựng được sảnh 3D trên thiết bị này. Bạn vẫn có thể vào từng phòng qua danh sách dưới đây.');
  });
} else {
  showFallback('Trình duyệt của bạn không hỗ trợ WebGL nên không hiển thị được sảnh 3D. Bạn vẫn có thể vào từng phòng qua danh sách dưới đây.');
}

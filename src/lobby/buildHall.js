import * as THREE from 'three';
import { getMaxAnisotropy, makeBandTexture, makeBookTexture, makeFloorTexture, makePlaqueTexture, makeStoneTexture } from './textures.js';
import { makeIconTexture } from './icons.js';
import { buildLotusCeiling } from './lotus.js';

export const HALL_RADIUS = 8; // bán kính ngoại tiếp lục giác = chiều dài mỗi bức tường
export const HALL_HEIGHT = 6;
export const DOOR_WIDTH = 1.8;
export const DOOR_HEIGHT = 3.2;
export const DOOR_OPEN_ANGLE = 1.35;

const APOTHEM = HALL_RADIUS * Math.cos(Math.PI / 6);
const WALL_WIDTH = HALL_RADIUS;

const HEMI_INTENSITY = 0.45;
const DOOR_SPOT = 34; // cường độ đèn rọi cửa
const DOOR_SPOT_VISITED = 44;
const LOOK_BOOST = 0.75; // cửa ở giữa tầm nhìn sáng thêm 75%
const LOOK_THRESHOLD = Math.cos(THREE.MathUtils.degToRad(24));

const COLORS = {
  lacquer: 0x7a1712,
  lacquerLight: 0x8e2119,
  gold: 0xc9a23f,
  granite: 0x3e3d3a,
  graniteDark: 0x2c2b29,
  stone: 0xd8d4cc,
  wood: 0x4a3426,
};

/**
 * Hướng (trong mặt phẳng XZ) từ tâm sảnh tới cửa thứ i.
 * Cửa 0 nằm ngay trước mặt người xem lúc vào (phía -Z), các cửa tiếp theo
 * lần lượt về bên phải.
 */
export function doorDirection(index) {
  const a = (index * Math.PI) / 3;
  return new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
}

function box(w, h, d, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
}

/** Bức tường có khoảng trống cho cửa, UV tính theo mét để đá lát lặp đều. */
function wallGeometry() {
  const hw = WALL_WIDTH / 2;
  const dw = DOOR_WIDTH / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(-dw, 0);
  shape.lineTo(-dw, DOOR_HEIGHT);
  shape.lineTo(dw, DOOR_HEIGHT);
  shape.lineTo(dw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, HALL_HEIGHT);
  shape.lineTo(-hw, HALL_HEIGHT);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/** Hành lang sau cửa: tối, cuối hành lang có ánh sáng ấm. Chỉ thấy khi cửa mở. */
function buildCorridor() {
  const group = new THREE.Group();
  const depth = 2.6;
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, depth),
    new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 1, side: THREE.BackSide }),
  );
  shell.position.set(0, DOOR_HEIGHT / 2, -depth / 2);
  group.add(shell);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(DOOR_WIDTH, DOOR_HEIGHT),
    new THREE.MeshBasicMaterial({ color: 0xffe2a6 }),
  );
  glow.position.set(0, DOOR_HEIGHT / 2, -depth + 0.01);
  group.add(glow);
  return group;
}

function buildDoor(index, room, shared) {
  const door = new THREE.Group();

  // Vật liệu khung riêng cho từng cửa để chỉ cửa đang hover sáng lên
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    metalness: 0.75,
    roughness: 0.32,
    emissive: new THREE.Color(0xffd27a),
    emissiveIntensity: 0,
  });
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.lacquer,
    roughness: 0.38,
    metalness: 0.05,
    emissive: new THREE.Color(0x7a1712),
    emissiveIntensity: 0,
  });

  const jambW = 0.14;
  const frameDepth = 0.22;
  const hits = [];

  const left = box(jambW, DOOR_HEIGHT + jambW, frameDepth, frameMaterial);
  left.position.set(-DOOR_WIDTH / 2 - jambW / 2, (DOOR_HEIGHT + jambW) / 2, 0);
  const right = left.clone();
  right.position.x *= -1;
  const head = box(DOOR_WIDTH + jambW * 2, jambW, frameDepth, frameMaterial);
  head.position.set(0, DOOR_HEIGHT + jambW / 2, 0);
  door.add(left, right, head);
  hits.push(left, right, head);

  // Cánh cửa xoay quanh bản lề bên trái
  const pivot = new THREE.Group();
  pivot.position.set(-DOOR_WIDTH / 2, 0, -0.05);
  door.add(pivot);

  const leafW = DOOR_WIDTH - 0.02;
  const leafH = DOOR_HEIGHT - 0.02;
  const leaf = box(leafW, leafH, 0.08, leafMaterial);
  leaf.position.set(DOOR_WIDTH / 2, leafH / 2, 0);
  pivot.add(leaf);
  hits.push(leaf);

  // Hai ô pano nổi và viền chỉ vàng trên cánh cửa
  for (const [y, h] of [
    [leafH * 0.7, leafH * 0.42],
    [leafH * 0.24, leafH * 0.3],
  ]) {
    const panel = box(leafW - 0.42, h, 0.03, shared.panelMaterial);
    panel.position.set(DOOR_WIDTH / 2, y, 0.05);
    const trim = box(leafW - 0.34, h + 0.08, 0.02, frameMaterial);
    trim.position.set(DOOR_WIDTH / 2, y, 0.045);
    pivot.add(trim, panel);
    hits.push(panel, trim);
  }
  const knob = new THREE.Mesh(shared.knobGeometry, frameMaterial);
  knob.position.set(DOOR_WIDTH - 0.18, leafH * 0.48, 0.08);
  pivot.add(knob);

  // Biển tên phía trên cửa
  const plaqueTexture = makePlaqueTexture(room.name, room.chapter);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 0.875),
    new THREE.MeshStandardMaterial({
      map: plaqueTexture,
      roughness: 0.55,
      emissive: 0xffffff,
      emissiveMap: plaqueTexture,
      emissiveIntensity: 0.18,
    }),
  );
  plaque.position.set(0, DOOR_HEIGHT + 0.66, 0.06);
  const plaqueFrameMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    metalness: 0.75,
    roughness: 0.32,
    emissive: new THREE.Color(0xffd27a),
    emissiveIntensity: 0,
  });
  const plaqueBack = box(2.9, 0.975, 0.05, plaqueFrameMaterial);
  plaqueBack.position.set(0, DOOR_HEIGHT + 0.66, 0.025);
  door.add(plaqueBack, plaque);
  hits.push(plaque, plaqueBack);

  // Biểu tượng phòng: nét vàng trên nền trong suốt, ngay trên biển tên
  const iconTexture = makeIconTexture(room.icon, getMaxAnisotropy());
  if (iconTexture) {
    const icon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.46),
      new THREE.MeshStandardMaterial({
        map: iconTexture,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.4,
        metalness: 0.3,
        emissive: 0xffffff,
        emissiveMap: iconTexture,
        emissiveIntensity: 0.35,
      }),
    );
    icon.position.set(0, DOOR_HEIGHT + 1.41, 0.04);
    door.add(icon);
    hits.push(icon);
  }

  door.add(buildCorridor());

  for (const mesh of hits) mesh.userData.doorIndex = index;

  return { door, pivot, frameMaterial, leafMaterial, plaqueFrameMaterial, hits };
}

function buildWall(index, shared) {
  const wall = new THREE.Group();
  const dir = doorDirection(index);
  wall.position.copy(dir).multiplyScalar(APOTHEM);
  wall.rotation.y = (-index * Math.PI) / 3; // trục +Z cục bộ hướng vào tâm sảnh

  wall.add(new THREE.Mesh(shared.wallGeometry, shared.wallMaterial));

  // Chân tường ốp gỗ tối hai bên cửa, gờ vàng mảnh phân cách
  const dadoH = 0.9;
  const sideW = WALL_WIDTH / 2 - DOOR_WIDTH / 2 - 0.14;
  for (const s of [-1, 1]) {
    const dado = box(sideW, dadoH, 0.06, shared.woodMaterial);
    dado.position.set(s * (DOOR_WIDTH / 2 + 0.14 + sideW / 2), dadoH / 2, 0.03);
    const cap = box(sideW, 0.03, 0.08, shared.goldMaterial);
    cap.position.set(dado.position.x, dadoH, 0.045);
    wall.add(dado, cap);
  }

  // Băng chữ chạy quanh đỉnh tường, ngay dưới gốc các cánh sen, kẹp giữa hai gờ vàng
  const band = new THREE.Mesh(shared.bandGeometry, shared.bandMaterials[index]);
  band.position.set(0, 5.4, 0.02);
  wall.add(band);
  for (const y of [4.88, 5.92]) {
    const moulding = box(WALL_WIDTH, 0.05, 0.08, shared.goldMaterial);
    moulding.position.set(0, y, 0.04);
    wall.add(moulding);
  }

  return wall;
}

function buildPilasters(shared) {
  const group = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.5) * Math.PI) / 3; // các góc lục giác
    const r = HALL_RADIUS - 0.18;
    const pillar = box(0.5, HALL_HEIGHT, 0.36, shared.pilasterMaterial);
    pillar.position.set(Math.sin(a) * r, HALL_HEIGHT / 2, -Math.cos(a) * r);
    pillar.rotation.y = -a;
    const capital = box(0.62, 0.14, 0.46, shared.goldMaterial);
    capital.position.set(pillar.position.x, 4.86, pillar.position.z);
    capital.rotation.y = -a;
    const base = box(0.62, 0.24, 0.46, shared.woodMaterial);
    base.position.set(pillar.position.x, 0.12, pillar.position.z);
    base.rotation.y = -a;
    group.add(pillar, capital, base);
  }
  return group;
}

function buildFloor(shared) {
  const floorTexture = makeFloorTexture(shared.floorPattern);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(HALL_RADIUS, 6),
    new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.32, metalness: 0.08 }),
  );
  floor.rotation.x = -Math.PI / 2;
  return floor;
}

/** Ánh sáng nền yếu + mỗi cửa một đèn rọi. Không bật bóng đổ. Đèn giếng trời nằm trong lotus.js. */
function buildLights(scene, doors) {
  const hemi = new THREE.HemisphereLight(0xfff0d6, 0x3e3d3a, HEMI_INTENSITY);
  scene.add(hemi);

  for (const door of doors) {
    const spot = new THREE.SpotLight(0xffe2b0, 0, 9, 0.42, 0.65, 2);
    spot.position.set(0, HALL_HEIGHT - 0.25, 2.1);
    spot.target.position.set(0, 1.5, 0);
    door.wall.add(spot, spot.target);
    door.spot = spot;
  }
  return { hemi };
}

/* ---------- Bệ và cuốn sách mở (P3) ---------- */

// Đặt lệch tâm, ở góc giữa cửa 1 và cửa 6: người xem đứng đúng tâm sảnh nên
// bệ ở chính tâm sẽ nằm ngay dưới chân, không nhìn thấy được.
// Ba bục sách/cột thông tin ở sảnh:
// Trái: Lời giới thiệu, Giữa: Chơi thử thách, Phải: Nguồn tư liệu
export const BOOKS = [
  { action: 'intro', angle: -Math.PI / 4, title: 'Lời giới thiệu', promptText: 'Bấm để đọc', cover: 0x7a1712, seed: 1969 },
  { action: 'game', angle: 0, title: 'Chơi thử thách', promptText: 'Bấm để chơi', cover: 0xb8860b, seed: 2026 },
  { action: 'credits', angle: Math.PI / 4, title: 'Nguồn tư liệu', promptText: 'Bấm để xem', cover: 0x2f3f30, seed: 1890 },
];
const BOOK_DISTANCE = 2.5;

function buildBook(shared, { action, angle, title, promptText, cover: coverColor, seed }) {
  const group = new THREE.Group();
  const a = angle;
  group.position.set(Math.sin(a) * BOOK_DISTANCE, 0, -Math.cos(a) * BOOK_DISTANCE);
  group.rotation.y = -a; // mặt trước hướng về tâm sảnh

  const pedestal = box(0.62, 0.72, 0.5, shared.dadoMaterial);
  pedestal.position.y = 0.36;
  const plinth = box(0.76, 0.08, 0.64, shared.dadoMaterial);
  plinth.position.y = 0.04;
  const cap = box(0.72, 0.05, 0.6, shared.goldMaterial);
  cap.position.y = 0.745;
  group.add(plinth, pedestal, cap);

  // Giá đọc: khối gỗ hình nêm ngồi trên mặt bục, mặt trên nghiêng về phía người xem
  const TILT = 0.42;
  const CAP_TOP = 0.77;
  const HALF_DEPTH = 0.24; // nửa chiều sâu cuốn sách
  const FRONT_H = 0.035; // độ cao mép trước của giá
  const rise = 2 * HALF_DEPTH * Math.tan(TILT);
  // Mặt cắt hình thang trong mặt phẳng (u, y); u = -z vì lát cắt được xoay 90° quanh trục y
  const profile = new THREE.Shape();
  profile.moveTo(-HALF_DEPTH, 0);
  profile.lineTo(HALF_DEPTH, 0);
  profile.lineTo(HALF_DEPTH, FRONT_H + rise);
  profile.lineTo(-HALF_DEPTH, FRONT_H);
  profile.closePath();
  const wedgeGeometry = new THREE.ExtrudeGeometry(profile, { depth: 0.6, bevelEnabled: false });
  wedgeGeometry.translate(0, 0, -0.3);
  const wedge = new THREE.Mesh(
    wedgeGeometry,
    new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.6 }),
  );
  wedge.rotation.y = Math.PI / 2;
  wedge.position.y = CAP_TOP;
  group.add(wedge);

  // Cuốn sách nằm trên mặt nghiêng của giá
  const lectern = new THREE.Group();
  lectern.position.set(0, CAP_TOP + FRONT_H + rise / 2 + 0.014, 0);
  lectern.rotation.x = TILT; // mặt sách ngửa về phía người xem
  group.add(lectern);

  const coverMaterial = new THREE.MeshStandardMaterial({
    color: coverColor,
    roughness: 0.45,
    emissive: new THREE.Color(0xc9a23f),
    emissiveIntensity: 0,
  });
  const cover = box(0.7, 0.025, 0.48, coverMaterial);
  lectern.add(cover);

  const pageTexture = makeBookTexture(title, seed, promptText);
  const pageMaterial = new THREE.MeshStandardMaterial({
    map: pageTexture,
    roughness: 0.8,
    emissive: 0xffffff,
    emissiveMap: pageTexture,
    emissiveIntensity: 0.25,
  });
  // Hai trang hơi vồng lên ở gáy sách
  const pages = [];
  for (const side of [-1, 1]) {
    const page = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.44), pageMaterial.clone());
    page.material.map = pageTexture.clone();
    page.material.map.repeat.set(0.5, 1);
    page.material.map.offset.set(side < 0 ? 0 : 0.5, 0);
    page.material.map.needsUpdate = true;
    page.material.emissiveMap = page.material.map;
    page.rotation.order = 'ZXY'; // nằm phẳng trước, rồi nghiêng quanh gáy sách
    page.rotation.x = -Math.PI / 2;
    page.rotation.z = -side * 0.09;
    page.position.set(side * 0.162, 0.03, 0);
    lectern.add(page);
    pages.push(page);
  }

  const hits = [pedestal, cap, wedge, cover, ...pages];
  for (const mesh of hits) mesh.userData.action = action;
  return { action, title, group, hits, coverMaterial, pageMaterials: pages.map((p) => p.material) };
}

/**
 * Dựng toàn bộ sảnh. rooms: danh sách phòng đã sắp theo order.
 * museum: { title, motto, mottoSource } cho băng chữ.
 */
export function buildHall(scene, rooms, museum, { floorPattern = null, birdImage = null, coarse = false } = {}) {
  const stoneTexture = makeStoneTexture();
  stoneTexture.repeat.set(1 / 2, 1 / 1.5); // phiến đá 2m × 1,5m

  // Băng chữ: tiêu đề ở bức tường đối diện lúc vào, câu nói ở bức tường phía sau
  const bandSpecs = [
    { kind: 'text', text: museum.title },
    { kind: 'ornament' },
    { kind: 'ornament' },
    { kind: 'text', text: museum.motto, note: museum.mottoSource },
    { kind: 'ornament' },
    { kind: 'ornament' },
  ];
  // Đoạn không có khẩu hiệu: dải chim Lạc (nếu tải được ảnh), không thì hoa văn hình thoi
  const ornament = makeBandTexture(birdImage ? { kind: 'birds', bird: birdImage } : { kind: 'ornament' });
  const bandMaterials = bandSpecs.map((spec) => {
    const map = spec.kind === 'ornament' ? ornament : makeBandTexture(spec);
    return new THREE.MeshStandardMaterial({
      map,
      roughness: 0.5,
      emissive: 0xffffff,
      emissiveMap: map,
      emissiveIntensity: 0.12,
    });
  });

  const shared = {
    wallGeometry: wallGeometry(),
    wallMaterial: new THREE.MeshStandardMaterial({ map: stoneTexture, color: 0xffffff, roughness: 0.85 }),
    dadoMaterial: new THREE.MeshStandardMaterial({ color: COLORS.granite, roughness: 0.4, metalness: 0.05 }),
    woodMaterial: new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.55, metalness: 0.02 }),
    pilasterMaterial: new THREE.MeshStandardMaterial({ color: COLORS.lacquer, roughness: 0.42 }),
    goldMaterial: new THREE.MeshStandardMaterial({ color: COLORS.gold, metalness: 0.75, roughness: 0.35 }),
    panelMaterial: new THREE.MeshStandardMaterial({ color: COLORS.lacquerLight, roughness: 0.32 }),
    knobGeometry: new THREE.SphereGeometry(0.055, 16, 12),
    bandGeometry: new THREE.PlaneGeometry(WALL_WIDTH, 1.0),
    bandMaterials,
    floorPattern,
  };

  const doors = rooms.slice(0, 6).map((room, index) => {
    const wall = buildWall(index, shared);
    const parts = buildDoor(index, room, shared);
    wall.add(parts.door);
    scene.add(wall);
    return { index, room, wall, direction: doorDirection(index), ...parts };
  });

  scene.add(buildFloor(shared));
  const lotus = buildLotusCeiling({ apothem: APOTHEM, wallHeight: HALL_HEIGHT, coarse });
  scene.add(lotus.group);
  const books = BOOKS.map((spec) => buildBook(shared, spec));
  for (const book of books) scene.add(book.group);
  scene.add(buildPilasters(shared));
  const lights = buildLights(scene, doors);

  // Trạng thái ánh sáng: các hệ số 0–1 do trình tự mở màn điều khiển
  const intro = { doors: doors.map(() => 1) };
  const look = doors.map(() => 0);
  const visitedDoors = doors.map(() => false);

  function applyDoorLight(i) {
    const base = visitedDoors[i] ? DOOR_SPOT_VISITED : DOOR_SPOT;
    doors[i].spot.intensity = base * intro.doors[i] * (1 + LOOK_BOOST * look[i]);
  }

  function setDoorVisited(door, visited, { instant = false } = {}) {
    visitedDoors[door.index] = visited;
    door.plaqueFrameMaterial.emissiveIntensity = visited ? 0.75 : 0;
    lotus.setPetal(door.index, visited, { instant });
    applyDoorLight(door.index);
  }

  /**
   * Trình tự mở màn: sky (giếng trời, luồng sáng, bụi, ánh sáng nền), doors[i] (đèn rọi cửa i),
   * band (băng chữ). Mỗi hệ số 0–1; bỏ trống thì giữ nguyên.
   */
  function setIntro({ sky, doors: doorLevels, band } = {}) {
    if (sky != null) {
      lotus.setSkyLevel(sky);
      lights.hemi.intensity = HEMI_INTENSITY * sky;
    }
    if (doorLevels) {
      doorLevels.forEach((k, i) => {
        intro.doors[i] = k;
        applyDoorLight(i);
      });
    }
    if (band != null) {
      for (const m of bandMaterials) {
        m.color.setScalar(band);
        m.emissiveIntensity = 0.12 * band;
      }
    }
  }

  const viewDir = new THREE.Vector3();

  /**
   * Gọi mỗi frame. Cửa nằm giữa tầm nhìn (theo hướng camera, không theo con trỏ) được đèn rọi
   * sáng thêm, chuyển mượt: người dùng điện thoại không có hover vẫn biết mình đang nhìn cửa nào.
   */
  function update(dt, camera, { dustMoving = true } = {}) {
    lotus.update(dt, { dustMoving });
    camera.getWorldDirection(viewDir);
    viewDir.y = 0;
    viewDir.normalize();
    let best = -1;
    let bestDot = LOOK_THRESHOLD;
    for (const door of doors) {
      const d = viewDir.dot(door.direction);
      if (d > bestDot) {
        bestDot = d;
        best = door.index;
      }
    }
    const k = 1 - Math.exp(-Math.max(0, dt) * 5); // dt âm sẽ làm hệ số vượt 1 và dao động phân kỳ
    for (let i = 0; i < doors.length; i++) {
      const target = i === best ? 1 : 0;
      if (look[i] === target) continue;
      look[i] += (target - look[i]) * k;
      if (Math.abs(look[i] - target) < 1e-3) look[i] = target;
      applyDoorLight(i);
    }
  }

  return { doors, books, setDoorVisited, setBloom: lotus.setBloom, setDustVisible: lotus.setDustVisible, setIntro, update };
}

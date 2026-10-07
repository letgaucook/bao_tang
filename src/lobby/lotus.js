import * as THREE from 'three';
import { makeBeamTexture, makeDustTexture, makePetalTexture } from './textures.js';

/*
 * Trần sảnh: bông sen sáu cánh ôm lấy trần, giữa là giếng trời rọi luồng sáng xuống tâm mặt trống đồng.
 *
 * Mọi thứ bám theo một "vòm" chung: tham số t chạy từ mép trên tường (t = 0) tới mép giếng trời (t = 1),
 * độ cao H(t) dốc ở sát tường rồi thoải dần về tâm. Vòm nền tối nằm phía trên, cánh sen nằm ngay dưới vòm.
 *
 * Cánh sen là lưới tự dựng (u dọc thân cánh, v ngang cánh) rồi uốn theo vòm, xem README.
 */

const PETAL_SEGMENTS_U = 40;
const PETAL_SEGMENTS_V = 16;
const BLOOM_ANGLE = THREE.MathUtils.degToRad(4); // sen nở: cánh mở thêm về phía tường

export function buildLotusCeiling({ apothem, wallHeight, coarse }) {
  const A = apothem;
  const SKY_R = 1.5; // bán kính giếng trời
  const RISE = 1.7; // vòm cao thêm từ mép tường tới giếng trời
  const H = (t) => wallHeight + RISE * (1 - Math.pow(1 - THREE.MathUtils.clamp(t, 0, 1), 2.2));
  const SKY_Y = H(1);

  const group = new THREE.Group();

  /* ---------- Vòm nền: lục giác ở chân (khớp mép tường), tròn ở miệng giếng trời ---------- */
  {
    const rings = 24;
    const sectors = 6 * 16;
    const positions = [];
    const indices = [];
    for (let k = 0; k <= rings; k++) {
      const t = k / rings;
      for (let j = 0; j <= sectors; j++) {
        const theta = (j / sectors) * Math.PI * 2;
        const nearest = Math.round(theta / (Math.PI / 3)) * (Math.PI / 3);
        const hexR = A / Math.cos(theta - nearest);
        const r = THREE.MathUtils.lerp(hexR, SKY_R, t);
        positions.push(Math.sin(theta) * r, H(t), -Math.cos(theta) * r);
      }
    }
    for (let k = 0; k < rings; k++) {
      for (let j = 0; j < sectors; j++) {
        const a = k * (sectors + 1) + j;
        const b = a + sectors + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const dome = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: 0x5b4b3c, roughness: 0.95, side: THREE.DoubleSide, emissive: 0x2a1e14, emissiveIntensity: 1 }),
    );
    group.add(dome);
  }

  /* ---------- Sáu cánh sen ---------- */
  const petalTexture = makePetalTexture();
  const ROOT = A - 0.12; // gốc cánh: sát mép trên tường
  const TIP = SKY_R + 0.4; // đầu cánh dừng trước mép giếng trời
  const halfWidth = (u) => 0.4 * (1 - u) + 2.2 * Math.sin(Math.PI * Math.pow(u, 0.8));
  const W_MAX = 2.55;
  const petalGeometry = (() => {
    const positions = [];
    const uvs = [];
    const indices = [];
    const rootY = H(0) - 0.06;
    for (let i = 0; i <= PETAL_SEGMENTS_U; i++) {
      const u = i / PETAL_SEGMENTS_U;
      const d = THREE.MathUtils.lerp(ROOT, TIP, u); // khoảng cách vuông góc tới tâm (theo hướng cửa)
      const w = halfWidth(u);
      for (let j = 0; j <= PETAL_SEGMENTS_V; j++) {
        const v = (j / PETAL_SEGMENTS_V) * 2 - 1;
        const x = v * w;
        const r = Math.hypot(d, x);
        // Điểm của vòm nằm trên cùng tia: tường gặp tia ở bán kính A·r/d
        const wallR = (A * r) / d;
        const t = (wallR - r) / (wallR - SKY_R);
        // Khe hở với vòm: nhỏ ở gốc, rộng dần về đầu cánh (chừa chỗ cho lúc sen nở);
        // hai mép cánh rủ xuống thấp hơn sống cánh (cánh khum, nhìn từ dưới lên)
        const gap = 0.06 + 0.75 * Math.pow(u, 1.2);
        const cup = 0.32 * v * v * (w / W_MAX);
        const y = H(t) - gap - cup;
        // Tọa độ cục bộ: gốc cánh ở (0, 0, 0), trục +Z hướng vào tâm sảnh
        positions.push(x, y - rootY, ROOT - d);
        uvs.push((v + 1) / 2, u);
      }
    }
    for (let i = 0; i < PETAL_SEGMENTS_U; i++) {
      for (let j = 0; j < PETAL_SEGMENTS_V; j++) {
        const a = i * (PETAL_SEGMENTS_V + 1) + j;
        const b = a + PETAL_SEGMENTS_V + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return { geometry, rootY };
  })();

  const petals = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3; // trùng hướng cửa thứ i
    const pivot = new THREE.Group();
    pivot.position.set(Math.sin(a) * ROOT, petalGeometry.rootY, -Math.cos(a) * ROOT);
    pivot.rotation.y = -a;
    const material = new THREE.MeshStandardMaterial({
      map: petalTexture,
      roughness: 0.7,
      side: THREE.DoubleSide, // nhìn từ dưới lên là thấy mặt trong của cánh
      emissive: 0xffd49a,
      emissiveMap: petalTexture,
      emissiveIntensity: 0,
    });
    const mesh = new THREE.Mesh(petalGeometry.geometry, material);
    pivot.add(mesh);
    group.add(pivot);
    petals.push({ pivot, material, glow: 0, target: 0 });
  }

  /* ---------- Giếng trời ---------- */
  const SKY_COLOR = new THREE.Color(0xfff3d6);
  const skyMaterial = new THREE.MeshBasicMaterial({ color: SKY_COLOR.clone() });
  const sky = new THREE.Mesh(new THREE.CircleGeometry(SKY_R + 0.05, 64), skyMaterial);
  sky.rotation.x = Math.PI / 2; // mặt sáng hướng xuống
  sky.position.y = SKY_Y + 0.01;
  group.add(sky);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(SKY_R, 0.05, 8, 96),
    new THREE.MeshStandardMaterial({ color: 0xc9a23f, metalness: 0.7, roughness: 0.35, emissive: 0x6b5420, emissiveIntensity: 0.4 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = SKY_Y;
  group.add(rim);

  /* ---------- Luồng sáng: ống loe mở hai đầu, mờ dần theo chiều cao ---------- */
  const BEAM_H = SKY_Y - 0.02;
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe6b8,
    map: makeBeamTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    // Người xem đứng trong luồng sáng nên chỉ thấy mặt trong của ống
    side: THREE.BackSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(SKY_R * 0.97, SKY_R * 1.35, BEAM_H, 64, 1, true), beamMaterial);
  beam.position.y = BEAM_H / 2;
  beam.renderOrder = 2;
  group.add(beam);

  /* ---------- Bụi lơ lửng trong luồng sáng ---------- */
  const DUST = coarse ? 150 : 300;
  const dustPositions = new Float32Array(DUST * 3);
  const dustSeeds = [];
  const Y_MIN = 0.3;
  const Y_MAX = SKY_Y - 0.4;
  for (let i = 0; i < DUST; i++) {
    // Chừa khoảng trống quanh tầm mắt người xem để hạt không phóng to sát camera
    const r = 0.6 + Math.sqrt(Math.random()) * (SKY_R * 1.15 - 0.6);
    const a = Math.random() * Math.PI * 2;
    const y = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
    dustPositions.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    dustSeeds.push({
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      speed: (Math.random() < 0.5 ? -1 : 1) * (0.025 + Math.random() * 0.05),
      phase: Math.random() * Math.PI * 2,
      sway: 0.04 + Math.random() * 0.08,
    });
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: 0xffe7b0,
    size: 0.022,
    map: makeDustTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.renderOrder = 3;
  group.add(dust);

  /* ---------- Đèn ---------- */
  // Đèn rọi từ giếng trời xuống tâm sàn, góc hẹp, mép mềm
  const skySpot = new THREE.SpotLight(0xfff0d0, 0, 0, 0.3, 0.85, 2);
  skySpot.position.set(0, SKY_Y - 0.1, 0);
  skySpot.target.position.set(0, 0, 0);
  group.add(skySpot, skySpot.target);
  // Ánh hắt từ sàn sáng lên mặt dưới cánh sen
  const bounce = new THREE.PointLight(0xffe2b8, 0, 0, 2);
  bounce.position.set(0, 2.2, 0);
  group.add(bounce);

  let skyLevel = 1;
  let bloom = 0;
  let time = 0;

  function apply() {
    const boost = 1 + 0.9 * bloom;
    skyMaterial.color.copy(SKY_COLOR).multiplyScalar(skyLevel * boost);
    beamMaterial.opacity = 0.12 * skyLevel * (1 + 0.5 * bloom);
    dustMaterial.opacity = 0.55 * skyLevel;
    skySpot.intensity = 70 * skyLevel * (1 + 0.6 * bloom);
    bounce.intensity = 22 * skyLevel * (1 + 0.4 * bloom);
    for (const p of petals) {
      p.pivot.rotation.x = -BLOOM_ANGLE * bloom; // âm: đầu cánh nhấc lên, mở về phía tường
      p.material.emissiveIntensity = (0.1 + 0.45 * p.glow + 0.15 * bloom) * skyLevel;
    }
  }
  apply();

  return {
    group,
    /** Cánh i sáng lên (phòng i đã tham quan). instant: đổi ngay, không chuyển mượt. */
    setPetal(i, on, { instant = false } = {}) {
      const p = petals[i];
      if (!p) return;
      p.target = on ? 1 : 0;
      if (instant) p.glow = p.target;
      apply();
    },
    /** 0 → 1: sen nở (cánh mở thêm, giếng trời sáng mạnh hơn). */
    setBloom(k) {
      bloom = k;
      apply();
    },
    /** Độ sáng giếng trời, luồng sáng và bụi (dùng cho trình tự mở màn). */
    setSkyLevel(k) {
      skyLevel = k;
      apply();
    },
    /** Ẩn bụi (chất lượng đồ họa "Tiết kiệm"). */
    setDustVisible(visible) {
      dust.visible = visible;
    },
    update(dt, { dustMoving = true } = {}) {
      // Cánh sen sáng/tắt mượt trong khoảng 1 giây
      const step = dt / 1.0;
      let changed = false;
      for (const p of petals) {
        if (p.glow !== p.target) {
          p.glow = p.glow < p.target ? Math.min(p.target, p.glow + step) : Math.max(p.target, p.glow - step);
          changed = true;
        }
      }
      if (changed) apply();

      if (!dustMoving || !dust.visible) return;
      time += dt;
      const pos = dustGeometry.attributes.position;
      for (let i = 0; i < DUST; i++) {
        const s = dustSeeds[i];
        let y = pos.getY(i) + s.speed * dt;
        if (y > Y_MAX) y = Y_MIN;
        else if (y < Y_MIN) y = Y_MAX;
        const k = time * 0.25 + s.phase;
        pos.setXYZ(i, s.x + Math.sin(k) * s.sway, y, s.z + Math.cos(k * 0.8) * s.sway);
      }
      pos.needsUpdate = true;
    },
  };
}

import * as THREE from 'three';
export { loadFonts } from '../shared/fonts.js';

const GOLD = '#C9A23F';
const GOLD_SOFT = '#E2C77A';
const LACQUER = '#7A1712';
const LACQUER_DEEP = '#4E0E0B';
const GRANITE = '#3E3D3A';
const SERIF = '"Noto Serif", "Times New Roman", Georgia, serif';

let maxAnisotropy = 1;

export function setMaxAnisotropy(value) {
  maxAnisotropy = value;
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')];
}

function toTexture(canvas, { repeat = false } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
  return texture;
}

/** Hạt li ti cho bề mặt đá; rng cố định để mỗi lần tải đều giống nhau. */
function speckle(ctx, width, height, count, colors, rng, maxSize = 2.2) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
    const size = 0.5 + rng() * maxSize;
    ctx.fillRect(rng() * width, rng() * height, size, size);
  }
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Chia chữ thành tối đa 2 dòng cho vừa chiều rộng. */
function fitLines(ctx, text, maxWidth, fontFor, startSize, minSize) {
  for (let size = startSize; size >= minSize; size -= 4) {
    ctx.font = fontFor(size);
    if (ctx.measureText(text).width <= maxWidth) return { size, lines: [text] };
  }
  const words = text.split(' ');
  for (let size = startSize; size >= minSize; size -= 4) {
    ctx.font = fontFor(size);
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
      if (w <= maxWidth && (!best || w < best.w)) best = { w, lines: [a, b] };
    }
    if (best) return { size, lines: best.lines };
  }
  ctx.font = fontFor(minSize);
  return { size: minSize, lines: [text] };
}

function goldFrame(ctx, width, height, inset, lineWidth = 3) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
}

/** Biển tên phòng: chữ Noto Serif vàng trên nền đỏ sẫm, 1024×256. */
export function makePlaqueTexture(name, sub = '') {
  const W = 1024;
  const H = 320;
  const [canvas, ctx] = makeCanvas(W, H);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#5E110D');
  bg.addColorStop(0.5, LACQUER_DEEP);
  bg.addColorStop(1, '#3A0A08');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  goldFrame(ctx, W, H, 10, 5);
  goldFrame(ctx, W, H, 22, 1.5);

  // Hoa văn góc: hình thoi nhỏ
  ctx.fillStyle = GOLD;
  for (const [x, y] of [
    [22, 22],
    [W - 22, 22],
    [22, H - 22],
    [W - 22, H - 22],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 9, y);
    ctx.lineTo(x, y + 9);
    ctx.lineTo(x - 9, y);
    ctx.closePath();
    ctx.fill();
  }

  const fontFor = (size) => `700 ${size}px ${SERIF}`;
  const { size, lines } = fitLines(ctx, name, W - 120, fontFor, sub ? 76 : 84, 44);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  const lineHeight = size * 1.18;
  const subSize = 50;
  const subGap = sub ? subSize * 1.45 : 0;
  // Khối chữ (tên + dòng phụ) căn giữa theo chiều dọc; dịch xuống chút vì chữ Việt có dấu phía trên
  const blockH = (lines.length - 1) * lineHeight + subGap;
  const top = H / 2 - blockH / 2 + size * 0.06;
  ctx.font = fontFor(size);
  ctx.fillStyle = GOLD_SOFT;
  lines.forEach((line, i) => ctx.fillText(line, W / 2, top + i * lineHeight));
  if (sub) {
    const y = top + (lines.length - 1) * lineHeight + subGap + 4;
    ctx.font = `italic 400 ${subSize}px ${SERIF}`;
    ctx.fillStyle = 'rgba(243,237,224,0.85)';
    ctx.fillText(sub, W / 2, y);
    const half = ctx.measureText(sub).width / 2 + 24;
    ctx.shadowBlur = 0;
    ctx.fillStyle = GOLD;
    ctx.fillRect(W / 2 - half - 70, y, 70, 2);
    ctx.fillRect(W / 2 + half, y, 70, 2);
  }

  return toTexture(canvas);
}

/** Tải ảnh, có hạn chờ; lỗi hoặc quá hạn thì trả về null để dùng hoa văn dự phòng. */
export function loadImage(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(null), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Tách nét hoa văn từ ảnh (nền trắng hoặc trong suốt) thành một lớp màu đơn sắc:
 * độ đậm của điểm ảnh quyết định độ phủ, nên dùng được cho cả hai kiểu nền.
 */
function tintPattern(img, size, [r, g, b], alphaScale = 1) {
  const [canvas, ctx] = makeCanvas(size, size);
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
    // Nét hoa văn gốc màu nâu (độ sáng ~0,27) → độ phủ tối đa
    const ink = Math.min(1, (1 - lum) / 0.7);
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = Math.round(px[i + 3] * ink * alphaScale);
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/**
 * Sàn granite. Có ảnh hoa văn trống đồng thì đặt hoa văn vàng thếp khắc chìm ở giữa sàn,
 * không có thì dùng các vòng tròn đồng tâm.
 * drumRatio: tỉ lệ đường kính mặt trống so với cạnh ảnh gốc.
 */
export function makeFloorTexture(drumImage = null, { drumRadius = 0.39, drumRatio = 0.895 } = {}) {
  if (drumImage) return makeDrumFloorTexture(drumImage, drumRadius, drumRatio);
  return makeRingFloorTexture();
}

function granite(ctx, S, seed) {
  const rng = seededRandom(seed);
  ctx.fillStyle = GRANITE;
  ctx.fillRect(0, 0, S, S);
  speckle(ctx, S, S, 90000, ['#2E2D2B', '#4A4946', '#55534F', '#34332F', '#5E5B55'], rng);
}

function makeDrumFloorTexture(img, drumRadius, drumRatio) {
  const S = 2048;
  const [canvas, ctx] = makeCanvas(S, S);
  granite(ctx, S, 1945);
  const c = S / 2;

  // Làm tối nhẹ vùng mặt trống để nét vàng nổi hơn
  const glow = ctx.createRadialGradient(c, c, 0, c, c, S * 0.5);
  glow.addColorStop(0, 'rgba(20,19,18,0.35)');
  glow.addColorStop(0.8, 'rgba(20,19,18,0.2)');
  glow.addColorStop(1, 'rgba(20,19,18,0.45)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // drumRadius: bán kính mặt trống tính theo cạnh texture (sàn rộng 16 m → 0,39 ≈ 6,2 m)
  const size = Math.round((S * drumRadius * 2) / drumRatio);
  const x = Math.round(c - size / 2);
  const shadow = tintPattern(img, size, [8, 7, 6], 0.7);
  const gold = tintPattern(img, size, [201, 162, 63], 0.92);
  ctx.drawImage(shadow, x + 3, x + 3); // bóng đổ: nét như khắc chìm vào đá
  ctx.drawImage(gold, x, x);

  // Vòng chỉ vàng bao ngoài mặt trống
  ctx.strokeStyle = GOLD;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(c, c, S * drumRadius + 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  return toTexture(canvas);
}

/** Sàn granite với các vòng tròn đồng tâm viền vàng mảnh (dự phòng khi không tải được hoa văn). */
function makeRingFloorTexture() {
  const S = 2048;
  const [canvas, ctx] = makeCanvas(S, S);
  granite(ctx, S, 1945);

  const c = S / 2;
  // Vùng tâm sẫm hơn để nổi các vòng
  const glow = ctx.createRadialGradient(c, c, 0, c, c, S * 0.5);
  glow.addColorStop(0, 'rgba(20,19,18,0.0)');
  glow.addColorStop(0.55, 'rgba(20,19,18,0.25)');
  glow.addColorStop(1, 'rgba(20,19,18,0.5)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = GOLD;
  const ring = (r, w, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  };
  ring(S * 0.06, 3);
  ring(S * 0.075, 1.5);
  ring(S * 0.17, 3);
  ring(S * 0.18, 1.5);
  ring(S * 0.3, 2, 0.8);
  ring(S * 0.4, 3);
  ring(S * 0.41, 1.5);

  // Mười hai tia mảnh giữa hai vòng trong, gợi hoa văn mặt trống đồng
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * S * 0.08, c + Math.sin(a) * S * 0.08);
    ctx.lineTo(c + Math.cos(a) * S * 0.165, c + Math.sin(a) * S * 0.165);
    ctx.stroke();
  }
  // Ngôi sao năm cánh nhỏ ở tâm
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? S * 0.045 : S * 0.018;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Các chấm vàng trên vòng giữa
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * S * 0.3, c + Math.sin(a) * S * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return toTexture(canvas);
}

/** Một phiến đá sáng có mạch ghép; lặp lại trên tường theo đơn vị mét. */
export function makeStoneTexture() {
  const W = 512;
  const H = 384;
  const [canvas, ctx] = makeCanvas(W, H);
  const rng = seededRandom(1890);
  ctx.fillStyle = '#D8D4CC';
  ctx.fillRect(0, 0, W, H);
  speckle(ctx, W, H, 9000, ['#CFCAC0', '#E0DCD5', '#C8C2B7', '#DDD8CF'], rng, 1.6);
  // Vân đá rất nhạt
  ctx.strokeStyle = 'rgba(160,150,135,0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    let x = rng() * W;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < H) {
      x += (rng() - 0.5) * 40;
      y += 20 + rng() * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Mạch ghép
  ctx.fillStyle = 'rgba(120,112,100,0.35)';
  ctx.fillRect(0, 0, W, 2);
  ctx.fillRect(0, 0, 2, H);
  return toTexture(canvas, { repeat: true });
}

function bandBase(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#5A100C');
  bg.addColorStop(0.5, LACQUER);
  bg.addColorStop(1, '#5A100C');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 10, W, 4);
  ctx.fillRect(0, 20, W, 1.5);
  ctx.fillRect(0, H - 14, W, 4);
  ctx.fillRect(0, H - 21.5, W, 1.5);
}

/**
 * Băng chữ chạy quanh sảnh phía trên các cửa (2048×256 mỗi mặt tường).
 * kind: 'text' (chữ lớn + dòng phụ) hoặc 'ornament' (hoa văn nối tiếp).
 */
/** Cắt bỏ phần trong suốt quanh hình, trả về canvas vừa khít nét vẽ. */
function trimTransparent(img) {
  const [canvas, ctx] = makeCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 16) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return canvas;
  const [out, octx] = makeCanvas(x1 - x0 + 1, y1 - y0 + 1);
  octx.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

/** Tô lại hình (giữ kênh trong suốt) bằng một màu. */
function recolor(source, color) {
  const [canvas, ctx] = makeCanvas(source.width, source.height);
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

export function makeBandTexture({ kind, text = '', note = '', bird = null }) {
  const W = 2048;
  const H = 256;
  const [canvas, ctx] = makeCanvas(W, H);
  bandBase(ctx, W, H);

  ctx.fillStyle = GOLD_SOFT;
  ctx.strokeStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (kind === 'text') {
    const fontFor = (size) => `700 ${size}px ${SERIF}`;
    const { size } = fitLines(ctx, text, W - 280, fontFor, note ? 92 : 104, 56);
    ctx.font = fontFor(size);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    const y = note ? H / 2 - 14 : H / 2 + 4;
    ctx.fillText(text, W / 2, y);
    const textWidth = ctx.measureText(text).width;
    ctx.shadowBlur = 0;
    if (note) {
      ctx.font = `italic 400 34px ${SERIF}`;
      ctx.fillStyle = 'rgba(243,237,224,0.85)';
      ctx.fillText(note, W / 2, H / 2 + 62);
    }
    // Hai hình thoi hai bên chữ
    ctx.fillStyle = GOLD;
    for (const dir of [-1, 1]) {
      const x = W / 2 + dir * (textWidth / 2 + 60);
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x, y + 14);
      ctx.lineTo(x - 14, y);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'birds' && bird) {
    // Đàn chim Lạc bay nối đuôi nhau, như vành hoa văn trên mặt trống đồng
    const shape = trimTransparent(bird);
    const gold = recolor(shape, GOLD_SOFT);
    const shadow = recolor(shape, 'rgba(0,0,0,0.45)');
    const h = H - 76; // chừa hai đường chỉ vàng trên dưới
    const w = (shape.width / shape.height) * h;
    const count = Math.max(1, Math.floor(W / (w * 1.12)));
    const step = W / count;
    const y = (H - h) / 2;
    for (let i = 0; i < count; i++) {
      const x = i * step + (step - w) / 2;
      ctx.drawImage(shadow, x + 3, y + 3, w, h);
      ctx.drawImage(gold, x, y, w, h);
    }
  } else {
    // Hoa văn: chuỗi hình thoi lồng và chấm tròn, gợi họa tiết sơn mài
    const step = 128;
    ctx.lineWidth = 3;
    for (let x = step / 2; x < W; x += step) {
      const y = H / 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 52);
      ctx.lineTo(x + 52, y);
      ctx.lineTo(x, y + 52);
      ctx.lineTo(x - 52, y);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 30);
      ctx.lineTo(x + 30, y);
      ctx.lineTo(x, y + 30);
      ctx.lineTo(x - 30, y);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + step / 2, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return toTexture(canvas);
}

/** Hai trang sách mở trên bệ giữa sảnh (1024×704 cho cả hai trang). */
export function makeBookTexture(title = 'Lời giới thiệu', seed = 1969, promptText = 'Bấm để đọc') {
  const W = 1024;
  const H = 704;
  const [canvas, ctx] = makeCanvas(W, H);
  const rng = seededRandom(seed);

  const paper = ctx.createLinearGradient(0, 0, W, 0);
  paper.addColorStop(0, '#E6DCC4');
  paper.addColorStop(0.08, '#F3EBD8');
  paper.addColorStop(0.44, '#F1E8D3');
  paper.addColorStop(0.5, '#CBBE9F'); // gáy sách
  paper.addColorStop(0.56, '#F1E8D3');
  paper.addColorStop(0.92, '#F3EBD8');
  paper.addColorStop(1, '#E6DCC4');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  speckle(ctx, W, H, 4000, ['rgba(120,100,70,0.08)', 'rgba(120,100,70,0.05)'], rng, 1.4);

  const left = W / 4;
  const right = (W * 3) / 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7A1712';
  ctx.font = `700 48px ${SERIF}`;
  ctx.fillText(title, left, 230);
  ctx.fillStyle = GOLD;
  ctx.fillRect(left - 70, 282, 140, 3);

  // Dòng chữ giả lập
  ctx.fillStyle = 'rgba(28,27,25,0.32)';
  const lines = (cx, top, count) => {
    for (let i = 0; i < count; i++) {
      const w = 300 - (i === count - 1 ? 120 : rng() * 30);
      ctx.fillRect(cx - 160, top + i * 34, w, 8);
    }
  };
  lines(left, 340, 7);
  lines(right, 110, 15);

  ctx.fillStyle = '#7A1712';
  ctx.font = `italic 400 26px ${SERIF}`;
  ctx.fillText(promptText, right, H - 80);
  return toTexture(canvas);
}

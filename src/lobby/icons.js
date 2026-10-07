import * as THREE from 'three';

const GOLD = '#C9A23F';
const SIZE = 256;

/*
 * Biểu tượng phòng: nét vàng đơn giản kiểu icon tuyến tính trên nền trong suốt.
 * Mỗi hàm vẽ trong hệ tọa độ 0–100 (canvas đã được co giãn sẵn).
 */
const DRAW = {
  // Cuốn sách mở
  book(ctx) {
    ctx.beginPath();
    ctx.moveTo(50, 30);
    ctx.quadraticCurveTo(32, 20, 12, 24);
    ctx.lineTo(12, 74);
    ctx.quadraticCurveTo(32, 70, 50, 80);
    ctx.quadraticCurveTo(68, 70, 88, 74);
    ctx.lineTo(88, 24);
    ctx.quadraticCurveTo(68, 20, 50, 30);
    ctx.lineTo(50, 80);
    ctx.stroke();
    // Dòng chữ trên hai trang
    for (const y of [38, 48, 58]) {
      line(ctx, 20, y, 42, y + 2);
      line(ctx, 58, y + 2, 80, y);
    }
  },

  // Con tàu
  ship(ctx) {
    ctx.beginPath();
    ctx.moveTo(10, 60);
    ctx.lineTo(90, 60);
    ctx.lineTo(78, 76);
    ctx.lineTo(22, 76);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(30, 46, 40, 14);
    ctx.strokeRect(44, 28, 10, 18);
    // Sóng nước
    ctx.beginPath();
    for (let x = 8; x < 92; x += 14) {
      ctx.moveTo(x, 86);
      ctx.quadraticCurveTo(x + 3.5, 82, x + 7, 86);
      ctx.quadraticCurveTo(x + 10.5, 90, x + 14, 86);
    }
    ctx.stroke();
  },

  // Ngôi sao năm cánh
  star(ctx) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 17 : 42;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = 50 + Math.cos(a) * r;
      const y = 54 + Math.sin(a) * r;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  },

  // Lá phiếu bỏ vào hòm phiếu
  ballot(ctx) {
    ctx.strokeRect(18, 50, 64, 36);
    line(ctx, 36, 50, 64, 50, false);
    ctx.lineWidth *= 1.5;
    line(ctx, 38, 50, 62, 50);
    ctx.lineWidth /= 1.5;
    // Lá phiếu nghiêng, nửa đã vào khe
    ctx.save();
    ctx.translate(50, 38);
    ctx.rotate(-0.12);
    ctx.beginPath();
    ctx.moveTo(-14, 12);
    ctx.lineTo(-14, -22);
    ctx.lineTo(14, -22);
    ctx.lineTo(14, 12);
    ctx.stroke();
    // Dấu tích trên phiếu
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(-2, -1);
    ctx.lineTo(8, -14);
    ctx.stroke();
    ctx.restore();
  },

  // Bàn tay
  hand(ctx) {
    ctx.beginPath();
    // Ngón cái
    ctx.moveTo(30, 62);
    ctx.lineTo(18, 50);
    ctx.quadraticCurveTo(12, 42, 20, 40);
    ctx.lineTo(32, 50);
    // Bốn ngón
    const fingers = [
      [34, 20],
      [45, 14],
      [56, 16],
      [67, 24],
    ];
    ctx.lineTo(32, fingers[0][1] + 6);
    for (let i = 0; i < fingers.length; i++) {
      const [x, top] = fingers[i];
      ctx.quadraticCurveTo(x + 4.5, top - 6, x + 9, top + 6);
      if (i < fingers.length - 1) ctx.lineTo(x + 9, 46);
      if (i < fingers.length - 1) ctx.lineTo(fingers[i + 1][0] + 2, fingers[i + 1][1] + 6);
    }
    // Mép bàn tay và cổ tay
    ctx.lineTo(76, 60);
    ctx.quadraticCurveTo(74, 80, 62, 84);
    ctx.lineTo(40, 84);
    ctx.quadraticCurveTo(32, 76, 30, 62);
    ctx.stroke();
    line(ctx, 41, 46, 41, 30);
    line(ctx, 52, 46, 52, 26);
    line(ctx, 63, 46, 63, 32);
  },

  // Cây non
  sprout(ctx) {
    line(ctx, 50, 84, 50, 40);
    // Lá trái
    ctx.beginPath();
    ctx.moveTo(50, 58);
    ctx.quadraticCurveTo(26, 60, 18, 38);
    ctx.quadraticCurveTo(42, 34, 50, 58);
    ctx.stroke();
    // Lá phải
    ctx.beginPath();
    ctx.moveTo(50, 42);
    ctx.quadraticCurveTo(58, 16, 84, 18);
    ctx.quadraticCurveTo(80, 44, 50, 42);
    ctx.stroke();
    // Mặt đất
    ctx.beginPath();
    ctx.moveTo(26, 86);
    ctx.quadraticCurveTo(50, 78, 74, 86);
    ctx.stroke();
  },
};

function line(ctx, x0, y0, x1, y1, stroke = true) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  if (stroke) ctx.stroke();
}

export const ICON_NAMES = Object.keys(DRAW);

/** Texture biểu tượng (nền trong suốt). Tên lạ → null, phòng đó không có biểu tượng. */
export function makeIconTexture(name, anisotropy = 1) {
  const draw = DRAW[name];
  if (!draw) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SIZE / 100, SIZE / 100);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Quầng tối mờ phía sau để nét vàng nổi trên tường đá sáng
  ctx.shadowColor = 'rgba(40, 24, 10, 0.55)';
  ctx.shadowBlur = 3;
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
}

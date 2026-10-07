import data from '../data/rooms.json';
import { markRoomVisited, session } from '../shared/storage.js';
import { reducedMotion } from '../shared/settings.js';
import { mountSettings } from '../shared/settingsUI.js';
import { mountAudioDock } from '../shared/audioDock.js';
import { startMusic } from '../shared/music.js';
import { placeholderArt } from './placeholderArt.js';

mountSettings({ totalRooms: data.rooms.length });

const main = document.getElementById('room-main');
const params = new URLSearchParams(window.location.search);
const roomId = params.get('id');
const rooms = [...data.rooms].sort((a, b) => a.order - b.order);
const room = rooms.find((r) => r.id === roomId);

/*
 * Các khung tranh trên tường. Mỗi tranh một khung; tranh vừa có phim tư liệu vừa có ảnh thì tách
 * thành hai khung đặt cạnh nhau (khung phim trước, khung ảnh sau), mỗi khung mở lightbox với
 * tư liệu của riêng nó.
 */
const entries = (room?.items ?? []).flatMap((item) => {
  if (item.video && item.image) return [{ item, mode: 'video' }, { item, mode: 'photo', paired: true }];
  return [{ item, mode: item.video ? 'video' : 'photo' }];
});

function h(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/** Nhãn mốc trên đường thời gian: giữ khoảng năm, còn lại lấy năm đầu tiên. */
function timelineLabel(time) {
  if (!time) return '';
  if (time.length <= 16) return time; // "1911–1920", "Trước 1911", "Cuối thế kỷ XIX"
  const range = time.match(/\d{4}\s*[–-]\s*\d{4}/);
  if (range) return range[0].replace(/\s/g, '');
  const year = time.match(/\d{4}/);
  return year ? year[0] : time;
}

function setRatio(container, ratio, also = []) {
  container.style.aspectRatio = String(ratio);
  for (const node of [container, ...also]) {
    node.style.setProperty('--ar', String(ratio));
    // Ảnh ngang: lightbox dành nhiều chỗ hơn cho ảnh (xem .lightbox__inner.is-wide)
    node.classList.toggle('is-wide', ratio >= 1.15);
  }
}

/**
 * Khung YouTube cho phim tư liệu (youtube-nocookie.com).
 * muted: phát không tiếng, lặp lại, ẩn điều khiển (trên khung tranh ở tường).
 * Không muted: phát có tiếng, có điều khiển (trong lightbox, sau khi người xem bấm vào tranh).
 */
function youtubeFrame(video, { muted }) {
  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', enablejsapi: '1' });
  if (video.start) params.set('start', String(video.start));
  if (video.end) params.set('end', String(video.end));
  if (muted) {
    // loop cần playlist trỏ về chính video đó
    for (const [k, v] of Object.entries({ mute: '1', controls: '0', loop: '1', playlist: video.youtube, disablekb: '1', fs: '0', iv_load_policy: '3' })) {
      params.set(k, v);
    }
  }
  const frame = document.createElement('iframe');
  frame.className = muted ? 'art-video art-video--preview' : 'art-video';
  frame.src = `https://www.youtube-nocookie.com/embed/${video.youtube}?${params}`;
  frame.title = video.title;
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  if (muted) {
    // Chỉ để xem trước: không nhận bấm, không vào thứ tự Tab (bấm vào tranh sẽ mở lightbox)
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
  }
  return frame;
}

/** Ra lệnh cho trình phát YouTube trong khung (cần enablejsapi=1), ví dụ "pauseVideo". */
function youtubeCommand(frame, func) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
}

/**
 * Ảnh tư liệu nếu có, nếu không thì tranh SVG giữ chỗ sinh từ id.
 * mode "video": khung 16:9 cho phim, ảnh (nếu có) chỉ làm nền chờ trong lúc phim tải.
 */
function renderArt(item, container, also = [], mode = 'photo') {
  container.replaceChildren();
  const isVideo = mode === 'video' && item.video;
  if (isVideo) setRatio(container, 16 / 9, also);
  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = isVideo ? '' : item.imageCaption || item.title;
    img.decoding = 'async';
    img.loading = 'lazy';
    img.addEventListener('load', () => {
      if (!isVideo) setRatio(container, img.naturalWidth / img.naturalHeight, also);
    });
    container.append(img);
  } else if (isVideo) {
    // Phim không có ảnh đi kèm: nền đen trong lúc chờ phim tải
  } else {
    const { svg, width, height } = placeholderArt(item.id);
    setRatio(container, width / height, also);
    container.innerHTML = svg;
  }
}

function renderNotFound() {
  document.title = `Không tìm thấy phòng · ${data.museum.title}`;
  document.getElementById('room-name').textContent = 'Không tìm thấy phòng này';
  document.getElementById('room-intro').textContent =
    'Đường dẫn có thể đã sai hoặc phòng chưa được mở. Mời bạn quay lại sảnh để chọn phòng khác.';
  const box = h('section', 'not-found');
  const link = h('a', 'not-found__link', 'Về sảnh bảo tàng');
  link.href = './index.html';
  const list = h('ul', 'not-found__rooms');
  for (const r of rooms) {
    const li = h('li');
    const a = h('a', null, r.name);
    a.href = `./room.html?id=${encodeURIComponent(r.id)}`;
    li.append(a);
    list.append(li);
  }
  box.append(link, h('p', 'not-found__label', 'Hoặc vào thẳng một phòng:'), list);
  main.append(box);
}

function renderRoom() {
  document.title = `${room.name} · ${data.museum.title}`;
  document.getElementById('room-name').textContent = room.name;
  document.getElementById('room-intro').textContent = room.intro || room.subtitle;

  const wall = h('section', `wall${room.isTimeline ? ' is-timeline' : ''}`);
  wall.setAttribute('aria-label', room.isTimeline ? 'Tường tranh theo dòng thời gian' : 'Tường tranh');
  const track = h('ol', 'wall__track');
  const frames = [];
  const previews = [];

  entries.forEach(({ item, mode, paired }, index) => {
    const isVideo = mode === 'video';
    // Khung ảnh đi cặp với khung phim của cùng tranh: đứng sát khung phim hơn
    const li = h('li', `exhibit${paired ? ' exhibit--paired' : ''}`);
    const frame = h('button', 'frame');
    frame.type = 'button';
    const what = isVideo
      ? `. Phim tư liệu: ${item.video.title}, bấm để xem có tiếng`
      : item.image && item.imageCaption
        ? `. Ảnh: ${item.imageCaption}`
        : '';
    frame.setAttribute('aria-label', `Xem chi tiết: ${item.title}${item.time ? `, ${item.time}` : ''}${what}`);
    frame.setAttribute('aria-haspopup', 'dialog');
    const mat = h('span', 'frame__mat');
    const art = h('span', 'frame__art');
    renderArt(item, art, [], mode);
    mat.append(art);
    frame.append(mat);
    if (isVideo) {
      // Phim tư liệu phát không tiếng ngay trên khung; bấm vào tranh để xem có tiếng
      art.classList.add('has-video');
      frame.append(h('span', 'frame__video', '🔇 Bấm để nghe'));
      previews.push({ art, video: item.video });
    }
    frame.addEventListener('click', () => openLightbox(index));
    frames.push(frame);

    // Biển dưới tranh: mô tả ảnh. Tranh chưa có ảnh thì ghi tên tranh như cũ.
    const plaque = h('div', 'plaque');
    const caption = isVideo ? item.video.title : item.image ? item.imageCaption : null;
    if (caption) {
      plaque.classList.add('plaque--caption');
      plaque.append(h('span', 'plaque__caption', caption));
    } else {
      plaque.append(h('span', 'plaque__title', item.title));
      if (item.time) plaque.append(h('span', 'plaque__time', item.time));
    }

    li.append(frame, plaque);
    // Mốc thời gian: một mốc cho mỗi tranh (khung ảnh đi cặp không lặp lại mốc)
    if (room.isTimeline && !paired) {
      const tick = h('div', 'tick');
      tick.append(h('span', 'tick__dot'), h('span', 'tick__year', timelineLabel(item.time)));
      tick.setAttribute('aria-hidden', 'true');
      li.append(tick);
    }
    track.append(li);
  });

  wall.append(track);
  main.append(wall);
  setupWallScrolling(wall, frames);
  setupPreviews(wall, previews);
  setupLightbox(frames);
  markRoomVisited(room.id);
  // Quay về sảnh thì sảnh hướng thẳng vào cửa phòng này
  session.set('lastRoom', room.id);
  // Nhạc nền phòng: rooms[].music nếu có, không thì museum.roomMusic (dùng chung cho các phòng)
  roomMusic = startMusic(room.music ?? data.museum.roomMusic);
  // Thuyết minh phòng (rooms[].audio): tự phát một lần khi vào phòng, không lặp; nhạc nền nhỏ lại khi đang đọc
  roomAudio = mountAudioDock(room.audio, { autoplay: true, onPlayingChange: (playing) => roomMusic.duck(playing) });
}

// Chiều cao đầu trang, để bức tường chiếm vừa phần còn lại của màn hình
const header = document.querySelector('.room-header');
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--room-header-h', `${header.offsetHeight}px`);
}).observe(header);

let roomAudio = { stop() {} };
let roomMusic = { duck() {}, suspend() {}, stop() {} };

/*
 * Phim tư liệu trên tường: chỉ tạo khung YouTube khi tranh ở gần màn hình, gỡ khi đi xa
 * (đỡ tốn CPU và băng thông). Giảm chuyển động thì không tự phát, chỉ hiện ảnh.
 */
function setupPreviews(wall, previews) {
  if (!previews.length) return;
  const visible = new Set();
  const attach = ({ art, video }) => {
    if (art.querySelector('.art-video') || reducedMotion.matches || document.getElementById('lightbox').open) return;
    art.append(youtubeFrame(video, { muted: true }));
  };
  const detach = ({ art }) => art.querySelector('.art-video')?.remove();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const p = previews.find((x) => x.art === entry.target);
        if (entry.isIntersecting) {
          visible.add(p);
          attach(p);
        } else {
          visible.delete(p);
          detach(p);
        }
      }
    },
    { root: wall, rootMargin: '0px 300px' },
  );
  for (const p of previews) observer.observe(p.art);
  reducedMotion.addEventListener('change', () => {
    for (const p of previews) (reducedMotion.matches ? detach : attach)(p);
  });
  // Lightbox mở thì tắt bản xem trước (tránh hai trình phát cùng lúc), đóng thì bật lại
  const dialog = document.getElementById('lightbox');
  new MutationObserver(() => {
    for (const p of previews) (dialog.open ? detach : visible.has(p) ? attach : () => {})(p);
  }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
}

/* ---------- Cuộn ngang: con lăn, kéo chuột, mũi tên (vuốt là cuộn gốc) ---------- */

function setupWallScrolling(wall, frames) {
  const behavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

  wall.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = wall.scrollWidth - wall.clientWidth;
      if (max <= 0) return;
      const unit = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? wall.clientWidth : 1;
      const delta = event.deltaY * unit;
      const atEdge = (delta < 0 && wall.scrollLeft <= 0) || (delta > 0 && wall.scrollLeft >= max - 1);
      if (atEdge) return;
      event.preventDefault();
      wall.scrollLeft += delta;
    },
    { passive: false },
  );

  // Kéo bằng chuột; cảm ứng dùng cuộn gốc của trình duyệt
  let drag = null;
  wall.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, scroll: wall.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true;
      wall.classList.add('is-dragging');
    }
    if (drag.moved) wall.scrollLeft = drag.scroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    if (drag.moved) {
      // Kéo xong không được tính là bấm vào tranh
      const swallow = (e) => {
        e.stopPropagation();
        e.preventDefault();
      };
      wall.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => wall.removeEventListener('click', swallow, { capture: true }), 0);
    }
    wall.classList.remove('is-dragging');
    drag = null;
  });
  wall.addEventListener('dragstart', (event) => event.preventDefault());

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (document.getElementById('lightbox').open || event.altKey || event.metaKey || event.ctrlKey) return;
    const dir = event.key === 'ArrowRight' ? 1 : -1;
    event.preventDefault();
    const current = frames.indexOf(document.activeElement);
    if (current >= 0) {
      // Đang chọn một tranh: chuyển sang tranh bên cạnh
      const next = frames[Math.min(frames.length - 1, Math.max(0, current + dir))];
      next.focus({ preventScroll: true });
      next.scrollIntoView({ behavior: behavior(), inline: 'center', block: 'nearest' });
    } else {
      const step = frames[0]?.closest('.exhibit').offsetWidth ?? wall.clientWidth * 0.6;
      wall.scrollBy({ left: dir * step, behavior: behavior() });
    }
  });
}

/* ---------- Lightbox ---------- */

let openLightbox = () => {};

function setupLightbox(frames) {
  const dialog = document.getElementById('lightbox');
  const el = {
    art: document.getElementById('lb-art'),
    time: document.getElementById('lb-time'),
    title: document.getElementById('lb-title'),
    desc: document.getElementById('lb-desc'),
    quote: document.getElementById('lb-quote'),
    today: document.getElementById('lb-today'),
    flip: document.getElementById('lb-flip'),
    flipBtn: document.getElementById('lb-flip-btn'),
    front: document.getElementById('lb-art'),
    back: document.getElementById('lb-back'),
    credit: document.getElementById('lb-credit'),
    artifact: document.getElementById('lb-artifact'),
    artifactMeta: document.getElementById('lb-artifact-meta'),
    artifactDesc: document.getElementById('lb-artifact-desc'),
    count: document.getElementById('lb-count'),
    prev: document.getElementById('lb-prev'),
    next: document.getElementById('lb-next'),
    close: document.getElementById('lb-close'),
    inner: dialog.querySelector('.lightbox__inner'),
  };
  let current = 0;

  /*
   * Xem ảnh toàn màn hình: lớp phủ nằm trong dialog (cùng lớp trên cùng), bấm hoặc Esc để đóng.
   */
  const zoom = h('div', 'zoom');
  zoom.hidden = true;
  zoom.setAttribute('role', 'dialog');
  zoom.setAttribute('aria-label', 'Ảnh toàn màn hình');
  const zoomImg = document.createElement('img');
  const zoomClose = h('button', 'zoom__close', '×');
  zoomClose.type = 'button';
  zoomClose.setAttribute('aria-label', 'Đóng ảnh toàn màn hình');
  const zoomCaption = h('p', 'zoom__caption');
  zoom.append(zoomImg, zoomClose, zoomCaption);
  dialog.append(zoom);

  function openZoom(item) {
    zoomImg.src = item.image;
    zoomImg.alt = item.imageCaption || item.title;
    zoomCaption.textContent = item.imageCaption ?? '';
    zoom.hidden = false;
    zoomClose.focus();
  }
  function closeZoom() {
    if (zoom.hidden) return false;
    zoom.hidden = true;
    el.front.querySelector('.is-zoomable')?.focus?.();
    return true;
  }
  zoom.addEventListener('click', closeZoom);
  // Esc đóng ảnh toàn màn hình trước, chưa đóng lightbox
  dialog.addEventListener('cancel', (event) => {
    if (closeZoom()) event.preventDefault();
  });

  function show(index) {
    current = index;
    const { item, mode } = entries[index];
    const isVideo = mode === 'video';
    const art = h('div', 'lightbox__canvas');
    renderArt(item, art, [el.flip, el.inner], mode);
    if (!isVideo && item.image) {
      // Bấm vào ảnh: xem ảnh toàn màn hình
      art.classList.add('is-zoomable');
      art.title = 'Bấm để xem ảnh toàn màn hình';
      art.tabIndex = 0;
      art.setAttribute('role', 'button');
      art.setAttribute('aria-label', 'Xem ảnh toàn màn hình');
      art.addEventListener('click', () => openZoom(item));
      art.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openZoom(item);
        }
      });
    }
    if (isVideo && item.video.youtube) {
      // Người xem vừa bấm vào tranh: phát phim có tiếng ngay trên mặt trước, tạm dừng thuyết minh phòng
      art.classList.add('has-video');
      art.append(youtubeFrame(item.video, { muted: false }));
      roomAudio.stop();
      roomMusic.suspend(true);
    } else {
      roomMusic.suspend(false);
    }
    el.art.replaceChildren(art);
    setFlipped(false);

    el.time.textContent = item.time ?? '';
    el.time.hidden = !item.time;
    el.title.textContent = item.title;
    el.desc.textContent = item.description ?? '';

    // Mặt sau: ý nghĩa hôm nay và trích dẫn của Chủ tịch Hồ Chí Minh
    el.quote.replaceChildren();
    el.quote.hidden = !item.quote;
    if (item.quote) {
      el.quote.append(h('p', null, `“${item.quote}”`));
      if (item.quoteSource) el.quote.append(h('footer', null, `— ${item.quoteSource}`));
      if (item.quoteStatus === 'pending') {
        el.quote.append(h('small', 'quote-pending', 'Trích dẫn đang được đối chiếu nguyên văn với Hồ Chí Minh Toàn tập.'));
      }
    }

    el.today.textContent = item.today ?? 'Nội dung "Ý nghĩa hôm nay" của bức tranh này đang được biên soạn.';
    el.today.classList.toggle('is-placeholder', !item.today);

    // Thông tin tư liệu, như thẻ hiện vật trong bảo tàng: khung phim mô tả phim, khung ảnh mô tả ảnh
    const info = item.artifact ?? {};
    const photoRows = [
      ['Tư liệu', item.image ? item.imageCaption : null],
      ['Loại', info.type],
      ['Thời gian', info.date],
      ['Địa điểm', info.place],
    ];
    if (isVideo) {
      const v = item.video;
      fillCard(el.artifactMeta, el.artifactDesc, el.credit, {
        rows: [
          ['Tư liệu', v.title],
          ['Loại', v.kind],
          ['Thời gian', v.date],
          ['Địa điểm', v.place],
          ['Thời lượng', v.duration],
        ],
        description: v.description,
        credit: v.source && `Nguồn: ${v.source}`,
        url: v.youtube && `https://www.youtube.com/watch?v=${v.youtube}${v.start ? `&t=${v.start}s` : ''}`,
        urlLabel: 'Xem trên YouTube',
      });
      el.artifact.hidden = false;
    } else {
      // Có ảnh: ghi nguồn. Chưa có ảnh: nhắc loại tư liệu dự kiến (imageHint)
      fillCard(el.artifactMeta, el.artifactDesc, el.credit, {
        rows: photoRows,
        description: info.description,
        credit: item.image ? item.imageSource && `Nguồn ảnh: ${item.imageSource}` : item.imageHint && `Ảnh tư liệu dự kiến: ${item.imageHint}`,
        url: item.image ? item.imageSourceUrl : null,
        urlLabel: 'Xem trang nguồn',
      });
      el.artifact.hidden = !photoRows.some(([, v]) => v) && !info.description && !item.image && !item.imageHint;
    }

    el.count.textContent = `${index + 1} / ${entries.length}`;
    el.prev.disabled = index === 0;
    el.next.disabled = index === entries.length - 1;
    dialog.querySelector('.lightbox__text').scrollTop = 0;
  }

  /** Điền một thẻ tư liệu: các dòng (bỏ dòng trống), đoạn mô tả, dòng nguồn kèm link. */
  function fillCard(meta, desc, creditEl, { rows, description, credit, url, urlLabel }) {
    const filled = rows.filter(([, v]) => v);
    meta.replaceChildren(...filled.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)]));
    meta.hidden = !filled.length;
    desc.textContent = description ?? '';
    desc.hidden = !description;
    creditEl.replaceChildren();
    creditEl.hidden = !credit;
    if (!credit) return;
    creditEl.append(credit);
    if (url) {
      const link = h('a', null, urlLabel);
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      creditEl.append(' · ', link);
    }
  }

  /* Lật tranh: chỉ mặt đang hiện có trong cây truy cập */
  function setFlipped(flipped) {
    if (flipped) youtubeCommand(el.front.querySelector('.art-video'), 'pauseVideo');
    el.flip.classList.toggle('is-flipped', flipped);
    el.flipBtn.setAttribute('aria-pressed', String(flipped));
    el.flipBtn.lastChild.textContent = flipped ? ' Xem mặt trước' : ' Lật tranh';
    el.front.inert = flipped;
    el.back.inert = !flipped;
    el.front.setAttribute('aria-hidden', String(flipped));
    el.back.setAttribute('aria-hidden', String(!flipped));
  }
  el.flipBtn.addEventListener('click', () => setFlipped(!el.flip.classList.contains('is-flipped')));

  function step(dir) {
    const next = current + dir;
    if (next < 0 || next >= entries.length) return;
    show(next);
  }

  openLightbox = (index) => {
    show(index);
    if (!dialog.open) dialog.showModal();
    el.close.focus();
  };

  el.prev.addEventListener('click', () => step(-1));
  el.next.addEventListener('click', () => step(1));
  el.close.addEventListener('click', () => dialog.close());

  // Bấm vào vùng tối bên ngoài khung nội dung thì đóng
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (!zoom.hidden) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      step(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  // Trả focus về tranh đang xem (có thể khác tranh đã bấm nếu đã chuyển tranh)
  dialog.addEventListener('close', () => {
    zoom.hidden = true;
    el.front.querySelector('.art-video')?.remove();
    roomMusic.suspend(false);
    const frame = frames[current];
    frame.focus({ preventScroll: true });
    frame.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  });
}

if (room) renderRoom();
else renderNotFound();

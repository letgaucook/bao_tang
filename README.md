# Bảo tàng Tư tưởng Hồ Chí Minh (demo web)

Sản phẩm sáng tạo cho môn Tư tưởng Hồ Chí Minh: sảnh bảo tàng 3D dựng bằng Three.js, sáu cửa dẫn vào sáu phòng tranh bám sáu chương giáo trình.

## Cách chạy

Cần Node.js 18 trở lên.

```bash
npm install
npm run dev        # mở địa chỉ Vite in ra, ví dụ http://localhost:5173
npm run build      # xuất bản tĩnh vào thư mục dist/
npm run preview    # xem thử bản build
```

### Sảnh (`index.html`)

- Kéo chuột/vuốt hoặc phím ← → để nhìn quanh (ngẩng lên được để thấy trần sen), bấm vào cửa để vào phòng.
- Chủ đề sảnh "Hoa sen trên mặt trống đồng" (xem `ADDENDUM-thiet-ke-sanh.md` và mục [Thiết kế sảnh](#thiết-kế-sảnh-hoa-sen-trên-mặt-trống-đồng) bên dưới): trần là bông sen sáu cánh, giữa là giếng trời rọi luồng sáng có bụi lơ lửng xuống tâm mặt trống đồng.
- Sàn sảnh mang hoa văn mặt trống đồng (`src/assets/hoa-van-trong-dong.png`, nét được tô lại màu vàng thếp). Muốn thay hoa văn: thay file ảnh này, giữ nền trắng hoặc trong suốt.
- Băng đỏ phía trên các cửa: hai mặt tường có khẩu hiệu (tên bảo tàng, "Không có gì quý hơn độc lập, tự do"), bốn mặt còn lại là đàn chim Lạc bay nối đuôi (`public/images/chimlac.png`, nền trong suốt; hình được tô lại màu vàng thếp).
- Nút "Danh sách phòng" liệt kê các phòng (dùng được bằng bàn phím và trình đọc màn hình; nếu máy không có WebGL thì danh sách này hiện sẵn). Mỗi phòng có ô tích bên phải cho biết đã tham quan hay chưa; cuối danh sách là số phòng đã tham quan và nút "Tham quan lại từ đầu".
- Mỗi phòng đã vào thắp sáng **cánh sen nằm ngay trên cửa phòng đó** (sáng dần trong khoảng 1 giây khi quay lại sảnh); cửa có đèn rọi sáng hơn và biển tên viền vàng. Đủ 6 phòng: **sen nở** (các cánh mở thêm về phía tường trong 2 giây, giếng trời sáng mạnh hơn), rồi nút "Lời kết" xuất hiện. "Tham quan lại từ đầu" tắt hết cánh sen.
- Cửa nằm giữa tầm nhìn được đèn rọi sáng thêm (theo hướng camera, nên trên điện thoại không có hover vẫn biết đang nhìn cửa nào). Trên biển tên mỗi cửa có biểu tượng phòng nét vàng (`icon` trong `rooms.json`, hình vẽ trong `src/lobby/icons.js`).
- Mở màn: tối → giếng trời sáng lên cùng luồng sáng và bụi (0–1 s) → đèn rọi sáu cửa sáng lần lượt (1–2,5 s) → băng chữ hiện ra, sảnh bắt đầu tự xoay nhẹ (2,5–3 s). Chạm/kéo/nhấn phím là bỏ qua, về ngay trạng thái cuối.
- Từ một phòng quay về sảnh (nút "Về sảnh", nút Back hay mở lại sảnh trong cùng tab): sảnh hướng thẳng vào **cửa phòng vừa xem**, ở chính giữa màn hình, và không tự xoay. Phòng vừa xem được lưu ở sessionStorage khóa `lastRoom`.
- Vào sảnh là nhạc nền tự phát (lặp lại, mặc định 30%). Bật/tắt và âm lượng chỉnh trong Cài đặt. Xem mục [Âm thanh](#âm-thanh-sảnh-và-các-phòng).
- Bật "giảm chuyển động" (`prefers-reduced-motion`): không mở màn, bụi đứng yên, không tự xoay, sen nở chỉ đổi độ sáng.
- Hai bục sách ở phía trước lúc mới vào: bên trái là "Lời giới thiệu", bên phải là "Nguồn tư liệu" (tài liệu tham khảo, nguồn ảnh của từng tranh, hoa văn trang trí; nguồn ảnh tự tổng hợp từ `rooms.json`). Danh sách phòng cũng có nút "Nguồn tư liệu".

### Âm thanh sảnh và các phòng

Có hai loại âm thanh:

- **Nhạc nền** (sảnh và mọi phòng):
  - Tự phát khi vào trang, **phát lặp lại**, âm lượng mặc định 30%.
  - **Chỉ chỉnh trong Cài đặt**, mục "Nhạc nền" (bật/tắt, âm lượng). Trên trang không có nút nhạc nền.
  - Trình duyệt thường chặn tự phát có tiếng khi người xem chưa tương tác với trang. Khi đó nhạc bắt đầu ngay ở lần bấm, chạm hoặc nhấn phím đầu tiên.
  - Nhạc tự nhỏ lại khi đang nghe thuyết minh, và tạm dừng khi xem phim tư liệu có tiếng.
  - Mã: `src/shared/music.js`.
- **Thuyết minh phòng:**
  - **Tự phát một lần khi vào phòng, không lặp lại.** Nếu trình duyệt chặn tự phát, thuyết minh bắt đầu ở lần bấm, chạm hoặc nhấn phím đầu tiên. Người xem đã tự tạm dừng thì không tự phát lại.
  - Dải nút ở bên phải thanh đầu trang (phát/tạm dừng, tắt tiếng, âm lượng). Mở khung phim có tiếng thì thuyết minh dừng.
  - Âm lượng thuyết minh nằm ở mục "Thuyết minh và hiệu ứng" trong Cài đặt, dùng chung với hiệu ứng âm thanh của trò chơi.
  - Mã: `src/shared/audioDock.js`.

**Thêm audio: chỉ cần đặt file đúng tên vào `public/audio/`**, không phải sửa code:

| Âm thanh | File | Khai báo trong `rooms.json` |
|---|---|---|
| Nhạc nền sảnh | `public/audio/sanh.mp3` | `museum.music` |
| Nhạc nền các phòng (dùng chung) | `public/audio/nhac-nen-phong.mp3` | `museum.roomMusic`; phòng nào muốn nhạc riêng thì thêm `"music": { "src": "…" }` vào phòng đó |
| Thuyết minh Phòng Khởi nguyên | `public/audio/phong/khoi-nguyen.mp3` | `rooms[].audio` |
| Thuyết minh Phòng Hành trình | `public/audio/phong/hanh-trinh.mp3` | |
| Thuyết minh Phòng Độc lập dân tộc và CNXH | `public/audio/phong/doc-lap-cnxh.mp3` | |
| Thuyết minh Phòng Đảng và Nhà nước | `public/audio/phong/dang-nha-nuoc.mp3` | |
| Thuyết minh Phòng Đại đoàn kết | `public/audio/phong/dai-doan-ket.mp3` | |
| Thuyết minh Phòng Văn hóa, Đạo đức, Con người | `public/audio/phong/van-hoa-dao-duc.mp3` | |

Chưa có file thì nhạc nền không phát, còn dải thuyết minh mờ nút phát và hiện "Chưa có âm thanh". Có file thì trang tự nhận, không cần build lại khi chạy `npm run dev` (bản deploy thì build lại như thường). Đối tượng `audio` của thuyết minh:

```json
"audio": { "src": "audio/phong/hanh-trinh.mp3", "title": "Thuyết minh: Phòng Hành trình", "loop": false, "volume": 1 }
```

- `src`: đường dẫn tính từ thư mục `public/`; dùng được mọi định dạng trình duyệt hỗ trợ (`.mp3`, `.m4a`, `.ogg`, `.wav`). Để `null` nếu phòng không có thuyết minh.
- `title`: chữ hiện cạnh nút phát.
- `volume`: mức nền 0–1, nhân với âm lượng trong Cài đặt.

Lời thuyết minh để thu âm nằm trong thư mục `thuyet-minh/`, mỗi phòng một file (`1-khoi-nguyen.md` … `6-van-hoa-dao-duc.md`). Đầu mỗi file ghi tên file mp3 cần lưu.

Chỉ dùng file có quyền sử dụng. Mã: `src/shared/audioDock.js`, `src/styles/audio.css`.

### Cài đặt (mọi trang)

Nút **Cài đặt** (bánh răng) có ở thanh đầu trang của sảnh, phòng và trò chơi thử thách; mở hộp thoại gồm:

- **Nhạc nền**: bật/tắt và âm lượng (mặc định bật, 30%) cho nhạc nền tự phát ở sảnh và các phòng.
- **Thuyết minh và hiệu ứng**: bật/tắt và âm lượng cho thuyết minh trong các phòng và hiệu ứng âm thanh trong trò chơi. Nút "Âm thanh" trên thanh điều hướng của trò chơi dùng chung cài đặt này.
- **Chuyển động**: Theo máy / Giảm / Đầy đủ. Lựa chọn trong trang thắng cài đặt `prefers-reduced-motion` của hệ điều hành, áp dụng cho mở màn sảnh, bụi, tự xoay, cuộn mượt và mọi hiệu ứng CSS.
- **Cỡ chữ**: Vừa / Lớn / Rất lớn (100% / 112,5% / 125%; toàn bộ CSS dùng `rem` nên mọi chữ HTML đều to theo).
- **Chất lượng đồ họa (sảnh 3D)**: Cao / Tiết kiệm (vẽ ở 1× điểm ảnh, tắt bụi lơ lửng), và bật/tắt sảnh tự xoay.
- **Tiến độ tham quan**: số phòng đã tham quan và nút xóa tiến độ (bấm hai lần để xác nhận).

Cài đặt lưu ở localStorage khóa `settings`, đổi ở tab này thì tab khác cập nhật theo. Mã: `src/shared/settings.js` (dữ liệu, `reducedMotion` thay cho `matchMedia`), `src/shared/settingsUI.js` (nút và hộp thoại), `src/styles/settings.css`. Trang mới muốn có nút thì gọi `mountSettings()` và đánh dấu chỗ đặt nút bằng thuộc tính `data-settings-slot` (không có thì nút nổi ở góc dưới bên phải).

### Phòng (`room.html?id=<id-phòng>`)

Tường tranh cuộn ngang (con lăn, kéo, vuốt, phím ← →). Bấm tranh để xem chi tiết; trong lightbox, nút "Lật tranh" cho xem mặt sau ("Ý nghĩa hôm nay").

### Deploy lên Vercel

Framework Preset **Vite**, Build Command `npm run build`, Output Directory `dist`. Không cần biến môi trường.

## Thêm hoặc sửa nội dung

Toàn bộ nội dung nằm trong `src/data/rooms.json`, không cần sửa code.

### `rooms.json`

Nội dung hiện tại lấy từ tài liệu *Nội dung các phòng – Bảo tàng Tư tưởng Hồ Chí Minh* (bám 6 chương giáo trình; hiện còn 41 tranh, đã bỏ 7 tranh infographic tự vẽ để mọi tranh đều là ảnh tư liệu). Sửa nội dung thì sửa thẳng trong `rooms.json`.

Gốc tệp:

- `museum`: tên bảo tàng, câu trên băng chữ và nguồn, `audio` (âm thanh sảnh).
- `museumIntro`: lời giới thiệu trong cuốn sách ở sảnh.
- `ending`: Lời kết, gồm `quote`, `quoteSource`, `quoteStatus` (câu trích Di chúc, hiển thị cỡ lớn), `text` (lời kết của nhóm, mảng các đoạn văn), `imageHint`, `image`.
- `sourcesNote`: ghi chú nơi tìm ảnh tư liệu.
- `credits`: nội dung bục "Nguồn tư liệu": `team` (tên thành viên nhóm; để trống thì không hiện mục "Thực hiện"), `teamNote`, `references` (tài liệu tham khảo: `title`, `detail`, `url`), `imageNote`, `artwork` (hoa văn, thiết kế dùng trong bảo tàng).
- `rooms`: các phòng. Mỗi phòng có `chapter` ("Chương 1"…), hiện ở dòng phụ trên biển tên cửa và trong danh sách phòng; `icon` là biểu tượng trên cửa (`book`, `ship`, `star`, `ballot`, `hand`, `sprout`); `audio` là âm thanh của phòng (xem mục Âm thanh).

**Phim tư liệu** cho một tranh: chỉ dùng thước phim tư liệu gốc (quay đúng lúc sự kiện). Tranh không có phim thì giữ ảnh. Thêm trường `video` vào tranh đó:

```json
"video": {
  "youtube": "xRKUB3fUTJM",
  "start": 0,
  "end": null,
  "title": "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, 2/9/1945",
  "kind": "Phim tư liệu gốc",
  "source": "Thước phim tư liệu ngày 2/9/1945; bản phát của VTV24, Đài Truyền hình Việt Nam",
  "duration": "8:23"
}
```

- **Trên tường:** phim phát ngay trong khung tranh riêng (tỉ lệ 16:9), không tiếng, lặp lại. Góc khung có nhãn "🔇 Bấm để nghe".
- **Tranh có cả phim và ảnh:** tách thành **hai khung tranh đặt cạnh nhau**, khung phim trước, khung ảnh sau. Mỗi khung có biển ghi riêng, bấm vào mở lightbox với tư liệu của riêng khung đó: khung phim hiện thông tin phim, khung ảnh hiện thông tin và nguồn ảnh. Hai khung dùng chung tên, mô tả và mặt sau (ý nghĩa, trích dẫn) của tranh. Trên dòng thời gian chỉ có một mốc cho cả cặp.
- **Bấm vào tranh:** lightbox phát phim có tiếng ở mặt trước, thuyết minh phòng tự dừng.
- Lật tranh thì phim tạm dừng; đổi tranh hoặc đóng lightbox thì phim dừng hẳn.
- Phim trên tường chỉ được tải khi tranh ở gần màn hình. Bật "giảm chuyển động" thì không tự phát.
- Phim được nhúng qua `youtube-nocookie.com` và tự hiện trong mục "Nguồn tư liệu".
- `start` và `end` tính bằng giây, dùng để chỉ chiếu một trích đoạn.
- Chỉ nhúng từ kênh chính thức của đơn vị giữ bản quyền. Danh sách đề xuất nằm ở `VIDEO-TU-LIEU.md`.

**Thêm tranh** vào một phòng: thêm một phần tử vào mảng `items` của phòng đó:

```json
{
  "id": "p3-quyen-thieng-lieng",
  "title": "Tuyên ngôn Độc lập",
  "time": "2/9/1945",
  "description": "Đoạn thuyết minh 2–3 câu.",
  "quote": null,
  "quoteSource": null,
  "quoteStatus": "pending",
  "today": "Ý nghĩa hôm nay (mặt sau của tranh).",
  "image": null,
  "imageSource": null,
  "imageHint": "Ảnh Quảng trường Ba Đình, 2/9/1945"
}
```

- `quoteStatus: "pending"`: trích dẫn chưa đối chiếu nguyên văn. Lightbox hiện thêm dòng nhỏ "Trích dẫn đang được đối chiếu nguyên văn với Hồ Chí Minh Toàn tập". Đối chiếu xong thì bổ sung số tập, số trang vào `quoteSource` và **xóa** dòng `quoteStatus`.
- `imageCaption`: mô tả ngắn của ảnh (ví dụ "Bản Hiến pháp năm 1946"), hiện trên biển nhỏ dưới tranh ở tường. Tên tranh, thuyết minh, trích dẫn và "Ý nghĩa hôm nay" chỉ hiện khi bấm vào tranh. Tranh chưa có ảnh thì biển ghi tên tranh.
- `artifact`: khối "Thông tin tư liệu" hiện trong lightbox dưới phần thuyết minh, như thẻ hiện vật trong bảo tàng: `type` (loại tư liệu), `date`, `place`, `description` (mô tả chi tiết ảnh). Trường nào chưa biết thì để `null`.
- Mặt sau tranh (nút "Lật tranh") hiện `today` (ý nghĩa hôm nay) và trích dẫn `quote` / `quoteSource`.
- `imageHint`: loại ảnh tư liệu cần tìm (cột "Ảnh gợi ý" trong tài liệu). Khi `image` còn `null`, lightbox hiện "Ảnh tư liệu dự kiến: …"; khi đã có ảnh thì hiện `imageSource` thay vào.

- `id` phải là duy nhất; nó cũng quyết định hình vẽ giữ chỗ khi chưa có ảnh.
- Tranh hiển thị theo đúng thứ tự trong mảng. Với phòng có `"isTimeline": true`, nhãn trên đường thời gian lấy từ `time` (ví dụ "1911–1920", "Trước 1911"); tranh không có `time` thì chỉ có chấm mốc, không có nhãn.
- Trường nào chưa có thì để `null`: `quote` là `null` thì lightbox hiện khung giữ chỗ cho trích dẫn; `today` là `null` thì mặt sau của tranh ghi "đang được biên soạn".

**Thêm phòng**: thêm một phần tử vào mảng `rooms` với `id`, `order`, `name`, `chapter`, `subtitle`, `intro`, `isTimeline`, `items`. Sảnh 3D hiện đúng 6 cửa (lấy 6 phòng có `order` nhỏ nhất).

**Trích dẫn**: chỉ điền `quote` khi đã đối chiếu với *Hồ Chí Minh Toàn tập*, và luôn ghi `quoteSource` kèm số tập, số trang. Không tự đặt ra câu trích dẫn.

## Thay tranh giữ chỗ bằng ảnh tư liệu thật

Ảnh tư liệu hiện có đã nằm trong `public/images/` (tên file theo id tranh). Danh sách ảnh đang dùng, nguồn, ảnh dự phòng và các tranh còn thiếu ảnh: `tu-lieu-anh/BAO-CAO-TAI-ANH.md`. Ảnh dự phòng ở `tu-lieu-anh/du-phong/` (không đưa vào bản build). Trong `rooms.json`, `imageSourceUrl` là link trang gốc của ảnh, hiện trong lightbox thành "Xem trang nguồn".

Mọi tranh hiện để `"image": null`; trường `imageHint` ghi loại ảnh cần tìm. Nơi tìm: Bảo tàng Hồ Chí Minh, Khu di tích Phủ Chủ tịch, Trung tâm Lưu trữ quốc gia, Thông tấn xã Việt Nam, trang điện tử của Đảng. Không dùng ảnh phục chế màu hoặc ảnh do AI tạo cho tranh tư liệu lịch sử.

1. Chép ảnh vào `public/images/` (tạo thư mục nếu chưa có). Nên đặt tên file theo `id` của tranh, ví dụ `public/images/p2-thoi-ky-truoc-1911.jpg`. Nên dùng ảnh JPG/WebP rộng khoảng 1200–1600px.
2. Trong `rooms.json`, sửa `image` của tranh đó thành đường dẫn tương đối: `"image": "images/p2-thoi-ky-truoc-1911.jpg"`.
3. **Ghi rõ nguồn ảnh** trong trường `imageSource`, ví dụ `"imageSource": "Bảo tàng Hồ Chí Minh"` hoặc tên sách/trang web kèm đường dẫn. Lightbox sẽ hiện dòng "Nguồn ảnh: …". Chỉ dùng ảnh được phép sử dụng và luôn ghi nguồn.

Khung tranh tự co theo tỉ lệ ảnh thật.

## Dữ liệu lưu trên trình duyệt

| Khóa | Nơi lưu | Ý nghĩa |
|---|---|---|
| `visitedRooms` | localStorage | Các phòng đã vào (cánh sen, đèn cửa, Lời kết) |
| `settings` | localStorage | Cài đặt: nhạc nền, âm thanh thuyết minh và hiệu ứng, chuyển động, cỡ chữ, chất lượng đồ họa, tự xoay |
| `endingCelebrated` | localStorage | Đã xem hiệu ứng sen nở (lần sau vào sảnh sen nở sẵn) |

Mọi thao tác đọc/ghi đều bọc `try/catch`: trình duyệt chặn lưu trữ thì trang vẫn chạy, chỉ không nhớ tiến độ.

## Cấu trúc

```
index.html, room.html      hai trang (Vite multi-page, khai báo trong vite.config.js)
src/lobby/                 sảnh 3D: main.js (renderer, camera, điều khiển, tiến độ),
                           buildHall.js (tường, cửa, ánh sáng, bệ sách), lotus.js (trần sen, giếng trời,
                           luồng sáng, bụi), icons.js (biểu tượng phòng), textures.js (CanvasTexture),
                           interaction.js (raycast hover/bấm cửa và cuốn sách)
src/room/                  main.js (tường tranh, lightbox, lật tranh), placeholderArt.js
src/shared/                storage.js, fonts.js
src/data/                  rooms.json
src/styles/                base.css, room.css
```

Câu "Không có gì quý hơn độc lập, tự do" trên băng chữ của sảnh trích từ Lời kêu gọi đồng bào và chiến sĩ cả nước của Chủ tịch Hồ Chí Minh, ngày 17/7/1966.

## Thiết kế sảnh "Hoa sen trên mặt trống đồng"

Theo `ADDENDUM-thiet-ke-sanh.md`. Mọi thứ dựng bằng code Three.js, không ảnh panorama, không model.

**Cánh sen: phương án đã chọn.** Không dùng mảnh `SphereGeometry` cũng không dùng `ShapeGeometry` trực tiếp, mà tự dựng một lưới chữ nhật (40 × 16 ô, `u` dọc thân cánh, `v` ngang cánh) rồi tính vị trí từng đỉnh trong code (`src/lobby/lotus.js`). Đây là biến thể của phương án thay thế "Shape cánh sen rồi uốn cong các đỉnh". Lý do:

- `ShapeGeometry` chỉ có đỉnh ở đường viền, phần giữa cánh là vài tam giác lớn, nên không uốn cong mượt được.
- Mảnh `SphereGeometry` co giãn không đều thì khó vừa khít với vòm lục giác và cửa bên dưới: gốc cánh phải bám mép trên tường, đầu cánh phải dừng trước giếng trời.
- Lưới tự dựng cho phép đặt mỗi đỉnh ngay dưới một vòm chung (dốc ở sát tường, thoải dần về tâm). Bề ngang cánh theo hàm thon (gốc hẹp, phình ở khoảng 40% thân, đầu nhọn), hai mép rủ xuống (cánh khum), khe hở với vòm rộng dần về đầu cánh để lúc sen nở cánh không xuyên qua vòm.

Cánh dùng `side: DoubleSide` để nhìn từ dưới lên thấy đúng mặt trong. Màu (trắng ngà ở gốc, ửng hồng ở đầu cánh, gân mảnh, viền vàng thếp hai mép) vẽ bằng canvas 256×256. Mỗi cánh có vật liệu và `emissive` riêng.

**Giếng trời và luồng sáng.** Đĩa phát sáng `#FFF3D6` ở đỉnh vòm, `SpotLight` góc hẹp, mép mềm rọi xuống tâm sàn, thêm một đèn điểm yếu để ánh sàn hắt lên mặt dưới cánh sen. Luồng sáng là ống `CylinderGeometry` mở hai đầu (loe ra ở chân, thay cho `ConeGeometry` nhọn đỉnh vì giếng trời có bề rộng), `AdditiveBlending`, `depthWrite: false`. Texture gradient dọc làm luồng sáng đậm ở trần và tan dần trước khi xuống tới tầm mắt, nên không thấy mép cứng. Người xem đứng ngay trong luồng sáng, nên ống chỉ vẽ mặt trong (`BackSide`). Bụi là `Points` (300 hạt; điện thoại hoặc màn hình hẹp 150 hạt) trôi lên xuống rất chậm, cập nhật vị trí trong buffer có sẵn mỗi frame, không tạo lại geometry.

**Khác với addendum:**

- Bệ ở tâm: camera đứng đúng tâm sảnh nên bệ đặt ở tâm sẽ nằm dưới chân, không nhìn thấy. Vì vậy vẫn giữ ba bục sách hiện có (Lời giới thiệu, Chơi thử thách, Nguồn tư liệu) đặt trước mặt người xem lúc vào. Luồng sáng rọi xuống tâm mặt trống đồng, nơi có ngôi sao giữa mặt trống, và ánh đèn lan tới mép ba bục sách.
- Băng chữ: giữ cách bố trí đã thống nhất trước đó (tên bảo tàng, câu "Không có gì quý hơn độc lập, tự do" và dải chim Lạc của trống đồng), chỉ chuyển lên sát đỉnh tường, ngay dưới gốc cánh sen. Không làm băng chữ trôi.
- Góc ngẩng của camera nới lên khoảng 54° để thấy được bông sen và giếng trời.

**Hiệu năng.** Số liệu đo bằng Edge headless dùng SwiftShader, tức là kết xuất bằng CPU, không có GPU, nên chỉ để tham khảo, thấp hơn nhiều so với máy thật: khoảng 5 FPS ở 1366×768 và 3,6 FPS ở khung Pixel 5. Số draw call mỗi frame khoảng 80 (mục tiêu dưới 100). Cần đo lại bằng tab Performance của DevTools trên laptop và trên giả lập điện thoại tầm trung, rồi ghi vào đây:

| Thiết bị | FPS |
|---|---|
| Laptop (Chrome/Edge, GPU thật) | _chưa đo_ |
| Giả lập điện thoại tầm trung (DevTools, CPU throttling 4×) | _chưa đo_ |

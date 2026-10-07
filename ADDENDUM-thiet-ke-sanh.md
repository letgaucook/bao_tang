# Addendum: Thiết kế sảnh "Hoa sen trên mặt trống đồng"

> Tài liệu bổ sung cho `SPEC-bao-tang-tu-tuong-hcm-demo.md` và `ADDENDUM-tuong-tac-bao-tang-hcm.md`. Tài liệu này **thay thế** mục 5.1 và 5.2 (hình học, ánh sáng sảnh) của spec gốc, và **thay thế phần "vòng đèn trên trần"** ở mục 1 của addendum tương tác. Sàn trống đồng hiện có giữ nguyên. Mọi phần khác (camera, điều khiển, phân biệt kéo/bấm, lớp HTML phủ, fallback WebGL, reduced motion, hiệu năng) giữ nguyên.

Vẫn **chỉ dùng Three.js và code**: không ảnh panorama, không file model, không Blender. Trước khi dùng API Three.js nào chưa chắc chắn (đặc biệt `SphereGeometry` với tham số `phiStart`/`thetaStart`, `Points`, `AdditiveBlending`, `CanvasTexture.anisotropy`), **đọc tài liệu chính thức threejs.org/docs** đúng phiên bản đã cài.

## 1. Ý tưởng

Người xem đứng giữa sảnh như đứng trên **mặt trống đồng Đông Sơn**, ngẩng lên thấy **một bông sen sáu cánh** ôm lấy trần, giữa bông sen là **giếng trời** rọi một luồng sáng xuống cuốn sách mở ở tâm. Bảo tàng Hồ Chí Minh tại Hà Nội có kiến trúc lấy cảm hứng từ hoa sen; trống đồng là biểu tượng văn hóa Việt. Hai hình tượng này là chủ đề duy nhất của sảnh: không thêm họa tiết trang trí khác.

## 2. Bố cục tổng thể

- Lăng trụ lục giác như cũ: bán kính khoảng 8, cao khoảng 6, mỗi tường một cửa.
- Từ trên xuống: giếng trời → 6 cánh sen → băng chữ → biểu tượng + biển tên → cửa → chân tường gỗ → sàn trống đồng.
- Cánh sen thứ *i* nằm **đúng phía trên cửa thứ *i***.

## 3. Sàn: giữ nguyên

Sàn hoa văn trống đồng **đã có sẵn trong project**. Không vẽ lại, không thay texture, không đổi vật liệu hay kích thước của sàn. Các phần khác trong tài liệu này đặt lên trên sàn hiện có (bệ trung tâm đặt ở tâm sàn).

## 4. Trần: bông sen sáu cánh

### 4.1 Hình học cánh sen

- Mỗi cánh là một **mảnh vỏ cầu** (`SphereGeometry` giới hạn bằng `phiStart/phiLength/thetaStart/thetaLength`) rồi co giãn không đều để thon dài, đầu cánh hơi nhọn. Nếu cách này không cho dáng đẹp, được phép dùng phương án thay thế: `Shape` hình cánh sen → `ShapeGeometry` với đủ phân đoạn, rồi uốn cong các đỉnh trong code. **Ghi lại phương án đã chọn và lý do trong README.**
- Gốc cánh bám vào mép trên của tường, ngay trên cửa tương ứng; thân cánh cong vào phía tâm trần; đầu cánh dừng trước mép giếng trời, để lộ khoảng trống tròn ở giữa.
- Cánh được nhìn từ dưới lên: dùng `side: THREE.DoubleSide` hoặc kiểm tra pháp tuyến để mặt trong cánh hiển thị đúng.
- Màu cánh: trắng ngà hơi hồng ở đầu cánh (gradient vẽ bằng canvas nhỏ 256×256 hoặc vertex color), viền vàng thếp mảnh dọc mép cánh.

### 4.2 Cánh sen thay cho vòng đèn trần

Đây là phần **thay thế vòng đèn trên trần** trong addendum tương tác:

- Mỗi cánh có `emissive` riêng. Phòng *i* chưa tham quan: emissive gần 0. Đã tham quan: emissive tăng lên (khoảng 0.5), chuyển mượt trong khoảng 1 giây khi người xem quay lại sảnh.
- Đủ 6 phòng: **"sen nở"**. Cả 6 cánh mở ra thêm vài độ về phía tường (xoay quanh gốc cánh) trong khoảng 2 giây, giếng trời sáng mạnh hơn, rồi nút "Lời kết" xuất hiện. Với `prefers-reduced-motion`: không xoay cánh, chỉ đổi độ sáng ngay lập tức.
- Đọc trạng thái từ `visitedRooms` trong `localStorage` như addendum tương tác đã quy định. Khi chạy "Tham quan lại từ đầu", tất cả cánh trở về trạng thái tắt.

## 5. Giếng trời, luồng sáng, bụi

- **Giếng trời**: `RingGeometry` hoặc `CircleGeometry` ở tâm trần, vật liệu phát sáng màu trắng ấm `#FFF3D6`.
- **Đèn**: một `SpotLight` đặt ở giếng trời rọi thẳng xuống bệ trung tâm, góc hẹp, `penumbra` mềm.
- **Luồng sáng thấy được**: `ConeGeometry` mở đáy (`openEnded: true`) kéo từ giếng trời xuống sàn, `MeshBasicMaterial` trong suốt, opacity rất thấp (khoảng 0.06–0.1), `blending: THREE.AdditiveBlending`, `depthWrite: false`. Nếu thấy rõ mép hình nón cứng, làm mờ dần theo chiều cao bằng texture gradient dọc.
- **Bụi lơ lửng**: `Points` khoảng 300 hạt (điện thoại: 150) phân bố trong hình trụ của luồng sáng, trôi lên xuống rất chậm, kích thước nhỏ, màu vàng nhạt, `AdditiveBlending`. Cập nhật vị trí bằng cách cộng dịch chuyển nhỏ mỗi frame, không tạo lại geometry.
- `prefers-reduced-motion`: bụi đứng yên.

## 6. Bệ trung tâm và cuốn sách mở

Giữ cuốn sách mở ở tâm như addendum tương tác, đặt trên bệ thấp ở tâm sàn, nằm trong luồng sáng của giếng trời. Bệ đủ thấp để không che tầm nhìn tới các cửa đối diện khi camera ở độ cao mắt 1.6.

## 7. Tường, cửa, biểu tượng phòng

- **Tường**: đá sáng `#D8D4CC`. **Chân tường** cao khoảng 0.9, ốp gỗ tối `#4A3426`, có một gờ vàng mảnh phân cách.
- **Cửa**: giữ như spec gốc (khung vàng thếp, cánh đỏ sơn mài `#7A1712`).
- **Biểu tượng phòng**: mặt phẳng nhỏ phía trên biển tên, vẽ bằng `CanvasTexture`, nét vàng `#C9A23F` trên nền trong suốt, nét đơn giản kiểu icon tuyến tính:

| Phòng | id | Biểu tượng |
|---|---|---|
| Khởi nguyên | `khoi-nguyen` | cuốn sách mở |
| Hành trình | `hanh-trinh` | con tàu |
| Độc lập dân tộc và CNXH | `doc-lap-cnxh` | ngôi sao năm cánh |
| Đảng và Nhà nước | `dang-nha-nuoc` | lá phiếu bỏ vào hòm phiếu |
| Đại đoàn kết | `dai-doan-ket` | bàn tay |
| Văn hóa, Đạo đức, Con người | `van-hoa-dao-duc` | cây non |

  Thêm trường `icon` vào từng phòng trong `rooms.json` (giá trị: `book`, `ship`, `star`, `ballot`, `hand`, `sprout`); file `src/lobby/icons.js` chứa một hàm vẽ cho mỗi giá trị.

- **Băng chữ**: "Không có gì quý hơn độc lập, tự do" chạy vòng trên đỉnh tường, ngay dưới gốc các cánh sen, chữ Noto Serif vàng thếp. Được phép trôi rất chậm theo vòng tròn; tắt chuyển động khi reduced motion.

## 8. Ánh sáng tổng thể

- Tông ấm, **tối ở rìa, sáng dần về tâm**. Không chiếu sáng đều cả phòng.
- `HemisphereLight` yếu làm nền; 6 `SpotLight` rọi xuống 6 cửa; 1 `SpotLight` ở giếng trời. **Tắt shadow** cho tất cả (không cần bóng đổ trong demo).
- Gợi ý: bật `renderer.toneMapping = THREE.ACESFilmicToneMapping` và chỉnh exposure để phần sáng không bị cháy; kiểm tra lại tên hằng số và cách đặt color space theo tài liệu của phiên bản three đã cài.

## 9. Đèn cửa theo hướng nhìn

Mỗi frame, tính vector hướng nhìn của camera; cửa có hướng gần nhất (tích vô hướng lớn nhất, vượt một ngưỡng) được tăng nhẹ cường độ `SpotLight` của nó, chuyển mượt. Mục đích: người dùng điện thoại không có hover vẫn biết mình đang "nhìn vào" cửa nào. Hiệu ứng này độc lập với hover/click của spec gốc.

## 10. Trình tự mở màn

Khi scene và font đã sẵn sàng:

1. Màn hình tối (0s).
2. Giếng trời sáng lên, luồng sáng và bụi xuất hiện (0–1s).
3. Đèn rọi 6 cửa sáng lần lượt theo vòng (1–2.5s).
4. Băng chữ hiện ra, auto-rotate nhẹ bắt đầu (2.5–3s).

Người xem kéo/chạm bất kỳ lúc nào: bỏ qua trình tự, chuyển ngay về trạng thái cuối. `prefers-reduced-motion`: bắt đầu thẳng ở trạng thái cuối.

## 11. Âm thanh nền (tùy chọn)

- Nếu có file `public/audio/ambient.mp3` (do tác giả tự cung cấp, có quyền sử dụng): hiện nút loa ở góc, **mặc định tắt**, bấm mới phát, phát lặp với âm lượng thấp. Không có file thì ẩn hẳn nút.
- Gọi `play()` luôn bắt lỗi (trình duyệt có thể từ chối với `NotAllowedError`).
- Khi rời sảnh thì dừng; không phát cùng lúc với thuyết minh phòng.

## 12. Những điều không làm

- **Không dựng tượng, phù điêu hay hình người mô phỏng Chủ tịch Hồ Chí Minh bằng code.** Không tạo chân dung bằng AI.
- Không thêm họa tiết trang trí ngoài hai chủ đề sen và trống đồng.
- Không dùng ảnh hay texture tải từ internet.

## 13. Hiệu năng

- Tổng draw call mục tiêu dưới khoảng 100; gộp geometry tĩnh khi hợp lý.
- Điện thoại (`matchMedia('(pointer: coarse)')` hoặc màn hình hẹp): giảm số hạt bụi.
- Đo bằng tab Performance của DevTools; ghi lại FPS đo được trên laptop và trên giả lập điện thoại tầm trung vào README.

## 14. Tiêu chí nghiệm thu

Kiểm tra trên trình duyệt thật, ghi lại kết quả quan sát được. Lỗi nào cũng phải mô tả được cách tái hiện trước khi sửa.

- [ ] Toàn bộ checklist của spec gốc và addendum tương tác vẫn đạt (không hồi quy).
- [ ] Sàn trống đồng hiện có không bị thay đổi.
- [ ] Ngẩng lên thấy 6 cánh sen, mỗi cánh nằm đúng trên cửa tương ứng, mặt trong cánh hiển thị đúng (không bị mất mặt, không đen).
- [ ] Giếng trời có luồng sáng thấy được và bụi trôi chậm; không thấy mép hình nón cứng.
- [ ] Đi 1 phòng rồi quay lại sảnh: đúng cánh sen của phòng đó sáng lên. Đi đủ 6 phòng: sen nở, nút "Lời kết" xuất hiện. "Tham quan lại" tắt hết cánh.
- [ ] 6 biểu tượng phòng hiển thị đúng phòng, đọc được từ tâm sảnh.
- [ ] Xoay camera: cửa ở giữa tầm nhìn sáng hơn các cửa khác, chuyển mượt.
- [ ] Trình tự mở màn chạy đúng thứ tự; chạm/kéo giữa chừng thì nhảy ngay về trạng thái cuối.
- [ ] Bật `prefers-reduced-motion`: không mở màn, không bụi trôi, không băng chữ trôi, sen nở chỉ đổi độ sáng.
- [ ] Không có file ambient: không hiện nút loa. Có file: mặc định tắt, bấm mới phát.
- [ ] Không có lỗi hay cảnh báo trong console; FPS đo được đã ghi vào README.

# product.md: Website Tìm kiếm quán ăn

## 1. Tổng quan
- Tên dự án: Tìm kiếm quán ăn. Tên hiển thị trên logo trong wireframe là "APPPKL" (nhóm cần xác nhận tên cuối cùng).
- Chủ đề: tìm quán ăn phù hợp nhu cầu, xem đánh giá, tìm đường đến quán, và quay vòng quay chọn món "Hôm nay ăn gì".
- Người dùng mục tiêu: CHƯA CÓ, nhóm cần bổ sung.
- Mục tiêu website: giúp người dùng tìm quán ăn phù hợp với nhu cầu và túi tiền, xem đánh giá chi tiết của người đi trước và tìm đường đến quán.

## 2. Công nghệ và quy ước
- Công nghệ (cố định, không được đổi): HTML, CSS, JavaScript thuần. KHÔNG dùng framework. Dữ liệu lưu bằng localStorage. Không có máy chủ.
- Cấu trúc thư mục đề xuất:

        /
        ├── index.html                 (Trang chủ)
        ├── pages/
        │   ├── result.html            (Trang 1: Kết quả vòng quay)
        │   ├── restaurants.html       (Trang 2: Danh sách quán, tìm kiếm, bộ lọc)
        │   ├── restaurant-detail.html (Trang 3: Chi tiết quán)
        │   └── account.html           (Trang 4: Tài khoản và địa chỉ)
        ├── css/
        │   ├── style.css              (kiểu chung)
        │   └── (mỗi trang một file css riêng nếu cần)
        ├── js/
        │   ├── nav.js                 (thanh điều hướng chung)
        │   ├── storage.js             (đọc/ghi localStorage)
        │   └── (mỗi tính năng một file js riêng)
        ├── data/
        │   └── restaurants.js         (dữ liệu quán mẫu)
        ├── assets/images/
        └── docs/wireframes/           (ảnh wireframe của nhóm)

- Tên file, tên biến, tên hàm, class CSS: viết bằng tiếng Anh. Nội dung hiển thị cho người dùng: tiếng Việt.
- Tên các file trang ở trên là tạm thời, nhóm chốt khi xác nhận sitemap.

## 3. Phong cách giao diện
- Cảm giác chung: trẻ trung, ấm áp, dễ sử dụng.
- Màu chủ đạo: đỏ, trắng, vàng. Mã HEX: CHƯA CÓ, nhóm cần bổ sung. Chưa có mã HEX thì hỏi nhóm trước khi tô màu.
- Font chữ: Noto Sans (tiêu đề và nội dung).
- Website tham khảo: https://www.foody.vn/ (lý do của nhóm: giao diện rất dễ sử dụng và nhiều tiện ích hay).
- Wireframe chỉ là bố cục. Không tự thêm hiệu ứng, ảnh hay màu ngoài phong cách trên.

## 4. Sitemap và từng trang
Sitemap: Trang chủ → Trang 1 (Kết quả vòng quay) | Trang 2 (Danh sách quán) | Trang 3 (Chi tiết quán) | Trang 4 (Tài khoản). Tối đa 5 trang.
Tên Trang 2, 3, 4 do phiếu để trống. Bố cục của 3 trang này lấy từ ảnh wireframe nhóm gửi kèm. Nhóm cần xác nhận.

### Thanh điều hướng chung (mọi trang)
- Đặt ở đầu trang, giống nhau trên mọi trang, luôn có đường về Trang chủ.
- Logo "APPPKL" bên trái, các mục menu bên phải hoặc dưới logo.
- Danh sách mục menu: CHƯA CÓ, nhóm cần bổ sung. Khối "Khám phá" ở Trang chủ có 5 mục: Giao hàng, Gần nhất, Quán ăn, Đánh giá, Khuyến mãi.
- Chân trang: CHƯA CÓ.

### Trang chủ (index.html)
- Mục đích: hiển thị những quán ăn ngon, có đánh giá tốt; cho người dùng tìm kiếm quán; đi tới vòng quay.
- Thành phần: logo, dòng giới thiệu, thanh tìm kiếm quán ăn, khối "Khám phá", khối "Hôm nay ăn gì" (vòng quay), danh sách quán ăn ngon/đánh giá tốt kèm đánh giá.
- Bố cục từ trên xuống:
  1. Thanh điều hướng chung.
  2. Tên "APPPKL" cỡ chữ lớn, căn giữa.
  3. Dòng chữ "Món ngon hôm nay ......" bên dưới, căn trái (nội dung sau dấu chấm: CHƯA CÓ).
  4. Hai khối bo góc nền xám nằm cạnh nhau. Khối trái: tiêu đề "Khám phá" và danh sách 5 mục (Giao hàng, Gần nhất, Quán ăn, Đánh giá, Khuyến mãi). Khối phải: tiêu đề "Hôm nay ăn gì" và hình vòng quay có mũi tên đỏ chỉ ở trên cùng.
  5. Thanh tìm kiếm quán ăn: có trong phiếu nhưng wireframe chưa vẽ, vị trí CHƯA CÓ.
  6. Danh sách quán ăn ngon/đánh giá tốt: có trong phiếu nhưng wireframe chưa vẽ, vị trí CHƯA CÓ.

### Trang 1: Kết quả vòng quay (result.html)
- Mục đích: sau khi quay vòng quay, AI cho biết các quán ăn phù hợp với món vừa quay được.
- Thành phần: vòng quay, tiêu đề kết quả, khung AI gợi ý, danh sách quán gợi ý, 5 ngôi sao.
- Bố cục (theo wireframe, chia hai cột):
  1. Thanh điều hướng chung.
  2. Cột trái: vòng quay lớn, mũi tên đỏ chỉ ở trên cùng.
  3. Cột phải, trên cùng: tiêu đề đậm "Kết quả món ăn hôm nay là".
  4. Cột phải, giữa: khung bo góc nền xám xanh có dòng "AI gợi ý các quán ăn ngon, gần đây", biểu tượng ghim vị trí, hai bong bóng chat và hình robot.
  5. Cột phải, dưới khung: hàng 5 ngôi sao (đánh giá quán).
- Các nhãn trên vòng quay: CHƯA CÓ, nhóm cần bổ sung.

### Trang 2: Danh sách quán, tìm kiếm và bộ lọc (restaurants.html)
- Mục đích: tìm và lọc quán ăn theo nhu cầu và túi tiền.
- Thành phần (theo ảnh wireframe): thanh tìm kiếm có biểu tượng kính lúp và nút bộ lọc; ô chọn "Danh mục"; ô chọn "Khoảng giá"; nút khoảng giá (< 50k, 50k - 100k, > 100k); nút loại hình (Tất cả, Món Việt, Đồ nướng, Trà sữa); danh sách thẻ quán.
- Bố cục từ trên xuống:
  1. Thanh điều hướng chung.
  2. Thanh tìm kiếm ("Tìm quán, món ăn...") và nút bộ lọc bên phải.
  3. Hàng 2 ô chọn: Danh mục, Khoảng giá.
  4. Hàng nút khoảng giá.
  5. Hàng nút loại hình, nút "Tất cả" được chọn mặc định.
  6. Danh sách thẻ quán xếp dọc: ảnh bên trái; bên phải là tên quán, số sao (số đánh giá), khoảng giá, nhãn loại hình.
- Lọc theo "khu vực": có trong phiếu nhưng ảnh chưa vẽ, vị trí CHƯA CÓ.

### Trang 3: Chi tiết quán (restaurant-detail.html)
- Mục đích: cung cấp đủ thông tin để người dùng quyết định đến quán.
- Thành phần: nút quay lại, ảnh quán, tên quán, số sao, số đánh giá, khoảng giá, 3 tab (Thực đơn, Đánh giá, Thông tin), danh sách món, khu đánh giá/bình luận, địa chỉ, giờ mở cửa, số điện thoại, nút chỉ đường.
- Bố cục từ trên xuống:
  1. Thanh điều hướng chung (có nút quay lại).
  2. Ảnh lớn của quán.
  3. Tên quán, số sao (số đánh giá), khoảng giá.
  4. Hàng 3 tab: Thực đơn | Đánh giá | Thông tin. Tab "Thực đơn" mở mặc định.
  5. Tab Thực đơn: danh sách món (ảnh nhỏ bên trái, tên món và giá bên phải).
  6. Tab Đánh giá: danh sách bình luận và form viết đánh giá. Vị trí form: CHƯA CÓ.
  7. Tab Thông tin: địa chỉ, giờ mở cửa, số điện thoại, khoảng giá, nút "Chỉ đường".
- Ảnh wireframe có dòng "30 phút", "Giao hàng" và nút dấu cộng cạnh mỗi món. Phiếu không có tính năng đặt hàng nên KHÔNG làm các thành phần này, chờ nhóm xác nhận.

### Trang 4: Tài khoản và địa chỉ (account.html)
- Mục đích: lưu thông tin người dùng, sổ địa chỉ, xem lại lịch sử đơn hàng.
- Thành phần: khối thông tin người dùng (ảnh đại diện, tên, email), menu 3 mục (Thông tin cá nhân, Sổ địa chỉ, Lịch sử đơn hàng), danh sách địa chỉ, nút thêm địa chỉ (dấu +).
- Bố cục từ trên xuống:
  1. Thanh điều hướng chung.
  2. Khối thông tin: ảnh đại diện, tên, email.
  3. Danh sách 3 mục, mỗi mục có mũi tên bên phải.
  4. Màn Sổ địa chỉ: tiêu đề "Sổ địa chỉ", nút "+" góc phải; danh sách địa chỉ (Nhà, Cơ quan, Khác), mỗi dòng có nút tròn chọn địa chỉ mặc định.
- Ảnh có thanh menu dưới cùng (Trang chủ, Khám phá, Đơn hàng, Tài khoản) khác với thanh điều hướng chung. Dùng thanh điều hướng chung, chờ nhóm xác nhận.

## 5. Tính năng
Cột "Nằm ở trang" của phiếu để trống. Trang ghi bên dưới suy ra từ wireframe và ảnh, nhóm cần xác nhận.

### Must-have
1. Tìm kiếm và bộ lọc đa tiêu chí
   - Trang: Trang 2 (thanh tìm kiếm cũng có ở Trang chủ).
   - Người dùng: gõ tên món/tên quán; chọn khu vực, khoảng giá, loại hình quán.
   - Hệ thống: danh sách quán đổi theo từ khóa và bộ lọc đã chọn; không có kết quả thì hiện thông báo "Không tìm thấy quán phù hợp".
   - Xong khi: gõ từ khóa hoặc chọn bộ lọc thì danh sách đổi đúng; chọn nhiều bộ lọc cùng lúc cho kết quả đúng; bỏ lọc thì quay về danh sách đầy đủ.
2. Trang thông tin chi tiết quán ăn
   - Trang: Trang 3.
   - Người dùng: bấm vào một quán ở danh sách.
   - Hệ thống: mở trang chi tiết đúng quán đã bấm, hiện địa chỉ, giờ mở cửa, thực đơn, khoảng giá, số điện thoại.
   - Xong khi: mỗi quán trong danh sách mở được trang chi tiết với đủ 5 thông tin trên và đúng dữ liệu của quán đó.
3. Hệ thống đánh giá và bình luận (rating, review kèm hình ảnh)
   - Trang: Trang 3 (tab Đánh giá).
   - Người dùng: chọn số sao, viết bình luận, đính kèm hình ảnh, bấm gửi.
   - Hệ thống: lưu vào localStorage, hiện bình luận mới trong danh sách, cập nhật số sao trung bình và số đánh giá của quán.
   - Xong khi: gửi đánh giá xong thì hiện ngay; tải lại trang vẫn còn; không chọn sao hoặc để trống bình luận thì báo lỗi, không lưu.
4. Quản lý tài khoản và địa chỉ
   - Trang: Trang 4.
   - Người dùng: nhập/sửa thông tin cá nhân; thêm, sửa, xóa, chọn địa chỉ mặc định; xem lịch sử đơn hàng.
   - Hệ thống: lưu vào localStorage và hiển thị lại khi mở trang.
   - Xong khi: thêm địa chỉ xong thì hiện trong sổ địa chỉ, tải lại trang vẫn còn, chọn mặc định thì chỉ một địa chỉ được chọn.
   - Lưu ý: "lịch sử đơn hàng" chưa rõ, nhóm cần giải thích (phiếu không có chức năng đặt hàng). Chưa làm phần này cho đến khi nhóm xác nhận.

### Nice-to-have
5. Vòng quay ngẫu nhiên "Hôm nay ăn gì?"
   - Trang: Trang chủ (khối "Hôm nay ăn gì") và Trang 1.
   - Người dùng: bấm quay vòng quay (có thể chọn bộ lọc trước khi quay).
   - Hệ thống: vòng quay xoay rồi dừng ở một ô ngẫu nhiên, chuyển sang/hiện kết quả ở Trang 1.
   - Xong khi: mỗi lần quay cho kết quả ngẫu nhiên thuộc các ô trên vòng; có thể quay lại; kết quả hiện đúng ô mũi tên chỉ vào.
6. Trợ lý AI gợi ý món ăn
   - Trang: Trang 1 (khung AI gợi ý).
   - Người dùng: nhập yêu cầu bằng văn bản về tâm trạng, thời tiết hoặc ngân sách trong ngày; hoặc chọn tâm trạng/thời tiết (theo ảnh minh họa).
   - Hệ thống: hiện danh sách quán gợi ý phù hợp (ví dụ trời mưa gợi ý món nóng) kèm khoảng giá và khoảng cách.
   - Xong khi: nhập 3 yêu cầu khác nhau thì ra 3 gợi ý phù hợp từ dữ liệu quán có sẵn; không hiểu yêu cầu thì báo lại thay vì đoán.
   - Công nghệ chỉ có JS thuần và localStorage: không gọi API AI thật. Đơn giản hóa bằng quy tắc trong JS trên dữ liệu quán mẫu (ví dụ trời mưa thì gợi ý món nước, ngân sách thì lọc theo khoảng giá). Thông tin thời tiết do người dùng tự chọn.
7. Tích hợp bản đồ chỉ đường
   - Trang: Trang 3 (tab Thông tin, nút "Chỉ đường").
   - Người dùng: bấm "Chỉ đường".
   - Hệ thống: mở bản đồ/đường đi đến địa chỉ quán.
   - Xong khi: bấm nút thì mở đúng địa chỉ quán trên bản đồ.
   - Phiếu ghi Google Maps API (cần khóa API, vượt công nghệ khối 10). Đơn giản hóa: nút mở liên kết Google Maps theo địa chỉ quán, không cần khóa. Nhóm xác nhận trước khi làm.

## 6. Luồng người dùng chính
Việc chính: tìm quán ăn phù hợp nhu cầu, xem đánh giá chi tiết từ người trước và tìm đường đến quán.
1. Trang chủ: tìm kiếm quán ăn, xem các quán ngon và có đánh giá tốt.
2. Trang 1: quay vòng quay xem được ăn món nào; AI gợi ý các quán phù hợp với món đó.
3. Bước 3: CHƯA CÓ, nhóm cần bổ sung (gợi ý theo việc chính: mở trang chi tiết quán, xem đánh giá).
4. Bước 4: CHƯA CÓ, nhóm cần bổ sung (gợi ý theo việc chính: tìm đường đến quán).
5. Bước 5: CHƯA CÓ, nhóm cần bổ sung.

## 7. Thứ tự xây dựng
- Bước 1: dựng khung. Làm Trang chủ và thanh điều hướng chung dùng cho mọi trang (menu, logo, màu, font theo mục 3).
- Bước 2: Must-have, mỗi lần một tính năng, theo thứ tự:
  1. Tìm kiếm và bộ lọc (kèm dữ liệu quán mẫu).
  2. Trang chi tiết quán.
  3. Đánh giá và bình luận.
  4. Quản lý tài khoản và địa chỉ.
- Bước 3: Nice-to-have, mỗi lần một tính năng: vòng quay, trợ lý AI gợi ý, bản đồ chỉ đường.
- Xong một tính năng, dừng lại để nhóm kiểm tra rồi mới làm tiếp.

## 8. Quy tắc làm việc cho AI lập trình
- Mỗi lần chỉ làm một việc nhóm yêu cầu. Không tự thêm tính năng ngoài danh sách ở mục 5.
- Không tự đổi công nghệ, phong cách giao diện hoặc cấu trúc thư mục đã chốt.
- Giải thích ngắn gọn bằng tiếng Việt những gì đã làm, để học sinh hiểu và giải thích lại được.
- Không viết khóa API hoặc mật khẩu vào mã nguồn; dùng biến môi trường. Nếu cần khóa, dừng lại và hỏi nhóm.
- Thiếu thông tin (mọi chỗ ghi "CHƯA CÓ") thì hỏi lại, không tự đoán.

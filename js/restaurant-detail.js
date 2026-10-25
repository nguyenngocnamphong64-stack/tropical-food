/**
 * restaurant-detail.js — Logic cho Trang 3: Chi tiết quán
 * Must-have #2: Thông tin chi tiết quán (địa chỉ, giờ, menu, giá, SĐT)
 * Must-have #3: Đánh giá & bình luận (rating, review, ảnh, lưu localStorage)
 * Nice-to-have #7: Bản đồ – nút mở Google Maps theo địa chỉ
 */

document.addEventListener('DOMContentLoaded', function () {

  // ---- 1. Xác định quán từ URL ?id=... ----
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get('id'), 10);
  var restaurant = (typeof RESTAURANTS !== 'undefined')
    ? RESTAURANTS.find(function (r) { return r.id === id; })
    : null;

  if (!restaurant) {
    document.getElementById('detail-main').innerHTML =
      '<p class="empty-msg">Không tìm thấy quán. <a href="restaurants.html">Quay lại danh sách</a></p>';
    return;
  }

  // ---- 2. Ghi vào lịch sử xem (localStorage) ----
  var history = Storage.get(Storage.KEYS.HISTORY, []);
  // Xoá nếu đã có, rồi thêm vào đầu
  history = history.filter(function (h) { return h !== id; });
  history.unshift(id);
  if (history.length > 20) history = history.slice(0, 20);
  Storage.set(Storage.KEYS.HISTORY, history);

  // ---- 3. Điền thông tin cơ bản ----
  document.title = restaurant.name + ' – TROPICAL FOOD';

  document.getElementById('detail-img').src = restaurant.image;
  document.getElementById('detail-img').alt = 'Ảnh quán ' + restaurant.name;
  document.getElementById('detail-name').textContent = restaurant.name;

  var starsEl = document.getElementById('detail-stars');
  starsEl.textContent = renderStars(restaurant.rating);
  starsEl.setAttribute('aria-label', restaurant.rating + ' sao');

  document.getElementById('detail-review-count').textContent =
    '(' + getTotalReviewCount(restaurant) + ' đánh giá)';
  document.getElementById('detail-price').textContent = restaurant.priceLabel;
  document.getElementById('detail-category').textContent = restaurant.category;
  document.getElementById('detail-area').textContent = restaurant.area;

  // Tab Thông tin
  document.getElementById('info-address').textContent = restaurant.address;
  document.getElementById('info-hours').textContent   = restaurant.hours;
  document.getElementById('info-phone').textContent   = restaurant.phone;
  document.getElementById('info-price').textContent   = restaurant.priceLabel;
  document.getElementById('map-btn').href             = restaurant.mapUrl;

  // ---- 4. Thực đơn ----
  var menuList = document.getElementById('menu-list');
  restaurant.menu.forEach(function (item) {
    var div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <img class="menu-item__img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="menu-item__info">
        <div class="menu-item__name">${item.name}</div>
        <div class="menu-item__price">${item.price}</div>
      </div>
    `;
    menuList.appendChild(div);
  });

  // ---- 5. Tab switching ----
  var tabBtns   = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('aria-controls');

      tabBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(function (p) { p.classList.remove('active'); });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(target).classList.add('active');
    });
  });

  // ---- 6. Đánh giá & bình luận ----
  renderReviews();

  var submitBtn  = document.getElementById('submit-review-btn');
  var reviewText = document.getElementById('review-text');
  var reviewImg  = document.getElementById('review-img-input');
  var errorEl    = document.getElementById('review-error');

  submitBtn.addEventListener('click', function () {
    // Lấy số sao đã chọn
    var ratingInput = document.querySelector('input[name="rating"]:checked');
    var ratingVal   = ratingInput ? parseInt(ratingInput.value, 10) : 0;
    var text        = reviewText.value.trim();

    // Kiểm tra hợp lệ
    if (!ratingVal) {
      errorEl.textContent = '⚠️ Vui lòng chọn số sao trước khi gửi!';
      return;
    }
    if (!text) {
      errorEl.textContent = '⚠️ Vui lòng nhập nhận xét!';
      return;
    }
    errorEl.textContent = '';

    // Đọc ảnh (nếu có) — chuyển thành base64
    var file = reviewImg.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        saveReview(ratingVal, text, e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      saveReview(ratingVal, text, null);
    }
  });

  function saveReview(ratingVal, text, imgData) {
    var user = Storage.get(Storage.KEYS.USER, {});
    var review = {
      restaurantId: restaurant.id,
      author:       user.name || 'Người dùng ẩn danh',
      rating:       ratingVal,
      text:         text,
      image:        imgData,
      date:         new Date().toLocaleDateString('vi-VN'),
    };

    var all = Storage.get(Storage.KEYS.REVIEWS, []);
    all.unshift(review);  // mới nhất lên đầu
    Storage.set(Storage.KEYS.REVIEWS, all);

    // Reset form
    document.querySelectorAll('input[name="rating"]').forEach(function (r) {
      r.checked = false;
    });
    document.getElementById('review-text').value = '';
    document.getElementById('review-img-input').value = '';

    // Cập nhật lại danh sách và số sao trung bình
    renderReviews();
    updateAverageRating();
  }

  function renderReviews() {
    var list = document.getElementById('review-list');
    var all  = Storage.get(Storage.KEYS.REVIEWS, []);
    var mine = all.filter(function (rv) { return rv.restaurantId === restaurant.id; });

    list.innerHTML = '';
    if (mine.length === 0) {
      list.innerHTML = '<p class="empty-msg">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>';
      return;
    }
    mine.forEach(function (rv) {
      var div = document.createElement('div');
      div.className = 'review-item';
      div.innerHTML = `
        <div class="review-item__header">
          <span class="review-item__author">${escHtml(rv.author)}</span>
          <span class="review-item__date">${rv.date}</span>
          <span class="stars" aria-label="${rv.rating} sao">${'★'.repeat(rv.rating)}${'☆'.repeat(5 - rv.rating)}</span>
        </div>
        <p class="review-item__text">${escHtml(rv.text)}</p>
        ${rv.image ? `<img class="review-item__img" src="${rv.image}" alt="Ảnh đánh giá" />` : ''}
      `;
      list.appendChild(div);
    });
  }

  function updateAverageRating() {
    var all  = Storage.get(Storage.KEYS.REVIEWS, []);
    var mine = all.filter(function (rv) { return rv.restaurantId === restaurant.id; });
    if (mine.length === 0) return;

    var avg = mine.reduce(function (sum, rv) { return sum + rv.rating; }, 0) / mine.length;
    avg = Math.round(avg * 10) / 10;

    var starsEl = document.getElementById('detail-stars');
    starsEl.textContent = renderStars(avg);
    starsEl.setAttribute('aria-label', avg + ' sao');
    document.getElementById('detail-review-count').textContent =
      '(' + getTotalReviewCount(restaurant) + ' đánh giá)';
  }

  function getTotalReviewCount(r) {
    var stored = Storage.get(Storage.KEYS.REVIEWS, [])
      .filter(function (rv) { return rv.restaurantId === r.id; }).length;
    return r.reviewCount + stored;
  }

  // ---- 7. Nút quay lại ----
  document.getElementById('back-btn').addEventListener('click', function () {
    if (document.referrer) {
      history.back();
    } else {
      window.location.href = 'restaurants.html';
    }
  });

  // ---- Tiện ích ----
  function renderStars(rating) {
    var full  = Math.floor(rating);
    var half  = rating - full >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});

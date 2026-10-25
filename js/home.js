/**
 * home.js — Logic cho Trang chủ (index.html)
 * 1. Xử lý nút chọn ngân sách (toggle, bỏ chọn)
 * 2. Khởi tạo vòng quay nhỏ — khi quay xong lưu kết quả + ngân sách rồi chuyển trang
 * 3. Hiển thị danh sách top quán ăn (sắp theo rating giảm dần)
 */

document.addEventListener('DOMContentLoaded', function () {

  // ---- 1. Nút chọn ngân sách ----
  // selectedBudget: null (chưa chọn) hoặc số nguyên (200 / 500 / 1000)
  var selectedBudget = null;
  var budgetBtns = document.querySelectorAll('.budget-btn');

  budgetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = parseInt(btn.getAttribute('data-budget'), 10);

      if (selectedBudget === val) {
        // Bấm lại → bỏ chọn
        selectedBudget = null;
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('active');
      } else {
        // Chọn mới → bỏ chọn nút cũ, bật nút này
        budgetBtns.forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('active');
        });
        selectedBudget = val;
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('active');
      }
    });
  });

  // ---- 2. Vòng quay trên trang chủ ----
  initWheel('wheel-canvas', 'spin-btn', function (result) {
    // Lưu kết quả món và ngân sách (nếu có) vào sessionStorage
    sessionStorage.setItem('wheel_result', result);
    if (selectedBudget !== null) {
      sessionStorage.setItem('wheel_budget', String(selectedBudget));
    } else {
      sessionStorage.removeItem('wheel_budget');
    }
    window.location.href = 'pages/result.html';
  });

  // ---- 3. Danh sách top quán (sắp theo rating) ----
  var container = document.getElementById('top-restaurant-list');
  if (!container || typeof RESTAURANTS === 'undefined') return;

  // Lấy 6 quán điểm cao nhất
  var top = RESTAURANTS.slice()
    .sort(function (a, b) { return b.rating - a.rating; })
    .slice(0, 6);

  top.forEach(function (r) {
    container.appendChild(createRestaurantCard(r, '../'));
  });
});

/**
 * Tạo phần tử thẻ quán ăn.
 * @param {Object} r      - object quán từ RESTAURANTS
 * @param {string} prefix - tiền tố đường dẫn ('' hoặc '../')
 * @returns {HTMLElement}
 */
function createRestaurantCard(r, prefix) {
  prefix = prefix || '';
  var a = document.createElement('a');
  a.className = 'restaurant-card';
  a.href = prefix + 'pages/restaurant-detail.html?id=' + r.id;
  a.setAttribute('aria-label', r.name);

  var stars = renderStars(r.rating);

  a.innerHTML = `
    <img
      class="restaurant-card__img"
      src="${r.image}"
      alt="Ảnh quán ${r.name}"
      loading="lazy"
    />
    <div class="restaurant-card__info">
      <div class="restaurant-card__name">${r.name}</div>
      <div class="restaurant-card__meta">
        <span class="stars" aria-label="Đánh giá ${r.rating} sao">${stars}</span>
        <span>(${r.reviewCount} đánh giá)</span>
      </div>
      <div class="restaurant-card__meta">
        <span class="restaurant-card__price">${r.priceLabel}</span>
        <span class="restaurant-card__tag">${r.category}</span>
        <span class="restaurant-card__tag">${r.area}</span>
      </div>
    </div>
  `;
  return a;
}

/**
 * Trả về chuỗi sao ★ dựa trên số điểm (0–5).
 * @param {number} rating
 * @returns {string}
 */
function renderStars(rating) {
  var full  = Math.floor(rating);
  var half  = rating - full >= 0.5 ? 1 : 0;
  var empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

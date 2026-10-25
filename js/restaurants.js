/**
 * restaurants.js — Logic cho Trang 2: Danh sách quán & bộ lọc
 * Tính năng Must-have #1: Tìm kiếm và bộ lọc đa tiêu chí
 */

document.addEventListener('DOMContentLoaded', function () {
  // ---- Đọc từ khoá từ URL (khi từ trang chủ bấm tìm) ----
  var urlParams = new URLSearchParams(window.location.search);
  var initQuery = (urlParams.get('q') || '').trim();

  // ---- Trạng thái bộ lọc hiện tại ----
  var state = {
    query:    initQuery,
    area:     '',
    category: '',   // từ select Danh mục
    price:    '',   // từ nút khoảng giá
    catBtn:   '',   // từ nút loại hình (có thể trùng category)
  };

  // ---- Lấy phần tử DOM ----
  var searchInput     = document.getElementById('search-input');
  var searchForm      = document.getElementById('search-form');
  var filterToggleBtn = document.getElementById('filter-toggle-btn');
  var filterPanel     = document.getElementById('filter-panel');
  var filterArea      = document.getElementById('filter-area');
  var filterCategory  = document.getElementById('filter-category');
  var clearFilterBtn  = document.getElementById('clear-filter-btn');
  var resultCount     = document.getElementById('result-count');
  var restaurantList  = document.getElementById('restaurant-list');
  var emptyMsg        = document.getElementById('empty-msg');

  // ---- Điền từ khoá từ URL vào ô tìm kiếm ----
  if (initQuery) searchInput.value = initQuery;

  // ---- Mở/đóng panel bộ lọc ----
  filterToggleBtn.addEventListener('click', function () {
    var isOpen = filterPanel.classList.toggle('open');
    filterToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    filterToggleBtn.classList.toggle('active', isOpen);
  });

  // ---- Tìm kiếm (submit form) ----
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    state.query = searchInput.value.trim();
    render();
  });

  // Tìm ngay khi gõ (debounce 300ms)
  var debounceTimer;
  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      state.query = searchInput.value.trim();
      render();
    }, 300);
  });

  // ---- Select Khu vực ----
  filterArea.addEventListener('change', function () {
    state.area = filterArea.value;
    render();
  });

  // ---- Select Danh mục ----
  filterCategory.addEventListener('change', function () {
    state.category = filterCategory.value;
    render();
  });

  // ---- Nút khoảng giá ----
  document.querySelectorAll('[data-price]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-price]').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      state.price = btn.getAttribute('data-price');
      render();
    });
  });

  // ---- Nút loại hình ----
  document.querySelectorAll('[data-cat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-cat]').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      state.catBtn = btn.getAttribute('data-cat');
      render();
    });
  });

  // ---- Xoá bộ lọc ----
  clearFilterBtn.addEventListener('click', function () {
    state.query    = '';
    state.area     = '';
    state.category = '';
    state.price    = '';
    state.catBtn   = '';

    searchInput.value = '';
    filterArea.value  = '';
    filterCategory.value = '';

    document.querySelectorAll('[data-price]').forEach(function (b) {
      b.classList.remove('active');
    });
    document.querySelector('[data-price=""]').classList.add('active');

    document.querySelectorAll('[data-cat]').forEach(function (b) {
      b.classList.remove('active');
    });
    document.querySelector('[data-cat=""]').classList.add('active');

    render();
  });

  // ---- Hàm lọc & hiển thị ----
  function render() {
    var results = RESTAURANTS.filter(function (r) {
      // Tìm theo tên quán hoặc tên món
      var qLower = state.query.toLowerCase();
      var matchQuery = !state.query ||
        r.name.toLowerCase().includes(qLower) ||
        r.category.toLowerCase().includes(qLower) ||
        r.menu.some(function (m) { return m.name.toLowerCase().includes(qLower); });

      // Lọc khu vực
      var matchArea = !state.area || r.area === state.area;

      // Lọc danh mục (select) — hợp với nút loại hình
      var effectiveCat = state.catBtn || state.category;
      var matchCat = !effectiveCat || r.category === effectiveCat;

      // Lọc khoảng giá
      var matchPrice = !state.price || r.priceRange === state.price;

      return matchQuery && matchArea && matchCat && matchPrice;
    });

    // Cập nhật đếm kết quả
    resultCount.innerHTML = 'Tìm thấy <strong>' + results.length + '</strong> quán';

    // Render thẻ quán
    restaurantList.innerHTML = '';
    if (results.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      results.forEach(function (r) {
        restaurantList.appendChild(createCard(r));
      });
    }
  }

  function createCard(r) {
    var a = document.createElement('a');
    a.className = 'restaurant-card';
    a.href = 'restaurant-detail.html?id=' + r.id;
    a.setAttribute('role', 'listitem');
    a.setAttribute('aria-label', r.name);

    var stars = renderStars(r.rating);
    a.innerHTML = `
      <img class="restaurant-card__img" src="${r.image}" alt="Ảnh quán ${r.name}" loading="lazy" />
      <div class="restaurant-card__info">
        <div class="restaurant-card__name">${r.name}</div>
        <div class="restaurant-card__meta">
          <span class="stars" aria-label="${r.rating} sao">${stars}</span>
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

  function renderStars(rating) {
    var full  = Math.floor(rating);
    var half  = rating - full >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  // ---- Render lần đầu ----
  render();
});

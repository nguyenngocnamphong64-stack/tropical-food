/**
 * account.js — Logic cho Trang 4: Tài khoản (account.html)
 * Must-have #4: Quản lý tài khoản và địa chỉ
 * - Thông tin cá nhân (lưu localStorage)
 * - Sổ địa chỉ: thêm / sửa / xoá / chọn mặc định
 * - Lịch sử xem quán
 */

document.addEventListener('DOMContentLoaded', function () {

  // ================================================================
  // A. CHUYỂN TAB
  // ================================================================
  var menuItems  = document.querySelectorAll('.account-menu-item');
  var panels     = document.querySelectorAll('.account-panel');

  menuItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var targetId = item.getAttribute('data-panel');

      menuItems.forEach(function (mi) { mi.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });

      item.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Nút "Chỉnh sửa thông tin" từ khối profile
  document.getElementById('goto-profile-btn').addEventListener('click', function () {
    document.querySelector('[data-panel="panel-profile"]').click();
  });

  // ================================================================
  // B. THÔNG TIN CÁ NHÂN
  // ================================================================
  var user = Storage.get(Storage.KEYS.USER, {});

  // Điền vào form từ localStorage
  function loadProfile() {
    document.getElementById('input-name').value  = user.name  || '';
    document.getElementById('input-email').value = user.email || '';
    document.getElementById('input-phone').value = user.phone || '';

    // Cập nhật khối profile ở trên
    document.getElementById('profile-name-display').textContent  = user.name  || 'Khách';
    document.getElementById('profile-email-display').textContent = user.email || 'Chưa cập nhật email';
    if (user.avatar) {
      document.getElementById('profile-avatar').src = user.avatar;
    }
  }
  loadProfile();

  // Lưu thông tin
  document.getElementById('profile-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = document.getElementById('input-name').value.trim();
    var email = document.getElementById('input-email').value.trim();
    var phone = document.getElementById('input-phone').value.trim();
    var errEl = document.getElementById('profile-error');
    var sucEl = document.getElementById('profile-success');

    if (!name) {
      errEl.textContent = '⚠️ Vui lòng nhập họ và tên!';
      sucEl.textContent = '';
      return;
    }
    errEl.textContent = '';

    user.name  = name;
    user.email = email;
    user.phone = phone;
    Storage.set(Storage.KEYS.USER, user);
    loadProfile();
    sucEl.textContent = '✅ Đã lưu thông tin!';
    setTimeout(function () { sucEl.textContent = ''; }, 3000);
  });

  // Đổi ảnh đại diện
  document.getElementById('avatar-input').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      user.avatar = ev.target.result;
      Storage.set(Storage.KEYS.USER, user);
      document.getElementById('profile-avatar').src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ================================================================
  // C. SỔ ĐỊA CHỈ
  // ================================================================
  var addresses    = Storage.get(Storage.KEYS.ADDRESSES, []);
  var editingIndex = null;   // null = thêm mới, số = sửa

  function renderAddresses() {
    var list     = document.getElementById('address-list');
    var emptyMsg = document.getElementById('address-empty');
    list.innerHTML = '';

    if (addresses.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    addresses.forEach(function (addr, idx) {
      var item = document.createElement('div');
      item.className = 'address-item';
      item.setAttribute('role', 'listitem');
      item.innerHTML = `
        <input
          type="radio"
          name="default-address"
          id="addr-radio-${idx}"
          aria-label="Chọn ${addr.label} làm mặc định"
          ${addr.isDefault ? 'checked' : ''}
        />
        <div class="address-item__info">
          <div class="address-item__label">${escHtml(addr.label)}</div>
          <div class="address-item__text">${escHtml(addr.text)}</div>
        </div>
        <div class="address-item__actions">
          <button class="btn-icon" data-edit="${idx}" aria-label="Sửa địa chỉ ${addr.label}" title="Sửa">✏️</button>
          <button class="btn-icon" data-del="${idx}"  aria-label="Xoá địa chỉ ${addr.label}" title="Xoá">🗑️</button>
        </div>
      `;

      // Chọn mặc định
      item.querySelector('input[type="radio"]').addEventListener('change', function () {
        addresses.forEach(function (a, i) { a.isDefault = (i === idx); });
        Storage.set(Storage.KEYS.ADDRESSES, addresses);
        renderAddresses();
      });

      // Sửa
      item.querySelector('[data-edit]').addEventListener('click', function () {
        editingIndex = idx;
        document.getElementById('modal-title').textContent = 'Sửa địa chỉ';
        document.getElementById('addr-label').value = addr.label;
        document.getElementById('addr-text').value  = addr.text;
        document.getElementById('addr-error').textContent = '';
        openModal();
      });

      // Xoá
      item.querySelector('[data-del]').addEventListener('click', function () {
        if (confirm('Xoá địa chỉ "' + addr.label + '"?')) {
          addresses.splice(idx, 1);
          Storage.set(Storage.KEYS.ADDRESSES, addresses);
          renderAddresses();
        }
      });

      list.appendChild(item);
    });
  }
  renderAddresses();

  // Mở modal thêm mới
  document.getElementById('open-add-address-btn').addEventListener('click', function () {
    editingIndex = null;
    document.getElementById('modal-title').textContent = 'Thêm địa chỉ mới';
    document.getElementById('addr-label').value = 'Nhà';
    document.getElementById('addr-text').value  = '';
    document.getElementById('addr-error').textContent = '';
    openModal();
  });

  // Đóng modal
  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('address-modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  // Lưu địa chỉ (thêm hoặc sửa)
  document.getElementById('address-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var label = document.getElementById('addr-label').value;
    var text  = document.getElementById('addr-text').value.trim();
    var errEl = document.getElementById('addr-error');

    if (!text) {
      errEl.textContent = '⚠️ Vui lòng nhập địa chỉ!';
      return;
    }
    errEl.textContent = '';

    if (editingIndex === null) {
      // Thêm mới: mặc định nếu chưa có gì
      addresses.push({
        label:     label,
        text:      text,
        isDefault: addresses.length === 0,
      });
    } else {
      // Sửa
      addresses[editingIndex].label = label;
      addresses[editingIndex].text  = text;
    }

    Storage.set(Storage.KEYS.ADDRESSES, addresses);
    renderAddresses();
    closeModal();
  });

  function openModal() {
    document.getElementById('address-modal').classList.add('open');
    document.getElementById('addr-text').focus();
  }
  function closeModal() {
    document.getElementById('address-modal').classList.remove('open');
  }

  // ================================================================
  // D. LỊCH SỬ XEM QUÁN
  // ================================================================
  function renderHistory() {
    var historyIds = Storage.get(Storage.KEYS.HISTORY, []);
    var list       = document.getElementById('history-list');
    var emptyMsg   = document.getElementById('history-empty');
    list.innerHTML = '';

    var found = historyIds
      .map(function (hid) {
        return (typeof RESTAURANTS !== 'undefined')
          ? RESTAURANTS.find(function (r) { return r.id === hid; })
          : null;
      })
      .filter(Boolean);

    if (found.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    found.forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'restaurant-card';
      a.href = 'restaurant-detail.html?id=' + r.id;
      a.setAttribute('role', 'listitem');
      a.setAttribute('aria-label', r.name);
      a.innerHTML = `
        <img class="restaurant-card__img" src="${r.image}" alt="Ảnh quán ${r.name}" loading="lazy" />
        <div class="restaurant-card__info">
          <div class="restaurant-card__name">${r.name}</div>
          <div class="restaurant-card__meta">
            <span class="restaurant-card__tag">${r.category}</span>
            <span class="restaurant-card__tag">${r.area}</span>
          </div>
          <div class="restaurant-card__price">${r.priceLabel}</div>
        </div>
      `;
      list.appendChild(a);
    });
  }
  renderHistory();

  // ================================================================
  // Tiện ích
  // ================================================================
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});

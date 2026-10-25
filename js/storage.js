/**
 * storage.js — Các hàm đọc/ghi localStorage dùng chung
 * Mọi trang đều có thể dùng các hàm này.
 */

const Storage = {
  /**
   * Lưu dữ liệu vào localStorage.
   * @param {string} key   - tên khoá
   * @param {*}      value - giá trị (sẽ được JSON.stringify)
   */
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage.set lỗi:', e);
    }
  },

  /**
   * Đọc dữ liệu từ localStorage.
   * @param {string} key          - tên khoá
   * @param {*}      defaultValue - giá trị trả về nếu key chưa có
   * @returns {*} dữ liệu đã parse
   */
  get: function (key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.error('Storage.get lỗi:', e);
      return defaultValue;
    }
  },

  /**
   * Xoá một khoá khỏi localStorage.
   * @param {string} key
   */
  remove: function (key) {
    localStorage.removeItem(key);
  },

  // ---- Khoá dữ liệu cố định ----
  KEYS: {
    REVIEWS:   'apppkl_reviews',    // đánh giá & bình luận
    USER:      'apppkl_user',       // thông tin tài khoản
    ADDRESSES: 'apppkl_addresses',  // sổ địa chỉ
    HISTORY:   'apppkl_history',    // lịch sử xem quán
  },
};

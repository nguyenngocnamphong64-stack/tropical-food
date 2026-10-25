/**
 * nav.js — Xử lý thanh điều hướng chung
 * - Đánh dấu mục đang active dựa trên URL hiện tại
 * - Xử lý nút hamburger trên mobile
 */

document.addEventListener('DOMContentLoaded', function () {
  // ---- Đánh dấu mục menu đang active ----
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar__menu a');

  navLinks.forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    // Khớp chính xác hoặc khớp tên file
    if (
      linkPath === currentPath ||
      (currentPath.endsWith('/') && linkPath.endsWith('index.html')) ||
      currentPath === linkPath
    ) {
      link.classList.add('active');
    }
  });

  // ---- Nút hamburger (mobile) ----
  const toggleBtn = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', function () {
      menu.classList.toggle('open');
      // Cập nhật aria-expanded cho trợ năng
      const isOpen = menu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Đóng menu khi bấm ra ngoài
    document.addEventListener('click', function (e) {
      if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

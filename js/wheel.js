/**
 * wheel.js — Vòng quay "Hôm nay ăn gì?"
 * Dùng ở Trang chủ (index.html) và Trang kết quả (result.html).
 * Vẽ vòng quay bằng Canvas, không dùng thư viện ngoài.
 */

// Các nhãn trên vòng quay (8 ô)
const WHEEL_LABELS = [
  'Bún bò',
  'Cơm tấm',
  'Bánh mì',
  'Phở',
  'Lẩu',
  'Trà sữa',
  'Đồ nướng',
  'Bất ngờ!',
];

// Màu xen kẽ cho các ô
const WHEEL_COLORS = [
  '#EE3A23', '#FFC107', '#FF7043', '#FFA726',
  '#EF5350', '#FFCA28', '#FF8A65', '#FFB300',
];

/**
 * Vẽ vòng quay lên canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {number} rotationRad - góc xoay hiện tại (radian)
 */
function drawWheel(canvas, rotationRad) {
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r  = cx - 4;          // bán kính (trừ viền)
  const n  = WHEEL_LABELS.length;
  const arc = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < n; i++) {
    const startAngle = rotationRad + i * arc;
    const endAngle   = startAngle + arc;

    // Vẽ hình quạt
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Viết chữ
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px "Noto Sans", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 3;
    ctx.fillText(WHEEL_LABELS[i], r - 8, 5);
    ctx.restore();
  }

  // Vòng tròn trung tâm
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Khởi tạo vòng quay trên một canvas cụ thể.
 * @param {string} canvasId - id của phần tử canvas
 * @param {string} btnId    - id của nút quay
 * @param {Function|null} onDone - callback(label) khi quay xong
 */
function initWheel(canvasId, btnId, onDone) {
  const canvas = document.getElementById(canvasId);
  const btn    = document.getElementById(btnId);
  if (!canvas || !btn) return;

  let currentRotation = 0;  // radian
  let isSpinning = false;

  // Vẽ lần đầu
  drawWheel(canvas, currentRotation);

  btn.addEventListener('click', function () {
    if (isSpinning) return;
    isSpinning = true;
    btn.disabled = true;

    const n   = WHEEL_LABELS.length;
    const arc = (2 * Math.PI) / n;

    // -------------------------------------------------------
    // Chọn ô đích hoàn toàn ngẫu nhiên — mọi ô xác suất bằng nhau.
    // Math.random() gọi MỘT LẦN DUY NHẤT tại đây, không dùng lại.
    // -------------------------------------------------------
    const targetIndex = Math.floor(Math.random() * n);

    // -------------------------------------------------------
    // Tính góc quay để vòng dừng CHÍNH XÁC tại targetIndex.
    //
    // Muốn ô targetIndex nằm dưới mũi tên (góc 3π/2), ta cần:
    //   finalRotation + targetIndex*arc + arc/2 ≡ 3π/2  (mod 2π)
    //   → finalRotation = 3π/2 - targetIndex*arc - arc/2 + 2π*k
    //
    // Chọn k đủ lớn để vòng quay ít nhất 5 vòng (k >= 5).
    // Thêm một phần ngẫu nhiên trong [0, 2π) để số vòng không cố định.
    // -------------------------------------------------------
    const POINTER_ANGLE = 3 * Math.PI / 2;
    const minTurns = 5;                                   // ít nhất 5 vòng
    const extraTurns = minTurns + Math.floor(Math.random() * 5); // 5–9 vòng

    // Góc mục tiêu (finalRotation) để ô targetIndex dừng dưới mũi tên
    const targetFinalRot = POINTER_ANGLE - targetIndex * arc - arc / 2
                           + 2 * Math.PI * extraTurns;

    // extraRotation = khoảng cần quay thêm từ vị trí hiện tại
    // (đảm bảo luôn dương bằng cách thêm đủ vòng)
    let extraRotation = targetFinalRot - currentRotation;
    // Nếu vì lý do nào đó extraRotation âm (không nên xảy ra), đảm bảo dương
    if (extraRotation < 2 * Math.PI * minTurns) {
      extraRotation += 2 * Math.PI * Math.ceil(
        (2 * Math.PI * minTurns - extraRotation) / (2 * Math.PI)
      );
    }

    const duration      = 4000; // ms
    const startTime     = performance.now();
    const startRotation = currentRotation;

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);   // ease-out cubic
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);

      currentRotation = startRotation + extraRotation * eased;
      drawWheel(canvas, currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        btn.disabled = false;

        // -------------------------------------------------------
        // Ô dừng = targetIndex đã chọn ngẫu nhiên ở trên.
        // Xác nhận lại bằng công thức hình học để đảm bảo nhất quán:
        //   offset = (3π/2 - currentRotation) mod 2π
        //   stoppedIndex = floor(offset / arc)
        // -------------------------------------------------------
        const POINTER_ANGLE = 3 * Math.PI / 2;
        const offset = ((POINTER_ANGLE - currentRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const stoppedIndex = Math.floor(offset / arc) % n;
        const result = WHEEL_LABELS[stoppedIndex];

        if (typeof onDone === 'function') {
          onDone(result, stoppedIndex);
        }
      }
    }

    requestAnimationFrame(animate);
  });
}

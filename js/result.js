/**
 * result.js — Logic cho Trang 1: Kết quả vòng quay (result.html)
 * Nice-to-have #5: Vòng quay ngẫu nhiên
 * Nice-to-have #6: Trợ lý AI gợi ý theo tâm trạng / thời tiết / ngân sách
 *
 * Nguyên tắc bất biến:
 *  - Món hiện ở tiêu đề LUÔN là món mũi tên chỉ vào, KHÔNG bao giờ thay đổi.
 *  - Danh sách quán bên dưới chỉ gồm quán có MÓN KHỚP với món vừa quay.
 *  - AI / ngân sách chỉ được lọc trong danh sách đó, không đổi món.
 *  - Không có quán nào → hiện thông báo cố định, không chuyển sang món khác.
 */

document.addEventListener('DOMContentLoaded', function () {

  var foodNameEl     = document.getElementById('result-food-name');
  var suggestedList  = document.getElementById('suggested-list');
  var suggestedTitle = document.getElementById('suggested-title');
  var suggestedEmpty = document.getElementById('suggested-empty');

  // ---- Món đang hiển thị (luôn giữ cố định sau khi quay) ----
  var currentFood = null;   // nhãn vòng quay, ví dụ "Bún bò"

  // ---- Đọc ngân sách từ trang chủ (nếu người dùng chọn trước khi quay) ----
  var wheelBudgetRaw = sessionStorage.getItem('wheel_budget');
  var wheelBudget    = wheelBudgetRaw ? parseInt(wheelBudgetRaw, 10) : null;
  sessionStorage.removeItem('wheel_budget');

  // ================================================================
  // Map nhãn vòng quay → từ khoá tìm trong menu[]
  // Mỗi nhãn khớp với một hoặc nhiều từ khoá (so khớp tên món, không phân biệt hoa thường).
  // '' = hiện tất cả quán (dùng cho "Bất ngờ!")
  // ================================================================
  var FOOD_KEYWORDS = {
    'bún bò':   ['bún bò'],
    'cơm tấm':  ['cơm tấm', 'cơm sườn', 'cơm chay', 'cơm'],
    'bánh mì':  ['bánh mì'],
    'phở':      ['phở'],
    'lẩu':      ['lẩu'],
    'trà sữa':  ['trà sữa', 'trà đào', 'matcha', 'trà', 'cà phê', 'nước'],
    'đồ nướng': ['nướng', 'bbq', 'gà rán'],
    'bất ngờ!': [],   // rỗng = tất cả quán
  };

  /**
   * Tìm quán có ít nhất một món trong menu khớp với nhãn vòng quay.
   * @param {string} foodLabel - nhãn vòng quay (đúng chuỗi từ WHEEL_LABELS)
   * @returns {Array} mảng quán lọc được
   */
  function getRestaurantsByFood(foodLabel) {
    var lower    = foodLabel.toLowerCase();
    var keywords = FOOD_KEYWORDS[lower];

    // "Bất ngờ!" hoặc không tìm thấy trong map → trả về tất cả
    if (!keywords || keywords.length === 0) {
      return RESTAURANTS.slice();
    }

    return RESTAURANTS.filter(function (r) {
      // Quán hợp lệ nếu ít nhất 1 món trong menu chứa từ khoá
      return r.menu.some(function (m) {
        var mLower = m.name.toLowerCase();
        return keywords.some(function (kw) {
          return mLower.includes(kw);
        });
      });
    });
  }

  // ================================================================
  // Map priceRange → giá tối đa ước tính (nghìn đồng)
  // ================================================================
  var PRICE_MAX = {
    '< 50k':      50,
    '50k - 100k': 100,
    '> 100k':     300,
  };

  function filterByBudget(list, budget) {
    if (!budget) return list;
    return list.filter(function (r) {
      var max = PRICE_MAX[r.priceRange];
      return max !== undefined && max <= budget;
    });
  }

  // ================================================================
  // Hiển thị danh sách quán cho món đã quay
  // KHÔNG bao giờ thay đổi foodLabel ở đây.
  // ================================================================
  /**
   * @param {string}      foodLabel - nhãn vòng quay (cố định)
   * @param {number|null} budget    - ngân sách (nghìn đồng), null = không lọc
   */
  function showSuggestedByFood(foodLabel, budget) {
    // 1. Lấy quán có món khớp
    var byFood = getRestaurantsByFood(foodLabel);

    // 2. Lọc thêm theo ngân sách (chỉ thu hẹp, không đổi món)
    var results = filterByBudget(byFood, budget)
      .sort(function (a, b) { return b.rating - a.rating; })
      .slice(0, 5);

    // 3. Cập nhật tiêu đề (luôn hiện đúng món đã quay)
    var budgetLabel = budget
      ? ' · ngân sách dưới ' + (budget >= 1000 ? '1 triệu' : budget + 'k')
      : '';
    suggestedTitle.textContent = '🍽️ Quán có món "' + foodLabel + '"' + budgetLabel;

    // 4. Không có quán → thông báo rõ, KHÔNG đổi sang món khác
    if (results.length === 0) {
      suggestedList.innerHTML     = '';
      suggestedEmpty.style.display = 'block';
      if (budget && byFood.length > 0) {
        suggestedEmpty.textContent =
          '😔 Không tìm thấy quán có món "' + foodLabel + '" trong mức ngân sách đã chọn. '
          + 'Hãy thử không chọn ngân sách hoặc chọn mức cao hơn nhé!';
      } else {
        suggestedEmpty.textContent = '😔 Chưa có quán nào cho món này trong dữ liệu hiện tại.';
      }
      return;
    }

    showSuggestedResults(results);
  }

  function showSuggestedResults(results) {
    suggestedList.innerHTML = '';
    if (results.length === 0) {
      suggestedEmpty.style.display = 'block';
      suggestedEmpty.textContent   = '😔 Chưa có gợi ý.';
      return;
    }
    suggestedEmpty.style.display = 'none';
    results.forEach(function (r) {
      suggestedList.appendChild(createCard(r));
    });
  }

  // ================================================================
  // 1. Đọc kết quả từ trang chủ (nếu quay ở trang chủ rồi chuyển sang)
  // ================================================================
  var savedResult = sessionStorage.getItem('wheel_result');
  if (savedResult) {
    currentFood = savedResult;
    foodNameEl.textContent = currentFood;
    sessionStorage.removeItem('wheel_result');
    showSuggestedByFood(currentFood, wheelBudget);
  }

  // ================================================================
  // 2. Khởi tạo vòng quay lớn trên trang result
  // ================================================================
  initWheel('result-wheel-canvas', 'result-spin-btn', function (result) {
    // Cập nhật món — đây là lần duy nhất được gán, từ callback vòng quay
    currentFood = result;
    foodNameEl.textContent = currentFood;
    addAiBubble('Bạn quay được: <strong>' + result + '</strong>! Đang tìm quán phù hợp...');
    showSuggestedByFood(currentFood, null);
  });

  // ================================================================
  // 3. Trợ lý AI gợi ý
  // Chỉ lọc TRONG danh sách quán liên quan đến món đã quay.
  // KHÔNG được gọi showSuggestedByFood với món khác.
  // ================================================================
  var aiBubbles  = document.getElementById('ai-bubbles');
  var moodSel    = document.getElementById('ai-mood');
  var weatherSel = document.getElementById('ai-weather');
  var budgetSel  = document.getElementById('ai-budget');
  var suggestBtn = document.getElementById('ai-suggest-btn');

  suggestBtn.addEventListener('click', function () {
    var mood    = moodSel.value;
    var weather = weatherSel.value;
    var budget  = budgetSel.value;

    if (!mood && !weather && !budget) {
      addAiBubble('Bạn ơi, hãy chọn ít nhất một trong ba: tâm trạng, thời tiết hoặc ngân sách để mình gợi ý nhé! 😊', true);
      return;
    }

    // Lấy pool quán theo món đã quay (nếu chưa quay → toàn bộ)
    var pool = currentFood ? getRestaurantsByFood(currentFood) : RESTAURANTS.slice();

    // Lọc theo AI trong pool đó, kèm lý do
    var aiResult = aiFilterInPool(pool, mood, weather, budget);

    var userMsg = [];
    if (mood)    userMsg.push(moodSel.options[moodSel.selectedIndex].text);
    if (weather) userMsg.push(weatherSel.options[weatherSel.selectedIndex].text);
    if (budget)  userMsg.push(budgetSel.options[budgetSel.selectedIndex].text);
    addAiBubble(userMsg.join(' · '), true);

    if (aiResult.restaurants.length === 0) {
      addAiBubble('Mình chưa tìm được quán phù hợp trong danh sách món đã quay. Hãy thử chọn khác nhé! 🤔');
    } else {
      addAiBubble(aiResult.reason + ' Tìm thấy <strong>' + aiResult.restaurants.length + '</strong> quán phù hợp! 🎉');
      showSuggestedResults(aiResult.restaurants);
    }
  });

  // ================================================================
  // Quy tắc AI — lọc trong pool, gợi ý 3–5 quán ngẫu nhiên, kèm lý do
  // ================================================================
  /**
   * Mô tả lý do gợi ý dựa trên mood/weather/budget.
   */
  function buildReason(mood, weather, budget) {
    var parts = [];
    if (weather === 'mua')  parts.push('Trời mưa nên mình gợi ý món nóng, ấm bụng');
    if (weather === 'nang') parts.push('Trời nắng nên mình gợi ý món mát, giải nhiệt');
    if (weather === 'lanh') parts.push('Trời lạnh nên mình gợi ý món nóng, giữ ấm');
    if (mood === 'vui')    parts.push('Tâm trạng vui nên mình gợi ý quán ăn nhóm, sôi động');
    if (mood === 'buon')   parts.push('Đang buồn, hãy ăn thứ gì ngon ngon cho ấm lòng');
    if (mood === 'stress') parts.push('Căng thẳng nên mình gợi ý món nhẹ nhàng, dễ ăn');
    if (mood === 'met')    parts.push('Mệt mỏi nên mình gợi ý món no, bổ dưỡng');
    if (budget)            parts.push('Trong mức ngân sách phù hợp');
    return parts.length ? parts.join('. ') + '. ' : '';
  }

  /**
   * Lọc quán trong pool theo mood/weather/budget.
   * Trả về 3–5 quán ngẫu nhiên trong số phù hợp.
   * @returns {{ restaurants: Array, reason: string }}
   */
  function aiFilterInPool(pool, mood, weather, budget) {
    // Xây bảng điểm: quán phù hợp nhiều tiêu chí → điểm cao hơn
    var scored = pool.map(function (r) {
      var score = 0;

      // Lọc cứng: ngân sách (nếu có)
      if (budget && r.priceRange !== budget) return { r: r, score: -1 };

      // Thời tiết
      if (weather === 'mua'  && (r.tags.includes('nóng') || r.tags.includes('mưa'))) score += 2;
      if (weather === 'nang' && (r.tags.includes('mát')  || r.tags.includes('nắng'))) score += 2;
      if (weather === 'lanh' && (r.tags.includes('nóng') || r.tags.includes('lạnh'))) score += 2;

      // Tâm trạng
      if (mood === 'vui'    && (r.tags.includes('vui')   || r.tags.includes('nhóm'))) score += 2;
      if (mood === 'buon'   && (r.tags.includes('buồn')  || r.tags.includes('ngọt') || r.tags.includes('nóng'))) score += 2;
      if (mood === 'stress' && (r.tags.includes('stress')|| r.tags.includes('nhẹ')  || r.tags.includes('mát')))  score += 2;
      if (mood === 'met'    && (r.tags.includes('mệt')   || r.tags.includes('no')   || r.tags.includes('nhanh'))) score += 2;

      // Bonus nhỏ theo rating
      score += r.rating / 5;

      return { r: r, score: score };
    });

    // Loại quán không hợp lệ (score = -1) và quán không khớp gì cả khi có filter
    var hasFilter = !!(mood || weather);
    var valid = scored.filter(function (item) {
      if (item.score < 0) return false;
      if (hasFilter && item.score === 0) return false;  // không khớp tiêu chí nào
      return true;
    });

    // Nếu không đủ → nới lỏng: giữ tất cả quán hợp lệ ngân sách
    if (valid.length < 3) {
      valid = scored.filter(function (item) { return item.score >= 0; });
    }

    if (valid.length === 0) {
      return { restaurants: [], reason: '' };
    }

    // Trộn ngẫu nhiên (Fisher-Yates) rồi lấy 3–5 quán
    var shuffled = valid.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    // Ưu tiên quán điểm cao nhất → sắp điểm rồi lấy top, trộn trong top
    shuffled.sort(function (a, b) { return b.score - a.score; });
    var topPool = shuffled.slice(0, Math.min(10, shuffled.length));
    // Trộn ngẫu nhiên lại trong top
    for (var i = topPool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = topPool[i]; topPool[i] = topPool[j]; topPool[j] = tmp;
    }
    var count = 3 + Math.floor(Math.random() * 3);   // 3, 4 hoặc 5
    var chosen = topPool.slice(0, Math.min(count, topPool.length)).map(function (item) { return item.r; });

    return {
      restaurants: chosen,
      reason: buildReason(mood, weather, budget),
    };
  }

  // ================================================================
  // Tiện ích
  // ================================================================

  function addAiBubble(html, isUser) {
    var div = document.createElement('div');
    div.className = 'ai-bubble' + (isUser ? ' user-bubble' : '');
    div.innerHTML = html;
    aiBubbles.appendChild(div);
    aiBubbles.scrollTop = aiBubbles.scrollHeight;
  }

  function createCard(r) {
    var a = document.createElement('a');
    a.className = 'restaurant-card';
    a.href = 'restaurant-detail.html?id=' + r.id;
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

  // ---- Đánh giá nhanh (5 sao trên trang kết quả) ----
  var quickStars = document.querySelectorAll('#quick-stars span');
  quickStars.forEach(function (star) {
    star.addEventListener('click', function () {
      var val = parseInt(star.getAttribute('data-val'), 10);
      quickStars.forEach(function (s) {
        var sv = parseInt(s.getAttribute('data-val'), 10);
        s.classList.toggle('lit', sv <= val);
        s.setAttribute('aria-checked', sv <= val ? 'true' : 'false');
      });
    });
    star.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') star.click();
    });
  });
});

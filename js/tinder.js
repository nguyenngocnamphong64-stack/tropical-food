/**
 * tinder.js — Tính năng "Tinder chọn món" (Swipe to Eat)
 *
 * Cơ chế:
 *  1. Từ data/restaurants.js, gom tất cả các món (menu items) của mọi quán.
 *  2. Người dùng đặt số người trong nhóm (1–10), rồi bấm "Bắt đầu".
 *  3. Từng người lần lượt quẹt: phải (thích ♥) hoặc trái (không ✕).
 *  4. Sau khi người cuối quẹt xong, tính "MATCH" = món ≥ 1 người thích
 *     và số phiếu thích nhiều nhất (ưu tiên thứ tự hiển thị).
 *  5. Màn hình kết quả hiện danh sách match kèm nút "Xem thực đơn quán".
 *     KHÔNG có nút "Đặt món ngay".
 *  6. Dữ liệu phiên (votes) lưu vào localStorage để F5 không mất giữa chừng.
 */

document.addEventListener('DOMContentLoaded', function () {

  // ================================================================
  // 0. Xây danh sách món từ RESTAURANTS
  // ================================================================
  /**
   * Mỗi món có thêm thông tin quán để hiển thị và liên kết.
   * @type {Array<{id:string, name:string, price:string, image:string,
   *               restaurantId:number, restaurantName:string, category:string}>}
   */
  var ALL_DISHES = [];
  if (typeof RESTAURANTS !== 'undefined') {
    RESTAURANTS.forEach(function (r) {
      r.menu.forEach(function (m, idx) {
        ALL_DISHES.push({
          id:             r.id + '_' + idx,       // id duy nhất: "1_0", "1_1", ...
          name:           m.name,
          price:          m.price,
          image:          m.image,
          restaurantId:   r.id,
          restaurantName: r.name,
          category:       r.category,
        });
      });
    });
  }

  // ================================================================
  // 1. Trạng thái phiên (lưu vào localStorage để chịu được F5)
  // ================================================================
  var SESSION_KEY = 'apppkl_tinder_session';

  /** Tạo phiên mới */
  function newSession(groupSize) {
    return {
      groupSize:   groupSize,
      currentPerson: 0,         // index người đang quẹt (0-based)
      // votes[dishId] = mảng boolean (true=thích, false=không)
      // votes[dishId][personIndex] = true/false
      votes:       {},
      done:        false,
    };
  }

  /** Đọc phiên từ localStorage */
  function loadSession() {
    return Storage.get(SESSION_KEY, null);
  }

  /** Lưu phiên vào localStorage */
  function saveSession(sess) {
    Storage.set(SESSION_KEY, sess);
  }

  /** Xoá phiên */
  function clearSession() {
    Storage.remove(SESSION_KEY);
  }

  // ================================================================
  // 2. Biến trạng thái runtime (không cần persist)
  // ================================================================
  var session        = null;    // phiên hiện tại
  var currentIndex   = 0;       // index món đang hiện trong ALL_DISHES
  var isDragging     = false;
  var startX         = 0;
  var currentX       = 0;
  var activeCard     = null;    // element thẻ đang kéo

  // ================================================================
  // 3. Lấy phần tử DOM
  // ================================================================
  var swipeScreen   = document.getElementById('swipe-screen');
  var waitingScreen = document.getElementById('waiting-screen');
  var matchScreen   = document.getElementById('match-screen');
  var groupSizeInput= document.getElementById('group-size-input');
  var startBtn      = document.getElementById('start-btn');
  var readyBtn      = document.getElementById('ready-btn');
  var btnNope       = document.getElementById('btn-nope');
  var btnLike       = document.getElementById('btn-like');
  var cardStack     = document.getElementById('card-stack');
  var cardCounter   = document.getElementById('card-counter');
  var swipeProgress = document.getElementById('swipe-progress');
  var progressBar   = document.getElementById('progress-bar');
  var progressWrap  = document.getElementById('progress-wrap');
  var nextPersonName= document.getElementById('next-person-name');

  // ================================================================
  // 4. Bắt đầu / Khôi phục phiên
  // ================================================================
  // Nếu có phiên cũ chưa xong, hỏi khôi phục
  var savedSession = loadSession();
  if (savedSession && !savedSession.done) {
    // Tự động khôi phục — hiển thị lại màn quẹt tại vị trí cũ
    session = savedSession;
    currentIndex = countVoted(session);
    if (session.currentPerson < session.groupSize) {
      showSwipeScreen();
    }
  }

  startBtn.addEventListener('click', function () {
    var size = parseInt(groupSizeInput.value, 10);
    if (isNaN(size) || size < 1) size = 1;
    if (size > 10) size = 10;
    session = newSession(size);
    currentIndex = 0;
    saveSession(session);
    showSwipeScreen();
  });

  // ================================================================
  // 5. Màn hình quẹt
  // ================================================================
  function showSwipeScreen() {
    swipeScreen.style.display   = 'block';
    waitingScreen.classList.remove('visible');
    matchScreen.classList.remove('visible');
    updateProgress();
    renderCard();
  }

  /** Đếm số món đã quẹt (bởi người hiện tại) */
  function countVoted(sess) {
    var count = 0;
    ALL_DISHES.forEach(function (d) {
      var v = sess.votes[d.id];
      if (v && v[sess.currentPerson] !== undefined) count++;
    });
    return count;
  }

  function updateProgress() {
    if (!session) return;
    var personNum = session.currentPerson + 1;
    var total     = session.groupSize;
    swipeProgress.innerHTML =
      'Người <strong>' + personNum + '</strong>/' + total + ' đang quẹt';

    var pct = Math.round((session.currentPerson / session.groupSize) * 100);
    progressBar.style.width = pct + '%';
    progressWrap.setAttribute('aria-valuenow', pct);
  }

  /** Render thẻ món tiếp theo lên stack */
  function renderCard() {
    cardStack.innerHTML = '';
    // Tìm món chưa được người hiện tại quẹt
    var dish = getNextDish();
    if (!dish) {
      // Người này đã quẹt hết
      onPersonDone();
      return;
    }

    // Cập nhật counter
    var remaining = ALL_DISHES.length - currentIndex;
    cardCounter.textContent = 'Còn ' + remaining + ' món';

    var card = buildCard(dish);
    cardStack.appendChild(card);
    activeCard = card;
    attachDrag(card, dish);
  }

  /** Lấy món tiếp theo chưa quẹt bởi người hiện tại */
  function getNextDish() {
    for (var i = currentIndex; i < ALL_DISHES.length; i++) {
      var d = ALL_DISHES[i];
      var v = session.votes[d.id];
      if (!v || v[session.currentPerson] === undefined) {
        currentIndex = i;
        return d;
      }
    }
    return null;
  }

  /** Tạo element thẻ món */
  function buildCard(dish) {
    var card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', dish.name + ' – ' + dish.restaurantName);

    card.innerHTML = `
      <img class="dish-card__img" src="${dish.image}" alt="${escHtml(dish.name)}" loading="lazy" />
      <div class="dish-card__body">
        <div class="dish-card__name">${escHtml(dish.name)}</div>
        <div class="dish-card__restaurant">📍 ${escHtml(dish.restaurantName)}</div>
        <div class="dish-card__price">${escHtml(dish.price)}</div>
        <div class="dish-card__tags">
          <span class="dish-card__tag">${escHtml(dish.category)}</span>
        </div>
      </div>
      <div class="swipe-label label-like" aria-hidden="true">THÍCH ♥</div>
      <div class="swipe-label label-nope"  aria-hidden="true">KHÔNG ✕</div>
    `;
    return card;
  }

  // ================================================================
  // 6. Ghi vote và chuyển thẻ
  // ================================================================
  function vote(dish, liked) {
    if (!session || !dish) return;

    if (!session.votes[dish.id]) {
      session.votes[dish.id] = {};
    }
    session.votes[dish.id][session.currentPerson] = liked;
    saveSession(session);

    currentIndex++;
    renderCard();
  }

  function onPersonDone() {
    session.currentPerson++;
    saveSession(session);

    if (session.currentPerson >= session.groupSize) {
      // Tất cả đã quẹt → hiện kết quả
      showMatchScreen();
    } else {
      // Chờ người tiếp theo
      showWaitingScreen();
    }
  }

  // ================================================================
  // 7. Màn hình chờ người tiếp theo
  // ================================================================
  function showWaitingScreen() {
    swipeScreen.style.display = 'none';
    waitingScreen.classList.add('visible');
    matchScreen.classList.remove('visible');

    var nextNum = session.currentPerson + 1;
    nextPersonName.textContent = 'người thứ ' + nextNum;
  }

  readyBtn.addEventListener('click', function () {
    currentIndex = 0;   // reset index để duyệt lại từ đầu cho người mới
    showSwipeScreen();
  });

  // ================================================================
  // 8. Màn hình kết quả MATCH
  // ================================================================
  function showMatchScreen() {
    swipeScreen.style.display = 'none';
    waitingScreen.classList.remove('visible');
    matchScreen.classList.add('visible');
    matchScreen.innerHTML = '';

    // Tính số phiếu thích cho mỗi món
    var scored = ALL_DISHES.map(function (dish) {
      var votes = session.votes[dish.id] || {};
      var likes = 0;
      for (var p = 0; p < session.groupSize; p++) {
        if (votes[p] === true) likes++;
      }
      return { dish: dish, likes: likes };
    }).filter(function (item) {
      return item.likes > 0;  // chỉ giữ món ≥ 1 người thích
    }).sort(function (a, b) {
      return b.likes - a.likes;  // nhiều phiếu nhất lên đầu
    });

    // Tiêu đề
    var title = document.createElement('div');
    title.className = 'match-title';
    title.innerHTML = scored.length > 0
      ? '🎉 MATCH!'
      : '😅 Chưa có match';
    matchScreen.appendChild(title);

    var sub = document.createElement('p');
    sub.className = 'match-subtitle';
    sub.textContent = scored.length > 0
      ? 'Cả nhóm đều thích những món này! Không còn cãi nhau "Ăn gì đây?" nữa 😄'
      : 'Không ai thích chung món nào. Hãy thử lại nhé!';
    matchScreen.appendChild(sub);

    if (scored.length === 0) {
      var noMatch = document.createElement('div');
      noMatch.className = 'no-match-msg';
      noMatch.textContent = 'Thử mở rộng lựa chọn hoặc chơi lại!';
      matchScreen.appendChild(noMatch);
    } else {
      var grid = document.createElement('div');
      grid.className = 'match-grid';

      scored.forEach(function (item) {
        var dish = item.dish;
        var div  = document.createElement('div');
        div.className = 'match-item';

        // Tìm restaurantId để link sang trang chi tiết
        var detailUrl = 'restaurant-detail.html?id=' + dish.restaurantId;

        div.innerHTML = `
          <img class="match-item__img" src="${dish.image}" alt="${escHtml(dish.name)}" loading="lazy" />
          <div class="match-item__info">
            <div class="match-item__name">${escHtml(dish.name)}</div>
            <div class="match-item__meta">${escHtml(dish.restaurantName)} · ${escHtml(dish.price)}</div>
            <div class="match-item__votes">♥ ${item.likes}/${session.groupSize} người thích</div>
          </div>
          <a href="${detailUrl}" class="btn-primary match-item__btn" aria-label="Xem thực đơn quán ${escHtml(dish.restaurantName)}">
            Xem thực đơn quán
          </a>
        `;
        grid.appendChild(div);
      });

      matchScreen.appendChild(grid);
    }

    // Nút chơi lại
    var restartBtn = document.createElement('button');
    restartBtn.className = 'btn-outline btn-restart';
    restartBtn.textContent = '🔄 Chơi lại';
    restartBtn.addEventListener('click', restartGame);
    matchScreen.appendChild(restartBtn);

    // Xoá phiên khỏi localStorage khi xong
    clearSession();
  }

  function restartGame() {
    session      = null;
    currentIndex = 0;
    clearSession();

    matchScreen.classList.remove('visible');
    waitingScreen.classList.remove('visible');
    swipeScreen.style.display = 'block';

    // Reset form
    groupSizeInput.value = '2';
    progressBar.style.width = '0%';
    swipeProgress.textContent = '';
    cardCounter.textContent  = '';
    cardStack.innerHTML      = '';
  }

  // ================================================================
  // 9. Nút bấm KHÔNG / THÍCH
  // ================================================================
  btnNope.addEventListener('click', function () {
    if (!session) return;
    var dish = getCurrentDish();
    if (!dish) return;
    animateCard(activeCard, 'left', function () { vote(dish, false); });
  });

  btnLike.addEventListener('click', function () {
    if (!session) return;
    var dish = getCurrentDish();
    if (!dish) return;
    animateCard(activeCard, 'right', function () { vote(dish, true); });
  });

  function getCurrentDish() {
    for (var i = currentIndex; i < ALL_DISHES.length; i++) {
      var d = ALL_DISHES[i];
      var v = session ? session.votes[d.id] : null;
      if (!v || v[session.currentPerson] === undefined) return d;
    }
    return null;
  }

  // ================================================================
  // 10. Drag (chuột + cảm ứng)
  // ================================================================
  function attachDrag(card, dish) {
    // --- Chuột ---
    card.addEventListener('mousedown', function (e) {
      startDrag(e.clientX, card);
    });
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', function onUp(e) {
      if (!isDragging) return;
      endDrag(card, dish);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mousemove', onDragMove);
    });

    // --- Cảm ứng ---
    card.addEventListener('touchstart', function (e) {
      startDrag(e.touches[0].clientX, card);
    }, { passive: true });
    card.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      moveDrag(e.touches[0].clientX, card);
    }, { passive: true });
    card.addEventListener('touchend', function () {
      if (!isDragging) return;
      endDrag(card, dish);
    });
  }

  function startDrag(x, card) {
    isDragging = true;
    startX     = x;
    currentX   = x;
    card.classList.add('dragging');
  }

  function onDragMove(e) {
    if (!isDragging || !activeCard) return;
    moveDrag(e.clientX, activeCard);
  }

  function moveDrag(x, card) {
    currentX = x;
    var dx   = currentX - startX;
    var deg  = dx * 0.08;  // nghiêng nhẹ

    card.style.transform = 'translateX(' + dx + 'px) rotate(' + deg + 'deg)';

    // Hiện nhãn THÍCH / KHÔNG
    var labelLike = card.querySelector('.label-like');
    var labelNope = card.querySelector('.label-nope');
    if (dx > 30) {
      labelLike.style.opacity = Math.min((dx - 30) / 60, 1);
      labelNope.style.opacity = '0';
    } else if (dx < -30) {
      labelNope.style.opacity = Math.min((-dx - 30) / 60, 1);
      labelLike.style.opacity = '0';
    } else {
      labelLike.style.opacity = '0';
      labelNope.style.opacity = '0';
    }
  }

  function endDrag(card, dish) {
    isDragging = false;
    card.classList.remove('dragging');

    var dx = currentX - startX;
    var THRESHOLD = 80;  // pixel cần kéo để xác nhận

    if (dx > THRESHOLD) {
      animateCard(card, 'right', function () { vote(dish, true); });
    } else if (dx < -THRESHOLD) {
      animateCard(card, 'left', function () { vote(dish, false); });
    } else {
      // Snap về giữa
      card.style.transition = 'transform 0.3s';
      card.style.transform  = 'translateX(0) rotate(0deg)';
      var labelLike = card.querySelector('.label-like');
      var labelNope = card.querySelector('.label-nope');
      if (labelLike) labelLike.style.opacity = '0';
      if (labelNope) labelNope.style.opacity = '0';
      setTimeout(function () { card.style.transition = ''; }, 310);
    }
  }

  /** Bay thẻ ra khỏi màn hình theo hướng left / right */
  function animateCard(card, direction, callback) {
    if (!card) { callback(); return; }
    var tx = direction === 'right' ? '140%' : '-140%';
    var rot = direction === 'right' ? '20deg' : '-20deg';
    card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
    card.style.transform  = 'translateX(' + tx + ') rotate(' + rot + ')';
    card.style.opacity    = '0';
    setTimeout(callback, 360);
  }

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

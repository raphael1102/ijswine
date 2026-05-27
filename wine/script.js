/* ═══════════════════════════════════════════════════════════
   WINE SHOP — Interactive Features · script.js
═══════════════════════════════════════════════════════════ */

/* ── AUTO-SCROLL WINES PANEL (INFINITE CIRCULAR SCROLL) ──── */

class WinesPanelScroller {
  constructor() {
    this.panel = document.querySelector('.wines-panel');
    this.isAutoScrolling = true;
    this.scrollSpeed = 0.03;
    this.lastTime = Date.now();
    this.cardWidth = 0;
    this.originalCardsCount = 0;
    this.thumbOffset = 0;

    if (this.panel) {
      this.setupInfiniteScroll();
      this.setupScrollbar();
      this.init();
    }
  }

  setupInfiniteScroll() {
    const cards = Array.from(this.panel.querySelectorAll('.wine-card'));
    this.originalCardsCount = cards.length;
    this.cardWidth = cards[0]?.offsetWidth || 260;

    cards.forEach(card => {
      const clone = card.cloneNode(true);
      this.panel.appendChild(clone);
    });

    cards.forEach(card => {
      const clone = card.cloneNode(true);
      this.panel.appendChild(clone);
    });
  }

  setupScrollbar() {
    this.scrollbar = document.querySelector('.wines-scrollbar');
    this.thumb = document.getElementById('thumb1');

    this.thumbWidth = 140;
    this.thumb1Pos = -this.thumbWidth;
  }

  init() {
    this.panel.addEventListener('mouseenter', () => this.pauseScroll());
    this.panel.addEventListener('mouseleave', () => this.resumeScroll());
    this.panel.addEventListener('wheel', () => this.resetScroll());



    this.animate();
  }

  updateScrollbar(deltaTime) {
    const trackWidth = this.panel.offsetWidth;
    const moveAmount = this.scrollSpeed * deltaTime;

    this.thumb1Pos += moveAmount;

    // Simple looping: reset when thumb leaves screen
    if (this.thumb1Pos > trackWidth + this.thumbWidth) {
      this.thumb1Pos = -this.thumbWidth;
    }

    this.thumb.style.transform = `translateX(${this.thumb1Pos}px)`;
  }

  animate() {
    const now = Date.now();
    const deltaTime = now - this.lastTime;

    if (this.isAutoScrolling) {
      const scrollAmount = this.scrollSpeed * deltaTime;
      this.panel.scrollLeft += scrollAmount;

      const oneSetWidth = this.cardWidth * this.originalCardsCount;
      if (this.panel.scrollLeft >= oneSetWidth * 2) {
        this.panel.scrollLeft = oneSetWidth;
      }

      this.updateScrollbar(deltaTime);
    }

    this.lastTime = now;
    requestAnimationFrame(() => this.animate());
  }

  pauseScroll() {
    this.isAutoScrolling = false;
  }

  resumeScroll() {
    this.isAutoScrolling = true;
    this.lastTime = Date.now();
  }

  resetScroll() {
    this.lastTime = Date.now();
  }
}

/* ── SIDEBAR TOGGLE FUNCTIONALITY ───────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sidebar-toggle');
  const pageBody = document.querySelector('.page-body');

  if (toggle && pageBody) {
    toggle.addEventListener('click', () => {
      pageBody.classList.toggle('sidebar-open');
    });
  }
});



/* ── TAB / NAVIGATION FUNCTIONALITY ──────────────────────── */

/* ── TAB / NAVIGATION FUNCTIONALITY ──────────────────────── */

class TabNavigation {
  constructor(scroller = null) {
    this.navItems = document.querySelectorAll('.sidebar li');

    // ADDED cart panel
    this.panels = {
      'main': document.getElementById('tab-main'),
      'wines': document.getElementById('tab-wines'),
      'faq': document.getElementById('tab-faq'),
      'contacts': document.getElementById('tab-contacts'),
      'cart': document.getElementById('tab-cart'),
    };

    this.cartBtn = document.getElementById('cart-btn');

    this.scroller = scroller;
    this.init();
  }

  init() {
    // sidebar nav clicks
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleTabClick(e));
    });

    // top-right cart button click
    if (this.cartBtn) {
      this.cartBtn.addEventListener('click', () => {
        this.openTab('cart');
      });
    }

    // filter buttons in catalogue
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });
  }

  handleTabClick(e) {
    const key = e.target.textContent.trim().toLowerCase();

    this.openTab(key);
  }

  openTab(key) {
    if (!this.panels[key]) return;

    // update sidebar active state
    this.navItems.forEach(i => {
      i.classList.remove('active');

      if (i.textContent.trim().toLowerCase() === key) {
        i.classList.add('active');
      }
    });

    // hide all panels
    Object.values(this.panels).forEach(panel => {
      if (panel) {
        panel.classList.remove('active');
      }
    });

    // show selected panel
    this.panels[key].classList.add('active');

    // show scrollbar only on main tab
    const scrollbar = document.querySelector('.wines-scrollbar');

    if (scrollbar) {
      scrollbar.style.display = key === 'main' ? 'block' : 'none';
    }

    // control auto-scroll
    if (this.scroller) {
      if (key === 'main') {
        this.scroller.resumeScroll();
      } else {
        this.scroller.pauseScroll();
      }
    }

    // close sidebar automatically on mobile/tablet
    if (window.innerWidth <= 768) {
      document.querySelector('.page-body')
        .classList.remove('sidebar-open');
    }
  }

  handleFilter(e) {
    const filter = e.target.dataset.filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    e.target.classList.add('active');

    document.querySelectorAll('.catalogue-item').forEach(item => {
      if (
        filter === 'all' ||
        item.dataset.type === filter
      ) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }
}

/* ── INITIALIZATION ──────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all features in correct order
  const scroller = new WinesPanelScroller();
  new SidebarToggle();
  new TabNavigation(scroller);

  console.log('🍷 Wine Shop initialized with auto-scroll, sidebar toggle, and tab navigation');
});

/* ── UTILITY: Add to Selection Click Handler ──────────────── */

function setupAddToCart() {
  const addButtons = document.querySelectorAll('.wine-add');
  addButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wineName = btn.parentElement.querySelector('.wine-name').textContent;
      console.log('Added to selection:', wineName);

      // Visual feedback
      btn.style.background = 'linear-gradient(135deg, #e8c976, var(--gold))';
      btn.textContent = '✓ Added';
      setTimeout(() => {
        btn.style.background = 'linear-gradient(135deg, var(--gold), #e8c976)';
        btn.textContent = 'Add to Selection';
      }, 1500);
    });
  });
}

/* ── CART QUANTITY CONTROLS ───────────────────────────── */

function setupCartControls() {
  const cartRows = document.querySelectorAll('.cart-row');

  cartRows.forEach(row => {
    const minusBtn = row.querySelectorAll('.cart-qty-btn')[0];
    const plusBtn = row.querySelectorAll('.cart-qty-btn')[1];

    const qtyNum = row.querySelector('.cart-qty-num');
    const priceEl = row.querySelector('.cart-row-price');

    // Store original bottle price
    const originalPrice = parseInt(
      priceEl.textContent.replace(/[₦,]/g, '')
    ) / parseInt(qtyNum.textContent);

    plusBtn.addEventListener('click', () => {
      let qty = parseInt(qtyNum.textContent);

      qty++;
      qtyNum.textContent = qty;

      updateRowPrice(priceEl, originalPrice, qty);
      updateCartTotal();
    });

    minusBtn.addEventListener('click', () => {
      let qty = parseInt(qtyNum.textContent);

      if (qty > 1) {
        qty--;
        qtyNum.textContent = qty;

        updateRowPrice(priceEl, originalPrice, qty);
        updateCartTotal();
      }
    });
  });
}

/* ── UPDATE SINGLE ROW PRICE ──────────────────────────── */

function updateRowPrice(priceEl, bottlePrice, qty) {
  const total = bottlePrice * qty;

  priceEl.textContent =
    '₦' + total.toLocaleString();
}

/* ── UPDATE CART TOTAL ────────────────────────────────── */

function updateCartTotal() {
  const rowPrices = document.querySelectorAll('.cart-row-price');

  let subtotal = 0;

  rowPrices.forEach(price => {
    subtotal += parseInt(
      price.textContent.replace(/[₦,]/g, '')
    );
  });

  const delivery = 5000;
  const total = subtotal + delivery;

  // update summary
  const summaryValues = document.querySelectorAll('.cart-summary-value');

  summaryValues[0].textContent =
    '₦' + subtotal.toLocaleString();

  summaryValues[3].textContent =
    '₦' + total.toLocaleString();
}

// Call setup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
  const scroller = new WinesPanelScroller();

  new SidebarToggle();

  new TabNavigation(scroller);

  setupAddToCart();

  setupCartControls();

  console.log('🍷 Wine Shop initialized');
});
} else {
  setupAddToCart();
}

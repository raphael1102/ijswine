/* ═══════════════════════════════════════════════════════════
   WINE SHOP — script.js
═══════════════════════════════════════════════════════════ */

/* ── AUTO-SCROLL ── */
class WinesPanelScroller {
  constructor() {
    this.panel = document.querySelector('.wines-panel');
    this.isAutoScrolling = true;
    this.scrollSpeed = 0.05; // pixels per millisecond
    this.lastTime = Date.now();
    this.oneSetWidth = 0;
    this.ready = false;

    if (this.panel) {
      this.setupInfiniteScroll();
      this.setupScrollbar();
      this.observeCards();
      this.init();
    }
  }

  setupInfiniteScroll() {
    // originals only — ignore clones from a previous run
    const cards = Array.from(this.panel.querySelectorAll('.wine-card:not([data-clone])'));
    if (cards.length === 0) {
      this.ready = false;
      return;
    }

    // drop old clones before re-cloning (handles cards being re-rendered)
    this.panel.querySelectorAll('.wine-card[data-clone]').forEach(c => c.remove());

    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('data-clone', 'true');
      this.panel.appendChild(clone);
    });
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('data-clone', 'true');
      this.panel.appendChild(clone);
    });

    // measure once clones are actually laid out
    requestAnimationFrame(() => {
      this.oneSetWidth = this.panel.scrollWidth / 3;
      this.ready = this.oneSetWidth > 0;
    });
  }

  observeCards() {
    // re-run setup whenever wine cards get added/replaced (e.g. loaded async)
    let debounce;
    const observer = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const hasOriginals = this.panel.querySelectorAll('.wine-card:not([data-clone])').length > 0;
        if (hasOriginals) this.setupInfiniteScroll();
      }, 50);
    });
    observer.observe(this.panel, { childList: true });
  }

  setupScrollbar() {
    this.thumb = document.getElementById('thumb1');
    this.thumbWidth = 140;
    this.thumb1Pos = -this.thumbWidth;
  }

  init() {
    this.panel.addEventListener('mouseenter', () => this.pauseScroll());
    this.panel.addEventListener('mouseleave', () => this.resumeScroll());
    this.panel.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.panel.scrollLeft += e.deltaY;
      this.lastTime = Date.now();
    });
    // Handle touch scrolling on mobile
    let touchStartX = 0;
    this.panel.addEventListener('touchstart', (e) => {
      this.pauseScroll();
      touchStartX = e.touches[0].clientX;
    });
    this.panel.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touchDelta = touchStartX - e.touches[0].clientX;
        this.panel.scrollLeft += touchDelta * 0.5;
        touchStartX = e.touches[0].clientX;
      }
    });
    this.panel.addEventListener('touchend', () => this.resumeScroll());
    window.addEventListener('resize', () => this.setupInfiniteScroll());
    this.animate();
  }

  updateScrollbar() {
    if (!this.thumb) return; // Safety check if thumb doesn't exist
    const trackWidth = this.panel.offsetWidth;
    const maxScroll = this.panel.scrollWidth - this.panel.clientWidth;

    if (maxScroll > 0) {
      const scrollPercent = this.panel.scrollLeft / maxScroll;
      this.thumb1Pos = scrollPercent * (trackWidth - this.thumbWidth);
    }

    this.thumb.style.transform = `translateX(${this.thumb1Pos}px)`;
  }

  animate() {
    const now = Date.now();
    const deltaTime = now - this.lastTime;

    if (this.isAutoScrolling && this.ready && this.oneSetWidth > 0) {
      this.panel.scrollLeft += this.scrollSpeed * deltaTime;
      // seamless loop: subtract (not reset to 0) to avoid a visible jump
      if (this.panel.scrollLeft >= this.oneSetWidth) {
        this.panel.scrollLeft -= this.oneSetWidth;
      }
      this.updateScrollbar();
    }
    this.lastTime = now;
    requestAnimationFrame(() => this.animate());
  }

  pauseScroll() { this.isAutoScrolling = false; }
  resumeScroll() { this.isAutoScrolling = true; this.lastTime = Date.now(); }
  resetScroll() { this.lastTime = Date.now(); }
}

/* ── TAB NAVIGATION ── */
class TabNavigation {
  constructor(scroller = null) {
    this.navItems = document.querySelectorAll('.sidebar li');
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
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => this.openTab(e.target.textContent.trim().toLowerCase()));
    });

    if (this.cartBtn) {
      this.cartBtn.addEventListener('click', () => this.openTab('cart'));
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        document.querySelectorAll('.catalogue-item').forEach(item => {
          item.classList.toggle('hidden', filter !== 'all' && item.dataset.type !== filter);
        });
      });
    });
  }

  openTab(key) {
    if (!this.panels[key]) return;

    this.navItems.forEach(i => {
      i.classList.toggle('active', i.textContent.trim().toLowerCase() === key);
    });

    Object.values(this.panels).forEach(p => p && p.classList.remove('active'));
    this.panels[key].classList.add('active');

    const scrollbar = document.querySelector('.wines-scrollbar');
    if (scrollbar) scrollbar.style.display = key === 'main' ? 'block' : 'none';

    if (this.scroller) {
      key === 'main' ? this.scroller.resumeScroll() : this.scroller.pauseScroll();
    }

    if (window.innerWidth <= 768) {
      document.querySelector('.page-body').classList.remove('sidebar-open');
    }
  }
}

/* ── ADD TO SELECTION (wine cards) ── */
function setupAddToCart() {
  document.querySelectorAll('.wine-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.textContent = '✓ Added';
      btn.style.background = 'var(--gold)';
      setTimeout(() => {
        btn.textContent = 'Add to Selection';
        btn.style.background = '';
      }, 1500);
    });
  });
}

/* ── CART QUANTITY + REMOVE ── */
function setupCartControls() {
  // use event delegation so it works on dynamically added rows too
  const cartList = document.getElementById('cart-list');
  if (!cartList) return;

  cartList.addEventListener('click', (e) => {
    const row = e.target.closest('.cart-row');
    if (!row) return;

    // remove button
    if (e.target.classList.contains('cart-remove')) {
      row.remove();
      updateCartTotal();
      return;
    }

    // qty buttons
    if (e.target.classList.contains('cart-qty-btn')) {
      const qtyEl = row.querySelector('.cart-qty-num');
      const priceEl = row.querySelector('.cart-row-price');
      let qty = parseInt(qtyEl.textContent);

      // derive unit price from current price / qty
      const currentTotal = parseInt(priceEl.textContent.replace(/[₦,]/g, ''));
      const unitPrice = currentTotal / qty;

      if (e.target.textContent === '+') {
        qty++;
      } else if (e.target.textContent === '−' && qty > 1) {
        qty--;
      }

      qtyEl.textContent = qty;
      priceEl.textContent = '₦' + (unitPrice * qty).toLocaleString();
      updateCartTotal();
    }
  });
}

/* ── CART TOTAL ── */
function updateCartTotal() {
  let subtotal = 0;
  document.querySelectorAll('.cart-row-price').forEach(el => {
    subtotal += parseInt(el.textContent.replace(/[₦,]/g, ''));
  });

  const delivery = 5000;
  const total = subtotal + delivery;

  const vals = document.querySelectorAll('.cart-summary-value');
  if (vals[0]) vals[0].textContent = '₦' + subtotal.toLocaleString();
  if (vals[3]) vals[3].textContent = '₦' + total.toLocaleString();
}

/* ── CHECKOUT ── */
function setupCheckout() {
  const proceedBtn = document.querySelector('.cart-checkout-btn');
  const cartPanel = document.querySelector('.cart-panel');
  const checkoutPanel = document.getElementById('checkout-panel');
  const backBtn = document.getElementById('checkout-back');
  const copyBtn = document.getElementById('copy-acct');
  const copyConfirm = document.getElementById('copy-confirm');
  const confirmBtn = document.getElementById('checkout-confirm-btn');

  if (!proceedBtn || !checkoutPanel) return;

  proceedBtn.addEventListener('click', () => {
    populateCheckoutSummary();
    cartPanel.style.display = 'none';
    checkoutPanel.style.display = 'flex';
    checkoutPanel.style.flexDirection = 'column';
  });

  backBtn.addEventListener('click', () => {
    checkoutPanel.style.display = 'none';
    cartPanel.style.display = 'grid';
  });

  copyBtn.addEventListener('click', () => {
    const num = document.getElementById('acct-number').textContent;
    navigator.clipboard.writeText(num).then(() => {
      copyBtn.classList.add('copied');
      copyConfirm.classList.add('show');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyConfirm.classList.remove('show');
      }, 2000);
    });
  });

  confirmBtn.addEventListener('click', () => {
    const total = document.getElementById('checkout-total').textContent;
    const itemCount = document.getElementById('checkout-item-count').textContent;
    let orderLines = '';
    document.querySelectorAll('.checkout-order-row').forEach(row => {
      const name = row.querySelector('.checkout-order-name').textContent;
      const qty = row.querySelector('.checkout-order-qty').textContent;
      const price = row.querySelector('.checkout-order-price').textContent;
      orderLines += `• ${name} ${qty} — ${price}\n`;
    });

    const msg = encodeURIComponent(
      `Hello IJ's Wine Shop! 🍷\n\nI have completed my payment.\n\n` +
      `*Order Summary:*\n${orderLines}\n` +
      `*Total Paid:* ${total}\n*Items:* ${itemCount}\n\n` +
      `Please find my proof of payment attached. Kindly confirm and process my delivery.\n\nThank you!`
    );

    window.open(`https://wa.me/2349166828985?text=${msg}`, '_blank');
  });
}

function populateCheckoutSummary() {
  const orderList = document.getElementById('checkout-order-list');
  orderList.innerHTML = '';
  let subtotal = 0, totalItems = 0;

  document.querySelectorAll('.cart-row').forEach(row => {
    const name = row.querySelector('.cart-row-name')?.textContent || '';
    const qty = parseInt(row.querySelector('.cart-qty-num')?.textContent || '1');
    const priceRaw = row.querySelector('.cart-row-price')?.textContent || '₦0';
    const price = parseInt(priceRaw.replace(/[₦,]/g, ''));

    subtotal += price;
    totalItems += qty;

    const div = document.createElement('div');
    div.className = 'checkout-order-row';
    div.innerHTML = `
      <span class="checkout-order-name">${name}</span>
      <span class="checkout-order-qty">×${qty}</span>
      <span class="checkout-order-price">${priceRaw}</span>
    `;
    orderList.appendChild(div);
  });

  const total = subtotal + 5000;
  document.getElementById('checkout-item-count').textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  document.getElementById('checkout-subtotal').textContent = '₦' + subtotal.toLocaleString();
  document.getElementById('checkout-total').textContent = '₦' + total.toLocaleString();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sidebar-toggle');
  const pageBody = document.querySelector('.page-body');
  if (toggle && pageBody) {
    toggle.addEventListener('click', () => pageBody.classList.toggle('sidebar-open'));
    document.addEventListener('click', (e) => {
      if (
        pageBody.classList.contains('sidebar-open') &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('#sidebar-toggle')
      ) {
        pageBody.classList.remove('sidebar-open');
      }
    });
  }

  const scroller = new WinesPanelScroller();
  window._wineScroller = scroller; // expose so test.js can update card count
  new TabNavigation(scroller);
  setupCheckout();
});
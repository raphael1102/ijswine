import { supabase } from './supabase.js'

/* ═══════════════════════════════════════════════════════════
   RENDER HELPERS
═══════════════════════════════════════════════════════════ */

function formatPrice(price) {
  return '₦' + Number(price).toLocaleString();
}

function buildWineCard(product) {
  const div = document.createElement('div');
  div.className = 'wine-card';
  div.innerHTML = `
    <img
      src="${product.image_url || ''}"
      alt="${product.name} bottle"
      loading="lazy"
      style="width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0;transition:filter 0.5s ease,transform 0.5s ease;"
    />
    <div class="wine-card-footer">
      <p class="wine-name">${product.name}</p>
    </div>
    <div class="wine-card-overlay">
      <p class="wine-tag">${product.region} · ${product.vintage}</p>
      <p class="wine-name">${product.name}</p>
      <p class="wine-type">${product.style}</p>
      <div class="wine-meta">
        <span class="wine-badge">${product.abv}% ABV</span>
        <span class="wine-badge">${product.volume_ml}ml</span>
        <span class="wine-badge">${product.tag}</span>
      </div>
      <div class="wine-divider"></div>
      <p class="wine-price">${formatPrice(product.price)} <span>/ bottle</span></p>
    </div>
    <button class="wine-add" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-type="${product.style}" data-region="${product.region}">
      Add to Selection
    </button>
  `;
  return div;
}

function buildCatalogueItem(product) {
  const div = document.createElement('div');
  div.className = 'catalogue-item';
  div.dataset.type = product.type;
  div.innerHTML = `
    <div class="catalogue-item-img">
      ${product.image_url
        ? `<img src="${product.image_url}" alt="${product.name}" />`
        : `<div class="bottle-skeleton">
            <div class="skeleton-foil"></div>
            <div class="skeleton-neck"></div>
            <div class="skeleton-shoulder"></div>
            <div class="skeleton-body">
              <div class="skeleton-label">
                <div class="skeleton-line skeleton-line--short"></div>
                <div class="skeleton-line skeleton-line--long"></div>
                <div class="skeleton-line skeleton-line--mid"></div>
              </div>
            </div>
          </div>`
      }
    </div>

    <!-- always-visible footer gradient -->
    <div class="catalogue-item-footer">
      <div class="catalogue-footer-name">${product.name}</div>
      <div class="catalogue-footer-price">${formatPrice(product.price)}</div>
    </div>

    <!-- hover overlay -->
    <div class="catalogue-item-overlay">
      <div class="catalogue-item-info">
        <p class="catalogue-tag">${product.region} · ${product.vintage}</p>
        <p class="catalogue-name">${product.name}</p>
        <p class="catalogue-type">${product.style}</p>
      </div>
      <div class="catalogue-item-meta">
        <span class="wine-badge">${product.abv}% ABV</span>
        <span class="wine-badge">${product.varietal}</span>
      </div>
      <p class="catalogue-price">${formatPrice(product.price)}</p>
      <button class="catalogue-add"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        data-type="${product.style}"
        data-region="${product.region}"
        data-img="${product.image_url || ''}">
        Add to Selection
      </button>
    </div>
  `;
  return div;
}

/* ═══════════════════════════════════════════════════════════
   LOADING / ERROR STATES
═══════════════════════════════════════════════════════════ */

function showWinesPanelLoading(panel) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;width:100%;color:var(--ink-muted);font-family:var(--font-ui);font-size:12px;letter-spacing:0.1em;gap:10px;">
      <span style="display:inline-block;width:16px;height:16px;border:1.5px solid var(--gold);border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;"></span>
      Loading wines…
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `;
}

function showCatalogueLoading(grid) {
  grid.innerHTML = `
    <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;padding:60px 0;color:var(--ink-muted);font-family:var(--font-ui);font-size:12px;letter-spacing:0.1em;gap:10px;">
      <span style="display:inline-block;width:16px;height:16px;border:1.5px solid var(--gold);border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;"></span>
      Loading collection…
    </div>
  `;
}

function showError(container, message) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;width:100%;padding:40px;color:var(--ink-muted);font-family:var(--font-ui);font-size:12px;letter-spacing:0.08em;text-align:center;">
      ${message}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   FETCH + RENDER
═══════════════════════════════════════════════════════════ */

async function loadFeaturedWines() {
  const panel = document.querySelector('.wines-panel');
  if (!panel) return;

  showWinesPanelLoading(panel);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  if (error) {
    showError(panel, 'Could not load wines. Please refresh.');
    console.error('Featured wines error:', error);
    return;
  }

  if (!data || data.length === 0) {
    showError(panel, 'No featured wines available right now.');
    return;
  }

  panel.innerHTML = '';

  // build cards × 3 for infinite scroll (matches WinesPanelScroller clone logic)
  const allCards = [...data, ...data, ...data];
  allCards.forEach(product => panel.appendChild(buildWineCard(product)));

  // wire up "Add to Selection" buttons
  panel.querySelectorAll('.wine-add').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        type: btn.dataset.type,
        region: btn.dataset.region,
        image_url: btn.dataset.img || '',
      });
      btn.textContent = '✓ Added';
      btn.style.background = 'var(--gold)';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color = 'var(--cream)';
      setTimeout(() => {
        btn.textContent = 'Add to Selection';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1500);
    });
  });

  // re-initialise the auto-scroller now that cards exist
  if (window._wineScroller) {
    window._wineScroller.originalCardsCount = data.length;
    window._wineScroller.cardWidth = panel.querySelector('.wine-card')?.offsetWidth || 260;
  }
}

async function loadCatalogue() {
  const grid = document.querySelector('.catalogue-grid');
  if (!grid) return;

  showCatalogueLoading(grid);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('type')
    .order('name');

  if (error) {
    showError(grid, 'Could not load collection. Please refresh.');
    console.error('Catalogue error:', error);
    return;
  }

  if (!data || data.length === 0) {
    showError(grid, 'No products available right now.');
    return;
  }

  grid.innerHTML = '';
  data.forEach(product => grid.appendChild(buildCatalogueItem(product)));

  // wire up catalogue add buttons
  grid.querySelectorAll('.catalogue-add').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        type: btn.dataset.type,
        region: btn.dataset.region,
        image_url: btn.dataset.img || '',
      });
      btn.textContent = '✓';
      btn.style.background = 'var(--gold)';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color = 'var(--cream)';
      setTimeout(() => {
        btn.textContent = 'Add';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1500);
    });
  });

  // re-apply active filter
  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter && activeFilter.dataset.filter !== 'all') {
    const filter = activeFilter.dataset.filter;
    grid.querySelectorAll('.catalogue-item').forEach(item => {
      item.classList.toggle('hidden', item.dataset.type !== filter);
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   CART — in-memory store
═══════════════════════════════════════════════════════════ */

const cart = []; // { id, name, price, qty, type, region, image_url }

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  updateCartBadge();
}

function removeFromCart(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx !== -1) cart.splice(idx, 1);
  renderCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function renderCart() {
  const list = document.getElementById('cart-list');
  const countLabel = document.getElementById('cart-count-label');
  if (!list) return;

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  if (countLabel) countLabel.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🍷</div>
        <p class="cart-empty-text">Your selection is empty.<br>Browse our wines to get started.</p>
      </div>
    `;
    updateCartSummary(0);
    return;
  }

  list.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="cart-row-img" style="overflow:hidden;border-radius:2px;">
        ${item.image_url
          ? `<img src="${item.image_url}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" />`
          : `<div class="bottle-skeleton" style="width:24px;height:44px;">
              <div class="skeleton-foil" style="width:12px;height:7px;"></div>
              <div class="skeleton-neck" style="width:9px;height:12px;"></div>
              <div class="skeleton-shoulder" style="width:18px;height:10px;"></div>
              <div class="skeleton-body" style="width:26px;"></div>
            </div>`
        }
      </div>
      <div class="cart-row-info">
        <p class="cart-row-name">${item.name}</p>
        <p class="cart-row-type">${item.type} · ${item.region}</p>
      </div>
      <div class="cart-row-qty">
        <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
        <span class="cart-qty-num">${item.qty}</span>
        <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
      </div>
      <p class="cart-row-price">${formatPrice(item.price * item.qty)}</p>
      <button class="cart-remove" data-id="${item.id}">×</button>
    `;
    list.appendChild(row);
  });

  // event delegation on the list
  list.addEventListener('click', handleCartClick, { once: true });

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  updateCartSummary(subtotal);
}

function handleCartClick(e) {
  // re-attach after each render since we use { once: true }
  const list = document.getElementById('cart-list');

  if (e.target.classList.contains('cart-remove')) {
    removeFromCart(e.target.dataset.id);
    return;
  }
  if (e.target.classList.contains('cart-qty-btn')) {
    changeQty(e.target.dataset.id, Number(e.target.dataset.delta));
    return;
  }

  // re-attach for next click
  if (list) list.addEventListener('click', handleCartClick, { once: true });
}

function updateCartSummary(subtotal) {
  const delivery = subtotal > 0 ? 5000 : 0;
  const total = subtotal + delivery;
  const vals = document.querySelectorAll('.cart-summary-value');
  if (vals[0]) vals[0].textContent = formatPrice(subtotal);
  if (vals[3]) vals[3].textContent = formatPrice(total);
}

/* ═══════════════════════════════════════════════════════════
   CHECKOUT SUMMARY (from in-memory cart)
═══════════════════════════════════════════════════════════ */

function populateCheckoutSummary() {
  const orderList = document.getElementById('checkout-order-list');
  if (!orderList) return;
  orderList.innerHTML = '';

  let subtotal = 0, totalItems = 0;

  cart.forEach(item => {
    const rowTotal = item.price * item.qty;
    subtotal += rowTotal;
    totalItems += item.qty;

    const div = document.createElement('div');
    div.className = 'checkout-order-row';
    div.innerHTML = `
      <span class="checkout-order-name">${item.name}</span>
      <span class="checkout-order-qty">×${item.qty}</span>
      <span class="checkout-order-price">${formatPrice(rowTotal)}</span>
    `;
    orderList.appendChild(div);
  });

  const total = subtotal + 5000;
  const el = id => document.getElementById(id);
  if (el('checkout-item-count')) el('checkout-item-count').textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  if (el('checkout-subtotal')) el('checkout-subtotal').textContent = formatPrice(subtotal);
  if (el('checkout-total')) el('checkout-total').textContent = formatPrice(total);
}

/* ═══════════════════════════════════════════════════════════
   EXPOSE globally so script.js setupCheckout() can call it
═══════════════════════════════════════════════════════════ */
window.populateCheckoutSummary = populateCheckoutSummary;
window.cartStore = { cart, addToCart, removeFromCart, changeQty };

/* ═══════════════════════════════════════════════════════════
   INIT — load on tab open, not just DOMContentLoaded
   (catalogue is only shown when the Wines tab is clicked)
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // load featured wines immediately (main tab is visible on load)
  loadFeaturedWines();

  // load catalogue when Wines tab is first opened
  let catalogueLoaded = false;
  document.querySelectorAll('.sidebar li').forEach(li => {
    li.addEventListener('click', () => {
      if (li.textContent.trim().toLowerCase() === 'wines' && !catalogueLoaded) {
        catalogueLoaded = true;
        loadCatalogue();
      }
    });
  });

  // also trigger if someone lands directly on wines tab somehow
  const winesPanel = document.getElementById('tab-wines');
  if (winesPanel?.classList.contains('active') && !catalogueLoaded) {
    catalogueLoaded = true;
    loadCatalogue();
  }
});

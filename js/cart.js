const cart = {};


/* =========================================================
   HELPERS
========================================================= */

function fmtRupiah(value) {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

function keyFor(itemId, variantKey) {
  return `${itemId}__${variantKey}`;
}

function findVariant(itemId, variantKey) {
  const item = MENU.find((m) => m.id === itemId);

  if (!item) {
    return { item: null, variant: null };
  }

  return {
    item,
    variant: item.variants.find((v) => v.key === variantKey) || null,
  };
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   MENU
========================================================= */

function renderMenu() {
  const list = document.getElementById("menuList");

  if (!list) return;

  list.innerHTML = "";

  MENU.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item-card";

    const photo = document.createElement("div");
    photo.className = "item-photo";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.loading = "lazy";

    img.onerror = () => {
      img.style.display = "none";
      photo.style.background =
        "linear-gradient(135deg, #f5d4dc, #ead8b6)";
    };

    photo.appendChild(img);

    const body = document.createElement("div");
    body.className = "item-body";

    const name = document.createElement("h3");
    name.className = "item-name";
    name.textContent = item.name;

    const desc = document.createElement("p");
    desc.className = "item-desc";
    desc.textContent = item.description;

    const variantList = document.createElement("div");
    variantList.className = "variant-list";

    item.variants.forEach((variant) => {
      const row = document.createElement("div");
      row.className = "variant-row";

      const meta = document.createElement("div");
      meta.className = "variant-meta";

      const label = document.createElement("div");
      label.className = "variant-label";
      label.textContent = variant.label;

      const price = document.createElement("div");
      price.className = "variant-price";
      price.textContent = `Porsi • ${fmtRupiah(variant.price)}`;

      meta.append(label, price);

      const stepper = document.createElement("div");
      stepper.className = "stepper";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.textContent = "−";

      const qty = document.createElement("span");
      qty.className = "qty";
      qty.textContent = "0";
      qty.setAttribute("aria-live", "polite");

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "add";
      addBtn.textContent = "+";

      const key = keyFor(item.id, variant.key);

      function refreshQty() {
        const value = cart[key] || 0;

        qty.textContent = value;
        minusBtn.style.visibility = value > 0 ? "visible" : "hidden";
        qty.style.visibility = value > 0 ? "visible" : "hidden";
      }

      addBtn.addEventListener("click", () => {
        cart[key] = (cart[key] || 0) + 1;

        refreshQty();
        updateCartBar();

        addBtn.classList.remove("cart-bump");
        void addBtn.offsetWidth;
        addBtn.classList.add("cart-bump");
      });

      minusBtn.addEventListener("click", () => {
        cart[key] = Math.max(0, (cart[key] || 0) - 1);

        if (cart[key] === 0) {
          delete cart[key];
        }

        refreshQty();
        updateCartBar();
      });

      refreshQty();

      stepper.append(minusBtn, qty, addBtn);
      row.append(meta, stepper);
      variantList.appendChild(row);
    });

    body.append(name, desc, variantList);
    card.append(photo, body);
    list.appendChild(card);
  });
}


/* =========================================================
   CART SUMMARY
========================================================= */

function getCartSummary() {
  let totalQty = 0;
  let totalPrice = 0;
  const lines = [];

  Object.entries(cart).forEach(([key, qty]) => {
    const [itemId, variantKey] = key.split("__");
    const { item, variant } = findVariant(itemId, variantKey);

    if (!item || !variant || qty <= 0) return;

    const subtotal = qty * variant.price;

    totalQty += qty;
    totalPrice += subtotal;

    lines.push({
      item,
      variant,
      qty,
      subtotal,
    });
  });

  return {
    totalQty,
    totalPrice,
    lines,
  };
}


/* =========================================================
   CART BAR
========================================================= */

function updateCartBar() {
  const bar = document.getElementById("cartbar");
  const count = document.getElementById("cartCount");
  const total = document.getElementById("cartTotal");

  if (!bar || !count || !total) return;

  const { totalQty, totalPrice } = getCartSummary();

  if (totalQty > 0) {
    count.textContent = `${totalQty} item`;
    total.textContent = fmtRupiah(totalPrice);
    bar.classList.add("show");
  } else {
    bar.classList.remove("show");
  }
}


/* =========================================================
   CHECKOUT DATA
========================================================= */

function getCheckoutData() {
  return {
    name:
      document.getElementById("checkoutName")?.value.trim() || "",

    method:
      document.querySelector(
        'input[name="deliveryMethod"]:checked'
      )?.value || "",

    address:
      document.getElementById("checkoutAddress")?.value.trim() || "",

    note:
      document.getElementById("checkoutNote")?.value.trim() || "",
  };
}


/* =========================================================
   CHECKOUT FORM
========================================================= */

function renderCheckoutForm() {
  const body = document.getElementById("sheetBody");

  if (!body) return;

  const summary = getCartSummary();

  if (!summary.lines.length) {
    body.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Keranjang masih kosong</h3>
        <p>Silakan pilih menu terlebih dahulu.</p>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div class="checkout-wrapper">

      <div class="checkout-section">

        <div class="checkout-section-title">
          <span class="checkout-number">1</span>
          <div>
            <strong>Pesanan</strong>
            <small>Periksa menu yang kamu pilih</small>
          </div>
        </div>

        <div class="checkout-items">
          ${summary.lines.map((line) => `
            <div class="checkout-item">

              <div class="checkout-item-info">
                <strong>${escapeHTML(line.item.name)}</strong>

                <span>
                  ${escapeHTML(line.variant.label)}
                  × ${line.qty}
                </span>
              </div>

              <strong>
                ${fmtRupiah(line.subtotal)}
              </strong>

            </div>
          `).join("")}
        </div>

        <div class="checkout-total">
          <span>Total</span>
          <strong>${fmtRupiah(summary.totalPrice)}</strong>
        </div>

      </div>


      <div class="checkout-section">

        <div class="checkout-section-title">
          <span class="checkout-number">2</span>

          <div>
            <strong>Data Pemesan</strong>
            <small>Masukkan nama kamu</small>
          </div>
        </div>

        <label class="checkout-label" for="checkoutName">
          Nama
        </label>

        <input
          id="checkoutName"
          class="checkout-input"
          type="text"
          placeholder="Contoh: Fida"
          autocomplete="name"
        >

      </div>


      <div class="checkout-section">

        <div class="checkout-section-title">
          <span class="checkout-number">3</span>

          <div>
            <strong>Pengambilan Pesanan</strong>
            <small>Pilih diantar atau ambil sendiri</small>
          </div>
        </div>

        <div class="delivery-options">

          <label class="delivery-option">

            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
            >

            <div class="delivery-option-content">

              <div class="delivery-icon">
                🚚
              </div>

              <div>
                <strong>Diantar</strong>
                <span>Pesanan dikirim ke lokasi kamu</span>
              </div>

            </div>

          </label>


          <label class="delivery-option">

            <input
              type="radio"
              name="deliveryMethod"
              value="pickup"
            >

            <div class="delivery-option-content">

              <div class="delivery-icon">
                🛍️
              </div>

              <div>
                <strong>Ambil Sendiri</strong>
                <span>Ambil pesanan langsung</span>
              </div>

            </div>

          </label>

        </div>

      </div>


      <div
        class="checkout-section checkout-address-section"
        id="checkoutAddressSection"
        hidden
      >

        <div class="checkout-section-title">
          <span class="checkout-number">4</span>

          <div>
            <strong>Lokasi Pengantaran</strong>
            <small>Alamat atau lokasi Google Maps</small>
          </div>
        </div>

        <label
          class="checkout-label"
          for="checkoutAddress"
        >
          Alamat / Link Google Maps
        </label>

        <textarea
          id="checkoutAddress"
          class="checkout-input checkout-textarea"
          rows="4"
          placeholder="Masukkan alamat atau paste link Google Maps"
        ></textarea>

        <button
          type="button"
          class="location-btn"
          id="useLocationBtn"
        >
          📍 Gunakan lokasi saya
        </button>

        <div
          class="location-status"
          id="locationStatus"
          aria-live="polite"
        ></div>

        <p class="location-help">
          Kamu juga bisa paste link lokasi Google Maps secara langsung.
        </p>

      </div>


      <div class="checkout-section">

        <div class="checkout-section-title">
          <span class="checkout-number">5</span>

          <div>
            <strong>Catatan</strong>
            <small>Opsional</small>
          </div>
        </div>

        <textarea
          id="checkoutNote"
          class="checkout-input checkout-textarea"
          rows="3"
          placeholder="Contoh: tidak terlalu pedas, sambal dipisah, dll."
        ></textarea>

      </div>


      <button
        type="button"
        class="checkout-submit"
        id="checkoutSubmitBtn"
      >
        <span>Konfirmasi Pesanan</span>
        <span>→</span>
      </button>

      <p class="checkout-secure-note">
        Setelah dikonfirmasi, pesanan akan dibuka melalui WhatsApp.
      </p>

    </div>
  `;

  setupCheckoutEvents();
}


/* =========================================================
   CHECKOUT EVENTS
========================================================= */

function setupCheckoutEvents() {
  document
    .querySelectorAll('input[name="deliveryMethod"]')
    .forEach((input) => {

      input.addEventListener("change", () => {
        const section = document.getElementById(
          "checkoutAddressSection"
        );

        if (!section) return;

        section.hidden = input.value !== "delivery";
      });

    });


  document
    .getElementById("useLocationBtn")
    ?.addEventListener(
      "click",
      detectUserLocation
    );


  document
    .getElementById("checkoutSubmitBtn")
    ?.addEventListener(
      "click",
      checkoutWhatsApp
    );
}


/* =========================================================
   GPS / GOOGLE MAPS
========================================================= */

function detectUserLocation() {
  const address = document.getElementById("checkoutAddress");
  const status = document.getElementById("locationStatus");
  const button = document.getElementById("useLocationBtn");

  if (!navigator.geolocation) {
    status.textContent =
      "Browser kamu tidak mendukung GPS.";
    status.className =
      "location-status error";
    return;
  }

  button.disabled = true;
  button.textContent = "⏳ Mendeteksi lokasi...";

  status.textContent =
    "Meminta izin lokasi dari browser...";
  status.className =
    "location-status";

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;

      const mapsUrl =
        `https://www.google.com/maps?q=${latitude},${longitude}`;

      address.value = mapsUrl;

      status.innerHTML =
        "✓ Lokasi berhasil dideteksi.";

      status.className =
        "location-status success";

      button.disabled = false;
      button.textContent =
        "📍 Lokasi berhasil digunakan";
    },

    (error) => {
      const messages = {
        1: "Izin lokasi ditolak. Izinkan akses lokasi di browser.",
        2: "Lokasi tidak tersedia. Pastikan GPS aktif.",
        3: "Deteksi lokasi terlalu lama. Silakan coba lagi.",
      };

      status.textContent =
        messages[error.code] ||
        "Lokasi tidak dapat dideteksi.";

      status.className =
        "location-status error";

      button.disabled = false;
      button.textContent =
        "📍 Gunakan lokasi saya";
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
}


/* =========================================================
   WHATSAPP MESSAGE
========================================================= */

function buildWhatsAppMessage() {
  const checkout = getCheckoutData();
  const summary = getCartSummary();

  let message =
    "Halo Kedaii Fidaa 👋\n\n";

  message +=
    "Saya mau pesan:\n";

  summary.lines.forEach((line) => {
    message +=
      `• ${line.item.name} (${line.variant.label}) x${line.qty} = ${fmtRupiah(line.subtotal)}\n`;
  });

  message +=
    `\nTotal: ${fmtRupiah(summary.totalPrice)}\n`;

  message +=
    `Nama: ${checkout.name}\n`;

  if (checkout.method === "delivery") {
    message +=
      "Metode: Diantar 🚚\n";

    message +=
      `Lokasi: ${checkout.address}\n`;
  } else {
    message +=
      "Metode: Ambil Sendiri 🛍️\n";
  }

  if (checkout.note) {
    message +=
      `Catatan: ${checkout.note}\n`;
  }

  message +=
    "\nMohon dikonfirmasi ya. Terima kasih 🙏";

  return message;
}


/* =========================================================
   CHECKOUT → WHATSAPP
========================================================= */

function checkoutWhatsApp() {
  const checkout = getCheckoutData();
  const summary = getCartSummary();

  if (!summary.lines.length) {
    alert(
      "Keranjang masih kosong. Silakan pilih makanan terlebih dahulu."
    );
    return;
  }

  if (!checkout.name) {
    alert("Silakan masukkan nama terlebih dahulu.");

    document
      .getElementById("checkoutName")
      ?.focus();

    return;
  }

  if (!checkout.method) {
    alert(
      "Silakan pilih Diantar atau Ambil Sendiri."
    );
    return;
  }

  if (
    checkout.method === "delivery" &&
    !checkout.address
  ) {
    alert(
      "Silakan masukkan alamat atau gunakan lokasi GPS."
    );

    document
      .getElementById("checkoutAddress")
      ?.focus();

    return;
  }

  const message =
    buildWhatsAppMessage();

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   CART SHEET
========================================================= */

function openCartSheet() {
  const sheet = document.getElementById("cartSheet");
  const backdrop = document.getElementById("sheetBackdrop");

  if (!sheet || !backdrop) return;

  renderCheckoutForm();

  sheet.classList.add("open");
  backdrop.classList.add("open");

  document.body.classList.add("sheet-open");
}

function closeCartSheet() {
  const sheet = document.getElementById("cartSheet");
  const backdrop = document.getElementById("sheetBackdrop");

  if (!sheet || !backdrop) return;

  sheet.classList.remove("open");
  backdrop.classList.remove("open");

  document.body.classList.remove("sheet-open");
}
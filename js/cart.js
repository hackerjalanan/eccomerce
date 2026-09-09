const cart = {};

  function fmtRupiah(n){
    return "Rp " + n.toLocaleString("id-ID");
  }

  function keyFor(itemId, variantKey){
    return itemId + "__" + variantKey;
  }

  function findVariant(itemId, variantKey){
    const item = MENU.find(m => m.id === itemId);
    if(!item) return { item:null, variant:null };
    const variant = item.variants.find(v => v.key === variantKey);
    return { item, variant };
  }

  function renderMenu(){
    const list = document.getElementById("menuList");
    list.innerHTML = "";

    MENU.forEach(item => {
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

      item.variants.forEach(v => {
        const row = document.createElement("div");
        row.className = "variant-row";

        const meta = document.createElement("div");
        meta.className = "variant-meta";

        const label = document.createElement("div");
        label.className = "variant-label";
        label.textContent = v.label;

        const price = document.createElement("div");
        price.className = "variant-price";
        price.textContent = "Porsi • " + fmtRupiah(v.price);

        meta.append(label, price);

        const stepper = document.createElement("div");
        stepper.className = "stepper";

        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.textContent = "−";
        minusBtn.setAttribute("aria-label", "Kurangi " + item.name + " " + v.label);

        const qtySpan = document.createElement("span");
        qtySpan.className = "qty";
        qtySpan.textContent = "0";
        qtySpan.setAttribute("aria-live", "polite");

        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "add";
        addBtn.textContent = "+";
        addBtn.setAttribute("aria-label", "Tambah " + item.name + " " + v.label);

        const k = keyFor(item.id, v.key);

        function refreshQty(){
          const q = cart[k] || 0;
          qtySpan.textContent = q;
          minusBtn.style.visibility = q > 0 ? "visible" : "hidden";
          qtySpan.style.visibility = q > 0 ? "visible" : "hidden";
        }

        refreshQty();

        addBtn.addEventListener("click", () => {
          cart[k] = (cart[k] || 0) + 1;
          refreshQty();
          updateCartBar();
          addBtn.classList.remove("cart-bump");
          void addBtn.offsetWidth;
          addBtn.classList.add("cart-bump");
        });

        minusBtn.addEventListener("click", () => {
          cart[k] = Math.max(0, (cart[k] || 0) - 1);
          if(cart[k] === 0) delete cart[k];
          refreshQty();
          updateCartBar();
        });

        stepper.append(minusBtn, qtySpan, addBtn);
        row.append(meta, stepper);
        variantList.appendChild(row);
      });

      body.append(name, desc, variantList);
      card.append(photo, body);
      list.appendChild(card);
    });
  }

  function getCartSummary(){
    let totalQty = 0;
    let totalPrice = 0;
    const lines = [];

    Object.entries(cart).forEach(([k, qty]) => {
      const [itemId, variantKey] = k.split("__");
      const { item, variant } = findVariant(itemId, variantKey);
      if(!item || !variant || qty <= 0) return;

      const subtotal = qty * variant.price;
      totalQty += qty;
      totalPrice += subtotal;
      lines.push({ item, variant, qty, subtotal });
    });

    return { totalQty, totalPrice, lines };
  }

  function updateCartBar(){
    const bar = document.getElementById("cartbar");
    const countEl = document.getElementById("cartCount");
    const totalEl = document.getElementById("cartTotal");

    const { totalQty, totalPrice } = getCartSummary();

    if(totalQty > 0){
      countEl.textContent = totalQty + (totalQty === 1 ? " item" : " item");
      totalEl.textContent = fmtRupiah(totalPrice);
      bar.classList.add("show");
    }else{
      bar.classList.remove("show");
    }

    renderCartSheet();
  }

  /* =========================================================
     CART SHEET / EMPTY STATE
  ========================================================= */
  function renderCartSheet(){
    const body = document.getElementById("sheetBody");
    const { totalQty, totalPrice, lines } = getCartSummary();

    if(lines.length === 0){
      body.innerHTML = `
        <div class="sheet-empty">
          <div class="empty-icon">🛍</div>
          <strong>Keranjang masih kosong</strong>
          <p>Pilih menu favoritmu dulu, lalu atur jumlah porsinya di halaman menu.</p>
          <button class="btn btn-primary" type="button" id="emptyMenuBtn" style="margin-top:16px;background:var(--maroon);color:var(--cream);">
            Lihat Menu
          </button>
        </div>
      `;
      document.getElementById("emptyMenuBtn").addEventListener("click", () => {
        closeCartSheet();
        document.getElementById("menu").scrollIntoView({behavior:"smooth"});
      });
      return;
    }

    body.innerHTML = `
      <div>
        ${lines.map(line => `
          <div class="cart-line">
            <div class="cart-line-info">
              <strong>${escapeHTML(line.item.name)}</strong>
              <span>${escapeHTML(line.variant.label)} × ${line.qty} • ${fmtRupiah(line.variant.price)}</span>
            </div>
            <div class="cart-line-total">${fmtRupiah(line.subtotal)}</div>
          </div>
        `).join("")}
      </div>

      <div class="sheet-summary">
        <span>Total ${totalQty} item</span>
        <strong>${fmtRupiah(totalPrice)}</strong>
      </div>

      <button class="sheet-order" id="sheetOrderBtn" type="button">
        Lanjut Pesan via WhatsApp →
      </button>
    `;

    document.getElementById("sheetOrderBtn").addEventListener("click", checkoutWhatsApp);
  }

  function escapeHTML(value){
    return String(value)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function openCartSheet(){
    document.getElementById("sheetBackdrop").classList.add("open");
    document.getElementById("cartSheet").classList.add("open");
    document.body.style.overflow = "hidden";
    renderCartSheet();
  }

  function closeCartSheet(){
    document.getElementById("sheetBackdrop").classList.remove("open");
    document.getElementById("cartSheet").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* =========================================================
     WHATSAPP CHECKOUT
  ========================================================= */
  function buildWhatsAppMessage(){
    const { lines, totalPrice } = getCartSummary();

    let linesText = [
      "Halo Kedaii Fidaa, saya mau pesan:",
      ""
    ];

    lines.forEach(line => {
      linesText.push(
        `- ${line.item.name} (${line.variant.label}) x${line.qty} = ${fmtRupiah(line.subtotal)}`
      );
    });

    linesText.push("");
    linesText.push(`Total: ${fmtRupiah(totalPrice)}`);
    linesText.push("");
    linesText.push("Mohon info untuk konfirmasi pesanan ini ya, terima kasih 🙏");

    return linesText.join("\n");
  }

  function checkoutWhatsApp(){
    if(Object.keys(cart).length === 0){
      openCartSheet();
      return;
    }

    const msg = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

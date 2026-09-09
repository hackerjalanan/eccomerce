/* =========================================================
     EVENTS
  ========================================================= */
  document.getElementById("orderBtn").addEventListener("click", checkoutWhatsApp);
  document.getElementById("cartInfoBtn").addEventListener("click", openCartSheet);
  document.getElementById("sheetClose").addEventListener("click", closeCartSheet);
  document.getElementById("sheetBackdrop").addEventListener("click", closeCartSheet);

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") closeCartSheet();
  });

  /* =========================================================
     INIT
  ========================================================= */
  document.getElementById("year").textContent = new Date().getFullYear();

  // Delay kecil agar loading state terlihat halus, lalu menu dirender.
  window.setTimeout(() => {
    renderMenu();
    updateCartBar();
  }, 280);

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     EVENTS
  ========================================================= */

  document
    .getElementById("orderBtn")
    ?.addEventListener("click", openCartSheet);

  document
    .getElementById("cartInfoBtn")
    ?.addEventListener("click", openCartSheet);

  document
    .getElementById("sheetClose")
    ?.addEventListener("click", closeCartSheet);

  document
    .getElementById("sheetBackdrop")
    ?.addEventListener("click", closeCartSheet);


  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCartSheet();
    }
  });


  /* =========================================================
     INIT
  ========================================================= */

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /*
   * Delay kecil agar loading state terlihat halus.
   */

  setTimeout(() => {
    renderMenu();
    updateCartBar();
  }, 280);

});
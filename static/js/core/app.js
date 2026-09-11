(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  const sync = () => buttons.forEach(button => {
    button.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
  });
  buttons.forEach(button => button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("ibtikar-theme", root.dataset.theme); } catch (_) {}
    sync();
  }));
  window.addEventListener("storage", event => {
    if (event.key === "ibtikar-theme" && ["light", "dark"].includes(event.newValue)) {
      root.dataset.theme = event.newValue;
      sync();
    }
  });
  sync();
})();

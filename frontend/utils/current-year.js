document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("current-year");
  if (el) el.textContent = new Date().getFullYear();
});

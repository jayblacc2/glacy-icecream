function escapeHtml(str) {
  if (str == null) return "";
  const s = String(str);
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return s.replace(/[&<>"']/g, (m) => map[m]);
}

function escapeAttr(str) {
  if (str == null) return "";
  return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export { escapeHtml, escapeAttr };

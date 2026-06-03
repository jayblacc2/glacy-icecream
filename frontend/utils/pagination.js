/**
 * Render pagination controls.
 *
 * @param {object} pg - Pagination object from API
 * @param {string} containerId - DOM element ID to render into
 * @param {function} onPage - Callback(page) when a page is clicked
 */
export function renderPagination(pg, containerId, onPage) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!pg || pg.totalPages <= 1) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  const current = pg.currentPage ?? pg.page ?? 1;
  const total = pg.totalPages ?? pg.pages ?? 1;

  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = [];
  if (start > 1) pages.push(1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  if (end < total) pages.push(total);

  let html = '<div class="pagination-wrap">';

  html += `<button class="page-btn page-nav" data-p="${current - 1}" ${current <= 1 ? 'disabled' : ''}>
    <i class="fa-solid fa-chevron-left"></i>
  </button>`;

  html += `<span class="page-info">${current} / ${total}</span>`;

  pages.forEach(p => {
    if (p === 'ellipsis') {
      html += '<span class="page-ellipsis">…</span>';
    } else {
      html += `<button class="page-btn${p === current ? ' active' : ''}" data-p="${p}">${p}</button>`;
    }
  });

  html += `<button class="page-btn page-nav" data-p="${current + 1}" ${current >= total ? 'disabled' : ''}>
    <i class="fa-solid fa-chevron-right"></i>
  </button>`;

  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.page-btn[data-p]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.p);
      if (p >= 1 && p <= total) onPage(p);
    });
  });
}

export function loading(message = "Loading...") {
  return `<div class="loading">
            <i class="fa-solid fa-spinner"></i>
            ${message}...
          </div>`;
}

/**
 * Generates HTML for an error message display
 * @param {string} title - The error title
 * @param {string} message - The error description
 * @param {string} icon - The Font Awesome icon class (default: fa-exclamation-triangle)
 * @returns {string} HTML string for the error message
 */
export function errorMessage(
  title = "Oops! Something went wrong",
  message = "An error occurred. Please try again later.",
  icon = "fa-exclamation-triangle"
) {
  return `<div class="error-message">
            <i class="fa-solid ${icon}"></i>
            <h2>${title}</h2>
            <p>${message}</p>
          </div>`;
}

/**
 * Generates HTML for an empty state message
 * @param {string} message - The empty state message
 * @returns {string} HTML string for the empty message
 */
export function emptyMessage(message = "No items available") {
  return `<div class="empty-message">${message}</div>`;
}

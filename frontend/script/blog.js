import { loading } from "../utils/loading.js";
import { errorMessage } from "../utils/error-message.js";
import { escapeHtml, escapeAttr } from "../utils/security.js";
import { debugLog, debugError } from "../utils/debug.js";

const API_URL = "/api/v1/posts";
const LIMIT = 20;

let blogs = [];
let selectedBlog = null;

// Initialize the page
async function init() {
  await loadBlogs();
}

// Load blogs from backend API
async function loadBlogs() {
  const blogGrid = document.getElementById("blog-grid");
  if (!blogGrid) {
    debugError("blog-grid not found");
    return;
  }
  blogGrid.innerHTML = loading("Loading delicious blog posts");

  try {
    const url = `${API_URL}?limit=${LIMIT}`;
    debugLog("Fetching:", url);

    const response = await fetch(url);
    debugLog("Response:", response.status);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    debugLog("API data:", data);

    if (!data.success) {
      showError("API Error", data.error || "Failed to load blog posts");
      return;
    }

    if (!data.data || data.data.length === 0) {
      debugLog("No blogs");
      showNoBlogs();
      return;
    }

    // Transform backend data to match our format
    blogs = data.data.map((post) => ({
      id: post._id,
      title: post.title,
      content: post.content,
      description: post.excerpt,
      published: post.publishedAt,
      updated: post.publishedAt,
      photo_url: post.featuredImage,
      category: "blog",
      author: {
        displayName: post.author || "Anonymous",
      },
    }));

    debugLog("Loaded blogs:", blogs.length);
    renderBlogs();
  } catch (error) {
    debugError("Error loading blogs:", error);
    showError(error);
  }
}

// Render blog cards
function renderBlogs() {
  const blogGrid = document.getElementById("blog-grid");
  blogGrid.innerHTML = "";

  blogs.forEach((blog) => {
    const card = createBlogCard(blog);
    blogGrid.appendChild(card);
  });
}

// Create blog card element
function createBlogCard(blog) {
  const card = document.createElement("div");
  card.className = "blog-card";

  // Get image from API or use default
  const imageUrl = blog.photo_url || extractImage(blog);

  // Format date
  const date = formatDate(blog.published);

  // Show truncated content in card (full content in modal)
  const rawText = stripHTML(blog.content);
  const description = rawText.length > 150 ? rawText.substring(0, 150) + "..." : rawText;

  card.innerHTML = `
                <div class="blog-card-image">
                    <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(blog.title)}" loading="lazy" onerror="this.src='../images/img1.png'">
                    <span class="blog-date">${escapeHtml(date)}</span>
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${escapeHtml(blog.title)}</h3>
                    <p class="blog-card-description">${escapeHtml(description)}</p>
                    <div class="blog-card-footer">
                        <div class="blog-author">
                            <i class="fa-solid fa-user"></i>
                            <span>${escapeHtml(blog.author?.displayName || "Anonymous")}</span>
                        </div>
                        <div class="read-more">
                            Read More
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            `;

  card.addEventListener("click", () => openModal(blog));

  return card;
}

// Extract image from blog post
function extractImage(blog) {
  // Use photo_url from API if available
  if (blog.photo_url) {
    return blog.photo_url;
  }

  // Try to extract from content
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = blog.content?.match(imgRegex);
  if (match && match[1]) {
    return match[1];
  }

  // Use default images
  const defaultImages = [
    "../images/img1.png",
    "../images/img2.png",
    "../images/img3.png",
    "../images/img4.png",
  ];
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

// Strip HTML tags
function stripHTML(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// Open modal with blog details
function openModal(blog) {
  selectedBlog = blog;

  const imageUrl = blog.photo_url || extractImage(blog);
  const date = formatDate(blog.published);
  const formattedContent = formatContent(blog.content);

  const modalInnerContent = document.getElementById("modal-inner-content");
  modalInnerContent.innerHTML = `
    <div class="modal-header-image">
      <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(blog.title)}" onerror="this.src='../images/img1.png'">
    </div>
    <div class="modal-body">
      <div class="modal-header-content">
        <span class="modal-date">${escapeHtml(date)}</span>
        <h2 class="modal-title">${escapeHtml(blog.title)}</h2>
        <div class="modal-meta">
          <div class="modal-meta-item">
            <i class="fa-solid fa-user"></i>
            <span>${escapeHtml(blog.author?.displayName || "Anonymous")}</span>
          </div>
          <div class="modal-meta-item">
            <i class="fa-solid fa-clock"></i>
            <span>${estimateReadTime(blog.content)} min read</span>
          </div>
        </div>
      </div>

      <div class="modal-content-area">
        <p class="modal-excerpt">${escapeHtml(blog.description)}</p>
        <div class="modal-content-full">${formattedContent}</div>
      </div>

      <div class="modal-cta">
        <button class="btn-close-modal" id="btn-close-modal">
          Close
        </button>
      </div>
    </div>
  `;

  const closeBtn = document.getElementById("btn-close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  document.getElementById("modal-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

// Format content text into paragraphs
function formatContent(content) {
  if (!content) return "";
  const paragraphs = content.split(/\n\n|\n/).filter((p) => p.trim());
  if (paragraphs.length > 1) {
    return paragraphs.map((p) => `<p>${p.trim()}</p>`).join("");
  }
  return `<p>${content}</p>`;
}

// Close modal
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active");
  document.body.style.overflow = "auto";
  selectedBlog = null;
}

// Estimate reading time
function estimateReadTime(content) {
  const text = stripHTML(content);
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
}

// Show error message
function showError(error) {
  const blogGrid = document.getElementById("blog-grid");
  const errorDetails = `<p style="margin-top: 1rem;"><strong>Error:</strong> ${error.message}</p>`;
  const retryButton = `<button class="retry-btn" onclick="loadBlogs()">Try Again</button>`;
  blogGrid.innerHTML = errorMessage(
    "Oops! Something went wrong",
    `We couldn't load the blog posts. This might be due to network issues or the API being temporarily unavailable.${errorDetails}${retryButton}`,
  );
}

// Show no blogs message
function showNoBlogs() {
  const blogGrid = document.getElementById("blog-grid");
  const reloadButton = `<button onclick="loadBlogs()" style="margin-top: 1.5rem; padding: 1rem 2rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 1rem;">Reload</button>`;
  blogGrid.innerHTML = errorMessage(
    "No Blog Posts Found",
    `There are no blog posts available at the moment. Please check back later for fresh content!${reloadButton}`,
    "fa-inbox",
  );
}

// Event listeners
document.getElementById("modal-close").addEventListener("click", closeModal);

document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modal-overlay")) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("modal-overlay").classList.contains("active")
  ) {
    closeModal();
  }
});

// Initialize on page load
init();

// Expose for onclick handlers in error/empty state buttons
window.loadBlogs = loadBlogs;


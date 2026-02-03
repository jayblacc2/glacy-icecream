import { loading } from "../utils/loading.js";
import { errorMessage, emptyMessage } from "../utils/error-message.js";

const API_URL = "https://api.slingacademy.com/v1/sample-data/blog-posts";
const LIMIT = 20;

let blogs = [];
let selectedBlog = null;

// Initialize the page
async function init() {
  await loadBlogs();
}

// Load blogs from Sling Academy API
async function loadBlogs() {
  const blogGrid = document.getElementById("blog-grid");
  blogGrid.innerHTML = loading("Loading delicious blog posts");

  try {
    const url = `${API_URL}?limit=${LIMIT}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.blogs || data.blogs.length === 0) {
      showNoBlogs();
      return;
    }

    // Transform API data to match our format
    blogs = data.blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content_text || blog.description,
      description: blog.description,
      published: blog.created_at,
      updated: blog.updated_at,
      url: `https://slingacademy.com/article/${blog.id}`,
      author: {
        displayName: blog.user?.name || "Anonymous",
      },
      photo_url: blog.photo_url,
      category: blog.category,
    }));

    renderBlogs();
  } catch (error) {
    console.error("Error loading blogs:", error);
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

  // Use description or strip HTML from content
  const description = blog.description
    ? blog.description.substring(0, 150) + "..."
    : stripHTML(blog.content).substring(0, 150) + "...";

  card.innerHTML = `
                <div class="blog-card-image">
                    <img src="${imageUrl}" alt="${
                      blog.title
                    }" loading="lazy" onerror="this.src='../images/img1.png'">
                    <span class="blog-date">${date}</span>
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${blog.title}</h3>
                    <p class="blog-card-description">${description}</p>
                    <div class="blog-card-footer">
                        <div class="blog-author">
                            <i class="fa-solid fa-user"></i>
                            <span>${
                              blog.author?.displayName || "Anonymous"
                            }</span>
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
  const description = blog.description || stripHTML(blog.content);

  const modalInnerContent = document.getElementById("modal-inner-content");
  modalInnerContent.innerHTML = `
                <div class="modal-header-image">
                    <img src="${imageUrl}" alt="${
                      blog.title
                    }" onerror="this.src='../images/img1.png'">
                </div>
                <div class="modal-body">
                    <span class="modal-date">${date}</span>
                    <h2 class="modal-title">${blog.title}</h2>
                    <div class="modal-meta">
                        <div class="modal-meta-item">
                            <i class="fa-solid fa-user"></i>
                            <span>${
                              blog.author?.displayName || "Anonymous"
                            }</span>
                        </div>
                        <div class="modal-meta-item">
                            <i class="fa-solid fa-calendar"></i>
                            <span>${date}</span>
                        </div>
                        <div class="modal-meta-item">
                            <i class="fa-solid fa-clock"></i>
                            <span>${estimateReadTime(
                              blog.content,
                            )} min read</span>
                        </div>
                    </div>
                    <div class="modal-description">
                        ${description.substring(0, 500)}...
                    </div>
                    <div class="modal-cta">
                        <a href="${
                          blog.url
                        }" target="_blank" class="btn-primary" rel="noopener noreferrer">
                            <i class="fa-solid fa-external-link-alt"></i>
                            Read Full Article
                        </a>
                        <button class="btn-secondary" onclick="closeModal()">
                            Close
                        </button>
                    </div>
                </div>
            `;

  document.getElementById("modal-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
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

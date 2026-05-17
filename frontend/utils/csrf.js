let csrfToken = null;

async function fetchCsrfToken() {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch("/api/v1/csrf-token", { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      csrfToken = data.csrfToken;
      return csrfToken;
    }
  } catch (e) {
    console.warn("Failed to fetch CSRF token");
  }
  return null;
}

function getCsrfToken() {
  return csrfToken;
}

async function fetchWithCsrf(url, options = {}) {
  await fetchCsrfToken();
  const opts = {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      "x-csrf-token": csrfToken || "",
    },
  };
  const res = await fetch(url, opts);
  if (res.status === 403) {
    csrfToken = null;
    await fetchCsrfToken();
    const retryOpts = {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        "x-csrf-token": csrfToken || "",
      },
    };
    return fetch(url, retryOpts);
  }
  return res;
}

export { fetchCsrfToken, getCsrfToken, fetchWithCsrf };

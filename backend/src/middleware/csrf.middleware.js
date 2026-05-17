import crypto from "crypto";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    if (!req.cookies[CSRF_COOKIE_NAME]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });
    }
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token",
    });
  }

  next();
}

export function getCsrfToken(req, res) {
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60,
    });
  }
  res.status(200).json({
    success: true,
    csrfToken: req.cookies[CSRF_COOKIE_NAME],
  });
}

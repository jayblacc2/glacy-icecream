/**
 * Creates the login and signup forms as document fragments.
 *
 * @return {DocumentFragment} The document fragment containing the login and signup forms.
 */

export function createAuthForms() {
  const fragment = document.createDocumentFragment();

  const loginForm = document.createElement("form");
  loginForm.className = "login-form";

  const loginHeader = document.createElement("h3");
  loginHeader.textContent = "Sign In";
  loginForm.appendChild(loginHeader);

  const emailDiv = document.createElement("div");
  emailDiv.className = "form-control";
  const emailLabel = document.createElement("label");
  emailLabel.htmlFor = "email";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email";
  emailInput.placeholder = "Email";
  emailInput.className = "login-email";
  emailInput.required = true;
  emailLabel.appendChild(emailInput);
  emailDiv.appendChild(emailLabel);
  loginForm.appendChild(emailDiv);

  const passwordDiv = document.createElement("div");
  passwordDiv.className = "form-control";
  const passwordLabel = document.createElement("label");
  passwordLabel.htmlFor = "password";
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password";
  passwordInput.placeholder = "Password";
  passwordInput.className = "login-password";
  passwordInput.required = true;
  passwordLabel.appendChild(passwordInput);
  passwordDiv.appendChild(passwordLabel);
  loginForm.appendChild(passwordDiv);

  const loginBtnDiv = document.createElement("div");
  loginBtnDiv.className = "login-btn";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "login-submit";
  submitBtn.textContent = "Login";
  loginBtnDiv.appendChild(submitBtn);

  const forgotLink = document.createElement("a");
  forgotLink.href = "#";
  forgotLink.className = "forgot-password";
  forgotLink.textContent = "Forgot password?";
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof window.showToast === "function") {
      window.showToast("Password reset coming soon!", "success");
    }
  });
  loginBtnDiv.appendChild(forgotLink);

  const registerBtn = document.createElement("button");
  registerBtn.type = "button";
  registerBtn.className = "register-btn";
  registerBtn.id = "show-signup";
  registerBtn.textContent = "Register";
  loginBtnDiv.appendChild(registerBtn);

  loginForm.appendChild(loginBtnDiv);
  fragment.appendChild(loginForm);

  const signupForm = document.createElement("form");
  signupForm.className = "signup-form visually-hidden";

  const signupHeader = document.createElement("h3");
  signupHeader.textContent = "Create Account";
  signupForm.appendChild(signupHeader);

  const nameDiv = document.createElement("div");
  nameDiv.className = "form-control";
  const nameLabel = document.createElement("label");
  nameLabel.htmlFor = "signup-name";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = "signup-name";
  nameInput.placeholder = "Full Name";
  nameInput.className = "signup-name";
  nameInput.required = true;
  nameInput.minLength = 3;
  nameLabel.appendChild(nameInput);
  nameDiv.appendChild(nameLabel);
  signupForm.appendChild(nameDiv);

  // Signup email field
  const signupEmailDiv = document.createElement("div");
  signupEmailDiv.className = "form-control";
  const signupEmailLabel = document.createElement("label");
  signupEmailLabel.htmlFor = "signup-email";
  const signupEmailInput = document.createElement("input");
  signupEmailInput.type = "email";
  signupEmailInput.id = "signup-email";
  signupEmailInput.placeholder = "Email";
  signupEmailInput.className = "signup-email";
  signupEmailInput.required = true;
  signupEmailLabel.appendChild(signupEmailInput);
  signupEmailDiv.appendChild(signupEmailLabel);
  signupForm.appendChild(signupEmailDiv);

  // Signup password field
  const signupPasswordDiv = document.createElement("div");
  signupPasswordDiv.className = "form-control";
  const signupPasswordLabel = document.createElement("label");
  signupPasswordLabel.htmlFor = "signup-password";
  const signupPasswordInput = document.createElement("input");
  signupPasswordInput.type = "password";
  signupPasswordInput.id = "signup-password";
  signupPasswordInput.placeholder = "Password";
  signupPasswordInput.className = "signup-password";
  signupPasswordInput.required = true;
  signupPasswordInput.minLength = 8;
  signupPasswordLabel.appendChild(signupPasswordInput);
  signupPasswordDiv.appendChild(signupPasswordLabel);
  signupForm.appendChild(signupPasswordDiv);

  // Confirm password field
  const confirmDiv = document.createElement("div");
  confirmDiv.className = "form-control";
  const confirmLabel = document.createElement("label");
  confirmLabel.htmlFor = "confirm-password";
  const confirmInput = document.createElement("input");
  confirmInput.type = "password";
  confirmInput.id = "confirm-password";
  confirmInput.placeholder = "Confirm Password";
  confirmInput.className = "confirm-password";
  confirmInput.required = true;
  confirmLabel.appendChild(confirmInput);
  confirmDiv.appendChild(confirmLabel);
  signupForm.appendChild(confirmDiv);

  // Signup actions
  const signupBtnDiv = document.createElement("div");
  signupBtnDiv.className = "signup-btn";

  const signupSubmitBtn = document.createElement("button");
  signupSubmitBtn.type = "submit";
  signupSubmitBtn.className = "signup-submit";
  signupSubmitBtn.textContent = "Register";
  signupBtnDiv.appendChild(signupSubmitBtn);

  const loginSwitchBtn = document.createElement("button");
  loginSwitchBtn.type = "button";
  loginSwitchBtn.className = "login-btn";
  loginSwitchBtn.id = "show-login";
  loginSwitchBtn.textContent = "Login";
  signupBtnDiv.appendChild(loginSwitchBtn);

  signupForm.appendChild(signupBtnDiv);
  fragment.appendChild(signupForm);

  return fragment;
}

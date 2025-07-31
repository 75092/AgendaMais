
// auth.js

function getTokenPayload() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      logout();
      return null;
    }
    return payload;
  } catch (e) {
    logout();
    return null;
  }
}

function ensureAuthenticated(redirect = true) {
  const isLoginPage = window.location.pathname.endsWith("login.html");
  const payload = getTokenPayload();
  if (!payload && redirect && !isLoginPage) {
    window.location.href = "/login.html";
  }
  return payload;
}

function ensureRole(requiredRole, redirect = true) {
  const payload = getTokenPayload();
  if (!payload || payload.role !== requiredRole) {
    if (redirect) {
      alert("Acesso não autorizado.");
      window.location.href = "/index.html";
    }
    return false;
  }
  return true;
}

function showLogoutIfAuthenticated() {
  if (getTokenPayload()) {
    const btn = document.getElementById("logout-btn");
    if (btn) btn.style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

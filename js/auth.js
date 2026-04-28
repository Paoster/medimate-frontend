/* ──────────────────────────────────────────────
   auth.js  –  Authentication state management
   ────────────────────────────────────────────── */
(function () {
  'use strict';

  var TOKEN_KEY = 'medimate_token';
  var USER_KEY  = 'medimate_user';

  function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch (_) { return null; }
  }

  function getRole() {
    var u = getUser();
    return u ? u.role : null;
  }

  function isLoggedIn() {
    return !!getToken() && !!getUser();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.hash = '#/login';
  }

  window.MediMate = window.MediMate || {};
  window.MediMate.auth = { setAuth: setAuth, getToken: getToken, getUser: getUser, getRole: getRole, isLoggedIn: isLoggedIn, logout: logout };
})();

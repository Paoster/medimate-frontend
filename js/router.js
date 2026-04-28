/* ══════════════════════════════════════════════════════════
   router.js  –  Hash-based SPA Router
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var routes = {};

  function register(path, config) {
    routes[path] = config;
  }

  function navigate(path) {
    window.location.hash = '#' + path;
  }

  function getCurrentPath() {
    var hash = window.location.hash.slice(1) || '/';
    // Strip query params for route matching
    return hash.split('?')[0];
  }

  function handleRoute() {
    var path = getCurrentPath();
    var route = routes[path];
    var authModule = window.MediMate.auth;
    var comp = window.MediMate.components;

    // If no matching route, redirect home
    if (!route) {
      navigate('/');
      return;
    }

    // Auth check
    if (route.requiresAuth && !authModule.isLoggedIn()) {
      navigate('/login');
      return;
    }

    // Role check
    if (route.role && authModule.getRole() !== route.role) {
      comp.showToast('Access denied. You need the "' + route.role + '" role.', 'error');
      navigate('/');
      return;
    }

    var app = document.getElementById('app');
    var user = authModule.getUser();

    if (route.layout === 'dashboard') {
      app.innerHTML =
        comp.renderNavbar(user) +
        '<div class="dashboard-layout">' +
          comp.renderSidebar(route.role, path) +
          '<main class="main-content" id="page-content">' +
            route.page.render() +
          '</main>' +
        '</div>';
    } else {
      app.innerHTML =
        comp.renderNavbar(user) +
        '<div class="public-page" id="page-content">' +
          route.page.render() +
        '</div>';
    }

    // Render Lucide icons
    comp.refreshIcons();

    // Initialize page event listeners
    if (route.page.init) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(function () {
        route.page.init();
        comp.refreshIcons();
      }, 10);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', handleRoute);

  window.MediMate = window.MediMate || {};
  window.MediMate.router = {
    register: register,
    navigate: navigate,
    handleRoute: handleRoute
  };
})();

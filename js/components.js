/* ──────────────────────────────────────────────
   components.js  –  Reusable UI component renderers
   ────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Navbar ────────────────────────────────── */
  function renderNavbar(user) {
    var isLoggedIn = window.MediMate.auth.isLoggedIn();
    var rightHtml = '';
    if (isLoggedIn && user) {
      rightHtml = '\
        <div class="nav-user">\
          <span class="nav-user-name">' + user.name + '</span>\
          <span class="nav-role-badge">' + user.role + '</span>\
          <button class="btn btn-ghost btn-sm" onclick="MediMate.auth.logout()" id="logout-btn">\
            <i data-lucide="log-out" class="icon-sm"></i> Logout\
          </button>\
        </div>';
    } else {
      rightHtml = '\
        <div class="nav-actions">\
          <a href="#/login" class="btn btn-ghost btn-sm">Login</a>\
          <a href="#/register" class="btn btn-primary btn-sm">Get Started</a>\
        </div>';
    }
    return '\
      <nav class="navbar" id="main-navbar">\
        <a href="#/" class="nav-brand">\
          <i data-lucide="heart-pulse" class="brand-icon"></i>\
          <span>MediMate</span>\
        </a>\
        ' + rightHtml + '\
      </nav>';
  }

  /* ── Sidebar ───────────────────────────────── */
  var sidebarItems = {
    patient: [
      { path: '/patient',         icon: 'layout-dashboard', label: 'Dashboard' },
      { path: '/patient/records', icon: 'file-text',        label: 'My Records' },
      { path: '/patient/upload',  icon: 'upload-cloud',     label: 'Upload' },
      { path: '/patient/claims',  icon: 'file-check',       label: 'My Claims' },
      { path: '/patient/profile', icon: 'user',             label: 'Profile' }
    ],
    insurer: [
      { path: '/insurer',        icon: 'layout-dashboard', label: 'Dashboard' },
      { path: '/insurer/claims', icon: 'clipboard-list',   label: 'Claim Review' }
    ],
    hospital: [
      { path: '/hospital',           icon: 'layout-dashboard', label: 'Dashboard' },
      { path: '/hospital/records',   icon: 'search',           label: 'Patient Records' },
      { path: '/hospital/diagnosis', icon: 'stethoscope',      label: 'Add Diagnosis' },
      { path: '/hospital/claims',    icon: 'file-plus',        label: 'Cashless Claim' }
    ]
  };

  function renderSidebar(role, activePath) {
    var items = sidebarItems[role] || [];
    var linksHtml = items.map(function (item) {
      var active = activePath === item.path ? ' active' : '';
      return '<a href="#' + item.path + '" class="sidebar-link' + active + '">\
                <i data-lucide="' + item.icon + '" class="icon-sm"></i>\
                <span>' + item.label + '</span>\
              </a>';
    }).join('');

    return '\
      <aside class="sidebar" id="sidebar">\
        <div class="sidebar-header">\
          <span class="sidebar-role-label">' + (role || '').toUpperCase() + ' PANEL</span>\
        </div>\
        <div class="sidebar-nav">' + linksHtml + '</div>\
        <div class="sidebar-footer">\
          <span class="sidebar-version">MediMate v1.0</span>\
        </div>\
      </aside>';
  }

  /* ── Stats Card ─────────────────────────────── */
  function renderStatsCard(title, value, icon, colorClass) {
    colorClass = colorClass || '';
    return '\
      <div class="stats-card ' + colorClass + '">\
        <div class="stats-icon-wrap"><i data-lucide="' + icon + '"></i></div>\
        <div class="stats-info">\
          <span class="stats-value">' + value + '</span>\
          <span class="stats-title">' + title + '</span>\
        </div>\
      </div>';
  }

  /* ── Status Badge ───────────────────────────── */
  function renderStatusBadge(status) {
    var cls = 'badge ';
    if (status === 'approved') cls += 'badge-success';
    else if (status === 'rejected') cls += 'badge-danger';
    else cls += 'badge-warning';
    return '<span class="' + cls + '">' + (status || 'pending') + '</span>';
  }

  /* ── Claim Type Badge ───────────────────────── */
  function renderClaimTypeBadge(type) {
    var cls = type === 'cashless' ? 'badge badge-info' : 'badge badge-purple';
    return '<span class="' + cls + '">' + (type || '—') + '</span>';
  }

  /* ── Toast ──────────────────────────────────── */
  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + message + '</span>';
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('toast-show'); });
    setTimeout(function () {
      toast.classList.remove('toast-show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  }

  /* ── Loading Spinner ────────────────────────── */
  function renderSpinner() {
    return '<div class="spinner-wrap"><div class="loader-spinner"></div></div>';
  }

  /* ── Empty State ────────────────────────────── */
  function renderEmpty(message, icon) {
    icon = icon || 'inbox';
    return '\
      <div class="empty-state">\
        <i data-lucide="' + icon + '" class="empty-icon"></i>\
        <p>' + (message || 'Nothing here yet.') + '</p>\
      </div>';
  }

  /* ── Section Header ─────────────────────────── */
  function renderSectionHeader(title, actionHtml) {
    return '\
      <div class="section-header">\
        <h2>' + title + '</h2>\
        ' + (actionHtml || '') + '\
      </div>';
  }

  /* ── Lucide icon refresh ────────────────────── */
  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  window.MediMate = window.MediMate || {};
  window.MediMate.components = {
    renderNavbar: renderNavbar,
    renderSidebar: renderSidebar,
    renderStatsCard: renderStatsCard,
    renderStatusBadge: renderStatusBadge,
    renderClaimTypeBadge: renderClaimTypeBadge,
    showToast: showToast,
    renderSpinner: renderSpinner,
    renderEmpty: renderEmpty,
    renderSectionHeader: renderSectionHeader,
    refreshIcons: refreshIcons
  };
})();
